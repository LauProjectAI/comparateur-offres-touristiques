import os
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, Request, UploadFile, File, Form, HTTPException, Query
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

from app.models.travel_offer import (
    TravelOffer,
    TravelType,
    ScoringWeights,
    ComparisonResult
)
from app.services.extractor import (
    extract_text_from_pdf,
    extract_text_from_docx,
    extract_text_from_xlsx,
    extract_text_from_url,
    parse_offer_text
)
from app.services.normalizer import normalize_offer_prices, validate_offer_compliance
from app.services.sample_data import get_sample_offers_by_type, get_sample_invalid_offer
from app.services.advisor import run_full_comparison

app = FastAPI(
    title="Comparateur d'Offres Touristiques",
    description="Outil d'analyse comparative indépendant, rigoureux et transparent pour voyageurs et conseillers en voyages.",
    version="1.0.0"
)

# Montage des fichiers statiques et templates
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
static_dir = os.path.join(BASE_DIR, "static")
templates_dir = os.path.join(BASE_DIR, "templates")

app.mount("/static", StaticFiles(directory=static_dir), name="static")
templates = Jinja2Templates(directory=templates_dir)

class UrlExtractRequest(BaseModel):
    url: str
    offer_id: Optional[str] = "web-offer"

class CompareRequest(BaseModel):
    type_voyage: TravelType
    offres: List[TravelOffer]
    poids: Optional[ScoringWeights] = None

@app.get("/", response_class=HTMLResponse)
async def get_index(request: Request):
    """Affiche l'interface web principale"""
    return templates.TemplateResponse(request=request, name="index.html")

@app.get("/api/sample-offers/{travel_type}")
async def get_samples(travel_type: TravelType):
    """Fournit des offres exemples réalistes pour le type de voyage choisi"""
    offers = get_sample_offers_by_type(travel_type)
    return {"status": "success", "offers": [o.model_dump() for o in offers]}

@app.get("/api/sample-invalid-offer")
async def get_invalid_sample():
    """Fournit une offre non conforme (ex: vol sec sans hébergement) pour tester le signalement d'erreur"""
    invalid = get_sample_invalid_offer()
    return {"status": "success", "offer": invalid.model_dump()}

@app.post("/api/extract-file")
async def extract_from_file(file: UploadFile = File(...), offer_id: str = Form("file-offer")):
    """
    Extrait les données d'une offre depuis un fichier uploadé (PDF, DOCX, XLSX).
    Traite le contenu comme des données pures (sans exécution).
    """
    filename = file.filename or "document"
    ext = filename.split(".")[-1].lower()
    content = await file.read()
    
    if len(content) > 15 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Fichier trop volumineux (limite 15 Mo).")
    
    raw_text = ""
    source_type = "fichier"
    
    if ext == "pdf":
        raw_text = extract_text_from_pdf(content)
        source_type = "pdf"
    elif ext in ["docx", "doc"]:
        raw_text = extract_text_from_docx(content)
        source_type = "docx"
    elif ext in ["xlsx", "xls"]:
        raw_text = extract_text_from_xlsx(content)
        source_type = "xlsx"
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Format '.{ext}' non supporté. Veuillez soumettre un fichier PDF, Word (.docx) ou Excel (.xlsx)."
        )
    
    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Aucun texte exploitable n'a pu être extrait du document.")
        
    offer = parse_offer_text(raw_text, offer_id=offer_id, source_type=source_type, source_ref=filename)
    return {"status": "success", "offer": offer.model_dump(), "extracted_text_preview": raw_text[:500]}

@app.post("/api/extract-url")
async def extract_from_url(payload: UrlExtractRequest):
    """
    Extrait les données d'une offre depuis une page web avec protection SSRF.
    """
    url = payload.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="Veuillez fournir une adresse URL valide.")
        
    text, error = extract_text_from_url(url)
    if error:
        raise HTTPException(status_code=400, detail=error)
        
    offer = parse_offer_text(text, offer_id=payload.offer_id or "url-offer", source_type="url", source_ref=url)
    return {"status": "success", "offer": offer.model_dump(), "extracted_text_preview": text[:500]}

@app.post("/api/validate-offer")
async def validate_single_offer(offer: TravelOffer):
    """
    Vérifie la conformité d'une offre unitaire :
    - Au moins 2 prestations au total
    - Dont au minimum 1 hébergement
    """
    offer = normalize_offer_prices(offer)
    conforme, erreurs, nb_prest, a_heb = validate_offer_compliance(offer)
    return {
        "conforme": conforme,
        "erreurs": erreurs,
        "nombre_prestations": nb_prest,
        "contient_hebergement": a_heb,
        "offer": offer.model_dump()
    }

@app.post("/api/compare")
async def compare_offers(payload: CompareRequest):
    """
    Point d'entrée principal de l'analyse comparative :
    - Vérifie la présence d'au moins 2 offres
    - Règle de conformité par offre (au moins 2 prestations dont 1 hébergement)
    - Normalisation des prix
    - Évaluation de l'emplacement selon le type de voyage
    - Analyse de neutralité de l'entreprise
    - Calcul des écarts de périmètre
    - Calcul des scores pondérés transparents
    - Synthèse argumentée adaptée
    """
    if len(payload.offres) < 2:
        raise HTTPException(
            status_code=400,
            detail="Le comparateur nécessite au minimum deux offres distinctes pour réaliser l'analyse."
        )

    # Normalisation et audit de conformité préalable
    weights = payload.poids or ScoringWeights()
    normalized_offers = []
    
    for off in payload.offres:
        norm_off = normalize_offer_prices(off)
        validate_offer_compliance(norm_off)
        normalized_offers.append(norm_off)

    comparison_result = run_full_comparison(
        travel_type=payload.type_voyage,
        offers=normalized_offers,
        weights=weights
    )

    return {"status": "success", "result": comparison_result.model_dump()}
