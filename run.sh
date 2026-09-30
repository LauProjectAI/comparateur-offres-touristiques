#!/usr/bin/env bash
# Lanceur pour Linux et macOS
cd "$(dirname "$0")"

echo "======================================================================"
echo "          COMPARATEUR INDÉPENDANT D'OFFRES TOURISTIQUES               "
echo "======================================================================"
echo "Démarrage du serveur et ouverture du navigateur..."

if command -v python3 &>/dev/null; then
    python3 run.py
elif command -v python &>/dev/null; then
    python run.py
else
    echo "[ERREUR] Python 3 n'est pas installé sur ce système."
    exit 1
fi
