/* ============================================================
   ZIVOZONE AUDIO ENGINE v6
   Adaptive audio by challenge. Web Audio only: no external files.
   Volume is intentionally stronger, with compression to prevent clipping.
============================================================ */
(() => {
  'use strict';
  let ctx=null, input=null, master=null, compressor=null, ambience=null, horrorTimer=null, enabled=true, volume=.72;
  const KEY='zivozone_audio_v6';
  try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');enabled=x.enabled!==false;volume=Number(x.volume)||.72}catch(e){}
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function ensure(){
    if(ctx)return ctx;
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
    ctx=new AC();
    input=ctx.createGain(); input.gain.value=1;
    compressor=ctx.createDynamicsCompressor();
    compressor.threshold.value=-18; compressor.knee.value=16; compressor.ratio.value=7; compressor.attack.value=.003; compressor.release.value=.18;
    master=ctx.createGain(); master.gain.value=enabled?volume:0;
    input.connect(compressor);compressor.connect(master);master.connect(ctx.destination);
    return ctx;
  }
  async function unlock(){const c=ensure();if(!c)return;if(c.state==='suspended')try{await c.resume()}catch(e){} }
  function save(){try{localStorage.setItem(KEY,JSON.stringify({enabled,volume}))}catch(e){}}
  function out(node){node.connect(input)}
  function tone(freq,dur=.1,type='sine',gain=.08,delay=0,endFreq=null){const c=ensure();if(!c||!enabled)return;const t=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(Math.max(20,freq),t);if(endFreq)o.frequency.exponentialRampToValueAtTime(Math.max(20,endFreq),t+dur);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0003,gain),t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);out(g);o.connect(g);o.start(t);o.stop(t+dur+.03)}
  function noise(dur=.2,gain=.05,filter=1400,delay=0){const c=ensure();if(!c||!enabled)return;const t=c.currentTime+delay,n=c.createBufferSource(),b=c.createBuffer(1,Math.max(1,Math.floor(c.sampleRate*dur)),c.sampleRate),data=b.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;n.buffer=b;const f=c.createBiquadFilter(),g=c.createGain();f.type='lowpass';f.frequency.value=filter;g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);n.connect(f);f.connect(g);out(g);n.start(t);n.stop(t+dur+.02)}
  function click(){tone(540,.05,'triangle',.045)}
  function hover(){tone(250,.03,'sine',.012)}
  function correct(){tone(620,.09,'sine',.075);tone(830,.12,'sine',.06,.06);tone(1040,.16,'triangle',.045,.12)}
  function wrong(){tone(180,.18,'sawtooth',.08,0,75);noise(.14,.035,700,.03)}
  function success(){tone(523,.12,'triangle',.07);tone(659,.13,'triangle',.07,.1);tone(784,.22,'triangle',.075,.2);tone(1046,.3,'sine',.06,.32)}
  function levelUp(){tone(330,.12,'square',.05);tone(495,.12,'square',.06,.1);tone(742,.25,'triangle',.08,.2)}
  function sport(){tone(110,.18,'sine',.05,0,170);tone(220,.1,'triangle',.04,.1);noise(.1,.025,1000,.16)}
  function iq(){tone(480,.06,'sine',.035);tone(720,.1,'triangle',.05,.06)}
  function science(){tone(320,.08,'sine',.04);tone(640,.12,'sine',.045,.09)}
  function math(){tone(420,.06,'square',.035);tone(630,.08,'triangle',.045,.06)}
  function memory(){tone(260,.12,'sine',.04);tone(390,.14,'sine',.045,.12)}
  function strategy(){tone(190,.09,'triangle',.04);tone(285,.12,'triangle',.05,.1)}
  function reaction(){tone(760,.045,'square',.05)}
  function daily(){tone(600,.055,'triangle',.045);tone(900,.08,'triangle',.04,.05)}
  function danger(level=1){const f=120-level*14;tone(f,.28,'sawtooth',.085,0,48);tone(f/2,.42,'sine',.05,.08,32);noise(.32,.05,420,.02)}
  function warden(){tone(52,.75,'sawtooth',.1,0,36);tone(74,.55,'sine',.06,.14,44);noise(.6,.07,320,.08)}
  function question(d,mode){if(mode==='horror'){danger(d>=8?3:d>=5?2:1);return}const fn={iq,science,math,memory,strategy,reaction,football:sport,daily};(fn[mode]||iq)();}
  function startHorror(){unlock();stopHorror();if(!enabled)return;const c=ensure();if(!c)return;const o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();o.type='sine';o.frequency.value=42;f.type='lowpass';f.frequency.value=150;g.gain.value=.0001;o.connect(f);f.connect(g);out(g);o.start();g.gain.setTargetAtTime(.055,c.currentTime,1.2);ambience=o;horrorTimer=setInterval(()=>{if(enabled){tone(40+Math.random()*30,.55,'sine',.025,0,30);noise(.4,.018,260);if(Math.random()<.28)warden()}},3200)}
  function stopHorror(){if(horrorTimer){clearInterval(horrorTimer);horrorTimer=null}if(ambience&&ctx){try{ambience.stop()}catch(e){}ambience=null}}
  function phase(n){if(n===2){danger(2);tone(64,.7,'sawtooth',.055,0,42)}if(n===3){danger(3);warden();noise(.8,.06,500)}}
  function setEnabled(v){enabled=!!v;ensure();if(master)master.gain.setTargetAtTime(enabled?volume:0,ctx.currentTime,.04);if(!enabled)stopHorror();save()}
  function setVolume(v){volume=clamp(Number(v)||.72,0,1);ensure();if(master)master.gain.setTargetAtTime(enabled?volume:0,ctx.currentTime,.04);save()}
  window.ZIVOZONE_AUDIO={unlock,setEnabled,isEnabled:()=>enabled,toggle:()=>setEnabled(!enabled),setVolume,volume:()=>volume,click,hover,correct,wrong,success,levelUp,danger,warden,question,startHorror,stopHorror,phase,sport,iq,science,math,memory,strategy,reaction,daily};
  document.addEventListener('pointerdown',()=>unlock(),{once:true,passive:true});
})();
