document.addEventListener('alpine:init', () => {
    Alpine.data('comparatorApp', () => ({
        // État de l'application
        step: 1, // 1: Choix du type de voyage, 2: Offres & Vérification, 3: Comparaison
        travelType: 'culturel',
        offers: [],
        comparisonResult: null,
        loading: false,
        errorMessage: '',
        successMessage: '',
        
        // Modal & saisie
        urlInput: '',
        uploading: false,
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
            // Initialiser avec un exemple pertinent
            this.loadSampleOffers('culturel', false);
        },

        // Sélection du type de voyage
        selectTravelType(typeId) {
            this.travelType = typeId;
            this.step = 2;
            this.loadSampleOffers(typeId, false);
        },

        // Chargement des offres d'exemple
        async loadSampleOffers(typeId = null, goToStep2 = true) {
            const targetType = typeId || this.travelType;
            this.loading = true;
            this.errorMessage = '';
            try {
                const res = await fetch(`/api/sample-offers/${targetType}`);
                const data = await res.json();
                if (data.status === 'success') {
                    this.offers = data.offers;
                    this.activeTabOfferIndex = 0;
                    this.successMessage = `Exemples pour le voyage ${targetType} chargés avec succès.`;
                    setTimeout(() => this.successMessage = '', 4000);
                    if (goToStep2) this.step = 2;
                } else {
                    this.errorMessage = "Impossible de charger les offres exemples.";
                }
            } catch (err) {
                this.errorMessage = "Erreur de communication avec le serveur : " + err.message;
            } finally {
                this.loading = false;
            }
        },

        // Chargement d'une offre non conforme pour démonstration du contrôle
        async loadSampleInvalidOffer() {
            this.loading = true;
            this.errorMessage = '';
            try {
                const res = await fetch('/api/sample-invalid-offer');
                const data = await res.json();
                if (data.status === 'success') {
                    this.offers.push(data.offer);
                    this.activeTabOfferIndex = this.offers.length - 1;
                    this.successMessage = "Offre non conforme (vol seul sans hébergement) ajoutée pour tester la détection de règle.";
                    setTimeout(() => this.successMessage = '', 5000);
                }
            } catch (err) {
                this.errorMessage = "Erreur lors du chargement : " + err.message;
            } finally {
                this.loading = false;
            }
        },

        // Ajout d'une offre manuelle vide
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
                    conditions_detaillees: 'Annulation avec frais standard',
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
                    supplements_connus: 20,
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

        // Upload de fichier (PDF, Word, Excel)
        async handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);
            formData.append('offer_id', `file-${Date.now()}`);

            this.loading = true;
            this.uploading = true;
            this.errorMessage = '';

            try {
                const res = await fetch('/api/extract-file', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                if (res.ok && data.status === 'success') {
                    this.offers.push(data.offer);
                    this.activeTabOfferIndex = this.offers.length - 1;
                    this.successMessage = `Fichier « ${file.name} » extrait avec succès. Vous pouvez maintenant vérifier et corriger les données extraites ci-dessous.`;
                    setTimeout(() => this.successMessage = '', 6000);
                    this.validateAllOffers();
                } else {
                    this.errorMessage = data.detail || "Erreur lors de l'extraction du document.";
                }
            } catch (err) {
                this.errorMessage = "Échec du téléchargement : " + err.message;
            } finally {
                this.loading = false;
                this.uploading = false;
                event.target.value = '';
            }
        },

        // Extraction d'une page Web via URL
        async extractFromUrl() {
            if (!this.urlInput || !this.urlInput.trim()) {
                alert("Veuillez renseigner une adresse URL valide.");
                return;
            }

            this.loading = true;
            this.errorMessage = '';

            try {
                const res = await fetch('/api/extract-url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        url: this.urlInput.trim(),
                        offer_id: `url-${Date.now()}`
                    })
                });
                const data = await res.json();
                if (res.ok && data.status === 'success') {
                    this.offers.push(data.offer);
                    this.activeTabOfferIndex = this.offers.length - 1;
                    this.urlInput = '';
                    this.successMessage = `Page Web extraite avec succès. Vous pouvez vérifier les informations extraites ci-dessous.`;
                    setTimeout(() => this.successMessage = '', 6000);
                    this.validateAllOffers();
                } else {
                    this.errorMessage = data.detail || "Impossible d'extraire l'offre depuis cette URL.";
                }
            } catch (err) {
                this.errorMessage = "Échec de connexion : " + err.message;
            } finally {
                this.loading = false;
            }
        },

        // Validation dynamique et recalcul des prix
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

        // Validation unitaire de conformité (côté client pour réactivité immédiate)
        validateSingleOfferClient(offer) {
            const erreurs = [];
            let nbPrest = 0;
            let aHeb = false;

            // 1. Hébergement
            if (offer.hebergement.statut === 'inclus' || offer.hebergement.statut === 'en_supplement') {
                nbPrest++;
                aHeb = true;
            }
            // 2. Transport
            if (offer.transport.statut === 'inclus' || offer.transport.statut === 'en_supplement') {
                nbPrest++;
            }
            // 3. Restauration
            if (offer.restauration.statut === 'inclus' || offer.restauration.statut === 'en_supplement') {
                nbPrest++;
            }
            // 4. Activités
            if (offer.activites.statut === 'inclus' || offer.activites.statut === 'en_supplement') {
                nbPrest++;
            }
            // 5. Guide
            if (offer.guide.statut === 'inclus' || offer.guide.statut === 'en_supplement') {
                nbPrest++;
            }
            // 6. Assurance
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

        // Lancement de la comparaison
        async triggerComparison() {
            if (this.offers.length < 2) {
                alert("Veuillez renseigner ou ajouter au moins deux offres pour lancer la comparaison.");
                return;
            }

            // Vérifier s'il y a des avertissements de conformité
            const nonConformes = this.offers.filter(o => !o.conforme_criteres);
            if (nonConformes.length > 0) {
                const confirmer = confirm(
                    `Attention : ${nonConformes.length} offre(s) ne respectent pas les critères minimaux obligatoires (au moins deux prestations dont un hébergement).\n\nSouhaitez-vous continuer quand même ? Les alertes apparaîtront clairement dans le rapport comparatif.`
                );
                if (!confirmer) return;
            }

            this.loading = true;
            this.errorMessage = '';

            try {
                const res = await fetch('/api/compare', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type_voyage: this.travelType,
                        offres: this.offers,
                        poids: this.weights
                    })
                });

                const data = await res.json();
                if (res.ok && data.status === 'success') {
                    this.comparisonResult = data.result;
                    this.step = 3;
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    this.errorMessage = data.detail || "Erreur lors de l'exécution de la comparaison.";
                }
            } catch (err) {
                this.errorMessage = "Échec du calcul : " + err.message;
            } finally {
                this.loading = false;
            }
        },

        // Recalcul en direct des scores quand les pondérations changent
        async updateWeights() {
            if (this.step !== 3 || !this.comparisonResult) return;
            // Relancer le calcul complet avec les nouveaux poids
            try {
                const res = await fetch('/api/compare', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type_voyage: this.travelType,
                        offres: this.offers,
                        poids: this.weights
                    })
                });
                const data = await res.json();
                if (res.ok && data.status === 'success') {
                    this.comparisonResult = data.result;
                }
            } catch (e) {
                console.error("Erreur mise à jour poids :", e);
            }
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
