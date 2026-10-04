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

        // Parser textuel intelligent avec priorisation sémantique
        parseOfferText(rawText, offerId, sourceType, sourceRef) {
            const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 3);
            const lower = rawText.toLowerCase();

            // 1. Titre
            const titre = lines[0] ? lines[0].substring(0, 80) : `Offre extraite (${sourceRef})`;

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

            // 5. Prix et devises avec détection prix par personne
            let prixTotal = 0;
            let isPricePerPerson = false;
            const rawLines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

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

            return {
                id: offerId,
                titre: titre,
                source_origine_type: sourceType,
                source_reference: sourceRef,
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
                    taxes_sejour_estimees: Math.round(1.5 * nuits * nbPersonnes),
                    frais_dossier: lower.includes('frais de dossier') ? 25 : 0,
                    supplements_connus: 0,
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
                points_forts: [],
                points_faibles: [],
                points_a_clarifier: []
            };
        },

        // Recalcul des prix
        recalculatePrices(offer) {
            const nbPers = Math.max(1, parseInt(offer.prix.nombre_personnes) || 1);
            const nuits = Math.max(1, parseInt(offer.duree_nuits) || 1);
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
                ["Annulation", o => `${o.annulation.flexibilite}`]
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

            } catch (err) {
                this.errorMessage = "Erreur lors du calcul : " + err.message;
            } finally {
                this.loading = false;
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
        }
    }));
});
