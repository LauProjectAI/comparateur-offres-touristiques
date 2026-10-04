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
    is_price_per_person = False
    raw_lines = [l.strip() for l in raw_text.splitlines() if l.strip()]

    # Stratégie 1 : Tableaux structurés (lignes contenant des séparateurs |)
    # Permet de détecter les devis où l'en-tête (ex: 'Prix par personne en double') est sur une ligne
    # et le tarif (ex: '2 420 €') sur la ligne suivante.
    for i, line in enumerate(raw_lines):
        if '|' in line and any(k in line.lower() for k in ['prix', 'tarif', 'montant']):
            headers = [c.strip() for c in line.split('|')]
            for offset in range(1, 4):
                if i + offset < len(raw_lines) and '|' in raw_lines[i + offset]:
                    vals = [c.strip() for c in raw_lines[i + offset].split('|')]
                    for col_idx, h in enumerate(headers):
                        h_low = h.lower()
                        if any(k in h_low for k in ['prix', 'tarif', 'montant']) and not any(k in h_low for k in ['supplément', 'supplement', 'single', 'individuelle']):
                            if col_idx < len(vals):
                                cell_val = vals[col_idx]
                                m_c = re.search(r'(\d+[\s\.,]?\d*)\s*(?:€|EUR|euros)', cell_val)
                                if m_c:
                                    val_t = float(m_c.group(1).replace(' ', '').replace(',', '.'))
                                    if 150 <= val_t <= 50000:
                                        prix_total = val_t
                                        if any(k in h_low for k in ['par personne', 'p/p', 'par pax', 'en double', 'double', 'adulte']):
                                            is_price_per_person = True
                                        break
                    if prix_total > 0:
                        break
        if prix_total > 0:
            break

    # Stratégie 2 : Libellé explicite sur la même ligne (ex: "Prix net TTC par personne : 2 655 €", "Prix total : 1950 €")
    if prix_total == 0.0:
        m_explicit_price = re.search(
            r'(?:prix(?:\s+net)?(?:\s+ttc|\s+ht)?(?:\s+pour\s+\d+\s+personnes?)?(?:\s+par\s+personne|\s+p\/p)?(?:\s+en\s+chambre\s+double)?|tarif(?:\s+par\s+personne)?|montant\s+total)\s*[:\-]?\s*(\d+[\s\.,]?\d*)\s*(?:€|EUR|euros|CHF|\$)',
            text_clean,
            re.IGNORECASE
        )
        if m_explicit_price:
            p_val_str = m_explicit_price.group(1).replace(' ', '').replace(',', '.')
            try:
                val = float(p_val_str)
                if 150 <= val <= 50000:
                    prix_total = val
                    if re.search(r'par\s+personne|en\s+chambre\s+double|\/pers|\/pax|p\/p', m_explicit_price.group(0), re.IGNORECASE):
                        is_price_per_person = True
            except ValueError:
                pass

    # Stratégie 3 : Détection multi-lignes (en-tête "Prix par personne" suivi à quelques lignes par le montant)
    if prix_total == 0.0:
        for idx, r_line in enumerate(raw_lines):
            if re.search(r'^(?:prix|tarif)\s*(?:par\s*personne|p\/p|en\s*double|ttc)?', r_line, re.IGNORECASE) and not re.search(r'suppl[eé]ment|chambre\s+individuelle|boisson', r_line, re.IGNORECASE):
                for next_l in raw_lines[idx+1 : idx+6]:
                    if re.search(r'suppl[eé]ment|single|individuelle|\+', next_l, re.IGNORECASE):
                        continue
                    m_p = re.search(r'(\d+[\s\.,]?\d*)\s*(?:€|EUR|euros)', next_l)
                    if m_p:
                        v = float(m_p.group(1).replace(' ', '').replace(',', '.'))
                        if 300 <= v <= 50000:
                            prix_total = v
                            if re.search(r'par\s*personne|en\s*double|p\/p|pax', r_line, re.IGNORECASE):
                                is_price_per_person = True
                            break
                if prix_total > 0:
                    break

    # Stratégie 4 : Scan des montants globaux en éliminant les suppléments ("+ 340 €", "+ 330 €", pourboires...)
    if prix_total == 0.0:
        candidats = []
        for m in re.finditer(r'(\d+[\s\.,]?\d*)\s*(?:€|EUR|euros)', text_clean):
            p_val = float(m.group(1).replace(' ', '').replace(',', '.'))
            if 200 <= p_val <= 35000:
                start_ctx = max(0, m.start() - 30)
                ctx = text_clean[start_ctx : m.end()].lower()
                if not re.search(r'\+\s*|suppl[eé]ment|r[eé]duction|taxe|pourboire|frais', ctx):
                    candidats.append((p_val, m.start()))
        if candidats:
            grands = [c for c in candidats if c[0] >= 500]
            chosen = grands[0] if grands else candidats[-1]
            prix_total = chosen[0]
            around = text_clean[max(0, chosen[1]-150) : min(len(text_clean), chosen[1]+150)].lower()
            if any(k in around for k in ['par personne', 'en double', 'p/p', 'par pax', 'chambre double']):
                is_price_per_person = True

    # Nombre de personnes (défaut = 2 pour base chambre double standard)
    nb_personnes = 2
    m_pers = re.search(r'(?:pour|devis\s+pour|groupe\s+de)\s+(\d+)\s*(?:personnes?|voyageurs?|adultes?|pax)', text_clean, re.IGNORECASE)
    if m_pers:
        try:
            nb = int(m_pers.group(1))
            if 1 <= nb <= 100:
                nb_personnes = nb
        except ValueError:
            pass

    # Si le prix extrait était expressément par personne, calculer le total correspondant pour le dossier
    if is_price_per_person and prix_total > 0:
        prix_total = round(prix_total * nb_personnes, 2)

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

    # Dates (supporte format numérique et textuel en français)
    date_dep = "À convenir"
    date_ret = ""
    m_date_text = re.search(r'du\s+(\d{1,2})\s*(?:er)?\s*(?:au|à)\s*(\d{1,2})\s+([a-zéû]+)\s+(\d{4})', text_clean, re.IGNORECASE)
    if m_date_text:
        months = {
            'janvier': '01', 'fevrier': '02', 'février': '02', 'mars': '03', 'avril': '04',
            'mai': '05', 'juin': '06', 'juillet': '07', 'aout': '08', 'août': '08',
            'septembre': '09', 'octobre': '10', 'novembre': '11', 'decembre': '12', 'décembre': '12'
        }
        j1, j2, m_str, annee = m_date_text.groups()
        m_num = months.get(m_str.lower(), '01')
        date_dep = f"{int(j1):02d}/{m_num}/{annee}"
        date_ret = f"{int(j2):02d}/{m_num}/{annee}"
    else:
        m_dates = re.findall(r'(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})', text_clean)
        if len(m_dates) >= 1:
            date_dep = m_dates[0]
        if len(m_dates) >= 2:
            date_ret = m_dates[1]

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
        t_statut = ServiceStatus.INCLUS if any(k in lower_text for k in ["vol inclus", "vols a/r inclus", "billet d'avion inclus", "vols compris", "vols réguliers", "ce prix comprend"]) else ServiceStatus.EN_SUPPLEMENT if "vol en supplément" in lower_text else ServiceStatus.INCLUS
        
        # Compagnie aérienne
        for cie in AIRLINES_PATTERNS:
            if cie.lower() in lower_text:
                compagnie = cie
                compagnie_claire = True
                break
        
        # Vol direct ou escale
        if "avec escale" in lower_text or "escales" in lower_text or "correspondance" in lower_text:
            vol_direct = False
            t_desc = f"Vol avec escale(s) ({compagnie})" if compagnie_claire else "Vol avec escale(s)"
        elif "vol direct" in lower_text or "sans escale" in lower_text:
            vol_direct = True
            t_desc = f"Vol direct confirmé ({compagnie})" if compagnie_claire else "Vol direct"
        else:
            vol_direct = None
            t_desc = f"Vol {compagnie} (statut direct/escale non spécifié)" if compagnie_claire else "Type de vol (direct/escale) non précisé"

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
    h_adresse = "Localisation générale indiquée dans le programme"
    h_standing = "Non précisé"

    # Vérification présence d'une section explicite d'hôtels (ex: "HOTELS OU SIMILAIRE", "Liste de vos hôtels")
    m_sec_hotels = re.search(r'(?:H[OÔ]TELS?\s+OU\s+SIMILAIRES?|LISTE\s+DE(?:S|\s+VOS)\s+H[OÔ]TELS?|VOS\s+H[OÔ]TELS?|H[EÉ]BERGEMENT)[\s\S]{1,1500}?(?=\n\s*[A-Z\s]{4,}:|\n\s*CE PRIX|\n\s*CHARMES|\n\s*TARIFS?|\n\s*CONDITIONS?|\n\s*IMPORTANT|$)', raw_text, re.IGNORECASE)
    if m_sec_hotels:
        h_statut = ServiceStatus.INCLUS
        sec_lines = [l.strip() for l in m_sec_hotels.group(0).splitlines() if l.strip()]
        hotel_lines = [l for l in sec_lines if not re.search(r'donn[eé]s?\s+[aà]\s+titre|hotels?\s+ou|liste\s+de', l, re.IGNORECASE)]
        clean_hotels = []
        for hl in hotel_lines:
            clean_hl = re.sub(r'\s+', ' ', hl).strip()
            if 5 < len(clean_hl) < 100:
                if not re.search(r'^(?:\(|\*|-|il n|chaque|si l|veuillez)', clean_hl, re.IGNORECASE):
                    if not re.search(r'disponibilit|proposition|alternative|tarifaire|accord', clean_hl, re.IGNORECASE):
                        clean_hotels.append(clean_hl)
        if clean_hotels:
            h_nom = " / ".join(clean_hotels[:4])
            h_type = "Circuit / Hôtels & Lodges"

    elif any(k in lower_text for k in ["hôtel", "hotel", "resort", "chambre", "hébergement", "lodge", "riad", "gîte", "bungalow"]):
        h_statut = ServiceStatus.INCLUS
        m_hotel = re.search(r'(?:hôtel|hotel|resort|lodge|riad|finca)\s+([A-Z][A-Za-z0-9\s\'\-]{2,30})', text_clean)
        if m_hotel:
            h_nom = m_hotel.group(0).strip()

    # Standing
    if "1ère catégorie" in lower_text or "1ere categorie" in lower_text or "premiere categorie" in lower_text:
        h_standing = "1ère catégorie (Standard 3/4*)"
    else:
        m_stars = re.search(r'(\d\s*\*|\d\s*étoiles?)', text_clean, re.IGNORECASE)
        if m_stars:
            h_standing = m_stars.group(1).strip()
        elif "luxe" in lower_text or "5 étoiles" in lower_text:
            h_standing = "5 étoiles / Luxe"
        elif "charme" in lower_text:
            h_standing = "Hôtel de charme"

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
    elif "pension complète" in lower_text or "full board" in lower_text or "pension complete" in lower_text:
        r_formule = RestaurationMealPlan.FB
        r_statut = ServiceStatus.INCLUS
        r_desc = "Pension Complète (Full Board)"
        if re.search(r'boissons?\s+inclus|forfait\s+boissons?\s*:\s*1\s*(?:bi[eè]re|verre|soft)', lower_text):
            r_desc += " (avec forfait boissons inclus)"
        elif re.search(r'forfait\s+boissons?\s*:\s*\d+\s*€|boissons?\s+en\s+suppl[eé]ment|hors\s+boissons?', lower_text):
            r_desc += " (hors boissons / forfait boissons en supplément)"
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
