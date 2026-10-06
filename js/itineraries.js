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

    // 4. Maroc (Villes Impériales & Désert)
    maroc: {
        id: "maroc",
        title: "Maroc : Villes Impériales & Grand Sud",
        center: [31.7917, -7.0926],
        zoom: 6,
        flightPath: null,
        steps: [
            {
                id: "marrakech",
                name: "Marrakech (Médina & Majorelle)",
                day: "J1-J2",
                coords: [31.6295, -7.9811],
                offer0: { title: "Circuit Impérial", desc: "Place Jemaa el-Fna, Palais Bahia et Jardins Majorelle.", hotel: "Riad ou Hôtel 4* Marrakech" },
                offer1: { title: "Circuit Découverte", desc: "Visite panoramique de Marrakech.", hotel: "Hôtel 3/4* Marrakech" }
            },
            {
                id: "ait_ben_haddou",
                name: "Ksar Aït-ben-Haddou & Ouarzazate",
                day: "J3-J4",
                coords: [31.0469, -7.1295],
                offer0: { title: "Circuit Impérial", desc: "Franchissement du col du Tichka et visite du Ksar classé UNESCO.", hotel: "Hôtel Berbère 4*" },
                offer1: { title: "Circuit Découverte", desc: "Arrêt photo Aït-ben-Haddou et studios de cinéma.", hotel: "Hôtel Ouarzazate" }
            },
            {
                id: "dromadaire_merzouga",
                name: "Dunes de Merzouga (Sahara)",
                day: "J5-J6",
                coords: [31.0991, -4.0117],
                offer0: { title: "Circuit Impérial", desc: "Bivouac de charme dans les dunes de l'Erg Chebbi et coucher de soleil.", hotel: "Campement Deluxe" },
                offer1: { title: "Circuit Découverte", desc: "Excursion vers les dunes et nuit en auberge.", hotel: "Auberge Merzouga" }
            },
            {
                id: "fes",
                name: "Fès (Capitale Spirituelle)",
                day: "J7-J8",
                coords: [34.0181, -5.0078],
                offer0: { title: "Circuit Impérial", desc: "Médina Fès el-Bali, tanneries Chouara et Medersa Attarine.", hotel: "Hôtel 4* Fès" },
                offer1: { title: "Circuit Découverte", desc: "Tour des remparts et visite guidée des souks.", hotel: "Hôtel 3* Fès" }
            }
        ]
    },

    // 5. Madère (L'Île aux Fleurs & Randonnées Levadas)
    madere: {
        id: "madere",
        title: "Madère : L'Île Émeraude & Falaises de l'Atlantique",
        center: [32.7607, -16.9595],
        zoom: 10,
        flightPath: null,
        steps: [
            {
                id: "funchal",
                name: "Funchal (Marché des Laboureurs & Monte)",
                day: "J1-J2",
                coords: [32.6500, -16.9089],
                offer0: { title: "Madère Émeraude", desc: "Jardin botanique, descente en traîneaux d'osier de Monte et marché.", hotel: "Hôtel 4* Funchal" },
                offer1: { title: "Madère Nature", desc: "Installation à Funchal et temps libre dans la vieille ville.", hotel: "Hôtel 3* Funchal" }
            },
            {
                id: "porto_moniz",
                name: "Porto Moniz & Piscines Naturelles",
                day: "J3-J4",
                coords: [32.8672, -17.1697],
                offer0: { title: "Madère Émeraude", desc: "Piscines de lave volcanique de Porto Moniz et plateau de Paul da Serra.", hotel: "Hôtel Côtier 4*" },
                offer1: { title: "Madère Nature", desc: "Baignade dans les piscines naturelles et panorama nord.", hotel: "Hôtel Nord" }
            },
            {
                id: "santana",
                name: "Santana & Levada do Caldeirão Verde",
                day: "J5-J6",
                coords: [32.8055, -16.8822],
                offer0: { title: "Madère Émeraude", desc: "Maisons typiques aux toits de chaume de Santana et rando levada.", hotel: "Pousada ou Hôtel 4*" },
                offer1: { title: "Madère Nature", desc: "Arrêt aux maisons traditionnelles de Santana.", hotel: "Hôtel Est" }
            },
            {
                id: "cabo_girao",
                name: "Cabo Girão (Plateforme de Verre)",
                day: "J7-J8",
                coords: [32.6506, -17.0050],
                offer0: { title: "Madère Émeraude", desc: "Vue vertigineuse depuis la 2e plus haute falaise d'Europe (580 m).", hotel: "Hôtel 4* Funchal" },
                offer1: { title: "Madère Nature", desc: "Passage au belvédère de Cabo Girão avant départ.", hotel: "Hôtel Funchal" }
            }
        ]
    },

    // 6. Norvège (Fjords de l'Ouest)
    norvege: {
        id: "norvege",
        title: "Norvège : Route Féérique des Fjords",
        center: [61.0, 7.0],
        zoom: 6,
        flightPath: null,
        steps: [
            {
                id: "oslo",
                name: "Oslo (Capitale & Parc Vigeland)",
                day: "J1-J2",
                coords: [59.9139, 10.7522],
                offer0: { title: "Fjords Panorama", desc: "Opéra d'Oslo, musée du Fram et sculptures de Vigeland.", hotel: "Clarion Hotel Oslo 4*" },
                offer1: { title: "Fjords Essentiel", desc: "Tour panoramique d'Oslo.", hotel: "Hôtel Oslo Périphérie" }
            },
            {
                id: "flam",
                name: "Flåm & Nærøyfjord (UNESCO)",
                day: "J3-J4",
                coords: [60.8608, 7.1133],
                offer0: { title: "Fjords Panorama", desc: "Train panoramique Flåmsbana et croisière sur le Nærøyfjord.", hotel: "Fretheim Hotel Flåm" },
                offer1: { title: "Fjords Essentiel", desc: "Traversée du fjord en ferry régulier.", hotel: "Hôtel Fjord" }
            },
            {
                id: "bergen",
                name: "Bergen (Quartier Hanséatique de Bryggen)",
                day: "J5-J6",
                coords: [60.3913, 5.3221],
                offer0: { title: "Fjords Panorama", desc: "Maisons de bois de Bryggen, marché aux poissons et funiculaire Fløibanen.", hotel: "Thon Hotel Rosenkrantz Bergen" },
                offer1: { title: "Fjords Essentiel", desc: "Découverte de Bryggen en autonomie.", hotel: "Hôtel 3* Bergen" }
            }
        ]
    },

    // 7. Japon (Honshu : Tokyo, Kyoto, Osaka)
    japon: {
        id: "japon",
        title: "Japon : Cités Millénaires & Mégalopoles du Futur",
        center: [35.2, 137.0],
        zoom: 6,
        flightPath: null,
        steps: [
            {
                id: "tokyo",
                name: "Tokyo (Shibuya, Asakusa & Shinjuku)",
                day: "J1-J4",
                coords: [35.6762, 139.6503],
                offer0: { title: "Trésors du Japon", desc: "Temple Senso-ji, carrefour de Shibuya, quartier électrique Akihabara.", hotel: "Hôtel 4* Shinjuku" },
                offer1: { title: "Japon Découverte", desc: "Visite guidée d'Asakusa et journée libre.", hotel: "Hôtel 3* Tokyo" }
            },
            {
                id: "kyoto",
                name: "Kyoto (Kinkaku-ji & Fushimi Inari)",
                day: "J5-J8",
                coords: [35.0116, 135.7681],
                offer0: { title: "Trésors du Japon", desc: "Pavillon d'Or Kinkaku-ji, forêt de bambous d'Arashiyama, sanctuaire aux 10 000 torii Fushimi Inari.", hotel: "Kyoto Century Hotel 4*" },
                offer1: { title: "Japon Découverte", desc: "Balade à Gion et visite du Pavillon d'Or.", hotel: "Hôtel 3* Kyoto" }
            },
            {
                id: "nara_osaka",
                name: "Nara & Osaka (Dotonbori)",
                day: "J9-J11",
                coords: [34.6937, 135.5023],
                offer0: { title: "Trésors du Japon", desc: "Cerfs sacrés de Nara, Grand Bouddha Todai-ji et street food à Osaka.", hotel: "Cross Hotel Osaka 4*" },
                offer1: { title: "Japon Découverte", desc: "Excursion à Nara et temps libre à Dotonbori.", hotel: "Hôtel Osaka" }
            }
        ]
    },

    // 8. Costa Rica (Biodiversité & Volcans)
    costa_rica: {
        id: "costa_rica",
        title: "Costa Rica : Volcans & Sanctuaires Sauvages",
        center: [10.0, -84.2],
        zoom: 7,
        flightPath: null,
        steps: [
            {
                id: "san_jose",
                name: "San José (Vallée Centrale)",
                day: "J1-J2",
                coords: [9.9281, -84.0907],
                offer0: { title: "Costa Rica Puravida", desc: "Accueil à San José et briefing expédition nature.", hotel: "Hôtel Grano de Oro" },
                offer1: { title: "Costa Rica Éco", desc: "Nuitée San José.", hotel: "Hôtel 3* San José" }
            },
            {
                id: "tortuguero",
                name: "Tortuguero (Amazonie des Caraïbes)",
                day: "J3-J4",
                coords: [10.5419, -83.5186],
                offer0: { title: "Costa Rica Puravida", desc: "Navigation en bateau dans les canaux, observation des paresseux, toucans et caïmans.", hotel: "Pachira Lodge" },
                offer1: { title: "Costa Rica Éco", desc: "Excursion canaux en barque motorisée.", hotel: "Tortuguero Eco-Lodge" }
            },
            {
                id: "arenal",
                name: "Volcan Arenal & Sources Chaudes",
                day: "J5-J7",
                coords: [10.4631, -84.7032],
                offer0: { title: "Costa Rica Puravida", desc: "Randonnée sur les coulées de lave, ponts suspendus dans la canopée et thermes naturels Tabacón.", hotel: "Arenal Springs Resort" },
                offer1: { title: "Costa Rica Éco", desc: "Vue sur le volcan Arenal et entrée thermes éco.", hotel: "Hôtel La Fortuna" }
            },
            {
                id: "manuel_antonio",
                name: "Parc National Manuel Antonio (Pacifique)",
                day: "J8-J10",
                coords: [9.3925, -84.1378],
                offer0: { title: "Costa Rica Puravida", desc: "Plages immaculées du Pacifique, singes capucins et baignade.", hotel: "Parador Nature Resort" },
                offer1: { title: "Costa Rica Éco", desc: "Journée libre au parc de Manuel Antonio.", hotel: "Hôtel 3* Manuel Antonio" }
            }
        ]
    }
};

/**
 * Détecte intelligemment l'itinéraire pertinent à partir des offres analysées
 * Priorité 1 : Champ structuré destination_pays / destination_region
 * Priorité 2 : Analyse du titre et du nom de fichier
 * Priorité 3 : Corpus textuel global
 */
function detectMatchingItinerary(offers) {
    if (!offers || offers.length === 0) return ITINERARIES_DATABASE.south_africa;

    // Priorité 1 : Vérification des métadonnées explicites de destination sur chaque offre
    for (const off of offers) {
        const p = (off.destination_pays || '').toLowerCase();
        const r = (off.destination_region || '').toLowerCase();
        if (p.includes('afrique du sud') || r.includes('cap') || r.includes('mpumalanga')) return ITINERARIES_DATABASE.south_africa;
        if (p.includes('maroc')) return ITINERARIES_DATABASE.maroc;
        if (p.includes('portugal') || p.includes('madère') || p.includes('madere')) return ITINERARIES_DATABASE.madere;
        if (p.includes('espagne') || p.includes('andalousie')) return ITINERARIES_DATABASE.andalousie;
        if (p.includes('italie') || p.includes('rome')) return ITINERARIES_DATABASE.rome;
        if (p.includes('norvège') || p.includes('norvege')) return ITINERARIES_DATABASE.norvege;
        if (p.includes('japon')) return ITINERARIES_DATABASE.japon;
        if (p.includes('costa rica')) return ITINERARIES_DATABASE.costa_rica;
    }

    // Priorité 2 : Analyse combinée des titres et références de fichiers
    const titlesAndRefs = offers.map(o => `${o.titre || ''} ${o.source_reference || ''} ${o.circuit_nom || ''}`).join(' ').toLowerCase();
    if (titlesAndRefs.includes('afrique du sud') || titlesAndRefs.includes('za25') || titlesAndRefs.includes('jnb') || titlesAndRefs.includes('cpt') || titlesAndRefs.includes('kruger')) {
        return ITINERARIES_DATABASE.south_africa;
    }
    if (titlesAndRefs.includes('maroc') || titlesAndRefs.includes('marrakech') || titlesAndRefs.includes('fès') || titlesAndRefs.includes('fes')) {
        return ITINERARIES_DATABASE.maroc;
    }
    if (titlesAndRefs.includes('madère') || titlesAndRefs.includes('madere') || titlesAndRefs.includes('funchal')) {
        return ITINERARIES_DATABASE.madere;
    }
    if (titlesAndRefs.includes('andalousie') || titlesAndRefs.includes('séville') || titlesAndRefs.includes('seville') || titlesAndRefs.includes('grenade')) {
        return ITINERARIES_DATABASE.andalousie;
    }
    if (titlesAndRefs.includes('rome') || titlesAndRefs.includes('roma') || titlesAndRefs.includes('vatican')) {
        return ITINERARIES_DATABASE.rome;
    }
    if (titlesAndRefs.includes('norvège') || titlesAndRefs.includes('norvege') || titlesAndRefs.includes('oslo') || titlesAndRefs.includes('bergen')) {
        return ITINERARIES_DATABASE.norvege;
    }
    if (titlesAndRefs.includes('japon') || titlesAndRefs.includes('tokyo') || titlesAndRefs.includes('kyoto')) {
        return ITINERARIES_DATABASE.japon;
    }
    if (titlesAndRefs.includes('costa rica') || titlesAndRefs.includes('arenal')) {
        return ITINERARIES_DATABASE.costa_rica;
    }

    // Priorité 3 : Corpus textuel global étendu
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

    if (fullCorpus.includes('afrique du sud') || fullCorpus.includes('kruger') || fullCorpus.includes('cape town') || fullCorpus.includes('le cap') || fullCorpus.includes('johannesburg') || fullCorpus.includes('pretoria') || fullCorpus.includes('blyde') || fullCorpus.includes('eswatini') || fullCorpus.includes('swaziland') || fullCorpus.includes('hluhluwe')) {
        return ITINERARIES_DATABASE.south_africa;
    }
    if (fullCorpus.includes('maroc') || fullCorpus.includes('marrakech') || fullCorpus.includes('ouarzazate') || fullCorpus.includes('merzouga')) {
        return ITINERARIES_DATABASE.maroc;
    }
    if (fullCorpus.includes('madère') || fullCorpus.includes('madere') || fullCorpus.includes('funchal') || fullCorpus.includes('porto moniz')) {
        return ITINERARIES_DATABASE.madere;
    }
    if (fullCorpus.includes('andalousie') || fullCorpus.includes('séville') || fullCorpus.includes('seville') || fullCorpus.includes('grenade') || fullCorpus.includes('cordoue') || fullCorpus.includes('malaga')) {
        return ITINERARIES_DATABASE.andalousie;
    }
    if (fullCorpus.includes('rome') || fullCorpus.includes('roma') || fullCorpus.includes('vatican') || fullCorpus.includes('colisée')) {
        return ITINERARIES_DATABASE.rome;
    }
    if (fullCorpus.includes('norvège') || fullCorpus.includes('norvege') || fullCorpus.includes('oslo') || fullCorpus.includes('bergen') || fullCorpus.includes('flåm')) {
        return ITINERARIES_DATABASE.norvege;
    }
    if (fullCorpus.includes('japon') || fullCorpus.includes('tokyo') || fullCorpus.includes('kyoto') || fullCorpus.includes('osaka')) {
        return ITINERARIES_DATABASE.japon;
    }
    if (fullCorpus.includes('costa rica') || fullCorpus.includes('arenal') || fullCorpus.includes('tortuguero')) {
        return ITINERARIES_DATABASE.costa_rica;
    }

    // Par défaut
    return ITINERARIES_DATABASE.south_africa;
}
