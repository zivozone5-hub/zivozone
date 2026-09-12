/* ZIVOZONE V103 — functional luxury UX layer
   - Admin command center bound to owner email only
   - Responsive challenge hub
   - Registration consent UX
   - Adaptive replay messaging
   - Compact wallet/mining presentation
*/
(function(){
  'use strict';
  const ADMIN=window.ZIVOZONE_CONFIG.ADMIN_EMAIL;
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const auth=()=>window.firebase?.auth?.();
  const db=()=>window.firebase?.firestore?.();
  const owner=()=>String(auth()?.currentUser?.email||'').trim().toLowerCase()===ADMIN;
  const fmt=v=>v?new Date(v).toLocaleString('ar-JO',{dateStyle:'medium',timeStyle:'short'}):'—';
  const ts=v=>v?.toMillis?.()||(typeof v==='string'?Date.parse(v)||0:Number(v)||0);
  const toast=m=>{try{window.ZIVOZONE_ECONOMY?.open;const b=document.createElement('div');b.className='z103-toast';b.textContent=m;document.body.appendChild(b);setTimeout(()=>b.remove(),2800)}catch(e){}};

  function styleEconomy(){
    const e=document.getElementById('zivo-v101-economy'); if(e)e.classList.add('z103-economy');
  }

  async function collectAdmin(){
    if(!owner())throw new Error('Admin access required');
    const d=db();if(!d)throw new Error('Firestore غير متاح');
    const [us,ps]=await Promise.all([d.collection('users').limit(500).get(),d.collection('players').limit(500).get()]);
    const users=us.docs.map(x=>({id:x.id,...x.data()})).filter(x=>String(x.email||'').toLowerCase()!==ADMIN);
    const players=ps.docs.map(x=>({id:x.id,...x.data()}));
    const pm=new Map(players.map(p=>[p.id,p]));
    const rows=users.map(u=>{const p=pm.get(u.id)||{};return {uid:u.id,name:u.name||p.name||'ZIVO Player',email:u.email||p.email||'',level:Number(p.level??u.level??1)||1,xp:Number(p.xp??u.xp??0)||0,zivo:Number(u.zivo??p.zivo??u.coins??p.coins??0)||0,games:Number(p.gamesPlayed??u.gamesPlayed??0)||0,active:Number(u.engagement?.activeMinutes??p.activeMinutes??0)||0,last:ts(u.lastSeenAt||p.lastSeenAt||u.updatedAt||p.updatedAt),path:u.lastSeenPath||p.lastSeenPath||'#home',created:ts(u.createdAt||p.createdAt),role:u.role||p.role||'player'};});
    rows.sort((a,b)=>b.last-a.last);
    let activity=[];
    await Promise.all(rows.slice(0,35).map(async r=>{try{const q=await d.collection('users').doc(r.uid).collection('activity').limit(12).get();q.docs.forEach(x=>activity.push({uid:r.uid,name:r.name,...x.data(),time:ts(x.data()?.createdAt)}));}catch(e){}}));
    activity.sort((a,b)=>b.time-a.time);activity=activity.slice(0,60);
    const now=Date.now(),dayStart=new Date();dayStart.setHours(0,0,0,0);
    return {rows,activity,stats:{users:rows.length,players:players.length,active:rows.filter(r=>r.last&&now-r.last<=10*60*1000).length,today:rows.filter(r=>r.last>=dayStart.getTime()).length,games:players.reduce((n,p)=>n+(Number(p.gamesPlayed)||0),0),zivo:rows.reduce((n,r)=>n+r.zivo,0),online:navigator.onLine}};
  }

  function dashboard(data){
    let o=document.getElementById('zivo-v103-admin');
    if(!o){o=document.createElement('div');o.id='zivo-v103-admin';o.className='z103-admin-overlay';document.body.appendChild(o);}
    const s=data.stats,r=data.rows,a=data.activity;
    const k=(n,v,h)=>`<div class="z103-kpi"><b>${esc(v)}</b><span>${esc(n)}</span><em>${esc(h||'')}</em></div>`;
    const userRows=r.length?r.map(x=>`<div class="z103-user-row"><b>${esc(x.name)}</b><span>${esc(x.email)}</span><span>Lv ${x.level}</span><span>${x.xp} XP</span><span>🪙 ${x.zivo.toFixed(2)}</span><span>${x.games}</span><span class="${x.last&&Date.now()-x.last<10*60*1000?'online':''}">${x.last?fmt(x.last):'لا يوجد'}</span></div>`).join(''):`<div class="z103-empty">لا توجد حسابات لاعبين بعد.</div>`;
    const acts=a.length?a.map(x=>`<div class="z103-activity-row"><b>${esc(x.name||'مستخدم')}</b><span>${esc(x.event||x.type||x.meta?.path||'نشاط داخل المنصة')}</span><small>${esc(x.meta?.path||x.path||'')} · ${fmt(x.time)}</small></div>`).join(''):`<div class="z103-empty">لا يوجد نشاط مسجل حتى الآن.</div>`;
    o.innerHTML=`<div class="z103-admin-card" dir="rtl"><div class="z103-admin-head"><div class="z103-admin-logo">Z</div><div><small>PRIVATE OWNER COMMAND CENTER</small><h2>غرفة إدارة ZIVOZONE</h2><p>المدير: رائف البطوش · ${ADMIN}</p></div><div class="z103-admin-live"><i></i> LIVE</div><button class="z103-admin-close" aria-label="إغلاق">×</button></div><div class="z103-admin-body"><div class="z103-kpis">${k('المستخدمون',s.users,'Player accounts')}${k('اللاعبون',s.players,'Profiles')}${k('نشط الآن',s.active,'آخر 10 دقائق')}${k('دخول اليوم',s.today,'آخر ظهور')}${k('إجمالي الألعاب',s.games,'كل الحسابات')}${k('إجمالي ZIVO',s.zivo.toFixed(2),'رصيد افتراضي')}</div><div class="z103-admin-grid"><section class="z103-panel"><div class="z103-panel-head"><div><h3>👥 المستخدمون والنشاط</h3><small>آخر ظهور · المستوى · XP · ZIVO · الألعاب</small></div><button class="z103-refresh">↻ تحديث</button></div><div class="z103-users"><div class="z103-user-row head"><b>الاسم</b><span>البريد</span><span>المستوى</span><span>XP</span><span>ZIVO</span><span>ألعاب</span><span>آخر ظهور</span></div>${userRows}</div></section><aside class="z103-panel"><div class="z103-panel-head"><div><h3>⚡ آخر النشاط</h3><small>سجل تشغيلي حديث</small></div></div><div class="z103-activity">${acts}</div></aside></div><section class="z103-panel" style="margin-top:12px"><div class="z103-panel-head"><div><h3>🛰️ حالة المنصة</h3><small>مراقبة سريعة</small></div></div><div class="z103-system"><div>Firebase<b>CONNECTED</b></div><div>Hosting<b>${s.online?'ONLINE':'OFFLINE'}</b></div><div>Domain<b>${esc(location.hostname)}</b></div><div>Admin<b>OWNER ONLY</b></div><div>ZIVO<b>VIRTUAL ONLY</b></div><div>Mining<b>24H COOLDOWN</b></div></div></section></div></div>`;
    o.querySelector('.z103-admin-close').onclick=()=>o.remove();o.querySelector('.z103-refresh').onclick=async()=>{const b=o.querySelector('.z103-refresh');b.disabled=true;b.textContent='جارٍ…';try{dashboard(await collectAdmin())}catch(e){b.textContent='خطأ';} };
  }

  async function openAdmin(){
    if(!owner()){return window.ZIVOZONE_MONITOR?.open?.()}
    try{dashboard(await collectAdmin())}catch(e){console.error('V103 admin',e);alert('تعذر تحميل لوحة الإدارة. تحقق من قواعد Firestore.');}
  }

  function bindAdmin(){
    // V1056: ADMIN has one entry point only — the top header #login-btn.
    // V104 owns the click handler so multiple admin engines cannot compete.
    document.getElementById('z81-admin-open')?.remove();
    document.getElementById('zivo-admin-identity')?.remove();
  }

  function consentUX(){
    const form=document.getElementById('auth-form');if(!form||form.dataset.z103Terms)return;
    const cb=form.querySelector('#auth-terms');
    if(!cb)return;
    form.dataset.z103Terms='1';
    const old=cb.closest('label');
    if(old){old.classList.add('z103-consent');const span=old.querySelector('span');if(span)span.innerHTML='أقر بأنني قرأت <button type="button" class="z103-term-link">شروط الاستخدام</button> وسياسة استخدام ZIVOZONE، وأوافق عليها قبل إنشاء الحساب. أفهم أن <strong>ZIVO</strong> رصيد افتراضي داخل المنصة فقط وليس نقودًا أو استثمارًا.';old.querySelector('.z103-term-link')?.addEventListener('click',e=>{e.preventDefault();window.ZIVOZONE_OPEN_TERMS?.()})}
    if(!form.querySelector('.z103-terms-callout')){const x=document.createElement('div');x.className='z103-terms-callout';x.innerHTML='<strong>قبل إنشاء حسابك:</strong> الموافقة مطلوبة. شروط ZIVOZONE توضّح الحساب، الخصوصية، الاستخدام المقبول، المكافآت، التعدين، وطبيعة ZIVO الافتراضية.';form.insertBefore(x,old||form.firstChild)}
  }

  function adaptiveUX(){
    document.querySelectorAll('.challenge-card').forEach(card=>{
      const b=card.querySelector('[data-challenge]');if(!b)return;const id=b.dataset.challenge;if(!id||id==='horror')return;
      let x={attempts:0,perfect:0,best:0};try{x=JSON.parse(localStorage.getItem(`zivo_adaptive_${id}`)||'{}')}catch(e){}
      if(Number(x.attempts)>0){let tag=card.querySelector('.card-tag');if(tag&&!tag.dataset.adapt){tag.dataset.adapt='1';tag.textContent=`${Number(x.perfect)>0?'🔥 إعادة متقدمة':'↗️ إعادة محسّنة'} · ${Math.min(10,Math.max(1,Number(x.attempts)+1))}/10`}}
    });
  }

  function observe(){
    // V105.3 performance hardening: do not observe the whole document.
    // Challenge/news rendering can create many DOM nodes and a global observer
    // causes repeated scans on the main thread. Rebind only on meaningful app events.
    styleEconomy();bindAdmin();consentUX();adaptiveUX();
    window.addEventListener('zivozone-auth',()=>setTimeout(()=>{styleEconomy();bindAdmin();consentUX();adaptiveUX()},250),{passive:true});
    window.addEventListener('hashchange',()=>setTimeout(()=>{bindAdmin();adaptiveUX()},150),{passive:true});
  }
  window.ZIVOZONE_V103={openAdmin,collectAdmin};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observe);else observe();
})();
