/* ZIVOZONE V1059 — CHALLENGE CINEMA / IDENTITY / FORENSIC / MOBILE POLISH
   Additive patch. Keeps existing Firebase/auth/economy contracts intact.
*/
(() => {
  'use strict';
  const C=()=>window.ZIVOZONE_CHALLENGES||{};
  const I=()=>window.ZIVOZONE_I18N||{};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const loc=o=>typeof o==='string'?o:(o?.[document.documentElement.lang]||o?.ar||o?.en||'');
  const O=(ar,en)=>({ar,en,zh:en,hi:en,es:en});

  // Every forensic question gets a visual evidence frame. No external network required.
  function enrichForensic(){
    const b=C().forensic;if(!b?.questions)return;
    const imgs=['assets/forensic/scene-door.svg','assets/forensic/scene-desk.svg','assets/forensic/scene-camera.svg','assets/forensic/scene-desk.svg','assets/forensic/scene-door.svg','assets/forensic/scene-camera.svg','assets/forensic/scene-desk.svg','assets/forensic/scene-camera.svg','assets/forensic/scene-door.svg','assets/forensic/scene-desk.svg'];
    b.questions.forEach((q,i)=>{if(!q.image)q.image=imgs[i%imgs.length]});
  }

  // Premium challenge gallery: the image/card is the entire launch target.
  function renderChallengeGallery(){
    const box=document.getElementById('challenge-list'); if(!box)return;
    enrichForensic();
    const all=Object.values(C()).filter(x=>x&&x.id&&!x.special&&Array.isArray(x.questions));
    const special=C().horror;
    const iconMap={
      iq:'🧠',science:'🔬',daily:'⚡',football:'⚽',logic:'♟️',memory:'🧩',strategy:'♜',math:'➗',reaction:'⚡',
      forensic:'🕵️',football_intelligence:'⚽',logic_extreme:'🧠',memory_focus:'🧩'
    };
    const imageMap={forensic:'assets/forensic/scene-camera.svg'};
    const cards=all.map(x=>{
      const icon=iconMap[x.id]||x.icon||'🎯';
      const visual=imageMap[x.id]?`<img class="z1059-challenge-image" src="${imageMap[x.id]}" alt="${esc(loc(x.title))}" loading="lazy">`:`<div class="z1059-challenge-glyph" aria-hidden="true">${esc(icon)}</div>`;
      return `<article class="challenge-card z1059-card z58-theme-${String(x.id).replace(/[^a-z0-9_-]/gi,'')}" data-challenge="${esc(x.id)}" role="button" tabindex="0" aria-label="${esc(loc(x.title))} — اضغط للبدء">
        ${visual}<div class="z1059-card-shade"></div><div class="z1059-card-content"><span class="z1059-kicker">ZIVO CHALLENGE · ${Math.min(10,x.questions.length)} أسئلة</span><h3>${esc(loc(x.title))}</h3><p>${esc(loc(x.desc||''))}</p></div>
      </article>`;
    }).join('');
    const horror=special?`<article class="challenge-card z1059-card z58-theme-horror z1059-horror-card" data-challenge="horror" role="button" tabindex="0" aria-label="${esc(loc(special.title))} — اضغط للدخول">
      <div class="z1059-horror-glow"></div><div class="z1059-horror-symbol">◉</div><div class="z1059-card-shade"></div><div class="z1059-card-content"><span class="z1059-kicker">DARK ROOM · PSYCHOLOGICAL HORROR</span><h3>${esc(loc(special.title))}</h3><p>${esc(loc(special.desc||''))}</p></div>
    </article>`:'';
    box.innerHTML=cards+horror;
    box.querySelectorAll('.z1059-card').forEach(card=>{
      const go=()=>{const id=card.dataset.challenge;if(window.ZIVOZONE_V20?.start)window.ZIVOZONE_V20.start(id);else document.querySelector(`[data-challenge="${CSS.escape(id)}"]`)?.click()};
      card.addEventListener('click',e=>{if(e.target.closest('a,input,select,textarea'))return;go()});
      card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}});
    });
  }

  // 20-question public personality profiler with four outcome paths.
  function openIdentityPro(){
    const open=window.openModal;if(typeof open!=='function')return;
    const questions=[
      ['عندما تواجه مشكلة جديدة، ما أول رد فعل لديك؟',['أحلل التفاصيل','أتحرك بسرعة','أستشير من حولي','أجرب طريقة غير معتادة']],
      ['في المنافسة، ما الذي يهمك أكثر؟',['إتقان القرار','حسم اللحظة','نجاح الفريق','المفاجأة']],
      ['إذا فشلت محاولة مهمة؟',['أبحث عن السبب','أعيد المحاولة فورًا','أطلب رأيًا','أغير الخطة بالكامل']],
      ['عندما تدخل مكانًا جديدًا؟',['أراقب التفاصيل','أستكشف مباشرة','أبحث عن شخص أتحدث معه','أبحث عما هو غير مألوف']],
      ['أي نوع من الألعاب يجذبك؟',['الألغاز','التحدي السريع','التعاون','الغموض']],
      ['وقت الضغط، أنت غالبًا؟',['أهدأ وأفكر','أواجه','أحافظ على المجموعة','أبتكر مخرجًا']],
      ['عندما تتغير الخطة فجأة؟',['أعيد الحساب','أقرر بسرعة','أناقش البدائل','أستمتع بالتغيير']],
      ['ما الذي يزعجك أكثر؟',['قرار بلا دليل','التردد','تفكك الفريق','الروتين']],
      ['إذا أعطيت مهمة صعبة؟',['أقسمها لمراحل','أبدأ فورًا','أوزع الأدوار','أجرب أسلوبًا جديدًا']],
      ['في النقاش، تميل إلى؟',['الأدلة','القرار','التوافق','زاوية مختلفة']],
      ['ما الذي تعتبره قوة؟',['التركيز','الشجاعة','التواصل','الخيال']],
      ['لو كان لديك ساعة فارغة؟',['حل لغز','تحدي نفسك','قضاء الوقت مع الآخرين','اكتشاف شيء جديد']],
      ['كيف تتعلم أسرع؟',['فهم القاعدة','التطبيق المباشر','التعلم مع شخص','التجربة والخطأ']],
      ['إذا وجدت معلومة غريبة؟',['أتحقق منها','أستخدمها فورًا','أشاركها مع شخص أثق به','أبحث وراءها']],
      ['ما الدور الذي ترتاح له؟',['المحلل','القائد','المنسق','المستكشف']],
      ['عندما يختلف شخص معك؟',['أناقش منطقه','أوضح موقفي','أبحث عن نقطة اتفاق','أعيد صياغة المشكلة']],
      ['ما الذي يدفعك للاستمرار؟',['الوصول للحقيقة','الفوز','الناس الذين معك','اكتشاف المجهول']],
      ['أي كلمة أقرب لك؟',['دقيق','حاسم','متعاون','فضولي']],
      ['لو فتحت أمامك فرصة غير مؤكدة؟',['أقيّم المخاطر','أدخل وأتعلم','أسأل من معي','أجربها بحذر']],
      ['ما النتيجة التي ترضيك أكثر؟',['فهم عميق','إنجاز واضح','فريق ناجح','اكتشاف جديد']]
    ];
    const profiles=[
      {key:'analyst',name:'العقل المحلل',icon:'🧠',color:'blue',desc:'أنت تميل إلى الفهم قبل الحكم، وتلتقط العلاقات والتفاصيل التي قد تمر على الآخرين. قوتك الأساسية ليست السرعة وحدها بل جودة القرار. عندما تواجه شيئًا غامضًا، تحاول بناء صورة كاملة قبل أن تتحرك. لديك قابلية قوية للتعلم من الأخطاء وتحويل التجربة إلى قاعدة جديدة. قد تحتاج أحيانًا إلى منح نفسك مساحة للحسم بدل تحليل كل احتمال. أفضل ما يناسبك داخل ZIVOZONE هو التحديات التي تكافئ الاستنتاج والتركيز وربط الأدلة. ابدأ بغرفة المنطق، ثم جرّب المختبر الجنائي لتختبر قدرتك على بناء الرواية الأقوى من مجموعة أدلة متفرقة. أنت أيضًا جيد في اكتشاف التناقضات، وتستفيد من التحديات التي تمنحك وقتًا كافيًا للتفكير.'},
      {key:'leader',name:'القائد الحاسم',icon:'👑',color:'gold',desc:'أنت شخص يميل إلى المبادرة وتحويل الضغط إلى حركة. عندما تتعقد الظروف، تبحث عن القرار القابل للتنفيذ بدل البقاء طويلًا في مرحلة التفكير. لديك استعداد للمنافسة وتحمل المسؤولية، وغالبًا ما تتحسن عندما يكون أمامك هدف واضح ووقت محدود. قوتك الكبيرة هي الحسم، لكن أفضل نسخة منك تظهر عندما توازن بين الجرأة وإدارة المخاطر. داخل ZIVOZONE ستجد متعتك في التحديات التي تتطلب قرارًا وتوقيتًا واستراتيجية. جرّب غرفة الاستراتيجية ثم ذكاء كرة القدم لتختبر قدرتك على اتخاذ القرار الصحيح عندما تتغير الصورة خلال ثوانٍ. لديك طاقة قيادة واضحة، ومع التدريب تستطيع تحويل السرعة إلى قرارات أكثر دقة وثباتًا دائمًا دون فقدان التركيز.'},
      {key:'connector',name:'صانع الفريق',icon:'🤝',color:'green',desc:'أنت ترى النجاح كعملية مشتركة، وتلتقط تأثير الناس والاتصال والتعاون. لديك قدرة على الاستماع وربط وجهات النظر وتحويل المجموعة من أفراد إلى فريق يعمل في اتجاه واحد. تكون جيدًا في قراءة الموقف وتقديم الدعم. انتبه فقط إلى ألا يجعل رأي الآخرين قرارك يتأخر عندما تحتاج إلى الحسم. التحديات التي تناسبك في ZIVOZONE تتطلب فهم السياق واتخاذ قرار متزن. ابدأ بذكاء كرة القدم لفهم العمل الجماعي، ثم جرّب تحدي الذاكرة لتقوية الانتباه وسط المعلومات المتغيرة. التحديات الجماعية تناسبك لأنها تمنحك فرصة لتحويل التواصل إلى إنجاز وبناء روح منافسة إيجابية. قوتك تظهر عندما تجمع بين الاستماع والتنظيم والحسم، دون أن تفقد مرونتك.'},
      {key:'explorer',name:'المستكشف الجريء',icon:'⚡',color:'purple',desc:'أنت تنجذب إلى الجديد والمجهول، ولا تحب أن تبقى داخل طريقة واحدة عندما توجد إمكانية لتجربة شيء مختلف. فضولك يدفعك إلى الاستكشاف، وتستفيد كثيرًا من المواقف التي تمنحك حرية الاختيار. قوتك هي المرونة والخيال والاستعداد للتعلم من التجربة. التحدي بالنسبة لك هو ضبط الاندفاع عندما تكون المعلومات ناقصة، وتحويل الفضول إلى مغامرة محسوبة. داخل ZIVOZONE، ابدأ بتحديات الغموض والضغط ثم انتقل إلى الغرفة المظلمة إذا كنت مستعدًا لتجربة نفسية سينمائية. وبعدها جرّب تحدي ZIVO اليومي حتى تحافظ على التنوع والاستمرارية. أنت تزدهر عندما يتغير السيناريو، ولذلك ستستفيد أيضًا من المختبر الجنائي الذي يجمع الملاحظة والاحتمالات واكتشاف التفاصيل بطريقة ممتعة وآمنة.'},
    ];
    let i=0,s=[0,0,0,0],deadline=0,timer=null;
    const finish=()=>{
      if(timer)clearInterval(timer);
      const max=Math.max(...s),idx=s.indexOf(max),p=profiles[idx];
      const second=[...s].sort((a,b)=>b-a)[1]||0;
      const confidence=Math.round(60+((max-second)/Math.max(1,20))*40);
      const rec=idx===0?'غرفة المنطق → المختبر الجنائي':idx===1?'غرفة الاستراتيجية → ذكاء كرة القدم':idx===2?'ذكاء كرة القدم → تحدي الذاكرة':'الغرفة المظلمة → تحدي ZIVO اليومي';
      open(`<div class="z1059-identity-result"><span class="eyebrow">ZIVO IDENTITY · ${confidence}%</span><div class="z1059-result-icon ${p.color}">${p.icon}</div><h2>${p.name}</h2><p class="z1059-result-copy">${p.desc}</p><div class="z1059-recommend"><small>التحدي الموصى به</small><strong>${rec}</strong><span>النتيجة ترفيهية مبنية على اختياراتك وليست تشخيصًا نفسيًا.</span></div><div class="modal-actions"><button class="btn btn-primary" id="z1059-rec">ابدأ التحدي الموصى به</button><button class="btn btn-ghost" id="z1059-id-close">إغلاق</button></div></div>`,'identity-result-modal');
      document.getElementById('z1059-id-close')?.addEventListener('click',()=>window.closeModal?.());
      document.getElementById('z1059-rec')?.addEventListener('click',()=>{window.closeModal?.();const id=idx===0?'logic':idx===1?'strategy':idx===2?'football':'horror';window.ZIVOZONE_V20?.start?.(id)});
    };
    const step=()=>{
      if(i>=questions.length){finish();return}
      const q=questions[i],pct=Math.round(i/questions.length*100);
      open(`<div class="z1059-identity"><div class="z1059-id-head"><span class="eyebrow">من أنا؟ · ${i+1}/20</span><strong>${pct}%</strong></div><div class="z1059-id-progress"><span style="width:${pct}%"></span></div><h2>${esc(q[0])}</h2><div class="z1059-id-options">${q[1].map((x,n)=>`<button class="id-choice z1059-id-choice" data-n="${n}">${esc(x)}</button>`).join('')}</div></div>`,'identity-test-modal');
      deadline=Date.now()+30000;
      timer=setInterval(()=>{const n=Math.max(0,Math.ceil((deadline-Date.now())/1000));if(n<=0){clearInterval(timer);i++;step()}},250);
      document.querySelectorAll('.z1059-id-choice').forEach(b=>b.onclick=()=>{clearInterval(timer);s[Number(b.dataset.n)]++;i++;step()});
    };
    step();
  }

  // Horror sound layer: local laugh/scream files + extra low-frequency WebAudio.
  function enhanceHorrorAudio(){
    const A=window.ZIVOZONE_AUDIO;if(!A||A.__v1059)return;
    const original=A.startChallenge; if(typeof original!=='function')return;
    const state={media:[],timers:[]};
    const stop= A.stopChallenge;
    const playFx=src=>{try{const a=new Audio(src);a.preload='auto';a.volume=.16;const p=a.play();if(p?.catch)p.catch(()=>{});state.media.push(a);a.addEventListener('ended',()=>{a.remove();state.media=state.media.filter(x=>x!==a)},{once:true})}catch(e){}};
    A.startChallenge=function(mode){original(mode);if(mode!=='horror')return;clear();
      const schedule=()=>{const delay=7000+Math.random()*10000;const id=setTimeout(()=>{if(!A.active?.())return;Math.random()<.55?playFx('assets/audio/horror_laugh.mp3'):playFx('assets/audio/horror_scream.mp3');schedule()},delay);state.timers.push(id)};schedule();
    };
    function clear(){state.timers.forEach(clearTimeout);state.timers=[];state.media.forEach(a=>{try{a.pause();a.currentTime=0}catch(e){}});state.media=[]}
    A.stopChallenge=function(){clear();return stop?.()};A.__v1059=true;
  }

  // Premium small royal economy presentation.
  function polishEconomy(){
    const style=document.createElement('style');style.textContent=`
      .z101-economy{gap:8px!important;align-items:stretch!important}
      .z101-card{min-height:48px!important;padding:7px 9px!important;border-radius:13px!important;border-color:rgba(255,214,86,.24)!important;background:linear-gradient(145deg,rgba(31,24,8,.88),rgba(8,13,22,.96))!important;box-shadow:0 8px 24px rgba(255,193,40,.07),inset 0 0 18px rgba(255,216,90,.035)!important}
      .z101-coin{width:30px!important;height:30px!important;flex-basis:30px!important;font-size:14px!important;box-shadow:0 0 18px rgba(255,208,55,.24),inset 0 2px 5px rgba(255,255,255,.55)!important}
      .z101-balance{font-size:15px!important;color:#ffe27a!important;letter-spacing:.02em!important}.z101-label{font-size:8px!important;color:#e8d58c!important}.z101-sub{font-size:8px!important}
      .z101-mining{min-height:48px!important}.z101-mining-icon{font-size:18px!important}.z101-mine-action{min-width:76px!important}.z101-btn.primary{background:linear-gradient(135deg,#9d7410,#ffe47b 45%,#a87710)!important;box-shadow:0 5px 18px rgba(255,211,76,.12)!important}
      @media(max-width:620px){.z101-economy{grid-template-columns:1fr 1fr!important;gap:5px!important}.z101-card{padding:6px 7px!important}.z101-coin{width:27px!important;height:27px!important;flex-basis:27px!important}.z101-balance{font-size:13px!important}.z101-mining-icon{font-size:15px!important}.z101-mine-action{min-width:67px!important}.z101-btn{padding:6px!important;font-size:8px!important}}
    `;document.head.appendChild(style);
  }

  // Capture identity before the legacy handler; no need to disturb other actions.
  document.addEventListener('click',e=>{const b=e.target.closest('[data-action="open-identity"]');if(b){e.preventDefault();e.stopImmediatePropagation();openIdentityPro()}},true);
  window.addEventListener('zivozone-language',()=>setTimeout(renderChallengeGallery,80));
  window.addEventListener('zivozone-auth',()=>setTimeout(renderChallengeGallery,120));
  window.addEventListener('hashchange',()=>setTimeout(renderChallengeGallery,120));
  document.addEventListener('DOMContentLoaded',()=>{setTimeout(()=>{renderChallengeGallery();enhanceHorrorAudio();polishEconomy()},180)});
  setTimeout(()=>{renderChallengeGallery();enhanceHorrorAudio();polishEconomy()},900);
})();
