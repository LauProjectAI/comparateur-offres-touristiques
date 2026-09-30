import os
import unittest
from app.models.travel_offer import (
    TravelOffer,
    TravelType,
    ServiceStatus,
    SourceOrigin,
    ScoringWeights,
    RestaurationMealPlan
)
from app.services.extractor import (
    extract_text_from_pdf,
    extract_text_from_docx,
    extract_text_from_xlsx,
    parse_offer_text,
    is_safe_url
)
from app.services.normalizer import normalize_offer_prices, validate_offer_compliance
from app.services.sample_data import get_sample_offers_by_type, get_sample_invalid_offer
from app.services.verifier import evaluate_accommodation_location, audit_vendor_and_services
from app.services.comparator import calculate_offer_score, detect_scope_differences
from app.services.advisor import run_full_comparison

class TestComparateurTourisme(unittest.TestCase):

    def test_sample_offers_loaded_for_all_travel_types(self):
        """Vérifie que les 5 types de voyage disposent d'au moins 2 offres conformes"""
        for t in [TravelType.CULTUREL, TravelType.DETENTE, TravelType.NATURE, TravelType.PROFESSIONNEL, TravelType.SPORTIF]:
            offers = get_sample_offers_by_type(t)
            self.assertGreaterEqual(len(offers), 2, f"Le type {t} doit contenir au moins 2 offres")
            for off in offers:
                self.assertTrue(off.conforme_criteres, f"L'offre {off.titre} doit être conforme")
                self.assertTrue(off.contient_hebergement, "L'offre doit contenir un hébergement")
                self.assertGreaterEqual(off.nombre_prestations_incluses, 2, "Au moins 2 prestations requises")

    def test_invalid_offer_detection(self):
        """Vérifie la détection et le signalement explicite d'une offre non conforme (vol seul)"""
        invalid_offer = get_sample_invalid_offer()
        self.assertFalse(invalid_offer.conforme_criteres)
        self.assertFalse(invalid_offer.contient_hebergement)
        self.assertTrue(any("aucun hébergement" in err.lower() for err in invalid_offer.erreurs_conformite))
        self.assertTrue(any("deux prestations" in err.lower() for err in invalid_offer.erreurs_conformite))

    def test_price_normalization(self):
        """Vérifie la normalisation rigoureuse des prix (total, par personne, par personne et par nuit)"""
        offer = get_sample_offers_by_type(TravelType.CULTUREL)[0]
        # Prix annoncé 1840, taxes 24, frais 0 -> total 1864
        # 2 personnes, 4 nuits
        expected_total = 1840.0 + 24.0
        expected_per_pers = round(expected_total / 2, 2)
        expected_per_night = round(expected_total / (2 * 4), 2)
        
        self.assertEqual(offer.prix.prix_total_normalise, expected_total)
        self.assertEqual(offer.prix.prix_par_personne, expected_per_pers)
        self.assertEqual(offer.prix.prix_par_personne_par_nuit, expected_per_night)

    def test_file_extraction_docx(self):
        """Vérifie l'extraction d'un document Word .docx"""
        path = os.path.join("app", "static", "samples", "offre_maroc_imperiale.docx")
        self.assertTrue(os.path.exists(path), "Le fichier exemple Word doit exister")
        with open(path, "rb") as f:
            content = f.read()
        text = extract_text_from_docx(content)
        self.assertIn("Maroc", text)
        self.assertIn("Air France", text)
        
        parsed = parse_offer_text(text, "test-docx", "docx", "offre_maroc_imperiale.docx")
        self.assertTrue(parsed.conforme_criteres)
        self.assertEqual(parsed.transport.compagnie_aerienne, "Air France")
        self.assertTrue(parsed.transport.vol_direct)
        self.assertEqual(parsed.restauration.formule, RestaurationMealPlan.HB)

    def test_file_extraction_xlsx(self):
        """Vérifie l'extraction d'un classeur Excel .xlsx"""
        path = os.path.join("app", "static", "samples", "devis_madere_nature.xlsx")
        self.assertTrue(os.path.exists(path), "Le fichier exemple Excel doit exister")
        with open(path, "rb") as f:
            content = f.read()
        text = extract_text_from_xlsx(content)
        self.assertIn("Madère", text)
        
        parsed = parse_offer_text(text, "test-xlsx", "xlsx", "devis_madere_nature.xlsx")
        self.assertTrue(parsed.conforme_criteres)
        self.assertEqual(parsed.transport.compagnie_aerienne, "TAP Air Portugal")
        self.assertEqual(parsed.restauration.formule, RestaurationMealPlan.BB)

    def test_file_extraction_pdf(self):
        """Vérifie l'extraction d'un fichier PDF"""
        path = os.path.join("app", "static", "samples", "offre_andalousie_culture.pdf")
        self.assertTrue(os.path.exists(path), "Le fichier exemple PDF doit exister")
        with open(path, "rb") as f:
            content = f.read()
        text = extract_text_from_pdf(content)
        self.assertIn("andalousie", text.lower())
        self.assertIn("iberia", text.lower())
        
        parsed = parse_offer_text(text, "test-pdf", "pdf", "offre_andalousie_culture.pdf")
        self.assertTrue(parsed.conforme_criteres)
        self.assertEqual(parsed.transport.compagnie_aerienne, "Iberia")
        self.assertTrue(parsed.transport.vol_direct)

    def test_ssrf_protection_for_urls(self):
        """Vérifie le blocage des adresses IP locales et privées (protection SSRF)"""
        self.assertFalse(is_safe_url("http://localhost:8000/admin"))
        self.assertFalse(is_safe_url("http://127.0.0.1:80/"))
        self.assertFalse(is_safe_url("http://192.168.1.1/router"))
        self.assertFalse(is_safe_url("http://10.0.0.1/"))
        self.assertTrue(is_safe_url("https://www.france.fr/fr/voyages"))

    def test_status_distinctions(self):
        """Vérifie la présence et distinction stricte des 4 statuts réglementaires"""
        allowed = {ServiceStatus.INCLUS, ServiceStatus.EN_SUPPLEMENT, ServiceStatus.ABSENT, ServiceStatus.NON_PRECISE}
        for t in [TravelType.CULTUREL, TravelType.DETENTE]:
            for off in get_sample_offers_by_type(t):
                self.assertIn(off.transport.statut, allowed)
                self.assertIn(off.hebergement.statut, allowed)
                self.assertIn(off.restauration.statut, allowed)
                self.assertIn(off.activites.statut, allowed)
                self.assertIn(off.guide.statut, allowed)
                self.assertIn(off.assurance.statut, allowed)

    def test_flight_direct_vs_stopover_and_airline_naming(self):
        """Vérifie la détection directe/escale et le contrôle du nommage clair de la compagnie"""
        offers = get_sample_offers_by_type(TravelType.CULTUREL)
        direct_offer = offers[0]
        stopover_offer = offers[1]
        
        self.assertTrue(direct_offer.transport.vol_direct)
        self.assertTrue(direct_offer.transport.compagnie_nommee_clairement)
        self.assertEqual(direct_offer.transport.compagnie_aerienne, "Air France")
        
        self.assertFalse(stopover_offer.transport.vol_direct)
        self.assertFalse(stopover_offer.transport.compagnie_nommee_clairement)

    def test_accommodation_location_and_verified_reviews(self):
        """Vérifie l'évaluation de l'emplacement et la traçabilité des avis sans hallucination"""
        offers = get_sample_offers_by_type(TravelType.CULTUREL)
        off_central = audit_vendor_and_services(offers[0], TravelType.CULTUREL)
        off_remote = audit_vendor_and_services(offers[1], TravelType.CULTUREL)
        
        self.assertIn("central", off_central.hebergement.pertinence_emplacement.lower())
        self.assertIn("transports", off_remote.hebergement.pertinence_emplacement.lower())
        
        # Traçabilité des avis
        self.assertTrue(off_central.hebergement.avis_verifie)
        self.assertIsNotNone(off_central.hebergement.avis_note)
        self.assertFalse(off_remote.hebergement.avis_verifie)
        self.assertIn("non vérifié", off_remote.hebergement.avis_source.lower())

    def test_vendor_neutrality_and_absence_of_information(self):
        """Vérifie la neutralité économique : absence d'information non transformée en jugement négatif"""
        offers = get_sample_offers_by_type(TravelType.CULTUREL)
        off_unknown = audit_vendor_and_services(offers[1], TravelType.CULTUREL)
        self.assertIn("non vérifié", off_unknown.vendeur.fiabilite_economique.lower())
        self.assertTrue("ne constitue pas un avis défavorable" in off_unknown.vendeur.fiabilite_explication.lower() or "n'induit aucun avis négatif" in off_unknown.vendeur.fiabilite_explication.lower())

    def test_comparator_engine_full_run(self):
        """Vérifie le fonctionnement complet du comparateur : écarts de périmètre, scoring et synthèse argumentée"""
        offers = get_sample_offers_by_type(TravelType.CULTUREL)
        weights = ScoringWeights(poids_prix=30, poids_hebergement=20, poids_annulation=15, poids_prestations=20, poids_fiabilite=15)
        
        result = run_full_comparison(TravelType.CULTUREL, offers, weights)
        self.assertEqual(result.type_voyage, TravelType.CULTUREL)
        self.assertGreater(len(result.ecarts_perimetre), 0)
        self.assertIn("culturelle", result.synthese_argumentee.lower())
        self.assertIsNotNone(result.recommandation_principale)
        
        # Vérifier la présence et la visibilité des données manquantes dans le score
        score_eco = result.scores["rome-eco"]
        self.assertGreater(len(score_eco.donnees_manquantes), 0)
        self.assertLess(score_eco.completude_donnees_pct, 100.0)

if __name__ == "__main__":
    unittest.main()
