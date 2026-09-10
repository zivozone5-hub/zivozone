@echo off
setlocal
cd /d "%~dp0"
echo ==========================================
echo ZIVOZONE - Firebase Deployment
echo ==========================================
where firebase >nul 2>nul
if errorlevel 1 (
  echo Firebase CLI is not installed.
  echo Installing Firebase CLI now...
  call npm install -g firebase-tools
  if errorlevel 1 (
    echo Failed to install Firebase CLI.
    pause
    exit /b 1
  )
)
echo.
echo Logging in to Firebase...
firebase login
if errorlevel 1 goto :fail
echo.
echo Deploying Firestore rules, Cloud Functions and Hosting...
firebase deploy --project zivozone-fc6ed --only firestore:rules,functions,hosting
if errorlevel 1 goto :fail
echo.
echo ZIVOZONE deployment completed successfully.
pause
exit /b 0
:fail
echo.
echo Deployment failed. Check the message above.
pause
exit /b 1
