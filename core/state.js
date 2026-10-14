/* ZIVOZONE V1228 — CENTRAL STATE + LOCAL CACHE
 *
 * Goals:
 *  - Fast local-first reads for semi-static state.
 *  - Stale-While-Revalidate (SWR) for data that can be refreshed in background.
 *  - Persistent local state using localStorage, with IndexedDB available for
 *    larger payloads.
 *  - Economy write-behind queue: accumulate local changes and let Economy
 *    provide the Firebase sync handler. Default flush interval: 10 seconds.
 *
 * IMPORTANT:
 *  State.js does NOT write wallet balances directly to Firestore. Economy
 *  remains the source of truth for financial/economy mutations and should
 *  register a sync handler with State.registerEconomySync().
 *
 * Public API:
 *   State.get(slice)
 *   State.set(slice, patch, options)
 *   State.subscribe(slice, fn)
 *   State.cache.get(key, fallback)
 *   State.cache.set(key, value, ttlMs)
 *   State.cache.swr(key, loader, options)
 *   State.economy.queue(mutation)
 *   State.economy.flush()
 *   State.economy.registerSync(fn)
 */
(() => {
  "use strict";

  const SLICES = [
    "auth", "playerData", "player", "economy", "wallet", "mining", "challenge",
    "missions", "achievements", "sports", "news", "ui", "admin"
  ];

  const CACHE_PREFIX = "zivozone:v1228:";
  const DEFAULT_CACHE_TTL = 5 * 60 * 1000;
  const DEFAULT_ECONOMY_FLUSH_MS = 10 * 1000;
  const MAX_QUEUE_ITEMS = 250;
  const MAX_LOCAL_VALUE_BYTES = 350 * 1024;

  const store = Object.fromEntries(SLICES.map(k => [k, {}]));
  const subscribers = new Map();
  const swrInflight = new Map();

  let economySyncHandler = null;
  let economyFlushTimer = null;
  let economyFlushInFlight = false;

  const now = () => Date.now();

  function safeClone(value) {
    if (value == null) return value;
    try {
      return typeof structuredClone === "function"
        ? structuredClone(value)
        : JSON.parse(JSON.stringify(value));
    } catch (_) {
      return value;
    }
  }

  function jsonBytes(value) {
    try { return new Blob([JSON.stringify(value)]).size; }
    catch (_) {
      try { return JSON.stringify(value).length; } catch (_) { return 0; }
    }
  }

  function storageKey(key) {
    return `${CACHE_PREFIX}${String(key)}`;
  }

  function storageRead(key) {
    try {
      const raw = localStorage.getItem(storageKey(key));
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.warn("[ZIVOZONE.State] localStorage read failed:", err);
      return null;
    }
  }

  function storageWrite(key, envelope) {
    try {
      const bytes = jsonBytes(envelope);
      if (bytes > MAX_LOCAL_VALUE_BYTES) {
        console.warn(`[ZIVOZONE.State] cache item too large (${bytes} bytes):`, key);
        return false;
      }
      localStorage.setItem(storageKey(key), JSON.stringify(envelope));
      return true;
    } catch (err) {
      // QuotaExceededError / Safari private mode / blocked storage.
      console.warn("[ZIVOZONE.State] localStorage write failed:", err);
      return false;
    }
  }

  function storageDelete(key) {
    try { localStorage.removeItem(storageKey(key)); } catch (_) {}
  }

  function get(slice) {
    if (!slice) {
      return Object.fromEntries(SLICES.map(k => [k, { ...store[k] }]));
    }
    return store[slice] ? { ...store[slice] } : {};
  }

  function set(slice, patch = {}, options = {}) {
    if (!SLICES.includes(slice)) {
      console.warn(`[ZIVOZONE.State] unknown slice "${slice}"`);
      return {};
    }

    const next = { ...store[slice], ...patch };
    store[slice] = next;

    if (options.persist !== false) {
      persistSlice(slice, next);
    }

    subscribers.get(slice)?.forEach(fn => {
      try { fn({ ...next }); }
      catch (err) {
        console.error(`[ZIVOZONE.State] subscriber failed for ${slice}`, err);
      }
    });

    window.ZIVOZONE?.Events?.emit?.(
      `${slice.toUpperCase()}_UPDATED`,
      { ...next }
    );

    return { ...next };
  }

  function replace(slice, value = {}, options = {}) {
    if (!SLICES.includes(slice)) return {};
    store[slice] = value && typeof value === "object" ? { ...value } : {};

    if (options.persist !== false) {
      persistSlice(slice, store[slice]);
    }

    subscribers.get(slice)?.forEach(fn => {
      try { fn({ ...store[slice] }); } catch (err) {
        console.error(`[ZIVOZONE.State] subscriber failed for ${slice}`, err);
      }
    });

    window.ZIVOZONE?.Events?.emit?.(
      `${slice.toUpperCase()}_UPDATED`,
      { ...store[slice] }
    );

    return { ...store[slice] };
  }

  function subscribe(slice, fn) {
    if (!SLICES.includes(slice) || typeof fn !== "function") return () => {};
    if (!subscribers.has(slice)) subscribers.set(slice, new Set());
    subscribers.get(slice).add(fn);
    return () => subscribers.get(slice)?.delete(fn);
  }

  function persistSlice(slice, value) {
    storageWrite(`slice:${slice}`, {
      version: 1,
      savedAt: now(),
      value: safeClone(value)
    });
  }

  function hydrateSlice(slice) {
    const envelope = storageRead(`slice:${slice}`);
    if (!envelope?.value) return false;
    replace(slice, envelope.value, { persist: false });
    return true;
  }

  function hydrateSlices(list = SLICES) {
    let count = 0;
    for (const slice of list) {
      if (hydrateSlice(slice)) count++;
    }
    return count;
  }

  function cacheGet(key, fallback = null, options = {}) {
    const envelope = storageRead(`data:${key}`);
    if (!envelope) return fallback;

    const ttl = Number(options.ttlMs ?? envelope.ttlMs ?? DEFAULT_CACHE_TTL);
    const age = now() - Number(envelope.savedAt || 0);

    if (options.requireFresh && age > ttl) return fallback;

    return {
      value: safeClone(envelope.value),
      savedAt: Number(envelope.savedAt || 0),
      ageMs: age,
      stale: age > ttl,
      version: envelope.version || 1,
      metadata: envelope.metadata || null
    };
  }

  function cacheSet(key, value, options = {}) {
    const envelope = {
      version: Number(options.version || 1),
      savedAt: now(),
      ttlMs: Number(options.ttlMs ?? DEFAULT_CACHE_TTL),
      metadata: options.metadata || null,
      value: safeClone(value)
    };

    return storageWrite(`data:${key}`, envelope);
  }

  function cacheRemove(key) {
    storageDelete(`data:${key}`);
  }

  /*
   * SWR:
   * 1) returns cached data immediately when present;
   * 2) starts ONE background loader for the same key;
   * 3) loader decides whether the server result is actually newer;
   * 4) if changed, cache is replaced and onUpdate is called.
   *
   * loader receives:
   *   { cachedValue, cachedMeta, cachedSavedAt, signal }
   *
   * Expected loader result:
   *   { value, changed?: boolean, version?, metadata? }
   *
   * If loader returns {changed:false}, no local write/update occurs.
   */
  async function swr(key, loader, options = {}) {
    if (typeof loader !== "function") {
      throw new TypeError("State.cache.swr requires a loader function");
    }

    const cached = cacheGet(key, null, options);
    const onUpdate = typeof options.onUpdate === "function" ? options.onUpdate : null;
    const onError = typeof options.onError === "function" ? options.onError : null;

    if (!swrInflight.has(key)) {
      const controller = typeof AbortController !== "undefined"
        ? new AbortController()
        : null;

      const promise = Promise.resolve()
        .then(() => loader({
          cachedValue: cached?.value ?? null,
          cachedMeta: cached?.metadata ?? null,
          cachedSavedAt: cached?.savedAt ?? 0,
          signal: controller?.signal
        }))
        .then(result => {
          if (!result || typeof result !== "object") {
            return { changed: false, value: cached?.value ?? null, source: "cache" };
          }

          const changed = result.changed !== false;
          if (changed && "value" in result) {
            cacheSet(key, result.value, {
              ttlMs: options.ttlMs,
              version: result.version || 1,
              metadata: result.metadata || null
            });
            onUpdate?.(safeClone(result.value), result);
          }

          return {
            changed,
            value: "value" in result ? safeClone(result.value) : cached?.value ?? null,
            source: changed ? "server" : "cache"
          };
        })
        .catch(err => {
          onError?.(err);
          return {
            changed: false,
            value: cached?.value ?? null,
            source: "cache",
            error: err
          };
        })
        .finally(() => swrInflight.delete(key));

      swrInflight.set(key, promise);
    }

    const background = swrInflight.get(key);

    return {
      value: cached?.value ?? null,
      stale: !!cached?.stale,
      source: cached ? "cache" : "empty",
      revalidate: background
    };
  }

  // -----------------------------
  // Economy write-behind queue
  // -----------------------------

  function economyQueueKey(uid = "anonymous") {
    return `economyQueue:${String(uid || "anonymous")}`;
  }

  function readEconomyQueue(uid) {
    const envelope = storageRead(economyQueueKey(uid));
    return Array.isArray(envelope?.value) ? envelope.value : [];
  }

  function writeEconomyQueue(uid, queue) {
    return storageWrite(economyQueueKey(uid), {
      version: 1,
      savedAt: now(),
      value: queue.slice(-MAX_QUEUE_ITEMS)
    });
  }

  function queueEconomyMutation(mutation, uid) {
    if (!mutation || typeof mutation !== "object") return false;

    const resolvedUid = uid
      || window.firebase?.auth?.()?.currentUser?.uid
      || "anonymous";

    const queue = readEconomyQueue(resolvedUid);
    queue.push({
      id: mutation.id || `${now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: mutation.createdAt || now(),
      ...safeClone(mutation)
    });

    const ok = writeEconomyQueue(resolvedUid, queue);

    // Keep the UI immediately responsive.
    if (mutation.patch && typeof mutation.patch === "object") {
      set("economy", mutation.patch);
    }

    scheduleEconomyFlush();
    return ok;
  }

  function clearEconomyQueue(uid, ids = null) {
    const resolvedUid = uid
      || window.firebase?.auth?.()?.currentUser?.uid
      || "anonymous";

    if (!ids) {
      storageDelete(economyQueueKey(resolvedUid));
      return;
    }

    const idSet = new Set(ids);
    const next = readEconomyQueue(resolvedUid)
      .filter(item => !idSet.has(item.id));

    if (next.length) writeEconomyQueue(resolvedUid, next);
    else storageDelete(economyQueueKey(resolvedUid));
  }

  function registerEconomySync(fn) {
    economySyncHandler = typeof fn === "function" ? fn : null;
    scheduleEconomyFlush();
    return () => {
      if (economySyncHandler === fn) economySyncHandler = null;
    };
  }

  async function flushEconomy() {
    if (economyFlushInFlight || !economySyncHandler) return false;

    const uid = window.firebase?.auth?.()?.currentUser?.uid;
    if (!uid) return false;

    const queue = readEconomyQueue(uid);
    if (!queue.length) return true;

    economyFlushInFlight = true;

    try {
      /*
       * The registered Economy handler must perform an atomic Firestore
       * transaction / batched write and return:
       *   { syncedIds: string[] }
       *
       * It should never trust a client-provided absolute wallet balance.
       * Prefer signed deltas + idempotent event IDs.
       */
      const result = await economySyncHandler(queue.slice());
      const syncedIds = Array.isArray(result?.syncedIds)
        ? result.syncedIds
        : [];

      if (syncedIds.length) clearEconomyQueue(uid, syncedIds);

      return syncedIds.length > 0;
    } catch (err) {
      console.warn("[ZIVOZONE.State] economy flush failed; queue retained:", err);
      return false;
    } finally {
      economyFlushInFlight = false;
    }
  }

  function scheduleEconomyFlush() {
    if (economyFlushTimer) return;
    economyFlushTimer = setTimeout(async () => {
      economyFlushTimer = null;
      await flushEconomy();
      if (readEconomyQueue(
        window.firebase?.auth?.()?.currentUser?.uid || "anonymous"
      ).length) {
        scheduleEconomyFlush();
      }
    }, DEFAULT_ECONOMY_FLUSH_MS);
  }

  // Flush as soon as the page becomes hidden. This is best-effort; the
  // guaranteed persistence point is the local queue itself.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flushEconomy();
    }
  });

  window.addEventListener("pagehide", () => {
    // No await here: pagehide can terminate JS immediately.
    // The queue is already durable in localStorage.
    flushEconomy();
  });

  // Hydrate fast, before other modules ask for state.
  hydrateSlices([
    "playerData", "player", "economy", "wallet", "mining",
    "challenge", "missions", "achievements"
  ]);

  window.ZIVOZONE = window.ZIVOZONE || {};

  window.ZIVOZONE.State = Object.freeze({
    get,
    set,
    replace,
    subscribe,
    hydrate: hydrateSlices,

    cache: Object.freeze({
      get: cacheGet,
      set: cacheSet,
      remove: cacheRemove,
      swr
    }),

    economy: Object.freeze({
      queue: queueEconomyMutation,
      flush: flushEconomy,
      registerSync: registerEconomySync,
      pending: (uid) => readEconomyQueue(
        uid || window.firebase?.auth?.()?.currentUser?.uid || "anonymous"
      ).length
    }),

    SLICES: Object.freeze([...SLICES]),
    get playerData() { return get("playerData"); }
  });
})();
