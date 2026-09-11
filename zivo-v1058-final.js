/* ZIVOZONE V1058 — FINAL MOBILE / ECONOMY / CHALLENGE HARDENING
   Additive patch. No MutationObserver. No Firebase Functions. Spark-safe.
*/
(function(){
  'use strict';
  const ADMIN='raefalbtish@gmail.com';
  const auth=()=>window.firebase?.auth?.();
  const db=()=>window.firebase?.firestore?.();
  const user=()=>auth()?.currentUser||null;
  const isAdmin=()=>String(user()?.email||'').toLowerCase()===ADMIN;
  const money=n=>Math.round((Number(n)||0)*100)/100;
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  /* 1) Mining: true rolling 24-hour cooldown, not a calendar-day lock. */
  async function mine24(){
    const u=user(),d=db();
    if(!u){document.querySelector('#login-btn,[data-action="login"]')?.click();return false}
    if(isAdmin())return false;
    if(!d)return false;
    const root=d.collection('users').doc(u.uid).collection('zivozone');
    const wallet=root.doc('wallet'), mining=root.doc('mining');
    const ledger=wallet.collection('ledger').doc('mine_'+Date.now()+'_'+Math.random().toString(36).slice(2,9));
    const now=Date.now();
    try{
      await d.runTransaction(async tx=>{
        const [ws,ms]=await Promise.all([tx.get(wallet),tx.get(mining)]);
        const next=ms.exists ? (ms.data()?.nextMiningAt?.toMillis?.()||Number(ms.data()?.nextMiningAt)||0) : 0;
        if(next>now)throw new Error('التعدين متاح بعد انتهاء العداد.');
        const current=money(ws.data()?.zivo);
        const fv=window.firebase.firestore.FieldValue;
        tx.set(wallet,{zivo:money(current+0.5),updatedAt:fv.serverTimestamp(),mode:'spark-client-rules'},{merge:true});
        tx.set(mining,{lastMiningAt:fv.serverTimestamp(),nextMiningAt:new Date(now+86400000+120000),amount:0.5,version:'spark-v1058'},{merge:true});
        tx.set(ledger,{type:'daily_mining',label:'التعدين اليومي',amount:0.5,createdAt:fv.serverTimestamp(),source:'client-rules-v1058'},{merge:false});
      });
      await window.ZIVOZONE_ECONOMY?.refresh?.();
      window.dispatchEvent(new CustomEvent('zivozone-wallet-updated'));
      return true;
    }catch(e){
      console.warn('V1058 mining',e);
      return false;
    }
  }

  /* Replace the old mining handler with the rolling 24h implementation. */
  function bindMining(){
    const b=document.getElementById('z101-mine');
    if(!b||b.dataset.v1058Bound)return;
    b.dataset.v1058Bound='1';
    b.onclick=async function(){
      b.disabled=true;
      const ok=await mine24();
      if(!ok) await window.ZIVOZONE_ECONOMY?.refresh?.();
      if(ok){b.textContent='التعدين مفعّل';}
    };
  }

  /* 2) Challenge cards: the complete visual card is the primary action. */
  function bindChallengeCards(){
    document.querySelectorAll('#challenge-list .challenge-card').forEach(card=>{
      if(card.dataset.v1058CardReady)return;
      const trigger=card.querySelector('[data-challenge],[data-game]');
      const id=trigger?.dataset.challenge||trigger?.dataset.game||'';
      if(!trigger)return;
      card.dataset.v1058CardReady='1';
      if(id){
        card.dataset.challenge=id;
        card.classList.add('z58-theme-'+String(id).replace(/[^a-z0-9_-]/gi,''));
      }
      card.setAttribute('role','button');
      card.setAttribute('tabindex','0');
      card.setAttribute('aria-label',(card.querySelector('h3')?.textContent||'تحدي')+' — اضغط للبدء');
      /* The old button remains in the DOM for compatibility, but the user no longer
         has to find a specific blue button. The card itself is the launch surface. */
      trigger.classList.add('z58-hidden-launcher');
      trigger.setAttribute('aria-hidden','true');
      trigger.tabIndex=-1;
      const go=()=>{
        try{
          if(window.ZIVOZONE_V20?.start) window.ZIVOZONE_V20.start(id);
          else trigger.click();
        }catch(e){try{trigger.click()}catch(_){}}
      };
      card.addEventListener('click',e=>{
        if(e.target.closest('a,input,select,textarea,label,.z58-hidden-launcher'))return;
        go();
      });
      card.addEventListener('keydown',e=>{
        if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}
      });
    });
  }

  /* Full-card launch also covers challenge tiles rendered by older layers. */
  function promoteChallengeTiles(){
    document.querySelectorAll('[data-challenge],[data-game]').forEach(node=>{
      const card=node.closest('.challenge-card');
      if(card&&!card.dataset.v1058CardReady){bindChallengeCards();}
    });
  }

  /* 3) Make question text and options fully readable on small screens. */
  function hardenRunner(){
    const r=document.getElementById('zivo-v20-runner');
    if(!r)return;
    r.style.overflow='auto';
    const q=r.querySelector('.v20-question h2'); if(q){q.style.whiteSpace='normal';q.style.overflow='visible';q.style.height='auto'}
    r.querySelectorAll('.v20-option').forEach(x=>{x.style.whiteSpace='normal';x.style.height='auto';x.style.minHeight='52px'});
  }

  /* 4) Compact the two news bars without changing their data source. */
  function compactNews(){
    document.querySelectorAll('[class*="news"],.ticker,.news-rail').forEach(el=>{
      if(el.dataset.v1058News)return;
      const text=(el.textContent||'').trim();
      if(text.length>0 && (el.className||'').toString().match(/ticker|news-rail|news-bar|breaking|headline/i)){
        el.dataset.v1058News='1';
        el.style.minHeight='34px';el.style.height='34px';el.style.overflow='hidden';
      }
    });
  }

  /* 5) A professional admin entry: use the existing ADMIN header button only. */
  function adminPolish(){
    if(!isAdmin())return;
    const b=document.getElementById('login-btn');
    if(b){b.textContent='👑 ADMIN';b.title='غرفة إدارة ZIVOZONE';b.setAttribute('aria-label','فتح غرفة إدارة ZIVOZONE')}
  }

  function boot(){
    bindMining();bindChallengeCards();promoteChallengeTiles();hardenRunner();compactNews();adminPolish();
  }
  document.addEventListener('DOMContentLoaded',boot);
  window.addEventListener('zivozone-auth',()=>setTimeout(boot,250));
  window.addEventListener('zivozone-result',()=>setTimeout(boot,100));
  window.addEventListener('hashchange',()=>setTimeout(boot,150));
  const oldStart=window.startGame;
  /* Do not replace the challenge engine; only harden its runner after it opens. */
  if(typeof oldStart==='function'){
    window.startGame=function(){const r=oldStart.apply(this,arguments);setTimeout(hardenRunner,50);setTimeout(hardenRunner,400);return r};
  }
  window.ZIVOZONE_V1058={mine24,boot};
  setTimeout(boot,700);
})();
