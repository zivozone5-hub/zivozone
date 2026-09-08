/* ============================================================
   ZIVOZONE SPORTS NEWS V8
   Global feeds + dedicated Jordanian football hub.
   Primary Jordan source: Jordan Football Association.
============================================================ */
(() => {
  'use strict';
  const feeds=[
    {sport:'soccer',league:'eng.1',icon:'⚽',name:{ar:'الدوري الإنجليزي',en:'Premier League',zh:'英超',hi:'प्रीमियर लीग',es:'Premier League'}},
    {sport:'soccer',league:'esp.1',icon:'⚽',name:{ar:'الدوري الإسباني',en:'LaLiga',zh:'西甲',hi:'ला लीगा',es:'LaLiga'}},
    {sport:'basketball',league:'nba',icon:'🏀',name:{ar:'NBA',en:'NBA',zh:'NBA',hi:'NBA',es:'NBA'}},
    {sport:'tennis',league:'atp',icon:'🎾',name:{ar:'التنس',en:'Tennis',zh:'网球',hi:'टेनिस',es:'Tenis'}}
  ];
  const jordanSources=[
    {title:{ar:'الاتحاد الأردني لكرة القدم',en:'Jordan Football Association',zh:'约旦足协',hi:'जॉर्डन फुटबॉल संघ',es:'Asociación Jordana de Fútbol'},url:'https://www.jfa.jo/',icon:'🇯🇴'},
    {title:{ar:'بطولات المحترفين',en:'Pro competitions',zh:'职业赛事',hi:'प्रो प्रतियोगिताएं',es:'Competiciones profesionales'},url:'https://www.jfa.jo/category.php?idcat=6&idsubcat=0&po=357&title=Pro-League',icon:'🏆'},
    {title:{ar:'وكالة الأنباء الأردنية',en:'Jordan News Agency',zh:'约旦通讯社',hi:'जॉर्डन समाचार एजेंसी',es:'Agencia de Noticias de Jordania'},url:'https://petra.gov.jo/',icon:'📰'}
  ];
  const esc=s=>{const d=document.createElement('div');d.textContent=String(s??'');return d.innerHTML};
  const locale=l=>l==='ar'?'ar-JO':l==='zh'?'zh-CN':l==='hi'?'hi-IN':l==='es'?'es-ES':'en-US';
  const tr=(key,l)=>window.zivoT?.(key,l)||key;
  async function fetchFeed(f){const url=`https://site.api.espn.com/apis/site/v2/sports/${f.sport}/${f.league}/news`;const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error('news');const d=await r.json();return(d.articles||[]).slice(0,5).map(a=>({headline:a.headline||a.description||'Sports news',description:a.description||'',url:a.links?.web?.href||'https://www.espn.com/',image:a.images?.[0]?.url||'',published:a.published||'',feed:f}))}
  async function load(box,lang='ar'){if(!box)return;box.innerHTML=`<article class="sports-card loading-card"><div class="spinner"></div><h3>${esc(tr('liveNews',lang))}</h3><p>${esc(tr('loader',lang))}</p></article>`;const results=await Promise.allSettled(feeds.map(fetchFeed));let items=[];results.forEach(r=>{if(r.status==='fulfilled')items.push(...r.value)});items.sort((a,b)=>new Date(b.published)-new Date(a.published));items=items.slice(0,12);if(!items.length){box.innerHTML=`<article class="sports-card"><div class="icon">📡</div><h3>${esc(tr('newsUnavailable',lang))}</h3><p>${esc(tr('newsFallback',lang))}</p></article>`;return}box.innerHTML=items.map(x=>{const when=x.published?new Date(x.published).toLocaleString(locale(lang),{dateStyle:'medium',timeStyle:'short'}):'';return `<article class="sports-card news-live-card"><div class="news-live-top"><span class="match-icon">${x.feed.icon}</span><span class="card-tag live-dot">LIVE</span></div><span class="card-tag">${esc(x.feed.name[lang]||x.feed.name.en)}</span><h3>${esc(x.headline)}</h3><p>${esc(x.description).slice(0,180)}</p><small class="muted">${esc(when)}</small><a class="btn btn-ghost" href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${esc(tr('openNews',lang))}</a></article>`}).join('')}
  async function loadJordan(box,lang='ar'){
    if(!box)return;
    box.innerHTML=`<article class="sports-card loading-card"><div class="spinner"></div><h3>🇯🇴 ${esc(tr('jordanFootballNews',lang).replace('🇯🇴 ','').replace('🇯🇴',''))}</h3><p>${esc(tr('loader',lang))}</p></article>`;
    // IMPORTANT: Google News RSS cannot be fetched directly from GitHub Pages
    // because the browser blocks it with CORS. Do not fetch it here.
    // Keep the Jordan hub reliable by using official Jordan sources in-page.
    // A Google News search link is provided as a navigation fallback.
    const official=jordanSources.map(x=>({
      title:x.title[lang]||x.title.en,
      link:x.url,
      pub:'',
      source:'JFA / Petra',
      icon:x.icon
    }));
    const q=encodeURIComponent('كرة القدم الأردنية OR الاتحاد الأردني لكرة القدم');
    official.push({
      title: lang==='ar' ? 'آخر أخبار كرة القدم الأردنية' :
             lang==='zh' ? '约旦足球最新新闻' :
             lang==='hi' ? 'जॉर्डन फुटबॉल की ताज़ा खबरें' :
             lang==='es' ? 'Últimas noticias del fútbol jordano' :
             'Latest Jordanian football news',
      link:`https://news.google.com/search?q=${q}&hl=ar&gl=JO&ceid=JO%3Aar`,
      pub:'',
      source:'Google News',
      icon:'📰'
    });
    let items=official;
    box.innerHTML=items.map(x=>`<article class="sports-card jordan-news-card"><div class="news-live-top"><span class="match-icon">${x.icon||'🇯🇴'}</span><span class="card-tag">${esc(x.source||'Jordan Football')}</span></div><h3>${esc(x.title)}</h3>${x.pub?`<small class="muted">${esc(new Date(x.pub).toLocaleString(locale(lang),{dateStyle:'medium',timeStyle:'short'}))}</small>`:''}<a class="btn btn-ghost" href="${esc(x.link)}" target="_blank" rel="noopener noreferrer">${esc(tr('openNews',lang))}</a></article>`).join('');
  }
  window.ZIVOZONE_NEWS={load,loadJordan};
})();
