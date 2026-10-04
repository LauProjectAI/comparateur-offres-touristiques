// Module de cartographie des circuits et étapes géographiques
// Supporte l'Afrique du Sud, l'Andalousie, Rome, Madère, le Maroc et les circuits personnalisés

const ITINERARIES_DATABASE = {
    // 1. Afrique du Sud (13J/10N - De Johannesburg au Cap)
    south_africa: {
        id: "south_africa",
        title: "Afrique du Sud : Grande Traversée de Johannesburg au Cap",
        center: [-29.0, 24.5],
        zoom: 5,
        flightPath: [
            [-29.6144, 31.1197], // Durban KSIA
            [-33.9648, 18.6017]  // Cape Town International Airport
        ],
        steps: [
            {
                id: "jnb_soweto",
                name: "Johannesburg & Soweto",
                day: "J1-J2",
                coords: [-26.2041, 28.0473],
                offer0: {
                    title: "Charmes Afrique du Sud",
                    desc: "Arrivée vol régulier Emirates. Visite guidée de Soweto (maison Mandela, mémorial Hector Pieterson). Route vers Pretoria.",
                    hotel: "RH Hotel Pretoria"
                },
                offer1: {
                    title: "Destination Aventure",
                    desc: "Vol Lyon / Johannesburg. Accueil et visite de Soweto, puis transfert vers Pretoria (~150 km).",
                    hotel: "ANEW The Capital"
                }
            },
            {
                id: "pretoria",
                name: "Pretoria (Capitale Jacaranda)",
                day: "J2-J3",
                coords: [-25.7479, 28.2293],
                offer0: {
                    title: "Charmes Afrique du Sud",
                    desc: "Union Buildings, Church Square, Paul Kruger House. Arrêt au village culturel Ndebele Corn and Cob.",
                    hotel: "RH Hotel Pretoria"
                },
                offer1: {
                    title: "Destination Aventure",
                    desc: "Tour d'orientation de Pretoria et départ vers la province du Mpumalanga (~360 km).",
                    hotel: "ANEW The Capital"
                }
            },
            {
                id: "blyde",
                name: "Blyde River Canyon & Pilgrim's Rest",
                day: "J3-J4",
                coords: [-24.5833, 30.8167],
                offer0: {
                    title: "Charmes Afrique du Sud",
                    desc: "Panorama Route : faille de God's Window, marmites de géants Bourke's Luck Potholes, village orpaillage Pilgrim's Rest.",
                    hotel: "Royal Hotel ou Floreat Riverside"
                },
                offer1: {
                    title: "Destination Aventure",
                    desc: "Découverte des Three Rondavels et du canyon de la Blyde River. Déjeuner au restaurant Blydepoort (~230 km).",
                    hotel: "Floreat Riverside Lodge"
                }
            },
            {
                id: "kruger",
                name: "Parc National Kruger (Safari Big 5)",
                day: "J4-J5",
                coords: [-25.3319, 31.0116],
                offer0: {
                    title: "Charmes Afrique du Sud",
                    desc: "Journée complète de safari en véhicule 4x4 découvert avec ranger et guide traducteur. Observation des Big 5.",
                    hotel: "ANEW Resort White River"
                },
                offer1: {
                    title: "Destination Aventure",
                    desc: "Journée entière de safari 4x4 dans le parc national Kruger avec déjeuner en restcamp.",
                    hotel: "ANEW Resort White River ou Nkambeni Safari Camp"
                }
            },
            {
                id: "eswatini",
                name: "Royaume d'Eswatini (Swaziland)",
                day: "J6",
                coords: [-25.9667, 31.2500],
                offer0: {
                    title: "Charmes Afrique du Sud",
                    desc: "Passage frontière, danses traditionnelles Matsamo, traversée des crêtes montagneuses, artisanat swazi (bougies, verrerie).",
                    hotel: "Piggs Peak Hotel"
                },
                offer1: {
                    title: "Destination Aventure",
                    desc: "Entrée en Eswatini, marché artisanal de Piggs Peak et vallée d'Ezulwini (~270 km).",
                    hotel: "Piggs Peak Hotel"
                }
            },
            {
                id: "hluhluwe",
                name: "Région de Hluhluwe (Terre Zouloue)",
                day: "J7",
                coords: [-28.0167, 32.2833],
                offer0: {
                    title: "Charmes Afrique du Sud",
                    desc: "Retour en Afrique du Sud. Safari 4x4 dans la plus ancienne réserve d'Afrique, sanctuaire des rhinocéros blancs et noirs.",
                    hotel: "Ezulwini Game Lodge ou Anew Hluhluwe"
                },
                offer1: {
                    title: "Destination Aventure",
                    desc: "Safari 4x4 en réserve animalière (Hluhluwe ou réserve privée Zulu Nyala) (~260 km).",
                    hotel: "Zulu Nyala Heritage Hotel ou Anew Hluhluwe"
                }
            },
            {
                id: "durban",
                name: "Durban & Vol Intérieur pour Le Cap",
                day: "J8",
                coords: [-29.8587, 31.0218],
                offer0: {
                    title: "Charmes Afrique du Sud",
                    desc: "Transfert aéroport King Shaka de Durban. Vol intérieur régulier à destination du Cap (Cape Town).",
                    hotel: "Cape Town Hotel"
                },
                offer1: {
                    title: "Destination Aventure",
                    desc: "Route vers Durban (~300 km) et formalités d'enregistrement sur le vol intérieur pour Le Cap.",
                    hotel: "Hôtel Cape Town"
                }
            },
            {
                id: "cape_town",
                name: "Le Cap (Cape Town & Bo-Kaap)",
                day: "J8-J9",
                coords: [-33.9249, 18.4241],
                offer0: {
                    title: "Charmes Afrique du Sud",
                    desc: "Tour panoramique de la Ville Mère : quartier malais coloré de Bo-Kaap, Company Gardens, front de mer V&A Waterfront.",
                    hotel: "Cape Town Hotel"
                },
                offer1: {
                    title: "Destination Aventure",
                    desc: "Arrivée et découverte du Cap, centre historique, Parlement et vue panoramique depuis Signal Hill.",
                    hotel: "Hôtel Cape Town"
                }
            },
            {
                id: "robben_island",
                name: "Robben Island (Prison de Nelson Mandela)",
                day: "J9",
                coords: [-33.8076, 18.3712],
                offer0: {
                    title: "Charmes Afrique du Sud",
                    desc: "Traversée maritime en ferry et visite guidée émouvante de l'ancienne prison de haute sécurité par un ex-prisonnier politique.",
                    hotel: "Cape Town Hotel"
                },
                offer1: {
                    title: "Destination Aventure",
                    desc: "Excursion à Robben Island (selon conditions météo maritimes) ou visite alternative au Cap.",
                    hotel: "Hôtel Cape Town"
                }
            },
            {
                id: "peninsule",
                name: "Péninsule du Cap & Bonne Espérance",
                day: "J10",
                coords: [-34.3568, 18.4967],
                offer0: {
                    title: "Charmes Afrique du Sud",
                    desc: "Port de Hout Bay (île aux otaries), corniche de Chapman's Peak, pointe mythique du Cap de Bonne Espérance, manchots de Boulders Beach.",
                    hotel: "Cape Town Hotel"
                },
                offer1: {
                    title: "Destination Aventure",
                    desc: "Excursion journée complète le long de la péninsule jusqu'à la Réserve du Cap de Bonne Espérance (~150 km).",
                    hotel: "Hôtel Cape Town"
                }
            },
            {
                id: "vignobles",
                name: "Route des Vins (Stellenbosch)",
                day: "J11",
                coords: [-33.9321, 18.8602],
                offer0: {
                    title: "Charmes Afrique du Sud",
                    desc: "Au cœur des vallées viticoles : bourg historique de Stellenbosch, village de Franschhoek, dégustation de vins et fromages réputés.",
                    hotel: "Cape Town Hotel"
                },
                offer1: {
                    title: "Destination Aventure",
                    desc: "Visite d'une propriété viticole sud-africaine avec dégustation des crus locaux. Retour vers Le Cap.",
                    hotel: "Hôtel Cape Town"
                }
            }
        ]
    },

    // 2. Andalousie
    andalousie: {
        id: "andalousie",
        title: "Andalousie : Circuit des Joyaux Mauresques",
        center: [37.2, -4.8],
        zoom: 7,
        flightPath: null,
        steps: [
            {
                id: "seville",
                name: "Séville (Alcazar & Giralda)",
                day: "J1-J3",
                coords: [37.3891, -5.9845],
                offer0: { title: "Circuit Culturel", desc: "Visite de la Cathédrale, Giralda, quartier Santa Cruz et Palais de l'Alcazar.", hotel: "Hôtel 4* Centre Séville" },
                offer1: { title: "Circuit Découverte", desc: "Arrivée et découverte libre de la Place d'Espagne et bords du Guadalquivir.", hotel: "Hôtel 3* Périphérie" }
            },
            {
                id: "cordoue",
                name: "Cordoue (Mosquée-Cathédrale)",
                day: "J4",
                coords: [37.8882, -4.7794],
                offer0: { title: "Circuit Culturel", desc: "Mezquita de Cordoue avec coupe-file et ruelles de la Juderia.", hotel: "Hôtel 4* Cordoue" },
                offer1: { title: "Circuit Découverte", desc: "Halte à Cordoue sur le trajet vers Grenade.", hotel: "Hôtel étape" }
            },
            {
                id: "grenade",
                name: "Grenade (Alhambra & Généralife)",
                day: "J5-J6",
                coords: [37.1773, -3.5986],
                offer0: { title: "Circuit Culturel", desc: "Billets nominatifs officiels garantis pour les Palais Nasrides de l'Alhambra.", hotel: "Hôtel 4* Grenade" },
                offer1: { title: "Circuit Découverte", desc: "Visite du quartier de l'Albaicin (Alhambra selon disponibilités).", hotel: "Hôtel 3* Grenade" }
            },
            {
                id: "ronda",
                name: "Ronda (Pont Neuf & Gorges)",
                day: "J7",
                coords: [36.7462, -5.1612],
                offer0: { title: "Circuit Culturel", desc: "Spectaculaire pont neuf enjambant le ravin du Tajo et arènes historiques.", hotel: "Parador ou Hôtel 4*" },
                offer1: { title: "Circuit Découverte", desc: "Arrêt photo à Ronda puis descente sur la côte.", hotel: "Hôtel côte" }
            },
            {
                id: "malaga",
                name: "Malaga (Costa del Sol)",
                day: "J8",
                coords: [36.7213, -4.4214],
                offer0: { title: "Circuit Culturel", desc: "Théâtre romain, forteresse Alcazaba et musée Picasso. Vol retour.", hotel: "Hôtel 4* Malaga" },
                offer1: { title: "Circuit Découverte", desc: "Transfert à l'aéroport de Malaga pour vol retour.", hotel: "Hôtel Malaga" }
            }
        ]
    },

    // 3. Rome
    rome: {
        id: "rome",
        title: "Rome : Cœur Historique vs Périphérie",
        center: [41.895, 12.45],
        zoom: 12,
        flightPath: null,
        steps: [
            {
                id: "centre_quirinale",
                name: "Rome Antique & Fontaine de Trevi",
                day: "J1-J2",
                coords: [41.9009, 12.4890],
                offer0: { title: "Rome Prestige", desc: "Hôtel Quirinale Roma 4* à 10 min à pied de la Fontaine de Trevi.", hotel: "Hôtel Quirinale Roma 4*" },
                offer1: { title: "Rome Éco", desc: "Hébergement excentré nécessitant 45 min de transport quotidien.", hotel: "Hôtel Roma Aurelia Park 3* (Périphérie)" }
            },
            {
                id: "vatican",
                name: "Vatican & Chapelle Sixtine",
                day: "J2",
                coords: [41.9029, 12.4534],
                offer0: { title: "Rome Prestige", desc: "Coupe-file et guide conférencier officiel inclus pour les musées du Vatican.", hotel: "Hôtel Quirinale 4*" },
                offer1: { title: "Rome Éco", desc: "Accès libre sans billet ni guide inclus (réservation individuelle à prévoir).", hotel: "Hôtel Aurelia Park" }
            },
            {
                id: "colisee",
                name: "Colisée & Forum Romain",
                day: "J3",
                coords: [41.8902, 12.4922],
                offer0: { title: "Rome Prestige", desc: "Pass coupe-file prioritaire et visite archéologique du Forum Romain.", hotel: "Hôtel Quirinale 4*" },
                offer1: { title: "Rome Éco", desc: "Extérieur du Colisée en autonomie.", hotel: "Hôtel Aurelia Park" }
            },
            {
                id: "trastevere",
                name: "Quartier Bohème du Trastevere",
                day: "J4",
                coords: [41.8887, 12.4697],
                offer0: { title: "Rome Prestige", desc: "Balade guidée nocturne et dîner trattoria typique.", hotel: "Hôtel Quirinale 4*" },
                offer1: { title: "Rome Éco", desc: "Soirée libre.", hotel: "Hôtel Aurelia Park" }
            }
        ]
    }
};

/**
 * Détecte intelligemment l'itinéraire pertinent à partir des offres analysées
 */
function detectMatchingItinerary(offers) {
    if (!offers || offers.length === 0) return ITINERARIES_DATABASE.south_africa;

    const fullCorpus = offers.map(o => {
        return [
            o.titre,
            o.source_reference,
            o.hebergement?.nom,
            o.hebergement?.adresse,
            o.transport?.details,
            o.activites?.description
        ].join(' ');
    }).join(' ').toLowerCase();

    // 1. Afrique du Sud
    if (
        fullCorpus.includes('afrique du sud') ||
        fullCorpus.includes('kruger') ||
        fullCorpus.includes('cape town') ||
        fullCorpus.includes('le cap') ||
        fullCorpus.includes('johannesburg') ||
        fullCorpus.includes('pretoria') ||
        fullCorpus.includes('blyde') ||
        fullCorpus.includes('eswatini') ||
        fullCorpus.includes('swaziland') ||
        fullCorpus.includes('hluhluwe')
    ) {
        return ITINERARIES_DATABASE.south_africa;
    }

    // 2. Andalousie
    if (
        fullCorpus.includes('andalousie') ||
        fullCorpus.includes('séville') ||
        fullCorpus.includes('seville') ||
        fullCorpus.includes('grenade') ||
        fullCorpus.includes('cordoue') ||
        fullCorpus.includes('malaga')
    ) {
        return ITINERARIES_DATABASE.andalousie;
    }

    // 3. Rome
    if (
        fullCorpus.includes('rome') ||
        fullCorpus.includes('roma') ||
        fullCorpus.includes('vatican') ||
        fullCorpus.includes('colisée')
    ) {
        return ITINERARIES_DATABASE.rome;
    }

    // Par défaut
    return ITINERARIES_DATABASE.south_africa;
}
