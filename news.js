/* ZIVOZONE LIVE SPORTS NEWS
   Uses public ESPN site APIs from the browser; no API key is required for these feeds.
*/
(() => {
  'use strict';
  const feeds=[
    {sport:'soccer',league:'eng.1',icon:'⚽',name:{ar:'كرة القدم',en:'Football',zh:'足球',hi:'फुटबॉल',es:'Fútbol'}},
    {sport:'soccer',league:'esp.1',icon:'⚽',name:{ar:'الدوري الإسباني',en:'LaLiga',zh:'西甲',hi:'ला लीगा',es:'LaLiga'}},
    {sport:'basketball',league:'nba',icon:'🏀',name:{ar:'NBA',en:'NBA',zh:'NBA',hi:'NBA',es:'NBA'}},
    {sport:'football',league:'nfl',icon:'🏈',name:{ar:'NFL',en:'NFL',zh:'NFL',hi:'NFL',es:'NFL'}},
    {sport:'tennis',league:'atp',icon:'🎾',name:{ar:'التنس',en:'Tennis',zh:'网球',hi:'टेनिस',es:'Tenis'}}
  ];
  const esc=s=>{const d=document.createElement('div');d.textContent=String(s??'');return d.innerHTML};
  function tr(key,lang){return window.zivoT?.(key,lang)||key}
  async function fetchFeed(f){
    const url=`https://site.api.espn.com/apis/site/v2/sports/${f.sport}/${f.league}/news`;
    const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error('news');const d=await r.json();
    return (d.articles||[]).slice(0,5).map(a=>({headline:a.headline||a.description||'Sports news',description:a.description||'',url:a.links?.web?.href||'https://www.espn.com/',image:a.images?.[0]?.url||'',published:a.published||'',feed:f}));
  }
  async function load(box,lang='ar'){
    if(!box)return;box.innerHTML=`<article class="sports-card loading-card"><div class="spinner"></div><h3>${esc(tr('liveNews',lang))}</h3><p>${esc(tr('loader',lang))}</p></article>`;
    const results=await Promise.allSettled(feeds.map(fetchFeed));let items=[];results.forEach(r=>{if(r.status==='fulfilled')items.push(...r.value)});
    items.sort((a,b)=>new Date(b.published)-new Date(a.published));items=items.slice(0,12);
    if(!items.length){box.innerHTML=`<article class="sports-card"><div class="icon">📡</div><h3>${esc(tr('newsUnavailable',lang))}</h3><p>${esc(tr('newsFallback',lang))}</p></article>`;return;}
    box.innerHTML=items.map(x=>{const when=x.published?new Date(x.published).toLocaleString(lang==='ar'?'ar-JO':lang==='zh'?'zh-CN':lang==='hi'?'hi-IN':lang==='es'?'es-ES':'en-US',{dateStyle:'medium',timeStyle:'short'}):'';return `<article class="sports-card news-live-card"><div class="news-live-top"><span class="match-icon">${x.feed.icon}</span><span class="card-tag live-dot">LIVE</span></div><span class="card-tag">${esc(x.feed.name[lang]||x.feed.name.en)}</span><h3>${esc(x.headline)}</h3><p>${esc(x.description).slice(0,180)}</p><small class="muted">${esc(when)}</small><a class="btn btn-ghost" href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${esc(tr('openNews',lang))}</a></article>`}).join('');
  }
  window.ZIVOZONE_NEWS={load};
})();
