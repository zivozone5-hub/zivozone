/* =========================================================
   GLOBAL CHALLENGE
   APP.JS — WORLD EDITION V2
   ========================================================= */

"use strict";

/* =========================================================
   1. GLOBAL STATE
========================================================= */

const STORAGE_KEY = "globalChallengeWorldV2";

let currentLanguage =
  localStorage.getItem("gc_language") || "ar";

let currentGame = null;
let currentQuestionIndex = 0;
let currentQuestions = [];
let currentScore = 0;
let currentCorrect = 0;
let currentStreak = 0;
let currentTimes = [];
let questionStartedAt = 0;
let timerInterval = null;
let questionTimeout = null;
let timeLeft = 30;
let answerLocked = false;
let rankingMode = "global";
let personalityIndex = 0;
let personalityAnswers = [];


/* =========================================================
   2. TRANSLATIONS
========================================================= */

const translations = {

  ar: {
    home: "الرئيسية",
    challenges: "التحديات",
    football: "كرة القدم",
    profile: "ملفي",
    ranking: "الترتيب",
    who: "من أنا؟",
    globalPlayer: "لاعب عالمي",
    heroTitle: "هل أنت مستعد لتثبت أنك الأفضل؟",
    heroText:
      "تحديات ذكاء وسرعة وذاكرة وتركيز وكرة قدم وتحليل شخصية. كل مرة تلعب فيها تتغير التجربة.",
    startChallenge: "ابدأ التحدي",
    discoverYourself: "اكتشف نفسك",
    currentPlayer: "اللاعب الحالي",
    points: "النقاط",
    level: "المستوى",
    globalRank: "الترتيب",
    smartChallenges: "التحديات الذكية",
    smartChallengesText: "اختبر عقلك",
    footballQuickText: "تحديات كروية",
    personalityQuickText: "اكتشف طريقة تفكيرك",
    rankingQuickText: "نافس اللاعبين",
    featuredChallenges: "تحديات مميزة",
    adaptiveDifficulty: "صعوبة ذكية",
    adaptiveDifficultyText:
      "مستوى التحدي يتطور بناءً على العمر والأداء والسرعة والدقة.",
    dynamicQuestions: "تجربة متغيرة",
    dynamicQuestionsText:
      "أسئلة مختلفة وتجربة تتغير مع كل محاولة.",
    global: "عالمي",
    globalText:
      "العب بلغتك واستعد للمنافسة مع لاعبين من العالم.",
    ai: "ذكاء اصطناعي",
    aiText:
      "بنية قابلة للتطور نحو تجارب تعتمد على الذكاء الاصطناعي.",
    challengeSubtitle:
      "اختر اللعبة التي تريد اختبار نفسك فيها",
    all: "الكل",
    intelligence: "ذكاء",
    speed: "سرعة",
    memory: "ذاكرة",
    psychology: "نفسي",
    playerProfile: "ملف اللاعب",
    profileSubtitle:
      "هويتك وتطورك داخل Global Challenge",
    name: "الاسم",
    age: "العمر",
    country: "الدولة",
    namePlaceholder: "اكتب اسمك",
    save: "حفظ الملف",
    games: "التحديات",
    accuracy: "الدقة",
    nextLevel: "المستوى القادم",
    adaptiveInfo:
      "العمر والأداء والنقاط والسرعة تدخل في تحديد مستوى التحديات القادمة.",
    footballSubtitle:
      "اختبر معرفتك وذكاءك الكروي وطوّر مستواك",
    youthDevelopment: "تطوير لاعبي الناشئين",
    youthDevelopmentText:
      "محتوى واختبارات تساعد اللاعب الصغير على فهم اللعبة وتطوير التفكير والقرار والمهارات.",
    result: "نتيجة التحدي",
    pointsEarned: "نقاط مكتسبة",
    correct: "الإجابات الصحيحة",
    averageTime: "متوسط الوقت",
    playAgain: "تحدٍ جديد",
    viewProfile: "ملفي",
    globalRanking: "الترتيب العالمي",
    rankingSubtitle: "أسرع وأقوى اللاعبين",
    countryRanking: "الدولة",
    gameRanking: "اللعبة",
    localRankingInfo:
      "الترتيب الحالي محفوظ محليًا. عند ربط قاعدة البيانات سيصبح الترتيب عالميًا حقيقيًا.",
    player: "اللاعب",
    speed: "السرعة",
    personalitySubtitle:
      "رحلة لاكتشاف طريقة تفكيرك",
    personalityIntroTitle:
      "هل تعرف نفسك فعلًا؟",
    personalityIntroText:
      "أجب عن مواقف وأسئلة متنوعة. سنحلل أنماط إجاباتك وسلوكك داخل التجربة لإعطائك قراءة ترفيهية عن طريقة تفكيرك.",
    personalityDisclaimer:
      "هذا تحليل ترفيهي واحتمالي يعتمد على إجاباتك، وليس تشخيصًا نفسيًا أو طبيًا.",
    globalNews: "الأخبار العالمية",
    newsSubtitle: "أخبار ومحتوى عالمي",
    newsComing:
      "سيتم ربط الأخبار العالمية بمصادر موثوقة في مرحلة لاحقة.",
    aiSubtitle:
      "تحديات وتجارب تتطور مع اللاعب",
    aiComing: "نظام الذكاء الاصطناعي",
    aiComingText:
      "هذه المنطقة مجهزة لإضافة تجارب الذكاء الاصطناعي والتحليل المتقدم.",
    mindGames: "ألعاب العقل",
    mindGamesSubtitle:
      "تحديات مختلفة عن المعتاد",
    loading: "جاري التحميل...",
    speedBonus: "مكافأة السرعة",
    accuracyBonus: "مكافأة الدقة",
    streak: "سلسلة",
    difficulty: "الصعوبة",
    question: "السؤال",
    timeUp: "انتهى الوقت!",
    correctAnswer: "إجابة صحيحة",
    wrongAnswer: "إجابة خاطئة",
    continue: "استمرار",
    score: "النقاط",
    challengeFinished: "انتهى التحدي",
    easy: "سهل",
    medium: "متوسط",
    hard: "صعب",
    extreme: "متطرف",
    expert: "خبير",
    levelUp: "ارتفع مستواك!",
    profileSaved: "تم حفظ الملف بنجاح",
    enterProfile: "أدخل الاسم والعمر أولًا",
    questionProgress: "السؤال",
    seconds: "ث",
    noPlayers: "لا يوجد لاعبون بعد",
    countryNotSet: "غير محدد",
    analysis: "التحليل",
    beginPersonality: "ابدأ التحليل",
    next: "التالي",
    personalityComplete: "اكتمل التحليل",
    logical: "تحليلي",
    intuitive: "حدسي",
    competitive: "تنافسي",
    calm: "هادئ",
    risk: "محب للمخاطرة",
    balanced: "متوازن"
  },


  en: {
    home: "Home",
    challenges: "Challenges",
    football: "Football",
    profile: "Profile",
    ranking: "Ranking",
    who: "Who Am I?",
    globalPlayer: "GLOBAL PLAYER",
    heroTitle: "Are you ready to prove you're the best?",
    heroText:
      "Intelligence, speed, memory, football and personality challenges. Every session changes.",
    startChallenge: "Start Challenge",
    discoverYourself: "Discover Yourself",
    currentPlayer: "Current Player",
    points: "Points",
    level: "Level",
    globalRank: "Rank",
    smartChallenges: "Smart Challenges",
    smartChallengesText: "Test your mind",
    footballQuickText: "Football challenges",
    personalityQuickText: "Discover your mind",
    rankingQuickText: "Compete with players",
    featuredChallenges: "Featured Challenges",
    adaptiveDifficulty: "Adaptive Difficulty",
    adaptiveDifficultyText:
      "Challenge difficulty evolves according to age, performance, speed and accuracy.",
    dynamicQuestions: "Dynamic Experience",
    dynamicQuestionsText:
      "Questions change every time you play.",
    global: "Global",
    globalText:
      "Play in your language and compete globally.",
    ai: "Artificial Intelligence",
    aiText:
      "A foundation ready for advanced AI experiences.",
    challengeSubtitle:
      "Choose the game you want to test yourself in",
    all: "All",
    intelligence: "Intelligence",
    speed: "Speed",
    memory: "Memory",
    psychology: "Psychology",
    playerProfile: "Player Profile",
    profileSubtitle:
      "Your identity and progress inside Global Challenge",
    name: "Name",
    age: "Age",
    country: "Country",
    namePlaceholder: "Enter your name",
    save: "Save Profile",
    games: "Games",
    accuracy: "Accuracy",
    nextLevel: "Next Level",
    adaptiveInfo:
      "Age, performance, points and speed affect future challenge difficulty.",
    footballSubtitle:
      "Test your football knowledge and decision-making.",
    youthDevelopment: "Youth Player Development",
    youthDevelopmentText:
      "Content and challenges designed to help young players understand the game and improve thinking and decision-making.",
    result: "Challenge Result",
    pointsEarned: "Points Earned",
    correct: "Correct Answers",
    averageTime: "Average Time",
    playAgain: "New Challenge",
    viewProfile: "My Profile",
    globalRanking: "Global Ranking",
    rankingSubtitle: "The fastest and strongest players",
    countryRanking: "Country",
    gameRanking: "Game",
    localRankingInfo:
      "Current ranking is stored locally. A database connection will make it globally shared.",
    player: "Player",
    speed: "Speed",
    personalitySubtitle:
      "A journey to discover how you think",
    personalityIntroTitle:
      "Do you really know yourself?",
    personalityIntroText:
      "Answer varied situations and questions to receive an entertainment-based reading of your thinking patterns.",
    personalityDisclaimer:
      "This is an entertainment-based analysis, not a medical or psychological diagnosis.",
    globalNews: "Global News",
    newsSubtitle: "Global news and content",
    newsComing:
      "Global news will be connected to trusted sources later.",
    aiSubtitle:
      "Experiences that evolve with the player",
    aiComing: "AI System",
    aiComingText:
      "This area is prepared for advanced AI experiences and analysis.",
    mindGames: "Mind Games",
    mindGamesSubtitle:
      "Challenges beyond ordinary quizzes",
    loading: "Loading...",
    speedBonus: "Speed Bonus",
    accuracyBonus: "Accuracy Bonus",
    streak: "Streak",
    difficulty: "Difficulty",
    question: "Question",
    timeUp: "Time is up!",
    correctAnswer: "Correct Answer",
    wrongAnswer: "Wrong Answer",
    continue: "Continue",
    score: "Score",
    challengeFinished: "Challenge Finished",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    extreme: "Extreme",
    expert: "Expert",
    levelUp: "Level Up!",
    profileSaved: "Profile saved successfully",
    enterProfile: "Enter your name and age first",
    questionProgress: "Question",
    seconds: "s",
    noPlayers: "No players yet",
    countryNotSet: "Not set",
    analysis: "Analysis",
    beginPersonality: "Start Analysis",
    next: "Next",
    personalityComplete: "Analysis Complete",
    logical: "Analytical",
    intuitive: "Intuitive",
    competitive: "Competitive",
    calm: "Calm",
    risk: "Risk Taker",
    balanced: "Balanced"
  },


  fr: {
    home: "Accueil",
    challenges: "Défis",
    football: "Football",
    profile: "Profil",
    ranking: "Classement",
    who: "Qui suis-je ?",
    globalPlayer: "JOUEUR MONDIAL",
    heroTitle: "Prêt à prouver que vous êtes le meilleur ?",
    heroText:
      "Défis d'intelligence, vitesse, mémoire, football et personnalité.",
    startChallenge: "Commencer",
    discoverYourself: "Découvrez-vous",
    currentPlayer: "Joueur actuel",
    points: "Points",
    level: "Niveau",
    globalRank: "Classement",
    smartChallenges: "Défis intelligents",
    smartChallengesText: "Testez votre esprit",
    footballQuickText: "Défis football",
    personalityQuickText: "Découvrez votre esprit",
    rankingQuickText: "Affrontez les joueurs",
    featuredChallenges: "Défis populaires",
    adaptiveDifficulty: "Difficulté adaptative",
    adaptiveDifficultyText:
      "La difficulté évolue selon l'âge et les performances.",
    dynamicQuestions: "Expérience dynamique",
    dynamicQuestionsText:
      "Les questions changent à chaque partie.",
    global: "Mondial",
    globalText:
      "Jouez dans votre langue et préparez-vous à la compétition mondiale.",
    ai: "Intelligence artificielle",
    aiText:
      "Une base prête pour des expériences IA avancées.",
    challengeSubtitle:
      "Choisissez le défi que vous souhaitez tester",
    all: "Tous",
    intelligence: "Intelligence",
    speed: "Vitesse",
    memory: "Mémoire",
    psychology: "Psychologie",
    playerProfile: "Profil du joueur",
    profileSubtitle:
      "Votre identité et votre progression",
    name: "Nom",
    age: "Âge",
    country: "Pays",
    namePlaceholder: "Votre nom",
    save: "Enregistrer",
    games: "Parties",
    accuracy: "Précision",
    nextLevel: "Niveau suivant",
    adaptiveInfo:
      "L'âge, les performances, les points et la vitesse influencent les défis futurs.",
    footballSubtitle:
      "Testez vos connaissances et votre intelligence footballistique.",
    youthDevelopment: "Développement des jeunes joueurs",
    youthDevelopmentText:
      "Des contenus pour améliorer la compréhension du jeu et la prise de décision.",
    result: "Résultat",
    pointsEarned: "Points gagnés",
    correct: "Réponses correctes",
    averageTime: "Temps moyen",
    playAgain: "Nouveau défi",
    viewProfile: "Mon profil",
    globalRanking: "Classement mondial",
    rankingSubtitle: "Les joueurs les plus rapides et performants",
    countryRanking: "Pays",
    gameRanking: "Jeu",
    localRankingInfo:
      "Le classement actuel est local. Une base de données permettra le classement mondial.",
    player: "Joueur",
    speed: "Vitesse",
    personalitySubtitle:
      "Un voyage pour découvrir votre façon de penser",
    personalityIntroTitle:
      "Vous connaissez-vous vraiment ?",
    personalityIntroText:
      "Répondez à des situations variées pour obtenir une lecture ludique de votre façon de penser.",
    personalityDisclaimer:
      "Analyse ludique uniquement, pas un diagnostic médical ou psychologique.",
    globalNews: "Actualités mondiales",
    newsSubtitle: "Actualités et contenu mondial",
    newsComing:
      "Les actualités mondiales seront connectées ultérieurement.",
    aiSubtitle:
      "Des expériences qui évoluent avec le joueur",
    aiComing: "Système IA",
    aiComingText:
      "Cette zone est prête pour les expériences IA avancées.",
    mindGames: "Jeux mentaux",
    mindGamesSubtitle:
      "Des défis différents",
    loading: "Chargement...",
    speedBonus: "Bonus vitesse",
    accuracyBonus: "Bonus précision",
    streak: "Série",
    difficulty: "Difficulté",
    question: "Question",
    timeUp: "Temps écoulé !",
    correctAnswer: "Bonne réponse",
    wrongAnswer: "Mauvaise réponse",
    continue: "Continuer",
    score: "Score",
    challengeFinished: "Défi terminé",
    easy: "Facile",
    medium: "Moyen",
    hard: "Difficile",
    extreme: "Extrême",
    expert: "Expert",
    levelUp: "Niveau supérieur !",
    profileSaved: "Profil enregistré",
    enterProfile: "Entrez votre nom et votre âge",
    questionProgress: "Question",
    seconds: "s",
    noPlayers: "Aucun joueur",
    countryNotSet: "Non défini",
    analysis: "Analyse",
    beginPersonality: "Commencer l'analyse",
    next: "Suivant",
    personalityComplete: "Analyse terminée",
    logical: "Analytique",
    intuitive: "Intuitif",
    competitive: "Compétitif",
    calm: "Calme",
    risk: "Prise de risque",
    balanced: "Équilibré"
  },


  es: {
    home: "Inicio",
    challenges: "Desafíos",
    football: "Fútbol",
    profile: "Perfil",
    ranking: "Clasificación",
    who: "¿Quién soy?",
    globalPlayer: "JUGADOR GLOBAL",
    heroTitle: "¿Estás listo para demostrar que eres el mejor?",
    heroText:
      "Desafíos de inteligencia, velocidad, memoria, fútbol y personalidad.",
    startChallenge: "Empezar desafío",
    discoverYourself: "Descúbrete",
    currentPlayer: "Jugador actual",
    points: "Puntos",
    level: "Nivel",
    globalRank: "Posición",
    smartChallenges: "Desafíos inteligentes",
    smartChallengesText: "Pon a prueba tu mente",
    footballQuickText: "Desafíos de fútbol",
    personalityQuickText: "Descubre tu mente",
    rankingQuickText: "Compite con jugadores",
    featuredChallenges: "Desafíos destacados",
    adaptiveDifficulty: "Dificultad adaptativa",
    adaptiveDifficultyText:
      "La dificultad evoluciona según edad y rendimiento.",
    dynamicQuestions: "Experiencia dinámica",
    dynamicQuestionsText:
      "Las preguntas cambian cada vez que juegas.",
    global: "Global",
    globalText:
      "Juega en tu idioma y compite globalmente.",
    ai: "Inteligencia artificial",
    aiText:
      "Base preparada para experiencias avanzadas de IA.",
    challengeSubtitle:
      "Elige el desafío que quieres probar",
    all: "Todos",
    intelligence: "Inteligencia",
    speed: "Velocidad",
    memory: "Memoria",
    psychology: "Psicología",
    playerProfile: "Perfil del jugador",
    profileSubtitle:
      "Tu identidad y progreso",
    name: "Nombre",
    age: "Edad",
    country: "País",
    namePlaceholder: "Escribe tu nombre",
    save: "Guardar",
    games: "Partidas",
    accuracy: "Precisión",
    nextLevel: "Siguiente nivel",
    adaptiveInfo:
      "La edad, el rendimiento, los puntos y la velocidad afectan la dificultad.",
    footballSubtitle:
      "Pon a prueba tus conocimientos y decisiones futbolísticas.",
    youthDevelopment: "Desarrollo de jóvenes jugadores",
    youthDevelopmentText:
      "Contenido para mejorar la comprensión del juego y la toma de decisiones.",
    result: "Resultado",
    pointsEarned: "Puntos obtenidos",
    correct: "Respuestas correctas",
    averageTime: "Tiempo medio",
    playAgain: "Nuevo desafío",
    viewProfile: "Mi perfil",
    globalRanking: "Clasificación mundial",
    rankingSubtitle: "Los jugadores más rápidos y fuertes",
    countryRanking: "País",
    gameRanking: "Juego",
    localRankingInfo:
      "La clasificación actual es local. Una base de datos permitirá una clasificación mundial.",
    player: "Jugador",
    speed: "Velocidad",
    personalitySubtitle:
      "Un viaje para descubrir cómo piensas",
    personalityIntroTitle:
      "¿Realmente te conoces?",
    personalityIntroText:
      "Responde situaciones variadas para recibir un análisis recreativo de tu forma de pensar.",
    personalityDisclaimer:
      "Análisis recreativo, no diagnóstico médico o psicológico.",
    globalNews: "Noticias globales",
    newsSubtitle: "Noticias y contenido mundial",
    newsComing:
      "Las noticias globales se conectarán más adelante.",
    aiSubtitle:
      "Experiencias que evolucionan contigo",
    aiComing: "Sistema IA",
    aiComingText:
      "Zona preparada para experiencias avanzadas de IA.",
    mindGames: "Juegos mentales",
    mindGamesSubtitle:
      "Desafíos diferentes",
    loading: "Cargando...",
    speedBonus: "Bonus de velocidad",
    accuracyBonus: "Bonus de precisión",
    streak: "Racha",
    difficulty: "Dificultad",
    question: "Pregunta",
    timeUp: "¡Tiempo agotado!",
    correctAnswer: "Respuesta correcta",
    wrongAnswer: "Respuesta incorrecta",
    continue: "Continuar",
    score: "Puntuación",
    challengeFinished: "Desafío terminado",
    easy: "Fácil",
    medium: "Medio",
    hard: "Difícil",
    extreme: "Extremo",
    expert: "Experto",
    levelUp: "¡Subiste de nivel!",
    profileSaved: "Perfil guardado",
    enterProfile: "Introduce nombre y edad",
    questionProgress: "Pregunta",
    seconds: "s",
    noPlayers: "No hay jugadores",
    countryNotSet: "No definido",
    analysis: "Análisis",
    beginPersonality: "Comenzar análisis",
    next: "Siguiente",
    personalityComplete: "Análisis completado",
    logical: "Analítico",
    intuitive: "Intuitivo",
    competitive: "Competitivo",
    calm: "Calmado",
    risk: "Arriesgado",
    balanced: "Equilibrado"
  },


  pt: {
    home: "Início",
    challenges: "Desafios",
    football: "Futebol",
    profile: "Perfil",
    ranking: "Ranking",
    who: "Quem sou eu?",
    globalPlayer: "JOGADOR GLOBAL",
    heroTitle: "Está pronto para provar que é o melhor?",
    heroText:
      "Desafios de inteligência, velocidade, memória, futebol e personalidade.",
    startChallenge: "Começar desafio",
    discoverYourself: "Descubra-se",
    currentPlayer: "Jogador atual",
    points: "Pontos",
    level: "Nível",
    globalRank: "Posição",
    smartChallenges: "Desafios inteligentes",
    smartChallengesText: "Teste sua mente",
    footballQuickText: "Desafios de futebol",
    personalityQuickText: "Descubra sua mente",
    rankingQuickText: "Compita com jogadores",
    featuredChallenges: "Desafios em destaque",
    adaptiveDifficulty: "Dificuldade adaptativa",
    adaptiveDifficultyText:
      "A dificuldade evolui conforme idade e desempenho.",
    dynamicQuestions: "Experiência dinâmica",
    dynamicQuestionsText:
      "As perguntas mudam a cada partida.",
    global: "Global",
    globalText:
      "Jogue no seu idioma e compita globalmente.",
    ai: "Inteligência artificial",
    aiText:
      "Base preparada para experiências avançadas de IA.",
    challengeSubtitle:
      "Escolha o desafio que deseja testar",
    all: "Todos",
    intelligence: "Inteligência",
    speed: "Velocidade",
    memory: "Memória",
    psychology: "Psicologia",
    playerProfile: "Perfil do jogador",
    profileSubtitle:
      "Sua identidade e progresso",
    name: "Nome",
    age: "Idade",
    country: "País",
    namePlaceholder: "Digite seu nome",
    save: "Salvar",
    games: "Partidas",
    accuracy: "Precisão",
    nextLevel: "Próximo nível",
    adaptiveInfo:
      "Idade, desempenho, pontos e velocidade influenciam a dificuldade.",
    footballSubtitle:
      "Teste seu conhecimento e tomada de decisão no futebol.",
    youthDevelopment: "Desenvolvimento de jovens jogadores",
    youthDevelopmentText:
      "Conteúdo para melhorar compreensão do jogo e tomada de decisão.",
    result: "Resultado",
    pointsEarned: "Pontos ganhos",
    correct: "Respostas corretas",
    averageTime: "Tempo médio",
    playAgain: "Novo desafio",
    viewProfile: "Meu perfil",
    globalRanking: "Ranking mundial",
    rankingSubtitle: "Os jogadores mais rápidos e fortes",
    countryRanking: "País",
    gameRanking: "Jogo",
    localRankingInfo:
      "O ranking atual é local. Uma base de dados permitirá um ranking mundial.",
    player: "Jogador",
    speed: "Velocidade",
    personalitySubtitle:
      "Uma jornada para descobrir como você pensa",
    personalityIntroTitle:
      "Você realmente se conhece?",
    personalityIntroText:
      "Responda situações variadas para receber uma análise recreativa do seu modo de pensar.",
    personalityDisclaimer:
      "Análise recreativa, não diagnóstico médico ou psicológico.",
    globalNews: "Notícias globais",
    newsSubtitle: "Notícias e conteúdo mundial",
    newsComing:
      "As notícias globais serão conectadas posteriormente.",
    aiSubtitle:
      "Experiências que evoluem com o jogador",
    aiComing: "Sistema IA",
    aiComingText:
      "Área preparada para experiências avançadas de IA.",
    mindGames: "Jogos mentais",
    mindGamesSubtitle:
      "Desafios diferentes",
    loading: "Carregando...",
    speedBonus: "Bônus de velocidade",
    accuracyBonus: "Bônus de precisão",
    streak: "Sequência",
    difficulty: "Dificuldade",
    question: "Pergunta",
    timeUp: "Tempo esgotado!",
    correctAnswer: "Resposta correta",
    wrongAnswer: "Resposta errada",
    continue: "Continuar",
    score: "Pontuação",
    challengeFinished: "Desafio concluído",
    easy: "Fácil",
    medium: "Médio",
    hard: "Difícil",
    extreme: "Extremo",
    expert: "Especialista",
    levelUp: "Subiu de nível!",
    profileSaved: "Perfil salvo",
    enterProfile: "Digite nome e idade",
    questionProgress: "Pergunta",
    seconds: "s",
    noPlayers: "Nenhum jogador",
    countryNotSet: "Não definido",
    analysis: "Análise",
    beginPersonality: "Começar análise",
    next: "Próximo",
    personalityComplete: "Análise concluída",
    logical: "Analítico",
    intuitive: "Intuitivo",
    competitive: "Competitivo",
    calm: "Calmo",
    risk: "Arriscado",
    balanced: "Equilibrado"
  }

};


/* =========================================================
   3. LANGUAGE HELPERS
========================================================= */

function t(key) {

  return (
    translations[currentLanguage] &&
    translations[currentLanguage][key]
  ) || translations.en[key] || key;

}


function applyLanguage() {

  document.documentElement.lang = currentLanguage;

  document.documentElement.dir =
    currentLanguage === "ar"
      ? "rtl"
      : "ltr";


  const selector =
    document.getElementById("language");

  if (selector) {
    selector.value = currentLanguage;
  }


  document
    .querySelectorAll("[data-i18n]")
    .forEach(el => {

      const key = el.dataset.i18n;

      if (translations[currentLanguage][key]) {
        el.textContent = t(key);
      }

    });


  document
    .querySelectorAll("[data-i18n-placeholder]")
    .forEach(el => {

      const key =
        el.dataset.i18nPlaceholder;

      el.placeholder = t(key);

    });


  updateLanguageIcon();
  renderAllGames();
  renderFootballGames();
  renderMindGames();

}


function changeLanguage(language) {

  if (!translations[language]) {
    language = "en";
  }

  currentLanguage = language;

  localStorage.setItem(
    "gc_language",
    language
  );

  applyLanguage();

  showToast(
    t("global") +
    " · " +
    language.toUpperCase()
  );

}


function updateLanguageIcon() {

  const icons = {
    ar: "🇯🇴",
    en: "🇺🇸",
    fr: "🇫🇷",
    es: "🇪🇸",
    pt: "🇧🇷"
  };

  const el =
    document.getElementById("languageIcon");

  if (el) {
    el.textContent =
      icons[currentLanguage] || "🌍";
  }

}


/* =========================================================
   4. DATABASE / PLAYER
========================================================= */

function createDefaultDatabase() {

  return {

    player: {
      name: "",
      age: 18,
      country: "",
      points: 0,
      level: 1,
      games: 0,
      correct: 0,
      totalAnswers: 0,
      totalTime: 0,
      bestStreak: 0,
      categoryStats: {},
      answeredQuestionIds: [],
      difficulty: 1,
      createdAt: Date.now()
    },

    localPlayers: [],

    personality: {
      completed: false,
      history: [],
      dimensions: {
        logical: 0,
        intuitive: 0,
        competitive: 0,
        calm: 0,
        risk: 0
      }
    }

  };

}


function loadDatabase() {

  try {

    const raw =
      localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return createDefaultDatabase();
    }

    const parsed = JSON.parse(raw);

    return {
      ...createDefaultDatabase(),
      ...parsed,
      player: {
        ...createDefaultDatabase().player,
        ...(parsed.player || {})
      },
      personality: {
        ...createDefaultDatabase().personality,
        ...(parsed.personality || {})
      }

    };

  } catch (error) {

    console.error(error);

    return createDefaultDatabase();

  }

}


let database = loadDatabase();


function saveDatabase() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(database)
  );

}


function getPlayer() {

  return database.player;

}


function saveProfile() {

  const name =
    document.getElementById("playerName")?.value
      .trim();

  const age =
    Number(
      document.getElementById("playerAge")?.value
    );

  const country =
    document.getElementById("playerCountry")?.value || "";


  if (!name || !age || age < 5 || age > 100) {

    showToast(t("enterProfile"));

    return;

  }


  database.player.name = name;
  database.player.age = age;
  database.player.country = country;

  saveDatabase();

  updatePlayerUI();

  showToast(t("profileSaved"));

}


function updatePlayerUI() {

  const p = getPlayer();

  const elements = {

    miniName: p.name || "Guest",
    miniPoints: formatNumber(p.points),
    miniLevel: p.level,
    profilePoints: formatNumber(p.points),
    profileLevel: p.level,
    profileGames: p.games,
    profileAccuracy:
      p.totalAnswers
        ? Math.round(
            (p.correct / p.totalAnswers) * 100
          ) + "%"
        : "0%",
    profileSpeed:
      p.totalTime && p.totalAnswers
        ? (
            p.totalTime / p.totalAnswers
          ).toFixed(1) + "s"
        : "—",
    miniRank: getPlayerRank(),
    profileRank: getPlayerRank()

  };


  Object.entries(elements).forEach(
    ([id, value]) => {

      const el =
        document.getElementById(id);

      if (el) {
        el.textContent = value;
      }

    }
  );


  const nameInput =
    document.getElementById("playerName");

  const ageInput =
    document.getElementById("playerAge");

  const countryInput =
    document.getElementById("playerCountry");


  if (nameInput) {
    nameInput.value = p.name || "";
  }

  if (ageInput) {
    ageInput.value = p.age || "";
  }

  if (countryInput) {
    countryInput.value = p.country || "";
  }


  updateProfileProgress();

}


/* =========================================================
   5. GAME DATABASE
========================================================= */

const GAME_DEFINITIONS = [

  {
    id: "brain",
    category: "intelligence",
    icon: "🧠",
    title: {
      ar: "العقل الخفي",
      en: "Hidden Mind",
      fr: "Esprit Caché",
      es: "Mente Oculta",
      pt: "Mente Oculta"
    },
    description: {
      ar: "منطق واستنتاج وأسئلة تربك التفكير التقليدي.",
      en: "Logic, deduction and questions designed to challenge assumptions.",
      fr: "Logique et déduction.",
      es: "Lógica y deducción.",
      pt: "Lógica e dedução."
    }
  },

  {
    id: "speed",
    category: "speed",
    icon: "⚡",
    title: {
      ar: "ردة الفعل",
      en: "Reaction Rush",
      fr: "Réaction",
      es: "Reacción",
      pt: "Reação"
    },
    description: {
      ar: "أجب بأسرع ما تستطيع.",
      en: "Answer as fast as you can.",
      fr: "Répondez le plus vite possible.",
      es: "Responde lo más rápido posible.",
      pt: "Responda o mais rápido possível."
    }
  },

  {
    id: "memory",
    category: "memory",
    icon: "🧩",
    title: {
      ar: "ذاكرة خارقة",
      en: "Memory Core",
      fr: "Mémoire",
      es: "Memoria",
      pt: "Memória"
    },
    description: {
      ar: "اختبر قدرتك على تذكر التفاصيل.",
      en: "Test your ability to remember details.",
      fr: "Testez votre mémoire.",
      es: "Pon a prueba tu memoria.",
      pt: "Teste sua memória."
    }
  },

  {
    id: "football",
    category: "football",
    icon: "⚽",
    title: {
      ar: "عبقري كرة القدم",
      en: "Football Genius",
      fr: "Génie du Football",
      es: "Genio del Fútbol",
      pt: "Gênio do Futebol"
    },
    description: {
      ar: "مواقف وقرارات وفهم تكتيكي لكرة القدم.",
      en: "Football situations, decisions and tactical thinking.",
      fr: "Situations et décisions footballistiques.",
      es: "Situaciones y decisiones de fútbol.",
      pt: "Situações e decisões de futebol."
    }
  },

  {
    id: "trap",
    category: "intelligence",
    icon: "🎭",
    title: {
      ar: "فخ التفكير",
      en: "Mind Trap",
      fr: "Piège Mental",
      es: "Trampa Mental",
      pt: "Armadilha Mental"
    },
    description: {
      ar: "أسئلة تبدو سهلة لكنها تختبر طريقة تفكيرك.",
      en: "Questions that look easy but test your thinking.",
      fr: "Des questions qui piègent votre raisonnement.",
      es: "Preguntas que engañan tu razonamiento.",
      pt: "Perguntas que desafiam seu raciocínio."
    }
  },

  {
    id: "psychology",
    category: "psychology",
    icon: "🧬",
    title: {
      ar: "من أنا؟",
      en: "Who Am I?",
      fr: "Qui suis-je ?",
      es: "¿Quién soy?",
      pt: "Quem sou eu?"
    },
    description: {
      ar: "مواقف تكشف أنماط اتخاذ القرار.",
      en: "Situations exploring your decision patterns.",
      fr: "Explorez vos habitudes de décision.",
      es: "Explora tus patrones de decisión.",
      pt: "Explore seus padrões de decisão."
    }
  }

];


/* =========================================================
   6. QUESTION BANK
========================================================= */

const QUESTIONS = [

  /* ---------------- BRAIN ---------------- */

  {
    id: "brain_01",
    game: "brain",
    difficulty: 1,
    question: {
      ar: "إذا كان لديك 3 تفاحات وأخذت تفاحتين، كم تفاحة أصبحت تملك؟",
      en: "If you have 3 apples and take 2 apples, how many apples do you have?",
      fr: "Si vous avez 3 pommes et en prenez 2, combien en avez-vous ?",
      es: "Si tienes 3 manzanas y tomas 2, ¿cuántas tienes?",
      pt: "Se você tem 3 maçãs e pega 2, quantas você tem?"
    },
    answers: {
      ar: ["1", "2", "3", "5"],
      en: ["1", "2", "3", "5"],
      fr: ["1", "2", "3", "5"],
      es: ["1", "2", "3", "5"],
      pt: ["1", "2", "3", "5"]
    },
    correct: 1
  },

  {
    id: "brain_02",
    game: "brain",
    difficulty: 2,
    question: {
      ar: "ما الرقم التالي؟ 2، 4، 8، 16، ؟",
      en: "What comes next? 2, 4, 8, 16, ?",
      fr: "Quel nombre vient ensuite ? 2, 4, 8, 16, ?",
      es: "¿Qué número sigue? 2, 4, 8, 16, ?",
      pt: "Qual é o próximo número? 2, 4, 8, 16, ?"
    },
    answers: {
      ar: ["18", "24", "32", "34"],
      en: ["18", "24", "32", "34"],
      fr: ["18", "24", "32", "34"],
      es: ["18", "24", "32", "34"],
      pt: ["18", "24", "32", "34"]
    },
    correct: 2
  },

  {
    id: "brain_03",
    game: "brain",
    difficulty: 3,
    question: {
      ar: "إذا تجاوزت الشخص صاحب المركز الثاني في سباق، فأي مركز تصبح فيه؟",
      en: "If you overtake the person in second place, what place are you in?",
      fr: "Si vous dépassez la personne en deuxième position, quelle position occupez-vous ?",
      es: "Si adelantas al segundo, ¿en qué posición quedas?",
      pt: "Se você ultrapassar o segundo colocado, em que posição fica?"
    },
    answers: {
      ar: ["الأول", "الثاني", "الثالث", "الأخير"],
      en: ["First", "Second", "Third", "Last"],
      fr: ["Premier", "Deuxième", "Troisième", "Dernier"],
      es: ["Primero", "Segundo", "Tercero", "Último"],
      pt: ["Primeiro", "Segundo", "Terceiro", "Último"]
    },
    correct: 1
  },

  {
    id: "brain_04",
    game: "brain",
    difficulty: 4,
    question: {
      ar: "رجل ينظر إلى صورة ويقول: ليس لدي إخوة أو أخوات، لكن والد هذا الرجل هو ابن أبي. من في الصورة؟",
      en: "A man says: I have no brothers or sisters, but this man's father is my father's son. Who is in the picture?",
      fr: "Un homme dit : Je n'ai ni frère ni sœur, mais le père de cet homme est le fils de mon père. Qui est sur la photo ?",
      es: "Un hombre dice: no tengo hermanos, pero el padre de este hombre es hijo de mi padre. ¿Quién aparece?",
      pt: "Um homem diz: não tenho irmãos, mas o pai deste homem é filho do meu pai. Quem está na foto?"
    },
    answers: {
      ar: ["والده", "ابنه", "أخوه", "صديقه"],
      en: ["His father", "His son", "His brother", "His friend"],
      fr: ["Son père", "Son fils", "Son frère", "Son ami"],
      es: ["Su padre", "Su hijo", "Su hermano", "Su amigo"],
      pt: ["Seu pai", "Seu filho", "Seu irmão", "Seu amigo"]
    },
    correct: 1
  },

  /* ---------------- SPEED ---------------- */

  {
    id: "speed_01",
    game: "speed",
    difficulty: 1,
    question: {
      ar: "أي كلمة مختلفة؟",
      en: "Which word is different?",
      fr: "Quel mot est différent ?",
      es: "¿Qué palabra es diferente?",
      pt: "Qual palavra é diferente?"
    },
    answers: {
      ar: ["تفاحة", "برتقال", "موز", "سيارة"],
      en: ["Apple", "Orange", "Banana", "Car"],
      fr: ["Pomme", "Orange", "Banane", "Voiture"],
      es: ["Manzana", "Naranja", "Plátano", "Coche"],
      pt: ["Maçã", "Laranja", "Banana", "Carro"]
    },
    correct: 3
  },

  {
    id: "speed_02",
    game: "speed",
    difficulty: 2,
    question: {
      ar: "أي رقم أكبر؟",
      en: "Which number is larger?",
      fr: "Quel nombre est le plus grand ?",
      es: "¿Qué número es mayor?",
      pt: "Qual número é maior?"
    },
    answers: {
      ar: ["47", "74", "44", "67"],
      en: ["47", "74", "44", "67"],
      fr: ["47", "74", "44", "67"],
      es: ["47", "74", "44", "67"],
      pt: ["47", "74", "44", "67"]
    },
    correct: 1
  },

  {
    id: "speed_03",
    game: "speed",
    difficulty: 3,
    question: {
      ar: "أي خيار يحتوي على الرقم 7؟",
      en: "Which option contains number 7?",
      fr: "Quelle option contient le chiffre 7 ?",
      es: "¿Qué opción contiene el número 7?",
      pt: "Qual opção contém o número 7?"
    },
    answers: {
      ar: ["3582", "4619", "9257", "1834"],
      en: ["3582", "4619", "9257", "1834"],
      fr: ["3582", "4619", "9257", "1834"],
      es: ["3582", "4619", "9257", "1834"],
      pt: ["3582", "4619", "9257", "1834"]
    },
    correct: 2
  },

  /* ---------------- MEMORY ---------------- */

  {
    id: "memory_01",
    game: "memory",
    difficulty: 1,
    question: {
      ar: "أي لون كان موجودًا في التسلسل؟ 🔴 🔵 🟢",
      en: "Which color appeared in the sequence? 🔴 🔵 🟢",
      fr: "Quelle couleur était dans la séquence ? 🔴 🔵 🟢",
      es: "¿Qué color apareció en la secuencia? 🔴 🔵 🟢",
      pt: "Qual cor apareceu na sequência? 🔴 🔵 🟢"
    },
    answers: {
      ar: ["أحمر", "أصفر", "أسود", "أبيض"],
      en: ["Red", "Yellow", "Black", "White"],
      fr: ["Rouge", "Jaune", "Noir", "Blanc"],
      es: ["Rojo", "Amarillo", "Negro", "Blanco"],
      pt: ["Vermelho", "Amarelo", "Preto", "Branco"]
    },
    correct: 0
  },

  {
    id: "memory_02",
    game: "memory",
    difficulty: 2,
    question: {
      ar: "احفظ: 4 - 8 - 2 - 9. ما الرقم الثاني؟",
      en: "Remember: 4 - 8 - 2 - 9. What was the second number?",
      fr: "Mémorisez : 4 - 8 - 2 - 9. Quel était le deuxième nombre ?",
      es: "Recuerda: 4 - 8 - 2 - 9. ¿Cuál era el segundo?",
      pt: "Lembre: 4 - 8 - 2 - 9. Qual era o segundo?"
    },
    answers: {
      ar: ["4", "8", "2", "9"],
      en: ["4", "8", "2", "9"],
      fr: ["4", "8", "2", "9"],
      es: ["4", "8", "2", "9"],
      pt: ["4", "8", "2", "9"]
    },
    correct: 1
  },

  {
    id: "memory_03",
    game: "memory",
    difficulty: 3,
    question: {
      ar: "أي تسلسل مطابق تمامًا؟ 7-2-9-4",
      en: "Which sequence matches exactly? 7-2-9-4",
      fr: "Quelle séquence correspond exactement ? 7-2-9-4",
      es: "¿Qué secuencia coincide exactamente? 7-2-9-4",
      pt: "Qual sequência corresponde exatamente? 7-2-9-4"
    },
    answers: {
      ar: ["7-9-2-4", "7-2-9-4", "2-7-9-4", "7-2-4-9"],
      en: ["7-9-2-4", "7-2-9-4", "2-7-9-4", "7-2-4-9"],
      fr: ["7-9-2-4", "7-2-9-4", "2-7-9-4", "7-2-4-9"],
      es: ["7-9-2-4", "7-2-9-4", "2-7-9-4", "7-2-4-9"],
      pt: ["7-9-2-4", "7-2-9-4", "2-7-9-4", "7-2-4-9"]
    },
    correct: 1
  },

  /* ---------------- FOOTBALL ---------------- */

  {
    id: "football_01",
    game: "football",
    difficulty: 1,
    question: {
      ar: "كم لاعبًا يبدأ به فريق كرة القدم داخل الملعب؟",
      en: "How many players start on the pitch for one football team?",
      fr: "Combien de joueurs composent une équipe sur le terrain au départ ?",
      es: "¿Cuántos jugadores comienzan en el campo por equipo?",
      pt: "Quantos jogadores começam em campo por equipe?"
    },
    answers: {
      ar: ["9", "10", "11", "12"],
      en: ["9", "10", "11", "12"],
      fr: ["9", "10", "11", "12"],
      es: ["9", "10", "11", "12"],
      pt: ["9", "10", "11", "12"]
    },
    correct: 2
  },

  {
    id: "football_02",
    game: "football",
    difficulty: 2,
    question: {
      ar: "ماذا يعني التحول السريع من الدفاع إلى الهجوم؟",
      en: "What does a quick transition from defense to attack mean?",
      fr: "Que signifie une transition rapide de la défense vers l'attaque ?",
      es: "¿Qué significa una transición rápida de defensa a ataque?",
      pt: "O que significa uma transição rápida da defesa para o ataque?"
    },
    answers: {
      ar: [
        "تراجع كامل",
        "استغلال المساحات بسرعة",
        "إيقاف اللعب",
        "تغيير الحكم"
      ],
      en: [
        "Full retreat",
        "Quickly exploiting space",
        "Stopping play",
        "Changing the referee"
      ],
      fr: [
        "Repli total",
        "Exploiter rapidement les espaces",
        "Arrêter le jeu",
        "Changer l'arbitre"
      ],
      es: [
        "Repliegue total",
        "Explotar rápidamente los espacios",
        "Detener el juego",
        "Cambiar al árbitro"
      ],
      pt: [
        "Recuo total",
        "Explorar rapidamente os espaços",
        "Parar o jogo",
        "Trocar o árbitro"
      ]
    },
    correct: 1
  },

  {
    id: "football_03",
    game: "football",
    difficulty: 3,
    question: {
      ar: "عندما يضغط الفريق عاليًا، ما الهدف الأساسي؟",
      en: "When a team presses high, what is the main objective?",
      fr: "Quel est l'objectif principal d'un pressing haut ?",
      es: "¿Cuál es el objetivo principal de una presión alta?",
      pt: "Qual é o principal objetivo da pressão alta?"
    },
    answers: {
      ar: [
        "منح الخصم وقتًا أكبر",
        "استعادة الكرة قريبًا من مرمى الخصم",
        "العودة دائمًا للخلف",
        "إضاعة الوقت"
      ],
      en: [
        "Give the opponent more time",
        "Recover the ball close to the opponent goal",
        "Always drop back",
        "Waste time"
      ],
      fr: [
        "Donner plus de temps à l'adversaire",
        "Récupérer le ballon près du but adverse",
        "Toujours reculer",
        "Gagner du temps"
      ],
      es: [
        "Dar más tiempo al rival",
        "Recuperar el balón cerca de su portería",
        "Retroceder siempre",
        "Perder tiempo"
      ],
      pt: [
        "Dar mais tempo ao adversário",
        "Recuperar a bola perto do gol adversário",
        "Sempre recuar",
        "Gastar tempo"
      ]
    },
    correct: 1
  },

  {
    id: "football_04",
    game: "football",
    difficulty: 4,
    question: {
      ar: "فريقك فقد الكرة والظهير الأيسر متقدم جدًا. ما الأولوية التكتيكية الأولى؟",
      en: "Your team loses the ball while the left-back is very high. What is the first tactical priority?",
      fr: "Votre équipe perd le ballon avec le latéral gauche très haut. Quelle est la première priorité tactique ?",
      es: "Tu equipo pierde el balón con el lateral izquierdo muy adelantado. ¿Cuál es la prioridad?",
      pt: "Sua equipe perde a bola com o lateral esquerdo muito avançado. Qual é a prioridade?"
    },
    answers: {
      ar: [
        "فتح الجناح أكثر",
        "تأمين المساحة خلف الظهير",
        "إيقاف المهاجم",
        "رفع خط الدفاع أكثر دون تغطية"
      ],
      en: [
        "Open the wing wider",
        "Protect the space behind the full-back",
        "Stop the striker",
        "Push the line higher without cover"
      ],
      fr: [
        "Élargir l'aile",
        "Protéger l'espace derrière le latéral",
        "Arrêter l'attaquant",
        "Monter sans couverture"
      ],
      es: [
        "Abrir más la banda",
        "Proteger el espacio detrás del lateral",
        "Detener al delantero",
        "Subir sin cobertura"
      ],
      pt: [
        "Abrir mais o corredor",
        "Proteger o espaço atrás do lateral",
        "Parar o atacante",
        "Subir sem cobertura"
      ]
    },
    correct: 1
  },

  /* ---------------- TRAPS ---------------- */

  {
    id: "trap_01",
    game: "trap",
    difficulty: 2,
    question: {
      ar: "أي شهر يحتوي على 28 يومًا؟",
      en: "Which month has 28 days?",
      fr: "Quel mois compte 28 jours ?",
      es: "¿Qué mes tiene 28 días?",
      pt: "Qual mês tem 28 dias?"
    },
    answers: {
      ar: [
        "فبراير فقط",
        "يناير فقط",
        "كل الشهور",
        "مارس فقط"
      ],
      en: [
        "February only",
        "January only",
        "Every month",
        "March only"
      ],
      fr: [
        "Février seulement",
        "Janvier seulement",
        "Tous les mois",
        "Mars seulement"
      ],
      es: [
        "Solo febrero",
        "Solo enero",
        "Todos los meses",
        "Solo marzo"
      ],
      pt: [
        "Somente fevereiro",
        "Somente janeiro",
        "Todos os meses",
        "Somente março"
      ]
    },
    correct: 2
  },

  {
    id: "trap_02",
    game: "trap",
    difficulty: 3,
    question: {
      ar: "لديك عودان، كل عود يحترق خلال ساعة، لكن الاحتراق غير منتظم. كيف تقيس 45 دقيقة؟",
      en: "Two ropes each burn in one hour, but unevenly. How can you measure 45 minutes?",
      fr: "Deux cordes brûlent chacune en une heure, irrégulièrement. Comment mesurer 45 minutes ?",
      es: "Dos cuerdas tardan una hora en quemarse, de forma irregular. ¿Cómo medir 45 minutos?",
      pt: "Duas cordas queimam em uma hora, de forma irregular. Como medir 45 minutos?"
    },
    answers: {
      ar: [
        "إشعال طرف من الأولى فقط",
        "إشعال طرفي الأولى وطرف واحد من الثانية، ثم إشعال الطرف الآخر للثانية عند انتهاء الأولى",
        "إشعال الثانية فقط",
        "لا يمكن"
      ],
      en: [
        "Light one end of the first",
        "Light both ends of the first and one end of the second, then light the second end when the first finishes",
        "Light only the second",
        "Impossible"
      ],
      fr: [
        "Allumer une extrémité",
        "Allumer les deux extrémités de la première et une de la seconde, puis l'autre de la seconde",
        "Allumer seulement la seconde",
        "Impossible"
      ],
      es: [
        "Encender un extremo",
        "Encender ambos extremos de la primera y uno de la segunda, luego el otro",
        "Encender solo la segunda",
        "Imposible"
      ],
      pt: [
        "Acender uma ponta",
        "Acender as duas pontas da primeira e uma da segunda, depois a outra",
        "Acender somente a segunda",
        "Impossível"
      ]
    },
    correct: 1
  },

  {
    id: "trap_03",
    game: "trap",
    difficulty: 4,
    question: {
      ar: "أنت تقود حافلة. صعد 8، نزل 3، صعد 5. ما اسم السائق؟",
      en: "You are driving a bus. 8 get on, 3 get off, 5 get on. What is the driver's name?",
      fr: "Vous conduisez un bus. 8 montent, 3 descendent, 5 montent. Quel est le nom du conducteur ?",
      es: "Conduces un autobús. Suben 8, bajan 3 y suben 5. ¿Cómo se llama el conductor?",
      pt: "Você dirige um ônibus. 8 entram, 3 saem e 5 entram. Qual é o nome do motorista?"
    },
    answers: {
      ar: ["لا نعرف", "رائف", "السائق هو أنت", "خمسة"],
      en: ["Unknown", "Raef", "You are the driver", "Five"],
      fr: ["Inconnu", "Raef", "Vous êtes le conducteur", "Cinq"],
      es: ["No se sabe", "Raef", "Tú eres el conductor", "Cinco"],
      pt: ["Desconhecido", "Raef", "Você é o motorista", "Cinco"]
    },
    correct: 2
  },

  /* ---------------- EXTRA ADAPTIVE ---------------- */

  {
    id: "brain_05",
    game: "brain",
    difficulty: 5,
    question: {
      ar: "إذا كان كل A هو B، وبعض B هو C، هل نستطيع التأكد أن بعض A هو C؟",
      en: "If every A is B and some B is C, can we conclude that some A is C?",
      fr: "Si tout A est B et que certains B sont C, peut-on conclure que certains A sont C ?",
      es: "Si todo A es B y algunos B son C, ¿podemos concluir que algunos A son C?",
      pt: "Se todo A é B e alguns B são C, podemos concluir que algum A é C?"
    },
    answers: {
      ar: ["نعم دائمًا", "لا، ليس بالضرورة", "نعم إذا كان A كبيرًا", "لا يوجد حل"],
      en: ["Always yes", "No, not necessarily", "Yes if A is large", "No solution"],
      fr: ["Toujours oui", "Non, pas nécessairement", "Oui si A est grand", "Aucune solution"],
      es: ["Siempre sí", "No necesariamente", "Sí si A es grande", "No hay solución"],
      pt: ["Sempre sim", "Não necessariamente", "Sim se A for grande", "Sem solução"]
    },
    correct: 1
  },

  {
    id: "brain_06",
    game: "brain",
    difficulty: 5,
    question: {
      ar: "ما العدد الذي يكمل النمط؟ 1، 1، 2، 3، 5، 8، ؟",
      en: "What number completes the pattern? 1, 1, 2, 3, 5, 8, ?",
      fr: "Quel nombre complète la suite ? 1, 1, 2, 3, 5, 8, ?",
      es: "¿Qué número completa la secuencia? 1, 1, 2, 3, 5, 8, ?",
      pt: "Qual número completa a sequência? 1, 1, 2, 3, 5, 8, ?"
    },
    answers: {
      ar: ["10", "11", "13", "15"],
      en: ["10", "11", "13", "15"],
      fr: ["10", "11", "13", "15"],
      es: ["10", "11", "13", "15"],
      pt: ["10", "11", "13", "15"]
    },
    correct: 2
  },

  {
    id: "speed_04",
    game: "speed",
    difficulty: 4,
    question: {
      ar: "أي رقم يظهر مرتين؟ 38174638",
      en: "Which digit appears twice? 38174638",
      fr: "Quel chiffre apparaît deux fois ? 38174638",
      es: "¿Qué número aparece dos veces? 38174638",
      pt: "Qual número aparece duas vezes? 38174638"
    },
    answers: {
      ar: ["1", "3", "7", "6"],
      en: ["1", "3", "7", "6"],
      fr: ["1", "3", "7", "6"],
      es: ["1", "3", "7", "6"],
      pt: ["1", "3", "7", "6"]
    },
    correct: 1
  },

  {
    id: "football_05",
    game: "football",
    difficulty: 5,
    question: {
      ar: "إذا كان قلب الدفاع يخرج للضغط على المهاجم، ما الخطر الأكبر إذا لم توجد تغطية؟",
      en: "If a center-back steps out to press the striker, what is the biggest risk without cover?",
      fr: "Si un défenseur central sort presser l'attaquant, quel est le plus grand risque sans couverture ?",
      es: "Si un central sale a presionar al delantero, ¿cuál es el mayor riesgo sin cobertura?",
      pt: "Se um zagueiro sai para pressionar o atacante, qual é o maior risco sem cobertura?"
    },
    answers: {
      ar: [
        "زيادة الاستحواذ",
        "ظهور مساحة خلفه يمكن استغلالها",
        "زيادة عدد اللاعبين",
        "إيقاف المباراة"
      ],
      en: [
        "More possession",
        "Space behind him can be exploited",
        "More players",
        "Stopping the match"
      ],
      fr: [
        "Plus de possession",
        "L'espace derrière lui peut être exploité",
        "Plus de joueurs",
        "Arrêter le match"
      ],
      es: [
        "Más posesión",
        "Espacio detrás de él",
        "Más jugadores",
        "Detener el partido"
      ],
      pt: [
        "Mais posse",
        "Espaço atrás dele pode ser explorado",
        "Mais jogadores",
        "Parar a partida"
      ]
    },
    correct: 1
  }

];


/* =========================================================
   7. GAME RENDERING
========================================================= */

function getGameText(game, field) {

  return (
    game[field]?.[currentLanguage] ||
    game[field]?.en ||
    ""
  );

}


function renderAllGames() {

  const container =
    document.getElementById("games");

  const allContainer =
    document.getElementById("allGames");

  if (container) {

    container.innerHTML =
      GAME_DEFINITIONS
        .slice(0, 4)
        .map(gameCardHTML)
        .join("");

  }


  if (allContainer) {

    allContainer.innerHTML =
      GAME_DEFINITIONS
        .map(gameCardHTML)
        .join("");

  }

}


function renderFootballGames() {

  const container =
    document.getElementById("footballGames");

  if (!container) return;

  const footballGames =
    GAME_DEFINITIONS.filter(
      game =>
        game.category === "football"
    );

  container.innerHTML =
    footballGames
      .map(gameCardHTML)
      .join("");

}


function renderMindGames() {

  const container =
    document.getElementById("mindGamesContainer");

  if (!container) return;

  const games =
    GAME_DEFINITIONS.filter(
      game =>
        game.category === "intelligence" ||
        game.category === "psychology"
    );

  container.innerHTML =
    games
      .map(gameCardHTML)
      .join("");

}


function gameCardHTML(game) {

  const title =
    getGameText(game, "title");

  const description =
    getGameText(game, "description");

  const questionCount =
    QUESTIONS.filter(
      q => q.game === game.id
    ).length;


  return `

    <article
      class="game-card"
      data-category="${game.category}">

      <div class="game-card-icon">
        ${game.icon}
      </div>

      <div class="game-card-body">

        <div class="game-card-category">
          ${t(game.category)}
        </div>

        <h3>
          ${escapeHTML(title)}
        </h3>

        <p>
          ${escapeHTML(description)}
        </p>

        <div class="game-card-meta">

          <span>
            🎯 ${questionCount || 10}+
          </span>

          <span>
            ⏱️
            ${getGameBaseTime(game.id)}${t("seconds")}
          </span>

          <span>
            🔥
            ${t(getDifficultyKey(getPlayerDifficulty()))}
          </span>

        </div>

        <button
          class="main-button"
          type="button"
          onclick="startGame('${game.id}')">

          ▶️
          ${t("startChallenge")}

        </button>

      </div>

    </article>

  `;

}


function filterGames(category) {

  document
    .querySelectorAll(".filter")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.category === category
      );

    });


  document
    .querySelectorAll(".game-card")
    .forEach(card => {

      if (category === "all") {

        card.style.display = "";

      } else {

        card.style.display =
          card.dataset.category === category
            ? ""
            : "none";

      }

    });

}


/* =========================================================
   8. ADAPTIVE DIFFICULTY
========================================================= */

function getAgeModifier(age) {

  if (age <= 8) return 0;
  if (age <= 12) return 0.5;
  if (age <= 15) return 1;
  if (age <= 18) return 1.5;
  if (age <= 25) return 2;
  if (age <= 35) return 2.5;
  if (age <= 50) return 3;
  return 3.5;

}


function getPerformanceModifier() {

  const p = getPlayer();

  if (!p.totalAnswers) {
    return 0;
  }


  const accuracy =
    p.correct / p.totalAnswers;

  const avgTime =
    p.totalTime / p.totalAnswers;


  let modifier = 0;


  if (accuracy >= 0.85) {
    modifier += 1.5;
  } else if (accuracy >= 0.70) {
    modifier += 0.75;
  } else if (accuracy < 0.45) {
    modifier -= 1;
  }


  if (avgTime <= 5) {
    modifier += 1;
  } else if (avgTime <= 9) {
    modifier += 0.5;
  } else if (avgTime > 18) {
    modifier -= 0.5;
  }


  return modifier;

}


function getPlayerDifficulty() {

  const p = getPlayer();

  const raw =
    1 +
    (p.level - 1) * 0.35 +
    getAgeModifier(p.age) * 0.35 +
    getPerformanceModifier();


  return clamp(
    Math.round(raw),
    1,
    5
  );

}


function getDifficultyKey(level) {

  if (level <= 1) return "easy";
  if (level === 2) return "medium";
  if (level === 3) return "hard";
  if (level === 4) return "extreme";

  return "expert";

}


/* =========================================================
   9. QUESTION SELECTION
========================================================= */

function getQuestionCount() {

  /*
     Minimum challenge = 10 questions.
     The system can grow to 15 based on player level.
  */

  const p = getPlayer();

  return clamp(
    10 + Math.floor(p.level / 5),
    10,
    15
  );

}


function selectQuestions(gameId) {

  const p = getPlayer();

  const targetDifficulty =
    getPlayerDifficulty();


  let pool =
    QUESTIONS.filter(
      q => q.game === gameId
    );


  if (!pool.length) {
    return [];
  }


  /*
     Prefer questions close to the player's
     adaptive difficulty.
  */

  pool.sort(
    (a, b) =>
      Math.abs(
        a.difficulty - targetDifficulty
      ) -
      Math.abs(
        b.difficulty - targetDifficulty
      )
  );


  /*
     Randomization keeps the experience fresh.
  */

  pool =
    weightedShuffle(pool);


  /*
     Never repeat the same question inside
     one player's recent history when possible.
  */

  const unused =
    pool.filter(
      q =>
        !p.answeredQuestionIds.includes(q.id)
    );


  let source =
    unused.length >= Math.min(10, pool.length)
      ? unused
      : pool;


  /*
     Ensure different difficulty levels
     when enough questions exist.
  */

  source =
    source.sort(
      () => Math.random() - 0.5
    );


  let selected = [];


  for (const question of source) {

    if (selected.length >= getQuestionCount()) {
      break;
    }

    selected.push(
      cloneQuestion(question)
    );

  }


  /*
     If there are not enough unique questions,
     repeat only after the unique pool is exhausted.
  */

  while (
    selected.length < getQuestionCount()
  ) {

    const extra =
      cloneQuestion(
        pool[
          Math.floor(
            Math.random() * pool.length
          )
        ]
      );

    selected.push(extra);

  }


  /*
     Randomize answer positions while
     preserving the correct answer.
  */

  selected =
    selected.map(
      shuffleAnswers
    );


  return selected;

}


function cloneQuestion(question) {

  return JSON.parse(
    JSON.stringify(question)
  );

}


function shuffleAnswers(question) {

  const answers =
    question.answers[currentLanguage] ||
    question.answers.en;

  const correctValue =
    answers[question.correct];


  const shuffled =
    answers
      .map(
        value => ({
          value,
          sort: Math.random()
        })
      )
      .sort(
        (a, b) => a.sort - b.sort
      )
      .map(
        item => item.value
      );


  question.correct =
    shuffled.indexOf(correctValue);

  return question;

}


function weightedShuffle(array) {

  return [...array].sort(
    () => Math.random() - 0.5
  );

}


/* =========================================================
   10. START GAME
========================================================= */

function startGame(gameId) {

  const p = getPlayer();

  if (!p.name || !p.age) {

    showPage("profile");

    showToast(t("enterProfile"));

    return;

  }


  const game =
    GAME_DEFINITIONS.find(
      item => item.id === gameId
    );


  if (!game) return;


  currentGame = game;

  currentQuestionIndex = 0;
  currentScore = 0;
  currentCorrect = 0;
  currentStreak = 0;
  currentTimes = [];
  currentQuestions =
    selectQuestions(gameId);


  answerLocked = false;


  if (!currentQuestions.length) {
    showToast("No questions");
    return;
  }


  showPage("quiz");

  renderQuizHeader();

  loadQuestion();

}


function renderQuizHeader() {

  const game = currentGame;

  const title =
    getGameText(game, "title");


  const icon =
    document.getElementById("gameIcon");

  const titleEl =
    document.getElementById("quizTitle");

  const category =
    document.getElementById("quizCategory");


  if (icon) {
    icon.textContent = game.icon;
  }

  if (titleEl) {
    titleEl.textContent = title;
  }

  if (category) {
    category.textContent =
      t(game.category);
  }

}


/* =========================================================
   11. LOAD QUESTION
========================================================= */

function loadQuestion() {

  clearTimers();

  answerLocked = false;


  const question =
    currentQuestions[
      currentQuestionIndex
    ];


  if (!question) {

    finishGame();

    return;

  }


  const answers =
    question.answers[currentLanguage] ||
    question.answers.en;


  const questionEl =
    document.getElementById("question");

  const answersEl =
    document.getElementById("answers");

  const counter =
    document.getElementById("questionCounter");

  const progress =
    document.getElementById("progressBar");

  const difficulty =
    document.getElementById("questionDifficulty");

  const difficultyLabel =
    document.getElementById("difficultyLabel");

  const streak =
    document.getElementById("quizStreak");

  const feedback =
    document.getElementById("feedback");


  if (questionEl) {

    questionEl.textContent =
      question.question[currentLanguage] ||
      question.question.en;

  }


  if (counter) {

    counter.textContent =
      `${t("question")} ${
        currentQuestionIndex + 1
      } / ${currentQuestions.length}`;

  }


  if (progress) {

    progress.style.width =
      `${
        (
          currentQuestionIndex /
          currentQuestions.length
        ) * 100
      }%`;

  }


  if (difficulty) {

    difficulty.textContent =
      `${t("difficulty")}: ${
        t(
          getDifficultyKey(
            question.difficulty
          )
        )
      }`;

  }


  if (difficultyLabel) {

    difficultyLabel.textContent =
      question.difficulty;

  }


  if (streak) {
    streak.textContent =
      currentStreak;
  }


  if (feedback) {
    feedback.textContent = "";
    feedback.className =
      "feedback";
  }


  if (answersEl) {

    answersEl.innerHTML =
      answers
        .map(
          (answer, index) => `

          <button
            class="answer-button"
            type="button"
            data-index="${index}"
            onclick="answerQuestion(${index})">

            <span class="answer-number">
              ${String.fromCharCode(65 + index)}
            </span>

            <span>
              ${escapeHTML(answer)}
            </span>

          </button>

        `
        )
        .join("");

  }


  const duration =
    getQuestionTime(question);


  startTimer(duration);

  questionStartedAt =
    performance.now();

}


/* =========================================================
   12. TIMER
========================================================= */

function getGameBaseTime(gameId) {

  const times = {
    brain: 25,
    speed: 12,
    memory: 20,
    football: 25,
    trap: 30,
    psychology: 30
  };

  return times[gameId] || 25;

}


function getQuestionTime(question) {

  const base =
    getGameBaseTime(
      question.game
    );


  /*
     Harder questions receive slightly more time,
     but speed games stay fast.
  */

  const adjustment =
    question.game === "speed"
      ? (question.difficulty - 1) * 1
      : (question.difficulty - 1) * 3;


  return clamp(
    Math.round(
      base + adjustment
    ),
    8,
    45
  );

}


function startTimer(seconds) {

  clearTimers();

  timeLeft = seconds;

  updateTimerUI();


  timerInterval =
    setInterval(
      () => {

        timeLeft--;

        updateTimerUI();


        if (timeLeft <= 0) {

          clearTimers();

          handleTimeUp();

        }

      },
      1000
    );

}


function updateTimerUI() {

  const timer =
    document.getElementById("timer");

  if (!timer) return;


  timer.textContent =
    timeLeft;


  timer.classList.toggle(
    "danger",
    timeLeft <= 5
  );


  timer.classList.toggle(
    "warning",
    timeLeft <= 10 &&
    timeLeft > 5
  );

}


function clearTimers() {

  if (timerInterval) {

    clearInterval(
      timerInterval
    );

    timerInterval = null;

  }


  if (questionTimeout) {

    clearTimeout(
      questionTimeout
    );

    questionTimeout = null;

  }

}


/* =========================================================
   13. ANSWER ENGINE
========================================================= */

function answerQuestion(selectedIndex) {

  if (answerLocked) {
    return;
  }


  answerLocked = true;

  clearTimers();


  const question =
    currentQuestions[
      currentQuestionIndex
    ];


  if (!question) return;


  const elapsed =
    Math.max(
      0,
      (performance.now() -
        questionStartedAt) / 1000
    );


  currentTimes.push(elapsed);


  const buttons =
    document.querySelectorAll(
      ".answer-button"
    );


  const correctIndex =
    question.correct;


  const isCorrect =
    selectedIndex === correctIndex;


  buttons.forEach(
    button => {

      const index =
        Number(
          button.dataset.index
        );

      button.disabled = true;


      if (index === correctIndex) {

        button.classList.add(
          "correct"
        );

      }


      if (
        index === selectedIndex &&
        !isCorrect
      ) {

        button.classList.add(
          "wrong"
        );

      }

    }
  );


  const feedback =
    document.getElementById("feedback");


  if (isCorrect) {

    currentCorrect++;
    currentStreak++;


    if (
      currentStreak >
      getPlayer().bestStreak
    ) {

      getPlayer().bestStreak =
        currentStreak;

    }


    const points =
      calculateQuestionPoints(
        question,
        elapsed
      );


    currentScore += points;


    if (feedback) {

      feedback.textContent =
        `✓ ${t("correctAnswer")} +${points}`;

      feedback.className =
        "feedback correct";

    }

  } else {

    currentStreak = 0;


    if (feedback) {

      feedback.textContent =
        `✕ ${t("wrongAnswer")}`;

      feedback.className =
        "feedback wrong";

    }

  }


  updateQuestionStats(
    question,
    isCorrect,
    elapsed
  );


  const streak =
    document.getElementById("quizStreak");

  if (streak) {
    streak.textContent =
      currentStreak;
  }


  /*
     Required behavior:
     The correct/wrong state remains visible
     for approximately two seconds.
  */

  questionTimeout =
    setTimeout(
      () => {

        currentQuestionIndex++;

        loadQuestion();

      },
      2000
    );

}


function handleTimeUp() {

  if (answerLocked) {
    return;
  }


  answerLocked = true;


  const question =
    currentQuestions[
      currentQuestionIndex
    ];


  if (!question) {
    finishGame();
    return;
  }


  currentTimes.push(
    getQuestionTime(question)
  );


  currentStreak = 0;


  const buttons =
    document.querySelectorAll(
      ".answer-button"
    );


  buttons.forEach(
    button => {

      button.disabled = true;


      if (
        Number(button.dataset.index) ===
        question.correct
      ) {

        button.classList.add(
          "correct"
        );

      }

    }
  );


  const feedback =
    document.getElementById("feedback");


  if (feedback) {

    feedback.textContent =
      `⏱ ${t("timeUp")}`;

    feedback.className =
      "feedback wrong";

  }


  updateQuestionStats(
    question,
    false,
    getQuestionTime(question)
  );


  questionTimeout =
    setTimeout(
      () => {

        currentQuestionIndex++;

        loadQuestion();

      },
      2000
    );

}


function calculateQuestionPoints(
  question,
  elapsed
) {

  const base =
    50 +
    question.difficulty * 30;


  const speedBonus =
    Math.max(
      0,
      Math.round(
        (getQuestionTime(question) -
          elapsed) * 2
      )
    );


  const streakBonus =
    currentStreak >= 3
      ? currentStreak * 5
      : 0;


  return (
    base +
    speedBonus +
    streakBonus
  );

}


function updateQuestionStats(
  question,
  correct,
  elapsed
) {

  const p =
    getPlayer();


  p.totalAnswers++;


  if (correct) {
    p.correct++;
  }


  p.totalTime += elapsed;


  if (!p.categoryStats) {
    p.categoryStats = {};
  }


  if (
    !p.categoryStats[
      question.game
    ]
  ) {

    p.categoryStats[
      question.game
    ] = {
      attempts: 0,
      correct: 0,
      totalTime: 0,
      bestTime: null
    };

  }


  const stat =
    p.categoryStats[
      question.game
    ];


  stat.attempts++;


  if (correct) {
    stat.correct++;
  }


  stat.totalTime += elapsed;


  if (
    stat.bestTime === null ||
    elapsed < stat.bestTime
  ) {

    stat.bestTime = elapsed;

  }


  if (
    !p.answeredQuestionIds.includes(
      question.id
    )
  ) {

    p.answeredQuestionIds.push(
      question.id
    );

  }


  /*
     Keep memory manageable.
  */

  if (
    p.answeredQuestionIds.length >
    300
  ) {

    p.answeredQuestionIds =
      p.answeredQuestionIds.slice(
        -200
      );

  }


  saveDatabase();

}


/* =========================================================
   14. FINISH GAME
========================================================= */

function finishGame() {

  clearTimers();


  const p =
    getPlayer();


  const oldLevel =
    p.level;


  p.points += currentScore;

  p.games++;


  const calculatedLevel =
    Math.floor(
      p.points / 500
    ) + 1;


  p.level =
    Math.max(
      p.level,
      calculatedLevel
    );


  p.difficulty =
    getPlayerDifficulty();


  saveLocalPlayerSnapshot();


  const averageTime =
    currentTimes.length
      ? currentTimes.reduce(
          (a, b) => a + b,
          0
        ) / currentTimes.length
      : 0;


  const resultScore =
    document.getElementById(
      "resultScore"
    );

  const resultCorrect =
    document.getElementById(
      "resultCorrect"
    );

  const resultTime =
    document.getElementById(
      "resultTime"
    );

  const resultLevel =
    document.getElementById(
      "resultLevel"
    );

  const resultRank =
    document.getElementById(
      "resultRank"
    );

  const resultMessage =
    document.getElementById(
      "resultMessage"
    );


  if (resultScore) {
    resultScore.textContent =
      formatNumber(currentScore);
  }


  if (resultCorrect) {
    resultCorrect.textContent =
      `${currentCorrect}/${currentQuestions.length}`;
  }


  if (resultTime) {
    resultTime.textContent =
      `${averageTime.toFixed(1)}s`;
  }


  if (resultLevel) {
    resultLevel.textContent =
      p.level;
  }


  if (resultRank) {
    resultRank.textContent =
      getPlayerRank();
  }


  if (resultMessage) {

    if (p.level > oldLevel) {

      resultMessage.textContent =
        `🔥 ${t("levelUp")} ${p.level}`;

    } else {

      resultMessage.textContent =
        `${t("score")}: ${formatNumber(currentScore)}`;

    }

  }


  updatePlayerUI();

  renderLeaderboard();

  showPage("result");

}


/* =========================================================
   15. LOCAL LEADERBOARD
========================================================= */

function saveLocalPlayerSnapshot() {

  const p =
    getPlayer();


  if (!p.name) return;


  const snapshot = {

    name: p.name,
    age: p.age,
    country: p.country,
    points: p.points,
    level: p.level,
    games: p.games,
    accuracy:
      p.totalAnswers
        ? Math.round(
            (p.correct /
              p.totalAnswers) *
              100
          )
        : 0,
    speed:
      p.totalAnswers
        ? p.totalTime /
          p.totalAnswers
        : 0,
    updatedAt: Date.now()

  };


  const existingIndex =
    database.localPlayers.findIndex(
      player =>
        player.name ===
          snapshot.name &&
        player.country ===
          snapshot.country
    );


  if (existingIndex >= 0) {

    database.localPlayers[
      existingIndex
    ] = snapshot;

  } else {

    database.localPlayers.push(
      snapshot
    );

  }


  database.localPlayers =
    database.localPlayers
      .sort(
        (a, b) =>
          b.points - a.points
      )
      .slice(0, 100);


  saveDatabase();

}


function getSortedPlayers() {

  return [
    ...database.localPlayers
  ].sort(
    (a, b) =>
      b.points - a.points
  );

}


function getPlayerRank() {

  const p =
    getPlayer();


  if (!p.name) {
    return "—";
  }


  const players =
    getSortedPlayers();


  const index =
    players.findIndex(
      player =>
        player.name === p.name &&
        player.country === p.country
    );


  return index >= 0
    ? index + 1
    : "—";

}


function renderLeaderboard() {

  const body =
    document.getElementById(
      "leaderboardBody"
    );


  if (!body) return;


  let players =
    getSortedPlayers();


  if (
    rankingMode === "country" &&
    getPlayer().country
  ) {

    players =
      players.filter(
        player =>
          player.country ===
          getPlayer().country
      );

  }


  if (!players.length) {

    body.innerHTML = `
      <tr>
        <td colspan="6">
          ${t("noPlayers")}
        </td>
      </tr>
    `;

    return;

  }


  body.innerHTML =
    players
      .map(
        (player, index) => `

        <tr>

          <td>
            ${index + 1}
          </td>

          <td>
            ${escapeHTML(
              player.name
            )}
          </td>

          <td>
            ${escapeHTML(
              player.country ||
              t("countryNotSet")
            )}
          </td>

          <td>
            ${formatNumber(
              player.points
            )}
          </td>

          <td>
            ${player.level}
          </td>

          <td>
            ${
              player.speed
                ? player.speed.toFixed(1) + "s"
                : "—"
            }
          </td>

        </tr>

      `
      )
      .join("");

}


function changeRanking(mode) {

  rankingMode = mode;


  document
    .querySelectorAll(
      ".ranking-tab"
    )
    .forEach(
      (button, index) => {

        button.classList.toggle(
          "active",
          (
            mode === "global" &&
            index === 0
          ) ||
          (
            mode === "country" &&
            index === 1
          ) ||
          (
            mode === "game" &&
            index === 2
          )
        );

      }
    );


  renderLeaderboard();

}


/* =========================================================
   16. PROFILE PROGRESS
========================================================= */

function updateProfileProgress() {

  const p =
    getPlayer();


  const current =
    p.points % 500;


  const percentage =
    Math.round(
      (current / 500) * 100
    );


  const progress =
    document.getElementById(
      "profileProgress"
    );


  const text =
    document.getElementById(
      "nextLevelText"
    );


  if (progress) {
    progress.style.width =
      `${percentage}%`;
  }


  if (text) {

    text.textContent =
      `${current} / 500`;

  }

}


/* =========================================================
   17. PERSONALITY ENGINE
========================================================= */

const PERSONALITY_QUESTIONS = [

  {
    question: {
      ar: "لو واجهت مشكلة صعبة والوقت محدود، ماذا تفعل أولًا؟",
      en: "When facing a difficult problem with limited time, what do you do first?",
      fr: "Face à un problème difficile avec peu de temps, que faites-vous d'abord ?",
      es: "Ante un problema difícil con poco tiempo, ¿qué haces primero?",
      pt: "Diante de um problema difícil com pouco tempo, o que você faz primeiro?"
    },
    answers: [
      {
        key: "logical",
        text: {
          ar: "أحلل المعلومات",
          en: "Analyze the information",
          fr: "Analyser les informations",
          es: "Analizar la información",
          pt: "Analisar as informações"
        }
      },
      {
        key: "intuitive",
        text: {
          ar: "أتبع إحساسي",
          en: "Follow my intuition",
          fr: "Suivre mon intuition",
          es: "Seguir mi intuición",
          pt: "Seguir minha intuição"
        }
      },
      {
        key: "competitive",
        text: {
          ar: "أحاول الحسم فورًا",
          en: "Make a quick decisive move",
          fr: "Prendre une décision rapide",
          es: "Tomar una decisión rápida",
          pt: "Tomar uma decisão rápida"
        }
      },
      {
        key: "calm",
        text: {
          ar: "أهدأ ثم أقرر",
          en: "Stay calm and decide",
          fr: "Rester calme puis décider",
          es: "Mantener la calma y decidir",
          pt: "Manter a calma e decidir"
        }
      }
    ]
  },


  {
    question: {
      ar: "إذا أعطاك شخص فرصة كبيرة لكن فيها مخاطرة، ماذا تميل أن تفعل؟",
      en: "If someone offers you a great opportunity with risk, what do you tend to do?",
      fr: "Si une grande opportunité comporte un risque, que faites-vous ?",
      es: "Si una gran oportunidad implica riesgo, ¿qué haces?",
      pt: "Se uma grande oportunidade envolve risco, o que você faz?"
    },
    answers: [
      {
        key: "risk",
        text: {
          ar: "أجربها",
          en: "Take it",
          fr: "Je tente",
          es: "La intento",
          pt: "Eu tento"
        }
      },
      {
        key: "logical",
        text: {
          ar: "أحسب الاحتمالات",
          en: "Calculate the probabilities",
          fr: "Calculer les probabilités",
          es: "Calcular las probabilidades",
          pt: "Calcular as probabilidades"
        }
      },
      {
        key: "calm",
        text: {
          ar: "أنتظر وأراقب",
          en: "Wait and observe",
          fr: "Attendre et observer",
          es: "Esperar y observar",
          pt: "Esperar e observar"
        }
      },
      {
        key: "intuitive",
        text: {
          ar: "أقرر حسب شعوري",
          en: "Decide based on my feeling",
          fr: "Décider selon mon ressenti",
          es: "Decidir según mi sensación",
          pt: "Decidir pelo meu sentimento"
        }
      }
    ]
  },


  {
    question: {
      ar: "في منافسة، ماذا يجذبك أكثر؟",
      en: "What attracts you most in a competition?",
      fr: "Qu'est-ce qui vous attire le plus dans une compétition ?",
      es: "¿Qué te atrae más en una competición?",
      pt: "O que mais atrai você em uma competição?"
    },
    answers: [
      {
        key: "competitive",
        text: {
          ar: "الفوز",
          en: "Winning",
          fr: "Gagner",
          es: "Ganar",
          pt: "Vencer"
        }
      },
      {
        key: "logical",
        text: {
          ar: "حل المشكلة",
          en: "Solving the problem",
          fr: "Résoudre le problème",
          es: "Resolver el problema",
          pt: "Resolver o problema"
        }
      },
      {
        key: "intuitive",
        text: {
          ar: "المفاجأة",
          en: "The surprise",
          fr: "La surprise",
          es: "La sorpresa",
          pt: "A surpresa"
        }
      },
      {
        key: "calm",
        text: {
          ar: "الاستمتاع",
          en: "Enjoying it",
          fr: "Profiter",
          es: "Disfrutar",
          pt: "Aproveitar"
        }
      }
    ]
  },


  {
    question: {
      ar: "عندما يختلف الآخرون معك، ما رد فعلك غالبًا؟",
      en: "When others disagree with you, what is your usual reaction?",
      fr: "Lorsque les autres ne sont pas d'accord avec vous, que faites-vous ?",
      es: "Cuando otros no están de acuerdo contigo, ¿qué haces?",
      pt: "Quando outros discordam de você, como reage?"
    },
    answers: [
      {
        key: "logical",
        text: {
          ar: "أناقش بالأدلة",
          en: "Discuss with evidence",
          fr: "Discuter avec des preuves",
          es: "Discutir con argumentos",
          pt: "Discutir com evidências"
        }
      },
      {
        key: "competitive",
        text: {
          ar: "أحاول إثبات رأيي",
          en: "Try to prove my point",
          fr: "Essayer de prouver mon point",
          es: "Intentar demostrar mi punto",
          pt: "Tentar provar meu ponto"
        }
      },
      {
        key: "calm",
        text: {
          ar: "أستمع أولًا",
          en: "Listen first",
          fr: "Écouter d'abord",
          es: "Escuchar primero",
          pt: "Ouvir primeiro"
        }
      },
      {
        key: "intuitive",
        text: {
          ar: "أثق بحدسي",
          en: "Trust my intuition",
          fr: "Faire confiance à mon intuition",
          es: "Confiar en mi intuición",
          pt: "Confiar na minha intuição"
        }
      }
    ]
  },


  {
    question: {
      ar: "أيهما تفضل؟",
      en: "Which do you prefer?",
      fr: "Que préférez-vous ?",
      es: "¿Qué prefieres?",
      pt: "O que você prefere?"
    },
    answers: [
      {
        key: "logical",
        text: {
          ar: "خطة واضحة",
          en: "A clear plan",
          fr: "Un plan clair",
          es: "Un plan claro",
          pt: "Um plano claro"
        }
      },
      {
        key: "risk",
        text: {
          ar: "مغامرة غير متوقعة",
          en: "An unexpected adventure",
          fr: "Une aventure inattendue",
          es: "Una aventura inesperada",
          pt: "Uma aventura inesperada"
        }
      },
      {
        key: "calm",
        text: {
          ar: "طريق هادئ",
          en: "A calm path",
          fr: "Un chemin calme",
          es: "Un camino tranquilo",
          pt: "Um caminho tranquilo"
        }
      },
      {
        key: "competitive",
        text: {
          ar: "تحدي صعب",
          en: "A hard challenge",
          fr: "Un défi difficile",
          es: "Un reto difícil",
          pt: "Um desafio difícil"
        }
      }
    ]
  },


  {
    question: {
      ar: "لو تغيرت القواعد فجأة أثناء اللعبة، ماذا تفعل؟",
      en: "If the rules suddenly change during a game, what do you do?",
      fr: "Si les règles changent soudainement pendant le jeu, que faites-vous ?",
      es: "Si las reglas cambian de repente durante el juego, ¿qué haces?",
      pt: "Se as regras mudarem de repente durante o jogo, o que você faz?"
    },
    answers: [
      {
        key: "calm",
        text: {
          ar: "أتكيف بهدوء",
          en: "Adapt calmly",
          fr: "M'adapter calmement",
          es: "Adaptarme con calma",
          pt: "Adaptar-me com calma"
        }
      },
      {
        key: "competitive",
        text: {
          ar: "أستغل التغيير للفوز",
          en: "Use the change to win",
          fr: "Utiliser le changement pour gagner",
          es: "Usar el cambio para ganar",
          pt: "Usar a mudança para vencer"
        }
      },
      {
        key: "logical",
        text: {
          ar: "أفهم القواعد الجديدة",
          en: "Understand the new rules",
          fr: "Comprendre les nouvelles règles",
          es: "Entender las nuevas reglas",
          pt: "Entender as novas regras"
        }
      },
      {
        key: "risk",
        text: {
          ar: "أجرب شيئًا جديدًا",
          en: "Try something new",
          fr: "Essayer quelque chose de nouveau",
          es: "Probar algo nuevo",
          pt: "Tentar algo novo"
        }
      }
    ]
  },

  {
    question: {
      ar: "إذا كان لديك طريقان: واحد مضمون وآخر قد يعطي نتيجة أكبر، ماذا تختار؟",
      en: "If you have a safe path and a risky path with greater potential, what do you choose?",
      fr: "Si vous avez un chemin sûr et un chemin risqué avec plus de potentiel, lequel choisissez-vous ?",
      es: "Si tienes un camino seguro y otro arriesgado con mayor potencial, ¿cuál eliges?",
      pt: "Se você tem um caminho seguro e outro arriscado com maior potencial, qual escolhe?"
    },
    answers: [
      {
        key: "risk",
        text: {
          ar: "المخاطرة",
          en: "Risk",
          fr: "Le risque",
          es: "El riesgo",
          pt: "O risco"
        }
      },
      {
        key: "logical",
        text: {
          ar: "أقارن الأرقام",
          en: "Compare the numbers",
          fr: "Comparer les chiffres",
          es: "Comparar los números",
          pt: "Comparar os números"
        }
      },
      {
        key: "calm",
        text: {
          ar: "المضمون",
          en: "The safe path",
          fr: "Le chemin sûr",
          es: "El camino seguro",
          pt: "O caminho seguro"
        }
      },
      {
        key: "intuitive",
        text: {
          ar: "ما أشعر أنه مناسب",
          en: "What feels right",
          fr: "Ce qui semble juste",
          es: "Lo que siento correcto",
          pt: "O que parece certo"
        }
      }
    ]
  }

];


function startPersonality() {

  personalityIndex = 0;
  personalityAnswers = [];

  renderPersonalityQuestion();

}


function renderPersonalityQuestion() {

  const container =
    document.getElementById(
      "personalityContent"
    );


  if (!container) return;


  if (
    personalityIndex >=
    PERSONALITY_QUESTIONS.length
  ) {

    finishPersonality();

    return;

  }


  const item =
    PERSONALITY_QUESTIONS[
      personalityIndex
    ];


  const questionText =
    item.question[currentLanguage] ||
    item.question.en;


  container.innerHTML = `

    <div class="personality-question">

      <div class="question">
        ${escapeHTML(questionText)}
      </div>

      <div class="answers">

        ${item.answers
          .map(
            (answer, index) => `

            <button
              type="button"
              class="answer-button"
              onclick="answerPersonality(${index})">

              <span class="answer-number">
                ${String.fromCharCode(65 + index)}
              </span>

              <span>
                ${escapeHTML(
                  answer.text[currentLanguage] ||
                  answer.text.en
                )}
              </span>

            </button>

          `
          )
          .join("")}

      </div>

      <div class="quiz-progress-info">

        ${t("question")}
        ${personalityIndex + 1}
        /
        ${PERSONALITY_QUESTIONS.length}

      </div>

    </div>

  `;

}


function answerPersonality(index) {

  const item =
    PERSONALITY_QUESTIONS[
      personalityIndex
    ];


  const answer =
    item.answers[index];


  if (!answer) return;


  personalityAnswers.push(
    answer.key
  );


  personalityIndex++;

  setTimeout(
    renderPersonalityQuestion,
    350
  );

}


function finishPersonality() {

  const dimensions = {
    logical: 0,
    intuitive: 0,
    competitive: 0,
    calm: 0,
    risk: 0
  };


  personalityAnswers.forEach(
    key => {

      if (
        dimensions[key] !== undefined
      ) {

        dimensions[key]++;

      }

    }
  );


  database.personality.dimensions =
    dimensions;


  database.personality.completed =
    true;


  database.personality.history.push({
    date: Date.now(),
    answers: [
      ...personalityAnswers
    ],
    dimensions
  });


  saveDatabase();


  const strongest =
    Object.entries(dimensions)
      .sort(
        (a, b) =>
          b[1] - a[1]
      )[0];


  const result =
    document.getElementById(
      "personalityResult"
    );


  const content =
    document.getElementById(
      "personalityContent"
    );


  if (content) {

    content.innerHTML = `
      <div class="result-message">
        🧠 ${t("personalityComplete")}
      </div>
    `;

  }


  if (result) {

    result.innerHTML = `

      <div class="personality-result-card">

        <div class="result-icon">
          🧠
        </div>

        <h3>
          ${t(strongest[0])}
        </h3>

        <p>
          ${t("analysis")}
        </p>

        <div class="stats-grid">

          ${Object.entries(dimensions)
            .map(
              ([key, value]) => `

              <div class="stat">

                <small>
                  ${t(key)}
                </small>

                <strong>
                  ${value}
                </strong>

              </div>

            `
            )
            .join("")}

        </div>

      </div>

    `;

  }

}


/* =========================================================
   18. NAVIGATION
========================================================= */

function showPage(pageId) {

  document
    .querySelectorAll(".page")
    .forEach(
      page =>
        page.classList.remove(
          "active"
        )
    );


  const target =
    document.getElementById(
      pageId
    );


  if (!target) return;


  target.classList.add(
    "active"
  );


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  if (pageId === "leaderboard") {
    renderLeaderboard();
  }


  if (pageId === "profile") {
    updatePlayerUI();
  }


  if (pageId === "challenges") {
    renderAllGames();
  }


  if (pageId === "football") {
    renderFootballGames();
  }


  if (pageId === "mindgames") {
    renderMindGames();
  }


  closeMobileMenu();

}


function toggleMobileMenu() {

  const nav =
    document.getElementById(
      "mainNavigation"
    );


  if (nav) {
    nav.classList.toggle(
      "mobile-open"
    );
  }

}


function closeMobileMenu() {

  const nav =
    document.getElementById(
      "mainNavigation"
    );


  if (nav) {
    nav.classList.remove(
      "mobile-open"
    );
  }

}


/* =========================================================
   19. UTILITIES
========================================================= */

function clamp(
  value,
  min,
  max
) {

  return Math.min(
    Math.max(
      value,
      min
    ),
    max
  );

}


function formatNumber(number) {

  return Number(
    number || 0
  ).toLocaleString(
    currentLanguage
  );

}


function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function showToast(message) {

  const toast =
    document.getElementById(
      "toast"
    );


  if (!toast) return;


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  setTimeout(
    () => {

      toast.classList.remove(
        "show"
      );

    },
    2500
  );

}


/* =========================================================
   20. GLOBAL INITIALIZATION
========================================================= */

function initializeApp() {

  applyLanguage();

  updatePlayerUI();

  renderAllGames();

  renderFootballGames();

  renderMindGames();

  renderLeaderboard();


  const personalityContent =
    document.getElementById(
      "personalityContent"
    );


  if (
    personalityContent &&
    !database.personality.completed
  ) {

    personalityContent.innerHTML = `

      <div class="personality-start">

        <button
          class="main-button"
          type="button"
          onclick="startPersonality()">

          🧠
          ${t("beginPersonality")}

        </button>

      </div>

    `;

  }


  if (
    personalityContent &&
    database.personality.completed
  ) {

    personalityContent.innerHTML = `

      <div class="info-box">
        🧠 ${t("personalityComplete")}
      </div>

      <button
        class="main-button"
        type="button"
        onclick="startPersonality()">

        🔄 ${t("beginPersonality")}

      </button>

    `;

  }


  /*
     Make sure the page always opens
     in the selected language.
  */

  const language =
    document.getElementById(
      "language"
    );

  if (language) {
    language.value =
      currentLanguage;
  }

}


/* =========================================================
   21. SAFE GLOBAL FUNCTIONS
========================================================= */

window.showPage =
  showPage;

window.changeLanguage =
  changeLanguage;

window.saveProfile =
  saveProfile;

window.startGame =
  startGame;

window.answerQuestion =
  answerQuestion;

window.filterGames =
  filterGames;

window.changeRanking =
  changeRanking;

window.startPersonality =
  startPersonality;

window.answerPersonality =
  answerPersonality;

window.toggleMobileMenu =
  toggleMobileMenu;


/* =========================================================
   22. START
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  initializeApp
);
