# V1228 State Cache / Economy Integration

`core/state.js` now provides:

- Local-first hydration for player/economy/challenge slices.
- `State.cache.swr()` for stale-while-revalidate data.
- Persistent `localStorage` cache.
- An economy write-behind queue with a 10-second flush cadence.
- Flush attempts on `visibilitychange` / `pagehide`.
- A strict adapter contract so `economy.js` remains the authority for Firestore transactions.

## Economy adapter contract

Register one handler from `core/modules/economy.js`:

```js
window.ZIVOZONE.State.economy.registerSync(async (pendingMutations) => {
  // Use a Firestore transaction/batched write.
  // Each mutation must have an idempotent `id`.
  // Prefer delta/event records instead of trusting a client balance.
  // Return the IDs that were successfully committed.
  return { syncedIds: pendingMutations.map(x => x.id) };
});
```

For semi-static data:

```js
const result = await window.ZIVOZONE.State.cache.swr(
  `levels:${levelSetId}`,
  async ({ cachedValue }) => {
    const snap = await firebase.firestore()
      .collection("levels")
      .doc(levelSetId)
      .get();

    const server = snap.exists ? snap.data() : null;
    const serverVersion = server?.updatedAt?.toMillis?.() || server?.version || 0;
    const cachedVersion = cachedValue?.updatedAtMs || cachedValue?.version || 0;

    if (serverVersion && serverVersion <= cachedVersion) {
      return { changed: false };
    }

    return {
      changed: true,
      value: { ...server, updatedAtMs: serverVersion },
      metadata: { source: "firestore" }
    };
  },
  { ttlMs: 15 * 60 * 1000 }
);

// result.value is available immediately from local cache.
// result.revalidate resolves after the background check.
```

### Important

A browser cache cannot know that Firestore changed without some server signal.
The SWR loader therefore performs a lightweight validation read when it revalidates.
The major savings come from eliminating repeated reads for every render/navigation
and from replacing high-frequency economy writes with a local queue + batched,
idempotent server transaction.

Do not store secrets, auth tokens, or sensitive user data in this cache.
