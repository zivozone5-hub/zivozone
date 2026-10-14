/* V1229.5 — dedupes each bank's questions in place. No synthetic duplicates.
   The foundation must never manufacture cloned questions just to reach a numeric floor.
   New questions are added only as authored canonical content.
*/
(()=>{'use strict';
 const B=()=>window.ZIVOZONE_CHALLENGES||{};
 const normalize=v=>String(v??'').trim().toLowerCase().replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[،,؛;]/g,' ').replace(/\s+/g,' ');
 function key(q){const v=q?.q??q?.question??q?.text??'';return normalize(typeof v==='object'?(v.ar||v.en||JSON.stringify(v)):v)}
 function dedupe(bank){
   if(!bank?.questions?.length)return;
   const seen=new Set();
   bank.questions=bank.questions.filter(q=>{const k=key(q);if(!k||seen.has(k))return false;seen.add(k);return true});
 }
 Object.values(B()).forEach(dedupe);
 // V1229.5: the ZIVOZONE_QUESTION_BANK_FLOOR export (min/policy/counts) was never read anywhere
 // else in the codebase — only the dedupe pass above is live behavior, which is unchanged.
})();
