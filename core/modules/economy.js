/* ZIVOZONE V1180 — Canonical Economy Core
   Wallet + Mining + Rewards + Ledger in one in-site service.
   No dependency on the legacy ZIVOZONE_ECONOMY runtime.
*/
(() => {
  'use strict';

  const F = () => window.firebase;
  const auth = () => { try { return F()?.auth?.() || null; } catch (_) { return null; } };
  const db = () => { try { return F()?.firestore?.() || null; } catch (_) { return null; } };
  const user = () => auth()?.currentUser || null;
  const cfg = () => window.ZIVOZONE_CONFIG || {};
  const t = (key) => { try { return window.zivoT ? window.zivoT(key) : (window.ZIVOZONE_I18N?.tr?.(key) || key); } catch (_) { return key; } };
  const num = (v) => Math.max(0, Number(v) || 0);
  const LOCALE_MAP = { ar:'ar-JO', en:'en-US', zh:'zh-CN', hi:'hi-IN', es:'es-ES', fr:'fr-FR', fa:'fa-IR' };
  const currentLocale = () => LOCALE_MAP[window.ZIVOZONE_I18N?.get?.() || 'ar'] || 'en-US';
  const esc = window.ZIVOZONE_ESC;

  const state = { uid: null, zivo: 0, ledger: [], nextMiningAt: 0, loading: false };
  const cooldown = () => Number(cfg().MINING_COOLDOWN_MS) || 86400000;
  const admin = (u = user()) => !!u && String(u.email || '').toLowerCase() === String(cfg().ADMIN_EMAIL_NORMALIZED || cfg().ADMIN_EMAIL || '').toLowerCase();
  const root = (uid) => db().collection('users').doc(uid).collection('zivozone');
  // V1230.68 — CRITICAL FIX: rewardClaims lives as its OWN top-level subcollection of the user
  // document (users/{uid}/rewardClaims/{claimId}), a sibling of the 'zivozone' subcollection above,
  // NOT nested inside it. 'zivozone' is itself a CollectionReference (users/{uid}/zivozone), and the
  // Firestore SDK only exposes .collection() on a DocumentReference — never on a CollectionReference.
  // The previous code called root(uid).collection('rewardClaims'), i.e. .collection() directly on
  // that CollectionReference, which throws "r.collection is not a function" at runtime, every single
  // time, for every reward type. credit()'s try/catch swallowed it silently (console.warn + return
  // false), so this went undetected: no reward — challenge, mission, competition, achievement,
  // story, health, beauty, horror, light_escape, or any *_epic_reward — has ever actually been
  // written to Firestore through this path. See firestore.rules' matching fix (rewardClaims is now
  // matched as /rewardClaims/{claimId}, a sibling of /zivozone/..., not /zivozone/rewardClaims/...).
  const rewardClaims = (uid) => db().collection('users').doc(uid).collection('rewardClaims');

  function toast(msg) {
    let x = document.getElementById('zivo-economy-toast');
    if (!x) { x = document.createElement('div'); x.id = 'zivo-economy-toast'; x.className = 'z101-toast'; document.body.appendChild(x); }
    x.textContent = msg;
    x.classList.add('show');
    clearTimeout(x._timer);
    x._timer = setTimeout(() => x.classList.remove('show'), 2600);
  }

  async function ensureWallet(u = user()) {
    const d = db(); if (!u || !d) return false;
    const ref = root(u.uid).doc('wallet');
    const snap = await ref.get();
    if (!snap.exists) {
      const fv = F().firestore.FieldValue;
      await ref.set({ zivo: 0, createdAt: fv.serverTimestamp(), updatedAt: fv.serverTimestamp(), mode: 'zivozone-economy-v1202' }, { merge: false });
    }
    return true;
  }

  async function refresh() {
    const u = user(); state.uid = u?.uid || null;
    if (!u) {
      state.zivo = 0; state.ledger = []; state.nextMiningAt = 0; syncUI(); return { ...state };
    }
    const d = db(); if (!d) { syncUI(); return { ...state }; }
    try {
      await ensureWallet(u);
      const r = root(u.uid), wallet = r.doc('wallet');
      const [ws, ls, ms] = await Promise.all([
        wallet.get(),
        wallet.collection('ledger').orderBy('createdAt', 'desc').limit(25).get().catch(() => null),
        r.doc('mining').get().catch(() => null)
      ]);
      state.zivo = num(ws.data()?.zivo);
      state.ledger = ls ? ls.docs.map(x => ({ id: x.id, ...x.data() })) : [];
      const ts = ms?.data()?.nextMiningAt;
      state.nextMiningAt = ts?.toMillis ? ts.toMillis() : num(ts);
    } catch (e) { console.warn('ZIVO Economy refresh:', e); }
    syncUI();
    return { ...state, ledger: [...state.ledger] };
  }

  function formatBalance(value) {
    const n = Number(value) || 0;
    return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  }

  // V1230.51 — tracks the last balance syncUI() actually announced, so WALLET_UPDATED (below) fires
  // only on a real change rather than on every refresh() tick (refresh() runs on a 30s poll even when
  // nothing changed; emitting unconditionally would just be noise with zero new information).
  let lastAnnouncedZivo = null;

  function syncUI() {
    const bal = `${formatBalance(state.zivo)} ZIVO`;
    document.querySelectorAll('#z101-balance,[data-v101-balance],#zivo-hub-balance').forEach(x => x.textContent = bal);

    const u = user();
    const status = document.getElementById('z101-wallet-status');
    if (status) status.textContent = u ? t('walletConnectedStatus') : t('walletLoginHint');

    const last = [...state.ledger].find(x => x.type === 'daily_mining');
    const lastNode = document.getElementById('z101-last-mining');
    if (lastNode) lastNode.textContent = last?.createdAt?.toDate
      ? `${t('lastMiningPrefix')}${last.createdAt.toDate().toLocaleString(currentLocale(), { dateStyle:'short', timeStyle:'short' })}`
      : t('miningNeverYet');

    updateMiningUI();
    renderLedgerPreview();
    updateHeaderEconomy();

    if (lastAnnouncedZivo !== null && lastAnnouncedZivo !== state.zivo) {
      window.ZIVOZONE?.Events?.emit?.('WALLET_UPDATED', { zivo: state.zivo });
    }
    lastAnnouncedZivo = state.zivo;
  }


  function updateHeaderEconomy() {
    const chip = document.getElementById('zivo-header-economy');
    if (chip) {
      const balance = chip.querySelector('[data-header-balance]');
      if (balance) balance.textContent = formatBalance(state.zivo);
    }
    const mineBtn = document.getElementById('zivo-header-mining');
    if (mineBtn) {
      const u = user();
      const left = Math.max(0, (state.nextMiningAt || 0) - Date.now());
      mineBtn.disabled = !u || left > 0;
      mineBtn.classList.toggle('ready', !!u && left <= 0);
      mineBtn.querySelector('[data-mining-label]')?.replaceChildren(document.createTextNode(left <= 0 ? t('mineChipReady') : `⏳ ${formatMs(left)}`));
      mineBtn.title = !u ? t('mineLoginBtn') : left <= 0 ? t('mineAvailableNow') : `${t('mineNextInPrefix')}${formatMs(left)}`;
    }
  }

  function updateMiningUI() {
    const b = document.getElementById('z101-mine'), c = document.getElementById('z101-countdown');
    const progress = document.getElementById('z101-mining-progress');
    const cycle = cooldown();
    const u = user();
    const left = Math.max(0, (state.nextMiningAt || 0) - Date.now());
    if (b && c) {
      if (!u) {
        b.textContent = t('signIn'); b.disabled = false; c.textContent = t('mineAccountRequired'); c.classList.remove('z101-ready'); if(progress)progress.style.width='0%';
      } else if (left <= 0) {
        b.textContent = t('mineStartBtn'); b.disabled = false; c.textContent = t('mineReadyCaption'); c.classList.add('z101-ready'); if(progress)progress.style.width='100%';
      } else {
        b.textContent = t('mineUpcomingBtn'); b.disabled = true; c.textContent = `${t('mineAvailableInPrefix')}${formatMs(left)}`; c.classList.remove('z101-ready'); const elapsed=Math.max(0,cycle-left); if(progress)progress.style.width=`${Math.min(100,Math.max(0,elapsed/cycle*100))}%`;
      }
      const badge=document.getElementById('z101-mining-badge'); if(badge)badge.textContent=left<=0?t('ready'):t('hours24');
    }
    const mineBtn=document.getElementById('zivo-header-mining');
    if(mineBtn){
      const label=mineBtn.querySelector('[data-mining-label]');
      const ready=!!u&&left<=0;
      mineBtn.disabled=!!u&&left>0;
      mineBtn.classList.toggle('ready',ready);
      if(label) label.textContent=ready?t('mineChipReady'):(!u?t('mineChipLabel'):`⏳ ${formatMs(left)}`);
      mineBtn.title=!u?t('mineLoginBtn'):ready?t('mineAvailableNow'):`${t('mineNextInPrefix')}${formatMs(left)}`;
    }
  }

  function formatMs(ms) {
    const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  }

  async function mine() {
    const u = user(), d = db();
    if (!u) { document.querySelector('#login-btn,[data-action="login"]')?.click(); return false; }
    if (!d) { toast(t('firebaseError')); return false; }
    const button = document.getElementById('z101-mine');
    if (button) { button.disabled = true; button.textContent = t('mineRecording'); }
    try {
      const r = root(u.uid), wallet = r.doc('wallet'), mining = r.doc('mining');
      const claimKey = `${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
      const ledger = wallet.collection('ledger').doc(`mining_${claimKey}`);
      await d.runTransaction(async tx => {
        const [ws, ms] = await Promise.all([tx.get(wallet), tx.get(mining)]);
        const previous = ms.exists ? ms.data()?.nextMiningAt : null;
        const prevMs = previous?.toMillis?.() || Number(previous) || 0;
        const now = Date.now();
        if (prevMs > now) { const e = new Error('not_yet_available'); e.code = 'MINE_NOT_YET'; throw e; }
        const current = num(ws.data()?.zivo), fv = F().firestore.FieldValue;
        const nextAt = new Date(now + cooldown() + 5000);
        tx.set(wallet, { zivo: current + 0.5, updatedAt: fv.serverTimestamp(), mode: 'zivozone-economy-v1202' }, { merge: true });
        tx.set(mining, { lastMiningAt: fv.serverTimestamp(), nextMiningAt: nextAt, amount: 0.5, version: 'v1202' }, { merge: true });
        tx.set(ledger, { type:'daily_mining', label:t('ledgerMiningLabel'), amount:0.5, eventId:ledger.id, createdAt:fv.serverTimestamp(), source:'zivozone-v1127', policy:'24h_mining' });
      });
      await refresh();
      window.ZIVOZONE_AUDIO?.successCoin?.();
      toast(t('mineSuccessToast'));
      // V1230.51 — player-hub.js's recent-activity feed listens for this event name but nothing ever
      // sent it; a real mine was happening (the Firestore transaction above) but never showed up there.
      window.ZIVOZONE?.Events?.emit?.('MINING_COMPLETED', { amount: 0.5 });
      return true;
    } catch (e) {
      console.warn('ZIVO mining:', e);
      toast(e?.code === 'MINE_NOT_YET' ? t('mineNotYetAvailable') : t('mineErrorDetailed'));
      await refresh();
      return false;
    }
  }

  function renderLedgerPreview() {
    const node = document.getElementById('z101-ledger-preview');
    if (!node) return;
    if (!state.ledger.length) {
      node.innerHTML = `<span>${esc(t('ledgerEmpty'))}</span>`;
      return;
    }
    node.innerHTML = state.ledger.slice(0,3).map(x => {
      const amount = Number(x.amount) || 0;
      const label = x.type === 'daily_mining' ? `⛏️ ${t('ledgerMiningLabel')}` : x.type === 'challenge_reward' ? `🏆 ${t('ledgerChallengeLabel')}` : x.type === 'achievement_reward' ? `🏅 ${t('ledgerAchievementLabel')}` : x.type === 'story_reward' ? `📖 ${t('ledgerStoryLabel')}` : x.type === 'health_reward' ? `🏃 ${t('ledgerHealthLabel')}` : x.type === 'beauty_reward' ? `✦ ${t('ledgerBeautyLabel')}` : x.type === 'horror_reward' ? `🌑 ${t('ledgerHorrorLabel')}` : (x.label || x.type || t('ledgerFallbackLabel'));
      return `<div class="z101-ledger-mini"><span>${esc(label)}</span><b>+${formatBalance(amount)}</b></div>`;
    }).join('');
  }

  function open() {
    let o = document.getElementById('zivo-economy-modal');
    if (!o) {
      o = document.createElement('div'); o.id = 'zivo-economy-modal'; o.className = 'z101-overlay';
      document.body.appendChild(o);
      o.addEventListener('click', e => { if (e.target === o) { o.classList.remove('open'); window.ZIVOZONE_AUDIO?.menuClose?.(); } });
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && o.classList.contains('open')) { o.classList.remove('open'); window.ZIVOZONE_AUDIO?.menuClose?.(); } });
    }
    o.innerHTML = `<div class="z101-modal" dir="${document.documentElement.dir || 'rtl'}">
      <div class="z101-modal-head"><div><div class="z101-label">ZIVO HUB</div><h2>${esc(t('walletModalTitle'))}</h2></div><button class="z101-modal-close" aria-label="${esc(t('close'))}">×</button></div>
      <div id="z101-modal-balance" class="z101-modal-balance">${formatBalance(state.zivo)} ZIVO</div>
      <div class="z101-modal-stats"><span><b>${state.ledger.length}</b> ${esc(t('operationsLabel'))}</span><span><b>0.50</b> ZIVO ${esc(t('perMiningSuffix'))}</span></div>
      <div class="z101-ledger"><div class="z101-ledger-title">${esc(t('walletModalLedgerTitle'))}</div><div id="z101-modal-ledger" class="z101-ledger-list"></div></div>
      <div class="z101-note">${esc(t('walletVirtualNote'))}</div>
      <details class="z101-info">
        <summary>ℹ️ ${esc(t('zivoInfoBtn'))}</summary>
        <div class="z101-info-body">
          <p>${esc(t('zivoInfoIntro'))}</p>
          <div class="z101-label">${esc(t('zivoInfoEarnTitle'))}</div>
          <ul class="z101-info-list">
            <li>${esc(t('zivoInfoEarnPerfect'))}</li>
            <li>${esc(t('zivoInfoEarnMining'))}</li>
            <li>${esc(t('zivoInfoEarnAchievement'))}</li>
          </ul>
          <p class="z101-info-legal">${esc(t('zivoInfoLegalBody'))} <a href="/terms/" target="_blank" rel="noopener">${esc(t('footerTerms'))}</a>.</p>
        </div>
      </details>
    </div>`;
    o.querySelector('.z101-modal-close').onclick = () => { o.classList.remove('open'); window.ZIVOZONE_AUDIO?.menuClose?.(); };
    o.querySelector('#z101-modal-ledger').innerHTML = state.ledger.length
      ? state.ledger.map(x => `<div class="z101-ledger-row"><span>${esc(x.label || (x.type === 'daily_mining' ? t('ledgerMiningLabel') : x.type))}</span><b>+${formatBalance(x.amount)}</b><small>${x.createdAt?.toDate ? x.createdAt.toDate().toLocaleString(currentLocale()) : '—'}</small></div>`).join('')
      : `<p>${esc(t('ledgerEmpty'))}</p>`;
    o.classList.add('open');
    window.ZIVOZONE_AUDIO?.menuOpen?.();
  }

  function mountHeaderEconomy() {
    const actions = document.querySelector('.topbar .top-actions');
    if (!actions) return;
    if (!document.getElementById('zivo-header-economy')) {
      const chip = document.createElement('button');
      chip.id = 'zivo-header-economy'; chip.type='button'; chip.className='zivo-header-economy';
      chip.setAttribute('aria-label',t('openWalletAria'));
      chip.setAttribute('data-i18n-aria-label','openWalletAria');
      chip.innerHTML = `<span class="zivo-header-coin">Z</span><span class="zivo-header-balance"><small>ZIVO</small><b data-header-balance>0</b></span>`;
      chip.onclick = open;
      const login = document.getElementById('login-btn'); actions.insertBefore(chip, login || null);
    }
    if (!document.getElementById('zivo-header-mining')) {
      const mineBtn=document.createElement('button');
      mineBtn.id='zivo-header-mining'; mineBtn.type='button'; mineBtn.className='zivo-header-mining-btn';
      mineBtn.innerHTML=`<span data-mining-label>${esc(t('mineChipReady'))}</span>`;
      mineBtn.addEventListener('click',()=>mine());
      const login=document.getElementById('login-btn'); actions.insertBefore(mineBtn, login || null);
    }
  }

  function mountHub() {
    if (document.getElementById('zivo-economy-core')) return;
    const anchor = document.getElementById('home'); if (!anchor) return;
    const rootEl = document.createElement('section');
    rootEl.id = 'zivo-economy-core';
    rootEl.className = 'zivo-economy-core zivo-wallet-only';
    rootEl.setAttribute('aria-label',t('walletAriaLabel'));
    rootEl.innerHTML = `<div class="zivo-economy-head"><div><span class="zivo-economy-kicker">ZIVO ECONOMY</span><h2 data-i18n="walletModalTitle">${esc(t('walletModalTitle'))}</h2><p data-i18n="walletWidgetIntro">${esc(t('walletWidgetIntro'))}</p></div><div class="zivo-economy-total"><span data-i18n="currentBalance">${esc(t('currentBalance'))}</span><strong id="zivo-hub-balance">0 ZIVO</strong></div></div><div class="zivo-economy-grid zivo-economy-single"><article class="zivo-economy-card zivo-wallet-card"><div class="zivo-card-icon zivo-coin-icon">Z</div><div class="zivo-card-main"><span class="zivo-card-label" data-i18n="walletModalTitle">${esc(t('walletModalTitle'))}</span><strong id="z101-balance">0 ZIVO</strong><small id="z101-wallet-status">${esc(t('walletLoginHint'))}</small></div><button id="z101-wallet-open" class="zivo-economy-btn secondary" data-i18n="openWalletBtn">${esc(t('openWalletBtn'))}</button></article></div><div class="zivo-economy-foot"><div><b data-i18n="walletModalLedgerTitle">${esc(t('walletModalLedgerTitle'))}</b><div id="z101-ledger-preview" class="z101-ledger-preview"><span data-i18n="loadingEllipsis">${esc(t('loadingEllipsis'))}</span></div></div><span class="zivo-economy-security" data-i18n="zivoSecurityNote">${esc(t('zivoSecurityNote'))}</span></div>`;
    anchor.insertAdjacentElement('afterend', rootEl);
    rootEl.querySelector('#z101-wallet-open').onclick = open;
    window.addEventListener('zivozone-language', syncUI);
    mountHeaderEconomy();
  }

  function bind() {
    mountHub();
    mountHeaderEconomy();
    auth()?.onAuthStateChanged?.(() => setTimeout(refresh, 100));
    refresh();
    setInterval(() => { if (document.visibilityState === 'visible') refresh(); }, 30000);
    setInterval(updateMiningUI, 1000);
  }

  const processed = new Set();
  // ── Reward Engine (spec §12): Reward Engine → Economy → Ledger → Wallet →
  // State → UI. Single credit primitive, idempotent by claimId, used by every
  // reward source (mining already has its own transaction above; this one is
  // for missions/competition/challenge rewards).
  async function credit(amount, meta = {}) {
    const u = user(), d = db();
    const value = Number(amount) || 0;
    if (!u || !d || value <= 0) return false;

    // One reward contract for every non-mining reward:
    // claim -> wallet -> ledger, committed in ONE Firestore transaction.
    // This keeps Economy and Security Rules on the same data model and makes
    // duplicate event delivery harmless.
    const type = String(meta.type || 'reward');
    const policy = type === 'challenge_reward' ? 'perfect_score_only'
      : type === 'mission_reward' ? 'mission_reward'
      : type === 'competition_reward' ? 'competition_reward'
      : type === 'achievement_reward' ? 'achievement_reward'
      : type === 'story_reward' ? 'story_reward'
      : type === 'health_reward' ? 'health_reward'
      : type === 'beauty_reward' ? 'beauty_reward'
      : type === 'horror_reward' ? 'horror_reward'
      // V1230.59 — Dark Room's "Light Escape": per-world clear + full 50-level clear. Mirrored in
      // firestore.rules' rewardTypeValid()/rewardAmountValid()/validRewardClaim().
      : type === 'light_escape_reward' ? 'light_escape_reward'
      : type === 'light_escape_epic_reward' ? 'light_escape_epic_reward'
      // V1230.60 — the pre-existing bug flagged in 1230.59: every other room's own Epic50
      // "full clear" reward type was never added here, so beauty-room.js, forensic-case-core.js,
      // puzzle-room.js and rooms.js (story/health) have been calling Economy.credit(5,{type:'…
      // _epic_reward'}) since those modes shipped, and every one of those claims was silently
      // rejected right here (policy === '' => credit() returns false) before ever reaching
      // Firestore. Fixed now, mirrored in firestore.rules the same way light_escape's was.
      : type === 'beauty_epic_reward' ? 'beauty_epic_reward'
      : type === 'forensic_epic_reward' ? 'forensic_epic_reward'
      : type === 'puzzle_epic_reward' ? 'puzzle_epic_reward'
      : type === 'story_epic_reward' ? 'story_epic_reward'
      : type === 'health_epic_reward' ? 'health_epic_reward'
      // V1230.70 — football-room.js's new "Tactics Trainer" Epic50 game, added right the first time
      // this time (both here AND firestore.rules in the same change) instead of repeating the
      // 1230.59/1230.60 silently-rejected-claim mistake.
      : type === 'football_epic_reward' ? 'football_epic_reward' : '';
    // V1230.84 — unified every "you finished a test/game perfectly" reward to a flat 5 ZIVO
    // (challenge_reward and the single-game "_reward" room-clears used to pay 10 and 2 respectively;
    // the "_epic_reward" full-room-clear types were already 5). Mirrored exactly in firestore.rules'
    // rewardAmountValid() — these two must always agree, or every claim of the changed types gets
    // silently rejected (see the 1230.68 note elsewhere in this file for what that looks like).
    // Achievement/mission/competition/mining rewards are a different mechanic (badges, daily tasks,
    // leaderboard streaks, time-gated) and are deliberately left untouched.
    const allowed = type === 'challenge_reward' ? value === 5
      : type === 'mission_reward' ? [1,2].includes(value)
      : type === 'competition_reward' ? [1,5].includes(value)
      : type === 'achievement_reward' ? value === 1
      : type === 'story_reward' ? value === 5
      : type === 'health_reward' ? value === 5
      : type === 'beauty_reward' ? value === 5
      : type === 'horror_reward' ? value === 5
      : type === 'light_escape_reward' ? value === 5
      : type === 'light_escape_epic_reward' ? value === 5
      : type === 'beauty_epic_reward' ? value === 5
      : type === 'forensic_epic_reward' ? value === 5
      : type === 'puzzle_epic_reward' ? value === 5
      : type === 'story_epic_reward' ? value === 5
      : type === 'health_epic_reward' ? value === 5
      : type === 'football_epic_reward' ? value === 5 : false;
    if (!policy || !allowed) return false;

    try {
      const r = root(u.uid), wallet = r.doc('wallet');
      await ensureWallet(u);
      const rawClaim = String(meta.claimId || meta.eventId || meta.attemptId || `${type}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`);
      const claimId = rawClaim.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 140) || `reward_${Date.now()}`;
      const claimRef = rewardClaims(u.uid).doc(claimId); // V1230.68 fix — was r.collection(...), see note above root()
      const ledgerRef = wallet.collection('ledger').doc(claimId);

      await d.runTransaction(async tx => {
        const [claimSnap, ledgerSnap, ws] = await Promise.all([
          tx.get(claimRef), tx.get(ledgerRef), tx.get(wallet)
        ]);
        if (claimSnap.exists || ledgerSnap.exists) return;

        const current = num(ws.data()?.zivo);
        const fv = F().firestore.FieldValue;
        const claim = {
          claimId,
          type,
          amount: value,
          status: 'consumed',
          consumedAt: fv.serverTimestamp(),
          policy,
          // V1230.89 — this used to hardcode a literal question count (10, then briefly 20) that had
          // to be kept in sync by hand across economy.js/challenges.js/firestore.rules/functions/* —
          // exactly the mismatch that silently broke every challenge_reward claim twice already (see
          // the V1230.88 note in firestore.rules' perfectClaim() for the full history). Now writes the
          // REAL total/correct from the round that was actually played, whatever the room's question
          // count is this week; firestore.rules' perfectClaim() checks correct==total generically
          // instead of matching a specific number, so a future count change (10→20→10, or anything
          // else) never needs touching this file or the rules again.
          total: type === 'challenge_reward' ? (Number.isFinite(Number(meta.validatedResult?.total)) ? Number(meta.validatedResult.total) : null) : null,
          correct: type === 'challenge_reward' ? (Number.isFinite(Number(meta.validatedResult?.correct)) ? Number(meta.validatedResult.correct) : null) : null,
          timedOut: type === 'challenge_reward' ? 0 : null,
          source: type === 'challenge_reward' ? 'game-platform' : (meta.source || 'economy'),
          validated: type === 'challenge_reward' ? true : null,
          validatedSessionId: type === 'challenge_reward' ? String(meta.validatedResult?.sessionId || '') : null,
          challenge: meta.challenge || null,
          mission: meta.mission || null,
          competition: meta.competition || null,
          achievement: meta.achievement || null,
          story: meta.story || null,
          health: meta.health || null,
          beauty: meta.beauty || null,
          horror: meta.horror || null,
          lightEscape: meta.lightEscape || null
        };
        tx.set(claimRef, claim);
        tx.set(wallet, {
          zivo: current + value,
          updatedAt: fv.serverTimestamp(),
          lastRewardClaimId: claimId,
          mode: 'zivozone-economy-v1202'
        }, { merge: true });
        tx.set(ledgerRef, {
          type, label: meta.label || t('rewardFallbackLabel'), amount: value,
          source: meta.source || 'economy', eventId: claimId,
          createdAt: fv.serverTimestamp(), claimId,
          challenge: meta.challenge || null,
          mission: meta.mission || null,
          competition: meta.competition || null,
          achievement: meta.achievement || null,
          story: meta.story || null,
          health: meta.health || null,
          beauty: meta.beauty || null,
          horror: meta.horror || null,
          lightEscape: meta.lightEscape || null
        });
      });
      await refresh();
      if (type === 'purchase' || type === 'spend') window.ZIVOZONE_AUDIO?.purchaseBurn?.();
      else window.ZIVOZONE_AUDIO?.successCoin?.();
      // V1230.51 — every reward source (missions, competition, achievements, story/health/beauty/
      // horror rooms) already converges on this one credit() transaction, so this is the single real
      // place to announce a reward to player-hub.js's activity feed, instead of duplicating the same
      // emit in each caller. ACHIEVEMENT_UNLOCKED/MISSION_UPDATED get their own dedicated icon there;
      // challenge_reward is skipped because challenges.js already emits CHALLENGE_COMPLETED for the
      // same moment, so emitting here too would just double the same action in the feed.
      if (type === 'achievement_reward') window.ZIVOZONE?.Events?.emit?.('ACHIEVEMENT_UNLOCKED', { achievement: meta.achievement || null });
      else if (type === 'mission_reward') window.ZIVOZONE?.Events?.emit?.('MISSION_UPDATED', { mission: meta.mission || null });
      else if (type !== 'challenge_reward') window.ZIVOZONE?.Events?.emit?.('REWARD_GRANTED', { type, amount: value });
      return true;
    } catch (e) {
      console.warn('ZIVO Economy credit:', e);
      // V1230.68 — this exact catch block is what hid the rewardClaims path bug (see
      // V1229_PHASE1_NOTES.md "## 1230.68") from ever being noticed: it failed every single reward
      // claim, silently, for as long as that bug existed. Report it so a real recurrence (of this or
      // any other future credit() failure) is actually visible somewhere, instead of only a console
      // line nobody is watching.
      window.ZIVOZONE?.ErrorTracker?.report?.(`economy.credit(${type}) failed: ${e?.message || e}`, { stack: e?.stack });
      return false;
    }
  }

  async function addXP(amount) {
    try { window.ZIVOZONE?.Player?.addXP?.(Number(amount) || 0); return true; }
    catch (e) { console.warn('ZIVO Economy addXP:', e); return false; }
  }

  // V1230.61 — reward-forgery hardening. Anchors the START of a real challenge round to a Firestore
  // server timestamp (request.time — the client cannot set this to anything it likes, unlike the
  // plain Date.now() challenges.js used before), so firestore.rules' perfectClaim() can later require
  // a matching sessionId/gameId and a minimum real elapsed time before paying out a challenge_reward.
  // Single fixed doc per user (users/{uid}/zivozone/gameSession), same shape as the existing
  // wallet/mining docs, not an unbounded subcollection — firestore.rules also rate-limits how often
  // this doc can be overwritten, so an attacker can't pre-stage many sessions in a burst and drain
  // them all at once the moment the minimum-elapsed-time window opens for all of them together.
  // Fire-and-forget by design: a network hiccup here must never block or interrupt real gameplay —
  // if the write fails or never lands, the worst case is that a later genuine perfect score's reward
  // claim is rejected by firestore.rules (no reward, not a crash), matching this app's existing
  // graceful-degradation pattern for offline play (queueChallengeResult in challenges.js).
  async function startGameSession({ sessionId, gameId } = {}) {
    const u = user(), d = db();
    const sid = String(sessionId || '').trim(), gid = String(gameId || '').trim();
    if (!u || !d || sid.length <= 5 || !gid) return false;
    try {
      const fv = F().firestore.FieldValue;
      await root(u.uid).doc('gameSession').set({ sessionId: sid, gameId: gid, startedAt: fv.serverTimestamp() }, { merge: false });
      return true;
    } catch (e) { console.warn('ZIVO Economy startGameSession:', e); return false; }
  }

  // Called directly by challenges.js on a perfect round (spec §13). "Perfect" means correct===total
  // for whatever the room's actual question count is — see the V1230.89 note on the claim's
  // total/correct fields above for why this is no longer a hardcoded number.
  async function rewardChallenge({ challengeId, amount, eventId, validatedResult } = {}) {
    const u = user();
    if (!u || admin(u)) return false; // admin test account never accrues challenge rewards
    const value = Number(amount) || 0;
    const vr = validatedResult || {};
    const sessionId = String(vr.sessionId || vr.validatedSessionId || '').trim();
    const total = Number(vr.total), correct = Number(vr.correct);
    const isPerfect = vr.perfect === true
      && Number.isFinite(total) && total > 0
      && correct === total
      && !vr.timedOut
      && (vr.validated === true || vr.gameId);
    if (value !== 5 || !isPerfect || sessionId.length <= 5) return false;
    const claimId = eventId || `challenge_${challengeId || 'x'}_${sessionId}`;
    const ok = await credit(value, {
      type: 'challenge_reward', label: `🏆 ${t('ledgerChallengeLabel')}`, source: 'challenge',
      challenge: challengeId, claimId, validatedResult: {
        sessionId, gameId: String(vr.gameId || challengeId || ''),
        validated: true, perfect: true, total, correct
      }
    });
    if (ok) toast(`🏆 ${t('ledgerChallengeLabel')} +${formatBalance(value)} ZIVO`);
    return ok;
  }

  // Kept for the DOM-event listener path below (onChallenge). Converges on
  // the same claimId as rewardChallenge() so a round that fires both paths
  // is only ever credited once (Final Acceptance §63: no double reward).
  async function rewardPerfect(d = {}) {
    return rewardChallenge({
      challengeId: d.challenge || d.gameId,
      amount: Number(d.zivoReward ?? d.coins ?? 5) || 5,
      eventId: d.eventId || d.attemptId,
      validatedResult: d.validatedResult || d
    });
  }

  function onChallenge(e) {
    const d = e?.detail || {};
    const total = Number(d.total ?? d.questions) || 0, correct = Number(d.correct ?? d.score) || 0;
    if (!user() || admin() || total <= 0 || correct !== total || Number(d.timedOut || 0) !== 0 || d.perfect !== true) return;
    const eventId = String(d.eventId || '').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,100);
    if (!eventId || processed.has(eventId)) return;
    rewardPerfect({ ...d, total, correct, timedOut:0, attemptId:eventId, eventId, validatedResult:d })
      .then(ok => { if (ok) processed.add(eventId); })
      .catch(() => {});
  }
  ['zivozone-result','zivozone-progress','zivozone:game-complete','zivozone:challenge-result','zivozone:progress-updated'].forEach(n => addEventListener(n, onChallenge, true));

  window.ZIVOZONE = window.ZIVOZONE || {};
  window.ZIVOZONE.Economy = Object.freeze({
    open, refresh, getWallet: () => ({ ...state, ledger: [...state.ledger] }), mine,
    rewardPerfect, rewardChallenge, credit, addXP, startGameSession,
    status: () => ({ legacy:false, cloud:!!user(), admin:admin(), version: '1202' })
  });
  window.ZIVOZONE.EconomyVersion = '1141-unified-reward-contract';
  window.dispatchEvent(new CustomEvent('zivozone:module-ready', { detail:{ module:'economy', version: '1202' } }));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(bind, 50)); else setTimeout(bind, 50);
})();
