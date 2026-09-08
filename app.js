/* ============================================================
   ZIVOZONE APP ENGINE
   Guest play + Firebase persistence + 5-language UI + sports hub
============================================================ */
(() => {
  'use strict';
  const A=window.ZIVOZONE_AUTH,C=window.ZIVOZONE_CHALLENGES,I=window.ZIVOZONE_I18N;
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const LS='zivozone_state_v6';
  const API=window.ZIVOZONE_API||{};
  let state={level:1,xp:0,coins:0,wins:0,gamesPlayed:0,identity:null};
  let game={id:null,questions:[],index:0,score:0,answers:[],guest:true};
  const t=k=>I.tr(k);
  const lang=()=>I.get();
  const S=()=>window.ZIVOZONE_AUDIO||{};
  const esc=s=>{const d=document.createElement('div');d.textContent=String(s??'');return d.innerHTML};
  const loc=o=>typeof o==='string'?o:(o?.[lang()]||o?.ar||'');
  function toast(msg,type='info'){const box=$('#toast-container');if(!box)return;const x=document.createElement('div');x.className='toast '+type;x.textContent=msg;box.appendChild(x);setTimeout(()=>x.remove(),3500)}
  function loadState(){try{state={...state,...JSON.parse(localStorage.getItem(LS)||'{}')}}catch(e){}}
  function saveState(){state.level=Math.floor((Number(state.xp)||0)/100)+1;localStorage.setItem(LS,JSON.stringify(state))}
  function syncFromPlayer(){const p=A.getPlayer();if(!p)return;state={...state,xp:Number(p.xp)||0,coins:Number(p.coins)||0,wins:Number(p.wins)||0,gamesPlayed:Number(p.gamesPlayed)||0,level:Number(p.level)||1};saveState()}
  function profile(){
    const p=A.getPlayer(),l=state.level||1,base=(l-1)*100,prog=Math.max(0,Math.min(100,(state.xp-base)));
    $('#profile-name').textContent=p?.name||t('guest');
    $('#profile-email').textContent=p?.email||t('guestText');
    $('#profile-level').textContent=l;$('#profile-xp').textContent=state.xp;$('#profile-coins').textContent=state.coins;$('#profile-wins').textContent=state.wins;
    $('#player-level-chip').textContent=`${t('level')} ${l}`;$('#xp-progress').style.width=prog+'%';$('#logout-btn').hidden=!A.isLoggedIn();
    $('#login-btn').textContent=A.isLoggedIn()?`👤 ${p?.name||t('profile')}`:t('login');
  }
  async function reward(xp,coins=1,win=true){state.xp+=xp;state.coins+=coins;if(win)state.wins++;state.gamesPlayed++;saveState();if(A.isLoggedIn())await A.update({xp:state.xp,coins:state.coins,wins:state.wins,gamesPlayed:state.gamesPlayed,level:state.level});profile()}
  function closeModal(){const r=$('#modal-root');r.setAttribute('aria-hidden','true');r.innerHTML=''}
  function openModal(html,cls=''){
    const r=$('#modal-root');r.innerHTML=`<div class="modal-backdrop"><div class="modal-card ${cls}" role="dialog" aria-modal="true">${html}</div></div>`;r.setAttribute('aria-hidden','false');
    r.querySelectorAll('[data-close]').forEach(b=>b.onclick=closeModal);const bg=r.querySelector('.modal-backdrop');if(bg)bg.onclick=e=>{if(e.target===bg)closeModal()};
  }
  function authModal(after){
    let mode='register';
    const render=()=>{
      openModal(`<button class="modal-close" data-close>×</button><span class="eyebrow">${t('account')}</span><h2>${mode==='register'?t('register'):t('welcomeBack')}</h2><p class="muted">${mode==='register'?t('registerHint'):t('loginHint')}</p><div class="auth-tabs"><button id="tab-register" class="btn ${mode==='register'?'btn-primary':''}">${t('register')}</button><button id="tab-login" class="btn ${mode==='login'?'btn-primary':''}">${t('signIn')}</button></div><form id="auth-form">${mode==='register'?`<div><label>${t('playerName')}</label><input id="auth-name" minlength="2" required placeholder="${esc(t('yourName'))}"></div><div><label>${t('age')}</label><input id="auth-age" type="number" min="5" max="100" required value="18"></div>`:''}<div><label>${t('email')}</label><input id="auth-email" type="email" required placeholder="${esc(t('emailPlaceholder'))}"></div><div><label>${t('password')}</label><input id="auth-pass" type="password" minlength="6" required placeholder="${esc(t('passwordPlaceholder'))}"></div><button class="btn btn-primary full" type="submit">${mode==='register'?t('createAccount'):t('signIn')}</button></form>`);
      $('#tab-register').onclick=()=>{mode='register';render()};$('#tab-login').onclick=()=>{mode='login';render()};
      $('#auth-form').onsubmit=async e=>{e.preventDefault();try{if(mode==='register')await A.register({name:$('#auth-name').value,age:$('#auth-age').value,email:$('#auth-email').value,password:$('#auth-pass').value});else await A.login($('#auth-email').value,$('#auth-pass').value);await A.setLanguage(lang());closeModal();syncFromPlayer();profile();toast(t('success'),'success');if(after)after()}catch(err){toast(err.message||t('firebaseError'),'error')}};
    };render();
  }
  function guestGate(){openModal(`<button class="modal-close" data-close>×</button><span class="eyebrow">${t('guestMode')}</span><h2>${t('guest')}</h2><p>${t('guestText')}</p><div class="modal-actions"><button class="btn btn-primary" id="continue-guest">${t('continueGuest')}</button><button class="btn btn-ghost" id="create-now">${t('createNow')}</button></div>`);$('#continue-guest').onclick=()=>{closeModal();startGame(game.id,true)};$('#create-now').onclick=()=>authModal(()=>startGame(game.id,false))}
  function shuffle(arr){for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr}
  function prepareQuestions(id){
    const src=C.get(id); if(!src) return [];
    const pool=src.questions.map(q=>({...q,a:q.a.map(x=>({...x}))}));
    if(pool.length<=10) return pool.slice().sort((a,b)=>a.d-b.d);
    const seenKey=`zivo_seen_${id}_v2`;
    let seen=[]; try{seen=JSON.parse(localStorage.getItem(seenKey)||'[]')}catch(e){}
    const fresh=pool.filter(q=>!seen.includes(q.id));
    const available=fresh.length>=10?fresh:pool;
    // Always keep the session progression: 3 easier, 4 middle, 3 extreme.
    const buckets=[available.filter(q=>q.d<=3),available.filter(q=>q.d>=4&&q.d<=7),available.filter(q=>q.d>=8)];
    const fallback=[pool.filter(q=>q.d<=3),pool.filter(q=>q.d>=4&&q.d<=7),pool.filter(q=>q.d>=8)];
    const take=(arr,n,fb)=>{const a=shuffle(arr.slice());if(a.length<n)a.push(...shuffle(fb.filter(x=>!a.some(y=>y.id===x.id))));return a.slice(0,n)};
    const chosen=[...take(buckets[0],3,fallback[0]),...take(buckets[1],4,fallback[1]),...take(buckets[2],3,fallback[2])];
    const ids=chosen.map(q=>q.id);
    try{localStorage.setItem(seenKey,JSON.stringify([...seen,...ids].slice(-Math.max(20,pool.length))))}catch(e){}
    return chosen.sort((a,b)=>a.d-b.d || Math.random()-.5);
  }
  function startGame(id,guest=false){const src=C.get(id);if(!src){toast(t('noData'),'error');return}game={id,questions:prepareQuestions(id),index:0,score:0,answers:[],guest:!A.isLoggedIn()||guest,locked:false};renderQuestion()}
  function currentQ(){return game.questions[game.index]}
  function renderQuestion(){
    const src=C.get(game.id),q=currentQ();
    if(!q){finishGame();return}
    S().question?.(q.d,game.id);
    if(game.id==='horror' && game.index===0) S().startHorror?.();
    if(game.id==='horror' && game.index===4) S().phase?.(2);
    if(game.id==='horror' && game.index===7) S().phase?.(3);
    if(game.id==='horror' && game.index===6) S().warden?.();
    const phase=game.id==='horror'?` phase-${game.index<4?1:game.index<7?2:3}`:'';const labels=['A','B','C','D'];
    const answers=q.a.map((x,i)=>`<button class="btn btn-ghost answer" data-i="${i}"><span>${labels[i]}</span>${esc(loc(x))}</button>`).join('');
    const warden=game.id==='horror'&&game.index>=6?`<div class="warden">${t('warden')}</div>`:'';
    const progress=Math.round(((game.index)/game.questions.length)*100);
    openModal(`<button class="modal-close" data-close>×</button><div class="game-head"><span class="eyebrow">${esc(loc(src.title))}</span><strong>${game.index+1} / ${game.questions.length}</strong></div><div class="question-progress"><span style="width:${progress}%"></span></div>${warden}<h2>${esc(loc(q.q))}</h2><div class="difficulty">${t('difficulty')} ${q.d}/10</div><div class="answers">${answers}</div><div class="game-footer"><span>${game.score} ${t('correct')}</span><button class="btn btn-small btn-ghost" data-action="quit-game">${t('exit')}</button></div>`,game.id==='horror'?`horror-modal${phase}`:'');
    $$('.answer').forEach(b=>b.onclick=()=>answer(Number(b.dataset.i)));$('#modal-root [data-action="quit-game"]').onclick=()=>{closeModal();S().stopHorror?.();toast(t('exit'))};
  }
  function answer(i){
    if(game.locked)return; game.locked=true;
    const q=currentQ();game.answers.push(i);const ok=i===q.c;if(ok){game.score++;S().correct?.()}else{S().wrong?.()}
    const buttons=$$('.answer');buttons.forEach((b,n)=>{b.disabled=true;if(n===q.c)b.classList.add('answer-correct');if(n===i&&!ok)b.classList.add('answer-wrong')});
    setTimeout(()=>{game.index++;game.locked=false;renderQuestion()},650);
  }
  async function finishGame(){
    S().stopHorror?.();
    S().success?.();
    const src=C.get(game.id),score=game.score,total=game.questions.length,xp=Math.max(10,Math.round((score/total)*src.xp)),coins=Math.max(1,Math.ceil(score/2)),win=score>=Math.ceil(total*.5);
    closeModal();await reward(xp,coins,win);
    if(game.id==='daily')localStorage.setItem('zivo_daily_'+new Date().toISOString().slice(0,10),'1');
    await A.saveResult({challengeId:game.id,score,total,xp,coins,guest:game.guest,language:lang()});
    openModal(`<button class="modal-close" data-close>×</button><span class="eyebrow">${t('result')}</span><h2>${win?t('excellent'):t('roundEnded')}</h2><p>${t('score')}: <strong>${score}/${total}</strong></p><p>+${xp} XP &nbsp; +${coins} 🪙 ZIVO</p>${game.guest?`<div class="save-call"><strong>${t('guestSave')}</strong></div>`:''}<div class="modal-actions"><button class="btn btn-primary" id="again">${t('again')}</button>${game.guest?`<button class="btn btn-ghost" id="register-result">${t('saveProgress')}</button>`:''}<button class="btn btn-ghost" data-close>${t('close')}</button></div>`);
    $('#again').onclick=()=>{closeModal();startGame(game.id,!A.isLoggedIn())};$('#register-result')?.addEventListener('click',()=>authModal(()=>{toast(t('success'),'success');profile()}));
  }
  function identity(){
    const qs=[
      {q:{ar:'عندما تواجه مشكلة جديدة؟',en:'When you face a new problem?',zh:'遇到新问题时？',hi:'जब आप नई समस्या का सामना करते हैं?',es:'Cuando enfrentas un problema nuevo?'},a:[{ar:'أحللها بهدوء',en:'I analyze calmly',zh:'我冷静分析',hi:'मैं शांति से विश्लेषण करता हूँ',es:'La analizo con calma'},{ar:'أجرب بسرعة',en:'I try quickly',zh:'我快速尝试',hi:'मैं जल्दी कोशिश करता हूँ',es:'Lo intento rápido'},{ar:'أسأل الآخرين',en:'I ask others',zh:'我询问他人',hi:'मैं दूसरों से पूछता हूँ',es:'Pregunto a otros'}]},
      {q:{ar:'في المنافسة تهمك أكثر؟',en:'In competition, what matters most?',zh:'在竞争中什么最重要？',hi:'प्रतियोगिता में आपके लिए क्या महत्वपूर्ण है?',es:'En una competencia, ¿qué importa más?'},a:[{ar:'الدقة',en:'Accuracy',zh:'准确',hi:'सटीकता',es:'Precisión'},{ar:'السرعة',en:'Speed',zh:'速度',hi:'गति',es:'Velocidad'},{ar:'الإبداع',en:'Creativity',zh:'创造力',hi:'रचनात्मकता',es:'Creatividad'}]},
      {q:{ar:'عندما تتغير الخطة؟',en:'When the plan changes?',zh:'计划改变时？',hi:'जब योजना बदलती है?',es:'Cuando cambia el plan?'},a:[{ar:'أعيد التخطيط',en:'I re-plan',zh:'我重新规划',hi:'मैं फिर से योजना बनाता हूँ',es:'Replanteo el plan'},{ar:'أتكيف فورًا',en:'I adapt immediately',zh:'我立即适应',hi:'मैं तुरंत अनुकूलित होता हूँ',es:'Me adapto de inmediato'},{ar:'أبحث عن بديل',en:'I find an alternative',zh:'我寻找替代方案',hi:'मैं विकल्प खोजता हूँ',es:'Busco una alternativa'}]},
      {q:{ar:'تفضل؟',en:'You prefer?',zh:'你更喜欢？',hi:'आप क्या पसंद करते हैं?',es:'¿Qué prefieres?'},a:[{ar:'التحديات المنطقية',en:'Logic challenges',zh:'逻辑挑战',hi:'तर्क चुनौतियाँ',es:'Desafíos lógicos'},{ar:'المغامرة',en:'Adventure',zh:'冒险',hi:'साहसिक अनुभव',es:'Aventura'},{ar:'التعاون',en:'Teamwork',zh:'合作',hi:'सहयोग',es:'Colaboración'}]}
    ];
    let i=0,s=[0,0,0];
    const step=()=>{if(i>=qs.length){const m=s.indexOf(Math.max(...s)),names=[t('analysis'),t('adventurer'),t('teamPlayer')];state.identity=names[m];saveState();openModal(`<button class="modal-close" data-close>×</button><span class="eyebrow">${t('whoAmI')}</span><h2>${names[m]}</h2><p>${t('identityResult')}</p><button class="btn btn-primary full" data-close>${t('close')}</button>`);return}
      const q=qs[i];openModal(`<button class="modal-close" data-close>×</button><span class="eyebrow">${t('whoAmI')}</span><h2>${esc(loc(q.q))}</h2><div class="answers">${q.a.map((x,n)=>`<button class="btn btn-ghost id-choice" data-n="${n}">${esc(loc(x))}</button>`).join('')}</div>`);$$('.id-choice').forEach(b=>b.onclick=()=>{s[Number(b.dataset.n)]++;i++;step()})};step();
  }
  function renderChallenges(){
    const today=new Date().toISOString().slice(0,10),done=localStorage.getItem('zivo_daily_'+today);
    $('#challenge-list').innerHTML=C.getAll().map(x=>`<article class="challenge-card"><span class="challenge-icon">${x.icon}</span><div><span class="card-tag">${t('questions10')}</span><h3>${esc(loc(x.title))}</h3><p>${t('questions10')} — ${esc(loc(x.desc))}</p></div><button class="btn btn-primary" data-challenge="${x.id}" ${done&&x.id==='daily'?'disabled':''}>${done&&x.id==='daily'?t('done'):t('start')}</button></article>`).join('')+`<article class="challenge-card special"><span class="challenge-icon">👁️</span><div><span class="card-tag danger">${t('questions10')}</span><h3>${esc(loc(C.horror.title))}</h3><p>${esc(loc(C.horror.desc))}</p></div><button class="btn btn-primary danger-btn" data-challenge="horror">${t('enter')}</button></article>`;
    $$('[data-challenge]').forEach(b=>b.onclick=()=>{const id=b.dataset.challenge;if(id==='daily'&&done){toast(t('dailyTomorrow'));return}startGame(id,!A.isLoggedIn())});
  }
  const NEWS=[
    {key:'FIFA',url:'https://www.fifa.com/',icon:'🌍',title:{ar:'فيفا',en:'FIFA',zh:'国际足联',hi:'फीफा',es:'FIFA'}},
    {key:'AFC',url:'https://www.the-afc.com/',icon:'🏆',title:{ar:'الاتحاد الآسيوي',en:'AFC',zh:'亚足联',hi:'एएफसी',es:'AFC'}},
    {key:'UEFA',url:'https://www.uefa.com/',icon:'⭐',title:{ar:'يويفا',en:'UEFA',zh:'欧足联',hi:'यूईएफए',es:'UEFA'}},
    {key:'ESPN',url:'https://www.espn.com/',icon:'📰',title:{ar:'ESPN',en:'ESPN',zh:'ESPN 体育',hi:'ESPN',es:'ESPN'}}
  ];
  function renderNewsSources(){
    $('#news-list').innerHTML=NEWS.map(n=>`<article class="sports-card"><div class="icon">${n.icon}</div><span class="card-tag">${n.key}</span><h3>${esc(loc(n.title))}</h3><p>${esc(t('sportsIntro'))}</p><a class="btn btn-ghost" href="${n.url}" target="_blank" rel="noopener noreferrer">${t('openNews')}</a></article>`).join('');
  }
  function eventText(e){const home=e.strHomeTeam||e.strHomeTeamShort||'Home',away=e.strAwayTeam||e.strAwayTeamShort||'Away';return {home,away,date:e.dateEvent||'',time:e.strTime||'',league:e.strLeague||e.strSport||'Sport'} }
  async function sports(){
    renderNewsSources();
    const box=$('#sports-list');box.innerHTML=`<article class="sports-card loading-card"><div class="spinner"></div><h3>${esc(t('sportsTitle'))}</h3><p>${esc(t('loader'))}</p></article>`;
    const teamIds=['133604','133602','133738','133739'];let events=[];
    try{
      const calls=teamIds.map(id=>fetch(`https://www.thesportsdb.com/api/v1/json/123/eventsnext.php?id=${id}`).then(r=>r.ok?r.json():null).catch(()=>null));
      const data=await Promise.all(calls);data.forEach(d=>{if(d?.events)events.push(...d.events)});
    }catch(e){console.warn('Sports API:',e)}
    const seen=new Set();events=events.filter(e=>{const k=e.idEvent||`${e.strEvent}-${e.dateEvent}`;if(seen.has(k))return false;seen.add(k);return true}).slice(0,8);
    if(!events.length){box.innerHTML=`<article class="sports-card"><div class="icon">📡</div><h3>${esc(t('noData'))}</h3><p>${esc(t('newsUnavailable'))}</p></article>`;return}
    box.innerHTML=events.map(e=>{const x=eventText(e);const d=x.date?new Date(`${x.date}T${x.time||'00:00:00'}`):null;const when=d&&!Number.isNaN(d.getTime())?d.toLocaleString(lang()==='ar'?'ar-JO':lang()==='zh'?'zh-CN':lang()==='hi'?'hi-IN':lang()==='es'?'es-ES':'en-US',{dateStyle:'medium',timeStyle:'short'}):x.date;return `<article class="sports-card"><div class="match-icon">⚽</div><span class="card-tag">${esc(x.league)}</span><h3>${esc(x.home)} <span class="versus">VS</span> ${esc(x.away)}</h3><p>${esc(when)}</p><a class="btn btn-ghost" href="https://www.thesportsdb.com/" target="_blank" rel="noopener noreferrer">${t('open')}</a></article>`}).join('');
  }
  function localAIReply(q){const x=q.toLowerCase();if(x.includes('مستوى')||x.includes('level')||x.includes('等级')||x.includes('लेवल')||x.includes('nivel'))return`${t('level')} ${state.level} — ${state.xp} XP, ${state.coins} ZIVO.`;if(x.includes('تحد')||x.includes('challenge')||x.includes('挑战')||x.includes('चैलेंज')||x.includes('desaf'))return t('challengeText');if(x.includes('رياض')||x.includes('sport')||x.includes('体育')||x.includes('स्पोर्ट')||x.includes('deporte'))return t('sportsIntro');return t('aiWelcome')}
  async function askAI(message){
    if(API.aiEndpoint){try{const r=await fetch(API.aiEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,language:lang(),player:{level:state.level,xp:state.xp,gamesPlayed:state.gamesPlayed}})});if(r.ok){const d=await r.json();if(d.reply)return d.reply}}catch(e){console.warn('AI endpoint:',e)}}
    return localAIReply(message);
  }
  function applyLanguage(){
    const l=lang();document.documentElement.lang=l;document.documentElement.dir=I.dir[l];
    $$('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;if(I.T[l]?.[k]!==undefined)el.textContent=t(k)});
    $$('[data-i18n-placeholder]').forEach(el=>el.placeholder=t(el.dataset.i18nPlaceholder));
    renderChallenges();renderNewsSources();profile();sports();
    const footerSpans=$$('.footer span');if(footerSpans[1])footerSpans[1].textContent=`© 2026 ZIVOZONE`;if(footerSpans[2])footerSpans[2].textContent=t('footerTagline');
  }
  function bind(){
    const audioBtn=$('#audio-toggle');
    if(audioBtn){audioBtn.textContent=S().isEnabled?.()?'🔊':'🔇';audioBtn.onclick=async()=>{await S().unlock?.();S().toggle?.();audioBtn.textContent=S().isEnabled?.()?'🔊':'🔇';S().click?.()}}
    $('#language-select').value=lang();$('#language-select').onchange=async e=>{I.set(e.target.value);await A.setLanguage(e.target.value);applyLanguage();toast(t('updateDone'),'success')};
    $('#login-btn').onclick=()=>A.isLoggedIn()?location.hash='#profile':authModal();
    $$('[data-action="login"]').forEach(b=>b.onclick=()=>A.isLoggedIn()?location.hash='#profile':authModal());
    $$('[data-game]').forEach(b=>b.onclick=()=>startGame(b.dataset.game,!A.isLoggedIn()));
    $$('[data-action="scroll-games"]').forEach(b=>b.onclick=()=>$('#games').scrollIntoView({behavior:'smooth'}));
    $$('[data-action="open-identity"]').forEach(b=>b.onclick=identity);
    $$('[data-action="logout"]').forEach(b=>b.onclick=async()=>{await A.logout();state={level:1,xp:0,coins:0,wins:0,gamesPlayed:0,identity:null};saveState();profile();toast(t('logoutDone'))});
    $$('[data-action="refresh-sports"]').forEach(b=>b.onclick=()=>sports());
    $$('[data-action="ad-info"]').forEach(b=>b.onclick=()=>toast(t('adText')));
    $('#ai-form').onsubmit=async e=>{e.preventDefault();const input=$('#ai-input'),v=input.value.trim();if(!v)return;const box=$('#ai-messages');const u=document.createElement('div');u.className='ai-message user';u.textContent=v;box.append(u);input.value='';const b=document.createElement('div');b.className='ai-message bot';b.textContent='…';box.append(b);box.scrollTop=box.scrollHeight;b.textContent=await askAI(v);box.scrollTop=box.scrollHeight};
  }
  window.addEventListener('zivozone-auth',(e)=>{syncFromPlayer();profile();const el=$('#firebase-status');if(el){el.textContent=e.detail?.cloud?'●':'○';el.classList.toggle('online',!!e.detail?.cloud);el.title=e.detail?.cloud?'Firebase connected':'Guest/local mode'}});
  document.addEventListener('pointerover',e=>{if(e.target.closest('button,.btn,a'))S().hover?.()},{passive:true});
  window.addEventListener('zivozone-language',()=>{const sel=$('#language-select');if(sel)sel.value=lang()});
  loadState();
  document.addEventListener('DOMContentLoaded',()=>{bind();applyLanguage();setTimeout(()=>$('#app-loader')?.classList.add('hidden'),650)});
})();
