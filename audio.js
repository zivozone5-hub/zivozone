/* ============================================================
   ZIVOZONE SMART AUDIO ENGINE
   Web Audio API — no external sound files required
============================================================ */
(() => {
  'use strict';
  let ctx=null, master=null, ambience=null, ambienceGain=null, enabled=true, started=false, horrorTimer=null;
  const KEY='zivozone_audio_enabled_v1';
  try{ enabled=localStorage.getItem(KEY)!=='0'; }catch(e){}
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function ensure(){
    if(ctx) return ctx;
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
    ctx=new AC();master=ctx.createGain();master.gain.value=enabled?.22:0;master.connect(ctx.destination);
    return ctx;
  }
  async function unlock(){const c=ensure();if(!c)return;if(c.state==='suspended')try{await c.resume()}catch(e){}started=true;}
  function tone(freq,dur=.08,type='sine',gain=.04,delay=0){const c=ensure();if(!c||!enabled)return;const t=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.02)}
  function noise(dur=.15,gain=.03,filter=1200){const c=ensure();if(!c||!enabled)return;const n=c.createBufferSource(),b=c.createBuffer(1,Math.max(1,c.sampleRate*dur),c.sampleRate),data=b.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;n.buffer=b;const f=c.createBiquadFilter(),g=c.createGain();f.type='lowpass';f.frequency.value=filter;g.gain.value=gain;n.connect(f);f.connect(g);g.connect(master);n.start();g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+dur);n.stop(c.currentTime+dur+.02)}
  function setEnabled(v){enabled=!!v;try{localStorage.setItem(KEY,enabled?'1':'0')}catch(e){}if(master)master.gain.setTargetAtTime(enabled?.22:0,ctx.currentTime,.03);if(!enabled)stopHorror();}
  function click(){tone(520,.055,'triangle',.025)}
  function hover(){tone(220,.035,'sine',.009)}
  function correct(){tone(660,.08,'sine',.035);tone(880,.12,'sine',.028,.07)}
  function wrong(){tone(150,.14,'sawtooth',.035);tone(95,.18,'sine',.022,.05)}
  function success(){tone(523,.12,'sine',.04);tone(659,.12,'sine',.04,.12);tone(784,.22,'sine',.045,.24)}
  function levelUp(){tone(392,.12,'triangle',.04);tone(523,.12,'triangle',.04,.1);tone(784,.3,'triangle',.05,.2)}
  function danger(level=1){const f=110+level*18;tone(f,.18,'sawtooth',.025);tone(f/2,.28,'sine',.018,.08);noise(.12,.012,600)}
  function warden(){tone(58,.5,'sawtooth',.045);tone(83,.32,'sine',.025,.14);noise(.35,.02,350)}
  function question(d,mode){if(mode==='horror'){danger(d>=8?3:d>=5?2:1);return}tone(300+d*22,.07,'sine',.018);}
  function startHorror(){unlock();stopHorror();if(!enabled)return;const c=ensure();if(!c)return;const o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();o.type='sine';o.frequency.value=48;f.type='lowpass';f.frequency.value=180;g.gain.value=.0001;o.connect(f);f.connect(g);g.connect(master);o.start();g.gain.setTargetAtTime(.025,c.currentTime,2);ambience=o;ambienceGain=g;horrorTimer=setInterval(()=>{if(enabled){tone(48+Math.random()*25,.45,'sine',.008);noise(.25,.006,260)}},4200)}
  function stopHorror(){if(horrorTimer){clearInterval(horrorTimer);horrorTimer=null}if(ambience&&ctx){try{ambience.stop()}catch(e){}ambience=null;ambienceGain=null}}
  function phase(n){if(n===2){danger(2);tone(70,.5,'sine',.02)}if(n===3){danger(3);noise(.35,.02,500)}}
  function setMaster(v){if(!master)return;master.gain.setTargetAtTime(clamp(v,0,1),ctx.currentTime,.05)}
  window.ZIVOZONE_AUDIO={unlock,setEnabled,isEnabled:()=>enabled,toggle:()=>setEnabled(!enabled),click,hover,correct,wrong,success,levelUp,danger,warden,question,startHorror,stopHorror,phase,setMaster};
  document.addEventListener('pointerdown',()=>unlock(),{once:true,passive:true});
})();
