/* ============================================================
   ZIVOZONE CINEMATIC AUDIO ENGINE V9
   - SILENT HOME PAGE
   - Audio starts only after entering a challenge
   - Each challenge has its own continuous soundscape
   - Dark Room: cinematic horror drone + stereo movement + eerie laugh + distant scream accents
   - All sounds are generated locally with Web Audio; no external audio hosting required
============================================================ */
(() => {
  'use strict';
  let ctx=null, input=null, master=null, compressor=null;
  let challengeNodes=[], timers=[];
  let enabled=true, volume=.92, activeMode=null, started=false;
  const KEY='zivozone_audio_v9';
  try{
    const x=JSON.parse(localStorage.getItem(KEY)||'{}');
    enabled=x.enabled!==false;
    volume=Number.isFinite(+x.volume)?Math.max(.05,Math.min(1,+x.volume)):.92;
  }catch(e){}

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function ensure(){
    if(ctx)return ctx;
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return null;
    ctx=new AC();
    input=ctx.createGain();
    compressor=ctx.createDynamicsCompressor();
    compressor.threshold.value=-24;
    compressor.knee.value=28;
    compressor.ratio.value=12;
    compressor.attack.value=.003;
    compressor.release.value=.22;
    master=ctx.createGain();
    master.gain.value=enabled?volume:0;
    input.connect(compressor);
    compressor.connect(master);
    master.connect(ctx.destination);
    return ctx;
  }
  async function unlock(){
    const c=ensure();
    if(c?.state==='suspended')try{await c.resume()}catch(e){}
  }
  function save(){try{localStorage.setItem(KEY,JSON.stringify({enabled,volume}))}catch(e){}}
  function connect(node,pan=0){
    const c=ensure(); if(!c||!node)return;
    const p=c.createStereoPanner?c.createStereoPanner():null;
    if(p){p.pan.value=clamp(pan,-1,1);node.connect(p);p.connect(input)}else node.connect(input);
  }
  function osc(freq,gain=.04,type='sine',pan=0,detune=0){
    const c=ensure(); if(!c||!enabled)return null;
    const o=c.createOscillator(),g=c.createGain();
    o.type=type;o.frequency.value=Math.max(1,freq);o.detune.value=detune;
    g.gain.value=.0001;o.connect(g);connect(g,pan);o.start();
    g.gain.setTargetAtTime(gain,c.currentTime,1.4);
    challengeNodes.push(o); return o;
  }
  function tone(freq,dur=.15,gain=.08,type='sine',pan=0,endFreq=null){
    const c=ensure(); if(!c||!enabled)return;
    const t=c.currentTime,o=c.createOscillator(),g=c.createGain();
    o.type=type;o.frequency.setValueAtTime(Math.max(1,freq),t);
    if(endFreq)o.frequency.exponentialRampToValueAtTime(Math.max(20,endFreq),t+dur);
    g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(Math.max(.0005,gain),t+.025);
    g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g);connect(g,pan);o.start(t);o.stop(t+dur+.05);
  }
  function noise(dur=.5,gain=.04,filter=900,pan=0){
    const c=ensure(); if(!c||!enabled)return;
    const n=c.createBufferSource(),b=c.createBuffer(1,Math.max(1,Math.floor(c.sampleRate*dur)),c.sampleRate),d=b.getChannelData(0);
    for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    n.buffer=b;
    const f=c.createBiquadFilter(),g=c.createGain();
    f.type='lowpass';f.frequency.value=filter;
    g.gain.setValueAtTime(gain,c.currentTime);
    g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+dur);
    n.connect(f);f.connect(g);connect(g,pan);n.start();n.stop(c.currentTime+dur+.03);
  }
  function clearChallenge(){
    timers.forEach(clearInterval);timers=[];
    challengeNodes.forEach(n=>{try{n.stop()}catch(e){}});challengeNodes=[];
    activeMode=null;started=false;
  }
  function panSweep(freq,gain,dur,type='sine'){
    const c=ensure();if(!c||!enabled)return;
    const o=c.createOscillator(),g=c.createGain(),p=c.createStereoPanner?c.createStereoPanner():null;
    const t=c.currentTime;o.type=type;o.frequency.value=freq;
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+.08);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g);
    if(p){p.pan.setValueAtTime(-.95,t);p.pan.linearRampToValueAtTime(.95,t+dur);g.connect(p);p.connect(input)}else g.connect(input);
    o.start(t);o.stop(t+dur+.05);
  }

  // A short, recognizable but fully synthetic eerie laugh. It is used sparingly.
  function eerieLaugh(){
    if(!enabled)return;
    const c=ensure();if(!c)return;
    const base=105+Math.random()*20;
    [0,.16,.31,.48].forEach((delay,i)=>{
      setTimeout(()=>{
        if(!started||activeMode!=='horror'||!enabled)return;
        tone(base+i*9,.16,.10,'sawtooth',i%2?-.65:.65,base*1.65);
        tone(base*.72,.11,.045,'triangle',i%2?.55:-.55,base*.5);
      },delay*1000);
    });
  }
  function distantScream(){
    if(!enabled)return;
    const c=ensure();if(!c)return;
    const t=c.currentTime,o=c.createOscillator(),g=c.createGain(),p=c.createStereoPanner?c.createStereoPanner():null;
    o.type='sawtooth';o.frequency.setValueAtTime(230,t);o.frequency.exponentialRampToValueAtTime(880,t+1.15);o.frequency.exponentialRampToValueAtTime(150,t+1.65);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.12,t+.15);g.gain.exponentialRampToValueAtTime(.035,t+1.05);g.gain.exponentialRampToValueAtTime(.0001,t+1.65);
    o.connect(g);
    if(p){p.pan.setValueAtTime(Math.random()>.5?-.92:.92,t);p.pan.linearRampToValueAtTime(Math.random()>.5?.7:-.7,t+1.6);g.connect(p);p.connect(input)}else g.connect(input);
    o.start(t);o.stop(t+1.7);
    noise(1.4,.035,1200,Math.random()>.5?-.7:.7);
  }

  function startChallenge(mode){
    unlock();clearChallenge();
    if(!enabled)return;
    activeMode=mode;started=true;const c=ensure();if(!c)return;
    const profiles={
      iq:{base:72,second:108,filter:1400},
      science:{base:118,second:176,filter:1000},
      daily:{base:300,second:420,filter:1700},
      football:{base:82,second:124,filter:900},
      logic:{base:55,second:84,filter:700},
      memory:{base:170,second:255,filter:1200},
      strategy:{base:48,second:72,filter:520},
      math:{base:132,second:198,filter:1100},
      reaction:{base:440,second:650,filter:1900},
      horror:{base:34,second:51,filter:240}
    };
    const p=profiles[mode]||profiles.iq;
    osc(p.base,.028,'sine',-.45,mode==='horror'?-5:0);
    osc(p.second,.016,'triangle',.45,mode==='horror'?-8:0);

    if(mode==='horror'){
      osc(22,.085,'sine',0);
      osc(43,.035,'sawtooth',-.2,-9);
      timers.push(setInterval(()=>{
        if(!enabled||activeMode!=='horror')return;
        const pan=Math.random()>.5?.94:-.94;
        tone(27+Math.random()*15,.85,.105,'sawtooth',pan,20);
        noise(.9,.075,250,-pan*.65);
        if(Math.random()<.48)eerieLaugh();
        if(Math.random()<.16)distantScream();
      },3600));
      timers.push(setInterval(()=>{
        if(!enabled||activeMode!=='horror')return;
        noise(2.2,.032,170,Math.sin(Date.now()/1500)*.85);
        tone(39,.9,.055,'sine',Math.sin(Date.now()/1100),26);
      },4700));
    }else{
      timers.push(setInterval(()=>{
        if(!enabled||!started)return;
        const pan=Math.sin(Date.now()/1800)*.78;
        tone(p.base,.65,.035,mode==='reaction'?'square':'sine',pan,p.second);
        noise(mode==='memory'?.28:.38,mode==='reaction'?.018:.025,p.filter,-pan*.55);
        if(mode==='football'&&Math.random()<.35){tone(95,.16,.035,'triangle',-.8,150);tone(125,.12,.03,'triangle',.8,190)}
        if(mode==='math'&&Math.random()<.4){tone(264,.12,.025,'sine',-.2,396);tone(396,.16,.02,'sine',.2,528)}
        if(mode==='logic'&&Math.random()<.35){tone(62,.3,.035,'triangle',.5,44)}
        if(mode==='memory'&&Math.random()<.45){tone(900,.05,.025,'square',Math.random()>.5?.6:-.6,700)}
        if(mode==='reaction')panSweep(620,.035,.18,'square');
      },2100));
    }
  }
  function stopChallenge(){clearChallenge()}
  function question(d,mode){
    if(!started)return;
    if(mode==='horror'){
      const f=Math.max(25,72-d*3);tone(f,.48,.13,'sawtooth',Math.random()>.5?.82:-.82,27);
      if(d>=7)noise(.55,.065,220,Math.random()>.5?.9:-.9);
      if(d>=9&&Math.random()<.45)eerieLaugh();
      return;
    }
    const f=Math.max(60,420-d*25);tone(f,.10,.05,mode==='reaction'?'square':'triangle',Math.random()>.5?.4:-.4,f*1.45);
  }
  function correct(){if(activeMode==='horror')return;tone(680,.11,.065,'sine',0,960);tone(960,.13,.045,'triangle',.1,1240)}
  function wrong(){if(activeMode==='horror')return;tone(120,.22,.085,'sawtooth',0,55);noise(.18,.03,500)}
  function success(){tone(420,.12,.06,'triangle');tone(620,.16,.055,'triangle',.1,900);tone(900,.22,.06,'sine',-.1,1200)}
  function click(){if(!started)return;tone(activeMode==='horror'?180:520,.055,.065,activeMode==='reaction'?'square':'triangle',Math.random()>.5?.25:-.25)}
  function hover(){/* no sound outside challenge */}
  function danger(level=1){if(activeMode!=='horror')return;tone(Math.max(25,90-level*15),.55,.14,'sawtooth',-.5,24);tone(Math.max(22,48-level*4),.7,.11,'sine',.5,25);noise(.5,.07,260,Math.random()>.5?.8:-.8)}
  function warden(){if(activeMode!=='horror')return;tone(39,.95,.18,'sawtooth',-.72,25);tone(57,.8,.13,'sine',.72,32);noise(.9,.09,220,Math.random()>.5?.9:-.9)}
  function phase(n){if(activeMode!=='horror')return;danger(n);if(n>=2)warden();if(n>=3){noise(1.4,.12,300,-.8);noise(1.4,.12,300,.8)}}
  function horrorPulse(level){if(activeMode!=='horror')return;tone(55-level*3,.45,.14,'sawtooth',Math.random()>.5?.9:-.9,24);noise(.32,.08,260,Math.random()>.5?.9:-.9)}
  function horrorAnswer(d){if(activeMode!=='horror')return;tone(Math.max(32,105-d*7),.2,.075,'sine',Math.random()>.5?.8:-.8,32);if(d>=9)warden()}
  function checkpoint(){if(activeMode!=='horror')return;tone(35,.9,.17,'sawtooth',-.8,22);tone(38,.9,.15,'sawtooth',.8,23);noise(.9,.11,260)}
  function whisper(){if(activeMode!=='horror')return;tone(31,.7,.09,'sine',-.8,20);tone(34,.75,.08,'sine',.8,20);noise(.8,.035,900,0)}
  function setEnabled(v){enabled=!!v;ensure();if(master)master.gain.setTargetAtTime(enabled?volume:0,ctx.currentTime,.08);if(!enabled)clearChallenge();save()}
  function setVolume(v){volume=clamp(+v,.05,1);ensure();if(master)master.gain.setTargetAtTime(enabled?volume:0,ctx.currentTime,.08);save()}
  window.ZIVOZONE_AUDIO={unlock,setEnabled,isEnabled:()=>enabled,toggle:()=>setEnabled(!enabled),setVolume,volume:()=>volume,click,hover,correct,wrong,success,question,startChallenge,stopChallenge,danger,warden,phase,horrorPulse,horrorAnswer,checkpoint,whisper,active:()=>started};
})();
