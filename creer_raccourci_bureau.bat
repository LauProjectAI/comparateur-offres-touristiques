@echo off
title Raccourci Bureau
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0creer_raccourci_bureau.ps1"
pause
