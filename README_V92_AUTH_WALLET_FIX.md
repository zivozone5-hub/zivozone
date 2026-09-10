# ZIVOZONE V92 — AUTH/WALLET FIX

Fixes the false "login required" state in the ZIVO wallet by binding wallet operations to the actual Firebase Auth session and listening directly to Firebase Auth state changes.

Also separates cloud-auth identity from local guest/player fallback so guest/local state cannot be mistaken for a signed-in cloud account.

Deploy with:
`firebase deploy --only hosting`

After deployment, hard refresh the site and sign in before testing the wallet or rewards.
