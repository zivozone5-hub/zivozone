/* ZIVOZONE V1197.5 — CONTENT / QUESTION INTEGRITY GATE */
(()=>{'use strict';
 const C=()=>window.ZIVOZONE_CHALLENGES||{};
 const norm=v=>String(v??'').trim().toLowerCase().replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[،,؛;]/g,' ').replace(/\s+/g,' ');
 const text=q=>{const v=q?.q??q?.question??q?.text??'';return typeof v==='object'?(v.ar||v.en||JSON.stringify(v)):v};
 function auditBank(bank){
   const report={id:bank.id,total:0,removedDuplicates:0,invalid:0,ambiguous:0,nonScored:Boolean(bank.nonScored),issues:[]};
   if(!Array.isArray(bank.questions))return report;
   const seen=new Set(); const clean=[];
   for(const q of bank.questions){
     report.total++; const k=norm(text(q));
     if(k&&seen.has(k)){report.removedDuplicates++;continue;}
     if(k)seen.add(k);
     const choices=q.a||q.options||q.choices||q.answers;
     if(Array.isArray(choices) && choices.length){
       const labels=choices.map(x=>norm(typeof x==='object'?(x.ar||x.en||JSON.stringify(x)):x));
       if(new Set(labels).size!==labels.length){report.invalid++;report.issues.push({id:q.id,type:'duplicate_options'});continue;}
       if(!Number.isInteger(Number(q.c))||Number(q.c)<0||Number(q.c)>=choices.length){report.invalid++;report.issues.push({id:q.id,type:'invalid_answer_index'});continue;}
     }else if(q.type!=='input' && q.answer===undefined && q.extra?.answer===undefined){
       report.invalid++;report.issues.push({id:q.id,type:'missing_answer'});continue;
     }
     clean.push(q);
   }
   bank.questions=clean;
   return report;
 }
 const sources=[...Object.values(C()),...Object.values(window.ZIVOZONE_V18_BANK||{}),...Object.values(window.ZIVOZONE_V40_BANK||{})]; const unique=new Map(); sources.filter(b=>b&&b.id&&Array.isArray(b.questions)).forEach(b=>unique.set(b.id,b)); const reports=[...unique.values()].map(auditBank);
 const horror=C().horror;if(horror)horror.nonScored=true;
 const summary=()=>({banks:reports.length,total:reports.reduce((n,r)=>n+r.total,0),removedDuplicates:reports.reduce((n,r)=>n+r.removedDuplicates,0),invalid:reports.reduce((n,r)=>n+r.invalid,0)});
 const guard=()=>{const x=summary();return Object.freeze({...x,ok:x.invalid===0&&x.removedDuplicates===0});};
 window.ZIVOZONE_CONTENT_INTEGRITY=Object.freeze({version:'1198.0',reports,summary,guard,audit:()=>reports});
})();
