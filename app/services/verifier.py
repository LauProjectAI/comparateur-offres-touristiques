from typing import Optional, Dict, Any
from app.models.travel_offer import (
    TravelOffer,
    TravelType,
    SourceOrigin,
    AccommodationDetail,
    VendorDetail
)

def evaluate_accommodation_location(offer: TravelOffer, travel_type: TravelType) -> str:
    """
    Évalue la pertinence de l'emplacement de l'hébergement selon le type de voyage prévu :
    - Culturel : proximité des sites historiques, musées, transports urbains
    - Détente : environnement calme, vue, bord de mer/nature, commodités de repos
    - Nature : proximité des parcs naturels, sentiers, isolement préservé
    - Professionnel : connectivité, proximité centre de conférence, aéroports/gares, wifi
    - Sportif : proximité des stations, départs de sentiers, centres nautiques/alpins
    """
    loc = (offer.hebergement.adresse + " " + offer.hebergement.nom).lower()
    
    if travel_type == TravelType.CULTUREL:
        if any(k in loc for k in ["centre", "historique", "centro", "old town", "musée", "monument", "cité"]):
            return "Emplacement très favorable pour un voyage culturel : hébergement central permettant un accès à pied aux principaux monuments et musées."
        else:
            return "Emplacement à vérifier : s'assurer des temps de trajet en transports en commun pour rejoindre les pôles culturels et historiques."

    elif travel_type == TravelType.DETENTE:
        if any(k in loc for k in ["plage", "mer", "beach", "spa", "calme", "côte", "parc", "resort", "jardin"]):
            return "Emplacement idéal pour la détente : cadre propice au repos (front de mer, espaces verts ou équipements de relaxation)."
        else:
            return "Emplacement urbain ou mixte : vérifier le niveau sonore et la présence d'espaces de décompression adaptés au repos."

    elif travel_type == TravelType.NATURE:
        if any(k in loc for k in ["parc", "montagne", "forêt", "fjord", "campagne", "vallée", "nature", "sentier", "lodge"]):
            return "Excellente adéquation avec un voyage nature : hébergement au contact des paysages ou aux portes des itinéraires naturels."
        else:
            return "Hébergement potentiellement éloigné des sites naturels : prévoir des temps de transfert quotidiens vers les zones d'activités."

    elif travel_type == TravelType.PROFESSIONNEL:
        if any(k in loc for k in ["affaires", "business", "gare", "aéroport", "congrès", "expo", "centre"]):
            return "Emplacement fonctionnel et adapté aux déplacements professionnels : proximité des axes de transit et quartiers d'affaires."
        else:
            return "Emplacement décentré : estimer les contraintes de déplacement pour les réunions et l'accessibilité aux réseaux de transport."

    elif travel_type == TravelType.SPORTIF:
        if any(k in loc for k in ["station", "piste", "alpes", "montagne", "lac", "mer", "base nautique", "sport"]):
            return "Emplacement stratégique pour un séjour sportif : départ direct ou immédiat vers les infrastructures d'activités."
        else:
            return "Emplacement en périphérie des spots sportifs : vérifier la logistique de transport du matériel et l'accès aux départs."

    return "Pertinence de l'emplacement à apprécier selon vos priorités de déplacement."

def audit_vendor_and_services(offer: TravelOffer, travel_type: TravelType) -> TravelOffer:
    """
    Applique les règles rigoureuses de traçabilité, de neutralité économique et de vérification.
    """
    # 1. Évaluation emplacement
    pertinence = evaluate_accommodation_location(offer, travel_type)
    offer.hebergement.pertinence_emplacement = pertinence
    offer.hebergement.source_emplacement = SourceOrigin.DEDUCTION
    
    # 2. Règle de neutralité sur l'entreprise vendeuse :
    # Si non vérifié, afficher l'état factuel sans dénigrer
    if not offer.vendeur.nom or offer.vendeur.nom == "Organisateur non identifié":
        offer.vendeur.fiabilite_economique = "Non vérifié (organisateur non identifié dans les données)"
        offer.vendeur.fiabilite_explication = "Le document ne mentionne pas explicitement la raison sociale. Recommandation : demander les mentions légales et le numéro d'immatriculation."
    else:
        if offer.vendeur.statut_juridique == "Non vérifié":
            offer.vendeur.fiabilite_economique = "Non vérifié (registres publics non interrogés)"
            offer.vendeur.fiabilite_explication = f"Aucun registre légal n'a été interrogé automatiquement pour '{offer.vendeur.nom}'. Cette absence de consultation n'induit aucun avis négatif sur le professionnel."

    # 3. Traçabilité des avis
    if not offer.hebergement.avis_verifie:
        offer.hebergement.avis_source = "Non vérifié (aucun service externe d'avis connecté)"
        offer.hebergement.avis_explication = "Pour garantir la sincérité de l'analyse, aucun faux avis n'est généré. Une consultation sur une plateforme d'avis certifiés est conseillée."

    return offer
