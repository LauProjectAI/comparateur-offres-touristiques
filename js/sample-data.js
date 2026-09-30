// Jeux de données d'exemples réalistes pour les 5 types de voyage + offre non conforme pour GitHub Pages
const SAMPLE_OFFERS_DATABASE = {
    culturel: [
        {
            id: "rome-prestige",
            titre: "Rome Historique & Trésors du Vatican - Hôtel 4* Centre Ancien",
            source_origine_type: "demo",
            source_reference: "Brochure Terres de Culture 2026",
            date_depart: "15/10/2026",
            date_retour: "19/10/2026",
            duree_jours: 5,
            duree_nuits: 4,
            conforme_criteres: true,
            erreurs_conformite: [],
            nombre_prestations_incluses: 6,
            contient_hebergement: true,
            transport: {
                statut: "inclus",
                type_transport: "Vol",
                est_vol: true,
                vol_direct: true,
                compagnie_aerienne: "Air France",
                compagnie_nommee_clairement: true,
                details: "Vols directs réguliers Paris CDG - Rome FCO avec bagage en soute de 23 kg inclus.",
                source: "Vendeur (document ou lien)"
            },
            hebergement: {
                statut: "inclus",
                nom: "Hôtel Quirinale Roma 4*",
                type_hebergement: "Hôtel",
                adresse: "Via Nazionale 7, 00184 Rome (Centre historique)",
                standing: "4 étoiles",
                pertinence_emplacement: "Emplacement central premium : à 10 minutes à pied de la Fontaine de Trevi et du Colisée.",
                avis_verifie: true,
                avis_note: 4.5,
                avis_nombre: 1420,
                avis_date_recents: "Derniers avis certifiés : été 2026",
                avis_source: "Vérification indépendante (Agrégateur d'avis certifiés hôtellerie)",
                source: "Vendeur (document ou lien)"
            },
            restauration: {
                statut: "inclus",
                formule: "Bed and Breakfast",
                description: "Petits déjeuners buffets américains inclus chaque matin. Déjeuners et dîners libres pour goûter aux trattorias locales.",
                source: "Vendeur (document ou lien)"
            },
            activites: {
                statut: "inclus",
                description: "Pass musées & coupe-file officiel Vatican, Chapelle Sixtine, Colisée et Forum Romain inclus.",
                liste_activites: ["Visite guidée des Musées du Vatican", "Accès coupe-file Colisée et Forum", "Balade nocturne du quartier Trastevere"],
                billets_inclus: true,
                source: "Vendeur (document ou lien)"
            },
            guide: {
                statut: "inclus",
                qualification: "Guide local conférencier francophone diplômé d'État",
                description: "Accompagnement par une historienne de l'art francophone sur 3 demi-journées.",
                source: "Vendeur (document ou lien)"
            },
            assurance: {
                statut: "inclus",
                type_couverture: "Assistance rapatriement médicale 24/7 incluse",
                description: "Assurance assistance médicale et rapatriement prise en charge. Option annulation multirisque disponible à 45 €.",
                source: "Vendeur (document ou lien)"
            },
            annulation: {
                flexibilite: "Très flexible",
                conditions_detaillees: "Annulation sans aucun frais jusqu'à 21 jours avant le départ. Retenue de 30% entre J-20 et J-7, 100% au-delà.",
                date_limite_annulation_gratuite: "J-21 avant le départ",
                source: "Vendeur (document ou lien)"
            },
            prix: {
                prix_total_annonce: 1840.0,
                devise: "EUR",
                nombre_personnes: 2,
                taxes_incluses: true,
                taxes_sejour_estimees: 24.0,
                frais_dossier: 0.0,
                supplements_connus: 0.0,
                prix_total_normalise: 1864.0,
                prix_par_personne: 932.0,
                prix_par_personne_par_nuit: 233.0,
                source: "Vendeur (document ou lien)"
            },
            vendeur: {
                nom: "Terres de Culture Voyages SAS",
                site_web: "https://www.terresdeculture-voyages.fr",
                statut_juridique: "Immatriculation Atout France IM075120038 / Garantie financière APST",
                fiabilite_economique: "Entreprise déclarée active au RCS Paris, capital social 150 000 €, aucun incident de paiement recensé.",
                avis_vendeur_note: 4.7,
                avis_vendeur_volume: 680,
                avis_vendeur_source: "Vérification externe (Registre national des voyagistes & avis contrôlés)",
                source: "Vérification indépendante"
            }
        },
        {
            id: "rome-eco",
            titre: "Séjour Libre Découverte Rome - Hôtel Périphérique",
            source_origine_type: "demo",
            source_reference: "Plateforme Web PromoVoyage",
            date_depart: "15/10/2026",
            date_retour: "19/10/2026",
            duree_jours: 5,
            duree_nuits: 4,
            conforme_criteres: true,
            erreurs_conformite: [],
            nombre_prestations_incluses: 2,
            contient_hebergement: true,
            transport: {
                statut: "inclus",
                type_transport: "Vol",
                est_vol: true,
                vol_direct: false,
                compagnie_aerienne: "Non précisée (compagnie charter / low cost selon plan de vol)",
                compagnie_nommee_clairement: false,
                details: "Vol avec 1 escale à Munich ou Francfort. Bagage cabine 8 kg inclus uniquement, supplément soute 50 €/trajet.",
                source: "Vendeur (document ou lien)"
            },
            hebergement: {
                statut: "inclus",
                nom: "Hôtel Roma Aurelia Park 3*",
                type_hebergement: "Hôtel",
                adresse="Via Aurelia Km 12, Périphérie Ouest de Rome",
                standing: "3 étoiles",
                pertinence_emplacement: "Emplacement excentré : situé à 45 minutes de bus/métro des principaux monuments. Nécessite une logistique de transport quotidien.",
                avis_verifie: false,
                avis_note: null,
                avis_nombre: null,
                avis_date_recents: null,
                avis_source: "Non vérifié (aucun service externe d'avis connecté)",
                source: "Vendeur (document ou lien)"
            },
            restauration: {
                statut: "absent",
                formule: "Sans repas",
                description: "Hébergement seul sans petit-déjeuner (petit déjeuner buffet en supplément à 14 €/personne/jour).",
                source: "Vendeur (document ou lien)"
            },
            activites: {
                statut: "en_supplement",
                description: "Aucun billet de musée ni coupe-file inclus. Entrées Colisée et Vatican à réserver individuellement.",
                liste_activites: [],
                billets_inclus: false,
                source: "Vendeur (document ou lien)"
            },
            guide: {
                statut: "absent",
                qualification: "Aucun guide",
                description: "Séjour 100% en autonomie, sans assistance sur place.",
                source: "Vendeur (document ou lien)"
            },
            assurance: {
                statut: "absent",
                type_couverture: "Aucune assurance",
                description: "Assurance annulation et assistance non comprise (option payante à 79 € par voyageur).",
                source: "Vendeur (document ou lien)"
            },
            annulation: {
                flexibilite: "Stricte",
                conditions_detaillees: "Offre promotionnelle non modifiable, 100% de frais en cas d'annulation dès la confirmation.",
                date_limite_annulation_gratuite: "Aucune annulation gratuite",
                source: "Vendeur (document ou lien)"
            },
            prix: {
                prix_total_annonce: 1190.0,
                devise: "EUR",
                nombre_personnes: 2,
                taxes_incluses: false,
                taxes_sejour_estimees: 32.0,
                frais_dossier: 35.0,
                supplements_connus: 0.0,
                prix_total_normalise: 1257.0,
                prix_par_personne: 628.5,
                prix_par_personne_par_nuit: 157.13,
                source: "Vendeur (document ou lien)"
            },
            vendeur: {
                nom: "PromoTravel Online B.V.",
                site_web: "https://www.promotravel-online-example.eu",
                statut_juridique: "Non vérifié (siège immatriculé hors France, registre étranger non consulté)",
                fiabilite_economique: "Non vérifié (registres publics non interrogés)",
                fiabilite_explication: "L'absence d'information publique immédiate ne constitue pas un avis défavorable mais impose de vérifier les voies de recours en cas de litige.",
                avis_vendeur_source: "Non vérifié",
                source: "Non vérifié (source externe inaccessible)"
            }
        }
    ],

    detente: [
        {
            id: "mallorca-resort",
            titre: "Séjour Détente & Bien-être Majorque - Resort 4* All Inclusive Pieds dans l'Eau",
            source_origine_type: "demo",
            source_reference: "Catalogue Club Sérénité Vacances",
            date_depart: "10/06/2026",
            date_retour: "17/06/2026",
            duree_jours: 8,
            duree_nuits: 7,
            conforme_criteres: true,
            erreurs_conformite: [],
            nombre_prestations_incluses: 6,
            contient_hebergement: true,
            transport: {
                statut: "inclus",
                type_transport: "Vol",
                est_vol: true,
                vol_direct: true,
                compagnie_aerienne: "Transavia",
                compagnie_nommee_clairement: true,
                details: "Vol direct régulier avec transferts aéroport-hôtel inclus.",
                source: "Vendeur (document ou lien)"
            },
            hebergement: {
                statut: "inclus",
                nom: "Iberostar Cala Domingos 4*",
                type_hebergement: "Resort hôtelier",
                adresse: "Cala Murada, 07688 Manacor, Majorque",
                standing: "4 étoiles",
                pertinence_emplacement: "Emplacement idéal pour la détente : accès direct à une crique paisible sans circulation routière, vaste parc de pins et spa sur place.",
                avis_verifie: true,
                avis_note: 4.6,
                avis_nombre: 920,
                avis_date_recents: "Avis consolidés 2026",
                avis_source: "Vérification externe (Portail hôtelier européen)",
                source: "Vendeur (document ou lien)"
            },
            restauration: {
                statut: "inclus",
                formule: "All Inclusive",
                description: "Formule Tout Compris (All Inclusive) : repas, collations, boissons avec et sans alcool à volonté.",
                source: "Vendeur (document ou lien)"
            },
            activites: {
                statut: "inclus",
                description: "Accès libre piscines, cours de yoga matinaux, kayak de mer et espace détente.",
                liste_activites: ["Accès spa et sauna", "Prêt de matériel de paddle", "Séances bien-être"],
                billets_inclus: true,
                source: "Vendeur (document ou lien)"
            },
            guide: {
                statut: "inclus",
                qualification: "Concierge bien-être dédié",
                description: "Équipe d'animation discrète et responsable d'accueil francophone sur place.",
                source: "Vendeur (document ou lien)"
            },
            assurance: {
                statut: "inclus",
                type_couverture: "Assurance assistance et rapatriement",
                description: "Couverture médicale d'urgence incluse dans le forfait séjour.",
                source: "Vendeur (document ou lien)"
            },
            annulation: {
                flexibilite: "Très flexible",
                conditions_detaillees: "Annulation sans frais jusqu'à 15 jours avant l'arrivée.",
                date_limite_annulation_gratuite: "J-15 avant le départ",
                source: "Vendeur (document ou lien)"
            },
            prix: {
                prix_total_annonce: 2390.0,
                devise: "EUR",
                nombre_personnes: 2,
                taxes_incluses: true,
                taxes_sejour_estimees: 30.80,
                frais_dossier: 0.0,
                supplements_connus: 0.0,
                prix_total_normalise: 2420.80,
                prix_par_personne: 1210.40,
                prix_par_personne_par_nuit: 172.91,
                source: "Vendeur (document ou lien)"
            },
            vendeur: {
                nom: "Sérénité Vacances Tourisme",
                site_web: "https://www.serenite-vacances-demo.fr",
                statut_juridique: "Immatriculation Atout France IM092140012",
                fiabilite_economique: "Garantie financière totale APST, bilans annuels certifiés conformes.",
                avis_vendeur_note: 4.8,
                avis_vendeur_volume: 410,
                avis_vendeur_source: "Vérification externe (Fédération des entreprises du voyage)",
                source: "Vérification indépendante"
            }
        },
        {
            id: "mallorca-villa",
            titre: "Échappée Sérénité Majorque - Finca de Charme & Demi-pension",
            source_origine_type: "demo",
            source_reference: "Site Web Agence Évasion Sud",
            date_depart: "10/06/2026",
            date_retour: "17/06/2026",
            duree_jours: 8,
            duree_nuits: 7,
            conforme_criteres: true,
            erreurs_conformite: [],
            nombre_prestations_incluses: 3,
            contient_hebergement: true,
            transport: {
                statut: "inclus",
                type_transport: "Vol",
                est_vol: true,
                vol_direct: false,
                compagnie_aerienne: "Vueling",
                compagnie_nommee_clairement: true,
                details: "Vol avec escale de 2h30 à Barcelone. Location de véhicule catégorie B incluse pour transferts.",
                source: "Vendeur (document ou lien)"
            },
            hebergement: {
                statut: "inclus",
                nom: "Finca Son Manera Agroturismo",
                type_hebergement: "Finca / Maison d'hôtes",
                adresse: "Montuïri, Centre de Majorque",
                standing: "Charme rural 4*",
                pertinence_emplacement: "Emplacement campagne très calme, mais éloigné des plages (35 minutes de route). Idéal pour le silence, moins adapté si baignade quotidienne souhaitée.",
                avis_verifie: true,
                avis_note: 4.4,
                avis_nombre: 180,
                avis_date_recents: "Avis été 2026",
                avis_source: "Vérification externe",
                source: "Vendeur (document ou lien)"
            },
            restauration: {
                statut: "inclus",
                formule: "Half Board",
                description: "Demi-pension (Petit déjeuner buffet et dîner terroir 3 plats inclus). Déjeuners à charge des voyageurs.",
                source: "Vendeur (document ou lien)"
            },
            activites: {
                statut: "en_supplement",
                description: "Piscine extérieure sur place. Massages et activités de bien-être en supplément sur réservation.",
                liste_activites: ["Piscine libre"],
                billets_inclus: false,
                source: "Vendeur (document ou lien)"
            },
            guide: {
                statut: "absent",
                qualification: "Sans guide",
                description: "Aucun accompagnement.",
                source: "Vendeur (document ou lien)"
            },
            assurance: {
                statut: "en_supplement",
                type_couverture: "Option payante",
                description: "Assurance non incluse par défaut.",
                source: "Vendeur (document ou lien)"
            },
            annulation: {
                flexibilite: "Modérée",
                conditions_detaillees: "Annulation sans frais jusqu'à 30 jours du départ. 50% retenus entre J-29 et J-15.",
                date_limite_annulation_gratuite: "J-30 avant départ",
                source: "Vendeur (document ou lien)"
            },
            prix: {
                prix_total_annonce: 2120.0,
                devise: "EUR",
                nombre_personnes: 2,
                taxes_incluses: true,
                taxes_sejour_estimees: 28.0,
                frais_dossier: 20.0,
                supplements_connus: 0.0,
                prix_total_normalise: 2168.0,
                prix_par_personne: 1084.0,
                prix_par_personne_par_nuit: 154.86,
                source: "Vendeur (document ou lien)"
            },
            vendeur: {
                nom: "Évasion Sud SARL",
                site_web: "https://www.evasion-sud-example.fr",
                statut_juridique: "Immatriculation Atout France IM013110055",
                fiabilite_economique: "Données économiques vérifiées au registre de Marseille, régulier.",
                avis_vendeur_note: 4.2,
                avis_vendeur_volume: 125,
                avis_vendeur_source: "Vérification externe",
                source: "Vérification indépendante"
            }
        }
    ],

    nature: [
        {
            id: "iceland-guided",
            titre: "Islande Sauvage & Grands Espaces - Circuit Lodges & 4x4 Guidé",
            source_origine_type: "demo",
            source_reference: "Catalogue Aventures Boréales",
            date_depart: "05/09/2026",
            date_retour: "12/09/2026",
            duree_jours: 8,
            duree_nuits: 7,
            conforme_criteres: true,
            erreurs_conformite: [],
            nombre_prestations_incluses: 6,
            contient_hebergement: true,
            transport: {
                statut: "inclus",
                type_transport: "Vol + Minibus 4x4",
                est_vol: true,
                vol_direct: true,
                compagnie_aerienne: "Icelandair",
                compagnie_nommee_clairement: true,
                details: "Vol direct Paris CDG - Keflavik + véhicule 4x4 aménagé tout-terrain avec carburant et chauffeur.",
                source: "Vendeur (document ou lien)"
            },
            hebergement: {
                statut: "inclus",
                nom: "Wilderness Lodges & Hôtels Nature 3*/4*",
                type_hebergement: "Ecolodges",
                adresse: "Cercle d'Or et Fjords du Sud, Islande",
                standing: "3/4 étoiles confort nature",
                pertinence_emplacement: "Excellente adéquation avec un voyage nature : hébergements situés en plein cœur des zones géothermiques et parcs nationaux, idéals pour aurores boréales et faune.",
                avis_verifie: true,
                avis_note: 4.8,
                avis_nombre: 310,
                avis_date_recents: "Avis certifiés 2026",
                avis_source: "Vérification externe",
                source: "Vendeur (document ou lien)"
            },
            restauration: {
                statut: "inclus",
                formule: "Full Board",
                description: "Pension complète adaptée aux randonnées (petits déjeuners nordiques, pique-niques de midi et dîners chauds locaux).",
                source: "Vendeur (document ou lien)"
            },
            activites: {
                statut: "inclus",
                description: "Randonnées sur glaciers avec crampons fournis, accès sources chaudes de Laugarvatn Fontana.",
                liste_activites: ["Marche sur glacier avec équipement de sécurité", "Observation faune et cascades", "Entrée bains géothermiques"],
                billets_inclus: true,
                source: "Vendeur (document ou lien)"
            },
            guide: {
                statut: "inclus",
                qualification: "Guide naturaliste et secouriste francophone certifié WFR",
                description: "Guide expert en géologie et sécurité polaire durant tout le séjour.",
                source: "Vendeur (document ou lien)"
            },
            assurance: {
                statut: "inclus",
                type_couverture: "Assurance assistance médicale et secours en milieu hostile incluse",
                description: "Couverture intégrale des frais de secours en montagne et rapatriement sanitaire.",
                source: "Vendeur (document ou lien)"
            },
            annulation: {
                flexibilite: "Très flexible",
                conditions_detaillees: "Annulation sans pénalité jusqu'à 30 jours avant départ.",
                date_limite_annulation_gratuite: "J-30",
                source: "Vendeur (document ou lien)"
            },
            prix: {
                prix_total_annonce: 3890.0,
                devise: "EUR",
                nombre_personnes: 2,
                taxes_incluses: true,
                taxes_sejour_estimees: 0.0,
                frais_dossier: 0.0,
                supplements_connus: 0.0,
                prix_total_normalise: 3890.0,
                prix_par_personne: 1945.0,
                prix_par_personne_par_nuit: 277.86,
                source: "Vendeur (document ou lien)"
            },
            vendeur: {
                nom: "Aventures Boréales SAS",
                site_web: "https://www.aventures-boreales-demo.fr",
                statut_juridique: "Atout France IM069150041, Adhérent ATR (Agir pour un Tourisme Responsable)",
                fiabilite_economique: "Garantie financière bancaire solide, 12 ans d'exercice continu.",
                avis_vendeur_note: 4.9,
                avis_vendeur_volume: 520,
                avis_vendeur_source: "Vérification externe (Avis vérifiés)",
                source: "Vérification indépendante"
            }
        },
        {
            id: "iceland-autotour",
            titre: "Autotour Islande en Liberté - Hôtels d'étape & Location citadine",
            source_origine_type: "demo",
            source_reference: "Offre en ligne Fly&Drive Nord",
            date_depart: "05/09/2026",
            date_retour: "12/09/2026",
            duree_jours: 8,
            duree_nuits: 7,
            conforme_criteres: true,
            erreurs_conformite: [],
            nombre_prestations_incluses: 3,
            contient_hebergement: true,
            transport: {
                statut: "inclus",
                type_transport: "Vol + Voiture 2RM",
                est_vol: true,
                vol_direct: false,
                compagnie_aerienne: "Non précisée",
                compagnie_nommee_clairement: false,
                details: "Vol avec escale à Copenhague. Véhicule 2 roues motrices (non autorisé sur les pistes F-roads). Carburant non inclus.",
                source: "Vendeur (document ou lien)"
            },
            hebergement: {
                statut: "inclus",
                nom: "Guesthouses & Hôtels 2*/3* le long de la Route 1",
                type_hebergement: "Guesthouses",
                adresse: "Diverses localités le long de la route circulaire",
                standing: "2/3 étoiles basique",
                pertinence_emplacement: "Hébergements le long de la route principale asphaltée. Accès limité aux réserves naturelles profondes nécessitant un franchissement de gués.",
                avis_verifie: false,
                avis_source: "Non vérifié (hébergements multiples non audités individuellement)",
                source: "Vendeur (document ou lien)"
            },
            restauration: {
                statut: "inclus",
                formule: "Bed and Breakfast",
                description: "Petits déjeuners inclus. Repas du midi et du soir libres (coût moyen en Islande : 35-50 € par repas et par personne).",
                source: "Vendeur (document ou lien)"
            },
            activites: {
                statut: "absent",
                description: "Aucune activité encadrée ni droit d'entrée inclus. Carnet de route fourni.",
                liste_activites: [],
                billets_inclus: false,
                source: "Vendeur (document ou lien)"
            },
            guide: {
                statut: "absent",
                qualification: "Aucun guide",
                description: "Autonomie totale sans assistance physique sur place.",
                source: "Vendeur (document ou lien)"
            },
            assurance: {
                statut: "en_supplement",
                type_couverture: "Option payante",
                description: "Assurance véhicule basique CDW (franchise élevée 2 500 € ; assurance graviers et sable en supplément).",
                source: "Vendeur (document ou lien)"
            },
            annulation: {
                flexibilite: "Stricte",
                conditions_detaillees: "Frais d'annulation : 50% à la réservation, 100% à moins de 30 jours.",
                date_limite_annulation_gratuite: "Aucune",
                source: "Vendeur (document ou lien)"
            },
            prix: {
                prix_total_annonce: 2650.0,
                devise: "EUR",
                nombre_personnes: 2,
                taxes_incluses: true,
                taxes_sejour_estimees: 18.0,
                frais_dossier: 30.0,
                supplements_connus: 0.0,
                prix_total_normalise: 2698.0,
                prix_par_personne: 1349.0,
                prix_par_personne_par_nuit: 192.71,
                source: "Vendeur (document ou lien)"
            },
            vendeur: {
                nom: "Nordic FlyDrive Direct",
                site_web: "https://www.nordic-flydrive-example.com",
                statut_juridique: "Non vérifié (plateforme étrangère)",
                fiabilite_economique: "Non vérifié (registres publics non interrogés)",
                fiabilite_explication: "Société immatriculée à l'étranger sans garantie financière française identifiée.",
                avis_vendeur_source: "Non vérifié",
                source: "Non vérifié (source externe inaccessible)"
            }
        }
    ],

    professionnel: [
        {
            id: "pro-lisbon-business",
            titre: "Déplacement Professionnel Lisbonne - Hôtel 4* Centre d'Affaires & Coworking",
            source_origine_type: "demo",
            source_reference: "Catalogue Corporate Travel Partners",
            date_depart: "12/11/2026",
            date_retour: "15/11/2026",
            duree_jours: 4,
            duree_nuits: 3,
            conforme_criteres: true,
            erreurs_conformite: [],
            nombre_prestations_incluses: 5,
            contient_hebergement: true,
            transport: {
                statut: "inclus",
                type_transport: "Vol",
                est_vol: true,
                vol_direct: true,
                compagnie_aerienne: "TAP Air Portugal",
                compagnie_nommee_clairement: true,
                details: "Vol direct régulier aux horaires adaptés aux rendez-vous professionnels (départ tôt le matin, retour en fin de soirée).",
                source: "Vendeur (document ou lien)"
            },
            hebergement: {
                statut: "inclus",
                nom: "Tivoli Avenida Liberdade Lisboa 5*",
                type_hebergement: "Hôtel d'affaires",
                adresse: "Avenida da Liberdade 185, Lisbonne",
                standing: "5 étoiles",
                pertinence_emplacement: "Emplacement fonctionnel et adapté aux déplacements professionnels : proximité immédiate des sièges d'entreprises, métro direct et centre de conférences.",
                avis_verifie: true,
                avis_note: 4.7,
                avis_nombre: 1100,
                avis_date_recents: "Avis certifiés 2026",
                avis_source: "Vérification externe",
                source: "Vendeur (document ou lien)"
            },
            restauration: {
                statut: "inclus",
                formule: "Bed and Breakfast",
                description: "Petit déjeuner d'affaires buffet inclus. Accès exécutif lounge avec boissons et snacks inclus en journée.",
                source: "Vendeur (document ou lien)"
            },
            activites: {
                statut: "inclus",
                description: "Accès salle de réunion équipée fibre optique (4h incluses) et espace coworking haut débit.",
                liste_activites: ["Salle de sous-commission équipée visio", "Pass transports urbains illimité"],
                billets_inclus: true,
                source: "Vendeur (document ou lien)"
            },
            guide: {
                statut: "absent",
                qualification: "Aucun",
                description: "Accueil aéroport et conciergerie 24/7.",
                source: "Vendeur (document ou lien)"
            },
            assurance: {
                statut: "inclus",
                type_couverture: "Assurance professionnelle mission corporate",
                description: "Couverture responsabilité civile, annulation pour motif professionnel et rapatriement.",
                source: "Vendeur (document ou lien)"
            },
            annulation: {
                flexibilite: "Très flexible",
                conditions_detaillees: "Modification et annulation sans pénalité jusqu'à 24h avant l'embarquement.",
                date_limite_annulation_gratuite: "J-1 (24h avant départ)",
                source: "Vendeur (document ou lien)"
            },
            prix: {
                prix_total_annonce: 1590.0,
                devise: "EUR",
                nombre_personnes: 1,
                taxes_incluses: true,
                taxes_sejour_estimees: 12.0,
                frais_dossier: 0.0,
                supplements_connus: 0.0,
                prix_total_normalise: 1602.0,
                prix_par_personne: 1602.0,
                prix_par_personne_par_nuit: 534.0,
                source: "Vendeur (document ou lien)"
            },
            vendeur: {
                nom: "Corporate Travel Partners SAS",
                site_web: "https://www.corporate-travel-demo.com",
                statut_juridique: "Immatriculation Atout France IM075180029",
                fiabilite_economique: "Agrément IATA vérifié, garantie financière solidaire APST.",
                avis_vendeur_note: 4.8,
                avis_vendeur_volume: 340,
                avis_vendeur_source: "Vérification externe",
                source: "Vérification indépendante"
            }
        },
        {
            id: "pro-lisbon-budget",
            titre: "Voyage Professionnel Lisbonne - Appart-Hôtel Expo & Vol Low-Cost",
            source_origine_type: "demo",
            source_reference: "Offre B2B TravelEasy",
            date_depart: "12/11/2026",
            date_retour: "15/11/2026",
            duree_jours: 4,
            duree_nuits: 3,
            conforme_criteres: true,
            erreurs_conformite: [],
            nombre_prestations_incluses: 2,
            contient_hebergement: true,
            transport: {
                statut: "inclus",
                type_transport: "Vol",
                est_vol: true,
                vol_direct: true,
                compagnie_aerienne: "EasyJet",
                compagnie_nommee_clairement: true,
                details: "Vol direct aux horaires fixes de mi-journée (perte d'une demi-journée de travail).",
                source: "Vendeur (document ou lien)"
            },
            hebergement: {
                statut: "inclus",
                nom: "Parque das Nações Business Suites 3*",
                type_hebergement: "Appart'hôtel",
                adresse: "Parque das Nações, Nord Lisbonne",
                standing: "3 étoiles",
                pertinence_emplacement: "Proche de la gare Oriente mais à 25 minutes du centre-ville historique et financier.",
                avis_verifie: true,
                avis_note: 3.9,
                avis_nombre: 220,
                avis_date_recents: "Avis 2026",
                avis_source: "Vérification externe",
                source: "Vendeur (document ou lien)"
            },
            restauration: {
                statut: "absent",
                formule: "Sans repas",
                description: "Sans petit déjeuner. Kitchenette dans la chambre.",
                source: "Vendeur (document ou lien)"
            },
            activites: {
                statut: "absent",
                description: "Aucun équipement de conférence ni espace de coworking inclus.",
                liste_activites: [],
                billets_inclus: false,
                source: "Vendeur (document ou lien)"
            },
            guide: {
                statut: "absent",
                qualification: "Aucun",
                description: "Non applicable.",
                source: "Vendeur (document ou lien)"
            },
            assurance: {
                statut: "absent",
                type_couverture: "Non incluse",
                description: "Aucune garantie d'assurance voyage incluse.",
                source: "Vendeur (document ou lien)"
            },
            annulation: {
                flexibilite: "Stricte",
                conditions_detaillees: "Billet d'avion non remboursable et logement soumis à 100% de frais dès J-7.",
                date_limite_annulation_gratuite: "Aucune",
                source: "Vendeur (document ou lien)"
            },
            prix: {
                prix_total_annonce: 980.0,
                devise: "EUR",
                nombre_personnes: 1,
                taxes_incluses: true,
                taxes_sejour_estimees: 12.0,
                frais_dossier: 25.0,
                supplements_connus: 0.0,
                prix_total_normalise: 1017.0,
                prix_par_personne: 1017.0,
                prix_par_personne_par_nuit: 339.0,
                source: "Vendeur (document ou lien)"
            },
            vendeur: {
                nom: "TravelEasy B2B Ltd",
                site_web: "https://www.traveleasy-b2b-demo.com",
                statut_juridique: "Non vérifié (courtier en ligne étranger)",
                fiabilite_economique: "Non vérifié (registres publics non interrogés)",
                fiabilite_explication: "Courtier sans bureau physique en France. Démarches de facturation et TVA intracommunautaire à clarifier.",
                avis_vendeur_source: "Non vérifié",
                source: "Non vérifié (source externe inaccessible)"
            }
        }
    ],

    sportif: [
        {
            id: "sport-chamonix-pro",
            titre: "Stage Trail & Sommets Alpins Chamonix - Chalet Confort & Guide de Haute Montagne",
            source_origine_type: "demo",
            source_reference: "Catalogue Montagne Passion Aventures",
            date_depart: "18/07/2026",
            date_retour: "24/07/2026",
            duree_jours: 7,
            duree_nuits: 6,
            conforme_criteres: true,
            erreurs_conformite: [],
            nombre_prestations_incluses: 6,
            contient_hebergement: true,
            transport: {
                statut: "inclus",
                type_transport: "Train TGV + Navette privée",
                est_vol: false,
                vol_direct: null,
                compagnie_aerienne: "SNCF",
                compagnie_nommee_clairement: true,
                details: "TGV direct Paris - Bellegarde/St-Gervais + navette privée avec remorque matériel jusqu'au chalet.",
                source: "Vendeur (document ou lien)"
            },
            hebergement: {
                statut: "inclus",
                nom: "Chalet Refuge du Mont-Blanc 4*",
                type_hebergement: "Chalet haut de gamme avec spa de récupération",
                adresse: "Les Praz, 74400 Chamonix-Mont-Blanc",
                standing: "4 étoiles",
                pertinence_emplacement: "Emplacement stratégique pour un séjour sportif : départ direct ou immédiat vers les sentiers du Tour du Mont-Blanc et téléphérique de la Flégère à 300 mètres.",
                avis_verifie: true,
                avis_note: 4.9,
                avis_nombre: 280,
                avis_date_recents: "Avis certifiés été 2026",
                avis_source: "Vérification externe (Label Montagne Confort)",
                source: "Vendeur (document ou lien)"
            },
            restauration: {
                statut: "inclus",
                formule: "Full Board",
                description: "Pension complète sportive : petits déjeuners énergétiques, ravitaillements de course et dîners diététiques équilibrés.",
                source: "Vendeur (document ou lien)"
            },
            activites: {
                statut: "inclus",
                description: "5 journées d'entraînement encadré, reconnaissance d'itinéraires techniques, ateliers foulée et préparation physique.",
                liste_activites: ["Sorties en dénivelé positif", "Atelier foulée montagnarde", "Accès spa et cryothérapie"],
                billets_inclus: true,
                source: "Vendeur (document ou lien)"
            },
            guide: {
                statut: "inclus",
                qualification: "Guide de Haute Montagne UIAGM et Moniteur Trail DE",
                description: "Encadrement en ratio réduit (1 professionnel pour 6 stagiaires maximum).",
                source: "Vendeur (document ou lien)"
            },
            assurance: {
                statut: "inclus",
                type_couverture: "Assurance secours en montagne et rapatriement spécifique sports extrêmes",
                description: "Prise en charge intégrale des frais de recherche et d'évacuation hélicoptère en montagne.",
                source: "Vendeur (document ou lien)"
            },
            annulation: {
                flexibilite: "Très flexible",
                conditions_detaillees: "Remboursement sans frais jusqu'à 21 jours avant départ ; report sans frais possible en cas de blessure certifiée par médecin du sport.",
                date_limite_annulation_gratuite: "J-21 (ou blessure sportive)",
                source: "Vendeur (document ou lien)"
            },
            prix: {
                prix_total_annonce: 2980.0,
                devise: "EUR",
                nombre_personnes: 2,
                taxes_incluses: true,
                taxes_sejour_estimees: 26.40,
                frais_dossier: 0.0,
                supplements_connus: 0.0,
                prix_total_normalise: 3006.40,
                prix_par_personne: 1503.20,
                prix_par_personne_par_nuit: 250.53,
                source: "Vendeur (document ou lien)"
            },
            vendeur: {
                nom: "Montagne Passion Expéditions",
                site_web: "https://www.montagne-passion-demo.fr",
                statut_juridique: "Immatriculation Atout France IM074160010, Compagnie des Guides partenaire",
                fiabilite_economique: "Garantie financière APST, agrément Jeunesse & Sports.",
                avis_vendeur_note: 4.9,
                avis_vendeur_volume: 410,
                avis_vendeur_source: "Vérification externe",
                source: "Vérification indépendante"
            }
        },
        {
            id: "sport-chamonix-autonome",
            titre: "Séjour Rando Liberté Chamonix - Résidence de Tourisme & Hébergement Seul",
            source_origine_type: "demo",
            source_reference: "Plateforme SportLoc",
            date_depart: "18/07/2026",
            date_retour: "24/07/2026",
            duree_jours: 7,
            duree_nuits: 6,
            conforme_criteres: true,
            erreurs_conformite: [],
            nombre_prestations_incluses: 2,
            contient_hebergement: true,
            transport: {
                statut: "absent",
                type_transport: "Sans transport",
                est_vol: false,
                vol_direct: null,
                compagnie_aerienne: "Non précisée",
                compagnie_nommee_clairement: false,
                details: "Acheminement à la charge complète du vacancier (voiture personnelle recommandée).",
                source: "Vendeur (document ou lien)"
            },
            hebergement: {
                statut: "inclus",
                nom: "Résidence Les Balcons de l'Arve 3*",
                type_hebergement: "Studio meublé",
                adresse: "Le Fayet / Saint-Gervais (à 22 km de Chamonix)",
                standing: "3 étoiles standard",
                pertinence_emplacement: "Emplacement en périphérie des spots sportifs majeurs : nécessite 30 minutes de trajet routier quotidien pour atteindre Chamonix et les départs de sentiers d'altitude.",
                avis_verifie: true,
                avis_note: 3.8,
                avis_nombre: 140,
                avis_date_recents: "Avis 2026",
                avis_source: "Vérification externe",
                source: "Vendeur (document ou lien)"
            },
            restauration: {
                statut: "absent",
                formule: "Sans repas",
                description: "Sans repas. Cuisine équipée dans le studio pour gestion autonome des repas.",
                source: "Vendeur (document ou lien)"
            },
            activites: {
                statut: "inclus",
                description: "Fourniture d'un topo-guide de randonnée et d'une carte IGN de la vallée de Chamonix à l'arrivée.",
                liste_activites: ["Topo-guide de randonnée pédestre", "Carte des itinéraires balisés"],
                billets_inclus: false,
                source: "Vendeur (document ou lien)"
            },
            guide: {
                statut: "absent",
                qualification: "Aucun guide",
                description: "Sans encadrement.",
                source: "Vendeur (document ou lien)"
            },
            assurance: {
                statut: "absent",
                type_couverture: "Aucune assurance",
                description: "Sans couverture secours en montagne (frais d'hélicoptère pouvant atteindre plusieurs milliers d'euros sans assurance spécialisée).",
                source: "Vendeur (document ou lien)"
            },
            annulation: {
                flexibilite: "Modérée",
                conditions_detaillees: "Frais : 25% à la réservation, 100% à moins de 14 jours.",
                date_limite_annulation_gratuite: "Aucune",
                source: "Vendeur (document ou lien)"
            },
            prix: {
                prix_total_annonce: 1450.0,
                devise: "EUR",
                nombre_personnes: 2,
                taxes_incluses: false,
                taxes_sejour_estimees: 18.0,
                frais_dossier: 20.0,
                supplements_connus: 0.0,
                prix_total_normalise: 1488.0,
                prix_par_personne: 744.0,
                prix_par_personne_par_nuit: 124.0,
                source: "Vendeur (document ou lien)"
            },
            vendeur: {
                nom: "LocaMontagne Web SAS",
                site_web: "https://www.locamontagne-example.com",
                statut_juridique: "Non vérifié",
                fiabilite_economique: "Non vérifié (plateforme d'intermédiation)",
                fiabilite_explication: "Portail d'annonces de meublés, responsabilité juridique limitée à la mise en relation.",
                avis_vendeur_source: "Non vérifié",
                source: "Non vérifié (source externe inaccessible)"
            }
        }
    ]
};

const SAMPLE_INVALID_OFFER = {
    id: "invalid-flight-only",
    titre: "Billet d'avion seul - Vol Paris / Rome A/R (Offre Non Conforme)",
    source_origine_type: "demo",
    source_reference: "Billet de transport sec",
    date_depart: "15/10/2026",
    date_retour: "19/10/2026",
    duree_jours: 5,
    duree_nuits: 4,
    conforme_criteres: false,
    erreurs_conformite: [
        "L'offre ne comprend aucun hébergement (critère obligatoire).",
        "L'offre ne comprend qu'une seule prestation identifiée. Le comparateur exige au minimum deux prestations."
    ],
    nombre_prestations_incluses: 1,
    contient_hebergement: false,
    transport: {
        statut: "inclus",
        type_transport: "Vol",
        est_vol: true,
        vol_direct: true,
        compagnie_aerienne: "Air France",
        compagnie_nommee_clairement: true,
        details: "Vol sec sans aucune prestation complémentaire.",
        source: "Vendeur (document ou lien)"
    },
    hebergement: {
        statut: "absent",
        nom: "Aucun hébergement",
        type_hebergement: "Aucun",
        adresse: "",
        standing: "",
        pertinence_emplacement: "Aucun hébergement réservé.",
        source: "Vendeur (document ou lien)"
    },
    restauration: {
        statut: "absent",
        formule: "Sans repas",
        description: "Sans restauration",
        source: "Vendeur (document ou lien)"
    },
    activites: {
        statut: "absent",
        description: "",
        liste_activites: [],
        source: "Vendeur (document ou lien)"
    },
    guide: {
        statut: "absent",
        qualification: "Aucun",
        description: "",
        source: "Vendeur (document ou lien)"
    },
    assurance: {
        statut: "absent",
        type_couverture: "",
        description: "",
        source: "Vendeur (document ou lien)"
    },
    annulation: {
        flexibilite: "Stricte",
        conditions_detaillees: "Billet non échangeable et non remboursable.",
        source: "Vendeur (document ou lien)"
    },
    prix: {
        prix_total_annonce: 380.0,
        devise: "EUR",
        nombre_personnes: 2,
        taxes_incluses: true,
        taxes_sejour_estimees: 0,
        frais_dossier: 0,
        supplements_connus: 0,
        prix_total_normalise: 380.0,
        prix_par_personne: 190.0,
        prix_par_personne_par_nuit: 47.5,
        source: "Vendeur (document ou lien)"
    },
    vendeur: {
        nom: "Compagnie Aérienne Directe",
        site_web: "",
        statut_juridique: "Non vérifié",
        fiabilite_economique: "Non vérifié",
        fiabilite_explication: "Vendeur direct sans prestations d'hébergement associées.",
        avis_vendeur_source: "Non vérifié",
        source: "Vendeur (document ou lien)"
    }
};
