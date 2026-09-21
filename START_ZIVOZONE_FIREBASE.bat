@echo off
setlocal EnableExtensions EnableDelayedExpansion
title ZIVOZONE V1228 - Firebase Local Launcher
cd /d "%~dp0"

echo.
echo ============================================================
echo              ZIVOZONE V1228 - FIREBASE LAUNCHER
echo ============================================================
echo.

echo [1/5] Checking project files...
if not exist "firebase.json" (echo [ERROR] firebase.json not found.& pause & exit /b 1)
if not exist "firestore.rules" (echo [ERROR] firestore.rules not found.& pause & exit /b 1)
echo [OK] Project root detected.
echo.

echo [2/5] Checking Node.js and npm...
where npm >nul 2>&1
if errorlevel 1 (echo [ERROR] npm/Node.js is not installed. Install Node.js LTS first.& pause & exit /b 1)
node --version
echo.

echo [3/5] Checking Firebase CLI...
where firebase >nul 2>&1
if errorlevel 1 (
  echo [INFO] firebase-tools not found. Installing globally...
  call npm install -g firebase-tools
  if errorlevel 1 (echo [ERROR] Global Firebase CLI installation failed.& pause & exit /b 1)
) else (echo [OK] Firebase CLI is already installed.)
call firebase --version
echo.

echo [4/5] Firebase login...
echo [INFO] A browser may open. Complete Google/Firebase authentication.
call firebase login
if errorlevel 1 (echo [ERROR] Firebase login failed or was cancelled.& pause & exit /b 1)
echo [OK] Login completed.
echo.

echo [INFO] Current Firebase project from .firebaserc:
for /f "tokens=2 delims=:, " %%A in ('findstr /C:"default" .firebaserc') do echo        %%~A
echo.
set "PROJECT_ID="
set /p "PROJECT_ID=Enter Firebase Project ID (default: zivozone-fc6ed): "
if "!PROJECT_ID!"=="" set "PROJECT_ID=zivozone-fc6ed"

echo [INFO] Linking project: !PROJECT_ID!
call firebase use "!PROJECT_ID!"
if errorlevel 1 (echo [ERROR] Could not select Firebase project.& pause & exit /b 1)
echo [OK] Project linked.
echo.

echo [5/5] Starting Firebase Hosting + Firestore Emulators...
echo.
echo Local URLs after startup:
echo   Hosting : http://127.0.0.1:5000
echo   Emulator UI : http://127.0.0.1:4000
echo   Firestore : http://127.0.0.1:8080
echo.
echo Press Ctrl+C to stop the emulators.
echo.
call firebase emulators:start
set "EXIT_CODE=%ERRORLEVEL%"
echo.
echo [INFO] Firebase Emulators stopped. Exit code: %EXIT_CODE%
pause
exit /b %EXIT_CODE%
