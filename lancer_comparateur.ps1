<#
.SYNOPSIS
    Lanceur PowerShell du Comparateur d'Offres Touristiques
#>
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "Comparateur d'Offres Touristiques"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "          COMPARATEUR INDÉPENDANT D'OFFRES TOURISTIQUES               " -ForegroundColor Cyan
Write-Host "   Outil d'analyse pour voyageurs et conseillers en voyages          " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# Se placer dans le dossier du script
Set-Location -Path $PSScriptRoot

# 1. Vérification de Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "[OK] $pythonVersion détecté." -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] Python n'a pas été trouvé. Veuillez installer Python et l'ajouter au PATH." -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour quitter..."
    exit 1
}

# 2. Vérification des dépendances
Write-Host "[INFO] Vérification des modules Python..." -ForegroundColor Yellow
$checkModules = python -c "import fastapi, uvicorn, pydantic, bs4, pypdf, docx, openpyxl; print('OK')" 2>$null
if ($checkModules -ne "OK") {
    Write-Host "[INFO] Installation des dépendances via pip..." -ForegroundColor Yellow
    pip install -r requirements.txt
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERREUR] Échec de l'installation des dépendances." -ForegroundColor Red
        Read-Host "Appuyez sur Entrée pour quitter..."
        exit 1
    }
}

Write-Host "[OK] Modules prêts." -ForegroundColor Green
Write-Host "[INFO] Démarrage du serveur et ouverture automatique du navigateur..." -ForegroundColor Cyan
Write-Host "URL locale : http://127.0.0.1:8000" -ForegroundColor White
Write-Host "Pour quitter : appuyez sur Ctrl+C dans ce terminal." -ForegroundColor DarkGray
Write-Host ""

python run.py
