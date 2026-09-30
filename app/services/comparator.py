from typing import List, Dict, Tuple
from app.models.travel_offer import (
    TravelOffer,
    TravelType,
    ServiceStatus,
    ScoringWeights,
    OfferScore,
    ScopeDifference,
    RestaurationMealPlan
)

def detect_scope_differences(offers: List[TravelOffer]) -> List[ScopeDifference]:
    """
    Identifie précisément les écarts de périmètre entre les offres comparées.
    Permet à l'utilisateur de voir immédiatement ce qui est inclus chez l'un mais manquant ou payant chez l'autre.
    """
    differences: List[ScopeDifference] = []
    if len(offers) < 2:
        return differences

    # Comparer l'offre A et l'offre B (et autres le cas échéant)
    base_offer = offers[0]
    other_offers = offers[1:]

    # Critères à scruter
    checks = [
        ("Transport / Vol", lambda o: f"{o.transport.statut.value.capitalize()} ({'Vol direct' if o.transport.vol_direct is True else 'Avec escale' if o.transport.vol_direct is False else o.transport.type_transport})"),
        ("Restauration", lambda o: f"{o.restauration.statut.value.capitalize()} ({o.restauration.formule.value})"),
        ("Visites et activités", lambda o: f"{o.activites.statut.value.capitalize()} ({'Billets inclus' if o.activites.billets_inclus else 'Accès standard/libre'})"),
        ("Guide / Accompagnateur", lambda o: f"{o.guide.statut.value.capitalize()} ({o.guide.qualification})"),
        ("Assurance", lambda o: f"{o.assurance.statut.value.capitalize()} ({o.assurance.type_couverture})"),
        ("Flexibilité d'annulation", lambda o: f"{o.annulation.flexibilite}"),
        ("Taxes et frais inclus", lambda o: "Inclus" if o.prix.taxes_incluses and o.prix.frais_dossier == 0 else f"Frais dossier: {o.prix.frais_dossier}€ / Taxes: {o.prix.taxes_sejour_estimees}€")
    ]

    for label, extractor in checks:
        base_val = extractor(base_offer)
        for idx, other in enumerate(other_offers, start=2):
            other_val = extractor(other)
            if base_val != other_val:
                differences.append(ScopeDifference(
                    prestation=label,
                    status_offre_a=f"{base_offer.titre} : {base_val}",
                    status_offre_b=f"{other.titre} : {other_val}",
                    impact=f"Différence de périmètre contractuel pouvant justifier un écart de prix ou nécessiter un budget complémentaire."
                ))

    return differences

def calculate_offer_score(offer: TravelOffer, all_offers: List[TravelOffer], weights: ScoringWeights, travel_type: TravelType) -> OfferScore:
    """
    Calcule un score transparent et détaillé avec mesure du niveau d'incertitude.
    """
    donnees_manquantes = []
    total_points_controle = 10
    points_confirmes = 0

    # 1. Contrôle de complétude
    if offer.transport.compagnie_nommee_clairement:
        points_confirmes += 1
    else:
        donnees_manquantes.append("Compagnie de transport non garantie au contrat")

    if offer.transport.vol_direct is not None or not offer.transport.est_vol:
        points_confirmes += 1
    else:
        donnees_manquantes.append("Caractère direct ou avec escale du vol non précisé")

    if offer.hebergement.adresse and "non communiquée" not in offer.hebergement.adresse.lower():
        points_confirmes += 1
    else:
        donnees_manquantes.append("Adresse précise de l'hébergement inconnue")

    if offer.hebergement.avis_verifie:
        points_confirmes += 1
    else:
        donnees_manquantes.append("Avis clients hébergement non audités par un tiers")

    if offer.restauration.formule != RestaurationMealPlan.NOT_SPECIFIED:
        points_confirmes += 1
    else:
        donnees_manquantes.append("Formule de restauration indéterminée")

    if offer.annulation.flexibilite != "Non précisé":
        points_confirmes += 1
    else:
        donnees_manquantes.append("Modalités exactes d'annulation non communiquées")

    if offer.guide.statut != ServiceStatus.NON_PRECISE:
        points_confirmes += 1
    else:
        donnees_manquantes.append("Présence d'un guide non spécifiée")

    if offer.assurance.statut != ServiceStatus.NON_PRECISE:
        points_confirmes += 1
    else:
        donnees_manquantes.append("Garanties d'assurance non renseignées")

    if offer.prix.prix_total_annonce > 0:
        points_confirmes += 1
    else:
        donnees_manquantes.append("Prix total non chiffré")

    if offer.vendeur.statut_juridique and "non vérifié" not in offer.vendeur.statut_juridique.lower():
        points_confirmes += 1
    else:
        donnees_manquantes.append("Immatriculation et garanties légales du vendeur non vérifiées")

    pct_completude = round((points_confirmes / total_points_controle) * 100, 1)

    # 2. Score Prix (relatif au groupe d'offres)
    prix_nuit = offer.prix.prix_par_personne_par_nuit
    all_prices = [o.prix.prix_par_personne_par_nuit for o in all_offers if o.prix.prix_par_personne_par_nuit > 0]
    if all_prices and len(all_prices) > 1:
        min_p = min(all_prices)
        max_p = max(all_prices)
        if max_p > min_p:
            # Moins c'est cher, plus le score est élevé
            score_prix = 60.0 + 40.0 * (1.0 - (prix_nuit - min_p) / (max_p - min_p))
        else:
            score_prix = 80.0
    else:
        score_prix = 75.0

    # 3. Score Hébergement
    score_heb = 65.0
    if "favorable" in offer.hebergement.pertinence_emplacement.lower() or "idéal" in offer.hebergement.pertinence_emplacement.lower() or "excellente" in offer.hebergement.pertinence_emplacement.lower():
        score_heb += 20.0
    elif "vérifier" in offer.hebergement.pertinence_emplacement.lower() or "éloigné" in offer.hebergement.pertinence_emplacement.lower():
        score_heb -= 10.0
        
    if "4" in offer.hebergement.standing or "5" in offer.hebergement.standing:
        score_heb += 15.0
    elif "3" in offer.hebergement.standing:
        score_heb += 10.0
        
    if offer.hebergement.avis_verifie and offer.hebergement.avis_note:
        if offer.hebergement.avis_note >= 4.0:
            score_heb += 5.0
    score_heb = min(100.0, max(30.0, score_heb))

    # 4. Score Annulation
    score_annul = 50.0
    if "très flexible" in offer.annulation.flexibilite.lower() or "gratuite" in offer.annulation.conditions_detaillees.lower():
        score_annul = 95.0
    elif "standard" in offer.annulation.flexibilite.lower() or "modérée" in offer.annulation.flexibilite.lower():
        score_annul = 70.0
    elif "stricte" in offer.annulation.flexibilite.lower() or "non remboursable" in offer.annulation.conditions_detaillees.lower():
        score_annul = 35.0
    else:
        score_annul = 45.0

    # 5. Score Prestations & Confort
    score_prest = 50.0
    # Restauration
    if offer.restauration.formule == RestaurationMealPlan.AI:
        score_prest += 20.0
    elif offer.restauration.formule == RestaurationMealPlan.FB:
        score_prest += 15.0
    elif offer.restauration.formule == RestaurationMealPlan.HB:
        score_prest += 10.0
    elif offer.restauration.formule == RestaurationMealPlan.BB:
        score_prest += 5.0
        
    # Vol direct
    if offer.transport.vol_direct is True:
        score_prest += 10.0
    elif offer.transport.vol_direct is False:
        score_prest -= 5.0

    # Visites & Guide
    if offer.activites.statut == ServiceStatus.INCLUS:
        score_prest += 10.0
    if offer.guide.statut == ServiceStatus.INCLUS:
        score_prest += 10.0
    if offer.assurance.statut == ServiceStatus.INCLUS:
        score_prest += 5.0
    score_prest = min(100.0, max(30.0, score_prest))

    # 6. Score Fiabilité / Transparence des données
    score_fiab = pct_completude * 0.7 + (30.0 if offer.transport.compagnie_nommee_clairement else 10.0)
    score_fiab = min(100.0, max(20.0, score_fiab))

    # Calcul global pondéré
    total_weights = (weights.poids_prix + weights.poids_hebergement + 
                     weights.poids_annulation + weights.poids_prestations + 
                     weights.poids_fiabilite)
    
    if total_weights <= 0:
        total_weights = 100.0

    score_global = (
        (score_prix * weights.poids_prix) +
        (score_heb * weights.poids_hebergement) +
        (score_annul * weights.poids_annulation) +
        (score_prest * weights.poids_prestations) +
        (score_fiab * weights.poids_fiabilite)
    ) / total_weights

    # Pénalité d'incertitude : si la complétude est très faible (<50%), afficher une mise en garde explicite
    explication = f"Score calculé sur 5 piliers pondérés avec un indice de complétude factuelle de {pct_completude}%."
    if pct_completude < 60:
        explication += " Attention : l'offre comporte des lacunes d'information notables susceptibles de modifier ce classement après confirmation auprès du vendeur."

    return OfferScore(
        score_global=round(score_global, 1),
        score_prix=round(score_prix, 1),
        score_hebergement=round(score_heb, 1),
        score_annulation=round(score_annul, 1),
        score_prestations=round(score_prest, 1),
        score_fiabilite=round(score_fiab, 1),
        completude_donnees_pct=pct_completude,
        donnees_manquantes=donnees_manquantes,
        explication_score=explication
    )

def enrich_strengths_and_questions(offer: TravelOffer, travel_type: TravelType) -> TravelOffer:
    """
    Détermine les forces, limites et questions indispensables à poser au vendeur.
    """
    forts = []
    faibles = []
    questions = []

    # Transport
    if offer.transport.est_vol:
        if offer.transport.vol_direct is True:
            forts.append("Vol direct confirmé (gain de temps et confort de voyage).")
        elif offer.transport.vol_direct is False:
            faibles.append("Vol avec escale(s) pouvant allonger significativement le temps de trajet.")
            questions.append("Quels sont les temps de transit et les aéroports de correspondance prévus ?")
        else:
            questions.append("Le vol est-il direct ou avec escale(s) ?")

        if offer.transport.compagnie_nommee_clairement:
            forts.append(f"Compagnie aérienne clairement identifiée ({offer.transport.compagnie_aerienne}).")
        else:
            faibles.append("Nom de la compagnie aérienne non garanti (risque d'affrètement de dernière minute).")
            questions.append("Quelle est la compagnie aérienne contractuelle et les franchises de bagages en soute incluses ?")

    # Hébergement
    if "favorable" in offer.hebergement.pertinence_emplacement.lower() or "idéal" in offer.hebergement.pertinence_emplacement.lower():
        forts.append("Emplacement de l'hébergement particulièrement adapté aux objectifs du séjour.")
    else:
        questions.append("Quelle est l'adresse exacte de l'établissement et sa distance par rapport aux sites d'intérêt ?")

    # Restauration
    if offer.restauration.formule in [RestaurationMealPlan.AI, RestaurationMealPlan.FB]:
        forts.append(f"Formule de restauration complète ({offer.restauration.formule.value}), limitant les dépenses annexes.")
    elif offer.restauration.formule == RestaurationMealPlan.BB:
        forts.append("Petit-déjeuner inclus : liberté conservée pour déjeuner et dîner selon les visites.")
    elif offer.restauration.formule == RestaurationMealPlan.NONE:
        faibles.append("Aucun repas inclus : prévoir un budget substantiel pour la restauration sur place.")
        questions.append("Y a-t-il des options de restauration ou de commerces à proximité immédiate de l'hébergement ?")

    # Annulation
    if "flexible" in offer.annulation.flexibilite.lower():
        forts.append("Conditions d'annulation protectrices (annulation sans frais possible).")
    else:
        faibles.append("Conditions d'annulation contraignantes ou non détaillées.")
        questions.append("Quel est le barème précis des frais d'annulation en cas d'imprévu ?")

    # Vendeur / Fiabilité
    if offer.vendeur.nom == "Organisateur non identifié":
        faibles.append("Identité juridique du voyagiste non vérifiée sur le support.")
        questions.append("Quelles sont les mentions légales du vendeur (numéro d'immatriculation Atout France ou équivalent, garantie financière) ?")

    offer.points_forts = forts[:4]
    offer.points_faibles = faibles[:4]
    offer.points_a_clarifier = questions[:5]

    return offer
