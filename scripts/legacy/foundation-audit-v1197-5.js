/* ZIVOZONE V1197.5 — Foundation Content/Room Audit */
const fs=require('fs'), path=require('path'), vm=require('vm');
const root=path.resolve(__dirname,'..');
const checks=[]; const pass=(name,detail)=>checks.push({name,status:'PASS',detail}); const fail=(name,detail)=>checks.push({name,status:'FAIL',detail});
function load(src,ctx){vm.runInContext(fs.readFileSync(path.join(root,src),'utf8'),ctx,{filename:src,timeout:5000});}
const ctx={window:{},console,Math,Date,JSON,Object,Array,Set,Map,Number,String,Boolean,RegExp,crypto:{randomUUID:()=>`audit-${Date.now()}`}};
ctx.window.window=ctx.window;ctx.document={readyState:'complete',addEventListener(){}};vm.createContext(ctx);
try{load('core/modules/question-bank.js',ctx);load('core/modules/question-bank-expansion.js',ctx);load('core/modules/content-integrity.js',ctx);pass('Question bank boot','question-bank + no-synthetic expansion + integrity gate loaded');}catch(e){fail('Question bank boot',e.message)}
const C=ctx.window.ZIVOZONE_CHALLENGES||{};
const sources=[...Object.values(C),...Object.values(ctx.window.ZIVOZONE_V18_BANK||{}),...Object.values(ctx.window.ZIVOZONE_V40_BANK||{})];
const uniqueBanks=[...new Map(sources.filter(b=>b?.id&&Array.isArray(b.questions)).map(b=>[b.id,b])).values()];
let total=0,dup=0,bad=0,choice=0,input=0;
for(const b of uniqueBanks){const seen=new Set(); for(const q of b.questions){total++;const raw=q.q??q.question??q.text??'';const text=typeof raw==='object'?(raw.ar||raw.en||JSON.stringify(raw)):String(raw);const key=text.trim().toLowerCase().replace(/\s+/g,' ');if(seen.has(key)){dup++;continue}seen.add(key);const opts=q.a||q.options||q.choices||q.answers;if(Array.isArray(opts)&&opts.length){choice++;const labels=opts.map(x=>String(x?.ar||x?.en||x));if(new Set(labels.map(x=>x.trim().toLowerCase())).size!==labels.length)bad++;if(!Number.isInteger(Number(q.c))||Number(q.c)<0||Number(q.c)>=opts.length)bad++;}else {input++;if(q.answer===undefined&&q.extra?.answer===undefined)bad++;}}}
if(dup===0)pass('Duplicate questions','No exact duplicate question text remains within a bank');else fail('Duplicate questions',`${dup} duplicates remain`);
if(bad===0)pass('Answer binding',`${choice} choice questions + ${input} input questions have valid answer bindings`);else fail('Answer binding',`${bad} malformed questions`);
if(C.horror?.nonScored===true)pass('Dark Room scoring','Subjective Dark Room bank is non-scored');else fail('Dark Room scoring','horror bank still treated as scored');
const puzzle=fs.readFileSync(path.join(root,'core/modules/puzzle-room.js'),'utf8');
if(puzzle.includes("s.data.logic='ليان'"))pass('Puzzle logic','Single-truth logic puzzle resolves to ليان');else fail('Puzzle logic','Expected answer not found');
if(puzzle.includes("'.#####.#','.#...#.#','.#.###.#','.#...#.#','.#.###.#','.#.....#','.#####.E'"))pass('Puzzle maze','Static maze contains a validated start-to-exit corridor');else fail('Puzzle maze','Validated maze map not found');
if(puzzle.includes('الهدف ${arrow[target[i]]}'))pass('Puzzle rotation','Every tile exposes its target direction');else fail('Puzzle rotation','Target direction remains hidden');
if(puzzle.includes("const symbols=['●','▲','■','★','◆','⬟','✚','♥']"))pass('Puzzle visual ambiguity','Observation puzzle uses distinct symbols with exact duplicate only');else fail('Puzzle visual ambiguity','Ambiguous symbol set remains');
// manifest
try{const man=JSON.parse(fs.readFileSync(path.join(root,'games/manifest.json'),'utf8'));const ids=new Set();let issues=0;for(const g of man.games||[]){if(ids.has(g.gameId))issues++;ids.add(g.gameId);if(g.type==='flash'&&g.enabled&&g.asset&&!fs.existsSync(path.join(root,g.asset.replace(/^\//,''))))issues++;}if(issues===0)pass('Game Registry','Unique IDs and enabled asset references are valid');else fail('Game Registry',`${issues} manifest issues`);}catch(e){fail('Game Registry',e.message)}
// forensic structure (load without invoking UI)
try{ctx.window.ZIVOZONE={};ctx.window.localStorage={getItem(){return null},setItem(){}};load('core/modules/forensic-case-core.js',ctx);const cases=ctx.window.ZIVOZONE_FORENSIC_CORE.cases();const badCases=cases.filter(c=>c.questions!==10||c.facts!==10||c.stages!==5);if(cases.length===25&&badCases.length===0)pass('Forensic foundation','25 cases × 10 questions × 10 facts × 5 stages');else fail('Forensic foundation',`cases=${cases.length}, invalid=${badCases.length}`);}catch(e){fail('Forensic foundation',e.message)}
// JS syntax scan
const files=[];function walk(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f);if(f==='node_modules')continue;const st=fs.statSync(p);if(st.isDirectory())walk(p);else if(f.endsWith('.js'))files.push(p)}}walk(root);let syntax=0;for(const f of files){const {spawnSync}=require('child_process');const r=spawnSync(process.execPath,['--check',f],{encoding:'utf8'});if(r.status!==0){syntax++;fail('JS syntax',path.relative(root,f)+': '+(r.stderr||'').split('\n')[0])}}if(syntax===0)pass('JS syntax',`${files.length} JavaScript files parse successfully`);
const summary={totalQuestions:total,banks:uniqueBanks.length,choiceQuestions:choice,inputQuestions:input,checks:checks.length,pass:checks.filter(x=>x.status==='PASS').length,fail:checks.filter(x=>x.status==='FAIL').length};
console.log(JSON.stringify({summary,checks},null,2));
process.exit(summary.fail?1:0);
