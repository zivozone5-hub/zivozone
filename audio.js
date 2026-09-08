/* ============================================================
   ZIVOZONE AUDIO ENGINE V7
   Strong adaptive audio + stereo spatial horror ambience.
============================================================ */
(() => {
  'use strict';
  let ctx=null,input=null,master=null,compressor=null,ambienceNodes=[],horrorTimer=null,enabled=true,volume=.9;
  const KEY='zivozone_audio_v7';
  try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');enabled=x.enabled!==false;volume=Number.isFinite(Number(x.volume))?Number(x.volume):.9}catch(e){}
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function ensure(){
    if(ctx)return ctx;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;ctx=new AC();
    input=ctx.createGain();compressor=ctx.createDynamicsCompressor();compressor.threshold.value=-24;compressor.knee.value=18;compressor.ratio.value=10;compressor.attack.value=.002;compressor.release.value=.16;
    master=ctx.createGain();master.gain.value=enabled?volume:0;input.connect(compressor);compressor.connect(master);master.connect(ctx.destination);return ctx;
  }
  async function unlock(){const c=ensure();if(c?.state==='suspended')try{await c.resume()}catch(e){}}
  function save(){try{localStorage.setItem(KEY,JSON.stringify({enabled,volume}))}catch(e){}}
  function out(node,pan=0){const c=ensure();if(!c)return;const p=c.createStereoPanner?c.createStereoPanner():null;if(p){p.pan.value=clamp(pan,-1,1);node.connect(p);p.connect(input)}else node.connect(input)}
  function tone(freq,dur=.1,type='sine',gain=.08,delay=0,endFreq=null,pan=0){const c=ensure();if(!c||!enabled)return;const t=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(Math.max(20,freq),t);if(endFreq)o.frequency.exponentialRampToValueAtTime(Math.max(20,endFreq),t+dur);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0005,gain),t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);out(g,pan);o.start(t);o.stop(t+dur+.03)}
  function noise(dur=.2,gain=.05,filter=1400,delay=0,pan=0){const c=ensure();if(!c||!enabled)return;const t=c.currentTime+delay,n=c.createBufferSource(),b=c.createBuffer(1,Math.max(1,Math.floor(c.sampleRate*dur)),c.sampleRate),data=b.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;n.buffer=b;const f=c.createBiquadFilter(),g=c.createGain();f.type='lowpass';f.frequency.value=filter;g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);n.connect(f);f.connect(g);out(g,pan);n.start(t);n.stop(t+dur+.02)}
  function click(){unlock();tone(540,.045,'triangle',.07,0,null,0)}
  function hover(){tone(250,.03,'sine',.018)}
  function correct(){tone(620,.09,'sine',.08);tone(830,.12,'sine',.07,.06);tone(1040,.16,'triangle',.06,.12)}
  function wrong(){tone(170,.2,'sawtooth',.12,0,55);noise(.16,.05,650,.02)}
  function success(){tone(523,.12,'triangle',.08);tone(659,.13,'triangle',.08,.1);tone(784,.22,'triangle',.085,.2);tone(1046,.3,'sine',.07,.32)}
  function sport(){tone(110,.18,'sine',.07,0,170);tone(220,.1,'triangle',.06,.1);noise(.12,.035,1000,.16)}
  function iq(){tone(480,.06,'sine',.045);tone(720,.1,'triangle',.06,.06)}
  function science(){tone(320,.08,'sine',.05);tone(640,.12,'sine',.06,.09)}
  function math(){tone(420,.06,'square',.045);tone(630,.08,'triangle',.055,.06)}
  function memory(){tone(260,.12,'sine',.05);tone(390,.14,'sine',.055,.12)}
  function strategy(){tone(190,.09,'triangle',.05);tone(285,.12,'triangle',.06,.1)}
  function reaction(){tone(760,.045,'square',.065)}
  function daily(){tone(600,.055,'triangle',.055);tone(900,.08,'triangle',.05,.05)}
  function danger(level=1){const f=Math.max(38,125-level*16);tone(f,.34,'sawtooth',.12,0,34,-.35);tone(f/2,.5,'sine',.08,.08,26,.35);noise(.4,.07,380,.02,Math.random()*1.4-.7)}
  function warden(){tone(48,.9,'sawtooth',.14,0,28,-.65);tone(68,.65,'sine',.1,.16,39,.65);noise(.7,.09,300,.08,Math.random()>.5?.8:-.8)}
  function question(d,mode){if(mode==='horror'){danger(d>=8?3:d>=5?2:1);return}const fn={iq,science,math,memory,strategy,reaction,football:sport,daily};(fn[mode]||iq)()}
  function clearNodes(){ambienceNodes.forEach(n=>{try{n.stop?.()}catch(e){}});ambienceNodes=[]}
  function movingDrone(){const c=ensure();if(!c||!enabled)return;const o=c.createOscillator(),g=c.createGain(),p=c.createStereoPanner?c.createStereoPanner():null;o.type='sine';o.frequency.value=38;g.gain.value=.0001;o.connect(g);if(p){g.connect(p);p.connect(input);p.pan.value=-.9;let dir=1;const timer=setInterval(()=>{if(!ctx||!p||!enabled)return;p.pan.setTargetAtTime(dir*.9,ctx.currentTime,.9);dir*=-1},2200);ambienceNodes.push({stop:()=>{clearInterval(timer);o.stop()}})}else{g.connect(input);ambienceNodes.push(o)}o.start();g.gain.setTargetAtTime(.09,c.currentTime,1.8);ambienceNodes.push(o)}
  function startHorror(){unlock();stopHorror();if(!enabled)return;movingDrone();const c=ensure();if(!c)return;horrorTimer=setInterval(()=>{if(!enabled)return;const pan=Math.random()>.5?.95:-.95;tone(42+Math.random()*34,.8,'sine',.045,0,28,pan);noise(.55,.045,260,.1,-pan);if(Math.random()<.38)warden();if(Math.random()<.22)tone(900+Math.random()*500,.06,'triangle',.035,0,null,pan)},2500)}
  function stopHorror(){if(horrorTimer){clearInterval(horrorTimer);horrorTimer=null}clearNodes()}
  function phase(n){danger(Math.min(4,n));if(n>=2)warden();if(n>=3){noise(1.1,.09,500,.02,-.8);noise(1.1,.09,500,.02,.8)}}
  function horrorPulse(level){const pan=Math.random()>.5?.9:-.9;tone(70-level*5,.55,'sawtooth',.09,0,32,pan);noise(.3,.06,500,.04,-pan)}
  function horrorAnswer(ok,d){tone(ok?145:95,.22,'sine',.05,0,ok?70:40,Math.random()>.5?.7:-.7);if(d>=8)noise(.35,.045,280,.05,Math.random()>.5?.9:-.9)}
  function checkpoint(n){tone(55,.7,'sawtooth',.11,0,28,-.7);tone(58,.7,'sawtooth',.11,.12,30,.7);noise(.8,.08,420,.18,0)}
  function setEnabled(v){enabled=!!v;ensure();if(master)master.gain.setTargetAtTime(enabled?volume:0,ctx.currentTime,.05);if(!enabled)stopHorror();save()}
  function setVolume(v){volume=clamp(Number(v),0,1);ensure();if(master)master.gain.setTargetAtTime(enabled?volume:0,ctx.currentTime,.05);save()}
  window.ZIVOZONE_AUDIO={unlock,setEnabled,isEnabled:()=>enabled,toggle:()=>setEnabled(!enabled),setVolume,volume:()=>volume,click,hover,correct,wrong,success,levelUp:success,danger,warden,question,startHorror,stopHorror,phase,horrorPulse,horrorAnswer,checkpoint,sport,iq,science,math,memory,strategy,reaction,daily};
  document.addEventListener('pointerdown',()=>unlock(),{once:true,passive:true});
})();
