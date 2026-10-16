/* ZIVOZONE V1188 — PUBLIC TEXT CHAT
   Anonymous secondary Firebase identity + Firestore rules + owner moderation.
   V1230.108 — this widget (ساحة ZIVO / "ZIVO Plaza", shown on EVERY page via the floating toggle)
   had never been migrated to i18n at all: every string was a hardcoded Arabic literal, so it showed
   Arabic regardless of the site's selected language — the one disconnected-layer bug in this UI that
   wasn't about CSS overlap (that one was fixed in V1230.105), but about the text itself. Routed
   through the same t() helper every other module uses; see i18n.js's "chat*" keys for the 7-language
   text. applyStatic() refreshes the parts of the markup that are otherwise only ever written once,
   at mount-time, on a mid-session language switch (same pattern as missions.js/daily.js/
   competition.js in V1230.106). */
(()=>{'use strict';
 const CFG=window.ZIVOZONE_FIREBASE_CONFIG;let app=null,auth=null,db=null,user=null,ready=false,unsub=null,lastSend=0,presenceRef=null,presenceTimer=null,initStarted=false;
 const ADMIN=()=>String(window.ZIVOZONE_CONFIG?.ADMIN_EMAIL_NORMALIZED||'').toLowerCase();
 const esc=window.ZIVOZONE_ESC;
 const t=k=>{try{return window.zivoT?window.zivoT(k):(window.ZIVOZONE_I18N?.tr?.(k)||k)}catch(_){return k}};
 const clean=v=>String(v||'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,'').trim().slice(0,280);
 const LOCALE_MAP={ar:'ar-JO',en:'en-US',zh:'zh-CN',hi:'hi-IN',es:'es-ES',fr:'fr-FR',fa:'fa-IR'};
 const currentLocale=()=>LOCALE_MAP[window.ZIVOZONE_I18N?.get?.()||'ar']||'en-US';
 const fmt=v=>v?.toDate?v.toDate().toLocaleTimeString(currentLocale(),{hour:'2-digit',minute:'2-digit'}):'';
 function applyStatic(h){
  h.querySelector('.zpc-toggle>span').textContent=t('chatToggleLabel');
  h.querySelector('.zpc-online').textContent=t('chatOnlineBadge');
  h.querySelector('.zpc-panel header b').textContent=t('chatPanelTitle');
  h.querySelector('.zpc-panel header small').textContent=t('chatPanelSubtitle');
  h.querySelector('.zpc-presence>span').textContent=t('chatPresenceLabel');
  const input=h.querySelector('.zpc-form input');
  if(input)input.placeholder=t('chatInputPlaceholder');
  const submit=h.querySelector('.zpc-form button[type=submit]');
  if(submit)submit.textContent=t('chatSendBtn');
  h.querySelector('.zpc-note').textContent=t('chatFooterNote');
 }
 function mount(){let h=document.getElementById('zivo-public-chat');if(h)return h;h=document.createElement('aside');h.id='zivo-public-chat';h.className='zivo-public-chat';h.dir=document.documentElement.dir||'rtl';h.innerHTML=`<button class="zpc-toggle" aria-expanded="false">💬 <span></span><i class="zpc-online"></i></button><section class="zpc-panel" hidden><header><div><b></b><small></small></div><button class="zpc-close">×</button></header><div class="zpc-presence"><span></span><b data-zpc-count>—</b></div><div class="zpc-messages" aria-live="polite"></div><form class="zpc-form"><input maxlength="280" autocomplete="off" placeholder=""><button type="submit"></button></form><small class="zpc-note"></small></section>`;document.body.appendChild(h);applyStatic(h);
  const panel=h.querySelector('.zpc-panel');h.querySelector('.zpc-toggle').onclick=()=>{panel.hidden=!panel.hidden;h.querySelector('.zpc-toggle').setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden){if(!initStarted){initStarted=true;init()}else load()}};h.querySelector('.zpc-close').onclick=()=>{panel.hidden=true;
    // V1230.19 — COST FIX: closing the panel used to leave the message feed's onSnapshot listener and
    // the 60s presence-ping timer running forever in the background (until the whole page unloads),
    // for a panel the visitor believes they closed. load() already defensively calls unsub?.() before
    // resubscribing on reopen, so detaching here is pure cleanup with no behavior change on reopen.
    unsub?.();unsub=null;clearInterval(presenceTimer);presenceTimer=null;
  };h.querySelector('.zpc-form').onsubmit=send;return h}
 async function init(){mount();if(!CFG||!window.firebase)return;try{app=firebase.apps.find(a=>a.name==='ZIVO_CHAT')||firebase.initializeApp(CFG,'ZIVO_CHAT');auth=app.auth();db=app.firestore();
   try{if(window.ZIVOZONE_SECURITY?.appCheckSiteKey&&firebase.appCheck){firebase.appCheck(app).initializeAppCheck?.({provider:new firebase.appCheck.ReCaptchaEnterpriseProvider(window.ZIVOZONE_SECURITY.appCheckSiteKey),isTokenAutoRefreshEnabled:true})}}catch(e){console.warn('Chat App Check:',e)}
   user=auth.currentUser||await auth.signInAnonymously().then(r=>r.user);ready=!!user;load();
 }catch(e){console.warn('Public chat init:',e)}}
 function render(docs){const box=mount().querySelector('.zpc-messages');box.innerHTML=docs.map(x=>{const d=x.data(),name=d.displayName||t('chatGuestName'),admin=d.authorUid===auth?.currentUser?.uid&&false;return `<article><div><b>${esc(name)}</b><time>${fmt(d.createdAt)}</time></div><p>${esc(d.text)}</p></article>`}).join('')||`<div class="zpc-empty">${esc(t('chatEmptyState'))}</div>`;box.scrollTop=box.scrollHeight}
 function load(){if(!ready||!db)return;unsub?.();let first=true;unsub=db.collection('publicChat').orderBy('createdAt','desc').limit(60).onSnapshot(s=>{const docs=s.docs.reverse();if(!first){const me=auth?.currentUser?.uid;const incoming=s.docChanges().some(ch=>ch.type==='added'&&ch.doc.data()?.authorUid!==me);if(incoming)window.ZIVOZONE_AUDIO?.notification?.()}first=false;render(docs)},e=>console.warn('Chat listen:',e)); startPresence();}
 /* V1229.11 — COST FIX: the "who's online" count used to be a live onSnapshot query. A listener
   re-delivers (and re-bills a read for) every matched document EVERY TIME any of them changes — with
   many concurrent chatters each pinging presence, that is many re-deliveries per minute, each costing
   up to 100 document reads, to EVERY client watching the count. That cost is multiplicative in
   concurrent users (N chatters x M pings x up to 100 docs each), which is exactly the shape that turns
   a sudden popularity spike into a cost spike. An online count does not need second-level precision,
   so it's now a plain periodic read (once per ping cycle, piggybacked on the existing timer) instead
   of a standing listener: cost becomes linear (one bounded read per client per cycle), not
   multiplicative. The live message feed below keeps its onSnapshot — that one delivers new messages,
   which is the feature itself, not a count that can tolerate being periodic. */
  const PRESENCE_PING_MS = 60000, PRESENCE_WINDOW_MS = 150000;
  function pollOnlineCount(){
    db.collection('publicChatPresence').where('lastSeen','>',firebase.firestore.Timestamp.fromMillis(Date.now()-PRESENCE_WINDOW_MS)).limit(100).get()
      .then(s=>{const el=mount().querySelector('[data-zpc-count]');if(el)el.textContent=String(s.size);})
      .catch(()=>{});
  }
  function startPresence(){
    if(!ready||!db||!user)return;
    const ping=()=>{ db.collection('publicChatPresence').doc(user.uid).set({uid:user.uid,lastSeen:firebase.firestore.FieldValue.serverTimestamp()},{merge:true}).catch(()=>{}); pollOnlineCount(); };
    ping();
    clearInterval(presenceTimer);
    presenceTimer=setInterval(ping,PRESENCE_PING_MS);
  }
 async function send(e){e.preventDefault();if(!ready||!user||!db)return;const input=e.currentTarget.querySelector('input'),text=clean(input.value);if(text.length<1||text.length>280)return;if(Date.now()-lastSend<3000){input.placeholder=t('chatRateLimitMsg');return}lastSend=Date.now();input.disabled=true;
  try{const ref=db.collection('publicChat').doc();const rate=db.collection('publicChatRate').doc(user.uid);const now=firebase.firestore.Timestamp.now();const next=new firebase.firestore.Timestamp(now.seconds+3,now.nanoseconds);const batch=db.batch();batch.set(ref,{text,displayName:(window.ZIVOZONE?.Player?.get?.()?.name||t('chatGuestName')).slice(0,24),authorUid:user.uid,language:document.documentElement.lang||'ar',createdAt:firebase.firestore.FieldValue.serverTimestamp()});batch.set(rate,{uid:user.uid,nextAllowedAt:next,lastMessageAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:false});await batch.commit();input.value='';input.placeholder=t('chatInputPlaceholder')}catch(err){console.warn('Chat send:',err);input.placeholder=t('chatSendErrorMsg')}finally{input.disabled=false}}
 function owner(){return String(window.firebase?.auth?.()?.currentUser?.email||'').toLowerCase()===ADMIN()}
 async function moderate(uid,ban=true){if(!owner()||!db)return false;const b=db.collection('publicChatBans').doc(uid);if(ban)await b.set({uid,createdAt:firebase.firestore.FieldValue.serverTimestamp(),reason:'admin'});else await b.delete();return true}
 window.ZIVOZONE=window.ZIVOZONE||{};window.ZIVOZONE.Chat=Object.freeze({init,moderate,isReady:()=>ready,isOwner:owner});window.ZIVOZONE_CHAT=window.ZIVOZONE.Chat;
 // V1230.108 — same live-refresh pattern missions.js/daily.js/competition.js already use: if the
 // visitor switches language while this widget happens to be mounted (it mounts on every page load,
 // 500ms after `load`, well before any language switch could occur), the text baked into innerHTML
 // at mount time would otherwise never update again. Also re-renders the already-loaded message
 // list so its empty-state/guest-name fallback and timestamp locale pick up the new language too.
 window.addEventListener('zivozone-language',()=>{const h=document.getElementById('zivo-public-chat');if(!h)return;applyStatic(h);h.dir=document.documentElement.dir||'rtl';});
 /* V1229.10 — COST FIX: this used to call init() unconditionally for every single page view.
   init() creates a second Firebase app, signs the visitor in anonymously, opens TWO permanent
   onSnapshot listeners (the message feed + the "who's online" presence query), and starts a
   setInterval writing a presence ping every 45s FOREVER — all before the visitor ever touches the
   chat panel. Now Firebase setup only happens the first time someone actually opens the chat (the
   toggle's onclick, above). mount() alone (cheap: just the toggle button's DOM + its onclick wiring,
   no network) still runs on page load, or the button itself would never appear. Visitors who never
   open chat (the large majority, in practice) cost zero chat-related Firestore reads, writes, or
   listeners instead of one anonymous auth session plus two live listeners each. See
   ZIVOZONE_FIREBASE_COST_AUDIT.md, "publicChat / publicChatPresence" for the before/after. */
window.addEventListener('load',()=>setTimeout(mount,500));
})();
