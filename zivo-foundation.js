
/* ZIVOZONE FOUNDATION CORE
   One controller for UI, challenge sessions, scoring, audio lifecycle, identity test,
   cloud persistence, sports/news, ads, navigation and boot safety.
   Legacy application engines are archived under /legacy and are NOT executed.
*/
(() => {
  'use strict';

  const VERSION='48.0-foundation';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const esc=s=>{const d=document.createElement('div');d.textContent=String(s??'');return d.innerHTML};
  const lang=()=>window.ZIVOZONE_I18N?.get?.()||document.documentElement.lang||'ar';
  const t=k=>window.zivoT?.(k,lang())||({
    start:'ابدأ','exit':'خروج',result:'النتيجة',correct:'الصحيحة',wrong:'الخاطئة',
    loading:'جاري التحميل…',next:'التالي',answer:'إجابة',score:'النتيجة',
    challenges:'التحديات',saved:'تم الحفظ',cloud:'السحابة',guest:'زائر'
  }[k]||k);

  const state={
    ready:false, challenge:null, questions:[], index:0, answers:[], correct:0, timedOut:0,
    startedAt:0, questionStarted:0, timer:null, timeLeft:10, audioMode:null,
    used:new Set(), busy:false, identity:null
  };

  const STORAGE={
    progress:'zivozone_foundation_progress_v48',
    history:'zivozone_foundation_question_history_v48',
    identity:'zivozone_identity_v48'
  };

  function read(key,fallback){
    try{const x=JSON.parse(localStorage.getItem(key));return x==null?fallback:x}catch(e){return fallback}
  }
  function write(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch(e){}}

  function releaseLoader(){
    const l=$('#app-loader');
    if(l){l.classList.add('hidden');l.setAttribute('aria-hidden','true')}
    document.documentElement.classList.add('zivo-foundation-ready');
  }

  function installGlobalSafety(){
    window.addEventListener('error',e=>{console.error('[ZIVOZONE]',e.error||e.message);releaseLoader()});
    window.addEventListener('unhandledrejection',e=>{console.error('[ZIVOZONE]',e.reason);releaseLoader()});
    setTimeout(releaseLoader,2200);
  }

  function normalizeText(v){
    return String(v??'').trim().toLowerCase()
      .replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه')
      .replace(/[،,؛;]/g,' ').replace(/\s+/g,' ');
  }

  function bankList(){
    const out=[];
    const add=(b,idHint)=>{
      if(!b||typeof b!=='object')return;
      const id=String(b.id||idHint||'').trim(); if(!id)return;
      if(!Array.isArray(b.questions)||!b.questions.length)return;
      if(out.some(x=>x.id===id))return;
      out.push({...b,id,questions:b.questions.slice()});
    };
    const main=window.ZIVOZONE_CHALLENGES;
    if(main?.getAll)main.getAll().forEach(b=>add(b));
    else if(main)Object.values(main).forEach(b=>add(b));
    const v18=window.ZIVOZONE_V18_BANK||{};
    Object.values(v18).forEach(b=>add(b));
    const v40=window.ZIVOZONE_V40_BANK||{};
    Object.values(v40).forEach(b=>add(b));
    return out;
  }

  const META={
    iq:{icon:'🧠',image:'🧠',title:'مختبر الذكاء',desc:'استدلال وأنماط وأسئلة ترتفع صعوبتها تدريجيًا.'},
    science:{icon:'🔬',image:'🔬',title:'مختبر العلوم',desc:'علوم تطبيقية واختبارات معرفة.'},
    daily:{icon:'⚡',image:'⚡',title:'تحدي ZIVO اليومي',desc:'جلسة سريعة متجددة.'},
    football:{icon:'⚽',image:'⚽',title:'ذكاء كرة القدم',desc:'قرارات وفهم تكتيكي للعبة.'},
    logic:{icon:'♟️',image:'♟️',title:'المنطق',desc:'استنتاجات وقواعد لا تعتمد على الحفظ.'},
    horror:{icon:'👁️',image:'👁️',title:'الغرفة المظلمة',desc:'تجربة نفسية تفاعلية. لا تلعب وحدك ليلًا.'},
    memory:{icon:'🧩',image:'🧩',title:'الذاكرة والتركيز',desc:'اختبارات استرجاع وانتباه.'},
    strategy:{icon:'♟️',image:'♟️',title:'الاستراتيجية',desc:'قرارات تحت ضغط.'},
    math:{icon:'➗',image:'➗',title:'الرياضيات المتقدمة',desc:'حساب ومنطق رياضي.'},
    logic_extreme:{icon:'🧠',image:'🧠',title:'المنطق المتقدم',desc:'ألغاز عالية الصعوبة.'},
    memory_focus:{icon:'👁️',image:'👁️',title:'ذاكرة تحت الضغط',desc:'استرجاع سريع وتركيز.'},
    football_intelligence:{icon:'⚽',image:'⚽',title:'ذكاء كرة القدم PRO',desc:'قرارات تكتيكية واقعية.'},
    pattern:{icon:'🔷',image:'🔷',title:'كسر الأنماط',desc:'أنماط متدرجة الصعوبة.'},
    focus:{icon:'🎯',image:'🎯',title:'فخ التركيز',desc:'اقرأ بدقة قبل أن تجيب.'}
  };

  function getBank(id){
    const banks=bankList();
    return banks.find(b=>b.id===id)||banks.find(b=>b.id.startsWith(id+'_'))||null;
  }

  function bankQuestion(q){
    const type=q.type||'choice';
    const text=q.q?.[lang()]||q.q?.ar||q.ar||q.question?.[lang()]||q.question?.ar||q.question||'';
    const opts=q.a||q.answers||q.options||[];
    const answers=opts.map(x=>x?.[lang()]||x?.ar||x?.en||String(x));
    let correct=q.c;
    let expected=q.answer??q.extra?.answer;
    if(Array.isArray(expected))expected=expected[0];
    return {raw:q,type,text,answers,correct,expected,id:q.id||crypto.randomUUID?.()||String(Math.random())};
  }

  function isCorrect(q,value){
    if(q.correct!==undefined&&q.correct!==null){
      const idx=Number(value);
      return Number.isInteger(idx)&&idx===Number(q.correct);
    }
    const expected=normalizeText(q.expected);
    const given=normalizeText(value);
    if(!expected)return false;
    return given===expected || expected.split('|').map(normalizeText).includes(given);
  }

  function questionHistory(){
    return read(STORAGE.history,{});
  }
  function markHistory(id,qids){
    const h=questionHistory();
    h[id]=[...(h[id]||[]),...qids].slice(-200);
    write(STORAGE.history,h);
    // Best-effort cloud mirror; never block the player.
    window.ZIVOZONE_AUTH?.getUser?.();
    const user=window.ZIVOZONE_AUTH?.getUser?.();
    if(user?.uid && window.firebase?.firestore){
      window.firebase.firestore().collection('players').doc(user.uid)
        .collection('zivozone').doc('questionHistory')
        .set({history:h,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})
        .catch(e=>console.warn('[ZIVOZONE] history cloud sync',e));
    }
  }

  function chooseQuestions(bank){
    const seen=new Set(questionHistory()[bank.id]||[]);
    const all=bank.questions.map(bankQuestion);
    let fresh=all.filter(q=>!seen.has(q.id));
    if(fresh.length<10)fresh=all;
    // Shuffle, then gently preserve difficulty progression.
    fresh.sort(()=>Math.random()-.5);
    fresh=fresh.slice(0,Math.min(10,fresh.length));
    fresh.sort((a,b)=>(Number(a.raw.d)||Number(a.raw.difficulty)||1)-(Number(b.raw.d)||Number(b.raw.difficulty)||1));
    return fresh;
  }

  function challengeCards(){
    const box=$('#challenge-list'); if(!box)return;
    const preferred=['iq','logic','memory','science','math','football','strategy','daily','horror','logic_extreme','memory_focus','football_intelligence','pattern','focus'];
    const banks=bankList().sort((a,b)=>{
      const ai=preferred.indexOf(a.id),bi=preferred.indexOf(b.id);
      return (ai<0?99:ai)-(bi<0?99:bi);
    });
    const unique=new Set();
    const html=banks.filter(b=>{if(unique.has(b.id))return false;unique.add(b.id);return true})
      .map(b=>{
        const m=META[b.id]||{icon:'🎮',image:'🎮',title:b.title?.[lang()]||b.title?.ar||b.id,desc:b.description||b.desc?.[lang()]||b.desc?.ar||'تحدي ZIVOZONE'};
        const count=Math.max(10,b.questions.length);
        return `<article class="challenge-card" data-card="${esc(b.id)}">
          <div class="challenge-card-media" aria-hidden="true"><span>${m.image}</span></div>
          <div class="challenge-card-body">
            <span class="eyebrow">${count} أسئلة</span>
            <h3>${esc(m.title)}</h3><p>${esc(m.desc)}</p>
            <div class="challenge-card-foot"><span>${m.icon} ${b.id==='horror'?'تجربة نفسية':'10 ثوانٍ / سؤال'}</span>
            <button class="btn btn-primary" data-game="${esc(b.id)}">${t('start')}</button></div>
          </div>
        </article>`;
      }).join('');
    box.innerHTML=html||'<p class="muted">لا توجد تحديات متاحة.</p>';
    $$('.challenge-card').forEach((c,i)=>c.style.setProperty('--card-i',i));
  }

  function scrollChallenges(){
    $('#challenges')?.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function audioStop(){
    try{window.ZIVOZONE_AUDIO?.stopMedia?.()}catch(e){}
    state.audioMode=null;
  }

  async function audioStart(mode){
    state.audioMode=mode;
    try{
      await window.ZIVOZONE_AUDIO?.unlock?.();
      await window.ZIVOZONE_AUDIO?.playAmbient?.(mode);
    }catch(e){console.warn('[ZIVOZONE] audio start',e)}
  }

  function startTimer(){
    clearInterval(state.timer);
    state.questionStarted=performance.now();
    state.timeLeft=10;
    updateTimer();
    state.timer=setInterval(()=>{
      const elapsed=(performance.now()-state.questionStarted)/1000;
      state.timeLeft=clamp(Math.ceil(10-elapsed),0,10);
      updateTimer();
      if(state.timeLeft<=0){clearInterval(state.timer);timeoutQuestion()}
      else if(state.timeLeft<=3)try{window.ZIVOZONE_AUDIO?.tick?.()}catch(e){}
    },100);
  }
  function updateTimer(){
    const n=$('#challenge-timer-value'),bar=$('#challenge-timer-bar');
    if(n)n.textContent=String(state.timeLeft);
    if(bar)bar.style.width=`${state.timeLeft*10}%`;
    const wrap=$('#challenge-timer');if(wrap)wrap.classList.toggle('danger',state.timeLeft<=3);
  }
  function timeoutQuestion(){
    if(state.busy)return;
    state.timedOut++;
    state.answers.push({id:state.questions[state.index]?.id||'',value:null,correct:false,timeout:true});
    try{window.ZIVOZONE_AUDIO?.timeout?.()}catch(e){}
    advance();
  }

  function inputFor(q){
    if(q.correct!==undefined && q.answers.length){
      return `<div class="answer-grid">${q.answers.map((a,i)=>`<button class="answer-choice" data-answer="${i}">${esc(a)}</button>`).join('')}</div>`;
    }
    return `<form class="free-answer" id="free-answer"><input id="answer-input" autocomplete="off" placeholder="اكتب إجابتك هنا" maxlength="300" autofocus><button class="btn btn-primary" type="submit">${t('answer')}</button></form>`;
  }

  function renderQuestion(){
    const q=state.questions[state.index]; if(!q)return finish();
    state.busy=false;
    const modal=$('#modal-root'); if(!modal)return;
    const horror=state.challenge.id==='horror';
    modal.setAttribute('aria-hidden','false');
    modal.innerHTML=`<div class="modal-backdrop challenge-backdrop ${horror?'darkroom-active':''}">
      <div class="modal-card challenge-modal ${horror?'horror-modal':''}" role="dialog" aria-modal="true">
        <button class="modal-close" data-action="quit-game" aria-label="خروج">×</button>
        <div class="challenge-modal-top"><span>QUESTION ${String(state.index+1).padStart(2,'0')} / 10</span>
          <div id="challenge-timer" class="challenge-timer"><b id="challenge-timer-value">10</b><small>ثانية</small></div>
        </div>
        ${horror?'<div class="horror-warning">لا تلعب وحدك ليلًا.</div>':''}
        <div class="challenge-progress"><span id="challenge-timer-bar"></span></div>
        <span class="eyebrow">${esc((META[state.challenge.id]||{}).title||state.challenge.id)}</span>
        <h2 class="question-title">${esc(q.text)}</h2>
        <div id="question-area">${inputFor(q)}</div>
        <p class="muted challenge-hint">${horror?'لا تبحث عن الإجابة الصحيحة الآن… استمر.':'لديك 10 ثوانٍ فقط. لا تتردد.'}</p>
      </div></div>`;
    startTimer();
    if(horror){
      if(state.index===0)audioStart('horror');
      if(state.index===4){setTimeout(()=>{try{window.ZIVOZONE_AUDIO?.distantScream?.();window.ZIVOZONE_AUDIO?.phase?.(3)}catch(e){}},180)}
      if(state.index===7){setTimeout(()=>{try{window.ZIVOZONE_AUDIO?.eerieLaugh?.();window.ZIVOZONE_AUDIO?.phase?.(3)}catch(e){}},220)}
    }
  }

  function start(id){
    if(state.busy)return;
    const bank=getBank(id);
    if(!bank){toast('التحدي غير متاح حاليًا');return}
    state.challenge=bank;state.questions=chooseQuestions(bank);state.index=0;
    state.answers=[];state.correct=0;state.timedOut=0;state.startedAt=performance.now();
    state.busy=true;
    try{window.ZIVOZONE_AUDIO?.unlock?.()}catch(e){}
    if(id==='horror')audioStart('horror');
    else audioStart(id in {iq:1,science:1,daily:1,football:1,logic:1,memory:1,strategy:1,math:1,reaction:1} ? id : 'iq');
    window.dispatchEvent(new CustomEvent('zivozone-challenge-open',{detail:{id}}));
    renderQuestion();
  }

  function answer(value){
    if(state.busy)return;
    state.busy=true;clearInterval(state.timer);
    const q=state.questions[state.index];
    const ok=isCorrect(q,value);
    state.answers.push({id:q.id,value,correct:ok,timeout:false,elapsed:Math.round(performance.now()-state.questionStarted)});
    if(ok)state.correct++;
    try{window.ZIVOZONE_AUDIO?.click?.()}catch(e){}
    // Dark Room deliberately gives no immediate correctness feedback.
    if(state.challenge.id!=='horror'){
      try{ok?window.ZIVOZONE_AUDIO?.correct?.():window.ZIVOZONE_AUDIO?.wrong?.()}catch(e){}
    }
    setTimeout(advance,220);
  }

  function advance(){
    if(state.index>=state.questions.length-1){finish();return}
    state.index++;renderQuestion();
  }

  async function cloudSave(result){
    try{
      const A=window.ZIVOZONE_AUTH;
      if(A?.isLoggedIn?.()){
        const p=A.getPlayer?.()||{};
        const patch={
          xp:Number(p.xp||0)+result.xp,
          coins:Number(p.coins||0)+result.coins,
          gamesPlayed:Number(p.gamesPlayed||0)+1,
          wins:Number(p.wins||0)+(result.correct>=Math.ceil(result.total*.7)?1:0),
          bestStreak:Math.max(Number(p.bestStreak||0),result.correct)
        };
        await A.update(patch);
        await A.saveResult({...result,version:VERSION});
      }
    }catch(e){console.warn('[ZIVOZONE] cloud result',e)}
  }

  function finish(){
    clearInterval(state.timer);state.timer=null;
    audioStop();
    const total=state.questions.length||10, correct=state.correct, timed=state.timedOut;
    const wrong=Math.max(0,total-correct-timed);
    const pct=Math.round(correct/total*100);
    const xp=20+correct*10+Math.max(0,pct-70);
    const coins=1+Math.floor(correct/5);
    const result={challengeId:state.challenge.id,total,correct,wrong,timedOut:timed,percentage:pct,xp,coins,answers:state.answers.slice(),durationMs:Math.round(performance.now()-state.startedAt)};
    markHistory(state.challenge.id,state.questions.map(q=>q.id));
    write(STORAGE.progress,result);
    cloudSave(result);
    const horror=state.challenge.id==='horror';
    const modal=$('#modal-root');
    modal.setAttribute('aria-hidden','false');
    modal.innerHTML=`<div class="modal-backdrop ${horror?'darkroom-result':''}">
      <div class="modal-card result-modal ${horror?'horror-modal':''}">
        <button class="modal-close" data-action="quit-game">×</button>
        <span class="eyebrow">${horror?'لقد خرجت… مؤقتًا':'ZIVOZONE · النتيجة'}</span>
        <h2>${horror?'هل أنت متأكد أنك كنت وحدك؟':'انتهى التحدي'}</h2>
        <div class="result-big">${correct}/${total}</div>
        <div class="result-percent">${pct}%</div>
        <div class="result-breakdown"><span>✅ الصحيحة <b>${correct}</b></span><span>❌ الخاطئة <b>${wrong}</b></span><span>⏱ الوقت <b>${timed}</b></span></div>
        <div class="reward-row"><span>⚡ +${xp} XP</span><span>🪙 +${coins} ZIVO</span></div>
        <div class="result-actions"><button class="btn btn-primary" data-action="retry-game">إعادة</button><button class="btn btn-ghost" data-action="quit-game">خروج</button></div>
      </div></div>`;
  }

  function quit(){
    clearInterval(state.timer);state.timer=null;state.busy=false;
    audioStop();
    const modal=$('#modal-root');
    if(modal){modal.setAttribute('aria-hidden','true');modal.innerHTML=''}
    $('#challenges')?.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function toast(msg){
    const box=$('#toast-container');if(!box)return;
    const el=document.createElement('div');el.className='toast';el.textContent=msg;box.appendChild(el);
    setTimeout(()=>el.remove(),2600);
  }

  function profile(){
    const p=window.ZIVOZONE_AUTH?.getPlayer?.()||read(STORAGE.progress,{});
    if(!p)return;
    const name=p.name||'زائر',email=p.email||'العب كزائر ثم أنشئ حسابًا للحفظ';
    $('#profile-name')?.replaceChildren(document.createTextNode(name));
    $('#profile-email')?.replaceChildren(document.createTextNode(email));
    const xp=Number(p.xp||0),level=Math.max(1,Math.floor(xp/500)+1);
    const map={level,xp,coins:Number(p.coins||0),wins:Number(p.wins||0),bestStreak:Number(p.bestStreak||0)};
    Object.entries({'profile-level':map.level,'profile-xp':map.xp,'profile-coins':map.coins,'profile-wins':map.wins,'profile-best-streak':map.bestStreak}).forEach(([id,v])=>{const e=$('#'+id);if(e)e.textContent=v});
    const bar=$('#xp-progress');if(bar)bar.style.width=`${(xp%500)/5}%`;
    const chip=$('#player-level-chip');if(chip)chip.textContent=`Level ${level}`;
    $$('[data-zivo-balance]').forEach(e=>e.textContent=map.coins);
  }

  function openLogin(){
    if(window.ZIVOZONE_AUTH?.isLoggedIn?.()){location.hash='#profile';return}
    const root=$('#modal-root');if(!root)return;
    root.setAttribute('aria-hidden','false');
    root.innerHTML=`<div class="modal-backdrop"><div class="modal-card">
      <button class="modal-close" data-action="close-modal">×</button><span class="eyebrow">ZIVOZONE ACCOUNT</span>
      <h2>احفظ مستواك في السحابة</h2>
      <form id="account-form"><input name="name" required minlength="2" placeholder="الاسم"><input name="age" required type="number" min="5" max="100" placeholder="العمر"><input name="email" required type="email" placeholder="البريد الإلكتروني"><input name="password" required minlength="6" type="password" placeholder="كلمة المرور"><button class="btn btn-primary full">إنشاء حساب</button></form>
      <button class="btn btn-ghost full" data-action="login-existing">لدي حساب بالفعل</button></div></div>`;
  }

  const IDENTITY_QS=[
    ['عندما تواجه مشكلة جديدة، ما أول شيء تفعله؟',['أحللها خطوة بخطوة','أجرب حلًا سريعًا','أسأل الآخرين','أبحث عن نمط خفي']],
    ['في فريق، أنت غالبًا…',['منظم القرار','صاحب الأفكار','المحفز','المراقب الدقيق']],
    ['تحت ضغط الوقت…',['أرتب الأولويات','أجازف','أطلب المساعدة','أركز على التفاصيل']],
    ['إذا فشل الحل الأول…',['أحلل سبب الفشل','أغير الخطة فورًا','أجرب شيئًا جريئًا','أعود للبيانات']],
    ['ما الذي يجذبك أكثر؟',['الألغاز','المنافسة','الإبداع','اكتشاف النفس']],
    ['في الرياضة تفضل…',['الخطة','السرعة','المخاطرة','قراءة الخصم']],
    ['عندما تختلف مع شخص…',['أبحث عن الدليل','أدافع عن رأيي','أحاول الإقناع','أستمع أولًا']],
    ['كيف تتعامل مع المجهول؟',['أجمع معلومات','أدخل مباشرة','أنتظر الإشارة','أبني احتمالات']],
    ['أكثر ما يزعجك…',['الفوضى','البطء','الملل','الغموض']],
    ['قرار مهم يحتاج…',['منطقًا','شجاعة','مرونة','وقتًا للتفكير']],
    ['إذا رأيت نمطًا غير واضح…',['أقسمه لأجزاء','أختبره','أرسمه','أبحث عن الاستثناء']],
    ['في المنافسة، هدفك…',['الدقة','الفوز','المفاجأة','التفوق الذهني']],
    ['كيف تتعلم أسرع؟',['التطبيق','التجربة','المناقشة','الملاحظة']],
    ['عندما تكون القواعد ناقصة…',['أحدد افتراضاتي','أستفيد من المساحة','أضع قواعد جديدة','أبحث عن السابقة']],
    ['ما وصفك الأقرب؟',['تحليلي','مغامر','اجتماعي','مراقب']],
    ['في لعبة استراتيجية…',['أخطط بعيدًا','أهاجم مبكرًا','أغير الأسلوب','أنتظر خطأ الخصم']],
    ['عندما يخطئ الآخرون…',['أصحح السبب','أتحرك بسرعة','أحافظ على الفريق','أتعلم من الخطأ']],
    ['المعلومة الأقوى هي التي…',['يمكن اختبارها','تفتح فرصة','تغير القرار','تكشف تناقضًا']],
    ['إذا أعطيتك 10 دقائق…',['أبني خطة','أبدأ التنفيذ','أجمع الفريق','أبحث عن أقصر طريق']],
    ['ماذا تريد أن يتركه اللاعب عنك؟',['العقل','الشجاعة','الإبداع','الدقة']]
  ];

  function identity(){
    state.identity={i:0,answers:[]};
    renderIdentity();
  }
  function renderIdentity(){
    const q=IDENTITY_QS[state.identity.i],root=$('#modal-root');
    root.setAttribute('aria-hidden','false');
    root.innerHTML=`<div class="modal-backdrop"><div class="modal-card identity-modal">
      <button class="modal-close" data-action="close-modal">×</button>
      <div class="challenge-modal-top"><span>من أنا؟ · ${state.identity.i+1}/20</span><b>20 سؤال</b></div>
      <div class="challenge-progress"><span style="width:${(state.identity.i/20)*100}%"></span></div>
      <h2>${esc(q[0])}</h2><div class="answer-grid">${q[1].map((a,i)=>`<button class="answer-choice" data-identity="${i}">${esc(a)}</button>`).join('')}</div>
      <p class="muted">هذا اختبار ترفيهي لتحليل نمط اختياراتك، وليس تشخيصًا نفسيًا.</p>
    </div></div>`;
  }
  function identityAnswer(i){
    state.identity.answers.push(Number(i));
    if(state.identity.i<19){state.identity.i++;renderIdentity();return}
    const counts=[0,0,0,0];
    state.identity.answers.forEach(x=>counts[x]++);
    const max=Math.max(...counts),type=counts.indexOf(max);
    const profiles=[
      ['العقل التحليلي','أنت تميل إلى تفكيك المشكلات، اختبار الأدلة، وبناء قرارات هادئة قبل التحرك.'],
      ['المغامر الحاسم','تميل إلى الحركة السريعة، استغلال الفرص، وتحويل الضغط إلى دافع للمواجهة.'],
      ['المبتكر المرن','تبحث عن حلول جديدة، وتتكيف بسرعة عندما تتغير القواعد أو تظهر فرصة غير متوقعة.'],
      ['المراقب الاستراتيجي','تلتقط التفاصيل والأنماط، وتفضل قراءة المشهد كاملًا قبل اختيار اللحظة المناسبة.']
    ][type];
    const words=profiles[1].split(/\s+/).slice(0,25).join(' ');
    write(STORAGE.identity,{type:profiles[0],counts,at:Date.now()});
    const root=$('#modal-root');
    root.innerHTML=`<div class="modal-backdrop"><div class="modal-card identity-modal">
      <button class="modal-close" data-action="close-modal">×</button><span class="eyebrow">من أنا؟ · تحليل 20 سؤال</span>
      <h2>${esc(profiles[0])}</h2><p class="identity-result">${esc(words)}</p>
      <p class="muted">النتيجة وصف ترفيهي مبني على إجاباتك، وليست تقييمًا نفسيًا أو طبيًا.</p>
      <button class="btn btn-primary full" data-action="close-modal">العودة</button>
    </div></div>`;
  }

  async function register(e){
    e.preventDefault();
    const f=new FormData(e.currentTarget);
    try{
      await window.ZIVOZONE_AUTH?.register?.({name:f.get('name'),age:f.get('age'),email:f.get('email'),password:f.get('password')});
      closeModal();profile();toast('تم إنشاء الحساب وحفظ تقدمك سحابيًا');
    }catch(err){toast(err?.message||'تعذر إنشاء الحساب')}
  }
  function closeModal(){const r=$('#modal-root');if(r){r.setAttribute('aria-hidden','true');r.innerHTML=''}}

  async function loginExisting(){
    const root=$('#modal-root');root.innerHTML=`<div class="modal-backdrop"><div class="modal-card">
      <button class="modal-close" data-action="close-modal">×</button><span class="eyebrow">ZIVOZONE ACCOUNT</span><h2>تسجيل الدخول</h2>
      <form id="login-form"><input name="email" required type="email" placeholder="البريد الإلكتروني"><input name="password" required type="password" placeholder="كلمة المرور"><button class="btn btn-primary full">دخول</button></form></div></div>`;
  }
  async function doLogin(e){
    e.preventDefault();const f=new FormData(e.currentTarget);
    try{await window.ZIVOZONE_AUTH?.login?.(f.get('email'),f.get('password'));closeModal();profile();toast('تم تسجيل الدخول')}catch(err){toast(err?.message||'فشل تسجيل الدخول')}
  }

  function renderSports(){
    const l=lang();
    window.ZIVOZONE_NEWS?.load?.($('#news-list'),l);
    window.ZIVOZONE_NEWS?.loadJordan?.($('#jordan-news-list'),l);
    window.ZIVOZONE_FIXTURES?.load?.($('#fixture-list'),l);
  }

  function boot(){
    challengeCards();profile();renderSports();
    window.ZIVOZONE_ADS?.apply?.();
    releaseLoader();state.ready=true;
  }

  document.addEventListener('click',e=>{
    const game=e.target.closest('[data-game],[data-challenge]');
    if(game){e.preventDefault();start(game.dataset.game||game.dataset.challenge);return}
    const identityBtn=e.target.closest('[data-action="open-identity"]');if(identityBtn){e.preventDefault();identity();return}
    const action=e.target.closest('[data-action]')?.dataset.action;
    if(action==='quit-game'||action==='return-challenges'){e.preventDefault();quit();return}
    if(action==='retry-game'){e.preventDefault();start(state.challenge?.id);return}
    if(action==='close-modal'){e.preventDefault();closeModal();return}
    if(action==='login'){e.preventDefault();openLogin();return}
    if(action==='login-existing'){e.preventDefault();loginExisting();return}
    if(action==='ads-control'){window.ZIVOZONE_ADS?.open?.();return}
    if(action==='refresh-sports'){renderSports();return}
    if(action==='scroll-games'||action==='scroll-challenges'){e.preventDefault();scrollChallenges();return}
    const a=e.target.closest('[data-answer]');if(a){answer(a.dataset.answer);return}
    const ia=e.target.closest('[data-identity]');if(ia){identityAnswer(ia.dataset.identity);return}
  },true);

  document.addEventListener('submit',e=>{
    if(e.target.id==='free-answer'){e.preventDefault();answer($('#answer-input')?.value||'');}
    if(e.target.id==='account-form'){register(e)}
    if(e.target.id==='login-form'){doLogin(e)}
  });

  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&state.challenge)quit();
  });

  window.addEventListener('zivozone-auth',()=>profile());
  window.addEventListener('online',()=>{if(state.ready)renderSports()});
  window.addEventListener('offline',()=>toast('وضع عدم الاتصال: التقدم المحلي مستمر'));

  window.ZIVOZONE_FOUNDATION={
    version:VERSION,start,quit,finish,profile,renderSports,
    audit:()=>({version:VERSION,banks:bankList().map(x=>({id:x.id,questions:x.questions.length})),
      firebase:!!window.firebase?.apps?.length,auth:!!window.ZIVOZONE_AUTH,ads:!!window.ZIVOZONE_ADS,audio:!!window.ZIVOZONE_AUDIO})
  };

  installGlobalSafety();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
