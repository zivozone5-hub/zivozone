#!/usr/bin/env bash
set -u
cd "$(dirname "${BASH_SOURCE[0]}")"

echo
echo "============================================================"
echo "             ZIVOZONE V1228 - FIREBASE LAUNCHER"
echo "============================================================"
echo

echo "[1/5] Checking project files..."
[[ -f firebase.json ]] || { echo "[ERROR] firebase.json not found."; exit 1; }
[[ -f firestore.rules ]] || { echo "[ERROR] firestore.rules not found."; exit 1; }
echo "[OK] Project root detected."
echo

echo "[2/5] Checking Node.js and npm..."
command -v npm >/dev/null 2>&1 || { echo "[ERROR] npm/Node.js is not installed. Install Node.js LTS first."; exit 1; }
node --version
echo

echo "[3/5] Checking Firebase CLI..."
if ! command -v firebase >/dev/null 2>&1; then
  echo "[INFO] firebase-tools not found. Installing globally..."
  npm install -g firebase-tools || { echo "[ERROR] Global Firebase CLI installation failed."; exit 1; }
else
  echo "[OK] Firebase CLI is already installed."
fi
firebase --version
echo

echo "[4/5] Firebase login..."
echo "[INFO] A browser may open. Complete Google/Firebase authentication."
firebase login || { echo "[ERROR] Firebase login failed or was cancelled."; exit 1; }
echo "[OK] Login completed."
echo

DEFAULT_PROJECT="zivozone-fc6ed"
if command -v python3 >/dev/null 2>&1; then
  DETECTED_PROJECT=$(python3 -c 'import json; print(json.load(open(".firebaserc")).get("projects",{}).get("default",""))' 2>/dev/null || true)
  [[ -n "${DETECTED_PROJECT:-}" ]] && DEFAULT_PROJECT="$DETECTED_PROJECT"
fi
echo "[INFO] Detected/default Firebase project: $DEFAULT_PROJECT"
read -r -p "Enter Firebase Project ID (press Enter for $DEFAULT_PROJECT): " PROJECT_ID
PROJECT_ID="${PROJECT_ID:-$DEFAULT_PROJECT}"

echo "[INFO] Linking project: $PROJECT_ID"
firebase use "$PROJECT_ID" || { echo "[ERROR] Could not select Firebase project."; exit 1; }
echo "[OK] Project linked."
echo

echo "[5/5] Starting Firebase Hosting + Firestore Emulators..."
echo
echo "Local URLs after startup:"
echo "  Hosting : http://127.0.0.1:5000"
echo "  Emulator UI : http://127.0.0.1:4000"
echo "  Firestore : http://127.0.0.1:8080"
echo
echo "Press Ctrl+C to stop the emulators."
echo
firebase emulators:start
EXIT_CODE=$?
echo
echo "[INFO] Firebase Emulators stopped. Exit code: $EXIT_CODE"
exit $EXIT_CODE
