@echo off
setlocal
cd /d "%~dp0"
echo.
echo ZIVOZONE V1226 - Firebase Production Deploy
if not exist "index.html" (
  echo ERROR: index.html was not found in this directory.
  echo Run this file from the extracted ZIVOZONE_V1226 folder.
  pause
  exit /b 1
)
if not exist "firebase.json" (
  echo ERROR: firebase.json was not found in this directory.
  pause
  exit /b 1
)
echo Deploying from:
cd
firebase use zivozone-fc6ed
if errorlevel 1 exit /b 1
firebase deploy --only hosting
if errorlevel 1 exit /b 1
echo.
echo DEPLOY COMPLETE
pause
