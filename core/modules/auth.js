/* ZIVOZONE V1229 — canonical authentication engine (cloud-only accounts) */
(() => {
  'use strict';
  const KEY='zivozone_account_v6';
  const CONFIG=window.ZIVOZONE_FIREBASE_CONFIG;
  let user=null, player=null, cloud=false, ready=false, auth=null, db=null;
  const t=k=>window.zivoT?window.zivoT(k):k;
  const MIN_AGE=Number(window.ZIVOZONE_CONFIG?.MIN_AGE)||13;
  /* V1230.23: fallback kept in sync with core/config.js's real value (used only if config fails to load). */
  const TERMS_VERSION=window.ZIVOZONE_CONFIG?.TERMS_VERSION||'ZIVO-TERMS-2026.10.1';
  const analyticsConsent=()=>window.ZIVOZONE?.Events?.consent?.get?.()==='granted';
  const defaultPlayer=(u)=>({uid:u.uid,name:u.name||'ZIVO Player',age:Number(u.age)||18,email:u.email||'',level:1,xp:0,coins:0,wins:0,losses:0,gamesPlayed:0,streak:0,bestStreak:0,language:window.ZIVOZONE_I18N?.get?.()||'ar'});
  function saveLocal(){localStorage.setItem(KEY,JSON.stringify({user,player}))}
  function loadLocal(){try{const x=JSON.parse(localStorage.getItem(KEY)||'null');if(x?.user){user=x.user;player=x.player||defaultPlayer(user)}}catch(e){}}
  const VISITOR_KEY='zivozone_visitor_id_v1';
  const visitorId=()=>{let id=localStorage.getItem(VISITOR_KEY);if(!id){id='guest_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,9);localStorage.setItem(VISITOR_KEY,id)}return id};
  // V1230.103 — referral capture ("Invite friends" — see share.js's buildInviteUrl()/invite()).
  // First-touch only (an existing stored code is never overwritten by a later visit), so the person
  // who actually sent the invite keeps credit even if the visitor clicks around before signing up.
  // Deliberately NOT cleared here on read — register() AND onAuthStateChanged's new-account branch
  // both need to read the identical value (whichever of the two actually creates the players/{uid}
  // doc first wins the Firestore "create" op; the other's later merge carries the same value, which
  // Firestore treats as a no-op diff, so neither path can accidentally violate the update rules —
  // see firestore.rules' players/{uid} update rule, which has no path for a `referredBy` key). It is
  // cleared once, a few seconds after a successful registration, by clearReferralSoon() below.
  const REFERRAL_KEY='zivozone_referral_v1';
  function captureReferralFromUrl(){
    try{
      const ref=new URL(location.href).searchParams.get('ref');
      if(ref&&!localStorage.getItem(REFERRAL_KEY))localStorage.setItem(REFERRAL_KEY,String(ref).slice(0,64));
    }catch(e){}
  }
  captureReferralFromUrl();
  function pendingReferral(newUid){
    try{
      const ref=localStorage.getItem(REFERRAL_KEY);
      // A referral code is only ever another account's uid; never attribute someone to themselves
      // (the only way that could happen is a stale code from an earlier device/account on this
      // same browser matching the uid Firebase Auth just assigned the new account).
      return ref&&ref!==newUid?ref:null;
    }catch(e){return null}
  }
  function clearReferralSoon(){setTimeout(()=>{try{localStorage.removeItem(REFERRAL_KEY)}catch(e){}},5000)}
  async function trackGuest(){
    /* V1229: visitor statistics need consent; guests cannot read siteStats, so write-only with bounded fields. */
    if(!cloud||!db||!analyticsConsent())return false;
    try{
      const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Amman'}).format(new Date());
      const id=visitorId(),stamp=firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('siteStats').doc('visitors').collection(day).doc(id).set({visitorId:id,type:'guest',status:'visitor',lastSeenAt:stamp,lastSeenPath:String(location.hash||'#home').slice(0,100),referrer:String(document.referrer||'direct').slice(0,200),language:String(document.documentElement.lang||'ar').slice(0,10),userAgent:navigator.userAgent.slice(0,180),updatedAt:stamp},{merge:true});
      return true;
    }catch(e){console.warn('Guest telemetry:',e);return false}
  }
  // V1230.51 — player-hub.js listens for the Events-bus name 'AUTH_CHANGED' to refresh itself the
  // instant someone logs in or out while its panel is open, but the real auth pipeline only ever
  // dispatched the native 'zivozone-auth' DOM event (which other modules listen to directly) — the
  // two names never met, so the panel only caught up on its own 15s poll. Both now fire from the same
  // place so every real auth change (login, logout, account creation, auth-state sync) reaches both.
  function emit(){window.dispatchEvent(new CustomEvent('zivozone-auth',{detail:{user,player,ready,cloud}}));window.ZIVOZONE?.Events?.emit?.('AUTH_CHANGED',{uid:user?.uid||null,cloud})}
  function firebaseMessage(code){const map={
    'auth/email-already-in-use':t('emailUsed'),
    'auth/invalid-email':t('emailError'),
    'auth/weak-password':t('weakPassword'),
    'auth/wrong-password':t('badLogin'),
    'auth/invalid-credential':t('badLogin'),
    'auth/user-not-found':t('badLogin'),
    'auth/network-request-failed':t('offline'),
    'auth/too-many-requests':t('tooManyRequests')};return map[code]||t('firebaseError')}
  async function initFirebase(){
    if(!CONFIG||!window.firebase||!window.firebase.initializeApp)return false;
    try{
      if(!firebase.apps.length)firebase.initializeApp(CONFIG);
      /* V1230.24: same App Check wiring chat.js already uses on its own secondary app, now applied to
         THIS (default) app too — the one Auth.register()/login() actually run through. Firebase only
         rejects requests from bots once App Check enforcement is turned on for Authentication/Firestore
         in the console (a one-time, no-cost console setting on Spark); this call is what lets a real
         browser pass that check once enforcement is on, and is harmless no-op if it's still off. */
      try{if(window.ZIVOZONE_SECURITY?.appCheckSiteKey&&firebase.appCheck){firebase.appCheck(firebase.app()).initializeAppCheck?.({provider:new firebase.appCheck.ReCaptchaEnterpriseProvider(window.ZIVOZONE_SECURITY.appCheckSiteKey),isTokenAutoRefreshEnabled:true})}}catch(e){console.warn('Auth App Check:',e)}

      auth=firebase.auth();db=firebase.firestore();cloud=true;
      try{auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)}catch(e){}
      try{await db.enablePersistence({synchronizeTabs:true})}catch(e){}
      auth.onAuthStateChanged(async u=>{
        if(!u){user=null;player=null;saveLocal();emit();setTimeout(trackGuest,150);return}
        user={uid:u.uid,email:u.email||'',name:u.displayName||player?.name||'ZIVO Player'};
        const isAdminAccount=String(u.email||'').trim().toLowerCase()===window.ZIVOZONE_CONFIG.ADMIN_EMAIL_NORMALIZED;
        if(isAdminAccount){
          player=null;
          saveLocal();emit();
          return;
        }
        try{
          const snap=await db.collection('players').doc(u.uid).get();
          player=snap.exists?{uid:u.uid,...snap.data()}:defaultPlayer(user);
          if(!snap.exists){
            // V1230.103 — covers the brand-new-Google-account case (loginWithGoogle() never calls
            // register(), so this is the ONLY place that ever creates its players/{uid} doc).
            const ref=pendingReferral(u.uid);
            await db.collection('players').doc(u.uid).set({...player,...(ref?{referredBy:ref}:{}),createdAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
            if(ref)clearReferralSoon();
          }
          await db.collection('users').doc(u.uid).set({uid:u.uid,email:user.email,name:user.name,role:'player',termsAcceptedAt:firebase.firestore.FieldValue.serverTimestamp(),termsVersion:TERMS_VERSION,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
        }catch(e){player=player||defaultPlayer(user);console.warn('Firestore player load:',e)}
        saveLocal();emit();
        // V1230.87 — reconcile local progress (localStorage, device-only) with the cloud copy on
        // every login: adopt whichever side is ahead per field (never regress either one), then
        // push the merged result back so both the account doc and the public leaderboard entry
        // reflect it immediately, not just after the next game. See player.js's hydrateFromCloud().
        try{
          window.ZIVOZONE?.Player?.hydrateFromCloud?.(player);
          const merged=window.ZIVOZONE?.Player?.get?.();
          if(merged)await syncProgress({xp:merged.xp,level:merged.level,streak:merged.streak,bestStreak:Math.max(Number(merged.streak)||0,Number(player?.bestStreak)||0),gamesPlayed:merged.games,bestScore:merged.bestScore});
        }catch(e){console.warn('Progress reconcile:',e)}
      });
      return true;
    }catch(e){console.error('ZIVOZONE Firebase init:',e);cloud=false;return false}
  }
  async function register(data){
    const name=String(data.name||'').trim(),email=String(data.email||'').trim().toLowerCase(),password=String(data.password||''),age=Number(data.age);
    const termsAccepted=data.termsAccepted===true;
    if(email===window.ZIVOZONE_CONFIG.ADMIN_EMAIL_NORMALIZED)throw Error(t('adminEmailReserved'));
    if(!termsAccepted)throw Error(t('termsRequired'));
    if(name.length<2)throw Error(t('nameError'));
    if(!Number.isInteger(age)||age<MIN_AGE||age>100)throw Error(t('ageError'));
    if(!/^\S+@\S+\.\S+$/.test(email))throw Error(t('emailError'));
    if(password.length<6)throw Error(t('passwordError'));
    const old=JSON.parse(localStorage.getItem('zivozone_state_v7')||localStorage.getItem('zivozone_state_v6')||localStorage.getItem('zivozone_state_v5')||'{}');
    if(cloud){
      try{
        const r=await auth.createUserWithEmailAndPassword(email,password),u=r.user;
        await u.updateProfile({displayName:name});
        user={uid:u.uid,email,name,age};
        player={...defaultPlayer(user),xp:Number(old.xp)||0,coins:0,wins:Number(old.wins)||0,gamesPlayed:Number(old.gamesPlayed)||0,level:Number(old.level)||1,language:window.ZIVOZONE_I18N?.get?.()||'ar',termsAcceptedAt:firebase.firestore.FieldValue.serverTimestamp(),termsVersion:TERMS_VERSION};
        // V1230.103 — referral attribution (see pendingReferral()'s note above for why this safely
        // tolerates the pre-existing race with onAuthStateChanged's own players/{uid} creation).
        const ref=pendingReferral(u.uid);
        if(ref)player.referredBy=ref;
        await db.collection('players').doc(u.uid).set({...player,termsAcceptedAt:firebase.firestore.FieldValue.serverTimestamp(),termsVersion:TERMS_VERSION,createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
        if(ref)clearReferralSoon();
        saveLocal();await track('account_created',{source:'website'});emit();return player;
      }catch(e){throw Error(firebaseMessage(e.code))}
    }
    /* V1229: the plaintext local-account fallback was removed. Accounts exist only in Firebase Auth. */
    throw Error(t('firebaseError'));
  }
  async function login(email,password){
    email=String(email||'').trim().toLowerCase();password=String(password||'');
    if(cloud){try{await auth.signInWithEmailAndPassword(email,password);return player}catch(e){throw Error(firebaseMessage(e.code))}}
    throw Error(t('firebaseError'));
  }
  // V1230.87 — one-tap Google sign-in, offered alongside email/password on both the register and
  // login tabs (see app-shell.js's authModal()). onAuthStateChanged above already handles creating
  // the players/{uid} doc for ANY first-time signed-in uid regardless of provider, so a brand-new
  // Google account gets the same defaultPlayer() as a brand-new email account — honestly, this means
  // Google sign-in does NOT go through this app's own MIN_AGE check the way register() does; it
  // relies on Google's own account-age policy instead, same trade-off most sites make for social
  // sign-in. A cancelled/closed popup resolves to null (no error toast), not a thrown error — closing
  // a Google popup is a normal non-event, not a failure worth alarming someone over.
  async function loginWithGoogle(){
    if(!cloud||!auth)throw Error(t('firebaseError'));
    try{
      const provider=new firebase.auth.GoogleAuthProvider();
      const result=await auth.signInWithPopup(provider);
      return {isNewUser:!!result?.additionalUserInfo?.isNewUser};
    }catch(e){
      if(e?.code==='auth/popup-closed-by-user'||e?.code==='auth/cancelled-popup-request')return null;
      throw Error(firebaseMessage(e.code));
    }
  }
  async function logout(){if(cloud&&auth){try{await auth.signOut()}catch(e){}}user=null;player=null;localStorage.removeItem(KEY);emit()}
  async function resetPassword(email){
    email=String(email||'').trim().toLowerCase();
    if(!/^\S+@\S+\.\S+$/.test(email))throw Error(t('emailError'));
    if(!cloud||!auth)throw Error(t('resetCloudOnly'));
    try{
      await auth.sendPasswordResetEmail(email);
    }catch(e){
      // Do not reveal whether an email exists on the platform (account-enumeration protection).
      if(e && e.code!=='auth/user-not-found')throw Error(firebaseMessage(e.code));
    }
    return true;
  }
  async function track(event,meta={}){
    if(!cloud||!db||!user)return false;
    try{
      const payload={event:String(event).slice(0,80),meta,createdAt:firebase.firestore.FieldValue.serverTimestamp()};
      await Promise.all([
        db.collection('players').doc(user.uid).collection('events').add(payload),
        db.collection('users').doc(user.uid).collection('activity').add({...payload,uid:user.uid})
      ]);
      return true;
    }catch(e){console.warn('Event save:',e);return false}
  }
  async function update(patch){
    if(!player)return null;player={...player,...patch,language:patch.language||player.language||window.ZIVOZONE_I18N?.get?.()||'ar'};saveLocal();
    if(cloud&&db){try{const safe={...patch};['xp','zivo','coins','wins','gamesPlayed','level'].forEach(k=>delete safe[k]);if(Object.keys(safe).length)await db.collection('players').doc(player.uid).set({...safe,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})}catch(e){console.warn('Firestore update:',e)}}
    emit();return player;
  }
  // V1230.87 — dedicated, bounded path for XP/level/streak progress, deliberately separate from
  // update() above (which still strips these exact fields — that strip is what keeps update() safe
  // for arbitrary profile patches). Writes the account's private players/{uid} doc AND the narrow
  // public leaderboard/{uid} projection (name/level/xp/streak only, never email) in one go, so a
  // player's public rank updates the moment their real progress does. firestore.rules enforces the
  // same numbers can't just be set to anything (see validProgressUpdate()/validLeaderboardEntry()
  // there for the honest limits of that, on a plan with no server-side Cloud Functions).
  async function syncProgress(patch){
    if(!cloud||!db||!user||!player)return false;
    const stamp=firebase.firestore.FieldValue.serverTimestamp();
    const safe={
      xp:Math.max(0,Math.floor(Number(patch.xp))||0),
      level:Math.max(1,Math.floor(Number(patch.level))||1),
      streak:Math.max(0,Math.floor(Number(patch.streak))||0),
      bestStreak:Math.max(0,Math.floor(Number(patch.bestStreak))||0),
      gamesPlayed:Math.max(0,Math.floor(Number(patch.gamesPlayed))||0),
      bestScore:Math.max(0,Math.floor(Number(patch.bestScore))||0),
      updatedAt:stamp
    };
    try{
      await Promise.all([
        db.collection('players').doc(user.uid).set(safe,{merge:true}),
        db.collection('leaderboard').doc(user.uid).set({uid:user.uid,name:String(player.name||'ZIVO Player').slice(0,24),level:safe.level,xp:safe.xp,streak:safe.streak,...(player.avatar?{avatar:String(player.avatar).slice(0,32)}:{}),updatedAt:stamp},{merge:true})
      ]);
      player={...player,...safe};saveLocal();
      return true;
    }catch(e){console.warn('Progress sync:',e);return false}
  }
  async function saveResult(result){
    if(!cloud||!db||!user)return false;
    try{await db.collection('players').doc(user.uid).collection('results').add({...result,createdAt:firebase.firestore.FieldValue.serverTimestamp()});return true}catch(e){console.warn('Result save:',e);return false}
  }
  async function setLanguage(lang){if(player){player.language=lang;saveLocal();if(cloud&&db){try{await db.collection('players').doc(player.uid).set({language:lang},{merge:true})}catch(e){}}emit()}}
  const isLoggedIn=()=>!!user&&!!player;
  /* V1229.10 — COST FIX: touchSession() writes to THREE documents (players, users, a per-day
     siteStats/visitors entry). It used to run on every single in-app navigation (hashchange), so an
     active user clicking through N sections triggered 3*N writes purely to keep a "last seen"
     timestamp fresh. lastSeenAt does not need navigation-level precision — the 5-minute background
     interval below already guarantees it never goes stale for long — so calls within
     SESSION_TOUCH_MIN_INTERVAL_MS of the last real write are now coalesced into a no-op. The
     visibilitychange and setInterval callers are unaffected in spirit: they still "request" a touch,
     they just no longer force a write if one already happened moments ago. force=true (used nowhere
     yet, kept as an escape hatch) always writes regardless of the throttle. */
  const SESSION_TOUCH_MIN_INTERVAL_MS = 60*1000;
  let lastSessionTouchAt = 0;
  async function touchSession(force){
    if(!user){await trackGuest();return true;}
    if(!force && Date.now()-lastSessionTouchAt < SESSION_TOUCH_MIN_INTERVAL_MS) return true;
    if(user&&cloud&&db){
      try{
        lastSessionTouchAt=Date.now();
        const stamp=firebase.firestore.FieldValue.serverTimestamp();
        const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Amman'}).format(new Date());
        await Promise.all([
          db.collection('players').doc(user.uid).set({lastSeenAt:stamp,lastSeenPath:location.hash||'#home'},{merge:true}),
          db.collection('users').doc(user.uid).set({uid:user.uid,email:user.email,name:user.name,role:'player',lastSeenAt:stamp,lastSeenPath:location.hash||'#home',updatedAt:stamp},{merge:true}),
          db.collection('siteStats').doc('visitors').collection(day).doc(user.uid).set({uid:user.uid,email:user.email,lastSeenAt:stamp},{merge:true})
        ]);
      }catch(e){console.warn('Session touch:',e)}
    }
  }
  async function flushAttempts(){try{await window.ZIVOZONE_V46?.flush?.()}catch(e){}}
  window.addEventListener('hashchange',()=>{ if(user) { touchSession(); if(analyticsConsent()) track('page_view',{path:location.hash||'#home'}); } else { trackGuest(); } });
  window.addEventListener('zivozone-consent',e=>{ if(e.detail?.consent==='granted'&&!user) trackGuest(); });
  document.addEventListener('visibilitychange',()=>{ if(!document.hidden) touchSession(); });
  setInterval(()=>{ if(!document.hidden) touchSession(); },5*60*1000);

  function purgeLegacyLocalAccounts(){
    /* V1229: remove data left by the old offline fallback (it stored passwords in plaintext). */
    try{
      localStorage.removeItem('zivozone_accounts');
      const x=JSON.parse(localStorage.getItem(KEY)||'null');
      if(String(x?.user?.uid||'').startsWith('local_'))localStorage.removeItem(KEY);
    }catch(e){}
  }
  async function init(){purgeLegacyLocalAccounts();loadLocal();await initFirebase();ready=true;emit()}
  const isAdmin=()=>String(user?.email||'').trim().toLowerCase()===window.ZIVOZONE_CONFIG.ADMIN_EMAIL_NORMALIZED;
  const Auth=Object.freeze({register,login,loginWithGoogle,logout,resetPassword,update,syncProgress,saveResult,track,touchSession,flushAttempts,setLanguage,getUser:()=>user,getPlayer:()=>player,isAdmin,isLoggedIn,init,ready:()=>ready,isCloud:()=>cloud});
  window.ZIVOZONE=window.ZIVOZONE||{};
  window.ZIVOZONE.Auth=Auth;
  // Internal modules historically referenced this stable engine name; it is the same object, not a second runtime.
  window.ZIVOZONE_AUTH=Auth;
  init();
})();
