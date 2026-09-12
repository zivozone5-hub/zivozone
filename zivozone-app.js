window.ZIVOZONE_INTERNAL=window.ZIVOZONE_INTERNAL||{};
/* ZIVOZONE V1084 — UNIFIED CORE CLEAN RUNTIME */

/* ===== audio.js ===== */
/* ZIVOZONE CINEMATIC AUDIO V11
   Challenge-only music. No background audio on the home page.
   Uses local licensed project audio plus Web Audio spatial effects.
*/
(() => {
  'use strict';
  const KEY='zivozone_audio_v11';
  let enabled=true, volume=.9, ctx=null, master=null, compressor=null, input=null;
  let activeMode=null, started=false, media=null, mediaGain=null, mediaPan=null;
  let timers=[], nodes=[];
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');if(typeof x.enabled==='boolean')enabled=x.enabled;if(Number.isFinite(x.volume))volume=clamp(x.volume,.05,1)}catch(e){}
  function save(){try{localStorage.setItem(KEY,JSON.stringify({enabled,volume}))}catch(e){}}
  function ensure(){if(ctx)return ctx;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;ctx=new AC();input=ctx.createGain();compressor=ctx.createDynamicsCompressor();compressor.threshold.value=-18;compressor.knee.value=24;compressor.ratio.value=10;compressor.attack.value=.004;compressor.release.value=.2;master=ctx.createGain();master.gain.value=enabled?volume:0;input.connect(compressor);compressor.connect(master);master.connect(ctx.destination);return ctx}
  async function unlock(){const c=ensure();if(c?.state==='suspended')try{await c.resume()}catch(e){}if(media&&media.paused&&enabled)try{await media.play()}catch(e){}}
  function connect(node,pan=0){const c=ensure();if(!c||!node)return;const p=c.createStereoPanner?c.createStereoPanner():null;if(p){p.pan.value=clamp(pan,-1,1);node.connect(p);p.connect(input)}else node.connect(input)}
  function tone(freq,dur=.15,gain=.06,type='sine',pan=0,endFreq){const c=ensure();if(!c||!enabled)return;const t=c.currentTime,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(Math.max(20,freq),t);if(endFreq)o.frequency.exponentialRampToValueAtTime(Math.max(20,endFreq),t+dur);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);connect(g,pan);o.start(t);o.stop(t+dur+.04)}
  function noise(dur=.4,gain=.03,filter=900,pan=0){const c=ensure();if(!c||!enabled)return;const n=c.createBufferSource(),b=c.createBuffer(1,Math.max(1,Math.floor(c.sampleRate*dur)),c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;n.buffer=b;const f=c.createBiquadFilter(),g=c.createGain();f.type='lowpass';f.frequency.value=filter;g.gain.setValueAtTime(gain,c.currentTime);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+dur);n.connect(f);f.connect(g);connect(g,pan);n.start();n.stop(c.currentTime+dur+.02)}
  const FILES={
    iq:'assets/audio/iq_ambient.mp3',science:'assets/audio/science_ambient.mp3',daily:'assets/audio/daily_ambient.mp3',football:'assets/audio/football_ambient.mp3',logic:'assets/audio/logic_ambient.mp3',memory:'assets/audio/memory_ambient.mp3',strategy:'assets/audio/strategy_ambient.mp3',math:'assets/audio/math_ambient.mp3',reaction:'assets/audio/reaction_ambient.mp3',horror:'assets/audio/horror_ambient.mp3'
  };
  const GAIN={iq:.55,science:.5,daily:.55,football:.5,logic:.52,memory:.5,strategy:.48,math:.5,reaction:.5,horror:.86};
  function stopMedia(){if(media){try{media.pause();media.currentTime=0}catch(e){}media.remove();media=null}mediaGain=null;mediaPan=null}
  async function playAmbient(mode){stopMedia();if(!enabled||!FILES[mode])return;const c=ensure();if(!c)return;media=document.createElement('audio');media.src=FILES[mode];media.loop=true;media.preload='auto';media.volume=1;media.setAttribute('aria-hidden','true');media.style.display='none';document.body.appendChild(media);const src=c.createMediaElementSource(media);mediaGain=c.createGain();mediaGain.gain.value=GAIN[mode]||.5;mediaPan=c.createStereoPanner?c.createStereoPanner():null;if(mediaPan){mediaPan.pan.value=0;src.connect(mediaGain);mediaGain.connect(mediaPan);mediaPan.connect(input)}else{src.connect(mediaGain);mediaGain.connect(input)}try{await media.play()}catch(e){} }
  function spatialSweep(){if(!mediaPan||!ctx||!enabled)return;const t=ctx.currentTime;mediaPan.pan.cancelScheduledValues(t);mediaPan.pan.setValueAtTime(-.75,t);mediaPan.pan.linearRampToValueAtTime(.72,t+4.2);mediaPan.pan.linearRampToValueAtTime(-.55,t+8.4)}
  function eerieLaugh(){if(activeMode!=='horror'||!enabled)return;[0,.18,.36,.58].forEach((d,i)=>setTimeout(()=>{tone(95+i*11,.18,.095,'sawtooth',i%2?-.7:.7,145+i*15)},d*1000))}
  function distantScream(){if(activeMode!=='horror'||!enabled)return;const c=ensure();if(!c)return;const t=c.currentTime,o=c.createOscillator(),g=c.createGain(),p=c.createStereoPanner?c.createStereoPanner():null;o.type='sawtooth';o.frequency.setValueAtTime(210,t);o.frequency.exponentialRampToValueAtTime(720,t+1.1);o.frequency.exponentialRampToValueAtTime(130,t+1.65);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.16,t+.15);g.gain.exponentialRampToValueAtTime(.04,t+1.1);g.gain.exponentialRampToValueAtTime(.0001,t+1.65);o.connect(g);if(p){p.pan.setValueAtTime(Math.random()>.5?-.95:.95,t);p.pan.linearRampToValueAtTime(Math.random()>.5?.75:-.75,t+1.6);g.connect(p);p.connect(input)}else g.connect(input);o.start(t);o.stop(t+1.7)}
  function horrorPulse(level=1){if(activeMode!=='horror')return;tone(55-level*3,.5,.14,'sawtooth',Math.random()>.5?.9:-.9,24);noise(.4,.08,240,Math.random()>.5?.9:-.9)}
  function phase(level=1){if(activeMode!=='horror')return;horrorPulse(level);if(level>=2){tone(34,.9,.15,'sawtooth',-.7,20);tone(48,.8,.11,'sine',.7,24)}if(level>=3){noise(1.6,.13,260,-.85);noise(1.6,.13,260,.85);distantScream()}}
  function question(d){if(!started||!enabled)return;if(activeMode==='horror'){tone(Math.max(25,78-d*3),.45,.12,'sawtooth',Math.random()>.5?.8:-.8,25);if(d>=7)noise(.5,.06,220,Math.random()>.5?.9:-.9);return}const f=Math.max(60,400-d*22);tone(f,.1,.045,activeMode==='reaction'?'square':'triangle',Math.random()>.5?.4:-.4,f*1.35)}
  function click(){if(!started)return;tone(activeMode==='horror'?170:500,.06,.07,activeMode==='reaction'?'square':'triangle',Math.random()>.5?.25:-.25)}
  function tick(){if(!started||!enabled)return;tone(activeMode==='horror'?260:760,.055,.028,'sine',0,activeMode==='horror'?210:620)}
  function timeout(){if(!started||!enabled)return;if(activeMode==='horror'){tone(48,.35,.11,'sawtooth',0,24);noise(.3,.06,180,Math.random()>.5?.8:-.8)}else{tone(120,.16,.055,'triangle',0,70)}}
  function correct(){if(activeMode==='horror')return;tone(680,.11,.06,'sine',0,950);tone(950,.13,.04,'triangle',.1,1200)}
  function wrong(){if(activeMode==='horror')return;tone(115,.2,.075,'sawtooth',0,52);noise(.16,.025,450)}
  function success(){tone(420,.12,.05,'triangle');tone(620,.16,.05,'triangle',.1,900);tone(900,.22,.05,'sine',-.1,1200)}
  function scaryVoice(text='لا تخرج... أنا أراك.'){if(activeMode!=='horror'||!enabled)return;if('speechSynthesis' in window){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=(document.documentElement.lang||'ar')==='ar'?'ar-SA':'en-US';u.rate=.62;u.pitch=.18;u.volume=Math.min(1,volume*.95);speechSynthesis.speak(u)}catch(e){}}tone(42,.9,.12,'sawtooth',-.5,24);tone(31,1.2,.1,'sine',.5,18);noise(.8,.08,260,Math.random()>.5?.8:-.8)}
  function warden(){if(activeMode!=='horror'||!enabled)return;scaryVoice((document.documentElement.lang||'ar')==='ar'?'لا تخرج... أنا أسمعك.':'Do not leave... I can hear you.')}
  function whisper(){if(activeMode!=='horror'||!enabled)return;scaryVoice((document.documentElement.lang||'ar')==='ar'?'لا أحد هنا... أليس كذلك؟':'No one is here... right?')}
  function checkpoint(){if(activeMode!=='horror'||!enabled)return;horrorPulse(4);tone(25,1.3,.14,'sawtooth',0,16);noise(1.2,.1,180,0)}
  function horrorAnswer(d){if(activeMode!=='horror'||!enabled)return;noise(.25,.045,190,Math.random()>.5?.9:-.9);if(d>=7)tone(28,.7,.1,'sawtooth',Math.random()>.5?.7:-.7,17)}
  function startChallenge(mode){unlock();stopChallenge();activeMode=mode;started=true;playAmbient(mode);const profile={iq:[72,108],science:[118,176],daily:[300,420],football:[82,124],logic:[55,84],memory:[170,255],strategy:[48,72],math:[132,198],reaction:[440,650],horror:[34,51]}[mode]||[72,108];if(enabled){tone(profile[0],.3,.025,'sine',-.35);tone(profile[1],.25,.018,'triangle',.35)}if(mode==='horror'){tone(22,.4,.07,'sine',0);timers.push(setInterval(()=>{if(activeMode!=='horror'||!enabled)return;spatialSweep();noise(1.2,.035,180,Math.sin(Date.now()/1400)*.8);if(Math.random()<.16)eerieLaugh();if(Math.random()<.055)distantScream();if(Math.random()<.035)scaryVoice()},5000));timers.push(setInterval(()=>{if(activeMode!=='horror'||!enabled)return;horrorPulse(Math.min(5,1+Math.floor((Date.now()/1000)%30/6)))},3700))}else{timers.push(setInterval(()=>{if(!enabled||!started)return;spatialSweep();const pan=Math.sin(Date.now()/1800)*.6;tone(profile[0],.5,.022,mode==='reaction'?'square':'sine',pan,profile[1]);noise(.25,.016,mode==='reaction'?1900:1000,-pan*.4)},2400))}}
  function stopChallenge(){timers.forEach(clearInterval);timers=[];stopMedia();nodes.forEach(n=>{try{n.stop()}catch(e){}});nodes=[];if('speechSynthesis' in window)try{speechSynthesis.cancel()}catch(e){}activeMode=null;started=false}
  function setEnabled(v){enabled=!!v;ensure();if(master)master.gain.setTargetAtTime(enabled?volume:0,ctx.currentTime,.08);if(!enabled)stopChallenge();save()}
  function setVolume(v){volume=clamp(Number(v),.05,1);ensure();if(master)master.gain.setTargetAtTime(enabled?volume:0,ctx.currentTime,.08);save()}
  function narrate(text){if(activeMode!=='horror'||!text||!('speechSynthesis' in window))return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=(document.documentElement.lang||'ar')==='ar'?'ar-SA':'en-US';u.rate=.78;u.pitch=.48;u.volume=clamp(volume*.72,.15,.8);speechSynthesis.speak(u)}catch(e){}}
  window.ZIVOZONE_AUDIO={unlock,setEnabled,isEnabled:()=>enabled,toggle:()=>setEnabled(!enabled),setVolume,volume:()=>volume,click,tick,timeout,correct,wrong,success,question,startChallenge,stopChallenge,horrorPulse,phase,checkpoint,narrate,warden,whisper,horrorAnswer,active:()=>started};
})();

/* ===== i18n.js ===== */
/* ============================================================
   ZIVOZONE INTERNATIONALIZATION
   5 core languages: Arabic, English, Chinese, Hindi, Spanish
============================================================ */
(() => {
  'use strict';
  const LANG_KEY = 'zivozone_language_v1';
  const LANGS = ['ar','en','zh','hi','es'];
  const DIR = {ar:'rtl',en:'ltr',zh:'ltr',hi:'ltr',es:'ltr'};
  const T = {
    ar:{brand:'ZIVOZONE',home:'الرئيسية',games:'الألعاب',challenges:'التحديات',ai:'ZIVO AI',identity:'من أنا؟',sports:'الرياضة',profile:'ملفي',login:'🔐 إنشاء حساب / دخول',logout:'تسجيل الخروج',loader:'جاري تجهيز عالمك...',heroEyebrow:'عالم رقمي • ZIVOZONE',heroTitle:'عالمك يبدأ من هنا',heroText:'ألعاب وتحديات وذكاء ورعب وعلوم ورياضة واكتشاف للشخصية في عالم رقمي واحد.',play:'🚀 ابدأ اللعب',discover:'🧠 اكتشف نفسك',languages:'لغات',modes:'أنماط ألعاب',challengesCount:'تحديات',ad:'إعلان',adTitle:'مساحتك الإعلانية هنا',adText:'جاهزة للرعاة عند إطلاق المنصة.',adDetails:'التفاصيل',gamesEyebrow:'ألعاب ZIVO',gamesTitle:'العب وارفع مستواك',iqTitle:'اختبار سرعة الذكاء',iqDesc:'10 أسئلة تتدرج من السهل إلى الصعب جدًا.',horrorTitle:'الغرفة المظلمة',horrorDesc:'10 مراحل نفسية تتصاعد حتى النهاية.',scienceTitle:'تحدي العلوم',scienceDesc:'10 أسئلة علمية بتصعيد حقيقي.',dailyTitle:'تحدي ZIVO اليومي',dailyDesc:'10 أسئلة جديدة بنمط سريع.',playNow:'العب الآن',enter:'ادخل',questions10:'10 أسئلة',daily:'يومي',challengeEyebrow:'مركز التحديات',challengeTitle:'مركز التحديات',challengeText:'كل تحدٍ يبدأ بسهولة ثم يرفع الضغط حتى آخر الأسئلة.',start:'ابدأ',done:'تم اليوم',identityEyebrow:'من أنا؟',identityTitle:'اكتشف شخصيتك داخل ZIVOZONE',identityText:'اختبار ترفيهي يحلل نمط اختياراتك، وليس تشخيصًا نفسيًا.',identityStart:'ابدأ الاختبار',aiEyebrow:'ZIVO AI',aiTitle:'مساعد ZIVO الذكي',aiWelcome:'أهلًا بك 🤖 اسألني عن مستواك أو الألعاب أو التحديات أو الرياضة.',aiPlaceholder:'اكتب سؤالك...',send:'إرسال',aiNote:'مساعد ZIVO يعمل محليًا الآن، ويمكن ربطه بخدمة ذكاء اصطناعي آمنة عبر Backend.',sportsEyebrow:'أخبار وبيانات الرياضة',sportsTitle:'الرياضة العالمية',refresh:'🔄 تحديث',sportsIntro:'نتائج ومباريات وروابط مباشرة إلى مصادر الأخبار الرياضية.',newsSources:'مصادر الأخبار',matches:'المباريات القادمة',openNews:'فتح الأخبار',open:'فتح',noData:'لا توجد بيانات مباشرة الآن.',profileEyebrow:'لاعب ZIVO',guest:'زائر',guestText:'يمكنك اللعب كزائر ثم إنشاء حساب لحفظ تقدمك.',account:'🔐 الحساب',saveHint:'الزائر يستطيع اللعب. الحساب المجاني يحفظ تقدمك وXP وZIVO والنتائج.',level:'المستوى',xp:'XP',coins:'ZIVO',wins:'انتصارات',register:'إنشاء حساب',welcomeBack:'مرحبًا بعودتك',registerHint:'العب كزائر، لكن الحساب يحفظ مستواك وXP ونتائجك.',loginHint:'سجّل الدخول للمتابعة من حيث توقفت.',playerName:'اسم اللاعب',age:'العمر',email:'البريد الإلكتروني',password:'كلمة المرور',yourName:'اسمك',emailPlaceholder:'name@example.com',passwordPlaceholder:'6 أحرف على الأقل',createAccount:'إنشاء الحساب',signIn:'تسجيل الدخول',continueGuest:'أكمل كزائر',createNow:'إنشاء حساب',result:'النتيجة',excellent:'أحسنت! 🔥',roundEnded:'انتهت الجولة',score:'نتيجتك',correct:'صحيحة',difficulty:'الصعوبة',exit:'خروج',again:'إعادة اللعب',close:'إغلاق',saveProgress:'حفظ تقدمي بحساب',guestMode:'وضع الزائر',guestSave:'أعجبتك التجربة؟ أنشئ حسابًا مجانًا حتى لا تضيع نتائجك.',warden:'الحارس: لا تتسرع... أنا أراقب اختياراتك.',whoAmI:'من أنا؟',analysis:'العقل المحلل 🧠',adventurer:'المغامر ⚡',teamPlayer:'اللاعب المتعاون 🤝',identityResult:'نتيجة ترفيهية مبنية على اختياراتك داخل الاختبار.',sportFootball:'كرة القدم',sportBasketball:'كرة السلة',sportTennis:'التنس',sportChampionships:'البطولات',newsUnavailable:'الأخبار الحية تحتاج مفتاح مزود الأخبار أو Backend آمن. روابط المصادر الرسمية متاحة أدناه.',firebaseError:'تعذر الاتصال بخدمة الحساب السحابية. يمكنك متابعة اللعب كزائر.',success:'تمت العملية بنجاح.',logoutDone:'تم تسجيل الخروج.',updateDone:'تم التحديث.',dailyTomorrow:'عد غدًا لتحدي جديد.',footerTagline:'مصمم للجيل القادم.',nameError:'اكتب اسم اللاعب.',ageError:'العمر يجب أن يكون بين 5 و100.',emailError:'البريد الإلكتروني غير صحيح.',passwordError:'كلمة المرور يجب أن تكون 6 أحرف على الأقل.',emailUsed:'هذا البريد مستخدم مسبقًا.',badLogin:'البريد أو كلمة المرور غير صحيحة.',offline:'تعذر الاتصال بالإنترنت.'},
    en:{brand:'ZIVOZONE',home:'Home',games:'Games',challenges:'Challenges',ai:'ZIVO AI',identity:'Who Am I?',sports:'Sports',profile:'Profile',login:'🔐 Create account / Sign in',logout:'Sign out',loader:'Preparing your world...',heroEyebrow:'DIGITAL WORLD • ZIVOZONE',heroTitle:'Your world starts here',heroText:'Games, challenges, intelligence, horror, science, sports and self-discovery in one digital world.',play:'🚀 Start playing',discover:'🧠 Discover yourself',languages:'Languages',modes:'Game modes',challengesCount:'Challenges',ad:'Ad',adTitle:'Your advertising space',adText:'Ready for sponsors when the platform launches.',adDetails:'Details',gamesEyebrow:'ZIVO GAMES',gamesTitle:'Play and level up',iqTitle:'Rapid IQ Challenge',iqDesc:'10 questions from easy to extremely hard.',horrorTitle:'The Dark Room',horrorDesc:'10 psychological stages that intensify to the end.',scienceTitle:'Science Challenge',scienceDesc:'10 science questions with real difficulty scaling.',dailyTitle:'ZIVO Daily Challenge',dailyDesc:'10 fresh fast-paced questions.',playNow:'Play now',enter:'Enter',questions10:'10 questions',daily:'Daily',challengeEyebrow:'CHALLENGE CENTER',challengeTitle:'Challenge Center',challengeText:'Every challenge starts easy, then raises the pressure until the final questions.',start:'Start',done:'Done today',identityEyebrow:'WHO AM I?',identityTitle:'Discover your ZIVOZONE profile',identityText:'A fun preference test, not a psychological diagnosis.',identityStart:'Start test',aiEyebrow:'ZIVO AI',aiTitle:'ZIVO Smart Assistant',aiWelcome:'Welcome 🤖 Ask me about your level, games, challenges or sports.',aiPlaceholder:'Type your question...',send:'Send',aiNote:'ZIVO AI is local right now and can be connected to a secure AI backend.',sportsEyebrow:'SPORTS NEWS & DATA',sportsTitle:'Global Sports',refresh:'🔄 Refresh',sportsIntro:'Matches, events and direct links to sports news sources.',newsSources:'News sources',matches:'Upcoming matches',openNews:'Open news',open:'Open',noData:'No live data right now.',profileEyebrow:'ZIVO PLAYER',guest:'Guest',guestText:'You can play as a guest, then create an account to save your progress.',account:'🔐 Account',saveHint:'Guests can play. A free account saves your progress, XP, ZIVO and results.',level:'Level',xp:'XP',coins:'ZIVO',wins:'Wins',register:'Create account',welcomeBack:'Welcome back',registerHint:'Play as a guest, but an account saves your level, XP and results.',loginHint:'Sign in to continue where you left off.',playerName:'Player name',age:'Age',email:'Email',password:'Password',yourName:'Your name',emailPlaceholder:'name@example.com',passwordPlaceholder:'At least 6 characters',createAccount:'Create account',signIn:'Sign in',continueGuest:'Continue as guest',createNow:'Create account',result:'RESULT',excellent:'Excellent! 🔥',roundEnded:'Round ended',score:'Score',correct:'correct',difficulty:'Difficulty',exit:'Exit',again:'Play again',close:'Close',saveProgress:'Save progress with account',guestMode:'GUEST MODE',guestSave:'Liked the experience? Create a free account so your progress is not lost.',warden:'Warden: Do not rush... I am watching your choices.',whoAmI:'WHO AM I?',analysis:'The Analyst 🧠',adventurer:'The Adventurer ⚡',teamPlayer:'The Team Player 🤝',identityResult:'A fun result based on your choices inside the experience.',sportFootball:'Football',sportBasketball:'Basketball',sportTennis:'Tennis',sportChampionships:'Championships',newsUnavailable:'Live news needs a provider key or secure backend. Official source links are available below.',firebaseError:'Could not connect to cloud account services. You can keep playing as a guest.',success:'Operation completed successfully.',logoutDone:'Signed out.',updateDone:'Updated.',dailyTomorrow:'Come back tomorrow for a new daily challenge.',footerTagline:'Built for the next generation.',nameError:'Enter a player name.',ageError:'Age must be between 5 and 100.',emailError:'Enter a valid email.',passwordError:'Password must be at least 6 characters.',emailUsed:'This email is already in use.',badLogin:'Incorrect email or password.',offline:'Could not connect to the internet.'},
    zh:{brand:'ZIVOZONE',home:'首页',games:'游戏',challenges:'挑战',ai:'ZIVO AI',identity:'我是谁？',sports:'体育',profile:'我的资料',login:'🔐 创建账户 / 登录',logout:'退出登录',loader:'正在准备你的世界...',heroEyebrow:'数字世界 • ZIVOZONE',heroTitle:'你的世界，从这里开始',heroText:'游戏、挑战、智力、恐怖、科学、体育和自我探索，都在一个数字世界里。',play:'🚀 开始游戏',discover:'🧠 发现自己',languages:'语言',modes:'游戏模式',challengesCount:'挑战',ad:'广告',adTitle:'你的广告空间',adText:'平台上线后可用于赞助合作。',adDetails:'详情',gamesEyebrow:'ZIVO 游戏',gamesTitle:'开始游戏并升级',iqTitle:'极速智力挑战',iqDesc:'10道题，从简单逐步提升到极难。',horrorTitle:'黑暗房间',horrorDesc:'10个逐渐增强的心理阶段。',scienceTitle:'科学挑战',scienceDesc:'10道科学题，难度逐步提升。',dailyTitle:'ZIVO 每日挑战',dailyDesc:'10道全新的快速问题。',playNow:'立即游戏',enter:'进入',questions10:'10道题',daily:'每日',challengeEyebrow:'挑战中心',challengeTitle:'挑战中心',challengeText:'每个挑战从简单开始，在最后几题不断提高压力。',start:'开始',done:'今日完成',identityEyebrow:'我是谁？',identityTitle:'发现你在 ZIVOZONE 的风格',identityText:'这是娱乐性偏好测试，不是心理诊断。',identityStart:'开始测试',aiEyebrow:'ZIVO AI',aiTitle:'ZIVO 智能助手',aiWelcome:'欢迎 🤖 可以问我等级、游戏、挑战或体育。',aiPlaceholder:'输入你的问题...',send:'发送',aiNote:'ZIVO AI 当前使用本地助手，可通过安全后端连接真实 AI。',sportsEyebrow:'体育新闻与数据',sportsTitle:'全球体育',refresh:'🔄 刷新',sportsIntro:'比赛、赛事以及体育新闻来源的直接链接。',newsSources:'新闻来源',matches:'即将进行的比赛',openNews:'打开新闻',open:'打开',noData:'目前没有实时数据。',profileEyebrow:'ZIVO 玩家',guest:'访客',guestText:'你可以以访客身份游戏，之后创建账户保存进度。',account:'🔐 账户',saveHint:'访客可以游戏。免费账户可保存进度、XP、ZIVO和结果。',level:'等级',xp:'XP',coins:'ZIVO',wins:'胜利',register:'创建账户',welcomeBack:'欢迎回来',registerHint:'可以先作为访客游戏，账户会保存等级、XP和结果。',loginHint:'登录后继续你的进度。',playerName:'玩家姓名',age:'年龄',email:'电子邮箱',password:'密码',yourName:'你的姓名',emailPlaceholder:'name@example.com',passwordPlaceholder:'至少6个字符',createAccount:'创建账户',signIn:'登录',continueGuest:'继续作为访客',createNow:'创建账户',result:'结果',excellent:'太棒了！🔥',roundEnded:'本轮结束',score:'得分',correct:'答对',difficulty:'难度',exit:'退出',again:'再玩一次',close:'关闭',saveProgress:'使用账户保存进度',guestMode:'访客模式',guestSave:'喜欢这次体验吗？创建免费账户，避免进度丢失。',warden:'守卫：不要急……我正在观察你的选择。',whoAmI:'我是谁？',analysis:'分析者 🧠',adventurer:'冒险者 ⚡',teamPlayer:'团队玩家 🤝',identityResult:'根据你在体验中的选择生成的娱乐性结果。',sportFootball:'足球',sportBasketball:'篮球',sportTennis:'网球',sportChampionships:'锦标赛',newsUnavailable:'实时新闻需要新闻服务商密钥或安全后端。下方提供官方来源链接。',firebaseError:'无法连接云端账户服务。你仍然可以作为访客游戏。',success:'操作成功。',logoutDone:'已退出登录。',updateDone:'已更新。',dailyTomorrow:'明天回来参加新的每日挑战。',footerTagline:'为下一代而打造。',nameError:'请输入玩家姓名。',ageError:'年龄必须在5到100之间。',emailError:'请输入有效的电子邮箱。',passwordError:'密码至少需要6个字符。',emailUsed:'该邮箱已被使用。',badLogin:'邮箱或密码不正确。',offline:'无法连接互联网。'},
    hi:{brand:'ZIVOZONE',home:'होम',games:'गेम्स',challenges:'चैलेंज',ai:'ZIVO AI',identity:'मैं कौन हूँ?',sports:'स्पोर्ट्स',profile:'प्रोफ़ाइल',login:'🔐 अकाउंट बनाएं / लॉगिन',logout:'लॉग आउट',loader:'आपकी दुनिया तैयार हो रही है...',heroEyebrow:'डिजिटल वर्ल्ड • ZIVOZONE',heroTitle:'आपकी दुनिया यहीं से शुरू होती है',heroText:'गेम्स, चैलेंज, बुद्धिमत्ता, हॉरर, विज्ञान, खेल और आत्म-खोज एक डिजिटल दुनिया में।',play:'🚀 खेलना शुरू करें',discover:'🧠 खुद को जानें',languages:'भाषाएँ',modes:'गेम मोड',challengesCount:'चैलेंज',ad:'विज्ञापन',adTitle:'आपकी विज्ञापन जगह',adText:'प्लेटफ़ॉर्म लॉन्च के बाद प्रायोजकों के लिए तैयार।',adDetails:'विवरण',gamesEyebrow:'ZIVO गेम्स',gamesTitle:'खेलें और लेवल बढ़ाएँ',iqTitle:'तेज़ IQ चैलेंज',iqDesc:'10 सवाल, आसान से बेहद कठिन तक।',horrorTitle:'डार्क रूम',horrorDesc:'10 मनोवैज्ञानिक चरण जो अंत तक कठिन होते जाते हैं।',scienceTitle:'साइंस चैलेंज',scienceDesc:'वास्तविक कठिनाई बढ़ाने वाले 10 विज्ञान प्रश्न।',dailyTitle:'ZIVO डेली चैलेंज',dailyDesc:'10 नए तेज़ सवाल।',playNow:'अभी खेलें',enter:'प्रवेश',questions10:'10 सवाल',daily:'दैनिक',challengeEyebrow:'चैलेंज सेंटर',challengeTitle:'चैलेंज सेंटर',challengeText:'हर चैलेंज आसान से शुरू होकर अंतिम सवालों तक दबाव बढ़ाता है।',start:'शुरू करें',done:'आज पूरा',identityEyebrow:'मैं कौन हूँ?',identityTitle:'ZIVOZONE में अपनी शैली खोजें',identityText:'यह मनोरंजनात्मक पसंद परीक्षण है, मनोवैज्ञानिक निदान नहीं।',identityStart:'टेस्ट शुरू करें',aiEyebrow:'ZIVO AI',aiTitle:'ZIVO स्मार्ट असिस्टेंट',aiWelcome:'स्वागत है 🤖 लेवल, गेम्स, चैलेंज या स्पोर्ट्स के बारे में पूछें।',aiPlaceholder:'अपना सवाल लिखें...',send:'भेजें',aiNote:'ZIVO AI अभी स्थानीय सहायक है और सुरक्षित बैकएंड से असली AI से जोड़ा जा सकता है।',sportsEyebrow:'स्पोर्ट्स न्यूज़ और डेटा',sportsTitle:'ग्लोबल स्पोर्ट्स',refresh:'🔄 रिफ्रेश',sportsIntro:'मैच, इवेंट और स्पोर्ट्स न्यूज़ स्रोतों के सीधे लिंक।',newsSources:'न्यूज़ स्रोत',matches:'आने वाले मैच',openNews:'न्यूज़ खोलें',open:'खोलें',noData:'अभी लाइव डेटा उपलब्ध नहीं है।',profileEyebrow:'ZIVO खिलाड़ी',guest:'मेहमान',guestText:'आप मेहमान के रूप में खेल सकते हैं और बाद में अकाउंट बनाकर प्रगति बचा सकते हैं।',account:'🔐 अकाउंट',saveHint:'मेहमान खेल सकते हैं। मुफ़्त अकाउंट आपकी प्रगति, XP, ZIVO और परिणाम बचाता है।',level:'लेवल',xp:'XP',coins:'ZIVO',wins:'जीत',register:'अकाउंट बनाएं',welcomeBack:'वापसी पर स्वागत है',registerHint:'मेहमान की तरह खेलें; अकाउंट आपका लेवल, XP और परिणाम बचाता है।',loginHint:'जहाँ रुके थे वहीं से जारी रखने के लिए लॉगिन करें।',playerName:'खिलाड़ी का नाम',age:'उम्र',email:'ईमेल',password:'पासवर्ड',yourName:'आपका नाम',emailPlaceholder:'name@example.com',passwordPlaceholder:'कम से कम 6 अक्षर',createAccount:'अकाउंट बनाएं',signIn:'लॉगिन',continueGuest:'मेहमान के रूप में जारी रखें',createNow:'अकाउंट बनाएं',result:'परिणाम',excellent:'बहुत बढ़िया! 🔥',roundEnded:'राउंड समाप्त',score:'स्कोर',correct:'सही',difficulty:'कठिनाई',exit:'बाहर',again:'फिर खेलें',close:'बंद करें',saveProgress:'अकाउंट से प्रगति बचाएं',guestMode:'मेहमान मोड',guestSave:'अनुभव पसंद आया? प्रगति बचाने के लिए मुफ़्त अकाउंट बनाएं।',warden:'गार्ड: जल्दी मत करो... मैं तुम्हारे चुनाव देख रहा हूँ।',whoAmI:'मैं कौन हूँ?',analysis:'विश्लेषक 🧠',adventurer:'साहसी ⚡',teamPlayer:'टीम खिलाड़ी 🤝',identityResult:'आपके चुनावों पर आधारित मनोरंजनात्मक परिणाम।',sportFootball:'फुटबॉल',sportBasketball:'बास्केटबॉल',sportTennis:'टेनिस',sportChampionships:'चैंपियनशिप',newsUnavailable:'लाइव न्यूज़ के लिए प्रदाता कुंजी या सुरक्षित बैकएंड चाहिए। नीचे आधिकारिक स्रोत उपलब्ध हैं।',firebaseError:'क्लाउड अकाउंट सेवा से कनेक्ट नहीं हो सका। आप मेहमान के रूप में खेल सकते हैं।',success:'कार्य सफल हुआ।',logoutDone:'लॉग आउट हो गया।',updateDone:'अपडेट हो गया।',dailyTomorrow:'नई डेली चैलेंज के लिए कल वापस आएँ।',footerTagline:'अगली पीढ़ी के लिए बनाया गया।',nameError:'खिलाड़ी का नाम लिखें।',ageError:'उम्र 5 से 100 के बीच होनी चाहिए।',emailError:'सही ईमेल दर्ज करें।',passwordError:'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।',emailUsed:'यह ईमेल पहले से उपयोग में है।',badLogin:'ईमेल या पासवर्ड गलत है।',offline:'इंटरनेट से कनेक्ट नहीं हो सका।'},
    es:{brand:'ZIVOZONE',home:'Inicio',games:'Juegos',challenges:'Desafíos',ai:'ZIVO AI',identity:'¿Quién soy?',sports:'Deportes',profile:'Perfil',login:'🔐 Crear cuenta / Iniciar sesión',logout:'Cerrar sesión',loader:'Preparando tu mundo...',heroEyebrow:'MUNDO DIGITAL • ZIVOZONE',heroTitle:'Tu mundo empieza aquí',heroText:'Juegos, desafíos, inteligencia, terror, ciencia, deportes y autodescubrimiento en un solo mundo digital.',play:'🚀 Empezar a jugar',discover:'🧠 Descúbrete',languages:'Idiomas',modes:'Modos de juego',challengesCount:'Desafíos',ad:'Anuncio',adTitle:'Tu espacio publicitario',adText:'Listo para patrocinadores cuando la plataforma se lance.',adDetails:'Detalles',gamesEyebrow:'JUEGOS ZIVO',gamesTitle:'Juega y sube de nivel',iqTitle:'Desafío de IQ rápido',iqDesc:'10 preguntas de fáciles a extremadamente difíciles.',horrorTitle:'La Habitación Oscura',horrorDesc:'10 etapas psicológicas que aumentan hasta el final.',scienceTitle:'Desafío de Ciencia',scienceDesc:'10 preguntas científicas con dificultad progresiva.',dailyTitle:'Desafío Diario ZIVO',dailyDesc:'10 preguntas rápidas nuevas.',playNow:'Jugar ahora',enter:'Entrar',questions10:'10 preguntas',daily:'Diario',challengeEyebrow:'CENTRO DE DESAFÍOS',challengeTitle:'Centro de desafíos',challengeText:'Cada desafío empieza fácil y aumenta la presión hasta las últimas preguntas.',start:'Empezar',done:'Hecho hoy',identityEyebrow:'¿QUIÉN SOY?',identityTitle:'Descubre tu perfil en ZIVOZONE',identityText:'Una prueba divertida de preferencias, no un diagnóstico psicológico.',identityStart:'Empezar prueba',aiEyebrow:'ZIVO AI',aiTitle:'Asistente inteligente ZIVO',aiWelcome:'Bienvenido 🤖 Pregúntame sobre tu nivel, juegos, desafíos o deportes.',aiPlaceholder:'Escribe tu pregunta...',send:'Enviar',aiNote:'ZIVO AI funciona localmente ahora y puede conectarse a una IA real mediante un backend seguro.',sportsEyebrow:'NOTICIAS Y DATOS DEPORTIVOS',sportsTitle:'Deportes globales',refresh:'🔄 Actualizar',sportsIntro:'Partidos, eventos y enlaces directos a fuentes de noticias deportivas.',newsSources:'Fuentes de noticias',matches:'Próximos partidos',openNews:'Abrir noticias',open:'Abrir',noData:'No hay datos en vivo ahora.',profileEyebrow:'JUGADOR ZIVO',guest:'Invitado',guestText:'Puedes jugar como invitado y luego crear una cuenta para guardar tu progreso.',account:'🔐 Cuenta',saveHint:'Los invitados pueden jugar. Una cuenta gratuita guarda tu progreso, XP, ZIVO y resultados.',level:'Nivel',xp:'XP',coins:'ZIVO',wins:'Victorias',register:'Crear cuenta',welcomeBack:'Bienvenido de nuevo',registerHint:'Juega como invitado, pero una cuenta guarda tu nivel, XP y resultados.',loginHint:'Inicia sesión para continuar donde lo dejaste.',playerName:'Nombre del jugador',age:'Edad',email:'Correo electrónico',password:'Contraseña',yourName:'Tu nombre',emailPlaceholder:'name@example.com',passwordPlaceholder:'Al menos 6 caracteres',createAccount:'Crear cuenta',signIn:'Iniciar sesión',continueGuest:'Continuar como invitado',createNow:'Crear cuenta',result:'RESULTADO',excellent:'¡Excelente! 🔥',roundEnded:'Ronda terminada',score:'Puntuación',correct:'correctas',difficulty:'Dificultad',exit:'Salir',again:'Jugar otra vez',close:'Cerrar',saveProgress:'Guardar progreso con cuenta',guestMode:'MODO INVITADO',guestSave:'¿Te gustó la experiencia? Crea una cuenta gratis para no perder tu progreso.',warden:'Guardián: No te apresures... estoy observando tus decisiones.',whoAmI:'¿QUIÉN SOY?',analysis:'El Analista 🧠',adventurer:'El Aventurero ⚡',teamPlayer:'El Jugador de Equipo 🤝',identityResult:'Resultado divertido basado en tus elecciones dentro de la experiencia.',sportFootball:'Fútbol',sportBasketball:'Baloncesto',sportTennis:'Tenis',sportChampionships:'Campeonatos',newsUnavailable:'Las noticias en vivo requieren una clave de proveedor o un backend seguro. Abajo tienes fuentes oficiales.',firebaseError:'No se pudo conectar con los servicios de cuenta en la nube. Puedes seguir jugando como invitado.',success:'Operación completada.',logoutDone:'Sesión cerrada.',updateDone:'Actualizado.',dailyTomorrow:'Vuelve mañana para un nuevo desafío diario.',footerTagline:'Creado para la próxima generación.',nameError:'Escribe el nombre del jugador.',ageError:'La edad debe estar entre 5 y 100.',emailError:'Escribe un correo válido.',passwordError:'La contraseña debe tener al menos 6 caracteres.',emailUsed:'Este correo ya está en uso.',badLogin:'Correo o contraseña incorrectos.',offline:'No se pudo conectar a Internet.'}
  };
  Object.assign(T.ar,{horrorWarningTitle:'تحذير ZIVOZONE',horrorWarningHeadline:'لا تدخل الغرفة المظلمة باستخفاف',horrorWarningText:'لن يخبرك النظام إذا كانت إجابتك صحيحة أو خاطئة. ستستمر الأسئلة، ويتغير الصوت والمشهد كلما تقدمت.',horrorWarningNight:'يفضل ألا تلعب وحدك في وقت متأخر من الليل. إذا شعرت بعدم الارتياح، اخرج فورًا.',horrorEnter:'دخول الغرفة',horrorQuestion:'سؤال',horrorCheckpoint:'نقطة العبور',horrorCheckpointTitle:'مرّت 10 أسئلة... هل تريد الاستمرار؟',horrorCheckpointText:'إذا واصلت، ستصبح التجربة أكثر كثافة. يمكنك الخروج الآن وحفظ ما وصلت إليه.',horrorWarning:'لا تلعب وحدك في وقت متأخر من الليل.',horrorContinue:'أكمل رغم ذلك',horrorLeave:'أخرج الآن',horrorExitTitle:'خرجت من الغرفة',horrorExitHeadline:'هل كنت أنت من يقرر متى يخرج؟',horrorExitText:'لن نكشف لك الإجابات. ما حدث داخل الغرفة يبقى جزءًا من التجربة.',liveNews:'أخبار رياضية مباشرة',newsFallback:'نعرض المصادر الرسمية إذا تعذر تحميل الأخبار المباشرة.',adsControl:'تحكم الإعلانات',adsControlText:'تحكم مستقل بمساحة الإعلان على هذا الجهاز.',adsEnabled:'إظهار الإعلانات',adsLabel:'إظهار كلمة إعلان',adsDensity:'كثافة الإعلان',horrorAudio:'صوت الغرفة',horrorVolume:'مستوى صوت الغرفة'});
  Object.assign(T.en,{horrorWarningTitle:'ZIVOZONE WARNING',horrorWarningHeadline:'Do not enter the dark room casually',horrorWarningText:'The system will not tell you whether your answer was right or wrong. The questions continue while the sound and atmosphere change around you.',horrorWarningNight:'Avoid playing alone late at night. If you feel uncomfortable, leave immediately.',horrorEnter:'Enter the room',horrorQuestion:'Question',horrorCheckpoint:'Threshold',horrorCheckpointTitle:'10 questions passed... continue?',horrorCheckpointText:'If you continue, the experience becomes more intense. You can leave now and save what you reached.',horrorWarning:'Do not play alone late at night.',horrorContinue:'Continue anyway',horrorLeave:'Leave now',horrorExitTitle:'You left the room',horrorExitHeadline:'Were you the one deciding when to leave?',horrorExitText:'We will not reveal the answers. What happened inside remains part of the experience.',liveNews:'Live sports news',newsFallback:'Official sources are shown if live news cannot be loaded.',adsControl:'Ad control',adsControlText:'Control the ad area independently on this device.',adsEnabled:'Show ads',adsLabel:'Show ad label',adsDensity:'Ad density',horrorAudio:'Room sound',horrorVolume:'Room volume'});
  Object.assign(T.zh,{horrorWarningTitle:'ZIVOZONE 警告',horrorWarningHeadline:'不要轻易进入黑暗房间',horrorWarningText:'系统不会告诉你答案对不对。问题会继续，声音和氛围会随着你的深入而改变。',horrorWarningNight:'尽量不要在深夜独自游玩。如果感到不适，请立即退出。',horrorEnter:'进入房间',horrorQuestion:'问题',horrorCheckpoint:'临界点',horrorCheckpointTitle:'已经过了10个问题……继续吗？',horrorCheckpointText:'继续后体验会更加紧张。你现在可以退出并保存进度。',horrorWarning:'不要在深夜独自游玩。',horrorContinue:'继续',horrorLeave:'现在离开',horrorExitTitle:'你离开了房间',horrorExitHeadline:'是你决定什么时候离开的吗？',horrorExitText:'我们不会告诉你答案。房间里发生的一切将留在体验中。',liveNews:'体育实时新闻',newsFallback:'如果实时新闻无法加载，我们会显示官方来源。',adsControl:'广告控制',adsControlText:'独立控制此设备上的广告区域。',adsEnabled:'显示广告',adsLabel:'显示广告标签',adsDensity:'广告密度',horrorAudio:'房间声音',horrorVolume:'房间音量'});
  Object.assign(T.hi,{horrorWarningTitle:'ZIVOZONE चेतावनी',horrorWarningHeadline:'डार्क रूम में हल्के में प्रवेश न करें',horrorWarningText:'सिस्टम आपको नहीं बताएगा कि आपका उत्तर सही था या गलत। सवाल चलते रहेंगे और ध्वनि व माहौल बदलता जाएगा।',horrorWarningNight:'देर रात अकेले न खेलें। असहज महसूस हो तो तुरंत बाहर निकलें।',horrorEnter:'कमरे में प्रवेश करें',horrorQuestion:'प्रश्न',horrorCheckpoint:'सीमा',horrorCheckpointTitle:'10 प्रश्न पूरे... आगे बढ़ें?',horrorCheckpointText:'आगे बढ़ने पर अनुभव अधिक तीव्र होगा। अभी बाहर निकलकर अपनी प्रगति बचा सकते हैं।',horrorWarning:'देर रात अकेले न खेलें।',horrorContinue:'फिर भी जारी रखें',horrorLeave:'अभी बाहर निकलें',horrorExitTitle:'आप कमरे से बाहर आ गए',horrorExitHeadline:'क्या बाहर निकलने का निर्णय सच में आपका था?',horrorExitText:'हम उत्तर नहीं बताएँगे। कमरे में जो हुआ वह अनुभव का हिस्सा रहेगा।',liveNews:'लाइव खेल समाचार',newsFallback:'लाइव समाचार न मिले तो आधिकारिक स्रोत दिखाए जाएंगे।',adsControl:'विज्ञापन नियंत्रण',adsControlText:'इस डिवाइस पर विज्ञापन क्षेत्र को स्वतंत्र रूप से नियंत्रित करें।',adsEnabled:'विज्ञापन दिखाएँ',adsLabel:'विज्ञापन लेबल दिखाएँ',adsDensity:'विज्ञापन घनत्व',horrorAudio:'कमरे की ध्वनि',horrorVolume:'कमरे का वॉल्यूम'});
  Object.assign(T.es,{horrorWarningTitle:'ADVERTENCIA ZIVOZONE',horrorWarningHeadline:'No entres a la sala oscura a la ligera',horrorWarningText:'El sistema no te dirá si tu respuesta fue correcta o incorrecta. Las preguntas continúan mientras cambian el sonido y la atmósfera.',horrorWarningNight:'Evita jugar solo de madrugada. Si te sientes incómodo, sal inmediatamente.',horrorEnter:'Entrar en la sala',horrorQuestion:'Pregunta',horrorCheckpoint:'Umbral',horrorCheckpointTitle:'Han pasado 10 preguntas... ¿continuar?',horrorCheckpointText:'Si continúas, la experiencia será más intensa. Puedes salir ahora y guardar lo alcanzado.',horrorWarning:'No juegues solo de madrugada.',horrorContinue:'Continuar',horrorLeave:'Salir ahora',horrorExitTitle:'Saliste de la sala',horrorExitHeadline:'¿Fuiste tú quien decidió cuándo salir?',horrorExitText:'No revelaremos las respuestas. Lo ocurrido dentro forma parte de la experiencia.',liveNews:'Noticias deportivas en vivo',newsFallback:'Si no se pueden cargar las noticias, mostraremos fuentes oficiales.',adsControl:'Control de anuncios',adsControlText:'Controla de forma independiente el área de anuncios en este dispositivo.',adsEnabled:'Mostrar anuncios',adsLabel:'Mostrar etiqueta de anuncio',adsDensity:'Densidad de anuncios',horrorAudio:'Sonido de la sala',horrorVolume:'Volumen de la sala'});

  Object.assign(T.ar,{footballTitle:'مختبر كرة القدم',footballDesc:'معرفة وقرارات وتفكير تكتيكي.',logicTitle:'غرفة المنطق',logicDesc:'ألغاز واستنتاجات صعبة.',memoryTitle:'مختبر الذاكرة',memoryDesc:'تذكر وتسلسل وانتباه.',strategyTitle:'غرفة الاستراتيجية',strategyDesc:'قرارات تحت ضغط وموارد محدودة.',mathTitle:'الرياضيات المتقدمة',mathDesc:'حساب ومنطق عددي مرتفع المستوى.',reactionTitle:'تحدي رد الفعل',reactionDesc:'سرعة القرار مع الحفاظ على الدقة.',enterNumber:'أدخل الرقم',writeAnswer:'اكتب إجابتك',submitAnswer:'تأكيد الإجابة',horrorThreshold:'بعد السؤال 15',horrorSignupTitle:'لقد وصلت إلى منطقة لا نفتحها للزوار',horrorSignupText:'أنشئ حسابًا مجانيًا لحفظ دخولك إلى هذه المرحلة، أو أكمل كزائر إذا كنت مصممًا على المتابعة.',jordanFootballNews:'🇯🇴 كرة القدم الأردنية',officialLive:'مصادر رسمية + مباشر'});
  Object.assign(T.en,{footballTitle:'Football Lab',footballDesc:'Knowledge, decisions and tactical thinking.',logicTitle:'Logic Room',logicDesc:'Hard deduction puzzles.',memoryTitle:'Memory Lab',memoryDesc:'Recall, sequence and attention.',strategyTitle:'Strategy Room',strategyDesc:'Decisions under pressure and limited resources.',mathTitle:'Advanced Math',mathDesc:'High-level numerical reasoning.',reactionTitle:'Reaction Challenge',reactionDesc:'Fast decisions with accuracy.',enterNumber:'Enter the number',writeAnswer:'Write your answer',submitAnswer:'Submit answer',horrorThreshold:'After question 15',horrorSignupTitle:'You reached a zone we do not open to guests',horrorSignupText:'Create a free account to save access to this stage, or continue as a guest if you insist.',jordanFootballNews:'🇯🇴 Jordanian Football',officialLive:'Official + live sources'});
  Object.assign(T.zh,{footballTitle:'足球实验室',footballDesc:'足球知识、决策与战术思维。',logicTitle:'逻辑房间',logicDesc:'高难度推理谜题。',memoryTitle:'记忆实验室',memoryDesc:'记忆、顺序与注意力。',strategyTitle:'策略房间',strategyDesc:'压力与有限资源下的决策。',mathTitle:'高级数学',mathDesc:'高难度数值推理。',reactionTitle:'反应挑战',reactionDesc:'保持准确性的快速决策。',enterNumber:'输入数字',writeAnswer:'输入答案',submitAnswer:'提交答案',horrorThreshold:'第15题之后',horrorSignupTitle:'你已进入访客不开放的区域',horrorSignupText:'创建免费账户以保存这一阶段，或坚持以访客身份继续。',jordanFootballNews:'🇯🇴 约旦足球',officialLive:'官方 + 实时来源'});
  Object.assign(T.hi,{footballTitle:'फुटबॉल लैब',footballDesc:'फुटबॉल ज्ञान, निर्णय और सामरिक सोच।',logicTitle:'लॉजिक रूम',logicDesc:'कठिन निष्कर्ष पहेलियाँ।',memoryTitle:'मेमोरी लैब',memoryDesc:'याददाश्त, क्रम और ध्यान।',strategyTitle:'रणनीति कक्ष',strategyDesc:'दबाव और सीमित संसाधनों में निर्णय।',mathTitle:'उन्नत गणित',mathDesc:'उच्च स्तर का संख्यात्मक तर्क।',reactionTitle:'रिएक्शन चैलेंज',reactionDesc:'सटीकता के साथ तेज़ निर्णय।',enterNumber:'संख्या दर्ज करें',writeAnswer:'अपना उत्तर लिखें',submitAnswer:'उत्तर जमा करें',horrorThreshold:'15वें सवाल के बाद',horrorSignupTitle:'आप उस क्षेत्र में पहुँच गए हैं जो मेहमानों के लिए खुला नहीं है',horrorSignupText:'इस चरण को सहेजने के लिए मुफ्त खाता बनाएं, या चाहें तो अतिथि के रूप में जारी रखें।',jordanFootballNews:'🇯🇴 जॉर्डन फुटबॉल',officialLive:'आधिकारिक + लाइव स्रोत'});
  Object.assign(T.es,{footballTitle:'Laboratorio de fútbol',footballDesc:'Conocimiento, decisiones y pensamiento táctico.',logicTitle:'Sala de lógica',logicDesc:'Acertijos de deducción difíciles.',memoryTitle:'Laboratorio de memoria',memoryDesc:'Recuerdo, secuencia y atención.',strategyTitle:'Sala de estrategia',strategyDesc:'Decisiones bajo presión y recursos limitados.',mathTitle:'Matemáticas avanzadas',mathDesc:'Razonamiento numérico avanzado.',reactionTitle:'Desafío de reacción',reactionDesc:'Decisiones rápidas con precisión.',enterNumber:'Introduce el número',writeAnswer:'Escribe tu respuesta',submitAnswer:'Enviar respuesta',horrorThreshold:'Después de la pregunta 15',horrorSignupTitle:'Has llegado a una zona que no abrimos a invitados',horrorSignupText:'Crea una cuenta gratuita para guardar el acceso a esta etapa, o continúa como invitado si insistes.',jordanFootballNews:'🇯🇴 Fútbol jordano',officialLive:'Fuentes oficiales + en vivo'});
  Object.assign(T.ar,{creative:'المبدع 🎨'});
  Object.assign(T.en,{creative:'The Creator 🎨'});
  Object.assign(T.zh,{creative:'创造者 🎨'});
  Object.assign(T.hi,{creative:'रचनाकार 🎨'});
  Object.assign(T.es,{creative:'El Creador 🎨'});
  Object.assign(T.ar,{matchAlertText:'المواجهة الأقرب الآن تظهر هنا مع الموعد والتوقيت المحلي.',fixtureCenter:'⚽ مركز المباريات',finished:'انتهت',upcoming:'قادمة',jordanSchedule:'الدوري الأردني للمحترفين',jordanScheduleText:'المواعيد الرسمية القادمة من الاتحاد الأردني لكرة القدم.',officialSchedule:'الجدول الرسمي'});
  Object.assign(T.en,{matchAlertText:'The nearest Champions League fixture appears here with local kickoff time.',fixtureCenter:'⚽ Match Center',finished:'Finished',upcoming:'Upcoming',jordanSchedule:'Jordan Pro League',jordanScheduleText:'Official upcoming fixtures from the Jordan Football Association.',officialSchedule:'Official schedule'});
  Object.assign(T.zh,{matchAlertText:'最近的欧冠比赛会显示在这里，并按当地时间显示开球时间。',fixtureCenter:'⚽ 比赛中心',finished:'已结束',upcoming:'即将开始',jordanSchedule:'约旦职业联赛',jordanScheduleText:'约旦足协公布的官方赛程。',officialSchedule:'官方赛程'});
  Object.assign(T.hi,{matchAlertText:'सबसे नज़दीकी चैंपियंस लीग मैच और स्थानीय किकऑफ समय यहाँ दिखाई देगा।',fixtureCenter:'⚽ मैच सेंटर',finished:'समाप्त',upcoming:'आगामी',jordanSchedule:'जॉर्डन प्रो लीग',jordanScheduleText:'जॉर्डन फुटबॉल एसोसिएशन का आधिकारिक आगामी कार्यक्रम।',officialSchedule:'आधिकारिक कार्यक्रम'});
  Object.assign(T.es,{matchAlertText:'El próximo partido de Champions aparece aquí con su hora local.',fixtureCenter:'⚽ Centro de partidos',finished:'Finalizado',upcoming:'Próximo',jordanSchedule:'Liga Profesional de Jordania',jordanScheduleText:'Próximos partidos oficiales de la Asociación Jordana de Fútbol.',officialSchedule:'Calendario oficial'});
  Object.assign(T.ar,{timeLeft:'الوقت المتبقي',timeUp:'انتهى الوقت'});
  Object.assign(T.en,{timeLeft:'Time left',timeUp:'Time is up'});
  Object.assign(T.zh,{timeLeft:'剩余时间',timeUp:'时间到'});
  Object.assign(T.hi,{timeLeft:'शेष समय',timeUp:'समय समाप्त'});
  Object.assign(T.es,{timeLeft:'Tiempo restante',timeUp:'Se acabó el tiempo'});
  Object.assign(T.ar,{pressure:'نقاط الضغط',streak:'السلسلة',bestStreak:'أفضل سلسلة',speedBonus:'مكافأة السرعة',timedOut:'انتهى الوقت',pressureHint:'كلما أجبت أسرع، ارتفعت مكافأتك.',secondsPerQuestion:'10 ثوانٍ لكل سؤال'});
  Object.assign(T.en,{pressure:'Pressure score',streak:'Streak',bestStreak:'Best streak',speedBonus:'Speed bonus',timedOut:'Timed out',pressureHint:'The faster you answer, the higher your reward.',secondsPerQuestion:'10 seconds per question'});
  Object.assign(T.zh,{pressure:'压力分',streak:'连击',bestStreak:'最佳连击',speedBonus:'速度奖励',timedOut:'超时',pressureHint:'回答越快，奖励越高。',secondsPerQuestion:'每题10秒'});
  Object.assign(T.hi,{pressure:'प्रेशर स्कोर',streak:'स्ट्रीक',bestStreak:'सर्वश्रेष्ठ स्ट्रीक',speedBonus:'स्पीड बोनस',timedOut:'समय समाप्त',pressureHint:'जितनी जल्दी जवाब देंगे, उतना अधिक इनाम मिलेगा।',secondsPerQuestion:'हर प्रश्न के लिए 10 सेकंड'});
  Object.assign(T.es,{pressure:'Puntuación de presión',streak:'Racha',bestStreak:'Mejor racha',speedBonus:'Bono de velocidad',timedOut:'Tiempo agotado',pressureHint:'Cuanto más rápido respondas, mayor será tu recompensa.',secondsPerQuestion:'10 segundos por pregunta'});
  function get(){return localStorage.getItem(LANG_KEY)||'ar'}
  function set(lang){if(!LANGS.includes(lang))lang='ar';localStorage.setItem(LANG_KEY,lang);document.documentElement.lang=lang;document.documentElement.dir=DIR[lang];window.dispatchEvent(new CustomEvent('zivozone-language',{detail:{lang}}));return lang}
  function tr(key,lang=get()){return (T[lang]&&T[lang][key])||T.ar[key]||key}
  window.ZIVOZONE_I18N={LANGS,T,get,set,tr,dir:DIR};
  window.zivoT=tr;
  set(get());
})();

/* ===== challenges.js ===== */
/* ============================================================
   ZIVOZONE CHALLENGE ENGINE V8
   - Unique pools per challenge
   - 10 questions/session
   - Mixed interaction types
   - Difficulty 1..10, last 3 are extreme
   - Five-language question data with safe fallback
============================================================ */
(() => {
  'use strict';
  const A=(ar,en,zh,hi,es)=>({ar,en,zh,hi,es});
  const Q=(id,type,q,answers,c,d,extra={})=>({id,type,q,a:answers,c,d,...extra});
  const O=(ar,en,zh= en,hi=en,es=en)=>A(ar,en,zh,hi,es);
  const bank={};

  bank.iq={id:'iq',icon:'🧠',xp:110,title:O('مختبر الذكاء','IQ Lab','智力实验室','IQ लैब','Laboratorio IQ'),desc:O('منطق وأنماط واستدلال، وآخر 3 أسئلة شديدة الصعوبة.','Logic, patterns and deduction; the final 3 are extreme.','逻辑、模式与推理；最后3题为极难。','तर्क, पैटर्न और निष्कर्ष; अंतिम 3 बेहद कठिन।','Lógica, patrones y deducción; las últimas 3 son extremas.'),questions:[
    Q('iq-01','choice',O('ما العدد التالي: 3، 6، 12، 24، ؟','What comes next: 3, 6, 12, 24, ?','下一个数字：3、6、12、24、？','अगली संख्या: 3, 6, 12, 24, ?','¿Qué sigue: 3, 6, 12, 24, ?'),[O('36','36'),O('42','42'),O('48','48'),O('54','54')],2,1),
    Q('iq-02','choice',O('إذا كان كل القطط ثدييات وبعض الثدييات سوداء، فما الذي نعرفه يقينًا؟','If all cats are mammals and some mammals are black, what is certain?','如果所有猫都是哺乳动物，而部分哺乳动物是黑色，什么一定成立？','यदि सभी बिल्लियाँ स्तनधारी हैं और कुछ स्तनधारी काले हैं, तो क्या निश्चित है?','Si todos los gatos son mamíferos y algunos mamíferos son negros, ¿qué es seguro?'),[O('كل القطط سوداء','All cats are black'),O('بعض القطط سوداء','Some cats are black'),O('كل القطط ثدييات','All cats are mammals'),O('لا توجد قطط سوداء','No cats are black')],2,2),
    Q('iq-03','number',O('أدخل العدد التالي: 2، 5، 11، 23، 47، ؟','Enter the next number: 2, 5, 11, 23, 47, ?','输入下一个数字：2、5、11、23、47、？','अगली संख्या दर्ज करें: 2, 5, 11, 23, 47, ?','Introduce el siguiente número: 2, 5, 11, 23, 47, ?'),[],95,3,{answer:'2n+1'}),
    Q('iq-04','choice',O('أي كلمة تكمل العلاقة: كتاب : قراءة :: طعام : ؟','Complete: Book : Reading :: Food : ?','完成类比：书：阅读 :: 食物：？','समानता पूरी करें: किताब : पढ़ना :: भोजन : ?','Completa: Libro : Lectura :: Comida : ?'),[O('طبخ','Cooking'),O('أكل','Eating'),O('شراء','Buying'),O('رمي','Throwing')],1,4),
    Q('iq-05','choice',O('لديك 5 صناديق. كل صندوق يحتوي ضعف ما قبله، والأول يحوي 3 كرات. كم في الخامس؟','Five boxes each contain twice the previous box. The first has 3 balls. How many are in the fifth?','五个盒子每个是前一个的两倍，第一个有3个球，第五个有多少？','पाँच डिब्बों में हर अगला पिछले का दोगुना है। पहले में 3 गेंदें हैं। पाँचवें में कितनी हैं?','Cinco cajas tienen el doble que la anterior. La primera tiene 3 bolas. ¿Cuántas hay en la quinta?'),[O('24','24'),O('36','36'),O('48','48'),O('60','60')],2,5),
    Q('iq-06','choice',O('إذا كان A=1 وB=2 ... فما مجموع ZIVO؟','If A=1, B=2... what is the sum of ZIVO?','若A=1、B=2……ZIVO的总和是多少？','यदि A=1, B=2... तो ZIVO का योग कितना है?','Si A=1, B=2... ¿cuál es la suma de ZIVO?'),[O('62','62'),O('64','64'),O('66','66'),O('68','68')],1,6),
    Q('iq-07','choice',O('ثلاثة أشخاص يقولون: علي أطول من سامر، سامر أطول من ليث. من الأقصر؟','Ali is taller than Samer, and Samer is taller than Laith. Who is shortest?','阿里比萨默尔高，萨默尔比莱思高。谁最矮？','अली समीर से लंबा है और समीर लैथ से लंबा है। सबसे छोटा कौन?','Ali es más alto que Samer y Samer que Laith. ¿Quién es el más bajo?'),[O('علي','Ali'),O('سامر','Samer'),O('ليث','Laith'),O('لا يمكن معرفة ذلك','Cannot know')],2,7),
    Q('iq-08','number',O('أدخل العدد: 1، 1، 2، 3، 5، 8، ؟','Enter the next number: 1, 1, 2, 3, 5, 8, ?','输入下一个数字：1、1、2、3、5、8、？','अगली संख्या दर्ज करें: 1, 1, 2, 3, 5, 8, ?','Introduce el siguiente número: 1, 1, 2, 3, 5, 8, ?'),[],13,8,{answer:'13'}),
    Q('iq-09','choice',O('إذا كان لديك 12 عملة، واحدة مزيفة أثقل، وبميزان كفتين و3 وزنات فقط، ما الحد الأقصى لعدد العملات التي يمكنك تمييزها؟','With 12 coins, one counterfeit heavier, a balance scale and only 3 weighings, how many coins can be guaranteed distinguishable?','12枚硬币中一枚更重的假币，用天平称3次，最多可保证识别多少枚？','12 सिक्कों में एक भारी नकली है; तराजू और केवल 3 तौल में अधिकतम कितने सिक्कों को निश्चित रूप से पहचान सकते हैं?','Con 12 monedas y una falsa más pesada, ¿cuántas puedes distinguir con certeza usando 3 pesadas?'),[O('6','6'),O('9','9'),O('12','12'),O('18','18')],2,9),
    Q('iq-10','choice',O('لغز صعب: لديك 100 سجين ومفتاح واحد ومصباح، ويمكن لكل سجين دخول الغرفة مرة واحدة. ما الفكرة القياسية التي تضمن معرفة أن الجميع دخلوا؟','Hard puzzle: 100 prisoners, one key and one lamp; each prisoner enters once. What standard strategy guarantees knowing everyone has entered?','难题：100名囚犯、一个钥匙和一盏灯，每人只进一次。什么标准策略能保证知道所有人都进入过？','कठिन पहेली: 100 कैदी, एक चाबी और एक लैंप; हर कैदी एक बार कमरे में जाता है। कौन सी मानक रणनीति सुनिश्चित करती है कि सभी अंदर आ चुके हैं?','Acertijo difícil: 100 presos, una llave y una lámpara; cada preso entra una vez. ¿Qué estrategia estándar garantiza saber que todos entraron?'),[O('عدّاد عشوائي','Random counter'),O('سجين قائد يعد إشارات المصباح','A designated counter counts lamp signals'),O('إطفاء المصباح دائمًا','Always keep it off'),O('لا توجد طريقة','There is no way')],1,10)
  ]};

  bank.science={id:'science',icon:'🔬',xp:100,title:O('مختبر العلوم','Science Lab','科学实验室','विज्ञान लैब','Laboratorio de ciencia'),desc:O('علوم متنوعة مع أسئلة تطبيقية لا تعتمد على الحفظ فقط.','Mixed science with applied questions, not pure memorization.','综合科学与应用题，而非单纯记忆。','विविध विज्ञान और अनुप्रयोग आधारित प्रश्न।','Ciencia variada con preguntas aplicadas.'),questions:[
    Q('sc-01','choice',O('ما الكوكب المعروف بالكوكب الأحمر؟','Which planet is known as the Red Planet?','哪颗行星被称为红色星球？','किस ग्रह को लाल ग्रह कहा जाता है?','¿Qué planeta es el Planeta Rojo?'),[O('المريخ','Mars'),O('الزهرة','Venus'),O('المشتري','Jupiter'),O('عطارد','Mercury')],0,1),
    Q('sc-02','choice',O('أي وحدة تقيس القوة؟','Which unit measures force?','哪种单位测量力？','बल की इकाई क्या है?','¿Qué unidad mide la fuerza?'),[O('جول','Joule'),O('نيوتن','Newton'),O('واط','Watt'),O('فولت','Volt')],1,2),
    Q('sc-03','choice',O('إذا تضاعفت سرعة جسم، فكيف تتغير طاقته الحركية؟','If an object’s speed doubles, how does kinetic energy change?','物体速度加倍，动能如何变化？','यदि किसी वस्तु की गति दोगुनी हो जाए तो गतिज ऊर्जा कैसे बदलेगी?','Si la velocidad se duplica, ¿cómo cambia la energía cinética?'),[O('تتضاعف','Doubles'),O('تصبح 3 أضعاف','Triples'),O('تصبح 4 أضعاف','Becomes four times'),O('لا تتغير','Unchanged')],2,4),
    Q('sc-04','number',O('كم ثانية في 3.5 دقائق؟','How many seconds are in 3.5 minutes?','3.5分钟有多少秒？','3.5 मिनट में कितने सेकंड होते हैं?','¿Cuántos segundos hay en 3,5 minutos?'),[],210,4,{answer:'210'}),
    Q('sc-05','choice',O('أي عملية تحول الطاقة الضوئية إلى طاقة كيميائية في النبات؟','Which process converts light energy into chemical energy in plants?','植物把光能转为化学能的过程是什么？','पौधों में प्रकाश ऊर्जा को रासायनिक ऊर्जा में बदलने की प्रक्रिया क्या है?','¿Qué proceso convierte la luz en energía química en las plantas?'),[O('التنفس','Respiration'),O('البناء الضوئي','Photosynthesis'),O('التخمر','Fermentation'),O('الانتشار','Diffusion')],1,5),
    Q('sc-06','choice',O('لماذا يبدو القمر مضيئًا؟','Why does the Moon appear bright?','为什么月亮看起来发亮？','चंद्रमा चमकीला क्यों दिखाई देता है?','¿Por qué la Luna parece brillante?'),[O('ينتج ضوءه الخاص','It produces its own light'),O('يعكس ضوء الشمس','It reflects sunlight'),O('يمتص الضوء','It absorbs light'),O('لأنه ساخن مثل الشمس','It is as hot as the Sun')],1,6),
    Q('sc-07','number',O('إذا كان نصف العمر لمادة 8 ساعات، فما النسبة المتبقية بعد 24 ساعة؟ اكتبها كنسبة مئوية.','If a substance has an 8-hour half-life, what percentage remains after 24 hours? Enter a percent.','某物质半衰期为8小时，24小时后剩余百分比是多少？','यदि किसी पदार्थ का अर्ध-आयु 8 घंटे है, 24 घंटे बाद कितना प्रतिशत बचेगा?','Si la vida media es de 8 horas, ¿qué porcentaje queda tras 24 horas?'),[],12.5,8,{answer:'12.5'}),
    Q('sc-08','choice',O('في دائرة كهربائية على التوالي، إذا انقطع أحد المصابيح، ماذا يحدث عادةً؟','In a series circuit, if one lamp breaks, what usually happens?','串联电路中一个灯泡断路通常会怎样？','श्रृंखला परिपथ में एक बल्ब टूट जाए तो सामान्यतः क्या होता है?','En un circuito en serie, si una lámpara se rompe, ¿qué suele pasar?'),[O('البقية تبقى تعمل طبيعيًا','The rest work normally'),O('تنطفئ الدائرة كلها','The whole circuit goes off'),O('تزداد الإضاءة دائمًا','Brightness always increases'),O('لا شيء','Nothing')],1,8),
    Q('sc-09','choice',O('أي مبدأ يفسر أن الضغط يقل عندما تزداد سرعة السائل في جريان مستقر؟','Which principle explains lower pressure at higher fluid speed in steady flow?','稳定流动中速度越高压力越低由什么原理解释？','स्थिर प्रवाह में गति बढ़ने पर दबाव घटने का सिद्धांत क्या है?','¿Qué principio explica que la presión baje al aumentar la velocidad de un fluido?'),[O('أرخميدس','Archimedes'),O('برنولي','Bernoulli'),O('نيوتن الأول','Newton I'),O('كولوم','Coulomb')],1,9),
    Q('sc-10','choice',O('في نظام مغلق، إذا زادت الإنتروبي بشكل طبيعي، أي اتجاه للعمليات هو الأكثر توافقًا مع القانون الثاني للديناميكا الحرارية؟','In a closed system, increasing entropy naturally corresponds to which direction?','封闭系统中熵自然增加对应哪种过程方向？','बंद तंत्र में एंट्रॉपी का स्वाभाविक बढ़ना किस दिशा से मेल खाता है?','En un sistema cerrado, el aumento natural de entropía corresponde a qué dirección?'),[O('نحو حالات أقل احتمالًا','Toward less probable states'),O('نحو حالات أكثر عشوائية/احتمالًا','Toward more probable, more dispersed states'),O('نحو طاقة صفرية','Toward zero energy'),O('نحو سرعة الضوء','Toward light speed')],1,10)
  ]};

  bank.daily={id:'daily',icon:'⚡',xp:70,title:O('تحدي ZIVO اليومي','ZIVO Daily','ZIVO 每日挑战','ZIVO दैनिक','Desafío diario ZIVO'),desc:O('جلسة سريعة تتغير كل يوم وتمنع التكرار قدر الإمكان.','A fast session that rotates questions and minimizes repeats.','每日轮换并尽量避免重复。','तेज़ दैनिक सत्र और न्यूनतम दोहराव।','Sesión rápida con rotación y mínimos repetidos.'),questions:[
    Q('dy-01','number',O('كم يساوي 17 × 6؟','What is 17 × 6?','17 × 6 等于多少？','17 × 6 कितना है?','¿Cuánto es 17 × 6?'),[],102,1,{answer:'102'}),
    Q('dy-02','choice',O('أي دولة عربية تقع فيها مدينة العقبة؟','Aqaba is in which Arab country?','亚喀巴位于哪个阿拉伯国家？','अकाबा किस अरब देश में है?','¿En qué país árabe está Aqaba?'),[O('الأردن','Jordan'),O('مصر','Egypt'),O('تونس','Tunisia'),O('عُمان','Oman')],0,1),
    Q('dy-03','choice',O('إذا كان لديك 24 ثم طرحت 9 ثم أضفت 7، ما الناتج؟','Start with 24, subtract 9, then add 7. Result?','24减9再加7是多少？','24 में से 9 घटाकर 7 जोड़ें। परिणाम?','Empieza con 24, resta 9 y suma 7. ¿Resultado?'),[O('20','20'),O('21','21'),O('22','22'),O('23','23')],2,2),
    Q('dy-04','input',O('اكتب أول حرف من كلمة ZIVO بالعربية كما تنطقها: ز','Type the first Arabic letter of ZIVO as pronounced: ز','输入ZIVO第一个音的阿拉伯字母：ز','ZIVO के पहले उच्चरित अरबी अक्षर को लिखें: ز','Escribe la primera letra árabe del sonido de ZIVO: ز'),[],0,3,{answer:['ز','z']}),
    Q('dy-05','choice',O('ما العدد الذي يقبل القسمة على 3 و4 معًا؟','Which number is divisible by both 3 and 4?','哪个数字同时能被3和4整除？','कौन सी संख्या 3 और 4 दोनों से विभाजित होती है?','¿Qué número es divisible por 3 y 4?'),[O('10','10'),O('12','12'),O('14','14'),O('18','18')],1,4),
    Q('dy-06','number',O('إذا كان محيط مربع 36، فما طول الضلع؟','A square has perimeter 36. What is the side length?','正方形周长36，边长是多少？','वर्ग का परिमाप 36 है। भुजा कितनी है?','Un cuadrado tiene perímetro 36. ¿Cuánto mide el lado?'),[],9,5,{answer:'9'}),
    Q('dy-07','choice',O('أي نمط يأتي بعد: A, C, F, J, ؟','What comes next: A, C, F, J, ?','下一个字母：A、C、F、J、？','अगला अक्षर: A, C, F, J, ?','¿Qué sigue: A, C, F, J, ?'),[O('M','M'),O('N','N'),O('O','O'),O('P','P')],2,7),
    Q('dy-08','choice',O('إذا كان 40% من عدد ما يساوي 28، فما العدد؟','If 40% of a number is 28, what is the number?','一个数的40%等于28，该数是多少？','किसी संख्या का 40% 28 है, संख्या क्या है?','Si el 40% de un número es 28, ¿cuál es el número?'),[O('56','56'),O('60','60'),O('70','70'),O('84','84')],2,8),
    Q('dy-09','choice',O('لديك 3 مفاتيح خارج غرفة و3 مصابيح داخلها. يمكنك دخول الغرفة مرة واحدة. ما أفضل فكرة؟','Three switches outside control three bulbs inside; enter once. Best idea?','外面三个开关控制里面三个灯，只能进房一次。最佳思路？','तीन स्विच बाहर और तीन बल्ब अंदर हैं，只能进入一次。最佳 विचार?','Tres interruptores controlan tres bombillas y solo puedes entrar una vez. ¿Mejor idea?'),[O('التخمين','Guess'),O('استخدام الحرارة مع الضوء','Use light plus bulb heat'),O('كسر الباب','Break the door'),O('لا يمكن','Impossible')],1,9),
    Q('dy-10','choice',O('إذا كان كل رقم في سلسلة يساوي مجموع الرقمين السابقين ناقص 1، وبدأنا 3،4، فما الرقم الرابع؟','Each term equals the sum of the previous two minus 1. Starting 3,4, what is the fourth term?','每项等于前两项之和减1，从3、4开始，第4项是多少？','हर पद पिछले दो का योग माइनस 1 है। 3,4 से शुरू करें, चौथा पद?','Cada término es la suma de los dos anteriores menos 1. Empezando 3,4, ¿cuál es el cuarto?'),[O('8','8'),O('9','9'),O('10','10'),O('11','11')],1,10)
  ]};

  bank.football={id:'football',icon:'⚽',xp:110,title:O('مختبر كرة القدم','Football Lab','足球实验室','फुटबॉल लैब','Laboratorio de fútbol'),desc:O('أسئلة كروية من المعرفة إلى القرار التكتيكي.','From football knowledge to tactical decision-making.','从足球知识到战术决策。','फुटबॉल ज्ञान से सामरिक निर्णय तक।','Del conocimiento futbolístico a la decisión táctica.'),questions:[
    Q('fb-01','choice',O('كم لاعبًا يبدأ به الفريق في الملعب؟','How many players start on the field for one team?','一支球队场上开始时有多少球员？','एक टीम के कितने खिलाड़ी मैदान पर शुरू करते हैं?','¿Cuántos jugadores inicia un equipo en el campo?'),[O('9','9'),O('10','10'),O('11','11'),O('12','12')],2,1),
    Q('fb-02','choice',O('متى يُحتسب الهدف؟','When is a goal awarded?','何时算进球？','गोल कब माना जाता है?','¿Cuándo se concede un gol?'),[O('عندما تتجاوز الكرة خط المرمى بالكامل وفق القواعد','When the ball wholly crosses the goal line under the Laws'),O('عندما تلمس القائم','When it touches the post'),O('عندما يطلب الجمهور','When fans ask'),O('عند أي تسديدة','On any shot')],0,2),
    Q('fb-03','choice',O('أنت متقدم 1-0، الدقائق الأخيرة والخصم يضغط. ما الخيار الأقل مخاطرة؟','You lead 1-0 late while the opponent presses. Which option is generally lower risk?','你1-0领先且对手末段施压，哪种选择通常风险更低？','आप 1-0 आगे हैं और अंत में विपक्ष दबाव डाल रहा है। सामान्यतः कम जोखिम वाला विकल्प?','Vas ganando 1-0 y el rival presiona al final. ¿Qué opción suele tener menor riesgo?'),[O('فتح الخطوط بالكامل','Open all lines'),O('الحفاظ على التماسك وتقليل المساحات','Keep compactness and reduce spaces'),O('إرسال كل المدافعين للهجوم','Send all defenders forward'),O('التوقف عن اللعب','Stop playing')],1,4),
    Q('fb-04','choice',O('ما الهدف الرئيسي من الضغط العكسي مباشرة بعد فقدان الكرة؟','Main aim of counter-pressing immediately after losing the ball?','丢球后立即反抢的主要目标？','गेंद खोने के तुरंत बाद काउंटर-प्रेसिंग का मुख्य उद्देश्य?','¿Objetivo principal de la presión tras pérdida?'),[O('استرجاع الكرة أو منع التمريرة الأولى','Win it back or disrupt the first pass'),O('العودة للمرمى فورًا دائمًا','Always retreat immediately'),O('إضاعة الوقت','Waste time'),O('تغيير الحارس','Change the goalkeeper')],0,5),
    Q('fb-05','number',O('فريق سجل 18 هدفًا في 6 مباريات. ما متوسطه في المباراة؟','A team scores 18 goals in 6 matches. Average per match?','一队6场进18球，场均多少？','एक टीम ने 6 मैचों में 18 गोल किए। प्रति मैच औसत?','Un equipo marca 18 goles en 6 partidos. ¿Promedio por partido?'),[],3,5,{answer:'3'}),
    Q('fb-06','choice',O('إذا كان الظهير يتقدم باستمرار، ما الحركة التي تساعد على خلق توازن؟','If a full-back constantly advances, what movement can help maintain balance?','边后卫不断前插，什么跑动有助于保持平衡？','यदि फुल-बैक लगातार आगे बढ़ता है, कौन सी मूवमेंट संतुलन बनाए रख सकती है?','Si el lateral sube constantemente, ¿qué movimiento ayuda a mantener el equilibrio?'),[O('تقدم الجناح نفسه في الخط نفسه دائمًا','Winger always stays on the same line'),O('تغطية الجناح أو لاعب الوسط للمساحة','Winger/midfielder covers the space'),O('إخراج الحارس','Remove the goalkeeper'),O('إيقاف الهجوم','Stop attacking')],1,6),
    Q('fb-07','choice',O('فريق يواجه كتلة منخفضة جدًا. ما الذي يزيد فرص الاختراق؟','Against a very low block, what generally increases penetration chances?','面对低位防守，什么通常增加渗透机会？','बहुत गहरी लो ब्लॉक के खिलाफ क्या आमतौर पर पैठ बढ़ाता है?','Contra un bloque bajo, ¿qué suele aumentar las opciones de penetración?'),[O('تدوير الكرة بسرعة مع تغيير جهة اللعب','Fast circulation and switching sides'),O('تمريرات عرضية عشوائية فقط','Random crosses only'),O('إبطاء كل قرار','Slow every decision'),O('إلغاء التحرك بدون كرة','Remove off-ball movement')],0,7),
    Q('fb-08','choice',O('في 4-3-3، إذا أصبح الجناح عريضًا جدًا، ماذا يمكن أن يفتح؟','In a 4-3-3, what can an extremely wide winger help open?','4-3-3中边锋站得很宽可以打开什么？','4-3-3 में बहुत चौड़ा विंगर क्या खोल सकता है?','En 4-3-3, ¿qué puede abrir un extremo muy abierto?'),[O('الممر الداخلي لنصف المساحة','The inside half-space'),O('مقاعد البدلاء','The bench'),O('غرفة الملابس','The dressing room'),O('لا شيء','Nothing')],0,8),
    Q('fb-09','choice',O('أمام ضغط رجل لرجل، ما الحل التكتيكي الأكثر منطقية عادة؟','Against man-oriented pressing, which tactical solution is often logical?','面对人盯人式压迫，通常合理的战术解决方案？','मैन-ओरिएंटेड प्रेसिंग के खिलाफ सामान्यतः कौन सा समाधान तर्कसंगत है?','Ante una presión orientada al hombre, ¿qué solución suele ser lógica?'),[O('خلق لاعب ثالث وتحريك الخصم','Create a third-man option and move the marker'),O('الثبات في نفس المكان','Stay static'),O('إيقاف التمرير','Stop passing'),O('اللعب بلا عرض','Play with no width')],0,9),
    Q('fb-10','choice',O('في الدقيقة 88 والنتيجة 2-2، فريقك لديه استحواذ آمن لكن الخصم متقدم في عدد اللاعبين أمام الكرة. ما القرار الأكثر نضجًا؟','At 88’ with 2-2, you have safe possession but the opponent has many players ahead of the ball. Most mature choice?','88分钟2-2，你安全控球但对手有很多人压在球前，最成熟的选择？','88वें मिनट में 2-2, आपके पास सुरक्षित कब्जा लेकिन विपक्ष गेंद के आगे人数多。最成熟的决定?','En el 88’ con 2-2, tienes posesión segura pero el rival tiene muchos jugadores por delante del balón. ¿Decisión más madura?'),[O('مخاطرة عمياء في العمق','Blind risk into the centre'),O('إدارة المخاطر مع اختيار لحظة الهجوم','Manage risk and choose the right attacking moment'),O('إرجاع الكرة للحارس دائمًا','Always pass to the keeper'),O('إخراج الكرة من الملعب','Kick it out')],1,10)
  ]};

  bank.logic={id:'logic',icon:'♟️',xp:120,title:O('غرفة المنطق','Logic Room','逻辑房间','लॉजिक रूम','Sala de lógica'),desc:O('استنتاجات وألغاز لا تعتمد على الحفظ.','Deduction and puzzles, not memorization.','推理与谜题，而非记忆。','निष्कर्ष और पहेलियाँ, याददाश्त नहीं।','Deducción y acertijos, no memoria.'),questions:[
    Q('lg-01','choice',O('إذا كانت جميع المربعات مستطيلات، هل كل مستطيل مربع؟','If all squares are rectangles, are all rectangles squares?','如果所有正方形都是矩形，所有矩形都是正方形吗？','यदि सभी वर्ग आयत हैं, क्या सभी आयत वर्ग हैं?','Si todos los cuadrados son rectángulos, ¿todos los rectángulos son cuadrados?'),[O('نعم','Yes'),O('لا','No'),O('فقط أحيانًا','Only sometimes'),O('لا يمكن معرفة ذلك','Cannot know')],1,2),
    Q('lg-02','number',O('إذا كان X + X + 6 = 20، فما X؟','If X + X + 6 = 20, what is X?','若X+X+6=20，X是多少？','यदि X + X + 6 = 20, X क्या है?','Si X + X + 6 = 20, ¿X?'),[],7,2,{answer:'7'}),
    Q('lg-03','choice',O('رجل ينظر إلى صورة ويقول: ليس لي أخ أو أخت، لكن والد هذا الرجل هو ابن أبي. من في الصورة؟','A man says: I have no siblings, but the father of the person in the photo is my father’s son. Who is in the photo?','一个男人说：我没有兄弟姐妹，但照片里人的父亲是我父亲的儿子。照片里是谁？','एक आदमी कहता है: मेरा कोई भाई-बहन नहीं, लेकिन तस्वीर वाले व्यक्ति का पिता मेरे पिता का बेटा है। तस्वीर में कौन है?','Un hombre dice: no tengo hermanos, pero el padre de la persona de la foto es el hijo de mi padre. ¿Quién está en la foto?'),[O('والده','His father'),O('ابنه','His son'),O('عمه','His uncle'),O('صديقه','His friend')],1,4),
    Q('lg-04','choice',O('أربعة أشخاص يعبرون جسرًا ليلًا بمصباح واحد، أزمنتهم 1 و2 و7 و10 دقائق، ويعبر اثنان كحد أقصى. أقل زمن؟','Four people cross a bridge at night with one lamp; times 1,2,7,10 minutes, max two at once. Minimum total time?','四人过桥时间1、2、7、10分钟，一盏灯最多两人，最短总时间？','चार लोग 1,2,7,10 मिनट में पुल पार करते हैं，一灯，每次最多两人。最短 समय?','Cuatro personas tardan 1,2,7,10 min; una linterna, máximo dos. ¿Tiempo mínimo?'),[O('17','17'),O('19','19'),O('21','21'),O('23','23')],1,6),
    Q('lg-05','input',O('اكتب عدد الحروف في كلمة “منطق”','Enter the number of letters in the Arabic word “منطق”.','输入阿拉伯词“منطق”的字母数。','अरबी शब्द “منطق” में अक्षरों की संख्या लिखें।','Escribe el número de letras de la palabra árabe “منطق”.'),[],4,5,{answer:'4'}),
    Q('lg-06','choice',O('إذا كانت قاعدة الصندوق: كل ما يدخل يُخرج معكوسه. أدخل 123 ثم أعد الناتج مرة أخرى، ماذا يعود؟','A box reverses every input. Enter 123 then feed the output back once. What returns?','一个盒子把输入倒序。输入123，再把输出输入一次，得到什么？','एक बॉक्स हर इनपुट को उलटता है। 123 डालें और आउटपुट फिर डालें, क्या मिलेगा?','Una caja invierte cada entrada. Entra 123 y vuelve a introducir la salida. ¿Qué obtienes?'),[O('123','123'),O('321','321'),O('111','111'),O('213','213')],0,7),
    Q('lg-07','choice',O('تسلسل: 2، 3، 5، 9، 17، ؟ القاعدة تضاعف الفرق ثم تضيف 1. التالي؟','Sequence 2,3,5,9,17. The difference doubles then +1. Next?','序列2、3、5、9、17，差值翻倍再加1。下一项？','क्रम 2,3,5,9,17; अंतर दोगुना फिर +1। अगला?','Secuencia 2,3,5,9,17; la diferencia se duplica y luego +1. ¿Siguiente?'),[O('29','29'),O('31','31'),O('33','33'),O('35','35')],1,8),
    Q('lg-08','choice',O('لغز الصادق والكاذب: شخصان، أحدهما يكذب دائمًا والآخر يصدق دائمًا. A يقول: B كاذب. ماذا تستطيع استنتاجه؟','Truth/liar puzzle: A says “B is a liar.” What can you infer?','真假话者：A说“B是骗子”。你能推断什么？','सच्चा/झूठा पहेली: A कहता है “B झूठा है।” क्या निष्कर्ष?','Dos personas: una siempre miente y otra siempre dice la verdad. A dice “B miente”. ¿Qué deduces?'),[O('A كاذب وB صادق','A lies, B tells truth'),O('A صادق وB كاذب','A tells truth, B lies'),O('كلاهما كاذبان','Both lie'),O('لا يمكن أن نعرف','Cannot know')],1,9),
    Q('lg-09','choice',O('إذا كانت 5 آلات تصنع 5 قطع في 5 دقائق بنفس المعدل، كم آلة لصنع 100 قطعة في 100 دقيقة؟','If 5 machines make 5 items in 5 minutes at the same rate, how many machines make 100 items in 100 minutes?','5台机器5分钟做5件，100分钟做100件需要多少台？','5 मशीनें 5 मिनट में 5 वस्तुएँ बनाती हैं। 100 मिनट में 100 वस्तुओं के लिए कितनी मशीनें?','Si 5 máquinas hacen 5 piezas en 5 minutos, ¿cuántas para 100 piezas en 100 minutos?'),[O('1','1'),O('5','5'),O('10','10'),O('20','20')],0,9),
    Q('lg-10','choice',O('أصعب: لديك 8 كرات متطابقة وواحدة أثقل، ميزان كفتين ووزنتان فقط. كيف تضمن تحديدها؟','Hard: 8 identical balls, one heavier, two weighings. How guarantee finding it?','难题：8个相同球一个更重，两次天平称量，如何保证找到？','कठिन: 8 समान गेंदें, एक भारी, केवल दो तौल। कैसे सुनिश्चित करें?','Difícil: 8 bolas idénticas, una más pesada y dos pesadas. ¿Cómo garantizar encontrarla?'),[O('3-3-2 ثم 1-1','3-3-2 then 1-1'),O('4-4 ثم 2-2','4-4 then 2-2'),O('2-2-2-2 ثم تخمين','2-2-2-2 then guess'),O('لا يمكن','Impossible')],0,10)
  ]};

  bank.horror={id:'horror',icon:'👁️',xp:180,special:true,title:O('الغرفة المظلمة','The Dark Room','黑暗房间','डार्क रूम','La Habitación Oscura'),desc:O('تجربة نفسية متصاعدة بلا إجابات صحيحة أو خاطئة. بعد كل 10 أسئلة يتغير الإيقاع.','An escalating psychological experience with no right/wrong feedback. The rhythm changes every 10 questions.','不断升级的心理体验，不显示对错，每10题改变节奏。','बढ़ता हुआ मनोवैज्ञानिक अनुभव, सही/गलत नहीं बताया जाता। हर 10 सवाल में माहौल बदलता है।','Experiencia psicológica creciente sin mostrar aciertos o fallos. El ritmo cambia cada 10 preguntas.'),questions:[
    Q('hr-01','choice',O('لو وجدت بابًا لا تتذكر أنك فتحته، هل تدخل أم تراقبه أولًا؟','If you find a door you do not remember opening, do you enter or watch it first?','如果你发现一扇你不记得打开过的门，你会进去还是先观察？','यदि आपको ऐसा दरवाज़ा मिले जिसे खोलना याद नहीं, क्या आप अंदर जाएंगे या पहले देखेंगे?','Si encuentras una puerta que no recuerdas haber abierto, ¿entras o la observas primero?'),[O('أدخل','Enter'),O('أراقب','Watch'),O('أغلقه','Close it'),O('أطلب المساعدة','Ask for help')],0,1),
    Q('hr-02','choice',O('أيهما يزعجك أكثر: صوت خلفك أم صمت مفاجئ؟','Which is more unsettling: a sound behind you or sudden silence?','哪个更令人不安：身后的声音还是突然的寂静？','क्या अधिक परेशान करता है: पीछे की आवाज़ या अचानक सन्नाटा?','¿Qué inquieta más: un sonido detrás o un silencio repentino?'),[O('الصوت','The sound'),O('الصمت','The silence'),O('كلاهما','Both'),O('لا شيء','Neither')],1,2),
    Q('hr-03','choice',O('إذا سمعت اسمك من غرفة فارغة، ماذا تفعل؟','If you hear your name from an empty room, what do you do?','如果你从空房间听到自己的名字，你会怎么做？','यदि खाली कमरे से अपना नाम सुनें, क्या करेंगे?','Si oyes tu nombre desde una habitación vacía, ¿qué haces?'),[O('أدخل فورًا','Enter immediately'),O('أستمع أولًا','Listen first'),O('أهرب','Run'),O('أتجاهله','Ignore it')],1,3),
    Q('hr-04','choice',O('أمامك ثلاثة أزرار: أحمر، أبيض، أسود. أي واحد تختار دون معرفة وظيفته؟','Three buttons: red, white, black. Which do you press without knowing their function?','三个按钮：红、白、黑。不知道功能你按哪个？','तीन बटन: लाल, सफेद, काला। कार्य जाने बिना कौन दबाएँगे?','Tres botones: rojo, blanco, negro. ¿Cuál pulsas sin saber su función?'),[O('الأحمر','Red'),O('الأبيض','White'),O('الأسود','Black'),O('لا أضغط','None')],3,4),
    Q('hr-05','input',O('اكتب أول شيء يخطر ببالك عند كلمة: مراقبة','Type the first thing that comes to mind when you read: watched.','看到“被注视”时，你第一个想到什么？','“देखे जाने” पर सबसे पहले क्या सोचते हैं？','Escribe lo primero que te viene a la mente al leer: observado.'),[],0,5,{answer:'*'}),
    Q('hr-06','choice',O('إذا تكرر صوت خطواتك بنصف ثانية بعد كل خطوة، هل تغير سرعتك؟','If your footsteps repeat half a second later, do you change your pace?','如果你的脚步声每次晚半秒重复，你会改变速度吗？','यदि आपके कदमों की आवाज़ हर बार आधे सेकंड बाद दोहरती है, क्या आप गति बदलेंगे?','Si tus pasos se repiten medio segundo después, ¿cambias el ritmo?'),[O('نعم','Yes'),O('لا','No'),O('أجرب تغييرها','I test a change'),O('أتوقف','I stop')],2,6),
    Q('hr-07','choice',O('أي مكان تفضّل أن تكون فيه الآن؟','Where would you rather be right now?','你现在更愿意在哪里？','आप अभी कहाँ रहना पसंद करेंगे?','¿Dónde preferirías estar ahora?'),[O('مكان مضاء','A lit place'),O('مكان مألوف','A familiar place'),O('مع شخص آخر','With someone else'),O('لا يهم','Does not matter')],0,7),
    Q('hr-08','choice',O('إذا تغيّر ترتيب الخيارات دون أن تلمس الشاشة، هل تكمل؟','If the options rearrange without you touching the screen, do you continue?','如果选项在你没触碰屏幕时重新排列，你会继续吗？','यदि विकल्प बिना छुए बदल जाएँ, क्या आप जारी रखेंगे?','Si las opciones se reordenan sin tocar la pantalla, ¿sigues?'),[O('أكمل','Continue'),O('أتوقف','Stop'),O('أعيد تحميل الصفحة','Reload'),O('أخرج','Exit')],0,8),
    Q('hr-09','choice',O('أيهما أكثر إزعاجًا: أن تسمع اسمك، أم أن ترى اسمك مكتوبًا؟','Which is more unsettling: hearing your name or seeing it written?','哪种更不安：听到自己的名字还是看到名字被写下？','क्या अधिक परेशान करता है: अपना नाम सुनना या लिखा हुआ देखना?','¿Qué inquieta más: oír tu nombre o verlo escrito?'),[O('سماعه','Hearing it'),O('رؤيته','Seeing it'),O('كلاهما','Both'),O('لا شيء','Neither')],1,9),
    Q('hr-10','choice',O('إذا قال لك النظام: “السؤال التالي ليس لك”، هل تفتح السؤال؟','If the system says “the next question is not for you,” do you open it?','如果系统说“下一题不是给你的”，你会打开吗？','यदि सिस्टम कहे “अगला सवाल आपके लिए नहीं है”, क्या खोलेंगे?','Si el sistema dice “la siguiente pregunta no es para ti”, ¿la abres?'),[O('نعم','Yes'),O('لا','No'),O('بعد التفكير','After thinking'),O('أغلق اللعبة','Close the game')],0,10)
  ]};


  const horrorExtra=[
    ['hr-11','choice','إذا سمعت نفس النغمة كلما انتقلت إلى سؤال جديد، هل تعتبرها صدفة؟','If the same tone appears on every new question, do you treat it as coincidence?',['صدفة|Coincidence','إشارة|A signal','خطأ|An error','لا أعرف|I do not know'],1,4],
    ['hr-12','choice','إذا أصبح الضوء أضعف قليلًا، هل تلاحظ ذلك؟','If the light becomes slightly dimmer, do you notice it?',['نعم|Yes','لا|No','بعد فترة|Later','لا يهم|Does not matter'],0,5],
    ['hr-13','choice','هل تفضل أن تعرف ما وراء الباب أم أن يبقى مجهولًا؟','Would you rather know what is behind the door or keep it unknown?',['أعرف|Know','يبقى مجهولًا|Keep it unknown','لا أدخل|Do not enter','أغادر|Leave'],0,5],
    ['hr-14','choice','إذا تغيّر اسم اللعبة للحظة ثم عاد، هل تكمل؟','If the game title changes for a moment and returns, do you continue?',['أكمل|Continue','أتوقف|Stop','أعيد التحميل|Reload','أخرج|Exit'],0,6],
    ['hr-15','choice','أيهما أقوى في خيالك: ما تراه أم ما لا تستطيع رؤيته؟','Which is stronger in your imagination: what you see or what you cannot see?',['ما أراه|What I see','ما لا أراه|What I cannot see','كلاهما|Both','لا شيء|Neither'],1,6],
    ['hr-16','input','اكتب كلمة واحدة تصف شعورك الآن.','Type one word describing how you feel now.',[],0,6,{answer:'*'}],
    ['hr-17','choice','لو ظهر رقم على الشاشة لم تكتبه، هل تحفظه في ذاكرتك؟','If a number appears that you did not type, do you memorize it?',['نعم|Yes','لا|No','أتحقق منه|Check it','أتجاهله|Ignore it'],2,7],
    ['hr-18','choice','إذا شعرت أن الصوت يتحرك من خلفك إلى جانبك، هل تلتفت؟','If the sound seems to move from behind you to your side, do you turn?',['نعم|Yes','لا|No','أخفض الصوت|Lower volume','أخرج|Exit'],0,7],
    ['hr-19','choice','هل تستطيع الاستمرار إذا لم تحصل على أي تفسير؟','Can you continue without receiving any explanation?',['نعم|Yes','لا|No','ربما|Maybe','أحتاج تفسيرًا|I need an explanation'],0,8],
    ['hr-20','choice','إذا قيل لك إن السؤال التالي سيستمر بعد خروجك، ماذا تختار؟','If told the next question continues after you leave, what do you choose?',['أستمر|Continue','أخرج|Leave','أعيد الصفحة|Reload','أتجاهل الرسالة|Ignore it'],0,8],
    ['hr-21','choice','أي أسوأ: أن تعرف أن هناك من يراقب، أم ألا تعرف؟','Which is worse: knowing someone is watching or not knowing?',['أن أعرف|Knowing','ألا أعرف|Not knowing','كلاهما|Both','لا فرق|No difference'],1,8],
    ['hr-22','choice','لو سمعت طرقًا واحدًا ثم صمتًا طويلًا، هل تتوقع الثاني؟','If you hear one knock then a long silence, do you expect a second?',['نعم|Yes','لا|No','ربما|Maybe','لا أفكر|I do not think about it'],0,9],
    ['hr-23','choice','إذا أصبحت الخيارات أربعة بدل ثلاثة دون سبب، هل تختار أسرع؟','If options become four instead of three without explanation, do you choose faster?',['نعم|Yes','لا|No','أتوقف|Stop','أقرأها كلها|Read them all'],3,9],
    ['hr-24','choice','لو ظهر اسمك داخل نص السؤال، هل تعتبره جزءًا من اللعبة؟','If your name appears inside the question, do you consider it part of the game?',['نعم|Yes','لا|No','أتحقق أولًا|Check first','أخرج|Exit'],2,9],
    ['hr-25','input','اكتب الرقم الذي تشعر أنه سيظهر بعد قليل.','Type the number you feel will appear next.',[],0,9,{answer:'*'}],
    ['hr-26','choice','إذا تغيّر اتجاه النص للحظة، ما أول شيء تفعله؟','If the text direction changes for a moment, what do you do first?',['أكمل|Continue','أتحقق من الشاشة|Check the screen','أخرج|Exit','أغلق الصوت|Mute'],1,10],
    ['hr-27','choice','لو ظهر زر واحد فقط مكتوب عليه “استمر”، هل تضغطه؟','If only one button appears saying “continue”, do you press it?',['نعم|Yes','لا|No','أنتظر|Wait','أغادر|Leave'],0,10],
    ['hr-28','choice','هل الصمت الكامل في غرفة مظلمة يخيفك أكثر من الصوت؟','Is complete silence in a dark room scarier than sound?',['نعم|Yes','لا|No','يعتمد|Depends','لا شيء|Neither'],2,10],
    ['hr-29','choice','إذا بدأ السؤال يعكس صياغته أمامك، هل تحاول قراءته حتى النهاية؟','If the question starts changing its wording in front of you, do you read it to the end?',['نعم|Yes','لا|No','أعيد التحميل|Reload','أخرج|Exit'],0,10],
    ['hr-30','choice','آخر سؤال في هذه الدورة: هل كنت تختار الإجابات أم كانت الإجابات تختارك؟','Final question of this cycle: were you choosing the answers, or were the answers choosing you?',['أنا أختار|I choose','الأسئلة تختار|The questions choose','كلاهما|Both','لا أعرف|I do not know'],3,10]
  ];
  horrorExtra.forEach(([id,type,arq,enq,opts,c,d,extra])=>{
    const answers=opts.map(v=>{const [ar,en]=v.split('|');return O(ar,en,en,en,en)});
    bank.horror.questions.push(Q(id,type,O(arq,enq,enq,enq,enq),answers,c,d,extra||{}));
  });

  // Additional modes: compact but deep pools generated from stable unique templates.
  bank.memory={id:'memory',icon:'🧩',xp:105,title:O('مختبر الذاكرة','Memory Lab','记忆实验室','मेमोरी लैब','Laboratorio de memoria'),desc:O('اختبارات ذاكرة وتسلسل وانتباه، مع أنماط مختلفة عن الاختيار التقليدي.','Memory, sequence and attention tests beyond ordinary multiple choice.','记忆、序列和注意力测试，不只是选择题。','स्मृति, अनुक्रम और ध्यान के मिश्रित परीक्षण।','Memoria, secuencias y atención más allá del test clásico.'),questions:[]};
  bank.strategy={id:'strategy',icon:'♜',xp:115,title:O('غرفة الاستراتيجية','Strategy Room','策略房间','रणनीति कक्ष','Sala de estrategia'),desc:O('قرارات تحت ضغط وموارد محدودة.','Decisions under pressure and limited resources.','在压力与有限资源下做决策。','दबाव और सीमित संसाधनों में निर्णय।','Decisiones bajo presión y recursos limitados.'),questions:[]};
  bank.math={id:'math',icon:'➗',xp:120,title:O('الرياضيات المتقدمة','Advanced Math','高级数学','उन्नत गणित','Matemáticas avanzadas'),desc:O('حساب ومنطق عددي بمستوى مرتفع.','High-level arithmetic and numerical logic.','高难度计算与数值逻辑。','उच्च स्तर की गणना और संख्यात्मक तर्क।','Cálculo y lógica numérica avanzada.'),questions:[]};

  const fill=(id,items)=>{bank[id].questions=items.map((x,i)=>Q(`${id}-${String(i+1).padStart(2,'0')}`,x.type,O(x.ar,x.en,x.zh||x.en,x.hi||x.en,x.es||x.en),x.answers||[],x.c||0,x.d,x.extra||{}))};
  fill('memory',[
    {type:'choice',ar:'رتب الأرقام ذهنيًا ثم اختر الترتيب الصحيح: 7،2،9،4',en:'Remember 7,2,9,4. Which order is correct?',answers:[O('7294','7294'),O('2749','2749'),O('7942','7942'),O('9274','9274')],c:0,d:1},
    {type:'number',ar:'احفظ 3،8،1،6 ثم أدخل الرقم الثالث.',en:'Remember 3,8,1,6 then enter the third number.',c:1,d:2,extra:{answer:'1'}},
    {type:'choice',ar:'ما العنصر المختلف في السلسلة: دائرة، مثلث، دائرة، مربع؟',en:'Which item breaks the pattern: circle, triangle, circle, square?',answers:[O('الأول','First'),O('الثاني','Second'),O('الثالث','Third'),O('الرابع','Fourth')],c:3,d:3},
    {type:'number',ar:'إذا حفظت 14،22،31،40، ما مجموع الرقمين الأوسطين؟',en:'Remember 14,22,31,40. Sum the two middle values.',c:53,d:4,extra:{answer:'53'}},
    {type:'choice',ar:'تذكر التسلسل: أحمر، أزرق، أخضر، أصفر. ما اللون الثاني؟',en:'Remember: red, blue, green, yellow. What was second?',answers:[O('أحمر','Red'),O('أزرق','Blue'),O('أخضر','Green'),O('أصفر','Yellow')],c:1,d:5},
    {type:'input',ar:'احفظ 6-1-9-3 ثم اكتبها معكوسة.',en:'Remember 6-1-9-3 then type it reversed.',c:0,d:6,extra:{answer:'3916'}},
    {type:'choice',ar:'أي سلسلة تطابق النمط الذي رأيته: ▲ ● ■ ▲ ● ؟',en:'Which completes the pattern: ▲ ● ■ ▲ ● ?',answers:[O('▲','▲'),O('●','●'),O('■','■'),O('◆','◆')],c:2,d:7},
    {type:'number',ar:'احفظ 17،4،29،8،11. ما حاصل 17+8؟',en:'Remember 17,4,29,8,11. What is 17+8?',c:25,d:8,extra:{answer:'25'}},
    {type:'choice',ar:'أي رقم كان في الموقع الرابع في التسلسل: 5،12،3،19،7،2؟',en:'Which number was fourth in: 5,12,3,19,7,2?',answers:[O('3','3'),O('12','12'),O('19','19'),O('7','7')],c:2,d:9},
    {type:'input',ar:'تذكر 4-8-2-7-1 ثم اكتب الرقمين الأول والأخير متجاورين.',en:'Remember 4-8-2-7-1 then enter the first and last digits together.',c:0,d:10,extra:{answer:'41'}}
  ]);
  fill('strategy',[
    {type:'choice',ar:'لديك 10 وحدات طاقة ومهمتان: الأولى 7 والثانية 6. لا يمكنك تنفيذ إلا واحدة الآن. اختر المهمة الأعلى عائدًا إذا كان عائد الأولى 20 والثانية 24.',en:'You have 10 energy; tasks cost 7 and 6. Rewards are 20 and 24. Which is better now?',answers:[O('الأولى','First'),O('الثانية','Second'),O('أي واحدة','Either'),O('لا تنفذ','None')],c:1,d:1},
    {type:'choice',ar:'خصمك يملك سرعة أعلى لكن دفاعه ضعيف. ما الخطة الأكثر منطقية؟',en:'Opponent is faster but has weak defense. Best plan?',answers:[O('هجوم سريع مع تغيير الاتجاه','Fast attack with direction changes'),O('الانتظار فقط','Only wait'),O('إبطاء كل شيء','Slow everything'),O('عدم التحرك','Do not move')],c:0,d:2},
    {type:'number',ar:'ميزانية 50، تكلفة القرار الأول 18 والثاني 17. كم يتبقى إذا اخترت الاثنين؟',en:'Budget 50; costs 18 and 17. How much remains after both?',c:15,d:3,extra:{answer:'15'}},
    {type:'choice',ar:'في لعبة موارد، المخزون ممتلئ تقريبًا وظهر عنصر نادر مؤقت. ماذا تفعل؟',en:'Inventory is nearly full and a rare temporary item appears. Best move?',answers:[O('تتجاهله','Ignore it'),O('تستبدل عنصرًا منخفض القيمة','Replace a low-value item'),O('تنتظر حتى يختفي','Wait'),O('تغلق اللعبة','Quit')],c:1,d:4},
    {type:'choice',ar:'إذا كان خصمك يكرر نفس الهجوم، ما أفضل استجابة استراتيجية؟',en:'If an opponent repeats the same attack, best strategic response?',answers:[O('التكيف واستغلال النمط','Adapt and exploit the pattern'),O('تكرار نفس الخطأ','Repeat the same mistake'),O('التوقف','Stop'),O('التخمين العشوائي','Random guess')],c:0,d:5},
    {type:'choice',ar:'لديك 3 أدوار فقط: اجمع معلومات، نفذ، ثم صحح. ما الترتيب الأفضل غالبًا؟',en:'You have 3 turns: gather info, act, correct. Best order?',answers:[O('معلومات ← تنفيذ ← تصحيح','Info → act → correct'),O('تصحيح ← تنفيذ ← معلومات','Correct → act → info'),O('تنفيذ فقط','Act only'),O('عشوائي','Random')],c:0,d:6},
    {type:'number',ar:'موردك 100 وينخفض 15% كل جولة. بعد جولتين كم تقريبًا؟',en:'A resource of 100 falls by 15% each round. After two rounds?',c:72.25,d:7,extra:{answer:'72.25'}},
    {type:'choice',ar:'خصمك يحاول دفعك لاتخاذ قرار سريع عندما تكون معلوماتك ناقصة. ما الأفضل؟',en:'Opponent pressures you to decide quickly with incomplete information. Best move?',answers:[O('تأخير القرار لجمع معلومة حاسمة','Delay to gather a decisive fact'),O('الاندفاع','Rush'),O('التخلي عن الخطة','Abandon plan'),O('اختيار عشوائي','Random choice')],c:0,d:8},
    {type:'choice',ar:'في وضع 2 مقابل 1، ما الذي يزيد الخيارات؟',en:'In a 2-v-1 situation, what increases options?',answers:[O('تثبيت المدافع ثم تغيير الزاوية','Fix the defender then change angle'),O('الوقوف','Stand still'),O('إخفاء المساحة','Hide space'),O('التراجع دائمًا','Always retreat')],c:0,d:9},
    {type:'choice',ar:'لديك معلومتان صحيحتان وواحدة مشكوك بها. قرارك عالي المخاطر. ما النهج الأفضل؟',en:'Two facts are reliable and one is uncertain. High-risk decision. Best approach?',answers:[O('ابن القرار على المؤكد واختبر المشكوك','Base on reliable facts and test the uncertain one'),O('تجاهل كل شيء','Ignore everything'),O('اعتمد على المشكوك فقط','Use the uncertain fact only'),O('تخمين','Guess')],c:0,d:10}
  ]);
  fill('math',[
    {type:'number',ar:'احسب: 48 ÷ 6 + 7',en:'Calculate: 48 ÷ 6 + 7',c:15,d:1,extra:{answer:'15'}},
    {type:'number',ar:'إذا كان 3x=27، فما x؟',en:'If 3x=27, what is x?',c:9,d:2,extra:{answer:'9'}},
    {type:'choice',ar:'أي كسر أكبر؟',en:'Which fraction is largest?',answers:[O('3/8','3/8'),O('5/12','5/12'),O('4/9','4/9'),O('7/16','7/16')],c:2,d:3},
    {type:'number',ar:'مساحة مستطيل 12×7؟',en:'Area of a 12×7 rectangle?',c:84,d:4,extra:{answer:'84'}},
    {type:'choice',ar:'ما العدد الذي إذا زاد 20% أصبح 72؟',en:'What number becomes 72 after a 20% increase?',answers:[O('54','54'),O('60','60'),O('64','64'),O('66','66')],c:1,d:5},
    {type:'number',ar:'حل: 2x+5=19',en:'Solve: 2x+5=19',c:7,d:6,extra:{answer:'7'}},
    {type:'choice',ar:'ما مجموع الزوايا الداخلية لمسدس؟',en:'Sum of interior angles of a hexagon?',answers:[O('540°','540°'),O('600°','600°'),O('720°','720°'),O('900°','900°')],c:0,d:7},
    {type:'number',ar:'إذا كان المتوسط لـ 8 و12 و16 وx يساوي 14، فما x؟',en:'Mean of 8,12,16,x is 14. Find x.',c:20,d:8,extra:{answer:'20'}},
    {type:'choice',ar:'حل المعادلة: x²=81 مع x موجب.',en:'Solve x²=81 for positive x.',answers:[O('7','7'),O('8','8'),O('9','9'),O('10','10')],c:2,d:9},
    {type:'number',ar:'متتالية حسابية تبدأ 7 وفرقها 13. ما الحد العاشر؟',en:'Arithmetic sequence starts at 7 with common difference 13. 10th term?',c:124,d:10,extra:{answer:'124'}}
  ]);

  // V53 — Forensic Lab: cinematic detective case (non-graphic)
  bank.forensic={id:'forensic',icon:'🕵️',xp:150,title:O('المختبر الجنائي','Forensic Lab','法医实验室','फोरेंसिक लैब','Laboratorio forense'),desc:O('مسرح جريمة درامي غير دموي: اجمع الأدلة، اربط التوقيت، واكشف الرواية الأكثر اتساقًا.','A cinematic, non-graphic crime scene: collect clues, connect the timeline, and uncover the most consistent story.','电影式非血腥犯罪现场：收集线索、连接时间线，找出最一致的真相。','सिनेमाई, गैर-ग्राफिक अपराध दृश्य: सुराग जोड़ें, समयरेखा बनाएं और सबसे संगत कहानी खोजें।','Escena criminal cinematográfica sin contenido gráfico: reúne pistas, conecta la línea temporal y descubre la historia más coherente.'),questions:[
    Q('forensic-01','choice',O('الساعة 22:14. وصلت إلى شقة المحقق سامر. لا توجد آثار اقتحام على الباب. ما الاستنتاج الأول الأكثر منطقية؟','22:14. You arrive at investigator Samer’s apartment. No forced entry is visible. What is the most logical first inference?','22:14。你到达调查员萨默的公寓。门上没有撬锁痕迹。最合理的第一推断是什么？','22:14। आप अन्वेषक समीर के अपार्टमेंट पहुँचते हैं। जबरन प्रवेश के निशान नहीं हैं। पहला तार्किक निष्कर्ष क्या है?','22:14. Llegas al apartamento del investigador Samer. No hay señales de entrada forzada. ¿Cuál es la primera inferencia lógica?'),[O('الفاعل كان يملك مفتاحًا أو دخل بإذن','The person had a key or entered with permission'),O('الجريمة مستحيلة','The crime is impossible'),O('الفاعل كسر النافذة بالتأكيد','The person definitely broke a window'),O('لا يمكن أن يكون هناك فاعل','There can be no perpetrator')],0,1,{image:'assets/forensic/scene-door.svg'}),
    Q('forensic-02','choice',O('وجدت فنجان قهوة دافئًا وبجانبه هاتف يعرض 21:50. ماذا تفعل قبل بناء أي نظرية؟','You find warm coffee beside a phone showing 21:50. What do you do before forming a theory?','你发现一杯温咖啡，旁边的手机显示21:50。在形成理论前你会做什么？','आपको गर्म कॉफी और 21:50 दिखाता फोन मिलता है। सिद्धांत बनाने से पहले क्या करेंगे?','Encuentras café caliente junto a un teléfono que marca 21:50. ¿Qué haces antes de formular una teoría?'),[O('توثق الدليل وتتحقق من دقة وقت الهاتف','Document the evidence and verify the phone time'),O('تعتبر 21:50 وقت الجريمة حتمًا','Assume 21:50 is definitely the crime time'),O('تتجاهل الفنجان','Ignore the cup'),O('تتهم أول شخص تعرفه','Accuse the first person you know')],0,2,{image:'assets/forensic/scene-desk.svg'}),
    Q('forensic-03','choice',O('كاميرا الممر سجلت شخصًا يدخل 21:42 ويخرج 21:47. سجل هاتف الضحية آخر اتصال 21:44. أي معلومة أقوى لتحديد نافذة زمنية أولية؟','A hallway camera records someone entering at 21:42 and leaving at 21:47. The victim’s phone logs a final call at 21:44. Which is stronger for an initial time window?','走廊摄像头记录某人21:42进入、21:47离开。受害者手机最后通话为21:44。哪条信息更适合确定初步时间窗口？','कॉरिडोर कैमरा 21:42 प्रवेश और 21:47 निकास दिखाता है। पीड़ित के फोन पर अंतिम कॉल 21:44 है। शुरुआती समय-सीमा के लिए कौन सी जानकारी मजबूत है?','La cámara registra entrada a las 21:42 y salida a las 21:47. El teléfono de la víctima registra una última llamada a las 21:44. ¿Qué dato sirve mejor para una ventana inicial?'),[O('التقاطع بين السجلين: تقريبًا 21:42–21:47','The overlap: roughly 21:42–21:47'),O('21:00 فقط','21:00 only'),O('22:30 فقط','22:30 only'),O('لا توجد نافذة زمنية','There is no time window')],0,3,{image:'assets/forensic/scene-camera.svg'}),
    Q('forensic-04','choice',O('على الطاولة ورقة ممزقة، وفي سلة المهملات نصفها الآخر. ما أفضل خطوة؟','A torn note is on the desk and its other half is in the bin. Best next step?','桌上有一张撕碎的纸，另一半在垃圾桶里。最佳下一步是什么？','मेज पर फटा नोट है और उसका दूसरा हिस्सा कूड़ेदान में है। अगला सर्वोत्तम कदम?','Hay una nota rota en la mesa y la otra mitad en la papelera. ¿Mejor siguiente paso?'),[O('مطابقة الحواف وتصويرها قبل لمسها','Match the edges and photograph them before handling'),O('لصقها فورًا','Tape it immediately'),O('رميها لأنها غير مهمة','Discard it'),O('كتابة محتوى متخيل','Invent its content')],0,4),
    Q('forensic-05','choice',O('شاهد قال إن المصباح كان مطفأً عند 21:30، لكن حساسًا ذكيًا سجّل تشغيله 21:31. ما المنهج الأفضل؟','A witness says the light was off at 21:30, but a smart sensor logged it on at 21:31. Best approach?','证人称21:30灯是关的，但智能传感器记录21:31开启。最佳方法是什么？','गवाह कहता है 21:30 पर लाइट बंद थी, लेकिन स्मार्ट सेंसर ने 21:31 पर चालू दर्ज किया। सर्वोत्तम तरीका?','Un testigo dice que la luz estaba apagada a las 21:30, pero un sensor registró encendido a las 21:31. ¿Mejor enfoque?'),[O('اعتبار التعارض قرينة تحتاج تحققًا لا دليلًا حاسمًا','Treat the conflict as a clue requiring verification, not decisive proof'),O('اختيار الشاهد فورًا','Choose the witness immediately'),O('اختيار الحساس دائمًا','Always choose the sensor'),O('حذف المعلومتين','Discard both')],0,5),
    Q('forensic-06','choice',O('بصمة على كوب تبدو حديثة، لكن لا تعرف متى وُضع الكوب. ماذا تثبت البصمة وحدها؟','A fingerprint on a cup appears recent, but you do not know when the cup was placed. What does the print alone prove?','杯子上的指纹看起来很新，但你不知道杯子何时放置。单凭指纹能证明什么？','कप पर उंगलियों का निशान नया लगता है, लेकिन कप कब रखा गया पता नहीं। अकेला निशान क्या साबित करता है?','Una huella en una taza parece reciente, pero no sabes cuándo se colocó. ¿Qué demuestra por sí sola?'),[O('أن الشخص لمس الكوب في وقت غير محدد','That the person touched the cup at an unspecified time'),O('وقت الجريمة بالضبط','The exact crime time'),O('أن الشخص هو الجاني','That the person is the perpetrator'),O('أن الكوب سُرق','That the cup was stolen')],0,6),
    Q('forensic-07','choice',O('ثلاثة مشتبهين: الأول لديه دافع بلا فرصة، الثاني فرصة بلا دافع، والثالث لديه دافع وفرصة لكن لا دليل مادي. ما القرار المهني؟','Three suspects: one has motive but no opportunity, one opportunity but no motive, and the third has both but no physical evidence. Professional decision?','三名嫌疑人：一人有动机无机会，一人有机会无动机，第三人两者都有但无物证。专业决定是什么？','तीन संदिग्ध: पहले के पास मकसद लेकिन अवसर नहीं, दूसरे के पास अवसर लेकिन मकसद नहीं, तीसरे के पास दोनों हैं但物证 नहीं। पेशेवर निर्णय?','Tres sospechosos: uno tiene motivo sin oportunidad, otro oportunidad sin motivo y el tercero ambos pero sin evidencia física. ¿Decisión profesional?'),[O('اعتبار الثالث محور التحقيق مع عدم اعتباره مدانًا','Make the third a priority for investigation without treating them as guilty'),O('اعتقال الثالث حتمًا','Arrest the third automatically'),O('استبعاد الأول والثاني نهائيًا','Exclude the first two permanently'),O('إغلاق القضية','Close the case')],0,7),
    Q('forensic-08','choice',O('وجدت رسالة تقول: «لا تثق بالشخص الذي يصل بعد التاسعة». لماذا لا تكفي وحدها لاتهام شخص؟','You find a note: “Do not trust the person who arrives after nine.” Why is it insufficient alone to accuse someone?','你发现一张纸条：“不要相信九点后到的人。”为什么不能仅凭它指控某人？','आपको एक नोट मिलता है: “नौ बजे के बाद आने वाले पर भरोसा मत करो।” अकेले इससे किसी पर आरोप क्यों नहीं लगाया जा सकता?','Encuentras una nota: “No confíes en quien llegue después de las nueve”. ¿Por qué no basta para acusar?'),[O('لأن السياق والكاتب والمقصود غير مثبتة','Because context, authorship and intended person are unverified'),O('لأن الرسائل دائمًا كاذبة','Because notes are always false'),O('لأن الساعة لا تعمل','Because clocks never work'),O('لأن كل شخص بريء','Because everyone is innocent')],0,8),
    Q('forensic-09','choice',O('تظهر الكاميرا انقطاعًا من 21:46 إلى 21:49. ماذا يعني ذلك؟','The camera shows a gap from 21:46 to 21:49. What does that mean?','摄像头在21:46到21:49出现空档。这意味着什么？','कैमरे में 21:46 से 21:49 तक गैप है। इसका क्या अर्थ है?','La cámara tiene un hueco de 21:46 a 21:49. ¿Qué significa?'),[O('هناك فجوة تحتاج تفسيرًا ولا تثبت وحدها من فعلها','There is a gap requiring explanation; it does not by itself prove who caused it'),O('المشتبه الثالث هو الفاعل بالتأكيد','The third suspect definitely caused it'),O('الجريمة حدثت في 21:47 حتمًا','The crime definitely happened at 21:47'),O('الكاميرا كانت سليمة طوال الوقت','The camera was working perfectly')],0,9),
    Q('forensic-10','choice',O('بعد جمع الأدلة، لديك روايتان. الأولى تحتاج 6 افتراضات غير مثبتة، والثانية تحتاج افتراضين فقط وتفسر كل الأدلة المعروفة. ماذا تختار؟','After collecting evidence, you have two narratives. One needs six unverified assumptions; the other needs two and explains all known evidence. Which is stronger?','收集证据后有两个故事。第一个需要六个未证实假设，第二个只需两个并解释所有已知证据。哪个更强？','साक्ष्य के बाद दो कथाएँ हैं। पहली को छह अप्रमाणित धारणाएँ चाहिए; दूसरी को दो और सभी ज्ञात साक्ष्य समझाती है। कौन मजबूत है?','Tras reunir pruebas hay dos relatos. Uno necesita seis suposiciones no verificadas; el otro dos y explica toda la evidencia conocida. ¿Cuál es más sólido?'),[O('الثانية، مع استمرار اختبارها بأدلة إضافية','The second, while continuing to test it with more evidence'),O('الأولى لأنها أعقد','The first because it is more complex'),O('الأولى لأنها مثيرة','The first because it is more dramatic'),O('لا نحتاج أدلة إضافية','No more evidence is needed')],0,10)
  ]};
  Object.values(bank).forEach(ch=>ch.questions.forEach((q,i)=>{q.id=q.id||`${ch.id}-${i+1}`}));
  window.ZIVOZONE_CHALLENGES=bank;
  window.ZIVOZONE_CHALLENGES.get=id=>bank[id]||null;
  window.ZIVOZONE_CHALLENGES.getAll=()=>Object.values(bank).filter(x=>x&&!x.special);
})();

/* ============================================================
   V18 — EXPANDED CHALLENGE BANK
   10-question runs, escalating 1→10.
   Types: sequence, numeric, text, pattern, logic, odd-one-out.
   Existing challenge banks above are preserved.
============================================================ */
window.ZIVOZONE_INTERNAL.v18_bank = {
  logic: {
    id:"logic_v18", title:"Logic Lab", icon:"🧠", special:false,
    questions:[
      {id:"logic18_01",type:"numeric",difficulty:1,q:"أكمل: 2، 4، 6، 8، ؟",answer:"10"},
      {id:"logic18_02",type:"numeric",difficulty:2,q:"أكمل: 3، 6، 12، 24، ؟",answer:"48"},
      {id:"logic18_03",type:"text",difficulty:3,q:"أي كلمة لا تنتمي: تفاحة، برتقالة، موزة، كرسي؟",answer:"كرسي"},
      {id:"logic18_04",type:"numeric",difficulty:4,q:"إذا كان 5 + 3 = 16 و 4 + 2 = 12 وفق قاعدة ثابتة، فما 6 + 2؟",answer:"16"},
      {id:"logic18_05",type:"numeric",difficulty:5,q:"أكمل: 1، 4، 9، 16، 25، ؟",answer:"36"},
      {id:"logic18_06",type:"numeric",difficulty:6,q:"عدد إذا ضربته في نفسه ثم أضفت 6 حصلت على 42. ما العدد الموجب؟",answer:"6"},
      {id:"logic18_07",type:"text",difficulty:7,q:"لديك 3 مفاتيح خارج غرفة و3 مصابيح داخلها. يمكنك دخول الغرفة مرة واحدة فقط. كيف تعرف أي مفتاح لأي مصباح؟ اكتب الفكرة المختصرة.",answer:"تشغيل مفتاح ثم إطفاؤه وتشغيل الثاني ثم الدخول وفحص الضوء والحرارة"},
      {id:"logic18_08",type:"numeric",difficulty:8,q:"أكمل: 2، 3، 5، 8، 13، 21، ؟",answer:"34"},
      {id:"logic18_09",type:"text",difficulty:9,q:"رجل ينظر إلى صورة ويقول: ليس لي أخ أو أخت، لكن والد هذا الرجل هو ابن أبي. من في الصورة؟",answer:"ابنه"},
      {id:"logic18_10",type:"numeric",difficulty:10,q:"لديك 8 كرات متشابهة، واحدة أثقل. بميزان كفتين ووزنتين فقط، كيف تعثر عليها؟ اكتب الخطوات.",answer:"3 مقابل 3 ثم وزن كرة مقابل كرة من المجموعة الأثقل أو المتبقية"}
    ]
  },
  pattern: {
    id:"pattern_v18", title:"Pattern Break", icon:"🔷", special:false,
    questions:[
      {id:"pattern18_01",type:"sequence",difficulty:1,q:"أكمل النمط: A B A B A ؟",answer:"B"},
      {id:"pattern18_02",type:"sequence",difficulty:2,q:"أكمل: 10، 20، 30، 40، ؟",answer:"50"},
      {id:"pattern18_03",type:"sequence",difficulty:3,q:"أكمل: 1، 2، 4، 7، 11، ؟",answer:"16"},
      {id:"pattern18_04",type:"sequence",difficulty:4,q:"أكمل: 81، 27، 9، 3، ؟",answer:"1"},
      {id:"pattern18_05",type:"sequence",difficulty:5,q:"أكمل: 2، 6، 12، 20، 30، ؟",answer:"42"},
      {id:"pattern18_06",type:"sequence",difficulty:6,q:"أكمل: 1، 1، 2، 3، 5، 8، ؟",answer:"13"},
      {id:"pattern18_07",type:"sequence",difficulty:7,q:"أكمل: 100، 96، 88، 76، 60، ؟",answer:"40"},
      {id:"pattern18_08",type:"sequence",difficulty:8,q:"أكمل: 3، 8، 15، 24، 35، ؟",answer:"48"},
      {id:"pattern18_09",type:"sequence",difficulty:9,q:"أكمل: 1، 3، 6، 10، 15، 21، ؟",answer:"28"},
      {id:"pattern18_10",type:"sequence",difficulty:10,q:"أكمل: 2، 5، 11، 23، 47، ؟",answer:"95"}
    ]
  },
  focus: {
    id:"focus_v18", title:"Focus Trap", icon:"🎯", special:false,
    questions:[
      {id:"focus18_01",type:"text",difficulty:1,q:"اكتب الكلمة الثالثة فقط: أحمر — أزرق — أخضر — أصفر",answer:"أخضر"},
      {id:"focus18_02",type:"text",difficulty:2,q:"كم مرة يظهر حرف الألف في: باب؟",answer:"1"},
      {id:"focus18_03",type:"numeric",difficulty:3,q:"من الأرقام 7، 2، 9، 4 اكتب الأصغر.",answer:"2"},
      {id:"focus18_04",type:"text",difficulty:4,q:"اكتب آخر كلمة: قمر، شمس، نجمة، بحر",answer:"بحر"},
      {id:"focus18_05",type:"numeric",difficulty:5,q:"ما الرقم الذي لا ينتمي: 2، 4، 8، 15، 16؟",answer:"15"},
      {id:"focus18_06",type:"text",difficulty:6,q:"أي كلمة مختلفة: كتاب، قلم، دفتر، تفاحة؟",answer:"تفاحة"},
      {id:"focus18_07",type:"numeric",difficulty:7,q:"إذا طلبت منك تجاهل الرقم 7 واختيار أكبر رقم من 3، 9، 5، 8، ما إجابتك؟",answer:"9"},
      {id:"focus18_08",type:"text",difficulty:8,q:"اقرأ بدقة: واحد، اثنان، أربعة، ثلاثة. ما الكلمة التي تخالف الترتيب الطبيعي؟",answer:"أربعة"},
      {id:"focus18_09",type:"numeric",difficulty:9,q:"ما العدد المختلف: 12، 18، 24، 31، 36؟",answer:"31"},
      {id:"focus18_10",type:"text",difficulty:10,q:"اكتب فقط أول حرف من كلمة «انتباه».",answer:"ا"}
    ]
  }
};

window.ZIVOZONE_INTERNAL.v18 = {
  version:18,
  banks:window.ZIVOZONE_INTERNAL.v18_bank,
  normalize:function(v){
    return String(v??"").trim().toLowerCase()
      .replace(/[أإآ]/g,"ا").replace(/ى/g,"ي").replace(/ة/g,"ه")
      .replace(/[،,؛;]/g," ").replace(/\s+/g," ");
  },
  get:function(id){
    const b=this.banks[id]; if(!b)return null;
    return JSON.parse(JSON.stringify(b));
  },
  all:function(){return Object.values(this.banks).map(x=>JSON.parse(JSON.stringify(x)))},
  scoreAnswer:function(question,value){
    const a=this.normalize(question.answer),v=this.normalize(value);
    return a===v || (question.alternatives||[]).some(x=>this.normalize(x)===v);
  },
  makeRun:function(id,used){
    const b=this.get(id); if(!b)return null;
    const seen=new Set(used||[]);
    const fresh=b.questions.filter(q=>!seen.has(q.id));
    const pool=(fresh.length>=10?fresh:b.questions.slice()).sort(()=>Math.random()-.5);
    return Object.assign({},b,{questions:pool.slice(0,10).sort((a,b)=>a.difficulty-b.difficulty)});
  }
};


/* ============================================================
   ZIVOZONE V40 — CHALLENGE EXPANSION BANK
   10-question packs, escalating difficulty, additive only.
============================================================ */
window.ZIVOZONE_INTERNAL=window.ZIVOZONE_INTERNAL||{};
(function(){
  'use strict';
  const packs={
    logic_extreme:{
      id:'logic_extreme',title:'المنطق المتقدم',description:'أنماط واستدلال منطقي بتصعيد حقيقي',questions:[
        {q:'ما العدد التالي: 2، 6، 12، 20، 30، ؟',options:['40','42','44','46'],answer:1},
        {q:'إذا كانت كل A هي B، وبعض B هي C، فما الذي يلزم؟',options:['كل A هي C','بعض A هي C','لا يلزم أي منهما','كل C هي A'],answer:2},
        {q:'أكمل النمط: 1، 2، 4، 7، 11، 16، ؟',options:['21','22','23','24'],answer:1},
        {q:'ثلاثة أشخاص يقولون: واحد فقط يكذب. الأول: الثاني كاذب. الثاني: الثالث كاذب. الثالث: الأول والثاني كاذبان. من الصادق؟',options:['الأول','الثاني','الثالث','لا أحد'],answer:0},
        {q:'إذا كان اليوم الثلاثاء، فما اليوم بعد 100 يوم؟',options:['الخميس','الجمعة','السبت','الأحد'],answer:1},
        {q:'لديك 8 كرات، واحدة أثقل. بميزان كفتين ووزنتين فقط، هل يمكن تحديدها؟',options:['نعم دائمًا','لا','فقط إذا كانت الثالثة','فقط إذا كانت الرابعة'],answer:0},
        {q:'عدد من رقمين: مجموع رقميه 11، والعدد المعكوس أكبر منه بـ27. ما العدد؟',options:['47','56','65','74'],answer:0},
        {q:'سلسلة: 3، 5، 10، 12، 24، 26، ؟',options:['48','50','52','54'],answer:1},
        {q:'إذا كان احتمال حدث 1/3، واحتمال حدث مستقل آخر 1/2، فما احتمال حدوث الاثنين معًا؟',options:['1/5','1/6','2/5','5/6'],answer:1},
        {q:'لديك 12 قطعة متطابقة ظاهريًا، واحدة مختلفة الوزن ولا تعرف أثقل أم أخف. كم أقل عدد من الوزنات اللازمة في أسوأ حالة؟',options:['2','3','4','5'],answer:1}
      ]
    },
    memory_focus:{
      id:'memory_focus',title:'الذاكرة والتركيز',description:'اختبار تركيز وتسلسل واسترجاع',questions:[
        {q:'أي تسلسل يطابق: 7-2-9-4؟',options:['7-2-9-4','7-9-2-4','2-7-9-4','7-2-4-9'],answer:0},
        {q:'ما الحرف المختلف؟ A A A B A A',options:['الأول','الثالث','الرابع','السادس'],answer:2},
        {q:'ما الرقم الذي ظهر مرتين في السلسلة: 4 8 1 6 3 8 2؟',options:['4','8','6','3'],answer:1},
        {q:'احفظ: قمر، باب، نهر، مفتاح. أي كلمة ليست منها؟',options:['باب','نهر','كتاب','مفتاح'],answer:2},
        {q:'إذا قلبت ترتيب 9-3-7-1، ما النتيجة؟',options:['1-7-3-9','1-3-7-9','9-1-7-3','7-1-3-9'],answer:0},
        {q:'أي تسلسل يحافظ على نفس الترتيب؟',options:['2-5-8-1','2-8-5-1','5-2-8-1','2-5-1-8'],answer:0},
        {q:'أي رقم يأتي ثالثًا في: 6، 1، 9، 4، 2؟',options:['1','9','4','2'],answer:1},
        {q:'ما العنصر الذي ظهر أولًا: نجمة، دائرة، مثلث، مربع؟',options:['المربع','المثلث','الدائرة','النجمة'],answer:3},
        {q:'احفظ: 3-8-6-2-9. ما الرقم الثاني من النهاية؟',options:['6','2','8','9'],answer:1},
        {q:'إذا ظهر التسلسل 5-1-8-3-7-2، فما العنصر الرابع؟',options:['8','3','7','2'],answer:1}
      ]
    },
    football_intelligence:{
      id:'football_intelligence',title:'ذكاء كرة القدم',description:'قرارات تكتيكية وفهم للمباراة',questions:[
        {q:'في بناء اللعب 4-3-3، ما الهدف الأساسي من لاعب الوسط المحور؟',options:['البقاء داخل الصندوق','ربط الخطوط وتوفير خيار تمرير','اللعب كحارس','عدم التحرك'],answer:1},
        {q:'عند فقدان الكرة قريبًا من مرمى الخصم، ما المبدأ الأفضل؟',options:['العودة فورًا بلا ضغط','الضغط العكسي المنظم','ترك المساحة','تغيير الحارس'],answer:1},
        {q:'ماذا يعني خلق التفوق العددي على الجناح؟',options:['زيادة عدد الحكام','وجود لاعب إضافي في منطقة اللعب','تقليل التمريرات','تثبيت المهاجم'],answer:1},
        {q:'متى يكون التمرير بين الخطوط عالي الخطورة؟',options:['عندما تكون المساحة مغلقة والضغط قريبًا','عندما يكون اللاعب حرًا','عند وجود خيار آمن','بعد التوقف'],answer:0},
        {q:'ما فائدة الجناح العكسي غالبًا؟',options:['توسيع الملعب فقط','الدخول للعمق وتهديد المرمى','العودة للحارس دائمًا','منع الظهير من التقدم'],answer:1},
        {q:'في الدفاع المنخفض، أهم شيء؟',options:['المسافات بين الخطوط','الهجوم بأكبر عدد','ترك العمق','إلغاء التواصل'],answer:0},
        {q:'لماذا تستخدم التحولات السريعة؟',options:['لإبطاء اللعب','استغلال عدم تنظيم الخصم','إضاعة الوقت فقط','تغيير الحكم'],answer:1},
        {q:'إذا ضغط الخصم عاليًا، ما الحل التكتيكي المحتمل؟',options:['تثبيت الجميع قرب الحارس','استغلال المساحة خلف الضغط','منع كل التمريرات','إلغاء الحارس'],answer:1},
        {q:'ما أهم عنصر في الضغط الجماعي؟',options:['تحرك لاعب واحد فقط','التوقيت والتغطية والمسافات','الجري العشوائي','الاعتماد على السرعة فقط'],answer:1},
        {q:'أمام دفاع متكتل، أي مبدأ يساعد أكثر؟',options:['توسيع الملعب وتغيير جهة اللعب','تقليل عرض الملعب','إيقاف الحركة','تمريرات عشوائية'],answer:0}
      ]
    }
  };
  window.ZIVOZONE_INTERNAL.v40_bank=packs;
  window.ZIVOZONE_CHALLENGES=window.ZIVOZONE_CHALLENGES||{};
  Object.keys(packs).forEach(k=>{
    if(!window.ZIVOZONE_CHALLENGES[k])window.ZIVOZONE_CHALLENGES[k]=packs[k];
  });
})();

/* ===== challenge_pack.js ===== */
/* ============================================================
   ZIVOZONE CHALLENGE PACK COMPATIBILITY LAYER V8
   The complete bank now lives in challenges.js.
   This file intentionally adds nothing, preventing duplicate cards
   or duplicate question pools from older versions.
============================================================ */
(() => {
  'use strict';
  const C=window.ZIVOZONE_CHALLENGES;
  if(!C) return;
  window.ZIVOZONE_CHALLENGE_PACK_VERSION='8.0';
})();

/* ===== v22_bank.js ===== */
/* ============================================================
   ZIVOZONE V22 — EXPANDED CONTENT BANK
   6 new challenge worlds × 10 questions.
   Every question/choice has AR / EN / ZH / HI / ES.
============================================================ */
(()=>{
  const M=(ar,en,zh,hi,es)=>({ar,en,zh,hi,es});
  const Q=(id,type,q,opts,c,d,answer)=>({id,type,q,a:opts,c,d,answer});
  const B=(id,icon,title,desc,questions)=>({id,icon,title,desc,xp:140,special:false,questions});
  const banks={
    probability:B('probability_v22','🎲',M('مختبر الاحتمالات','Probability Lab','概率实验室','प्रायिकता लैब','Laboratorio de probabilidad'),M('احسب تحت الضغط واكتشف الاحتمال الحقيقي.','Calculate under pressure and find the real probability.','在压力下计算并找到真正的概率。','दबाव में गणना करें और वास्तविक प्रायिकता खोजें।','Calcula bajo presión y descubre la probabilidad real.'),[
      Q('pr22_01','choice',M('عملة عادلة: احتمال ظهور الصورة في رمية واحدة؟','Fair coin: probability of heads on one toss?','公平硬币一次出现正面的概率？','निष्पक्ष सिक्का: एक उछाल में हेड आने की प्रायिकता?','Moneda justa: probabilidad de cara en un lanzamiento?'),[M('25%','25%','25%','25%','25%'),M('50%','50%','50%','50%','50%'),M('75%','75%','75%','75%','75%'),M('100%','100%','100%','100%','100%')],1,1),
      Q('pr22_02','number',M('كيس فيه 3 حمراء و2 زرقاء. كم كرة زرقاء من أصل 5؟ اكتب النسبة المئوية.','A bag has 3 red and 2 blue balls. What percentage are blue?','袋中有3个红球和2个蓝球。蓝球占百分之多少？','एक थैले में 3 लाल और 2 नीली गेंदें हैं। नीली कितने प्रतिशत हैं?','Una bolsa tiene 3 bolas rojas y 2 azules. ¿Qué porcentaje son azules?'),[],4,2,'40'),
      Q('pr22_03','choice',M('رمي نرد عادل: احتمال الحصول على رقم أكبر من 4؟','Fair die: probability of rolling a number greater than 4?','公平骰子：掷出大于4的数字的概率？','निष्पक्ष पासा: 4 से बड़ा अंक आने की प्रायिकता?','Dado justo: probabilidad de obtener un número mayor que 4?'),[M('1/6','1/6','1/6','1/6','1/6'),M('1/3','1/3','1/3','1/3','1/3'),M('1/2','1/2','1/2','1/2','1/2'),M('2/3','2/3','2/3','2/3','2/3')],1,3),
      Q('pr22_04','number',M('من 10 تذاكر، 3 رابحة. احتمال سحب رابحة كنسبة مئوية؟','Out of 10 tickets, 3 win. Winning probability as a percentage?','10张票中3张中奖。中奖概率是多少百分比？','10 टिकटों में 3 विजेता हैं। प्रतिशत प्रायिकता?','De 10 boletos, 3 ganan. ¿Probabilidad de ganar en porcentaje?'),[],3,4,'30'),
      Q('pr22_05','choice',M('إذا كان احتمال حدث 0.2، فما احتمال عدم حدوثه؟','If an event has probability 0.2, what is the probability it does not happen?','事件概率为0.2，不发生的概率是多少？','यदि किसी घटना की प्रायिकता 0.2 है, तो न होने की प्रायिकता?','Si un evento tiene probabilidad 0,2, ¿cuál es la de que no ocurra?'),[M('0.2','0.2','0.2','0.2','0.2'),M('0.5','0.5','0.5','0.5','0.5'),M('0.8','0.8','0.8','0.8','0.8'),M('1.2','1.2','1.2','1.2','1.2')],2,5),
      Q('pr22_06','number',M('رميا نرد مرتين. ما عدد النواتج المرتبة الممكنة؟','Two dice are rolled. How many ordered outcomes are possible?','掷两个骰子，有多少种有序结果？','दो पासे फेंके गए। कितने क्रमित परिणाम संभव हैं?','Se lanzan dos dados. ¿Cuántos resultados ordenados son posibles?'),[],6,6,'36'),
      Q('pr22_07','choice',M('ما احتمال الحصول على مجموع 7 عند رمي نردين؟','Probability of a sum of 7 with two dice?','两个骰子和为7的概率？','दो पासों का योग 7 होने की प्रायिकता?','Probabilidad de sumar 7 con dos dados?'),[M('1/12','1/12','1/12','1/12','1/12'),M('1/6','1/6','1/6','1/6','1/6'),M('1/4','1/4','1/4','1/4','1/4'),M('1/3','1/3','1/3','1/3','1/3')],1,7),
      Q('pr22_08','number',M('في صندوق 4 حمراء و6 زرقاء. تسحب كرة دون إرجاع ثم ثانية. احتمال أن تكون الاثنتان زرقاوين كنسبة مئوية؟','A box has 4 red and 6 blue. Draw two without replacement. Probability both are blue, as a percentage?','盒中4红6蓝，不放回抽两次。两次都是蓝色的概率百分比？','डिब्बे में 4 लाल और 6 नीली। बिना वापसी दो बार। दोनों नीली होने की प्रतिशत प्रायिकता?','Caja con 4 rojas y 6 azules. Dos extracciones sin reemplazo. ¿Probabilidad de dos azules en %?'),[],8,8,'33.3333333333'),
      Q('pr22_09','choice',M('إذا كان احتمال الفوز 1/4 في كل محاولة مستقلة، هل احتمال الفوز مرتين متتاليتين يساوي 1/8؟','If winning probability is 1/4 each independent attempt, is winning twice in a row 1/8?','每次独立获胜概率为1/4，连续两次获胜是否为1/8？','यदि हर स्वतंत्र प्रयास में जीत 1/4 है, लगातार दो जीत क्या 1/8 हैं?','Si ganar es 1/4 en cada intento independiente, ¿ganar dos veces seguidas es 1/8?'),[M('نعم، هو 1/16','No, it is 1/16','不，是1/16','नहीं, 1/16 है','No, es 1/16'),M('نعم','Yes','是','हाँ','Sí'),M('لا يمكن حسابه','Cannot calculate','无法计算','गणना नहीं कर सकते','No se puede calcular'),M('1/4','1/4','1/4','1/4','1/4')],0,9),
      Q('pr22_10','number',M('ثلاثة أحداث مستقلة احتمال كل منها 1/2. احتمال حدوثها كلها كنسبة مئوية؟','Three independent events each have probability 1/2. Probability all occur, in percent?','三个独立事件概率都为1/2，全部发生的概率百分比？','तीन स्वतंत्र घटनाओं की प्रायिकता 1/2 है। तीनों होने की प्रतिशत प्रायिकता?','Tres eventos independientes tienen probabilidad 1/2 cada uno. ¿Probabilidad de que ocurran todos en %?'),[],10,10,'12.5')
    ]),
    lateral:B('lateral_v22','🌀',M('مختبر التفكير الجانبي','Lateral Thinking Lab','横向思维实验室','लेटरल थिंकिंग लैब','Laboratorio de pensamiento lateral'),M('أسئلة تكسر الافتراضات وتختبر زاوية النظر.','Questions that break assumptions and test perspective.','打破假设，测试视角。','धारणाएँ तोड़ने और दृष्टिकोण जाँचने वाले प्रश्न।','Preguntas que rompen supuestos y prueban la perspectiva.'),[
      Q('lt22_01','choice',M('رجل ولد عام 2005 وتوفي عام 2005 بعمر 80. كيف؟','A man was born in 2005 and died in 2005 aged 80. How?','一名男子出生于2005年，2005年去世，享年80岁。怎么可能？','एक आदमी 2005 में पैदा हुआ और 2005 में 80 वर्ष की आयु में मर गया। कैसे?','Un hombre nació en 2005 y murió en 2005 a los 80 años. ¿Cómo?'),[M('السنوات ليست سنوات الميلاد','The numbers are not years','这些数字不是年份','ये वर्ष नहीं हैं','No son años'),M('خطأ رياضي','Math error','数学错误','गणितीय त्रुटि','Error matemático'),M('سافر عبر الزمن','Time travel','时间旅行','समय यात्रा','Viajó en el tiempo'),M('مستحيل','Impossible','不可能','असंभव','Imposible')],0,1),
      Q('lt22_02','number',M('لديك 5 تفاحات، أخذتَ 2. كم تفاحة أصبحت معك؟','You have 5 apples and take 2. How many do you have?','你有5个苹果，拿走2个。你有几个？','आपके पास 5 सेब हैं और 2 लेते हैं। आपके पास कितने हैं?','Tienes 5 manzanas y tomas 2. ¿Cuántas tienes?'),[],2,2,'2'),
      Q('lt22_03','choice',M('طبيب أعطى مريضًا 3 حبات وقال: خذ حبة كل نصف ساعة. كم يستغرق أخذها كلها؟','A doctor gives 3 pills: take one every half hour. How long to take all?','医生给3粒药，每半小时一粒。全部吃完需要多久？','डॉक्टर ने 3 गोलियाँ दीं: हर आधे घंटे में एक। कुल समय?','Un médico da 3 pastillas: una cada media hora. ¿Cuánto tardas en tomarlas todas?'),[M('30 دقيقة','30 minutes','30分钟','30 मिनट','30 minutos'),M('60 دقيقة','60 minutes','60分钟','60 मिनट','60 minutos'),M('90 دقيقة','90 minutes','90分钟','90 मिनट','90 minutos'),M('120 دقيقة','120 minutes','120分钟','120 मिनट','120 minutos')],1,3),
      Q('lt22_04','number',M('قطار كهربائي يسير شمالًا. الرياح جنوبًا. إلى أين يتجه الدخان؟','An electric train travels north. Wind blows south. Where does the smoke go?','电动火车向北行驶，风向南吹。烟往哪里走？','एक इलेक्ट्रिक ट्रेन उत्तर जाती है, हवा दक्षिण। धुआँ किस ओर जाएगा?','Un tren eléctrico va al norte y el viento al sur. ¿Hacia dónde va el humo?'),[],4,4,'0'),
      Q('lt22_05','choice',M('ما الشيء الذي كلما أخذت منه كبر؟','What gets bigger the more you take from it?','什么东西你拿走越多反而越大？','क्या चीज़ जितना निकालो उतनी बड़ी होती जाती है?','¿Qué se hace más grande cuanto más quitas?'),[M('الحفرة','A hole','洞','गड्ढा','Un agujero'),M('الكتاب','A book','书','किताब','Un libro'),M('الظل','A shadow','影子','छाया','Una sombra'),M('الوقت','Time','时间','समय','El tiempo')],0,5),
      Q('lt22_06','number',M('في سباق تجاوزت الشخص صاحب المركز الثاني. ما مركزك الآن؟','In a race you pass the person in second place. What place are you now?','比赛中你超过第二名。你现在第几名？','दौड़ में आपने दूसरे स्थान वाले को पार किया। अब आप किस स्थान पर हैं?','En una carrera adelantas al segundo. ¿Qué posición ocupas?'),[],6,6,'2'),
      Q('lt22_07','choice',M('أم لديها 4 بنات، لكل بنت أخ واحد. كم طفلًا لديها؟','A mother has 4 daughters, each has one brother. How many children?','一位母亲有4个女儿，每个女儿有一个哥哥。共有几个孩子？','एक माँ की 4 बेटियाँ हैं, हर बेटी का एक भाई है। कुल बच्चे?','Una madre tiene 4 hijas y cada una tiene un hermano. ¿Cuántos hijos?'),[M('4','4','4','4','4'),M('5','5','5','5','5'),M('8','8','8','8','8'),M('9','9','9','9','9')],1,7),
      Q('lt22_08','number',M('ساعة تشير إلى 3:00. كم درجة بين العقربين؟','A clock shows 3:00. What angle is between the hands?','时钟显示3:00，两针夹角多少度？','घड़ी 3:00 दिखाती है। सुइयों के बीच कोण?','Un reloj marca las 3:00. ¿Qué ángulo hay entre las agujas?'),[],8,8,'90'),
      Q('lt22_09','choice',M('شيء له مدن بلا بيوت وأنهار بلا ماء. ما هو؟','It has cities without houses and rivers without water. What is it?','它有城市却没有房屋，有河流却没有水。是什么？','इसमें शहर हैं पर घर नहीं, नदियाँ हैं पर पानी नहीं। क्या है?','Tiene ciudades sin casas y ríos sin agua. ¿Qué es?'),[M('خريطة','A map','地图','मानचित्र','Un mapa'),M('كتاب','A book','书','किताब','Un libro'),M('مرآة','A mirror','镜子','आईना','Un espejo'),M('طائرة','A plane','飞机','विमान','Un avión')],0,9),
      Q('lt22_10','number',M('لديك كوب ماء كامل. أضفت إليه ماءً دون أن يفيض. كيف؟','A glass is full of water. You add water without overflow. How?','杯子装满水，你再加水却不溢出。怎么做？','गिलास पानी से भरा है। बिना छलके पानी जोड़ें। कैसे?','Un vaso está lleno de agua. Añades agua sin que rebose. ¿Cómo?'),[],10,10,'ثلج')
    ]),
    code:B('code_v22','💻',M('مختبر الشيفرة','Code Lab','代码实验室','कोड लैब','Laboratorio de código'),M('أنماط وخوارزميات وتفكير برمجي دون كتابة كود.','Patterns, algorithms and programming thinking without coding.','模式、算法与编程思维，无需写代码。','कोड लिखे बिना पैटर्न, एल्गोरिदम और प्रोग्रामिंग सोच।','Patrones, algoritmos y pensamiento de programación sin escribir código.'),[
      Q('cd22_01','choice',M('ما ناتج: 2 + 3 × 4؟','What is 2 + 3 × 4?','2 + 3 × 4 等于多少？','2 + 3 × 4 का परिणाम?','¿Cuánto es 2 + 3 × 4?'),[M('20','20','20','20','20'),M('14','14','14','14','14'),M('24','24','24','24','24'),M('10','10','10','10','10')],1,1),
      Q('cd22_02','number',M('إذا كان x=5، فما قيمة 2x+7؟','If x=5, what is 2x+7?','若x=5，2x+7是多少？','यदि x=5, 2x+7 कितना है?','Si x=5, ¿cuánto es 2x+7?'),[],2,2,'17'),
      Q('cd22_03','choice',M('ما الذي تفعله الحلقة التي تتكرر 5 مرات؟','What does a loop repeated 5 times do?','循环重复5次会做什么？','5 बार दोहराया गया लूप क्या करता है?','¿Qué hace un bucle repetido 5 veces?'),[M('تنفذ التعليمات 5 مرات','Executes instructions 5 times','执行指令5次','निर्देश 5 बार चलाता है','Ejecuta instrucciones 5 veces'),M('تحذف البرنامج','Deletes the program','删除程序','प्रोग्राम हटाता है','Borra el programa'),M('توقف الجهاز','Stops the device','停止设备','डिवाइस रोकता है','Detiene el dispositivo'),M('تغير اللغة','Changes language','更改语言','भाषा बदलता है','Cambia el idioma')],0,3),
      Q('cd22_04','number',M('تسلسل يبدأ 1 ثم كل مرة يضرب ×2. ما العنصر السادس؟','Sequence starts 1 and doubles each time. What is the sixth term?','序列从1开始，每次乘2。第六项是多少？','क्रम 1 से शुरू होकर हर बार दोगुना होता है। छठा पद?','Secuencia empieza en 1 y se duplica. ¿Sexto término?'),[],4,4,'32'),
      Q('cd22_05','choice',M('إذا كانت قيمة الشرط false، ماذا يحدث لفرع if؟','If a condition is false, what happens to the if branch?','如果条件为false，if分支会怎样？','यदि शर्त false है, if शाखा का क्या होगा?','Si la condición es false, ¿qué pasa con la rama if?'),[M('ينفذ','Executes','执行','चलता है','Se ejecuta'),M('لا ينفذ','Does not execute','不执行','नहीं चलता','No se ejecuta'),M('يعيد التشغيل','Restarts','重启','पुनः शुरू','Reinicia'),M('يحذف نفسه','Deletes itself','删除自身','खुद को हटाता है','Se elimina')],1,5),
      Q('cd22_06','number',M('إذا كانت القائمة [4,7,9]، ما فهرس العنصر الأول في البرمجة الصفرية؟','For [4,7,9], what is the first element index in zero-based programming?','对于[4,7,9]，零基索引第一个元素是多少？','[4,7,9] में zero-based पहला index क्या है?','Para [4,7,9], ¿índice del primer elemento con base cero?'),[],6,6,'0'),
      Q('cd22_07','choice',M('خوارزمية تبحث في قائمة مرتبة بتقسيمها إلى نصفين تُسمى؟','An algorithm that searches a sorted list by halving it is called?','在有序列表中不断二分查找的算法叫？','क्रमबद्ध सूची को आधा-आधा करके खोजने का एल्गोरिद्म?','Algoritmo que busca en lista ordenada dividiéndola por la mitad?'),[M('بحث ثنائي','Binary search','二分查找','बाइनरी सर्च','Búsqueda binaria'),M('فقاعي','Bubble sort','冒泡排序','बबल सॉर्ट','Ordenamiento burbuja'),M('تشفير','Encryption','加密','एन्क्रिप्शन','Cifrado'),M('ضغط','Compression','压缩','कम्प्रेशन','Compresión')],0,7),
      Q('cd22_08','number',M('كم مرة تنفذ حلقة for من 0 إلى أقل من 5؟','How many times does a for-loop from 0 while less than 5 run?','for循环从0运行到小于5，共执行几次？','0 से 5 से कम तक for-loop कितनी बार चलता है?','¿Cuántas veces corre un for de 0 mientras sea menor que 5?'),[],8,8,'5'),
      Q('cd22_09','choice',M('أي بنية تناسب حفظ أزواج مفتاح/قيمة؟','Which structure fits key/value pairs?','哪种结构适合保存键/值对？','key/value जोड़ों के लिए कौन-सी संरचना?','¿Qué estructura sirve para pares clave/valor?'),[M('قاموس','Dictionary','字典','डिक्शनरी','Diccionario'),M('مكدس فقط','Stack only','仅栈','केवल स्टैक','Solo pila'),M('طابور فقط','Queue only','仅队列','केवल कतार','Solo cola'),M('مصفوفة صورة','Image array','图像数组','इमेज ऐरे','Matriz de imagen')],0,9),
      Q('cd22_10','number',M('إذا كان لديك 8 عناصر وتقسم المجموعة إلى نصفين مرتين، كم مجموعة نهائية؟','With 8 items, split the group in half twice. How many final groups?','8个元素连续二分两次，最终有多少组？','8 तत्वों को दो बार आधा करें। अंतिम समूह कितने?','Con 8 elementos, divides el grupo por la mitad dos veces. ¿Cuántos grupos finales?'),[],10,10,'4')
    ]),
    language:B('language_v22','🔤',M('مختبر اللغة','Language Lab','语言实验室','भाषा लैब','Laboratorio de idiomas'),M('دقة لغوية وأنماط كلمات وتركيز على التفاصيل.','Language precision, word patterns and detail focus.','语言精度、词语模式与细节注意力。','भाषाई सटीकता, शब्द पैटर्न और विवरण पर ध्यान।','Precisión lingüística, patrones de palabras y atención al detalle.'),[
      Q('la22_01','choice',M('أي كلمة مكتوبة بشكل صحيح؟','Which word is spelled correctly?','哪个单词拼写正确？','कौन-सा शब्द सही वर्तनी वाला है?','¿Qué palabra está escrita correctamente?'),[M('مسؤول','مسؤول','مسؤول','مسؤول','مسؤول'),M('مسئول','مسئول','مسئول','مسئول','مسئول'),M('مسوؤل','مسوؤل','مسوؤل','مسوؤل','مسوؤل'),M('مسئؤل','مسئؤل','مسئؤل','مسئؤل','مسئؤل')],0,1),
      Q('la22_02','number',M('كم حرفًا في كلمة ZIVOZONE؟','How many letters are in ZIVOZONE?','ZIVOZONE有多少个字母？','ZIVOZONE में कितने अक्षर हैं?','¿Cuántas letras tiene ZIVOZONE?'),[],2,2,'8'),
      Q('la22_03','choice',M('أي كلمة عكس معنى “سريع”؟','Which word is opposite of “fast”?','“快”的反义词是什么？','“तेज़” का विलोम क्या है?','¿Cuál es lo contrario de “rápido”?'),[M('بطيء','Slow','慢','धीमा','Lento'),M('قوي','Strong','强','मज़बूत','Fuerte'),M('ذكي','Smart','聪明','बुद्धिमान','Inteligente'),M('قصير','Short','短','छोटा','Corto')],0,3),
      Q('la22_04','number',M('في الجملة: “ذهب اللاعب إلى الملعب”، كم كلمة؟','In “The player went to the field”, how many words?','句子“球员去了球场”有几个词？','“खिलाड़ी मैदान गया” में कितने शब्द?','En “El jugador fue al campo”, ¿cuántas palabras?'),[],4,4,'5'),
      Q('la22_05','choice',M('أي ترتيب أبجدي صحيح: باب، بحر، بيت؟','Which alphabetical order is correct: باب، بحر، بيت?','哪个字母顺序正确：باب、بحر、بيت？','कौन-सा वर्णक्रम सही है: باب، بحر، بيت?','¿Qué orden alfabético es correcto: باب، بحر، بيت?'),[M('باب، بحر، بيت','باب، بحر، بيت','باب، بحر، بيت','باب، بحر، بيت','باب، بحر، بيت'),M('بحر، باب، بيت','بحر، باب، بيت','بحر، باب، بيت','بحر، باب، بيت','بحر، باب، بيت'),M('بيت، بحر، باب','بيت، بحر، باب','بيت، بحر، باب','بيت، بحر، باب','بيت، بحر، باب'),M('بيت، باب، بحر','بيت، باب، بحر','بيت، باب، بحر','بيت، باب، بحر','بيت، باب، بحر')],0,5),
      Q('la22_06','number',M('كم مقطعًا صوتيًا تقريبًا في كلمة “مكتبة”؟','Approximately how many syllables in “مكتبة”?','阿拉伯词“مكتبة”大约几个音节？','“मكتبة” में लगभग कितने syllables हैं?','¿Aproximadamente cuántas sílabas tiene “مكتبة”?'),[],6,6,'3'),
      Q('la22_07','choice',M('أي جملة تدل على المستقبل؟','Which sentence indicates the future?','哪句话表示将来？','कौन-सा वाक्य भविष्य बताता है?','¿Qué frase indica futuro?'),[M('سألعب غدًا','I will play tomorrow','我明天会踢球','मैं कल खेलूँगा','Jugaré mañana'),M('لعبت أمس','I played yesterday','我昨天踢了球','मैं कल खेला','Jugué ayer'),M('ألعب الآن','I play now','我现在踢球','मैं अभी खेलता हूँ','Juego ahora'),M('كنت ألعب','I was playing','我当时在踢球','मैं खेल रहा था','Estaba jugando')],0,7),
      Q('la22_08','number',M('إذا حذفت أول وآخر حرف من كلمة “سلام”، كم حرفًا يبقى؟','If you remove the first and last letters of “سلام”, how many remain?','删除“سلام”的首尾字母后剩几个字母？','“سلام” के पहला और आखिरी अक्षर हटाने पर कितने बचते हैं?','Si quitas la primera y última letra de “سلام”, ¿cuántas quedan?'),[],8,8,'2'),
      Q('la22_09','choice',M('أي كلمة تحتوي على حرفين متشابهين متتاليين؟','Which word contains two identical consecutive letters?','哪个词有两个连续相同字母？','किस शब्द में लगातार दो समान अक्षर हैं?','¿Qué palabra tiene dos letras iguales consecutivas?'),[M('مدرسة','School','学校','स्कूल','Escuela'),M('مرّ','Passed','经过','गुज़रा','Pasó'),M('كتاب','Book','书','किताब','Libro'),M('قلم','Pen','笔','कलम','Bolígrafo')],1,9),
      Q('la22_10','number',M('كم حرفًا عربيًا في كلمة “ذكاء”؟','How many Arabic letters are in “ذكاء”?','“ذكاء”有几个阿拉伯字母？','“ذكاء” में कितने अरबी अक्षर हैं?','¿Cuántas letras árabes hay en “ذكاء”?'),[],10,10,'4')
    ]),
    memory:B('memory_v22','🧠',M('ذاكرة النخبة','Elite Memory','精英记忆','एलीट मेमोरी','Memoria élite'),M('ذاكرة متسلسلة مع ضغط زمني وتصاعد تدريجي.','Sequential memory under time pressure with rising difficulty.','时间压力下的序列记忆，难度逐步上升。','समय दबाव में क्रमिक स्मृति और बढ़ती कठिनाई।','Memoria secuencial bajo presión con dificultad creciente.'),[
      Q('me22_01','choice',M('احفظ: 4-9-2. ما الرقم الأوسط؟','Remember 4-9-2. What is the middle number?','记住4-9-2。中间数字是多少？','4-9-2 याद रखें। बीच का अंक?','Recuerda 4-9-2. ¿Cuál es el número central?'),[M('4','4','4','4','4'),M('9','9','9','9','9'),M('2','2','2','2','2'),M('6','6','6','6','6')],1,1),
      Q('me22_02','number',M('احفظ: 7-1-8-3. ما الرقم الأخير؟','Remember 7-1-8-3. What is the last number?','记住7-1-8-3。最后一个数字？','7-1-8-3 याद रखें। आखिरी अंक?','Recuerda 7-1-8-3. ¿Último número?'),[],2,2,'3'),
      Q('me22_03','choice',M('احفظ: قمر، بحر، باب. ما الكلمة الأولى؟','Remember: moon, sea, door. What is first?','记住：月亮、海、门。第一个是什么？','याद रखें: चाँद, समुद्र, दरवाज़ा। पहला?','Recuerda: luna, mar, puerta. ¿Cuál es la primera?'),[M('بحر','Sea','海','समुद्र','Mar'),M('قمر','Moon','月亮','चाँद','Luna'),M('باب','Door','门','दरवाज़ा','Puerta'),M('لا أعرف','I do not know','不知道','पता नहीं','No sé')],1,3),
      Q('me22_04','number',M('احفظ: 2-5-9-4-7. ما مجموع أول وآخر رقم؟','Remember 2-5-9-4-7. Sum first and last.','记住2-5-9-4-7。首尾数字之和？','2-5-9-4-7 याद रखें। पहला+अंतिम?','Recuerda 2-5-9-4-7. Suma primero y último.'),[],4,4,'9'),
      Q('me22_05','choice',M('السلسلة: أحمر، أزرق، أخضر، أصفر، أسود. ما اللون الثالث؟','Sequence: red, blue, green, yellow, black. Third?','序列：红、蓝、绿、黄、黑。第三个？','क्रम: लाल, नीला, हरा, पीला, काला। तीसरा?','Secuencia: rojo, azul, verde, amarillo, negro. ¿Tercero?'),[M('أحمر','Red','红','लाल','Rojo'),M('أزرق','Blue','蓝','नीला','Azul'),M('أخضر','Green','绿','हरा','Verde'),M('أسود','Black','黑','काला','Negro')],2,5),
      Q('me22_06','number',M('احفظ: 6-3-8-1-5. ما حاصل ضرب الأول والأخير؟','Remember 6-3-8-1-5. Product of first and last?','记住6-3-8-1-5。首尾相乘？','6-3-8-1-5 याद रखें। पहला×अंतिम?','Recuerda 6-3-8-1-5. Producto del primero y último?'),[],6,6,'30'),
      Q('me22_07','choice',M('احفظ الترتيب: 3، 8، 1، 6، 4، 9. أي رقم جاء قبل 6؟','Remember 3,8,1,6,4,9. Which came before 6?','记住3、8、1、6、4、9。6前面是什么？','3,8,1,6,4,9 याद रखें। 6 से पहले?','Recuerda 3,8,1,6,4,9. ¿Cuál estaba antes del 6?'),[M('1','1','1','1','1'),M('8','8','8','8','8'),M('4','4','4','4','4'),M('9','9','9','9','9')],0,7),
      Q('me22_08','number',M('احفظ: 9-2-7-4-6-1. ما الفرق بين الرقمين الأول والثاني؟','Remember 9-2-7-4-6-1. Difference between first and second?','记住9-2-7-4-6-1。前两个数字之差？','9-2-7-4-6-1 याद रखें। पहले-दूसरे का अंतर?','Recuerda 9-2-7-4-6-1. Diferencia entre primero y segundo?'),[],8,8,'7'),
      Q('me22_09','choice',M('احفظ: 5، 1، 9، 2، 8، 3، 7. ما الرقم الذي كان بين 9 و8؟','Remember 5,1,9,2,8,3,7. What was between 9 and 8?','记住5、1、9、2、8、3、7。9和8之间是什么？','5,1,9,2,8,3,7 याद रखें। 9 और 8 के बीच?','Recuerda 5,1,9,2,8,3,7. ¿Qué estaba entre 9 y 8?'),[M('1','1','1','1','1'),M('2','2','2','2','2'),M('3','3','3','3','3'),M('5','5','5','5','5')],1,9),
      Q('me22_10','number',M('احفظ: 4،7،2،9،1،8. اضرب الرقم الثاني في الخامس.','Remember 4,7,2,9,1,8. Multiply the second by the fifth.','记住4、7、2、9、1、8。第二个乘第五个。','4,7,2,9,1,8 याद रखें। दूसरा×पाँचवाँ?','Recuerda 4,7,2,9,1,8. Multiplica segundo por quinto.'),[],10,10,'7')
    ]),
    visual:B('visual_v22','👁️',M('مختبر الأنماط البصرية','Visual Pattern Lab','视觉模式实验室','विज़ुअल पैटर्न लैब','Laboratorio de patrones visuales'),M('أنماط ورموز واتجاهات تُحل بالعقل لا بالحدس.','Patterns, symbols and directions solved by reasoning.','通过推理解决模式、符号和方向。','तर्क से पैटर्न, प्रतीक और दिशा हल करें।','Patrones, símbolos y direcciones mediante razonamiento.'),[
      Q('vi22_01','choice',M('أكمل: ▲ ● ▲ ● ▲ ؟','Complete: ▲ ● ▲ ● ▲ ?','完成：▲ ● ▲ ● ▲ ؟','पूरा करें: ▲ ● ▲ ● ▲ ?','Completa: ▲ ● ▲ ● ▲ ?'),[M('■','■','■','■','■'),M('●','●','●','●','●'),M('▲','▲','▲','▲','▲'),M('◆','◆','◆','◆','◆')],1,1),
      Q('vi22_02','choice',M('أكمل: ↑ → ↓ ← ↑ ؟','Complete: ↑ → ↓ ← ↑ ?','完成：↑ → ↓ ← ↑ ؟','पूरा करें: ↑ → ↓ ← ↑ ?','Completa: ↑ → ↓ ← ↑ ?'),[M('↑','↑','↑','↑','↑'),M('→','→','→','→','→'),M('↓','↓','↓','↓','↓'),M('←','←','←','←','←')],1,2),
      Q('vi22_03','number',M('إذا كان النمط يتكرر كل 4 رموز، ما موضع الرمز نفسه عند 9؟','If a pattern repeats every 4 symbols, what position matches position 9?','模式每4个符号重复，第9位与第几位相同？','यदि पैटर्न हर 4 प्रतीक दोहरता है, 9वाँ किससे मेल खाता है?','Si un patrón se repite cada 4 símbolos, ¿qué posición coincide con la 9?'),[],2,3,'1'),
      Q('vi22_04','choice',M('أكمل: 1 مربع، 2 دائرة، 3 مربع، 4 دائرة، 5 ؟','Complete: 1 square, 2 circle, 3 square, 4 circle, 5 ?','完成：1方形、2圆形、3方形、4圆形、5？','पूरा करें: 1 वर्ग, 2 वृत्त, 3 वर्ग, 4 वृत्त, 5 ?','Completa: 1 cuadrado, 2 círculo, 3 cuadrado, 4 círculo, 5 ?'),[M('مربع','Square','方形','वर्ग','Cuadrado'),M('دائرة','Circle','圆形','वृत्त','Círculo'),M('مثلث','Triangle','三角形','त्रिकोण','Triángulo'),M('نجمة','Star','星形','सितारा','Estrella')],0,4),
      Q('vi22_05','number',M('مكعب له 6 أوجه. كم وجهًا يلامس وجهًا واحدًا محددًا؟','A cube has 6 faces. How many faces touch one chosen face?','立方体有6个面。一个指定面接触几个面？','घन के 6 फलक हैं। एक चुने हुए फलक को कितने फलक छूते हैं?','Un cubo tiene 6 caras. ¿Cuántas tocan una cara elegida?'),[],4,5,'4'),
      Q('vi22_06','choice',M('إذا دُوّر السهم ↑ نصف دورة، يصبح؟','Rotate ↑ by half a turn. It becomes?','将↑旋转半圈，会变成？','↑ को आधा घुमाने पर क्या बनेगा?','Gira ↑ media vuelta. ¿En qué se convierte?'),[M('↑','↑','↑','↑','↑'),M('→','→','→','→','→'),M('↓','↓','↓','↓','↓'),M('←','←','←','←','←')],2,6),
      Q('vi22_07','number',M('شبكة 3×3 فيها 9 خلايا. كم خلية تقع على الحافة؟','A 3×3 grid has 9 cells. How many cells are on the edge?','3×3网格有9格，边缘有多少格？','3×3 ग्रिड में 9 खाने हैं। किनारे पर कितने?','Una cuadrícula 3×3 tiene 9 celdas. ¿Cuántas están en el borde?'),[],6,7,'8'),
      Q('vi22_08','choice',M('ما الشكل المختلف: مثلث، مربع، دائرة، مستطيل؟','Which shape is different: triangle, square, circle, rectangle?','哪个形状不同：三角形、正方形、圆形、矩形？','कौन-सा आकार अलग है: त्रिकोण, वर्ग, वृत्त, आयत?','¿Qué forma es diferente: triángulo, cuadrado, círculo, rectángulo?'),[M('مثلث','Triangle','三角形','त्रिकोण','Triángulo'),M('مربع','Square','正方形','वर्ग','Cuadrado'),M('دائرة','Circle','圆形','वृत्त','Círculo'),M('مستطيل','Rectangle','矩形','आयत','Rectángulo')],2,8),
      Q('vi22_09','number',M('كم محور تناظر للمربع؟','How many lines of symmetry does a square have?','正方形有多少条对称轴？','वर्ग में सममिति की कितनी रेखाएँ हैं?','¿Cuántos ejes de simetría tiene un cuadrado?'),[],9,9,'4'),
      Q('vi22_10','choice',M('نمط: ●، ●●، ●●●، ؟ كم دائرة؟','Pattern: ●, ●●, ●●●, ? How many circles next?','模式：●、●●、●●●、？下一项几个圆？','पैटर्न: ●, ●●, ●●●, ? अगली बार कितने वृत्त?','Patrón: ●, ●●, ●●●, ¿cuántos círculos siguen?'),[M('3','3','3','3','3'),M('4','4','4','4','4'),M('5','5','5','5','5'),M('6','6','6','6','6')],1,10)
    ])
  };
  window.ZIVOZONE_INTERNAL.v22_bank=banks;
  const C=window.ZIVOZONE_CHALLENGES;
  if(C){Object.values(banks).forEach(b=>{C[b.id]=b});const old=C.getAll;C.getAll=()=>{const arr=old?old.call(C):[];return arr.concat(Object.values(banks)).filter((x,i,a)=>x&&x.id&&a.findIndex(y=>y.id===x.id)===i)};}
})();

/* ===== news.js ===== */
/* ZIVOZONE V81 — STATIC HOURLY ARABIC NEWS ENGINE
   Reads data/news.json generated by GitHub Actions.
   Spark-safe: no Firebase Functions required.
*/
(() => {
  'use strict';

  const DATA_URL = 'data/news.json';
  const REMOTE_DATA_URL = 'https://raw.githubusercontent.com/zivozone5-hub/zivozone/main/data/news.json';
  const CACHE_KEY = 'zivozone_news_v81';
  const CACHE_TTL = 15 * 60 * 1000;
  const REFRESH_MS = 60 * 60 * 1000;

  const esc = (value) => {
    const d = document.createElement('div');
    d.textContent = String(value ?? '');
    return d.innerHTML;
  };

  const hasArabic = (value) => /[\u0600-\u06FF]/.test(String(value || ''));
  const clean = (value) => String(value || '').replace(/\s+/g, ' ').trim();
  const SAFE_NEWS_HOSTS = new Set(['news.google.com','jfa.jo','www.jfa.jo','petra.gov.jo','www.petra.gov.jo','royanews.tv','www.royanews.tv']);
  const safeNewsUrl = (value) => { try { const u = new URL(String(value || '')); return SAFE_NEWS_HOSTS.has(u.hostname.toLowerCase()) ? u.href : ''; } catch (_) { return ''; } };

  const normalizeItem = (item, group) => {
    if (!item || typeof item !== 'object') return null;
    const headline = clean(item.headline || item.title);
    if (!headline || !hasArabic(headline)) return null;
    if (item.url && !safeNewsUrl(item.url)) return null;
    return {
      headline,
      source: clean(item.source || (group === 'sports' ? 'ZIVO SPORTS' : 'ZIVOZONE NEWS')),
      url: safeNewsUrl(item.url || ''),
      published: item.published || ''
    };
  };

  const unique = (items) => {
    const seen = new Set();
    return items.filter((item) => {
      const key = clean(item.headline).toLowerCase().replace(/[^\u0600-\u06FF\w]+/g, '');
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  function readCache() {
    try {
      const value = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      return value && value.data ? value : null;
    } catch (_) { return null; }
  }

  function writeCache(data) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data })); } catch (_) {}
  }

  function formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString('ar-JO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  function itemHTML(item, group) {
    const source = esc(item.source || (group === 'sports' ? 'ZIVO SPORTS' : 'ZIVOZONE NEWS'));
    const time = formatDate(item.published);
    const content = `<span class="zivo-news-dot" aria-hidden="true">◆</span><span class="zivo-news-source">${source}</span><span class="zivo-news-headline">${esc(item.headline)}</span>${time ? `<time class="zivo-news-time">${esc(time)}</time>` : ''}`;
    return item.url
      ? `<a class="zivo-news-item" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(item.headline)}">${content}</a>`
      : `<span class="zivo-news-item">${content}</span>`;
  }

  function renderRail(group, items) {
    const track = document.getElementById(group === 'sports' ? 'z50track' : 'zivoGeneralTrack');
    if (!track) return;
    const list = unique(items.map(x => normalizeItem(x, group)).filter(Boolean)).slice(0, 40);

    if (!list.length) {
      track.className = 'zivo-rail-track zivo-rail-track-empty';
      track.innerHTML = `<span class="zivo-news-item"><span class="zivo-news-source">ZIVOZONE</span><span class="zivo-news-headline">لا توجد أخبار عربية متاحة الآن — سيتم التحديث تلقائيًا.</span></span>`;
      return;
    }

    const html = list.map(x => itemHTML(x, group)).join('');
    track.className = 'zivo-rail-track';
    track.innerHTML = `<div class="zivo-rail-sequence">${html}</div><div class="zivo-rail-sequence" aria-hidden="true">${html}</div>`;

    requestAnimationFrame(() => {
      const sequence = track.querySelector('.zivo-rail-sequence');
      if (!sequence) return;
      const width = Math.max(320, sequence.scrollWidth);
      const mobile = window.matchMedia('(max-width:700px)').matches;
      const isGeneral = track.id === 'zivoGeneralTrack';
      const pxPerSecond = isGeneral ? (mobile ? 14 : 22) : (mobile ? 62 : 96);
      const duration = Math.max(isGeneral ? 70 : 18, Math.min(isGeneral ? 240 : 100, width / pxPerSecond));
      track.style.setProperty('--zivo-flow-duration', `${duration}s`);
    });
  }

  function render(data) {
    const sports = Array.isArray(data?.sports) ? data.sports : [];
    const general = Array.isArray(data?.general) ? data.general : [];
    renderRail('sports', sports);
    renderRail('general', general);
    const updated = data?.updatedAt ? formatDate(data.updatedAt) : 'بانتظار أول تحديث تلقائي';
    document.querySelectorAll('.zivo-rail-status').forEach(node => { node.textContent = `آخر تحديث ${updated}`; });
    window.dispatchEvent(new CustomEvent('zivozone:news-updated', { detail: { sports, general, updatedAt: data?.updatedAt || null } }));
  }

  async function fetchData(url = REMOTE_DATA_URL) {
    const response = await fetch(`${url}?v=${Date.now()}`, { cache: 'no-store', headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`news.json ${response.status}`);
    const data = await response.json();
    return { updatedAt: Number(data.updatedAt) || Date.now(), sports: Array.isArray(data.sports) ? data.sports : [], general: Array.isArray(data.general) ? data.general : [] };
  }

  async function load(force = false) {
    const cached = readCache();
    if (!force && cached && Date.now() - Number(cached.savedAt || 0) < CACHE_TTL) {
      render(cached.data);
      fetchData(REMOTE_DATA_URL).catch(() => fetchData(DATA_URL)).then(data => {
        if (JSON.stringify(data) !== JSON.stringify(cached.data)) { writeCache(data); render(data); }
      }).catch(() => {});
      return cached.data;
    }

    try {
      let data;
      try { data = await fetchData(REMOTE_DATA_URL); } catch (_) { data = await fetchData(DATA_URL); }
      writeCache(data);
      render(data);
      return data;
    } catch (error) {
      console.warn('ZIVOZONE news feed:', error);
      if (cached) { render(cached.data); return cached.data; }
      render({ sports: [], general: [], updatedAt: null });
      return null;
    }
  }

  function restartAnimations() {
    document.querySelectorAll('.zivo-rail-track').forEach(track => {
      const sequence = track.querySelector('.zivo-rail-sequence');
      if (!sequence) return;
      const width = Math.max(320, sequence.scrollWidth);
      const mobile = window.matchMedia('(max-width:700px)').matches;
      const isGeneral = track.id === 'zivoGeneralTrack';
      const pxPerSecond = isGeneral ? (mobile ? 14 : 22) : (mobile ? 62 : 96);
      const duration = Math.max(isGeneral ? 70 : 18, Math.min(isGeneral ? 240 : 100, width / pxPerSecond));
      track.style.setProperty('--zivo-flow-duration', `${duration}s`);
    });
  }

  window.ZIVOZONE_NEWS = { load, loadJordan: () => load(false), refresh: () => load(true) };
  window.ZIVOZONE_SPORTS_TICKER = { load, refresh: () => load(true) };

  document.addEventListener('DOMContentLoaded', () => setTimeout(() => load(false), 250));
  window.addEventListener('resize', () => {
    clearTimeout(window.__zivoNewsResizeTimer);
    window.__zivoNewsResizeTimer = setTimeout(restartAnimations, 180);
  });
  setInterval(() => load(true), REFRESH_MS);
})();

/* ===== fixtures.js ===== */
/* ZIVOZONE FIXTURE CENTER V13
   Free client-side fixture aggregation using public ESPN scoreboards + JFA official links.
*/
(() => {
  'use strict';
  const leagues = [
    {id:'uefa.champions', name:{ar:'دوري أبطال أوروبا',en:'UEFA Champions League',zh:'欧洲冠军联赛',hi:'यूईएफए चैंपियंस लीग',es:'Champions League'}, icon:'⭐'},
    {id:'eng.1', name:{ar:'الدوري الإنجليزي',en:'Premier League',zh:'英超',hi:'प्रीमियर लीग',es:'Premier League'}, icon:'🏴'},
    {id:'esp.1', name:{ar:'الدوري الإسباني',en:'LaLiga',zh:'西甲',hi:'ला लीगा',es:'LaLiga'}, icon:'🇪🇸'},
    {id:'ita.1', name:{ar:'الدوري الإيطالي',en:'Serie A',zh:'意甲',hi:'सीरी ए',es:'Serie A'}, icon:'🇮🇹'},
    {id:'ger.1', name:{ar:'الدوري الألماني',en:'Bundesliga',zh:'德甲',hi:'बुंडेसलीगा',es:'Bundesliga'}, icon:'🇩🇪'},
    {id:'fra.1', name:{ar:'الدوري الفرنسي',en:'Ligue 1',zh:'法甲',hi:'लीग 1',es:'Ligue 1'}, icon:'🇫🇷'}
  ];
  const jfa='https://www.jfa.jo/match_schedule_tourn.php?id=1&title=%D8%AC%D8%AF%D9%88%D9%84%20%D8%A7%D9%84%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA';
  const esc=s=>{const d=document.createElement('div');d.textContent=String(s??'');return d.innerHTML};
  const locale=l=>l==='ar'?'ar-JO':l==='zh'?'zh-CN':l==='hi'?'hi-IN':l==='es'?'es-ES':'en-US';
  const label=(l,lang)=>l.name[lang]||l.name.en;
  async function fetchLeague(l,days=14){
    const now=new Date(); const to=new Date(now.getTime()+days*86400000);
    const fmt=d=>d.toISOString().slice(0,10).replaceAll('-','');
    const url=`https://site.api.espn.com/apis/site/v2/sports/soccer/${l.id}/scoreboard?dates=${fmt(now)}-${fmt(to)}`;
    const r=await fetch(url,{cache:'no-store'}); if(!r.ok)throw new Error('fixture'); const d=await r.json();
    return (d.events||[]).map(e=>({id:e.id,name:e.name,date:e.date,status:e.status?.type?.description||'',state:e.status?.type?.state||'',home:e.competitions?.[0]?.competitors?.find(c=>c.homeAway==='home')?.team?.displayName||'',away:e.competitions?.[0]?.competitors?.find(c=>c.homeAway==='away')?.team?.displayName||'',homeScore:e.competitions?.[0]?.competitors?.find(c=>c.homeAway==='home')?.score,awayScore:e.competitions?.[0]?.competitors?.find(c=>c.homeAway==='away')?.score,league:l}));
  }
  async function load(box,lang='ar'){
    if(!box)return;
    box.innerHTML=`<article class="sports-card loading-card"><div class="spinner"></div><h3>⚽ ${esc(window.zivoT?.('fixtureCenter')||'Match Center')}</h3><p>${esc(window.zivoT?.('loader')||'Loading...')}</p></article>`;
    const settled=await Promise.allSettled(leagues.map(l=>fetchLeague(l)));
    let items=[]; settled.forEach(r=>{if(r.status==='fulfilled')items.push(...r.value)});
    items.sort((a,b)=>new Date(a.date)-new Date(b.date));
    const seen=new Set();items=items.filter(x=>{if(seen.has(x.id))return false;seen.add(x.id);return true}).slice(0,36);
    const featured=items.filter(x=>x.league.id==='uefa.champions').sort((a,b)=>new Date(a.date)-new Date(b.date))[0];
    const alert=document.querySelector('#match-alert');
    if(alert&&featured){const d=new Date(featured.date),mins=(d-Date.now())/60000;const title=mins<=180&&mins>=-150?'🔴 MATCH ALERT':'⭐ NEXT CHAMPIONS LEAGUE';alert.hidden=false;alert.innerHTML=`<div><span class="match-alert-kicker">${title}</span><strong>${esc(featured.home)} <span>VS</span> ${esc(featured.away)}</strong><small>${esc(d.toLocaleString(locale(lang),{dateStyle:'medium',timeStyle:'short'}))}</small></div><span class="match-alert-note">${esc(window.zivoT?.('matchAlertText')||'تابع الموعد والتفاصيل من مركز المباريات.')}</span>`;}
    const cards=items.map(x=>{const d=new Date(x.date);const live=x.state==='in';const final=x.state==='post';const time=d.toLocaleString(locale(lang),{dateStyle:'medium',timeStyle:'short'});const score=(x.homeScore!=null&&x.awayScore!=null)?`<strong>${esc(x.homeScore)} - ${esc(x.awayScore)}</strong>`:'';return `<article class="sports-card fixture-card ${live?'fixture-live':''}"><div class="news-live-top"><span class="match-icon">${x.league.icon}</span><span class="card-tag ${live?'live-dot':''}">${esc(label(x.league,lang))}</span></div><h3>${esc(x.home)} <span class="versus">VS</span> ${esc(x.away)}</h3><p>${esc(time)}</p><div class="fixture-status">${live?'🔴 LIVE':final?'🏁 '+(window.zivoT?.('finished')||'Finished'):'⏱ '+(window.zivoT?.('upcoming')||'Upcoming')} ${score}</div></article>`}).join('');
    const jordan=`<article class="sports-card jordan-fixture-card"><div class="match-icon">🇯🇴</div><span class="card-tag">${esc(window.zivoT?.('jordanFootballNews')||'Jordan Football')}</span><h3>${esc(window.zivoT?.('jordanSchedule')||'Jordan Pro League')}</h3><p>${esc(window.zivoT?.('jordanScheduleText')||'Official upcoming fixtures and kick-off times from the Jordan Football Association.')}</p><a class="btn btn-ghost" href="${jfa}" target="_blank" rel="noopener noreferrer">${esc(window.zivoT?.('officialSchedule')||'Official schedule')}</a></article>`;
    box.innerHTML=(cards||'')+jordan;
  }
  window.ZIVOZONE_FIXTURES={load};
})();

/* ===== ads.js ===== */
/* ZIVOZONE AD CONTROL
   Independent ad presentation layer. Public settings are local; optional cloud config can be read from Firestore.
*/
(() => {
  'use strict';
  const KEY='zivozone_ads_v1';
  let cfg={enabled:true,density:'normal',label:true};
  try{cfg={...cfg,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch(e){}
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){}};
  function apply(){const slots=[...document.querySelectorAll('.ad-slot')];if(!slots.length)return;slots.forEach(slot=>{slot.hidden=!cfg.enabled;slot.dataset.density=cfg.density;const badge=slot.querySelector('.ad-badge');if(badge)badge.hidden=!cfg.label})}
  function open(){
    const root=document.querySelector('#modal-root');if(!root)return;
    root.innerHTML=`<div class="modal-backdrop"><div class="modal-card ad-control-modal"><button class="modal-close" data-close>×</button><span class="eyebrow">ZIVO ADS</span><h2>${window.zivoT?.('adsControl')||'Ad control'}</h2><p class="muted">${window.zivoT?.('adsControlText')||'Control the ad area independently on this device.'}</p><label class="control-row"><span>${window.zivoT?.('adsEnabled')||'Show ads'}</span><input id="ads-enabled" type="checkbox" ${cfg.enabled?'checked':''}></label><label class="control-row"><span>${window.zivoT?.('adsLabel')||'Show ad label'}</span><input id="ads-label" type="checkbox" ${cfg.label?'checked':''}></label><label class="control-row"><span>${window.zivoT?.('adsDensity')||'Ad density'}</span><select id="ads-density"><option value="low" ${cfg.density==='low'?'selected':''}>Low</option><option value="normal" ${cfg.density==='normal'?'selected':''}>Normal</option><option value="high" ${cfg.density==='high'?'selected':''}>High</option></select></label><button class="btn btn-primary full" id="ads-save">${window.zivoT?.('saveProgress')||'Save'}</button></div></div>`;
    root.setAttribute('aria-hidden','false');root.querySelector('[data-close]').onclick=()=>{root.setAttribute('aria-hidden','true');root.innerHTML=''};
    root.querySelector('#ads-save').onclick=()=>{cfg.enabled=root.querySelector('#ads-enabled').checked;cfg.label=root.querySelector('#ads-label').checked;cfg.density=root.querySelector('#ads-density').value;save();apply();root.setAttribute('aria-hidden','true');root.innerHTML=''};
  }
  window.ZIVOZONE_ADS={apply,open,get:()=>({...cfg})};
  document.addEventListener('DOMContentLoaded',apply);
})();

/* ===== auth.js ===== */
/* ============================================================
   ZIVOZONE AUTHENTICATION
   Firebase Compat + reliable local fallback
============================================================ */
(() => {
  'use strict';
  const KEY='zivozone_account_v6';
  const CONFIG=window.ZIVOZONE_FIREBASE_CONFIG;
  let user=null, player=null, cloud=false, ready=false, auth=null, db=null;
  const t=k=>window.zivoT?window.zivoT(k):k;
  const defaultPlayer=(u)=>({uid:u.uid,name:u.name||'ZIVO Player',age:Number(u.age)||18,email:u.email||'',level:1,xp:0,coins:0,wins:0,losses:0,gamesPlayed:0,streak:0,bestStreak:0,language:window.ZIVOZONE_I18N?.get?.()||'ar'});
  const localAccounts=()=>{try{return JSON.parse(localStorage.getItem('zivozone_accounts')||'{}')}catch(e){return {}}};
  function saveLocal(){localStorage.setItem(KEY,JSON.stringify({user,player}))}
  function loadLocal(){try{const x=JSON.parse(localStorage.getItem(KEY)||'null');if(x?.user){user=x.user;player=x.player||defaultPlayer(user)}}catch(e){}}
  function emit(){window.dispatchEvent(new CustomEvent('zivozone-auth',{detail:{user,player,ready,cloud}}))}
  function firebaseMessage(code){const map={
    'auth/email-already-in-use':t('emailUsed'),
    'auth/invalid-email':t('emailError'),
    'auth/weak-password':'كلمة المرور ضعيفة.',
    'auth/wrong-password':t('badLogin'),
    'auth/invalid-credential':t('badLogin'),
    'auth/user-not-found':t('badLogin'),
    'auth/network-request-failed':t('offline'),
    'auth/too-many-requests':'تم إيقاف المحاولات مؤقتًا. حاول لاحقًا.'};return map[code]||t('firebaseError')}
  async function initFirebase(){
    if(!CONFIG||!window.firebase||!window.firebase.initializeApp)return false;
    try{
      if(!firebase.apps.length)firebase.initializeApp(CONFIG);

      auth=firebase.auth();db=firebase.firestore();cloud=true;
      try{auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)}catch(e){}
      try{await db.enablePersistence({synchronizeTabs:true})}catch(e){}
      auth.onAuthStateChanged(async u=>{
        if(!u){if(!String(user?.uid||'').startsWith('local_')){user=null;player=null;saveLocal()}emit();return}
        user={uid:u.uid,email:u.email||'',name:u.displayName||player?.name||'ZIVO Player'};
        const isAdminAccount=String(u.email||'').trim().toLowerCase()===window.ZIVOZONE_CONFIG.ADMIN_EMAIL;
        if(isAdminAccount){
          player=null;
          saveLocal();emit();
          return;
        }
        try{
          const snap=await db.collection('players').doc(u.uid).get();
          player=snap.exists?{uid:u.uid,...snap.data()}:defaultPlayer(user);
          if(!snap.exists)await db.collection('players').doc(u.uid).set({...player,createdAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
          await db.collection('users').doc(u.uid).set({uid:u.uid,email:user.email,name:user.name,role:'player',termsAcceptedAt:firebase.firestore.FieldValue.serverTimestamp(),termsVersion:'ZIVO-TERMS-2026.09',updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
        }catch(e){player=player||defaultPlayer(user);console.warn('Firestore player load:',e)}
        saveLocal();emit();
      });
      return true;
    }catch(e){console.error('ZIVOZONE Firebase init:',e);cloud=false;return false}
  }
  async function register(data){
    const name=String(data.name||'').trim(),email=String(data.email||'').trim().toLowerCase(),password=String(data.password||''),age=Number(data.age);
    const termsAccepted=data.termsAccepted===true;
    if(email===window.ZIVOZONE_CONFIG.ADMIN_EMAIL)throw Error('هذا البريد محجوز لحساب إدارة ZIVOZONE فقط.');
    if(!termsAccepted)throw Error('يجب الموافقة على شروط استخدام ZIVOZONE قبل إنشاء الحساب.');
    if(name.length<2)throw Error(t('nameError'));
    if(!Number.isInteger(age)||age<5||age>100)throw Error(t('ageError'));
    if(!/^\S+@\S+\.\S+$/.test(email))throw Error(t('emailError'));
    if(password.length<6)throw Error(t('passwordError'));
    const old=JSON.parse(localStorage.getItem('zivozone_state_v7')||localStorage.getItem('zivozone_state_v6')||localStorage.getItem('zivozone_state_v5')||'{}');
    if(cloud){
      try{
        const r=await auth.createUserWithEmailAndPassword(email,password),u=r.user;
        await u.updateProfile({displayName:name});
        user={uid:u.uid,email,name,age};
        player={...defaultPlayer(user),xp:Number(old.xp)||0,coins:Number(old.coins)||0,wins:Number(old.wins)||0,gamesPlayed:Number(old.gamesPlayed)||0,level:Number(old.level)||1,language:window.ZIVOZONE_I18N?.get?.()||'ar',termsAcceptedAt:firebase.firestore.FieldValue.serverTimestamp(),termsVersion:'ZIVO-TERMS-2026.09'};
        await db.collection('players').doc(u.uid).set({...player,termsAcceptedAt:firebase.firestore.FieldValue.serverTimestamp(),termsVersion:'ZIVO-TERMS-2026.09',createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
        saveLocal();await track('account_created',{source:'website'});emit();return player;
      }catch(e){throw Error(firebaseMessage(e.code))}
    }
    const accounts=localAccounts();if(accounts[email])throw Error(t('emailUsed'));
    accounts[email]={name,age,email,password,termsAcceptedAt:new Date().toISOString(),termsVersion:'ZIVO-TERMS-2026.09'};localStorage.setItem('zivozone_accounts',JSON.stringify(accounts));
    user={uid:'local_'+btoa(unescape(encodeURIComponent(email))).replace(/=/g,''),email,name,age};
    player={...defaultPlayer(user),xp:Number(old.xp)||0,coins:Number(old.coins)||0,wins:Number(old.wins)||0,gamesPlayed:Number(old.gamesPlayed)||0,level:Number(old.level)||1,termsAcceptedAt:new Date().toISOString(),termsVersion:'ZIVO-TERMS-2026.09'};saveLocal();emit();return player;
  }
  async function login(email,password){
    email=String(email||'').trim().toLowerCase();password=String(password||'');
    if(cloud){try{await auth.signInWithEmailAndPassword(email,password);return player}catch(e){throw Error(firebaseMessage(e.code))}}
    const a=localAccounts()[email];if(!a||a.password!==password)throw Error(t('badLogin'));
    user={uid:'local_'+btoa(unescape(encodeURIComponent(email))).replace(/=/g,''),email:a.email,name:a.name,age:a.age};
    const old=JSON.parse(localStorage.getItem(KEY)||'null');player=old?.player?.email===email?old.player:defaultPlayer(user);saveLocal();emit();return player;
  }
  async function logout(){if(cloud&&auth){try{await auth.signOut()}catch(e){}}user=null;player=null;localStorage.removeItem(KEY);emit()}
  async function track(event,meta={}){
    if(!cloud||!db||!user||String(user.uid).startsWith('local_'))return false;
    try{
      const payload={event:String(event).slice(0,80),meta,createdAt:firebase.firestore.FieldValue.serverTimestamp()};
      await Promise.all([
        db.collection('players').doc(user.uid).collection('events').add(payload),
        db.collection('users').doc(user.uid).collection('activity').add({...payload,uid:user.uid})
      ]);
      return true;
    }catch(e){console.warn('Event save:',e);return false}
  }
  async function update(patch){
    if(!player)return null;player={...player,...patch,language:patch.language||player.language||window.ZIVOZONE_I18N?.get?.()||'ar'};saveLocal();
    if(cloud&&db&&!String(player.uid).startsWith('local_')){try{const safe={...patch};['xp','zivo','coins','wins','gamesPlayed','level'].forEach(k=>delete safe[k]);if(Object.keys(safe).length)await db.collection('players').doc(player.uid).set({...safe,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})}catch(e){console.warn('Firestore update:',e)}}
    emit();return player;
  }
  async function saveResult(result){
    if(!cloud||!db||!user||String(user.uid).startsWith('local_'))return false;
    try{await db.collection('players').doc(user.uid).collection('results').add({...result,createdAt:firebase.firestore.FieldValue.serverTimestamp()});return true}catch(e){console.warn('Result save:',e);return false}
  }
  async function setLanguage(lang){if(player){player.language=lang;saveLocal();if(cloud&&db&&!String(player.uid).startsWith('local_')){try{await db.collection('players').doc(player.uid).set({language:lang},{merge:true})}catch(e){}}emit()}}
  const isLoggedIn=()=>!!user&&!!player;
  async function touchSession(){
    if(user&&cloud&&db&&!String(user.uid).startsWith('local_')){
      try{
        const stamp=firebase.firestore.FieldValue.serverTimestamp();
        const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Amman'}).format(new Date());
        await Promise.all([
          db.collection('players').doc(user.uid).set({lastSeenAt:stamp,lastSeenPath:location.hash||'#home'},{merge:true}),
          db.collection('users').doc(user.uid).set({uid:user.uid,email:user.email,name:user.name,role:'player',lastSeenAt:stamp,lastSeenPath:location.hash||'#home',updatedAt:stamp},{merge:true}),
          db.collection('siteStats').doc('visitors').collection(day).doc(user.uid).set({uid:user.uid,email:user.email,lastSeenAt:stamp},{merge:true})
        ]);
      }catch(e){console.warn('Session touch:',e)}
    }
  }
  async function flushAttempts(){try{await window.ZIVOZONE_INTERNAL.v46?.flush?.()}catch(e){}}
  window.addEventListener('hashchange',()=>{ if(user) { touchSession(); track('page_view',{path:location.hash||'#home'}); } });
  document.addEventListener('visibilitychange',()=>{ if(!document.hidden&&user) touchSession(); });
  setInterval(()=>{ if(user&&!document.hidden) touchSession(); },5*60*1000);

  async function init(){loadLocal();await initFirebase();ready=true;emit()}
  const isAdmin=()=>String(user?.email||'').trim().toLowerCase()===window.ZIVOZONE_CONFIG.ADMIN_EMAIL;
  window.ZIVOZONE_AUTH={register,login,logout,update,saveResult,track,touchSession,flushAttempts,setLanguage,getUser:()=>user,getPlayer:()=>player,isAdmin,isLoggedIn,init,ready:()=>ready,isCloud:()=>cloud};
  init();
})();

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
  const A=window.ZIVOZONE_AUTH,C=window.ZIVOZONE_CHALLENGES,I=window.ZIVOZONE_I18N;
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const LS='zivozone_state_v8';
  const ADMIN_EMAIL=window.ZIVOZONE_CONFIG.ADMIN_EMAIL;
  const ADMIN_NAME='رائف البطوش';
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
  function profile(){const p=A.getPlayer(),u=A.getUser?.(),admin=A.isAdmin?.()||String(u?.email||'').trim().toLowerCase()===ADMIN_EMAIL,l=state.level||1,base=(l-1)*100,prog=Math.max(0,Math.min(100,state.xp-base));$('#profile-name').textContent=admin?ADMIN_NAME:(p?.name||t('guest'));$('#profile-email').textContent=admin?`${u?.email||''} · ADMIN`:(p?.email||t('guestText'));$('#profile-level').textContent=admin?'ADMIN':l;$('#profile-xp').textContent=admin?'—':state.xp;$('#profile-coins').textContent=admin?'—':state.coins;$('#profile-wins').textContent=admin?'—':state.wins;$('#profile-best-streak').textContent=admin?'—':(state.bestStreak||0);$('#player-level-chip').textContent=admin?'ADMIN':`${t('level')} ${l}`;$('#xp-progress').style.width=admin?'100%':prog+'%';$('#logout-btn').hidden=!(A.isLoggedIn()||admin);$('#login-btn').textContent=admin?'👑 ADMIN':A.isLoggedIn()?`👤 ${p?.name||t('profile')}`:t('login')}
  async function reward(xp,coins=0,win=true){state.xp+=Math.max(0,Number(xp)||0);if(win)state.wins++;state.gamesPlayed++;saveState();if(A.isLoggedIn())await A.update({xp:state.xp,wins:state.wins,gamesPlayed:state.gamesPlayed,level:state.level});profile()}
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
  function openTerms(){let o=document.getElementById('zivo-terms-modal');if(!o){o=document.createElement('div');o.id='zivo-terms-modal';o.className='zivo-legal-overlay';o.innerHTML=`<div class="zivo-legal-card" dir="rtl"><button class="zivo-legal-close">×</button><span class="eyebrow">ZIVOZONE · TERMS</span><h2>شروط استخدام ZIVOZONE</h2><p>آخر تحديث: 11 سبتمبر 2026 · الإصدار: ZIVO-TERMS-2026.09</p><div class="zivo-legal-body"><h3>1. قبول الشروط</h3><p>بإنشاء حساب أو استخدام المنصة، يقر المستخدم بأنه قرأ هذه الشروط ووافق عليها. إذا لم يوافق عليها، فلا يجوز له إنشاء حساب أو استخدام الميزات التي تتطلب حسابًا.</p><h3>2. طبيعة ZIVO</h3><p><b>ZIVO هي وحدة افتراضية داخل منصة ZIVOZONE فقط.</b> لا تمثل عملة قانونية أو وديعة أو سهمًا أو استثمارًا أو ضمانًا ماليًا، ولا يوجد بموجب هذه الشروط حق تلقائي في استبدالها نقدًا أو تحويلها إلى أموال أو عملات خارجية. لا يجوز بيعها أو شراؤها أو تداولها خارج الأنظمة التي تعتمدها ZIVOZONE رسميًا.</p><h3>3. التعدين والمكافآت</h3><p>مكافآت التعدين والتحديات تخضع لقواعد المنصة وحدودها، ويمكن لـ ZIVOZONE تعديل معدلات المكافآت أو إيقافها أو تعليق الحسابات المخالفة لحماية المنصة والمستخدمين. الرصيد المعروض داخل الحساب هو رصيد افتراضي للمنصة.</p><h3>4. الحساب والأمان</h3><p>المستخدم مسؤول عن بيانات تسجيل الدخول وعن الأنشطة التي تتم من حسابه. يمنع إنشاء حسابات أو استخدام أدوات آلية بقصد التلاعب بالمكافآت أو الترتيب أو البيانات.</p><h3>5. الاستخدام المقبول</h3><p>يمنع الاحتيال، واستغلال الثغرات، والهجمات الآلية، وإساءة استخدام المحتوى أو الخدمات، وانتحال صفة المدير أو أي مستخدم آخر، ومحاولة الوصول إلى بيانات غير مصرح بها.</p><h3>6. المحتوى والخدمات</h3><p>قد تتغير الألعاب والتحديات والأخبار والميزات بمرور الوقت. لا نضمن توفر كل خدمة دون انقطاع، ونبذل جهودًا معقولة للحفاظ على استقرار المنصة.</p><h3>7. الأخبار والروابط الخارجية</h3><p>الأخبار والروابط الخارجية مقدمة للعرض والمعلومات، وتخضع للمصادر الخارجية وشروطها. لا تتحمل ZIVOZONE مسؤولية محتوى المواقع الخارجية.</p><h3>8. الخصوصية</h3><p>تُستخدم بيانات الحساب واللعب اللازمة لتشغيل المنصة وحفظ التقدم والأمان والتحليلات التشغيلية وفق سياسة الخصوصية التي تعتمدها ZIVOZONE.</p><h3>9. التعديلات والإنهاء</h3><p>يجوز تحديث الشروط أو تعديل الميزات عند الحاجة. استمرار الاستخدام بعد نشر التحديث يعني قبول الشروط المعدلة ضمن الحدود التي يسمح بها القانون المعمول به.</p><h3>10. القانون والحقوق</h3><p>تُطبَّق هذه الشروط بما لا يخالف القوانين الإلزامية المعمول بها. هذه صياغة تشغيلية عامة وليست بديلاً عن مراجعة محامٍ قبل الإطلاق التجاري أو تقديم خدمات مالية.</p></div><div class="zivo-legal-actions"><button class="btn btn-primary zivo-legal-close">فهمت</button></div></div>`;document.body.appendChild(o);o.querySelectorAll('.zivo-legal-close').forEach(b=>b.onclick=()=>o.remove());o.onclick=e=>{if(e.target===o)o.remove()}}else{o.style.display='grid'}}
  window.ZIVOZONE_OPEN_TERMS=openTerms;
  function authModal(after){let mode='register';const render=()=>{openModal(`<button class="modal-close" data-close>×</button><span class="eyebrow">${t('account')}</span><h2>${mode==='register'?t('register'):t('welcomeBack')}</h2><p class="muted">${mode==='register'?t('registerHint'):t('loginHint')}</p><div class="auth-tabs"><button id="tab-register" class="btn ${mode==='register'?'btn-primary':''}">${t('register')}</button><button id="tab-login" class="btn ${mode==='login'?'btn-primary':''}">${t('signIn')}</button></div><form id="auth-form">${mode==='register'?`<div><label>${t('playerName')}</label><input id="auth-name" minlength="2" required placeholder="${esc(t('yourName'))}"></div><div><label>${t('age')}</label><input id="auth-age" type="number" min="5" max="100" required value="18"></div>`:''}<div><label>${t('email')}</label><input id="auth-email" type="email" required placeholder="${esc(t('emailPlaceholder'))}"></div><div><label>${t('password')}</label><input id="auth-pass" type="password" minlength="6" required placeholder="${esc(t('passwordPlaceholder'))}"></div>${mode==='register'?`<label class="zivo-terms-check"><input id="auth-terms" type="checkbox" required><span>أوافق على <button type="button" id="open-terms" class="zivo-inline-link">شروط استخدام ZIVOZONE</button> وسياسة الاستخدام، وأفهم أن ZIVO رصيد افتراضي داخل المنصة فقط وليس نقودًا أو استثمارًا.</span></label>`:''}<button class="btn btn-primary full" type="submit">${mode==='register'?t('createAccount'):t('signIn')}</button></form></div>`);$('#tab-register').onclick=()=>{mode='register';render()};$('#tab-login').onclick=()=>{mode='login';render()};$('#open-terms')?.addEventListener('click',openTerms);$('#auth-form').onsubmit=async e=>{e.preventDefault();try{if(mode==='register')await A.register({name:$('#auth-name').value,age:$('#auth-age').value,email:$('#auth-email').value,password:$('#auth-pass').value,termsAccepted:$('#auth-terms')?.checked===true});else await A.login($('#auth-email').value,$('#auth-pass').value);await A.setLanguage(lang());closeModal();syncFromPlayer();profile();toast(t('success'),'success');if(after)after()}catch(err){toast(err.message||t('firebaseError'),'error')}}};render()}
  function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function adaptiveProfile(id){try{return JSON.parse(localStorage.getItem(`zivo_adaptive_${id}`)||'{\"attempts\":0,\"perfect\":0,\"best\":0,\"last\":0}')}catch(e){return{attempts:0,perfect:0,best:0,last:0}}}
  function recordAdaptiveResult(id,score,total,timedOut){const k=`zivo_adaptive_${id}`;const x=adaptiveProfile(id);x.attempts=(Number(x.attempts)||0)+1;x.last=Math.round((Number(score)||0)/Math.max(1,Number(total)||10)*100);x.best=Math.max(Number(x.best)||0,x.last);if(Number(score)===Number(total)&&!Number(timedOut))x.perfect=(Number(x.perfect)||0)+1;try{localStorage.setItem(k,JSON.stringify(x))}catch(e){}}
  function prepareQuestions(id){
    const src=C.get(id);if(!src)return[];const pool=Array.isArray(src.questions)?src.questions.filter(q=>q&&q.id):[];if(!pool.length)return[];
    const key=`zivo_seen_${id}_v8`;let seen=[];try{seen=JSON.parse(localStorage.getItem(key)||'[]')}catch(e){}
    const fresh=pool.filter(q=>!seen.includes(q.id));
    const x=adaptiveProfile(id), attempts=Number(x.attempts)||0, perfect=Number(x.perfect)||0;
    // First run = broad ramp. Replays progressively bias the pool toward harder questions.
    const floor=Math.min(8,1+Math.max(0,attempts-1)+Math.min(2,perfect));
    let candidates=(fresh.length>=10?fresh:pool).slice();
    if(attempts>0){const hard=candidates.filter(q=>Number(q.d||1)>=floor);if(hard.length>=10)candidates=hard;}
    const weighted=[];candidates.forEach(q=>{const d=Math.max(1,Number(q.d)||1);const weight=1+Math.max(0,d-floor)*2+(attempts?Math.min(6,d):0);for(let i=0;i<weight;i++)weighted.push(q)});
    const chosen=[],used=new Set();
    while(chosen.length<Math.min(10,candidates.length)&&weighted.length){const q=weighted[Math.floor(Math.random()*weighted.length)];if(!used.has(q.id)){used.add(q.id);chosen.push(q)}else weighted.splice(weighted.indexOf(q),1)}
    if(chosen.length<10){for(const q of [...candidates].sort((a,b)=>Number(b.d||0)-Number(a.d||0))){if(!used.has(q.id)){used.add(q.id);chosen.push(q);if(chosen.length>=10)break}}}
    chosen.sort((a,b)=>Number(a.d||1)-Number(b.d||1));
    try{localStorage.setItem(key,JSON.stringify([...seen,...chosen.map(q=>q.id)].slice(-Math.max(60,pool.length))))}catch(e){}
    return chosen;
  }
  function guestGate(id){openModal(`<button class="modal-close" data-close>×</button><span class="eyebrow">${t('guestMode')}</span><h2>${t('guest')}</h2><p>${t('guestText')}</p><div class="modal-actions"><button class="btn btn-primary" id="continue-guest">${t('continueGuest')}</button><button class="btn btn-ghost" id="create-now">${t('createNow')}</button></div>`);$('#continue-guest').onclick=()=>{closeModal();beginGame(id,true)};$('#create-now').onclick=()=>authModal(()=>beginGame(id,false))}
  function startGame(id){const src=C.get(id);if(!src){toast(t('noData'),'error');return}if(id==='horror'){openModal(`<div class="horror-warning-card"><span class="eyebrow">${t('horrorWarningTitle')}</span><h2>${t('horrorWarningHeadline')}</h2><p>${t('horrorWarningText')}</p><p class="horror-warning">${t('horrorWarningNight')}</p><div class="modal-actions"><button class="btn btn-primary" id="enter-horror">${t('horrorEnter')}</button><button class="btn btn-ghost" data-close>${t('close')}</button></div></div>`,'horror-modal phase-1');$('#enter-horror').onclick=()=>{closeModal();beginGame('horror',!A.isLoggedIn())};return}beginGame(id,!A.isLoggedIn())}
  function beginGame(id,guest){const src=C.get(id),horror=id==='horror';game={id,questions:horror?shuffle(src.questions.map(q=>({...q}))):prepareQuestions(id),index:0,score:0,pressureScore:0,streak:0,bestStreak:0,answers:[],guest,locked:false,horrorSignupShown:false,horrorUsed:[],timedOut:0,questionStartedAt:0};if(horror)game.horrorUsed=game.questions.map(q=>q.id);document.body.classList.toggle('horror-active',horror);S().unlock?.();S().startChallenge?.(id);renderQuestion()}
  function currentQ(){return game.questions[game.index]}
  function inputMarkup(q){const isNum=q.type==='number';return `<form id="answer-form" class="input-answer-form"><input id="answer-input" ${isNum?'inputmode="numeric" pattern="[0-9.\\-]+"':''} autocomplete="off" placeholder="${esc(isNum?t('enterNumber'):t('writeAnswer'))}" required><button class="btn btn-primary" type="submit">${t('submitAnswer')}</button></form>`}
  function choiceMarkup(q){const labels=['A','B','C','D'];return `<div class="answers">${q.a.map((x,i)=>`<button class="btn btn-ghost answer" data-i="${i}"><span>${labels[i]}</span>${esc(loc(x))}</button>`).join('')}</div>`}
  function renderQuestion(){const src=C.get(game.id);if(game.id==='horror'&&game.index>=game.questions.length){game.horrorUsed=[];game.questions=shuffle(src.questions.map(q=>({...q})));}const q=currentQ();if(!q){finishGame();return}S().question?.(q.d,game.id);if(game.id==='horror'){horrorNarrate();if(game.index===10)S().phase?.(2);if(game.index===20)S().phase?.(3);if(game.index>0&&game.index%5===0)S().horrorPulse?.(Math.min(4,1+Math.floor(game.index/5)));if(game.index===6)S().warden?.()}const phase=game.id==='horror'?` phase-${game.index<10?1:game.index<20?2:3}`:'';const progress=game.id==='horror'?((game.index%10)/10)*100:Math.round(game.index/game.questions.length*100);const body=q.type==='choice'?choiceMarkup(q):inputMarkup(q);const forensicImage=q.image?`<figure class="forensic-evidence"><img src="${esc(q.image)}" alt="Forensic evidence" loading="lazy"><figcaption>دليل مسرح الجريمة — حلّل التفاصيل قبل الإجابة</figcaption></figure>`:'';const warden=game.id==='horror'&&game.index>=6?`<div class="warden">${t('warden')}</div>`:'';const footer=game.id==='horror'?`<span class="horror-status">${t('horrorQuestion')} ${game.index+1}</span>`:`<span>${game.score} ${t('correct')}</span><span class="pressure-hud">⚡ ${t('pressure')}: <b>${game.pressureScore}</b> · 🔥 ${t('streak')}: <b>${game.streak}</b></span>`;const horrorPlayer=game.id==='horror'?`<div class="horror-audio-player"><button type="button" id="horror-audio-toggle" class="btn btn-small btn-ghost">🔊 ${t('horrorAudio')}</button><input id="horror-volume" type="range" min="0" max="1" step="0.01" value="${S().volume?.()||.9}" aria-label="${t('horrorVolume')}"></div>`:'';openModal(`<button class="modal-close" data-action="quit-game" aria-label="Close">×</button><div class="game-head"><span class="eyebrow">${esc(loc(src.title))}</span><strong>${game.id==='horror'?game.index+1:`${game.index+1} / ${game.questions.length}`}</strong></div><div id="question-timer" class="question-timer" role="timer" aria-live="polite"><span class="timer-label">${esc(t('timeLeft'))}</span><strong id="question-timer-number">30</strong><div class="question-timer-track"><span id="question-timer-fill"></span></div></div><div class="question-progress"><span style="width:${progress}%"></span></div>${warden}${forensicImage}<h2>${esc(loc(q.q))}</h2><div class="difficulty">${t('difficulty')} ${q.d}/10</div>${body}${horrorPlayer}<div class="game-footer">${footer}<button class="btn btn-small btn-ghost" data-action="quit-game">${t('exit')}</button></div>`,game.id==='horror'?`horror-modal${phase}`:'');if(q.type==='choice')$$('.answer').forEach(b=>b.onclick=()=>{S().click?.();answerChoice(Number(b.dataset.i))});else $('#answer-form').onsubmit=e=>{e.preventDefault();S().click?.();answerInput($('#answer-input').value)};$('#modal-root [data-action="quit-game"]').onclick=quitGame;if(game.id==='horror'){$('#horror-audio-toggle')?.addEventListener('click',async()=>{await S().unlock?.();S().toggle?.();$('#horror-audio-toggle').textContent=(S().isEnabled?.()?'🔊 ':'🔇 ')+t('horrorAudio')});$('#horror-volume')?.addEventListener('input',e=>S().setVolume?.(e.target.value));}startQuestionTimer();}
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
  async function finishGame(){clearQuestionTimer();clearIdentityTimer();S().stopChallenge?.();document.body.classList.remove('horror-active');S().success?.();const src=C.get(game.id),score=game.score,total=game.questions.length,perfect=total>0&&score===total&&Number(game.timedOut||0)===0,pressure=Math.min(100,Math.round(game.pressureScore/Math.max(1,total))),performance=Math.min(100,Math.round((score/Math.max(1,total))*75+pressure*.25)),xp=Math.max(10,Math.round(performance/100*src.xp)),coins=perfect?10:0,win=score>=Math.ceil(total*.5);recordAdaptiveResult(game.id,score,total,game.timedOut||0);await reward(xp,0,win);window.dispatchEvent(new CustomEvent('zivozone-result',{detail:{challenge:game.id,gameId:game.id,score,total,correct:score,questions:total,perfect,timedOut:game.timedOut||0,xp,coins,zivoReward:coins,eventId:(window.crypto?.randomUUID?.()||('game_'+Date.now()+'_'+Math.random().toString(36).slice(2)))}}));
      state.bestStreak=Math.max(Number(state.bestStreak)||0,game.bestStreak||0);saveState();if(A.isLoggedIn())await A.update({bestStreak:state.bestStreak});profile();if(game.id==='daily')localStorage.setItem('zivo_daily_'+new Date().toISOString().slice(0,10),'1');await A.saveResult({challengeId:game.id,score,total,xp,coins,pressureScore:game.pressureScore,bestStreak:game.bestStreak,timedOut:game.timedOut,guest:game.guest,language:lang()});openModal(`<button class="modal-close" data-close>×</button><span class="eyebrow">${t('result')}</span><h2>${win?t('excellent'):t('roundEnded')}</h2><p>${t('score')}: <strong>${score}/${total}</strong> — <strong>${Math.round((score/Math.max(1,total))*100)}%</strong></p><p>✅ ${t('correct')}: <strong>${score}</strong> &nbsp; ❌ ${t('wrong')}: <strong>${Math.max(0,total-score-game.timedOut)}</strong> &nbsp; ⏱ <strong>${game.timedOut}</strong></p><p>⚡ ${t('pressure')}: <strong>${game.pressureScore}</strong> &nbsp; 🔥 ${t('bestStreak')}: <strong>${game.bestStreak}</strong></p><p>+${xp} XP &nbsp; ${perfect?`+${coins} 🪙 ZIVO — علامة كاملة 🎯`:'0 🪙 ZIVO — العملة للتحديات ذات العلامة الكاملة فقط'}</p>${game.guest?`<div class="save-call"><strong>${t('guestSave')}</strong></div>`:''}<div class="modal-actions"><button class="btn btn-primary" id="again">${t('again')}</button>${game.guest?`<button class="btn btn-ghost" id="register-result">${t('saveProgress')}</button>`:''}<button class="btn btn-ghost" data-action="return-challenges">${t('close')}</button></div>`);$('#again').onclick=()=>{closeModal();startGame(game.id)};$('#register-result')?.addEventListener('click',()=>authModal(()=>{toast(t('success'),'success');profile()}))}
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
  function renderChallenges(){const today=new Date().toISOString().slice(0,10),done=localStorage.getItem('zivo_daily_'+today);const raw=C.getAll();const seenIds=new Set();const list=raw.filter(x=>x&&x.id&&!seenIds.has(x.id)&&seenIds.add(x.id));const visual={forensic:'assets/forensic/scene-door.svg',horror:'assets/forensic/scene-camera.svg'};const cardVisual=x=>visual[x.id]?`<img class="challenge-visual" src="${visual[x.id]}" alt="${esc(loc(x.title))}" loading="lazy">`:`<div class="challenge-visual challenge-visual-fallback" aria-hidden="true">${esc(x.icon||'🎯')}</div>`;$('#challenge-list').innerHTML=list.map(x=>`<article class="challenge-card">${cardVisual(x)}<div class="challenge-copy"><span class="card-tag">${t('questions10')} · 30s</span><h3>${esc(loc(x.title))}</h3><p>${esc(loc(x.desc||'تحدٍ تفاعلي مصمم لقياس مهارة محددة.'))}</p></div><button class="btn btn-primary" data-challenge="${x.id}" ${done&&x.id==='daily'?'disabled':''}>${done&&x.id==='daily'?t('done'):t('start')}</button></article>`).join('')+`<article class="challenge-card special"><div class="challenge-visual challenge-visual-fallback">👁️</div><div class="challenge-copy"><span class="card-tag danger">∞ · 30s</span><h3>${esc(loc(C.horror.title))}</h3><p>${esc(loc(C.horror.desc||'تجربة رعب تفاعلية متعددة المراحل.'))}</p></div><button class="btn btn-primary danger-btn" data-challenge="horror">${t('enter')}</button></article>`}
  const NEWS=[{key:'FIFA',url:'https://www.fifa.com/',icon:'🌍',title:O('فيفا','FIFA')},{key:'AFC',url:'https://www.the-afc.com/',icon:'🏆',title:O('الاتحاد الآسيوي','AFC')},{key:'UEFA',url:'https://www.uefa.com/',icon:'⭐',title:O('يويفا','UEFA')},{key:'ESPN',url:'https://www.espn.com/',icon:'📰',title:O('ESPN','ESPN')}];
  function renderNewsSources(){const box=$('#news-list');if(!box)return;box.innerHTML=NEWS.map(n=>`<article class="sports-card"><div class="icon">${n.icon}</div><span class="card-tag">${n.key}</span><h3>${esc(loc(n.title))}</h3><p>${esc(t('sportsIntro'))}</p><a class="btn btn-ghost" href="${n.url}" target="_blank" rel="noopener noreferrer">${t('openNews')}</a></article>`).join('')}
  async function sports(){renderNewsSources();window.ZIVOZONE_NEWS?.load?.($('#news-list'),lang());window.ZIVOZONE_NEWS?.loadJordan?.($('#jordan-news-list'),lang());window.ZIVOZONE_FIXTURES?.load?.($('#fixture-list'),lang());const box=$('#sports-list');if(!box)return;box.innerHTML=`<article class="sports-card loading-card"><div class="spinner"></div><h3>${esc(t('sportsTitle'))}</h3><p>${esc(t('loader'))}</p></article>`;const teamIds=['133604','133602','133738','133739'];let events=[];try{const data=await Promise.all(teamIds.map(id=>fetch(`https://www.thesportsdb.com/api/v1/json/123/eventsnext.php?id=${id}`).then(r=>r.ok?r.json():null).catch(()=>null)));data.forEach(d=>{if(d?.events)events.push(...d.events)})}catch(e){}const seen=new Set();events=events.filter(e=>{const k=e.idEvent||`${e.strEvent}-${e.dateEvent}`;if(seen.has(k))return false;seen.add(k);return true}).slice(0,8);if(!events.length){box.innerHTML=`<article class="sports-card"><div class="icon">📡</div><h3>${esc(t('noData'))}</h3><p>${esc(t('newsUnavailable'))}</p></article>`;return}box.innerHTML=events.map(e=>`<article class="sports-card"><div class="match-icon">⚽</div><span class="card-tag">${esc(e.strLeague||e.strSport||'Sport')}</span><h3>${esc(e.strHomeTeam||'Home')} <span class="versus">VS</span> ${esc(e.strAwayTeam||'Away')}</h3><p>${esc(e.dateEvent||'')} ${esc(e.strTime||'')}</p><a class="btn btn-ghost" href="https://www.thesportsdb.com/" target="_blank" rel="noopener noreferrer">${t('open')}</a></article>`).join('')}
  function localAIReply(q){const x=q.toLowerCase();if(x.includes('مستوى')||x.includes('level')||x.includes('等级')||x.includes('nivel'))return`${t('level')} ${state.level} — ${state.xp} XP, ${state.coins} ZIVO.`;if(x.includes('تحد')||x.includes('challenge')||x.includes('挑战')||x.includes('desaf'))return t('challengeText');if(x.includes('رياض')||x.includes('sport')||x.includes('体育')||x.includes('deporte'))return t('sportsIntro');return t('aiWelcome')}
  async function askAI(message){const payload={message:String(message||'').slice(0,1000),language:lang(),player:{level:state.level,xp:state.xp,gamesPlayed:state.gamesPlayed,coins:state.coins}};try{if(window.ZIVOZONE_REAL_AI?.ask){return await window.ZIVOZONE_REAL_AI.ask(message)}}catch(e){console.warn('ZIVO AI Gemini:',e);if(e?.message)toast(e.message,'error')}try{const f=window.firebase?.functions?.();if(f){const fn=f.httpsCallable(API.aiCallable||'zivoAI');const r=await fn(payload);if(r?.data?.reply)return r.data.reply}}catch(e){console.warn('ZIVO AI callable:',e)}if(API.aiEndpoint){try{const r=await fetch(API.aiEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});if(r.ok){const d=await r.json();if(d.reply)return d.reply}}catch(e){console.warn('ZIVO AI endpoint:',e)}}return localAIReply(message)}
  function openAIModal(){
    let o=document.getElementById('zivo-ai-modal-clean');
    if(!o){
      o=document.createElement('div');o.id='zivo-ai-modal-clean';o.className='modal-root-clean';
      o.innerHTML=`<div class="modal-backdrop"><div class="modal-card clean-ai-modal" dir="rtl"><button class="clean-ai-close" aria-label="إغلاق">×</button><span class="eyebrow">ZIVO AI</span><h2>مساعد ZIVO الذكي</h2><div id="clean-ai-messages" class="ai-messages"><div class="ai-message bot">أهلًا بك 🤖 اسألني عن مستواك أو الألعاب أو التحديات أو الرياضة.</div></div><form id="clean-ai-form" class="ai-form"><input id="clean-ai-input" maxlength="1000" required placeholder="اكتب سؤالك..."><button class="btn btn-primary" type="submit">إرسال</button></form><small class="muted">ZIVO AI ميزة مساعدة داخل المنصة.</small></div></div>`;
      document.body.appendChild(o);
      o.querySelector('.clean-ai-close').onclick=()=>o.remove();
      o.querySelector('.modal-backdrop').onclick=e=>{if(e.target===e.currentTarget)o.remove()};
      o.querySelector('#clean-ai-form').onsubmit=async e=>{e.preventDefault();const input=o.querySelector('#clean-ai-input'),v=input.value.trim();if(!v)return;const box=o.querySelector('#clean-ai-messages');const u=document.createElement('div');u.className='ai-message user';u.textContent=v;box.append(u);input.value='';const b=document.createElement('div');b.className='ai-message bot';b.textContent='…';box.append(b);b.textContent=await askAI(v);box.scrollTop=box.scrollHeight};
    }
    o.querySelector('#clean-ai-input')?.focus();
  }

  function applyLanguage(){const l=lang();document.documentElement.lang=l;document.documentElement.dir=I.dir[l];$$('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;if(I.T[l]?.[k]!==undefined)el.textContent=t(k)});$$('[data-i18n-placeholder]').forEach(el=>el.placeholder=t(el.dataset.i18nPlaceholder));renderChallenges();renderNewsSources();profile();sports();$('#footer-tagline')?.replaceChildren(document.createTextNode(t('footerTagline')))}
  document.addEventListener('click',e=>{const gameBtn=e.target.closest('[data-game],[data-challenge]');if(gameBtn){e.preventDefault();startGame(gameBtn.dataset.game||gameBtn.dataset.challenge);return}const action=e.target.closest('[data-action]')?.dataset.action;if(action==='scroll-games'||action==='scroll-challenges'){e.preventDefault();$('#challenges')?.scrollIntoView({behavior:'smooth'});return}if(action==='open-identity'){identity();return}if(action==='open-wallet'){window.ZIVOZONE_ECONOMY?.open?.();return}if(action==='open-ai'){openAIModal();return}if(action==='login'){A.isLoggedIn()?location.hash='#profile':authModal();return}if(action==='logout'){A.logout().then(()=>{state={level:1,xp:0,coins:0,wins:0,gamesPlayed:0,bestStreak:0,identity:null};saveState();profile();toast(t('logoutDone'))});return}if(action==='refresh-sports'){sports();return}if(action==='ad-info'){toast(t('adText'));return}if(action==='ads-control'){window.ZIVOZONE_ADS?.open?.();return}if(action==='return-challenges'){returnToChallenges();return}if(action==='quit-game'){quitGame();return}});
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
  function bind(){const audioBtn=$('#audio-toggle');if(audioBtn){audioBtn.textContent=S().isEnabled?.()?'🔊':'🔇';audioBtn.onclick=async()=>{await S().unlock?.();S().toggle?.();audioBtn.textContent=S().isEnabled?.()?'🔊':'🔇'}}$('#language-select').value=lang();$('#language-select').onchange=async e=>{I.set(e.target.value);await A.setLanguage(e.target.value);applyLanguage();toast(t('updateDone'),'success')};const accountRoute=()=>A.isAdmin?.()?location.hash='#admin':A.isLoggedIn()?location.hash='#profile':authModal();$('#login-btn').onclick=accountRoute;$$('[data-action="login"]').forEach(b=>b.onclick=accountRoute);$('#ai-form').onsubmit=async e=>{e.preventDefault();const input=$('#ai-input'),v=input.value.trim();if(!v)return;const box=$('#ai-messages');const u=document.createElement('div');u.className='ai-message user';u.textContent=v;box.append(u);input.value='';const b=document.createElement('div');b.className='ai-message bot';b.textContent='…';box.append(b);b.textContent=await askAI(v);box.scrollTop=box.scrollHeight}}
  window.addEventListener('zivozone-auth',e=>{syncFromPlayer();profile();const el=$('#firebase-status');if(el){el.textContent=e.detail?.cloud?'●':'○';el.classList.toggle('online',!!e.detail?.cloud);el.title=e.detail?.cloud?'Firebase connected':'Guest/local mode'}});
  window.addEventListener('zivozone-auth',()=>{A.touchSession?.();A.flushAttempts?.();});
  window.addEventListener('hashchange',()=>A.touchSession?.());
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)A.touchSession?.()});
  setInterval(()=>{if(!document.hidden)A.touchSession?.();},5*60*1000);
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
    if(!window.ZIVOZONE_INTERNAL.v18?.get)return null;
    return window.ZIVOZONE_INTERNAL.v18.get(id);
  }
  window.ZIVOZONE_INTERNAL.v18_engine={
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
  window.ZIVOZONE_INTERNAL.v18_catalog=[
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
    if(window.ZIVOZONE_INTERNAL.v18_bank) Object.values(window.ZIVOZONE_INTERNAL.v18_bank).forEach(b=>out.push(b));
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
    const p=window.ZIVOZONE_INTERNAL.v21?.get?.()||window.ZIVOZONE_PLAYER?.get?.()||{};
    const level=Math.max(1,Number(p.level)||1);
    const history=Array.isArray(p.history)?p.history.slice(-8):[];
    const recentAvg=history.length?history.reduce((n,x)=>n+(Number(x.score)||0),0)/history.length:50;
    const repeatKey='zivozone_adaptive_runs_v102:'+id;
    let attempts=0,perfectRuns=0;
    try{const ah=JSON.parse(localStorage.getItem(repeatKey)||'{}');attempts=Number(ah.attempts)||0;perfectRuns=Number(ah.perfectRuns)||0}catch(e){}
    let shift=level>=20?1:level>=8?0.5:0;
    if(recentAvg>=80)shift+=0.5;
    if(recentAvg<45)shift-=0.5;
    shift+=Math.min(3,perfectRuns*0.8);
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
        <div class="v20-meta"><span>${phase}</span><strong id="v20-timer">30</strong></div>
        <article class="v20-question"><div class="v20-qnum">QUESTION ${String(i+1).padStart(2,'0')}</div><h2>${escV20(locV20(q.q||q.question||''))}</h2>
        <div class="v20-answer-area">${answerArea(q)}</div><div class="v20-feedback" aria-live="polite"></div></article>
        <div class="v20-live"><span>🔥 ${streak}</span><span>🏆 ${score}</span></div>
      </div>`;
      $('.v20-exit',mount).onclick=close;
      const form=$('.v20-form',mount);
      form?.addEventListener('submit',e=>{e.preventDefault();submit(form,q)});
      const opts=mount.querySelectorAll('.v20-option');
      opts.forEach(o=>o.onclick=()=>submit({value:o.dataset.value},q));
      cleanup();let left=30;
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
      const feedback=mount.querySelector('.v20-feedback'); if(feedback) feedback.textContent=ok?'✓ إجابة صحيحة':'✕ الإجابة غير صحيحة';
      setTimeout(()=>{i++;render()},420);
    }
    async function finish(){
      cleanup();
      const perfect = run.questions.length > 0 && correct === run.questions.length && Number(timed||0) === 0;
      const zivoReward = perfect ? 10 : 0;
      try{const key='zivozone_adaptive_runs_v102:'+run.id;const ah=JSON.parse(localStorage.getItem(key)||'{}');ah.attempts=(Number(ah.attempts)||0)+1;ah.perfectRuns=(Number(ah.perfectRuns)||0)+(perfect?1:0);ah.lastScore=correct;ah.lastAt=Date.now();localStorage.setItem(key,JSON.stringify(ah))}catch(e){}
      const nextDifficulty=perfect?'تم رفع مستوى الصعوبة للجولة التالية.':'ستتكيّف الجولة التالية مع نتيجتك الأخيرة.';
      if(window.ZIVOZONE_PLAYER?.addProgress){
        try {
          await window.ZIVOZONE_PLAYER.addProgress({id:run.id,score,bestStreak:best,timedOut:timed,questions:run.questions.length,speedScore:Math.max(0,100-timed*8)});
        } catch(e) { console.warn('ZIVO V20 player progress:', e); }
      }
      window.dispatchEvent(new CustomEvent('zivozone-result',{detail:{challenge:run.id,gameId:run.id,score:correct,total:run.questions.length,perfect,xp:0,coins:zivoReward,zivoReward,eventId:(window.crypto?.randomUUID?.()||('v20_'+Date.now()+'_'+Math.random().toString(36).slice(2)))} }));
      
      if(window.ZIVOZONE_INTERNAL.v46?.submit && window.ZIVOZONE_AUTH?.isLoggedIn?.()){
        window.ZIVOZONE_INTERNAL.v46.submit({challengeId:run.id,attemptId:(crypto?.randomUUID?.()||('attempt-'+Date.now())),answers:submittedAnswers,total:run.questions.length,correct,score:Math.round(correct/run.questions.length*100),startedAt:new Date(Date.now()-Math.max(0,(performance.now()-startAt))).toISOString()}).then(async r=>{
          if(r?.data?.ok || r?.data?.verified || r?.accepted){
            window.ZIVOZONE_AUTH.track?.('challenge_completed',{challengeId:run.id,score:correct,total:run.questions.length,timedOut:timed,server:!!r?.server});
            try{await window.ZIVOZONE_AUTH.saveResult?.({challengeId:run.id,score:correct,total:run.questions.length,points:score,timedOut:timed,bestStreak:best,guest:false,serverVerified:!!r?.server})}catch(e){}
          }
          window.ZIVOZONE_AUTH.flushAttempts?.();
          window.ZIVOZONE_AUTH.touchSession?.();
        }).catch(()=>{});
      }
      mount.innerHTML=`<div class="v20-result"><div class="v20-result-icon">✓</div><h2>انتهت الجولة</h2><div class="v20-result-score">${correct}/10</div><p>الصحيحة: ${correct} &nbsp; • &nbsp; الخاطئة: ${Math.max(0,10-correct-timed)} &nbsp; • &nbsp; انتهى وقت: ${timed}</p><p>النقاط: <strong>${score}</strong> &nbsp; • &nbsp; أفضل سلسلة: ${best}</p><p class="v20-adaptive-note">🧠 ${nextDifficulty}</p><p id="v20-cloud-status" class="muted">${window.ZIVOZONE_AUTH?.isLoggedIn?.()?'☁️ تم إرسال النتيجة للحساب':'👤 سجّل حسابًا لحفظ التقدم على السحابة'}</p><div><button class="v20-again">جولة جديدة</button><button class="v20-exit">خروج</button></div></div>`;
      $('.v20-again',mount).onclick=()=>start(run.id);
      $('.v20-exit',mount).onclick=close;
    }
    mount.classList.add('active');document.body.classList.add('v20-playing');
    if(id==='horror'&&window.ZIVOZONE_DARKROOM_V19)window.ZIVOZONE_DARKROOM_V19.start();
    render();
  }
  window.ZIVOZONE_INTERNAL.v20={start,findBanks,pick,clearHistory:()=>writeUsed([])};
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
  window.ZIVOZONE_INTERNAL.v21={record,get,sync,calcLevel};
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
    const p=window.ZIVOZONE_INTERNAL.v21?.get?.()||{};
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
  window.ZIVOZONE_INTERNAL.v22_content={read,write,mark,freshQuestions};
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
  function balance(){return Number(window.ZIVOZONE_INTERNAL.v25?.get?.()?.balance||0)}
  function buy(id){
    const item=catalog.find(x=>x.id===id),s=read();if(!item)return false;
    if(s.owned.includes(id))return true;
    if(balance()<item.price)return false;
    if(!window.ZIVOZONE_INTERNAL.v25?.spend?.(item.price,'shop:'+id))return false;
    s.owned.push(id);s.purchases++;s.spent+=item.price;write(s);render();return true;
  }
  function claimDaily(){
    const d=new Date().toISOString().slice(0,10),s=read();
    if(s.dailyClaim===d)return false;
    s.dailyClaim=d;write(s);
    window.ZIVOZONE_INTERNAL.v25?.add?.(3,'daily_claim_v26');render();return true;
  }
  function profile(){
    const p=window.ZIVOZONE_INTERNAL.v21?.get?.()||{},s=read(),v=window.ZIVOZONE_INTERNAL.v25?.get?.()||{};
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
    // V84: the unified economy launcher is owned by ZIVOZONE_ECONOMY.
    // Keep V26 API for compatibility, but do not create a second currency button.
  }
  window.ZIVOZONE_INTERNAL.v26={open,buy,claimDaily,profile,catalog};
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
    const p=window.ZIVOZONE_INTERNAL.v26?.profile?.()||{};
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
  window.ZIVOZONE_INTERNAL.v27={snapshot,queue,flush,submitChallenge,pending:()=>safeRead().length};
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
    const p=window.ZIVOZONE_INTERNAL.v27?.snapshot?.()||{};
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

  window.ZIVOZONE_INTERNAL.v28={
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
    o.querySelector('#v28-sync').onclick=async()=>{await window.ZIVOZONE_INTERNAL.v28?.sync?.();render()};
    o.querySelector('#v28-refresh').onclick=render;
  }
  function render(){
    mount();
    const o=document.getElementById('v28-center');o.classList.add('open');
    const p=window.ZIVOZONE_INTERNAL.v26?.profile?.()||{},cloud=window.ZIVOZONE_INTERNAL.v28?.cloud?.(),pending=window.ZIVOZONE_INTERNAL.v28?.pending?.()||0;
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
  const profile=()=>window.ZIVOZONE_INTERNAL.v26?.profile?.()||window.ZIVOZONE_INTERNAL.v27?.snapshot?.()||{};
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

  window.ZIVOZONE_INTERNAL.v29={cloud,saveProfile,submitScore,leaderboard,sanitizeName};
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
    if(!window.ZIVOZONE_INTERNAL.v29?.cloud?.()){s.textContent='سجّل الدخول لعرض الترتيب العالمي';l.innerHTML='';return}
    const rows=await window.ZIVOZONE_INTERNAL.v29.leaderboard(20);
    if(!rows.length){s.textContent='لا توجد نتائج سحابية بعد';l.innerHTML='';return}
    s.textContent='أفضل النتائج · ZIVOZONE';
    l.innerHTML=rows.map(r=>`<div class="v29-row"><span>#${r.rank}</span><b>${window.ZIVOZONE_INTERNAL.v29.sanitizeName(r.displayName)}</b><strong>${Number(r.bestScore)||0}</strong></div>`).join('');
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
    const p=window.ZIVOZONE_INTERNAL.v26?.profile?.()||{},old=read();
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
    try{window.ZIVOZONE_INTERNAL.v29?.saveProfile?.()}catch(e){}
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
  window.ZIVOZONE_INTERNAL.v30={get,stats,record,open,render};
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
  const p=()=>window.ZIVOZONE_INTERNAL.v30?.get?.()||window.ZIVOZONE_INTERNAL.v26?.profile?.()||{};
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
  window.ZIVOZONE_INTERNAL.v31={state,open,share};
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
      <div class="v32-rules"><span>⏱ 30 ثانية لكل سؤال</span><span>🏆 سجّل أفضل نتيجة</span><span>🔥 ابنِ سلسلة لعب</span></div></div>`;
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
  window.ZIVOZONE_INTERNAL.v32={open,state,challenge:pick};
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
  const prof=()=>window.ZIVOZONE_INTERNAL.v30?.get?.()||window.ZIVOZONE_INTERNAL.v26?.profile?.()||{};
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
      if(window.ZIVOZONE_INTERNAL.v26?.addXP) window.ZIVOZONE_INTERNAL.v26.addXP(s.xpReward);
      if(window.ZIVOZONE_INTERNAL.v26?.addZIVO) window.ZIVOZONE_INTERNAL.v26.addZIVO(s.zivoReward);
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
  window.ZIVOZONE_INTERNAL.v33={state,complete:ensure,claim,open};
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
  const profile=()=>window.ZIVOZONE_INTERNAL.v30?.get?.()||window.ZIVOZONE_INTERNAL.v26?.profile?.()||{};
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
      if(window.ZIVOZONE_INTERNAL.v26?.addXP)window.ZIVOZONE_INTERNAL.v26.addXP(reward.xp);
      if(window.ZIVOZONE_INTERNAL.v26?.addZIVO)window.ZIVOZONE_INTERNAL.v26.addZIVO(reward.zivo);
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
  window.ZIVOZONE_INTERNAL.v34={get,progress,claim,open};
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
  window.ZIVOZONE_INTERNAL.v35={state,add,open,levelFor};
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
  window.ZIVOZONE_INTERNAL.v36={enqueue,flush,syncResult,pending:()=>read().length};
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
      if(window.ZIVOZONE_INTERNAL.v30?.get)return window.ZIVOZONE_INTERNAL.v30.get()||{};
      if(window.ZIVOZONE_INTERNAL.v26?.profile)return window.ZIVOZONE_INTERNAL.v26.profile()||{};
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
      o.querySelector('#v37-challenge').onclick=()=>window.ZIVOZONE_INTERNAL.v32?.open?.();
      o.querySelector('#v37-mission').onclick=()=>window.ZIVOZONE_INTERNAL.v34?.open?.();
      o.querySelector('#v37-compete').onclick=()=>window.ZIVOZONE_INTERNAL.v33?.open?.();
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
  window.ZIVOZONE_INTERNAL.v37={open,render};
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
    o.querySelector('#v38-pending').textContent=window.ZIVOZONE_INTERNAL.v36?`${window.ZIVOZONE_INTERNAL.v36.pending()} PENDING`:'SYNC';
    o.querySelector('.v38-status i').classList.toggle('on',navigator.onLine);
  }
  function mount(){
    if(document.getElementById('v38-open'))return;
    const b=document.createElement('button');b.id='v38-open';b.textContent='✦ مركز ZIVOZONE';b.onclick=open;document.body.appendChild(b);
    ['zivozone-result','zivozone-reward','zivozone-cloud-synced','online','offline'].forEach(e=>window.addEventListener(e,render));
  }
  window.ZIVOZONE_INTERNAL.v38={open,render};
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
  window.ZIVOZONE_INTERNAL.v39={open,render,getChallenges,start};
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
    if(window.ZIVOZONE_INTERNAL.v35?.add && !d.__v40processed){
      window.ZIVOZONE_INTERNAL.v35.add(payload.xp,payload.correct,payload.score);
    }
    if(window.ZIVOZONE_INTERNAL.v36?.syncResult && !d.__v40processed){
      window.ZIVOZONE_INTERNAL.v36.syncResult(payload);
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
    window.ZIVOZONE_INTERNAL.v41={
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
    window.ZIVOZONE_INTERNAL.v42={sync,record,clear,getUser};
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

  window.ZIVOZONE_INTERNAL.v43={health,saveChallengeResult,saveQuestionHistory,flushQueue,init,isCloudReady};
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

  window.ZIVOZONE_INTERNAL.v44={
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

  // V105.3 performance hardening: avoid a document-wide MutationObserver.
  // UI modules call repairButtons when they actually mount or change.

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

  window.ZIVOZONE_INTERNAL.v45={submit,flush,configureEndpoint:function(url){
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

  const FN_NAME='completeGameAttempt';
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
      correct:Math.max(0,Math.min(100,Number(x.correct)||0)),
      score:Math.max(0,Math.min(100,Number(x.score)||0)),
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

  window.ZIVOZONE_INTERNAL.v46={submit,flush,pending:()=>readQ().length};
  window.addEventListener('online',()=>flush());
})();

/* ===== v23_smart.js ===== */
/* ============================================================
   ZIVOZONE V23 — SMART CHALLENGE INTELLIGENCE
   Additive layer. Works with V20/V21/V22 and never touches Dark Room.
============================================================ */
(function(){
  'use strict';
  const KEY='zivozone_v23_metrics';
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{"sessions":0,"answered":0,"timeouts":0,"correct":0,"byChallenge":{}}')}catch(e){return {sessions:0,answered:0,timeouts:0,correct:0,byChallenge:{}}}}
  function write(x){try{localStorage.setItem(KEY,JSON.stringify(x))}catch(e){}}
  function record(d){
    const x=read();x.sessions+=(d.session?1:0);x.answered+=Number(d.answered)||0;x.correct+=Number(d.correct)||0;x.timeouts+=Number(d.timeouts)||0;
    const id=d.challenge||'unknown';x.byChallenge[id]=x.byChallenge[id]||{sessions:0,correct:0,answered:0,timeouts:0};
    const c=x.byChallenge[id];c.sessions+=(d.session?1:0);c.correct+=Number(d.correct)||0;c.answered+=Number(d.answered)||0;c.timeouts+=Number(d.timeouts)||0;write(x);return x;
  }
  function get(){return read()}
  function snapshot(){
    const x=read(), accuracy=x.answered?Math.round(x.correct/x.answered*100):0;
    return {sessions:x.sessions,answered:x.answered,correct:x.correct,timeouts:x.timeouts,accuracy};
  }
  window.ZIVOZONE_INTERNAL.v23={record,get,snapshot};
})();

/* ============================================================
   ZIVOZONE V85 — ACCOUNT-SCOPED ENGAGEMENT
   Active visible time per signed-in user; idle sessions do not count.
============================================================ */
(function(){'use strict';
  const IDLE=90*1000,TIER=10*60,BASE='zivozone_engagement_v85';
  const uid=()=>window.firebase?.auth?.()?.currentUser?.uid||'guest';
  const key=()=>`${BASE}:${uid()}`;
  const read=()=>{try{return JSON.parse(localStorage.getItem(key())||'{}')}catch(e){return{}}};
  const write=v=>{try{localStorage.setItem(key(),JSON.stringify(v))}catch(e){}};
  let s={activeSeconds:0,lastTick:Date.now(),lastActivity:Date.now(),claimedTiers:0,lastSync:0,...read()};
  const activity=()=>{s.lastActivity=Date.now()};
  ['pointermove','pointerdown','keydown','touchstart','scroll'].forEach(e=>addEventListener(e,activity,{passive:true}));
  function tick(){const now=Date.now();const dt=Math.max(0,Math.min(15,(now-(s.lastTick||now))/1000));s.lastTick=now;if(document.visibilityState==='visible'&&now-s.lastActivity<=IDLE){s.activeSeconds+=dt;write(s)}}
  function activeMinutes(){return Math.floor(s.activeSeconds/60)}
  function claimableBonus(){return Math.max(0,Math.min(10,Math.floor(s.activeSeconds/TIER)-Number(s.claimedTiers||0)))}
  function markBonusClaimed(n){s.claimedTiers=Math.min(10,(Number(s.claimedTiers)||0)+Math.max(0,Number(n)||0));write(s)}
  async function sync(){const u=window.firebase?.auth?.()?.currentUser,d=window.firebase?.firestore?.();if(!u||!d)return false;try{const now=d.FieldValue?.serverTimestamp?d.FieldValue.serverTimestamp():firebase.firestore.FieldValue.serverTimestamp();await Promise.all([d.collection('users').doc(u.uid).set({engagement:{activeSeconds:Math.floor(s.activeSeconds),activeMinutes:activeMinutes(),updatedAt:now}},{merge:true}),d.collection('players').doc(u.uid).set({activeSeconds:Math.floor(s.activeSeconds),activeMinutes:activeMinutes(),engagementUpdatedAt:now},{merge:true})]);s.lastSync=Date.now();write(s);return true}catch(e){return false}}
  function reset(){s={activeSeconds:0,lastTick:Date.now(),lastActivity:Date.now(),claimedTiers:0,lastSync:0};write(s)}
  window.ZIVOZONE_ENGAGEMENT={activeSeconds:()=>Math.floor(s.activeSeconds),activeMinutes,claimableBonus,markBonusClaimed,sync,reset};
  setInterval(tick,5000);addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')activity();sync()});addEventListener('online',sync);addEventListener('zivozone-auth',()=>{s={activeSeconds:0,lastTick:Date.now(),lastActivity:Date.now(),claimedTiers:0,lastSync:0,...read()};sync()});setTimeout(sync,2500);
})();

/* ============================================================
   ZIVOZONE V85 — GLOBAL NEWS SEPARATION + SPEED
   Top rail = sports only. Bottom rail = general only.
============================================================ */
(function(){'use strict';
  const SPORTS=/(كرة القدم|دوري|بطولة|منتخب|رياضة|رياضي|مباراة|مباريات|الدوري|الكأس|كأس|فيفا|يويفا|أولمبياد|تنس|سلة|سباق|فورمولا|فورمولا1|ليفربول|ريال مدريد|برشلونة|مانشستر|تشيلسي|آرسنال|بايرن|الهلال|النصر|الوحدات|الفيصلي|الحسين|الرمثا|NBA|NFL|FIFA|UEFA|tennis|football|basketball|sport)/i;
  const text=n=>String(n?.textContent||'');
  function cleanRail(selector, sportsOnly){document.querySelectorAll(`${selector} .zivo-rail-sequence`).forEach(seq=>{seq.querySelectorAll('.zivo-news-item').forEach(item=>{const isS=SPORTS.test(text(item));if(sportsOnly?!isS:isS)item.remove()})});}
  function clean(){cleanRail('.zivo-sports-rail',true);cleanRail('.zivo-general-rail',false);}
  function speed(){document.querySelectorAll('.zivo-rail-track').forEach(track=>{const seq=track.querySelector('.zivo-rail-sequence');if(!seq)return;const w=Math.max(320,seq.scrollWidth),mobile=matchMedia('(max-width:700px)').matches;const isGeneral=track.id==='zivoGeneralTrack';const pps=isGeneral?(mobile?14:22):(mobile?62:96);const dur=Math.max(isGeneral?38:11,Math.min(isGeneral?150:75,w/pps));track.style.setProperty('--zivo-flow-duration',dur+'s')});}
  window.ZIVOZONE_INTERNAL.v85_news={clean,speed};
  addEventListener('zivozone:news-updated',()=>setTimeout(()=>{clean();speed()},50));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{clean();speed()},700));else setTimeout(()=>{clean();speed()},700);
  // V105.4: no periodic DOM-wide scan. Recalculate only after real news/resize events.
  addEventListener('resize',()=>{clearTimeout(window.__z85rs);window.__z85rs=setTimeout(speed,180)},{passive:true});
})();

/* ===== admin-monitor.js ===== */
/* ZIVOZONE V81 — FREE OWNER COMMAND CENTER
   Spark-safe: uses Firebase Auth + Firestore directly.
   No Cloud Functions / Blaze required.
*/
(function(){'use strict';
  const OWNER_UID='';
  const OWNER_EMAIL=window.ZIVOZONE_CONFIG.ADMIN_EMAIL;
  const OWNER_NAME='رائف البطوش';

  const auth=()=>window.firebase?.auth?.();
  const db=()=>window.firebase?.firestore?.();
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const tsMillis=v=>v?.toMillis?.()|| (typeof v==='string'?Date.parse(v)||0:Number(v)||0);
  const isOwner=()=>{const u=auth()?.currentUser;return !!u && String(u.email||'').trim().toLowerCase()===OWNER_EMAIL;};

  async function heartbeat(){
    try{await window.ZIVOZONE_AUTH?.touchSession?.()}catch(e){}
  }

  async function readCollection(name, limit=500){
    const d=db();
    if(!d) throw new Error('Firestore غير متاح');
    const snap=await d.collection(name).limit(limit).get();
    return snap.docs.map(x=>({id:x.id,...x.data()}));
  }

  async function getVisitorsToday(){
    const d=db();
    if(!d) return [];
    const day=new Date().toISOString().slice(0,10);
    try{
      const snap=await d.collection('siteStats').doc('visitors').collection(day).limit(1000).get();
      return snap.docs.map(x=>({id:x.id,...x.data()}));
    }catch(e){return [];}
  }

  async function safeCollection(name, limit=500){
    try{return await readCollection(name,limit)}catch(e){console.warn('Admin read',name,e);return []}
  }
  async function data(){
    if(!isOwner()) throw new Error('Admin access required');
    const [users,players,visitors]=await Promise.all([
      safeCollection('users'),safeCollection('players'),getVisitorsToday()
    ]);
    const now=Date.now();
    const start=new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Amman'})); start.setHours(0,0,0,0);
    const startMs=start.getTime();
    const byUid=new Map();
    users.filter(u=>String(u.email||'').trim().toLowerCase()!==OWNER_EMAIL).forEach(u=>byUid.set(u.id,{uid:u.id,...u}));
    players.forEach(p=>{const old=byUid.get(p.id)||{};byUid.set(p.id,{...old,uid:p.id,player:p})});
    const rows=[...byUid.values()].map(x=>{
      const p=x.player||{};
      const last=tsMillis(x.lastSeenAt||p.lastSeenAt||x.updatedAt||p.updatedAt);
      return {uid:x.uid,name:x.name||p.name||'ZIVO Player',email:x.email||p.email||'',role:x.role||p.role||'player',level:Number(p.level??x.level??1)||1,xp:Number(p.xp??x.xp??0)||0,zivo:Number(x.zivo??x.coins??p.zivo??p.coins??0)||0,gamesPlayed:Number(p.gamesPlayed??x.gamesPlayed??0)||0,wins:Number(p.wins??x.wins??0)||0,lastSeen:last,path:x.lastSeenPath||p.lastSeenPath||'',activeMinutes:Number(x.engagement?.activeMinutes??p.activeMinutes??0)||0};
    }).sort((a,b)=>b.lastSeen-a.lastSeen);
    const activeNow=rows.filter(r=>r.lastSeen&&now-r.lastSeen<=10*60*1000).length;
    const todayLogins=rows.filter(r=>r.lastSeen>=startMs).length;
    const todayGames=players.reduce((n,p)=>n+(Number(p.todayGames)||0),0);
    const totalGames=players.reduce((n,p)=>n+(Number(p.gamesPlayed)||0),0);
    return {stats:{totalUsers:users.filter(u=>String(u.email||'').trim().toLowerCase()!==OWNER_EMAIL).length,totalPlayers:players.length,todayVisitors:visitors.length,todayLogins,activeNow,todayGames,totalGames,firebase:db()?'CONNECTED':'OFFLINE',hosting:navigator.onLine?'ONLINE':'OFFLINE',domain:location.hostname,refreshedAt:Date.now()},players:rows.slice(0,300)};
  }

  function fmtTime(ms){return ms?new Date(ms).toLocaleString('ar-JO'):'—';}

  function render(x){
    let o=document.getElementById('zivo-v81-admin');
    if(!o){o=document.createElement('div');o.id='zivo-v81-admin';o.className='z81-overlay';document.body.appendChild(o);}
    const s=x.stats||{},p=x.players||[];
    o.innerHTML=`<div class="z81-card" dir="rtl">
      <button class="z81-x" aria-label="إغلاق">×</button>
      <div class="z81-head"><div class="z81-logo">Z</div><div><small>PRIVATE ADMIN CONSOLE</small><h2>غرفة إدارة ZIVOZONE</h2><span>المدير: رائف البطوش · ${esc(OWNER_EMAIL)}</span></div><div class="z81-live">● LIVE</div></div>
      <div class="z81-grid">${[['الحسابات',s.totalUsers],['اللاعبون',s.totalPlayers],['زوار اليوم',s.todayVisitors],['جلسات اليوم',s.todayLogins],['نشط الآن',s.activeNow],['ألعاب اليوم',s.todayGames],['إجمالي الألعاب',s.totalGames]].map(a=>`<div><b>${Number(a[1])||0}</b><span>${a[0]}</span></div>`).join('')}</div>
      <div class="z81-status"><span>🟢 Hosting: <b>${esc(s.hosting||'UNKNOWN')}</b></span><span>☁️ Firebase: <b>${esc(s.firebase||'UNKNOWN')}</b></span><span>🌐 ${esc(s.domain||'')}</span><span>🕒 ${fmtTime(s.refreshedAt)}</span></div>
      <div class="z81-toolbar"><h3>مراقبة المستخدمين والنشاط</h3><button id="z81-refresh">↻ تحديث البيانات</button></div>
      <div class="z81-table"><div class="z81-row z81-th"><b>الاسم</b><span>البريد</span><span>الدور</span><span>المستوى / XP</span><span>ZIVO</span><span>الألعاب</span><span>نشاط</span><span>آخر ظهور</span></div>${p.length?p.map(a=>`<div class="z81-row"><b>${esc(a.name)}</b><span>${esc(a.email)}</span><span>${esc(a.role)}</span><span>Lv ${a.level} · ${a.xp}</span><span>🪙 ${a.zivo.toFixed(2)}</span><span>${a.gamesPlayed}</span><span>${a.activeMinutes} د</span><span>${fmtTime(a.lastSeen)}</span></div>`).join(''):'<p class="z81-empty">لا توجد حسابات لاعب حتى الآن.</p>'}</div>
      <div class="z81-foot">الحساب الإداري لا يُنشأ له Player Profile ولا يدخل في التعدين أو إحصاءات اللاعبين. · ADMIN ONLY</div>
    </div>`;
    o.querySelector('.z81-x').onclick=()=>o.remove();
    o.querySelector('#z81-refresh').onclick=async()=>{const b=o.querySelector('#z81-refresh');b.disabled=true;b.textContent='جارٍ التحديث…';try{render(await data())}catch(e){alert('تعذر تحديث لوحة الإدارة.')}finally{b.disabled=false}};
  }

  async function open(){
    try{
      if(!auth()?.currentUser){alert('سجّل الدخول أولًا.');return;}
      if(!isOwner()){alert('هذا الحساب ليس حساب إدارة ZIVOZONE.');return;}
      render(await data());
    }catch(e){console.error(e);alert('تعذر تحميل بيانات الإدارة. تأكد من اتصال Firebase وقواعد Firestore.');}
  }

  function mount(){
    // V1056: the top header ADMIN button is the single admin entry point.
    // Never create floating/duplicate admin controls.
    document.getElementById('z81-admin-open')?.remove();
    document.getElementById('zivo-admin-identity')?.remove();
  }

  function syncAdminHeader(){
    const b=document.getElementById('login-btn');
    const u=auth()?.currentUser;
    const owner=isOwner();
    if(b){b.textContent=owner?'👑 ADMIN':'🔐 إنشاء حساب / دخول';b.title=owner?'غرفة إدارة ZIVOZONE':'الحساب';}
    if(owner){
      document.body.classList.add('zivo-admin-mode');
      mount();
    }else{
      document.body.classList.remove('zivo-admin-mode');
      mount();
    }
  }

  window.ZIVOZONE_MONITOR={open,heartbeat,adminData:data};
  window.addEventListener('load',()=>setTimeout(()=>{heartbeat();syncAdminHeader();if(location.hash==='#admin')open()},900));
  window.addEventListener('zivozone-auth',()=>setTimeout(()=>{heartbeat();syncAdminHeader();if(location.hash==='#admin')open()},500));
})();
/* ZIVOZONE V101 — UNIFIED MOBILE-FIRST ECONOMY CORE
   Single wallet + server-authoritative ZIVO + 24h daily mining + unified rewards.
*/
(() => {
  'use strict';
  const F=()=>window.firebase;
  const auth=()=>{try{return F()?.auth?.()||null}catch(_){return null}};
  const db=()=>{try{return F()?.firestore?.()||null}catch(_){return null}};
  const user=()=>auth()?.currentUser||null;
  const state={uid:null,zivo:0,ledger:[],nextMiningAt:0,loading:false};
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const num=v=>Math.max(0,Number(v)||0);
  const toast=(msg)=>{let x=document.getElementById('zivo-v101-toast');if(!x){x=document.createElement('div');x.id='zivo-v101-toast';x.className='z101-toast';document.body.appendChild(x)}x.textContent=msg;x.classList.add('show');clearTimeout(x._t);x._t=setTimeout(()=>x.classList.remove('show'),2600)};

  function injectStyle(){
    if(document.getElementById('zivo-v101-style'))return;
    const s=document.createElement('style');s.id='zivo-v101-style';s.textContent=`
      :root{--z-gold:#ffd43d;--z-gold2:#ffe889;--z-bg:#090d14;--z-panel:#101722}
      .z101-economy{width:min(1180px,calc(100% - 28px));margin:8px auto 2px;display:grid;grid-template-columns:1fr 1fr;gap:8px;position:relative;z-index:3}
      .z101-card{border:1px solid rgba(255,215,70,.16);border-radius:14px;background:linear-gradient(145deg,rgba(255,215,70,.07),rgba(255,255,255,.02));box-shadow:0 8px 24px rgba(0,0,0,.16);padding:9px 11px}
      .z101-wallet{display:flex;align-items:center;gap:9px;min-height:58px}.z101-coin{width:38px;height:38px;flex:0 0 38px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 30% 25%,#fff7bd,#ffd43d 44%,#9c6700);border:2px solid #ffe889;color:#5b3900;font-weight:1000;font-size:18px;box-shadow:inset 0 2px 5px rgba(255,255,255,.55)}
      .z101-label{font-size:10px;opacity:.62;font-weight:900}.z101-balance{font-size:18px;font-weight:1000;color:#ffe06a;line-height:1.1;margin-top:4px}.z101-sub{font-size:10px;opacity:.62;margin-top:5px}.z101-wallet-actions{margin-inline-start:auto}.z101-btn{border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:#fff;border-radius:11px;padding:9px 12px;font-weight:950;cursor:pointer}.z101-btn.primary{background:linear-gradient(90deg,#ffd43d,#ffed8a);color:#17120a;border-color:#ffd43d}.z101-btn:disabled{opacity:.5;cursor:not-allowed}
      .z101-mining{display:flex;align-items:center;gap:8px;min-height:58px}.z101-mining-icon{font-size:21px}.z101-mining h3{margin:0;font-size:12px}.z101-mining p{margin:2px 0 0;font-size:8px;opacity:.65}.z101-mine-action{margin-inline-start:auto;min-width:132px}.z101-countdown{font-size:13px;font-weight:1000;color:#ffe06a;margin-top:5px;letter-spacing:.5px}.z101-ready{color:#7df0a4}.z101-ledger{margin-top:12px;border-top:1px solid rgba(255,255,255,.07);padding-top:8px}.z101-ledger-title{font-size:10px;opacity:.6;font-weight:900}.z101-ledger-list{max-height:110px;overflow:auto}.z101-ledger-row{display:grid;grid-template-columns:1fr auto;gap:8px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:10px}.z101-ledger-row b{color:#ffe06a}.z101-ledger-row small{grid-column:1/-1;opacity:.45}.z101-note{font-size:9px;opacity:.55;margin-top:9px;line-height:1.5}
      .z101-overlay{position:fixed;inset:0;z-index:120000;display:none;place-items:center;padding:16px;background:rgba(0,0,0,.72);backdrop-filter:blur(12px)}.z101-overlay.open{display:grid}.z101-modal{width:min(720px,calc(100vw - 28px));max-height:88vh;overflow:auto;background:#0d141f;color:#fff;border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:18px}.z101-modal-head{display:flex;justify-content:space-between;align-items:center;gap:10px}.z101-modal-close{width:38px;height:38px;border:0;border-radius:10px;background:rgba(255,255,255,.08);color:#fff;font-size:22px;cursor:pointer}.z101-modal h2{margin:0}.z101-modal p{font-size:11px;opacity:.68}.z101-modal-balance{font-size:34px;color:#ffe06a;font-weight:1000;margin:16px 0}.z101-toast{position:fixed;left:16px;bottom:84px;z-index:130000;background:#111827;color:#fff;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:10px 13px;font-weight:900;opacity:0;transform:translateY(10px);transition:.2s;pointer-events:none}.z101-toast.show{opacity:1;transform:none}
      /* remove old floating economy / quick docks so there is exactly one wallet */
      #zivo-global-wallet,#zivo-v85-open,#zivo-v85-economy,#zivo-v81-open,#zivo-v81-economy,#zivo-v80-open,#z80-admin-open,#zivo-v87-quickdock,#v26-open,#zivo-v24-balance,#z25-wallet-btn{display:none!important} #z81-admin-open{display:flex!important}
      @media(max-width:760px){.z101-economy{grid-template-columns:1fr 1fr;width:calc(100% - 14px);margin-top:5px;gap:6px}.z101-card{padding:8px;border-radius:13px}.z101-wallet{min-height:52px}.z101-coin{width:34px;height:34px;flex-basis:34px;font-size:16px}.z101-balance{font-size:16px}.z101-label{font-size:8px}.z101-sub{font-size:7px}.z101-wallet-actions{display:none}.z101-mining{align-items:center;min-height:52px}.z101-mining-icon{font-size:18px}.z101-mining p{display:none}.z101-mine-action{min-width:82px}.z101-btn{padding:7px 7px;font-size:9px}.z101-countdown{font-size:11px}.z101-mining h3{font-size:10px}}
    `;document.head.appendChild(s);
  }

  function mountHub(){
    injectStyle();
    if(document.getElementById('zivo-v101-economy'))return;
    const h=document.querySelector('header.topbar');if(!h)return;
    const root=document.createElement('section');root.id='zivo-v101-economy';root.className='z101-economy';root.setAttribute('aria-label','ZIVO Economy');
    root.innerHTML=`
      <article class="z101-card z101-wallet">
        <div class="z101-coin">Z</div><div><div class="z101-label">ZIVO WALLET</div><div id="z101-balance" class="z101-balance">0 ZIVO</div><div id="z101-wallet-status" class="z101-sub">سجّل الدخول لحفظ رصيدك ومكافآتك.</div></div>
        <div class="z101-wallet-actions"><button id="z101-wallet-open" class="z101-btn">المحفظة</button></div>
      </article>
      <article class="z101-card z101-mining">
        <div class="z101-mining-icon">⛏️</div><div><h3>التعدين اليومي</h3><p>فعّل التعدين مرة كل 24 ساعة واحصل على مكافأة ZIVO صغيرة.</p><div id="z101-countdown" class="z101-countdown">—</div></div>
        <div class="z101-mine-action"><button id="z101-mine" class="z101-btn primary">بدء التعدين +0.50</button></div>
      </article>`;
    h.insertAdjacentElement('afterend',root);
    root.querySelector('#z101-wallet-open').onclick=openWallet;
    root.querySelector('#z101-mine').onclick=mine;
  }

  async function ensureWalletForUser(u){
    const d=db(); if(!u||!d)return;
    const ref=d.collection('users').doc(u.uid).collection('zivozone').doc('wallet');
    const snap=await ref.get();
    if(!snap.exists) await ref.set({zivo:0,createdAt:F().firestore.FieldValue.serverTimestamp(),updatedAt:F().firestore.FieldValue.serverTimestamp(),mode:'spark-client-rules'},{merge:false});
  }

  async function refresh(){
    const u=user(),d=db(); state.uid=u?.uid||null; if(u?.email?.toLowerCase()===window.ZIVOZONE_CONFIG.ADMIN_EMAIL){state.zivo=0;state.ledger=[];state.nextMiningAt=0;syncUI();return state;}
    if(!u||!d){state.zivo=0;state.ledger=[];state.nextMiningAt=0;syncUI();return state;}
    try{
      const w=await d.collection('users').doc(u.uid).collection('zivozone').doc('wallet').get();
      state.zivo=num(w.data()?.zivo);
      const l=await d.collection('users').doc(u.uid).collection('zivozone').doc('wallet').collection('ledger').orderBy('createdAt','desc').limit(25).get().catch(()=>null);
      state.ledger=l?l.docs.map(x=>({id:x.id,...x.data()})):[];
      const m=await d.collection('users').doc(u.uid).collection('zivozone').doc('mining').get().catch(()=>null);
      const ts=m?.data()?.nextMiningAt;state.nextMiningAt=ts?.toMillis?ts.toMillis():num(ts);
    }catch(e){console.warn('ZIVO V101 refresh',e)}
    syncUI();return state;
  }

  function syncUI(){
    const bal=`${Number(state.zivo).toFixed(state.zivo%1?2:0)} ZIVO`;
    document.querySelectorAll('#z101-balance,[data-v101-balance]').forEach(x=>x.textContent=bal);
    const p=document.getElementById('profile-coins');if(p)p.textContent=String(state.zivo);
    const status=document.getElementById('z101-wallet-status');if(status)status.textContent=user()?`الحساب: ${user().email||'مستخدم ZIVOZONE'}`:'سجّل الدخول لحفظ رصيدك ومكافآتك.';
    updateMiningUI();
  }
  function updateMiningUI(){
    const b=document.getElementById('z101-mine'),c=document.getElementById('z101-countdown');if(!b||!c)return;
    if(!user()){b.textContent='تسجيل الدخول للتعدين';b.disabled=false;c.textContent='الحساب مطلوب';return;} if(user().email?.toLowerCase()===window.ZIVOZONE_CONFIG.ADMIN_EMAIL){b.textContent='حساب الإدارة';b.disabled=true;c.textContent='ADMIN';return;}
    const left=Math.max(0,(state.nextMiningAt||0)-Date.now());
    if(left<=0){b.textContent='بدء التعدين +0.50';b.disabled=false;c.textContent='متاح الآن';c.classList.add('z101-ready')}
    else{b.textContent='التعدين مفعّل';b.disabled=true;c.classList.remove('z101-ready');c.textContent=formatMs(left)}
  }
  function formatMs(ms){const s=Math.floor(ms/1000),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`}

  async function mine(){
    const u=user(),d=db();
    if(!u){document.querySelector('#login-btn,[data-action="login"]')?.click();return}
    if(u.email?.toLowerCase()===window.ZIVOZONE_CONFIG.ADMIN_EMAIL){toast('حساب الإدارة لا يدخل في نظام التعدين.');return}
    const b=document.getElementById('z101-mine');if(b)b.disabled=true;
    try{
      const wallet=d.collection('users').doc(u.uid).collection('zivozone').doc('wallet');
      const mining=d.collection('users').doc(u.uid).collection('zivozone').doc('mining');
      const ledger=wallet.collection('ledger').doc('mining_'+new Date().toISOString().slice(0,10));
      await d.runTransaction(async tx=>{
        const [ws,ms,ls]=await Promise.all([tx.get(wallet),tx.get(mining),tx.get(ledger)]);
        const now=Date.now(), previous=ms.exists?(ms.data()?.nextMiningAt):null, prevMs=previous?.toMillis?.()||Number(previous)||0;
        if(prevMs>now)throw new Error('التعدين غير متاح بعد.');
        if(ls.exists)throw new Error('تم احتساب تعدين اليوم بالفعل.');
        const current=num(ws.data()?.zivo);
        const fv=F().firestore.FieldValue;
        tx.set(wallet,{zivo:current+0.5,updatedAt:fv.serverTimestamp(),mode:'spark-client-rules'},{merge:true});
        tx.set(mining,{lastMiningAt:fv.serverTimestamp(),nextMiningAt:new Date(now+86400000),amount:0.5,version:'spark-v1057'},{merge:true});
        tx.set(ledger,{type:'daily_mining',label:'التعدين اليومي',amount:0.5,eventId:ledger.id,createdAt:fv.serverTimestamp(),source:'client-rules'});
      });
      await refresh();
      toast('تم التعدين بنجاح! +0.50 ZIVO ⛏️');
    }catch(e){console.warn('ZIVO mining:',e);toast(e?.message||'تعذر تفعيل التعدين الآن.');await refresh()}
  }

  async function reward(amount,type,label,meta={}){ return false; }

  async function rewardChallenge(d={}){
    const u=user(),fire=db(); if(!u||!fire)return false;
    const total=Math.max(1,Math.min(100,Number(d.total??d.questions??10)||10));
    const correct=Math.max(0,Math.min(total,Number(d.correct??d.score??0)||0));
    const timed=Number(d.timedOut)||0;
    if(total!==10||correct!==10||timed!==0)return false;
    if(u.email?.toLowerCase()===window.ZIVOZONE_CONFIG.ADMIN_EMAIL)return false;
    const challenge=String(d.challenge||d.gameId||d.challengeId||'challenge').slice(0,80);
    const attemptId=String(d.attemptId||d.eventId||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,100);
    if(!attemptId)return false;
    try{
      const root=fire.collection('users').doc(u.uid).collection('zivozone');
      const wallet=root.doc('wallet'), claim=root.doc('rewardClaim');
      const ledger=wallet.collection('ledger').doc(('challenge_perfect_'+attemptId).slice(0,100));
      const result=fire.collection('players').doc(u.uid).collection('results').doc(attemptId.slice(0,100));
      await fire.runTransaction(async tx=>{
        const [ws,ls,cs]=await Promise.all([tx.get(wallet),tx.get(ledger),tx.get(claim)]);
        if(ls.exists)throw new Error('تم احتساب هذه المحاولة مسبقًا.');
        const current=num(ws.data()?.zivo);
        const fv=F().firestore.FieldValue;
        tx.set(claim,{claimId:attemptId,challenge,total,correct,timedOut:0,amount:10,consumedAt:fv.serverTimestamp(),createdAt:fv.serverTimestamp(),status:'consumed',policy:'10_of_10_only'},{merge:true});
        tx.set(wallet,{zivo:current+10,updatedAt:fv.serverTimestamp(),mode:'spark-client-rules'},{merge:true});
        tx.set(ledger,{type:'challenge_reward',label:`مكافأة تحدي كامل — ${challenge}`,amount:10,eventId:ledger.id,attemptId,challenge,total,correct,timedOut:0,scorePercent:100,createdAt:fv.serverTimestamp(),source:'client-rules',policy:'10_of_10_only'});
      });
      await refresh();
      toast('علامة كاملة 10/10 — تمت إضافة +10 ZIVO إلى المحفظة 🪙');
      return true;
    }catch(e){
      console.warn('ZIVO challenge reward',e);
      if(String(e?.message||'').includes('مسبقًا')){await refresh();return true}
      return false;
    }
  }

  async function openWallet(){
    if(!user()){document.querySelector('#login-btn,[data-action="login"]')?.click();return}
    await refresh();
    let o=document.getElementById('z101-wallet-modal');
    if(!o){
      o=document.createElement('div');o.id='z101-wallet-modal';o.className='z101-overlay';
      o.innerHTML=`<div class="z101-modal" dir="rtl"><div class="z101-modal-head"><div><div class="z101-label">ZIVOZONE ECONOMY</div><h2>محفظة ZIVO</h2></div><button class="z101-modal-close">×</button></div><div id="z101-modal-balance" class="z101-modal-balance">0 ZIVO</div><p>رصيد ZIVO داخل المنصة. كل إضافة تمر عبر خادم ZIVOZONE وتظهر في سجل المعاملات.</p><div class="z101-ledger"><div class="z101-ledger-title">آخر المعاملات</div><div id="z101-modal-ledger" class="z101-ledger-list"></div></div><div class="z101-note">XP منفصل عن ZIVO. وZIVO منفصل عن Tickets. هذه العملة حاليًا عملة افتراضية داخل المنصة وليست أموالًا نقدية.</div></div>`;
      document.body.appendChild(o);o.querySelector('.z101-modal-close').onclick=()=>o.classList.remove('open');o.onclick=e=>{if(e.target===o)o.classList.remove('open')};
    }
    o.classList.add('open');
    o.querySelector('#z101-modal-balance').textContent=`${Number(state.zivo).toFixed(state.zivo%1?2:0)} ZIVO`;
    const list=o.querySelector('#z101-modal-ledger');
    list.innerHTML=state.ledger.length?state.ledger.map(x=>`<div class="z101-ledger-row"><span>${esc(x.label||x.type||'معاملة')}</span><b>${Number(x.amount)>0?'+':''}${Number(x.amount)||0}</b><small>${x.createdAt?.toDate?x.createdAt.toDate().toLocaleString('ar-JO'):'—'}</small></div>`).join(''):'<p>لا توجد معاملات بعد.</p>';
  }

  function bind(){
    // Economy remains available through Player Hub; do not inject a permanent home-page economy bar.
    document.querySelectorAll('#mobile-more,[data-mobile-more]').forEach(x=>x.remove());
    const sheet=document.getElementById('mobile-tools');if(sheet)sheet.remove();
    const legacy=['zivo-v85-open','zivo-v85-economy','zivo-v81-open','zivo-v81-economy','zivo-v80-open','zivo-v87-quickdock','z80-admin-open'];legacy.forEach(id=>document.getElementById(id)?.remove());
    auth()?.onAuthStateChanged?.(()=>setTimeout(refresh,100));
    refresh();setInterval(()=>{if(document.visibilityState==='visible')refresh()},30000);setInterval(updateMiningUI,1000);
  }

  const processed=new Set();
  function onChallenge(e){
    const d=e?.detail||{}; const total=Number(d.total??d.questions)||0; const correct=Number(d.correct??d.score)||0;
    if(!user()||total!==10||correct!==10||Number(d.timedOut||0)!==0||d.perfect!==true)return;
    const eventId=String(d.eventId||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,100); if(!eventId||processed.has(eventId))return;
    processed.add(eventId); rewardChallenge({...d,total:10,correct:10,timedOut:0,attemptId:eventId,eventId});
  }
  ['zivozone-result','zivozone-progress','zivozone:game-complete','zivozone:challenge-result','zivozone:progress-updated'].forEach(n=>addEventListener(n,onChallenge,true));

  window.ZIVOZONE_ECONOMY={open:openWallet,refresh,rewardPerfect:rewardChallenge,credit:reward,getWallet:()=>({...state}),mine};
  window.ZIVOZONE_ZIVO={wallet:state,refresh,reward,mine,rewardChallenge};
  window.addEventListener('zivozone-auth',()=>setTimeout(refresh,150));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(bind,50));else setTimeout(bind,50);
})();


/* ============================================================
   ZIVOZONE TRUE CORE — V1085
   One public application surface. Versioned implementation
   modules are private implementation details under INTERNAL.
============================================================ */
(function(){
  'use strict';
  const I=window.ZIVOZONE_INTERNAL||{};
  const v=(n)=>I['v'+n]||{};
  const Core={
    version:'V1085',
    auth:()=>window.ZIVOZONE_AUTH||null,
    player:{
      get:()=>v(30).get?.()||v(26).profile?.()||{},
      stats:()=>v(30).stats?.()||{},
      open:()=>v(37).open?.()
    },
    challenges:{
      list:()=>v(20).findBanks?.()||[],
      start:(id)=>v(20).start?.(id),
      clearHistory:()=>v(20).clearHistory?.()
    },
    economy:{
      get:()=>v(25).get?.()||v(26).profile?.()||{},
      wallet:()=>v(26).open?.('wallet'),
      add:(n,r)=>v(25).add?.(n,r),
      spend:(n,r)=>v(25).spend?.(n,r)
    },
    progress:{
      get:()=>v(35).state?.()||v(30).get?.()||{},
      add:(...a)=>v(35).add?.(...a)
    },
    sync:{
      flush:()=>v(36).flush?.(),
      pending:()=>v(36).pending?.()||0
    },
    tools:{
      identity:()=>v(32).open?.(),
      ai:()=>window.ZIVOZONE_AI?.open?.()
    },
    admin:{
      audit:()=>v(44).audit?.()
    }
  };
  window.ZIVOZONE_CORE=Core;
})();
