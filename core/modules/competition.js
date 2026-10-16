/* ZIVOZONE V1180 — Competition migrated from V33
   V1230.51 — complete() was exported but never called by anything else in the codebase: the streak
   logic, reward math and claim-gating below were all real and correct, but nothing in the real site
   ever marked a day "completed," so this panel always showed a locked claim button and its
   "start today's challenge to build the streak" message regardless of how active the player
   actually was — while the player-hub home screen's own streak number came from the unrelated, real
   player.js streak, making
   the contradiction visible (a nonzero streak outside, a stuck-at-zero one inside this panel). Now
   wired from challenges.js: finishing today's real Daily Challenge without timing out calls
   complete() here, matching this panel's own existing copy exactly. */
(() => {'use strict';const KEY='zivozone_v33_competition',read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(_){return{}}},write=v=>{try{localStorage.setItem(KEY,JSON.stringify(v))}catch(_){}},day=()=>new Date().toISOString().slice(0,10);
// V1230.101 — this file used to track its OWN separate day-streak counter (s.streak, built from
// s.days) alongside player.js's real one, which is the number player-hub.js's home screen and the
// new header badge both show. The two could disagree — exactly the contradiction the V1230.51 note
// above already flagged ("a nonzero streak outside, a stuck-at-zero one inside this panel") but
// never actually resolved, because complete() kept computing its own number instead of reading the
// real one. Fixed by making this panel read player.js's streak directly — one source of truth —
// and keeping s.days/s.week here only for what they're actually for: this week's completed-days
// progress bar, a different, legitimate thing from the streak number itself.
// V1230.106 — this entire modal was hardcoded Arabic literals, so it showed Arabic regardless of the
// site's selected language (unlike the rest of the Player Journey hub it's opened from). Routed
// through the same t() helper every other module uses; see i18n.js's "competition*" keys.
const t=k=>{try{return window.zivoT?window.zivoT(k):(window.ZIVOZONE_I18N?.tr?.(k)||k)}catch(_){return k}};
const realStreak=()=>Number(window.ZIVOZONE?.Player?.get?.()?.streak)||0;
function state(){const s=read();return s.date===day()?s:{date:day(),completed:false,days:s.days||[],week:{},claimed:false}}
function complete(){const s=state();if(s.completed)return s;s.days=Array.from(new Set([...(s.days||[]),day()])).slice(-30);const wk=day().slice(0,7);s.week=s.week||{};s.week[wk]=(Number(s.week[wk])||0)+1;s.completed=true;s.claimed=false;
  // V1230.101 — reads the REAL streak, not this file's old counter. challenges.js calls complete()
  // right after dispatching 'zivozone-result' (synchronous listeners, so player.js's addProgress()
  // has already bumped today's streak by the time this runs) — see that file's matching note.
  const streak=realStreak();s.xpReward=25+Math.min(streak*5,75);s.zivoReward=1+(streak>=7?4:0);write(s);return s}
async function claim(){const s=state();if(!s.completed||s.claimed)return s;const ok=await window.ZIVOZONE?.Economy?.credit?.(s.zivoReward,{type:'competition_reward',source:'competition',competition:day(),claimId:`competition_${day()}`});if(!ok)return s;s.claimed=true;write(s);await window.ZIVOZONE?.Economy?.addXP?.(s.xpReward);window.dispatchEvent(new CustomEvent('zivozone-reward',{detail:{xp:s.xpReward,zivo:s.zivoReward,source:'competition'}}));return s}
function applyStatic(o){o.querySelector('h2').textContent=t('competitionModalTitle');o.querySelector('.v33-top>div>span').textContent=t('competitionModalSubtitle');const subs=o.querySelectorAll('.v33-grid>div>span');if(subs[0])subs[0].textContent=t('consecutiveDaysWord');if(subs[1])subs[1].textContent=t('competitionXpRewardNote');if(subs[2])subs[2].textContent=t('competitionZivoRewardNote')}
function open(){let o=document.getElementById('zivo-competition');if(!o){o=document.createElement('div');o.id='zivo-competition';o.className='v33-overlay';o.innerHTML='<div class="v33-card"><button class="v33-close">×</button><div class="v33-top"><div class="v33-orb">Z</div><div><small>COMPETITION SEASON</small><h2></h2><span></span></div></div><div class="v33-grid"><div><small>STREAK</small><b id="zivo-comp-streak">0</b><span></span></div><div><small>XP REWARD</small><b id="zivo-comp-xp">25</b><span></span></div><div><small>ZIVO</small><b id="zivo-comp-zivo">1</b><span></span></div></div><div class="v33-progress"><div class="v33-bar"><i id="zivo-comp-fill"></i></div><span id="zivo-comp-week"></span></div><div class="v33-message" id="zivo-comp-message"></div><button id="zivo-comp-claim"></button></div>';document.body.appendChild(o);applyStatic(o);o.querySelector('.v33-close').onclick=()=>o.classList.remove('open');o.querySelector('#zivo-comp-claim').onclick=async()=>{const s=await claim();render(s)};document.addEventListener('keydown',e=>{if(e.key==='Escape'&&o.classList.contains('open'))o.classList.remove('open')})}render();o.classList.add('open')}
function render(s=state()){const o=document.getElementById('zivo-competition');if(!o)return;const wk=(s.days||[]).filter(d=>d.slice(0,7)===day().slice(0,7)).length;const streak=realStreak();const streakEl=o.querySelector('#zivo-comp-streak');streakEl.textContent=streak;
  // V1230.101 — purely visual 30-day milestone (a gold glow + flame on the streak number itself):
  // no new currency amount, so it needs no change to economy.js's reward allow-list or to
  // firestore.rules — both would need a live Firebase/emulator to verify safely, which this
  // sandbox doesn't have. A cosmetic milestone delivers real "you made it" payoff with zero risk.
  streakEl.parentElement.classList.toggle('v33-milestone',streak>=30);
  o.querySelector('#zivo-comp-xp').textContent=s.completed?s.xpReward||25:25;o.querySelector('#zivo-comp-zivo').textContent=s.completed?s.zivoReward||1:1;o.querySelector('#zivo-comp-fill').style.width=Math.min(100,wk/7*100)+'%';o.querySelector('#zivo-comp-week').textContent=t('competitionWeekProgressFmt').replace('{n}',wk);o.querySelector('#zivo-comp-message').textContent=s.completed?(s.claimed?t('competitionMsgClaimed'):t('competitionMsgCompleteThenClaim')):t('competitionMsgStart');o.querySelector('#zivo-comp-claim').textContent=t('competitionClaimBtn');o.querySelector('#zivo-comp-claim').disabled=!s.completed||s.claimed}
window.ZIVOZONE=window.ZIVOZONE||{};window.ZIVOZONE.Competition=Object.freeze({state,complete,claim,open,render});
// V1230.106 — same live-refresh pattern achievements.js/leaderboard.js/economy.js already use: if the
// player switches language while this modal happens to be open (no page reload on a language switch),
// the static markup above would otherwise never update again.
window.addEventListener('zivozone-language',()=>{const o=document.getElementById('zivo-competition');if(!o)return;applyStatic(o);render()});
})();
