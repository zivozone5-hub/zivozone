/* ZIVOZONE V1226 — defensive Match Center with static-date fallback */
(() => {
  "use strict";
  const VERSION = "1230.45";
  const API = "https://site.api.espn.com/apis/site/v2/sports/soccer/";
  const STATIC = "./data/matches/";
  const INDEX_URL = "./data/matches/index.json";
  const TZ = "Asia/Amman";
  const LANG = () => document.documentElement.lang || 'ar';
  const text = v => { if (typeof v === 'string') return v; if (v && typeof v === 'object') return v[LANG()] || v.ar || v.en || Object.values(v)[0] || ''; return String(v ?? ''); };
  const LOCALE = { ar:'ar-JO', en:'en-US', zh:'zh-CN', hi:'hi-IN', es:'es-ES', fr:'fr-FR', fa:'fa-IR' };
  const loc = () => LOCALE[LANG()] || 'ar-JO';
  const UI = {
    dayYesterday: {ar:"أمس",en:"Yesterday",zh:"昨天",hi:"बीता कल",es:"Ayer",fr:"Hier",fa:"دیروز"},
    dayToday: {ar:"اليوم",en:"Today",zh:"今天",hi:"आज",es:"Hoy",fr:"Aujourd'hui",fa:"امروز"},
    dayTomorrow: {ar:"غدًا",en:"Tomorrow",zh:"明天",hi:"आने वाला कल",es:"Mañana",fr:"Demain",fa:"فردا"},
    statusLive: {ar:"مباشر الآن",en:"Live now",zh:"正在直播",hi:"अभी लाइव",es:"En vivo ahora",fr:"En direct",fa:"هم‌اکنون زنده"},
    statusFinished: {ar:"انتهت",en:"Finished",zh:"已结束",hi:"समाप्त",es:"Finalizado",fr:"Terminé",fa:"پایان‌یافته"},
    statusPostponed: {ar:"مؤجلة",en:"Postponed",zh:"延期",hi:"स्थगित",es:"Postergado",fr:"Reporté",fa:"به‌تعویق‌افتاده"},
    statusUpcoming: {ar:"موعد المباراة",en:"Match time",zh:"比赛时间",hi:"मैच का समय",es:"Hora del partido",fr:"Heure du match",fa:"زمان بازی"},
    liveBadge: {ar:"🔴 مباشر الآن",en:"🔴 Live now",zh:"🔴 正在直播",hi:"🔴 अभी लाइव",es:"🔴 En vivo ahora",fr:"🔴 En direct",fa:"🔴 هم‌اکنون زنده"},
    finalScoreLabel: {ar:"النتيجة النهائية",en:"Final score",zh:"最终比分",hi:"अंतिम स्कोर",es:"Resultado final",fr:"Score final",fa:"نتیجه نهایی"},
    kickoffLabel: {ar:"ركلة البداية",en:"Kickoff",zh:"开球时间",hi:"किकऑफ़",es:"Saque inicial",fr:"Coup d'envoi",fa:"شروع بازی"},
    liveClockFallback: {ar:"مباشر",en:"Live",zh:"直播中",hi:"लाइव",es:"En vivo",fr:"En direct",fa:"زنده"},
    matchDetailsCta: {ar:"تفاصيل المباراة ←",en:"Match details ←",zh:"比赛详情 ←",hi:"मैच विवरण ←",es:"Detalles del partido ←",fr:"Détails du match ←",fa:"جزئیات بازی ←"},
    latestRoundPrefix: {ar:"نتائج الجولة الأخيرة",en:"Latest available round",zh:"最近一轮结果",hi:"नवीनतम उपलब्ध दौर",es:"Última jornada disponible",fr:"Dernière journée disponible",fa:"آخرین دور موجود"},
    fallbackNotice: {ar:"نتائج الجولة الأخيرة — تعذر العثور على ملف مباريات اليوم، فتم عرض آخر ملف متاح.",en:"Latest available round — today's match file could not be found, so the most recent available file is shown.",zh:"最近一轮结果——未能找到今日比赛文件，因此显示最新的可用文件。",hi:"नवीनतम उपलब्ध दौर — आज की मैच फ़ाइल नहीं मिली, इसलिए सबसे हाल की उपलब्ध फ़ाइल दिखाई गई है।",es:"Última jornada disponible — no se pudo encontrar el archivo de partidos de hoy, por lo que se muestra el archivo más reciente disponible.",fr:"Dernière journée disponible — le fichier des matchs d'aujourd'hui n'a pas été trouvé, le fichier le plus récent disponible est donc affiché.",fa:"آخرین دور موجود — فایل بازی‌های امروز پیدا نشد، بنابراین آخرین فایل موجود نمایش داده شد."},
    leagueDaysSubtitle: {ar:"مباريات الأمس واليوم والغد",en:"Yesterday, today and tomorrow's matches",zh:"昨天、今天和明天的比赛",hi:"कल, आज और आने वाले कल के मैच",es:"Partidos de ayer, hoy y mañana",fr:"Matchs d'hier, d'aujourd'hui et de demain",fa:"بازی‌های دیروز، امروز و فردا"},
    heroEyebrow: {ar:"⚽ مركز كرة القدم العالمي",en:"⚽ Global Football Center",zh:"⚽ 全球足球中心",hi:"⚽ ग्लोबल फुटबॉल सेंटर",es:"⚽ Centro Mundial de Fútbol",fr:"⚽ Centre Mondial du Football",fa:"⚽ مرکز جهانی فوتبال"},
    heroTitle: {ar:"مركز المباريات",en:"Match Center",zh:"赛事中心",hi:"मैच सेंटर",es:"Centro de Partidos",fr:"Centre des Matchs",fa:"مرکز بازی‌ها"},
    heroText: {ar:"كل بطولة في قسم مستقل، ومباريات الأمس واليوم والغد في مكان واحد.",en:"Every league in its own section, with yesterday's, today's and tomorrow's matches all in one place.",zh:"每个联赛都有独立板块，昨天、今天和明天的比赛都集中在一处。",hi:"हर लीग अपने अलग सेक्शन में, और कल, आज और आने वाले कल के मैच एक ही जगह।",es:"Cada liga en su propia sección, con los partidos de ayer, hoy y mañana en un solo lugar.",fr:"Chaque championnat dans sa propre section, avec les matchs d'hier, d'aujourd'hui et de demain réunis au même endroit.",fa:"هر لیگ در بخش جداگانه خودش، و بازی‌های دیروز، امروز و فردا در یک مکان."},
    leagueSelectMajor: {ar:"⭐ البطولات الكبرى",en:"⭐ Major leagues",zh:"⭐ 主要联赛",hi:"⭐ प्रमुख लीग",es:"⭐ Ligas principales",fr:"⭐ Grands championnats",fa:"⭐ لیگ‌های بزرگ"},
    leagueSelectAll: {ar:"🌍 كل البطولات المتاحة",en:"🌍 All available leagues",zh:"🌍 所有可用联赛",hi:"🌍 सभी उपलब्ध लीग",es:"🌍 Todas las ligas disponibles",fr:"🌍 Tous les championnats disponibles",fa:"🌍 همه لیگ‌های موجود"},
    statusSelectAll: {ar:"كل الحالات",en:"All statuses",zh:"所有状态",hi:"सभी स्थितियाँ",es:"Todos los estados",fr:"Tous les statuts",fa:"همه وضعیت‌ها"},
    statusSelectLive: {ar:"🔴 مباشر",en:"🔴 Live",zh:"🔴 直播",hi:"🔴 लाइव",es:"🔴 En vivo",fr:"🔴 En direct",fa:"🔴 زنده"},
    statusSelectUpcoming: {ar:"قادمة",en:"Upcoming",zh:"即将开始",hi:"आने वाले",es:"Próximos",fr:"À venir",fa:"پیش‌رو"},
    searchPlaceholder: {ar:"ابحث عن فريق أو بطولة",en:"Search for a team or league",zh:"搜索球队或联赛",hi:"टीम या लीग खोजें",es:"Busca un equipo o liga",fr:"Rechercher une équipe ou un championnat",fa:"جست‌وجوی تیم یا لیگ"},
    refreshBtn: {ar:"🔄 تحديث",en:"🔄 Refresh",zh:"🔄 刷新",hi:"🔄 रीफ़्रेश",es:"🔄 Actualizar",fr:"🔄 Actualiser",fa:"🔄 بروزرسانی"},
    kpiLoaded: {ar:"مباراة محملة",en:"Matches loaded",zh:"已加载比赛",hi:"लोड किए गए मैच",es:"Partidos cargados",fr:"Matchs chargés",fa:"بازی‌های بارگذاری‌شده"},
    emptyTitle: {ar:"لا توجد مباريات متاحة في الاختيار الحالي",en:"No matches available for the current selection",zh:"当前所选条件下没有可用的比赛",hi:"वर्तमान चुनाव के लिए कोई मैच उपलब्ध नहीं है",es:"No hay partidos disponibles para la selección actual",fr:"Aucun match disponible pour la sélection actuelle",fa:"هیچ بازی‌ای برای انتخاب فعلی موجود نیست"},
    emptyHint: {ar:"جرّب بطولة أخرى أو يومًا آخر.",en:"Try another league or a different day.",zh:"试试其他联赛或其他日期。",hi:"कोई दूसरी लीग या अलग दिन आज़माएँ।",es:"Prueba otra liga o un día diferente.",fr:"Essayez un autre championnat ou un autre jour.",fa:"لیگ دیگری یا روز دیگری را امتحان کن."},
    footerSource: {ar:"مصدر البيانات:",en:"Data source:",zh:"数据来源：",hi:"डेटा स्रोत:",es:"Fuente de datos:",fr:"Source des données :",fa:"منبع داده:"},
    footerLastSyncPrefix: {ar:"آخر تحديث",en:"Last updated",zh:"最近更新",hi:"आख़िरी अपडेट",es:"Última actualización",fr:"Dernière mise à jour",fa:"آخرین بروزرسانی"},
    modalEventsH3: {ar:"أحداث المباراة",en:"Match events",zh:"比赛事件",hi:"मैच की घटनाएँ",es:"Eventos del partido",fr:"Événements du match",fa:"اتفاقات بازی"},
    modalLoading: {ar:"جاري تحميل التفاصيل...",en:"Loading details...",zh:"正在加载详情...",hi:"विवरण लोड हो रहा है...",es:"Cargando detalles...",fr:"Chargement des détails...",fa:"در حال بارگذاری جزئیات..."},
    modalNoEvents: {ar:"لا توجد أحداث تفصيلية متاحة حاليًا.",en:"No detailed events available right now.",zh:"目前没有可用的详细事件。",hi:"अभी कोई विस्तृत घटनाएँ उपलब्ध नहीं हैं।",es:"No hay eventos detallados disponibles por el momento.",fr:"Aucun événement détaillé disponible pour le moment.",fa:"در حال حاضر هیچ رویداد جزئی‌ای موجود نیست."},
    modalLoadFailed: {ar:"تعذر تحميل التفاصيل المباشرة حاليًا.",en:"Could not load live details right now.",zh:"目前无法加载实时详情。",hi:"अभी लाइव विवरण लोड नहीं हो सका।",es:"No se pudieron cargar los detalles en vivo por ahora.",fr:"Impossible de charger les détails en direct pour le moment.",fa:"بارگذاری جزئیات زنده در حال حاضر ممکن نشد."},
    errFallbackYesterday: {ar:"عرض نتائج الأمس لأن ملف مباريات اليوم غير متوفر.",en:"Showing yesterday's results because today's match file isn't available.",zh:"由于今日比赛文件不可用，显示昨天的结果。",hi:"आज की मैच फ़ाइल उपलब्ध न होने के कारण कल के परिणाम दिखाए जा रहे हैं।",es:"Se muestran los resultados de ayer porque el archivo de partidos de hoy no está disponible.",fr:"Affichage des résultats d'hier car le fichier des matchs d'aujourd'hui n'est pas disponible.",fa:"به دلیل نبود فایل بازی‌های امروز، نتایج دیروز نمایش داده می‌شود."},
    errNoData: {ar:"لا توجد بيانات مباريات متاحة حاليًا. سيعاد المحاولة تلقائيًا.",en:"No match data available right now. It will retry automatically.",zh:"目前没有可用的比赛数据，系统将自动重试。",hi:"अभी कोई मैच डेटा उपलब्ध नहीं है। यह स्वचालित रूप से फिर कोशिश करेगा।",es:"No hay datos de partidos disponibles por ahora. Se reintentará automáticamente.",fr:"Aucune donnée de match disponible pour le moment. Une nouvelle tentative sera effectuée automatiquement.",fa:"در حال حاضر داده بازی‌ای موجود نیست. به‌طور خودکار دوباره تلاش می‌شود."},
    errPartial: {ar:"تم عرض آخر بيانات محفوظة مع تحديث مباشر متاح جزئيًا.",en:"Showing the last saved data, with live updates partially available.",zh:"显示最后保存的数据，实时更新部分可用。",hi:"आख़िरी सहेजा गया डेटा दिखाया जा रहा है, साथ ही कुछ लाइव अपडेट उपलब्ध हैं।",es:"Se muestran los últimos datos guardados, con actualizaciones en vivo parcialmente disponibles.",fr:"Affichage des dernières données enregistrées, avec des mises à jour en direct partiellement disponibles.",fa:"آخرین داده ذخیره‌شده نمایش داده می‌شود، همراه با بروزرسانی زنده که به‌طور جزئی موجود است."},
    errLoadFailed: {ar:"تعذر تحديث مصدر المباريات؛ تم الحفاظ على البيانات المتاحة إن وجدت.",en:"Could not refresh the match source; any available data has been kept.",zh:"无法刷新比赛数据源；已保留现有的可用数据。",hi:"मैच स्रोत को रीफ़्रेश नहीं किया जा सका; उपलब्ध डेटा को बनाए रखा गया है।",es:"No se pudo actualizar la fuente de partidos; se conservaron los datos disponibles.",fr:"Impossible d'actualiser la source des matchs ; les données disponibles ont été conservées.",fa:"بروزرسانی منبع بازی‌ها ممکن نشد؛ داده‌های موجود حفظ شد."},
    sourceLive: {ar:"ESPN مباشر + لقطة الموقع",en:"ESPN live + site snapshot",zh:"ESPN 实时 + 站点快照",hi:"ESPN लाइव + साइट स्नैपशॉट",es:"ESPN en vivo + instantánea del sitio",fr:"ESPN en direct + instantané du site",fa:"ESPN زنده + نسخه ذخیره‌شده سایت"},
    sourceStatic: {ar:"لقطة الموقع الموثوقة",en:"Trusted site snapshot",zh:"可靠的站点快照",hi:"भरोसेमंद साइट स्नैपशॉट",es:"Instantánea confiable del sitio",fr:"Instantané fiable du site",fa:"نسخه معتبر ذخیره‌شده سایت"},
    fallbackHomeTeam: {ar:"الفريق المضيف",en:"Home team",zh:"主队",hi:"घरेलू टीम",es:"Equipo local",fr:"Équipe à domicile",fa:"تیم میزبان"},
    fallbackAwayTeam: {ar:"الفريق الضيف",en:"Away team",zh:"客队",hi:"मेहमान टीम",es:"Equipo visitante",fr:"Équipe à l'extérieur",fa:"تیم میهمان"},
    fallbackLeagueName: {ar:"بطولة كرة القدم",en:"Football league",zh:"足球联赛",hi:"फुटबॉल लीग",es:"Liga de fútbol",fr:"Championnat de football",fa:"لیگ فوتبال"},
    fallbackGroup: {ar:"أخرى",en:"Other",zh:"其他",hi:"अन्य",es:"Otra",fr:"Autre",fa:"دیگر"},
    groupEurope: {ar:"أوروبا",en:"Europe",zh:"欧洲",hi:"यूरोप",es:"Europa",fr:"Europe",fa:"اروپا"},
    // V1230.73 — new presentation layer for the Match Center (see its header comment above the
    // render-function block for the full redesign). These are the only brand-new UI strings it
    // needed; everything else reuses what already existed (liveBadge for the live-strip heading,
    // leagueSelectMajor/leagueSelectAll for the two aggregate chips, etc.)
    groupAsia: {ar:"آسيا",en:"Asia",zh:"亚洲",hi:"एशिया",es:"Asia",fr:"Asie",fa:"آسیا"},
    liveStripEmpty: {ar:"لا توجد مباريات مباشرة الآن — راقب هذا الشريط عند بداية أي مباراة.",en:"No matches live right now — this strip lights up the moment one kicks off.",zh:"目前没有正在直播的比赛——一旦开赛，此区域会立即点亮。",hi:"अभी कोई मैच लाइव नहीं है — किकऑफ़ होते ही यह पट्टी जल उठेगी।",es:"No hay partidos en vivo ahora mismo — esta franja se activa en cuanto empiece uno.",fr:"Aucun match en direct pour le moment — cette bande s'allume dès le coup d'envoi.",fa:"در حال حاضر هیچ بازی زنده‌ای نیست — با شروع هر بازی، این نوار روشن می‌شود."},
  };
  const T = k => text(UI[k]);
  const LEAGUE_NAMES = {
    'eng.1': {ar:"الدوري الإنجليزي الممتاز",en:"Premier League",zh:"英格兰超级联赛",hi:"प्रीमियर लीग",es:"Premier League",fr:"Premier League",fa:"لیگ برتر انگلیس"},
    'esp.1': {ar:"الدوري الإسباني",en:"La Liga",zh:"西甲联赛",hi:"ला लीगा",es:"La Liga",fr:"Liga espagnole (La Liga)",fa:"لالیگا"},
    'ita.1': {ar:"الدوري الإيطالي",en:"Serie A",zh:"意甲",hi:"सीरी ए",es:"Serie A",fr:"Serie A",fa:"سری آ"},
    'ger.1': {ar:"الدوري الألماني",en:"Bundesliga",zh:"德甲",hi:"बुंडेसलीगा",es:"Bundesliga",fr:"Bundesliga",fa:"بوندس‌لیگا"},
    'fra.1': {ar:"الدوري الفرنسي",en:"Ligue 1",zh:"法甲",hi:"लीग 1",es:"Ligue 1",fr:"Ligue 1",fa:"لوشامپیونه"},
    // V1230.73 — trying 'jor.1': ESPN typically uses this code for the Jordanian Pro League on the
    // same endpoint that already serves the 5 leagues above, but this was never directly confirmed
    // from this workspace (no network access to espn.com here to test it). Safe to add regardless:
    // fetchLeague() already treats any league that fails or returns empty as a no-op via
    // Promise.allSettled — no crash, matches for it just won't appear if ESPN doesn't support it.
    // The static-snapshot fallback already carries real Jordan Pro League matches tagged
    // leagueId:"jor.1" (sourced from JFA, see data/matches/*.json) that were silently being dropped
    // before this change — matchesFor()'s 'all' filter (just fixed below) used to cap every league
    // at priority<=5, and this league wasn't even registered here to get a priority at all.
    'jor.1': {ar:"الدوري الأردني للمحترفين",en:"Jordanian Pro League",zh:"约旦职业足球联赛",hi:"जॉर्डन प्रो लीग",es:"Liga Profesional de Jordania",fr:"Ligue professionnelle jordanienne",fa:"لیگ برتر فوتبال اردن"},
    // V1230.106 — jor.shield (JFA's "درع الاتحاد الأردني" Super Cup) appears in the static snapshot
    // (data/matches/2026-09-19.json) but was never registered here, unlike jor.1 right above. Since
    // normalizeStatic() only translates a league name when BY[leagueId] exists, every jor.shield match
    // fell through to its raw Arabic leagueName string in every language — found during the same
    // 7-language audit that caught the untranslated team names below.
    'jor.shield': {ar:"درع الاتحاد الأردني",en:"Jordan FA Shield",zh:"约旦足协超级杯",hi:"जॉर्डन एफए शील्ड",es:"Supercopa de Jordania",fr:"Bouclier de la Fédération jordanienne",fa:"سوپرجام فوتبال اردن"},
  };
  // V1230.106 — team names in the static match snapshot (data/matches/*.json) are real JFA data, and
  // European-club names already happen to be stored in their internationally-used Latin form (so they
  // read fine in every language), but Jordanian Pro League clubs were stored only in Arabic with no
  // translation anywhere — the exact same "real content, never localized" gap LEAGUE_NAMES above
  // already solves for league names. Keyed by the raw Arabic string exactly as it appears in the data
  // files; resolveTeam() below falls back to that raw string untouched for any team not listed here,
  // so an unknown/new club never breaks, it just isn't translated yet.
  const TEAM_NAMES = {
    'الفيصلي': {ar:"الفيصلي",en:"Al-Faisaly",zh:"费萨利",hi:"अल-फैसली",es:"Al-Faisaly",fr:"Al-Faisaly",fa:"الفیصلی"},
    'الوحدات': {ar:"الوحدات",en:"Al-Wehdat",zh:"瓦赫达特",hi:"अल-वहदात",es:"Al-Wehdat",fr:"Al-Wehdat",fa:"الوحدات"},
    'الرمثا': {ar:"الرمثا",en:"Al-Ramtha",zh:"拉姆萨",hi:"अल-रमथा",es:"Al-Ramtha",fr:"Al-Ramtha",fa:"الرمثا"},
    'شباب الأردن': {ar:"شباب الأردن",en:"Shabab Al-Ordon",zh:"约旦青年",hi:"शबाब अल-ओर्दोन",es:"Shabab Al-Ordon",fr:"Shabab Al-Ordon",fa:"شباب‌الاردن"},
    'الحسين': {ar:"الحسين",en:"Al-Hussein",zh:"侯赛因",hi:"अल-हुसैन",es:"Al-Hussein",fr:"Al-Hussein",fa:"الحسین"},
    'الجزيرة': {ar:"الجزيرة",en:"Al-Jazeera",zh:"贾兹拉",hi:"अल-जज़ीरा",es:"Al-Jazeera",fr:"Al-Jazeera",fa:"الجزیره"},
    'العربي': {ar:"العربي",en:"Al-Arabi",zh:"阿拉比",hi:"अल-अरबी",es:"Al-Arabi",fr:"Al-Arabi",fa:"العربی"},
    'البقعة': {ar:"البقعة",en:"Al-Baqa'a",zh:"巴卡",hi:"अल-बका",es:"Al-Baqa'a",fr:"Al-Baqa'a",fa:"البقعه"},
  };
  // V1230.106 — this must return the per-language OBJECT (or the raw string, when untranslated),
  // the same way LEAGUE_NAMES/l.name already works, resolved to a display string only at RENDER time
  // via text(). Matches are normalized once when the static snapshot loads and then kept in
  // state.matchesByDate for the rest of the session (see mount()/load() below) — resolving to a
  // string here, at normalize time, would permanently bake in whatever language happened to be active
  // at that one moment, exactly the "frozen language" mismatch an earlier version of this fix shipped
  // with (caught by testing a live language switch, not by reading the diff).
  const resolveTeam = raw => { const key = typeof raw === 'string' ? raw.trim() : ''; return TEAM_NAMES[key] || raw; };
  // Short labels for the compact league chips (full names above are used in match-card headers and
  // the match-detail modal, where there's room; a chip row needs something that fits on one line).
  const LEAGUE_SHORT = {
    'eng.1': {ar:"الإنجليزي",en:"EPL",zh:"英超",hi:"प्रीमियर लीग",es:"Premier",fr:"Premier",fa:"انگلیس"},
    'esp.1': {ar:"الإسباني",en:"La Liga",zh:"西甲",hi:"ला लीगा",es:"La Liga",fr:"Liga",fa:"اسپانیا"},
    'ita.1': {ar:"الإيطالي",en:"Serie A",zh:"意甲",hi:"सीरी ए",es:"Serie A",fr:"Serie A",fa:"ایتالیا"},
    'ger.1': {ar:"الألماني",en:"Bundesliga",zh:"德甲",hi:"बुंडेसलीगा",es:"Bundesliga",fr:"Bundesliga",fa:"آلمان"},
    'fra.1': {ar:"الفرنسي",en:"Ligue 1",zh:"法甲",hi:"लीग 1",es:"Ligue 1",fr:"Ligue 1",fa:"فرانسه"},
    'jor.1': {ar:"الأردني",en:"Jordan",zh:"约旦",hi:"जॉर्डन",es:"Jordania",fr:"Jordanie",fa:"اردن"},
    'jor.shield': {ar:"درع الأردن",en:"Jordan Shield",zh:"约旦超级杯",hi:"जॉर्डन शील्ड",es:"Supercopa Jordania",fr:"Bouclier Jordanie",fa:"سوپرجام اردن"},
  };
  const LEAGUES = [
    {id:'eng.1',name:LEAGUE_NAMES['eng.1'],icon:'🏴',group:UI.groupEurope,priority:1},{id:'esp.1',name:LEAGUE_NAMES['esp.1'],icon:'🇪🇸',group:UI.groupEurope,priority:2},{id:'ita.1',name:LEAGUE_NAMES['ita.1'],icon:'🇮🇹',group:UI.groupEurope,priority:3},{id:'ger.1',name:LEAGUE_NAMES['ger.1'],icon:'🇩🇪',group:UI.groupEurope,priority:4},{id:'fra.1',name:LEAGUE_NAMES['fra.1'],icon:'🇫🇷',group:UI.groupEurope,priority:5},
    {id:'jor.1',name:LEAGUE_NAMES['jor.1'],icon:'🇯🇴',group:UI.groupAsia,priority:6},
    {id:'jor.shield',name:LEAGUE_NAMES['jor.shield'],icon:'🇯🇴',group:UI.groupAsia,priority:7},
  ];
  const BY = Object.fromEntries(LEAGUES.map(x => [x.id, x]));
  const state = {box:null,day:'today',league:'major',status:'all',query:'',matchesByDate:{},busy:false,lastSync:null,error:null,source:'',timer:null,fallbackByDate:{},prevScores:{}};
  const esc = window.ZIVOZONE_ESC;
  const pad = n => String(n).padStart(2,'0');
  function ammanDate(){ const p=new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()); const o=Object.fromEntries(p.map(x=>[x.type,x.value])); return new Date(`${o.year}-${o.month}-${o.day}T12:00:00`); }
  const add=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x;};
  const key=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const ymd=d=>`${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`;
  function dates(){const b=ammanDate();return {yesterday:add(b,-1),today:b,tomorrow:add(b,1)};}
  const dayName=k=>k==='yesterday'?T('dayYesterday'):k==='tomorrow'?T('dayTomorrow'):T('dayToday');
  function dayLabel(d){return d.toLocaleDateString(loc(),{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:TZ});}
  const time=v=>{const d=new Date(v);return isNaN(d)?'—':d.toLocaleTimeString(loc(),{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:TZ});};
  async function get(url){const c=new AbortController(),t=setTimeout(()=>c.abort(),11000);try{const r=await fetch(url,{cache:'no-store',signal:c.signal,headers:{Accept:'application/json'}});if(!r.ok)throw Error(`HTTP ${r.status}`);return await r.json();}finally{clearTimeout(t);}}
  function normEvent(e,l){const c=e?.competitions?.[0],teams=c?.competitors||[],h=teams.find(x=>x.homeAway==='home'),a=teams.find(x=>x.homeAway==='away'),s=e?.status?.type||{};if(!h||!a)return null;let status='UPCOMING';if(['in','live'].includes(String(s.state).toLowerCase()))status='LIVE';else if(['post','final'].includes(String(s.state).toLowerCase()))status='FINISHED';else if(/postpon/i.test(`${s.name||''} ${s.description||''}`))status='POSTPONED';return{id:String(e.id),leagueId:l.id,leagueName:l.name,leagueIcon:l.icon,group:l.group,priority:l.priority,date:e.date,dateKey:key(new Date(e.date)),home:{name:h.team?.displayName||h.team?.name||T('fallbackHomeTeam'),logo:h.team?.logo||h.team?.logos?.[0]?.href||'',score:h.score!=null?Number(h.score):null},away:{name:a.team?.displayName||a.team?.name||T('fallbackAwayTeam'),logo:a.team?.logo||a.team?.logos?.[0]?.href||'',score:a.score!=null?Number(a.score):null},status,statusText:s.description||s.detail||'',period:s.period||0,clock:s.displayClock||'',venue:c?.venue?.fullName||c?.venue?.address?.city||'',broadcast:(c?.broadcasts||[]).flatMap(x=>x.names||[]).filter(Boolean),raw:e};}
  async function fetchLeague(l,date){const d=await get(`${API}${l.id}/scoreboard?dates=${ymd(date)}`);return Array.isArray(d?.events)?d.events.map(e=>normEvent(e,l)).filter(Boolean):[];}
  function normalizeStatic(x){if(!x||typeof x!=='object')return null;const l=BY[x.leagueId]||{id:x.leagueId||'unknown',name:x.leagueName||UI.fallbackLeagueName,icon:x.leagueIcon||'⚽',group:x.group||UI.fallbackGroup,priority:Number(x.priority)||99};return{id:String(x.id||x.eventId||''),leagueId:l.id,leagueName:l.name,leagueIcon:l.icon,group:l.group,priority:l.priority,date:x.date||x.startTime,dateKey:x.dateKey||key(new Date(x.date||x.startTime)),home:{name:resolveTeam(x.home?.name||x.homeTeam||x.home)||T('fallbackHomeTeam'),logo:x.home?.logo||x.homeLogo||'',score:x.home?.score??x.homeScore??null},away:{name:resolveTeam(x.away?.name||x.awayTeam||x.away)||T('fallbackAwayTeam'),logo:x.away?.logo||x.awayLogo||'',score:x.away?.score??x.awayScore??null},status:x.status||'UPCOMING',statusText:x.statusText||'',period:x.period||0,clock:x.clock||'',venue:x.venue||'',broadcast:Array.isArray(x.broadcast)?x.broadcast:[]};}
  async function staticIndex(){const d=await get(`${INDEX_URL}?v=${Date.now()}`);const files=Array.isArray(d?.files)?d.files:[];return files.map(x=>String(x).replace(/[^0-9-]/g,'')).filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x)).sort();}
  // V1230.19 — a missing per-date snapshot file is the EXPECTED, by-design case this whole function
  // exists to handle (that's what fetchStaticWithFallback's fallback-to-latest-file logic is for, per
  // this file's own "never publish an empty snapshot" design note above) — not a real error. This used to
  // console.warn on every single miss, which meant 2-3 warnings logged on every page load forever
  // (yesterday/today/tomorrow's exact-date file essentially never exists unless the static snapshot is
  // refreshed that same day). Now only warns for an actual problem (network failure, malformed JSON,
  // a non-404 HTTP error) — a plain 404 is silently treated as "no snapshot for this date yet".
  async function fetchStaticDate(dateKey){try{const d=await get(`${STATIC}${dateKey}.json`);const a=Array.isArray(d)?d:Array.isArray(d?.matches)?d.matches:[];return a.map(normalizeStatic).filter(x=>x?.id);}catch(error){if(!/HTTP 404/.test(String(error?.message||'')))console.warn('Match static source failed',dateKey,error);return null;}}
  async function fetchStaticWithFallback(date,allowFallback=false){const wanted=key(date);const rows=await fetchStaticDate(wanted);if(rows?.length)return {rows,dateKey:wanted,fallback:false};if(!allowFallback)return {rows:[],dateKey:wanted,fallback:false};try{const files=await staticIndex();const candidates=files.filter(x=>x<=wanted);const latest=candidates[candidates.length-1];if(!latest||latest===wanted)return {rows:[],dateKey:wanted,fallback:false};const fallbackRows=await fetchStaticDate(latest);if(fallbackRows?.length)return {rows:fallbackRows.map(x=>({...x,dateKey:wanted,sourceDateKey:latest})),dateKey:wanted,fallback:true,sourceDateKey:latest};}catch(error){console.warn('Match fallback index failed',error);}return {rows:[],dateKey:wanted,fallback:false};}
  function merge(arr){const m=new Map();arr.forEach(x=>{if(!x)return;const old=m.get(x.id);m.set(x.id,old?{...old,...x,home:{...old.home,...x.home},away:{...old.away,...x.away}}:x);});return [...m.values()].sort((a,b)=>new Date(a.date)-new Date(b.date)||a.priority-b.priority);}
  function activeDates(){const d=dates();return [['yesterday',d.yesterday],['today',d.today],['tomorrow',d.tomorrow]];}
  const allMatches=()=>Object.values(state.matchesByDate).flat();
  // V1230.73 — fixed a latent bug while adding the Jordan league above: this used to filter
  // priority<=5 for league==='all' too, which meant "all leagues" silently behaved exactly like
  // "major leagues" (harmless before, since there were only 5 leagues total and all had
  // priority<=5 — now that there's a 6th at priority 6, "all" would have wrongly hidden it).
  function matchesFor(dateKey){let a=state.matchesByDate[dateKey]||[];if(state.league==='major')a=a.filter(x=>x.priority<=5);else if(state.league!=='all')a=a.filter(x=>x.leagueId===state.league);if(state.status!=='all')a=a.filter(x=>x.status===state.status);if(state.query){const q=state.query.trim().toLowerCase();a=a.filter(x=>[text(x.home.name),text(x.away.name),text(x.leagueName)].some(v=>String(v).toLowerCase().includes(q)));}return a;}
  function logo(t){return `<div class="zmc-logo">${t.logo?`<img src="${esc(t.logo)}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">`:''}<span ${t.logo?'style="display:none"':''}>⚽</span></div>`;}
  function statusText(x){if(x.status==='LIVE')return T('statusLive');if(x.status==='FINISHED')return T('statusFinished');if(x.status==='POSTPONED')return T('statusPostponed');return T('statusUpcoming');}
  function score(x){return x.home.score!=null&&x.away.score!=null?`<span dir="ltr"><b>${Number(x.home.score)}</b><i>:</i><b>${Number(x.away.score)}</b></span>`:`<span class="zmc-time">${esc(time(x.date))}</span>`;}
  function wonSentence(winner,ws,ls,loser){const l=LANG();if(l==='en')return `${winner} won ${ws}-${ls} against ${loser}`;if(l==='zh')return `${winner} 以 ${ws}-${ls} 战胜 ${loser}`;if(l==='hi')return `${winner} ने ${loser} को ${ws}-${ls} से हराया`;if(l==='es')return `${winner} ganó ${ws}-${ls} a ${loser}`;if(l==='fr')return `${winner} a gagné ${ws}-${ls} contre ${loser}`;if(l==='fa')return `${winner} با نتیجه ${ws}-${ls}، ${loser} را شکست داد`;return `فاز ${winner} ${ws} - ${ls} على ${loser}`;}
  function drawSentence(h,a){const l=LANG();if(l==='en')return `Draw ${h}-${a}`;if(l==='zh')return `平局 ${h}-${a}`;if(l==='hi')return `बराबरी ${h}-${a}`;if(l==='es')return `Empate ${h}-${a}`;if(l==='fr')return `Match nul ${h}-${a}`;if(l==='fa')return `مساوی ${h}-${a}`;return `تعادل ${h} - ${a}`;}
  function outcome(x){const hs=x.home.score,as=x.away.score;if(x.status!=='FINISHED'||hs==null||as==null)return '';const h=Number(hs),a=Number(as);if(h===a)return `<div class="zmc-outcome draw">${esc(drawSentence(h,a))}</div>`;const winner=h>a?x.home:x.away,loser=h>a?x.away:x.home,ws=Math.max(h,a),ls=Math.min(h,a);return `<div class="zmc-outcome">${esc(wonSentence(text(winner.name),ws,ls,text(loser.name)))}</div>`;}
  // V1230.73 — scoreSig/flash: lets a match card visibly flash the instant its score changes
  // between two auto-refreshes, instead of the number just silently being different next time you
  // look. render() rebuilds the whole shell's innerHTML every call (always has, see below), so this
  // can't rely on a persistent DOM node + CSS transition — instead it snapshots each live match's
  // "score signature" at the END of every render() and compares against that same snapshot at the
  // START of the next one. A brand-new DOM node gets the animation class only when its score really
  // changed, and since it's a fresh element each time, the keyframe just plays once on arrival —
  // no cleanup/removal timer needed.
  function scoreSig(x){return `${x.home.score??''}-${x.away.score??''}`;}
  function matchCard(x){const live=x.status==='LIVE';const changed=live&&state.prevScores[x.id]!==undefined&&state.prevScores[x.id]!==scoreSig(x);return `<article class="zmc-match ${live?'is-live':''} ${changed?'zmc-flash':''}"><button class="zmc-open" data-open-match="${esc(x.id)}"><div class="zmc-match-head"><span class="zmc-match-league">${esc(x.leagueIcon)} ${esc(text(x.leagueName))}</span><span class="${live?'zmc-live-tag':''}">${live?esc(T('liveBadge')):esc(statusText(x))}</span></div><div class="zmc-teams"><div class="zmc-team">${logo(x.home)}<strong translate="no">${esc(text(x.home.name))}</strong></div><div class="zmc-score">${score(x)}<small>${live?esc(x.clock||T('liveClockFallback')):x.status==='FINISHED'?esc(T('finalScoreLabel')):esc(T('kickoffLabel'))}</small>${outcome(x)}</div><div class="zmc-team">${logo(x.away)}<strong translate="no">${esc(text(x.away.name))}</strong></div></div><div class="zmc-match-foot">${x.venue?`<span>📍 ${esc(x.venue)}</span>`:''}<em>${esc(T('matchDetailsCta'))}</em></div></button></article>`;}
  // Compact card for the live strip — same data, a fifth of the footprint, built to be scanned at a
  // glance while scrolling horizontally rather than read like a full match card.
  function liveMiniCard(x){const changed=state.prevScores[x.id]!==undefined&&state.prevScores[x.id]!==scoreSig(x);return `<button class="zmc-live-card ${changed?'zmc-flash':''}" data-open-match="${esc(x.id)}"><span class="zmc-live-card-league">${esc(x.leagueIcon)}</span><div class="zmc-live-card-row">${logo(x.home)}<strong translate="no">${esc(text(x.home.name))}</strong><b>${x.home.score??0}</b></div><div class="zmc-live-card-row">${logo(x.away)}<strong translate="no">${esc(text(x.away.name))}</strong><b>${x.away.score??0}</b></div><small>${esc(x.clock||T('liveClockFallback'))}</small></button>`;}
  function matchCountLabel(n){const l=LANG();if(l==='en')return `${n} match${n===1?'':'es'}`;if(l==='zh')return `${n} 场比赛`;if(l==='hi')return `${n} मैच`;if(l==='es')return `${n} partido${n===1?'':'s'}`;if(l==='fr')return `${n} match${n===1?'':'s'}`;if(l==='fa')return `${n} بازی`;return `${n} مباراة`;}
  function catalog(){return [...LEAGUES].sort((a,b)=>a.priority-b.priority||text(a.name).localeCompare(text(b.name),LANG()));}
  // V1230.73 — full redesign of the presentation layer (the data engine above — fetchLeague,
  // normEvent, the static-snapshot fallback, ESPN calls — is untouched; it already worked well).
  // Three real, deliberate changes from the previous design:
  //   1. A "live now" strip is now its own prominent element at the very top, built from ALL live
  //      matches regardless of the day/league filters below it — the exact thing asked for
  //      ("طريقة عرض المباريات المباشرة"), not a number buried in a stats row.
  //   2. The day pills (yesterday/today/tomorrow) now actually filter the feed. Previously state.day
  //      only changed which button looked "active" — every render() call unconditionally built all
  //      three days' panels side by side regardless of which day was clicked. Real latent bug, not a
  //      style choice; fixed here as part of the same pass since the old 3-narrow-columns-per-league
  //      layout (zmc-days/zmc-day-panel, removed below) is what depended on showing all 3 at once.
  //   3. The per-league 3-column grid is replaced with one mobile-first feed (one column, one card
  //      per match, sorted by kickoff time) with a horizontal scrolling chip row for league choice
  //      instead of a <select> dropdown — easier to scan on a phone than three ~110px-wide columns.
  function render(){if(!state.box)return;const d=dates(),catalogList=catalog(),dayMap={yesterday:d.yesterday,today:d.today,tomorrow:d.tomorrow},activeDate=dayMap[state.day]||d.today,activeKey=key(activeDate);
    const pool=state.league==='major'?LEAGUES.filter(l=>l.priority<=5):state.league==='all'?catalogList:[BY[state.league]].filter(Boolean),poolIds=new Set(pool.map(l=>l.id));
    const liveMatches=allMatches().filter(x=>x.status==='LIVE'),total=allMatches().length,finished=allMatches().filter(x=>x.status==='FINISHED').length,upcoming=allMatches().filter(x=>x.status==='UPCOMING').length;
    const feedItems=matchesFor(activeKey).filter(x=>poolIds.has(x.leagueId)).sort((a,b)=>new Date(a.date)-new Date(b.date)||a.priority-b.priority);
    const fb=state.fallbackByDate[activeKey];
    const liveStripHtml=liveMatches.length?`<div class="zmc-live-strip"><div class="zmc-live-strip-head"><span class="zmc-live-dot" aria-hidden="true"></span><b>${esc(T('liveBadge'))}</b></div><div class="zmc-live-track">${liveMatches.map(liveMiniCard).join('')}</div></div>`:'';
    const chipsHtml=`<div class="zmc-league-chips" role="tablist">`+
      `<button class="zmc-chip ${state.league==='major'?'active':''}" data-league-chip="major">${esc(T('leagueSelectMajor'))}</button>`+
      `<button class="zmc-chip ${state.league==='all'?'active':''}" data-league-chip="all">${esc(T('leagueSelectAll'))}</button>`+
      catalogList.map(l=>`<button class="zmc-chip ${state.league===l.id?'active':''}" data-league-chip="${esc(l.id)}">${esc(l.icon)} ${esc(text(LEAGUE_SHORT[l.id]||l.name))}</button>`).join('')+
      `</div>`;
    const feedHtml=feedItems.length?`<div class="zmc-feed">${feedItems.map(matchCard).join('')}</div>`:`<div class="zmc-empty"><span>⚽</span><strong>${esc(T('emptyTitle'))}</strong><small>${esc(T('emptyHint'))}</small></div>`;
    state.box.innerHTML=`<div class="zmc-shell"><div class="zmc-hero"><div><span class="zmc-eyebrow">${esc(T('heroEyebrow'))}</span><h2>${esc(T('heroTitle'))}</h2><p>${esc(T('heroText'))}</p></div><div class="zmc-live-counter"><b>${liveMatches.length}</b><span>${esc(T('statusLive'))}</span></div></div>`+
      liveStripHtml+
      `<div class="zmc-day-nav"><button data-focus-day="yesterday" class="${state.day==='yesterday'?'active':''}">${esc(T('dayYesterday'))}</button><button data-focus-day="today" class="${state.day==='today'?'active':''}">${esc(T('dayToday'))}</button><button data-focus-day="tomorrow" class="${state.day==='tomorrow'?'active':''}">${esc(T('dayTomorrow'))}</button></div>`+
      chipsHtml+
      `<div class="zmc-filter-row"><select id="zmc-status"><option value="all">${esc(T('statusSelectAll'))}</option><option value="LIVE" ${state.status==='LIVE'?'selected':''}>${esc(T('statusSelectLive'))}</option><option value="UPCOMING" ${state.status==='UPCOMING'?'selected':''}>${esc(T('statusSelectUpcoming'))}</option><option value="FINISHED" ${state.status==='FINISHED'?'selected':''}>${esc(T('statusFinished'))}</option></select><input id="zmc-search" value="${esc(state.query)}" placeholder="${esc(T('searchPlaceholder'))}"><button id="zmc-refresh">${esc(T('refreshBtn'))}</button></div>`+
      `<div class="zmc-kpis"><div><b>${total}</b><span>${esc(T('kpiLoaded'))}</span></div><div class="live"><b>${liveMatches.length}</b><span>${esc(T('statusLive'))}</span></div><div><b>${finished}</b><span>${esc(T('statusFinished'))}</span></div><div><b>${upcoming}</b><span>${esc(T('statusSelectUpcoming'))}</span></div></div>`+
      // V1230.73 — fb's own notice and state.error's errFallbackYesterday say almost the same thing
      // ("today's file is missing, showing the latest available one"); they used to live in separate
      // per-day panels so the overlap never showed, but the new single-feed layout puts both in the
      // same spot for the active day. Suppress the generic one when the specific one already covers it.
      `${fb?`<div class="zmc-notice">${esc(T('fallbackNotice'))}</div>`:''}${state.error&&!(fb&&state.error===T('errFallbackYesterday'))?`<div class="zmc-notice">${esc(state.error)}</div>`:''}`+
      `<main class="zmc-content">${feedHtml}</main>`+
      `<footer class="zmc-footer"><span>${esc(T('footerSource'))} ${esc(text(state.source||'—'))}</span><span>${state.lastSync?`${esc(T('footerLastSyncPrefix'))} ${esc(time(state.lastSync))}`:'—'}</span></footer></div>`;
    // Snapshot this render's score signatures AFTER building every card above (so the comparisons
    // those cards just made were against the PREVIOUS render's snapshot, not this one).
    allMatches().forEach(x=>{state.prevScores[x.id]=scoreSig(x);});
    bind();
  }
  /* V1230.82 — bind() runs after EVERY render(), including the fully automatic ones on page load
     (load() renders once immediately, then again once data arrives) before the visitor has touched
     anything. The old unconditional scrollIntoView() on the active league chip was meant to keep
     the horizontal chip strip scrolled to the selected league after a CLICK, but with no scrollable
     ancestor between the chip and the page itself, 'nearest' still scrolled the whole window down
     to the Match Center section on first load — confirmed live: a brand-new tab with no hash in the
     URL landed at scrollY≈6700 instead of the top. Fixed by only scrolling the chip into view
     inside the actual click handlers (a real user action), never as a side effect of bind() itself. */
  function bind(){const b=state.box;const scrollChipIntoView=()=>b.querySelector('.zmc-league-chips .active')?.scrollIntoView?.({inline:'center',block:'nearest'});b.querySelectorAll('[data-focus-day]').forEach(x=>x.onclick=()=>{state.day=x.dataset.focusDay;render();scrollChipIntoView();});b.querySelectorAll('[data-league-chip]').forEach(x=>x.onclick=()=>{state.league=x.dataset.leagueChip;render();scrollChipIntoView();});b.querySelector('#zmc-status').onchange=e=>{state.status=e.target.value;render();};b.querySelector('#zmc-search').oninput=e=>{state.query=e.target.value;render();};b.querySelector('#zmc-refresh').onclick=()=>load();b.querySelectorAll('[data-open-match]').forEach(x=>x.onclick=e=>{e.preventDefault();openDetails(x.dataset.openMatch);});}
  async function load(){if(!state.box||state.busy)return;state.busy=true;state.error=null;state.fallbackByDate={};render();const ds=activeDates(),all=[];let directOk=0,directFailed=0,staticOk=0;try{for(const [name,d] of ds){const result=await fetchStaticWithFallback(d,name==='today');if(result.rows.length)staticOk++;if(result.fallback){state.fallbackByDate[result.dateKey]=result.sourceDateKey;state.error=T('errFallbackYesterday');}all.push(...result.rows);}for(let i=0;i<LEAGUES.length;i+=4){const chunk=LEAGUES.slice(i,i+4),r=await Promise.allSettled(chunk.flatMap(l=>ds.map(([_,d])=>fetchLeague(l,d))));r.forEach(x=>{if(x.status==='fulfilled'){directOk++;all.push(...x.value);}else directFailed++;});}const merged=merge(all);state.matchesByDate={};merged.forEach(x=>(state.matchesByDate[x.dateKey]??=[]).push(x));
    for(const [_,d] of ds){const dk=key(d);if(state.fallbackByDate[dk] && all.some(x=>x.dateKey===dk && !x.sourceDateKey && x.raw)){delete state.fallbackByDate[dk];}}
    state.lastSync=new Date();state.source=directOk?T('sourceLive'):staticOk?T('sourceStatic'):'—';if(!merged.length)state.error=T('errNoData');else if(directFailed&&staticOk&&!state.error)state.error=T('errPartial');
    // V1230.51 — player-hub.js's live-scores panel listens for MATCH_UPDATED to refresh itself the
    // moment scores change, but nothing ever emitted it; it only ever caught up on its own 15s poll.
    // Signature-gated (live-match ids + their scores) so this doesn't fire on every 30-120s reload
    // when nothing actually changed, which would just be noise with no new information.
    try{
      const sig=allMatches().filter(x=>x.status==='LIVE').map(x=>`${x.id}:${x.home?.score??''}-${x.away?.score??''}`).sort().join('|');
      if(sig!==state.lastLiveSig){state.lastLiveSig=sig;window.ZIVOZONE?.Events?.emit?.('MATCH_UPDATED',{live:allMatches().filter(x=>x.status==='LIVE').length});}
    }catch(_){}
  }catch(e){console.warn('Match Center load:',e);state.error=T('errLoadFailed');}finally{state.busy=false;render();schedule();}}
  async function openDetails(id){const x=allMatches().find(m=>m.id===id);if(!x)return;document.getElementById('zmc-modal')?.remove();const modal=document.createElement('div');modal.id='zmc-modal';modal.className='zmc-modal';modal.innerHTML=`<div class="zmc-dialog"><button class="zmc-close">×</button><div class="zmc-detail-league">${esc(x.leagueIcon)} ${esc(text(x.leagueName))} · ${esc(statusText(x))}</div><div class="zmc-detail-score"><div>${logo(x.home)}<strong translate="no">${esc(text(x.home.name))}</strong></div><section>${score(x)}<small>${esc(x.clock||time(x.date))}</small>${outcome(x)}</section><div>${logo(x.away)}<strong translate="no">${esc(text(x.away.name))}</strong></div></div><div class="zmc-detail-meta">${x.venue?`<span>📍 ${esc(x.venue)}</span>`:''}${x.broadcast?.length?`<span>📺 ${esc(x.broadcast.join('، '))}</span>`:''}</div><div class="zmc-events"><h3>${esc(T('modalEventsH3'))}</h3><p>${esc(T('modalLoading'))}</p></div></div>`;document.body.appendChild(modal);modal.querySelector('.zmc-close').onclick=()=>modal.remove();modal.onclick=e=>{if(e.target===modal)modal.remove();};try{const d=await get(`${API}${x.leagueId}/summary?event=${encodeURIComponent(x.id)}`),plays=Array.isArray(d?.plays)?d.plays:Array.isArray(d?.keyEvents)?d.keyEvents:[],events=plays.map(p=>{const minute=p.clock?.displayValue||p.time?.displayValue||'',txt=p.text||p.shortText||p.type?.text||p.type?.description||'';return minute||txt?`<div><b>${esc(minute)}</b><span>${esc(txt)}</span></div>`:'';}).filter(Boolean).slice(-80).reverse();modal.querySelector('.zmc-events').innerHTML=`<h3>${esc(T('modalEventsH3'))}</h3>${events.length?events.join(''):`<p>${esc(T('modalNoEvents'))}</p>`}`;}catch(_){modal.querySelector('.zmc-events').innerHTML=`<h3>${esc(T('modalEventsH3'))}</h3><p>${esc(T('modalLoadFailed'))}</p>`;}}
  function schedule(){clearTimeout(state.timer);state.timer=setTimeout(()=>load(),allMatches().some(x=>x.status==='LIVE')?30000:120000);}
  function mount(box){state.box=box;load();}
  window.ZIVOZONE_FIXTURES={load:mount};window.ZIVOZONE_MATCH_CENTER={version:VERSION,load:mount,refresh:load,getMatches:allMatches};window.ZIVOZONE=window.ZIVOZONE||{};window.ZIVOZONE.Sports={getMatches:allMatches};
})();
