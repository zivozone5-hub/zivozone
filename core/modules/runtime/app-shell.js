/* ZIVOZONE — app-shell.js
   App shell bootstrap: routing, view mounting, global UI wiring
   Extracted verbatim from the former core/runtime.js monolith (V1180 refactor). No logic changed.
*/
/* ===== app.js ===== */
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
  const A=window.ZIVOZONE_AUTH,I=window.ZIVOZONE_I18N;
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const LS='zivozone_identity_v1';
  const ADMIN_EMAIL=window.ZIVOZONE_CONFIG.ADMIN_EMAIL_NORMALIZED;
  const ADMIN_NAME='رائف البطوش';
  const API=window.ZIVOZONE_API||{};
  let state={level:1,xp:0,coins:0,wins:0,gamesPlayed:0,bestStreak:0,identity:null};
  const QUESTION_TIME=30;
  let questionTimer=null;
  let questionDeadline=0;
  let lastTickSecond=null;
  const t=k=>I.tr(k),lang=()=>I.get(),S=()=>window.ZIVOZONE_AUDIO||{},O=(ar,en)=>({ar,en,zh:en,hi:en,es:en});
  const esc=window.ZIVOZONE_ESC;
  /* V1198 — canonical navigation state manager: one route source of truth. */
  const NAV_KEY='zivozone_navigation_v1198';
  const NAV={route:'#home',previous:'#home',ts:0,restored:false};
  const normalizeRoute=()=>{const h=String(location.hash||'#home');return h.startsWith('#')?h:'#'+h};
  function persistNav(){try{localStorage.setItem(NAV_KEY,JSON.stringify({route:NAV.route,previous:NAV.previous,ts:NAV.ts}))}catch(_){} }
  function restoreNav(){try{const x=JSON.parse(localStorage.getItem(NAV_KEY)||'null');if(x?.route) NAV.previous=x.route}catch(_){};NAV.route=normalizeRoute();NAV.ts=Date.now();NAV.restored=true;persistNav();return NAV.route}
  function commitRoute(reason='navigation'){
    const next=normalizeRoute();
    if(next!==NAV.route) NAV.previous=NAV.route;
    NAV.route=next; NAV.ts=Date.now(); persistNav();
    window.dispatchEvent(new CustomEvent('zivozone-route',{detail:{route:NAV.route,previous:NAV.previous,reason,restored:NAV.restored}}));
    return NAV.route;
  }
  window.ZIVOZONE_NAV=Object.freeze({get:()=>({...NAV}),current:()=>NAV.route,previous:()=>NAV.previous,go:(route)=>{const r=String(route||'#home');location.hash=r.startsWith('#')?r:'#'+r;return r},commit:commitRoute,restore:restoreNav});
  restoreNav();
  const loc=o=>typeof o==='string'?o:(o?.[lang()]||o?.en||o?.ar||'');
  const toast=(msg,type='info')=>{const box=$('#toast-container');if(!box)return;const x=document.createElement('div');x.className='toast '+type;x.textContent=msg;box.appendChild(x);setTimeout(()=>x.remove(),3200)};
  const loadState=()=>{try{state.identity=JSON.parse(localStorage.getItem(LS)||'null')}catch(e){state.identity=null}};
  const saveState=()=>{try{if(state.identity)localStorage.setItem(LS,JSON.stringify(state.identity));else localStorage.removeItem(LS)}catch(e){}};
  function syncFromPlayer(){const p=A.getPlayer();if(!p)return;state={...state,xp:Number(p.xp)||0,coins:Number(p.coins)||0,wins:Number(p.wins)||0,gamesPlayed:Number(p.gamesPlayed)||0,level:Number(p.level)||1,bestStreak:Number(p.bestStreak)||Number(state.bestStreak)||0};saveState()}
  function profile(){
    const p=A.getPlayer(),u=A.getUser?.(),admin=A.isAdmin?.()||String(u?.email||'').trim().toLowerCase()===ADMIN_EMAIL,l=Number(state.level)||Number(p?.level)||1;
    const chip=$('#player-level-chip'); if(chip) chip.textContent=admin?'ADMIN':`${t('level')} ${l}`;
    /* V1229.16: on narrow screens the header button is capped at 125px (see #login-btn in index.css)
       and the full guest label ("Create account / Sign in") was getting cut off mid-word with an
       ellipsis — on the primary sign-up button, for first-time visitors. Use a shorter, neutral
       "Account" label there instead. Logged-in and admin labels are unaffected (a user's own name is
       the only thing that should ever legitimately ellipsize). */
    const narrow=window.matchMedia&&window.matchMedia('(max-width:480px)').matches;
    const login=$('#login-btn'); if(login) login.textContent=admin?'👑 ADMIN':A.isLoggedIn()?`👤 ${p?.name||t('profile')}`:t(narrow?'loginShort':'login');
  }
  /* Re-label if the viewport crosses the breakpoint (device rotation, split-screen, desktop resize). */
  try{window.matchMedia('(max-width:480px)').addEventListener('change',()=>profile())}catch(e){}
  function updateTimerUI(seconds){
    const n=Math.max(0,Math.ceil(seconds));
    const bar=$('#question-timer-fill'),num=$('#question-timer-number'),box=$('#question-timer');
    if(bar)bar.style.width=Math.max(0,Math.min(100,(seconds/QUESTION_TIME)*100))+'%';
    if(num)num.textContent=n;
    if(box)box.classList.toggle('urgent',n<=3);
  }
  function remainingSeconds(){
    if(!questionDeadline)return 0;
    return Math.max(0,Math.min(QUESTION_TIME,(questionDeadline-Date.now())/1000));
  }
  function returnToChallenges(){S().stopChallenge?.();if('speechSynthesis' in window)try{speechSynthesis.cancel()}catch(e){}document.body.classList.remove('horror-active');closeModal();location.hash='#challenges';$('#challenges')?.scrollIntoView({behavior:'smooth'})}
  function openModal(html,cls=''){const r=$('#modal-root');r.innerHTML=`<div class="modal-backdrop"><div class="modal-card ${cls}" role="dialog" aria-modal="true">${html}</div></div>`;r.setAttribute('aria-hidden','false');r.querySelectorAll('[data-close]').forEach(b=>b.onclick=closeModal);const bg=r.querySelector('.modal-backdrop');if(bg)bg.onclick=e=>{if(e.target===bg)closeModal()}}
  function closeModal(){const r=$('#modal-root');if(!r)return;r.innerHTML='';r.setAttribute('aria-hidden','true')}
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){const r=$('#modal-root');if(r&&r.getAttribute('aria-hidden')==='false')closeModal()}});
  /* V1229 — legal text lives at /terms/ and /privacy/ (real, crawlable pages). This shell only owns the consent banner UI;
     the consent state itself is owned by ZIVOZONE.Events.consent. */
  const MIN_AGE=Number(window.ZIVOZONE_CONFIG?.MIN_AGE)||13;
  function mountCloneWarning(){
    if(!window.__ZIVOZONE_UNAUTHORIZED_HOST__||document.getElementById('zivo-clone-warning'))return;
    const b=document.createElement('div');
    b.id='zivo-clone-warning';b.className='zivo-clone-warning';b.setAttribute('role','alert');
    b.innerHTML=`<p>${esc(t('cloneWarningBanner'))}</p>`;
    document.body.appendChild(b);
  }
  // V1230.78 — real phone testing (not just reading the CSS) found the consent banner
  // physically covering and blocking every tap on the mobile bottom nav (Home/Challenges/Player
  // journey/etc.) for any first-time visitor who hadn't yet accepted/declined it. The CSS below
  // lifted the banner by a guessed, hardcoded 84px to clear the nav — but the banner's real height
  // on a narrow phone (its text wraps to 2-3 lines) measured ~154px, 37px taller than that guess,
  // so it silently overlapped the nav underneath despite the intended gap. Fixed at the root
  // instead of inflating the guess again: measure the nav's ACTUAL rendered height here and feed
  // it to the CSS as a variable, so the clearance is always correct regardless of text length,
  // language, or screen width — re-measured on resize/orientation change too.
  function syncConsentNavClearance(){
    const nav=document.querySelector('.mobile-nav');
    const h=nav&&getComputedStyle(nav).display!=='none'?nav.getBoundingClientRect().height:0;
    document.documentElement.style.setProperty('--zivo-nav-clearance', h>0?`${Math.ceil(h)+10}px`:'84px');
  }
  function mountConsent(){
    const C=window.ZIVOZONE?.Events?.consent;if(!C)return;
    const draw=()=>{
      document.getElementById('zivo-consent')?.remove();
      if(C.get()!==null)return;
      const b=document.createElement('div');
      b.id='zivo-consent';b.className='zivo-consent';b.setAttribute('role','dialog');b.setAttribute('aria-label',t('consentTitle'));
      b.innerHTML=`<p><strong>${esc(t('consentTitle'))}</strong> ${esc(t('consentText'))} <a href="/privacy/">${esc(t('footerPrivacy'))}</a></p><div class="zivo-consent-actions"><button type="button" class="btn" data-consent="deny">${esc(t('consentDecline'))}</button><button type="button" class="btn btn-primary" data-consent="grant">${esc(t('consentAccept'))}</button></div>`;
      b.querySelector('[data-consent=grant]').onclick=()=>C.grant();
      b.querySelector('[data-consent=deny]').onclick=()=>C.deny();
      document.body.appendChild(b);
      syncConsentNavClearance();
    };
    draw();
    window.addEventListener('zivozone-consent',draw);
    window.addEventListener('zivozone-language',draw);
    document.getElementById('zivo-consent-footer')?.addEventListener('click',()=>C.reset());
    let resizeT=null;
    window.addEventListener('resize',()=>{clearTimeout(resizeT);resizeT=setTimeout(syncConsentNavClearance,150)});
    window.addEventListener('orientationchange',()=>setTimeout(syncConsentNavClearance,250));
  }
  /* V1230.24 — lightweight, zero-cost bot resistance on top of App Check (auth.js), neither of which
     needs a paid Firebase tier: a honeypot field real visitors never see or fill, and a minimum
     human-plausible fill time. Both reject silently with the ordinary firebaseError message — never a
     distinct "bot detected" string — so a scripted attacker gets no signal telling them what tripped. */
  const MIN_HUMAN_FILL_MS=1200;
  function authModal(after,initialMode){
    let mode=initialMode||'register';
    const openedAt=Date.now();
    const render=()=>{
      const isReset=mode==='reset';
      const title=mode==='register'?t('register'):mode==='login'?t('welcomeBack'):t('resetTitle');
      const hint=mode==='register'?t('registerHint'):mode==='login'?t('loginHint'):t('resetHint');
      openModal(`<button class="modal-close" data-close>×</button><span class="eyebrow">${t('account')}</span><h2>${title}</h2><p class="muted">${hint}</p>${isReset?'':`<div class="auth-tabs"><button id="tab-register" class="btn ${mode==='register'?'btn-primary':''}">${t('register')}</button><button id="tab-login" class="btn ${mode==='login'?'btn-primary':''}">${t('signIn')}</button></div><button type="button" id="auth-google" class="btn btn-google full">🔵 ${esc(t('continueWithGoogle'))}</button><p class="zivo-google-note">${esc(t('googleTermsNote')).replace('{terms}',`<a href="/terms/" target="_blank" rel="noopener" class="zivo-inline-link">${esc(t('footerTerms'))}</a>`).replace('{privacy}',`<a href="/privacy/" target="_blank" rel="noopener" class="zivo-inline-link">${esc(t('footerPrivacy'))}</a>`)}</p><div class="zivo-auth-divider"><span>${esc(t('orDividerWord'))}</span></div>`}<form id="auth-form">${mode==='register'?`<div><label>${t('playerName')}</label><input id="auth-name" minlength="2" required placeholder="${esc(t('yourName'))}"></div><div><label>${t('age')}</label><input id="auth-age" type="number" min="${MIN_AGE}" max="100" required inputmode="numeric" placeholder="${MIN_AGE}+"></div>`:''}<div><label>${t('email')}</label><input id="auth-email" type="email" required placeholder="${esc(t('emailPlaceholder'))}"></div>${isReset?'':`<div><label>${t('password')}</label><input id="auth-pass" type="password" minlength="6" required placeholder="${esc(t('passwordPlaceholder'))}"></div>`}${mode==='register'?`<div class="zivo-hp" aria-hidden="true"><label>Website</label><input id="auth-hp" type="text" tabindex="-1" autocomplete="off"></div><label class="zivo-terms-check"><input id="auth-terms" type="checkbox" required><span>${esc(t('termsAgree')).replace('{terms}',`<a href="/terms/" target="_blank" rel="noopener" class="zivo-inline-link">${esc(t('footerTerms'))}</a>`).replace('{privacy}',`<a href="/privacy/" target="_blank" rel="noopener" class="zivo-inline-link">${esc(t('footerPrivacy'))}</a>`).replace('{age}',MIN_AGE)}</span></label>`:''}<button class="btn btn-primary full" type="submit">${mode==='register'?t('createAccount'):mode==='login'?t('signIn'):t('sendReset')}</button></form>${mode==='login'?`<button type="button" id="forgot-pass" class="zivo-inline-link zivo-forgot-link">${t('forgotPassword')}</button>`:''}${isReset?`<button type="button" id="back-to-login" class="zivo-inline-link zivo-forgot-link">${t('backToLogin')}</button>`:''}</div>`);
      $('#tab-register')?.addEventListener('click',()=>{mode='register';render()});
      $('#tab-login')?.addEventListener('click',()=>{mode='login';render()});
      $('#auth-google')?.addEventListener('click',async()=>{
        try{
          const res=await A.loginWithGoogle();
          if(!res)return; // popup closed/cancelled — not an error, nothing to report
          await A.setLanguage(lang());closeModal();syncFromPlayer();profile();toast(t('success'),'success');if(after)after();
        }catch(err){toast(err.message||t('firebaseError'),'error')}
      });
      $('#forgot-pass')?.addEventListener('click',()=>{mode='reset';render()});
      $('#back-to-login')?.addEventListener('click',()=>{mode='login';render()});
      $('#auth-form').onsubmit=async e=>{
        e.preventDefault();
        try{
          if(mode==='register'){
            if($('#auth-hp')?.value||Date.now()-openedAt<MIN_HUMAN_FILL_MS)throw Error(t('firebaseError'));
            await A.register({name:$('#auth-name').value,age:$('#auth-age').value,email:$('#auth-email').value,password:$('#auth-pass').value,termsAccepted:$('#auth-terms')?.checked===true});
            await A.setLanguage(lang());closeModal();syncFromPlayer();profile();toast(t('success'),'success');if(after)after();
          }else if(mode==='login'){
            await A.login($('#auth-email').value,$('#auth-pass').value);
            await A.setLanguage(lang());closeModal();syncFromPlayer();profile();toast(t('success'),'success');if(after)after();
          }else{
            await A.resetPassword($('#auth-email').value);
            toast(t('resetSent'),'success');
            mode='login';render();
          }
        }catch(err){toast(err.message||t('firebaseError'),'error')}
      };
    };
    render();
  }
  /* V1230.25 — Phase 2: "browse free, register to play" gate. Guests can browse every page, story,
     room intro and the AI/sports/identity sections untouched; this fires only at the moment a guest
     tries to actually START a scored game (challenges.js's runner.start, the Dark Room, the Puzzle
     Room, the Beauty Room — each calls window.ZIVOZONE_REQUIRE_PLAY(action) at the top of its own
     start function, so this is one shared gate reused by every room rather than four separate ones).
     Logged-in players and admins skip straight through — this never interrupts someone already signed
     in. */
  function playGateModal(action){
    openModal(`<button class="modal-close" data-close>×</button><span class="eyebrow">${esc(t('account'))}</span><h2>${esc(t('playGateTitle'))}</h2><p class="muted">${esc(t('playGateLead'))}</p><ul class="zivo-playgate-list"><li>${esc(t('playGateBullet1'))}</li><li>${esc(t('playGateBullet2'))}</li><li>${esc(t('playGateBullet3'))}</li></ul><div class="modal-actions"><button class="btn btn-gold full" id="playgate-cta">${esc(t('playGateCta'))}</button></div><button type="button" id="playgate-signin" class="zivo-inline-link zivo-forgot-link">${esc(t('playGateSignInHint'))}</button><p class="zivo-playgate-note">${esc(t('playGateFooterNote'))}</p><button type="button" id="playgate-dismiss" class="zivo-inline-link zivo-playgate-dismiss">${esc(t('playGateDismiss'))}</button>`,'playgate-modal');
    $('#playgate-cta').onclick=()=>authModal(action,'register');
    $('#playgate-signin').onclick=()=>authModal(action,'login');
    /* V1230.82 — "Not now, keep browsing" used to just close the modal and abandon the room the
       guest actually clicked on, leaving them back on the homepage with no visible result — flagged
       live (2026-10-11) as looking like the room's own CTA was broken. The gate's own copy already
       promises "Browsing is always free"; completing signup/login already resumes the original
       action via authModal's own after-success call, so dismissing now does the same — it opens the
       room as a guest instead of silently dropping the attempt. The gate itself is untouched: it
       still shows every time a guest starts a scored game, same as before. */
    $('#playgate-dismiss').onclick=()=>{closeModal();action();};
  }
  function requirePlay(action){
    if(A.isLoggedIn()||A.isAdmin?.())return action();
    playGateModal(action);
    return false;
  }
  window.ZIVOZONE_REQUIRE_PLAY=requirePlay;
  /* Challenge execution is owned exclusively by core/modules/challenges.js. */
  function identity(){
    // V1230.50 — qs entries now carry all 7 site languages per question/option instead of only
    // ar/en, so the identity quiz is a real translation in every language rather than an English fallback.
    const LL=dict=>dict[lang()]||dict.en||dict.ar;
    const qs=[
 {q:{ar:"عندما تبدأ مشروعًا جديدًا، ما أول شيء تفعله؟",en:"When starting a new project, what do you do first?",zh:"开始一个新项目时，你首先做什么？",hi:"जब आप कोई नया प्रोजेक्ट शुरू करते हैं, तो सबसे पहले क्या करते हैं?",es:"Cuando empiezas un proyecto nuevo, ¿qué haces primero?",fr:"Quand tu commences un nouveau projet, que fais-tu d'abord ?",fa:"وقتی پروژه‌ی جدیدی را شروع می‌کنی، اول چه کاری می‌کنی؟"},opts:[{ar:"أضع خطة واضحة",en:"Make a clear plan",zh:"制定清晰的计划",hi:"स्पष्ट योजना बनाता हूँ",es:"Hago un plan claro",fr:"Je fais un plan clair",fa:"یک برنامه‌ی واضح می‌ریزم"},{ar:"أبدأ بالتجربة",en:"Start experimenting",zh:"开始尝试",hi:"प्रयोग करना शुरू करता हूँ",es:"Empiezo a experimentar",fr:"Je commence à expérimenter",fa:"شروع به آزمایش می‌کنم"},{ar:"أجمع الناس حول الفكرة",en:"Bring people around the idea",zh:"把人们聚集在这个想法周围",hi:"लोगों को विचार के इर्द-गिर्द इकट्ठा करता हूँ",es:"Reúno a gente alrededor de la idea",fr:"Je rassemble les gens autour de l'idée",fa:"افراد را حول ایده جمع می‌کنم"},{ar:"أبحث عن فرصة مختلفة",en:"Look for a different opportunity",zh:"寻找不同的机会",hi:"एक अलग अवसर खोजता हूँ",es:"Busco una oportunidad diferente",fr:"Je cherche une opportunité différente",fa:"به دنبال فرصتی متفاوت می‌گردم"}]},
 {q:{ar:"عندما تفشل في شيء مهم؟",en:"When you fail at something important?",zh:"当你在重要的事情上失败时？",hi:"जब आप किसी महत्वपूर्ण चीज़ में असफल होते हैं?",es:"¿Cuando fallas en algo importante?",fr:"Quand tu échoues dans quelque chose d'important ?",fa:"وقتی در کاری مهم شکست می‌خوری؟"},opts:[{ar:"أحلل السبب",en:"Analyze the reason",zh:"分析原因",hi:"कारण का विश्लेषण करता हूँ",es:"Analizo la razón",fr:"J'analyse la raison",fa:"دلیل آن را تحلیل می‌کنم"},{ar:"أحاول مرة أخرى بسرعة",en:"Try again quickly",zh:"迅速再次尝试",hi:"जल्दी से फिर कोशिश करता हूँ",es:"Lo intento de nuevo rápidamente",fr:"J'essaie à nouveau rapidement",fa:"سریع دوباره تلاش می‌کنم"},{ar:"أطلب رأيًا من شخص أثق به",en:"Ask someone I trust",zh:"向我信任的人求助意见",hi:"किसी भरोसेमंद व्यक्ति से राय माँगता हूँ",es:"Pido opinión a alguien de confianza",fr:"Je demande l'avis de quelqu'un en qui j'ai confiance",fa:"از کسی که به او اعتماد دارم نظر می‌خواهم"},{ar:"أحوّل الفشل إلى فكرة جديدة",en:"Turn failure into a new idea",zh:"把失败转化为新的想法",hi:"असफलता को एक नए विचार में बदल देता हूँ",es:"Convierto el fracaso en una idea nueva",fr:"Je transforme l'échec en une nouvelle idée",fa:"شکست را به ایده‌ای جدید تبدیل می‌کنم"}]},
 {q:{ar:"في المنافسة، ما الذي يشغلك أكثر؟",en:"In competition, what matters most to you?",zh:"在竞争中，你最在意什么？",hi:"प्रतिस्पर्धा में, आपके लिए सबसे ज़्यादा क्या मायने रखता है?",es:"En la competencia, ¿qué es lo que más te importa?",fr:"En compétition, qu'est-ce qui compte le plus pour toi ?",fa:"در رقابت، چه چیزی برایت از همه مهم‌تر است؟"},opts:[{ar:"الدقة",en:"Accuracy",zh:"精确",hi:"सटीकता",es:"La precisión",fr:"La précision",fa:"دقت"},{ar:"السرعة",en:"Speed",zh:"速度",hi:"गति",es:"La velocidad",fr:"La vitesse",fa:"سرعت"},{ar:"الفريق",en:"The team",zh:"团队",hi:"टीम",es:"El equipo",fr:"L'équipe",fa:"تیم"},{ar:"المفاجأة والإبداع",en:"Surprise and creativity",zh:"出乎意料和创造力",hi:"आश्चर्य और रचनात्मकता",es:"La sorpresa y la creatividad",fr:"La surprise et la créativité",fa:"شگفتی و خلاقیت"}]},
 {q:{ar:"عندما يختلف الناس معك؟",en:"When people disagree with you?",zh:"当人们与你意见不合时？",hi:"जब लोग आपसे असहमत होते हैं?",es:"¿Cuando la gente no está de acuerdo contigo?",fr:"Quand les gens sont en désaccord avec toi ?",fa:"وقتی افراد با تو مخالفت می‌کنند؟"},opts:[{ar:"أناقش الأدلة",en:"Discuss the evidence",zh:"讨论证据",hi:"सबूतों पर चर्चा करता हूँ",es:"Discuto las pruebas",fr:"Je discute des preuves",fa:"درباره‌ی شواهد بحث می‌کنم"},{ar:"أدافع عن قراري",en:"Defend my decision",zh:"坚持我的决定",hi:"अपने फ़ैसले का बचाव करता हूँ",es:"Defiendo mi decisión",fr:"Je défends ma décision",fa:"از تصمیمم دفاع می‌کنم"},{ar:"أبحث عن حل للجميع",en:"Find a solution for everyone",zh:"寻找让大家都满意的解决方案",hi:"सभी के लिए एक समाधान खोजता हूँ",es:"Busco una solución para todos",fr:"Je cherche une solution pour tous",fa:"دنبال راه‌حلی برای همه می‌گردم"},{ar:"أغير زاوية التفكير",en:"Change the angle",zh:"换个角度思考",hi:"सोचने का नज़रिया बदल देता हूँ",es:"Cambio el enfoque",fr:"Je change d'angle de vue",fa:"زاویه‌ی نگاه را تغییر می‌دهم"}]},
 {q:{ar:"أي وصف أقرب لك؟",en:"Which description fits you best?",zh:"哪个描述最符合你？",hi:"कौन सा विवरण आपसे सबसे ज़्यादा मेल खाता है?",es:"¿Qué descripción te queda mejor?",fr:"Quelle description te correspond le mieux ?",fa:"کدام توصیف به تو نزدیک‌تر است؟"},opts:[{ar:"تحليلي",en:"Analytical",zh:"善于分析",hi:"विश्लेषणात्मक",es:"Analítico",fr:"Analytique",fa:"تحلیل‌گر"},{ar:"حاسم",en:"Decisive",zh:"果断",hi:"निर्णायक",es:"Decidido",fr:"Décisif",fa:"مصمم"},{ar:"اجتماعي",en:"Social",zh:"善于社交",hi:"सामाजिक",es:"Sociable",fr:"Sociable",fa:"اجتماعی"},{ar:"مغامر",en:"Adventurous",zh:"喜欢冒险",hi:"साहसी",es:"Aventurero",fr:"Aventureux",fa:"ماجراجو"}]},
 {q:{ar:"عندما يكون الوقت ضيقًا؟",en:"When time is tight?",zh:"当时间紧迫时？",hi:"जब समय कम हो?",es:"¿Cuando el tiempo apremia?",fr:"Quand le temps est compté ?",fa:"وقتی زمان کم است؟"},opts:[{ar:"أرتب الأولويات",en:"Prioritize",zh:"安排优先事项",hi:"प्राथमिकताएं तय करता हूँ",es:"Establezco prioridades",fr:"Je fixe des priorités",fa:"اولویت‌بندی می‌کنم"},{ar:"أتصرف فورًا",en:"Act immediately",zh:"立即行动",hi:"तुरंत काम करता हूँ",es:"Actúo de inmediato",fr:"J'agis immédiatement",fa:"فوراً اقدام می‌کنم"},{ar:"أوزع المهام",en:"Delegate tasks",zh:"分配任务",hi:"कामों को बाँट देता हूँ",es:"Delego tareas",fr:"Je délègue les tâches",fa:"وظایف را تقسیم می‌کنم"},{ar:"أخاطر بحل غير تقليدي",en:"Risk an unconventional solution",zh:"冒险采用非常规的解决方案",hi:"एक अनोखे समाधान का जोखिम लेता हूँ",es:"Arriesgo una solución poco convencional",fr:"Je tente une solution peu conventionnelle",fa:"ریسک یک راه‌حل غیرمعمول را می‌پذیرم"}]},
 {q:{ar:"في لعبة صعبة جدًا؟",en:"In a very difficult game?",zh:"在一场非常困难的游戏中？",hi:"किसी बहुत कठिन खेल में?",es:"¿En un juego muy difícil?",fr:"Dans un jeu très difficile ?",fa:"در یک بازی بسیار سخت؟"},opts:[{ar:"أبحث عن النمط",en:"Find the pattern",zh:"寻找规律",hi:"पैटर्न खोजता हूँ",es:"Busco el patrón",fr:"Je cherche le schéma",fa:"الگو را پیدا می‌کنم"},{ar:"أضغط حتى النهاية",en:"Push to the end",zh:"坚持到最后",hi:"आख़िर तक जोर लगाता हूँ",es:"Sigo hasta el final",fr:"Je pousse jusqu'au bout",fa:"تا آخر فشار می‌آورم"},{ar:"أفكر مع الآخرين",en:"Think with others",zh:"和其他人一起思考",hi:"दूसरों के साथ मिलकर सोचता हूँ",es:"Pienso con otros",fr:"Je réfléchis avec les autres",fa:"با دیگران فکر می‌کنم"},{ar:"أجرب شيئًا لم أجربه",en:"Try something new",zh:"尝试一些没试过的东西",hi:"कुछ नया आज़माता हूँ",es:"Pruebo algo que no he probado",fr:"J'essaie quelque chose de nouveau",fa:"چیزی را که تجربه نکرده‌ام امتحان می‌کنم"}]},
 {q:{ar:"ما الذي يجذبك أكثر؟",en:"What attracts you most?",zh:"什么最吸引你？",hi:"आपको सबसे ज़्यादा क्या आकर्षित करता है?",es:"¿Qué es lo que más te atrae?",fr:"Qu'est-ce qui t'attire le plus ?",fa:"چه چیزی بیشتر تو را جذب می‌کند؟"},opts:[{ar:"الألغاز",en:"Puzzles",zh:"谜题",hi:"पहेलियाँ",es:"Los acertijos",fr:"Les énigmes",fa:"پازل‌ها"},{ar:"التحدي",en:"Challenge",zh:"挑战",hi:"चुनौती",es:"El desafío",fr:"Le défi",fa:"چالش"},{ar:"الناس",en:"People",zh:"人",hi:"लोग",es:"La gente",fr:"Les gens",fa:"مردم"},{ar:"المجهول",en:"The unknown",zh:"未知",hi:"अज्ञात",es:"Lo desconocido",fr:"L'inconnu",fa:"ناشناخته‌ها"}]},
 {q:{ar:"إذا تغيرت الخطة فجأة؟",en:"If the plan suddenly changes?",zh:"如果计划突然改变？",hi:"अगर योजना अचानक बदल जाए?",es:"¿Si el plan cambia de repente?",fr:"Si le plan change soudainement ?",fa:"اگر برنامه ناگهان تغییر کند؟"},opts:[{ar:"أعيد الحساب",en:"Recalculate",zh:"重新计算",hi:"फिर से हिसाब लगाता हूँ",es:"Vuelvo a calcular",fr:"Je recalcule",fa:"دوباره حساب می‌کنم"},{ar:"أقرر بسرعة",en:"Decide quickly",zh:"迅速决定",hi:"जल्दी फ़ैसला करता हूँ",es:"Decido rápido",fr:"Je décide vite",fa:"سریع تصمیم می‌گیرم"},{ar:"أشاور الفريق",en:"Consult the team",zh:"和团队商量",hi:"टीम से सलाह लेता हूँ",es:"Consulto al equipo",fr:"Je consulte l'équipe",fa:"با تیم مشورت می‌کنم"},{ar:"أستمتع بالفوضى",en:"Enjoy the chaos",zh:"享受混乱",hi:"अफरातफरी का मज़ा लेता हूँ",es:"Disfruto del caos",fr:"J'apprécie le chaos",fa:"از آن بی‌نظمی لذت می‌برم"}]},
 {q:{ar:"ما الذي تعتبره نقطة قوة؟",en:"What do you consider a strength?",zh:"你认为什么是你的优势？",hi:"आप किसे अपनी ताकत मानते हैं?",es:"¿Qué consideras un punto fuerte?",fr:"Que considères-tu comme une force ?",fa:"چه چیزی را نقطه‌قوت خود می‌دانی؟"},opts:[{ar:"التركيز",en:"Focus",zh:"专注",hi:"एकाग्रता",es:"La concentración",fr:"La concentration",fa:"تمرکز"},{ar:"الشجاعة",en:"Courage",zh:"勇气",hi:"हिम्मत",es:"El valor",fr:"Le courage",fa:"شجاعت"},{ar:"التواصل",en:"Communication",zh:"沟通",hi:"संवाद",es:"La comunicación",fr:"La communication",fa:"ارتباط"},{ar:"الخيال",en:"Imagination",zh:"想象力",hi:"कल्पनाशक्ति",es:"La imaginación",fr:"L'imagination",fa:"تخیل"}]},
 {q:{ar:"في المجموعة غالبًا أنت؟",en:"In a group you are usually?",zh:"在团队中你通常是？",hi:"समूह में आप अक्सर क्या होते हैं?",es:"¿En un grupo, normalmente eres?",fr:"Dans un groupe, tu es généralement ?",fa:"در یک گروه معمولاً تو چه کسی هستی؟"},opts:[{ar:"المحلل",en:"The analyst",zh:"分析者",hi:"विश्लेषक",es:"El analista",fr:"L'analyste",fa:"تحلیل‌گر"},{ar:"القائد",en:"The leader",zh:"领导者",hi:"नेता",es:"El líder",fr:"Le leader",fa:"رهبر"},{ar:"المساند",en:"The supporter",zh:"支持者",hi:"सहायक",es:"El que apoya",fr:"Le soutien",fa:"حامی"},{ar:"صاحب الأفكار",en:"The idea person",zh:"点子王",hi:"विचारों वाला व्यक्ति",es:"El de las ideas",fr:"Celui qui a les idées",fa:"صاحب‌ایده"}]},
 {q:{ar:"عند اتخاذ قرار كبير؟",en:"When making a major decision?",zh:"在做重大决定时？",hi:"कोई बड़ा फ़ैसला लेते समय?",es:"¿Al tomar una decisión importante?",fr:"En prenant une décision importante ?",fa:"هنگام گرفتن یک تصمیم بزرگ؟"},opts:[{ar:"أقارن الخيارات",en:"Compare options",zh:"比较各个选项",hi:"विकल्पों की तुलना करता हूँ",es:"Comparo las opciones",fr:"Je compare les options",fa:"گزینه‌ها را مقایسه می‌کنم"},{ar:"أحسم بسرعة",en:"Decide quickly",zh:"迅速决断",hi:"जल्दी तय करता हूँ",es:"Decido rápido",fr:"Je décide vite",fa:"سریع تصمیم می‌گیرم"},{ar:"أفكر في تأثيره على الناس",en:"Think about its impact on people",zh:"考虑它对人们的影响",hi:"लोगों पर इसके प्रभाव के बारे में सोचता हूँ",es:"Pienso en su impacto en la gente",fr:"Je pense à son impact sur les gens",fa:"به تأثیر آن روی مردم فکر می‌کنم"},{ar:"أثق بحدسي",en:"Trust my intuition",zh:"相信我的直觉",hi:"अपने अंतर्ज्ञान पर भरोसा करता हूँ",es:"Confío en mi intuición",fr:"Je fais confiance à mon intuition",fa:"به غریزه‌ام اعتماد می‌کنم"}]},
 {q:{ar:"أي نوع من المخاطر تفضّل؟",en:"Which risk do you prefer?",zh:"你更喜欢哪种风险？",hi:"आप किस तरह का जोखिम पसंद करते हैं?",es:"¿Qué tipo de riesgo prefieres?",fr:"Quel type de risque préfères-tu ?",fa:"کدام نوع ریسک را ترجیح می‌دهی؟"},opts:[{ar:"المحسوب",en:"Calculated",zh:"经过计算的",hi:"सोचा-समझा",es:"El calculado",fr:"Calculé",fa:"حساب‌شده"},{ar:"الجريء",en:"Bold",zh:"大胆的",hi:"साहसिक",es:"El audaz",fr:"Audacieux",fa:"جسورانه"},{ar:"المشترك",en:"Shared",zh:"共同承担的",hi:"साझा",es:"El compartido",fr:"Partagé",fa:"مشترک"},{ar:"المبتكر",en:"Innovative",zh:"创新的",hi:"नवीन",es:"El innovador",fr:"Innovant",fa:"خلاقانه"}]},
 {q:{ar:"ماذا تفعل عندما يمل الآخرون؟",en:"What do you do when others get bored?",zh:"当其他人感到厌倦时，你会怎么做？",hi:"जब दूसरे लोग बोर हो जाते हैं तो आप क्या करते हैं?",es:"¿Qué haces cuando los demás se aburren?",fr:"Que fais-tu quand les autres s'ennuient ?",fa:"وقتی دیگران خسته می‌شوند چه می‌کنی؟"},opts:[{ar:"أضيف هدفًا جديدًا",en:"Add a new goal",zh:"增加一个新目标",hi:"एक नया लक्ष्य जोड़ता हूँ",es:"Añado una nueva meta",fr:"J'ajoute un nouvel objectif",fa:"هدف جدیدی اضافه می‌کنم"},{ar:"أرفع التحدي",en:"Raise the challenge",zh:"提高挑战难度",hi:"चुनौती बढ़ा देता हूँ",es:"Elevo el desafío",fr:"J'augmente le défi",fa:"چالش را بالاتر می‌برم"},{ar:"أشرك الجميع",en:"Involve everyone",zh:"让大家都参与",hi:"सभी को शामिल करता हूँ",es:"Involucro a todos",fr:"J'implique tout le monde",fa:"همه را درگیر می‌کنم"},{ar:"أقلب القواعد",en:"Change the rules",zh:"改变规则",hi:"नियम बदल देता हूँ",es:"Cambio las reglas",fr:"Je change les règles",fa:"قوانین را تغییر می‌دهم"}]},
 {q:{ar:"ما الذي يزعجك أكثر؟",en:"What bothers you most?",zh:"什么最让你困扰？",hi:"आपको सबसे ज़्यादा क्या परेशान करता है?",es:"¿Qué es lo que más te molesta?",fr:"Qu'est-ce qui te dérange le plus ?",fa:"چه چیزی بیشتر تو را آزار می‌دهد؟"},opts:[{ar:"الفوضى بلا منطق",en:"Meaningless chaos",zh:"毫无意义的混乱",hi:"बेतरतीब अफरातफरी",es:"El caos sin sentido",fr:"Le chaos sans logique",fa:"آشفتگی بی‌منطق"},{ar:"التردد",en:"Hesitation",zh:"犹豫不决",hi:"हिचकिचाहट",es:"La indecisión",fr:"L'hésitation",fa:"تردید"},{ar:"العزلة",en:"Isolation",zh:"孤立",hi:"अकेलापन",es:"El aislamiento",fr:"L'isolement",fa:"انزوا"},{ar:"الروتين",en:"Routine",zh:"一成不变",hi:"रूटीन",es:"La rutina",fr:"La routine",fa:"یکنواختی"}]},
 {q:{ar:"إذا أعطاك شخص سرًا؟",en:"If someone gives you a secret?",zh:"如果有人告诉你一个秘密？",hi:"अगर कोई आपको कोई राज़ बताए?",es:"¿Si alguien te confía un secreto?",fr:"Si quelqu'un te confie un secret ?",fa:"اگر کسی رازی به تو بگوید؟"},opts:[{ar:"أحفظه",en:"Keep it",zh:"保守它",hi:"इसे राज़ रखता हूँ",es:"Lo guardo",fr:"Je le garde",fa:"آن را نگه می‌دارم"},{ar:"أحميه مهما كان",en:"Protect it no matter what",zh:"无论如何都要保护它",hi:"हर हाल में इसकी रक्षा करता हूँ",es:"Lo protejo sin importar qué",fr:"Je le protège quoi qu'il arrive",fa:"هرطور شده از آن محافظت می‌کنم"},{ar:"أفهم مشاعره",en:"Understand their feelings",zh:"理解他们的感受",hi:"उनकी भावनाओं को समझता हूँ",es:"Entiendo sus sentimientos",fr:"Je comprends ses sentiments",fa:"احساسات او را درک می‌کنم"},{ar:"أستخدمه لفهم الصورة",en:"Use it to understand the picture",zh:"用它来理解整个局面",hi:"इसका उपयोग पूरी तस्वीर समझने के लिए करता हूँ",es:"Lo uso para entender el panorama",fr:"Je l'utilise pour comprendre la situation",fa:"از آن برای فهمیدن تصویر کلی استفاده می‌کنم"}]},
 {q:{ar:"كيف تتعلم شيئًا جديدًا؟",en:"How do you learn something new?",zh:"你如何学习新事物？",hi:"आप कोई नई चीज़ कैसे सीखते हैं?",es:"¿Cómo aprendes algo nuevo?",fr:"Comment apprends-tu quelque chose de nouveau ?",fa:"چیز جدید را چطور یاد می‌گیری؟"},opts:[{ar:"أفهم القاعدة",en:"Understand the rule",zh:"理解规则",hi:"नियम को समझता हूँ",es:"Entiendo la regla",fr:"Je comprends la règle",fa:"قانون را می‌فهمم"},{ar:"أجرب بيدي",en:"Try it myself",zh:"自己动手尝试",hi:"खुद करके देखता हूँ",es:"Lo pruebo yo mismo",fr:"J'essaie moi-même",fa:"خودم عملاً امتحان می‌کنم"},{ar:"أتعلم مع شخص",en:"Learn with someone",zh:"和别人一起学",hi:"किसी के साथ सीखता हूँ",es:"Aprendo con alguien",fr:"J'apprends avec quelqu'un",fa:"با کسی یاد می‌گیرم"},{ar:"أكسر الطريقة المعتادة",en:"Break the usual method",zh:"打破常规方法",hi:"सामान्य तरीका तोड़ देता हूँ",es:"Rompo el método habitual",fr:"Je casse la méthode habituelle",fa:"روش معمول را می‌شکنم"}]},
 {q:{ar:"في لحظة ضغط حقيقية؟",en:"In a truly stressful moment?",zh:"在真正有压力的时刻？",hi:"किसी सच में तनावपूर्ण पल में?",es:"¿En un momento realmente estresante?",fr:"Dans un moment vraiment stressant ?",fa:"در لحظه‌ای واقعاً پرفشار؟"},opts:[{ar:"أهدأ وأحلل",en:"Calm down and analyze",zh:"冷静下来分析",hi:"शांत होकर विश्लेषण करता हूँ",es:"Me calmo y analizo",fr:"Je me calme et j'analyse",fa:"آرام می‌شوم و تحلیل می‌کنم"},{ar:"أواجه",en:"Confront it",zh:"直接面对",hi:"इसका सामना करता हूँ",es:"Lo enfrento",fr:"Je l'affronte",fa:"با آن رو‌به‌رو می‌شوم"},{ar:"أطلب الدعم",en:"Ask for support",zh:"寻求支持",hi:"मदद माँगता हूँ",es:"Pido apoyo",fr:"Je demande du soutien",fa:"کمک می‌خواهم"},{ar:"أبحث عن مخرج غير متوقع",en:"Find an unexpected way out",zh:"寻找意想不到的出路",hi:"एक अनपेक्षित रास्ता खोजता हूँ",es:"Busco una salida inesperada",fr:"Je cherche une issue inattendue",fa:"دنبال راه خروجی غیرمنتظره می‌گردم"}]},
 {q:{ar:"ما الذي تريد أن يذكرك الناس به؟",en:"What do you want people to remember about you?",zh:"你希望别人记住你的什么？",hi:"आप चाहते हैं कि लोग आपको किस बात के लिए याद रखें?",es:"¿Por qué quieres que la gente te recuerde?",fr:"Qu'est-ce que tu veux que les gens retiennent de toi ?",fa:"می‌خواهی مردم تو را به چه چیزی به‌یاد بیاورند؟"},opts:[{ar:"عقلي",en:"My mind",zh:"我的智慧",hi:"मेरा दिमाग",es:"Mi mente",fr:"Mon esprit",fa:"ذهنم"},{ar:"قوتي",en:"My strength",zh:"我的力量",hi:"मेरी ताकत",es:"Mi fuerza",fr:"Ma force",fa:"قدرتم"},{ar:"قلبي",en:"My heart",zh:"我的心",hi:"मेरा दिल",es:"Mi corazón",fr:"Mon cœur",fa:"قلبم"},{ar:"أفكاري",en:"My ideas",zh:"我的想法",hi:"मेरे विचार",es:"Mis ideas",fr:"Mes idées",fa:"ایده‌هایم"}]},
 {q:{ar:"لو فتحت لك بوابة مجهولة؟",en:"If an unknown portal opened for you?",zh:"如果有一个未知的传送门为你打开？",hi:"अगर आपके लिए एक अज्ञात द्वार खुल जाए?",es:"¿Si se abriera para ti un portal desconocido?",fr:"Si un portail inconnu s'ouvrait pour toi ?",fa:"اگر دری ناشناخته برایت باز شود؟"},opts:[{ar:"أفحصها أولًا",en:"Inspect it first",zh:"先检查一下",hi:"पहले उसकी जाँच करता हूँ",es:"Lo inspecciono primero",fr:"Je l'examine d'abord",fa:"اول آن را بررسی می‌کنم"},{ar:"أدخل فورًا",en:"Enter immediately",zh:"立刻进入",hi:"तुरंत भीतर चला जाता हूँ",es:"Entro de inmediato",fr:"J'entre immédiatement",fa:"فوراً وارد می‌شوم"},{ar:"أسأل من معي",en:"Ask whoever is with me",zh:"问问和我在一起的人",hi:"जो मेरे साथ है उससे पूछता हूँ",es:"Le pregunto a quien está conmigo",fr:"Je demande à celui qui est avec moi",fa:"از کسی که همراهم است می‌پرسم"},{ar:"أدخل لأكتشف ما وراءها",en:"Enter to discover what is beyond",zh:"进去探索其中的未知",hi:"यह जानने के लिए प्रवेश करता हूँ कि उसके पार क्या है",es:"Entro para descubrir lo que hay más allá",fr:"J'entre pour découvrir ce qu'il y a au-delà",fa:"وارد می‌شوم تا ببینم پس آن چه چیزی هست"}]}
];
    const traits=[t('analysis'),t('adventurer'),t('teamPlayer'),t('creative')];
    const traitEn=['analyst','leader','connector','explorer'];
    // V1230.75 — "Discover Your Personality" redesign. ARCH replaces the old static `paragraphs`
    // dict: each trait now carries a football-flavored archetype `title` (new) plus the original
    // warm, second-person `lead` narrative (kept verbatim — it already reads like an attentive
    // analyst describing someone, not a generic horoscope line). Multi-dimensionality, the
    // personalized-answer insight, privacy messaging and the no-timer flow are built in step()/
    // renderResult() below; this dict only supplies the per-trait text.
    const ARCH={
      ar:[
        {title:'العقل التكتيكي',lead:'أنت شخص تحليلي، تراقب التفاصيل قبل القرار، وتبحث عن الأنماط الخفية. قوتك في الهدوء، التركيز، وتحويل التعقيد إلى خطوات قابلة للفهم.'},
        {title:'القائد الميداني',lead:'أنت حاسم وطموح، تميل للمبادرة وتحمل الضغط. لا تنتظر الظروف المثالية، بل تتحرك عندما يتردد الآخرون وتحوّل التحدي إلى فرصة.'},
        {title:'قلب الفريق النابض',lead:'أنت اجتماعي وداعم، ترى الناس جزءًا أساسيًا من النجاح. تعرف كيف تجمع الآراء، تبني الثقة، وتحافظ على الفريق متماسكًا وقت الضغط.'},
        {title:'الجوكر المبدع',lead:'أنت مستكشف ومبدع، يثيرك المجهول وتكره القوالب الثابتة. تميل لتجربة طرق غير مألوفة وتحويل الأفكار الغريبة إلى فرص جديدة.'}
      ],
      en:[
        {title:'The Tactical Mind',lead:'You are analytical, observant, and patient, searching for hidden patterns before acting. Your strength is turning complexity into clear, useful decisions.'},
        {title:'The Field Captain',lead:'You are decisive and ambitious, comfortable under pressure. You act when others hesitate, turning uncertainty into momentum and difficult moments into opportunities.'},
        {title:'The Heart of the Team',lead:'You are social and supportive, seeing people as part of success. You build trust, connect perspectives, and help groups stay strong when pressure rises.'},
        {title:'The Creative Playmaker',lead:'You are curious and creative, energized by uncertainty and new paths. You challenge routines, test unusual ideas, and turn strange possibilities into opportunities.'}
      ],
      zh:[
        {title:'战术大脑',lead:'你善于分析、观察力强、有耐心，总是在行动之前寻找隐藏的规律。你的优势在于把复杂的问题拆解成清晰、可执行的决定。'},
        {title:'场上队长',lead:'你果断而有野心，在压力之下依然从容。当别人还在犹豫时，你已经在行动，能把不确定性转化为动力，把难题变成机会。'},
        {title:'团队之心',lead:'你善于社交、乐于支持他人，把人当作成功的关键部分。你懂得建立信任、连接不同的想法，并在压力增大时让团队保持凝聚力。'},
        {title:'创意组织者',lead:'你充满好奇心和创造力，面对不确定性和新路径时反而更有活力。你喜欢挑战常规、尝试不寻常的想法，把奇怪的可能性变成真正的机会。'}
      ],
      hi:[
        {title:'रणनीतिक दिमाग',lead:'आप विश्लेषणात्मक, सजग और धैर्यवान हैं, और किसी भी कार्रवाई से पहले छिपे हुए पैटर्न खोजते हैं। आपकी ताकत जटिलता को स्पष्ट और उपयोगी फ़ैसलों में बदलना है।'},
        {title:'मैदान का कप्तान',lead:'आप निर्णायक और महत्वाकांक्षी हैं, दबाव में भी सहज रहते हैं। जब दूसरे हिचकिचाते हैं तब आप कदम बढ़ाते हैं, अनिश्चितता को गति में और कठिन पलों को अवसरों में बदल देते हैं।'},
        {title:'टीम की धड़कन',lead:'आप सामाजिक और सहायक हैं, और सफलता में लोगों को एक अहम हिस्सा मानते हैं। आप भरोसा बनाते हैं, विचारों को जोड़ते हैं, और दबाव बढ़ने पर भी टीम को मज़बूत बनाए रखते हैं।'},
        {title:'रचनात्मक प्लेमेकर',lead:'आप जिज्ञासु और रचनात्मक हैं, अनिश्चितता और नए रास्ते आपमें ऊर्जा भर देते हैं। आप रूटीन को चुनौती देते हैं, असामान्य विचारों को आज़माते हैं, और अजीब संभावनाओं को अवसरों में बदल देते हैं।'}
      ],
      es:[
        {title:'La Mente Táctica',lead:'Eres analítico, observador y paciente: buscas patrones ocultos antes de actuar. Tu fuerza está en convertir la complejidad en decisiones claras y útiles.'},
        {title:'El Capitán de Campo',lead:'Eres decidido y ambicioso, cómodo bajo presión. Actúas cuando otros dudan, convirtiendo la incertidumbre en impulso y los momentos difíciles en oportunidades.'},
        {title:'El Corazón del Equipo',lead:'Eres sociable y solidario, y ves a las personas como parte esencial del éxito. Sabes generar confianza, conectar puntos de vista y mantener unido al equipo cuando la presión sube.'},
        {title:'El Playmaker Creativo',lead:'Eres curioso y creativo, y la incertidumbre y los caminos nuevos te dan energía. Desafías las rutinas, pruebas ideas poco comunes y conviertes posibilidades extrañas en oportunidades.'}
      ],
      fr:[
        {title:"L'Esprit Tactique",lead:"Tu es analytique, observateur et patient : tu cherches les schémas cachés avant d'agir. Ta force, c'est de transformer la complexité en décisions claires et utiles."},
        {title:'Le Capitaine de Terrain',lead:"Tu es décisif et ambitieux, à l'aise sous pression. Tu agis quand les autres hésitent, transformant l'incertitude en élan et les moments difficiles en opportunités."},
        {title:"Le Cœur de l'Équipe",lead:"Tu es sociable et solidaire, et tu vois les gens comme une part essentielle de la réussite. Tu sais créer la confiance, relier les points de vue et garder l'équipe soudée quand la pression monte."},
        {title:'Le Playmaker Créatif',lead:"Tu es curieux et créatif, et l'incertitude et les nouvelles voies te donnent de l'énergie. Tu remets en question la routine, tu testes des idées inhabituelles et tu transformes d'étranges possibilités en opportunités."}
      ],
      fa:[
        {title:'ذهن تاکتیکی',lead:'تو تحلیل‌گر، دقیق و باحوصله‌ای و پیش از هر اقدامی به‌دنبال الگوهای پنهان می‌گردی. قدرت تو در این است که پیچیدگی را به تصمیم‌هایی روشن و کاربردی تبدیل می‌کنی.'},
        {title:'کاپیتان میدان',lead:'تو مصمم و پرانگیزه‌ای و زیر فشار هم آرام می‌مانی. وقتی دیگران تردید می‌کنند تو دست به کار می‌شوی و بی‌ثباتی را به حرکت و لحظات سخت را به فرصت تبدیل می‌کنی.'},
        {title:'قلب تپنده‌ی تیم',lead:'تو اجتماعی و حامی دیگرانی و مردم را بخش اصلی موفقیت می‌دانی. بلدی اعتماد بسازی، دیدگاه‌ها را به هم وصل کنی و وقتی فشار زیاد می‌شود تیم را کنار هم نگه داری.'},
        {title:'پلی‌میکر خلاق',lead:'تو کنجکاو و خلاقی و بی‌ثباتی و مسیرهای تازه به تو انرژی می‌دهند. روال‌های همیشگی را به چالش می‌کشی، ایده‌های غیرمعمول را امتحان می‌کنی و امکان‌های عجیب را به فرصت تبدیل می‌کنی.'}
      ]
    };
    let i=0,s=[0,0,0,0];
    const chosen=[]; // {q:questionIndex,n:optionIndex} — every real answer, used to personalize the result.
    const renderIntro=()=>{
      openModal(`<button class="modal-close" data-action="return-challenges">×</button><span class="eyebrow">${esc(t('identityIntroEyebrow'))}</span><h2>${esc(t('identityIntroTitle'))}</h2><p class="identity-intro-body">${esc(t('identityIntroBody'))}</p><p class="identity-privacy-note">${esc(t('identityPrivacyNote'))}</p><p class="identity-disclaimer">${esc(t('identityIntroDisclaimer'))}</p><div class="modal-actions"><button class="btn btn-primary full" id="identity-start-btn">${esc(t('identityStartBtn'))}</button></div>`,'identity-intro-modal');
      $('#identity-start-btn').onclick=()=>step();
    };
    const step=()=>{
      if(i>=qs.length){renderResult();return}
      const q=qs[i],question=LL(q.q),options=q.opts.map(LL);
      openModal(`<button class="modal-close" data-action="return-challenges">×</button><span class="eyebrow">${t('whoAmI')} • ${i+1}/20</span><h2>${esc(question)}</h2><div class="question-progress"><span style="width:${((i+1)/20)*100}%"></span></div><div class="answers">${options.map((x,n)=>`<button class="btn btn-ghost id-choice" data-n="${n}">${esc(x)}</button>`).join('')}</div><p class="identity-privacy-note identity-privacy-note--mini">${esc(t('identityPrivacyNote'))}</p>`,'identity-test-modal');
      $$('.id-choice').forEach(b=>b.onclick=()=>{const n=Number(b.dataset.n);chosen.push({q:i,n});s[n]++;i++;step()});
    };
    const retake=()=>{i=0;s=[0,0,0,0];chosen.length=0;step()};
    const renderResult=()=>{
      const total=s.reduce((a,b)=>a+b,0)||1;
      const order=[0,1,2,3].slice().sort((a,b)=>s[b]-s[a]);
      const primary=order[0],secondary=order[1];
      const arch=(ARCH[lang()]||ARCH.en)[primary];
      const pct=s.map(v=>Math.round(v/total*100));
      // Personalized insight: a real answer the person actually gave that fed their primary trait —
      // picked from the middle of their run rather than question #1, so it reads as a pattern across
      // the whole quiz, not a snap first click.
      const picks=chosen.filter(c=>c.n===primary);
      const pick=picks.length?picks[Math.floor(picks.length/2)]:null;
      const barsHtml=[0,1,2,3].map(idx=>`<div class="identity-bar${idx===primary?' is-primary':''}"><span class="identity-bar-label">${esc(traits[idx])}</span><div class="identity-bar-track"><span class="identity-bar-fill" style="width:${pct[idx]}%"></span></div><b class="identity-bar-pct">${pct[idx]}%</b></div>`).join('');
      const prevHistory=(state.identity&&Array.isArray(state.identity.history))?state.identity.history:[];
      const histHtml=prevHistory.length?`<div class="identity-history"><span class="identity-history-label">${esc(t('identityHistoryLabel'))}</span><div class="identity-history-row">${prevHistory.map(h=>`<span class="identity-history-chip">${esc(new Date(h.at).toLocaleDateString(lang()))} · ${esc((ARCH[lang()]||ARCH.en)[h.primary]?.title||'')}</span>`).join('')}</div></div>`:'';
      openModal(`<button class="modal-close" data-action="return-challenges">×</button><span class="eyebrow">${t('whoAmI')}</span><h2 class="identity-archetype-title">${esc(arch.title)}</h2><p class="identity-result">${esc(arch.lead)}</p><p class="identity-secondary">${esc(t('identitySecondaryIntro').replace('{trait}',traits[secondary]))}</p><div class="identity-bars"><span class="identity-bars-label">${esc(t('identityScoresLabel'))}</span>${barsHtml}</div>${pick?`<div class="identity-insight"><span class="identity-insight-label">${esc(t('identityInsightLabel'))}</span><p class="identity-insight-q">“${esc(LL(qs[pick.q].q))}”</p><p class="identity-insight-a"><b>${esc(t('identityYourChoice'))}:</b> ${esc(LL(qs[pick.q].opts[pick.n]))}</p></div>`:''}${histHtml}<p class="identity-privacy-note">${esc(t('identityPrivacyNote'))}</p><p class="identity-disclaimer">${esc(t('identityIntroDisclaimer'))}</p><div class="modal-actions"><button type="button" class="btn btn-ghost" id="identity-save-img">${esc(t('identitySaveImage'))}</button><button type="button" class="btn btn-ghost" id="identity-retake">${esc(t('identityRetake'))}</button><button class="btn btn-primary" data-action="return-challenges">${t('close')}</button></div>`,'identity-result-modal');
      state.identity={primary:traitEn[primary],secondary:traitEn[secondary],scores:s.slice(),percentages:pct,at:Date.now(),history:[...prevHistory.slice(-4),{primary,at:Date.now()}]};
      saveState();
      $('#identity-retake')?.addEventListener('click',retake);
      $('#identity-save-img')?.addEventListener('click',()=>saveIdentityImage(arch.title,t('identitySecondaryIntro').replace('{trait}',traits[secondary]),pct));
    };
    function wrapCanvasText(ctx,text,x,y,maxWidth,lineHeight){
      const words=String(text||'').split(' ');let line='',lines=[];
      words.forEach(w=>{const test=line?line+' '+w:w;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=w}else line=test});
      if(line)lines.push(line);
      const startY=y-((lines.length-1)*lineHeight)/2;
      lines.forEach((l,idx)=>ctx.fillText(l,x,startY+idx*lineHeight));
      return lines.length;
    }
    function saveIdentityImage(title,secondaryLine,pct){
      try{
        const W=900,H=1180;
        const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
        const ctx=canvas.getContext('2d');
        ctx.direction=(document.documentElement.dir==='rtl')?'rtl':'ltr';
        const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#0d1020');bg.addColorStop(1,'#07090f');
        ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
        ctx.textAlign='center';
        ctx.fillStyle='#8edcff';ctx.font='600 24px sans-serif';ctx.fillText('ZIVOZONE',W/2,86);
        ctx.fillStyle='#fff';ctx.font='800 44px sans-serif';
        const titleLines=wrapCanvasText(ctx,title,W/2,230,780,52);
        ctx.fillStyle='#aeb5d1';ctx.font='400 22px sans-serif';
        const afterTitleY=230+titleLines*26+70;
        wrapCanvasText(ctx,secondaryLine,W/2,afterTitleY,760,30);
        let barY=afterTitleY+110;
        [0,1,2,3].forEach(idx=>{
          ctx.textAlign=ctx.direction==='rtl'?'end':'start';
          ctx.fillStyle='#cbd1ec';ctx.font='500 21px sans-serif';
          const labelX=ctx.direction==='rtl'?W-80:80;
          ctx.fillText(traits[idx],labelX,barY);
          const trackX=80,trackW=W-160;
          ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(trackX,barY+14,trackW,14);
          const fillW=trackW*(pct[idx]/100);
          const g2=ctx.createLinearGradient(trackX,0,trackX+fillW,0);g2.addColorStop(0,'#7c3cff');g2.addColorStop(1,'#22d3ee');
          ctx.fillStyle=g2;ctx.fillRect(ctx.direction==='rtl'?trackX+trackW-fillW:trackX,barY+14,fillW,14);
          ctx.textAlign=ctx.direction==='rtl'?'start':'end';
          ctx.fillStyle='#fff';ctx.font='700 19px sans-serif';
          ctx.fillText(pct[idx]+'%',ctx.direction==='rtl'?80:W-80,barY);
          barY+=66;
        });
        ctx.textAlign='center';ctx.fillStyle='#737b99';ctx.font='400 17px sans-serif';
        wrapCanvasText(ctx,t('identityPrivacyNote').replace(/^\S+\s*/,''),W/2,H-60,760,24);
        canvas.toBlob(blob=>{
          if(!blob)return;
          const url=URL.createObjectURL(blob);
          const a=document.createElement('a');a.href=url;a.download='zivozone-personality.png';document.body.appendChild(a);a.click();a.remove();
          setTimeout(()=>URL.revokeObjectURL(url),4000);
        });
      }catch(e){console.warn('ZIVO identity image:',e);toast(t('firebaseError'),'error')}
    }
    renderIntro();
  }
  function renderChallenges(){window.ZIVOZONE?.Challenges?.renderCenter?.()}
  const NEWS=[{key:'FIFA',url:'https://www.fifa.com/',icon:'🌍',title:O('فيفا','FIFA')},{key:'AFC',url:'https://www.the-afc.com/',icon:'🏆',title:O('الاتحاد الآسيوي','AFC')},{key:'UEFA',url:'https://www.uefa.com/',icon:'⭐',title:O('يويفا','UEFA')},{key:'ESPN',url:'https://www.espn.com/',icon:'📰',title:O('ESPN','ESPN')}];
  function renderNewsSources(){const box=$('#news-list');if(!box)return;box.innerHTML=NEWS.map(n=>`<article class="sports-card"><div class="icon">${n.icon}</div><span class="card-tag">${n.key}</span><h3>${esc(loc(n.title))}</h3><p>${esc(t('sportsIntro'))}</p><a class="btn btn-ghost" href="${n.url}" target="_blank" rel="noopener noreferrer">${t('openNews')}</a></article>`).join('')}
  async function sports(){renderNewsSources();window.ZIVOZONE_NEWS?.load?.();window.ZIVOZONE_FIXTURES?.load?.($('#fixture-list'),lang());}
  function localAIReply(q){const x=q.toLowerCase();if(x.includes('مستوى')||x.includes('level')||x.includes('等级')||x.includes('nivel')||x.includes('स्तर')||x.includes('niveau')||x.includes('سطح'))return`${t('level')} ${state.level} — ${state.xp} XP, ${state.coins} ZIVO.`;if(x.includes('تحد')||x.includes('challenge')||x.includes('挑战')||x.includes('desaf')||x.includes('चुनौ')||x.includes('défi')||x.includes('چالش'))return t('challengeText');if(x.includes('رياض')||x.includes('sport')||x.includes('体育')||x.includes('deporte')||x.includes('खेल')||x.includes('ورزش'))return t('sportsIntro');return t('aiWelcome')}
  async function askAI(message){const payload={message:String(message||'').slice(0,1000),language:lang(),player:{level:state.level,xp:state.xp,gamesPlayed:state.gamesPlayed,coins:state.coins}};try{if(window.ZIVOZONE_REAL_AI?.ask){return await window.ZIVOZONE_REAL_AI.ask(message)}}catch(e){console.warn('ZIVO AI Gemini:',e);if(e?.message)toast(e.message,'error')}try{const f=window.firebase?.functions?.();if(f){const fn=f.httpsCallable(API.aiCallable||'zivoAI');const r=await fn(payload);if(r?.data?.reply)return r.data.reply}}catch(e){console.warn('ZIVO AI callable:',e)}if(API.aiEndpoint){try{const r=await fetch(API.aiEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});if(r.ok){const d=await r.json();if(d.reply)return d.reply}}catch(e){console.warn('ZIVO AI endpoint:',e)}}return localAIReply(message)}
  // V1230.71 — renderChallenges()/renderNewsSources()/sports() were all running unconditionally here,
  // on EVERY page including the prerendered room/* SEO landing pages — which render the entire
  // homepage hidden behind CSS (display:none) purely so their one real CTA can boot the real app. A
  // visitor on one of those pages never sees the challenge list, news cards or sports fixtures (they
  // stay hidden the whole time), yet the page was still doing the Firestore reads and two real
  // network fetches (news.js/match-center.js's .load()) those calls trigger, for nothing. Guarded the
  // same way challenges.js and rooms.js already guard their own boot-time work for this exact page
  // type (see their 'zivo-seo-route' checks) — i18n text application and profile() still run always,
  // since the site chrome (header/nav/footer) on these pages is real and must still be translated.
  function applyLanguage(){const l=lang();document.documentElement.lang=l;document.documentElement.dir=I.dir[l];$$('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;if(I.T[l]?.[k]!==undefined)el.textContent=t(k)});$$('[data-i18n-placeholder]').forEach(el=>el.placeholder=t(el.dataset.i18nPlaceholder));$$('[data-i18n-aria-label]').forEach(el=>el.setAttribute('aria-label',t(el.dataset.i18nAriaLabel)));if(!document.body.classList.contains('zivo-seo-route')){renderChallenges();renderNewsSources();sports()}profile();$('#footer-tagline')?.replaceChildren(document.createTextNode(t('footerTagline')))}
  document.addEventListener('click',e=>{const gameBtn=e.target.closest('[data-game],[data-challenge]');if(gameBtn){e.preventDefault();const id=gameBtn.dataset.game||gameBtn.dataset.challenge;window.ZIVOZONE?.Challenges?.start?.(id)||window.ZIVOZONE_START_CHALLENGE?.(id);return}const action=e.target.closest('[data-action]')?.dataset.action;if(action==='scroll-games'||action==='scroll-challenges'){e.preventDefault();$('#challenges')?.scrollIntoView({behavior:'smooth'});return}if(action==='open-identity'){identity();return}if(action==='login'){A.isLoggedIn()?window.ZIVOZONE?.PlayerHub?.open?.():authModal();return}if(action==='logout'){A.logout().then(()=>{state={level:1,xp:0,coins:0,wins:0,gamesPlayed:0,bestStreak:0,identity:null};saveState();profile();toast(t('logoutDone'))});return}if(action==='refresh-sports'){sports();return}if(action==='ad-info'){toast(t('adText'));return}if(action==='ads-control'){window.ZIVOZONE_ADS?.open?.();return}if(action==='return-challenges'){returnToChallenges();return}});
  function bind(){const audioBtn=$('#audio-toggle');if(audioBtn){audioBtn.textContent=S().isEnabled?.()?'🔊':'🔇';audioBtn.onclick=async()=>{await S().unlock?.();S().toggle?.();audioBtn.textContent=S().isEnabled?.()?'🔊':'🔇'}}/* V1229.16: two language pickers now (header one for desktop, one inside the mobile menu — the
       header one is hidden by CSS under 700px). Same handler for both, so behavior can't drift. */
    const changeLanguage=async v=>{I.set(v);await A.setLanguage(v);applyLanguage();toast(t('updateDone'),'success')};
    ['#language-select','#language-select-nav'].forEach(sel=>{const el=$(sel);if(el){el.value=lang();el.onchange=e=>changeLanguage(e.target.value)}});const accountRoute=()=>A.isAdmin?.()?location.hash='#admin':A.isLoggedIn()?window.ZIVOZONE?.PlayerHub?.open?.():authModal();$('#login-btn').onclick=accountRoute;$$('[data-action="login"]').forEach(b=>b.onclick=accountRoute);
    /* V1230.72 — #ai-form only exists on the real homepage now (room/story SEO pages no longer ship
       the hidden ZIVO AI section's markup at all, see prerender-rooms.mjs/prerender-stories.mjs). This
       used to be an unguarded $('#ai-form').onsubmit=... — on a page missing that element it would
       throw mid-bind() and silently skip every line after it in this function, including the mobile
       nav-toggle wiring below. Null-guarded like every other optional element in this function. */
    const aiForm=$('#ai-form'); if(aiForm) aiForm.onsubmit=async e=>{e.preventDefault();const input=$('#ai-input'),v=input.value.trim();if(!v)return;const box=$('#ai-messages');const u=document.createElement('div');u.className='ai-message user';u.textContent=v;box.append(u);input.value='';const b=document.createElement('div');b.className='ai-message bot';b.textContent='…';box.append(b);b.textContent=await askAI(v);box.scrollTop=box.scrollHeight};
    const navToggle=$('#zivo-nav-toggle'),mainNav=$('.main-nav');
    if(navToggle&&mainNav){
      const setOpen=v=>{document.body.classList.toggle('zivo-nav-open',v);navToggle.setAttribute('aria-expanded',String(v))};
      navToggle.onclick=()=>setOpen(!document.body.classList.contains('zivo-nav-open'));
      mainNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setOpen(false)));
      document.addEventListener('keydown',e=>{if(e.key==='Escape')setOpen(false)});
      document.addEventListener('click',e=>{if(document.body.classList.contains('zivo-nav-open')&&!mainNav.contains(e.target)&&e.target!==navToggle&&!navToggle.contains(e.target))setOpen(false)});
    }
  }
  window.addEventListener('zivozone-auth',e=>{syncFromPlayer();profile();const el=$('#firebase-status');if(el){el.textContent=e.detail?.cloud?'●':'○';el.classList.toggle('online',!!e.detail?.cloud);el.title=e.detail?.cloud?'Firebase connected':'Guest/local mode'}});
  window.addEventListener('zivozone-auth',()=>{A.touchSession?.();A.flushAttempts?.();});
  function resetToHomeIfNeeded(reason='route'){commitRoute(reason);if(location.hash==='#home')window.dispatchEvent(new CustomEvent('zivozone-home-reset'))}
  // V1230.19 — the A.touchSession?.() call that used to sit here was a pure duplicate: auth.js already
  // has its own 'hashchange' listener that calls touchSession() (see auth.js). touchSession() writes to
  // three Firestore documents each time it runs, so this was quietly doubling that write on every single
  // hash change, visibility change, and 5-minute tick (same duplicate removed below too) — real, if
  // modest, extra Firestore cost. Kept this listener for resetToHomeIfNeeded, which is unique to it.
  window.addEventListener('hashchange',()=>{resetToHomeIfNeeded('hashchange');});
  window.addEventListener('popstate',()=>resetToHomeIfNeeded('popstate'));
  window.addEventListener('pageshow',()=>{commitRoute('pageshow');if(location.hash==='#home')window.dispatchEvent(new CustomEvent('zivozone-home-reset'));});
  window.addEventListener('pagehide',()=>{try{S().stopChallenge?.()}catch(e){}});
  window.addEventListener('zivozone-home-reset',()=>{try{S().stopChallenge?.()}catch(e){};try{closeModal()}catch(e){};try{window.ZIVOZONE?.PlayerHub?.close?.()}catch(e){};document.body.classList.remove('zivo-challenge-active','zivo-puzzle-active','zivo-beauty-active','zivo-football-active','zivo-horror-active','horror-active','zivo-darkroom-active','zivo-dark-cinematic','zivo-cinematic-active','zivo-minigame-active','zivo-player-home-open','zivo-nav-open');document.body.style.removeProperty('overflow');const core=document.getElementById('zivo-challenge-core');if(core)core.innerHTML='';document.querySelectorAll('.zivo-puzzle-room,.zbr-root,.zfr-root,.zhr-root,.zivo-challenge-runner').forEach(x=>x.classList.remove('active'));renderChallenges();profile();});
  window.addEventListener('zivozone-language',()=>{['#language-select','#language-select-nav'].forEach(id=>{const sel=$(id);if(sel)sel.value=lang()})});
  loadState();document.addEventListener('DOMContentLoaded',()=>{
  try{bind()}catch(e){console.error('ZIVOZONE bind error:',e)}
  try{applyLanguage()}catch(e){console.error('ZIVOZONE render error:',e)}
  try{mountConsent()}catch(e){console.error('ZIVOZONE consent banner error:',e)}
  try{mountCloneWarning()}catch(e){console.error('ZIVOZONE clone-warning banner error:',e)}
  setTimeout(()=>{window.ZIVOZONE_ROUTER?.features?.reconcile?.(document);window.dispatchEvent(new CustomEvent('zivozone:ui-ready'));$('#app-loader')?.classList.add('hidden')},650)
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
