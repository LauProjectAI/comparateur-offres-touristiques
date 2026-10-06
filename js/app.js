// Application Comparateur d'Offres Touristiques - Version Autonome pour GitHub Pages
// Fonctionne 100% dans le navigateur de l'utilisateur sans aucun serveur backend requis

document.addEventListener('alpine:init', () => {
    Alpine.data('comparatorApp', () => ({
        // État de l'application
        step: 1, // 1: Choix du type, 2: Gestion des offres, 3: Rapport & Synthèse
        travelType: 'culturel',
        offers: [],
        comparisonResult: null,
        loading: false,
        errorMessage: '',
        successMessage: '',
        
        // Modal & saisie
        urlInput: '',
        uploading: false,
        uploadProgressText: '',
        isDragging: false,
        activeTabOfferIndex: 0,
        
        // Cartographie interactive des circuits
        itineraryData: null,
        mapInstance: null,
        mapFeatureGroup: null,
        mapFilter: 'all', // 'all', 'offer0', 'offer1'
        selectedStepId: null,

        // Base de comparaison pour les voyages de groupe (ex: CSE, B2B)
        globalBaseComparison: 20, // 20 par défaut (ou 30, 40)
        
        // Système d'apprentissage actif & mémorisation des règles d'extraction
        learnedRules: [],
        showTeachModal: false,
        showRulesModal: false,
        teachState: {
            offer: null,
            fieldKey: 'taxes_aeroport',
            fieldLabel: "Taxes aéroport (€/pers)",
            currentVal: '',
            documentText: '',
            searchQuery: '',
            selectedText: '',
            triggerKeyword: '',
            extractedVal: '',
            statusExplanation: '',
            candidateLines: []
        },
        
        // Pondérations transparentes du score
        weights: {
            poids_prix: 25,
            poids_hebergement: 25,
            poids_annulation: 15,
            poids_prestations: 20,
            poids_fiabilite: 15
        },

        // Types de voyage disponibles avec descriptif
        travelTypes: [
            {
                id: 'culturel',
                title: 'Culturel',
                icon: 'landmark',
                desc: 'Centres historiques, musées, visites guidées et coupe-files.',
                badge: 'Priorité : Centralité hébergement & guide'
            },
            {
                id: 'detente',
                title: 'Détente',
                icon: 'palmtree',
                desc: 'Repos, plages, spas, bien-être et restauration complète.',
                badge: 'Priorité : Cadre calme, All-inclusive & Annulation'
            },
            {
                id: 'nature',
                title: 'Nature',
                icon: 'mountain',
                desc: 'Grands espaces, parcs nationaux, randonnées et écolodges.',
                badge: 'Priorité : Proximité sentiers & assistance secours'
            },
            {
                id: 'professionnel',
                title: 'Professionnel',
                icon: 'briefcase',
                desc: 'Séminaires, congrès, rendez-vous d\'affaires et connectivité.',
                badge: 'Priorité : Vols directs & flexibilité d\'annulation'
            },
            {
                id: 'sportif',
                title: 'Sportif',
                icon: 'activity',
                desc: 'Stages outdoor, sports d\'hiver, glisse et entraînement.',
                badge: 'Priorité : Accès spots, encadrement & assurance'
            }
        ],

        init() {
            // Chargement des règles d'apprentissage acquises
            this.loadLearnedRules();
            // Initialisation avec les exemples culturels par défaut
            this.loadSampleOffers('culturel', false);
        },

        // Sélection du type de voyage
        selectTravelType(typeId) {
            this.travelType = typeId;
            this.step = 2;
            this.loadSampleOffers(typeId, false);
        },

        // Chargement des offres d'exemple depuis la base JS
        loadSampleOffers(typeId = null, goToStep2 = true) {
            const targetType = typeId || this.travelType;
            this.loading = true;
            this.errorMessage = '';
            
            try {
                const samples = SAMPLE_OFFERS_DATABASE[targetType];
                if (samples && samples.length >= 2) {
                    // Copie profonde pour éviter de modifier l'original
                    this.offers = JSON.parse(JSON.stringify(samples));
                    this.activeTabOfferIndex = 0;
                    this.validateAllOffers();
                    this.successMessage = `Échantillons pour voyage ${targetType.toUpperCase()} chargés.`;
                    setTimeout(() => this.successMessage = '', 4000);
                    if (goToStep2) this.step = 2;
                } else {
                    this.errorMessage = "Type de voyage inconnu.";
                }
            } catch (err) {
                this.errorMessage = "Erreur chargement : " + err.message;
            } finally {
                this.loading = false;
            }
        },

        // Ajout d'une offre non conforme pour démonstration du contrôle obligatoire
        loadSampleInvalidOffer() {
            this.offers.push(JSON.parse(JSON.stringify(SAMPLE_INVALID_OFFER)));
            this.activeTabOfferIndex = this.offers.length - 1;
            this.validateAllOffers();
            this.successMessage = "Offre non conforme (vol sec seul sans hébergement) ajoutée pour tester la détection de règle.";
            setTimeout(() => this.successMessage = '', 5000);
        },

        // Ajout d'une offre manuelle vierge
        addManualOffer() {
            const newIndex = this.offers.length + 1;
            const newOffer = {
                id: `offre-manuelle-${Date.now()}`,
                titre: `Nouvelle offre ${newIndex}`,
                source_origine_type: 'manuel',
                source_reference: 'Saisie manuelle',
                date_depart: '',
                date_retour: '',
                duree_jours: 7,
                duree_nuits: 6,
                conforme_criteres: true,
                erreurs_conformite: [],
                nombre_prestations_incluses: 4,
                contient_hebergement: true,
                transport: {
                    statut: 'inclus',
                    type_transport: 'Vol',
                    est_vol: true,
                    vol_direct: true,
                    compagnie_aerienne: 'Air France',
                    compagnie_nommee_clairement: true,
                    details: 'Vol direct',
                    source: 'Vendeur (document ou lien)'
                },
                hebergement: {
                    statut: 'inclus',
                    nom: 'Hôtel Confort 4*',
                    type_hebergement: 'Hôtel',
                    adresse: 'Centre-ville',
                    standing: '4 étoiles',
                    pertinence_emplacement: 'À vérifier',
                    avis_verifie: false,
                    avis_note: null,
                    avis_nombre: null,
                    avis_source: 'Non vérifié (aucun service externe d\'avis connecté)',
                    source: 'Vendeur (document ou lien)'
                },
                restauration: {
                    statut: 'inclus',
                    formule: 'Bed and Breakfast',
                    description: 'Petits déjeuners inclus',
                    source: 'Vendeur (document ou lien)'
                },
                activites: {
                    statut: 'inclus',
                    description: 'Visites mentionnées',
                    liste_activites: [],
                    billets_inclus: false,
                    source: 'Vendeur (document ou lien)'
                },
                guide: {
                    statut: 'non_precise',
                    qualification: 'Non précisé',
                    description: '',
                    source: 'Vendeur (document ou lien)'
                },
                assurance: {
                    statut: 'non_precise',
                    type_couverture: 'Non précisé',
                    description: '',
                    source: 'Vendeur (document ou lien)'
                },
                annulation: {
                    flexibilite: 'Modérée',
                    conditions_detaillees: 'Annulation standard',
                    date_limite_annulation_gratuite: '',
                    source: 'Vendeur (document ou lien)'
                },
                prix: {
                    prix_total_annonce: 1500,
                    devise: 'EUR',
                    nombre_personnes: 2,
                    taxes_incluses: true,
                    taxes_sejour_estimees: 20,
                    frais_dossier: 0,
                    supplements_connus: 0,
                    taxes_aeroport: 0,
                    taxes_aeroport_par_personne: 0,
                    taxes_aeroport_statut: 'non_applicable',
                    prix_ht: 1500,
                    prix_ht_par_personne: 750,
                    prix_total_normalise: 1520,
                    prix_par_personne: 760,
                    prix_par_personne_par_nuit: 126.67,
                    source: 'Vendeur (document ou lien)'
                },
                vendeur: {
                    nom: 'Agence de voyage',
                    site_web: '',
                    statut_juridique: 'Non vérifié',
                    fiabilite_economique: 'Non vérifié',
                    fiabilite_explication: "L'absence d'information publique dans l'offre est neutre : vérification externe à effectuer sur Infogreffe / Atout France.",
                    avis_vendeur_source: 'Non vérifié',
                    source: 'Non vérifié (source externe inaccessible)'
                },
                points_forts: [],
                points_faibles: [],
                points_a_clarifier: []
            };
            this.offers.push(newOffer);
            this.activeTabOfferIndex = this.offers.length - 1;
            this.validateAllOffers();
        },

        // Suppression d'une offre
        removeOffer(index) {
            if (this.offers.length <= 1) {
                alert("Vous devez conserver au minimum une offre.");
                return;
            }
            this.offers.splice(index, 1);
            if (this.activeTabOfferIndex >= this.offers.length) {
                this.activeTabOfferIndex = Math.max(0, this.offers.length - 1);
            }
            this.validateAllOffers();
        },

        // Gestion du glisser-déposer de fichiers
        handleFileDrop(event) {
            this.isDragging = false;
            const dt = event.dataTransfer;
            if (dt && dt.files && dt.files.length > 0) {
                this.processFile(dt.files[0]);
            }
        },

        // Sélection de fichier via l'explorateur
        handleFileUpload(event) {
            const file = event.target.files && event.target.files[0];
            if (file) {
                this.processFile(file);
            }
            event.target.value = '';
        },

        // Traitement centralisé sécurisé d'un fichier (PDF, Word, Excel)
        async processFile(file) {
            if (!file) return;

            this.loading = true;
            this.uploading = true;
            this.uploadProgressText = 'Lecture du document...';
            this.errorMessage = '';

            const filename = file.name;
            const ext = filename.split('.').pop().toLowerCase();

            try {
                let extractedText = '';

                if (ext === 'pdf') {
                    this.uploadProgressText = 'Extraction PDF...';
                    extractedText = await this.extractTextFromPDF(file);
                } else if (ext === 'docx' || ext === 'doc') {
                    this.uploadProgressText = 'Extraction Word DOCX...';
                    extractedText = await this.extractTextFromDOCX(file);
                } else if (ext === 'xlsx' || ext === 'xls') {
                    this.uploadProgressText = 'Extraction Excel...';
                    extractedText = await this.extractTextFromXLSX(file);
                } else {
                    throw new Error(`Format .${ext} non supporté. Veuillez choisir un fichier PDF, Word (.docx) ou Excel (.xlsx).`);
                }

                if (!extractedText || !extractedText.trim()) {
                    throw new Error("Aucun texte exploitable n'a pu être extrait du document.");
                }

                this.uploadProgressText = 'Structuration des informations...';
                // Parser et structurer les données extraites
                const newOffer = this.parseOfferText(extractedText, `file-${Date.now()}`, ext, filename);
                this.offers.push(newOffer);
                this.activeTabOfferIndex = this.offers.length - 1;
                this.validateAllOffers();
                this.successMessage = `Fichier « ${filename} » extrait et analysé avec succès !`;
                setTimeout(() => this.successMessage = '', 6000);

            } catch (err) {
                console.error("Erreur lecture fichier:", err);
                this.errorMessage = "Échec de lecture du fichier : " + err.message;
            } finally {
                this.loading = false;
                this.uploading = false;
                this.uploadProgressText = '';
            }
        },

        // Extraction PDF via pdf.js
        async extractTextFromPDF(file) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n';
            }
            return fullText;
        },

        // Extraction DOCX rapide et résiliente (JSZip prioritaire + Mammoth en secours)
        async extractTextFromDOCX(file) {
            const arrayBuffer = await file.arrayBuffer();

            // 1. Décompression ultra-rapide par JSZip (extrait word/document.xml en ignorant les gros médias)
            if (typeof JSZip !== 'undefined') {
                try {
                    const zip = await JSZip.loadAsync(arrayBuffer);
                    const docXmlFile = zip.file("word/document.xml");
                    if (docXmlFile) {
                        const xmlText = await docXmlFile.async("string");
                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(xmlText, "application/xml");
                        
                        const paragraphs = xmlDoc.getElementsByTagName("w:p");
                        const lines = [];
                        for (let i = 0; i < paragraphs.length; i++) {
                            const p = paragraphs[i];
                            const textNodes = p.getElementsByTagName("w:t");
                            let pText = "";
                            for (let j = 0; j < textNodes.length; j++) {
                                pText += textNodes[j].textContent;
                            }
                            if (pText.trim().length > 0) {
                                lines.push(pText.trim());
                            }
                        }
                        if (lines.length > 0) {
                            return lines.join("\n");
                        }
                    }
                } catch (zipErr) {
                    console.warn("Extraction JSZip échouée, essai avec Mammoth :", zipErr);
                }
            }

            // 2. Décompression via Mammoth (si JSZip indisponible ou archive complexe)
            if (typeof mammoth !== 'undefined' && mammoth.extractRawText) {
                try {
                    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                    if (result && result.value && result.value.trim().length > 0) {
                        return result.value;
                    }
                } catch (mErr) {
                    console.warn("Extraction Mammoth échouée :", mErr);
                }
            }

            throw new Error("Impossible de lire le document Word (.docx). Assurez-vous qu'il ne soit pas endommagé ou protégé.");
        },

        // Extraction XLSX via SheetJS
        async extractTextFromXLSX(file) {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            let fullText = '';
            workbook.SheetNames.forEach(sheetName => {
                const sheet = workbook.Sheets[sheetName];
                fullText += XLSX.utils.sheet_to_txt(sheet) + '\n';
            });
            return fullText;
        },

        // Base de connaissances géographique pour identification prioritaire du Pays, Région et Circuit
        destinationsKB: [
            {
                pays: "Afrique du Sud",
                region: "Mpumalanga / Cap",
                circuit_default: "De Johannesburg au Cap",
                keywords: ["afrique du sud", "south africa", "johannesburg", "jnb", "cape town", "cpt", "kruger", "pretoria", "blyde", "eswatini", "swaziland", "hluhluwe", "robben island", "stellenbosch", "durban", "zululand", "zoulou", "pilgrim", "soweto"],
                codes: ["za", "jnb", "cpt", "dur", "za25", "za26"]
            },
            {
                pays: "Espagne",
                region: "Andalousie",
                circuit_default: "Joyaux Mauresques & Séville",
                keywords: ["andalousie", "andalucia", "séville", "seville", "grenade", "granada", "cordoue", "cordoba", "malaga", "ronda", "alhambra", "giralda"],
                codes: ["es", "svq", "agp", "grx"]
            },
            {
                pays: "Italie",
                region: "Latium / Rome",
                circuit_default: "Rome Antique & Vatican",
                keywords: ["rome", "roma", "vatican", "colisée", "colosseo", "latium", "lazio", "trastevere"],
                codes: ["it", "fco", "cia"]
            },
            {
                pays: "Maroc",
                region: "Villes Impériales & Sud",
                circuit_default: "Villes Impériales & Dunes du Sahara",
                keywords: ["maroc", "morocco", "marrakech", "fès", "fes", "ouarzazate", "merzouga", "rabat", "meknès", "meknes", "casablanca", "erg chebbi", "aït ben haddou"],
                codes: ["ma", "rak", "fez", "cmn"]
            },
            {
                pays: "Portugal",
                region: "Madère",
                circuit_default: "L'Île aux Fleurs & Levadas",
                keywords: ["madère", "madere", "madeira", "funchal", "porto moniz", "santana", "cabo girao", "levada"],
                codes: ["pt", "fnc", "lis", "opo"]
            },
            {
                pays: "Costa Rica",
                region: "Parcs & Volcans",
                circuit_default: "Sanctuaires de la Biodiversité",
                keywords: ["costa rica", "san josé", "san jose", "arenal", "monteverde", "tortuguero", "manuel antonio"],
                codes: ["cr", "sjo"]
            },
            {
                pays: "Norvège",
                region: "Fjords de l'Ouest",
                circuit_default: "Route des Fjords & Cascades",
                keywords: ["norvège", "norvege", "norway", "oslo", "flåm", "flam", "bergen", "geiranger", "sognefjord"],
                codes: ["no", "osl", "bgo"]
            },
            {
                pays: "Japon",
                region: "Honshu",
                circuit_default: "Trésors Traditionnels & Tokyo",
                keywords: ["japon", "japan", "tokyo", "kyoto", "osaka", "nara", "hiroshima", "fuji"],
                codes: ["jp", "hnd", "nrt", "kix"]
            }
        ],

        // Détection prioritaire du pays, de la région et du circuit
        detectDestinationClient(sourceRef, rawText, title) {
            const filenameClean = (sourceRef || '').toLowerCase().replace(/[\._\-]+/g, ' ');
            const titleClean = (title || '').toLowerCase();
            const firstLines = rawText.split('\n').slice(0, 8).map(l => l.trim().toLowerCase()).join(' ');

            // Priorité 1 : Nom du fichier
            for (const dest of this.destinationsKB) {
                if (dest.keywords.some(kw => filenameClean.includes(kw))) {
                    let circuit = dest.circuit_default;
                    const mRoute = filenameClean.match(/de\s+([a-z\s]{3,20})\s+[àa]\s+([a-z\s]{3,20})/i);
                    if (mRoute) circuit = `De ${mRoute[1].trim()} à ${mRoute[2].trim()}`;
                    return { pays: dest.pays, region: dest.region, circuit: circuit };
                }
                for (const code of dest.codes) {
                    const reg = new RegExp(`\\b${code}\\b|\\b${code}\\d+`, 'i');
                    if (reg.test(filenameClean)) {
                        let circuit = dest.circuit_default;
                        const mRoute = filenameClean.match(/de\s+([a-z\s]{3,20})\s+[àa]\s+([a-z\s]{3,20})/i);
                        if (mRoute) circuit = `De ${mRoute[1].trim()} à ${mRoute[2].trim()}`;
                        return { pays: dest.pays, region: dest.region, circuit: circuit };
                    }
                }
            }

            // Priorité 2 : Titre du document et 5 premières lignes
            const topContext = `${titleClean} ${firstLines}`;
            for (const dest of this.destinationsKB) {
                if (dest.keywords.some(kw => topContext.includes(kw))) {
                    let circuit = dest.circuit_default;
                    const mCirc = topContext.match(/circuit\s+(?:de\s+)?([^\n\r\|\.]{4,60}?)(?:au\s+départ|\d+j|\n|$)/i);
                    if (mCirc) circuit = mCirc[1].trim();
                    return { pays: dest.pays, region: dest.region, circuit: circuit };
                }
            }

            // Priorité 3 : Analyse globale du texte
            const lowerFull = rawText.toLowerCase();
            let bestMatch = null;
            let bestScore = 0;
            for (const dest of this.destinationsKB) {
                const score = dest.keywords.reduce((acc, kw) => acc + (lowerFull.split(kw).length - 1), 0);
                if (score > bestScore && score >= 2) {
                    bestScore = score;
                    bestMatch = dest;
                }
            }
            if (bestMatch) {
                return { pays: bestMatch.pays, region: bestMatch.region, circuit: bestMatch.circuit_default };
            }

            return { pays: "Destination Internationale", region: "Circuit Découverte", circuit: "Circuit Découverte" };
        },

        // Détection fine de la tarification par groupe ("Base 20", "Base 30", "Base 40" et suppléments)
        extractBasePricingClient(rawText, rawLines) {
            const basePrices = {};
            const supplements = {};
            let taxesAeroPers = 0;

            // Détection des taxes d'aéroport
            const regexTaxes = [
                /taxes\s+(?:d['’]\s*|d\s+)?a[eé]roport[a-z]*(?:[^\n\d€]{0,50}?)(?:à|de|:)?\s*(\d+[\s\.,]?\d*)\s*(?:€|EUR)/i,
                /taxes\s+a[eé]riennes?(?:[^\n\d€]{0,50}?)(?:à|de|:)?\s*(\d+[\s\.,]?\d*)\s*(?:€|EUR)/i,
                /dont\s+(\d+[\s\.,]?\d*)\s*(?:€|EUR)\s+de\s+taxes\s+(?:d['’]\s*)?a[eé]ro/i
            ];
            for (const rx of regexTaxes) {
                const mTax = rawText.match(rx);
                if (mTax) {
                    const valT = parseFloat(mTax[1].replace(/[^\d,\.]/g, '').replace(',', '.'));
                    if (valT >= 15 && valT <= 1500) {
                        taxesAeroPers = valT;
                        break;
                    }
                }
            }

            // 1. Analyse des tableaux et grilles tarifaires
            for (const line of rawLines) {
                if (line.includes('|')) {
                    const parts = line.split('|').map(p => p.trim());
                    for (let pIdx = 0; pIdx < parts.length; pIdx++) {
                        const cell = parts[pIdx];
                        const mBase = cell.match(/base\s*(\d{2})/i);
                        if (mBase) {
                            const bNum = parseInt(mBase[1]);
                            if (pIdx + 1 < parts.length) {
                                const mPr = parts[pIdx + 1].match(/(\d+[\s\.,]?\d*)\s*(?:€|EUR)/i);
                                if (mPr) {
                                    const pVal = parseFloat(mPr[1].replace(/[^\d,\.]/g, '').replace(',', '.'));
                                    if (pVal >= 300 && pVal <= 50000) basePrices[bNum] = pVal;
                                }
                            }
                        }
                    }
                }
                const mBaseLine = line.match(/base\s*(\d{2})(?:\s*participants?|\s*personnes?)?\s*[:\-\|]?\s*(\d+[\s\.,]?\d*)\s*(?:€|EUR)/i);
                if (mBaseLine) {
                    const bNum = parseInt(mBaseLine[1]);
                    const pVal = parseFloat(mBaseLine[2].replace(/[^\d,\.]/g, '').replace(',', '.'));
                    if (pVal >= 300 && pVal <= 50000) basePrices[bNum] = pVal;
                }
            }

            // 2. Détection des suppléments de base (ex: "Supplément base 20/24 : + 215 €")
            const rxSupp = /suppl[eé]ment\s+base\s*(\d{2})(?:\/\d{2})?(?:\s*participants?)?\s*[:\-]?\s*\+?\s*(\d+[\s\.,]?\d*)\s*(?:€|EUR)/gi;
            let mSupp;
            while ((mSupp = rxSupp.exec(rawText)) !== null) {
                const bNum = parseInt(mSupp[1]);
                const sVal = parseFloat(mSupp[2].replace(/[^\d,\.]/g, '').replace(',', '.'));
                if (sVal > 0 && sVal < 3000) supplements[bNum] = sVal;
            }

            // 3. Calcul du prix Base 20 si basé sur Base 40 + supplément
            if (!basePrices[20]) {
                if (basePrices[40] && supplements[20]) {
                    basePrices[20] = basePrices[40] + supplements[20];
                } else if (basePrices[30] && supplements[20]) {
                    basePrices[20] = basePrices[30] + supplements[20];
                }
            }

            // 4. Déterminer la base retenue
            let baseRetenue = 20;
            let prixParPers = 0;
            if (basePrices[20]) {
                baseRetenue = 20;
                prixParPers = basePrices[20];
            } else if (Object.keys(basePrices).length > 0) {
                const sortedBases = Object.keys(basePrices).map(Number).sort((a,b) => a - b);
                baseRetenue = sortedBases[0];
                prixParPers = basePrices[baseRetenue];
            }

            return {
                base_retenue: baseRetenue,
                prix_par_personne: prixParPers,
                base_disponibles: basePrices,
                supplements: supplements,
                taxes_aeroport_pers: taxesAeroPers
            };
        },

        // Parser textuel intelligent avec priorisation sémantique
        parseOfferText(rawText, offerId, sourceType, sourceRef) {
            const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 3);
            const lower = rawText.toLowerCase();

            // 1. Titre
            const titre = lines[0] ? lines[0].substring(0, 80) : `Offre extraite (${sourceRef})`;

            // 1.bis. Reconnaissance prioritaire du Pays, de la Région et du Circuit
            const destInfo = this.detectDestinationClient(sourceRef, rawText, titre);

            // 2. Vendeur
            let vendeurNom = 'Organisateur non identifié';
            const mVendeur = rawText.match(/(?:organisé par|vendu par|agence|voyagiste|tour-opérateur)\s*[:\-]?\s*([A-Za-z0-9\s\-&]{3,35})/i);
            if (mVendeur) {
                vendeurNom = mVendeur[1].trim();
            }

            // 3. Durée (jours et nuits)
            let jours = 7, nuits = 6;
            const mJours = rawText.match(/(\d+)\s*(?:jours|j)\b/i);
            const mNuits = rawText.match(/(\d+)\s*(?:nuits?|n)\b/i);
            if (mJours) jours = parseInt(mJours[1]);
            if (mNuits) nuits = parseInt(mNuits[1]);
            else if (jours > 1) nuits = jours - 1;

            // 4. Nombre de personnes
            let nbPersonnes = 2;
            const mPers = rawText.match(/(?:pour|devis\s+pour|groupe\s+de)\s+(\d+)\s*(?:personnes?|voyageurs?|adultes?|pax)/i);
            if (mPers) {
                const nb = parseInt(mPers[1]);
                if (nb >= 1 && nb <= 100) nbPersonnes = nb;
            }

            // 5. Prix et devises avec détection prioritaire par groupe "Base 20" (ou 30, 40)
            const rawLines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            const groupPricing = this.extractBasePricingClient(rawText, rawLines);
            let prixTotal = 0;
            let isPricePerPerson = false;

            if (groupPricing.prix_par_personne > 0) {
                prixTotal = groupPricing.prix_par_personne;
                isPricePerPerson = true;
            }

            // Stratégie 1 : Tableaux structurés ou lignes avec délimiteur |
            for (let i = 0; i < rawLines.length; i++) {
                const line = rawLines[i];
                if (line.includes('|') && /(?:prix|tarif|montant)/i.test(line)) {
                    const headers = line.split('|').map(c => c.trim());
                    for (let offset = 1; offset <= 3; offset++) {
                        if (i + offset < rawLines.length && rawLines[i + offset].includes('|')) {
                            const vals = rawLines[i + offset].split('|').map(c => c.trim());
                            for (let colIdx = 0; colIdx < headers.length; colIdx++) {
                                const hLow = headers[colIdx].toLowerCase();
                                if (/(?:prix|tarif|montant)/i.test(hLow) && !/(?:supplément|supplement|single|individuelle)/i.test(hLow)) {
                                    if (colIdx < vals.length) {
                                        const cellVal = vals[colIdx];
                                        const mC = cellVal.match(/(\d+[\s\.,]?\d*)\s*(?:€|EUR|euros)/i);
                                        if (mC) {
                                            const valT = parseFloat(mC[1].replace(/[^\d,\.]/g, '').replace(',', '.'));
                                            if (valT >= 150 && valT <= 50000) {
                                                prixTotal = valT;
                                                if (/(?:par personne|p\/p|par pax|en double|double|adulte)/i.test(hLow)) {
                                                    isPricePerPerson = true;
                                                }
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                            if (prixTotal > 0) break;
                        }
                    }
                }
                if (prixTotal > 0) break;
            }

            // Stratégie 2 : Libellé explicite sur la même ligne (ex: "Prix net TTC par personne : 2 655 €", "Prix total : 1950 €")
            if (prixTotal === 0) {
                const mExplicitPrice = rawText.match(/(?:prix(?:\s+net)?(?:\s+ttc|\s+ht)?(?:\s+pour\s+\d+\s+personnes?)?(?:\s+par\s+personne|\s+p\/p)?(?:\s+en\s+chambre\s+double)?|tarif(?:\s+par\s+personne)?|montant\s+total)\s*[:\-]?\s*(\d+[\s\.,]?\d*)\s*(?:€|EUR|euros)/i);
                if (mExplicitPrice) {
                    const cleanP = mExplicitPrice[1].replace(/[^\d,\.]/g, '').replace(',', '.');
                    const val = parseFloat(cleanP);
                    if (val >= 150 && val <= 50000) {
                        prixTotal = val;
                        if (/par\s*personne|en\s*chambre\s*double|\/pers|\/pax|p\/p/i.test(mExplicitPrice[0])) {
                            isPricePerPerson = true;
                        }
                    }
                }
            }

            // Stratégie 3 : Détection multi-lignes (en-tête "Prix par personne" suivi à quelques lignes par le montant)
            if (prixTotal === 0) {
                for (let idx = 0; idx < rawLines.length; idx++) {
                    const rLine = rawLines[idx];
                    if (/^(?:prix|tarif)\s*(?:par\s*personne|p\/p|en\s*double|ttc)?/i.test(rLine) && !/(?:suppl[eé]ment|chambre\s+individuelle|boisson)/i.test(rLine)) {
                        for (let offset = 1; offset <= 5; offset++) {
                            if (idx + offset < rawLines.length) {
                                const nextL = rawLines[idx + offset];
                                if (/suppl[eé]ment|single|individuelle|\+/i.test(nextL)) continue;
                                const mP = nextL.match(/(\d+[\s\.,]?\d*)\s*(?:€|EUR|euros)/i);
                                if (mP) {
                                    const v = parseFloat(mP[1].replace(/[^\d,\.]/g, '').replace(',', '.'));
                                    if (v >= 300 && v <= 50000) {
                                        prixTotal = v;
                                        if (/par\s*personne|en\s*double|p\/p|pax/i.test(rLine)) {
                                            isPricePerPerson = true;
                                        }
                                        break;
                                    }
                                }
                            }
                        }
                        if (prixTotal > 0) break;
                    }
                }
            }

            // Stratégie 4 : Scan des montants globaux en éliminant les suppléments (+ 340 €, + 330 €, pourboires...)
            if (prixTotal === 0) {
                const regexScan = /(\d+[\s\.,]?\d*)\s*(?:€|EUR|euros)/gi;
                let match;
                const candidats = [];
                while ((match = regexScan.exec(rawText)) !== null) {
                    const pVal = parseFloat(match[1].replace(/[^\d,\.]/g, '').replace(',', '.'));
                    if (pVal >= 200 && pVal <= 35000) {
                        const startCtx = Math.max(0, match.index - 30);
                        const ctx = rawText.substring(startCtx, match.index + match[0].length).toLowerCase();
                        if (!/\+\s*|suppl[eé]ment|r[eé]duction|taxe|pourboire|frais/i.test(ctx)) {
                            candidats.push({ val: pVal, idx: match.index });
                        }
                    }
                }
                if (candidats.length > 0) {
                    const grands = candidats.filter(c => c.val >= 500);
                    const chosen = grands.length > 0 ? grands[0] : candidats[candidats.length - 1];
                    prixTotal = chosen.val;
                    const around = rawText.substring(Math.max(0, chosen.idx - 150), Math.min(rawText.length, chosen.idx + 150)).toLowerCase();
                    if (/par\s*personne|en\s*double|p\/p|par\s*pax|chambre\s*double/i.test(around)) {
                        isPricePerPerson = true;
                    }
                }
            }

            if (prixTotal === 0) prixTotal = 1500;

            // Si le prix extrait était expressément par personne, calculer le total pour le dossier
            if (isPricePerPerson && prixTotal > 0) {
                prixTotal = Math.round(prixTotal * nbPersonnes);
            }

            // 6. Dates (numériques ou textuelles en français)
            let dateDep = '';
            let dateRet = '';
            const mDateText = rawText.match(/du\s+(\d{1,2})\s*(?:er)?\s*(?:au|à)\s*(\d{1,2})\s+([a-zéû]+)\s+(\d{4})/i);
            if (mDateText) {
                const months = {
                    'janvier': '01', 'fevrier': '02', 'février': '02', 'mars': '03', 'avril': '04',
                    'mai': '05', 'juin': '06', 'juillet': '07', 'aout': '08', 'août': '08',
                    'septembre': '09', 'octobre': '10', 'novembre': '11', 'decembre': '12', 'décembre': '12'
                };
                const j1 = String(parseInt(mDateText[1])).padStart(2, '0');
                const j2 = String(parseInt(mDateText[2])).padStart(2, '0');
                const mNum = months[mDateText[3].toLowerCase()] || '01';
                const annee = mDateText[4];
                dateDep = `${j1}/${mNum}/${annee}`;
                dateRet = `${j2}/${mNum}/${annee}`;
            } else {
                const mDates = rawText.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/g);
                if (mDates && mDates.length >= 1) dateDep = mDates[0];
                if (mDates && mDates.length >= 2) dateRet = mDates[1];
            }

            // 7. Transport / Vol
            let estVol = lower.includes('vol') || lower.includes('avion') || lower.includes('aérien');
            let volDirect = (lower.includes('avec escale') || lower.includes('escales') || lower.includes('correspondance')) ? false : ((lower.includes('vol direct') || lower.includes('sans escale')) ? true : null);
            let compagnie = 'Non précisée';
            let compagnieNommee = false;
            const airlines = [
                'Air France', 'Lufthansa', 'Iberia', 'TAP Air Portugal', 'Transavia', 'EasyJet',
                'Ryanair', 'Emirates', 'Icelandair', 'Qatar Airways', 'KLM', 'British Airways',
                'Turkish Airlines', 'Swiss', 'Volotea', 'Vueling'
            ];
            for (const cie of airlines) {
                if (lower.includes(cie.toLowerCase())) {
                    compagnie = cie;
                    compagnieNommee = true;
                    break;
                }
            }
            let detailsVol = estVol ? (volDirect === true ? `Vol direct confirmé (${compagnie})` : (volDirect === false ? `Vol avec escale(s) (${compagnie})` : (compagnieNommee ? `Vol ${compagnie}` : 'Vol standard'))) : 'Transport terrestre / Autocar';

            // 8. Hébergement & standing
            let standing = 'Standard 3/4 étoiles';
            if (lower.includes('1ère catégorie') || lower.includes('1ere categorie')) standing = '1ère catégorie (Standard 3/4*)';
            else if (lower.includes('5 étoiles') || lower.includes('5*') || lower.includes('luxe')) standing = '5 étoiles / Luxe';
            else if (lower.includes('4 étoiles') || lower.includes('4*')) standing = '4 étoiles';
            else if (lower.includes('3 étoiles') || lower.includes('3*')) standing = '3 étoiles';

            let nomHeb = 'Hôtel ou hébergements mentionnés dans le dossier';
            const mSecHotels = rawText.match(/(?:H[OÔ]TELS?\s+OU\s+SIMILAIRES?|LISTE\s+DE(?:S|\s+VOS)\s+H[OÔ]TELS?|VOS\s+H[OÔ]TELS?|H[EÉ]BERGEMENT)[\s\S]{1,1500}?(?=\n\s*[A-Z\s]{4,}:|\n\s*CE PRIX|\n\s*CHARMES|\n\s*TARIFS?|\n\s*CONDITIONS?|\n\s*IMPORTANT|$)/i);
            if (mSecHotels) {
                const secLines = mSecHotels[0].split('\n').map(l => l.trim()).filter(l => l.length > 5 && !/(?:donn[eé]s?\s+[aà]\s+titre|hotels?\s+ou|liste\s+de)/i.test(l));
                const cleanHotels = [];
                for (const hl of secLines) {
                    const cleanHl = hl.replace(/\s+/g, ' ').trim();
                    if (cleanHl.length > 5 && cleanHl.length < 100) {
                        if (!/^(?:\(|\*|-|il n|chaque|si l|veuillez)/i.test(cleanHl)) {
                            if (!/disponibilit|proposition|alternative|tarifaire|accord/i.test(cleanHl)) {
                                cleanHotels.push(cleanHl);
                            }
                        }
                    }
                }
                if (cleanHotels.length > 0) {
                    nomHeb = cleanHotels.slice(0, 4).join(' / ');
                }
            } else {
                const mHotel = rawText.match(/(?:hôtel|hotel|resort|lodge|riad|finca)\s+([A-Za-z0-9\s'\-]{3,30})/i);
                if (mHotel) nomHeb = mHotel[0].trim();
            }

            // 9. Restauration
            let formule = 'Bed and Breakfast';
            if (lower.includes('all inclusive') || lower.includes('tout compris') || lower.includes('tout inclus')) formule = 'All Inclusive';
            else if (lower.includes('pension complète') || lower.includes('full board') || lower.includes('pension complete')) formule = 'Full Board';
            else if (lower.includes('demi-pension') || lower.includes('half board')) formule = 'Half Board';
            else if (lower.includes('sans repas')) formule = 'Sans repas';
            let descRepas = `Formule ${formule}`;
            if (formule === 'Full Board') {
                if (/boissons?\s+inclus|forfait\s+boissons?\s*:\s*1\s*(?:bi[eè]re|verre|soft)/i.test(lower)) {
                    descRepas = "Pension Complète avec forfait boissons inclus";
                } else if (/forfait\s+boissons?\s*:\s*\d+\s*€|boissons?\s+en\s+suppl[eé]ment|hors\s+boissons?/i.test(lower)) {
                    descRepas = "Pension Complète (hors boissons / forfait boissons en supplément)";
                }
            }

            // 10. Billets & Activités
            let billetsInclus = lower.includes('billets inclus') || lower.includes('coupe-file') || lower.includes('entrées incluses') || lower.includes('droits d\'entrée');

            // 11. Guide
            let qualifGuide = 'Non précisé';
            if (lower.includes('guide francophone') || lower.includes('guide accompagnateur') || lower.includes('guide local')) qualifGuide = 'Guide local francophone diplômé';
            else if (lower.includes('sans guide') || lower.includes('autonomie')) qualifGuide = 'Aucun guide';

            // 12. Flexibilité
            let flex = 'Modérée';
            if (lower.includes('annulation gratuite') || lower.includes('sans frais') || lower.includes('remboursable')) flex = 'Très flexible';
            else if (lower.includes('non remboursable')) flex = 'Stricte';

            // Détection des taxes d'aéroport pour voyage aérien
            let taxesAeroPers = groupPricing.taxes_aeroport_pers || 0;
            let taxesAeroStatut = 'non_applicable';
            if (estVol) {
                if (taxesAeroPers > 0) {
                    taxesAeroStatut = 'en_supplement';
                } else {
                    const regexList = [
                        /taxes\s+(?:d['’]\s*|d\s+)?a[eé]roport[a-z]*(?:[^\n\d€]{0,50}?)(?:à|de|:)?\s*(\d+[\s\.,]?\d*)\s*(?:€|EUR)/i,
                        /taxes\s+a[eé]riennes?(?:[^\n\d€]{0,50}?)(?:à|de|:)?\s*(\d+[\s\.,]?\d*)\s*(?:€|EUR)/i,
                        /dont\s+(\d+[\s\.,]?\d*)\s*(?:€|EUR)\s+de\s+taxes\s+(?:d['’]\s*)?a[eé]ro/i,
                        /redevances\s+a[eé]roportuaires?(?:[^\n\d€]{0,50}?)(?:à|de|:)?\s*(\d+[\s\.,]?\d*)\s*(?:€|EUR)/i
                    ];
                    for (const reg of regexList) {
                        const m = rawText.match(reg);
                        if (m) {
                            const val = parseFloat(m[1].replace(/[^\d,\.]/g, '').replace(',', '.'));
                            if (val >= 15 && val <= 1500) {
                                taxesAeroPers = val;
                                taxesAeroStatut = 'en_supplement';
                                break;
                            }
                        }
                    }
                    if (taxesAeroPers === 0) {
                        if (/taxes\s+(?:d['’]\s*|d\s+)?a[eé]roport|taxes\s+a[eé]riennes/i.test(rawText)) {
                            taxesAeroStatut = 'incluses_non_ventilees';
                        }
                    }
                }
            }

            const taxesAeroTotal = Math.round(taxesAeroPers * nbPersonnes * 100) / 100;
            let prixHT = prixTotal;
            if (estVol && taxesAeroTotal > 0) {
                if (/prix\s+(?:net\s+)?ttc|ce\s+prix\s+comprend[\s\S]{1,1000}?taxes\s+a[eé]ro/i.test(rawText)) {
                    prixHT = Math.round(Math.max(0, prixTotal - taxesAeroTotal) * 100) / 100;
                } else {
                    prixHT = prixTotal;
                    prixTotal = Math.round((prixTotal + taxesAeroTotal) * 100) / 100;
                }
            }
            const prixHTPers = Math.round((prixHT / nbPersonnes) * 100) / 100;

            const newOffer = {
                id: offerId,
                raw_text: rawText,
                titre: titre,
                source_origine_type: sourceType,
                source_reference: sourceRef,
                destination_pays: destInfo.pays,
                destination_region: destInfo.region,
                circuit_nom: destInfo.circuit,
                base_participants: groupPricing.base_retenue,
                base_disponibles: groupPricing.base_disponibles,
                base_details: `Base ${groupPricing.base_retenue} personnes`,
                date_depart: dateDep,
                date_retour: dateRet,
                duree_jours: jours,
                duree_nuits: nuits,
                conforme_criteres: true,
                erreurs_conformite: [],
                nombre_prestations_incluses: 4,
                contient_hebergement: true,
                transport: {
                    statut: 'inclus',
                    type_transport: estVol ? 'Vol' : 'Transport terrestre',
                    est_vol: estVol,
                    vol_direct: volDirect,
                    compagnie_aerienne: compagnie,
                    compagnie_nommee_clairement: compagnieNommee,
                    details: detailsVol,
                    source: 'Vendeur (document ou lien)'
                },
                hebergement: {
                    statut: 'inclus',
                    nom: nomHeb,
                    type_hebergement: 'Hôtel',
                    adresse: 'Localisation indiquée dans le document',
                    standing: standing,
                    pertinence_emplacement: 'Emplacement à évaluer au regard du type de voyage sélectionné.',
                    avis_verifie: false,
                    avis_note: null,
                    avis_nombre: null,
                    avis_source: 'Non vérifié (aucun service externe d\'avis connecté)',
                    source: 'Vendeur (document ou lien)'
                },
                restauration: {
                    statut: formule === 'Sans repas' ? 'absent' : 'inclus',
                    formule: formule,
                    description: descRepas,
                    source: 'Vendeur (document ou lien)'
                },
                activites: {
                    statut: 'inclus',
                    description: 'Activités et visites du programme',
                    liste_activites: [],
                    billets_inclus: billetsInclus,
                    source: 'Vendeur (document ou lien)'
                },
                guide: {
                    statut: qualifGuide === 'Aucun guide' ? 'absent' : 'inclus',
                    qualification: qualifGuide,
                    description: qualifGuide,
                    source: 'Vendeur (document ou lien)'
                },
                assurance: {
                    statut: lower.includes('assurance') ? 'inclus' : 'non_precise',
                    type_couverture: lower.includes('assistance') ? 'Assistance rapatriement' : 'Non précisé',
                    description: '',
                    source: 'Vendeur (document ou lien)'
                },
                annulation: {
                    flexibilite: flex,
                    conditions_detaillees: flex === 'Très flexible' ? 'Annulation sans pénalité sous conditions' : 'Barème standard',
                    date_limite_annulation_gratuite: '',
                    source: 'Vendeur (document ou lien)'
                },
                prix: {
                    prix_total_annonce: prixTotal,
                    devise: 'EUR',
                    nombre_personnes: nbPersonnes,
                    taxes_incluses: true,
                    taxes_sejour_estimees: (/taxe\s+de\s+s[eé]jour/i.test(lower) || !lower.includes('taxe')) ? Math.round(1.5 * nuits * nbPersonnes) : 0,
                    frais_dossier: lower.includes('frais de dossier') ? 25 : 0,
                    supplements_connus: 0,
                    taxes_aeroport: taxesAeroTotal,
                    taxes_aeroport_par_personne: taxesAeroPers,
                    taxes_aeroport_statut: taxesAeroStatut,
                    prix_ht: prixHT,
                    prix_ht_par_personne: prixHTPers,
                    prix_total_normalise: prixTotal + (lower.includes('frais de dossier') ? 25 : 0),
                    prix_par_personne: Math.round(prixTotal / nbPersonnes),
                    prix_par_personne_par_nuit: Math.round(prixTotal / (nbPersonnes * nuits)),
                    source: 'Vendeur (document ou lien)'
                },
                vendeur: {
                    nom: vendeurNom,
                    site_web: '',
                    statut_juridique: 'Non vérifié',
                    fiabilite_economique: 'Non vérifié (registres publics non interrogés)',
                    fiabilite_explication: "L'absence d'information publique dans l'offre est neutre : vérification externe à effectuer sur Infogreffe / Atout France.",
                    avis_vendeur_source: 'Non vérifié',
                    source: 'Non vérifié (source externe inaccessible)'
                },
                points_appris: [],
                points_forts: [],
                points_faibles: [],
                points_a_clarifier: []
            };

            // Appliquer automatiquement les règles apprises par l'utilisateur
            this.applyLearnedRulesToOffer(rawText, newOffer);

            return newOffer;
        },

        // Recalcul des prix avec gestion du prix HT et des taxes aéroport en supplément
        recalculatePrices(offer, lastEdited = null) {
            const nbPers = Math.max(1, parseInt(offer.prix.nombre_personnes) || 1);
            const nuits = Math.max(1, parseInt(offer.duree_nuits) || 1);
            const estVol = offer.transport && (offer.transport.est_vol || (offer.transport.type_transport && offer.transport.type_transport.toLowerCase().includes('vol')));
            
            const taxesAeroPers = parseFloat(offer.prix.taxes_aeroport_par_personne) || 0;
            const taxesAeroTotal = Math.round(taxesAeroPers * nbPers * 100) / 100;
            offer.prix.taxes_aeroport = taxesAeroTotal;

            if (estVol) {
                if (lastEdited === 'ht') {
                    const pht = parseFloat(offer.prix.prix_ht) || 0;
                    offer.prix.prix_total_annonce = Math.round((pht + taxesAeroTotal) * 100) / 100;
                } else if (lastEdited === 'taxes_aero') {
                    const pht = parseFloat(offer.prix.prix_ht) || (parseFloat(offer.prix.prix_total_annonce) || 0);
                    offer.prix.prix_total_annonce = Math.round((pht + taxesAeroTotal) * 100) / 100;
                } else {
                    const totalAnn = parseFloat(offer.prix.prix_total_annonce) || 0;
                    offer.prix.prix_ht = Math.round(Math.max(0, totalAnn - taxesAeroTotal) * 100) / 100;
                }
                offer.prix.prix_ht_par_personne = Math.round((offer.prix.prix_ht / nbPers) * 100) / 100;
            } else {
                offer.prix.prix_ht = parseFloat(offer.prix.prix_total_annonce) || 0;
                offer.prix.prix_ht_par_personne = Math.round((offer.prix.prix_ht / nbPers) * 100) / 100;
                offer.prix.taxes_aeroport = 0;
                offer.prix.taxes_aeroport_par_personne = 0;
            }

            const totalAnnonce = parseFloat(offer.prix.prix_total_annonce) || 0;
            const taxes = parseFloat(offer.prix.taxes_sejour_estimees) || 0;
            const frais = parseFloat(offer.prix.frais_dossier) || 0;
            const supp = parseFloat(offer.prix.supplements_connus) || 0;

            const total = totalAnnonce + taxes + frais + supp;
            offer.prix.prix_total_normalise = Math.round(total * 100) / 100;
            offer.prix.prix_par_personne = Math.round((total / nbPers) * 100) / 100;
            offer.prix.prix_par_personne_par_nuit = Math.round((total / (nbPers * nuits)) * 100) / 100;

            this.validateSingleOfferClient(offer);
        },

        // Validation stricte des règles obligatoires (2 prestations dont 1 hébergement)
        validateSingleOfferClient(offer) {
            const erreurs = [];
            let nbPrest = 0;
            let aHeb = false;

            if (offer.hebergement.statut === 'inclus' || offer.hebergement.statut === 'en_supplement') {
                nbPrest++;
                aHeb = true;
            }
            if (offer.transport.statut === 'inclus' || offer.transport.statut === 'en_supplement') {
                nbPrest++;
            }
            if (offer.restauration.statut === 'inclus' || offer.restauration.statut === 'en_supplement') {
                nbPrest++;
            }
            if (offer.activites.statut === 'inclus' || offer.activites.statut === 'en_supplement') {
                nbPrest++;
            }
            if (offer.guide.statut === 'inclus' || offer.guide.statut === 'en_supplement') {
                nbPrest++;
            }
            if (offer.assurance.statut === 'inclus' || offer.assurance.statut === 'en_supplement') {
                nbPrest++;
            }

            if (!aHeb) {
                erreurs.push("L'offre ne comprend aucun hébergement (critère obligatoire).");
            }
            if (nbPrest < 2) {
                erreurs.push(`L'offre ne comprend que ${nbPrest} prestation. Le comparateur exige au minimum deux prestations.`);
            }

            offer.conforme_criteres = (aHeb && nbPrest >= 2);
            offer.erreurs_conformite = erreurs;
            offer.nombre_prestations_incluses = nbPrest;
            offer.contient_hebergement = aHeb;
        },

        // Changement dynamique de la base de comparaison groupe (ex: Base 20 / Base 30 / Base 40)
        setComparisonBase(baseNum) {
            this.globalBaseComparison = baseNum;
            this.offers.forEach(off => {
                if (off.base_disponibles && off.base_disponibles[baseNum]) {
                    const prixBase = off.base_disponibles[baseNum];
                    off.base_participants = baseNum;
                    off.prix.prix_par_personne = Math.round(prixBase);
                    off.prix.nombre_personnes = baseNum;
                    off.prix.prix_total_annonce = Math.round(prixBase * baseNum);
                    this.recalculatePrices(off);
                }
            });
            if (this.comparisonResult) {
                this.triggerComparison();
            }
        },

        validateAllOffers() {
            this.offers.forEach(o => this.recalculatePrices(o));
        },

        // Évaluation de l'emplacement selon le type de voyage
        evaluateLocation(offer, travelType) {
            const loc = (offer.hebergement.adresse + " " + offer.hebergement.nom).toLowerCase();
            if (travelType === 'culturel') {
                if (loc.includes('centre') || loc.includes('historique') || loc.includes('old town') || loc.includes('musée')) {
                    return "Emplacement très favorable pour un voyage culturel : hébergement central permettant un accès à pied aux principaux monuments.";
                }
                return "Emplacement à vérifier : s'assurer des temps de trajet en transports en commun pour rejoindre les pôles culturels.";
            } else if (travelType === 'detente') {
                if (loc.includes('plage') || loc.includes('mer') || loc.includes('beach') || loc.includes('spa') || loc.includes('resort') || loc.includes('calme')) {
                    return "Emplacement idéal pour la détente : cadre propice au repos (front de mer, espaces verts ou installations de spa).";
                }
                return "Emplacement mixte : vérifier le niveau sonore et la proximité d'espaces de décompression adaptés au repos.";
            } else if (travelType === 'nature') {
                if (loc.includes('parc') || loc.includes('montagne') || loc.includes('fjord') || loc.includes('nature') || loc.includes('lodge') || loc.includes('sentier')) {
                    return "Excellente adéquation avec un voyage nature : hébergement au contact des paysages ou aux portes des itinéraires.";
                }
                return "Hébergement potentiellement éloigné des réserves naturelles : prévoir des temps de transfert routier.";
            } else if (travelType === 'professionnel') {
                if (loc.includes('affaires') || loc.includes('business') || loc.includes('gare') || loc.includes('aéroport') || loc.includes('congrès') || loc.includes('centre')) {
                    return "Emplacement fonctionnel et adapté aux déplacements professionnels : proximité des axes de transit et quartiers d'affaires.";
                }
                return "Emplacement décentré : estimer les contraintes de déplacement pour les réunions d'affaires.";
            } else if (travelType === 'sportif') {
                if (loc.includes('station') || loc.includes('piste') || loc.includes('montagne') || loc.includes('lac') || loc.includes('sport')) {
                    return "Emplacement stratégique pour un séjour sportif : départ direct ou immédiat vers les sentiers ou infrastructures.";
                }
                return "Emplacement en périphérie des spots sportifs majeurs : vérifier la logistique de transport du matériel.";
            }
            return "Emplacement à apprécier selon vos priorités de déplacement.";
        },

        // Détection des écarts de périmètre
        detectDifferences(offers) {
            const differences = [];
            if (offers.length < 2) return differences;

            const base = offers[0];
            const others = offers.slice(1);

            const checks = [
                ["Transport / Vol", o => `${o.transport.statut.toUpperCase()} (${o.transport.vol_direct === true ? 'Vol direct' : (o.transport.vol_direct === false ? 'Avec escale' : o.transport.type_transport)})`],
                ["Restauration", o => `${o.restauration.statut.toUpperCase()} (${o.restauration.formule})`],
                ["Visites & Activités", o => `${o.activites.statut.toUpperCase()} (${o.activites.billets_inclus ? 'Billets inclus' : 'Sans billets'})`],
                ["Guide", o => `${o.guide.statut.toUpperCase()} (${o.guide.qualification})`],
                ["Assurance", o => `${o.assurance.statut.toUpperCase()} (${o.assurance.type_couverture})`],
                ["Annulation", o => `${o.annulation.flexibilite}`],
                ["Taxes aéroport (voyage aérien)", o => {
                    if (!o.transport.est_vol) return "Sans objet (transport terrestre/sans vol)";
                    if (o.prix.taxes_aeroport_par_personne > 0) {
                        return `${o.prix.taxes_aeroport_par_personne} € / pers en supplément (Forfait H.T : ${o.prix.prix_ht_par_personne} €)`;
                    }
                    return "Incluses forfaitaire (non ventilées)";
                }]
            ];

            checks.forEach(([label, fn]) => {
                const baseVal = fn(base);
                others.forEach(oth => {
                    const othVal = fn(oth);
                    if (baseVal !== othVal) {
                        differences.push({
                            prestation: label,
                            status_offre_a: `${base.titre} : ${baseVal}`,
                            status_offre_b: `${oth.titre} : ${othVal}`,
                            impact: "Différence de périmètre contractuel pouvant justifier un écart de prix ou nécessiter un budget complémentaire."
                        });
                    }
                });
            });

            return differences;
        },

        // Calcul du score transparent
        calculateScore(offer, allOffers) {
            const missing = [];
            let pointsConfirmes = 0;
            const totalPoints = 10;

            if (offer.transport.compagnie_nommee_clairement) pointsConfirmes++;
            else missing.push("Compagnie de transport non garantie au contrat");

            if (offer.transport.vol_direct !== null || !offer.transport.est_vol) pointsConfirmes++;
            else missing.push("Caractère direct ou avec escale du vol non précisé");

            if (offer.hebergement.adresse && !offer.hebergement.adresse.toLowerCase().includes("non communiquée")) pointsConfirmes++;
            else missing.push("Adresse précise de l'hébergement inconnue");

            if (offer.hebergement.avis_verifie) pointsConfirmes++;
            else missing.push("Avis clients hébergement non audités par un tiers");

            if (offer.restauration.formule !== "Non précisé") pointsConfirmes++;
            else missing.push("Formule de restauration indéterminée");

            if (offer.annulation.flexibilite !== "Non précisé") pointsConfirmes++;
            else missing.push("Modalités exactes d'annulation non communiquées");

            if (offer.guide.statut !== "non_precise") pointsConfirmes++;
            else missing.push("Présence d'un guide non spécifiée");

            if (offer.assurance.statut !== "non_precise") pointsConfirmes++;
            else missing.push("Garanties d'assurance non renseignées");

            if (offer.prix.prix_total_annonce > 0) pointsConfirmes++;
            else missing.push("Prix total non chiffré");

            if (offer.vendeur.statut_juridique && !offer.vendeur.statut_juridique.toLowerCase().includes("non vérifié")) pointsConfirmes++;
            else missing.push("Immatriculation et garanties légales du vendeur non vérifiées");

            const completude = Math.round((pointsConfirmes / totalPoints) * 100);

            // 1. Score Prix
            const prixNuit = offer.prix.prix_par_personne_par_nuit;
            const allPrices = allOffers.map(o => o.prix.prix_par_personne_par_nuit).filter(p => p > 0);
            let scorePrix = 75;
            if (allPrices.length > 1) {
                const minP = Math.min(...allPrices);
                const maxP = Math.max(...allPrices);
                if (maxP > minP) scorePrix = 60 + 40 * (1 - (prixNuit - minP) / (maxP - minP));
            }

            // 2. Score Hébergement
            let scoreHeb = 65;
            const pert = offer.hebergement.pertinence_emplacement.toLowerCase();
            if (pert.includes('favorable') || pert.includes('idéal') || pert.includes('excellente')) scoreHeb += 20;
            else if (pert.includes('vérifier') || pert.includes('éloigné')) scoreHeb -= 10;
            if (offer.hebergement.standing.includes('4') || offer.hebergement.standing.includes('5')) scoreHeb += 15;
            scoreHeb = Math.min(100, Math.max(30, scoreHeb));

            // 3. Score Annulation
            let scoreAnnul = 50;
            const flex = offer.annulation.flexibilite.toLowerCase();
            if (flex.includes('très flexible') || flex.includes('gratuite')) scoreAnnul = 95;
            else if (flex.includes('modérée')) scoreAnnul = 70;
            else if (flex.includes('stricte')) scoreAnnul = 35;

            // 4. Score Prestations
            let scorePrest = 50;
            if (offer.restauration.formule === 'All Inclusive') scorePrest += 20;
            else if (offer.restauration.formule === 'Full Board') scorePrest += 15;
            else if (offer.restauration.formule === 'Half Board') scorePrest += 10;
            if (offer.transport.vol_direct === true) scorePrest += 10;
            if (offer.activites.statut === 'inclus') scorePrest += 10;
            if (offer.guide.statut === 'inclus') scorePrest += 10;
            scorePrest = Math.min(100, Math.max(30, scorePrest));

            // 5. Score Fiabilité
            let scoreFiab = Math.min(100, Math.max(20, Math.round(completude * 0.7 + (offer.transport.compagnie_nommee_clairement ? 30 : 10))));

            // Global pondéré
            const totalWeights = this.weights.poids_prix + this.weights.poids_hebergement + this.weights.poids_annulation + this.weights.poids_prestations + this.weights.poids_fiabilite || 100;
            const scoreGlobal = Math.round(
                ((scorePrix * this.weights.poids_prix) +
                (scoreHeb * this.weights.poids_hebergement) +
                (scoreAnnul * this.weights.poids_annulation) +
                (scorePrest * this.weights.poids_prestations) +
                (scoreFiab * this.weights.poids_fiabilite)) / totalWeights * 10
            ) / 10;

            return {
                score_global: scoreGlobal,
                score_prix: Math.round(scorePrix),
                score_hebergement: Math.round(scoreHeb),
                score_annulation: Math.round(scoreAnnul),
                score_prestations: Math.round(scorePrest),
                score_fiabilite: Math.round(scoreFiab),
                completude_donnees_pct: completude,
                donnees_manquantes: missing
            };
        },

        // Points forts / faibles / questions
        enrichOffer(offer) {
            const forts = [];
            const faibles = [];
            const questions = [];

            if (offer.transport.est_vol) {
                if (offer.transport.vol_direct === true) forts.push("Vol direct confirmé (gain de temps et confort de voyage).");
                else if (offer.transport.vol_direct === false) {
                    faibles.push("Vol avec escale(s) pouvant allonger significativement le trajet.");
                    questions.push("Quels sont les temps de correspondance et les aéroports de transit prévus ?");
                }
                if (offer.transport.compagnie_nommee_clairement) forts.push(`Compagnie aérienne contractuelle garantie (${offer.transport.compagnie_aerienne}).`);
                else {
                    faibles.push("Compagnie aérienne non garantie (risque d'affrètement de dernière minute).");
                    questions.push("Quelle est la compagnie aérienne exacte et les franchises de bagages incluses ?");
                }
            }

            if (offer.hebergement.pertinence_emplacement.includes('favorable') || offer.hebergement.pertinence_emplacement.includes('idéal')) {
                forts.push("Emplacement particulièrement adapté aux objectifs du séjour.");
            } else {
                questions.push("Quelle est l'adresse exacte et la distance par rapport aux sites d'intérêt ?");
            }

            if (['All Inclusive', 'Full Board'].includes(offer.restauration.formule)) {
                forts.push(`Restauration complète (${offer.restauration.formule}), limitant les dépenses imprévues.`);
            } else if (offer.restauration.formule === 'Sans repas') {
                faibles.push("Aucun repas inclus : prévoir un budget important pour manger sur place.");
                questions.push("Existe-t-il des commerces et restaurants à proximité immédiate de l'hébergement ?");
            }

            if (offer.annulation.flexibilite.includes('flexible')) forts.push("Conditions d'annulation protectrices (sans pénalité).");
            else {
                faibles.push("Conditions d'annulation contraignantes ou non détaillées.");
                questions.push("Quel est le barème exact des pénalités d'annulation ?");
            }

            offer.points_forts = forts.slice(0, 4);
            offer.points_faibles = faibles.slice(0, 4);
            offer.points_a_clarifier = questions.slice(0, 5);
        },

        // Lancement de l'analyse comparative complète
        triggerComparison() {
            if (this.offers.length < 2) {
                alert("Veuillez conserver ou ajouter au moins deux offres à comparer.");
                return;
            }

            const nonConformes = this.offers.filter(o => !o.conforme_criteres);
            if (nonConformes.length > 0) {
                const conf = confirm(
                    `Attention : ${nonConformes.length} offre(s) ne respectent pas les critères minimaux (au moins 2 prestations dont 1 hébergement).\n\nSouhaitez-vous continuer quand même ? Les alertes apparaîtront dans le rapport.`
                );
                if (!conf) return;
            }

            this.loading = true;
            this.errorMessage = '';

            try {
                // 1. Audit d'emplacement et enrichissement
                this.offers.forEach(o => {
                    o.hebergement.pertinence_emplacement = this.evaluateLocation(o, this.travelType);
                    this.enrichOffer(o);
                });

                // 2. Écarts de périmètre
                const ecarts = this.detectDifferences(this.offers);

                // 3. Calcul des scores
                const scoresDict = {};
                this.offers.forEach(o => {
                    scoresDict[o.id] = this.calculateScore(o, this.offers);
                });

                // 4. Synthèse argumentée
                const sorted = [...this.offers].sort((a, b) => (scoresDict[b.id]?.score_global || 0) - (scoresDict[a.id]?.score_global || 0));
                const meilleure = sorted[0];
                const challenger = sorted[1] || null;

                let synthese = `Pour un voyage à dominante **${this.travelType.toUpperCase()}**, l'analyse comparative met en regard les prestations réelles et le coût normalisé.\n\n`;
                if (challenger) {
                    const diffPrix = Math.round((meilleure.prix.prix_par_personne - challenger.prix.prix_par_personne) * 100) / 100;
                    if (Math.abs(diffPrix) < 25) {
                        synthese += `Les offres affichent un tarif similaire (~${meilleure.prix.prix_par_personne} € / pers.). Le choix s'arbitre principalement sur la qualité des prestations et la flexibilité contractuelle.`;
                    } else if (diffPrix > 0) {
                        synthese += `L'offre « ${meilleure.titre} » présente un surcoût de ${diffPrix} € / pers., justifié par un niveau de confort et d'inclusions supérieur (score ${scoresDict[meilleure.id].score_global}/100 vs ${scoresDict[challenger.id].score_global}/100).`;
                    } else {
                        synthese += `L'offre « ${meilleure.titre} » combine un avantage tarifaire de ${Math.abs(diffPrix)} € d'économie / pers. avec une conformité thématique optimale.`;
                    }
                }

                const avertissements = [];
                nonConformes.forEach(o => {
                    o.erreurs_conformite.forEach(err => avertissements.push(`Alerte « ${o.titre} » : ${err}`));
                });

                this.comparisonResult = {
                    type_voyage: this.travelType,
                    offres: this.offers,
                    scores: scoresDict,
                    poids_utilises: this.weights,
                    ecarts_perimetre: ecarts,
                    synthese_argumentee: synthese,
                    recommandation_principale: `Offre recommandée : « ${meilleure.titre} »`,
                    justification_recommandation: `1. Adéquation thématique avec le voyage ${this.travelType}.\n2. Coût normalisé de ${meilleure.prix.prix_par_personne_par_nuit} € / pers. / nuit pour un score de ${scoresDict[meilleure.id].score_global}/100.\n3. Indice de complétude des informations de ${scoresDict[meilleure.id].completude_donnees_pct}%.`,
                    avertissements_conformite: avertissements
                };

                this.step = 3;
                window.scrollTo({ top: 0, behavior: 'smooth' });

                // Initialisation différée de la carte pour s'adapter à la visibilité DOM
                setTimeout(() => {
                    this.initItineraryMap();
                }, 300);

            } catch (err) {
                this.errorMessage = "Erreur lors du calcul : " + err.message;
            } finally {
                this.loading = false;
            }
        },

        // Cartographie interactive des circuits & étapes
        initItineraryMap() {
            const container = document.getElementById('itineraryMap');
            if (!container) return;

            // Détection de l'itinéraire correspondant aux offres
            const itin = typeof detectMatchingItinerary === 'function' ? detectMatchingItinerary(this.offers) : null;
            if (!itin) return;
            this.itineraryData = itin;

            if (this.mapInstance) {
                try {
                    this.mapInstance.remove();
                } catch(e) {}
                this.mapInstance = null;
            }

            // Création de l'instance Leaflet
            const map = L.map('itineraryMap', {
                center: itin.center,
                zoom: itin.zoom,
                scrollWheelZoom: false
            });
            this.mapInstance = map;

            // Couche CartoDB Dark Matter (Dark Premium)
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 18,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            }).addTo(map);

            this.renderMapLayers();

            setTimeout(() => {
                map.invalidateSize();
                this.resetMapView();
            }, 300);
        },

        renderMapLayers() {
            if (!this.mapInstance || !this.itineraryData) return;
            const map = this.mapInstance;
            const itin = this.itineraryData;

            if (this.mapFeatureGroup) {
                map.removeLayer(this.mapFeatureGroup);
            }
            this.mapFeatureGroup = L.featureGroup().addTo(map);

            const steps = itin.steps;

            // 1. Tracé Circuit 1 (Néon Indigo / Violet)
            if (this.mapFilter === 'all' || this.mapFilter === 'offer0') {
                const line0 = steps.map(s => s.coords);
                const poly0 = L.polyline(line0, {
                    color: '#818cf8',
                    weight: 4,
                    opacity: 0.95,
                    lineJoin: 'round'
                });
                this.mapFeatureGroup.addLayer(poly0);
            }

            // 2. Tracé Circuit 2 (Néon Émeraude / Turquoise)
            if (this.mapFilter === 'all' || this.mapFilter === 'offer1') {
                const offset = (this.mapFilter === 'all') ? 0.04 : 0.0;
                const line1 = steps.map(s => [s.coords[0] + offset, s.coords[1] + offset]);
                const poly1 = L.polyline(line1, {
                    color: '#10b981',
                    weight: 4,
                    opacity: 0.95,
                    dashArray: (this.mapFilter === 'all') ? '8, 6' : null,
                    lineJoin: 'round'
                });
                this.mapFeatureGroup.addLayer(poly1);
            }

            // 3. Liaison aérienne intérieure (ex: Durban -> Le Cap)
            if (itin.flightPath && (this.mapFilter === 'all' || this.mapFilter === 'offer0' || this.mapFilter === 'offer1')) {
                const flightLine = L.polyline(itin.flightPath, {
                    color: '#38bdf8',
                    weight: 3,
                    dashArray: '6, 8',
                    opacity: 0.9
                });
                this.mapFeatureGroup.addLayer(flightLine);
            }

            // 4. Marqueurs interactifs avec popups comparatifs (Bento Pins néon)
            steps.forEach((step, idx) => {
                const num = idx + 1;
                let pinHtml = '';
                if (this.mapFilter === 'offer0') {
                    pinHtml = `<div style="background-color:#4f46e5;color:#ffffff;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;border:2px solid #818cf8;box-shadow:0 0 12px rgba(129,140,248,0.7);">${num}</div>`;
                } else if (this.mapFilter === 'offer1') {
                    pinHtml = `<div style="background-color:#065f46;color:#ffffff;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;border:2px solid #34d399;box-shadow:0 0 12px rgba(52,211,153,0.7);">${num}</div>`;
                } else {
                    pinHtml = `<div style="background:linear-gradient(135deg, #4f46e5 50%, #059669 50%);color:#ffffff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;border:2px solid #ffffff;box-shadow:0 0 14px rgba(255,255,255,0.4);">${num}</div>`;
                }

                const icon = L.divIcon({
                    className: 'custom-map-pin',
                    html: pinHtml,
                    iconSize: [28, 28],
                    iconAnchor: [14, 14],
                    popupAnchor: [0, -14]
                });

                const marker = L.marker(step.coords, { icon });

                const t0 = this.offers[0] ? this.offers[0].titre : (step.offer0?.title || "Offre 1");
                const t1 = this.offers[1] ? this.offers[1].titre : (step.offer1?.title || "Offre 2");

                const popup = `
                    <div style="font-family:system-ui,-apple-system,sans-serif;min-width:240px;max-width:300px;font-size:12px;line-height:1.4;">
                        <div style="font-weight:800;font-size:13px;color:#0f172a;border-bottom:1px solid #e2e8f0;padding-bottom:5px;margin-bottom:8px;">
                            Étape ${num} : ${step.name} <span style="color:#64748b;font-weight:normal;font-size:11px;">(${step.day})</span>
                        </div>
                        <div style="margin-bottom:8px;background:#f8fafc;padding:6px 8px;border-radius:6px;border-left:3px solid #4f46e5;">
                            <strong style="color:#4338ca;font-size:11px;display:block;">${t0}</strong>
                            <div style="color:#334155;font-size:11px;margin-top:2px;">${step.offer0?.desc || ''}</div>
                            <div style="color:#64748b;font-size:10px;margin-top:3px;">🏨 <i>${step.offer0?.hotel || 'Hôtel du circuit'}</i></div>
                        </div>
                        <div style="background:#f8fafc;padding:6px 8px;border-radius:6px;border-left:3px solid #059669;">
                            <strong style="color:#047857;font-size:11px;display:block;">${t1}</strong>
                            <div style="color:#334155;font-size:11px;margin-top:2px;">${step.offer1?.desc || ''}</div>
                            <div style="color:#64748b;font-size:10px;margin-top:3px;">🏨 <i>${step.offer1?.hotel || 'Hôtel du circuit'}</i></div>
                        </div>
                    </div>
                `;
                marker.bindPopup(popup);
                marker.on('click', () => {
                    this.selectedStepId = step.id;
                });

                this.mapFeatureGroup.addLayer(marker);
            });
        },

        setMapCircuitFilter(filter) {
            this.mapFilter = filter;
            this.renderMapLayers();
        },

        resetMapView() {
            if (!this.mapInstance || !this.mapFeatureGroup) return;
            const bounds = this.mapFeatureGroup.getBounds();
            if (bounds.isValid()) {
                this.mapInstance.fitBounds(bounds, { padding: [35, 35] });
            }
        },

        focusStep(step) {
            this.selectedStepId = step.id;
            if (!this.mapInstance) return;
            this.mapInstance.flyTo(step.coords, 9, { duration: 1.0 });
            if (this.mapFeatureGroup) {
                this.mapFeatureGroup.eachLayer(layer => {
                    if (layer.getLatLng && Math.abs(layer.getLatLng().lat - step.coords[0]) < 0.01 && Math.abs(layer.getLatLng().lng - step.coords[1]) < 0.01) {
                        layer.openPopup();
                    }
                });
            }
        },

        // Recalcul en direct quand les pondérations changent
        updateWeights() {
            if (this.step !== 3 || !this.comparisonResult) return;
            const scoresDict = {};
            this.offers.forEach(o => {
                scoresDict[o.id] = this.calculateScore(o, this.offers);
            });
            this.comparisonResult.scores = scoresDict;
        },

        printReport() {
            window.print();
        },

        getStatusBadgeClass(status) {
            switch (status) {
                case 'inclus': return 'badge-inclus';
                case 'en_supplement': return 'badge-en_supplement';
                case 'absent': return 'badge-absent';
                case 'non_precise': default: return 'badge-non_precise';
            }
        },

        getStatusLabel(status) {
            switch (status) {
                case 'inclus': return 'Inclus';
                case 'en_supplement': return 'En supplément';
                case 'absent': return 'Absent';
                case 'non_precise': default: return 'Non précisé';
            }
        },

        // ========================================================
        // SYSTÈME D'APPRENTISSAGE ACTIF & POINTAGE DOCUMENT
        // ========================================================

        loadLearnedRules() {
            try {
                const stored = localStorage.getItem('tourist_comparator_learned_rules');
                if (stored) {
                    this.learnedRules = JSON.parse(stored);
                } else {
                    this.learnedRules = [
                        {
                            id: 'rule_seed_taxe_aero',
                            fieldKey: 'taxes_aeroport',
                            fieldLabel: "Taxes aéroport (€/pers)",
                            triggerKeyword: 'taxes aériennes obligatoires',
                            patternType: 'number',
                            valueSample: '490 €',
                            learnedFromDocument: 'Charmes de l\'Afrique du Sud 2026',
                            createdAt: new Date().toLocaleDateString('fr-FR'),
                            timesApplied: 1
                        },
                        {
                            id: 'rule_seed_redevances',
                            fieldKey: 'taxes_aeroport',
                            fieldLabel: "Taxes aéroport (€/pers)",
                            triggerKeyword: 'redevances aéroportuaires',
                            patternType: 'number',
                            valueSample: '380 €',
                            learnedFromDocument: 'Exemple standard',
                            createdAt: new Date().toLocaleDateString('fr-FR'),
                            timesApplied: 0
                        }
                    ];
                    this.saveLearnedRules();
                }
            } catch (e) {
                console.error("Erreur chargement des règles apprises :", e);
                this.learnedRules = [];
            }
        },

        saveLearnedRules() {
            try {
                localStorage.setItem('tourist_comparator_learned_rules', JSON.stringify(this.learnedRules));
            } catch (e) {
                console.error("Erreur sauvegarde des règles apprises :", e);
            }
        },

        deleteLearnedRule(id) {
            this.learnedRules = this.learnedRules.filter(r => r.id !== id);
            this.saveLearnedRules();
            this.successMessage = "Règle d'apprentissage supprimée.";
            setTimeout(() => this.successMessage = '', 3000);
        },

        resetLearnedRules() {
            if (confirm("Voulez-vous réinitialiser toutes les règles apprises aux valeurs d'origine ?")) {
                localStorage.removeItem('tourist_comparator_learned_rules');
                this.loadLearnedRules();
                this.successMessage = "Règles d'apprentissage réinitialisées.";
                setTimeout(() => this.successMessage = '', 3000);
            }
        },

        openTeachModal(offer = null, fieldKey = 'taxes_aeroport', fieldLabel = null) {
            if (!offer) {
                offer = this.offers[this.activeTabOfferIndex] || this.offers[0];
            }
            if (!offer) return;

            const labels = {
                'taxes_aeroport': "Taxes aéroport (€/pers)",
                'prix_ht': "Prix H.T total (€)",
                'prix_total': "Prix total TTC (€)",
                'duree_jours': "Durée en jours",
                'duree_nuits': "Durée en nuits",
                'compagnie_aerienne': "Compagnie aérienne",
                'vol_direct': "Type de vol (direct ou escale)",
                'nom_hotel': "Hôtels / Hébergements",
                'standing_hotel': "Standing / Étoiles de l'hôtel",
                'formule_repas': "Formule de repas",
                'activites': "Visites & Activités",
                'guide': "Guide & Accompagnement",
                'annulation': "Conditions & Barème d'annulation",
                'vendeur': "Organisateur / Vendeur"
            };

            const defaultSearches = {
                'taxes_aeroport': "taxe",
                'prix_ht': "ht",
                'prix_total': "prix",
                'duree_jours': "jour",
                'duree_nuits': "nuit",
                'compagnie_aerienne': "vol",
                'vol_direct': "escale",
                'nom_hotel': "hotel",
                'standing_hotel': "étoile",
                'formule_repas': "pension",
                'activites': "visite",
                'guide': "guide",
                'annulation': "annul",
                'vendeur': "agence"
            };

            const docText = offer.raw_text || this.generateSampleDocumentText(offer);

            this.teachState = {
                offer: offer,
                fieldKey: fieldKey,
                fieldLabel: fieldLabel || labels[fieldKey] || fieldKey,
                currentVal: this.getFieldValue(offer, fieldKey),
                documentText: docText,
                searchQuery: defaultSearches[fieldKey] || '',
                selectedText: '',
                triggerKeyword: this.getDefaultTriggerKeyword(fieldKey),
                extractedVal: '',
                statusExplanation: '',
                candidateLines: []
            };

            this.updateCandidateLines();
            this.showTeachModal = true;
        },

        onFieldKeyChanged() {
            const labels = {
                'taxes_aeroport': "Taxes aéroport (€/pers)",
                'prix_ht': "Prix H.T total (€)",
                'prix_total': "Prix total TTC (€)",
                'duree_jours': "Durée en jours",
                'duree_nuits': "Durée en nuits",
                'compagnie_aerienne': "Compagnie aérienne",
                'vol_direct': "Type de vol (direct ou escale)",
                'nom_hotel': "Hôtels / Hébergements",
                'standing_hotel': "Standing / Étoiles de l'hôtel",
                'formule_repas': "Formule de repas",
                'activites': "Visites & Activités",
                'guide': "Guide & Accompagnement",
                'annulation': "Conditions & Barème d'annulation",
                'vendeur': "Organisateur / Vendeur"
            };
            const defaultSearches = {
                'taxes_aeroport': "taxe",
                'prix_ht': "ht",
                'prix_total': "prix",
                'duree_jours': "jour",
                'duree_nuits': "nuit",
                'compagnie_aerienne': "vol",
                'vol_direct': "escale",
                'nom_hotel': "hotel",
                'standing_hotel': "étoile",
                'formule_repas': "pension",
                'activites': "visite",
                'guide': "guide",
                'annulation': "annul",
                'vendeur': "agence"
            };
            this.teachState.fieldLabel = labels[this.teachState.fieldKey] || this.teachState.fieldKey;
            this.teachState.currentVal = this.getFieldValue(this.teachState.offer, this.teachState.fieldKey);
            this.teachState.searchQuery = defaultSearches[this.teachState.fieldKey] || '';
            this.teachState.triggerKeyword = this.getDefaultTriggerKeyword(this.teachState.fieldKey);
            this.updateCandidateLines();
        },

        getFieldValue(offer, fieldKey) {
            if (!offer) return '';
            switch (fieldKey) {
                case 'taxes_aeroport': return (offer.prix && offer.prix.taxes_aeroport_par_personne) || 0;
                case 'prix_ht': return (offer.prix && offer.prix.prix_ht) || 0;
                case 'prix_total': return (offer.prix && offer.prix.prix_total_annonce) || 0;
                case 'duree_jours': return offer.duree_jours || 0;
                case 'duree_nuits': return offer.duree_nuits || 0;
                case 'compagnie_aerienne': return (offer.transport && offer.transport.compagnie_aerienne) || '';
                case 'vol_direct': return (offer.transport && offer.transport.vol_direct === true ? 'Direct' : (offer.transport && offer.transport.vol_direct === false ? 'Escale' : 'Non précisé'));
                case 'nom_hotel': return (offer.hebergement && offer.hebergement.nom) || '';
                case 'standing_hotel': return (offer.hebergement && offer.hebergement.standing) || '';
                case 'formule_repas': return (offer.restauration && offer.restauration.formule) || '';
                case 'activites': return (offer.activites && offer.activites.description) || '';
                case 'guide': return (offer.guide && offer.guide.qualification) || '';
                case 'annulation': return (offer.annulation && offer.annulation.conditions_detaillees) || '';
                case 'vendeur': return (offer.vendeur && offer.vendeur.nom) || '';
                default: return '';
            }
        },

        getDefaultTriggerKeyword(fieldKey) {
            switch (fieldKey) {
                case 'taxes_aeroport': return 'taxes aériennes obligatoires';
                case 'prix_ht': return 'prix net hors taxes';
                case 'prix_total': return 'prix total ttc';
                case 'duree_jours': return 'durée du séjour';
                case 'duree_nuits': return 'nombre de nuits';
                case 'compagnie_aerienne': return 'compagnie aérienne :';
                case 'vol_direct': return 'vols réguliers';
                case 'nom_hotel': return 'hôtels prévus :';
                case 'standing_hotel': return 'catégorie hôtelière :';
                case 'formule_repas': return 'formule de repas :';
                case 'activites': return 'programme des visites :';
                case 'guide': return 'guide accompagnateur :';
                case 'annulation': return 'barème d\'annulation :';
                case 'vendeur': return 'organisé par :';
                default: return '';
            }
        },

        updateCandidateLines() {
            if (!this.teachState.documentText) {
                this.teachState.candidateLines = [];
                return;
            }
            const q = (this.teachState.searchQuery || '').toLowerCase().trim();
            const rawLines = this.teachState.documentText.split('\n').map(l => l.trim()).filter(l => l.length > 2);
            if (!q) {
                this.teachState.candidateLines = rawLines.slice(0, 25);
            } else {
                this.teachState.candidateLines = rawLines.filter(l => l.toLowerCase().includes(q)).slice(0, 30);
            }
        },

        handleDocumentSelection() {
            const sel = window.getSelection();
            if (!sel || sel.isCollapsed) return;
            const text = sel.toString().trim();
            if (!text || text.length < 1) return;

            this.teachState.selectedText = text;

            if (this.teachState.fieldKey.includes('taxes') || this.teachState.fieldKey.includes('prix') || this.teachState.fieldKey.includes('duree')) {
                const mNum = text.match(/(\d+[\s\.,]?\d*)/);
                if (mNum) {
                    this.teachState.extractedVal = mNum[1].replace(/\s/g, '');
                } else {
                    this.teachState.extractedVal = text;
                }
            } else {
                this.teachState.extractedVal = text;
            }

            // Détection automatique du mot-clé ou libellé précédant la sélection
            const doc = this.teachState.documentText;
            const pos = doc.indexOf(text);
            if (pos > 0) {
                const prefixSnippet = doc.substring(Math.max(0, pos - 70), pos);
                const lines = prefixSnippet.split(/\n|;/);
                let cand = lines[lines.length - 1].trim();
                cand = cand.replace(/[:\-–—\.]+\s*$/, '').trim();
                if (cand.length >= 3 && cand.length <= 50) {
                    this.teachState.triggerKeyword = cand;
                }
            }
        },

        pickCandidateLine(line) {
            this.teachState.selectedText = line;
            if (this.teachState.fieldKey.includes('taxes') || this.teachState.fieldKey.includes('prix') || this.teachState.fieldKey.includes('duree')) {
                const mNum = line.match(/(\d+[\s\.,]?\d*)\s*(?:€|EUR)?/i);
                if (mNum) {
                    this.teachState.extractedVal = mNum[1].replace(/\s/g, '');
                } else {
                    this.teachState.extractedVal = line;
                }
            } else {
                this.teachState.extractedVal = line;
            }

            const parts = line.split(/[:\-–]/);
            if (parts.length > 1 && parts[0].trim().length >= 3 && parts[0].trim().length <= 50) {
                this.teachState.triggerKeyword = parts[0].trim();
            }
        },

        learnAndApplyRule() {
            if (!this.teachState.offer) return;
            const val = String(this.teachState.extractedVal || '').trim();
            const trigger = String(this.teachState.triggerKeyword || '').trim();

            if (!val) {
                alert("Veuillez indiquer ou sélectionner la valeur de l'information dans le document.");
                return;
            }

            this.applyValueToOffer(this.teachState.offer, this.teachState.fieldKey, val);

            if (trigger) {
                const newRule = {
                    id: 'rule_' + Date.now(),
                    fieldKey: this.teachState.fieldKey,
                    fieldLabel: this.teachState.fieldLabel,
                    triggerKeyword: trigger,
                    patternType: (this.teachState.fieldKey.includes('taxes') || this.teachState.fieldKey.includes('prix') || this.teachState.fieldKey.includes('duree')) ? 'number' : 'text',
                    valueSample: val,
                    learnedFromDocument: this.teachState.offer.source_reference || this.teachState.offer.titre,
                    createdAt: new Date().toLocaleDateString('fr-FR'),
                    timesApplied: 1
                };

                const existingIdx = this.learnedRules.findIndex(r => r.triggerKeyword.toLowerCase() === trigger.toLowerCase() && r.fieldKey === this.teachState.fieldKey);
                if (existingIdx >= 0) {
                    this.learnedRules[existingIdx] = newRule;
                } else {
                    this.learnedRules.unshift(newRule);
                }
                this.saveLearnedRules();

                this.successMessage = `✨ Règle « ${trigger} » mémorisée avec succès ! L'information est appliquée et sera automatiquement reconnue dans tous vos futurs documents.`;
            } else {
                this.successMessage = `Information « ${this.teachState.fieldLabel} » mise à jour.`;
            }

            setTimeout(() => this.successMessage = '', 6000);
            this.showTeachModal = false;
        },

        applyValueOnly() {
            if (!this.teachState.offer) return;
            const val = String(this.teachState.extractedVal || '').trim();
            if (!val) {
                alert("Veuillez indiquer ou sélectionner la valeur.");
                return;
            }
            this.applyValueToOffer(this.teachState.offer, this.teachState.fieldKey, val);
            this.successMessage = `Information mise à jour pour cette offre uniquement.`;
            setTimeout(() => this.successMessage = '', 4000);
            this.showTeachModal = false;
        },

        applyValueToOffer(offer, fieldKey, val) {
            if (!offer) return;
            if (!offer.points_appris) offer.points_appris = [];

            switch (fieldKey) {
                case 'taxes_aeroport': {
                    const num = parseFloat(String(val).replace(/[^\d,\.]/g, '').replace(',', '.')) || 0;
                    if (!offer.prix) offer.prix = {};
                    offer.prix.taxes_aeroport_par_personne = num;
                    offer.prix.taxes_aeroport = Math.round(num * Math.max(1, offer.prix.nombre_personnes || 2) * 100) / 100;
                    offer.prix.taxes_aeroport_statut = num > 0 ? 'en_supplement' : 'incluses_non_ventilees';
                    this.recalculatePrices(offer, 'taxes_aero');
                    break;
                }
                case 'prix_ht': {
                    const num = parseFloat(String(val).replace(/[^\d,\.]/g, '').replace(',', '.')) || 0;
                    if (!offer.prix) offer.prix = {};
                    offer.prix.prix_ht = num;
                    this.recalculatePrices(offer, 'ht');
                    break;
                }
                case 'prix_total': {
                    const num = parseFloat(String(val).replace(/[^\d,\.]/g, '').replace(',', '.')) || 0;
                    if (!offer.prix) offer.prix = {};
                    offer.prix.prix_total_annonce = num;
                    this.recalculatePrices(offer, 'total');
                    break;
                }
                case 'duree_jours': {
                    offer.duree_jours = parseInt(val) || offer.duree_jours;
                    this.recalculatePrices(offer);
                    break;
                }
                case 'duree_nuits': {
                    offer.duree_nuits = parseInt(val) || offer.duree_nuits;
                    this.recalculatePrices(offer);
                    break;
                }
                case 'compagnie_aerienne': {
                    if (!offer.transport) offer.transport = {};
                    offer.transport.compagnie_aerienne = val;
                    offer.transport.compagnie_nommee_clairement = true;
                    break;
                }
                case 'vol_direct': {
                    if (!offer.transport) offer.transport = {};
                    offer.transport.vol_direct = /direct|sans escale/i.test(val);
                    break;
                }
                case 'nom_hotel': {
                    if (!offer.hebergement) offer.hebergement = {};
                    offer.hebergement.nom = val;
                    break;
                }
                case 'standing_hotel': {
                    if (!offer.hebergement) offer.hebergement = {};
                    offer.hebergement.standing = val;
                    break;
                }
                case 'formule_repas': {
                    if (!offer.restauration) offer.restauration = {};
                    offer.restauration.formule = val;
                    offer.restauration.description = val;
                    break;
                }
                case 'activites': {
                    if (!offer.activites) offer.activites = {};
                    offer.activites.description = val;
                    break;
                }
                case 'guide': {
                    if (!offer.guide) offer.guide = {};
                    offer.guide.qualification = val;
                    offer.guide.description = val;
                    offer.guide.statut = 'inclus';
                    break;
                }
                case 'annulation': {
                    if (!offer.annulation) offer.annulation = {};
                    offer.annulation.conditions_detaillees = val;
                    if (/sans frais|gratuite|100%/i.test(val)) offer.annulation.flexibilite = 'Très flexible';
                    else if (/non remboursable/i.test(val)) offer.annulation.flexibilite = 'Stricte';
                    else offer.annulation.flexibilite = 'Barème standard';
                    break;
                }
                case 'vendeur': {
                    if (!offer.vendeur) offer.vendeur = {};
                    offer.vendeur.nom = val;
                    break;
                }
            }

            offer.points_appris.push({
                field: fieldKey,
                label: this.teachState.fieldLabel,
                val: val,
                time: new Date().toLocaleTimeString('fr-FR')
            });

            this.validateAllOffers();
        },

        applyLearnedRulesToOffer(rawText, offer) {
            if (!this.learnedRules || this.learnedRules.length === 0 || !rawText) return [];
            const applied = [];

            for (const rule of this.learnedRules) {
                if (!rule.triggerKeyword) continue;
                const trig = rule.triggerKeyword.trim();
                const escTrig = trig.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');

                if (rule.fieldKey === 'taxes_aeroport') {
                    const regex = new RegExp(escTrig + '[^\\n\\d]{0,50}?(\\d+[\\s\\.,]?\\d*)', 'i');
                    const m = rawText.match(regex);
                    if (m) {
                        const valNum = parseFloat(m[1].replace(/[^\d,\.]/g, '').replace(',', '.'));
                        if (valNum >= 15 && valNum <= 2500) {
                            offer.prix.taxes_aeroport_par_personne = valNum;
                            offer.prix.taxes_aeroport = Math.round(valNum * Math.max(1, offer.prix.nombre_personnes || 2) * 100) / 100;
                            offer.prix.taxes_aeroport_statut = 'en_supplement';
                            this.recalculatePrices(offer, 'taxes_aero');
                            rule.timesApplied = (rule.timesApplied || 0) + 1;
                            applied.push({ rule: rule, val: `${valNum} €` });
                        }
                    }
                } else if (rule.fieldKey === 'prix_ht') {
                    const regex = new RegExp(escTrig + '[^\\n\\d]{0,50}?(\\d+[\\s\\.,]?\\d*)', 'i');
                    const m = rawText.match(regex);
                    if (m) {
                        const valNum = parseFloat(m[1].replace(/[^\d,\.]/g, '').replace(',', '.'));
                        if (valNum >= 100 && valNum <= 50000) {
                            offer.prix.prix_ht = valNum;
                            this.recalculatePrices(offer, 'ht');
                            rule.timesApplied = (rule.timesApplied || 0) + 1;
                            applied.push({ rule: rule, val: `${valNum} €` });
                        }
                    }
                } else if (rule.fieldKey === 'compagnie_aerienne') {
                    const regex = new RegExp(escTrig + '[:\\s\\-]*([^\\n\\r,;.]{3,40})', 'i');
                    const m = rawText.match(regex);
                    if (m && m[1].trim()) {
                        offer.transport.compagnie_aerienne = m[1].trim();
                        offer.transport.compagnie_nommee_clairement = true;
                        rule.timesApplied = (rule.timesApplied || 0) + 1;
                        applied.push({ rule: rule, val: m[1].trim() });
                    }
                } else if (rule.fieldKey === 'nom_hotel') {
                    const regex = new RegExp(escTrig + '[:\\s\\-]*([^\\n\\r]{5,90})', 'i');
                    const m = rawText.match(regex);
                    if (m && m[1].trim()) {
                        offer.hebergement.nom = m[1].trim();
                        rule.timesApplied = (rule.timesApplied || 0) + 1;
                        applied.push({ rule: rule, val: m[1].trim() });
                    }
                } else if (rule.fieldKey === 'annulation') {
                    const regex = new RegExp(escTrig + '[:\\s\\-]*([^\\n\\r]{5,120})', 'i');
                    const m = rawText.match(regex);
                    if (m && m[1].trim()) {
                        offer.annulation.conditions_detaillees = m[1].trim();
                        rule.timesApplied = (rule.timesApplied || 0) + 1;
                        applied.push({ rule: rule, val: m[1].trim() });
                    }
                } else if (rule.fieldKey === 'guide') {
                    const regex = new RegExp(escTrig + '[:\\s\\-]*([^\\n\\r]{4,80})', 'i');
                    const m = rawText.match(regex);
                    if (m && m[1].trim()) {
                        offer.guide.qualification = m[1].trim();
                        offer.guide.description = m[1].trim();
                        offer.guide.statut = 'inclus';
                        rule.timesApplied = (rule.timesApplied || 0) + 1;
                        applied.push({ rule: rule, val: m[1].trim() });
                    }
                } else if (rule.fieldKey === 'vendeur') {
                    const regex = new RegExp(escTrig + '[:\\s\\-]*([^\\n\\r,;.]{3,50})', 'i');
                    const m = rawText.match(regex);
                    if (m && m[1].trim()) {
                        offer.vendeur.nom = m[1].trim();
                        rule.timesApplied = (rule.timesApplied || 0) + 1;
                        applied.push({ rule: rule, val: m[1].trim() });
                    }
                }
            }

            if (applied.length > 0) {
                this.saveLearnedRules();
                if (!offer.points_appris) offer.points_appris = [];
                applied.forEach(a => {
                    offer.points_appris.push({
                        field: a.rule.fieldKey,
                        label: a.rule.fieldLabel,
                        val: a.val,
                        trigger: a.rule.triggerKeyword,
                        time: new Date().toLocaleTimeString('fr-FR')
                    });
                });
            }

            return applied;
        },

        generateSampleDocumentText(offer) {
            if (!offer) return '';
            return `DOCUMENT DE VOYAGE : ${offer.titre}\n` +
                   `RÉFÉRENCE DOSSIER : ${offer.source_reference || 'Devis agence'}\n` +
                   `ORGANISATEUR : ${offer.vendeur ? offer.vendeur.nom : 'Agence de voyages'}\n\n` +
                   `DATES DU SÉJOUR : ${offer.date_depart ? 'Du ' + offer.date_depart + ' au ' + offer.date_retour : 'Départ 2026'}\n` +
                   `DURÉE : ${offer.duree_jours} jours / ${offer.duree_nuits} nuits (${offer.prix ? offer.prix.nombre_personnes : 2} personnes)\n\n` +
                   `TRANSPORT :\n` +
                   `- Type de transport : ${offer.transport ? offer.transport.type_transport : 'Vol'}\n` +
                   `- Compagnie aérienne : ${offer.transport ? offer.transport.compagnie_aerienne : 'Non précisée'}\n` +
                   `- Détails vol : ${offer.transport ? offer.transport.details : ''}\n\n` +
                   `CONDITIONS TARIFAIRES :\n` +
                   (offer.transport && offer.transport.est_vol ?
                    `- Prix net hors taxes par personne : ${offer.prix ? offer.prix.prix_ht_par_personne : 0} €\n` +
                    `- Taxes aériennes obligatoires : ${offer.prix ? offer.prix.taxes_aeroport_par_personne : 0} € par personne\n` +
                    `- Prix total TTC par personne : ${offer.prix ? offer.prix.prix_par_personne : 0} €\n` :
                    `- Prix total TTC : ${offer.prix ? offer.prix.prix_total_annonce : 0} €\n`) +
                   `- Frais de dossier : ${offer.prix ? offer.prix.frais_dossier : 0} €\n` +
                   `- Taxe de séjour : ${offer.prix ? offer.prix.taxes_sejour_estimees : 0} €\n\n` +
                   `HÉBERGEMENT & STANDING :\n` +
                   `- Hôtels prévus : ${offer.hebergement ? offer.hebergement.nom : 'Hôtels selon programme'}\n` +
                   `- Catégorie : ${offer.hebergement ? offer.hebergement.standing : 'Standard 3/4 étoiles'}\n` +
                   `- Localisation : ${offer.hebergement ? offer.hebergement.adresse : 'Selon itinéraire'}\n\n` +
                   `RESTAURATION :\n` +
                   `- Formule de repas : ${offer.restauration ? offer.restauration.formule : 'Demi-pension'}\n` +
                   `- Description : ${offer.restauration ? offer.restauration.description : ''}\n\n` +
                   `VISITES & EXCURSIONS :\n` +
                   `- Programme : ${offer.activites ? offer.activites.description : ''}\n` +
                   `- Guide : ${offer.guide ? offer.guide.qualification : 'Non précisé'}\n\n` +
                   `CONDITIONS DE VENTE & ANNULATION :\n` +
                   `- Barème d'annulation : ${offer.annulation ? offer.annulation.conditions_detaillees : 'Frais standards'}\n` +
                   `- Flexibilité : ${offer.annulation ? offer.annulation.flexibilite : 'Modérée'}\n`;
        }
    }));
});
