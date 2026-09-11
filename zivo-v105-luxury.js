/* ZIVOZONE V105 — luxury interaction polish, no replacement of the existing engines */
(()=>{'use strict';
 const $=(s,r=document)=>r.querySelector(s);
 function activeNav(){const id=(location.hash||'#home').slice(1)||'home';document.querySelectorAll('.mobile-nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+id));}
 function mountWelcomeBadge(){
   if($('#z105-welcome'))return;
   const bar=document.createElement('div');bar.id='z105-welcome';bar.innerHTML='<span class="z105-dot"></span><b>ZIVOZONE</b><span>منصة اللعب والتحديات والتقدم</span>';
   const style=document.createElement('style');style.textContent=`#z105-welcome{display:flex;align-items:center;justify-content:center;gap:7px;width:min(1180px,calc(100% - 26px));margin:7px auto 0;padding:6px 10px;border:1px solid rgba(47,191,255,.12);border-radius:11px;background:rgba(255,255,255,.018);color:#718198;font-size:8px;letter-spacing:.02em}#z105-welcome b{color:#51d8ff;letter-spacing:.08em}.z105-dot{width:6px;height:6px;border-radius:50%;background:#55ef9d;box-shadow:0 0 12px #55ef9d}@media(max-width:700px){#z105-welcome{width:calc(100% - 12px);font-size:7px;padding:5px}}`;document.head.appendChild(style);const econ=$('#zivo-v101-economy');if(econ)econ.insertAdjacentElement('afterend',bar);
 }
 function bind(){mountWelcomeBadge();activeNav();}
 addEventListener('hashchange',activeNav);document.addEventListener('DOMContentLoaded',()=>setTimeout(bind,250));setTimeout(bind,800);
})();
