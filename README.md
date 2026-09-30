# Comparateur Indépendant d'Offres Touristiques

Application d'analyse comparative multi-offres pour les **voyageurs** et les **conseillers en voyages**, conçue selon les plus hauts standards de rigueur, de neutralité économique et de traçabilité des données.

---

## 🎯 Fonctionnalités Clés

1. **Parcours guidé par typologie de voyage** :
   - Sélection du projet : **Détente**, **Culturel**, **Nature**, **Professionnel** ou **Sportif**.
   - Adaptation automatique de la grille d'analyse, des priorités logistiques et de l'adéquation géographique.

2. **Acception multicanale sécurisée** :
   - Importation de fichiers **PDF, Word (.docx), Excel (.xlsx)**.
   - Importation via **lien Internet (URL)** avec filtrage et protection contre les attaques SSRF.
   - Saisie manuelle structurée.
   - Échantillons réalistes pré-chargés en 1 clic pour tester immédiatement chaque type de voyage.

3. **Validation stricte des règles métier** :
   - Contrôle d'éligibilité : chaque offre doit comporter **au minimum deux prestations distinctes, dont impérativement un hébergement**.
   - Signalement visuel instantané et blocage argumenté en cas de non-conformité.

4. **Étape d'inspection et de correction interactive** :
   - L'utilisateur peut auditer, valider ou corriger n'importe quelle donnée extraite avant de lancer la comparaison.
   - Chaque information est systématiquement associée à son origine :
     - `[Vendeur (document ou lien)]`
     - `[Vérification indépendante]`
     - `[Déduction de l'application]`
     - `[Non vérifié]` (avec motif factuel, sans dénigrement).

5. **Comparaison côte à côte & Transparence totale** :
   - **Normalisation des prix** : coût global réel, prix par personne, prix par personne et par nuit, détail des taxes de séjour et frais de dossier.
   - **Transport aérien** : distinction nette entre vol direct et vol avec escale, vérification de la mention garantie de la compagnie aérienne.
   - **Hébergement & Emplacement** : analyse de la pertinence géographique par rapport aux objectifs du séjour et historique des avis certifiés (date, volume, source).
   - **Prestations systématiquement qualifiées** : distinction entre *Inclus*, *En supplément*, *Absent* et *Non précisé* (restauration BB, HB, FB, AI, visites/coupe-files, guide francophone, assurance assistance).
   - **Matrice des écarts de périmètre** : met en évidence ce qui est inclus dans une offre mais manquant ou payant dans une autre.
   - **Scoring transparent et paramétrable** : 5 pondérations ajustables en temps réel par l'utilisateur (Budget, Hébergement, Annulation, Prestations, Fiabilité), avec indicateur de complétude et affichage des incertitudes/données manquantes.
   - **Synthèse argumentée & Recommandation motivée** rédigées de façon neutre et adaptée au type de voyage choisi.
   - **Questions clés à poser au vendeur** avant réservation.
   - **Export & Impression** : mise en page soignée pour impression ou génération d'un compte-rendu PDF client.

---

## 🚀 Lancement Rapide

### Option 1 : Lanceur 1-clic Windows (Recommandé)
Double-cliquez simplement sur :
- **[`lancer_comparateur.bat`](file:///c:/Projet%20IA/Chaine%20Tourisme/Comparateur%20d'offres%20touristiques/lancer_comparateur.bat)** dans le dossier du projet, ou
- Sur le raccourci **`Comparateur d'offres touristiques`** créé sur votre Bureau Windows.

*(Pour créer ou recréer le raccourci sur votre Bureau à tout moment, double-cliquez sur `creer_raccourci_bureau.bat`).*

---

### Option 2 : Lancement en ligne de commande

Via **PowerShell** :
```powershell
.\lancer_comparateur.ps1
```

Ou directement avec **Python** :
```bash
python run.py
```

Le serveur démarre immédiatement et votre navigateur s'ouvre automatiquement à l'adresse : **`http://127.0.0.1:8000`**.

---

## 🧪 Tests Automatisés

Le projet comprend une suite complète de tests unitaires et d'intégration validant tous les cas d'usage :
```bash
python -m unittest tests/test_comparator.py
```

---

## 🛡️ Déontologie et Neutralité des Données

- **Aucune hallucination** : l'application n'invente jamais d'avis clients, de prix de marché ou d'immatriculations manquantes.
- **Principe de neutralité économique** : l'absence d'information publique sur une société ou un hébergement est qualifiée de « non vérifié » avec explication neutre, et n'est jamais transformée en jugement péjoratif injustifié.
- **Sécurité des données** : le contenu des documents et pages web est strictement traité comme des données textuelles passives, prévenant toute injection d'instructions.
