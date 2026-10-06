from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class TravelType(str, Enum):
    DETENTE = "detente"
    CULTUREL = "culturel"
    NATURE = "nature"
    PROFESSIONNEL = "professionnel"
    SPORTIF = "sportif"

class ServiceStatus(str, Enum):
    INCLUS = "inclus"
    EN_SUPPLEMENT = "en_supplement"
    ABSENT = "absent"
    NON_PRECISE = "non_precise"

class SourceOrigin(str, Enum):
    VENDEUR = "Vendeur (document ou lien)"
    VERIFICATION_EXTERNE = "Vérification indépendante"
    DEDUCTION = "Déduction de l'application"
    NON_VERIFIE = "Non vérifié (source externe inaccessible)"

class RestaurationMealPlan(str, Enum):
    BB = "Bed and Breakfast"
    HB = "Half Board"
    FB = "Full Board"
    AI = "All Inclusive"
    NONE = "Sans repas"
    NOT_SPECIFIED = "Non précisé"

class TransportDetail(BaseModel):
    statut: ServiceStatus = ServiceStatus.NON_PRECISE
    type_transport: str = "Vol" # Vol, Train, Autocar, Sans transport, etc.
    est_vol: bool = True
    vol_direct: Optional[bool] = None # True: direct, False: escale, None: non précisé
    compagnie_aerienne: str = "Non précisée"
    compagnie_nommee_clairement: bool = False
    details: str = ""
    source: SourceOrigin = SourceOrigin.VENDEUR
    source_detail: str = "Extrait de l'offre"

class AccommodationDetail(BaseModel):
    statut: ServiceStatus = ServiceStatus.INCLUS
    nom: str = "Hôtel non précisé"
    type_hebergement: str = "Hôtel"
    adresse: str = "Adresse non communiquée"
    standing: str = "Non précisé" # ex: "4 étoiles"
    pertinence_emplacement: str = "" # Analyse par rapport au type de voyage et au programme
    source_emplacement: SourceOrigin = SourceOrigin.DEDUCTION
    # Avis vérifiés
    avis_verifie: bool = False
    avis_note: Optional[float] = None
    avis_nombre: Optional[int] = None
    avis_date_recents: Optional[str] = None
    avis_source: str = "Non vérifié (aucun service d'avis tiers connecté)"
    avis_explication: str = "Les avis n'ont pas été inventés : une vérification externe sur un service d'avis certifié est nécessaire."
    source: SourceOrigin = SourceOrigin.VENDEUR
    source_detail: str = "Extrait de l'offre"

class ActivitiesDetail(BaseModel):
    statut: ServiceStatus = ServiceStatus.NON_PRECISE
    description: str = ""
    liste_activites: List[str] = Field(default_factory=list)
    billets_inclus: bool = False
    source: SourceOrigin = SourceOrigin.VENDEUR
    source_detail: str = "Extrait de l'offre"

class RestaurationDetail(BaseModel):
    statut: ServiceStatus = ServiceStatus.NON_PRECISE
    formule: RestaurationMealPlan = RestaurationMealPlan.NOT_SPECIFIED
    description: str = ""
    source: SourceOrigin = SourceOrigin.VENDEUR
    source_detail: str = "Extrait de l'offre"

class GuideDetail(BaseModel):
    statut: ServiceStatus = ServiceStatus.NON_PRECISE
    qualification: str = "Non précisé" # ex: "Guide local francophone certifié", "Accompagnateur de groupe", "Aucun"
    description: str = ""
    source: SourceOrigin = SourceOrigin.VENDEUR
    source_detail: str = "Extrait de l'offre"

class InsuranceDetail(BaseModel):
    statut: ServiceStatus = ServiceStatus.NON_PRECISE
    type_couverture: str = "Non précisé" # ex: "Assistance rapatriement incluse, annulation en supplément"
    description: str = ""
    source: SourceOrigin = SourceOrigin.VENDEUR
    source_detail: str = "Extrait de l'offre"

class CancellationDetail(BaseModel):
    flexibilite: str = "Non précisé" # "Très flexible", "Modérée", "Stricte", "Non remboursable"
    conditions_detaillees: str = ""
    date_limite_annulation_gratuite: str = ""
    source: SourceOrigin = SourceOrigin.VENDEUR
    source_detail: str = "Extrait de l'offre"

class PriceDetail(BaseModel):
    prix_total_annonce: float = 0.0
    devise: str = "EUR"
    nombre_personnes: int = 2
    taxes_incluses: bool = True
    taxes_sejour_estimees: float = 0.0
    frais_dossier: float = 0.0
    supplements_connus: float = 0.0
    
    # Présentation vol & taxes aéroport en supplément
    taxes_aeroport: float = 0.0 # Total des taxes aéroport pour le dossier
    taxes_aeroport_par_personne: float = 0.0 # Taxes aéroport par personne
    taxes_aeroport_statut: str = "non_applicable" # "incluses_ventilees", "incluses_non_ventilees", "en_supplement", "non_applicable"
    prix_ht: float = 0.0 # Prix hors taxes aéroport total dossier
    prix_ht_par_personne: float = 0.0 # Prix hors taxes aéroport par personne

    prix_total_normalise: float = 0.0 # Total incluant frais connus
    prix_par_personne: float = 0.0
    prix_par_personne_par_nuit: float = 0.0
    source: SourceOrigin = SourceOrigin.VENDEUR
    source_detail: str = "Extrait de l'offre + calculs de normalisation"

class VendorDetail(BaseModel):
    nom: str = "Organisateur non identifié"
    site_web: str = ""
    statut_juridique: str = "Non vérifié" # ex: "Immatriculation Atout France déclarée" ou "Non vérifié"
    fiabilite_economique: str = "Non vérifié (registre des commerces non interrogé)"
    fiabilite_explication: str = "L'absence de données économiques publiques dans le document ne constitue pas une appréciation défavorable, mais requiert une vérification des mentions légales et garanties financières."
    avis_vendeur_note: Optional[float] = None
    avis_vendeur_volume: Optional[int] = None
    avis_vendeur_source: str = "Non vérifié"
    source: SourceOrigin = SourceOrigin.NON_VERIFIE

class TravelOffer(BaseModel):
    id: str
    titre: str = "Offre sans titre"
    source_origine_type: str = "manuel" # "url", "pdf", "docx", "xlsx", "manuel", "demo"
    source_reference: str = "" # URL ou nom de fichier
    
    # Destination & Circuit
    destination_pays: str = "" # ex: "Afrique du Sud"
    destination_region: Optional[str] = "" # ex: "Mpumalanga / Cap"
    circuit_nom: str = "" # ex: "De Johannesburg au Cap (13J/10N)"
    
    # Base de réalisation (tarification de groupe)
    base_participants: int = 20 # 20 par défaut
    base_disponibles: Dict[int, float] = Field(default_factory=dict) # {20: 2635.0, 30: 2485.0, 40: 2420.0}
    base_details: str = "" # Libellé de la base extraite

    # Dates & Durée
    date_depart: Optional[str] = None
    date_retour: Optional[str] = None
    duree_jours: int = 1
    duree_nuits: int = 1
    
    # Prestations
    transport: TransportDetail = Field(default_factory=TransportDetail)
    hebergement: AccommodationDetail = Field(default_factory=AccommodationDetail)
    restauration: RestaurationDetail = Field(default_factory=RestaurationDetail)
    activites: ActivitiesDetail = Field(default_factory=ActivitiesDetail)
    guide: GuideDetail = Field(default_factory=GuideDetail)
    assurance: InsuranceDetail = Field(default_factory=InsuranceDetail)
    annulation: CancellationDetail = Field(default_factory=CancellationDetail)
    
    # Données financières & vendeur
    prix: PriceDetail = Field(default_factory=PriceDetail)
    vendeur: VendorDetail = Field(default_factory=VendorDetail)
    
    # Validation des critères requis
    conforme_criteres: bool = True
    erreurs_conformite: List[str] = Field(default_factory=list)
    nombre_prestations_incluses: int = 0
    contient_hebergement: bool = False
    
    # Données textuelles brutes & apprentissage
    raw_text: Optional[str] = ""
    points_appris: List[Dict[str, Any]] = Field(default_factory=list)

    # Synthèse spécifique
    points_forts: List[str] = Field(default_factory=list)
    points_faibles: List[str] = Field(default_factory=list)
    points_a_clarifier: List[str] = Field(default_factory=list)

class ScoringWeights(BaseModel):
    poids_prix: float = 25.0
    poids_hebergement: float = 25.0
    poids_annulation: float = 15.0
    poids_prestations: float = 20.0
    poids_fiabilite: float = 15.0

class OfferScore(BaseModel):
    score_global: float # Note sur 100
    score_prix: float
    score_hebergement: float
    score_annulation: float
    score_prestations: float
    score_fiabilite: float
    completude_donnees_pct: float # Taux d'informations complètes (pour transparence d'incertitude)
    donnees_manquantes: List[str] = Field(default_factory=list)
    explication_score: str = ""

class ScopeDifference(BaseModel):
    prestation: str
    status_offre_a: str
    status_offre_b: str
    impact: str # "Écart significatif de coût ou de confort", etc.

class ComparisonResult(BaseModel):
    type_voyage: TravelType
    offres: List[TravelOffer]
    scores: Dict[str, OfferScore]
    poids_utilises: ScoringWeights
    ecarts_perimetre: List[ScopeDifference]
    synthese_argumentee: str
    recommandation_principale: str
    justification_recommandation: str
    avertissements_conformite: List[str] = Field(default_factory=list)
