/* ZIVOZONE V94 — SINGLE WALLET + AUTH GATE + PERFECT CHALLENGE REWARDS
   Free/Spark compatible. Client-side internal currency only.
*/
(() => {
  'use strict';

  const OWNER_UID = 'rBlzUigQ6DhgD4CK6VX3tS43PS43';
  const FIRESTORE_PATH = ['users'];
  const WALLET_DOC = 'wallet';
  const LEDGER = 'ledger';
  const WALLET_BUTTON_ID = 'zivo-global-wallet';
  const WALLET_OVERLAY_ID = 'zivo-global-wallet-overlay';
  const CLEAN_IDS = [
    'zivo-v85-open','zivo-v85-economy','zivo-v81-open','zivo-v81-economy',
    'v26-open','zivo-v24-balance','z25-wallet-btn','zivo-v80-open',
    'zivo-v81-admin','z80-admin-open','z75-admin-open'
  ];

  const firebaseApp = () => window.firebase;
  const auth = () => { try { return firebaseApp()?.auth?.() || null; } catch (_) { return null; } };
  const db = () => { try { return firebaseApp()?.firestore?.() || null; } catch (_) { return null; } };
  const currentUser = () => { try { return auth()?.currentUser || null; } catch (_) { return null; } };
  const currentUid = () => currentUser()?.uid || null;

  const state = { ready:false, user:null, zivo:0, ledger:[] };

  function money(v){ return Math.max(0, Math.floor(Number(v)||0)); }
  function escapeHtml(v){ return String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function toast(msg){
    let n=document.getElementById('zivo-global-toast');
    if(!n){ n=document.createElement('div'); n.id='zivo-global-toast'; n.className='zivo-global-toast'; document.body.appendChild(n); }
    n.textContent=msg; n.classList.add('show'); clearTimeout(n._t); n._t=setTimeout(()=>n.classList.remove('show'),2600);
  }

  function authReady(maxMs=10000){
    const u=currentUser();
    if(u) return Promise.resolve(u);
    return new Promise(resolve=>{
      let done=false, unsub=null;
      const finish=(user)=>{ if(done)return; done=true; try{unsub?.()}catch(_){}; window.removeEventListener('zivozone-auth', custom); clearTimeout(timer); resolve(user||null); };
      const custom=()=>{ const user=currentUser(); if(user) finish(user); };
      window.addEventListener('zivozone-auth', custom);
      try { const a=auth(); if(a?.onAuthStateChanged) unsub=a.onAuthStateChanged(u=>{ if(u) finish(u); }); } catch(_){}
      const timer=setTimeout(()=>finish(currentUser()), maxMs);
      custom();
    });
  }

  function removeLegacy(){ CLEAN_IDS.forEach(id=>document.getElementById(id)?.remove()); document.querySelectorAll('[data-zivo-master-balance]').forEach(n=>{ if(n.closest('#zivo-global-wallet')) return; }); }

  function style(){
    if(document.getElementById('zivo-v94-style')) return;
    const s=document.createElement('style'); s.id='zivo-v94-style'; s.textContent=`
      #${WALLET_BUTTON_ID}{position:fixed;right:18px;bottom:116px;z-index:110000;display:flex;align-items:center;gap:8px;border:1px solid rgba(255,215,70,.42);border-radius:999px;padding:7px 12px 7px 9px;background:linear-gradient(135deg,rgba(26,20,6,.98),rgba(10,11,16,.98));color:#ffe06a;font-weight:1000;cursor:pointer;box-shadow:0 12px 30px rgba(0,0,0,.35),0 0 0 1px rgba(255,255,255,.03);backdrop-filter:blur(10px)}
      #${WALLET_BUTTON_ID} .z94-coin{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 32% 28%,#fff8bd,#ffd43d 45%,#a36d00);color:#5b3900;border:2px solid #ffeb8a;font-weight:1000;box-shadow:inset 0 2px 4px rgba(255,255,255,.6)}
      #${WALLET_BUTTON_ID} .z94-text{font-size:12px}.z94-balance{font-size:14px;margin-right:2px}
      .zivo-global-overlay{position:fixed;inset:0;z-index:110001;display:none;place-items:center;padding:18px;background:rgba(1,3,8,.78);backdrop-filter:blur(14px)}
      .zivo-global-overlay.open{display:grid}.zivo-global-card{width:min(720px,calc(100vw - 28px));max-height:88vh;overflow:auto;background:#0c121c;color:#fff;border:1px solid rgba(255,255,255,.12);border-radius:24px;padding:22px;box-shadow:0 30px 100px rgba(0,0,0,.55)}
      .zivo-global-head{display:flex;align-items:center;gap:14px}.zivo-global-head h2{margin:3px 0;font-size:20px}.zivo-global-head p{margin:0;opacity:.65;font-size:11px}.zivo-global-coin{width:58px;height:58px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 32% 28%,#fff8bd,#ffd43d 45%,#a36d00);color:#5b3900;border:2px solid #ffeb8a;font-weight:1000;font-size:28px}
      .zivo-global-close{float:left;border:0;background:rgba(255,255,255,.08);color:#fff;width:40px;height:40px;border-radius:10px;font-size:24px;cursor:pointer}.zivo-global-balance{margin:18px 0;padding:18px;border-radius:16px;background:linear-gradient(135deg,rgba(255,215,70,.14),rgba(117,229,255,.06));border:1px solid rgba(255,215,70,.22)}
      .zivo-global-balance small{display:block;opacity:.65}.zivo-global-balance b{display:block;margin-top:5px;font-size:34px;color:#ffe06a}.zivo-global-status{font-size:11px;opacity:.72;margin:8px 0}.zivo-global-list{display:grid;gap:8px}.zivo-global-row{display:grid;grid-template-columns:1fr auto auto;gap:10px;padding:10px;border-bottom:1px solid rgba(255,255,255,.06);font-size:11px}.zivo-global-row b{color:#ffe06a}.zivo-global-note{margin-top:16px;padding:10px;border-radius:12px;background:rgba(255,255,255,.04);font-size:10px;line-height:1.6;opacity:.7}.zivo-global-toast{position:fixed;left:18px;bottom:82px;z-index:110005;padding:11px 14px;background:#111827;color:#fff;border:1px solid rgba(255,255,255,.12);border-radius:12px;font-weight:900;opacity:0;transform:translateY(10px);transition:.2s;pointer-events:none}.zivo-global-toast.show{opacity:1;transform:none}
      @media(max-width:700px){#${WALLET_BUTTON_ID}{right:12px;bottom:104px}.zivo-global-card{padding:16px}.zivo-global-row{grid-template-columns:1fr auto}.zivo-global-row small{grid-column:1/-1}}
    `; document.head.appendChild(s);
  }

  function ensureButton(){
    style(); removeLegacy();
    let b=document.getElementById(WALLET_BUTTON_ID);
    if(!b){
      b=document.createElement('button'); b.id=WALLET_BUTTON_ID; b.type='button'; b.title='ZIVO';
      b.innerHTML='<span class="z94-coin">Z</span><span class="z94-text">ZIVO</span><b class="z94-balance" data-v94-balance>0</b>';
      document.body.appendChild(b);
    }
    b.onclick=(e)=>{ e.preventDefault(); e.stopPropagation(); openWallet(); };
    return b;
  }

  async function readWallet(){
    const u=currentUser(), d=db();
    if(!u || !d){ state.user=null; state.zivo=0; state.ledger=[]; syncUI(); return state; }
    state.user=u;
    const wref=d.collection('users').doc(u.uid).collection('zivozone').doc(WALLET_DOC);
    try{
      const snap=await wref.get();
      if(!snap.exists){
        // Preserve existing balance from user/player records when wallet is first created.
        let seed=0;
        const [ud,pd]=await Promise.all([
          d.collection('users').doc(u.uid).get().catch(()=>null),
          d.collection('players').doc(u.uid).get().catch(()=>null)
        ]);
        seed=Math.max(Number(ud?.data()?.zivo ?? ud?.data()?.coins ?? 0)||0, Number(pd?.data()?.zivo ?? pd?.data()?.coins ?? 0)||0);
        await wref.set({zivo:seed,updatedAt:firebase.firestore.FieldValue.serverTimestamp(),mode:'v94-spark-single-wallet'},{merge:true});
        state.zivo=seed;
      }else state.zivo=money(snap.data()?.zivo);
      const ls=await wref.collection(LEDGER).orderBy('createdAt','desc').limit(50).get().catch(()=>null);
      state.ledger=ls?ls.docs.map(x=>({id:x.id,...x.data()})):[];
    }catch(e){ console.warn('V94 wallet read',e); }
    syncUI(); return state;
  }

  function syncUI(){
    const n=String(money(state.zivo));
    document.querySelectorAll('[data-v94-balance]').forEach(x=>x.textContent=n);
    const legacy=document.querySelector('#profile-coins'); if(legacy) legacy.textContent=n;
    const b=document.querySelector('#zivo-global-balance'); if(b)b.textContent=`${n} ZIVO`;
  }

  async function renderWallet(){
    let o=document.getElementById(WALLET_OVERLAY_ID);
    if(!o){
      o=document.createElement('div'); o.id=WALLET_OVERLAY_ID; o.className='zivo-global-overlay';
      o.innerHTML=`<div class="zivo-global-card" dir="rtl"><button class="zivo-global-close" type="button">×</button><div class="zivo-global-head"><div class="zivo-global-coin">Z</div><div><small>ZIVOZONE GLOBAL ECONOMY</small><h2>محفظة ZIVO</h2><p>رصيد داخلي تجريبي للمنصة.</p></div></div><div class="zivo-global-balance"><small>رصيدك الذهبي</small><b id="zivo-global-balance">0 ZIVO</b></div><div class="zivo-global-status" id="zivo-global-status"></div><h3>آخر المعاملات</h3><div class="zivo-global-list" id="zivo-global-ledger"></div><div class="zivo-global-note">ZIVO حاليًا رصيد داخلي للمنصة فقط. إصدار العملة من جهة العميل ليس مناسبًا لقيمة مالية أو تداول خارجي قبل إضافة Backend موثوق.</div></div>`;
      document.body.appendChild(o);
      o.querySelector('.zivo-global-close').onclick=()=>o.classList.remove('open');
      o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('open')});
    }
    o.classList.add('open');
    await readWallet();
    const status=o.querySelector('#zivo-global-status');
    status.textContent=currentUser()?`مسجل الدخول: ${currentUser().email||''}`:'يرجى تسجيل الدخول.';
    const list=o.querySelector('#zivo-global-ledger');
    list.innerHTML=state.ledger.length?state.ledger.map(x=>`<div class="zivo-global-row"><span>${escapeHtml(x.label||x.type||'معاملة')}</span><b>${Number(x.amount)>0?'+':''}${Number(x.amount)||0}</b><small>${x.createdAt?.toDate?x.createdAt.toDate().toLocaleString('ar-JO'):''}</small></div>`).join(''):'<p style="opacity:.6;font-size:11px">لا توجد معاملات بعد.</p>';
    syncUI();
  }

  async function openWallet(){
    ensureButton();
    const u=await authReady(10000);
    if(!u){ toast('سجّل الدخول أولًا من زر الحساب.'); const login=document.querySelector('#login-btn,[data-action="login"]'); login?.click(); return; }
    await renderWallet();
  }

  async function creditPerfect(detail, source='challenge'){
    const u=await authReady(5000); if(!u) return false;
    const total=Math.max(1,Number(detail?.total ?? detail?.questions ?? 10));
    const correct=Math.max(0,Number(detail?.correct ?? detail?.score ?? 0));
    const timed=Number(detail?.timedOut || 0);
    const perfect=detail?.perfect===true || correct===total;
    if(!perfect || correct!==total || timed>0) return false;
    const d=db(); if(!d)return false;
    const challenge=String(detail?.challenge || detail?.gameId || detail?.challengeId || 'challenge').slice(0,80);
    const eventId=String(detail?.eventId || `${source}_${challenge}_${detail?.attemptId||Date.now()}`).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,120);
    const wref=d.collection('users').doc(u.uid).collection('zivozone').doc(WALLET_DOC);
    const lref=wref.collection(LEDGER).doc(`reward_${eventId}`);
    try{
      let awarded=0;
      await d.runTransaction(async tx=>{
        const [ws,ls]=await Promise.all([tx.get(wref),tx.get(lref)]);
        if(ls.exists) return;
        const current=money(ws.exists?ws.data()?.zivo:0);
        // Engagement bonus is intentionally earned only when the player gets a perfect run.
        const bonus=Math.max(0,Math.min(10,Math.floor(Number(window.ZIVOZONE_ENGAGEMENT?.activeSeconds?.()||0)/600) - Number(window.__zivoV94ClaimedTiers||0)));
        awarded=Math.min(20,10+bonus);
        const next=current+awarded;
        tx.set(wref,{zivo:next,updatedAt:firebase.firestore.FieldValue.serverTimestamp(),mode:'v94-spark-single-wallet'},{merge:true});
        tx.set(d.collection('users').doc(u.uid),{uid:u.uid,email:u.email||'',zivo:next,coins:next,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
        tx.set(d.collection('players').doc(u.uid),{zivo:next,coins:next,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
        tx.set(lref,{type:'challenge_reward',label:`مكافأة العلامة الكاملة — ${challenge}`,amount:awarded,challenge,eventId,source,score:correct,total,perfect:true,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
      });
      if(awarded>0){
        const bonus=Math.max(0,awarded-10); window.__zivoV94ClaimedTiers=(Number(window.__zivoV94ClaimedTiers)||0)+bonus;
        await readWallet(); syncUI(); toast(`مبروك! +${awarded} ZIVO 🪙`); window.dispatchEvent(new CustomEvent('zivozone-reward',{detail:{amount:awarded,challenge,eventId}}));
        return true;
      }
      return false;
    }catch(e){ console.warn('V94 perfect reward failed',e); return false; }
  }

  // Route every known challenge result family into one reward gate.
  const onceKey=new Set();
  function onResult(e){
    const d=e?.detail||{};
    const k=String(d.eventId||`${d.challenge||d.gameId||d.challengeId||'challenge'}:${d.correct??d.score}:${d.total??d.questions}`);
    if(onceKey.has(k))return; onceKey.add(k);
    creditPerfect(d,'event');
  }
  ['zivozone-result','zivozone-progress','zivozone:game-complete','zivozone:challenge-result','zivozone:progress-updated'].forEach(name=>window.addEventListener(name,onResult,true));

  // Override public economy bridge so all existing challenge engines use this single wallet.
  window.ZIVOZONE_ECONOMY=window.ZIVOZONE_ECONOMY||{};
  window.ZIVOZONE_ECONOMY.open=openWallet;
  window.ZIVOZONE_ECONOMY.refresh=readWallet;
  window.ZIVOZONE_ECONOMY.credit=async(amount,type,label,meta)=>{
    if(type==='challenge_reward' || meta?.perfect) return creditPerfect({total:meta?.total||10,correct:meta?.correct||10,perfect:true,challenge:meta?.challenge,eventId:meta?.eventId,timedOut:meta?.timedOut},'bridge');
    return false;
  };
  window.ZIVOZONE_ECONOMY.rewardPerfect=creditPerfect;
  window.ZIVOZONE_ECONOMY.getWallet=()=>({...state});

  // Robust mounting: static DOM + load + auth + retries. One button only.
  function boot(){ ensureButton(); auth()?.onAuthStateChanged?.(()=>{ setTimeout(()=>{ensureButton(); readWallet();},100); }); setTimeout(()=>readWallet(),800); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
  window.addEventListener('load',()=>setTimeout(boot,250));
  setInterval(()=>{ if(document.visibilityState==='visible') readWallet(); },60000);
})();
