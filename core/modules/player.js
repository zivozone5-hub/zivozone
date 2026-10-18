/* ZIVOZONE V1180 — Canonical Player Core
   Migrates V30 + V35 into one in-site Player/Progress service. */
(() => {
  'use strict';
  const ID_KEY='zivozone_v30_identity';
  const PROGRESS_KEY='zivozone_v35_progress';
  const read=(k,f={})=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch(_){return f}};
  const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(_){return false}};
  // V1230.52 — the default player name was hardcoded Arabic ('لاعب ZIVO') regardless of the
  // player's chosen language; player-hub.js's own strings are now fully translated (see
  // i18n.js V1230.52), but this fallback fed straight into that panel and stayed Arabic even in
  // English, undoing the fix. achDefaultPlayerName already exists translated in all 7 languages
  // (used by achievements.js's share()), so this reuses it instead of adding a duplicate key.
  const t=k=>{try{return window.zivoT?window.zivoT(k):(window.ZIVOZONE_I18N?.tr?.(k)||k)}catch(_){return k}};
  const defaultName=()=>t('achDefaultPlayerName');
  const clean=s=>String(s||defaultName()).replace(/[<>"'`]/g,'').trim().slice(0,24)||defaultName();
  const user=()=>{try{return window.firebase?.auth?.()?.currentUser||null}catch(_){return null}};
  const day=()=>new Date().toISOString().slice(0,10);
  const state=()=>{let s=read(PROGRESS_KEY,{});if(!s.version)s={version:1,xp:0,level:1,played:0,correct:0,streak:0,bestStreak:0,lastDay:null,bestScore:0,history:[]};if(s.bestStreak===undefined)s.bestStreak=Number(s.streak)||0;return s};
  const levelFor=x=>Math.max(1,Math.floor(Math.sqrt(Math.max(0,x)/100))+1);
  // V1230.87 — every local progress change also (debounced, logged-in only) pushes to Firestore via
  // Auth.syncProgress(), which is what keeps the public leaderboard and a returning player's XP on a
  // different device in sync. Debounced so several rewards firing close together (e.g. an epic-room
  // clear's addXP call right after a challenge's addProgress call) coalesce into one write instead
  // of two, which also keeps each write's delta comfortably inside firestore.rules' per-write cap.
  let syncTimer=null;
  function pushSync(s){
    try{
      if(!window.ZIVOZONE?.Auth?.isLoggedIn?.())return;
      clearTimeout(syncTimer);
      syncTimer=setTimeout(()=>{
        window.ZIVOZONE?.Auth?.syncProgress?.({xp:s.xp,level:s.level,streak:s.streak,bestStreak:Math.max(Number(s.bestStreak)||0,Number(s.streak)||0),gamesPlayed:s.played,bestScore:s.bestScore});
      },1500);
    }catch(_){}
  }
  function addXP(amount=0){const s=state();s.xp=Math.max(0,s.xp+Math.max(0,Number(amount)||0));s.level=levelFor(s.xp);write(PROGRESS_KEY,s);window.dispatchEvent(new CustomEvent('zivozone-xp',{detail:{xp:Number(amount)||0}}));pushSync(s);return s;}
  function addProgress(xp=0,correct=0,score=0){
    const s=state(),d=day();
    if(s.lastDay!==d){const y=new Date(d+'T00:00:00');y.setUTCDate(y.getUTCDate()-1);const yd=y.toISOString().slice(0,10);s.streak=s.lastDay===yd?s.streak+1:1;s.lastDay=d;}
    s.bestStreak=Math.max(Number(s.bestStreak)||0,s.streak);
    s.xp=Math.max(0,s.xp+Math.max(0,Number(xp)||0));s.played++;s.correct+=Math.max(0,Number(correct)||0);s.bestScore=Math.max(Number(s.bestScore)||0,Number(score)||0);s.level=levelFor(s.xp);s.history=(s.history||[]).slice(-19);s.history.push({date:d,xp:s.xp,level:s.level});write(PROGRESS_KEY,s);window.dispatchEvent(new CustomEvent('zivozone-progress',{detail:{xp:Number(xp)||0,correct:Number(correct)||0,score:Number(score)||0}}));pushSync(s);return s;
  }
  // V1230.87 — called once right after login (see auth.js's onAuthStateChanged) with the cloud
  // players/{uid} doc. Takes the MAX of each field between this device's local state and the
  // cloud's, so logging into a fresh browser adopts real progress instead of starting at zero, and
  // neither side is ever silently regressed by the other.
  function hydrateFromCloud(cloud){
    if(!cloud)return;
    try{
      const s=state();
      const next={...s,
        xp:Math.max(Number(s.xp)||0,Number(cloud.xp)||0),
        streak:Math.max(Number(s.streak)||0,Number(cloud.streak)||0),
        bestStreak:Math.max(Number(s.bestStreak)||0,Number(cloud.bestStreak)||0,Number(cloud.streak)||0),
        played:Math.max(Number(s.played)||0,Number(cloud.gamesPlayed)||0),
        bestScore:Math.max(Number(s.bestScore)||0,Number(cloud.bestScore)||0)
      };
      next.level=levelFor(next.xp);
      write(PROGRESS_KEY,next);
      renderMain();
    }catch(_){}
  }
  const challengeStats=()=>read(ID_KEY,{}).challengeStats||{};
  // V1230.129 — avatar is stored alongside name/challengeStats in the identity store (ID_KEY), not
  // the numeric progress store, since it's a cosmetic self-profile pick rather than game progress.
  // Cloud sync reuses Auth.update() (already strips economy-critical keys) so this one call is the
  // whole write path; firestore.rules' validProfileUpdate() is the matching server-side allowlist.
  function setAvatar(id){const old=read(ID_KEY,{});old.avatar=String(id||'').replace(/[^a-z0-9_]/gi,'').slice(0,32);old.name=old.name||defaultName();write(ID_KEY,old);try{window.ZIVOZONE?.Auth?.update?.({avatar:old.avatar})}catch(_){}window.dispatchEvent(new CustomEvent('zivozone-avatar',{detail:{avatar:old.avatar}}));return old.avatar;}
  // V1230.130 — football-levels.js's 20-level progression. footballLevel = highest level CLEARED
  // (0..20, not the level currently being attempted); footballCards = unused "level protection
  // cards" in inventory. Same identity-store + Auth.update() sync path as setAvatar() just above —
  // low-stakes client-trusted progress, not the ZIVO balance itself (that's economy.js's
  // server-verified wallet). firestore.rules' validProfileUpdate() is the matching allowlist.
  function getFootballProgress(){const old=read(ID_KEY,{});return{level:Math.max(0,Math.min(20,Number(old.footballLevel)||0)),cards:Math.max(0,Number(old.footballCards)||0)};}
  function setFootballLevel(n){const old=read(ID_KEY,{});old.footballLevel=Math.max(0,Math.min(20,Number(n)||0));old.name=old.name||defaultName();write(ID_KEY,old);try{window.ZIVOZONE?.Auth?.update?.({footballLevel:old.footballLevel})}catch(_){}return old.footballLevel;}
  function setFootballCards(n){const old=read(ID_KEY,{});old.footballCards=Math.max(0,Number(n)||0);old.name=old.name||defaultName();write(ID_KEY,old);try{window.ZIVOZONE?.Auth?.update?.({footballCards:old.footballCards})}catch(_){}return old.footballCards;}
  function record(d={}){const old=read(ID_KEY,{}),all=challengeStats(),key=String(d.challenge||'general').slice(0,60),q=all[key]||{games:0,correct:0,total:0,best:0};q.games++;q.correct+=Number(d.correct)||0;q.total+=Number(d.total)||0;q.best=Math.max(q.best,Number(d.score)||0);all[key]=q;old.challengeStats=all;old.name=old.name||defaultName();write(ID_KEY,old);return q;}
  function get(){const p=state(),old=read(ID_KEY,{}),u=user(),wallet=window.ZIVOZONE?.Economy?.getWallet?.()||{};const out={...old,name:clean(u?.displayName||old.name),level:Number(p.level)||1,xp:Number(p.xp)||0,games:Number(p.played??p.games)||0,balance:Number(wallet.zivo)||Number(old.balance)||0,bestScore:Number(p.bestScore)||0,streak:Number(p.streak)||0,challengeStats:challengeStats(),history:Array.isArray(p.history)?p.history:[]};publishState(out);return out;}
  function renderMain(){const s=get();const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=String(v)};set('profile-name',s.name||'زائر');set('profile-email',user()?.email||'يمكنك اللعب كزائر ثم إنشاء حساب لحفظ تقدمك.');set('profile-level',s.level);set('profile-xp',s.xp);set('profile-coins',s.balance);set('profile-wins',s.games);set('profile-best-streak',s.streak);const bar=document.getElementById('xp-progress');if(bar){const base=(s.level-1)*100,next=s.level*100;bar.style.width=Math.min(100,Math.max(0,((s.xp-base)/(next-base))*100))+'%';}}
  // V1230.51 — same reasoning as economy.js's lastAnnouncedZivo: publishState() runs on every single
  // Player.get() call (every challenges-grid render, every achievements render, etc.), so emitting
  // PLAYER_UPDATED unconditionally would fire constantly with nothing new to say. Gated on the 4
  // numbers player-hub.js's UI actually shows, so it fires only when one of them really moved.
  let lastAnnouncedSig=null;
  function publishState(p){
    try{
      const data={
        name:clean(p?.name),
        level:Math.max(1,Number(p?.level)||1),
        xp:Math.max(0,Number(p?.xp)||0),
        games:Math.max(0,Number(p?.games)||0),
        balance:Math.max(0,Number(p?.balance)||0),
        bestScore:Math.max(0,Number(p?.bestScore)||0),
        streak:Math.max(0,Number(p?.streak)||0),
        history:Array.isArray(p?.history)?p.history:[],
        challengeStats:p?.challengeStats&&typeof p.challengeStats==='object'?p.challengeStats:{},
        avatar:p?.avatar?String(p.avatar).slice(0,32):''
      };
      window.ZIVOZONE?.State?.set?.('playerData',data);
      const sig=`${data.level}|${data.xp}|${data.games}|${data.bestScore}`;
      if(lastAnnouncedSig!==null&&lastAnnouncedSig!==sig)window.ZIVOZONE?.Events?.emit?.('PLAYER_UPDATED',{level:data.level,xp:data.xp});
      lastAnnouncedSig=sig;
      return data;
    }catch(_){ return p||{}; }
  }

  window.ZIVOZONE=window.ZIVOZONE||{};
  // V1230.19 — removed the dead ZIVOZONE.Progress alias (zero callers anywhere; everything already
  // uses ZIVOZONE.Player, which already exposes the same state/addProgress/levelFor under its real
  // name via `progress:state`). Same class of unused shadow-alias as ui.js's ZIVOZONE.UI, removed for
  // the same reason.
  window.ZIVOZONE.Player=Object.freeze({get,state,progress:state,levelFor,addProgress,addXP,record,stats:challengeStats,render:renderMain,sanitizeName:clean,hydrateFromCloud,setAvatar,getFootballProgress,setFootballLevel,setFootballCards});
  window.addEventListener('zivozone-result',e=>{const d=e.detail||{};if(d.__coreProgressApplied)return;d.__coreProgressApplied=true;addProgress(Number(d.xp)||Math.max(0,(Number(d.correct)||0)*10),Number(d.correct)||0,Number(d.score)||0);record(d);});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',renderMain);else renderMain();
})();
