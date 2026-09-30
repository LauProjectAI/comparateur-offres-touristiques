import re
import urllib.parse
from io import BytesIO
from typing import Optional, Dict, Any, Tuple
import requests
from bs4 import BeautifulSoup
from pypdf import PdfReader
from docx import Document
import openpyxl

from app.models.travel_offer import (
    TravelOffer,
    ServiceStatus,
    SourceOrigin,
    RestaurationMealPlan,
    TransportDetail,
    AccommodationDetail,
    ActivitiesDetail,
    RestaurationDetail,
    GuideDetail,
    InsuranceDetail,
    CancellationDetail,
    PriceDetail,
    VendorDetail
)
from app.services.normalizer import normalize_offer_prices, validate_offer_compliance

# Liste des compagnies aériennes courantes pour reconnaissance
AIRLINES_PATTERNS = [
    "Air France", "Lufthansa", "British Airways", "EasyJet", "Ryanair", "Transavia",
    "Emirates", "Qatar Airways", "KLM", "Iberia", "TAP Air Portugal", "Swiss",
    "Vueling", "Volotea", "Turkish Airlines", "Delta", "United", "American Airlines",
    "Air Canada", "Corsair", "Air Caraïbes", "Norwegian", "Wizz Air"
]

def is_safe_url(url: str) -> bool:
    """Protection contre SSRF (interdit localhost, adresses privées)"""
    try:
        parsed = urllib.parse.urlparse(url)
        if parsed.scheme not in ('http', 'https'):
            return False
        hostname = (parsed.hostname or '').lower()
        if hostname in ('localhost', '127.0.0.1', '0.0.0.0', '::1'):
            return False
        # Interdire IP privées
        if hostname.startswith(('10.', '192.168.', '172.16.', '172.17.', '172.18.', '172.19.', '172.20.', '172.31.')):
            return False
        return True
    except Exception:
        return False

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extraction textuelle sécurisée depuis un fichier PDF."""
    try:
        reader = PdfReader(BytesIO(file_bytes))
        texts = []
        for page in reader.pages:
            t = page.extract_text()
            if t:
                texts.append(t)
        return "\n".join(texts)
    except Exception as e:
        return f"Erreur lecture PDF : {str(e)}"

def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extraction textuelle sécurisée depuis un document Word."""
    try:
        doc = Document(BytesIO(file_bytes))
        texts = [p.text for p in doc.paragraphs if p.text]
        for table in doc.tables:
            for row in table.rows:
                texts.append(" | ".join([cell.text.strip() for cell in row.cells if cell.text.strip()]))
        return "\n".join(texts)
    except Exception as e:
        return f"Erreur lecture DOCX : {str(e)}"

def extract_text_from_xlsx(file_bytes: bytes) -> str:
    """Extraction textuelle sécurisée depuis un fichier Excel."""
    try:
        wb = openpyxl.load_workbook(BytesIO(file_bytes), data_only=True)
        texts = []
        for sheetname in wb.sheetnames:
            ws = wb[sheetname]
            texts.append(f"--- Feuille: {sheetname} ---")
            for row in ws.iter_rows(values_only=True):
                row_str = " | ".join([str(val).strip() for val in row if val is not None])
                if row_str:
                    texts.append(row_str)
        return "\n".join(texts)
    except Exception as e:
        return f"Erreur lecture XLSX : {str(e)}"

def extract_text_from_url(url: str) -> Tuple[str, str]:
    """Extraction sécurisée du contenu d'une URL (HTML textuel)"""
    if not is_safe_url(url):
        return "", "URL non autorisée ou invalide (protection sécurité SSRF)"
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ComparateurTourismeBot/1.0"
        }
        resp = requests.get(url, headers=headers, timeout=8)
        if resp.status_code != 200:
            return "", f"Échec de connexion au site (Code HTTP {resp.status_code})"
        
        soup = BeautifulSoup(resp.content, "html.parser")
        # Supprimer scripts et styles
        for element in soup(["script", "style", "nav", "footer"]):
            element.decompose()
        
        title = soup.title.string.strip() if soup.title and soup.title.string else url
        body_text = soup.get_text(separator="\n", strip=True)
        return f"{title}\n{body_text}", ""
    except Exception as e:
        return "", f"Erreur lors de la récupération de la page : {str(e)}"

def parse_offer_text(raw_text: str, offer_id: str, source_type: str, source_ref: str) -> TravelOffer:
    """
    Analyse sémantique et structuration des informations issues du texte brut.
    Ne prend jamais le texte comme instruction (sécurité).
    Associe chaque donnée extraite à sa source.
    """
    text_clean = re.sub(r'\s+', ' ', raw_text)
    
    # 1. Titre
    lines = [l.strip() for l in raw_text.splitlines() if len(l.strip()) > 3]
    titre = lines[0][:80] if lines else f"Offre {offer_id}"
    
    # 2. Vendeur
    vendeur_nom = "Organisateur non identifié"
    # Recherche motifs : Agence XYZ, Organisé par..., Vendu par...
    m_vendeur = re.search(r'(?:organisé par|vendu par|agence|voyagiste|tour-opérateur|organisateur)\s*[:\-]?\s*([A-Za-z0-9\s\-&]{3,35})', text_clean, re.IGNORECASE)
    if m_vendeur:
        vendeur_nom = m_vendeur.group(1).strip()
    elif source_type == "url":
        parsed = urllib.parse.urlparse(source_ref)
        if parsed.netloc:
            vendeur_nom = parsed.netloc.replace("www.", "")

    vendeur = VendorDetail(
        nom=vendeur_nom,
        site_web=source_ref if source_type == "url" else "",
        statut_juridique="Non vérifié (aucun registre légal interrogé)",
        fiabilite_economique="Non vérifié",
        fiabilite_explication="L'absence d'information économique dans l'offre est neutre : vérification externe à effectuer sur Infogreffe / Atout France.",
        avis_vendeur_source="Non vérifié (aucun service externe d'avis connecté)",
        source=SourceOrigin.NON_VERIFIE
    )

    # 3. Prix et devises
    prix_total = 0.0
    # Motifs : 1 250 €, 1250 EUR, 990€, etc.
    m_prix = re.findall(r'(\d+[\s\.,]?\d*)\s*(?:€|EUR|euros|CHF|\$)', text_clean, re.IGNORECASE)
    if m_prix:
        # Prendre le montant le plus plausible (souvent le plus élevé ou explicite)
        candidats = []
        for p_str in m_prix:
            cleaned = p_str.replace(' ', '').replace(',', '.')
            try:
                val = float(cleaned)
                if 50 <= val <= 30000:
                    candidats.append(val)
            except ValueError:
                pass
        if candidats:
            prix_total = candidats[-1] # Souvent le total en bas ou synthèse

    # Nombre de personnes
    nb_personnes = 2
    m_pers = re.search(r'(\d+)\s*(?:personnes?|voyageurs?|adultes?|pax)', text_clean, re.IGNORECASE)
    if m_pers:
        try:
            nb_personnes = int(m_pers.group(1))
        except ValueError:
            pass

    # Durée / Nuits
    duree_jours = 7
    duree_nuits = 6
    m_jours = re.search(r'(\d+)\s*(?:jours|j)\b', text_clean, re.IGNORECASE)
    m_nuits = re.search(r'(\d+)\s*(?:nuits?|n)\b', text_clean, re.IGNORECASE)
    if m_jours:
        duree_jours = int(m_jours.group(1))
    if m_nuits:
        duree_nuits = int(m_nuits.group(1))
    elif duree_jours > 1:
        duree_nuits = duree_jours - 1

    # Dates
    m_dates = re.findall(r'(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})', text_clean)
    date_dep = m_dates[0] if len(m_dates) >= 1 else "À convenir"
    date_ret = m_dates[1] if len(m_dates) >= 2 else ""

    prix = PriceDetail(
        prix_total_annonce=prix_total,
        devise="EUR",
        nombre_personnes=nb_personnes,
        taxes_incluses=True,
        taxes_sejour_estimees=round(1.5 * duree_nuits * nb_personnes, 2) if "taxe" not in text_clean.lower() else 0.0,
        frais_dossier=25.0 if "frais de dossier" in text_clean.lower() else 0.0,
        supplements_connus=0.0,
        source=SourceOrigin.VENDEUR,
        source_detail=f"Extrait de la source ({source_ref})"
    )

    # 4. Transport (Vol / Train / etc.)
    t_statut = ServiceStatus.NON_PRECISE
    compagnie = "Non précisée"
    compagnie_claire = False
    est_vol = False
    vol_direct = None
    t_desc = ""

    lower_text = text_clean.lower()
    if any(k in lower_text for k in ["vol", "avion", "aérien", "flight"]):
        est_vol = True
        t_statut = ServiceStatus.INCLUS if any(k in lower_text for k in ["vol inclus", "vols a/r inclus", "billet d'avion inclus", "vols compris"]) else ServiceStatus.EN_SUPPLEMENT if "vol en supplément" in lower_text else ServiceStatus.INCLUS
        
        # Compagnie aérienne
        for cie in AIRLINES_PATTERNS:
            if cie.lower() in lower_text:
                compagnie = cie
                compagnie_claire = True
                break
        
        # Vol direct ou escale
        if "vol direct" in lower_text or "sans escale" in lower_text:
            vol_direct = True
            t_desc = "Vol direct confirmé"
        elif "escale" in lower_text or "correspondance" in lower_text:
            vol_direct = False
            t_desc = "Vol avec escale(s)"
        else:
            vol_direct = None
            t_desc = "Type de vol (direct/escale) non précisé dans l'offre"

    elif any(k in lower_text for k in ["train", "sncf", "tgv", "eurostar"]):
        t_statut = ServiceStatus.INCLUS
        t_desc = "Trajet en train"
    elif "sans transport" in lower_text or "sur place" in lower_text:
        t_statut = ServiceStatus.ABSENT
        t_desc = "Séjour sans transport (acheminement à la charge du voyageur)"

    transport = TransportDetail(
        statut=t_statut,
        type_transport="Vol" if est_vol else ("Train" if "train" in lower_text else "Non spécifié"),
        est_vol=est_vol,
        vol_direct=vol_direct,
        compagnie_aerienne=compagnie,
        compagnie_nommee_clairement=compagnie_claire,
        details=t_desc,
        source=SourceOrigin.VENDEUR,
        source_detail=f"Extrait de la source ({source_ref})"
    )

    # 5. Hébergement
    h_statut = ServiceStatus.NON_PRECISE
    h_nom = "Hôtel ou hébergement mentionné"
    h_type = "Hôtel"
    h_adresse = "Adresse non communiquée"
    h_standing = "Non précisé"

    if any(k in lower_text for k in ["hôtel", "hotel", "resort", "chambre", "hébergement", "lodge", "riad", "gîte", "bungalow"]):
        h_statut = ServiceStatus.INCLUS
        # Extraction de nom d'hôtel
        m_hotel = re.search(r'(?:hôtel|hotel|resort|lodge)\s+([A-Z][A-Za-z0-9\s\'\-]{2,30})', text_clean)
        if m_hotel:
            h_nom = m_hotel.group(0).strip()
        
        # Étoiles
        m_stars = re.search(r'(\d\s*\*|\d\s*étoiles?)', text_clean, re.IGNORECASE)
        if m_stars:
            h_standing = m_stars.group(1).strip()
            
        # Adresse / ville
        m_ville = re.search(r'(?:à|a|situé à|localisation|destination)\s*:\s*([A-Za-z\s\-]{3,25})', text_clean, re.IGNORECASE)
        if m_ville:
            h_adresse = m_ville.group(1).strip()
        else:
            h_adresse = "Localisation générale indiquée dans le programme"

    hebergement = AccommodationDetail(
        statut=h_statut,
        nom=h_nom,
        type_hebergement=h_type,
        adresse=h_adresse,
        standing=h_standing,
        pertinence_emplacement="Emplacement à évaluer au regard du type de voyage sélectionné.",
        source_emplacement=SourceOrigin.DEDUCTION,
        avis_verifie=False,
        avis_source="Non vérifié (aucun service externe d'avis connecté)",
        avis_explication="Conformément aux exigences de neutralité et de rigueur, aucun avis n'est simulé sans source certifiée.",
        source=SourceOrigin.VENDEUR,
        source_detail=f"Extrait de la source ({source_ref})"
    )

    # 6. Restauration
    r_formule = RestaurationMealPlan.NOT_SPECIFIED
    r_statut = ServiceStatus.NON_PRECISE
    r_desc = ""

    if "all inclusive" in lower_text or "tout inclus" in lower_text or "tout compris" in lower_text:
        r_formule = RestaurationMealPlan.AI
        r_statut = ServiceStatus.INCLUS
        r_desc = "Formule Tout Compris (All Inclusive)"
    elif "pension complète" in lower_text or "full board" in lower_text:
        r_formule = RestaurationMealPlan.FB
        r_statut = ServiceStatus.INCLUS
        r_desc = "Pension Complète (Full Board)"
    elif "demi-pension" in lower_text or "half board" in lower_text:
        r_formule = RestaurationMealPlan.HB
        r_statut = ServiceStatus.INCLUS
        r_desc = "Demi-pension (Half Board)"
    elif "petit déjeuner" in lower_text or "petit-déjeuner" in lower_text or "bed and breakfast" in lower_text or "b&b" in lower_text:
        r_formule = RestaurationMealPlan.BB
        r_statut = ServiceStatus.INCLUS
        r_desc = "Petit déjeuner inclus (Bed and Breakfast)"
    elif "sans repas" in lower_text or "repas libres" in lower_text:
        r_formule = RestaurationMealPlan.NONE
        r_statut = ServiceStatus.ABSENT
        r_desc = "Sans repas inclus (repas libres sur place)"

    restauration = RestaurationDetail(
        statut=r_statut,
        formule=r_formule,
        description=r_desc if r_desc else "Formule de restauration non spécifiée",
        source=SourceOrigin.VENDEUR,
        source_detail=f"Extrait de la source ({source_ref})"
    )

    # 7. Visites / Activités
    act_statut = ServiceStatus.NON_PRECISE
    act_desc = ""
    liste_act = []
    billets = False

    if any(k in lower_text for k in ["visite", "excursion", "activité", "programme", "musée", "visites guidées", "randonnée"]):
        act_statut = ServiceStatus.INCLUS
        act_desc = "Visites et activités mentionnées dans le programme"
        if "billets inclus" in lower_text or "droits d'entrée inclus" in lower_text or "entrées incluses" in lower_text:
            billets = True
            act_desc += " (avec entrées/billets inclus)"
        # Extraction de quelques puces ou phrases
        for line in lines[1:8]:
            if any(k in line.lower() for k in ["visite", "découverte", "excursion", "jour", "programme", "accès"]):
                liste_act.append(line[:60])
    elif "programme libre" in lower_text or "activités en option" in lower_text:
        act_statut = ServiceStatus.EN_SUPPLEMENT
        act_desc = "Programme libre avec activités en supplément"

    activites = ActivitiesDetail(
        statut=act_statut,
        description=act_desc if act_desc else "Non précisé",
        liste_activites=liste_act[:5],
        billets_inclus=billets,
        source=SourceOrigin.VENDEUR,
        source_detail=f"Extrait de la source ({source_ref})"
    )

    # 8. Guide ou accompagnateur
    g_statut = ServiceStatus.NON_PRECISE
    g_qualif = "Non précisé"
    g_desc = ""

    if "guide francophone" in lower_text:
        g_statut = ServiceStatus.INCLUS
        g_qualif = "Guide local francophone"
        g_desc = "Guide local parlant français tout au long des visites"
    elif "guide" in lower_text or "accompagnateur" in lower_text:
        if "guide en option" in lower_text or "guide en supplément" in lower_text:
            g_statut = ServiceStatus.EN_SUPPLEMENT
            g_qualif = "Guide en option payante"
            g_desc = "Services de guidage disponibles en supplément"
        else:
            g_statut = ServiceStatus.INCLUS
            g_qualif = "Guide ou accompagnateur"
            g_desc = "Présence d'un guide ou accompagnateur"
    elif "autonomie" in lower_text or "sans guide" in lower_text:
        g_statut = ServiceStatus.ABSENT
        g_qualif = "Aucun guide"
        g_desc = "Séjour en autonomie"

    guide = GuideDetail(
        statut=g_statut,
        qualification=g_qualif,
        description=g_desc if g_desc else "Non précisé dans les documents",
        source=SourceOrigin.VENDEUR,
        source_detail=f"Extrait de la source ({source_ref})"
    )

    # 9. Assurance
    ass_statut = ServiceStatus.NON_PRECISE
    ass_desc = "Non précisé"

    if "assurance incluse" in lower_text or "assurance multirisque offerte" in lower_text or "assistance rapatriement incluse" in lower_text:
        ass_statut = ServiceStatus.INCLUS
        ass_desc = "Assistance rapatriement ou multirisque incluse"
    elif "assurance en supplément" in lower_text or "assurance optionnelle" in lower_text or "hors assurance" in lower_text:
        ass_statut = ServiceStatus.EN_SUPPLEMENT
        ass_desc = "Assurance proposée en supplément"
    elif "sans assurance" in lower_text:
        ass_statut = ServiceStatus.ABSENT
        ass_desc = "Aucune assurance incluse"

    assurance = InsuranceDetail(
        statut=ass_statut,
        type_couverture=ass_desc,
        description=ass_desc,
        source=SourceOrigin.VENDEUR,
        source_detail=f"Extrait de la source ({source_ref})"
    )

    # 10. Conditions d'annulation
    c_flex = "Non précisé"
    c_cond = "Conditions d'annulation non détaillées"
    c_date = ""

    if "annulation gratuite" in lower_text or "remboursable à 100%" in lower_text:
        c_flex = "Très flexible"
        c_cond = "Annulation sans frais sous conditions"
        m_echeance = re.search(r'(?:jusqu\'à|jusqu au|avant)\s*(\d+\s*jours?)', lower_text)
        if m_echeance:
            c_date = m_echeance.group(0)
    elif "non remboursable" in lower_text:
        c_flex = "Stricte"
        c_cond = "Offre non remboursable et non modifiable"
    elif "frais d'annulation" in lower_text or "barème d'annulation" in lower_text:
        c_flex = "Barème standard"
        c_cond = "Frais d'annulation échelonnés selon la date du départ"

    annulation = CancellationDetail(
        flexibilite=c_flex,
        conditions_detaillees=c_cond,
        date_limite_annulation_gratuite=c_date,
        source=SourceOrigin.VENDEUR,
        source_detail=f"Extrait de la source ({source_ref})"
    )

    # Construction de l'objet TravelOffer
    offer = TravelOffer(
        id=offer_id,
        titre=titre,
        source_origine_type=source_type,
        source_reference=source_ref,
        date_depart=date_dep,
        date_retour=date_ret,
        duree_jours=duree_jours,
        duree_nuits=duree_nuits,
        transport=transport,
        hebergement=hebergement,
        restauration=restauration,
        activites=activites,
        guide=guide,
        assurance=assurance,
        annulation=annulation,
        prix=prix,
        vendeur=vendeur
    )

    # Normalisation financière et validation des règles de conformité
    offer = normalize_offer_prices(offer)
    validate_offer_compliance(offer)

    return offer
