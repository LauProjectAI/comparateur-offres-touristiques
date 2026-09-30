@echo off
setlocal
cd /d "%~dp0"

echo ======================================================================
echo           COMPARATEUR INDEPENDANT D'OFFRES TOURISTIQUES
echo ======================================================================
echo Demarrage de l'application...
echo.

python run.py
if %ERRORLEVEL% neq 0 (
    echo Tentative avec le lanceur py...
    py run.py
    if %ERRORLEVEL% neq 0 (
        if exist "%LOCALAPPDATA%\Python\pythoncore-3.14-64\python.exe" (
            "%LOCALAPPDATA%\Python\pythoncore-3.14-64\python.exe" run.py
        ) else (
            echo.
            echo [ERREUR] Impossible de demarrer Python.
            echo Verifiez que Python est bien installe sur votre ordinateur.
            pause
        )
    )
)

endlocal
