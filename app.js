/* ============================================================
   ZIVOZONE APP ENGINE V8
   - Firebase preserved
   - Guest play preserved
   - Unique challenge sessions
   - Mixed question types
   - Continuous challenge-only audio
   - Dark Room infinite psychological mode
============================================================ */
(() => {
  'use strict';
  const A=window.ZIVOZONE_AUTH,C=window.ZIVOZONE_CHALLENGES,I=window.ZIVOZONE_I18N;
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const LS='zivozone_state_v8';
  const API=window.ZIVOZONE_API||{};
  let state={level:1,xp:0,coins:0,wins:0,gamesPlayed:0,bestStreak:0,identity:null};
  const QUESTION_TIME=30;
  let questionTimer=null;
  let questionDeadline=0;
  let lastTickSecond=null;
  let identityTimer=null;
  let identityDeadline=0;
  let game={id:null,questions:[],index:0,score:0,pressureScore:0,streak:0,bestStreak:0,answers:[],guest:true,locked:false,horrorSignupShown:false,horrorUsed:[],timedOut:0,questionStartedAt:0};
  const t=k=>I.tr(k),lang=()=>I.get(),S=()=>window.ZIVOZONE_AUDIO||{},O=(ar,en)=>({ar,en,zh:en,hi:en,es:en});
  const esc=s=>{const d=document.createElement('div');d.textContent=String(s??'');return d.innerHTML};
  const loc=o=>typeof o==='string'?o:(o?.[lang()]||o?.en||o?.ar||'');
  const toast=(msg,type='info')=>{const box=$('#toast-container');if(!box)return;const x=document.createElement('div');x.className='toast '+type;x.textContent=msg;box.appendChild(x);setTimeout(()=>x.remove(),3200)};
  const loadState=()=>{try{state={...state,...JSON.parse(localStorage.getItem(LS)||'{}')}}catch(e){}};
  const saveState=()=>{state.level=Math.floor((Number(state.xp)||0)/100)+1;try{localStorage.setItem(LS,JSON.stringify(state))}catch(e){}};
  function syncFromPlayer(){const p=A.getPlayer();if(!p)return;state={...state,xp:Number(p.xp)||0,coins:Number(p.coins)||0,wins:Number(p.wins)||0,gamesPlayed:Number(p.gamesPlayed)||0,level:Number(p.level)||1,bestStreak:Number(p.bestStreak)||Number(state.bestStreak)||0};saveState()}
  function profile(){const p=A.getPlayer(),l=state.level||1,base=(l-1)*100,prog=Math.max(0,Math.min(100,state.xp-base));$('#profile-name').textContent=p?.name||t('guest');$('#profile-email').textContent=p?.email||t('guestText');$('#profile-level').textContent=l;$('#profile-xp').textContent=state.xp;$('#profile-coins').textContent=state.coins;$('#profile-wins').textContent=state.wins;$('#profile-best-streak').textContent=state.bestStreak||0;$('#player-level-chip').textContent=`${t('level')} ${l}`;$('#xp-progress').style.width=prog+'%';$('#logout-btn').hidden=!A.isLoggedIn();$('#login-btn').textContent=A.isLoggedIn()?`👤 ${p?.name||t('profile')}`:t('login')}
  async function reward(xp,coins=1,win=true){state.xp+=xp;state.coins+=coins;if(win)state.wins++;state.gamesPlayed++;saveState();if(A.isLoggedIn())await A.update({xp:state.xp,coins:state.coins,wins:state.wins,gamesPlayed:state.gamesPlayed,level:state.level});profile()}
  function closeModal(){clearQuestionTimer();clearIdentityTimer();const r=$('#modal-root');r.setAttribute('aria-hidden','true');r.innerHTML=''}
  function clearQuestionTimer(){
    if(questionTimer){clearInterval(questionTimer);questionTimer=null}
    questionDeadline=0;
    lastTickSecond=null;
  }
  function clearIdentityTimer(){
    if(identityTimer){clearInterval(identityTimer);identityTimer=null}
    identityDeadline=0;
  }
  function updateTimerUI(seconds){
    const n=Math.max(0,Math.ceil(seconds));
    const bar=$('#question-timer-fill'),num=$('#question-timer-number'),box=$('#question-timer');
    if(bar)bar.style.width=Math.max(0,Math.min(100,(seconds/QUESTION_TIME)*100))+'%';
    if(num)num.textContent=n;
    if(box)box.classList.toggle('urgent',n<=3);
  }
  function startQuestionTimer(){
    clearQuestionTimer();
    game.questionStartedAt=Date.now();
    questionDeadline=game.questionStartedAt+QUESTION_TIME*1000;
    updateTimerUI(QUESTION_TIME);
    questionTimer=setInterval(()=>{
      const left=(questionDeadline-Date.now())/1000;
      updateTimerUI(left);
      const n=Math.max(0,Math.ceil(left));
      if(n<=3 && n!==lastTickSecond){lastTickSecond=n;S().tick?.()}
      if(left<=0){clearQuestionTimer();timeoutQuestion()}
    },120);
  }
  function remainingSeconds(){
    if(!questionDeadline)return 0;
    return Math.max(0,Math.min(QUESTION_TIME,(questionDeadline-Date.now())/1000));
  }
  function speedBonus(ok,seconds){
    if(!ok)return 0;
    const speed=Math.round(Math.max(0,Math.min(QUESTION_TIME,seconds))*5);
    const streakBonus=Math.max(0,(game.streak-1))*5;
    return 50+speed+streakBonus;
  }
  function registerPressure(ok,seconds,timeout=false){
    if(ok){
      game.streak+=1;
      game.bestStreak=Math.max(game.bestStreak,game.streak);
      game.pressureScore+=(speedBonus(true,seconds));
    }else{
      game.streak=0;
    }
    if(timeout)game.timedOut=(game.timedOut||0)+1;
  }
  function timeoutQuestion(){
    if(game.locked)return;
    game.locked=true;
    const q=currentQ();
    if(!q)return;
    game.answers.push({id:q.id,value:null,ok:false,timeout:true,seconds:0,pressure:0});
    registerPressure(false,0,true);
    S().timeout?.();
    const buttons=$$('.answer');
    buttons.forEach(b=>b.disabled=true);
    const input=$('#answer-input');
    if(input)input.disabled=true;
    const form=$('#answer-form');
    if(form)form.classList.add('input-timeout');
    nextQuestion(420);
  }
  function startIdentityTimer(){
    clearIdentityTimer();
    identityDeadline=Date.now()+QUESTION_TIME*1000;
    const paint=()=>{
      const left=(identityDeadline-Date.now())/1000;
      const bar=$('#identity-timer-fill'),num=$('#identity-timer-number'),box=$('#identity-timer');
      if(bar)bar.style.width=Math.max(0,Math.min(100,(left/QUESTION_TIME)*100))+'%';
      if(num)num.textContent=Math.max(0,Math.ceil(left));
      if(box)box.classList.toggle('urgent',Math.ceil(left)<=3);
      if(left<=3)S().tick?.();
      if(left<=0){clearIdentityTimer();identityTimeout()}
    };
    paint();
    identityTimer=setInterval(paint,250);
  }
  function identityTimeout(){
    const buttons=$$('.id-choice');
    buttons.forEach(b=>b.disabled=true);
    S().timeout?.();
    // A timeout records no trait preference and moves to the next item.
    window.__zivoIdentityTimeout=true;
    setTimeout(()=>buttons[0]?.click(),180);
  }
  function returnToChallenges(){S().stopChallenge?.();if('speechSynthesis' in window)try{speechSynthesis.cancel()}catch(e){}document.body.classList.remove('horror-active');closeModal();location.hash='#challenges';$('#challenges')?.scrollIntoView({behavior:'smooth'})}
  function openModal(html,cls=''){const r=$('#modal-root');r.innerHTML=`<div class="modal-backdrop"><div class="modal-card ${cls}" role="dialog" aria-modal="true">${html}</div></div>`;r.setAttribute('aria-hidden','false');r.querySelectorAll('[data-close]').forEach(b=>b.onclick=closeModal);const bg=r.querySelector('.modal-backdrop');if(bg)bg.onclick=e=>{if(e.target===bg)closeModal()}}
  function authModal(after){let mode='register';const render=()=>{openModal(`<button class="modal-close" data-close>×</button><span class="eyebrow">${t('account')}</span><h2>${mode==='register'?t('register'):t('welcomeBack')}</h2><p class="muted">${mode==='register'?t('registerHint'):t('loginHint')}</p><div class="auth-tabs"><button id="tab-register" class="btn ${mode==='register'?'btn-primary':''}">${t('register')}</button><button id="tab-login" class="btn ${mode==='login'?'btn-primary':''}">${t('signIn')}</button></div><form id="auth-form">${mode==='register'?`<div><label>${t('playerName')}</label><input id="auth-name" minlength="2" required placeholder="${esc(t('yourName'))}"></div><div><label>${t('age')}</label><input id="auth-age" type="number" min="5" max="100" required value="18"></div>`:''}<div><label>${t('email')}</label><input id="auth-email" type="email" required placeholder="${esc(t('emailPlaceholder'))}"></div><div><label>${t('password')}</label><input id="auth-pass" type="password" minlength="6" required placeholder="${esc(t('passwordPlaceholder'))}"></div><button class="btn btn-primary full" type="submit">${mode==='register'?t('createAccount'):t('signIn')}</button></form></div>`);$('#tab-register').onclick=()=>{mode='register';render()};$('#tab-login').onclick=()=>{mode='login';render()};$('#auth-form').onsubmit=async e=>{e.preventDefault();try{if(mode==='register')await A.register({name:$('#auth-name').value,age:$('#auth-age').value,email:$('#auth-email').value,password:$('#auth-pass').value});else await A.login($('#auth-email').value,$('#auth-pass').value);await A.setLanguage(lang());closeModal();syncFromPlayer();profile();toast(t('success'),'success');if(after)after()}catch(err){toast(err.message||t('firebaseError'),'error')}}};render()}
  function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function prepareQuestions(id){const src=C.get(id);if(!src)return[];const pool=src.questions||[];const key=`zivo_seen_${id}_v8`;let seen=[];try{seen=JSON.parse(localStorage.getItem(key)||'[]')}catch(e){}let fresh=pool.filter(q=>!seen.includes(q.id));if(fresh.length<10){seen=[];fresh=pool.slice()}const byD=d=>fresh.filter(q=>q.d===d);let chosen=[];for(let d=1;d<=10;d++){const same=byD(d);if(same.length)chosen.push(same[Math.floor(Math.random()*same.length)])}if(chosen.length<10){chosen=[...shuffle(fresh).slice(0,10)];chosen.sort((a,b)=>a.d-b.d)}try{localStorage.setItem(key,JSON.stringify([...seen,...chosen.map(q=>q.id)].slice(-Math.max(30,pool.length))))}catch(e){}return chosen}
  function guestGate(id){openModal(`<button class="modal-close" data-close>×</button><span class="eyebrow">${t('guestMode')}</span><h2>${t('guest')}</h2><p>${t('guestText')}</p><div class="modal-actions"><button class="btn btn-primary" id="continue-guest">${t('continueGuest')}</button><button class="btn btn-ghost" id="create-now">${t('createNow')}</button></div>`);$('#continue-guest').onclick=()=>{closeModal();beginGame(id,true)};$('#create-now').onclick=()=>authModal(()=>beginGame(id,false))}
  function startGame(id){const src=C.get(id);if(!src){toast(t('noData'),'error');return}if(id==='horror'){openModal(`<div class="horror-warning-card"><span class="eyebrow">${t('horrorWarningTitle')}</span><h2>${t('horrorWarningHeadline')}</h2><p>${t('horrorWarningText')}</p><p class="horror-warning">${t('horrorWarningNight')}</p><div class="modal-actions"><button class="btn btn-primary" id="enter-horror">${t('horrorEnter')}</button><button class="btn btn-ghost" data-close>${t('close')}</button></div></div>`,'horror-modal phase-1');$('#enter-horror').onclick=()=>{closeModal();beginGame('horror',!A.isLoggedIn())};return}beginGame(id,!A.isLoggedIn())}
  function beginGame(id,guest){const src=C.get(id),horror=id==='horror';game={id,questions:horror?shuffle(src.questions.map(q=>({...q}))):prepareQuestions(id),index:0,score:0,pressureScore:0,streak:0,bestStreak:0,answers:[],guest,locked:false,horrorSignupShown:false,horrorUsed:[],timedOut:0,questionStartedAt:0};if(horror)game.horrorUsed=game.questions.map(q=>q.id);document.body.classList.toggle('horror-active',horror);S().unlock?.();S().startChallenge?.(id);renderQuestion()}
  function currentQ(){return game.questions[game.index]}
  function inputMarkup(q){const isNum=q.type==='number';return `<form id="answer-form" class="input-answer-form"><input id="answer-input" ${isNum?'inputmode="numeric" pattern="[0-9.\\-]+"':''} autocomplete="off" placeholder="${esc(isNum?t('enterNumber'):t('writeAnswer'))}" required><button class="btn btn-primary" type="submit">${t('submitAnswer')}</button></form>`}
  function choiceMarkup(q){const labels=['A','B','C','D'];return `<div class="answers">${q.a.map((x,i)=>`<button class="btn btn-ghost answer" data-i="${i}"><span>${labels[i]}</span>${esc(loc(x))}</button>`).join('')}</div>`}
  function renderQuestion(){const src=C.get(game.id);if(game.id==='horror'&&game.index>=game.questions.length){game.horrorUsed=[];game.questions=shuffle(src.questions.map(q=>({...q})));}const q=currentQ();if(!q){finishGame();return}S().question?.(q.d,game.id);if(game.id==='horror'){horrorNarrate();if(game.index===10)S().phase?.(2);if(game.index===20)S().phase?.(3);if(game.index>0&&game.index%5===0)S().horrorPulse?.(Math.min(4,1+Math.floor(game.index/5)));if(game.index===6)S().warden?.()}const phase=game.id==='horror'?` phase-${game.index<10?1:game.index<20?2:3}`:'';const progress=game.id==='horror'?((game.index%10)/10)*100:Math.round(game.index/game.questions.length*100);const body=q.type==='choice'?choiceMarkup(q):inputMarkup(q);const forensicImage=q.image?`<figure class="forensic-evidence"><img src="${esc(q.image)}" alt="Forensic evidence" loading="lazy"><figcaption>دليل مسرح الجريمة — حلّل التفاصيل قبل الإجابة</figcaption></figure>`:'';const warden=game.id==='horror'&&game.index>=6?`<div class="warden">${t('warden')}</div>`:'';const footer=game.id==='horror'?`<span class="horror-status">${t('horrorQuestion')} ${game.index+1}</span>`:`<span>${game.score} ${t('correct')}</span><span class="pressure-hud">⚡ ${t('pressure')}: <b>${game.pressureScore}</b> · 🔥 ${t('streak')}: <b>${game.streak}</b></span>`;const horrorPlayer=game.id==='horror'?`<div class="horror-audio-player"><button type="button" id="horror-audio-toggle" class="btn btn-small btn-ghost">🔊 ${t('horrorAudio')}</button><input id="horror-volume" type="range" min="0" max="1" step="0.01" value="${S().volume?.()||.9}" aria-label="${t('horrorVolume')}"></div>`:'';openModal(`<button class="modal-close" data-action="quit-game" aria-label="Close">×</button><div class="game-head"><span class="eyebrow">${esc(loc(src.title))}</span><strong>${game.id==='horror'?game.index+1:`${game.index+1} / ${game.questions.length}`}</strong></div><div id="question-timer" class="question-timer" role="timer" aria-live="polite"><span class="timer-label">${esc(t('timeLeft'))}</span><strong id="question-timer-number">10</strong><div class="question-timer-track"><span id="question-timer-fill"></span></div></div><div class="question-progress"><span style="width:${progress}%"></span></div>${warden}${forensicImage}<h2>${esc(loc(q.q))}</h2><div class="difficulty">${t('difficulty')} ${q.d}/10</div>${body}${horrorPlayer}<div class="game-footer">${footer}<button class="btn btn-small btn-ghost" data-action="quit-game">${t('exit')}</button></div>`,game.id==='horror'?`horror-modal${phase}`:'');if(q.type==='choice')$$('.answer').forEach(b=>b.onclick=()=>{S().click?.();answerChoice(Number(b.dataset.i))});else $('#answer-form').onsubmit=e=>{e.preventDefault();S().click?.();answerInput($('#answer-input').value)};$('#modal-root [data-action="quit-game"]').onclick=quitGame;if(game.id==='horror'){$('#horror-audio-toggle')?.addEventListener('click',async()=>{await S().unlock?.();S().toggle?.();$('#horror-audio-toggle').textContent=(S().isEnabled?.()?'🔊 ':'🔇 ')+t('horrorAudio')});$('#horror-volume')?.addEventListener('input',e=>S().setVolume?.(e.target.value));}startQuestionTimer();}
  function normalize(v){return String(v??'').trim().toLowerCase().replace(/\s+/g,'')}
  function checkInput(q,value){if(q.extra?.answer==='*')return true;const answers=Array.isArray(q.extra?.answer)?q.extra.answer:[q.extra?.answer];return answers.some(a=>normalize(a)===normalize(value))}
  function nextQuestion(delay=500){clearQuestionTimer();setTimeout(()=>{game.index++;game.locked=false;if(game.id==='horror'&&game.index%10===0){S().checkpoint?.();horrorCheckpoint();return}if(game.id==='horror'&&game.index===15&&!game.horrorSignupShown){game.horrorSignupShown=true;horrorSignupGate();return}renderQuestion()},delay)}
  function answerChoice(i){if(game.locked)return;game.locked=true;const q=currentQ(),ok=i===q.c,seconds=remainingSeconds(),pressure=speedBonus(ok,seconds);game.answers.push({id:q.id,value:i,ok,seconds:+seconds.toFixed(2),pressure});registerPressure(ok,seconds);if(game.id==='horror'){S().horrorAnswer?.(q.d);nextQuestion(620);return}game.score+=ok?1:0;const bs=$$('.answer');bs.forEach((b,n)=>{b.disabled=true;if(n===q.c)b.classList.add('answer-correct');if(n===i&&!ok)b.classList.add('answer-wrong')});S()[ok?'correct':'wrong']?.();nextQuestion(700)}
  function answerInput(value){if(game.locked||!String(value).trim())return;game.locked=true;const q=currentQ(),ok=checkInput(q,value),seconds=remainingSeconds(),pressure=speedBonus(ok,seconds);game.answers.push({id:q.id,value,ok,seconds:+seconds.toFixed(2),pressure});registerPressure(ok,seconds);if(game.id==='horror'){S().horrorAnswer?.(q.d);nextQuestion(620);return}game.score+=ok?1:0;const form=$('#answer-form');form.classList.add(ok?'input-correct':'input-wrong');S()[ok?'correct':'wrong']?.();nextQuestion(700)}
  function horrorSignupGate(){S().whisper?.();openModal(`<div class="horror-checkpoint signup-horror"><span class="eyebrow">${t('horrorThreshold')}</span><h2>${t('horrorSignupTitle')}</h2><p>${t('horrorSignupText')}</p><p class="horror-warning">${t('horrorWarning')}</p><div class="modal-actions"><button class="btn btn-primary" id="horror-signup">${t('createNow')}</button><button class="btn btn-ghost" id="horror-guest">${t('continueGuest')}</button></div></div>`,'horror-modal phase-2');$('#horror-signup').onclick=()=>authModal(()=>{closeModal();game.guest=false;renderQuestion()});$('#horror-guest').onclick=()=>{closeModal();renderQuestion()}}
  const HORROR_LINES={
    ar:['اسمع جيدًا... أنا لا أبحث عن إجابتك فقط. أنا أراقب الطريقة التي تفكر بها.','أنت ما زلت هنا... معظم الناس يبدأون بالنظر خلفهم الآن.','لا تتوقف. السؤال التالي ينتظرك قبل أن يختفي السابق.','أنا لا أراقب الشاشة فقط... أنا أراقب اختياراتك.','إذا سمعت شيئًا بجانبك، لا تلتفت بسرعة. أكمل.','الوقت هنا لا يشبه الوقت خارج هذه الغرفة.','أنت وصلت إلى مكان يصبح فيه الاستمرار قرارًا.','لا تسأل من أنا. اسأل نفسك لماذا ما زلت تجيب.','لا توجد إجابة تخبرك أنك بأمان. هناك سؤال آخر فقط.','اقتربت... لكن هل اقتربت أنت مني أم أنا منك؟'],
    en:['Listen carefully. I am not only looking for your answer. I am watching how you think.','You are still here... most people start looking behind them by now.','Do not stop. The next question is waiting before the last one disappears.','I am not only watching the screen. I am watching your choices.','If you hear something beside you, do not turn too quickly. Keep answering.','Time here does not behave like time outside this room.','You have reached a place where continuing becomes a decision.','Do not ask who I am. Ask yourself why you are still answering.','There is no answer that tells you that you are safe. Only another question.','You are getting closer... but are you approaching me, or am I approaching you?']
  };
  function horrorNarrate(){
    if(game.id!=='horror')return;
    const lines=HORROR_LINES[lang()]||HORROR_LINES.en;
    const text=lines[Math.min(lines.length-1,Math.floor(game.index/2))];
    if(text)S().narrate?.(text);
  }
  function horrorCheckpoint(){openModal(`<div class="horror-checkpoint"><span class="eyebrow">${t('horrorCheckpoint')}</span><h2>${t('horrorCheckpointTitle')}</h2><p>${t('horrorCheckpointText')}</p><p class="horror-warning">${t('horrorWarning')}</p><div class="modal-actions"><button class="btn btn-primary" id="horror-continue">${t('horrorContinue')}</button><button class="btn btn-ghost" id="horror-exit">${t('horrorLeave')}</button></div></div>`,'horror-modal phase-3');$('#horror-continue').onclick=()=>{closeModal();renderQuestion()};$('#horror-exit').onclick=()=>{closeModal();quitGame()}}
  async function quitGame(){clearQuestionTimer();clearIdentityTimer();const wasHorror=game.id==='horror';const survived=game.index;S().stopChallenge?.();document.body.classList.remove('horror-active');if(wasHorror){const xp=Math.max(5,survived*7);await reward(xp,Math.max(1,Math.floor(survived/4)),survived>=10);await A.saveResult({challengeId:'horror',score:survived,total:survived,questionsSurvived:survived,endedByPlayer:true,guest:game.guest,xp,pressureScore:game.pressureScore,bestStreak:game.bestStreak,timedOut:game.timedOut,language:lang()});openModal(`<button class="modal-close" data-close>×</button><span class="eyebrow">${t('horrorExitTitle')}</span><h2>${t('horrorExitHeadline')}</h2><p>${t('horrorExitText')}</p><p><strong>${survived}</strong> ${t('horrorQuestion')}</p><div class="modal-actions"><button class="btn btn-primary" id="horror-again">${t('again')}</button>${game.guest?`<button class="btn btn-ghost" id="register-result">${t('saveProgress')}</button>`:''}<button class="btn btn-ghost" data-action="return-challenges">${t('close')}</button></div>`);$('#horror-again').onclick=()=>{closeModal();startGame('horror')};$('#register-result')?.addEventListener('click',()=>authModal(()=>{toast(t('success'),'success');profile()}));return}closeModal()}
  async function finishGame(){clearQuestionTimer();clearIdentityTimer();S().stopChallenge?.();document.body.classList.remove('horror-active');S().success?.();const src=C.get(game.id),score=game.score,total=game.questions.length,pressure=Math.min(100,Math.round(game.pressureScore/Math.max(1,total))),performance=Math.min(100,Math.round((score/Math.max(1,total))*75+pressure*.25)),xp=Math.max(10,Math.round(performance/100*src.xp)),coins=Math.max(1,Math.ceil((score+Math.min(10,Math.floor(game.pressureScore/100)))/2)),win=score>=Math.ceil(total*.5);await reward(xp,coins,win);state.bestStreak=Math.max(Number(state.bestStreak)||0,game.bestStreak||0);saveState();if(A.isLoggedIn())await A.update({bestStreak:state.bestStreak});profile();if(game.id==='daily')localStorage.setItem('zivo_daily_'+new Date().toISOString().slice(0,10),'1');await A.saveResult({challengeId:game.id,score,total,xp,coins,pressureScore:game.pressureScore,bestStreak:game.bestStreak,timedOut:game.timedOut,guest:game.guest,language:lang()});openModal(`<button class="modal-close" data-close>×</button><span class="eyebrow">${t('result')}</span><h2>${win?t('excellent'):t('roundEnded')}</h2><p>${t('score')}: <strong>${score}/${total}</strong> — <strong>${Math.round((score/Math.max(1,total))*100)}%</strong></p><p>✅ ${t('correct')}: <strong>${score}</strong> &nbsp; ❌ ${t('wrong')}: <strong>${Math.max(0,total-score-game.timedOut)}</strong> &nbsp; ⏱ <strong>${game.timedOut}</strong></p><p>⚡ ${t('pressure')}: <strong>${game.pressureScore}</strong> &nbsp; 🔥 ${t('bestStreak')}: <strong>${game.bestStreak}</strong></p><p>+${xp} XP &nbsp; +${coins} 🪙 ZIVO</p>${game.guest?`<div class="save-call"><strong>${t('guestSave')}</strong></div>`:''}<div class="modal-actions"><button class="btn btn-primary" id="again">${t('again')}</button>${game.guest?`<button class="btn btn-ghost" id="register-result">${t('saveProgress')}</button>`:''}<button class="btn btn-ghost" data-action="return-challenges">${t('close')}</button></div>`);$('#again').onclick=()=>{closeModal();startGame(game.id)};$('#register-result')?.addEventListener('click',()=>authModal(()=>{toast(t('success'),'success');profile()}))}
  function identity(){
    const qs=[
      ['عندما تبدأ مشروعًا جديدًا، ما أول شيء تفعله؟','When starting a new project, what do you do first?',['أضع خطة واضحة','أبدأ بالتجربة','أجمع الناس حول الفكرة','أبحث عن فرصة مختلفة'],['Make a clear plan','Start experimenting','Bring people around the idea','Look for a different opportunity']],
      ['عندما تفشل في شيء مهم؟','When you fail at something important?',['أحلل السبب','أحاول مرة أخرى بسرعة','أطلب رأيًا من شخص أثق به','أحوّل الفشل إلى فكرة جديدة'],['Analyze the reason','Try again quickly','Ask someone I trust','Turn failure into a new idea']],
      ['في المنافسة، ما الذي يشغلك أكثر؟','In competition, what matters most to you?',['الدقة','السرعة','الفريق','المفاجأة والإبداع'],['Accuracy','Speed','The team','Surprise and creativity']],
      ['عندما يختلف الناس معك؟','When people disagree with you?',['أناقش الأدلة','أدافع عن قراري','أبحث عن حل للجميع','أغير زاوية التفكير'],['Discuss the evidence','Defend my decision','Find a solution for everyone','Change the angle']],
      ['أي وصف أقرب لك؟','Which description fits you best?',['تحليلي','حاسم','اجتماعي','مغامر'],['Analytical','Decisive','Social','Adventurous']],
      ['عندما يكون الوقت ضيقًا؟','When time is tight?',['أرتب الأولويات','أتصرف فورًا','أوزع المهام','أخاطر بحل غير تقليدي'],['Prioritize','Act immediately','Delegate tasks','Risk an unconventional solution']],
      ['في لعبة صعبة جدًا؟','In a very difficult game?',['أبحث عن النمط','أضغط حتى النهاية','أفكر مع الآخرين','أجرب شيئًا لم أجربه'],['Find the pattern','Push to the end','Think with others','Try something new']],
      ['ما الذي يجذبك أكثر؟','What attracts you most?',['الألغاز','التحدي','الناس','المجهول'],['Puzzles','Challenge','People','The unknown']],
      ['إذا تغيرت الخطة فجأة؟','If the plan suddenly changes?',['أعيد الحساب','أقرر بسرعة','أشاور الفريق','أستمتع بالفوضى'],['Recalculate','Decide quickly','Consult the team','Enjoy the chaos']],
      ['ما الذي تعتبره نقطة قوة؟','What do you consider a strength?',['التركيز','الشجاعة','التواصل','الخيال'],['Focus','Courage','Communication','Imagination']],
      ['في المجموعة غالبًا أنت؟','In a group you are usually?',['المحلل','القائد','المساند','صاحب الأفكار'],['The analyst','The leader','The supporter','The idea person']],
      ['عند اتخاذ قرار كبير؟','When making a major decision?',['أقارن الخيارات','أحسم بسرعة','أفكر في تأثيره على الناس','أثق بحدسي'],['Compare options','Decide quickly','Think about its impact on people','Trust my intuition']],
      ['أي نوع من المخاطر تفضّل؟','Which risk do you prefer?',['المحسوب','الجريء','المشترك','المبتكر'],['Calculated','Bold','Shared','Innovative']],
      ['ماذا تفعل عندما يمل الآخرون؟','What do you do when others get bored?',['أضيف هدفًا جديدًا','أرفع التحدي','أشرك الجميع','أقلب القواعد'],['Add a new goal','Raise the challenge','Involve everyone','Change the rules']],
      ['ما الذي يزعجك أكثر؟','What bothers you most?',['الفوضى بلا منطق','التردد','العزلة','الروتين'],['Meaningless chaos','Hesitation','Isolation','Routine']],
      ['إذا أعطاك شخص سرًا؟','If someone gives you a secret?',['أحفظه','أحميه مهما كان','أفهم مشاعره','أستخدمه لفهم الصورة'],['Keep it','Protect it no matter what','Understand their feelings','Use it to understand the picture']],
      ['كيف تتعلم شيئًا جديدًا؟','How do you learn something new?',['أفهم القاعدة','أجرب بيدي','أتعلم مع شخص','أكسر الطريقة المعتادة'],['Understand the rule','Try it myself','Learn with someone','Break the usual method']],
      ['في لحظة ضغط حقيقية؟','In a truly stressful moment?',['أهدأ وأحلل','أواجه','أطلب الدعم','أبحث عن مخرج غير متوقع'],['Calm down and analyze','Confront it','Ask for support','Find an unexpected way out']],
      ['ما الذي تريد أن يذكرك الناس به؟','What do you want people to remember about you?',['عقلي','قوتي','قلبي','أفكاري'],['My mind','My strength','My heart','My ideas']],
      ['لو فتحت لك بوابة مجهولة؟','If an unknown portal opened for you?',['أفحصها أولًا','أدخل فورًا','أسأل من معي','أدخل لأكتشف ما وراءها'],['Inspect it first','Enter immediately','Ask whoever is with me','Enter to discover what is beyond']]
    ];
    const traits=[t('analysis'),t('adventurer'),t('teamPlayer'),t('creative')];
    const traitEn=['analyst','leader','connector','explorer'];
    const paragraphs={
      ar:['أنت شخص تحليلي، تراقب التفاصيل قبل القرار، وتبحث عن الأنماط الخفية. قوتك في الهدوء، التركيز، وتحويل التعقيد إلى خطوات قابلة للفهم.','أنت حاسم وطموح، تميل للمبادرة وتحمل الضغط. لا تنتظر الظروف المثالية، بل تتحرك عندما يتردد الآخرون وتحوّل التحدي إلى فرصة.','أنت اجتماعي وداعم، ترى الناس جزءًا أساسيًا من النجاح. تعرف كيف تجمع الآراء، تبني الثقة، وتحافظ على الفريق متماسكًا وقت الضغط.','أنت مستكشف ومبدع، يثيرك المجهول وتكره القوالب الثابتة. تميل لتجربة طرق غير مألوفة وتحويل الأفكار الغريبة إلى فرص جديدة.'],
      en:['You are analytical, observant, and patient, searching for hidden patterns before acting. Your strength is turning complexity into clear, useful decisions.','You are decisive and ambitious, comfortable under pressure. You act when others hesitate, turning uncertainty into momentum and difficult moments into opportunities.','You are social and supportive, seeing people as part of success. You build trust, connect perspectives, and help groups stay strong when pressure rises.','You are curious and creative, energized by uncertainty and new paths. You challenge routines, test unusual ideas, and turn strange possibilities into opportunities.']
    };
    let i=0,s=[0,0,0,0];
    window.__zivoIdentityTimeout=false;
    const step=()=>{
      if(i>=qs.length){const m=s.indexOf(Math.max(...s));state.identity=traits[m];saveState();const p=(paragraphs[lang()]||paragraphs.en)[m];openModal(`<button class="modal-close" data-action="return-challenges">×</button><span class="eyebrow">${t('whoAmI')}</span><h2>${traits[m]}</h2><p class="identity-result">${esc(p)}</p><div class="identity-score-grid"><span>${traitEn[m]}</span><span>${s[m]} / 20</span></div><div class="modal-actions"><button class="btn btn-primary" data-action="return-challenges">${t('close')}</button></div>`,'identity-result-modal');return}
      const q=qs[i],question=lang()==='ar'?q[0]:q[1],options=lang()==='ar'?q[2]:q[3];
      openModal(`<button class="modal-close" data-action="return-challenges">×</button><span class="eyebrow">${t('whoAmI')} • ${i+1}/20</span><h2>${esc(question)}</h2><div id="identity-timer" class="question-timer" role="timer" aria-live="polite"><span class="timer-label">${esc(t('timeLeft'))}</span><strong id="identity-timer-number">10</strong><div class="question-timer-track"><span id="identity-timer-fill"></span></div></div><div class="question-progress"><span style="width:${((i+1)/20)*100}%"></span></div><div class="answers">${options.map((x,n)=>`<button class="btn btn-ghost id-choice" data-n="${n}">${esc(x)}</button>`).join('')}</div>`,'identity-test-modal');
      $$('.id-choice').forEach(b=>b.onclick=()=>{clearIdentityTimer();if(window.__zivoIdentityTimeout){window.__zivoIdentityTimeout=false;i++;step();return}s[Number(b.dataset.n)]++;i++;step()});
      startIdentityTimer();
    };step();
  }
  function renderChallenges(){const today=new Date().toISOString().slice(0,10),done=localStorage.getItem('zivo_daily_'+today);const raw=C.getAll();const seenIds=new Set();const list=raw.filter(x=>x&&x.id&&!seenIds.has(x.id)&&seenIds.add(x.id));$('#challenge-list').innerHTML=list.map(x=>`<article class="challenge-card"><span class="challenge-icon">${x.icon}</span><div><span class="card-tag">${t('questions10')}</span><h3>${esc(loc(x.title))}</h3><p>${esc(loc(x.desc))}</p></div><button class="btn btn-primary" data-challenge="${x.id}" ${done&&x.id==='daily'?'disabled':''}>${done&&x.id==='daily'?t('done'):t('start')}</button></article>`).join('')+`<article class="challenge-card special"><span class="challenge-icon">👁️</span><div><span class="card-tag danger">∞</span><h3>${esc(loc(C.horror.title))}</h3><p>${esc(loc(C.horror.desc))}</p></div><button class="btn btn-primary danger-btn" data-challenge="horror">${t('enter')}</button></article>`}
  const NEWS=[{key:'FIFA',url:'https://www.fifa.com/',icon:'🌍',title:O('فيفا','FIFA')},{key:'AFC',url:'https://www.the-afc.com/',icon:'🏆',title:O('الاتحاد الآسيوي','AFC')},{key:'UEFA',url:'https://www.uefa.com/',icon:'⭐',title:O('يويفا','UEFA')},{key:'ESPN',url:'https://www.espn.com/',icon:'📰',title:O('ESPN','ESPN')}];
  function renderNewsSources(){const box=$('#news-list');if(!box)return;box.innerHTML=NEWS.map(n=>`<article class="sports-card"><div class="icon">${n.icon}</div><span class="card-tag">${n.key}</span><h3>${esc(loc(n.title))}</h3><p>${esc(t('sportsIntro'))}</p><a class="btn btn-ghost" href="${n.url}" target="_blank" rel="noopener noreferrer">${t('openNews')}</a></article>`).join('')}
  async function sports(){renderNewsSources();window.ZIVOZONE_NEWS?.load?.($('#news-list'),lang());window.ZIVOZONE_NEWS?.loadJordan?.($('#jordan-news-list'),lang());window.ZIVOZONE_FIXTURES?.load?.($('#fixture-list'),lang());const box=$('#sports-list');if(!box)return;box.innerHTML=`<article class="sports-card loading-card"><div class="spinner"></div><h3>${esc(t('sportsTitle'))}</h3><p>${esc(t('loader'))}</p></article>`;const teamIds=['133604','133602','133738','133739'];let events=[];try{const data=await Promise.all(teamIds.map(id=>fetch(`https://www.thesportsdb.com/api/v1/json/123/eventsnext.php?id=${id}`).then(r=>r.ok?r.json():null).catch(()=>null)));data.forEach(d=>{if(d?.events)events.push(...d.events)})}catch(e){}const seen=new Set();events=events.filter(e=>{const k=e.idEvent||`${e.strEvent}-${e.dateEvent}`;if(seen.has(k))return false;seen.add(k);return true}).slice(0,8);if(!events.length){box.innerHTML=`<article class="sports-card"><div class="icon">📡</div><h3>${esc(t('noData'))}</h3><p>${esc(t('newsUnavailable'))}</p></article>`;return}box.innerHTML=events.map(e=>`<article class="sports-card"><div class="match-icon">⚽</div><span class="card-tag">${esc(e.strLeague||e.strSport||'Sport')}</span><h3>${esc(e.strHomeTeam||'Home')} <span class="versus">VS</span> ${esc(e.strAwayTeam||'Away')}</h3><p>${esc(e.dateEvent||'')} ${esc(e.strTime||'')}</p><a class="btn btn-ghost" href="https://www.thesportsdb.com/" target="_blank" rel="noopener noreferrer">${t('open')}</a></article>`).join('')}
  function localAIReply(q){const x=q.toLowerCase();if(x.includes('مستوى')||x.includes('level')||x.includes('等级')||x.includes('nivel'))return`${t('level')} ${state.level} — ${state.xp} XP, ${state.coins} ZIVO.`;if(x.includes('تحد')||x.includes('challenge')||x.includes('挑战')||x.includes('desaf'))return t('challengeText');if(x.includes('رياض')||x.includes('sport')||x.includes('体育')||x.includes('deporte'))return t('sportsIntro');return t('aiWelcome')}
  async function askAI(message){if(API.aiEndpoint){try{const r=await fetch(API.aiEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,language:lang(),player:{level:state.level,xp:state.xp,gamesPlayed:state.gamesPlayed}})});if(r.ok){const d=await r.json();if(d.reply)return d.reply}}catch(e){}}return localAIReply(message)}
  function applyLanguage(){const l=lang();document.documentElement.lang=l;document.documentElement.dir=I.dir[l];$$('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;if(I.T[l]?.[k]!==undefined)el.textContent=t(k)});$$('[data-i18n-placeholder]').forEach(el=>el.placeholder=t(el.dataset.i18nPlaceholder));renderChallenges();renderNewsSources();profile();sports();$('#footer-tagline')?.replaceChildren(document.createTextNode(t('footerTagline')))}
  document.addEventListener('click',e=>{const gameBtn=e.target.closest('[data-game],[data-challenge]');if(gameBtn){e.preventDefault();startGame(gameBtn.dataset.game||gameBtn.dataset.challenge);return}const action=e.target.closest('[data-action]')?.dataset.action;if(action==='scroll-games'||action==='scroll-challenges'){e.preventDefault();$('#challenges')?.scrollIntoView({behavior:'smooth'});return}if(action==='open-identity'){identity();return}if(action==='login'){A.isLoggedIn()?location.hash='#profile':authModal();return}if(action==='logout'){A.logout().then(()=>{state={level:1,xp:0,coins:0,wins:0,gamesPlayed:0,bestStreak:0,identity:null};saveState();profile();toast(t('logoutDone'))});return}if(action==='refresh-sports'){sports();return}if(action==='ad-info'){toast(t('adText'));return}if(action==='ads-control'){window.ZIVOZONE_ADS?.open?.();return}if(action==='return-challenges'){returnToChallenges();return}if(action==='quit-game'){quitGame();return}});
  function bindMobileUX(){
    const more=$('#mobile-more'),root=$('#mobile-tools'),list=$('#mobile-tools-list');
    if(!more||!root||!list)return;
    const hiddenIds=['zivo-v24-balance','z27-cloud-status','v28-open','v29-open','v30-open','v31-open','v32-open','v33-open','v34-open','v35-open','v37-open','v38-open','v39-open'];
    const render=()=>{list.innerHTML='';hiddenIds.map(id=>document.getElementById(id)).filter(Boolean).forEach(src=>{
      const b=document.createElement('button');b.type='button';b.className='btn btn-ghost';b.textContent=(src.getAttribute('aria-label')||src.title||src.textContent||'ZIVO Tool').trim().slice(0,42)||'ZIVO Tool';
      b.onclick=()=>{src.click();close()};list.appendChild(b);
    });
    if(!list.children.length)list.innerHTML='<p class="muted">الأدوات الإضافية ستظهر هنا عند توفرها.</p>'};
    const open=()=>{render();root.hidden=false;root.setAttribute('aria-hidden','false')};
    const close=()=>{root.hidden=true;root.setAttribute('aria-hidden','true')};
    more.onclick=open;root.querySelectorAll('[data-mobile-close]').forEach(x=>x.addEventListener('click',close));
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
    document.querySelectorAll('.mobile-nav a').forEach(a=>a.addEventListener('click',()=>document.querySelectorAll('.mobile-nav a').forEach(x=>x.classList.toggle('active',x===a))));
  }
  function bind(){const audioBtn=$('#audio-toggle');if(audioBtn){audioBtn.textContent=S().isEnabled?.()?'🔊':'🔇';audioBtn.onclick=async()=>{await S().unlock?.();S().toggle?.();audioBtn.textContent=S().isEnabled?.()?'🔊':'🔇'}}$('#language-select').value=lang();$('#language-select').onchange=async e=>{I.set(e.target.value);await A.setLanguage(e.target.value);applyLanguage();toast(t('updateDone'),'success')};$('#login-btn').onclick=()=>A.isLoggedIn()?location.hash='#profile':authModal();$$('[data-action="login"]').forEach(b=>b.onclick=()=>A.isLoggedIn()?location.hash='#profile':authModal());$('#ai-form').onsubmit=async e=>{e.preventDefault();const input=$('#ai-input'),v=input.value.trim();if(!v)return;const box=$('#ai-messages');const u=document.createElement('div');u.className='ai-message user';u.textContent=v;box.append(u);input.value='';const b=document.createElement('div');b.className='ai-message bot';b.textContent='…';box.append(b);b.textContent=await askAI(v);box.scrollTop=box.scrollHeight}}
  window.addEventListener('zivozone-auth',e=>{syncFromPlayer();profile();const el=$('#firebase-status');if(el){el.textContent=e.detail?.cloud?'●':'○';el.classList.toggle('online',!!e.detail?.cloud);el.title=e.detail?.cloud?'Firebase connected':'Guest/local mode'}});
  window.addEventListener('zivozone-language',()=>{const sel=$('#language-select');if(sel)sel.value=lang()});
  loadState();document.addEventListener('DOMContentLoaded',()=>{
  try{bind()}catch(e){console.error('ZIVOZONE bind error:',e)}
  try{applyLanguage()}catch(e){console.error('ZIVOZONE render error:',e)}
  setTimeout(()=>$('#app-loader')?.classList.add('hidden'),650)
});
  /* ========================================================
     V17 — ZIVO PLAYER SYSTEM
  ======================================================== */
  const PLAYER_KEY='zivozone_player_v17';
  const PLAYER_DEFAULT={
    level:1,totalXP:0,bestScore:0,bestStreak:0,gamesPlayed:0,
    questionsAnswered:0,timedOut:0,
    stats:{intelligence:0,speed:0,focus:0,memory:0,courage:0},
    history:[],daily:{date:'',done:false}
  };
  function cloneDefault(){return JSON.parse(JSON.stringify(PLAYER_DEFAULT))}
  function getPlayer(){
    try{
      const raw=JSON.parse(localStorage.getItem(PLAYER_KEY)||'null');
      const p=Object.assign(cloneDefault(),raw||{});
      p.stats=Object.assign({},PLAYER_DEFAULT.stats,raw?.stats||{});
      p.history=Array.isArray(raw?.history)?raw.history:[];
      p.daily=Object.assign({},PLAYER_DEFAULT.daily,raw?.daily||{});
      return p;
    }catch(e){return cloneDefault()}
  }
  function savePlayer(p){
    localStorage.setItem(PLAYER_KEY,JSON.stringify(p));
    window.dispatchEvent(new CustomEvent('zivo:player-updated',{detail:p}));
  }
  function xpForLevel(level){return Math.round(100*Math.pow(Math.max(1,level),1.22))}
  function recalcLevel(p){
    let level=1;
    while(level<100 && p.totalXP>=xpForLevel(level+1)) level++;
    p.level=level; return p;
  }
  function addPlayerProgress(result){
    const p=getPlayer();
    const score=Number(result.score)||0, speed=Number(result.speedScore)||0;
    const streak=Number(result.bestStreak)||0, timeout=Number(result.timedOut)||0;
    const xp=Math.min(250,Math.max(5,Math.round(score*.35)+Math.round(speed*.08)+Math.min(40,streak*2)+Math.max(0,20-timeout*3)));
    p.totalXP+=xp;p.gamesPlayed++;p.questionsAnswered+=Number(result.questions)||0;p.timedOut+=timeout;
    p.bestScore=Math.max(p.bestScore,score);p.bestStreak=Math.max(p.bestStreak,streak);
    const map={iq:'intelligence',science:'intelligence',math:'intelligence',memory:'memory',reaction:'speed',focus:'focus',sports:'focus',horror:'courage',identity:'focus'};
    const stat=map[result.id]; if(stat)p.stats[stat]=Math.min(100,(p.stats[stat]||0)+Math.max(1,Math.round(xp/18)));
    p.history.unshift({id:result.id||'challenge',score,xp,streak,speedScore:speed,timedOut:timeout,at:new Date().toISOString()});
    p.history=p.history.slice(0,30);recalcLevel(p);savePlayer(p);return {xp,player:p};
  }
  function playerTitle(p){return p.level>=80?'ZIVO LEGEND':p.level>=50?'MASTER':p.level>=30?'ELITE':p.level>=15?'HUNTER':p.level>=5?'RISING':'ROOKIE'}
  function playerCard(){
    const p=getPlayer(),next=p.level<100?xpForLevel(p.level+1):p.totalXP,current=p.level===1?0:xpForLevel(p.level);
    const progress=p.level>=100?100:Math.max(0,Math.min(100,((p.totalXP-current)/(next-current))*100));
    return `<section class="zivo-player-card"><div class="zivo-player-top"><div><span class="eyebrow">ZIVO PLAYER</span><h2>LEVEL ${p.level}</h2><p>${playerTitle(p)}</p></div><div class="zivo-player-badge">⚡ ${p.totalXP} XP</div></div><div class="zivo-xp-track"><span style="width:${progress}%"></span></div><div class="zivo-player-stats"><span>🏆 ${p.bestScore}</span><span>🔥 ${p.bestStreak}</span><span>🎮 ${p.gamesPlayed}</span></div><div class="zivo-skill-grid">${[['🧠','Intelligence','intelligence'],['⚡','Speed','speed'],['🎯','Focus','focus'],['🧩','Memory','memory'],['👻','Courage','courage']].map(x=>`<div><b>${x[0]}</b><span>${x[1]}</span><strong>${p.stats[x[2]]}</strong></div>`).join('')}</div></section>`
  }
  function openPlayerProfile(){
    if(typeof openModal!=='function')return;
    const p=getPlayer();
    openModal(`${playerCard()}<div class="zivo-history"><h3>Recent Runs</h3>${p.history.length?p.history.slice(0,8).map(h=>`<div class="zivo-history-row"><span>${esc(h.id)}</span><b>${h.score}</b><span>+${h.xp} XP</span><small>${new Date(h.at).toLocaleDateString()}</small></div>`).join(''):'<p class="muted">Play a challenge to build your history.</p>'}</div><button class="btn btn-ghost" id="close-player">Close</button>`,'player-profile-modal');
    document.getElementById('close-player')?.addEventListener('click',closeModal);
  }
  function isDailyAvailable(){const p=getPlayer(),d=new Date().toISOString().slice(0,10);return p.daily.date!==d||!p.daily.done}
  function markDailyDone(){const p=getPlayer();p.daily={date:new Date().toISOString().slice(0,10),done:true};savePlayer(p)}
  window.ZIVOZONE_PLAYER={get:getPlayer,save:savePlayer,recalc:recalcLevel,addProgress:addPlayerProgress,open:openPlayerProfile,isDailyAvailable,markDailyDone};

})();


/* ============================================================
   V18 — CHALLENGE ROTATION + ANTI-REPEAT + ANSWER TYPES
============================================================ */
(function(){
  const USED_KEY='zivozone_used_questions_v18';
  function used(){
    try{return JSON.parse(localStorage.getItem(USED_KEY)||'[]')}catch(e){return []}
  }
  function saveUsed(arr){localStorage.setItem(USED_KEY,JSON.stringify(arr.slice(-500)))}
  function rememberQuestions(list){
    const u=used(),set=new Set(u);
    list.forEach(q=>{if(q?.id&&!set.has(q.id)){u.push(q.id);set.add(q.id)}});
    saveUsed(u);
  }
  function expandedBank(id){
    if(!window.ZIVOZONE_V18?.get)return null;
    return window.ZIVOZONE_V18.get(id);
  }
  window.ZIVOZONE_V18_ENGINE={
    used,saveUsed,rememberQuestions,expandedBank,
    nextRun:function(id){
      const b=expandedBank(id);if(!b)return null;
      const fresh=b.questions.filter(q=>!used().includes(q.id));
      const source=fresh.length>=10?fresh:b.questions.slice().sort(()=>Math.random()-.5);
      const run=Object.assign({},b,{questions:source.slice(0,10).sort((x,y)=>x.difficulty-y.difficulty)});
      rememberQuestions(run.questions);
      return run;
    },
    clearHistory:function(){saveUsed([])}
  };
})();

(function(){
  window.ZIVOZONE_V18_CATALOG=[
    {id:'logic',label:'Logic Lab',icon:'🧠'},
    {id:'pattern',label:'Pattern Break',icon:'🔷'},
    {id:'focus',label:'Focus Trap',icon:'🎯'}
  ];
})();


/* ============================================================
   V19 — DARK ROOM 2.0 / PSYCHOLOGICAL CINEMA ENGINE
   Additive layer: preserves V18 and Firebase configuration.
============================================================ */
(function(){
  const KEY='zivozone_darkroom_v19';
  const state={
    active:false,index:0,answered:0,phase:1,startedAt:0,
    used:[],audio:null,master:null,ctx:null,osc:[],timer:null
  };
  const lines=[
    "لا تستعجل… أنا أراقب طريقة تفكيرك.",
    "السؤال القادم أسهل مما تتوقع. أو هكذا أريدك أن تظن.",
    "اسمع جيدًا… لا يوجد شيء مطلوب منك الآن سوى الاستمرار.",
    "أنت لم تدخل الغرفة لتفوز فقط.",
    "الآن بدأت الغرفة تتعرف عليك.",
    "لا تنظر خلفك. ركّز على السؤال.",
    "إذا شعرت أن المكان تغيّر… أكمل.",
    "بقي القليل. هل أنت متأكد أنك تريد الوصول للنهاية؟",
    "الضوء لا يعني أن الغرفة أصبحت آمنة.",
    "أنت ما زلت هنا… وهذا هو الجزء الذي يهمني."
  ];
  function qs(sel,root=document){return root.querySelector(sel)}
  function ensureUI(){
    if(qs('#zivo-dark-v19'))return;
    const el=document.createElement('div');
    el.id='zivo-dark-v19';
    el.className='zivo-dark-v19';
    el.innerHTML=`
      <div class="z19-noise"></div><div class="z19-vignette"></div>
      <div class="z19-orb"></div><div class="z19-whisper" aria-live="polite"></div>
      <div class="z19-top"><span class="z19-phase">PHASE 01</span><span class="z19-count">01</span></div>
      <div class="z19-bottom"><button class="z19-exit" type="button">خروج</button></div>`;
    document.body.appendChild(el);
    el.querySelector('.z19-exit').addEventListener('click',stop);
  }
  function whisper(text,urgent=false){
    const w=qs('.z19-whisper');
    if(!w)return;
    w.textContent=text;
    w.classList.remove('show','urgent'); void w.offsetWidth;
    w.classList.add('show'); if(urgent)w.classList.add('urgent');
  }
  function phaseFor(n){return n<=10?1:n<=20?2:3}
  function update(n){
    ensureUI();
    const p=phaseFor(n);
    state.index=n;state.phase=p;
    const rootEl=qs('#zivo-dark-v19');
    rootEl.dataset.phase=p;
    qs('.z19-phase',rootEl).textContent=`PHASE 0${p}`;
    qs('.z19-count',rootEl).textContent=String(n).padStart(2,'0');
  }
  function beep(freq,duration,type='sine',gain=.035){
    if(!state.ctx||!state.master)return;
    const o=state.ctx.createOscillator(),g=state.ctx.createGain();
    o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.0001,state.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(gain,state.ctx.currentTime+.03);
    g.gain.exponentialRampToValueAtTime(.0001,state.ctx.currentTime+duration);
    o.connect(g);g.connect(state.master);o.start();o.stop(state.ctx.currentTime+duration+.05);
  }
  function startAudio(){
    try{
      const AC=window.AudioContext||window.webkitAudioContext;
      if(!AC)return;
      state.ctx=new AC(); state.master=state.ctx.createGain(); state.master.gain.value=.24;
      state.master.connect(state.ctx.destination);
      // Continuous low cinematic bed: no copyrighted external asset required.
      const o=state.ctx.createOscillator(),g=state.ctx.createGain(),l=state.ctx.createOscillator(),lg=state.ctx.createGain();
      o.type='sine';o.frequency.value=47;g.gain.value=.055;
      l.type='triangle';l.frequency.value=73;lg.gain.value=.018;
      o.connect(g);g.connect(state.master);l.connect(lg);lg.connect(state.master);o.start();l.start();
      state.osc=[o,l];
      whisper(lines[0]);
    }catch(e){}
  }
  function stopAudio(){
    try{
      state.osc.forEach(o=>{try{o.stop()}catch(e){}});
      if(state.ctx)state.ctx.close();
    }catch(e){}
    state.osc=[];state.ctx=null;state.master=null;
  }
  function start(){
    ensureUI();
    state.active=true;state.index=1;state.answered=0;state.phase=1;state.startedAt=Date.now();
    qs('#zivo-dark-v19').classList.add('active');
    document.body.classList.add('zivo-dark-active');
    update(1); startAudio();
    try{sessionStorage.setItem(KEY,JSON.stringify({startedAt:state.startedAt}))}catch(e){}
  }
  function next(){
    if(!state.active)return;
    state.answered++;
    const n=state.answered+1;
    if(n>30){
      whisper("انتهت الجولة… الآن يمكنك الخروج.",true);
      return;
    }
    update(n);
    if(n===11)whisper(lines[4]);
    else if(n===21)whisper(lines[7],true);
    else if(n===28)whisper(lines[8],true);
    else if(Math.random()<.42)whisper(lines[(n-1)%lines.length],n>=21);
    if(n>=21)beep(58,.32,'sawtooth',.045);
    else if(n>=11)beep(72,.22,'triangle',.025);
    else beep(96,.12,'sine',.018);
  }
  function stop(){
    state.active=false;
    clearTimeout(state.timer);
    stopAudio();
    const el=qs('#zivo-dark-v19'); if(el)el.classList.remove('active');
    document.body.classList.remove('zivo-dark-active');
    try{sessionStorage.removeItem(KEY)}catch(e){}
    // Never leave challenge audio playing on the home page.
    window.dispatchEvent(new CustomEvent('zivo:darkroom-stopped'));
  }
  function bindChallengeEvents(){
    /* V21.2: the main ZIVOZONE horror runner owns question progression.
       The old delegated click listener caused a single answer to advance
       twice. Dark Room remains visual/audio/narrative only. */
  }
  window.ZIVOZONE_DARKROOM_V19={start,stop,next,isActive:()=>state.active,whisper,update};
  ensureUI(); bindChallengeEvents();
})();


/* ============================================================
   V20 — REAL CHALLENGE CENTER
   Connects existing banks to a unified playable runner.
   Existing Firebase/auth/previous systems remain untouched.
============================================================ */
(function(){
  const USED='zivozone_v20_played_questions';
  const $=(s,r=document)=>r.querySelector(s);
  const locV20=o=>typeof o==='string'?o:(o?.[document.documentElement.lang]||o?.ar||o?.en||o?.zh||o?.hi||o?.es||'');
  const escV20=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const norm=x=>String(x??'').trim().toLowerCase().replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[،,؛;]/g,' ').replace(/\s+/g,' ');

  function readUsed(){try{return JSON.parse(localStorage.getItem(USED)||'[]')}catch(e){return[]}}
  function writeUsed(v){localStorage.setItem(USED,JSON.stringify(v.slice(-1000)))}
  function mark(list){
    const u=readUsed(),set=new Set(u);
    list.forEach(q=>{if(q?.id&&!set.has(q.id)){u.push(q.id);set.add(q.id)}});writeUsed(u);
  }
  function findBanks(){
    const out=[];
    if(window.ZIVOZONE_CHALLENGES){
      Object.keys(window.ZIVOZONE_CHALLENGES).forEach(k=>{
        const b=window.ZIVOZONE_CHALLENGES[k];
        if(b&&Array.isArray(b.questions)&&!b.special) out.push(b);
      });
    }
    if(window.ZIVOZONE_V18_BANK) Object.values(window.ZIVOZONE_V18_BANK).forEach(b=>out.push(b));
    const seen=new Set();
    return out.filter(b=>b?.id&&!seen.has(b.id)&&seen.add(b.id));
  }
  function pick(id){
    const banks=findBanks(), b=banks.find(x=>x.id===id)||banks.find(x=>x.id?.startsWith(id+'_v18'))||banks[0];
    if(!b)return null;
    const used=new Set(readUsed());
    let fresh=b.questions.filter(q=>q?.id&&!used.has(q.id));
    if(fresh.length<Math.min(10,b.questions.length)) fresh=b.questions.slice();

    // V23 SMART SELECTION: preserve the 10-question climb while adapting the mix
    // to the player's current level and recent performance.
    const p=window.ZIVOZONE_V21?.get?.()||window.ZIVOZONE_PLAYER?.get?.()||{};
    const level=Math.max(1,Number(p.level)||1);
    const history=Array.isArray(p.history)?p.history.slice(-5):[];
    const recentAvg=history.length?history.reduce((n,x)=>n+(Number(x.score)||0),0)/history.length:50;
    let shift=level>=20?1:level>=8?0.5:0;
    if(recentAvg>=80)shift+=0.5;
    if(recentAvg<45)shift-=0.5;
    const target=[1,2,3,4,5,6,7,8,9,10].map((d,i)=>Math.max(1,Math.min(10,Math.round(d+shift*(i/9)))));
    const remaining=fresh.slice();
    const run=[];
    target.forEach((td)=>{
      if(!remaining.length)return;
      let bestIndex=0,bestDistance=Infinity;
      remaining.forEach((q,i)=>{const d=Number(q.difficulty??q.d??1)||1;const distance=Math.abs(d-td)+Math.random()*.35;if(distance<bestDistance){bestDistance=distance;bestIndex=i}});
      run.push(remaining.splice(bestIndex,1)[0]);
    });
    while(run.length<Math.min(10,fresh.length))run.push(remaining.shift());
    mark(run);
    return {id:b.id,title:b.title||b.name||'Challenge',icon:b.icon||'🧠',questions:run.slice(0,10)};
  }
  function ensureMount(){
    let m=$('#zivo-v20-runner');
    if(m)return m;
    m=document.createElement('div');m.id='zivo-v20-runner';m.className='zivo-v20-runner';
    document.body.appendChild(m);return m;
  }
  function answer(question,value){
    const v=norm(value);
    // V8/V21 choice questions store the correct option as numeric `c` and labels in `a`.
    if(Array.isArray(question.a) && Number.isInteger(Number(question.c))){
      const idx=Number(question.c);
      if(idx>=0 && idx<question.a.length && norm(locV20(question.a[idx]))===v) return true;
    }
    const direct=question.answer ?? question.extra?.answer;
    if(direct!==undefined && norm(direct)===v) return true;
    return (question.alternatives||[]).some(x=>norm(locV20(x))===v);
  }
  function start(id){
    const run=pick(id); if(!run)return;
    const mount=ensureMount();
    let i=0,score=0,correct=0,streak=0,best=0,timed=0,startAt=0,timer=null,submittedAnswers=[];
    let locked=false;
    function cleanup(){clearInterval(timer);timer=null}
    function close(){
      cleanup();mount.classList.remove('active');document.body.classList.remove('v20-playing');
      if(window.ZIVOZONE_DARKROOM_V19?.isActive())window.ZIVOZONE_DARKROOM_V19.stop();
    }
    function render(){
      const q=run.questions[i]; if(!q){finish();return}
      locked=false;startAt=performance.now();
      const phase=q.difficulty>=8?'EXTREME':q.difficulty>=6?'HARD':q.difficulty>=4?'MEDIUM':'EASY';
      mount.innerHTML=`<div class="v20-shell">
        <div class="v20-head"><button class="v20-exit">خروج</button><span>${escV20(run.icon)} ${escV20(run.title)}</span><b>${i+1}/10</b></div>
        <div class="v20-progress"><i style="width:${((i)/10)*100}%"></i></div>
        <div class="v20-meta"><span>${phase}</span><strong id="v20-timer">10</strong></div>
        <article class="v20-question"><div class="v20-qnum">QUESTION ${String(i+1).padStart(2,'0')}</div><h2>${escV20(locV20(q.q||q.question||''))}</h2>
        <div class="v20-answer-area">${answerArea(q)}</div></article>
        <div class="v20-live"><span>🔥 ${streak}</span><span>🏆 ${score}</span></div>
      </div>`;
      $('.v20-exit',mount).onclick=close;
      const form=$('.v20-form',mount);
      form?.addEventListener('submit',e=>{e.preventDefault();submit(form,q)});
      const opts=mount.querySelectorAll('.v20-option');
      opts.forEach(o=>o.onclick=()=>submit({value:o.dataset.value},q));
      cleanup();let left=10;
      timer=setInterval(()=>{left--;const t=$('#v20-timer');if(t)t.textContent=left;
        if(left<=0){timed++;streak=0;locked=true;beep();setTimeout(()=>{i++;render()},250)}
      },1000);
    }
    function beep(){
      try{const C=window.AudioContext||window.webkitAudioContext,c=new C(),o=c.createOscillator(),g=c.createGain();o.frequency.value=180;o.type='triangle';g.gain.value=.035;o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.12);setTimeout(()=>c.close(),250)}catch(e){}
    }
    function answerArea(q){
      const choices=q.options||q.choices||q.answers||q.a;
      if(Array.isArray(choices)&&choices.length) return `<div class="v20-options">${choices.map(x=>`<button type="button" class="v20-option" data-value="${escV20(locV20(x))}">${escV20(locV20(x))}</button>`).join('')}</div>`;
      return `<form class="v20-form"><input autocomplete="off" placeholder="اكتب إجابتك هنا" aria-label="الإجابة"><button type="submit">إجابة</button></form>`;
    }
    function submit(form,q){
      if(locked)return;locked=true;cleanup();
      const value=form?.value!==undefined?form.value:form?.querySelector('input')?.value;
      const ok=answer(q,value); submittedAnswers.push(String(value??'')); const elapsed=(performance.now()-startAt)/1000;
      if(ok){correct++;score+=Math.max(10,50+Math.round((10-Math.min(10,elapsed))*5)+(q.difficulty||1)*5);streak++;best=Math.max(best,streak)}
      else streak=0;
      setTimeout(()=>{i++;render()},300);
    }
    function finish(){
      cleanup();
      if(window.ZIVOZONE_PLAYER?.addProgress){
        window.ZIVOZONE_PLAYER.addProgress({id:run.id,score,bestStreak:best,timedOut:timed,questions:run.questions.length,speedScore:Math.max(0,100-timed*8)});
      }
      if(window.ZIVOZONE_V46?.submit && window.ZIVOZONE_AUTH?.isLoggedIn?.()){
        window.ZIVOZONE_V46.submit({challengeId:run.id,attemptId:(crypto?.randomUUID?.()||('attempt-'+Date.now())),answers:submittedAnswers,total:run.questions.length}).then(r=>{
          if(r?.data?.verified){ window.ZIVOZONE_AUTH.track?.('challenge_verified',{challengeId:run.id,score:r.data.score,zivo:r.data.zivo,xp:r.data.xp}); window.ZIVOZONE_AUTH.update?.({xp:r.data.totalXp,coins:r.data.totalZivo,level:r.data.level,wins:window.ZIVOZONE_AUTH.getPlayer?.()?.wins||0,gamesPlayed:window.ZIVOZONE_AUTH.getPlayer?.()?.gamesPlayed||0}); }
        }).catch(()=>{});
      }
      mount.innerHTML=`<div class="v20-result"><div class="v20-result-icon">✓</div><h2>انتهت الجولة</h2><div class="v20-result-score">${correct}/10</div><p>الصحيحة: ${correct} &nbsp; • &nbsp; الخاطئة: ${Math.max(0,10-correct-timed)} &nbsp; • &nbsp; انتهى وقت: ${timed}</p><p>النقاط: <strong>${score}</strong> &nbsp; • &nbsp; أفضل سلسلة: ${best}</p><div><button class="v20-again">جولة جديدة</button><button class="v20-exit">خروج</button></div></div>`;
      $('.v20-again',mount).onclick=()=>start(run.id);
      $('.v20-exit',mount).onclick=close;
    }
    mount.classList.add('active');document.body.classList.add('v20-playing');
    if(id==='horror'&&window.ZIVOZONE_DARKROOM_V19)window.ZIVOZONE_DARKROOM_V19.start();
    render();
  }
  window.ZIVOZONE_V20={start,findBanks,pick,clearHistory:()=>writeUsed([])};
})();


/* ============================================================
   V21 — PLAYER CLOUD PROGRESSION
   Additive layer. Never replaces existing Firebase/auth code.
============================================================ */
(function(){
  const LOCAL='zivozone_v21_progress';
  const state={queue:[],syncing:false};

  function loadLocal(){
    try{return JSON.parse(localStorage.getItem(LOCAL)||'{"xp":0,"level":1,"games":0,"streak":0,"bestScore":0,"history":[]}')}catch(e){return {xp:0,level:1,games:0,streak:0,bestScore:0,history:[]}}
  }
  function saveLocal(p){try{localStorage.setItem(LOCAL,JSON.stringify(p))}catch(e){}}
  function calcLevel(xp){return Math.max(1,Math.min(100,Math.floor(Math.sqrt(Math.max(0,xp)/25))+1))}
  function merge(base,delta){
    const p=Object.assign(loadLocal(),base||{});
    p.xp=Math.max(0,Number(p.xp)||0)+(Number(delta.xp)||0);
    p.level=calcLevel(p.xp);
    p.games=(Number(p.games)||0)+1;
    p.bestScore=Math.max(Number(p.bestScore)||0,Number(delta.score)||0);
    p.streak=Math.max(Number(p.streak)||0,Number(delta.streak)||0);
    p.history=Array.isArray(p.history)?p.history.slice(-29):[];
    p.history.push({at:Date.now(),challenge:delta.challenge||'unknown',score:Number(delta.score)||0,xp:Number(delta.xp)||0});
    saveLocal(p);return p;
  }
  async function cloudWrite(p){
    // Hook into existing public ZIVOZONE/Firebase APIs when available.
    try{
      if(window.ZIVOZONE_AUTH?.savePlayerProgress) return await window.ZIVOZONE_AUTH.savePlayerProgress(p);
      if(window.ZIVOZONE_FIREBASE?.savePlayerProgress) return await window.ZIVOZONE_FIREBASE.savePlayerProgress(p);
      if(window.savePlayerProgress) return await window.savePlayerProgress(p);
    }catch(e){console.warn('ZIVO V21 cloud sync deferred',e)}
    return false;
  }
  async function sync(){
    if(state.syncing)return false;state.syncing=true;
    try{const p=loadLocal();const r=await cloudWrite(p);state.syncing=false;return r}catch(e){state.syncing=false;return false}
  }
  async function record(result){
    const xp=Math.max(5,Math.round((Number(result.score)||0)/20)+((result.streak||0)*2));
    const p=merge(null,Object.assign({},result,{xp}));
    window.dispatchEvent(new CustomEvent('zivozone-progress',{detail:p}));
    await sync();return p;
  }
  function get(){return loadLocal()}
  window.ZIVOZONE_V21={record,get,sync,calcLevel};
  window.ZIVOZONE_PLAYER=window.ZIVOZONE_PLAYER||{};
  const oldAdd=window.ZIVOZONE_PLAYER.addProgress;
  window.ZIVOZONE_PLAYER.addProgress=async function(result){
    if(typeof oldAdd==='function'){try{await oldAdd.call(this,result)}catch(e){}}
    return record(result);
  };
})();


/* ============================================================
   V21 — LIVE PLAYER HUD
============================================================ */
(function(){
  function mount(){
    if(document.getElementById('zivo-v21-hud'))return;
    const el=document.createElement('aside');
    el.id='zivo-v21-hud';el.className='zivo-v21-hud';
    el.innerHTML='<div><span>LEVEL</span><b id="v21-level">1</b></div><div><span>XP</span><b id="v21-xp">0</b></div><div><span>BEST</span><b id="v21-best">0</b></div>';
    document.body.appendChild(el);
    refresh();
  }
  function refresh(){
    const p=window.ZIVOZONE_V21?.get?.()||{};
    const l=document.getElementById('v21-level'),x=document.getElementById('v21-xp'),b=document.getElementById('v21-best');
    if(l)l.textContent=p.level||1;if(x)x.textContent=p.xp||0;if(b)b.textContent=p.bestScore||0;
  }
  window.addEventListener('zivozone-progress',refresh);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();

/* ============================================================
   V22 — CONTENT QUALITY / ROTATION LAYER
   Keeps Dark Room isolated. Improves normal challenge selection.
============================================================ */
(function(){
  const USED='zivozone_v22_played_questions';
  function read(){try{return JSON.parse(localStorage.getItem(USED)||'[]')}catch(e){return[]}}
  function write(v){try{localStorage.setItem(USED,JSON.stringify(v.slice(-1500)))}catch(e){}}
  function mark(qs){const a=read(),s=new Set(a);qs.forEach(q=>{if(q?.id&&!s.has(q.id)){a.push(q.id);s.add(q.id)}});write(a)}
  function freshQuestions(bank){
    const seen=new Set(read());
    let fresh=(bank.questions||[]).filter(q=>q?.id&&!seen.has(q.id));
    if(fresh.length<10){
      // Reset only this bank's exhausted questions, never the global history.
      const ids=new Set((bank.questions||[]).map(q=>q.id));
      const kept=read().filter(id=>!ids.has(id)); write(kept); fresh=(bank.questions||[]).slice();
    }
    return fresh.sort(()=>Math.random()-.5).slice(0,10).sort((a,b)=>(a.d||a.difficulty||0)-(b.d||b.difficulty||0));
  }
  window.ZIVOZONE_V22_CONTENT={read,write,mark,freshQuestions};
})();


/* ============================================================
   ZIVOZONE V26 — WALLET + REWARDS + LEADERBOARD READY
   Stable/additive layer. No replacement of Firebase config.
============================================================ */
(function(){
  'use strict';
  const KEY='zivozone_v26_store';
  const DEFAULT={owned:[],purchases:0,spent:0,dailyClaim:null};
  const catalog=[
    {id:'streak_shield',name:'Streak Shield',price:25,desc:'يحمي سلسلة أيامك مرة واحدة عند الانقطاع.'},
    {id:'double_xp',name:'Double XP',price:40,desc:'مضاعفة XP لجولة واحدة في النظام الداعم.'},
    {id:'mystery_badge',name:'Mystery Badge',price:75,desc:'شارة غامضة تظهر في ملف اللاعب.'},
    {id:'dark_pass',name:'Dark Pass',price:100,desc:'عنصر تجميلي مرتبط بالغرفة المظلمة.'}
  ];
  function read(){try{return Object.assign({},DEFAULT,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){return {...DEFAULT}}}
  function write(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){};window.dispatchEvent(new CustomEvent('zivozone-v26',{detail:s}));return s}
  function balance(){return Number(window.ZIVOZONE_V25?.get?.()?.balance||0)}
  function buy(id){
    const item=catalog.find(x=>x.id===id),s=read();if(!item)return false;
    if(s.owned.includes(id))return true;
    if(balance()<item.price)return false;
    if(!window.ZIVOZONE_V25?.spend?.(item.price,'shop:'+id))return false;
    s.owned.push(id);s.purchases++;s.spent+=item.price;write(s);render();return true;
  }
  function claimDaily(){
    const d=new Date().toISOString().slice(0,10),s=read();
    if(s.dailyClaim===d)return false;
    s.dailyClaim=d;write(s);
    window.ZIVOZONE_V25?.add?.(3,'daily_claim_v26');render();return true;
  }
  function profile(){
    const p=window.ZIVOZONE_V21?.get?.()||{},s=read(),v=window.ZIVOZONE_V25?.get?.()||{};
    return {level:p.level||1,xp:p.xp||0,games:p.games||0,bestScore:p.bestScore||0,balance:v.balance||0,streak:v.streak||1,spent:s.spent||0};
  }
  function open(tab){
    let o=document.getElementById('v26-overlay');
    if(!o){
      o=document.createElement('div');o.id='v26-overlay';o.className='v26-overlay';
      o.innerHTML=`<div class="v26-card"><button class="v26-close">×</button>
      <div class="v26-head"><div class="v26-logo">Z</div><div><small>ZIVOZONE V26</small><h2>ZIVO Hub</h2></div></div>
      <div class="v26-tabs"><button data-tab="wallet">المحفظة</button><button data-tab="shop">المتجر</button><button data-tab="board">الترتيب</button></div>
      <section id="v26-wallet" class="v26-section"></section><section id="v26-shop" class="v26-section"></section><section id="v26-board" class="v26-section"></section>
      <p class="v26-note">ZIVO مكافأة افتراضية داخل ZIVOZONE. لا تمثل مالًا ولا وعدًا بقيمة مالية. الرصيد الحقيقي للمشروع يجب أن يُدار لاحقًا من خادم موثوق عند تفعيل الاقتصاد السحابي.</p></div>`;
      document.body.appendChild(o);
      o.querySelector('.v26-close').onclick=()=>o.classList.remove('open');
      o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('open')});
      o.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>render(b.dataset.tab));
    }
    o.classList.add('open');render(tab||'wallet');
  }
  function render(tab='wallet'){
    const o=document.getElementById('v26-overlay');if(!o)return;
    const p=profile(),s=read();
    const w=o.querySelector('#v26-wallet'),sh=o.querySelector('#v26-shop'),bo=o.querySelector('#v26-board');
    w.innerHTML=`<div class="v26-grid"><div class="v26-stat"><span>ZIVO</span><b>${p.balance}</b></div><div class="v26-stat"><span>LEVEL</span><b>${p.level}</b></div><div class="v26-stat"><span>STREAK</span><b>${p.streak}</b></div><div class="v26-stat"><span>XP</span><b>${p.xp}</b></div><div class="v26-stat"><span>BEST</span><b>${p.bestScore}</b></div><div class="v26-stat"><span>GAMES</span><b>${p.games}</b></div></div><br><button id="v26-daily" style="width:100%;padding:11px;border:0;border-radius:11px;cursor:pointer">استلم مكافأة الدخول اليومية +3 ZIVO</button>`;
    w.querySelector('#v26-daily').onclick=()=>{claimDaily();render('wallet')};
    sh.innerHTML='<div class="v26-shop">'+catalog.map(i=>`<article class="v26-item"><h4>${i.name}</h4><p>${i.desc}</p><button data-buy="${i.id}" ${s.owned.includes(i.id)?'disabled':''}>${s.owned.includes(i.id)?'مملوك':'شراء '+i.price+' ZIVO'}</button></article>`).join('')+'</div>';
    sh.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{if(!buy(b.dataset.buy))alert('رصيد ZIVO غير كافٍ أو العنصر مملوك.');render('shop')});
    const rows=[['1','أنت','—'],['2','قادم قريبًا','—'],['3','قادم قريبًا','—'],['4','قادم قريبًا','—'],['5','قادم قريبًا','—']];
    bo.innerHTML='<div class="v26-board"><div class="v26-row"><span>★</span><b>أداؤك الحالي</b><b>'+p.bestScore+'</b></div>'+rows.map(r=>`<div class="v26-row"><span>${r[0]}</span><b>${r[1]}</b><b>${r[2]}</b></div>`).join('')+'</div><p class="v26-note">هذه واجهة تجهيز للـLeaderboard. الترتيب العالمي الحقيقي يحتاج قراءة وكتابة آمنة من Firebase عبر قواعد وصول مناسبة، ولن أضع رصيدًا قابلًا للتلاعب من المتصفح على أنه رصيد سحابي حقيقي.</p>';
    o.querySelectorAll('.v26-section').forEach(e=>e.classList.remove('active'));o.querySelector('#v26-'+tab).classList.add('active');
    o.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  }
  function button(){
    if(document.getElementById('v26-open'))return;
    const b=document.createElement('button');b.id='v26-open';b.textContent='ZIVO';b.title='ZIVO Hub';
    b.style.cssText='position:fixed;right:18px;bottom:72px;z-index:9401;border:1px solid rgba(255,255,255,.13);border-radius:13px;padding:8px 13px;background:rgba(7,8,14,.88);color:#fff;font-weight:900;cursor:pointer;backdrop-filter:blur(12px)';
    b.onclick=()=>open('wallet');document.body.appendChild(b);
  }
  window.ZIVOZONE_V26={open,buy,claimDaily,profile,catalog};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',button);else button();
})();


/* ============================================================
   ZIVOZONE V27 — CLOUD READY / PLAYER RECORDS / LEADERBOARD
   Uses existing Firebase initialization when exposed by auth.js.
   Server-side validation remains required for production rewards.
============================================================ */
(function(){
  'use strict';
  const K='zivozone_v27_cloud_queue';
  const safeRead=()=>{try{return JSON.parse(localStorage.getItem(K)||'[]')}catch(e){return[]}};
  const safeWrite=v=>{try{localStorage.setItem(K,JSON.stringify(v.slice(-100)))}catch(e){}};
  function uid(){
    const p=window.ZIVOZONE_AUTH?.getPlayer?.(); return p?.uid||p?.id||p?.user?.uid||null;
  }
  function snapshot(){
    const p=window.ZIVOZONE_V26?.profile?.()||{};
    return {uid:uid(),level:p.level||1,xp:p.xp||0,games:p.games||0,bestScore:p.bestScore||0,streak:p.streak||1,at:Date.now()};
  }
  function queue(event){
    const q=safeRead();q.push({event,data:snapshot(),challenge:event.challenge||null});safeWrite(q);
    return q;
  }
  async function flush(){
    // Compatible bridge: if a future Firebase connector is exposed, use it.
    // No guessed Firebase API is called, preventing breakage of the working V21/V26 setup.
    const bridge=window.ZIVOZONE_FIREBASE_BRIDGE;
    if(!bridge?.savePlayerEvent)return false;
    const q=safeRead();
    for(const item of q){
      try{await bridge.savePlayerEvent(item)}catch(e){return false}
    }
    safeWrite([]);return true;
  }
  function submitChallenge(challenge,correct,total,score){
    const item={challenge,correct,total,score};
    const q=safeRead();q.push({event:'challenge_complete',data:snapshot(),challenge:item});safeWrite(q);
    flush();
  }
  window.ZIVOZONE_V27={snapshot,queue,flush,submitChallenge,pending:()=>safeRead().length};
  window.addEventListener('zivozone-progress',e=>{
    const d=e.detail||{};
    if(d.challenge) submitChallenge(d.challenge,d.correct,d.total,d.score);
  });
  setTimeout(flush,2500);
})();


/* ============================================================
   ZIVOZONE V28 — FIRESTORE PLAYER CLOUD BRIDGE
   Additive layer. Existing Firebase/Auth code is preserved.
   It supports the common Firebase compat SDK when available,
   and exposes a bridge for modular SDK projects without
   guessing or replacing the project's initialization.
============================================================ */
(function(){
  'use strict';
  const QUEUE='zivozone_v28_sync_queue';
  const DEVICE='zivozone_v28_device';
  const getDevice=()=>{
    let id=localStorage.getItem(DEVICE);
    if(!id){id=(crypto.randomUUID?crypto.randomUUID():'dev_'+Date.now()+'_'+Math.random().toString(36).slice(2));try{localStorage.setItem(DEVICE,id)}catch(e){}}
    return id;
  };
  const readQ=()=>{try{return JSON.parse(localStorage.getItem(QUEUE)||'[]')}catch(e){return[]}};
  const writeQ=q=>{try{localStorage.setItem(QUEUE,JSON.stringify(q.slice(-100)))}catch(e){}};
  const currentUser=()=>{
    try{
      if(window.firebase?.auth) return window.firebase.auth().currentUser||null;
    }catch(e){}
    try{return window.ZIVOZONE_AUTH?.getPlayer?.()?.user||window.ZIVOZONE_AUTH?.getPlayer?.()||null}catch(e){return null}
  };
  const uid=()=>currentUser()?.uid||window.ZIVOZONE_AUTH?.getPlayer?.()?.uid||null;

  function makeEvent(type,payload){
    const p=window.ZIVOZONE_V27?.snapshot?.()||{};
    return {type,payload,uid:uid()||null,deviceId:getDevice(),createdAt:new Date().toISOString(),
            player:{level:p.level||1,xp:p.xp||0,games:p.games||0,bestScore:p.bestScore||0,streak:p.streak||1}};
  }

  async function compatWrite(item){
    const f=window.firebase;
    if(!f?.firestore||!f?.auth) return false;
    const user=f.auth().currentUser;
    if(!user) return false;
    const db=f.firestore();
    const ref=db.collection('players').doc(user.uid);
    // Transactionally update a player's safe aggregate. Challenge reward values
    // are not accepted from this browser as authoritative.
    await db.runTransaction(async tx=>{
      const snap=await tx.get(ref);
      const old=snap.exists?snap.data():{};
      tx.set(ref,{
        uid:user.uid,
        level:Number(item.player.level)||1,
        xp:Number(item.player.xp)||0,
        games:Number(item.player.games)||0,
        bestScore:Number(item.player.bestScore)||0,
        streak:Number(item.player.streak)||1,
        lastSeen:item.createdAt
      },{merge:true});
    });
    return true;
  }

  async function sync(){
    const q=readQ();
    if(!q.length) return true;
    if(!uid()) return false;
    let remaining=[];
    for(const item of q){
      try{
        if(await compatWrite(item)) continue;
      }catch(e){}
      remaining.push(item);
    }
    writeQ(remaining);
    return remaining.length===0;
  }

  function enqueue(type,payload){
    const q=readQ();q.push(makeEvent(type,payload));writeQ(q);sync();
  }

  window.ZIVOZONE_V28={
    cloud:()=>!!(window.firebase?.firestore&&window.firebase?.auth),
    uid, sync, pending:()=>readQ().length,
    enqueue
  };

  window.addEventListener('zivozone-progress',e=>{
    const d=e.detail||{};
    enqueue('challenge_complete',{
      challenge:String(d.challenge||'unknown'),
      correct:Number(d.correct)||0,
      total:Number(d.total)||0,
      score:Number(d.score)||0
    });
  });
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')sync()});
  window.addEventListener('online',sync);
  setTimeout(sync,1500);
})();


/* ============================================================
   V28 — CLOUD PLAYER CENTER
============================================================ */
(function(){
  'use strict';
  function mount(){
    if(document.getElementById('v28-center'))return;
    const o=document.createElement('div');o.id='v28-center';o.className='v28-overlay';
    o.innerHTML=`<div class="v28-card">
      <button class="v28-close">×</button>
      <div class="v28-head"><div class="v28-z">Z</div><div><small>PLAYER CLOUD</small><h2>مركز اللاعب</h2></div></div>
      <div class="v28-cloud"><span id="v28-dot">●</span><b id="v28-cloud-text">فحص الاتصال...</b></div>
      <div class="v28-grid" id="v28-stats"></div>
      <div class="v28-actions"><button id="v28-sync">مزامنة الآن</button><button id="v28-refresh">تحديث البيانات</button></div>
      <p class="v28-note">بيانات الملف والتقدم يمكن مزامنتها إلى Firebase عند توفر حساب مسجل واتصال Firebase متوافق. المكافآت المالية أو قيم ZIVO لا تُعتبر موثوقة من المتصفح.</p>
    </div>`;
    document.body.appendChild(o);
    o.querySelector('.v28-close').onclick=()=>o.classList.remove('open');
    o.querySelector('#v28-sync').onclick=async()=>{await window.ZIVOZONE_V28?.sync?.();render()};
    o.querySelector('#v28-refresh').onclick=render;
  }
  function render(){
    mount();
    const o=document.getElementById('v28-center');o.classList.add('open');
    const p=window.ZIVOZONE_V26?.profile?.()||{},cloud=window.ZIVOZONE_V28?.cloud?.(),pending=window.ZIVOZONE_V28?.pending?.()||0;
    o.querySelector('#v28-cloud-text').textContent=cloud?'Firebase متصل':'Firebase غير متاح حاليًا';
    o.querySelector('#v28-dot').textContent=cloud?'●':'○';
    o.querySelector('#v28-stats').innerHTML=[
      ['ZIVO',p.balance||0],['LEVEL',p.level||1],['XP',p.xp||0],['GAMES',p.games||0],['BEST',p.bestScore||0],['PENDING',pending]
    ].map(v=>`<div><span>${v[0]}</span><b>${v[1]}</b></div>`).join('');
  }
  function button(){
    if(document.getElementById('v28-open'))return;
    const b=document.createElement('button');b.id='v28-open';b.textContent='☁ اللاعب';
    b.onclick=render;document.body.appendChild(b);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',button);else button();
})();


/* ============================================================
   ZIVOZONE V29 — SECURE PLAYER DATA + LEADERBOARD CORE
   Additive. Existing Firebase initialization is never replaced.
============================================================ */
(function(){
  'use strict';
  const LOCAL='zivozone_v29_profile';
  const read=()=>{try{return JSON.parse(localStorage.getItem(LOCAL)||'{}')}catch(e){return{}}};
  const write=v=>{try{localStorage.setItem(LOCAL,JSON.stringify(v))}catch(e){}};
  const user=()=>{try{return window.firebase?.auth?.()?.currentUser||null}catch(e){return null}};
  const cloud=()=>!!(window.firebase?.auth&&window.firebase?.firestore&&user());
  const profile=()=>window.ZIVOZONE_V26?.profile?.()||window.ZIVOZONE_V27?.snapshot?.()||{};
  const sanitizeName=n=>String(n||'لاعب ZIVO').replace(/[<>"'`]/g,'').trim().slice(0,24)||'لاعب ZIVO';

  async function saveProfile(){
    if(!cloud()) return false;
    const u=user(),p=profile(),name=sanitizeName(u.displayName||read().name);
    try{
      const db=window.firebase.firestore();
      await db.collection('players').doc(u.uid).set({
        uid:u.uid,
        displayName:name,
        level:Number(p.level)||1,
        xp:Number(p.xp)||0,
        games:Number(p.games)||0,
        bestScore:Number(p.bestScore)||0,
        streak:Number(p.streak)||1,
        updatedAt:new Date().toISOString()
      },{merge:true});
      return true;
    }catch(e){return false}
  }

  async function submitScore(score,challenge){
    const n=Math.max(0,Math.min(100,Number(score)||0));
    if(!cloud()) return false;
    const u=user();
    try{
      const db=window.firebase.firestore();
      // Store an immutable-ish attempt record. Trust-sensitive reward
      // calculations must be performed server-side later.
      await db.collection('players').doc(u.uid).collection('attempts').add({
        challenge:String(challenge||'unknown').slice(0,80),
        score:n,
        createdAt:new Date().toISOString()
      });
      return true;
    }catch(e){return false}
  }

  async function leaderboard(limit=20){
    if(!cloud()) return [];
    try{
      const db=window.firebase.firestore();
      const snap=await db.collection('players').orderBy('bestScore','desc').limit(Math.min(50,Math.max(1,limit))).get();
      return snap.docs.map((d,i)=>({rank:i+1,...d.data(),displayName:sanitizeName(d.data().displayName)}));
    }catch(e){return []}
  }

  window.ZIVOZONE_V29={cloud,saveProfile,submitScore,leaderboard,sanitizeName};
  window.addEventListener('zivozone-progress',e=>{
    const d=e.detail||{};
    saveProfile();
    if(d.score!=null)submitScore(d.score,d.challenge);
  });
  setTimeout(saveProfile,1800);
})();


/* ============================================================
   V29 — GLOBAL LEADERBOARD PANEL
============================================================ */
(function(){
  function open(){
    let o=document.getElementById('v29-board');
    if(!o){
      o=document.createElement('div');o.id='v29-board';o.className='v29-overlay';
      o.innerHTML=`<div class="v29-card"><button class="v29-close">×</button>
      <div class="v29-title"><div class="v29-z">Z</div><div><small>GLOBAL RANK</small><h2>المتصدرون</h2></div></div>
      <div id="v29-status" class="v29-status">جاري تحميل الترتيب...</div>
      <div id="v29-list" class="v29-list"></div>
      <p class="v29-note">يظهر الترتيب العالمي عندما يكون اللاعب مسجلًا وFirestore متاحًا. النتائج الموثوقة يجب أن تخضع لقواعد Firebase والتحقق من الخادم.</p>
      </div>`;
      document.body.appendChild(o);o.querySelector('.v29-close').onclick=()=>o.classList.remove('open');
    }
    o.classList.add('open');load();
  }
  async function load(){
    const s=document.getElementById('v29-status'),l=document.getElementById('v29-list');
    if(!s||!l)return;
    if(!window.ZIVOZONE_V29?.cloud?.()){s.textContent='سجّل الدخول لعرض الترتيب العالمي';l.innerHTML='';return}
    const rows=await window.ZIVOZONE_V29.leaderboard(20);
    if(!rows.length){s.textContent='لا توجد نتائج سحابية بعد';l.innerHTML='';return}
    s.textContent='أفضل النتائج · ZIVOZONE';
    l.innerHTML=rows.map(r=>`<div class="v29-row"><span>#${r.rank}</span><b>${window.ZIVOZONE_V29.sanitizeName(r.displayName)}</b><strong>${Number(r.bestScore)||0}</strong></div>`).join('');
  }
  function button(){
    if(document.getElementById('v29-open'))return;
    const b=document.createElement('button');b.id='v29-open';b.textContent='🏆 المتصدرون';b.onclick=open;document.body.appendChild(b);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',button);else button();
})();


/* ============================================================
   ZIVOZONE V30 — PLAYER IDENTITY / PROGRESSION / STATS
   Additive layer; preserves V29 and previous systems.
============================================================ */
(function(){
  'use strict';
  const KEY='zivozone_v30_identity';
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return{}}};
  const write=v=>{try{localStorage.setItem(KEY,JSON.stringify(v))}catch(e){}};
  const clean=s=>String(s||'لاعب ZIVO').replace(/[<>"'`]/g,'').trim().slice(0,24)||'لاعب ZIVO';
  const getUser=()=>{try{return window.firebase?.auth?.()?.currentUser||null}catch(e){return null}};
  const cloud=()=>!!getUser();
  function get(){
    const p=window.ZIVOZONE_V26?.profile?.()||{},old=read();
    return {...old,name:clean(getUser()?.displayName||old.name),level:Number(p.level)||old.level||1,
      xp:Number(p.xp)||old.xp||0,balance:Number(p.balance)||old.balance||0,games:Number(p.games)||old.games||0,
      bestScore:Number(p.bestScore)||old.bestScore||0,streak:Number(p.streak)||old.streak||0};
  }
  function stats(){
    const s=read();return s.challengeStats||{};
  }
  function record(d){
    const s=get(), all=stats(), key=String(d.challenge||'general').slice(0,60);
    const q=all[key]||{games:0,correct:0,total:0,best:0};
    q.games++;q.correct+=Number(d.correct)||0;q.total+=Number(d.total)||0;q.best=Math.max(q.best,Number(d.score)||0);
    all[key]=q;s.challengeStats=all;s.name=s.name||'لاعب ZIVO';write(s);
    try{window.ZIVOZONE_V29?.saveProfile?.()}catch(e){}
    return q;
  }
  function render(){
    const s=get(),all=stats();
    const rows=Object.entries(all).sort((a,b)=>b[1].best-a[1].best).slice(0,12);
    const o=document.getElementById('v30-panel');if(!o)return;
    o.querySelector('.v30-name').textContent=s.name;
    o.querySelector('.v30-avatar').textContent=(s.name[0]||'Z').toUpperCase();
    o.querySelector('.v30-main').innerHTML=[
      ['LEVEL',s.level],['XP',s.xp],['ZIVO',s.balance],['GAMES',s.games],['BEST',s.bestScore],['STREAK',s.streak]
    ].map(v=>`<div><span>${v[0]}</span><b>${v[1]}</b></div>`).join('');
    o.querySelector('.v30-challenges').innerHTML=rows.length?rows.map(([k,v])=>`<div class="v30-line"><b>${clean(k)}</b><span>${v.games} لعب · ${v.correct}/${v.total}</span><strong>${v.best}</strong></div>`).join(''):'ابدأ التحديات لتكوين سجلّك.';
  }
  function open(){
    let o=document.getElementById('v30-panel');
    if(!o){
      o=document.createElement('div');o.id='v30-panel';o.className='v30-overlay';
      o.innerHTML=`<div class="v30-card"><button class="v30-close">×</button>
        <div class="v30-profile"><div class="v30-avatar">Z</div><div><small>PLAYER IDENTITY</small><h2 class="v30-name">لاعب ZIVO</h2><em>ملف اللاعب</em></div></div>
        <div class="v30-main"></div>
        <h3>سجل التحديات</h3><div class="v30-challenges"></div>
        <p class="v30-note">هذا السجل يجمع أداءك حسب نوع التحدي. بيانات الترتيب والمكافآت النهائية تعتمد على Firebase وقواعد الأمان.</p>
      </div>`;
      document.body.appendChild(o);o.querySelector('.v30-close').onclick=()=>o.classList.remove('open');
    }
    o.classList.add('open');render();
  }
  function mount(){
    if(document.getElementById('v30-open'))return;
    const b=document.createElement('button');b.id='v30-open';b.textContent='👤 ملفي';b.onclick=open;document.body.appendChild(b);
  }
  window.ZIVOZONE_V30={get,stats,record,open,render};
  window.addEventListener('zivozone-progress',e=>record(e.detail||{}));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();


/* ============================================================
   ZIVOZONE V31 — ACHIEVEMENTS / BADGES / SHAREABLE PLAYER CARD
   Additive layer. Existing systems remain untouched.
============================================================ */
(function(){
  'use strict';
  const KEY='zivozone_v31_achievements';
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return{}}};
  const write=v=>{try{localStorage.setItem(KEY,JSON.stringify(v))}catch(e){}};
  const p=()=>window.ZIVOZONE_V30?.get?.()||window.ZIVOZONE_V26?.profile?.()||{};
  const defs=[
    ['first_step','FIRST STEP','أول تحدي','🎯',s=>s.games>=1],
    ['speed','10 SECONDS','أجبت قبل انتهاء الوقت','⚡',s=>s.challengeStats&&Object.values(s.challengeStats).some(v=>v.games>0)],
    ['ten_games','TEN RUNS','10 ألعاب مكتملة','🔥',s=>s.games>=10],
    ['perfect','PERFECT RUN','نتيجة كاملة في تحدٍ','💎',s=>s.bestScore>=100],
    ['streak','STREAK','بنيت سلسلة لعب','🔗',s=>s.streak>=3],
    ['veteran','VETERAN','25 لعبة مكتملة','🏆',s=>s.games>=25],
    ['dark','DARK SURVIVOR','دخلت الغرفة المظلمة','🌑',s=>Object.keys(s.challengeStats||{}).some(k=>/horror|dark|رعب|مظلم/i.test(k))]
  ];
  function state(){
    const old=read(),s=p(),unlocked=old.unlocked||[];
    const now=defs.filter(d=>d[4](s)).map(d=>d[0]);
    now.forEach(id=>{if(!unlocked.includes(id))unlocked.push(id)});
    const out={unlocked,updatedAt:Date.now()};write(out);return out;
  }
  function card(){
    const s=p(),a=state(),o=document.getElementById('v31-achievements');if(!o)return;
    o.querySelector('.v31-count').textContent=`${a.unlocked.length}/${defs.length}`;
    o.querySelector('.v31-list').innerHTML=defs.map(d=>{
      const on=a.unlocked.includes(d[0]);
      return `<div class="v31-badge ${on?'on':'off'}"><i>${d[3]}</i><div><b>${d[1]}</b><span>${d[2]}</span></div><strong>${on?'✓':'?'}</strong></div>`;
    }).join('');
    o.querySelector('.v31-level').textContent=s.level||1;
  }
  function open(){
    let o=document.getElementById('v31-achievements');
    if(!o){
      o=document.createElement('div');o.id='v31-achievements';o.className='v31-overlay';
      o.innerHTML=`<div class="v31-card"><button class="v31-close">×</button>
       <div class="v31-head"><div class="v31-emblem">Z</div><div><small>ACHIEVEMENT SYSTEM</small><h2>إنجازات اللاعب</h2><span>المستوى <b class="v31-level">1</b> · <b class="v31-count">0/7</b></span></div></div>
       <div class="v31-list"></div>
       <button class="v31-share">شارك بطاقة اللاعب</button>
      </div>`;
      document.body.appendChild(o);
      o.querySelector('.v31-close').onclick=()=>o.classList.remove('open');
      o.querySelector('.v31-share').onclick=share;
    }
    o.classList.add('open');card();
  }
  async function share(){
    const s=p(),a=state();
    const text=`ZIVOZONE — ${s.name||'لاعب ZIVO'} | Level ${s.level||1} | XP ${s.xp||0} | ZIVO ${s.balance||0} | Best ${s.bestScore||0} | Achievements ${a.unlocked.length}/${defs.length}`;
    try{
      if(navigator.share){await navigator.share({title:'ZIVOZONE Player Card',text});return}
      await navigator.clipboard.writeText(text);
      alert('تم نسخ بطاقة اللاعب للمشاركة');
    }catch(e){}
  }
  function mount(){
    if(document.getElementById('v31-open'))return;
    const b=document.createElement('button');b.id='v31-open';b.textContent='🏅 إنجازاتي';b.onclick=open;document.body.appendChild(b);
  }
  window.ZIVOZONE_V31={state,open,share};
  window.addEventListener('zivozone-progress',()=>{state()});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();


/* ============================================================
   ZIVOZONE V32 — DAILY CHALLENGE CENTER
============================================================ */
(function(){
  'use strict';
  const KEY='zivozone_v32_daily';
  const today=()=>new Date().toISOString().slice(0,10);
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return{}}};
  const write=v=>{try{localStorage.setItem(KEY,JSON.stringify(v))}catch(e){}};
  function state(){const s=read(); return s.date===today()?s:{date:today(),played:false,challenge:null};}
  function pick(){
    const bank=window.ZIVOZONE_CHALLENGES||{};
    const keys=Object.keys(bank).filter(k=>bank[k]&&bank[k].questions&&!bank[k].special&&!/horror|dark/i.test(k));
    if(!keys.length)return 'iq';
    let n=0; for(const ch of today()) n=(n*31+ch.charCodeAt(0))>>>0;
    return keys[n%keys.length];
  }
  function open(){
    let o=document.getElementById('v32-daily');
    if(!o){
      o=document.createElement('div');o.id='v32-daily';o.className='v32-overlay';
      o.innerHTML=`<div class="v32-card"><button class="v32-close">×</button>
      <div class="v32-head"><div class="v32-mark">Z</div><div><small>DAILY COMPETITION</small><h2>تحدي اليوم</h2><span id="v32-date"></span></div></div>
      <div class="v32-hero"><b>تحدٍ جديد كل يوم</b><p>اختر التحدي اليومي، واجعل نتيجتك جزءًا من سجل ZIVOZONE.</p>
      <div class="v32-meta"><span id="v32-ch"></span><span id="v32-state"></span></div></div>
      <button id="v32-play">ابدأ تحدي اليوم</button>
      <div class="v32-rules"><span>⏱ 10 ثوانٍ لكل سؤال</span><span>🏆 سجّل أفضل نتيجة</span><span>🔥 ابنِ سلسلة لعب</span></div></div>`;
      document.body.appendChild(o);
      o.querySelector('.v32-close').onclick=()=>o.classList.remove('open');
      o.querySelector('#v32-play').onclick=()=>{
        const s=state(),ch=pick();s.played=true;s.challenge=ch;write(s);o.classList.remove('open');
        if(typeof window.startChallenge==='function') window.startChallenge(ch);
        else alert('محرك التحديات غير متاح حاليًا');
      };
    }
    const s=state(),ch=pick();
    o.querySelector('#v32-date').textContent=today();
    o.querySelector('#v32-ch').textContent='التحدي: '+ch;
    o.querySelector('#v32-state').textContent=s.played?'لعبته اليوم ✓':'لم تلعبه بعد';
    o.classList.add('open');
  }
  function mount(){
    if(document.getElementById('v32-open'))return;
    const b=document.createElement('button');b.id='v32-open';b.textContent='🔥 تحدي اليوم';b.onclick=open;document.body.appendChild(b);
  }
  window.ZIVOZONE_V32={open,state,challenge:pick};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();


/* ============================================================
   ZIVOZONE V33 — COMPETITION SEASON / STREAK / ZIVO REWARDS
   Additive layer. Existing Firebase and challenge engines remain.
============================================================ */
(function(){
  'use strict';
  const KEY='zivozone_v33_competition';
  const DAY=()=>new Date().toISOString().slice(0,10);
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return{}}};
  const write=v=>{try{localStorage.setItem(KEY,JSON.stringify(v))}catch(e){}};
  const prof=()=>window.ZIVOZONE_V30?.get?.()||window.ZIVOZONE_V26?.profile?.()||{};
  function isoYesterday(d){const x=new Date(d+'T00:00:00');x.setUTCDate(x.getUTCDate()-1);return x.toISOString().slice(0,10)}
  function state(){let s=read();if(s.date!==DAY())s={date:DAY(),completed:false,days:[],week:{},claimed:false};return s}
  function ensure(){
    const s=state(),p=prof(), yesterday=isoYesterday(DAY());
    s.days=Array.isArray(s.days)?s.days:[];
    if(s.date===DAY() && !s.completed)return s;
    if(s.completed)return s;
    s.streak=s.days.includes(yesterday)?(Number(s.streak)||0)+1:1;
    if(!s.days.includes(DAY()))s.days.push(DAY());
    s.days=s.days.slice(-30);
    s.week=s.week||{};
    const wk=DAY().slice(0,7);s.week[wk]=(Number(s.week[wk])||0)+1;
    s.completed=true;s.claimed=false;s.xpReward=25+Math.min((s.streak||1)*5,75);s.zivoReward=1+(s.streak>=7?4:0);
    write(s);return s;
  }
  function claim(){
    const s=state();if(!s.completed||s.claimed)return s;
    s.claimed=true;write(s);
    try{
      const p=prof();
      if(window.ZIVOZONE_V26?.addXP) window.ZIVOZONE_V26.addXP(s.xpReward);
      if(window.ZIVOZONE_V26?.addZIVO) window.ZIVOZONE_V26.addZIVO(s.zivoReward);
      window.dispatchEvent(new CustomEvent('zivozone-reward',{detail:{xp:s.xpReward,zivo:s.zivoReward,source:'daily'}}));
    }catch(e){}
    return s;
  }
  function open(){
    let o=document.getElementById('v33-competition');
    if(!o){
      o=document.createElement('div');o.id='v33-competition';o.className='v33-overlay';
      o.innerHTML=`<div class="v33-card"><button class="v33-close">×</button>
      <div class="v33-top"><div class="v33-orb">Z</div><div><small>COMPETITION SEASON</small><h2>ساحة المنافسة</h2><span>العودة كل يوم تصنع الفارق.</span></div></div>
      <div class="v33-grid"><div><small>STREAK</small><b id="v33-streak">0</b><span>يوم متواصل</span></div><div><small>XP REWARD</small><b id="v33-xp">25</b><span>عند إكمال اليوم</span></div><div><small>ZIVO</small><b id="v33-zivo">1</b><span>مكافأة اليوم</span></div></div>
      <div class="v33-progress"><div class="v33-bar"><i id="v33-fill"></i></div><span id="v33-week">0/7 أيام هذا الأسبوع</span></div>
      <div class="v33-message" id="v33-message"></div>
      <button id="v33-claim">استلام مكافأة اليوم</button>
      </div>`;
      document.body.appendChild(o);
      o.querySelector('.v33-close').onclick=()=>o.classList.remove('open');
      o.querySelector('#v33-claim').onclick=()=>{const s=claim();render(s);};
    }
    render();o.classList.add('open');
  }
  function render(s=state()){
    const o=document.getElementById('v33-competition');if(!o)return;
    const wk=(s.days||[]).filter(d=>d.slice(0,7)===DAY().slice(0,7)).length;
    o.querySelector('#v33-streak').textContent=s.streak||0;
    o.querySelector('#v33-xp').textContent=s.completed?s.xpReward||25:25;
    o.querySelector('#v33-zivo').textContent=s.completed?s.zivoReward||1:1;
    o.querySelector('#v33-fill').style.width=Math.min(100,wk/7*100)+'%';
    o.querySelector('#v33-week').textContent=`${wk}/7 أيام هذا الأسبوع`;
    o.querySelector('#v33-message').textContent=s.claimed?'تم استلام مكافأة اليوم ✓':s.completed?'أكملت تحدي اليوم. المكافأة بانتظارك.':'أكمل تحدي اليوم لتحافظ على سلسلة المنافسة.';
    const b=o.querySelector('#v33-claim');b.disabled=!s.completed||s.claimed;b.textContent=s.claimed?'تم الاستلام ✓':'استلام مكافأة اليوم';
  }
  function mount(){
    if(document.getElementById('v33-open'))return;
    const b=document.createElement('button');b.id='v33-open';b.textContent='🏆 المنافسة';b.onclick=open;document.body.appendChild(b);
  }
  window.ZIVOZONE_V33={state,complete:ensure,claim,open};
  window.addEventListener('zivozone-daily-complete',ensure);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();


/* ============================================================
   ZIVOZONE V34 — PLAYER MISSION / DAILY OBJECTIVES
   Additive layer. Existing V33 and Firebase layers preserved.
============================================================ */
(function(){
  'use strict';
  const KEY='zivozone_v34_missions';
  const DAY=()=>new Date().toISOString().slice(0,10);
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return{}}};
  const write=v=>{try{localStorage.setItem(KEY,JSON.stringify(v))}catch(e){}};
  const profile=()=>window.ZIVOZONE_V30?.get?.()||window.ZIVOZONE_V26?.profile?.()||{};
  function get(){
    const s=read();
    if(s.date!==DAY()) return {date:DAY(),items:{play:{goal:1,value:0},correct:{goal:5,value:0},speed:{goal:3,value:0}},claimed:{}};
    return s;
  }
  function progress(type,n=1){
    const s=get(),x=s.items[type]; if(!x||x.value>=x.goal)return s;
    x.value=Math.min(x.goal,x.value+n);write(s);render(s);return s;
  }
  function completeFromEvent(d){
    const total=Number(d.total)||0,correct=Number(d.correct)||0;
    progress('play',1); if(correct)progress('correct',correct);
    if(d.fast===true)progress('speed',1);
  }
  function claim(type){
    const s=get(); if(!s.items[type]||s.items[type].value<s.items[type].goal||s.claimed[type])return false;
    s.claimed[type]=true;write(s);
    const reward={play:{xp:10,zivo:1},correct:{xp:20,zivo:2},speed:{xp:15,zivo:2}}[type];
    try{
      if(window.ZIVOZONE_V26?.addXP)window.ZIVOZONE_V26.addXP(reward.xp);
      if(window.ZIVOZONE_V26?.addZIVO)window.ZIVOZONE_V26.addZIVO(reward.zivo);
      window.dispatchEvent(new CustomEvent('zivozone-reward',{detail:{...reward,source:'mission'}}));
    }catch(e){}
    render(s);return true;
  }
  function render(s=get()){
    const o=document.getElementById('v34-missions');if(!o)return;
    const labels={play:'أكمل تحديًا',correct:'أجب 5 إجابات صحيحة',speed:'أجب بسرعة'};
    const rewards={play:'10 XP · 1 ZIVO',correct:'20 XP · 2 ZIVO',speed:'15 XP · 2 ZIVO'};
    o.querySelector('.v34-list').innerHTML=Object.entries(s.items).map(([k,v])=>{
      const done=v.value>=v.goal,claimed=!!s.claimed[k];
      return `<div class="v34-mission"><div class="v34-icon">${k==='play'?'🎯':k==='correct'?'🧠':'⚡'}</div><div class="v34-copy"><b>${labels[k]}</b><span>${v.value}/${v.goal} · ${rewards[k]}</span><i><em style="width:${Math.min(100,v.value/v.goal*100)}%"></em></i></div><button data-claim="${k}" ${!done||claimed?'disabled':''}>${claimed?'✓': 'استلم'}</button></div>`;
    }).join('');
    o.querySelectorAll('[data-claim]').forEach(b=>b.onclick=()=>claim(b.dataset.claim));
  }
  function open(){
    let o=document.getElementById('v34-missions');
    if(!o){
      o=document.createElement('div');o.id='v34-missions';o.className='v34-overlay';
      o.innerHTML=`<div class="v34-card"><button class="v34-close">×</button><div class="v34-head"><div class="v34-mark">Z</div><div><small>PLAYER MISSIONS</small><h2>مهام اليوم</h2><span>أنجزها وارفع مستواك</span></div></div><div class="v34-list"></div><p>المهام اليومية تضيف أهدافًا قصيرة حتى يكون لكل دخول سبب جديد للعب.</p></div>`;
      document.body.appendChild(o);
      o.querySelector('.v34-close').onclick=()=>o.classList.remove('open');
    }
    render();o.classList.add('open');
  }
  function mount(){
    if(document.getElementById('v34-open'))return;
    const b=document.createElement('button');b.id='v34-open';b.textContent='🎯 مهامي';b.onclick=open;document.body.appendChild(b);
  }
  window.ZIVOZONE_V34={get,progress,claim,open};
  window.addEventListener('zivozone-progress',e=>completeFromEvent(e.detail||{}));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();


/* ============================================================
   ZIVOZONE V35 — PLAYER PROGRESS / LEVEL / DAILY STREAK
   Additive layer. Existing systems remain untouched.
============================================================ */
(function(){
  'use strict';
  const KEY='zivozone_v35_progress';
  const DAY=()=>new Date().toISOString().slice(0,10);
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return{}}};
  const write=v=>{try{localStorage.setItem(KEY,JSON.stringify(v))}catch(e){}};
  function state(){
    let s=read();
    if(!s.version)s={version:1,xp:0,level:1,played:0,correct:0,streak:0,lastDay:null,bestScore:0,history:[]};
    return s;
  }
  function levelFor(xp){return Math.max(1,Math.floor(Math.sqrt(Math.max(0,xp)/100))+1)}
  function add(xp,correct=0,score=0){
    const s=state(),d=DAY();
    if(s.lastDay!==d){
      const y=new Date(d+'T00:00:00');y.setUTCDate(y.getUTCDate()-1);
      const yd=y.toISOString().slice(0,10);
      s.streak=s.lastDay===yd?s.streak+1:1;s.lastDay=d;
    }
    s.xp=Math.max(0,s.xp+Math.max(0,Number(xp)||0));s.played++;s.correct+=Math.max(0,Number(correct)||0);
    s.bestScore=Math.max(Number(s.bestScore)||0,Number(score)||0);
    s.level=levelFor(s.xp);s.history=(s.history||[]).slice(-19);s.history.push({date:d,xp:s.xp,level:s.level});
    write(s);render(s);return s;
  }
  function render(s=state()){
    const o=document.getElementById('v35-progress');if(!o)return;
    const next=s.level*100,base=(s.level-1)*100,percent=Math.min(100,Math.max(0,(s.xp-base)/(next-base)*100));
    o.querySelector('[data-lvl]').textContent=s.level;
    o.querySelector('[data-xp]').textContent=s.xp+' XP';
    o.querySelector('[data-play]').textContent=s.played;
    o.querySelector('[data-streak]').textContent=s.streak||0;
    o.querySelector('[data-best]').textContent=s.bestScore||0;
    o.querySelector('[data-fill]').style.width=percent+'%';
    o.querySelector('[data-next]').textContent=`${Math.max(0,next-s.xp)} XP للمستوى التالي`;
  }
  function open(){
    let o=document.getElementById('v35-progress');
    if(!o){
      o=document.createElement('div');o.id='v35-progress';o.className='v35-overlay';
      o.innerHTML=`<div class="v35-card"><button class="v35-close">×</button>
      <div class="v35-head"><div class="v35-mark">Z</div><div><small>PLAYER PROGRESS</small><h2>مستوى اللاعب</h2><span>كل تحدٍ يترك أثرًا في رحلتك.</span></div></div>
      <div class="v35-level"><div><small>LEVEL</small><b data-lvl>1</b></div><div class="v35-xp"><span data-xp>0 XP</span><i><em data-fill></em></i><small data-next>100 XP للمستوى التالي</small></div></div>
      <div class="v35-stats"><div><b data-play>0</b><span>تحديات</span></div><div><b data-streak>0</b><span>Streak</span></div><div><b data-best>0</b><span>أفضل نتيجة</span></div></div>
      <div class="v35-note">استمر في اللعب بانتظام. المستوى هنا هو سجل تقدم اللاعب، بينما تبقى النتائج التنافسية قابلة للتحقق عبر الخدمة السحابية.</div>
      </div>`;
      document.body.appendChild(o);o.querySelector('.v35-close').onclick=()=>o.classList.remove('open');
    }
    render();o.classList.add('open');
  }
  function mount(){
    if(document.getElementById('v35-open'))return;
    const b=document.createElement('button');b.id='v35-open';b.textContent='📈 مستواي';b.onclick=open;document.body.appendChild(b);
  }
  window.ZIVOZONE_V35={state,add,open,levelFor};
  window.addEventListener('zivozone-result',e=>{const d=e.detail||{};add(d.xp||0,d.correct||0,d.score||0)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();


/* ============================================================
   ZIVOZONE V36 — SECURE CLOUD SYNC BRIDGE
   Additive bridge: preserves existing Firebase configuration.
   No Firebase initialization is duplicated here.
============================================================ */
(function(){
  'use strict';
  const KEY='zivozone_v36_cloud_queue';
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return[]}};
  const write=v=>{try{localStorage.setItem(KEY,JSON.stringify(v.slice(-50)))}catch(e){}};
  const uid=()=>{
    try{
      const u=window.firebase?.auth?.()?.currentUser;
      return u?.uid||null;
    }catch(e){return null}
  };
  const enqueue=(type,payload)=>{
    const q=read();q.push({id:'evt_'+Date.now()+'_'+Math.random().toString(36).slice(2),type,payload,uid:uid(),createdAt:new Date().toISOString()});write(q);
    window.dispatchEvent(new CustomEvent('zivozone-cloud-queued',{detail:{type}}));
    flush();return q[q.length-1];
  };
  async function flush(){
    const q=read();if(!q.length)return false;
    try{
      const db=window.firebase?.firestore?.();
      const user=window.firebase?.auth?.()?.currentUser;
      if(!db||!user)return false;
      const batch=db.batch();
      const ref=db.collection('users').doc(user.uid).collection('activity');
      q.forEach(e=>batch.set(ref.doc(e.id),{...e,serverSync:true},{merge:true}));
      await batch.commit();write([]);window.dispatchEvent(new CustomEvent('zivozone-cloud-synced'));return true;
    }catch(e){return false}
  }
  function syncResult(d){return enqueue('challenge_result',{score:Number(d.score)||0,correct:Number(d.correct)||0,total:Number(d.total)||0,xp:Number(d.xp)||0,challenge:String(d.challenge||'unknown').slice(0,80)})}
  window.ZIVOZONE_V36={enqueue,flush,syncResult,pending:()=>read().length};
  window.addEventListener('zivozone-result',e=>syncResult(e.detail||{}));
  window.addEventListener('online',flush);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',flush);else flush();
})();


(function(){
  function mount(){
    if(document.getElementById('v36-cloud'))return;
    const x=document.createElement('div');x.id='v36-cloud';x.innerHTML='<i class="v36-dot"></i><span>CLOUD</span>';document.body.appendChild(x);
    const dot=x.querySelector('.v36-dot');
    const set=on=>dot.classList.toggle('on',!!on);
    set(!!navigator.onLine);
    window.addEventListener('zivozone-cloud-synced',()=>set(true));
    window.addEventListener('offline',()=>set(false));
    window.addEventListener('online',()=>set(true));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();


/* ============================================================
   ZIVOZONE V37 — PLAYER HUB
   Unified player dashboard. Additive: prior systems preserved.
============================================================ */
(function(){
  'use strict';
  function get(key, fallback){
    try{const v=localStorage.getItem(key);return v?JSON.parse(v):fallback}catch(e){return fallback}
  }
  function progress(){
    const s=get('zivozone_v35_progress',{xp:0,level:1,played:0,correct:0,streak:0,bestScore:0});
    return s;
  }
  function missions(){
    const s=get('zivozone_v34_missions',{items:{}});
    return s.items||{};
  }
  function competition(){
    return get('zivozone_v33_competition',{streak:0,days:[]});
  }
  function profile(){
    try{
      if(window.ZIVOZONE_V30?.get)return window.ZIVOZONE_V30.get()||{};
      if(window.ZIVOZONE_V26?.profile)return window.ZIVOZONE_V26.profile()||{};
    }catch(e){}
    return {};
  }
  function open(){
    let o=document.getElementById('v37-hub');
    if(!o){
      o=document.createElement('div');o.id='v37-hub';o.className='v37-overlay';
      o.innerHTML=`<div class="v37-card"><button class="v37-close">×</button>
      <div class="v37-cover"><div class="v37-avatar">Z</div><div><small>PLAYER HUB</small><h2 id="v37-name">ZIVOZONE PLAYER</h2><span id="v37-sub">رحلتك، نتائجك، وتقدمك في مكان واحد</span></div><div class="v37-level">LV <b id="v37-level">1</b></div></div>
      <div class="v37-xp"><div><b id="v37-xp">0 XP</b><span>التقدم للمستوى التالي</span></div><i><em id="v37-fill"></em></i></div>
      <div class="v37-stats"><div><b id="v37-played">0</b><span>تحديات</span></div><div><b id="v37-correct">0</b><span>إجابات صحيحة</span></div><div><b id="v37-best">0</b><span>أفضل نتيجة</span></div><div><b id="v37-streak">0</b><span>Streak</span></div></div>
      <div class="v37-panels"><div><small>MISSIONS</small><strong id="v37-missions">0/0</strong><span>مهام مكتملة اليوم</span></div><div><small>COMPETITION</small><strong id="v37-days">0</strong><span>أيام المنافسة</span></div><div><small>CLOUD</small><strong id="v37-cloud">READY</strong><span>مزامنة النشاط</span></div></div>
      <div class="v37-actions"><button id="v37-challenge">🎯 تحدي اليوم</button><button id="v37-mission">📋 مهامي</button><button id="v37-compete">🏆 المنافسة</button></div>
      <div class="v37-note">هذه لوحة موحدة لرحلة اللاعب. البيانات التنافسية والعملات النهائية يجب أن تعتمد على التحقق السحابي.</div>
      </div>`;
      document.body.appendChild(o);
      o.querySelector('.v37-close').onclick=()=>o.classList.remove('open');
      o.querySelector('#v37-challenge').onclick=()=>window.ZIVOZONE_V32?.open?.();
      o.querySelector('#v37-mission').onclick=()=>window.ZIVOZONE_V34?.open?.();
      o.querySelector('#v37-compete').onclick=()=>window.ZIVOZONE_V33?.open?.();
    }
    render();o.classList.add('open');
  }
  function render(){
    const o=document.getElementById('v37-hub');if(!o)return;
    const p=progress(),m=missions(),co=competition(),pr=profile();
    const lvl=Number(p.level)||1,next=lvl*100,base=(lvl-1)*100;
    const percent=Math.min(100,Math.max(0,((Number(p.xp)||0)-base)/(next-base)*100));
    const done=Object.values(m).filter(x=>x&&x.value>=x.goal).length,total=Object.keys(m).length;
    o.querySelector('#v37-name').textContent=pr.name||pr.displayName||'ZIVOZONE PLAYER';
    o.querySelector('#v37-level').textContent=lvl;o.querySelector('#v37-xp').textContent=(p.xp||0)+' XP';
    o.querySelector('#v37-fill').style.width=percent+'%';o.querySelector('#v37-played').textContent=p.played||0;
    o.querySelector('#v37-correct').textContent=p.correct||0;o.querySelector('#v37-best').textContent=p.bestScore||0;
    o.querySelector('#v37-streak').textContent=p.streak||co.streak||0;o.querySelector('#v37-missions').textContent=`${done}/${total}`;
    o.querySelector('#v37-days').textContent=(co.days||[]).length;
    o.querySelector('#v37-cloud').textContent=navigator.onLine?'ONLINE':'OFFLINE';
  }
  function mount(){
    if(document.getElementById('v37-open'))return;
    const b=document.createElement('button');b.id='v37-open';b.textContent='👤 ملفي';b.onclick=open;document.body.appendChild(b);
    ['zivozone-result','zivozone-reward','zivozone-cloud-synced'].forEach(ev=>window.addEventListener(ev,render));
  }
  window.ZIVOZONE_V37={open,render};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();


/* ============================================================
   ZIVOZONE V38 — EXPERIENCE SHELL
   Unifies existing systems without replacing their engines.
============================================================ */
(function(){
  'use strict';
  const KEY='zivozone_v38_ui';
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return{}}};
  const write=v=>{try{localStorage.setItem(KEY,JSON.stringify(v))}catch(e){}};
  function open(){
    let o=document.getElementById('v38-shell');
    if(!o){
      o=document.createElement('div');o.id='v38-shell';o.className='v38-overlay';
      o.innerHTML=`<div class="v38-card"><button class="v38-close">×</button>
      <div class="v38-brand"><div class="v38-z">Z</div><div><small>ZIVOZONE</small><h2>مركز التجربة</h2><span>كل ما تحتاجه للعب والتطور في مكان واحد</span></div></div>
      <div class="v38-tiles">
        <button data-open="hub"><b>👤</b><strong>ملفي</strong><span>المستوى والتقدم</span></button>
        <button data-open="daily"><b>🔥</b><strong>تحدي اليوم</strong><span>تحدٍ متجدد</span></button>
        <button data-open="missions"><b>🎯</b><strong>مهامي</strong><span>أهداف اليوم</span></button>
        <button data-open="competition"><b>🏆</b><strong>المنافسة</strong><span>Streak ومكافآت</span></button>
      </div>
      <div class="v38-status"><span><i></i> Cloud</span><span id="v38-online">ONLINE</span><span id="v38-pending">SYNC</span></div>
      <div class="v38-note">الغرفة المظلمة والتحديات الأساسية تبقى مستقلة؛ هذا المركز يجمع الأنظمة المساندة فقط.</div>
      </div>`;
      document.body.appendChild(o);
      o.querySelector('.v38-close').onclick=()=>o.classList.remove('open');
      const map={hub:'ZIVOZONE_V37',daily:'ZIVOZONE_V32',missions:'ZIVOZONE_V34',competition:'ZIVOZONE_V33'};
      o.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{o.classList.remove('open');window[map[b.dataset.open]]?.open?.()});
    }
    render();o.classList.add('open');
  }
  function render(){
    const o=document.getElementById('v38-shell');if(!o)return;
    o.querySelector('#v38-online').textContent=navigator.onLine?'ONLINE':'OFFLINE';
    o.querySelector('#v38-pending').textContent=window.ZIVOZONE_V36?`${window.ZIVOZONE_V36.pending()} PENDING`:'SYNC';
    o.querySelector('.v38-status i').classList.toggle('on',navigator.onLine);
  }
  function mount(){
    if(document.getElementById('v38-open'))return;
    const b=document.createElement('button');b.id='v38-open';b.textContent='✦ مركز ZIVOZONE';b.onclick=open;document.body.appendChild(b);
    ['zivozone-result','zivozone-reward','zivozone-cloud-synced','online','offline'].forEach(e=>window.addEventListener(e,render));
  }
  window.ZIVOZONE_V38={open,render};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();


/* ============================================================
   ZIVOZONE V39 — CHALLENGE COMMAND CENTER
   Additive discovery layer. Existing challenge engines preserved.
============================================================ */
(function(){
  'use strict';
  const norm=s=>String(s||'').toLowerCase().replace(/[\s_-]+/g,'');
  const getChallenges=()=>{
    try{
      const b=window.ZIVOZONE_CHALLENGES;
      if(!b)return[];
      return Object.keys(b).filter(k=>b[k]&&Array.isArray(b[k].questions)&&!b[k].special)
        .map(k=>({id:k,title:b[k].title||b[k].name||k,description:b[k].description||'',questions:b[k].questions.length}));
    }catch(e){return[]}
  };
  const icon=id=>{
    const n=norm(id);
    if(n.includes('iq')||n.includes('logic'))return'🧠';
    if(n.includes('memory'))return'🧩';
    if(n.includes('speed'))return'⚡';
    if(n.includes('football')||n.includes('sport'))return'⚽';
    if(n.includes('personality')||n.includes('whoami')||n.includes('me'))return'🪞';
    if(n.includes('math'))return'🔢';
    if(n.includes('language'))return'🔤';
    return'🎯';
  };
  function start(id){
    const b=window.ZIVOZONE_CHALLENGES;
    if(!b||!b[id])return false;
    try{
      if(typeof window.startChallenge==='function'){window.startChallenge(id);return true}
      if(typeof window.ZIVOZONE_START_CHALLENGE==='function'){window.ZIVOZONE_START_CHALLENGE(id);return true}
    }catch(e){}
    return false;
  }
  function open(){
    let o=document.getElementById('v39-center');
    if(!o){
      o=document.createElement('div');o.id='v39-center';o.className='v39-overlay';
      o.innerHTML=`<div class="v39-card"><button class="v39-close">×</button>
      <div class="v39-title"><div class="v39-orbit">Z</div><div><small>CHALLENGE COMMAND CENTER</small><h2>مركز التحديات</h2><span>اختر اختبارك وابدأ رحلتك</span></div></div>
      <div class="v39-filter"><input id="v39-search" placeholder="ابحث عن تحدٍ..."><span id="v39-count">0 تحديات</span></div>
      <div id="v39-grid"></div>
      <div class="v39-foot">الغرفة المظلمة تبقى تجربة مستقلة ولا تُعامل كتحدٍ عادي.</div>
      </div>`;
      document.body.appendChild(o);
      o.querySelector('.v39-close').onclick=()=>o.classList.remove('open');
      o.querySelector('#v39-search').oninput=render;
    }
    render();o.classList.add('open');
  }
  function render(){
    const o=document.getElementById('v39-center');if(!o)return;
    const q=(o.querySelector('#v39-search').value||'').trim().toLowerCase();
    const all=getChallenges(),list=all.filter(x=>(x.title+' '+x.description+' '+x.id).toLowerCase().includes(q));
    o.querySelector('#v39-count').textContent=`${list.length} تحديات`;
    const grid=o.querySelector('#v39-grid');grid.innerHTML='';
    if(!list.length){grid.innerHTML='<div class="v39-empty">لا توجد نتائج بهذا الاسم.</div>';return}
    list.forEach(x=>{
      const el=document.createElement('button');el.className='v39-item';
      el.innerHTML=`<b>${icon(x.id)}</b><strong>${x.title}</strong><span>${x.questions} سؤال</span><em>ابدأ ←</em>`;
      el.onclick=()=>{if(start(x.id))o.classList.remove('open')};
      grid.appendChild(el);
    });
  }
  function mount(){
    if(document.getElementById('v39-open'))return;
    const b=document.createElement('button');b.id='v39-open';b.textContent='🎮 مركز التحديات';b.onclick=open;document.body.appendChild(b);
  }
  window.ZIVOZONE_V39={open,render,getChallenges,start};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();


/* ============================================================
   ZIVOZONE V40 — RESULT NORMALIZER
============================================================ */
(function(){
  'use strict';
  window.addEventListener('zivozone-result',function(e){
    const d=e.detail||{};
    const payload={
      challenge:d.challenge||d.gameId||d.id||'unknown',
      score:Number(d.score)||0,
      correct:Number(d.correct)||0,
      total:Number(d.total)||0,
      xp:Number(d.xp)||Math.max(0,(Number(d.correct)||0)*10)
    };
    if(window.ZIVOZONE_V35?.add && !d.__v40processed){
      window.ZIVOZONE_V35.add(payload.xp,payload.correct,payload.score);
    }
    if(window.ZIVOZONE_V36?.syncResult && !d.__v40processed){
      window.ZIVOZONE_V36.syncResult(payload);
    }
  });
})();


/* ============================================================
   ZIVOZONE V41 — UI DEDUPLICATION + SMART QUESTION ROTATION
============================================================ */
(function(){
  'use strict';

  const LAUNCHERS=[
    {id:'v37-open',text:'👤 ملفي'},
    {id:'v38-open',text:'✦ مركز ZIVOZONE'},
    {id:'v39-open',text:'🎮 مركز التحديات'}
  ];

  function dedupe(){
    const seen={};
    LAUNCHERS.forEach(x=>{
      const nodes=[...document.querySelectorAll('#'+x.id)];
      nodes.forEach((n,i)=>{
        if(i>0)n.remove();
      });
      const labels=[...document.querySelectorAll('button')].filter(b=>
        b!==document.getElementById(x.id) &&
        (b.textContent||'').trim()===x.text
      );
      labels.forEach(b=>b.remove());
    });
  }

  /* Player-specific question rotation:
     keeps a local history and avoids repeats when the same pack is replayed.
     It does not replace the existing challenge engine or alter its answers.
  */
  const HIST='zivozone_v41_question_history';
  function read(){
    try{return JSON.parse(localStorage.getItem(HIST)||'{}')}catch(e){return{}}
  }
  function save(v){
    try{localStorage.setItem(HIST,JSON.stringify(v))}catch(e){}
  }
  function shuffled(ids){
    return ids.map((v,i)=>[Math.random(),v]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
  }
  function prepareBank(){
    const bank=window.ZIVOZONE_CHALLENGES;
    if(!bank)return;
    Object.keys(bank).forEach(id=>{
      const item=bank[id];
      if(!item||!Array.isArray(item.questions)||item.special)return;
      if(item._v41Prepared)return;
      const original=item.questions.slice();
      Object.defineProperty(item,'_v41Original',{value:original,writable:false,configurable:false});
      item._v41Prepared=true;
      item._v41HistoryKey='pack:'+id;
    });
  }
  function rotate(id){
    const bank=window.ZIVOZONE_CHALLENGES;
    if(!bank||!bank[id]||!Array.isArray(bank[id].questions))return;
    const item=bank[id], original=item._v41Original||item.questions.slice();
    const hist=read(), key='pack:'+id, used=Array.isArray(hist[key])?hist[key]:[];
    const indices=original.map((_,i)=>i);
    let fresh=indices.filter(i=>!used.includes(i));
    if(!fresh.length){fresh=indices;hist[key]=[]}
    fresh=shuffled(fresh);
    item.questions=fresh.map(i=>original[i]);
    hist[key]=fresh.slice(0,Math.min(used.length+fresh.length,original.length));
    if(hist[key].length>=original.length)hist[key]=fresh.slice();
    save(hist);
  }

  function install(){
    dedupe();
    prepareBank();
    window.ZIVOZONE_V41={
      dedupe,
      rotate,
      resetHistory:function(){try{localStorage.removeItem(HIST)}catch(e){}},
      historyKey:HIST
    };
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',install);
  }else install();

  window.addEventListener('zivozone-challenge-open',function(e){
    if(e&&e.detail&&e.detail.id)rotate(e.detail.id);
  });
})();


/* ============================================================
   ZIVOZONE V42 — CLOUD QUESTION HISTORY + CLEAN NAV
   Additive compatibility layer; never replaces Firebase/Auth.
============================================================ */
(function(){
  'use strict';

  const LOCAL='zivozone_v41_question_history';
  const CLOUD='zivozone_question_history_v42';

  function localRead(){
    try{return JSON.parse(localStorage.getItem(LOCAL)||'{}')}catch(e){return{}}
  }
  function localWrite(v){
    try{localStorage.setItem(LOCAL,JSON.stringify(v))}catch(e){}
  }

  function getUser(){
    try{
      const u=window.ZIVOZONE_AUTH?.getCurrentUser?.();
      if(u) return u;
    }catch(e){}
    try{
      return window.firebase?.auth?.().currentUser||null;
    }catch(e){}
    return null;
  }

  async function cloudRead(){
    const u=getUser();
    if(!u)return null;
    try{
      const db=window.firebase?.firestore?.();
      if(db){
        const snap=await db.collection('users').doc(u.uid).collection('zivozone').doc('questionHistory').get();
        return snap.exists ? (snap.data()?.history||{}) : null;
      }
    }catch(e){}
    return null;
  }

  async function cloudWrite(history){
    const u=getUser();
    if(!u)return false;
    try{
      const db=window.firebase?.firestore?.();
      if(db){
        await db.collection('users').doc(u.uid).collection('zivozone').doc('questionHistory')
          .set({history,updatedAt:new Date().toISOString()},{merge:true});
        return true;
      }
    }catch(e){}
    return false;
  }

  async function sync(){
    const cloud=await cloudRead();
    if(cloud){
      const local=localRead();
      localWrite(Object.assign({},local,cloud));
      return cloud;
    }
    return localRead();
  }

  async function record(pack,index){
    const h=localRead(), key='pack:'+pack;
    const arr=Array.isArray(h[key])?h[key]:[];
    if(!arr.includes(index))arr.push(index);
    h[key]=arr;
    localWrite(h);
    await cloudWrite(h);
    return h;
  }

  async function clear(){
    localWrite({});
    const u=getUser();
    try{
      const db=window.firebase?.firestore?.();
      if(u&&db) await db.collection('users').doc(u.uid).collection('zivozone').doc('questionHistory').set({history:{},updatedAt:new Date().toISOString()});
    }catch(e){}
  }

  function expose(){
    window.ZIVOZONE_V42={sync,record,clear,getUser};
  }

  /* Prevent accidental duplicate launchers from previous additive releases. */
  function clean(){
    const selectors=['#v37-open','#v38-open','#v39-open'];
    selectors.forEach(sel=>{
      const nodes=[...document.querySelectorAll(sel)];
      nodes.slice(1).forEach(n=>n.remove());
    });
  }

  expose();
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>{clean();sync()});
  }else{clean();sync()}

  window.addEventListener('online',()=>sync());
})();


/* ============================================================
   ZIVOZONE V43 — REAL CLOUD CORE
   Firebase/Firestore health + authenticated player sync.
   Additive: uses the existing Firebase app and Auth.
============================================================ */
(function(){
  'use strict';

  const COLLECTION='players';
  const HISTORY_DOC='questionHistory';
  const QUEUE='zivozone_v43_cloud_queue';

  const user=()=>{try{return window.firebase?.auth?.()?.currentUser||null}catch(e){return null}};
  const db=()=>{try{return window.firebase?.firestore?.()||null}catch(e){return null}};
  const isCloudReady=()=>!!(user()&&db());

  function queueRead(){try{return JSON.parse(localStorage.getItem(QUEUE)||'[]')}catch(e){return[]}}
  function queueWrite(v){try{localStorage.setItem(QUEUE,JSON.stringify(v.slice(-50)))}catch(e){}}

  async function health(){
    const u=user(), d=db();
    if(!u||!d)return {connected:false,authenticated:!!u,reason:u?'firestore-unavailable':'not-authenticated'};
    try{
      await d.collection(COLLECTION).doc(u.uid).get();
      return {connected:true,authenticated:true,uid:u.uid};
    }catch(e){
      return {connected:false,authenticated:true,uid:u.uid,reason:e.code||'firestore-error'};
    }
  }

  async function saveChallengeResult(result){
    const u=user(), d=db();
    const payload={
      challengeId:String(result?.challengeId||result?.id||'challenge').slice(0,80),
      score:Number(result?.score)||0,
      total:Number(result?.total)||0,
      correct:Number(result?.correct)||0,
      xp:Number(result?.xp)||0,
      coins:Number(result?.coins)||0,
      pressureScore:Number(result?.pressureScore)||0,
      timedOut:Number(result?.timedOut)||0,
      at:new Date().toISOString()
    };
    if(!u||!d){
      const q=queueRead();q.push({type:'result',payload});queueWrite(q);
      return {saved:false,queued:true};
    }
    try{
      await d.collection(COLLECTION).doc(u.uid).collection('results').add({
        ...payload,
        createdAt:firebase.firestore.FieldValue.serverTimestamp()
      });
      return {saved:true,queued:false};
    }catch(e){
      const q=queueRead();q.push({type:'result',payload});queueWrite(q);
      return {saved:false,queued:true,error:e.code||'save-failed'};
    }
  }

  async function saveQuestionHistory(history){
    const u=user(), d=db();
    if(!u||!d)return {saved:false,queued:false};
    try{
      await d.collection(COLLECTION).doc(u.uid).collection('zivozone').doc(HISTORY_DOC).set({
        history:history||{},
        updatedAt:firebase.firestore.FieldValue.serverTimestamp()
      },{merge:true});
      return {saved:true};
    }catch(e){
      return {saved:false,error:e.code||'history-save-failed'};
    }
  }

  async function flushQueue(){
    const u=user(), d=db();
    if(!u||!d)return {flushed:0};
    const q=queueRead();if(!q.length)return {flushed:0};
    const remaining=[];let flushed=0;
    for(const item of q){
      try{
        if(item.type==='result'){
          await d.collection(COLLECTION).doc(u.uid).collection('results').add({
            ...item.payload,
            createdAt:firebase.firestore.FieldValue.serverTimestamp()
          });
          flushed++;
        }else remaining.push(item);
      }catch(e){remaining.push(item)}
    }
    queueWrite(remaining);
    if(flushed)window.dispatchEvent(new CustomEvent('zivozone-cloud-synced',{detail:{flushed}}));
    return {flushed,remaining:remaining.length};
  }

  async function init(){
    const h=await health();
    window.dispatchEvent(new CustomEvent('zivozone-cloud-health',{detail:h}));
    if(h.connected)await flushQueue();
    return h;
  }

  window.ZIVOZONE_V43={health,saveChallengeResult,saveQuestionHistory,flushQueue,init,isCloudReady};
  window.addEventListener('online',()=>flushQueue());

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,700));
  else setTimeout(init,700);
})();


/* ============================================================
   V43 — REAL CLOUD STATUS
============================================================ */
(function(){
  'use strict';
  function mount(){
    if(document.getElementById('v43-cloud'))return;
    const el=document.createElement('div');
    el.id='v43-cloud';
    el.innerHTML='<span class="v43-dot"></span><span class="v43-text">Cloud: checking…</span>';
    document.body.appendChild(el);
    const render=e=>{
      const d=e?.detail||{};
      const ok=!!d.connected;
      el.classList.toggle('ok',ok);
      el.querySelector('.v43-text').textContent=ok?'Cloud: connected':(d.authenticated?'Cloud: offline':'Guest / local');
    };
    window.addEventListener('zivozone-cloud-health',render);
    window.addEventListener('zivozone-cloud-synced',()=>{el.classList.add('ok');el.querySelector('.v43-text').textContent='Cloud: synced'});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();


/* ============================================================
   ZIVOZONE V44 — HOMEPAGE COMMAND LAYER
   Pre-publication UX hardening. Additive only.
============================================================ */
(function(){
  'use strict';

  const NAV_IDS=['v37-open','v38-open','v39-open'];
  const state={busy:false};

  function removeDuplicateIds(){
    NAV_IDS.forEach(id=>{
      const nodes=[...document.querySelectorAll('#'+CSS.escape(id))];
      nodes.slice(1).forEach(n=>n.remove());
    });
  }

  function repairButtons(){
    removeDuplicateIds();
    document.querySelectorAll('button').forEach(btn=>{
      if(btn.dataset.v44Bound)return;
      btn.dataset.v44Bound='1';
      btn.addEventListener('click',()=>{
        btn.classList.add('v44-click');
        setTimeout(()=>btn.classList.remove('v44-click'),180);
      },{passive:true});
    });
  }

  function openHome(){
    const home=document.querySelector('[data-page="home"], #home, .home-page, .page-home');
    if(home) home.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function showCloud(){
    const cloud=document.getElementById('v43-cloud');
    if(cloud) cloud.classList.add('v44-visible');
  }

  function boot(){
    repairButtons();
    showCloud();
    document.documentElement.classList.add('zivo-v44-ready');
  }

  window.ZIVOZONE_V44={
    audit:{
      duplicateLauncherIds:NAV_IDS.filter(id=>document.querySelectorAll('#'+CSS.escape(id)).length>1),
      buttonCount:document.querySelectorAll('button').length,
      scriptCount:document.scripts.length
    },
    repairButtons,
    openHome,
    state
  };

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,50));
  }else setTimeout(boot,50);

  new MutationObserver(()=>repairButtons()).observe(document.documentElement,{subtree:true,childList:true});
})();


/* ============================================================
   ZIVOZONE V45 — PRODUCTION SCORE GATE
   Server-authoritative-ready bridge. Existing Firebase app is reused.
   No second Firebase app. No replacement of existing challenge engine.
============================================================ */
(function(){
  'use strict';
  const ENDPOINT_KEY='zivozone_v45_endpoint';
  const QUEUE_KEY='zivozone_v45_pending';

  function user(){
    try{return window.firebase?.auth?.()?.currentUser||null}catch(e){return null}
  }
  function queueRead(){try{return JSON.parse(localStorage.getItem(QUEUE_KEY)||'[]')}catch(e){return[]}}
  function queueWrite(q){try{localStorage.setItem(QUEUE_KEY,JSON.stringify(q.slice(-25)))}catch(e){}}

  function sanitize(x){
    x=x||{};
    return {
      challengeId:String(x.challengeId||x.id||'challenge').slice(0,80),
      attemptId:String(x.attemptId||crypto?.randomUUID?.()||Date.now()+'-'+Math.random()).slice(0,100),
      answers:Array.isArray(x.answers)?x.answers.slice(0,100).map(v=>String(v).slice(0,200)):[],
      total:Math.max(0,Math.min(100,Number(x.total)||0)),
      clientScore:Math.max(0,Math.min(10000,Number(x.score)||0)),
      clientCorrect:Math.max(0,Math.min(100,Number(x.correct)||0)),
      durationMs:Math.max(0,Math.min(3600000,Number(x.durationMs)||0))
    };
  }

  async function submit(attempt){
    const payload=sanitize(attempt);
    const u=user();
    if(!u){
      const q=queueRead();q.push({payload,queuedAt:Date.now()});queueWrite(q);
      return {accepted:false,queued:true,reason:'not-authenticated'};
    }

    const endpoint=localStorage.getItem(ENDPOINT_KEY)||window.ZIVOZONE_CONFIG?.scoreEndpoint||'';
    if(endpoint){
      try{
        const token=await u.getIdToken();
        const res=await fetch(endpoint,{
          method:'POST',
          headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
          body:JSON.stringify(payload)
        });
        if(!res.ok)throw new Error('HTTP '+res.status);
        const data=await res.json().catch(()=>({}));
        return {accepted:true,server:true,data};
      }catch(e){
        const q=queueRead();q.push({payload,queuedAt:Date.now()});queueWrite(q);
        return {accepted:false,queued:true,reason:e.message||'endpoint-failed'};
      }
    }

    /* Safe fallback: record raw attempt for the existing authenticated
       player; reward values are deliberately NOT minted here. */
    try{
      const db=window.firebase?.firestore?.();
      await db.collection('players').doc(u.uid).collection('attempts').doc(payload.attemptId).set({
        ...payload,
        submittedAt:firebase.firestore.FieldValue.serverTimestamp(),
        status:'pending-server-validation'
      });
      return {accepted:true,server:false,pendingValidation:true};
    }catch(e){
      const q=queueRead();q.push({payload,queuedAt:Date.now()});queueWrite(q);
      return {accepted:false,queued:true,reason:e.code||'cloud-failed'};
    }
  }

  async function flush(){
    const u=user(); if(!u)return {flushed:0};
    const q=queueRead(); if(!q.length)return {flushed:0};
    let done=0,keep=[];
    for(const item of q){
      const result=await submit(item.payload);
      if(result.accepted)done++; else keep.push(item);
    }
    queueWrite(keep);
    return {flushed:done,remaining:keep.length};
  }

  window.ZIVOZONE_V45={submit,flush,configureEndpoint:function(url){
    if(url)localStorage.setItem(ENDPOINT_KEY,String(url));
    else localStorage.removeItem(ENDPOINT_KEY);
  }};

  window.addEventListener('online',()=>flush());
})();


/* ============================================================
   ZIVOZONE V46 — SERVER ENGINE ADAPTER
   Browser = attempt sender only.
   Trusted backend = score/reward authority.
============================================================ */
(function(){
  'use strict';

  const FN_NAME='submitChallengeAttempt';
  const LOCAL_QUEUE='zivozone_v46_attempt_queue';

  function authUser(){
    try{return window.firebase?.auth?.()?.currentUser||null}catch(e){return null}
  }
  function functions(){
    try{return window.firebase?.functions?.()||null}catch(e){return null}
  }
  function readQ(){try{return JSON.parse(localStorage.getItem(LOCAL_QUEUE)||'[]')}catch(e){return[]}}
  function writeQ(q){try{localStorage.setItem(LOCAL_QUEUE,JSON.stringify(q.slice(-20)))}catch(e){}}

  function cleanAttempt(x){
    x=x||{};
    return {
      challengeId:String(x.challengeId||x.id||'challenge').slice(0,80),
      attemptId:String(x.attemptId||((crypto?.randomUUID?.())||Date.now()+'-'+Math.random())).slice(0,100),
      answers:Array.isArray(x.answers)?x.answers.slice(0,100).map(v=>String(v).slice(0,200)):[],
      total:Math.max(0,Math.min(100,Number(x.total)||0)),
      startedAt:String(x.startedAt||'').slice(0,40),
      submittedAt:new Date().toISOString()
    };
  }

  async function submit(attempt){
    const u=authUser();
    const payload=cleanAttempt(attempt);
    if(!u){
      const q=readQ();q.push(payload);writeQ(q);
      return {accepted:false,queued:true,reason:'not-authenticated'};
    }

    const fn=functions();
    if(fn){
      try{
        const callable=fn.httpsCallable(FN_NAME);
        const res=await callable(payload);
        return {accepted:true,server:true,data:res?.data||{}};
      }catch(e){
        /* If the function is not deployed yet, do not fabricate a score. */
        if(e?.code==='functions/not-found'||e?.code==='functions/unavailable'||e?.code==='functions/internal'){
          const q=readQ();q.push(payload);writeQ(q);
          return {accepted:false,queued:true,reason:e.code};
        }
        return {accepted:false,queued:false,reason:e?.code||'server-rejected'};
      }
    }

    const endpoint=window.ZIVOZONE_CONFIG?.scoreEndpoint||'';
    if(endpoint){
      try{
        const token=await u.getIdToken();
        const res=await fetch(endpoint,{
          method:'POST',
          headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
          body:JSON.stringify(payload)
        });
        if(!res.ok)throw new Error('HTTP '+res.status);
        return {accepted:true,server:true,data:await res.json().catch(()=>({}))};
      }catch(e){
        const q=readQ();q.push(payload);writeQ(q);
        return {accepted:false,queued:true,reason:e.message||'endpoint-failed'};
      }
    }

    return {accepted:false,queued:true,reason:'server-not-configured'};
  }

  async function flush(){
    const u=authUser();if(!u)return {flushed:0};
    const q=readQ();if(!q.length)return {flushed:0};
    const keep=[];let done=0;
    for(const item of q){
      const res=await submit(item);
      if(res.accepted)done++;else keep.push(item);
    }
    writeQ(keep);
    return {flushed:done,remaining:keep.length};
  }

  window.ZIVOZONE_V46={submit,flush,pending:()=>readQ().length};
  window.addEventListener('online',()=>flush());
})();
