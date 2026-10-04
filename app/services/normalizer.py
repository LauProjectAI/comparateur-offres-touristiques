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
    - Ventilation Prix H.T et Taxes aéroport en supplément pour les voyages aériens
    """
    p = offer.prix
    nb_pers = max(1, p.nombre_personnes)
    nuits = max(1, offer.duree_nuits)
    
    # Détection voyage aérien
    est_vol = getattr(offer.transport, 'est_vol', False) or 'vol' in str(offer.transport.type_transport).lower()

    if est_vol:
        # Harmonisation montant par personne et total dossier des taxes aéroport
        if p.taxes_aeroport_par_personne > 0 and p.taxes_aeroport == 0:
            p.taxes_aeroport = round(p.taxes_aeroport_par_personne * nb_pers, 2)
        elif p.taxes_aeroport > 0 and p.taxes_aeroport_par_personne == 0:
            p.taxes_aeroport_par_personne = round(p.taxes_aeroport / nb_pers, 2)

        # Calcul ou réconciliation du Prix H.T et du Prix Total
        if p.taxes_aeroport > 0:
            if p.prix_ht == 0 and p.prix_total_annonce >= p.taxes_aeroport:
                p.prix_ht = round(p.prix_total_annonce - p.taxes_aeroport, 2)
            elif p.prix_ht > 0 and p.prix_total_annonce == 0:
                p.prix_total_annonce = round(p.prix_ht + p.taxes_aeroport, 2)
        else:
            if p.prix_ht == 0:
                p.prix_ht = p.prix_total_annonce
        
        p.prix_ht_par_personne = round(p.prix_ht / nb_pers, 2)
    else:
        p.prix_ht = p.prix_total_annonce
        p.prix_ht_par_personne = round(p.prix_total_annonce / nb_pers, 2)
        p.taxes_aeroport = 0.0
        p.taxes_aeroport_par_personne = 0.0

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
