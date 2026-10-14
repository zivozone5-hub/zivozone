/* V1230.19 — removed the dead `ZIVOZONE.UI` facade that used to open this file: zero callers anywhere
   in the codebase (confirmed by grep, not assumed), and its three methods each duplicate a REAL, active
   system under a different name — toast() shadowed router.js's and economy.js's own real toast()
   functions, modal()/navigate() had no caller at all. Keeping a same-purpose, unused alias alongside the
   real thing is exactly the kind of unnecessary layer that invites a future bug (calling the dead one by
   mistake). The rest of this file (visitor telemetry, UI SFX hooks) is unrelated and unchanged. */

/* V1188 — centralized visitor route telemetry (exit confirmation lives only in runtime/exit-guard.js) */
(()=>{
 'use strict';
 function track(){try{const f=window.firebase?.firestore?.(),u=window.firebase?.auth?.()?.currentUser,day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Amman'}).format(new Date());if(!f)return;const stamp=window.firebase.firestore.FieldValue.serverTimestamp();if(u)f.collection('users').doc(u.uid).set({lastSeenAt:stamp,lastSeenPath:location.hash||'#home',language:document.documentElement.lang||'ar',updatedAt:stamp},{merge:true});else{const id=localStorage.getItem('zivozone_visitor_id_v1');if(!id)return;f.collection('siteStats').doc('visitors').collection(day).doc(id).set({visitorId:id,type:'guest',status:'visitor',lastSeenAt:stamp,lastSeenPath:location.hash||'#home',language:document.documentElement.lang||'ar',updatedAt:stamp},{merge:true});}}catch(_){} }
 window.addEventListener('hashchange',()=>setTimeout(track,50));window.addEventListener('zivozone-auth',()=>setTimeout(track,100));setTimeout(track,1200);
})();


/* V1203 — delegated UI SFX hooks */
(()=>{'use strict';
function sfxFor(el){
  const v=el?.dataset?.sfx;
  if(v==='none'||el?.dataset?.audioIgnore==='true')return null;
  if(v==='heavy')return'click_heavy';
  if(v==='click')return'click_subtle';
  const tag=(el?.tagName||'').toLowerCase();
  if(!['button','a','summary','[role=button]'].includes(tag) && el?.getAttribute?.('role')!=='button')return null;
  const text=(el?.getAttribute?.('aria-label')||el?.textContent||'').trim().toLowerCase();
  const heavy=/start|begin|submit|answer|send|buy|purchase|unlock|mine|claim|reward|play|register|sign in|login|save|confirm|delete|exit|challenge|ابدأ|إرسال|إجابة|شراء|فتح|تعدين|مكافأة|لعب|تسجيل|حفظ|تأكيد|حذف|خروج|تحدي/.test(text);
  return heavy?'click_heavy':'click_subtle';
}
document.addEventListener('click',e=>{const el=e.target?.closest?.('[data-sfx],[data-audio-ignore],button,a,summary,[role=button]');if(!el)return;const name=sfxFor(el);if(name)window.ZIVOZONE_AUDIO?.playSFX?.(name)},true);
window.addEventListener('zivozone:menu-open',()=>window.ZIVOZONE_AUDIO?.playSFX?.('menu_open'));
window.addEventListener('zivozone:menu-close',()=>window.ZIVOZONE_AUDIO?.playSFX?.('menu_close'));
})();
