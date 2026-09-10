/* ZIVOZONE V75 — USER / PLAYER / ADMIN MONITOR */
(function(){'use strict';
  const db=()=>window.firebase?.firestore?.();
  const auth=()=>window.firebase?.auth?.();
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const today=()=>new Date().toISOString().slice(0,10);
  const vidKey='zivozone_visitor_id_v75';
  function visitorId(){let v=localStorage.getItem(vidKey);if(!v){v=crypto?.randomUUID?.()||('v_'+Math.random().toString(36).slice(2)+Date.now());localStorage.setItem(vidKey,v)}return v}
  async function heartbeat(){
    try{
      const fn=window.firebase?.functions?.().httpsCallable('zivoHeartbeat');
      if(fn) return (await fn({visitorId:visitorId(),path:location.pathname,loggedIn:!!auth()?.currentUser,referrer:document.referrer.slice(0,200)})).data;
    }catch(e){console.warn('zivoHeartbeat',e)}
    return null;
  }
  async function ensureAdmin(){
    const f=window.firebase?.functions?.();
    const u=window.firebase?.auth?.()?.currentUser;
    if(!f||!u) throw new Error('Login required');
    // Bootstrap the owner account once, then force a fresh ID token so the
    // admin custom claim is available to zivoAdminOverview immediately.
    const bootstrap=f.httpsCallable('zivoBootstrapAdmin');
    await bootstrap({});
    await u.getIdToken(true);
  }
  async function adminData(){
    const f=window.firebase?.functions?.();
    if(!f) throw new Error('Cloud Functions unavailable');
    const fn=f.httpsCallable('zivoAdminOverview');
    try{
      return (await fn({})).data;
    }catch(e){
      if(e?.code==='functions/permission-denied' || e?.code==='permission-denied'){
        await ensureAdmin();
        return (await fn({})).data;
      }
      throw e;
    }
  }
  function panel(data){
    let o=document.getElementById('zivo-v75-admin');
    if(!o){o=document.createElement('div');o.id='zivo-v75-admin';o.className='z75-overlay';document.body.appendChild(o)}
    const s=data.stats||{};
    const players=data.players||[];
    o.innerHTML=`<div class="z75-card"><button class="z75-x">×</button><div class="z75-head"><div class="z75-logo">Z</div><div><small>ADMIN COMMAND</small><h2>مركز إدارة ZIVOZONE</h2><span>المستخدمون · اللاعبون · الاستضافة · صحة المنصة</span></div></div>
    <div class="z75-grid"><div><b>${s.totalUsers||0}</b><span>حسابات مسجلة</span></div><div><b>${s.todayVisitors||0}</b><span>زوار اليوم</span></div><div><b>${s.todayLogins||0}</b><span>دخول اليوم</span></div><div><b>${s.totalPlayers||0}</b><span>لاعبون</span></div><div><b>${s.todayGames||0}</b><span>ألعاب اليوم</span></div><div><b>${esc(s.firebase||'UNKNOWN')}</b><span>حالة Firebase</span></div></div>
    <div class="z75-status"><b>🟢 GitHub Pages / الموقع:</b> ONLINE · <b>🔒 HTTPS:</b> ACTIVE · <b>☁ Firebase:</b> ${esc(s.firebase||'UNKNOWN')} · <b>📰 الأخبار:</b> ${esc(s.news||'UNKNOWN')}</div>
    <h3>آخر اللاعبين</h3><div class="z75-table">${players.length?players.map(p=>`<div class="z75-row"><b>${esc(p.name||'ZIVO Player')}</b><span>${esc(p.email||'')}</span><span>Lv ${Number(p.level)||1}</span><span>${Number(p.gamesPlayed)||0} لعبة</span><span>${p.lastSeen?new Date(p.lastSeen).toLocaleString('ar-JO'): '—'}</span></div>`).join(''):'<p>لا توجد حسابات بعد.</p>'}</div>
    <p class="z75-note">هذا المركز متاح فقط للحسابات التي يضع لها خادم Firebase صلاحية admin. بيانات الضيوف تُحسب كأرقام مجمعة ولا تُعرض هويتهم.</p></div>`;
    o.querySelector('.z75-x').onclick=()=>o.remove();
  }
  async function open(){try{panel(await adminData())}catch(e){alert('غير مصرح أو خدمة الإدارة غير متاحة.')} }
  window.ZIVOZONE_MONITOR={heartbeat,open,adminData};
  window.addEventListener('load',()=>setTimeout(heartbeat,1200));
  if(location.hash==='#admin') setTimeout(open,1800);
})();
