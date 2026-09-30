$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath('Desktop')
$ShortcutPath = Join-Path $DesktopPath "Comparateur d'offres touristiques.lnk"

$TargetFile = Join-Path $PSScriptRoot "lancer_comparateur.bat"

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $TargetFile
$Shortcut.WorkingDirectory = $PSScriptRoot
$Shortcut.Description = "Comparateur Indépendant d'Offres Touristiques"
$Shortcut.Save()

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Green
Write-Host " [SUCCÈS] Raccourci créé sur votre Bureau Windows !" -ForegroundColor Green
Write-Host " Emplacement : $ShortcutPath" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Green
Write-Host ""
