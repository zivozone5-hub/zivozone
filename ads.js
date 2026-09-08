/* ZIVOZONE AD CONTROL
   Independent ad presentation layer. Public settings are local; optional cloud config can be read from Firestore.
*/
(() => {
  'use strict';
  const KEY='zivozone_ads_v1';
  let cfg={enabled:true,density:'normal',label:true};
  try{cfg={...cfg,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch(e){}
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){}};
  function apply(){const slots=[...document.querySelectorAll('.ad-slot')];if(!slots.length)return;slots.forEach(slot=>{slot.hidden=!cfg.enabled;slot.dataset.density=cfg.density;const badge=slot.querySelector('.ad-badge');if(badge)badge.hidden=!cfg.label})}
  function open(){
    const root=document.querySelector('#modal-root');if(!root)return;
    root.innerHTML=`<div class="modal-backdrop"><div class="modal-card ad-control-modal"><button class="modal-close" data-close>×</button><span class="eyebrow">ZIVO ADS</span><h2>${window.zivoT?.('adsControl')||'Ad control'}</h2><p class="muted">${window.zivoT?.('adsControlText')||'Control the ad area independently on this device.'}</p><label class="control-row"><span>${window.zivoT?.('adsEnabled')||'Show ads'}</span><input id="ads-enabled" type="checkbox" ${cfg.enabled?'checked':''}></label><label class="control-row"><span>${window.zivoT?.('adsLabel')||'Show ad label'}</span><input id="ads-label" type="checkbox" ${cfg.label?'checked':''}></label><label class="control-row"><span>${window.zivoT?.('adsDensity')||'Ad density'}</span><select id="ads-density"><option value="low" ${cfg.density==='low'?'selected':''}>Low</option><option value="normal" ${cfg.density==='normal'?'selected':''}>Normal</option><option value="high" ${cfg.density==='high'?'selected':''}>High</option></select></label><button class="btn btn-primary full" id="ads-save">${window.zivoT?.('saveProgress')||'Save'}</button></div></div>`;
    root.setAttribute('aria-hidden','false');root.querySelector('[data-close]').onclick=()=>{root.setAttribute('aria-hidden','true');root.innerHTML=''};
    root.querySelector('#ads-save').onclick=()=>{cfg.enabled=root.querySelector('#ads-enabled').checked;cfg.label=root.querySelector('#ads-label').checked;cfg.density=root.querySelector('#ads-density').value;save();apply();root.setAttribute('aria-hidden','true');root.innerHTML=''};
  }
  window.ZIVOZONE_ADS={apply,open,get:()=>({...cfg})};
  document.addEventListener('DOMContentLoaded',apply);
})();
