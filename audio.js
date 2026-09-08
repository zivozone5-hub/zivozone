/* ============================================================
   ZIVOZONE CINEMATIC AUDIO ENGINE V8
   Audio is intentionally silent on the home page.
   A challenge starts the appropriate continuous soundscape.
============================================================ */
(() => {
  'use strict';
  let ctx=null,input=null,master=null,compressor=null,challengeNodes=[],timers=[];
  let enabled=true,volume=.82,activeMode=null,started=false;
  const KEY='zivozone_audio_v8';
  try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');enabled=x.enabled!==false;volume=Number.isFinite(+x.volume)?Math.max(.05,Math.min(.95,+x.volume)):.82}catch(e){}
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function ensure(){if(ctx)return ctx;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;ctx=new AC();input=ctx.createGain();compressor=ctx.createDynamicsCompressor();compressor.threshold.value=-26;compressor.knee.value=22;compressor.ratio.value=12;compressor.attack.value=.003;compressor.release.value=.18;master=ctx.createGain();master.gain.value=enabled?volume:0;input.connect(compressor);compressor.connect(master);master.connect(ctx.destination);return ctx}
  async function unlock(){const c=ensure();if(c?.state==='suspended')try{await c.resume()}catch(e){}}
  function save(){try{localStorage.setItem(KEY,JSON.stringify({enabled,volume}))}catch(e){}}
  function connect(node,pan=0){const c=ensure();if(!c)return;const p=c.createStereoPanner?c.createStereoPanner():null;if(p){p.pan.value=clamp(pan,-1,1);node.connect(p);p.connect(input)}else node.connect(input)}
  function osc(freq,gain=.05,type='sine',pan=0,detune=0){const c=ensure();if(!c||!enabled)return null;const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=freq;o.detune.value=detune;g.gain.value=.0001;o.connect(g);connect(g,pan);o.start();g.gain.setTargetAtTime(gain,c.currentTime,1.2);challengeNodes.push(o);return o}
  function tone(freq,dur=.12,gain=.08,type='sine',pan=0,endFreq=null){const c=ensure();if(!c||!enabled)return;const t=c.currentTime,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);if(endFreq)o.frequency.exponentialRampToValueAtTime(Math.max(20,endFreq),t+dur);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0005,gain),t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);connect(g,pan);o.start(t);o.stop(t+dur+.05)}
  function noise(dur=.4,gain=.04,filter=900,pan=0){const c=ensure();if(!c||!enabled)return;const n=c.createBufferSource(),b=c.createBuffer(1,Math.floor(c.sampleRate*dur),c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;n.buffer=b;const f=c.createBiquadFilter(),g=c.createGain();f.type='lowpass';f.frequency.value=filter;g.gain.setValueAtTime(gain,c.currentTime);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+dur);n.connect(f);f.connect(g);connect(g,pan);n.start();n.stop(c.currentTime+dur+.03)}
  function clearChallenge(){timers.forEach(clearInterval);timers=[];challengeNodes.forEach(n=>{try{n.stop()}catch(e){}});challengeNodes=[];activeMode=null;started=false}
  function loopPulse(mode){const c=ensure();if(!c||!enabled)return;const profile={iq:[210,280],science:[120,180],daily:[300,420],football:[95,150],logic:[75,110],memory:[180,260],strategy:[65,100],math:[140,220],reaction:[420,560],horror:[38,62]}[mode]||[180,260];const pan=Math.sin(Date.now()/1800)*.78;tone(profile[0],.8,.035,'sine',pan,profile[1]);noise(mode==='horror'?.8:.35,mode==='horror'?.08:.025,mode==='horror'?260:1100,-pan*.6)}
  function startChallenge(mode){unlock();clearChallenge();if(!enabled)return;activeMode=mode;started=true;const c=ensure();if(!c)return;
    const base={iq:64,science:52,daily:82,football:48,logic:44,memory:58,strategy:42,math:60,reaction:115,horror:31}[mode]||55;
    const second={iq:96,science:78,daily:126,football:72,logic:62,memory:88,strategy:58,math:92,reaction:180,horror:47}[mode]||90;
    const o1=osc(base,.035,'sine',-.55),o2=osc(second,.018,'triangle',.55,mode==='horror'?-7:0);
    if(mode==='horror'){
      const o3=osc(24,.055,'sine',0);if(o3)challengeNodes.push(o3);
      timers.push(setInterval(()=>{if(!enabled)return;const pan=Math.random()>.5?.95:-.95;tone(30+Math.random()*30,.9,.10,'sawtooth',pan,22);noise(.7,.075,260,-pan);if(Math.random()<.48){tone(47,.75,.16,'sine',-pan,28);tone(53,.6,.13,'sine',pan,30)}},1900));
      timers.push(setInterval(()=>{if(!enabled)return;noise(1.8,.035,180,Math.random()>.5?.7:-.7)},4300));
    }else{
      timers.push(setInterval(()=>loopPulse(mode),2200));
      timers.push(setInterval(()=>{if(Math.random()<.35)tone(base*2,.08,.025,'triangle',Math.random()>.5?.7:-.7)},3600));
    }
  }
  function stopChallenge(){clearChallenge()}
  function question(d,mode){if(mode==='horror'){const f=Math.max(25,72-d*3);tone(f,.42,.12,'sawtooth',Math.random()>.5?.75:-.75,28);if(d>=8)noise(.5,.07,220,Math.random()>.5?.9:-.9);return}const f=Math.max(60,420-d*25);tone(f,.09,.055,'triangle',Math.random()>.5?.35:-.35,f*1.5)}
  function correct(){tone(680,.11,.07,'sine',0,960);tone(960,.13,.05,'triangle',.1,1240)}
  function wrong(){tone(120,.22,.09,'sawtooth',0,55);noise(.18,.035,500)}
  function success(){tone(420,.12,.06,'triangle');tone(620,.16,.06,'triangle',.1,900);tone(900,.22,.07,'sine',-.1,1200)}
  function click(){tone(520,.05,.05,'triangle')}
  function hover(){/* deliberately silent outside challenges */}
  function danger(level=1){tone(Math.max(25,90-level*15),.55,.13,'sawtooth',-.5,24);tone(Math.max(22,48-level*4),.7,.10,'sine',.5,25);noise(.5,.07,260,Math.random()>.5?.8:-.8)}
  function warden(){tone(39,.95,.17,'sawtooth',-.72,25);tone(57,.8,.12,'sine',.72,32);noise(.9,.09,220,Math.random()>.5?.9:-.9)}
  function phase(n){danger(n);if(n>=2)warden();if(n>=3){noise(1.4,.11,300,-.8);noise(1.4,.11,300,.8)}}
  function horrorPulse(level){tone(55-level*3,.45,.13,'sawtooth',Math.random()>.5?.9:-.9,24);noise(.32,.08,260,Math.random()>.5?.9:-.9)}
  function horrorAnswer(d){tone(Math.max(32,105-d*7),.2,.07,'sine',Math.random()>.5?.8:-.8,32);if(d>=9)warden()}
  function checkpoint(){tone(35,.9,.16,'sawtooth',-.8,22);tone(38,.9,.14,'sawtooth',.8,23);noise(.9,.1,260)}
  function whisper(){tone(31,.7,.08,'sine',-.8,20);tone(34,.75,.07,'sine',.8,20)}
  function setEnabled(v){enabled=!!v;ensure();if(master)master.gain.setTargetAtTime(enabled?volume:0,ctx.currentTime,.08);if(!enabled)clearChallenge();save()}
  function setVolume(v){volume=clamp(+v,.05,.95);ensure();if(master)master.gain.setTargetAtTime(enabled?volume:0,ctx.currentTime,.08);save()}
  window.ZIVOZONE_AUDIO={unlock,setEnabled,isEnabled:()=>enabled,toggle:()=>setEnabled(!enabled),setVolume,volume:()=>volume,click,hover,correct,wrong,success,question,startChallenge,stopChallenge,danger,warden,phase,horrorPulse,horrorAnswer,checkpoint,whisper,active:()=>started};
})();
