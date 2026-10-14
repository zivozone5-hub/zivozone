#!/usr/bin/env node
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..');
const file=path.join(root,'core/modules/question-bank.js');
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});
const C=ctx.window.ZIVOZONE_CHALLENGES||{};
const failures=[],warnings=[];let total=0,choices=0,direct=0;
for(const [id,b] of Object.entries(C)){
  if(!b||!Array.isArray(b.questions)) continue;
  for(const q of b.questions){
    total++;
    const label=`${id}/${q.id||'legacy'}`;
    const opts=q.a||q.options||q.choices||q.answers;
    if(Array.isArray(opts)&&opts.length){
      choices++;
      if(!Number.isInteger(q.c)||q.c<0||q.c>=opts.length) failures.push(`${label}: invalid choice index`);
      if(opts.length<2) failures.push(`${label}: less than 2 choices`);
      const values=opts.map(x=>typeof x==='object'?(x.ar??x.q??x.text??JSON.stringify(x)):String(x));
      if(new Set(values).size!==values.length) failures.push(`${label}: duplicate choices`);
    } else if(q.type!=='input' && q.answer!==undefined){
      direct++;
      if(q.answer!== '*' && (String(q.answer).trim()==='' || q.answer===null)) failures.push(`${label}: empty direct answer`);
    } else if(q.type!=='input') {
      failures.push(`${label}: no answer representation`);
    }
    if(q.q===undefined&&q.question===undefined) failures.push(`${label}: missing question text`);
  }
}
console.log(`QUESTION_BANK_TOTAL=${total}`);
console.log(`CHOICE=${choices} DIRECT=${direct}`);
console.log(`FAIL=${failures.length}`);
if(failures.length) console.log(failures.join('\n'));
if(warnings.length) console.log(warnings.join('\n'));
process.exitCode=failures.length?1:0;
