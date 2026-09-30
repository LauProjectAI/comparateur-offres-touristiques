@echo off
cd /d "%~dp0"
echo ======================================================================
echo          PUBLICATION DU PROJET VERS GITHUB (LauProjectAI)
echo ======================================================================
echo.
echo Envoi en cours vers votre depot GitHub...
echo (Une fenetre de connexion GitHub va apparaitre dans votre navigateur si demande)
echo.
git push -u origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo ======================================================================
    echo  [SUCCES] Votre projet est desormais publie sur GitHub !
    echo  Consultez-le sur : https://github.com/LauProjectAI/comparateur-offres-touristiques
    echo ======================================================================
) else (
    echo [NOTE] L'envoi a ete interrompu ou necessite une authentification.
)
echo.
pause
