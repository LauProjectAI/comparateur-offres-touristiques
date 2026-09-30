from typing import List, Dict
from app.models.travel_offer import (
    TravelOffer,
    TravelType,
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

def get_sample_offers_by_type(travel_type: TravelType) -> List[TravelOffer]:
    """
    Fournit des jeux d'offres réelles et complètes prêtes à être analysées,
    illustrant les 5 types de voyage avec leurs spécificités et traçabilités.
    """
    if travel_type == TravelType.CULTUREL:
        # Offre 1 : Escapade Rome Prestige (Complète et guidée)
        off1 = TravelOffer(
            id="rome-prestige",
            titre="Rome Historique & Trésors du Vatican - Hôtel 4* Centre Ancien",
            source_origine_type="demo",
            source_reference="Brochure Terres de Culture 2026",
            date_depart="15/10/2026",
            date_retour="19/10/2026",
            duree_jours=5,
            duree_nuits=4,
            transport=TransportDetail(
                statut=ServiceStatus.INCLUS,
                type_transport="Vol",
                est_vol=True,
                vol_direct=True,
                compagnie_aerienne="Air France",
                compagnie_nommee_clairement=True,
                details="Vols directs réguliers Paris CDG - Rome FCO avec bagage en soute de 23 kg inclus.",
                source=SourceOrigin.VENDEUR,
                source_detail="Contrat de transport vendeur (p. 2)"
            ),
            hebergement=AccommodationDetail(
                statut=ServiceStatus.INCLUS,
                nom="Hôtel Quirinale Roma 4*",
                type_hebergement="Hôtel",
                adresse="Via Nazionale 7, 00184 Rome (Centre historique)",
                standing="4 étoiles",
                pertinence_emplacement="Emplacement central premium : à 10 minutes à pied de la Fontaine de Trevi et du Colisée.",
                avis_verifie=True,
                avis_note=4.5,
                avis_nombre=1420,
                avis_date_recents="Derniers avis certifiés : été 2026",
                avis_source="Vérification indépendante (Agrégateur d'avis certifiés hôtellerie)",
                source=SourceOrigin.VENDEUR,
                source_detail="Descriptif hôtelier du dossier"
            ),
            restauration=RestaurationDetail(
                statut=ServiceStatus.INCLUS,
                formule=RestaurationMealPlan.BB,
                description="Petits déjeuners buffets américains inclus chaque matin. Déjeuners et dîners libres pour goûter aux trattorias locales.",
                source=SourceOrigin.VENDEUR
            ),
            activites=ActivitiesDetail(
                statut=ServiceStatus.INCLUS,
                description="Pass musées & coupe-file officiel Vatican, Chapelle Sixtine, Colisée et Forum Romain inclus.",
                liste_activites=["Visite guidée des Musées du Vatican", "Accès coupe-file Colisée et Forum", "Balade nocturne du quartier Trastevere"],
                billets_inclus=True,
                source=SourceOrigin.VENDEUR
            ),
            guide=GuideDetail(
                statut=ServiceStatus.INCLUS,
                qualification="Guide local conférencier francophone diplômé d'État",
                description="Accompagnement par une historienne de l'art francophone sur 3 demi-journées.",
                source=SourceOrigin.VENDEUR
            ),
            assurance=InsuranceDetail(
                statut=ServiceStatus.INCLUS,
                type_couverture="Assistance rapatriement médicale 24/7 incluse",
                description="Assurance assistance médicale et rapatriement prise en charge. Option annulation multirisque disponible à 45 €.",
                source=SourceOrigin.VENDEUR
            ),
            annulation=CancellationDetail(
                flexibilite="Très flexible",
                conditions_detaillees="Annulation sans aucun frais jusqu'à 21 jours avant le départ. Retenue de 30% entre J-20 et J-7, 100% au-delà.",
                date_limite_annulation_gratuite="J-21 avant le départ",
                source=SourceOrigin.VENDEUR
            ),
            prix=PriceDetail(
                prix_total_annonce=1840.0,
                devise="EUR",
                nombre_personnes=2,
                taxes_incluses=True,
                taxes_sejour_estimees=24.0, # 6€/nuit/pers taxe séjour Rome
                frais_dossier=0.0,
                supplements_connus=0.0,
                source=SourceOrigin.VENDEUR,
                source_detail="Devis contractuel N°2026-CULT-84"
            ),
            vendeur=VendorDetail(
                nom="Terres de Culture Voyages SAS",
                site_web="https://www.terresdeculture-voyages.fr",
                statut_juridique="Immatriculation Atout France IM075120038 / Garantie financière APST",
                fiabilite_economique="Entreprise déclarée active au RCS Paris, capital social 150 000 €, aucun incident de paiement recensé.",
                avis_vendeur_note=4.7,
                avis_vendeur_volume=680,
                avis_vendeur_source="Vérification externe (Registre national des voyagistes & avis contrôlés)",
                source=SourceOrigin.VERIFICATION_EXTERNE
            )
        )

        # Offre 2 : Rome Éco Découverte (Prix bas mais hôtel périphérique et sans guide)
        off2 = TravelOffer(
            id="rome-eco",
            titre="Séjour Libre Découverte Rome - Hôtel Périphérique",
            source_origine_type="demo",
            source_reference="Plateforme Web PromoVoyage",
            date_depart="15/10/2026",
            date_retour="19/10/2026",
            duree_jours=5,
            duree_nuits=4,
            transport=TransportDetail(
                statut=ServiceStatus.INCLUS,
                type_transport="Vol",
                est_vol=True,
                vol_direct=False, # Escale
                compagnie_aerienne="Non précisée (compagnie charter / low cost selon plan de vol)",
                compagnie_nommee_clairement=False,
                details="Vol avec 1 escale à Munich ou Francfort. Bagage cabine 8 kg inclus uniquement, supplément soute 50 €/trajet.",
                source=SourceOrigin.VENDEUR,
                source_detail="Fiche produit en ligne"
            ),
            hebergement=AccommodationDetail(
                statut=ServiceStatus.INCLUS,
                nom="Hôtel Roma Aurelia Park 3*",
                type_hebergement="Hôtel",
                adresse="Via Aurelia Km 12, Périphérie Ouest de Rome",
                standing="3 étoiles",
                pertinence_emplacement="Emplacement excentré : situé à 45 minutes de bus/métro des principaux monuments. Nécessite une logistique de transport quotidien.",
                avis_verifie=False,
                avis_note=None,
                avis_nombre=None,
                avis_date_recents=None,
                avis_source="Non vérifié (aucun service externe d'avis connecté)",
                avis_explication="Les avis de cet hôtel n'ont pas fait l'objet d'un audit indépendant.",
                source=SourceOrigin.VENDEUR,
                source_detail="Fiche produit en ligne"
            ),
            restauration=RestaurationDetail(
                statut=ServiceStatus.ABSENT,
                formule=RestaurationMealPlan.NONE,
                description="Hébergement seul sans petit-déjeuner (petit déjeuner buffet en supplément à 14 €/personne/jour).",
                source=SourceOrigin.VENDEUR
            ),
            activites=ActivitiesDetail(
                statut=ServiceStatus.EN_SUPPLEMENT,
                description="Aucun billet de musée ni coupe-file inclus. Entrées Colisée et Vatican à réserver individuellement.",
                liste_activites=[],
                billets_inclus=False,
                source=SourceOrigin.VENDEUR
            ),
            guide=GuideDetail(
                statut=ServiceStatus.ABSENT,
                qualification="Aucun guide",
                description="Séjour 100% en autonomie, sans assistance sur place.",
                source=SourceOrigin.VENDEUR
            ),
            assurance=InsuranceDetail(
                statut=ServiceStatus.ABSENT,
                type_couverture="Aucune assurance",
                description="Assurance annulation et assistance non comprise (option payante à 79 € par voyageur).",
                source=SourceOrigin.VENDEUR
            ),
            annulation=CancellationDetail(
                flexibilite="Stricte",
                conditions_detaillees="Offre promotionnelle non modifiable, 100% de frais en cas d'annulation dès la confirmation.",
                date_limite_annulation_gratuite="Aucune annulation gratuite",
                source=SourceOrigin.VENDEUR
            ),
            prix=PriceDetail(
                prix_total_annonce=1190.0,
                devise="EUR",
                nombre_personnes=2,
                taxes_incluses=False,
                taxes_sejour_estimees=32.0, # 4€/nuit/pers
                frais_dossier=35.0, # Frais de dossier du voyagiste en ligne
                supplements_connus=67.0,
                source=SourceOrigin.VENDEUR,
                source_detail="Panier d'achat en ligne"
            ),
            vendeur=VendorDetail(
                nom="PromoTravel Online B.V.",
                site_web="https://www.promotravel-online-example.eu",
                statut_juridique="Non vérifié (siège immatriculé hors France, registre étranger non consulté)",
                fiabilite_economique="Non vérifié",
                fiabilite_explication="L'absence d'information publique immédiate ne constitue pas un avis défavorable mais impose de vérifier les voies de recours en cas de litige.",
                avis_vendeur_source="Non vérifié",
                source=SourceOrigin.NON_VERIFIE
            )
        )
        offers = [off1, off2]

    elif travel_type == TravelType.DETENTE:
        # Offre Détente 1 : Baléares Resort & Spa All Inclusive
        off1 = TravelOffer(
            id="mallorca-resort",
            titre="Séjour Détente & Bien-être Majorque - Resort 4* All Inclusive Pieds dans l'Eau",
            source_origine_type="demo",
            source_reference="Catalogue Club Sérénité Vacances",
            date_depart="10/06/2026",
            date_retour="17/06/2026",
            duree_jours=8,
            duree_nuits=7,
            transport=TransportDetail(
                statut=ServiceStatus.INCLUS,
                type_transport="Vol",
                est_vol=True,
                vol_direct=True,
                compagnie_aerienne="Transavia",
                compagnie_nommee_clairement=True,
                details="Vol direct régulier avec transferts aéroport-hôtel inclus.",
                source=SourceOrigin.VENDEUR
            ),
            hebergement=AccommodationDetail(
                statut=ServiceStatus.INCLUS,
                nom="Iberostar Cala Domingos 4*",
                type_hebergement="Resort hôtelier",
                adresse="Cala Murada, 07688 Manacor, Majorque",
                standing="4 étoiles",
                pertinence_emplacement="Emplacement idéal pour la détente : accès direct à une crique paisible sans circulation routière, vaste parc de pins et spa sur place.",
                avis_verifie=True,
                avis_note=4.6,
                avis_nombre=920,
                avis_date_recents="Avis consolidés 2026",
                avis_source="Vérification externe (Portail hôtelier européen)",
                source=SourceOrigin.VENDEUR
            ),
            restauration=RestaurationDetail(
                statut=ServiceStatus.INCLUS,
                formule=RestaurationMealPlan.AI,
                description="Formule Tout Compris (All Inclusive) : repas, collations, boissons avec et sans alcool à volonté.",
                source=SourceOrigin.VENDEUR
            ),
            activites=ActivitiesDetail(
                statut=ServiceStatus.INCLUS,
                description="Accès libre piscines, cours de yoga matinaux, kayak de mer et espace détente.",
                liste_activites=["Accès spa et sauna", "Prêt de matériel de paddle", "Séances bien-être"],
                billets_inclus=True,
                source=SourceOrigin.VENDEUR
            ),
            guide=GuideDetail(
                statut=ServiceStatus.INCLUS,
                qualification="Concierge bien-être dédié",
                description="Équipe d'animation discrète et responsable d'accueil francophone sur place.",
                source=SourceOrigin.VENDEUR
            ),
            assurance=InsuranceDetail(
                statut=ServiceStatus.INCLUS,
                type_couverture="Assurance assistance et rapatriement",
                description="Couverture médicale d'urgence incluse dans le forfait séjour.",
                source=SourceOrigin.VENDEUR
            ),
            annulation=CancellationDetail(
                flexibilite="Très flexible",
                conditions_detaillees="Annulation sans frais jusqu'à 15 jours avant l'arrivée.",
                date_limite_annulation_gratuite="J-15 avant le départ",
                source=SourceOrigin.VENDEUR
            ),
            prix=PriceDetail(
                prix_total_annonce=2390.0,
                devise="EUR",
                nombre_personnes=2,
                taxes_incluses=True,
                taxes_sejour_estimees=30.80, # Éco-taxe baléares 2.20€/pers/nuit
                frais_dossier=0.0,
                supplements_connus=30.80,
                source=SourceOrigin.VENDEUR
            ),
            vendeur=VendorDetail(
                nom="Sérénité Vacances Tourisme",
                site_web="https://www.serenite-vacances-demo.fr",
                statut_juridique="Immatriculation Atout France IM092140012",
                fiabilite_economique="Garantie financière totale APST, bilans annuels certifiés conformes.",
                avis_vendeur_note=4.8,
                avis_vendeur_volume=410,
                avis_vendeur_source="Vérification externe (Fédération des entreprises du voyage)",
                source=SourceOrigin.VERIFICATION_EXTERNE
            )
        )

        # Offre Détente 2 : Villa privée Demi-pension (Vol avec escale)
        off2 = TravelOffer(
            id="mallorca-villa",
            titre="Échappée Sérénité Majorque - Finca de Charme & Demi-pension",
            source_origine_type="demo",
            source_reference="Site Web Agence Évasion Sud",
            date_depart="10/06/2026",
            date_retour="17/06/2026",
            duree_jours=8,
            duree_nuits=7,
            transport=TransportDetail(
                statut=ServiceStatus.INCLUS,
                type_transport="Vol",
                est_vol=True,
                vol_direct=False,
                compagnie_aerienne="Vueling",
                compagnie_nommee_clairement=True,
                details="Vol avec escale de 2h30 à Barcelone. Location de véhicule catégorie B incluse pour transferts.",
                source=SourceOrigin.VENDEUR
            ),
            hebergement=AccommodationDetail(
                statut=ServiceStatus.INCLUS,
                nom="Finca Son Manera Agroturismo",
                type_hebergement="Finca / Maison d'hôtes",
                adresse="Montuïri, Centre de Majorque",
                standing="Charme rural 4*",
                pertinence_emplacement="Emplacement campagne très calme, mais éloigné des plages (35 minutes de route). Idéal pour le silence, moins adapté si baignade quotidienne souhaitée.",
                avis_verifie=True,
                avis_note=4.4,
                avis_nombre=180,
                avis_date_recents="Avis été 2026",
                avis_source="Vérification externe",
                source=SourceOrigin.VENDEUR
            ),
            restauration=RestaurationDetail(
                statut=ServiceStatus.INCLUS,
                formule=RestaurationMealPlan.HB,
                description="Demi-pension (Petit déjeuner buffet et dîner terroir 3 plats inclus). Déjeuners à charge des voyageurs.",
                source=SourceOrigin.VENDEUR
            ),
            activites=ActivitiesDetail(
                statut=ServiceStatus.EN_SUPPLEMENT,
                description="Piscine extérieure sur place. Massages et activités de bien-être en supplément sur réservation.",
                liste_activites=["Piscine libre"],
                billets_inclus=False,
                source=SourceOrigin.VENDEUR
            ),
            guide=GuideDetail(
                statut=ServiceStatus.ABSENT,
                qualification="Sans guide",
                description="Aucun accompagnement.",
                source=SourceOrigin.VENDEUR
            ),
            assurance=InsuranceDetail(
                statut=ServiceStatus.EN_SUPPLEMENT,
                type_couverture="Option payante",
                description="Assurance non incluse par défaut.",
                source=SourceOrigin.VENDEUR
            ),
            annulation=CancellationDetail(
                flexibilite="Modérée",
                conditions_detaillees="Annulation sans frais jusqu'à 30 jours du départ. 50% retenus entre J-29 et J-15.",
                date_limite_annulation_gratuite="J-30 avant départ",
                source=SourceOrigin.VENDEUR
            ),
            prix=PriceDetail(
                prix_total_annonce=2120.0,
                devise="EUR",
                nombre_personnes=2,
                taxes_incluses=True,
                taxes_sejour_estimees=28.0,
                frais_dossier=20.0,
                supplements_connus=48.0,
                source=SourceOrigin.VENDEUR
            ),
            vendeur=VendorDetail(
                nom="Évasion Sud SARL",
                site_web="https://www.evasion-sud-example.fr",
                statut_juridique="Immatriculation Atout France IM013110055",
                fiabilite_economique="Données économiques vérifiées au registre de Marseille, régulier.",
                avis_vendeur_note=4.2,
                avis_vendeur_volume=125,
                avis_vendeur_source="Vérification externe",
                source=SourceOrigin.VERIFICATION_EXTERNE
            )
        )
        offers = [off1, off2]

    elif travel_type == TravelType.NATURE:
        # Islande Aventure Lodges vs Circuit Autotour
        off1 = TravelOffer(
            id="iceland-guided",
            titre="Islande Sauvage & Grands Espaces - Circuit Lodges & 4x4 Guidé",
            source_origine_type="demo",
            source_reference="Catalogue Aventures Boréales",
            date_depart="05/09/2026",
            date_retour="12/09/2026",
            duree_jours=8,
            duree_nuits=7,
            transport=TransportDetail(
                statut=ServiceStatus.INCLUS,
                type_transport="Vol + Minibus 4x4",
                est_vol=True,
                vol_direct=True,
                compagnie_aerienne="Icelandair",
                compagnie_nommee_clairement=True,
                details="Vol direct Paris CDG - Keflavik + véhicule 4x4 aménagé tout-terrain avec carburant et chauffeur.",
                source=SourceOrigin.VENDEUR
            ),
            hebergement=AccommodationDetail(
                statut=ServiceStatus.INCLUS,
                nom="Wilderness Lodges & Hôtels Nature 3*/4*",
                type_hebergement="Ecolodges",
                adresse="Cercle d'Or et Fjords du Sud, Islande",
                standing="3/4 étoiles confort nature",
                pertinence_emplacement="Excellente adéquation avec un voyage nature : hébergements situés en plein cœur des zones géothermiques et parcs nationaux, idéals pour aurores boréales et faune.",
                avis_verifie=True,
                avis_note=4.8,
                avis_nombre=310,
                avis_date_recents="Avis certifiés 2026",
                avis_source="Vérification externe",
                source=SourceOrigin.VENDEUR
            ),
            restauration=RestaurationDetail(
                statut=ServiceStatus.INCLUS,
                formule=RestaurationMealPlan.FB,
                description="Pension complète adaptée aux randonnées (petits déjeuners nordiques, pique-niques de midi et dîners chauds locaux).",
                source=SourceOrigin.VENDEUR
            ),
            activites=ActivitiesDetail(
                statut=ServiceStatus.INCLUS,
                description="Randonnées sur glaciers avec crampons fournis, accès sources chaudes de Laugarvatn Fontana.",
                liste_activites=["Marche sur glacier avec équipement de sécurité", "Observation faune et cascades", "Entrée bains géothermiques"],
                billets_inclus=True,
                source=SourceOrigin.VENDEUR
            ),
            guide=GuideDetail(
                statut=ServiceStatus.INCLUS,
                qualification="Guide naturaliste et secouriste francophone certifié WFR",
                description="Guide expert en géologie et sécurité polaire durant tout le séjour.",
                source=SourceOrigin.VENDEUR
            ),
            assurance=InsuranceDetail(
                statut=ServiceStatus.INCLUS,
                type_couverture="Assurance assistance médicale et secours en milieu hostile incluse",
                description="Couverture intégrale des frais de secours en montagne et rapatriement sanitaire.",
                source=SourceOrigin.VENDEUR
            ),
            annulation=CancellationDetail(
                flexibilite="Très flexible",
                conditions_detaillees="Annulation sans pénalité jusqu'à 30 jours avant départ.",
                date_limite_annulation_gratuite="J-30",
                source=SourceOrigin.VENDEUR
            ),
            prix=PriceDetail(
                prix_total_annonce=3890.0,
                devise="EUR",
                nombre_personnes=2,
                taxes_incluses=True,
                taxes_sejour_estimees=0.0,
                frais_dossier=0.0,
                supplements_connus=0.0,
                source=SourceOrigin.VENDEUR
            ),
            vendeur=VendorDetail(
                nom="Aventures Boréales SAS",
                site_web="https://www.aventures-boreales-demo.fr",
                statut_juridique="Atout France IM069150041, Adhérent ATR (Agir pour un Tourisme Responsable)",
                fiabilite_economique="Garantie financière bancaire solide, 12 ans d'exercice continu.",
                avis_vendeur_note=4.9,
                avis_vendeur_volume=520,
                avis_vendeur_source="Vérification externe (Avis vérifiés)",
                source=SourceOrigin.VERIFICATION_EXTERNE
            )
        )

        # Offre 2 : Autotour libre Islande
        off2 = TravelOffer(
            id="iceland-autotour",
            titre="Autotour Islande en Liberté - Hôtels d'étape & Location citadine",
            source_origine_type="demo",
            source_reference="Offre en ligne Fly&Drive Nord",
            date_depart="05/09/2026",
            date_retour="12/09/2026",
            duree_jours=8,
            duree_nuits=7,
            transport=TransportDetail(
                statut=ServiceStatus.INCLUS,
                type_transport="Vol + Voiture 2RM",
                est_vol=True,
                vol_direct=False, # Escale
                compagnie_aerienne="Non précisée",
                compagnie_nommee_clairement=False,
                details="Vol avec escale à Copenhague. Véhicule 2 roues motrices (non autorisé sur les pistes de l'intérieur des terres F-roads). Carburant non inclus.",
                source=SourceOrigin.VENDEUR
            ),
            hebergement=AccommodationDetail(
                statut=ServiceStatus.INCLUS,
                nom="Guesthouses & Hôtels 2*/3* le long de la Route 1",
                type_hebergement="Guesthouses",
                adresse="Diverses localités le long de la route circulaire",
                standing="2/3 étoiles basique",
                pertinence_emplacement="Hébergements le long de la route principale asphaltée. Accès limité aux réserves naturelles profondes nécessitant un franchissement de gués.",
                avis_verifie=False,
                avis_source="Non vérifié (hébergements multiples non audités individuellement)",
                source=SourceOrigin.VENDEUR
            ),
            restauration=RestaurationDetail(
                statut=ServiceStatus.INCLUS,
                formule=RestaurationMealPlan.BB,
                description="Petits déjeuners inclus. Repas du midi et du soir libres (coût moyen en Islande : 35-50 € par repas et par personne).",
                source=SourceOrigin.VENDEUR
            ),
            activites=ActivitiesDetail(
                statut=ServiceStatus.ABSENT,
                description="Aucune activité encadrée ni droit d'entrée inclus. Carnet de route fourni.",
                liste_activites=[],
                billets_inclus=False,
                source=SourceOrigin.VENDEUR
            ),
            guide=GuideDetail(
                statut=ServiceStatus.ABSENT,
                qualification="Aucun guide",
                description="Autonomie totale sans assistance physique sur place.",
                source=SourceOrigin.VENDEUR
            ),
            assurance=InsuranceDetail(
                statut=ServiceStatus.EN_SUPPLEMENT,
                type_couverture="Option payante",
                description="Assurance véhicule basique CDW (franchise élevée 2 500 € ; assurance graviers et sable en supplément).",
                source=SourceOrigin.VENDEUR
            ),
            annulation=CancellationDetail(
                flexibilite="Stricte",
                conditions_detaillees="Frais d'annulation : 50% à la réservation, 100% à moins de 30 jours.",
                date_limite_annulation_gratuite="Aucune",
                source=SourceOrigin.VENDEUR
            ),
            prix=PriceDetail(
                prix_total_annonce=2650.0,
                devise="EUR",
                nombre_personnes=2,
                taxes_incluses=True,
                taxes_sejour_estimees=18.0,
                frais_dossier=30.0,
                supplements_connus=48.0,
                source=SourceOrigin.VENDEUR
            ),
            vendeur=VendorDetail(
                nom="Nordic FlyDrive Direct",
                site_web="https://www.nordic-flydrive-example.com",
                statut_juridique="Non vérifié (plateforme étrangère)",
                fiabilite_economique="Non vérifié",
                fiabilite_explication="Société immatriculée à l'étranger sans garantie financière française identifiée.",
                avis_vendeur_source="Non vérifié",
                source=SourceOrigin.NON_VERIFIE
            )
        )
        offers = [off1, off2]

    elif travel_type == TravelType.PROFESSIONNEL:
        # Offre 1 : Séminaire & Coworking Lisbonne Hôtel d'affaires 4*
        off1 = TravelOffer(
            id="pro-lisbon-business",
            titre="Déplacement Professionnel Lisbonne - Hôtel 4* Centre d'Affaires & Coworking",
            source_origine_type="demo",
            source_reference="Catalogue Corporate Travel Partners",
            date_depart="12/11/2026",
            date_retour="15/11/2026",
            duree_jours=4,
            duree_nuits=3,
            transport=TransportDetail(
                statut=ServiceStatus.INCLUS,
                type_transport="Vol",
                est_vol=True,
                vol_direct=True,
                compagnie_aerienne="TAP Air Portugal",
                compagnie_nommee_clairement=True,
                details="Vol direct régulier aux horaires adaptés aux rendez-vous professionnels (départ tôt le matin, retour en fin de soirée).",
                source=SourceOrigin.VENDEUR
            ),
            hebergement=AccommodationDetail(
                statut=ServiceStatus.INCLUS,
                nom="Tivoli Avenida Liberdade Lisboa 5*",
                type_hebergement="Hôtel d'affaires",
                adresse="Avenida da Liberdade 185, Lisbonne",
                standing="5 étoiles",
                pertinence_emplacement="Emplacement fonctionnel et adapté aux déplacements professionnels : proximité immédiate des sièges d'entreprises, métro direct et centre de conférences.",
                avis_verifie=True,
                avis_note=4.7,
                avis_nombre=1100,
                avis_date_recents="Avis certifiés 2026",
                avis_source="Vérification externe",
                source=SourceOrigin.VENDEUR
            ),
            restauration=RestaurationDetail(
                statut=ServiceStatus.INCLUS,
                formule=RestaurationMealPlan.BB,
                description="Petit déjeuner d'affaires buffet inclus. Accès exécutif lounge avec boissons et snacks inclus en journée.",
                source=SourceOrigin.VENDEUR
            ),
            activites=ActivitiesDetail(
                statut=ServiceStatus.INCLUS,
                description="Accès salle de réunion équipée fibre optique (4h incluses) et espace coworking haut débit.",
                liste_activites=["Salle de sous-commission équipée visio", "Pass transports urbains illimité"],
                billets_inclus=True,
                source=SourceOrigin.VENDEUR
            ),
            guide=GuideDetail(
                statut=ServiceStatus.ABSENT,
                qualification="Aucun (inutile pour motif professionnel)",
                description="Accueil aéroport et conciergerie 24/7.",
                source=SourceOrigin.VENDEUR
            ),
            assurance=InsuranceDetail(
                statut=ServiceStatus.INCLUS,
                type_couverture="Assurance professionnelle mission corporate",
                description="Couverture responsabilité civile, annulation pour motif professionnel et rapatriement.",
                source=SourceOrigin.VENDEUR
            ),
            annulation=CancellationDetail(
                flexibilite="Très flexible",
                conditions_detaillees="Modification et annulation sans pénalité jusqu'à 24h avant l'embarquement.",
                date_limite_annulation_gratuite="J-1 (24h avant départ)",
                source=SourceOrigin.VENDEUR
            ),
            prix=PriceDetail(
                prix_total_annonce=1590.0,
                devise="EUR",
                nombre_personnes=1,
                taxes_incluses=True,
                taxes_sejour_estimees=12.0,
                frais_dossier=0.0,
                supplements_connus=12.0,
                source=SourceOrigin.VENDEUR
            ),
            vendeur=VendorDetail(
                nom="Corporate Travel Partners SAS",
                site_web="https://www.corporate-travel-demo.com",
                statut_juridique="Immatriculation Atout France IM075180029",
                fiabilite_economique="Agrément IATA vérifié, garantie financière solidaire APST.",
                avis_vendeur_note=4.8,
                avis_vendeur_volume=340,
                avis_vendeur_source="Vérification externe",
                source=SourceOrigin.VERIFICATION_EXTERNE
            )
        )

        # Offre 2 : Appart-Hôtel Périphérique sans flexibilité
        off2 = TravelOffer(
            id="pro-lisbon-budget",
            titre="Voyage Professionnel Lisbonne - Appart-Hôtel Expo & Vol Low-Cost",
            source_origine_type="demo",
            source_reference="Offre B2B TravelEasy",
            date_depart="12/11/2026",
            date_retour="15/11/2026",
            duree_jours=4,
            duree_nuits=3,
            transport=TransportDetail(
                statut=ServiceStatus.INCLUS,
                type_transport="Vol",
                est_vol=True,
                vol_direct=True,
                compagnie_aerienne="EasyJet",
                compagnie_nommee_clairement=True,
                details="Vol direct aux horaires fixes de mi-journée (perte d'une demi-journée de travail).",
                source=SourceOrigin.VENDEUR
            ),
            hebergement=AccommodationDetail(
                statut=ServiceStatus.INCLUS,
                nom="Parque das Nações Business Suites 3*",
                type_hebergement="Appart'hôtel",
                adresse="Parque das Nações, Nord Lisbonne",
                standing="3 étoiles",
                pertinence_emplacement="Proche de la gare Oriente mais à 25 minutes du centre-ville historique et financier.",
                avis_verifie=True,
                avis_note=3.9,
                avis_nombre=220,
                avis_date_recents="Avis 2026",
                avis_source="Vérification externe",
                source=SourceOrigin.VENDEUR
            ),
            restauration=RestaurationDetail(
                statut=ServiceStatus.ABSENT,
                formule=RestaurationMealPlan.NONE,
                description="Sans petit déjeuner. Kitchenette dans la chambre.",
                source=SourceOrigin.VENDEUR
            ),
            activites=ActivitiesDetail(
                statut=ServiceStatus.ABSENT,
                description="Aucun équipement de conférence ni espace de coworking inclus.",
                liste_activites=[],
                billets_inclus=False,
                source=SourceOrigin.VENDEUR
            ),
            guide=GuideDetail(
                statut=ServiceStatus.ABSENT,
                qualification="Aucun",
                description="Non applicable.",
                source=SourceOrigin.VENDEUR
            ),
            assurance=InsuranceDetail(
                statut=ServiceStatus.ABSENT,
                type_couverture="Non incluse",
                description="Aucune garantie d'assurance voyage incluse.",
                source=SourceOrigin.VENDEUR
            ),
            annulation=CancellationDetail(
                flexibilite="Stricte",
                conditions_detaillees="Billet d'avion non remboursable et logement soumis à 100% de frais dès J-7.",
                date_limite_annulation_gratuite="Aucune",
                source=SourceOrigin.VENDEUR
            ),
            prix=PriceDetail(
                prix_total_annonce=980.0,
                devise="EUR",
                nombre_personnes=1,
                taxes_incluses=True,
                taxes_sejour_estimees=12.0,
                frais_dossier=25.0,
                supplements_connus=37.0,
                source=SourceOrigin.VENDEUR
            ),
            vendeur=VendorDetail(
                nom="TravelEasy B2B Ltd",
                site_web="https://www.traveleasy-b2b-demo.com",
                statut_juridique="Non vérifié (courtier en ligne étranger)",
                fiabilite_economique="Non vérifié",
                fiabilite_explication="Courtier sans bureau physique en France. Démarches de facturation et TVA intracommunautaire à clarifier.",
                avis_vendeur_source="Non vérifié",
                source=SourceOrigin.NON_VERIFIE
            )
        )
        offers = [off1, off2]

    else: # Sportif
        # Offre 1 : Chamonix Stage Trail & Alpinisme Encadré
        off1 = TravelOffer(
            id="sport-chamonix-pro",
            titre="Stage Trail & Sommets Alpins Chamonix - Chalet Confort & Guide de Haute Montagne",
            source_origine_type="demo",
            source_reference="Catalogue Montagne Passion Aventures",
            date_depart="18/07/2026",
            date_retour="24/07/2026",
            duree_jours=7,
            duree_nuits=6,
            transport=TransportDetail(
                statut=ServiceStatus.INCLUS,
                type_transport="Train TGV + Navette privée",
                est_vol=False,
                vol_direct=None,
                compagnie_aerienne="SNCF",
                compagnie_nommee_clairement=True,
                details="TGV direct Paris - Bellegarde/St-Gervais + navette privée avec remorque matériel jusqu'au chalet.",
                source=SourceOrigin.VENDEUR
            ),
            hebergement=AccommodationDetail(
                statut=ServiceStatus.INCLUS,
                nom="Chalet Refuge du Mont-Blanc 4*",
                type_hebergement="Chalet haut de gamme avec spa de récupération",
                adresse="Les Praz, 74400 Chamonix-Mont-Blanc",
                standing="4 étoiles",
                pertinence_emplacement="Emplacement stratégique pour un séjour sportif : départ direct ou immédiat vers les sentiers du Tour du Mont-Blanc et téléphérique de la Flégère à 300 mètres.",
                avis_verifie=True,
                avis_note=4.9,
                avis_nombre=280,
                avis_date_recents="Avis certifiés été 2026",
                avis_source="Vérification externe (Label Montagne Confort)",
                source=SourceOrigin.VENDEUR
            ),
            restauration=RestaurationDetail(
                statut=ServiceStatus.INCLUS,
                formule=RestaurationMealPlan.FB,
                description="Pension complète sportive : petits déjeuners énergétiques, ravitaillements de course et dîners diététiques équilibrés.",
                source=SourceOrigin.VENDEUR
            ),
            activites=ActivitiesDetail(
                statut=ServiceStatus.INCLUS,
                description="5 journées d'entraînement encadré, reconnaissance d'itinéraires techniques, ateliers foulée et préparation physique.",
                liste_activites=["Sorties en dénivelé positif", "Atelier foulée montagnarde", "Accès spa et cryothérapie"],
                billets_inclus=True,
                source=SourceOrigin.VENDEUR
            ),
            guide=GuideDetail(
                statut=ServiceStatus.INCLUS,
                qualification="Guide de Haute Montagne UIAGM et Moniteur Trail DE",
                description="Encadrement en ratio réduit (1 professionnel pour 6 stagiaires maximum).",
                source=SourceOrigin.VENDEUR
            ),
            assurance=InsuranceDetail(
                statut=ServiceStatus.INCLUS,
                type_couverture="Assurance secours en montagne et rapatriement spécifique sports extrêmes",
                description="Prise en charge intégrale des frais de recherche et d'évacuation hélicoptère en montagne.",
                source=SourceOrigin.VENDEUR
            ),
            annulation=CancellationDetail(
                flexibilite="Très flexible",
                conditions_detaillees="Remboursement sans frais jusqu'à 21 jours avant départ ; report sans frais possible en cas de blessure certifiée par médecin du sport.",
                date_limite_annulation_gratuite="J-21 (ou blessure sportive)",
                source=SourceOrigin.VENDEUR
            ),
            prix=PriceDetail(
                prix_total_annonce=2980.0,
                devise="EUR",
                nombre_personnes=2,
                taxes_incluses=True,
                taxes_sejour_estimees=26.40,
                frais_dossier=0.0,
                supplements_connus=26.40,
                source=SourceOrigin.VENDEUR
            ),
            vendeur=VendorDetail(
                nom="Montagne Passion Expéditions",
                site_web="https://www.montagne-passion-demo.fr",
                statut_juridique="Immatriculation Atout France IM074160010, Compagnie des Guides partenaire",
                fiabilite_economique="Garantie financière APST, agrément Jeunesse & Sports.",
                avis_vendeur_note=4.9,
                avis_vendeur_volume=410,
                avis_vendeur_source="Vérification externe",
                source=SourceOrigin.VERIFICATION_EXTERNE
            )
        )

        # Offre 2 : Séjour montagne autonome
        off2 = TravelOffer(
            id="sport-chamonix-autonome",
            titre="Séjour Rando Liberté Chamonix - Résidence de Tourisme & Hébergement Seul",
            source_origine_type="demo",
            source_reference="Plateforme SportLoc",
            date_depart="18/07/2026",
            date_retour="24/07/2026",
            duree_jours=7,
            duree_nuits=6,
            transport=TransportDetail(
                statut=ServiceStatus.ABSENT,
                type_transport="Sans transport",
                est_vol=False,
                vol_direct=None,
                compagnie_aerienne="Non précisée",
                compagnie_nommee_clairement=False,
                details="Acheminement à la charge complète du vacancier (voiture personnelle recommandée).",
                source=SourceOrigin.VENDEUR
            ),
            hebergement=AccommodationDetail(
                statut=ServiceStatus.INCLUS,
                nom="Résidence Les Balcons de l'Arve 3*",
                type_hebergement="Studio meublé",
                adresse="Le Fayet / Saint-Gervais (à 22 km de Chamonix)",
                standing="3 étoiles standard",
                pertinence_emplacement="Emplacement en périphérie des spots sportifs majeurs : nécessite 30 minutes de trajet routier quotidien pour atteindre Chamonix et les départs de sentiers d'altitude.",
                avis_verifie=True,
                avis_note=3.8,
                avis_nombre=140,
                avis_date_recents="Avis 2026",
                avis_source="Vérification externe",
                source=SourceOrigin.VENDEUR
            ),
            restauration=RestaurationDetail(
                statut=ServiceStatus.ABSENT,
                formule=RestaurationMealPlan.NONE,
                description="Sans repas. Cuisine équipée dans le studio pour gestion autonome des repas.",
                source=SourceOrigin.VENDEUR
            ),
            activites=ActivitiesDetail(
                statut=ServiceStatus.INCLUS,
                description="Fourniture d'un topo-guide de randonnée et d'une carte IGN de la vallée de Chamonix à l'arrivée.",
                liste_activites=["Topo-guide de randonnée pédestre", "Carte des itinéraires balisés"],
                billets_inclus=False,
                source=SourceOrigin.VENDEUR
            ),
            guide=GuideDetail(
                statut=ServiceStatus.ABSENT,
                qualification="Aucun guide",
                description="Sans encadrement.",
                source=SourceOrigin.VENDEUR
            ),
            assurance=InsuranceDetail(
                statut=ServiceStatus.ABSENT,
                type_couverture="Aucune assurance",
                description="Sans couverture secours en montagne (frais d'hélicoptère pouvant atteindre plusieurs milliers d'euros sans assurance spécialisée).",
                source=SourceOrigin.VENDEUR
            ),
            annulation=CancellationDetail(
                flexibilite="Modérée",
                conditions_detaillees="Frais : 25% à la réservation, 100% à moins de 14 jours.",
                date_limite_annulation_gratuite="Aucune",
                source=SourceOrigin.VENDEUR
            ),
            prix=PriceDetail(
                prix_total_annonce=1450.0,
                devise="EUR",
                nombre_personnes=2,
                taxes_incluses=False,
                taxes_sejour_estimees=18.0,
                frais_dossier=20.0,
                supplements_connus=38.0,
                source=SourceOrigin.VENDEUR
            ),
            vendeur=VendorDetail(
                nom="LocaMontagne Web SAS",
                site_web="https://www.locamontagne-example.com",
                statut_juridique="Non vérifié",
                fiabilite_economique="Non vérifié (plateforme d'intermédiation)",
                fiabilite_explication="Portail d'annonces de meublés, responsabilité juridique limitée à la mise en relation.",
                avis_vendeur_source="Non vérifié",
                source=SourceOrigin.NON_VERIFIE
            )
        )
        offers = [off1, off2]

    # Normalisation et validation de chaque offre
    result = []
    for off in offers:
        off = normalize_offer_prices(off)
        validate_offer_compliance(off)
        result.append(off)

    return result

def get_sample_invalid_offer() -> TravelOffer:
    """
    Offre non conforme (ex: vol seul sans hébergement)
    Pour tester et démontrer la conformité aux exigences :
    'Signale lorsqu’une offre ne contient pas les deux prestations requises ou ne comprend aucun hébergement.'
    """
    off = TravelOffer(
        id="invalid-flight-only",
        titre="Billet d'avion seul - Vol Paris / Rome A/R (Offre Non Conforme)",
        source_origine_type="demo",
        source_reference="Billet de transport sec",
        date_depart="15/10/2026",
        date_retour="19/10/2026",
        duree_jours=5,
        duree_nuits=4,
        transport=TransportDetail(
            statut=ServiceStatus.INCLUS,
            type_transport="Vol",
            est_vol=True,
            vol_direct=True,
            compagnie_aerienne="Air France",
            compagnie_nommee_clairement=True,
            details="Vol sec sans aucune prestation complémentaire.",
            source=SourceOrigin.VENDEUR
        ),
        hebergement=AccommodationDetail(
            statut=ServiceStatus.ABSENT,
            nom="Aucun hébergement",
            type_hebergement="Aucun",
            adresse="",
            standing="",
            pertinence_emplacement="Aucun hébergement réservé.",
            source=SourceOrigin.VENDEUR
        ),
        restauration=RestaurationDetail(
            statut=ServiceStatus.ABSENT,
            formule=RestaurationMealPlan.NONE,
            description="Sans restauration",
            source=SourceOrigin.VENDEUR
        ),
        activites=ActivitiesDetail(
            statut=ServiceStatus.ABSENT,
            description="",
            liste_activites=[],
            source=SourceOrigin.VENDEUR
        ),
        guide=GuideDetail(
            statut=ServiceStatus.ABSENT,
            qualification="Aucun",
            description="",
            source=SourceOrigin.VENDEUR
        ),
        assurance=InsuranceDetail(
            statut=ServiceStatus.ABSENT,
            type_couverture="",
            description="",
            source=SourceOrigin.VENDEUR
        ),
        annulation=CancellationDetail(
            flexibilite="Stricte",
            conditions_detaillees="Billet non échangeable et non remboursable.",
            source=SourceOrigin.VENDEUR
        ),
        prix=PriceDetail(
            prix_total_annonce=380.0,
            devise="EUR",
            nombre_personnes=2,
            source=SourceOrigin.VENDEUR
        ),
        vendeur=VendorDetail(
            nom="Compagnie Aérienne Directe",
            source=SourceOrigin.VENDEUR
        )
    )
    off = normalize_offer_prices(off)
    validate_offer_compliance(off)
    return off
