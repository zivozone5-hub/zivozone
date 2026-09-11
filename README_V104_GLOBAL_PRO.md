ZIVOZONE V104 GLOBAL PRO
- Admin-only command center: raefalbtish@gmail.com
- Admin account excluded from player profiles/economy.
- Responsive luxury admin dashboard with live Firestore user/activity/economy metrics.
- Daily mining: 0.50 ZIVO per 24h, wallet + ledger secured by Firestore rules.
- Mobile-first challenge cards with distinctive icons.
- Existing adaptive challenge engine retained: replay pool biases toward harder questions after strong/perfect results.
- Existing mandatory registration terms retained and enhanced in the V103 layer.
Deploy:
firebase use zivozone-fc6ed
firebase deploy --only hosting,firestore:rules
