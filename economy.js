/* ZIVOZONE V80 — CLOUD ECONOMY CLIENT
   Server-authoritative ZIVO wallet. Local UI is display/cache only.
*/
(function(){'use strict';
  const F=()=>window.firebase?.functions?.();
  const A=()=>window.ZIVOZONE_AUTH;
  const call=async(name,data={})=>{const f=F();if(!f)throw new Error('Firebase Functions غير متاحة');return (await f.httpsCallable(name)(data)).data||{}};
  const cacheKey='zivozone_wallet_cache_v80';
  const readCache=()=>{try{return JSON.parse(localStorage.getItem(cacheKey)||'{"zivo":0,"xp":0,"updatedAt":null,"ledger":[]}')}catch(e){return {zivo:0,xp:0,updatedAt:null,ledger:[]}}};
  const writeCache=x=>{try{localStorage.setItem(cacheKey,JSON.stringify(x))}catch(e){}};
  let wallet=readCache();
  async function refresh(){
    if(!A?.isLoggedIn?.()) return wallet;
    try{wallet=await call('getWallet');writeCache(wallet);renderMini();return wallet}catch(e){console.warn('wallet refresh',e);return wallet}
  }
  async function spend(itemId){const r=await call('spendZivo',{itemId});await refresh();return r}
  async function daily(){const r=await call('claimDailyZivo');await refresh();return r}
  function renderMini(){document.querySelectorAll('[data-zivo-balance]').forEach(e=>e.textContent=Number(wallet.zivo)||0)}
  function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function toast(msg){let x=document.getElementById('zivo-v80-toast');if(!x){x=document.createElement('div');x.id='zivo-v80-toast';x.className='zivo-v80-toast';document.body.appendChild(x)}x.textContent=msg;x.classList.add('show');setTimeout(()=>x.classList.remove('show'),2600)}
  function open(){
    let o=document.getElementById('zivo-v80-economy');
    if(!o){o=document.createElement('div');o.id='zivo-v80-economy';o.className='zivo-v80-overlay';o.innerHTML=`<div class="zivo-v80-card"><button class="zivo-v80-close">×</button><div class="zivo-v80-head"><div class="zivo-v80-coin">Z</div><div><small>ZIVO ECONOMY</small><h2>اقتصاد ZIVOZONE</h2><p>عملة داخلية رقمية تُدار من الخادم.</p></div></div><div class="zivo-v80-balance"><span>الرصيد الحالي</span><b id="zivo-v80-balance">0 ZIVO</b></div><div class="zivo-v80-actions"><button id="zivo-v80-daily">🎁 مكافأة اليوم</button><button id="zivo-v80-refresh">🔄 تحديث الرصيد</button></div><h3>سجل المعاملات</h3><div id="zivo-v80-ledger"></div><div class="zivo-v80-note">ZIVO حاليًا أصل رقمي داخل المنصة وليس عملة نقدية أو أصلًا قابلًا للتداول. أي تحويل مستقبلي إلى توكن خارجي يحتاج مرحلة قانونية وتقنية مستقلة.</div></div>`;document.body.appendChild(o);o.querySelector('.zivo-v80-close').onclick=()=>o.remove();o.querySelector('#zivo-v80-refresh').onclick=()=>refresh().then(render);o.querySelector('#zivo-v80-daily').onclick=async()=>{try{const r=await daily();toast(r.claimed?`تمت إضافة ${r.zivo} ZIVO`:'تم استلام مكافأة اليوم مسبقًا');render()}catch(e){toast('تعذر استلام المكافأة')}}}
    render();o.classList.add('open');refresh().then(render);
  }
  function render(){const o=document.getElementById('zivo-v80-economy');if(!o)return;const b=Number(wallet.zivo)||0;o.querySelector('#zivo-v80-balance').textContent=b+' ZIVO';const l=o.querySelector('#zivo-v80-ledger');const rows=(wallet.ledger||[]).slice(0,30);l.innerHTML=rows.length?rows.map(x=>`<div class="zivo-v80-row"><span>${esc(x.label||x.type||'معاملة')}</span><b>${(Number(x.zivo)||0)>0?'+':''}${Number(x.zivo)||0}</b><small>${x.createdAt?new Date(x.createdAt).toLocaleString('ar-JO'):'—'}</small></div>`).join(''):'<p class="muted">لا توجد معاملات بعد.</p>';renderMini()}
  function mount(){
    const b=document.getElementById('v26-open');
    if(b){b.textContent='🪙 ZIVO';b.onclick=open}
    if(!document.getElementById('zivo-v80-open')){const x=document.createElement('button');x.id='zivo-v80-open';x.className='zivo-v80-open';x.textContent='🪙 ZIVO';x.onclick=open;document.body.appendChild(x)}
    if(A?.isLoggedIn?.())refresh();
  }
  window.ZIVOZONE_ECONOMY={refresh,spend,daily,open,getWallet:()=>wallet};
  window.addEventListener('zivozone-auth',()=>setTimeout(mount,100));
  window.addEventListener('zivozone-cloud-synced',()=>refresh());
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,300));else setTimeout(mount,300);
})();
