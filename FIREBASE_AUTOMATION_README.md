# ZIVOZONE V1228 — Firebase Automation

## Windows
Double-click `START_ZIVOZONE_FIREBASE.bat` or run it from CMD.

## macOS / Linux
Run `chmod +x START_ZIVOZONE_FIREBASE.sh` once, then `./START_ZIVOZONE_FIREBASE.sh`.

The launcher checks Node/npm, installs `firebase-tools` globally if needed, runs `firebase login`, asks for the Firebase Project ID (defaulting to the project in `.firebaserc`), links it with `firebase use`, then starts Hosting + Firestore emulators.

## Local addresses
- Hosting: http://127.0.0.1:5000
- Emulator UI: http://127.0.0.1:4000
- Firestore: http://127.0.0.1:8080

The project `firebase.json` was updated only to add explicit emulator ports; the existing Hosting and Firestore configuration was retained.
