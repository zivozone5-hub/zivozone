/* ZIVOZONE V101 — UNIFIED MOBILE-FIRST ECONOMY CORE
   Single wallet + server-authoritative ZIVO + 24h daily mining + unified rewards.
*/
(() => {
  'use strict';
  const F=()=>window.firebase;
  const auth=()=>{try{return F()?.auth?.()||null}catch(_){return null}};
  const db=()=>{try{return F()?.firestore?.()||null}catch(_){return null}};
  const user=()=>auth()?.currentUser||null;
  const state={uid:null,zivo:0,ledger:[],nextMiningAt:0,loading:false};
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const num=v=>Math.max(0,Number(v)||0);
  const toast=(msg)=>{let x=document.getElementById('zivo-v101-toast');if(!x){x=document.createElement('div');x.id='zivo-v101-toast';x.className='z101-toast';document.body.appendChild(x)}x.textContent=msg;x.classList.add('show');clearTimeout(x._t);x._t=setTimeout(()=>x.classList.remove('show'),2600)};

  function injectStyle(){
    if(document.getElementById('zivo-v101-style'))return;
    const s=document.createElement('style');s.id='zivo-v101-style';s.textContent=`
      :root{--z-gold:#ffd43d;--z-gold2:#ffe889;--z-bg:#090d14;--z-panel:#101722}
      .z101-economy{width:min(1180px,calc(100% - 28px));margin:8px auto 2px;display:grid;grid-template-columns:1fr 1fr;gap:8px;position:relative;z-index:3}
      .z101-card{border:1px solid rgba(255,215,70,.16);border-radius:14px;background:linear-gradient(145deg,rgba(255,215,70,.07),rgba(255,255,255,.02));box-shadow:0 8px 24px rgba(0,0,0,.16);padding:9px 11px}
      .z101-wallet{display:flex;align-items:center;gap:9px;min-height:58px}.z101-coin{width:38px;height:38px;flex:0 0 38px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 30% 25%,#fff7bd,#ffd43d 44%,#9c6700);border:2px solid #ffe889;color:#5b3900;font-weight:1000;font-size:18px;box-shadow:inset 0 2px 5px rgba(255,255,255,.55)}
      .z101-label{font-size:10px;opacity:.62;font-weight:900}.z101-balance{font-size:18px;font-weight:1000;color:#ffe06a;line-height:1.1;margin-top:4px}.z101-sub{font-size:10px;opacity:.62;margin-top:5px}.z101-wallet-actions{margin-inline-start:auto}.z101-btn{border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:#fff;border-radius:11px;padding:9px 12px;font-weight:950;cursor:pointer}.z101-btn.primary{background:linear-gradient(90deg,#ffd43d,#ffed8a);color:#17120a;border-color:#ffd43d}.z101-btn:disabled{opacity:.5;cursor:not-allowed}
      .z101-mining{display:flex;align-items:center;gap:8px;min-height:58px}.z101-mining-icon{font-size:21px}.z101-mining h3{margin:0;font-size:12px}.z101-mining p{margin:2px 0 0;font-size:8px;opacity:.65}.z101-mine-action{margin-inline-start:auto;min-width:132px}.z101-countdown{font-size:13px;font-weight:1000;color:#ffe06a;margin-top:5px;letter-spacing:.5px}.z101-ready{color:#7df0a4}.z101-ledger{margin-top:12px;border-top:1px solid rgba(255,255,255,.07);padding-top:8px}.z101-ledger-title{font-size:10px;opacity:.6;font-weight:900}.z101-ledger-list{max-height:110px;overflow:auto}.z101-ledger-row{display:grid;grid-template-columns:1fr auto;gap:8px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:10px}.z101-ledger-row b{color:#ffe06a}.z101-ledger-row small{grid-column:1/-1;opacity:.45}.z101-note{font-size:9px;opacity:.55;margin-top:9px;line-height:1.5}
      .z101-overlay{position:fixed;inset:0;z-index:120000;display:none;place-items:center;padding:16px;background:rgba(0,0,0,.72);backdrop-filter:blur(12px)}.z101-overlay.open{display:grid}.z101-modal{width:min(720px,calc(100vw - 28px));max-height:88vh;overflow:auto;background:#0d141f;color:#fff;border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:18px}.z101-modal-head{display:flex;justify-content:space-between;align-items:center;gap:10px}.z101-modal-close{width:38px;height:38px;border:0;border-radius:10px;background:rgba(255,255,255,.08);color:#fff;font-size:22px;cursor:pointer}.z101-modal h2{margin:0}.z101-modal p{font-size:11px;opacity:.68}.z101-modal-balance{font-size:34px;color:#ffe06a;font-weight:1000;margin:16px 0}.z101-toast{position:fixed;left:16px;bottom:84px;z-index:130000;background:#111827;color:#fff;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:10px 13px;font-weight:900;opacity:0;transform:translateY(10px);transition:.2s;pointer-events:none}.z101-toast.show{opacity:1;transform:none}
      /* remove old floating economy / quick docks so there is exactly one wallet */
      #zivo-global-wallet,#zivo-v85-open,#zivo-v85-economy,#zivo-v81-open,#zivo-v81-economy,#zivo-v80-open,#z80-admin-open,#zivo-v87-quickdock,#v26-open,#zivo-v24-balance,#z25-wallet-btn{display:none!important} #z81-admin-open{display:flex!important}
      @media(max-width:760px){.z101-economy{grid-template-columns:1fr 1fr;width:calc(100% - 14px);margin-top:5px;gap:6px}.z101-card{padding:8px;border-radius:13px}.z101-wallet{min-height:52px}.z101-coin{width:34px;height:34px;flex-basis:34px;font-size:16px}.z101-balance{font-size:16px}.z101-label{font-size:8px}.z101-sub{font-size:7px}.z101-wallet-actions{display:none}.z101-mining{align-items:center;min-height:52px}.z101-mining-icon{font-size:18px}.z101-mining p{display:none}.z101-mine-action{min-width:82px}.z101-btn{padding:7px 7px;font-size:9px}.z101-countdown{font-size:11px}.z101-mining h3{font-size:10px}}
    `;document.head.appendChild(s);
  }

  function mountHub(){
    injectStyle();
    if(document.getElementById('zivo-v101-economy'))return;
    const h=document.querySelector('header.topbar');if(!h)return;
    const root=document.createElement('section');root.id='zivo-v101-economy';root.className='z101-economy';root.setAttribute('aria-label','ZIVO Economy');
    root.innerHTML=`
      <article class="z101-card z101-wallet">
        <div class="z101-coin">Z</div><div><div class="z101-label">ZIVO WALLET</div><div id="z101-balance" class="z101-balance">0 ZIVO</div><div id="z101-wallet-status" class="z101-sub">سجّل الدخول لحفظ رصيدك ومكافآتك.</div></div>
        <div class="z101-wallet-actions"><button id="z101-wallet-open" class="z101-btn">المحفظة</button></div>
      </article>
      <article class="z101-card z101-mining">
        <div class="z101-mining-icon">⛏️</div><div><h3>التعدين اليومي</h3><p>فعّل التعدين مرة كل 24 ساعة واحصل على مكافأة ZIVO صغيرة.</p><div id="z101-countdown" class="z101-countdown">—</div></div>
        <div class="z101-mine-action"><button id="z101-mine" class="z101-btn primary">بدء التعدين +0.50</button></div>
      </article>`;
    h.insertAdjacentElement('afterend',root);
    root.querySelector('#z101-wallet-open').onclick=openWallet;
    root.querySelector('#z101-mine').onclick=mine;
  }

  async function ensureWalletForUser(u){
    const d=db(); if(!u||!d)return;
    const ref=d.collection('users').doc(u.uid).collection('zivozone').doc('wallet');
    const snap=await ref.get();
    if(!snap.exists) await ref.set({zivo:0,createdAt:F().firestore.FieldValue.serverTimestamp(),updatedAt:F().firestore.FieldValue.serverTimestamp(),mode:'spark-client-rules'},{merge:false});
  }

  async function refresh(){
    const u=user(),d=db(); state.uid=u?.uid||null; if(u?.email?.toLowerCase()===window.ZIVOZONE_CONFIG.ADMIN_EMAIL){state.zivo=0;state.ledger=[];state.nextMiningAt=0;syncUI();return state;}
    if(!u||!d){state.zivo=0;state.ledger=[];state.nextMiningAt=0;syncUI();return state;}
    try{
      const w=await d.collection('users').doc(u.uid).collection('zivozone').doc('wallet').get();
      state.zivo=num(w.data()?.zivo);
      const l=await d.collection('users').doc(u.uid).collection('zivozone').doc('wallet').collection('ledger').orderBy('createdAt','desc').limit(25).get().catch(()=>null);
      state.ledger=l?l.docs.map(x=>({id:x.id,...x.data()})):[];
      const m=await d.collection('users').doc(u.uid).collection('zivozone').doc('mining').get().catch(()=>null);
      const ts=m?.data()?.nextMiningAt;state.nextMiningAt=ts?.toMillis?ts.toMillis():num(ts);
    }catch(e){console.warn('ZIVO V101 refresh',e)}
    syncUI();return state;
  }

  function syncUI(){
    const bal=`${Number(state.zivo).toFixed(state.zivo%1?2:0)} ZIVO`;
    document.querySelectorAll('#z101-balance,[data-v101-balance]').forEach(x=>x.textContent=bal);
    const p=document.getElementById('profile-coins');if(p)p.textContent=String(state.zivo);
    const status=document.getElementById('z101-wallet-status');if(status)status.textContent=user()?`الحساب: ${user().email||'مستخدم ZIVOZONE'}`:'سجّل الدخول لحفظ رصيدك ومكافآتك.';
    updateMiningUI();
  }
  function updateMiningUI(){
    const b=document.getElementById('z101-mine'),c=document.getElementById('z101-countdown');if(!b||!c)return;
    if(!user()){b.textContent='تسجيل الدخول للتعدين';b.disabled=false;c.textContent='الحساب مطلوب';return;} if(user().email?.toLowerCase()===window.ZIVOZONE_CONFIG.ADMIN_EMAIL){b.textContent='حساب الإدارة';b.disabled=true;c.textContent='ADMIN';return;}
    const left=Math.max(0,(state.nextMiningAt||0)-Date.now());
    if(left<=0){b.textContent='بدء التعدين +0.50';b.disabled=false;c.textContent='متاح الآن';c.classList.add('z101-ready')}
    else{b.textContent='التعدين مفعّل';b.disabled=true;c.classList.remove('z101-ready');c.textContent=formatMs(left)}
  }
  function formatMs(ms){const s=Math.floor(ms/1000),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`}

  async function mine(){
    const u=user(),d=db();
    if(!u){document.querySelector('#login-btn,[data-action="login"]')?.click();return}
    if(u.email?.toLowerCase()===window.ZIVOZONE_CONFIG.ADMIN_EMAIL){toast('حساب الإدارة لا يدخل في نظام التعدين.');return}
    const b=document.getElementById('z101-mine');if(b)b.disabled=true;
    try{
      const wallet=d.collection('users').doc(u.uid).collection('zivozone').doc('wallet');
      const mining=d.collection('users').doc(u.uid).collection('zivozone').doc('mining');
      const ledger=wallet.collection('ledger').doc('mining_'+new Date().toISOString().slice(0,10));
      await d.runTransaction(async tx=>{
        const [ws,ms,ls]=await Promise.all([tx.get(wallet),tx.get(mining),tx.get(ledger)]);
        const now=Date.now(), previous=ms.exists?(ms.data()?.nextMiningAt):null, prevMs=previous?.toMillis?.()||Number(previous)||0;
        if(prevMs>now)throw new Error('التعدين غير متاح بعد.');
        if(ls.exists)throw new Error('تم احتساب تعدين اليوم بالفعل.');
        const current=num(ws.data()?.zivo);
        const fv=F().firestore.FieldValue;
        tx.set(wallet,{zivo:current+0.5,updatedAt:fv.serverTimestamp(),mode:'spark-client-rules'},{merge:true});
        tx.set(mining,{lastMiningAt:fv.serverTimestamp(),nextMiningAt:new Date(now+86400000),amount:0.5,version:'spark-v1057'},{merge:true});
        tx.set(ledger,{type:'daily_mining',label:'التعدين اليومي',amount:0.5,eventId:ledger.id,createdAt:fv.serverTimestamp(),source:'client-rules'});
      });
      await refresh();
      toast('تم التعدين بنجاح! +0.50 ZIVO ⛏️');
    }catch(e){console.warn('ZIVO mining:',e);toast(e?.message||'تعذر تفعيل التعدين الآن.');await refresh()}
  }

  async function reward(amount,type,label,meta={}){ return false; }

  async function rewardChallenge(d={}){
    const u=user(),fire=db(); if(!u||!fire)return false;
    const total=Math.max(1,Math.min(100,Number(d.total??d.questions??10)||10));
    const correct=Math.max(0,Math.min(total,Number(d.correct??d.score??0)||0));
    const timed=Number(d.timedOut)||0;
    if(total!==10||correct!==10||timed!==0)return false;
    if(u.email?.toLowerCase()===window.ZIVOZONE_CONFIG.ADMIN_EMAIL)return false;
    const challenge=String(d.challenge||d.gameId||d.challengeId||'challenge').slice(0,80);
    const attemptId=String(d.attemptId||d.eventId||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,100);
    if(!attemptId)return false;
    try{
      const root=fire.collection('users').doc(u.uid).collection('zivozone');
      const wallet=root.doc('wallet'), claim=root.doc('rewardClaim');
      const ledger=wallet.collection('ledger').doc(('challenge_perfect_'+attemptId).slice(0,100));
      const result=fire.collection('players').doc(u.uid).collection('results').doc(attemptId.slice(0,100));
      await fire.runTransaction(async tx=>{
        const [ws,ls,cs]=await Promise.all([tx.get(wallet),tx.get(ledger),tx.get(claim)]);
        if(ls.exists)throw new Error('تم احتساب هذه المحاولة مسبقًا.');
        const current=num(ws.data()?.zivo);
        const fv=F().firestore.FieldValue;
        tx.set(claim,{claimId:attemptId,challenge,total,correct,timedOut:0,amount:10,consumedAt:fv.serverTimestamp(),createdAt:fv.serverTimestamp(),status:'consumed',policy:'10_of_10_only'},{merge:true});
        tx.set(wallet,{zivo:current+10,updatedAt:fv.serverTimestamp(),mode:'spark-client-rules'},{merge:true});
        tx.set(ledger,{type:'challenge_reward',label:`مكافأة تحدي كامل — ${challenge}`,amount:10,eventId:ledger.id,attemptId,challenge,total,correct,timedOut:0,scorePercent:100,createdAt:fv.serverTimestamp(),source:'client-rules',policy:'10_of_10_only'});
      });
      await refresh();
      toast('علامة كاملة 10/10 — تمت إضافة +10 ZIVO إلى المحفظة 🪙');
      return true;
    }catch(e){
      console.warn('ZIVO challenge reward',e);
      if(String(e?.message||'').includes('مسبقًا')){await refresh();return true}
      return false;
    }
  }

  async function openWallet(){
    if(!user()){document.querySelector('#login-btn,[data-action="login"]')?.click();return}
    await refresh();
    let o=document.getElementById('z101-wallet-modal');
    if(!o){
      o=document.createElement('div');o.id='z101-wallet-modal';o.className='z101-overlay';
      o.innerHTML=`<div class="z101-modal" dir="rtl"><div class="z101-modal-head"><div><div class="z101-label">ZIVOZONE ECONOMY</div><h2>محفظة ZIVO</h2></div><button class="z101-modal-close">×</button></div><div id="z101-modal-balance" class="z101-modal-balance">0 ZIVO</div><p>رصيد ZIVO داخل المنصة. كل إضافة تمر عبر خادم ZIVOZONE وتظهر في سجل المعاملات.</p><div class="z101-ledger"><div class="z101-ledger-title">آخر المعاملات</div><div id="z101-modal-ledger" class="z101-ledger-list"></div></div><div class="z101-note">XP منفصل عن ZIVO. وZIVO منفصل عن Tickets. هذه العملة حاليًا عملة افتراضية داخل المنصة وليست أموالًا نقدية.</div></div>`;
      document.body.appendChild(o);o.querySelector('.z101-modal-close').onclick=()=>o.classList.remove('open');o.onclick=e=>{if(e.target===o)o.classList.remove('open')};
    }
    o.classList.add('open');
    o.querySelector('#z101-modal-balance').textContent=`${Number(state.zivo).toFixed(state.zivo%1?2:0)} ZIVO`;
    const list=o.querySelector('#z101-modal-ledger');
    list.innerHTML=state.ledger.length?state.ledger.map(x=>`<div class="z101-ledger-row"><span>${esc(x.label||x.type||'معاملة')}</span><b>${Number(x.amount)>0?'+':''}${Number(x.amount)||0}</b><small>${x.createdAt?.toDate?x.createdAt.toDate().toLocaleString('ar-JO'):'—'}</small></div>`).join(''):'<p>لا توجد معاملات بعد.</p>';
  }

  function bind(){
    mountHub();
    document.querySelectorAll('#mobile-more,[data-mobile-more]').forEach(x=>x.remove());
    const sheet=document.getElementById('mobile-tools');if(sheet)sheet.remove();
    const legacy=['zivo-v85-open','zivo-v85-economy','zivo-v81-open','zivo-v81-economy','zivo-v80-open','zivo-v87-quickdock','z80-admin-open'];legacy.forEach(id=>document.getElementById(id)?.remove());
    auth()?.onAuthStateChanged?.(()=>setTimeout(refresh,100));
    refresh();setInterval(()=>{if(document.visibilityState==='visible')refresh()},30000);setInterval(updateMiningUI,1000);
  }

  const processed=new Set();
  function onChallenge(e){
    const d=e?.detail||{}; const total=Number(d.total??d.questions)||0; const correct=Number(d.correct??d.score)||0;
    if(!user()||total!==10||correct!==10||Number(d.timedOut||0)!==0||d.perfect!==true)return;
    const eventId=String(d.eventId||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,100); if(!eventId||processed.has(eventId))return;
    processed.add(eventId); rewardChallenge({...d,total:10,correct:10,timedOut:0,attemptId:eventId,eventId});
  }
  ['zivozone-result','zivozone-progress','zivozone:game-complete','zivozone:challenge-result','zivozone:progress-updated'].forEach(n=>addEventListener(n,onChallenge,true));

  window.ZIVOZONE_ECONOMY={open:openWallet,refresh,rewardPerfect:rewardChallenge,credit:reward,getWallet:()=>({...state}),mine};
  window.ZIVOZONE_ZIVO={wallet:state,refresh,reward,mine,rewardChallenge};
  window.addEventListener('zivozone-auth',()=>setTimeout(refresh,150));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(bind,50));else setTimeout(bind,50);
})();
