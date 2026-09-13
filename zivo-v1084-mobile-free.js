/* ZIVOZONE V1084 — lightweight mobile/free-tier controller */
(function(){
  'use strict';
  function bindDark(){
    const card=document.querySelector('#zivo-dark-room .z1062-horror-card');
    if(!card || card.dataset.v1084Bound)return;
    card.dataset.v1084Bound='1';
    const open=()=>window.ZIVOZONE_V20?.start?.('horror');
    card.addEventListener('click',open);
    card.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}
    });
  }
  function placeEconomy(){
    const home=document.getElementById('home');
    const economy=document.getElementById('zivo-v101-economy');
    if(!home||!economy)return;
    if(window.matchMedia('(max-width:700px)').matches && economy.parentElement!==home.parentElement){
      home.insertAdjacentElement('afterend',economy);
    }
  }
  function boot(){bindDark();placeEconomy();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.addEventListener('load',()=>setTimeout(boot,250));
  window.addEventListener('resize',()=>{clearTimeout(window.__zivo1084r);window.__zivo1084r=setTimeout(placeEconomy,150)});
})();
