from typing import List, Dict, Tuple
from app.models.travel_offer import (
    TravelOffer,
    TravelType,
    OfferScore,
    ScopeDifference,
    ComparisonResult,
    ScoringWeights
)

def generate_strategic_advice(
    travel_type: TravelType,
    offers: List[TravelOffer],
    scores: Dict[str, OfferScore],
    differences: List[ScopeDifference],
    weights: ScoringWeights
) -> Tuple[str, str, str, List[str]]:
    """
    Rédige une synthèse neutre, claire et argumentée adaptée au type de voyage choisi.
    Met en regard le prix facial et le périmètre réel.
    """
    avertissements = []

    # Vérification conformité de toutes les offres
    for o in offers:
        if not o.conforme_criteres:
            for err in o.erreurs_conformite:
                avertissements.append(f"Alerte conformité pour « {o.titre} » : {err}")

    if not offers:
        return "Aucune offre soumise.", "Données insuffisantes.", "", avertissements

    # Trouver l'offre en tête selon le score pondéré
    sorted_offers = sorted(offers, key=lambda x: scores[x.id].score_global if x.id in scores else 0, reverse=True)
    meilleure = sorted_offers[0]
    challenger = sorted_offers[1] if len(sorted_offers) > 1 else None

    # Synthèse selon le type de voyage
    contexte_intro = ""
    priorite_type = ""

    if travel_type == TravelType.CULTUREL:
        contexte_intro = "Pour un voyage à dominante culturelle, les critères déterminants sont la centralité de l'hébergement (accessibilité à pied aux monuments et transports urbains), la présence d'un guidage professionnel qualifié et l'inclusion effective des billets coupe-file pour les sites majeurs."
        priorite_type = "la qualité d'immersion culturelle et le confort logistique au cœur de la destination"
    elif travel_type == TravelType.DETENTE:
        contexte_intro = "Pour un séjour de pure détente, les éléments cruciaux reposent sur le confort et le cadre de l'établissement hôtelier (front de mer, espaces de bien-être, calme), la sérénité procurée par une formule de restauration complète (All Inclusive ou Demi-pension) et la flexibilité en cas d'annulation."
        priorite_type = "la sérénité du séjour et la limitation maximale des dépenses annexes non maîtrisées"
    elif travel_type == TravelType.NATURE:
        contexte_intro = "Dans le cadre d'une expérience nature et grands espaces, la proximité immédiate des parcs et départs d'itinéraires, la sécurité logistique (transport adapté, assurance assistance/rapatriement) et l'autonomie sur place constituent les priorités opérationnelles."
        priorite_type = "l'adéquation avec les écosystèmes naturels et la couverture des risques d'excursion"
    elif travel_type == TravelType.PROFESSIONNEL:
        contexte_intro = "Pour un déplacement professionnel ou un séminaire, l'efficacité prime : vols directs assurés, localisation connectée aux pôles économiques ou centres de congrès, fiabilité contractuelle du voyagiste et conditions d'annulation ou de report très souples."
        priorite_type = "l'optimisation des temps de transit et la flexibilité contractuelle face aux impératifs d'agenda"
    elif travel_type == TravelType.SPORTIF:
        contexte_intro = "Pour un séjour sportif, la priorité absolue réside dans l'accès direct aux infrastructures ou terrains de pratique, l'encadrement par des professionnels diplômés, la prise en charge ou le transport des équipements et une assurance dédiée aux activités engagées."
        priorite_type = "la proximité technique des spots et les garanties de sécurité sportive"

    # Comparaison prix / périmètre
    p_meilleure = meilleure.prix.prix_par_personne
    p_challenger = challenger.prix.prix_par_personne if challenger else 0
    diff_prix = round(p_meilleure - p_challenger, 2) if challenger else 0

    synthese_parts = [
        f"**Contexte d'évaluation ({travel_type.value.capitalize()}) :** {contexte_intro}\n",
        f"**Analyse des périmètres contractuels :**",
    ]

    if challenger:
        if abs(diff_prix) < 20:
            synthese_parts.append(
                f"Les deux offres présentent un niveau de prix quasiment équivalent (~{p_meilleure} € / personne). "
                f"L'arbitrage doit donc se faire prioritairement sur les garanties incluses et les différences de prestations constatées ci-dessous."
            )
        elif diff_prix > 0:
            synthese_parts.append(
                f"L'offre « {meilleure.titre} » est plus onéreuse de {diff_prix} € par personne que « {challenger.titre} », "
                f"mais ce surcoût est contrebalancé par des prestations complémentaires ou un niveau de prestation supérieur (score global de {scores[meilleure.id].score_global}/100 contre {scores[challenger.id].score_global}/100)."
            )
        else:
            synthese_parts.append(
                f"L'offre « {meilleure.titre} » propose un avantage tarifaire notable de {abs(diff_prix)} € d'économie par personne, "
                f"tout en maintenant un niveau de prestation et d'adéquation élevé pour votre voyage {travel_type.value}."
            )

    # Recommandation motivée
    recommandation = f"Offre recommandée : « {meilleure.titre} »"
    
    justification_lignes = [
        f"1. **Adéquation thématique :** Meilleure réponse aux attentes d'un voyage {travel_type.value}, notamment pour {priorite_type}.",
        f"2. **Équilibre prestations/prix :** Coût normalisé de {meilleure.prix.prix_par_personne_par_nuit} € par nuit et par personne pour un score global de {scores[meilleure.id].score_global}/100.",
        f"3. **Transparence et vigilance :** Cette offre affiche un indice de complétude des informations de {scores[meilleure.id].completude_donnees_pct}%.",
    ]

    if meilleure.points_a_clarifier:
        justification_lignes.append(f"4. **Action conseillée avant réservation :** Clarifier en priorité : {meilleure.points_a_clarifier[0]}")

    justification = "\n".join(justification_lignes)
    synthese_complete = "\n\n".join(synthese_parts)

    return synthese_complete, recommandation, justification, avertissements

def run_full_comparison(
    travel_type: TravelType,
    offers: List[TravelOffer],
    weights: ScoringWeights
) -> ComparisonResult:
    """
    Exécute le pipeline complet de comparaison, d'audit et de synthèse.
    """
    from app.services.verifier import audit_vendor_and_services
    from app.services.comparator import detect_scope_differences, calculate_offer_score, enrich_strengths_and_questions

    # 1. Audit & enrichissement par offre
    processed_offers = []
    for off in offers:
        o = audit_vendor_and_services(off, travel_type)
        o = enrich_strengths_and_questions(o, travel_type)
        processed_offers.append(o)

    # 2. Détection des écarts de périmètre
    ecarts = detect_scope_differences(processed_offers)

    # 3. Calcul des scores transparents
    scores_dict: Dict[str, OfferScore] = {}
    for o in processed_offers:
        scores_dict[o.id] = calculate_offer_score(o, processed_offers, weights, travel_type)

    # 4. Synthèse argumentée
    synthese, reco, justif, avertissements = generate_strategic_advice(
        travel_type, processed_offers, scores_dict, ecarts, weights
    )

    return ComparisonResult(
        type_voyage=travel_type,
        offres=processed_offers,
        scores=scores_dict,
        poids_utilises=weights,
        ecarts_perimetre=ecarts,
        synthese_argumentee=synthese,
        recommandation_principale=reco,
        justification_recommandation=justif,
        avertissements_conformite=avertissements
    )
