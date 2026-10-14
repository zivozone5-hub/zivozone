/* ZIVOZONE V1200 — REAL PUZZLE ROOM
   Original mini-games with complete interactions and mobile controls.
*/
(()=>{'use strict';
const esc=window.ZIVOZONE_ESC;
const A=()=>window.ZIVOZONE_AUDIO;
const t=k=>{try{return window.zivoT?window.zivoT(k):(window.ZIVOZONE_I18N?.tr?.(k)||k)}catch(_){return k}};
// V1230.32 — bilingual {ar,en,...} dict lookup by the visitor's current language, same pattern as
// horror-room.js's L(); the epic CTA button used to always show EPIC_NAME_PR.ar regardless of language.
const L=dict=>{try{return dict[window.ZIVOZONE_I18N?.get?.()||'ar']||dict.en||dict.ar}catch(_){return dict.ar}};
const fmt=(k,vars)=>Object.entries(vars||{}).reduce((s,[key,val])=>s.replace(`{${key}}`,val),t(k));
const CLOCK_MS=10*60*1000;
function fmtClock(ms){const t=Math.max(0,Math.ceil(ms/1000));const m=Math.floor(t/60),sec=t%60;return String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0')}
const STAGE_DEFS=[
{id:'observe',titleKey:'puzzleStageTitle01',introKey:'puzzleStageIntro01',reward:5},
{id:'sequence',titleKey:'puzzleStageTitle02',introKey:'puzzleStageIntro02',reward:6},
{id:'memory',titleKey:'puzzleStageTitle03',introKey:'puzzleStageIntro03',reward:7},
{id:'rotate',titleKey:'puzzleStageTitle04',introKey:'puzzleStageIntro04',reward:8},
{id:'code',titleKey:'puzzleStageTitle05',introKey:'puzzleStageIntro05',reward:9},
{id:'maze',titleKey:'puzzleStageTitle06',introKey:'puzzleStageIntro06',reward:9},
{id:'sort',titleKey:'puzzleStageTitle07',introKey:'puzzleStageIntro07',reward:8},
{id:'logic',titleKey:'puzzleStageTitle08',introKey:'puzzleStageIntro08',reward:9},
{id:'pattern',titleKey:'puzzleStageTitle09',introKey:'puzzleStageIntro09',reward:9},
{id:'final',titleKey:'puzzleStageTitle10',introKey:'puzzleStageIntro10',reward:15}
];
// title/intro resolved live through t() so a language switch mid-room updates them too, instead of
// baking the string in once at module load.
const stages=STAGE_DEFS.map(d=>({id:d.id,reward:d.reward,get title(){return t(d.titleKey)},get intro(){return t(d.introKey)}}));
const s={root:null,i:0,score:0,solved:[],attempts:0,data:{},clockTimer:null,deadline:0,streak:0,bestStreak:0,finished:false,activeDuel:null};
function root(){if(!s.root){s.root=document.createElement('div');s.root.id='zivo-puzzle-room';s.root.className='zivo-puzzle-room';document.body.appendChild(s.root)}return s.root}
function stopClock(){if(s.clockTimer){clearInterval(s.clockTimer);s.clockTimer=null}}
function startClock(){stopClock();s.deadline=Date.now()+CLOCK_MS;s.clockTimer=setInterval(tickClock,1000);tickClock()}
function tickClock(){const el=document.getElementById('zpr-clock');if(!el)return;const rem=s.deadline-Date.now();el.textContent=fmtClock(rem);el.classList.toggle('low',rem<60000&&rem>0);if(rem<=0){stopClock();timeUp()}}
function timeUp(){if(s.finished)return;finish(true)}
function close(){stopClock();window.removeEventListener('keydown',s.keyHandler);try{A()?.stopAmbient?.()}catch(_){}root().classList.remove('active');document.body.classList.remove('zivo-puzzle-active');location.hash='#home';window.scrollTo?.({top:0,behavior:'instant'})}
function back(){const g=window.ZIVOZONE?.ExitGuard;if(g?.open)g.open(close,t('puzzleExitConfirm'));else close()}
// V1230.62 — quality pass (visuals weak / no success feel, flagged alongside the Dark Room pass in
// 1230.58/.59 and left pending since). The puzzle logic itself was already solid (and already had a
// streak/bonus system Dark Room didn't), so the gap here was purely the complete absence of any
// motion or "you got it" moment: success()/fail() only ever swapped a text string. Both now pulse the
// board (.zpr-board) the same way Dark Room's classic mode and horror-room.css's shake pattern do,
// and success() spawns a floating "+N" score popup so the reward actually registers visually.
function fail(msg){ s.attempts++;s.streak=0;const f=document.getElementById('zpr-feedback');if(f){f.textContent='✕ '+msg;f.className='zpr-feedback bad'}const bd=document.getElementById('zpr-board');if(bd){bd.classList.remove('zpr-shake');void bd.offsetWidth;bd.classList.add('zpr-shake')}try{A()?.playSfx?.('wrong')}catch(_){}}
function success(msg){const st=stages[s.i];s.streak++;s.bestStreak=Math.max(s.bestStreak,s.streak);const bonus=s.streak>1?Math.min(s.streak-1,5):0;const gained=st.reward+bonus;s.score+=gained;s.solved.push(st.id);const f=document.getElementById('zpr-feedback');if(f){f.textContent='✓ '+msg+(bonus?' '+fmt('puzzleStreakBonus',{bonus,streak:s.streak}):'');f.className='zpr-feedback good'}const bd=document.getElementById('zpr-board');if(bd){bd.classList.remove('zpr-flash');void bd.offsetWidth;bd.classList.add('zpr-flash');const pop=document.createElement('span');pop.className='zpr-scorepop';pop.textContent='+'+gained;bd.appendChild(pop);setTimeout(()=>pop.remove(),900)}try{A()?.playSfx?.('correct')}catch(_){}setTimeout(()=>{s.i++;s.attempts=0;s.i>=stages.length?finish():intro()},650)}
function shell(body){const st=stages[s.i];return `<div class="zpr-shell" dir="rtl"><header class="zpr-head"><div><small>ZIVOZONE // PUZZLE ROOM // V1200</small><h1>${esc(t('puzzleRoomTitle'))}</h1><p>${esc(fmt('puzzleStageOfFmt',{n:s.i+1,total:stages.length}))} · ${esc(st.title)}</p></div><div class="zpr-head-actions"><span class="zpr-progress"><i style="width:${((s.i)/stages.length)*100}%"></i></span><span class="zpr-clock" id="zpr-clock" title="${esc(t('puzzleClockTitle'))}">⏱ ${fmtClock(s.deadline?s.deadline-Date.now():CLOCK_MS)}</span><span class="zpr-streak" title="${esc(t('puzzleStreakTitle'))}">🔥 ${s.streak}</span><b>${esc(fmt('puzzleScoreValueFmt',{score:s.score}))}</b><button class="zpr-return">${esc(t('puzzleReturnHome'))}</button></div></header><div class="zpr-stagebar">${stages.map((x,i)=>`<span class="${i<s.i?'done':i===s.i?'active':''}"><b>${i+1}</b>${esc(x.title)}</span>`).join('')}</div><main class="zpr-main">${body}</main></div>`}
/* V1230.29 — "Epic 50" grand challenge for the Puzzle Room, alongside the classic 10-stage vault
   above (unchanged). 50 levels / 5 bands of a sequence-replay lock, each band adding a genuinely
   new rule (reversed order, decoy flashes, a filtered color-group twist) instead of only speeding
   the same mechanic up. */
const EPIC_NAME_PR={ar:'القبو اللامتناهي',en:'The Infinite Vault',zh:'无尽地窖',hi:'अनंत तहखाना',es:'La Bóveda Infinita',fr:'Le Coffre Infini',fa:'گاوصندوق بی‌پایان'};
const EPIC_BANDS_PR=[
 {names:{ar:'الذاكرة',en:'Memory',zh:'记忆',hi:'स्मृति',es:'Memoria',fr:'Mémoire',fa:'حافظه'},twist:{ar:'راقب تسلسل الألوان ثم أعده بالترتيب نفسه.',en:'Watch the color sequence, then repeat it in the same order.',zh:'观察颜色顺序，然后按相同顺序重复。',hi:'रंगों का क्रम देखें, फिर उसी क्रम में दोहराएं।',es:'Observa la secuencia de colores y repítela en el mismo orden.',fr:'Observez la séquence de couleurs, puis reproduisez-la dans le même ordre.',fa:'توالی رنگ‌ها را تماشا کنید، سپس آن را به همان ترتیب تکرار کنید.'}},
 {names:{ar:'الانعكاس',en:'Reversal',zh:'逆转',hi:'उल्टा क्रम',es:'Inversión',fr:'Inversion',fa:'وارونگی'},twist:{ar:'من الآن، أعد التسلسل بالعكس — من الأخير إلى الأول.',en:'From now on, replay the sequence backwards — last to first.',zh:'从现在起，倒序重放序列——从最后一个到第一个。',hi:'अब से, क्रम को उल्टा दोहराएं — आख़िरी से पहले तक।',es:'Desde ahora, repite la secuencia al revés: de la última a la primera.',fr:'Désormais, rejouez la séquence à l\'envers — de la dernière à la première.',fa:'از این پس، توالی را برعکس تکرار کنید — از آخر به اول.'}},
 {names:{ar:'الإشارات الكاذبة',en:'False Signals',zh:'虚假信号',hi:'झूठे संकेत',es:'Señales Falsas',fr:'Faux Signaux',fa:'سیگنال‌های کاذب'},twist:{ar:'ستظهر ومضات حمراء خادعة أثناء العرض. تجاهلها تمامًا.',en:'Red decoy flashes will appear during the display. Ignore them completely.',zh:'显示过程中会出现红色诱饵闪光。完全忽略它们。',hi:'प्रदर्शन के दौरान लाल धोखे वाली चमक दिखेंगी। उन्हें पूरी तरह नज़रअंदाज़ करें।',es:'Durante la secuencia aparecerán destellos rojos señuelo. Ignóralos por completo.',fr:'Des éclats rouges-leurres apparaîtront pendant l\'affichage. Ignorez-les complètement.',fa:'در طول نمایش، چشمک‌های قرمز فریبنده ظاهر می‌شوند. آن‌ها را کاملاً نادیده بگیرید.'}},
 {names:{ar:'الفريق السري',en:'The Secret Group',zh:'秘密小组',hi:'गुप्त समूह',es:'El Grupo Secreto',fr:'Le Groupe Secret',fa:'گروه مخفی'},twist:{ar:'سيظهر حرف A أو B: أعد فقط الألوان التابعة لتلك الفئة، بالترتيب المطلوب.',en:'A letter A or B will appear: replay only the colors in that group, in the required order.',zh:'会出现字母A或B：只重放该组的颜色，按要求的顺序。',hi:'अक्षर A या B दिखेगा: केवल उस समूह के रंगों को आवश्यक क्रम में दोहराएं।',es:'Aparecerá una letra A o B: repite solo los colores de ese grupo, en el orden requerido.',fr:'Une lettre A ou B apparaîtra : ne rejouez que les couleurs de ce groupe, dans l\'ordre requis.',fa:'حرف A یا B ظاهر می‌شود: فقط رنگ‌های آن گروه را به ترتیب لازم تکرار کنید.'}},
 {names:{ar:'القفل الأخير',en:'The Final Lock',zh:'最后的锁',hi:'अंतिम ताला',es:'El Candado Final',fr:'Le Verrou Final',fa:'آخرین قفل'},twist:{ar:'كل القواعد السابقة مجتمعة معًا. هذا هو القفل الذي لا يفتحه إلا القليلون.',en:'Every previous rule, all at once. This is the lock almost no one opens.',zh:'之前所有规则一起生效。这是几乎没人能打开的锁。',hi:'पहले के सभी नियम एक साथ। यह वह ताला है जिसे शायद ही कोई खोल पाता है।',es:'Todas las reglas anteriores a la vez. Este es el candado que casi nadie abre.',fr:'Toutes les règles précédentes à la fois. C\'est le verrou que presque personne n\'ouvre.',fa:'همه قوانین قبلی با هم. این قفلی است که تقریباً هیچ‌کس آن را باز نمی‌کند.'}}
];
function playVault(band,bandLv,api){
 const {lerp,rint,addTimer,clear,ctx,point,addListener,winLevel,loseLevel,canvas,W,txt}=api;
 const colors=['#ff6b6b','#5de0b0','#5aa7ff','#ffe066','#c792ff','#ff9f5b'];
 const n=Math.min(colors.length,Math.round(lerp(bandLv,4,6)));
 const len=Math.round(lerp(bandLv,3,8));
 const reverseOn=band>=2,distractOn=band>=3,dualOn=band>=4;
 const groupOf=i=>i<Math.ceil(n/2)?'A':'B';
 let seq;
 do{seq=[];for(let i=0;i<len;i++)seq.push(rint(0,n-1));}while(dualOn&&(!seq.some(i=>groupOf(i)==='A')||!seq.some(i=>groupOf(i)==='B')));
 const targetGroup=dualOn?(Math.random()<0.5?'A':'B'):null;
 const expected=dualOn?seq.filter(i=>groupOf(i)===targetGroup):seq.slice();
 const playOrder=reverseOn?[...expected].reverse():expected;
 const boxW=(W-80)/n;
 // V1230.62 — same quality pass as success()/fail() above, applied to this canvas game: rounded
 // tiles with a glow on the lit tile instead of flat fillRect blocks, plus a brief white pulse on
 // the tapped tile in startInput() below so a correct tap gives feedback before the next one lights.
 const drawBoard=(hl=-1,fakeHl=-1)=>{
  clear();
  for(let i=0;i<n;i++){
   const x=40+i*boxW,y=200,w=boxW-8,h=160;
   ctx.save();
   if(i===hl){ctx.shadowColor='#fff';ctx.shadowBlur=28}
   ctx.fillStyle=i===hl?'#fff':colors[i];
   ctx.beginPath();
   if(ctx.roundRect)ctx.roundRect(x,y,w,h,16);else ctx.rect(x,y,w,h);
   ctx.fill();
   ctx.restore();
   if(i===fakeHl){ctx.strokeStyle='#ff4d6d';ctx.lineWidth=4;ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,16);else ctx.rect(x,y,w,h);ctx.stroke()}
  }
 };
 drawBoard();
 let step=0;
 function showStep(){
  if(step>=seq.length){startInput();return}
  const fake=distractOn&&Math.random()<0.4?(()=>{let f;let guard=0;do{f=rint(0,n-1)}while(f===seq[step]&&guard++<20);return f})():-1;
  drawBoard(seq[step],fake);
  addTimer(()=>{drawBoard(-1,-1);addTimer(()=>{step++;showStep()},120)},lerp(bandLv,520,220));
 }
 addTimer(()=>showStep(),400);
 function startInput(){
  drawBoard();
  if(dualOn)txt(targetGroup,450,40,30,'center','#ffd84a');
  let idx=0;
  const onClick=e=>{
   const p=point(e);
   const i=Math.floor((p.x-40)/boxW);
   if(i<0||i>=n||p.y<200||p.y>360)return;
   if(i===playOrder[idx]){
    idx++;
    drawBoard(i);
    if(idx>=playOrder.length){addTimer(()=>winLevel(),140);return}
    addTimer(()=>drawBoard(),140);
   }
   else loseLevel();
  };
  addListener(canvas,'click',onClick);
 }
}
function grantPuzzleEpicReward(){
 window.ZIVOZONE?.Economy?.credit?.(5,{type:'puzzle_epic_reward',source:'puzzle',puzzle:'epic50',claimId:'puzzle_epic50_clear'}).then(ok=>{if(ok)window.ZIVOZONE?.Economy?.addXP?.(60)});
}
function openEpic(){
 root().classList.add('active');document.body.classList.add('zivo-puzzle-active');
 root().innerHTML=`<div class="zpr-shell" dir="rtl"><header class="zpr-head"><div><small>ZIVOZONE // PUZZLE ROOM</small><h1>${esc(t('puzzleRoomTitle'))}</h1></div><div class="zpr-head-actions"><button class="zpr-return" id="zpr-epic-exit">${esc(t('epic50Back'))}</button></div></header><main class="zpr-main"><div id="zpr-epic-mount"></div></main></div>`;
 root().querySelector('#zpr-epic-exit').onclick=()=>{s.i=0;intro()};
 try{A()?.unlock?.();A()?.transitionAmbient?.('logic')}catch(_){}
 window.ZIVOZONE_EPIC50?.mount(root().querySelector('#zpr-epic-mount'),{
  id:'puzzle_epic',icon:'🧩',names:EPIC_NAME_PR,bands:EPIC_BANDS_PR,
  archFn:playVault,
  onExit:()=>{s.i=0;intro()},
  onFinish:won=>{if(won)grantPuzzleEpicReward()},
  // V1230.92 — "Challenge a friend" (duel): see horror-room.js's matching comment at its own
  // ZIVOZONE_EPIC50?.mount() call for why this is needed.
  shareGameId:'rooms/puzzle-room',shareName:L(EPIC_NAME_PR)
 });
}
function gatedEpicStartPR(){return window.ZIVOZONE_REQUIRE_PLAY?window.ZIVOZONE_REQUIRE_PLAY(openEpic):openEpic()}
function intro(){const st=stages[s.i];const epicCta=s.i===0?`<button type="button" class="zivo-epic-cta" id="zpr-epic-start">🧩 ${esc(L(EPIC_NAME_PR))} — ${esc(t('epic50Tag'))}</button>`:'';root().innerHTML=shell(`<section class="zpr-intro"><div class="zpr-door-art"><div class="zpr-orb">${String(s.i+1).padStart(2,'0')}</div><span>PUZZLE CHAMBER</span></div><div class="zpr-intro-copy"><span class="zpr-kicker">STAGE ${String(s.i+1).padStart(2,'0')}</span><h2>${esc(st.title)}</h2><p>${esc(st.intro)}</p><div class="zpr-rules"><b>${esc(t('puzzleRealChallengeTitle'))}</b><span>${esc(t('puzzleRealChallengeText'))}</span></div><button class="zpr-primary" id="zpr-start">${esc(t('puzzleStartStageBtn'))}</button>${epicCta}</div></section>`);bindIntro();if(s.i===0){const eb=root().querySelector('#zpr-epic-start');if(eb)eb.onclick=()=>gatedEpicStartPR()}}
function board(body){const st=stages[s.i];return `<section class="zpr-puzzle"><div class="zpr-instruction"><div><span class="zpr-kicker">${String(s.i+1).padStart(2,'0')} // LIVE PUZZLE</span><h2>${esc(st.title)}</h2><p>${esc(st.intro)}</p></div><div class="zpr-live">${fmt('puzzleLiveAttemptsFmt',{attempts:s.attempts})} · ${fmt('puzzleLiveScoreFmt',{score:s.score})}</div></div><div class="zpr-board" id="zpr-board">${body}</div><div id="zpr-feedback" class="zpr-feedback"></div></section>`}
function render(body){root().innerHTML=shell(board(body));bind();}
// 1 observation
function observe(){const symbols=['●','▲','■','★','◆','⬟','✚','♥'];const dup=symbols[Math.floor(Math.random()*symbols.length)];s.data.observe=dup;const others=symbols.filter(x=>x!==dup).slice(0,6);let a=[...others,dup,dup];a.sort(()=>Math.random()-.5);return `<div class="zpr-question">${esc(t('puzzleObserveQuestion'))}</div><div class="zpr-symbol-grid">${a.map((x,i)=>`<button class="zpr-symbol" data-ob="${esc(x)}" aria-label="${esc(fmt('puzzleObserveSymbolAriaFmt',{symbol:x}))}">${x}</button>`).join('')}</div><small>${t('puzzleObserveHint')}</small>`}
// 2 sequence
function sequence(){const base=2+Math.floor(Math.random()*5),d=2+Math.floor(Math.random()*5);const a=[base,base+d,base+2*d,base+3*d],ans=base+4*d;s.data.answer=ans;const opts=[ans,ans+d,ans-1,ans+2].sort(()=>Math.random()-.5);return `<div class="zpr-seq">${a.map(x=>`<span>${x}</span>`).join('<i>→</i>')}<i>→</i><span>?</span></div><div class="zpr-options">${opts.map(x=>`<button data-seq="${x}">${x}</button>`).join('')}</div><small>${esc(t('puzzleSequenceHint'))}</small>`}
// 3 memory pairs
function memory(){const vals=['◆','●','▲','■','✦','⬟'];const cards=[...vals,...vals].sort(()=>Math.random()-.5);s.data.mem={cards,open:[],matched:[]};return `<div class="zpr-memory-grid zpr-memory-4">${cards.map((x,i)=>`<button class="zpr-memory" data-mem="${i}" data-val="${x}">?</button>`).join('')}</div><p>${esc(t('puzzleMemoryHint'))}</p>`}
// 4 rotate
function rotate(){const target=[0,1,2,1,0,2,3,0,1];s.data.rot={target,cur:Array(9).fill(0).map(()=>Math.floor(Math.random()*4))};const arrow=['↑','→','↓','←'];return `<div class="zpr-grid-3 zpr-rotate-grid">${s.data.rot.cur.map((r,i)=>`<button class="zpr-tile rot-${r}" data-rot="${i}" aria-label="${esc(fmt('puzzleRotatePieceAriaFmt',{n:i+1,cur:arrow[r],target:arrow[target[i]]}))}"><i></i><small>${i+1}</small><em>${esc(fmt('puzzleRotateTargetFmt',{arrow:arrow[target[i]]}))}</em></button>`).join('')}</div><button class="zpr-check" id="rot-check">${esc(t('puzzleRotateCheckBtn'))}</button><small>${esc(t('puzzleRotateHint'))}</small>`}
// 5 code
function code(){const secret=String(Math.floor(1000+Math.random()*9000));s.data.code=secret;return `<div class="zpr-code-lock"><div class="zpr-code-display" id="code-display">_ _ _ _</div><div class="zpr-keypad">${'1234567890'.split('').map(x=>`<button data-key="${x}">${x}</button>`).join('')}</div><button class="zpr-check" id="code-check">${esc(t('puzzleCodeCheckBtn'))}</button><div id="code-hint" class="zpr-code-hint">${esc(t('puzzleCodeHintInitial'))}</div></div>`}
// 6 maze
function maze(){const map=['S.......','.#####.#','.#...#.#','.#.###.#','.#...#.#','.#.###.#','.#.....#','.#####.E'];s.data.maze={map,pos:[0,0]};return `<div class="zpr-maze" id="maze-grid">${map.map((r,y)=>[...r].map((c,x)=>`<button class="cell ${c==='#'?'wall':''} ${c==='E'?'exit':''} ${x===0&&y===0?'player':''}" data-x="${x}" data-y="${y}">${c==='E'?'◆':''}</button>`).join('')).join('')}</div><div class="zpr-controls"><button data-move="up">↑</button><div><button data-move="right">→</button><button data-move="down">↓</button><button data-move="left">←</button></div></div><small>${esc(t('puzzleMazeHint'))}</small>`}
// 7 sort
function sort(){const vals=['18:20','19:05','17:45','20:10','18:50'];s.data.sort={vals:vals.sort(()=>Math.random()-.5)};return `<div class="zpr-sort-list" id="sort-list">${s.data.sort.vals.map((x,i)=>`<div class="zpr-sort-item" data-index="${i}"><button data-up="${i}">↑</button><b>${x}</b><button data-down="${i}">↓</button></div>`).join('')}</div><button class="zpr-check" id="sort-check">${esc(t('puzzleSortCheckBtn'))}</button><small>${esc(t('puzzleSortHint'))}</small>`}
// 8 logic
function logic(){s.data.logic='lian';const n1=t('puzzleLogicName1'),n2=t('puzzleLogicName2'),n3=t('puzzleLogicName3');return `<div class="zpr-logic-card"><p><b>${esc(n1)}:</b> ${esc(fmt('puzzleLogicStatement1Fmt',{n1}))}</p><p><b>${esc(n2)}:</b> ${esc(fmt('puzzleLogicStatement2Fmt',{n2,n3}))}</p><p><b>${esc(n3)}:</b> ${esc(fmt('puzzleLogicStatement3Fmt',{n2,n3}))}</p><p>${esc(t('puzzleLogicQuestion'))}</p></div><div class="zpr-options">${[['lian',n1],['sami',n2],['rami',n3]].map(([id,label])=>`<button data-logic="${id}">${esc(label)}</button>`).join('')}</div>`}
// 9 pattern
function pattern(){const b=2+Math.floor(Math.random()*4);const a=[b,b*2,b*2+1,b*4+1,b*4+2],ans=b*8+2;s.data.pattern=ans;return `<div class="zpr-pattern">${a.map(x=>`<span>${x}</span>`).join('<i>→</i>')}<i>→</i><b>?</b></div><div class="zpr-options">${[ans,ans+1,ans-2,ans+4].sort(()=>Math.random()-.5).map(x=>`<button data-pattern="${x}">${x}</button>`).join('')}</div><small>${esc(t('puzzlePatternHint'))}</small>`}
// 10 final
function final(){const key=(s.solved.length*7+s.score)%10;s.data.final=key;return `<div class="zpr-final-vault"><div class="zpr-vault-ring">?</div><h3>${esc(t('puzzleFinalVaultHeading'))}</h3><p>${fmt('puzzleFinalSealsFmt',{solved:s.solved.length,score:s.score})}</p><p>${esc(t('puzzleFinalFormula'))}</p><div class="zpr-options">${[0,1,2,3,4,5,6,7,8,9].map(x=>`<button data-final="${x}">${x}</button>`).join('')}</div></div>`}
function moveMaze(dx,dy){const m=s.data.maze,n=s.data.maze.pos,x=n[0]+dx,y=n[1]+dy;if(y<0||y>=m.map.length||x<0||x>=m.map[0].length)return fail(t('puzzleMazeFailBounds'));if(m.map[y][x]==='#')return fail(t('puzzleMazeFailWall'));m.pos=[x,y];document.querySelectorAll('.zpr-maze .cell').forEach(c=>c.classList.toggle('player',Number(c.dataset.x)===x&&Number(c.dataset.y)===y));if(m.map[y][x]==='E')success(t('puzzleMazeSuccess'))}
function bindIntro(){root().querySelector('#zpr-start')?.addEventListener('click',()=>{const id=stages[s.i].id;const fn={observe,sequence,memory,rotate,code,maze,sort,logic,pattern,final}[id];render(fn())});root().querySelector('.zpr-return')?.addEventListener('click',back)}
function bind(){
 root().querySelector('.zpr-return')?.addEventListener('click',back);
 root().querySelectorAll('[data-ob]').forEach(b=>b.onclick=()=>b.dataset.ob===s.data.observe?success(t('puzzleObserveSuccess')):fail(t('puzzleObserveFail')));
 root().querySelectorAll('[data-seq]').forEach(b=>b.onclick=()=>Number(b.dataset.seq)===s.data.answer?success(t('puzzleSequenceSuccess')):fail(t('puzzleSequenceFail')));
 root().querySelectorAll('[data-mem]').forEach(b=>b.onclick=()=>memoryClick(b));
 root().querySelectorAll('[data-rot]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.rot);s.data.rot.cur[i]=(s.data.rot.cur[i]+1)%4;b.className='zpr-tile rot-'+s.data.rot.cur[i]});
 root().querySelector('#rot-check')?.addEventListener('click',()=>s.data.rot.cur.every((v,i)=>v===s.data.rot.target[i])?success(t('puzzleRotateSuccess')):fail(t('puzzleRotateFail')));
 let entered='';const disp=root().querySelector('#code-display');root().querySelectorAll('[data-key]').forEach(b=>b.onclick=()=>{if(entered.length<4)entered+=b.dataset.key;disp.textContent=entered.padEnd(4,'_').split('').join(' ')});
 root().querySelector('#code-check')?.addEventListener('click',()=>{if(entered.length!==4)return fail(t('puzzleCodeFailIncomplete'));const secret=s.data.code;const exact=[...entered].filter((x,i)=>x===secret[i]).length;const present=[...entered].filter(x=>secret.includes(x)).length;if(entered===secret)return success(t('puzzleCodeSuccess'));document.getElementById('code-hint').textContent=fmt('puzzleCodeHintProgressFmt',{exact,present});entered='';disp.textContent='_ _ _ _';fail(t('puzzleCodeFail'))});
 root().querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>({up:()=>moveMaze(0,-1),down:()=>moveMaze(0,1),left:()=>moveMaze(-1,0),right:()=>moveMaze(1,0)})[b.dataset.move]());
 if(root().querySelector('#maze-grid')){s.keyHandler=e=>{const k=e.key.toLowerCase(),m={arrowup:[0,-1],w:[0,-1],arrowdown:[0,1],s:[0,1],arrowleft:[-1,0],a:[-1,0],arrowright:[1,0],d:[1,0]}[k];if(m){e.preventDefault();moveMaze(...m)}};window.addEventListener('keydown',s.keyHandler)}
 root().querySelectorAll('[data-up],[data-down]').forEach(b=>b.onclick=()=>{const item=b.closest('.zpr-sort-item'),list=item.parentElement,idx=[...list.children].indexOf(item),to=b.dataset.up!==undefined?idx-1:idx+1;if(to<0||to>=list.children.length)return;list.insertBefore(item,b.dataset.up!==undefined?list.children[to]:list.children[to].nextSibling)});
 root().querySelector('#sort-check')?.addEventListener('click',()=>{const a=[...root().querySelectorAll('.zpr-sort-item b')].map(x=>x.textContent);const sorted=[...a].sort();sorted.join('|')===a.join('|')?success(t('puzzleSortSuccess')):fail(t('puzzleSortFail'));});
 root().querySelectorAll('[data-logic]').forEach(b=>b.onclick=()=>b.dataset.logic===s.data.logic?success(t('puzzleLogicSuccess')):fail(t('puzzleLogicFail')));
 root().querySelectorAll('[data-pattern]').forEach(b=>b.onclick=()=>Number(b.dataset.pattern)===s.data.pattern?success(t('puzzlePatternSuccess')):fail(t('puzzlePatternFail')));
 root().querySelectorAll('[data-final]').forEach(b=>b.onclick=()=>Number(b.dataset.final)===s.data.final?finish():fail(t('puzzleFinalFail')));
}
function memoryClick(b){const d=s.data.mem,i=Number(b.dataset.mem);if(d.matched.includes(i)||d.open.includes(i))return;d.open.push(i);b.textContent=d.cards[i];b.classList.add('open');if(d.open.length<2)return;const [a,c]=d.open;if(d.cards[a]===d.cards[c]){d.matched.push(a,c);d.open=[];if(d.matched.length===d.cards.length)success(t('puzzleMemorySuccess'))}else{setTimeout(()=>{[a,c].forEach(j=>{const x=root().querySelector(`[data-mem="${j}"]`);if(x){x.textContent='?';x.classList.remove('open')}});d.open=[]},550)}}
async function finish(timedOut=false){s.finished=true;stopClock();const perfect=s.solved.length===stages.length;let validated=null;try{validated=await window.ZIVOZONE?.GamePlatform?.recordProviderResult?.({gameId:'puzzle-room-v1197',room:'puzzle',version:'1197.5',score:s.solved.length,correct:s.solved.length,total:stages.length,duration:0,completed:!timedOut,timedOut});}catch(e){console.warn('Puzzle result validation failed:',e)}const validatedPerfect=Boolean(validated?.perfect);const eventId=validated?.sessionId||('puzzle-'+Date.now());window.dispatchEvent(new CustomEvent('zivozone-result',{detail:{...(validated||{}),challenge:'puzzle-room',gameId:'puzzle-room-v1197',score:s.solved.length,total:stages.length,correct:s.solved.length,perfect:validatedPerfect,validated:Boolean(validated),xp:100+s.solved.length*20,zivoReward:validatedPerfect?10:0,eventId}}));const title=timedOut?t('puzzleTimeUpTitle'):t('puzzleVaultOpenedTitle');const seal=timedOut?'⏱':'✓';const note=(timedOut?fmt('puzzleTimeUpNote',{solved:s.solved.length,total:stages.length}):fmt('puzzleCompletedNoteFmt',{solved:s.solved.length,total:stages.length}))+(s.bestStreak>1?fmt('puzzleBestStreakNote',{streak:s.bestStreak}):'');
// V1230.92 — "Challenge a friend" (duel): scorePct feeds both the duel-result comparison (if this
// run was started from a received duel link) and the new outgoing duel share button.
const scorePct=stages.length>0?Math.round(s.solved.length/stages.length*100):0;
const duelWas=s.activeDuel;s.activeDuel=null;
let duelResultLine='';
if(duelWas){
 const oscore=Number(duelWas.score)||0;
 duelResultLine=`<p class="zpr-duel-result">${esc(scorePct>oscore?fmt('duelResultWin',{name:duelWas.name,score:scorePct,oscore}):scorePct<oscore?fmt('duelResultLose',{name:duelWas.name,score:scorePct,oscore}):fmt('duelResultTie',{name:duelWas.name}))}</p>`;
}
root().innerHTML=`<div class="zpr-finish" dir="rtl"><div class="zpr-finish-seal">${seal}</div><small>PUZZLE ROOM // COMPLETE</small><h1>${esc(title)}</h1><div class="zpr-final-score">${s.score}</div><p>${esc(note)}</p>${duelResultLine}<div class="zpr-finish-actions"><button id="zpr-share">${esc(t('shareResultCta'))}</button><button id="zpr-duel">${esc(t('duelChallengeCta'))}</button><button id="zpr-replay">${esc(t('puzzleReplayBtn'))}</button><button id="zpr-home">${esc(t('puzzleReturnHome'))}</button></div></div>`;try{A()?.playSfx?.(timedOut?'challenge_fail':'challenge_win')}catch(_){}root().querySelector('#zpr-replay').onclick=start;root().querySelector('#zpr-home').onclick=back;root().querySelector('#zpr-share').onclick=()=>{window.ZIVOZONE?.Share?.share?.({gameId:'rooms/puzzle-room',score:scorePct,challengeName:t('sharePuzzleRoomName')})};root().querySelector('#zpr-duel').onclick=()=>{window.ZIVOZONE?.Share?.duel?.({gameId:'rooms/puzzle-room',score:scorePct,challengerName:window.ZIVOZONE?.Player?.get?.()?.name,challengeName:t('sharePuzzleRoomName')})}}
function startInner(){s.i=0;s.score=0;s.solved=[];s.attempts=0;s.data={};s.streak=0;s.bestStreak=0;s.finished=false;root().classList.add('active');document.body.classList.add('zivo-puzzle-active');try{A()?.unlock?.();A()?.transitionAmbient?.('logic')}catch(_){}maybeShowDuelIntro(()=>{startClock();intro()})}
// V1230.92 — "Challenge a friend" (duel): same pattern as challenges.js's maybeShowDuelIntro — a
// visitor who opened a duel link (?challenger=&cscore=, minted by Share.duel()) sees who they're up
// against before the 10-minute clock starts, instead of it silently ticking during the banner.
// consumeDuelParams() strips the two query params immediately so a replay on this page load doesn't
// show the banner again. s.activeDuel is read again in finish() to render the win/lose/tie line.
function maybeShowDuelIntro(next){
 const duel=window.ZIVOZONE?.Share?.consumeDuelParams?.();
 if(!duel){s.activeDuel=null;next();return}
 s.activeDuel=duel;
 root().innerHTML=`<div class="zpr-duel-intro" dir="rtl"><div class="zpr-duel-badge">⚔️</div><h2>${esc(fmt('duelInviteBannerTitle',{name:duel.name}))}</h2><p>${esc(fmt('duelInviteBannerBody',{name:duel.name,score:duel.score,challenge:t('puzzleRoomTitle')}))}</p><button type="button" class="zpr-duel-start">${esc(t('duelInviteStartCta'))}</button></div>`;
 root().querySelector('.zpr-duel-start').onclick=()=>next();
}
/* V1230.25 — Phase 2 play-gate: browsing/previewing the room stays free; this is the entry point every
   caller (the homepage card, the replay button, direct API use) goes through to actually start playing. */
function start(){return window.ZIVOZONE_REQUIRE_PLAY?window.ZIVOZONE_REQUIRE_PLAY(startInner):startInner()}
window.ZIVOZONE=window.ZIVOZONE||{};window.ZIVOZONE.PuzzleRoom=Object.freeze({version:'1230.62',start});window.ZIVOZONE_START_PUZZLE_ROOM=start;
document.addEventListener('click',e=>{if(e.target.closest('[data-puzzle-room]')){e.preventDefault();start()}});
})();