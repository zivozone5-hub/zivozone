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
  const QUESTION_TIME=10;
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
  function renderQuestion(){const src=C.get(game.id);if(game.id==='horror'&&game.index>=game.questions.length){game.horrorUsed=[];game.questions=shuffle(src.questions.map(q=>({...q})));}const q=currentQ();if(!q){finishGame();return}S().question?.(q.d,game.id);if(game.id==='horror'){horrorNarrate();if(game.index===10)S().phase?.(2);if(game.index===20)S().phase?.(3);if(game.index>0&&game.index%5===0)S().horrorPulse?.(Math.min(4,1+Math.floor(game.index/5)));if(game.index===6)S().warden?.()}const phase=game.id==='horror'?` phase-${game.index<10?1:game.index<20?2:3}`:'';const progress=game.id==='horror'?((game.index%10)/10)*100:Math.round(game.index/game.questions.length*100);const body=q.type==='choice'?choiceMarkup(q):inputMarkup(q);const warden=game.id==='horror'&&game.index>=6?`<div class="warden">${t('warden')}</div>`:'';const footer=game.id==='horror'?`<span class="horror-status">${t('horrorQuestion')} ${game.index+1}</span>`:`<span>${game.score} ${t('correct')}</span><span class="pressure-hud">⚡ ${t('pressure')}: <b>${game.pressureScore}</b> · 🔥 ${t('streak')}: <b>${game.streak}</b></span>`;const horrorPlayer=game.id==='horror'?`<div class="horror-audio-player"><button type="button" id="horror-audio-toggle" class="btn btn-small btn-ghost">🔊 ${t('horrorAudio')}</button><input id="horror-volume" type="range" min="0" max="1" step="0.01" value="${S().volume?.()||.9}" aria-label="${t('horrorVolume')}"></div>`:'';openModal(`<button class="modal-close" data-action="quit-game" aria-label="Close">×</button><div class="game-head"><span class="eyebrow">${esc(loc(src.title))}</span><strong>${game.id==='horror'?game.index+1:`${game.index+1} / ${game.questions.length}`}</strong></div><div id="question-timer" class="question-timer" role="timer" aria-live="polite"><span class="timer-label">${esc(t('timeLeft'))}</span><strong id="question-timer-number">10</strong><div class="question-timer-track"><span id="question-timer-fill"></span></div></div><div class="question-progress"><span style="width:${progress}%"></span></div>${warden}<h2>${esc(loc(q.q))}</h2><div class="difficulty">${t('difficulty')} ${q.d}/10</div>${body}${horrorPlayer}<div class="game-footer">${footer}<button class="btn btn-small btn-ghost" data-action="quit-game">${t('exit')}</button></div>`,game.id==='horror'?`horror-modal${phase}`:'');if(q.type==='choice')$$('.answer').forEach(b=>b.onclick=()=>{S().click?.();answerChoice(Number(b.dataset.i))});else $('#answer-form').onsubmit=e=>{e.preventDefault();S().click?.();answerInput($('#answer-input').value)};$('#modal-root [data-action="quit-game"]').onclick=quitGame;if(game.id==='horror'){$('#horror-audio-toggle')?.addEventListener('click',async()=>{await S().unlock?.();S().toggle?.();$('#horror-audio-toggle').textContent=(S().isEnabled?.()?'🔊 ':'🔇 ')+t('horrorAudio')});$('#horror-volume')?.addEventListener('input',e=>S().setVolume?.(e.target.value));}startQuestionTimer();}
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
  async function finishGame(){clearQuestionTimer();clearIdentityTimer();S().stopChallenge?.();document.body.classList.remove('horror-active');S().success?.();const src=C.get(game.id),score=game.score,total=game.questions.length,pressure=Math.min(100,Math.round(game.pressureScore/Math.max(1,total))),performance=Math.min(100,Math.round((score/Math.max(1,total))*75+pressure*.25)),xp=Math.max(10,Math.round(performance/100*src.xp)),coins=Math.max(1,Math.ceil((score+Math.min(10,Math.floor(game.pressureScore/100)))/2)),win=score>=Math.ceil(total*.5);await reward(xp,coins,win);state.bestStreak=Math.max(Number(state.bestStreak)||0,game.bestStreak||0);saveState();if(A.isLoggedIn())await A.update({bestStreak:state.bestStreak});profile();if(game.id==='daily')localStorage.setItem('zivo_daily_'+new Date().toISOString().slice(0,10),'1');await A.saveResult({challengeId:game.id,score,total,xp,coins,pressureScore:game.pressureScore,bestStreak:game.bestStreak,timedOut:game.timedOut,guest:game.guest,language:lang()});openModal(`<button class="modal-close" data-close>×</button><span class="eyebrow">${t('result')}</span><h2>${win?t('excellent'):t('roundEnded')}</h2><p>${t('score')}: <strong>${score}/${total}</strong></p><p>⚡ ${t('pressure')}: <strong>${game.pressureScore}</strong> &nbsp; 🔥 ${t('bestStreak')}: <strong>${game.bestStreak}</strong></p><p>+${xp} XP &nbsp; +${coins} 🪙 ZIVO</p>${game.guest?`<div class="save-call"><strong>${t('guestSave')}</strong></div>`:''}<div class="modal-actions"><button class="btn btn-primary" id="again">${t('again')}</button>${game.guest?`<button class="btn btn-ghost" id="register-result">${t('saveProgress')}</button>`:''}<button class="btn btn-ghost" data-action="return-challenges">${t('close')}</button></div>`);$('#again').onclick=()=>{closeModal();startGame(game.id)};$('#register-result')?.addEventListener('click',()=>authModal(()=>{toast(t('success'),'success');profile()}))}
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
  function bind(){const audioBtn=$('#audio-toggle');if(audioBtn){audioBtn.textContent=S().isEnabled?.()?'🔊':'🔇';audioBtn.onclick=async()=>{await S().unlock?.();S().toggle?.();audioBtn.textContent=S().isEnabled?.()?'🔊':'🔇'}}$('#language-select').value=lang();$('#language-select').onchange=async e=>{I.set(e.target.value);await A.setLanguage(e.target.value);applyLanguage();toast(t('updateDone'),'success')};$('#login-btn').onclick=()=>A.isLoggedIn()?location.hash='#profile':authModal();$$('[data-action="login"]').forEach(b=>b.onclick=()=>A.isLoggedIn()?location.hash='#profile':authModal());$('#ai-form').onsubmit=async e=>{e.preventDefault();const input=$('#ai-input'),v=input.value.trim();if(!v)return;const box=$('#ai-messages');const u=document.createElement('div');u.className='ai-message user';u.textContent=v;box.append(u);input.value='';const b=document.createElement('div');b.className='ai-message bot';b.textContent='…';box.append(b);b.textContent=await askAI(v);box.scrollTop=box.scrollHeight}}
  window.addEventListener('zivozone-auth',e=>{syncFromPlayer();profile();const el=$('#firebase-status');if(el){el.textContent=e.detail?.cloud?'●':'○';el.classList.toggle('online',!!e.detail?.cloud);el.title=e.detail?.cloud?'Firebase connected':'Guest/local mode'}});
  window.addEventListener('zivozone-language',()=>{const sel=$('#language-select');if(sel)sel.value=lang()});
  loadState();document.addEventListener('DOMContentLoaded',()=>{bind();applyLanguage();setTimeout(()=>$('#app-loader')?.classList.add('hidden'),650)});
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
    document.addEventListener('click',e=>{
      if(!state.active)return;
      const t=e.target.closest('button,[role="button"],.option,.answer-option');
      if(t && !t.classList.contains('z19-exit')) setTimeout(next,120);
    },true);
  }
  window.ZIVOZONE_DARKROOM_V19={start,stop,next,isActive:()=>state.active,whisper,update};
  ensureUI(); bindChallengeEvents();
})();
