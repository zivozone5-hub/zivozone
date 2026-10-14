(()=>{"use strict";
const A=()=>window.ZIVOZONE_AUDIO?.AudioManager;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let stories=null;
async function getStories(){if(stories)return stories;try{stories=await fetch("/data/stories/story-engine-56.json",{cache:"no-store"}).then(r=>r.json())}catch{stories=[]}return stories}
function root(){let e=document.getElementById("zivo-real-room");if(!e){e=document.createElement("div");e.id="zivo-real-room";document.body.appendChild(e)}return e}
function close(){const e=root();e.classList.remove("show");e.innerHTML="";document.body.classList.remove("zivo-room-lock");try{history.pushState({}, "", location.pathname+location.search)}catch{}}
function frame(inner,cls=""){const e=root();e.className="show "+cls;e.innerHTML=inner;document.body.classList.add("zivo-room-lock");return e}
async function enter(kind){
 const e=frame(`<div class="zr-entry ${kind}"><div class="zr-entry-glow"></div><div class="zr-entry-content"><div class="zr-kicker">ZIVO AI • PRIVATE ARCHIVE</div><h1>${kind==="stories"?"غرفة القصص":"صحتك بالدنيا"}</h1><p>${kind==="stories"?"الباب مغلق… والقصص في الداخل تنتظر من يفتحه.":"هناك معرفة كثيرة خلف هذه الأبواب… ادخل وابدأ رحلتك."}</p><button id="zr-enter-btn">فتح الباب</button><button id="zr-exit-btn" class="secondary">العودة للموقع</button></div></div>`);
 document.getElementById("zr-enter-btn").onclick=()=>kind==="stories"?openStories():openHealth();
 document.getElementById("zr-exit-btn").onclick=close;
 try{await A()?.unlock();await A()?.playSfx("menu_toggle");await A()?.transitionAmbient(kind==="stories"?"horror":"science")}catch{}
}
async function openStories(){
 const data=await getStories();
 const e=frame(`<div class="zr-room"><button class="zr-x" id="zr-close">×</button><header><div class="zr-kicker">ARCHIVE 56</div><h1>غرفة القصص</h1><p>اختر قصة لفتحها.</p></header><div class="zr-grid">${data.map(s=>`<button class="zr-card" data-story="${esc(s.id)}"><span>${esc(s.genre||"قصة")}</span><strong>${esc(s.title)}</strong><em>${esc(s.intro||"قصة طويلة متعددة الفصول")}</em><b>فتح القصة ⟶</b></button>`).join("")}</div></div>`);
 document.getElementById("zr-close").onclick=close;
 e.querySelectorAll("[data-story]").forEach(b=>b.onclick=()=>openStory(b.dataset.story));
}
async function openStory(id){
 const data=await getStories(),s=data.find(x=>x.id===id);if(!s)return;
 const manuscript=s.content||s.intro||"";
 const e=frame(`<div class="zr-room"><button class="zr-x" id="zr-close">×</button><article class="zr-reader"><div class="zr-kicker">${esc(s.genre)} • القصة ${s.number}/56</div><h1>${esc(s.title)}</h1><div class="zr-divider"></div><div class="zr-story-body">${esc(manuscript).replace(/\n/g,"<br>")}</div><button id="zr-back">← العودة إلى مكتبة القصص</button></article></div>`);
 document.getElementById("zr-close").onclick=close;document.getElementById("zr-back").onclick=openStories;try{await A()?.playSfx("click_light")}catch{}
}
async function openHealth(){
 const doors=[["01","النوم","استعد طاقتك… قبل أن تطلبها من جسدك"],["02","التغذية والطعام","جسمك لا يلعب بما تأكله… لكنه يتأثر به"],["03","الرياضة واللياقة","الجسم الذي يتحرك… يتعلم"],["04","الوزن والطول","الأرقام تخبرك شيئًا… لكنها لا تخبرك كل شيء"],["05","العمر ومراحل الحياة","كل مرحلة لها احتياجاتها"],["06","الصحة النفسية","العقل جزء من الفريق"],["07","العناية بالجسم","الجسم الرياضي يحتاج عناية… وليس تدريبًا فقط"],["08","الإصابات والتعافي","الإصابة ليست نهاية الطريق"],["09","الصحة الاحترافية","عندما تتحول الرياضة إلى أسلوب حياة"],["10","الوقاية والفحوصات","اكتشف المشكلة قبل أن تكبر"],["11","صحة الأسرة","الفريق يبدأ من البيت"],["12","أخبار الصحة والمعرفة","المعلومة الصحية تتغير… فلا تصدق كل ما تسمع"]];
 const e=frame(`<div class="zr-room health"><button class="zr-x" id="zr-close">×</button><header><div class="zr-kicker">ZIVO HEALTH ARCHIVE • صحتك بالدنيا</div><h1>صحتك بالدنيا</h1><p>افتح الباب الذي تريد الدخول إليه.</p></header><div class="zr-grid">${doors.map(d=>`<button class="zr-card health-card" data-door="${d[0]}"><span>باب ${d[0]}</span><strong>${d[1]}</strong><em>${d[2]}</em><b>فتح الباب ⟶</b></button>`).join("")}</div></div>`);
 document.getElementById("zr-close").onclick=close;e.querySelectorAll("[data-door]").forEach(b=>b.onclick=()=>healthDoor(b.dataset.door));
}
async function healthDoor(id){
 let doors=[];try{doors=await fetch("/data/health/health-doors.json",{cache:"no-store"}).then(r=>r.json())}catch{}
 const item=doors.find(x=>x.id===String(id));
 const title=item?.title||"باب الصحة";
 const content=item?.content||"تعذر تحميل محتوى هذا الباب.";
 const e=frame(`<div class="zr-room health"><button class="zr-x" id="zr-close">×</button><article class="zr-reader"><div class="zr-kicker">ZIVO HEALTH • ${id}/12</div><h1>${esc(title)}</h1><div class="zr-divider"></div><div class="zr-health-text">${esc(content).replace(/\n/g,"<br>")}</div><button id="zr-back">← العودة إلى أبواب صحتك بالدنيا</button></article></div>`);
 document.getElementById("zr-close").onclick=close;
 document.getElementById("zr-back").onclick=openHealth;
 try{await A()?.playSfx("click_light")}catch{}
}
window.ZIVOZONE=window.ZIVOZONE||{};
window.ZIVOZONE.RealRooms={enter,openStories,openHealth,openStory,healthDoor,close};
document.addEventListener("click",e=>{
 const b=e.target.closest?.("[data-zivo-room],[data-zivo-story-room],[data-zivo-health-room]");
 if(!b)return;e.preventDefault();e.stopImmediatePropagation();
 const kind=b.dataset.zivoRoom || (b.hasAttribute("data-zivo-story-room") ? "stories" : "health");
 enter(kind);
},true);
window.addEventListener("popstate",close);
})();