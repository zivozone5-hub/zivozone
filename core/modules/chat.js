/* ZIVOZONE V1188 — PUBLIC TEXT CHAT
   Anonymous secondary Firebase identity + Firestore rules + owner moderation.
*/
(()=>{'use strict';
 const CFG=window.ZIVOZONE_FIREBASE_CONFIG;let app=null,auth=null,db=null,user=null,ready=false,unsub=null,lastSend=0,presenceRef=null,presenceTimer=null,initStarted=false;
 const ADMIN=()=>String(window.ZIVOZONE_CONFIG?.ADMIN_EMAIL_NORMALIZED||'').toLowerCase();
 const esc=window.ZIVOZONE_ESC;
 const clean=v=>String(v||'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,'').trim().slice(0,280);
 const fmt=v=>v?.toDate?v.toDate().toLocaleTimeString('ar-JO',{hour:'2-digit',minute:'2-digit'}):'';
 function mount(){let h=document.getElementById('zivo-public-chat');if(h)return h;h=document.createElement('aside');h.id='zivo-public-chat';h.className='zivo-public-chat';h.dir=document.documentElement.dir||'rtl';h.innerHTML=`<button class="zpc-toggle" aria-expanded="false">💬 <span>ساحة ZIVO</span><i class="zpc-online">● متصلون</i></button><section class="zpc-panel" hidden><header><div><b>ساحة ZIVO العامة</b><small>دردشة نصية فقط • احترام الجميع</small></div><button class="zpc-close">×</button></header><div class="zpc-presence"><span>🌐 زوار العالم الآن</span><b data-zpc-count>—</b></div><div class="zpc-messages" aria-live="polite"></div><form class="zpc-form"><input maxlength="280" autocomplete="off" placeholder="اكتب رسالتك للعالم…"><button type="submit">إرسال</button></form><small class="zpc-note">الرجاء احترام الجميع. الرسائل المخالفة يمكن حظر صاحبها.</small></section>`;document.body.appendChild(h);
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
 function render(docs){const box=mount().querySelector('.zpc-messages');box.innerHTML=docs.map(x=>{const d=x.data(),name=d.displayName||'زائر',admin=d.authorUid===auth?.currentUser?.uid&&false;return `<article><div><b>${esc(name)}</b><time>${fmt(d.createdAt)}</time></div><p>${esc(d.text)}</p></article>`}).join('')||'<div class="zpc-empty">كن أول من يبدأ الحديث.</div>';box.scrollTop=box.scrollHeight}
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
 async function send(e){e.preventDefault();if(!ready||!user||!db)return;const input=e.currentTarget.querySelector('input'),text=clean(input.value);if(text.length<1||text.length>280)return;if(Date.now()-lastSend<3000){input.placeholder='انتظر 3 ثوانٍ قبل الرسالة التالية';return}lastSend=Date.now();input.disabled=true;
  try{const ref=db.collection('publicChat').doc();const rate=db.collection('publicChatRate').doc(user.uid);const now=firebase.firestore.Timestamp.now();const next=new firebase.firestore.Timestamp(now.seconds+3,now.nanoseconds);const batch=db.batch();batch.set(ref,{text,displayName:(window.ZIVOZONE?.Player?.get?.()?.name||'زائر').slice(0,24),authorUid:user.uid,language:document.documentElement.lang||'ar',createdAt:firebase.firestore.FieldValue.serverTimestamp()});batch.set(rate,{uid:user.uid,nextAllowedAt:next,lastMessageAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:false});await batch.commit();input.value='';input.placeholder='اكتب رسالتك…'}catch(err){console.warn('Chat send:',err);input.placeholder='تعذر إرسال الرسالة الآن'}finally{input.disabled=false}}
 function owner(){return String(window.firebase?.auth?.()?.currentUser?.email||'').toLowerCase()===ADMIN()}
 async function moderate(uid,ban=true){if(!owner()||!db)return false;const b=db.collection('publicChatBans').doc(uid);if(ban)await b.set({uid,createdAt:firebase.firestore.FieldValue.serverTimestamp(),reason:'admin'});else await b.delete();return true}
 window.ZIVOZONE=window.ZIVOZONE||{};window.ZIVOZONE.Chat=Object.freeze({init,moderate,isReady:()=>ready,isOwner:owner});window.ZIVOZONE_CHAT=window.ZIVOZONE.Chat;
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
