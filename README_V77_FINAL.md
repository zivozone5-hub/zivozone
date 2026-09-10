# ZIVOZONE V77 — Final Production Package

## Included
- Firebase Authentication: Email/Password + Google.
- Owner admin bootstrap restricted to the configured owner UID and email.
- Admin monitor at `#admin`.
- Firestore rules for users, player data, question history, wallets, results, admin identity, and server-only stats.
- Sports and general Arabic news rails.
- GitHub Actions hourly news refresh at minute 17 of every hour.

## Owner account
- Email: `raefalbtish@gmail.com`
- UID: `rBlzUigQ6DhgD4CK6VX3tS43PS43`

## Deployment
1. `firebase login`
2. `firebase use zivozone-fc6ed`
3. `firebase deploy --only functions,firestore:rules`
4. Push the website files to the GitHub repository used by ZIVOZONE.

Do not place service-account credentials in the website.
