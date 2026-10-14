/* ZIVOZONE V1196 — Beauty Room
   Original editorial wellness/beauty experience. No medical diagnosis or product endorsement.
*/
(()=>{'use strict';
const esc=window.ZIVOZONE_ESC;
const A=()=>window.ZIVOZONE_AUDIO;
const t=k=>{try{return window.zivoT?window.zivoT(k):(window.ZIVOZONE_I18N?.tr?.(k)||k)}catch(_){return k}};
// V1230.32 — bilingual {ar,en,...} dict lookup by the visitor's current language, same pattern as
// horror-room.js's L(); the epic CTA/header used to always show EPIC_NAME_BR.ar regardless of language.
const L=dict=>{try{return dict[window.ZIVOZONE_I18N?.get?.()||'ar']||dict.en||dict.ar}catch(_){return dict.ar}};
const fmt=(k,vars)=>Object.entries(vars||{}).reduce((s,[key,val])=>s.replace(`{${key}}`,val),t(k));
const PROGRESS_KEY='zivo_beauty_progress';
function progress(){try{return JSON.parse(localStorage.getItem(PROGRESS_KEY)||'{}')}catch(_){return{}}}
function markDone(key){try{const p=progress();p[key]=1;localStorage.setItem(PROGRESS_KEY,JSON.stringify(p))}catch(_){}}
function parseSteps(desc){
 // V1230.49 — truncate the last step at its sentence-ending punctuation so the trailing commentary
 // sentence doesn't get included as part of the step name. Must cover every language's own
 // sentence-final mark, not just the ASCII period: Chinese uses "。" and Hindi uses "।", not ".".
 return String(desc).split('→').map((p,i,arr)=>{const s=p.trim();return i===arr.length-1?(s.match(/^[^.。।]+/)?.[0]||s).trim():s});
}
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
// V1230.49 — content resolved live through t() each call (not frozen at module load), so a
// language switch shows genuinely translated card text, and the mini-game's parseSteps() keeps
// splitting the CURRENT language's routine text, not a stale Arabic copy.
function data(){return{
 skin:[
  [t('beautySkinTitle1'),t('beautySkinDesc1')],
  [t('beautySkinTitle2'),t('beautySkinDesc2')],
  [t('beautySkinTitle3'),t('beautySkinDesc3')],
  [t('beautySkinTitle4'),t('beautySkinDesc4')],
  [t('beautySkinTitle5'),t('beautySkinDesc5')]
 ],
 body:[
  [t('beautyBodyTitle1'),t('beautyBodyDesc1')],
  [t('beautyBodyTitle2'),t('beautyBodyDesc2')],
  [t('beautyBodyTitle3'),t('beautyBodyDesc3')],
  [t('beautyBodyTitle4'),t('beautyBodyDesc4')]
 ],
 recipes:[
  [t('beautyRecipeTitle1'),t('beautyRecipeDesc1')],
  [t('beautyRecipeTitle2'),t('beautyRecipeDesc2')],
  [t('beautyRecipeTitle3'),t('beautyRecipeDesc3')]
 ],
 habits:[
  [t('beautyHabitTitle1'),t('beautyHabitDesc1')],
  [t('beautyHabitTitle2'),t('beautyHabitDesc2')],
  [t('beautyHabitTitle3'),t('beautyHabitDesc3')],
  [t('beautyHabitTitle4'),t('beautyHabitDesc4')]
 ]
};}
function root(){let r=document.getElementById('zivo-beauty-room');if(!r){r=document.createElement('div');r.id='zivo-beauty-room';r.className='zbr-root';document.body.appendChild(r)}return r}
function card([t,d],icon='✦'){return `<article class="zbr-card"><span>${icon}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></article>`}
function render(tab='skin'){
 const r=root(); const titles={skin:t('beautyTabSkin'),body:t('beautyTabBody'),recipes:t('beautyTabRecipes'),habits:t('beautyTabHabits')};
 const content=data();
 r.innerHTML=`<div class="zbr-shell" dir="rtl">
 <header class="zbr-head"><div><span class="zbr-kicker">ZIVOZONE // BEAUTY ROOM</span><h1>${esc(t('beautyRoomTitle'))}</h1><p>${esc(t('beautyRoomSubtitle'))}</p></div>
 <button class="zbr-return" data-beauty-return>${esc(t('puzzleReturnHome'))}</button></header>
 <section class="zbr-hero"><div><span class="zbr-label">BEAUTY • CARE • CONFIDENCE</span><h2>${esc(t('beautyHeroTitle'))}</h2><p>${esc(t('beautyHeroText'))}</p><button type="button" class="zbg-cta${progress().beauty_game?' done':''}" data-beauty-game>${progress().beauty_game?esc(t('beautyGameDone')):esc(t('beautyGameCta'))}</button> <button type="button" class="zivo-epic-cta" data-beauty-epic>✦ ${esc(L(EPIC_NAME_BR))} — ${esc(t('epic50Tag'))}</button></div><div class="zbr-orbit"><b>✦</b><i>CARE</i><i>GLOW</i><i>SELF</i></div></section>
 <nav class="zbr-tabs">${Object.entries(titles).map(([k,v])=>`<button class="${k===tab?'active':''}" data-beauty-tab="${k}">${esc(v)}</button>`).join('')}</nav>
 <section class="zbr-content"><div class="zbr-section-title"><span>01</span><div><small>${esc(t('beautyChooseLabel'))}</small><h2>${esc(titles[tab])}</h2></div></div><div class="zbr-grid">${content[tab].map(x=>card(x,tab==='recipes'?'♡':tab==='body'?'◌':'✦')).join('')}</div></section>
 <section class="zbr-brand"><div><span class="zbr-label">FEATURED ACCESSORIES</span><h2>PANDORA</h2><p>${esc(t('beautyBrandNote'))}</p><div class="zbr-jewels"><b>✧</b><b>◇</b><b>✦</b><b>○</b></div></div><div class="zbr-brand-note"><strong>${esc(t('beautyBrandLookTitle'))}</strong><span>${esc(t('beautyBrandLookText'))}</span></div></section>
 <section class="zbr-note"><strong>${esc(t('beautyNoteTitle'))}</strong><span>${esc(t('beautyNoteText'))}</span></section>
 </div>`;
 r.classList.add('active');
 function close(){r.classList.remove('active');document.body.classList.remove('zivo-beauty-active');try{A()?.stopAmbient?.()}catch(_){}location.hash='#home';window.scrollTo?.({top:0,behavior:'instant'})}
 r.querySelector('[data-beauty-return]').onclick=()=>window.ZIVOZONE?.ExitGuard?.open?.(()=>close(),t('beautyExitConfirm'));
 r.querySelectorAll('[data-beauty-tab]').forEach(b=>b.onclick=()=>{try{A()?.playSfx?.('click_light')}catch(_){}render(b.dataset.beautyTab)});
 r.querySelector('[data-beauty-game]').onclick=()=>renderGame();
 r.querySelector('[data-beauty-epic]').onclick=()=>gatedEpicStartBR();
 document.body.classList.add('zivo-beauty-active');
 try{A()?.unlock?.();A()?.transitionAmbient?.('daily')}catch(_){}
}

// ---- beauty mini-game: order-your-routine (real interactive game, not a quiz) --------
async function grantBeautyReward(){
 const ok=await window.ZIVOZONE?.Economy?.credit?.(5,{type:'beauty_reward',source:'beauty',beauty:'order_routine',claimId:'beauty_game_clear'}); // V1230.84 — unified reward (was 2)
 if(!ok)return;
 await window.ZIVOZONE?.Economy?.addXP?.(20);
 window.dispatchEvent(new CustomEvent('zivozone-reward',{detail:{xp:20,zivo:2,source:'beauty',beauty:'order_routine'}}));
}
function gameShell(body){
 return `<div class="zbr-shell zbg-shell" dir="rtl">
 <header class="zbr-head"><div><span class="zbr-kicker">ZIVOZONE // BEAUTY ROOM</span><h1>${esc(t('beautyGameTitle'))}</h1></div>
 <button class="zbr-return" data-beauty-game-exit>${esc(t('beautyGameBack'))}</button></header>
 <section class="zbg-wrap">${body}</section></div>`;
}
function renderGame(){
 const r=root();
 const content=data();
 const rounds=[
  {label:t('beautyGameRoundMorning'),steps:parseSteps(content.skin[0][1])},
  {label:t('beautyGameRoundEvening'),steps:parseSteps(content.skin[1][1])}
 ];
 let ri=0,si=0,mistakes=0,activeDuel=null;
 function exit(){render('skin')}
 // V1230.92 — "Challenge a friend" (duel): same pattern as challenges.js/puzzle-room.js's
 // maybeShowDuelIntro — a visitor who opened a duel link (?challenger=&cscore=, minted by
 // Share.duel()) sees who they're up against before the normal rules screen. consumeDuelParams()
 // strips the two query params immediately so a replay on this page load doesn't show it twice.
 // activeDuel is read again in renderResult() to render the win/lose/tie line.
 function maybeShowDuelIntro(next){
  const duel=window.ZIVOZONE?.Share?.consumeDuelParams?.();
  if(!duel){activeDuel=null;next();return}
  activeDuel=duel;
  r.innerHTML=gameShell(`<article class="zbg-card zbg-duel-intro"><div class="zbg-duel-badge">⚔️</div><h2>${esc(fmt('duelInviteBannerTitle',{name:duel.name}))}</h2><p>${esc(fmt('duelInviteBannerBody',{name:duel.name,score:duel.score,challenge:t('beautyGameTitle')}))}</p><button type="button" class="zbg-duel-start">${esc(t('duelInviteStartCta'))}</button></article>`);
  r.querySelector('[data-beauty-game-exit]').onclick=exit;
  r.querySelector('.zbg-duel-start').onclick=()=>next();
 }
 function renderIntro(){
  r.innerHTML=gameShell(`<article class="zbg-card"><p>${esc(t('beautyGameIntro'))}</p>
   <button type="button" class="zbg-start" id="zbg-start">${esc(t('beautyGameTitle'))}</button></article>`);
  r.querySelector('[data-beauty-game-exit]').onclick=exit;
  r.querySelector('#zbg-start').onclick=()=>{ri=0;si=0;mistakes=0;renderRound()};
 }
 function renderRound(){
  const round=rounds[ri];
  const shuffled=shuffle(round.steps);
  r.innerHTML=gameShell(`<article class="zbg-card">
    <div class="zbg-kicker">${esc(round.label)} • ${esc(fmt('beautyGameStepProgress',{current:si+1,total:round.steps.length}))}</div>
    <div class="zbg-options">${shuffled.map(s=>`<button type="button" class="zbg-opt" data-step="${esc(s)}">${esc(s)}</button>`).join('')}</div>
    <div class="zbg-feedback" id="zbg-feedback" hidden></div>
  </article>`);
  r.querySelector('[data-beauty-game-exit]').onclick=exit;
  r.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{
   const fb=r.querySelector('#zbg-feedback');
   if(b.dataset.step===round.steps[si]){
    b.disabled=true;b.classList.add('right');
    fb.hidden=false;fb.textContent=t('beautyGameCorrect');fb.className='zbg-feedback show right';
    try{A()?.playSfx?.('correct')}catch(_){}
    // V1230.62 — quality pass, same gap flagged alongside Dark Room's 1230.58 pass: the right/wrong
    // button classes already existed here (better off than Puzzle Room's classic mode was), but
    // there was no whole-card "you got it" moment to go with the per-button color change.
    const card=r.querySelector('.zbg-card');if(card){card.classList.remove('zbg-pulse');void card.offsetWidth;card.classList.add('zbg-pulse')}
    si++;
    if(si>=round.steps.length){
     ri++;si=0;
     setTimeout(()=>{ri<rounds.length?renderRound():renderResult()},550);
    } else {
     setTimeout(()=>{renderRound()},450);
    }
   } else {
    mistakes++;
    b.classList.add('wrong');
    fb.hidden=false;fb.textContent=t('beautyGameWrong');fb.className='zbg-feedback show wrong';
    try{A()?.playSfx?.('wrong')}catch(_){}
    setTimeout(()=>b.classList.remove('wrong'),400);
   }
  });
 }
 function renderResult(){
  const alreadyDone=!!progress().beauty_game;
  const pass=mistakes<=1;
  // V1230.92 — "Challenge a friend" (duel): scorePct feeds both the duel-result comparison (if this
  // run was started from a received duel link) and the new outgoing duel share button; same formula
  // the existing share button already used, just hoisted so both can reuse it.
  const scorePct=Math.max(0,100-mistakes*15);
  const duelWas=activeDuel;activeDuel=null;
  let duelResultLine='';
  if(duelWas){
   const oscore=Number(duelWas.score)||0;
   duelResultLine=`<p class="zbg-duel-result">${esc(scorePct>oscore?fmt('duelResultWin',{name:duelWas.name,score:scorePct,oscore}):scorePct<oscore?fmt('duelResultLose',{name:duelWas.name,score:scorePct,oscore}):fmt('duelResultTie',{name:duelWas.name}))}</p>`;
  }
  r.innerHTML=gameShell(`<article class="zbg-card">
    <h2>${esc(fmt('beautyGameResultTitle',{mistakes}))}</h2>
    <p>${esc(pass?t('beautyGameFinishGood'):t('beautyGameFinishOk'))}</p>
    ${duelResultLine}
    ${!alreadyDone?`<p class="zbg-reward-note">${esc(t('beautyGameRewardNote'))}</p>`:''}
    ${pass&&!alreadyDone?`<button type="button" class="zbg-start" id="zbg-claim">${esc(t('beautyGameClaim'))}</button>`:''}
    <button type="button" class="zbg-again" id="zbg-again">${esc(t('beautyGamePlayAgain'))}</button>
    <button type="button" class="zbg-share" id="zbg-share">${esc(t('shareResultCta'))}</button>
    <button type="button" class="zbg-duel" id="zbg-duel">${esc(t('duelChallengeCta'))}</button>
  </article>`);
  r.querySelector('[data-beauty-game-exit]').onclick=exit;
  r.querySelector('#zbg-again').onclick=()=>{ri=0;si=0;mistakes=0;renderRound()};
  r.querySelector('#zbg-share').onclick=()=>{window.ZIVOZONE?.Share?.share?.({gameId:'rooms/beauty-room',score:scorePct,challengeName:t('shareBeautyRoomName')})};
  r.querySelector('#zbg-duel').onclick=()=>{window.ZIVOZONE?.Share?.duel?.({gameId:'rooms/beauty-room',score:scorePct,challengerName:window.ZIVOZONE?.Player?.get?.()?.name,challengeName:t('shareBeautyRoomName')})};
  try{A()?.playSfx?.(pass?'challenge_win':'challenge_fail')}catch(_){}
  const claimBtn=r.querySelector('#zbg-claim');
  if(claimBtn)claimBtn.onclick=async()=>{claimBtn.disabled=true;markDone('beauty_game');await grantBeautyReward();render('skin')};
 }
 maybeShowDuelIntro(renderIntro);
}

// ---- beauty epic challenge: "The Perfect Touch" (real 50-level/5-band game, alongside the
// order-your-routine game above, not replacing it) --------------------------------------------
const EPIC_NAME_BR={ar:'لمسة الكمال',en:'The Perfect Touch',zh:'完美触感',hi:'परफेक्ट टच',es:'El Toque Perfecto',fr:'La Touche Parfaite',fa:'لمس کامل'};
const EPIC_BANDS_BR=[
 {names:{ar:'التناسق',en:'Matching',zh:'匹配',hi:'मिलान',es:'Coincidencia',fr:'Correspondance',fa:'تطابق'},twist:{ar:'اختاري القطعة التي تطابق اللون الظاهر في الأعلى.',en:'Pick the swatch that matches the color shown above.',zh:'选择与上方显示颜色相匹配的色板。',hi:'ऊपर दिखाए गए रंग से मेल खाने वाला स्वैच चुनें।',es:'Elige la muestra que coincide con el color mostrado arriba.',fr:'Choisissez la nuance qui correspond à la couleur affichée ci-dessus.',fa:'نمونه‌ای را انتخاب کنید که با رنگ نشان‌داده‌شده در بالا مطابقت دارد.'}},
 {names:{ar:'التناغم',en:'Harmony',zh:'和谐',hi:'सामंजस्य',es:'Armonía',fr:'Harmonie',fa:'هماهنگی'},twist:{ar:'من الآن، اختاري القطعة التي "تنسّق" مع اللون الظاهر، لا القطعة المطابقة له.',en:'From now, pick the swatch that harmonizes with the shown color, not the identical one.',zh:'从现在起，选择与显示颜色相协调的色板，而不是相同的那个。',hi:'अब से, दिखाए गए रंग से मेल खाने वाला नहीं, बल्कि उससे सामंजस्य रखने वाला स्वैच चुनें।',es:'Desde ahora, elige la muestra que armoniza con el color mostrado, no la idéntica.',fr:'Désormais, choisissez la nuance qui s\'harmonise avec la couleur affichée, pas celle qui est identique.',fa:'از این پس، نمونه‌ای را انتخاب کنید که با رنگ نشان‌داده‌شده هماهنگ باشد، نه نمونه یکسان.'}},
 {names:{ar:'إعادة التنسيق',en:'Reshuffle',zh:'重新排列',hi:'फिर से फेरबदल',es:'Reorganización',fr:'Remaniement',fa:'بازچینی'},twist:{ar:'تُعاد ترتيب القطع بعد كل اختيار صحيح. لا تحفظي المكان؛ احفظي اللون.',en:'Tiles reshuffle after every correct pick. Memorize the color, not the position.',zh:'每次正确选择后，色块都会重新排列。记住颜色，而不是位置。',hi:'हर सही चयन के बाद टाइलें फिर से फेरबदल हो जाती हैं। रंग याद रखें, स्थान नहीं।',es:'Las fichas se reorganizan después de cada elección correcta. Memoriza el color, no la posición.',fr:'Les tuiles se mélangent après chaque bon choix. Mémorisez la couleur, pas la position.',fa:'پس از هر انتخاب درست، کاشی‌ها دوباره به‌هم می‌ریزند. رنگ را به خاطر بسپارید، نه موقعیت را.'}},
 {names:{ar:'المرآة',en:'The Mirror',zh:'镜子',hi:'दर्पण',es:'El Espejo',fr:'Le Miroir',fa:'آینه'},twist:{ar:'الصفّ انعكس بالكامل. ما تراه على اليمين هو يسارك الآن.',en:'The row is fully mirrored. What you see on the right is now your left.',zh:'整排已完全镜像。你在右边看到的现在是你的左边。',hi:'पंक्ति पूरी तरह से उलट गई है। जो आप दाईं ओर देख रहे हैं वह अब आपका बायाँ है।',es:'La fila está completamente invertida. Lo que ves a la derecha es ahora tu izquierda.',fr:'La rangée est entièrement inversée. Ce que vous voyez à droite est maintenant votre gauche.',fa:'ردیف کاملاً آینه‌ای شده است. آنچه در سمت راست می‌بینید اکنون سمت چپ شماست.'}},
 {names:{ar:'الإطلالة الأخيرة',en:'The Final Look',zh:'最终造型',hi:'आख़िरी लुक',es:'El Look Final',fr:'Le Look Final',fa:'ظاهر نهایی'},twist:{ar:'كل القواعد السابقة معًا، بأسرع إيقاع. إطلالة تصنع الأسلوبيات الكبرى.',en:'Every previous rule together, at the fastest pace. The look that makes master stylists.',zh:'之前所有规则一起，以最快的速度。这是造就大师级造型师的造型。',hi:'पहले के सभी नियम एक साथ, सबसे तेज़ गति से। यह वह लुक है जो मास्टर स्टाइलिस्ट बनाता है।',es:'Todas las reglas anteriores juntas, al ritmo más rápido. El look que forja a los mejores estilistas.',fr:'Toutes les règles précédentes réunies, au rythme le plus rapide. Le look qui fait les plus grands stylistes.',fa:'همه قوانین قبلی با هم، با سریع‌ترین سرعت. ظاهری که استایلیست‌های بزرگ را می‌سازد.'}}
];
function playStyle(band,bandLv,api){
 const {lerp,rint,addTimer,clear,ctx,point,addListener,winLevel,loseLevel,canvas,W,countdown}=api;
 const colors=['#ff6b6b','#ffb86b','#ffe066','#8ce99a','#5de0b0','#5aa7ff','#9775fa','#f783ac'];
 const n=colors.length,cols=4,rows=2;
 const pairOf=i=>i%2===0?i+1:i-1;
 const pairMode=band>=2,reshuffleMode=band>=3,mirrorMode=band>=4;
 const chainLen=Math.round(lerp(bandLv,2,5))+(band>=5?1:0);
 const cellW=(W-80)/cols,cellH=150;
 let slots=[...Array(n).keys()];
 const shuffle=()=>{for(let i=slots.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[slots[i],slots[j]]=[slots[j],slots[i]]}};
 shuffle();
 const colX=c=>mirrorMode?(cols-1-c):c;
 let target=rint(0,n-1),hits=0;
 const slotPos=slot=>({x:40+colX(slot%cols)*cellW+cellW/2,y:210+Math.floor(slot/cols)*cellH+cellH/2});
 // V1230.62 — quality pass, same gap flagged alongside Dark Room's 1230.58 pass: flat fillRect swatches
 // with no glow or tap feedback. The target swatch now carries a soft glow of its own color (so it
 // reads as "the thing to find," not just a flat chip), and a correct tap pulses a white outline on
 // the hit swatch before the next target lights, instead of jumping straight to the next color.
 const draw=()=>{
  clear();
  ctx.beginPath();if(ctx.roundRect)ctx.roundRect(W/2-55,40,110,70,14);else ctx.rect(W/2-55,40,110,70);
  ctx.save();ctx.shadowColor=colors[target];ctx.shadowBlur=22;ctx.fillStyle=colors[target];ctx.fill();ctx.restore();
  ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();
  slots.forEach((colorIdx,slot)=>{
   const p=slotPos(slot);
   ctx.beginPath();if(ctx.roundRect)ctx.roundRect(p.x-cellW/2+10,p.y-55,cellW-20,110,14);else ctx.rect(p.x-cellW/2+10,p.y-55,cellW-20,110);
   ctx.fillStyle=colors[colorIdx];ctx.fill();
  });
 };
 draw();
 const pulseSlot=slot=>{
  const sp=slotPos(slot);
  ctx.save();ctx.shadowColor='#fff';ctx.shadowBlur=30;ctx.strokeStyle='#fff';ctx.lineWidth=5;
  ctx.beginPath();if(ctx.roundRect)ctx.roundRect(sp.x-cellW/2+10,sp.y-55,cellW-20,110,14);else ctx.rect(sp.x-cellW/2+10,sp.y-55,cellW-20,110);
  ctx.stroke();ctx.restore();
 };
 const onClick=e=>{
  const p=point(e);
  const slot=slots.findIndex((_,i)=>{const sp=slotPos(i);return Math.abs(p.x-sp.x)<cellW/2-5&&Math.abs(p.y-sp.y)<58});
  if(slot<0)return;
  const correctColor=pairMode?pairOf(target):target;
  if(slots[slot]===correctColor){
   hits++;
   pulseSlot(slot);
   if(hits>=chainLen){addTimer(()=>winLevel(),120);return}
   addTimer(()=>{if(reshuffleMode)shuffle();target=rint(0,n-1);draw()},140);
  } else loseLevel();
 };
 addListener(canvas,'click',onClick);
 countdown(lerp(bandLv,22,10)+chainLen,()=>loseLevel());
}
function grantBeautyEpicReward(){
 window.ZIVOZONE?.Economy?.credit?.(5,{type:'beauty_epic_reward',source:'beauty',beauty:'epic50',claimId:'beauty_epic50_clear'}).then(ok=>{if(ok)window.ZIVOZONE?.Economy?.addXP?.(60)});
}
function openEpicBeauty(){
 const r=root();
 // V1230.63 — was mounted inside .zbg-wrap, a 720px reading-width column sized for the
 // order-your-routine mini-game's option buttons, not a full-screen game stage. .zbr-epic-wrap drops
 // that cap for the epic game specifically; .zbg-wrap itself is untouched, the mini-game still wants it.
 r.innerHTML=`<div class="zbr-shell zbg-shell" dir="rtl"><header class="zbr-head"><div><span class="zbr-kicker">ZIVOZONE // BEAUTY ROOM</span><h1>${esc(L(EPIC_NAME_BR))}</h1></div><button class="zbr-return" id="zbg-epic-exit">${esc(t('epic50Back'))}</button></header><section class="zbr-epic-wrap"><div id="zbg-epic-mount"></div></section></div>`;
 r.classList.add('active');document.body.classList.add('zivo-beauty-active');
 r.querySelector('#zbg-epic-exit').onclick=()=>render('skin');
 try{A()?.unlock?.();A()?.transitionAmbient?.('daily')}catch(_){}
 window.ZIVOZONE_EPIC50?.mount(r.querySelector('#zbg-epic-mount'),{
  id:'beauty_epic',icon:'✦',names:EPIC_NAME_BR,bands:EPIC_BANDS_BR,
  archFn:playStyle,
  onExit:()=>render('skin'),
  onFinish:won=>{if(won)grantBeautyEpicReward()},
  // V1230.92 — "Challenge a friend" (duel): see horror-room.js's matching comment at its own
  // ZIVOZONE_EPIC50?.mount() call for why this is needed.
  shareGameId:'rooms/beauty-room',shareName:L(EPIC_NAME_BR)
 });
}
function gatedEpicStartBR(){return window.ZIVOZONE_REQUIRE_PLAY?window.ZIVOZONE_REQUIRE_PLAY(openEpicBeauty):openEpicBeauty()}

window.ZIVOZONE=window.ZIVOZONE||{};
window.ZIVOZONE.BeautyRoom=Object.freeze({version:'1230.62',start:()=>render('skin'),startGame:()=>{render('skin');renderGame()},startEpic:()=>gatedEpicStartBR()});
document.addEventListener('click',e=>{if(e.target.closest('[data-beauty-room]')){e.preventDefault();render('skin')}});
})();