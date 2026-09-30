from typing import List, Tuple
from app.models.travel_offer import (
    TravelOffer,
    ServiceStatus,
    SourceOrigin,
    PriceDetail
)

def normalize_offer_prices(offer: TravelOffer) -> TravelOffer:
    """
    Normalise les prix sur une base comparable :
    - Prix total normalisé incluant frais de dossier et taxes connues
    - Prix par personne
    - Prix par personne et par nuit
    """
    p = offer.prix
    nb_pers = max(1, p.nombre_personnes)
    nuits = max(1, offer.duree_nuits)
    
    # Calcul du coût réel connu
    supplements = p.frais_dossier + p.taxes_sejour_estimees + p.supplements_connus
    total_reel = p.prix_total_annonce + supplements
    
    p.prix_total_normalise = round(total_reel, 2)
    p.prix_par_personne = round(total_reel / nb_pers, 2)
    p.prix_par_personne_par_nuit = round(total_reel / (nb_pers * nuits), 2)
    
    return offer

def validate_offer_compliance(offer: TravelOffer) -> Tuple[bool, List[str], int, bool]:
    """
    Vérifie les critères minimaux obligatoires :
    - Au moins deux prestations au total (ex: hébergement + vol, ou hébergement + visites)
    - Dont au minimum un hébergement inclus ou réservé
    """
    erreurs = []
    
    # Compter les prestations incluses ou proposées
    prestations_valides = 0
    contient_hebergement = False
    
    # 1. Hébergement
    if offer.hebergement.statut in [ServiceStatus.INCLUS, ServiceStatus.EN_SUPPLEMENT]:
        prestations_valides += 1
        contient_hebergement = True
    
    # 2. Transport
    if offer.transport.statut in [ServiceStatus.INCLUS, ServiceStatus.EN_SUPPLEMENT]:
        prestations_valides += 1
        
    # 3. Restauration
    if offer.restauration.statut in [ServiceStatus.INCLUS, ServiceStatus.EN_SUPPLEMENT]:
        prestations_valides += 1
        
    # 4. Visites / Activités
    if offer.activites.statut in [ServiceStatus.INCLUS, ServiceStatus.EN_SUPPLEMENT]:
        prestations_valides += 1
        
    # 5. Guide
    if offer.guide.statut in [ServiceStatus.INCLUS, ServiceStatus.EN_SUPPLEMENT]:
        prestations_valides += 1
        
    # 6. Assurance
    if offer.assurance.statut in [ServiceStatus.INCLUS, ServiceStatus.EN_SUPPLEMENT]:
        prestations_valides += 1

    if not contient_hebergement:
        erreurs.append("L'offre ne comprend aucun hébergement (critère obligatoire).")
        
    if prestations_valides < 2:
        erreurs.append(f"L'offre ne contient que {prestations_valides} prestation(s) identifiée(s). Le comparateur exige au minimum deux prestations.")
        
    est_conforme = (contient_hebergement and prestations_valides >= 2)
    
    offer.conforme_criteres = est_conforme
    offer.erreurs_conformite = erreurs
    offer.nombre_prestations_incluses = prestations_valides
    offer.contient_hebergement = contient_hebergement
    
    return est_conforme, erreurs, prestations_valides, contient_hebergement
