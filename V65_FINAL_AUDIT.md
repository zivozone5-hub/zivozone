# V65 final integration audit

- One home ticker only: z50.
- News backend cache TTL: 24h.
- Arabic + Jordanian + global news aggregation in backend.
- Current match scores from ESPN scoreboard in backend payload.
- AI callable `zivoAI` exported from the main Firebase Functions entry and backed by server-side OpenAI Responses API.
- Challenge engine visible timer: 30 seconds.
- Challenge cards: visual for forensic/horror and safe visual fallback for other challenge categories.
- Server attempt function can create the attempt record atomically if absent, preventing the previous not-found failure.
- Server reward writes player aggregate and immutable wallet ledger.
- Firestore rules keep sensitive progression fields out of client updates.
- No new home-page dashboard or challenge overlay added.
