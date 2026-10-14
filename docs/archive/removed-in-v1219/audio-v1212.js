(()=>{"use strict";
class ZivoAudioManager{
 static instance;
 constructor(){
  if(ZivoAudioManager.instance)return ZivoAudioManager.instance;
  this.tracks={math:"assets/audio/math_ambient.mp3",horror:"assets/audio/horror_ambient.mp3",logic:"assets/audio/logic_ambient.mp3",daily:"assets/audio/daily_ambient.mp3",strategy:"assets/audio/strategy_ambient.mp3",science:"assets/audio/science_ambient.mp3",football:"assets/audio/football_ambient.mp3",reaction:"assets/audio/reaction_ambient.mp3",iq:"assets/audio/iq_ambient.mp3",memory:"assets/audio/memory_ambient.mp3"};
  this.sfx={click_light:"assets/audio/click_light.mp3",click_heavy:"assets/audio/click_heavy.mp3",menu_toggle:"assets/audio/menu_toggle.mp3",success_coin:"assets/audio/success_coin.mp3",purchase_burn:"assets/audio/purchase_burn.mp3",challenge_win:"assets/audio/challenge_win.mp3",challenge_fail:"assets/audio/challenge_fail.mp3"};
  this.ctx=null;this.master=null;this.ambient=null;this.ambientKey=null;this.enabled=true;this.volume=.55;this.sfxVolume=.7;this.lastSfx=new Map();this.unlockBound=false;this.queue=[];
  this._loadPrefs();this._bindUnlock();ZivoAudioManager.instance=this;
 }
 _loadPrefs(){try{let p=JSON.parse(localStorage.getItem("zivo_audio_settings")||"{}");if(typeof p.volume==="number")this.volume=p.volume;if(typeof p.sfxVolume==="number")this.sfxVolume=p.sfxVolume;if(typeof p.enabled==="boolean")this.enabled=p.enabled}catch{}}
 _save(){try{localStorage.setItem("zivo_audio_settings",JSON.stringify({volume:this.volume,sfxVolume:this.sfxVolume,enabled:this.enabled}))}catch{}}
 _bindUnlock(){if(this.unlockBound)return;this.unlockBound=true;const fn=()=>{this.unlock().catch(()=>{});document.removeEventListener("pointerdown",fn,true);document.removeEventListener("keydown",fn,true);};document.addEventListener("pointerdown",fn,true);document.addEventListener("keydown",fn,true)}
 async unlock(){
  if(!this.ctx){this.ctx=new (window.AudioContext||window.webkitAudioContext)();this.master=this.ctx.createGain();this.master.gain.value=this.enabled?this.volume:0;this.master.connect(this.ctx.destination)}
  if(this.ctx.state==="suspended")await this.ctx.resume();
  while(this.queue.length){const q=this.queue.shift();this.playSfx(q.name,q.opts).catch(()=>{})}
 }
 async transitionAmbient(key){
  if(!this.enabled||!this.tracks[key]||this.ambientKey===key)return;
  await this.unlock();
  const old=this.ambient;
  const a=new Audio(this.tracks[key]);a.loop=true;a.preload="auto";a.volume=0;
  try{await a.play()}catch{this.queue.push({name:"click_light",opts:{}});return}
  this.ambient=a;this.ambientKey=key;
  const start=performance.now(),dur=900;
  const fade=now=>{let t=Math.min(1,(now-start)/dur);if(a)a.volume=Math.min(1,t)*this.volume;if(old)old.volume=Math.max(0,1-t)*this.volume;if(t<1)requestAnimationFrame(fade);else if(old){old.pause();old.src=""}};requestAnimationFrame(fade);
 }
 async playSfx(name,opts={}){
  if(!this.enabled||!this.sfx[name])return;
  const now=performance.now(),gap=opts.minGap??90,last=this.lastSfx.get(name)||-Infinity;if(now-last<gap)return;this.lastSfx.set(name,now);
  await this.unlock();
  const a=new Audio(this.sfx[name]);a.preload="auto";a.volume=Math.max(0,Math.min(1,this.sfxVolume*(opts.volume??1)));
  try{await a.play()}catch{this._synth(name)}
 }
 _synth(name){
  if(!this.ctx||!this.master)return;
  const o=this.ctx.createOscillator(),g=this.ctx.createGain(),t=this.ctx.currentTime;
  const map={click_light:[520,.045],click_heavy:[180,.08],menu_toggle:[330,.07],success_coin:[880,.16],purchase_burn:[120,.12],challenge_win:[660,.28],challenge_fail:[150,.25]};
  const [f,d]=map[name]||[440,.08];o.type=name==="purchase_burn"?"sawtooth":"sine";o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(Math.max(60,f*(name==="challenge_fail"?.55:1.7)),t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.16,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+d+.02)
 }
 setMuted(v){this.enabled=!v;this._save();if(this.master)this.master.gain.value=v?0:this.volume;if(v&&this.ambient){this.ambient.pause()}else if(!v&&this.ambient){this.ambient.play().catch(()=>{})}}
 setVolume(v){this.volume=Math.max(0,Math.min(1,v));if(this.master&&!this.enabled)this.master.gain.value=0;else if(this.master)this.master.gain.value=this.volume;if(this.ambient)this.ambient.volume=this.volume;this._save()}
 toggle(){this.setMuted(this.enabled)}
 isMuted(){return !this.enabled}
}
const mgr=new ZivoAudioManager();
window.ZIVOZONE_AUDIO={AudioManager:mgr,manager:mgr};
window.ZivoAudioManager=ZivoAudioManager;
window.ZIVOZONE=window.ZIVOZONE||{};window.ZIVOZONE.Audio=mgr;

// Global event delegation: works for static and dynamically created elements.
document.addEventListener("click",e=>{
 const el=e.target.closest?.("[data-sfx]");
 if(el){const v=el.getAttribute("data-sfx");if(v==="light")mgr.playSfx("click_light");if(v==="heavy")mgr.playSfx("click_heavy")}
 const ambient=el?.getAttribute("data-ambient");if(ambient)mgr.transitionAmbient(ambient);
},true);
})();