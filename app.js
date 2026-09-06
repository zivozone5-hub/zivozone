/* =========================================================
   GLOBAL CHALLENGE
   APP.JS — PROFESSIONAL CORE ENGINE
   Version 3.0
   ========================================================= */

"use strict";

/* =========================================================
   CONFIG
   ========================================================= */

const CONFIG = {
  languages: ["ar", "en", "fr", "es", "pt"],
  defaultLanguage: "ar",

  questionsPerGame: 10,

  feedbackDelay: 2000,

  minAge: 5,
  maxAge: 100,

  storage: {
    profile: "gc_profile_v3",
    leaderboard: "gc_leaderboard_v3",
    history: "gc_history_v3",
    language: "gc_language_v3"
  }
};

/* =========================================================
   TRANSLATIONS
   ========================================================= */

const UI = {

  ar: {
    home: "الرئيسية",
    profile: "ملفي",
    ranking: "الترتيب",
    who: "من أنا؟",

    heroTitle: "هل أنت مستعد لتثبت أنك الأفضل؟",
    heroText:
      "اختبر ذكاءك وسرعتك وتركيزك ومعرفتك الكروية. كل جولة تتغير وكل مستوى أصعب من السابق.",

    currentPlayer: "اللاعب الحالي",
    points: "النقاط",
    level: "المستوى",
    challenges: "التحديات",

    playerProfile: "ملف اللاعب",
    name: "الاسم",
    age: "العمر",
    save: "حفظ الملف",

    games: "التحديات",
    accuracy: "الدقة",

    result: "نتيجة التحدي",
    pointsEarned: "نقاط مكتسبة",
    correct: "الإجابات الصحيحة",
    averageTime: "متوسط الوقت",
    backGames: "العودة للتحديات",

    globalRanking: "الترتيب العالمي",
    player: "اللاعب",

    personalityIntro:
      "هذه التجربة تحلل نمط قراراتك داخل الموقع. النتيجة ترفيهية وليست تشخيصًا نفسيًا طبيًا.",

    needProfile:
      "أدخل اسمك وعمرك أولًا حتى نستطيع ضبط مستوى التحدي المناسب لك.",

    profileSaved:
      "تم حفظ ملفك بنجاح.",

    answerCorrect: "✓ إجابة صحيحة",
    answerWrong: "✕ إجابة خاطئة",

    timeUp: "انتهى الوقت!",

    challengeComplete:
      "انتهى التحدي.",

    chooseProfile:
      "احفظ ملف اللاعب أولًا.",

    playerDefault: "زائر",

    levelLabel: "المستوى",

    logicName: "منطق العقل",
    logicDesc:
      "ألغاز منطقية متدرجة تجبرك على التفكير قبل اختيار الإجابة.",

    footballName: "Football IQ",
    footballDesc:
      "اختبارات كرة قدم تكتيكية وفنية بمواقف تحتاج إلى قرار ذكي.",

    knowledgeName: "المعرفة العالمية",
    knowledgeDesc:
      "أسئلة معرفية متنوعة مع خيارات متقاربة تختبر معلوماتك الحقيقية.",

    mathName: "تحدي الحساب",
    mathDesc:
      "حساب ذهني سريع يزداد صعوبة مع تطور مستواك.",

    focusName: "اختبار التركيز",
    focusDesc:
      "أسئلة قصيرة مصممة لاختبار الانتباه وسرعة الملاحظة.",

    personalityName: "من أنا؟",
    personalityDesc:
      "تجربة تفاعلية تحلل طريقة اتخاذك للقرار والتنافس والمخاطرة.",

    whoStart: "ابدأ تحليل من أنا",

    whoQuestion: "اختر الإجابة الأقرب إلى تصرفك الحقيقي.",

    personalityResult: "ملامح شخصيتك داخل التحديات",

    strategic: "الاستراتيجي",
    strategicDesc:
      "تميل إلى التفكير في الصورة الكبيرة قبل اتخاذ القرار.",

    fastThinker: "سريع القرار",
    fastThinkerDesc:
      "تميل إلى اتخاذ القرار بسرعة ولا تحب إضاعة الوقت.",

    analytical: "المحلل",
    analyticalDesc:
      "تبحث عن التفاصيل والاحتمالات قبل أن تحسم اختيارك.",

    riskTaker: "المغامر",
    riskTakerDesc:
      "لديك استعداد أعلى للمخاطرة عندما ترى فرصة للفوز.",

    balanced: "المتوازن",
    balancedDesc:
      "تجمع بين السرعة والتفكير والتحليل بطريقة متوازنة.",

    noRanking:
      "لا توجد نتائج مسجلة بعد."
  },

  en: {
    home: "Home",
    profile: "Profile",
    ranking: "Ranking",
    who: "Who Am I?",

    heroTitle: "Are you ready to prove you are the best?",
    heroText:
      "Test your intelligence, speed, focus and football knowledge. Every round changes and becomes harder.",

    currentPlayer: "Current Player",
    points: "Points",
    level: "Level",
    challenges: "Challenges",

    playerProfile: "Player Profile",
    name: "Name",
    age: "Age",
    save: "Save Profile",

    games: "Challenges",
    accuracy: "Accuracy",

    result: "Challenge Result",
    pointsEarned: "Points Earned",
    correct: "Correct Answers",
    averageTime: "Average Time",
    backGames: "Back to Challenges",

    globalRanking: "Global Ranking",
    player: "Player",

    personalityIntro:
      "This experience analyzes your decision patterns inside the platform. It is entertainment, not a medical psychological diagnosis.",

    needProfile:
      "Enter your name and age first so we can set the appropriate challenge level.",

    profileSaved:
      "Your profile has been saved successfully.",

    answerCorrect: "✓ Correct Answer",
    answerWrong: "✕ Wrong Answer",

    timeUp: "Time is up!",

    challengeComplete:
      "Challenge completed.",

    chooseProfile:
      "Save your player profile first.",

    playerDefault: "Guest",

    levelLabel: "Level",

    logicName: "Mind Logic",
    logicDesc:
      "Progressive logic puzzles designed to make you think before answering.",

    footballName: "Football IQ",
    footballDesc:
      "Tactical and technical football situations requiring smart decisions.",

    knowledgeName: "Global Knowledge",
    knowledgeDesc:
      "Mixed knowledge questions with close answer choices.",

    mathName: "Math Challenge",
    mathDesc:
      "Fast mental calculations that become harder as you progress.",

    focusName: "Focus Test",
    focusDesc:
      "Short challenges designed to test attention and observation speed.",

    personalityName: "Who Am I?",
    personalityDesc:
      "An interactive experience analyzing your decision-making style.",

    whoStart: "Start Who Am I",

    whoQuestion: "Choose the answer closest to your real behavior.",

    personalityResult: "Your Challenge Personality",

    strategic: "The Strategist",
    strategicDesc:
      "You tend to think about the bigger picture before deciding.",

    fastThinker: "Fast Decision Maker",
    fastThinkerDesc:
      "You prefer making decisions quickly and dislike wasting time.",

    analytical: "The Analyst",
    analyticalDesc:
      "You look for details and possibilities before committing.",

    riskTaker: "The Risk Taker",
    riskTakerDesc:
      "You are more willing to take risks when you see a chance to win.",

    balanced: "The Balanced Player",
    balancedDesc:
      "You combine speed, thinking and analysis in a balanced way.",

    noRanking:
      "No results recorded yet."
  },

  fr: {
    home: "Accueil",
    profile: "Profil",
    ranking: "Classement",
    who: "Qui suis-je ?",

    heroTitle: "Êtes-vous prêt à prouver que vous êtes le meilleur ?",
    heroText:
      "Testez votre intelligence, votre vitesse, votre concentration et vos connaissances footballistiques.",

    currentPlayer: "Joueur actuel",
    points: "Points",
    level: "Niveau",
    challenges: "Défis",

    playerProfile: "Profil du joueur",
    name: "Nom",
    age: "Âge",
    save: "Enregistrer",

    games: "Défis",
    accuracy: "Précision",

    result: "Résultat",
    pointsEarned: "Points gagnés",
    correct: "Bonnes réponses",
    averageTime: "Temps moyen",
    backGames: "Retour aux défis",

    globalRanking: "Classement mondial",
    player: "Joueur",

    personalityIntro:
      "Cette expérience analyse vos habitudes de décision. Elle est ludique et ne constitue pas un diagnostic médical.",

    needProfile:
      "Entrez votre nom et votre âge pour définir votre niveau.",

    profileSaved:
      "Votre profil a été enregistré.",

    answerCorrect: "✓ Bonne réponse",
    answerWrong: "✕ Mauvaise réponse",

    timeUp: "Temps écoulé !",

    challengeComplete:
      "Défi terminé.",

    chooseProfile:
      "Enregistrez d'abord votre profil.",

    playerDefault: "Visiteur",

    levelLabel: "Niveau",

    logicName: "Logique",
    logicDesc:
      "Des énigmes logiques progressives.",

    footballName: "Football IQ",
    footballDesc:
      "Des situations footballistiques tactiques et techniques.",

    knowledgeName: "Culture générale",
    knowledgeDesc:
      "Des questions variées avec des réponses proches.",

    mathName: "Défi mathématique",
    mathDesc:
      "Des calculs mentaux rapides et progressifs.",

    focusName: "Concentration",
    focusDesc:
      "Des défis courts pour tester votre attention.",

    personalityName: "Qui suis-je ?",
    personalityDesc:
      "Une expérience interactive sur votre style de décision.",

    whoStart: "Commencer",

    whoQuestion:
      "Choisissez la réponse qui vous ressemble le plus.",

    personalityResult:
      "Votre personnalité de joueur",

    strategic: "Le stratège",
    strategicDesc:
      "Vous réfléchissez à la situation globale avant de décider.",

    fastThinker: "Décideur rapide",
    fastThinkerDesc:
      "Vous prenez rapidement vos décisions.",

    analytical: "L'analyste",
    analyticalDesc:
      "Vous recherchez les détails et les possibilités.",

    riskTaker: "Le joueur audacieux",
    riskTakerDesc:
      "Vous acceptez davantage le risque pour gagner.",

    balanced: "Le joueur équilibré",
    balancedDesc:
      "Vous combinez vitesse, réflexion et analyse.",

    noRanking:
      "Aucun résultat enregistré."
  },

  es: {
    home: "Inicio",
    profile: "Perfil",
    ranking: "Clasificación",
    who: "¿Quién soy?",

    heroTitle: "¿Estás listo para demostrar que eres el mejor?",
    heroText:
      "Pon a prueba tu inteligencia, velocidad, concentración y conocimientos de fútbol.",

    currentPlayer: "Jugador actual",
    points: "Puntos",
    level: "Nivel",
    challenges: "Desafíos",

    playerProfile: "Perfil del jugador",
    name: "Nombre",
    age: "Edad",
    save: "Guardar",

    games: "Desafíos",
    accuracy: "Precisión",

    result: "Resultado",
    pointsEarned: "Puntos ganados",
    correct: "Respuestas correctas",
    averageTime: "Tiempo medio",
    backGames: "Volver a desafíos",

    globalRanking: "Clasificación mundial",
    player: "Jugador",

    personalityIntro:
      "Esta experiencia analiza tus patrones de decisión. Es entretenimiento y no un diagnóstico médico.",

    needProfile:
      "Introduce tu nombre y edad para establecer el nivel adecuado.",

    profileSaved:
      "Perfil guardado correctamente.",

    answerCorrect: "✓ Respuesta correcta",
    answerWrong: "✕ Respuesta incorrecta",

    timeUp: "¡Se acabó el tiempo!",

    challengeComplete:
      "Desafío terminado.",

    chooseProfile:
      "Guarda primero tu perfil.",

    playerDefault: "Visitante",

    levelLabel: "Nivel",

    logicName: "Lógica mental",
    logicDesc:
      "Rompecabezas lógicos progresivos.",

    footballName: "Football IQ",
    footballDesc:
      "Situaciones tácticas y técnicas de fútbol.",

    knowledgeName: "Conocimiento global",
    knowledgeDesc:
      "Preguntas variadas con opciones cercanas.",

    mathName: "Desafío matemático",
    mathDesc:
      "Cálculo mental rápido y progresivo.",

    focusName: "Concentración",
    focusDesc:
      "Desafíos cortos para probar tu atención.",

    personalityName: "¿Quién soy?",
    personalityDesc:
      "Una experiencia interactiva sobre tu forma de decidir.",

    whoStart: "Comenzar",

    whoQuestion:
      "Elige la respuesta que más se parezca a ti.",

    personalityResult:
      "Tu personalidad como jugador",

    strategic: "El estratega",
    strategicDesc:
      "Piensas en la situación global antes de decidir.",

    fastThinker: "Decisor rápido",
    fastThinkerDesc:
      "Prefieres tomar decisiones rápidamente.",

    analytical: "El analista",
    analyticalDesc:
      "Buscas detalles y posibilidades antes de decidir.",

    riskTaker: "El arriesgado",
    riskTakerDesc:
      "Estás dispuesto a asumir riesgos para ganar.",

    balanced: "El equilibrado",
    balancedDesc:
      "Combinas velocidad, pensamiento y análisis.",

    noRanking:
      "Todavía no hay resultados."
  },

  pt: {
    home: "Início",
    profile: "Perfil",
    ranking: "Ranking",
    who: "Quem sou eu?",

    heroTitle: "Está pronto para provar que é o melhor?",
    heroText:
      "Teste sua inteligência, velocidade, concentração e conhecimento de futebol.",

    currentPlayer: "Jogador atual",
    points: "Pontos",
    level: "Nível",
    challenges: "Desafios",

    playerProfile: "Perfil do jogador",
    name: "Nome",
    age: "Idade",
    save: "Salvar",

    games: "Desafios",
    accuracy: "Precisão",

    result: "Resultado",
    pointsEarned: "Pontos ganhos",
    correct: "Respostas corretas",
    averageTime: "Tempo médio",
    backGames: "Voltar aos desafios",

    globalRanking: "Ranking mundial",
    player: "Jogador",

    personalityIntro:
      "Esta experiência analisa seus padrões de decisão. É entretenimento e não um diagnóstico médico.",

    needProfile:
      "Digite seu nome e idade para definir o nível adequado.",

    profileSaved:
      "Perfil salvo com sucesso.",

    answerCorrect: "✓ Resposta correta",
    answerWrong: "✕ Resposta errada",

    timeUp: "O tempo acabou!",

    challengeComplete:
      "Desafio concluído.",

    chooseProfile:
      "Salve seu perfil primeiro.",

    playerDefault: "Visitante",

    levelLabel: "Nível",

    logicName: "Lógica mental",
    logicDesc:
      "Desafios lógicos progressivos.",

    footballName: "Football IQ",
    footballDesc:
      "Situações táticas e técnicas de futebol.",

    knowledgeName: "Conhecimento global",
    knowledgeDesc:
      "Perguntas variadas com opções próximas.",

    mathName: "Desafio matemático",
    mathDesc:
      "Cálculo mental rápido e progressivo.",

    focusName: "Concentração",
    focusDesc:
      "Desafios curtos para testar sua atenção.",

    personalityName: "Quem sou eu?",
    personalityDesc:
      "Uma experiência interativa sobre seu estilo de decisão.",

    whoStart: "Começar",

    whoQuestion:
      "Escolha a resposta que mais combina com você.",

    personalityResult:
      "Sua personalidade de jogador",

    strategic: "O estrategista",
    strategicDesc:
      "Você pensa no cenário geral antes de decidir.",

    fastThinker: "Decisor rápido",
    fastThinkerDesc:
      "Você prefere tomar decisões rapidamente.",

    analytical: "O analista",
    analyticalDesc:
      "Você procura detalhes e possibilidades antes de decidir.",

    riskTaker: "O ousado",
    riskTakerDesc:
      "Você aceita mais riscos quando vê uma chance de vencer.",

    balanced: "O equilibrado",
    balancedDesc:
      "Você combina velocidade, pensamento e análise.",

    noRanking:
      "Nenhum resultado registrado."
  }
};

/* =========================================================
   QUESTION BANK
   IMPORTANT:
   correct = EXACT ANSWER TEXT
   Never use answer indexes.
   ========================================================= */

const QUESTIONS = {

  logic: [

    {
      difficulty: 1,
      q: {
        ar: "ما العدد التالي؟ 2، 4، 6، 8، ؟",
        en: "What comes next? 2, 4, 6, 8, ?",
        fr: "Quel nombre vient ensuite ? 2, 4, 6, 8, ?",
        es: "¿Qué número sigue? 2, 4, 6, 8, ?",
        pt: "Qual número vem a seguir? 2, 4, 6, 8, ?"
      },
      a: {
        ar: ["9", "10", "11", "12"],
        en: ["9", "10", "11", "12"],
        fr: ["9", "10", "11", "12"],
        es: ["9", "10", "11", "12"],
        pt: ["9", "10", "11", "12"]
      },
      correct: {
        ar: "10",
        en: "10",
        fr: "10",
        es: "10",
        pt: "10"
      }
    },

    {
      difficulty: 2,
      q: {
        ar: "إذا كانت كل الطيور لها أجنحة، وكان النسر طائرًا، فما النتيجة المنطقية؟",
        en: "If all birds have wings and an eagle is a bird, what logically follows?",
        fr: "Si tous les oiseaux ont des ailes et que l'aigle est un oiseau, quelle conclusion est logique ?",
        es: "Si todas las aves tienen alas y el águila es un ave, ¿qué se deduce?",
        pt: "Se todas as aves têm asas e a águia é uma ave, qual conclusão é lógica?"
      },
      a: {
        ar: [
          "النسر له أجنحة",
          "كل ما له أجنحة نسر",
          "النسر ليس طائرًا",
          "لا يمكن معرفة شيء"
        ],
        en: [
          "The eagle has wings",
          "Everything with wings is an eagle",
          "The eagle is not a bird",
          "Nothing can be concluded"
        ],
        fr: [
          "L'aigle a des ailes",
          "Tout ce qui a des ailes est un aigle",
          "L'aigle n'est pas un oiseau",
          "On ne peut rien conclure"
        ],
        es: [
          "El águila tiene alas",
          "Todo lo que tiene alas es un águila",
          "El águila no es un ave",
          "No se puede concluir nada"
        ],
        pt: [
          "A águia tem asas",
          "Tudo que tem asas é uma águia",
          "A águia não é uma ave",
          "Nada pode ser concluído"
        ]
      },
      correct: {
        ar: "النسر له أجنحة",
        en: "The eagle has wings",
        fr: "L'aigle a des ailes",
        es: "El águila tiene alas",
        pt: "A águia tem asas"
      }
    },

    {
      difficulty: 3,
      q: {
        ar: "لديك 3 صناديق: أحمر وأزرق وأخضر. الكرة ليست في الأحمر وليست في الأخضر. أين هي؟",
        en: "There are 3 boxes: red, blue and green. The ball is not in red and not in green. Where is it?",
        fr: "Il y a 3 boîtes : rouge, bleue et verte. La balle n'est ni dans la rouge ni dans la verte. Où est-elle ?",
        es: "Hay 3 cajas: roja, azul y verde. La pelota no está en la roja ni en la verde. ¿Dónde está?",
        pt: "Há 3 caixas: vermelha, azul e verde. A bola não está na vermelha nem na verde. Onde está?"
      },
      a: {
        ar: ["الأزرق", "الأحمر", "الأخضر", "لا يمكن تحديده"],
        en: ["Blue", "Red", "Green", "It cannot be determined"],
        fr: ["Bleue", "Rouge", "Verte", "Impossible à déterminer"],
        es: ["Azul", "Roja", "Verde", "No se puede determinar"],
        pt: ["Azul", "Vermelha", "Verde", "Não é possível determinar"]
      },
      correct: {
        ar: "الأزرق",
        en: "Blue",
        fr: "Bleue",
        es: "Azul",
        pt: "Azul"
      }
    },

    {
      difficulty: 4,
      q: {
        ar: "إذا كان 5 عمال ينجزون مهمة في 10 أيام بنفس المعدل، فكم يومًا يحتاج 10 عمال؟",
        en: "If 5 workers complete a task in 10 days at the same rate, how many days would 10 workers need?",
        fr: "Si 5 ouvriers terminent une tâche en 10 jours au même rythme, combien de jours faut-il à 10 ouvriers ?",
        es: "Si 5 trabajadores completan una tarea en 10 días al mismo ritmo, ¿cuántos días necesitan 10?",
        pt: "Se 5 trabalhadores concluem uma tarefa em 10 dias no mesmo ritmo, quantos dias precisam 10?"
      },
      a: {
        ar: ["4 أيام", "5 أيام", "6 أيام", "8 أيام"],
        en: ["4 days", "5 days", "6 days", "8 days"],
        fr: ["4 jours", "5 jours", "6 jours", "8 jours"],
        es: ["4 días", "5 días", "6 días", "8 días"],
        pt: ["4 dias", "5 dias", "6 dias", "8 dias"]
      },
      correct: {
        ar: "5 أيام",
        en: "5 days",
        fr: "5 jours",
        es: "5 días",
        pt: "5 dias"
      }
    },

    {
      difficulty: 5,
      q: {
        ar: "أي رقم لا ينتمي إلى المجموعة؟ 3، 6، 12، 24، 47",
        en: "Which number does not belong? 3, 6, 12, 24, 47",
        fr: "Quel nombre n'appartient pas à la série ? 3, 6, 12, 24, 47",
        es: "¿Qué número no pertenece a la serie? 3, 6, 12, 24, 47",
        pt: "Qual número não pertence à sequência? 3, 6, 12, 24, 47"
      },
      a: {
        ar: ["12", "24", "47", "6"],
        en: ["12", "24", "47", "6"],
        fr: ["12", "24", "47", "6"],
        es: ["12", "24", "47", "6"],
        pt: ["12", "24", "47", "6"]
      },
      correct: {
        ar: "47",
        en: "47",
        fr: "47",
        es: "47",
        pt: "47"
      }
    },

    {
      difficulty: 6,
      q: {
        ar: "إذا تجاوزتَ الشخص صاحب المركز الثاني في سباق، فما مركزك؟",
        en: "If you overtake the person in second place, what position are you in?",
        fr: "Si vous dépassez la personne en deuxième position, quelle est votre position ?",
        es: "Si adelantas a la persona que está en segundo lugar, ¿en qué posición quedas?",
        pt: "Se você ultrapassa a pessoa em segundo lugar, qual é a sua posição?"
      },
      a: {
        ar: ["الأول", "الثاني", "الثالث", "الرابع"],
        en: ["First", "Second", "Third", "Fourth"],
        fr: ["Premier", "Deuxième", "Troisième", "Quatrième"],
        es: ["Primero", "Segundo", "Tercero", "Cuarto"],
        pt: ["Primeiro", "Segundo", "Terceiro", "Quarto"]
      },
      correct: {
        ar: "الثاني",
        en: "Second",
        fr: "Deuxième",
        es: "Segundo",
        pt: "Segundo"
      }
    },

    {
      difficulty: 7,
      q: {
        ar: "ساعة تتقدم 5 دقائق كل ساعة. إذا كانت صحيحة عند 12:00، ماذا تعرض بعد 6 ساعات حقيقية؟",
        en: "A clock gains 5 minutes every hour. If correct at 12:00, what will it show after 6 real hours?",
        fr: "Une horloge avance de 5 minutes par heure. Correcte à 12:00, que montrera-t-elle après 6 heures réelles ?",
        es: "Un reloj adelanta 5 minutos por hora. Si marca bien las 12:00, ¿qué marcará después de 6 horas reales?",
        pt: "Um relógio adianta 5 minutos por hora. Se estiver correto às 12:00, o que mostrará após 6 horas reais?"
      },
      a: {
        ar: ["18:05", "18:20", "18:30", "17:30"],
        en: ["18:05", "18:20", "18:30", "17:30"],
        fr: ["18:05", "18:20", "18:30", "17:30"],
        es: ["18:05", "18:20", "18:30", "17:30"],
        pt: ["18:05", "18:20", "18:30", "17:30"]
      },
      correct: {
        ar: "18:30",
        en: "18:30",
        fr: "18:30",
        es: "18:30",
        pt: "18:30"
      }
    },

    {
      difficulty: 8,
      q: {
        ar: "لديك 8 كرات متشابهة، واحدة أثقل. باستخدام ميزان كفتين مرتين فقط، هل يمكن تحديدها؟",
        en: "You have 8 identical balls, one heavier. Can you identify it using a balance scale only twice?",
        fr: "Vous avez 8 boules identiques, une plus lourde. Pouvez-vous l'identifier avec une balance seulement deux fois ?",
        es: "Tienes 8 bolas idénticas, una más pesada. ¿Puedes identificarla usando una balanza solo dos veces?",
        pt: "Você tem 8 bolas idênticas, uma mais pesada. É possível identificá-la usando uma balança apenas duas vezes?"
      },
      a: {
        ar: ["نعم", "لا", "فقط إذا كانت في النصف الأول", "فقط إذا كانت في النصف الثاني"],
        en: ["Yes", "No", "Only if it is in the first half", "Only if it is in the second half"],
        fr: ["Oui", "Non", "Seulement si elle est dans la première moitié", "Seulement si elle est dans la seconde moitié"],
        es: ["Sí", "No", "Solo si está en la primera mitad", "Solo si está en la segunda mitad"],
        pt: ["Sim", "Não", "Somente se estiver na primeira metade", "Somente se estiver na segunda metade"]
      },
      correct: {
        ar: "نعم",
        en: "Yes",
        fr: "Oui",
        es: "Sí",
        pt: "Sim"
      }
    },

    {
      difficulty: 9,
      q: {
        ar: "إذا كان كل A هو B، ولا يوجد أي B هو C، فما الذي يجب أن يكون صحيحًا عن A وC؟",
        en: "If every A is B and no B is C, what must be true about A and C?",
        fr: "Si tout A est B et qu'aucun B n'est C, que doit-on conclure concernant A et C ?",
        es: "Si todo A es B y ningún B es C, ¿qué debe ser cierto sobre A y C?",
        pt: "Se todo A é B e nenhum B é C, o que deve ser verdade sobre A e C?"
      },
      a: {
        ar: ["لا يوجد A هو C", "كل A هو C", "بعض A هو C", "لا يمكن معرفة العلاقة"],
        en: ["No A is C", "Every A is C", "Some A is C", "The relationship cannot be known"],
        fr: ["Aucun A n'est C", "Tout A est C", "Certains A sont C", "La relation est inconnue"],
        es: ["Ningún A es C", "Todo A es C", "Algunos A son C", "No se puede saber"],
        pt: ["Nenhum A é C", "Todo A é C", "Alguns A são C", "A relação não pode ser determinada"]
      },
      correct: {
        ar: "لا يوجد A هو C",
        en: "No A is C",
        fr: "Aucun A n'est C",
        es: "Ningún A es C",
        pt: "Nenhum A é C"
      }
    },

    {
      difficulty: 10,
      q: {
        ar: "متوسط ثلاثة أعداد هو 20. إذا كان العددان الأول والثاني 15 و25، فما العدد الثالث؟",
        en: "The average of three numbers is 20. If the first two are 15 and 25, what is the third?",
        fr: "La moyenne de trois nombres est 20. Si les deux premiers sont 15 et 25, quel est le troisième ?",
        es: "La media de tres números es 20. Si los dos primeros son 15 y 25, ¿cuál es el tercero?",
        pt: "A média de três números é 20. Se os dois primeiros são 15 e 25, qual é o terceiro?"
      },
      a: {
        ar: ["15", "20", "25", "30"],
        en: ["15", "20", "25", "30"],
        fr: ["15", "20", "25", "30"],
        es: ["15", "20", "25", "30"],
        pt: ["15", "20", "25", "30"]
      },
      correct: {
        ar: "20",
        en: "20",
        fr: "20",
        es: "20",
        pt: "20"
      }
    }

  ],

  football: [

    {
      difficulty: 1,
      q: {
        ar: "ما الهدف الأساسي من التمرير في كرة القدم؟",
        en: "What is the main purpose of passing in football?",
        fr: "Quel est l'objectif principal d'une passe au football ?",
        es: "¿Cuál es el objetivo principal de un pase en fútbol?",
        pt: "Qual é o principal objetivo do passe no futebol?"
      },
      a: {
        ar: [
          "نقل الكرة لزميل مناسب",
          "إبعاد الكرة دائمًا",
          "إيقاف اللعب",
          "تغيير مركز الحكم"
        ],
        en: [
          "Move the ball to a suitable teammate",
          "Always clear the ball",
          "Stop the game",
          "Change the referee's position"
        ],
        fr: [
          "Transmettre le ballon à un coéquipier disponible",
          "Toujours dégager le ballon",
          "Arrêter le jeu",
          "Changer la position de l'arbitre"
        ],
        es: [
          "Mover el balón hacia un compañero adecuado",
          "Despejar siempre el balón",
          "Detener el juego",
          "Cambiar la posición del árbitro"
        ],
        pt: [
          "Levar a bola até um companheiro disponível",
          "Sempre afastar a bola",
          "Parar o jogo",
          "Mudar a posição do árbitro"
        ]
      },
      correct: {
        ar: "نقل الكرة لزميل مناسب",
        en: "Move the ball to a suitable teammate",
        fr: "Transmettre le ballon à un coéquipier disponible",
        es: "Mover el balón hacia un compañero adecuado",
        pt: "Levar a bola até um companheiro disponível"
      }
    },

    {
      difficulty: 2,
      q: {
        ar: "عند فقدان الكرة مباشرة، ما المبدأ الدفاعي الأول غالبًا؟",
        en: "Immediately after losing the ball, what is usually the first defensive principle?",
        fr: "Après avoir perdu le ballon, quel est généralement le premier principe défensif ?",
        es: "Después de perder el balón, ¿cuál suele ser el primer principio defensivo?",
        pt: "Após perder a bola, qual é geralmente o primeiro princípio defensivo?"
      },
      a: {
        ar: [
          "الضغط أو تأخير الهجمة حسب الموقف",
          "الجميع يركض نحو المرمى",
          "التوقف وانتظار الخصم",
          "التقدم بالظهيرين فورًا"
        ],
        en: [
          "Press or delay the attack depending on the situation",
          "Everyone runs toward the goal",
          "Stop and wait for the opponent",
          "Both fullbacks immediately push forward"
        ],
        fr: [
          "Presser ou ralentir l'attaque selon la situation",
          "Tout le monde court vers le but",
          "S'arrêter et attendre l'adversaire",
          "Les deux latéraux montent immédiatement"
        ],
        es: [
          "Presionar o retrasar el ataque según la situación",
          "Todos corren hacia la portería",
          "Pararse y esperar al rival",
          "Los dos laterales suben inmediatamente"
        ],
        pt: [
          "Pressionar ou atrasar o ataque conforme a situação",
          "Todos correm para o gol",
          "Parar e esperar o adversário",
          "Os dois laterais avançam imediatamente"
        ]
      },
      correct: {
        ar: "الضغط أو تأخير الهجمة حسب الموقف",
        en: "Press or delay the attack depending on the situation",
        fr: "Presser ou ralentir l'attaque selon la situation",
        es: "Presionar o retrasar el ataque según la situación",
        pt: "Pressionar ou atrasar o ataque conforme a situação"
      }
    },

    {
      difficulty: 3,
      q: {
        ar: "ما الميزة الأساسية للاعب الذي يستلم الكرة وهو يرى الملعب قبل الاستلام؟",
        en: "What is the main advantage of receiving the ball after scanning the field?",
        fr: "Quel est l'avantage principal d'un joueur qui observe le terrain avant de recevoir le ballon ?",
        es: "¿Cuál es la principal ventaja de mirar el campo antes de recibir el balón?",
        pt: "Qual é a principal vantagem de observar o campo antes de receber a bola?"
      },
      a: {
        ar: [
          "اتخاذ القرار بسرعة أكبر",
          "زيادة وزن الكرة",
          "إيقاف الخصم تلقائيًا",
          "منع التسلل"
        ],
        en: [
          "Make decisions faster",
          "Increase the ball's weight",
          "Automatically stop the opponent",
          "Prevent offside"
        ],
        fr: [
          "Décider plus rapidement",
          "Augmenter le poids du ballon",
          "Arrêter automatiquement l'adversaire",
          "Empêcher le hors-jeu"
        ],
        es: [
          "Tomar decisiones más rápido",
          "Aumentar el peso del balón",
          "Detener automáticamente al rival",
          "Evitar el fuera de juego"
        ],
        pt: [
          "Tomar decisões mais rapidamente",
          "Aumentar o peso da bola",
          "Parar automaticamente o adversário",
          "Evitar o impedimento"
        ]
      },
      correct: {
        ar: "اتخاذ القرار بسرعة أكبر",
        en: "Make decisions faster",
        fr: "Décider plus rapidement",
        es: "Tomar decisiones más rápido",
        pt: "Tomar decisões mais rapidamente"
      }
    },

    {
      difficulty: 4,
      q: {
        ar: "إذا كان الخصم يغلق العمق بقوة، أين قد تكون المساحة الأنسب للتقدم؟",
        en: "If the opponent strongly closes the central area, where might space become available?",
        fr: "Si l'adversaire ferme fortement l'axe central, où l'espace peut-il devenir disponible ?",
        es: "Si el rival cierra fuertemente el centro, ¿dónde puede aparecer espacio?",
        pt: "Se o adversário fecha fortemente o centro, onde pode aparecer espaço?"
      },
      a: {
        ar: [
          "على الأطراف",
          "داخل حارس المرمى",
          "خلف الحكم",
          "في كل مكان بنفس الدرجة"
        ],
        en: [
          "In wide areas",
          "Inside the goalkeeper",
          "Behind the referee",
          "Everywhere equally"
        ],
        fr: [
          "Dans les zones larges",
          "À l'intérieur du gardien",
          "Derrière l'arbitre",
          "Partout de manière égale"
        ],
        es: [
          "En las zonas exteriores",
          "Dentro del portero",
          "Detrás del árbitro",
          "En todas partes por igual"
        ],
        pt: [
          "Nas zonas laterais",
          "Dentro do goleiro",
          "Atrás do árbitro",
          "Em todos os lugares igualmente"
        ]
      },
      correct: {
        ar: "على الأطراف",
        en: "In wide areas",
        fr: "Dans les zones larges",
        es: "En las zonas exteriores",
        pt: "Nas zonas laterais"
      }
    },

    {
      difficulty: 5,
      q: {
        ar: "لماذا يتحرك المهاجم أحيانًا بعيدًا عن الكرة قبل أن يعود إليها؟",
        en: "Why might a forward move away from the ball before moving back toward it?",
        fr: "Pourquoi un attaquant peut-il s'éloigner du ballon avant de revenir vers lui ?",
        es: "¿Por qué un delantero puede alejarse del balón antes de volver hacia él?",
        pt: "Por que um atacante pode se afastar da bola antes de voltar para ela?"
      },
      a: {
        ar: [
          "لخلق مساحة أو فصل المدافع",
          "لإيقاف المباراة",
          "لإجبار الحكم على التمرير",
          "لإلغاء التسلل دائمًا"
        ],
        en: [
          "To create space or separate from the defender",
          "To stop the match",
          "To force the referee to pass",
          "To always cancel offside"
        ],
        fr: [
          "Pour créer de l'espace ou se démarquer du défenseur",
          "Pour arrêter le match",
          "Pour obliger l'arbitre à faire la passe",
          "Pour annuler toujours le hors-jeu"
        ],
        es: [
          "Para crear espacio o separarse del defensor",
          "Para detener el partido",
          "Para obligar al árbitro a pasar",
          "Para anular siempre el fuera de juego"
        ],
        pt: [
          "Para criar espaço ou separar-se do defensor",
          "Para parar a partida",
          "Para obrigar o árbitro a passar",
          "Para anular sempre o impedimento"
        ]
      },
      correct: {
        ar: "لخلق مساحة أو فصل المدافع",
        en: "To create space or separate from the defender",
        fr: "Pour créer de l'espace ou se démarquer du défenseur",
        es: "Para crear espacio o separarse del defensor",
        pt: "Para criar espaço ou separar-se do defensor"
      }
    },

    {
      difficulty: 6,
      q: {
        ar: "في الضغط العالي، ما الخطر الأكبر إذا تقدم الفريق دون توازن خلف الكرة؟",
        en: "In a high press, what is the biggest danger if the team advances without balance behind the ball?",
        fr: "Lors d'un pressing haut, quel est le principal risque si l'équipe avance sans équilibre derrière le ballon ?",
        es: "En una presión alta, ¿cuál es el mayor riesgo si el equipo avanza sin equilibrio detrás del balón?",
        pt: "Num pressing alto, qual é o maior risco se a equipe avançar sem equilíbrio atrás da bola?"
      },
      a: {
        ar: [
          "التعرض لهجمة مرتدة",
          "زيادة الاستحواذ تلقائيًا",
          "تقليل سرعة الخصم دائمًا",
          "إجبار الحارس على الخروج"
        ],
        en: [
          "Being exposed to a counterattack",
          "Automatically increasing possession",
          "Always reducing the opponent's speed",
          "Forcing the goalkeeper out"
        ],
        fr: [
          "S'exposer à une contre-attaque",
          "Augmenter automatiquement la possession",
          "Toujours réduire la vitesse adverse",
          "Forcer le gardien à sortir"
        ],
        es: [
          "Quedar expuesto a una contra",
          "Aumentar automáticamente la posesión",
          "Reducir siempre la velocidad rival",
          "Obligar al portero a salir"
        ],
        pt: [
          "Ficar exposto a um contra-ataque",
          "Aumentar automaticamente a posse",
          "Sempre reduzir a velocidade adversária",
          "Forçar o goleiro a sair"
        ]
      },
      correct: {
        ar: "التعرض لهجمة مرتدة",
        en: "Being exposed to a counterattack",
        fr: "S'exposer à une contre-attaque",
        es: "Quedar expuesto a una contra",
        pt: "Ficar exposto a um contra-ataque"
      }
    },

    {
      difficulty: 7,
      q: {
        ar: "متى يكون التمرير العمودي أكثر خطورة؟",
        en: "When is a vertical pass more dangerous?",
        fr: "Quand une passe verticale est-elle plus risquée ?",
        es: "¿Cuándo es más arriesgado un pase vertical?",
        pt: "Quando um passe vertical é mais arriscado?"
      },
      a: {
        ar: [
          "عندما تكون خطوط الخصم متقاربة وممر التمرير مغلقًا",
          "عندما يكون الملعب فارغًا",
          "عندما يكون زميلك منفردًا",
          "عندما يكون لديك وقت ومساحة"
        ],
        en: [
          "When the opponent's lines are compact and the passing lane is closed",
          "When the field is empty",
          "When your teammate is free",
          "When you have time and space"
        ],
        fr: [
          "Quand les lignes adverses sont compactes et la ligne de passe fermée",
          "Quand le terrain est vide",
          "Quand le coéquipier est libre",
          "Quand vous avez du temps et de l'espace"
        ],
        es: [
          "Cuando las líneas rivales están juntas y el pase está cerrado",
          "Cuando el campo está vacío",
          "Cuando tu compañero está libre",
          "Cuando tienes tiempo y espacio"
        ],
        pt: [
          "Quando as linhas adversárias estão compactas e a linha de passe está fechada",
          "Quando o campo está vazio",
          "Quando o companheiro está livre",
          "Quando há tempo e espaço"
        ]
      },
      correct: {
        ar: "عندما تكون خطوط الخصم متقاربة وممر التمرير مغلقًا",
        en: "When the opponent's lines are compact and the passing lane is closed",
        fr: "Quand les lignes adverses sont compactes et la ligne de passe fermée",
        es: "Cuando las líneas rivales están juntas y el pase está cerrado",
        pt: "Quando as linhas adversárias estão compactas e a linha de passe está fechada"
      }
    },

    {
      difficulty: 8,
      q: {
        ar: "إذا كان قلبا الدفاع يخرجان معًا لمواجهة مهاجم، ما المشكلة التكتيكية المحتملة؟",
        en: "If both center-backs step out together toward an attacker, what is a possible tactical problem?",
        fr: "Si les deux défenseurs centraux sortent ensemble sur un attaquant, quel problème tactique peut apparaître ?",
        es: "Si los dos centrales salen juntos hacia un atacante, ¿qué problema táctico puede aparecer?",
        pt: "Se os dois zagueiros saem juntos para pressionar um atacante, qual problema tático pode surgir?"
      },
      a: {
        ar: [
          "فتح مساحة خلفهما",
          "زيادة عدد المدافعين",
          "منع كل التمريرات",
          "إلغاء الهجمة"
        ],
        en: [
          "Space can open behind them",
          "The number of defenders increases",
          "All passes are prevented",
          "The attack is cancelled"
        ],
        fr: [
          "Un espace peut s'ouvrir derrière eux",
          "Le nombre de défenseurs augmente",
          "Toutes les passes sont empêchées",
          "L'attaque est annulée"
        ],
        es: [
          "Puede abrirse espacio a sus espaldas",
          "Aumenta el número de defensores",
          "Se impiden todos los pases",
          "El ataque se cancela"
        ],
        pt: [
          "Pode abrir espaço atrás deles",
          "O número de defensores aumenta",
          "Todos os passes são impedidos",
          "O ataque é cancelado"
        ]
      },
      correct: {
        ar: "فتح مساحة خلفهما",
        en: "Space can open behind them",
        fr: "Un espace peut s'ouvrir derrière eux",
        es: "Puede abrirse espacio a sus espaldas",
        pt: "Pode abrir espaço atrás deles"
      }
    },

    {
      difficulty: 9,
      q: {
        ar: "أثناء بناء اللعب، لماذا قد يسحب لاعب الوسط الخصم إلى جهة ثم تنتقل الكرة للجهة الأخرى؟",
        en: "During build-up, why might a midfielder attract the opponent to one side before switching play?",
        fr: "Pendant la construction, pourquoi un milieu peut-il attirer l'adversaire d'un côté avant de renverser le jeu ?",
        es: "Durante la salida de balón, ¿por qué un mediocampista puede atraer al rival a un lado antes de cambiar el juego?",
        pt: "Na construção, por que um meio-campista pode atrair o adversário para um lado antes de inverter o jogo?"
      },
      a: {
        ar: [
          "لخلق مساحة في الجهة العكسية",
          "لإبطاء المباراة فقط",
          "لإجبار الحكم على تغيير الجهة",
          "لمنع الفريق من التقدم"
        ],
        en: [
          "To create space on the opposite side",
          "Only to slow the match",
          "To force the referee to switch sides",
          "To prevent the team from progressing"
        ],
        fr: [
          "Pour créer de l'espace du côté opposé",
          "Seulement pour ralentir le match",
          "Pour forcer l'arbitre à changer de côté",
          "Pour empêcher l'équipe de progresser"
        ],
        es: [
          "Para crear espacio en el lado contrario",
          "Solo para ralentizar el partido",
          "Para obligar al árbitro a cambiar de lado",
          "Para impedir que el equipo avance"
        ],
        pt: [
          "Para criar espaço no lado oposto",
          "Apenas para diminuir o ritmo",
          "Para obrigar o árbitro a mudar de lado",
          "Para impedir a progressão"
        ]
      },
      correct: {
        ar: "لخلق مساحة في الجهة العكسية",
        en: "To create space on the opposite side",
        fr: "Pour créer de l'espace du côté opposé",
        es: "Para crear espacio en el lado contrario",
        pt: "Para criar espaço no lado oposto"
      }
    },

    {
      difficulty: 10,
      q: {
        ar: "فريقك متقدم بهدف في الدقائق الأخيرة. أي قرار لا يعني تلقائيًا أنه الأفضل؟",
        en: "Your team leads by one goal late in the match. Which decision is NOT automatically the best?",
        fr: "Votre équipe mène d'un but en fin de match. Quelle décision n'est PAS automatiquement la meilleure ?",
        es: "Tu equipo gana por un gol al final. ¿Qué decisión NO es automáticamente la mejor?",
        pt: "Sua equipe vence por um gol no fim. Qual decisão NÃO é automaticamente a melhor?"
      },
      a: {
        ar: [
          "التراجع الكامل دون ضغط أو تنظيم",
          "الحفاظ على التوازن",
          "إدارة المساحات",
          "اختيار اللحظة المناسبة للضغط"
        ],
        en: [
          "Dropping completely without pressure or structure",
          "Maintaining balance",
          "Managing spaces",
          "Choosing the right moment to press"
        ],
        fr: [
          "Reculer complètement sans pression ni organisation",
          "Maintenir l'équilibre",
          "Gérer les espaces",
          "Choisir le bon moment pour presser"
        ],
        es: [
          "Replegarse completamente sin presión ni estructura",
          "Mantener el equilibrio",
          "Gestionar los espacios",
          "Elegir el momento adecuado para presionar"
        ],
        pt: [
          "Recuar completamente sem pressão ou organização",
          "Manter o equilíbrio",
          "Controlar os espaços",
          "Escolher o momento certo para pressionar"
        ]
      },
      correct: {
        ar: "التراجع الكامل دون ضغط أو تنظيم",
        en: "Dropping completely without pressure or structure",
        fr: "Reculer complètement sans pression ni organisation",
        es: "Replegarse completamente sin presión ni estructura",
        pt: "Recuar completamente sem pressão ou organização"
      }
    }

  ],

  knowledge: [

    {
      difficulty: 1,
      q: {
        ar: "ما أكبر محيط على الأرض؟",
        en: "What is the largest ocean on Earth?",
        fr: "Quel est le plus grand océan de la Terre ?",
        es: "¿Cuál es el océano más grande de la Tierra?",
        pt: "Qual é o maior oceano da Terra?"
      },
      a: {
        ar: ["المحيط الهادئ", "المحيط الأطلسي", "المحيط الهندي", "المحيط المتجمد الشمالي"],
        en: ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean"],
        fr: ["Océan Pacifique", "Océan Atlantique", "Océan Indien", "Océan Arctique"],
        es: ["Océano Pacífico", "Océano Atlántico", "Océano Índico", "Océano Ártico"],
        pt: ["Oceano Pacífico", "Oceano Atlântico", "Oceano Índico", "Oceano Ártico"]
      },
      correct: {
        ar: "المحيط الهادئ",
        en: "Pacific Ocean",
        fr: "Océan Pacifique",
        es: "Océano Pacífico",
        pt: "Oceano Pacífico"
      }
    },

    {
      difficulty: 2,
      q: {
        ar: "ما الكوكب المعروف بالكوكب الأحمر؟",
        en: "Which planet is known as the Red Planet?",
        fr: "Quelle planète est connue comme la planète rouge ?",
        es: "¿Qué planeta es conocido como el planeta rojo?",
        pt: "Qual planeta é conhecido como o planeta vermelho?"
      },
      a: {
        ar: ["المريخ", "الزهرة", "عطارد", "المشتري"],
        en: ["Mars", "Venus", "Mercury", "Jupiter"],
        fr: ["Mars", "Vénus", "Mercure", "Jupiter"],
        es: ["Marte", "Venus", "Mercurio", "Júpiter"],
        pt: ["Marte", "Vênus", "Mercúrio", "Júpiter"]
      },
      correct: {
        ar: "المريخ",
        en: "Mars",
        fr: "Mars",
        es: "Marte",
        pt: "Marte"
      }
    },

    {
      difficulty: 3,
      q: {
        ar: "كم عدد القارات المتعارف عليها في النموذج ذي السبع قارات؟",
        en: "How many continents are commonly recognized in the seven-continent model?",
        fr: "Combien de continents sont généralement reconnus dans le modèle à sept continents ?",
        es: "¿Cuántos continentes se reconocen comúnmente en el modelo de siete continentes?",
        pt: "Quantos continentes são geralmente reconhecidos no modelo de sete continentes?"
      },
      a: {
        ar: ["5", "6", "7", "8"],
        en: ["5", "6", "7", "8"],
        fr: ["5", "6", "7", "8"],
        es: ["5", "6", "7", "8"],
        pt: ["5", "6", "7", "8"]
      },
      correct: {
        ar: "7",
        en: "7",
        fr: "7",
        es: "7",
        pt: "7"
      }
    },

    {
      difficulty: 4,
      q: {
        ar: "ما الغاز الأكثر وفرة في الغلاف الجوي للأرض؟",
        en: "Which gas is most abundant in Earth's atmosphere?",
        fr: "Quel gaz est le plus abondant dans l'atmosphère terrestre ?",
        es: "¿Qué gas es más abundante en la atmósfera terrestre?",
        pt: "Qual gás é mais abundante na atmosfera da Terra?"
      },
      a: {
        ar: ["الأكسجين", "النيتروجين", "ثاني أكسيد الكربون", "الهيدروجين"],
        en: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"],
        fr: ["Oxygène", "Azote", "Dioxyde de carbone", "Hydrogène"],
        es: ["Oxígeno", "Nitrógeno", "Dióxido de carbono", "Hidrógeno"],
        pt: ["Oxigênio", "Nitrogênio", "Dióxido de carbono", "Hidrogênio"]
      },
      correct: {
        ar: "النيتروجين",
        en: "Nitrogen",
        fr: "Azote",
        es: "Nitrógeno",
        pt: "Nitrogênio"
      }
    },

    {
      difficulty: 5,
      q: {
        ar: "ما اللغة الأكثر انتشارًا من حيث عدد المتحدثين الأصليين تقريبًا؟",
        en: "Which language has the largest number of native speakers?",
        fr: "Quelle langue compte le plus grand nombre de locuteurs natifs ?",
        es: "¿Qué idioma tiene el mayor número de hablantes nativos?",
        pt: "Qual idioma tem o maior número de falantes nativos?"
      },
      a: {
        ar: ["الإنجليزية", "الإسبانية", "الصينية المندرينية", "العربية"],
        en: ["English", "Spanish", "Mandarin Chinese", "Arabic"],
        fr: ["Anglais", "Espagnol", "Chinois mandarin", "Arabe"],
        es: ["Inglés", "Español", "Chino mandarín", "Árabe"],
        pt: ["Inglês", "Espanhol", "Chinês mandarim", "Árabe"]
      },
      correct: {
        ar: "الصينية المندرينية",
        en: "Mandarin Chinese",
        fr: "Chinois mandarin",
        es: "Chino mandarín",
        pt: "Chinês mandarim"
      }
    },

    {
      difficulty: 6,
      q: {
        ar: "ما الوحدة الأساسية لقياس شدة التيار الكهربائي؟",
        en: "What is the SI unit of electric current?",
        fr: "Quelle est l'unité SI de l'intensité du courant électrique ?",
        es: "¿Cuál es la unidad del SI para la corriente eléctrica?",
        pt: "Qual é a unidade do SI para corrente elétrica?"
      },
      a: {
        ar: ["الفولت", "الأمبير", "الواط", "الأوم"],
        en: ["Volt", "Ampere", "Watt", "Ohm"],
        fr: ["Volt", "Ampère", "Watt", "Ohm"],
        es: ["Voltio", "Amperio", "Vatio", "Ohmio"],
        pt: ["Volt", "Ampere", "Watt", "Ohm"]
      },
      correct: {
        ar: "الأمبير",
        en: "Ampere",
        fr: "Ampère",
        es: "Amperio",
        pt: "Ampere"
      }
    },

    {
      difficulty: 7,
      q: {
        ar: "أي عنصر كيميائي رمزه Fe؟",
        en: "Which chemical element has the symbol Fe?",
        fr: "Quel élément chimique porte le symbole Fe ?",
        es: "¿Qué elemento químico tiene el símbolo Fe?",
        pt: "Qual elemento químico tem o símbolo Fe?"
      },
      a: {
        ar: ["الفلور", "الحديد", "الفضة", "الفوسفور"],
        en: ["Fluorine", "Iron", "Silver", "Phosphorus"],
        fr: ["Fluor", "Fer", "Argent", "Phosphore"],
        es: ["Flúor", "Hierro", "Plata", "Fósforo"],
        pt: ["Flúor", "Ferro", "Prata", "Fósforo"]
      },
      correct: {
        ar: "الحديد",
        en: "Iron",
        fr: "Fer",
        es: "Hierro",
        pt: "Ferro"
      }
    },

    {
      difficulty: 8,
      q: {
        ar: "ما العضو الذي يضخ الدم إلى أنحاء الجسم؟",
        en: "Which organ pumps blood throughout the body?",
        fr: "Quel organe pompe le sang dans tout le corps ?",
        es: "¿Qué órgano bombea la sangre por todo el cuerpo?",
        pt: "Qual órgão bombeia sangue por todo o corpo?"
      },
      a: {
        ar: ["الرئة", "الكبد", "القلب", "الكلى"],
        en: ["Lung", "Liver", "Heart", "Kidney"],
        fr: ["Poumon", "Foie", "Cœur", "Rein"],
        es: ["Pulmón", "Hígado", "Corazón", "Riñón"],
        pt: ["Pulmão", "Fígado", "Coração", "Rim"]
      },
      correct: {
        ar: "القلب",
        en: "Heart",
        fr: "Cœur",
        es: "Corazón",
        pt: "Coração"
      }
    },

    {
      difficulty: 9,
      q: {
        ar: "ما اسم العملية التي تحول فيها النباتات الضوء إلى طاقة كيميائية؟",
        en: "What process allows plants to convert light into chemical energy?",
        fr: "Quel processus permet aux plantes de convertir la lumière en énergie chimique ?",
        es: "¿Qué proceso permite a las plantas convertir la luz en energía química?",
        pt: "Qual processo permite às plantas converter luz em energia química?"
      },
      a: {
        ar: ["التنفس", "البناء الضوئي", "التخمير", "الهضم"],
        en: ["Respiration", "Photosynthesis", "Fermentation", "Digestion"],
        fr: ["Respiration", "Photosynthèse", "Fermentation", "Digestion"],
        es: ["Respiración", "Fotosíntesis", "Fermentación", "Digestión"],
        pt: ["Respiração", "Fotossíntese", "Fermentação", "Digestão"]
      },
      correct: {
        ar: "البناء الضوئي",
        en: "Photosynthesis",
        fr: "Photosynthèse",
        es: "Fotosíntesis",
        pt: "Fotossíntese"
      }
    },

    {
      difficulty: 10,
      q: {
        ar: "أي كوكب في المجموعة الشمسية يستغرق أطول مدة لإكمال دورة حول الشمس؟",
        en: "Which planet in our solar system takes the longest time to orbit the Sun?",
        fr: "Quelle planète du système solaire met le plus de temps à faire le tour du Soleil ?",
        es: "¿Qué planeta del sistema solar tarda más en completar una órbita alrededor del Sol?",
        pt: "Qual planeta do sistema solar leva mais tempo para orbitar o Sol?"
      },
      a: {
        ar: ["المشتري", "زحل", "أورانوس", "نبتون"],
        en: ["Jupiter", "Saturn", "Uranus", "Neptune"],
        fr: ["Jupiter", "Saturne", "Uranus", "Neptune"],
        es: ["Júpiter", "Saturno", "Urano", "Neptuno"],
        pt: ["Júpiter", "Saturno", "Urano", "Netuno"]
      },
      correct: {
        ar: "نبتون",
        en: "Neptune",
        fr: "Neptune",
        es: "Neptuno",
        pt: "Netuno"
      }
    }

  ]

};

/* =========================================================
   GAME DEFINITIONS
   ========================================================= */

const GAME_DEFINITIONS = [
  {
    id: "logic",
    icon: "🧠",
    titleKey: "logicName",
    descKey: "logicDesc"
  },
  {
    id: "football",
    icon: "⚽",
    titleKey: "footballName",
    descKey: "footballDesc"
  },
  {
    id: "knowledge",
    icon: "🌍",
    titleKey: "knowledgeName",
    descKey: "knowledgeDesc"
  }
];

/* =========================================================
   STATE
   ========================================================= */

let language =
  localStorage.getItem(CONFIG.storage.language) ||
  CONFIG.defaultLanguage;

if (!CONFIG.languages.includes(language)) {
  language = CONFIG.defaultLanguage;
}

let profile =
  loadJSON(CONFIG.storage.profile) || {
    name: "",
    age: 0,
    points: 0,
    level: 1,
    games: 0,
    correct: 0,
    answered: 0,
    totalTime: 0
  };

let leaderboard =
  loadJSON(CONFIG.storage.leaderboard) || [];

let history =
  loadJSON(CONFIG.storage.history) || [];

let gameState = {
  active: false,
  gameId: null,
  questions: [],
  index: 0,
  correct: 0,
  score: 0,
  startedAt: 0,
  questionStartedAt: 0,
  questionTimes: [],
  timer: null,
  timeLeft: 0,
  locked: false
};

/* =========================================================
   DOM
   ========================================================= */

const $ = (id) => document.getElementById(id);

/* =========================================================
   STORAGE
   ========================================================= */

function loadJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* =========================================================
   LANGUAGE
   ========================================================= */

function t(key) {
  return UI[language]?.[key] || UI.ar[key] || key;
}

function changeLanguage(newLanguage) {

  if (!CONFIG.languages.includes(newLanguage)) {
    return;
  }

  language = newLanguage;

  localStorage.setItem(
    CONFIG.storage.language,
    language
  );

  document.documentElement.lang = language;

  document.documentElement.dir =
    language === "ar"
      ? "rtl"
      : "ltr";

  applyTranslations();

  renderGames();

  renderProfile();

  renderLeaderboard();

  renderPersonality();
}

function applyTranslations() {

  document
    .querySelectorAll("[data-i18n]")
    .forEach((element) => {

      const key =
        element.getAttribute("data-i18n");

      if (UI[language]?.[key]) {
        element.textContent =
          UI[language][key];
      }

    });

  if ($("playerName")) {
    $("playerName").placeholder =
      language === "ar"
        ? "اكتب اسمك"
        : "Enter your name";
  }

  if ($("playerAge")) {
    $("playerAge").placeholder =
      language === "ar"
        ? "العمر"
        : "Age";
  }
}

/* =========================================================
   PROFILE
   ========================================================= */

function saveProfile() {

  const name =
    $("playerName")?.value.trim();

  const age =
    Number($("playerAge")?.value);

  if (!name) {
    showToast(
      language === "ar"
        ? "اكتب اسم اللاعب."
        : "Enter the player name."
    );
    return;
  }

  if (
    !Number.isFinite(age) ||
    age < CONFIG.minAge ||
    age > CONFIG.maxAge
  ) {
    showToast(
      language === "ar"
        ? "أدخل عمرًا صحيحًا."
        : "Enter a valid age."
    );
    return;
  }

  profile.name = name;
  profile.age = age;

  profile.level =
    calculateLevel(profile.points);

  saveJSON(
    CONFIG.storage.profile,
    profile
  );

  renderProfile();

  showToast(t("profileSaved"));
}

function renderProfile() {

  const name =
    profile.name || t("playerDefault");

  if ($("playerName")) {
    $("playerName").value =
      profile.name || "";
  }

  if ($("playerAge")) {
    $("playerAge").value =
      profile.age || "";
  }

  setText("miniName", name);

  setText(
    "miniPoints",
    profile.points
  );

  setText(
    "miniLevel",
    profile.level
  );

  setText(
    "profilePoints",
    profile.points
  );

  setText(
    "profileLevel",
    profile.level
  );

  setText(
    "profileGames",
    profile.games
  );

  const accuracy =
    profile.answered > 0
      ? Math.round(
          (profile.correct /
            profile.answered) *
            100
        )
      : 0;

  setText(
    "profileAccuracy",
    `${accuracy}%`
  );
}

/* =========================================================
   LEVEL SYSTEM
   ========================================================= */

function calculateLevel(points) {

  if (points < 100) return 1;
  if (points < 250) return 2;
  if (points < 450) return 3;
  if (points < 700) return 4;
  if (points < 1000) return 5;
  if (points < 1400) return 6;
  if (points < 1900) return 7;
  if (points < 2500) return 8;
  if (points < 3300) return 9;

  return 10;
}

/* =========================================================
   DIFFICULTY
   ========================================================= */

function getDifficultyTarget() {

  const age =
    Number(profile.age) || 18;

  const level =
    Number(profile.level) || 1;

  let ageBonus = 0;

  if (age >= 13) ageBonus = 1;
  if (age >= 18) ageBonus = 2;
  if (age >= 30) ageBonus = 3;
  if (age >= 45) ageBonus = 4;

  return Math.min(
    10,
    Math.max(
      1,
      level + ageBonus
    )
  );
}

/* =========================================================
   RANDOMIZATION
   ========================================================= */

function shuffle(array) {

  const copy = [...array];

  for (
    let i = copy.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        Math.random() * (i + 1)
      );

    [
      copy[i],
      copy[j]
    ] =
    [
      copy[j],
      copy[i]
    ];
  }

  return copy;
}

/* =========================================================
   QUESTION SELECTION
   ========================================================= */

function selectQuestions(gameId) {

  const bank =
    QUESTIONS[gameId] || [];

  if (!bank.length) {
    return [];
  }

  const target =
    getDifficultyTarget();

  /*
    We deliberately mix nearby difficulties
    instead of always giving the same 10.
  */

  const sorted =
    [...bank].sort(
      (a, b) =>
        Math.abs(a.difficulty - target) -
        Math.abs(b.difficulty - target)
    );

  const pool =
    shuffle(sorted.slice(0, Math.min(10, sorted.length)));

  return pool.slice(
    0,
    CONFIG.questionsPerGame
  );
}

/* =========================================================
   GAMES UI
   ========================================================= */

function renderGames() {

  const container =
    $("games");

  if (!container) return;

  container.innerHTML = "";

  GAME_DEFINITIONS.forEach(
    (game) => {

      const card =
        document.createElement("article");

      card.className =
        "game-card";

      card.setAttribute(
        "role",
        "button"
      );

      card.tabIndex = 0;

      card.innerHTML = `
        <div class="game-icon">
          ${game.icon}
        </div>

        <h3>${escapeHTML(t(game.titleKey))}</h3>

        <p>${escapeHTML(t(game.descKey))}</p>

        <div class="game-meta">
          <span>10 ${language === "ar" ? "أسئلة" : "Questions"}</span>
          <span>⏱ ${language === "ar" ? "وقت" : "Timed"}</span>
          <span>🔥 ${t("level")} ${profile.level}</span>
        </div>
      `;

      card.addEventListener(
        "click",
        () => startGame(game.id)
      );

      card.addEventListener(
        "keydown",
        (event) => {

          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            startGame(game.id);
          }

        }
      );

      container.appendChild(card);
    }
  );
}

/* =========================================================
   START GAME
   ========================================================= */

function startGame(gameId) {

  if (!profile.name || !profile.age) {

    showToast(
      t("needProfile")
    );

    showPage("profile");

    return;
  }

  const questions =
    selectQuestions(gameId);

  if (questions.length < CONFIG.questionsPerGame) {

    showToast(
      "Question bank is not large enough."
    );

    return;
  }

  clearGameTimer();

  gameState = {
    active: true,
    gameId,
    questions,
    index: 0,
    correct: 0,
    score: 0,
    startedAt: Date.now(),
    questionStartedAt: 0,
    questionTimes: [],
    timer: null,
    timeLeft: 0,
    locked: false
  };

  const game =
    GAME_DEFINITIONS.find(
      g => g.id === gameId
    );

  setText(
    "gameIcon",
    game?.icon || "🎮"
  );

  setText(
    "quizTitle",
    t(game?.titleKey || "")
  );

  showPage("quiz");

  renderQuestion();
}

/* =========================================================
   TIME LIMIT
   ========================================================= */

function getQuestionTime(question) {

  const base = 30;

  const difficulty =
    Number(question.difficulty) || 1;

  /*
    Higher difficulty = slightly less time.
    Age/level also influence the pressure.
  */

  const level =
    Number(profile.level) || 1;

  let seconds =
    base -
    (difficulty - 1) * 1.5 -
    Math.min(level - 1, 5);

  return Math.max(
    10,
    Math.round(seconds)
  );
}

/* =========================================================
   RENDER QUESTION
   ========================================================= */

function renderQuestion() {

  clearGameTimer();

  gameState.locked = false;

  const question =
    gameState.questions[
      gameState.index
    ];

  if (!question) {
    finishGame();
    return;
  }

  const total =
    gameState.questions.length;

  const current =
    gameState.index + 1;

  setText(
    "questionCounter",
    `${current} / ${total}`
  );

  setText(
    "question",
    question.q[language]
  );

  const answers =
    $("answers");

  answers.innerHTML = "";

  const options =
    shuffle(
      question.a[language]
    );

  options.forEach(
    (answer) => {

      const button =
        document.createElement("button");

      button.type = "button";

      button.className =
        "answer-button";

      button.textContent =
        answer;

      button.addEventListener(
        "click",
        () =>
          submitAnswer(
            answer,
            button,
            question
          )
      );

      answers.appendChild(button);
    }
  );

  setText(
    "feedback",
    ""
  );

  $("feedback").className =
    "feedback";

  const progress =
    (gameState.index /
      total) *
    100;

  if ($("progressBar")) {
    $("progressBar").style.width =
      `${progress}%`;
  }

  gameState.questionStartedAt =
    Date.now();

  startQuestionTimer(
    getQuestionTime(question)
  );
}

/* =========================================================
   TIMER
   ========================================================= */

function startQuestionTimer(seconds) {

  gameState.timeLeft =
    seconds;

  updateTimer();

  gameState.timer =
    setInterval(
      () => {

        gameState.timeLeft--;

        updateTimer();

        if (
          gameState.timeLeft <= 0
        ) {

          clearGameTimer();

          timeOut();

        }

      },
      1000
    );
}

function updateTimer() {

  const timer =
    $("timer");

  if (!timer) return;

  timer.textContent =
    gameState.timeLeft;

  timer.classList.toggle(
    "warning",
    gameState.timeLeft <= 7
  );
}

function clearGameTimer() {

  if (gameState.timer) {

    clearInterval(
      gameState.timer
    );

    gameState.timer = null;
  }
}

/* =========================================================
   ANSWER
   ========================================================= */

function submitAnswer(
  selected,
  clickedButton,
  question
) {

  if (
    !gameState.active ||
    gameState.locked
  ) {
    return;
  }

  gameState.locked = true;

  clearGameTimer();

  const elapsed =
    Date.now() -
    gameState.questionStartedAt;

  const seconds =
    Math.max(
      0.1,
      elapsed / 1000
    );

  gameState.questionTimes.push(
    seconds
  );

  const correctAnswer =
    question.correct[language];

  const isCorrect =
    selected === correctAnswer;

  document
    .querySelectorAll(
      ".answer-button"
    )
    .forEach(
      (button) => {

        button.disabled =
          true;

        if (
          button.textContent ===
          correctAnswer
        ) {
          button.classList.add(
            "correct"
          );
        }

      }
    );

  if (isCorrect) {

    gameState.correct++;

    const earned =
      calculateQuestionScore(
        question.difficulty,
        seconds
      );

    gameState.score +=
      earned;

    clickedButton.classList.add(
      "correct"
    );

    setFeedback(
      t("answerCorrect"),
      true
    );

  } else {

    clickedButton.classList.add(
      "wrong"
    );

    setFeedback(
      t("answerWrong"),
      false
    );
  }

  /*
    Important:
    The answer remains visible for exactly
    the configured feedback period.
  */

  setTimeout(
    () => {

      if (!gameState.active) {
        return;
      }

      gameState.index++;

      renderQuestion();

    },
    CONFIG.feedbackDelay
  );
}

/* =========================================================
   TIME OUT
   ========================================================= */

function timeOut() {

  if (
    !gameState.active ||
    gameState.locked
  ) {
    return;
  }

  gameState.locked = true;

  const question =
    gameState.questions[
      gameState.index
    ];

  const correctAnswer =
    question.correct[language];

  document
    .querySelectorAll(
      ".answer-button"
    )
    .forEach(
      (button) => {

        button.disabled =
          true;

        if (
          button.textContent ===
          correctAnswer
        ) {
          button.classList.add(
            "correct"
          );
        }

      }
    );

  setFeedback(
    t("timeUp"),
    false
  );

  setTimeout(
    () => {

      if (!gameState.active) {
        return;
      }

      gameState.index++;

      renderQuestion();

    },
    CONFIG.feedbackDelay
  );
}

/* =========================================================
   SCORING
   ========================================================= */

function calculateQuestionScore(
  difficulty,
  seconds
) {

  const base =
    50 +
    Number(difficulty) * 20;

  const speedBonus =
    Math.max(
      0,
      Math.round(
        (20 - seconds) * 3
      )
    );

  const levelBonus =
    Math.max(
      0,
      (profile.level - 1) * 5
    );

  return (
    base +
    speedBonus +
    levelBonus
  );
}

/* =========================================================
   FEEDBACK
   ========================================================= */

function setFeedback(
  message,
  correct
) {

  const element =
    $("feedback");

  if (!element) return;

  element.textContent =
    message;

  element.className =
    correct
      ? "feedback correct"
      : "feedback wrong";
}

/* =========================================================
   FINISH GAME
   ========================================================= */

function finishGame() {

  clearGameTimer();

  gameState.active = false;

  const total =
    gameState.questions.length;

  const averageTime =
    gameState.questionTimes.length
      ? gameState.questionTimes
          .reduce(
            (sum, value) =>
              sum + value,
            0
          ) /
        gameState.questionTimes.length
      : 0;

  profile.points +=
    gameState.score;

  profile.games++;

  profile.correct +=
    gameState.correct;

  profile.answered +=
    total;

  profile.totalTime +=
    averageTime * total;

  profile.level =
    calculateLevel(
      profile.points
    );

  saveJSON(
    CONFIG.storage.profile,
    profile
  );

  recordLeaderboard(
    gameState.score
  );

  history.push({
    gameId: gameState.gameId,
    score: gameState.score,
    correct: gameState.correct,
    total,
    averageTime:
      Number(
        averageTime.toFixed(2)
      ),
    level: profile.level,
    date:
      new Date().toISOString()
  });

  /*
    Keep only recent local history.
  */

  if (history.length > 100) {
    history =
      history.slice(-100);
  }

  saveJSON(
    CONFIG.storage.history,
    history
  );

  setText(
    "resultScore",
    gameState.score
  );

  setText(
    "resultCorrect",
    `${gameState.correct}/${total}`
  );

  setText(
    "resultTime",
    `${averageTime.toFixed(1)}s`
  );

  setText(
    "resultLevel",
    profile.level
  );

  renderProfile();

  renderLeaderboard();

  showPage("result");
}

/* =========================================================
   LEADERBOARD
   ========================================================= */

function recordLeaderboard(score) {

  const name =
    profile.name ||
    t("playerDefault");

  const existingIndex =
    leaderboard.findIndex(
      player =>
        player.name === name
    );

  const entry = {
    name,
    points:
      Number(score) || 0,
    level:
      profile.level,
    updated:
      Date.now()
  };

  if (existingIndex >= 0) {

    leaderboard[
      existingIndex
    ].points +=
      entry.points;

    leaderboard[
      existingIndex
    ].level =
      profile.level;

    leaderboard[
      existingIndex
    ].updated =
      Date.now();

  } else {

    leaderboard.push(entry);

  }

  leaderboard.sort(
    (a, b) =>
      b.points - a.points
  );

  leaderboard =
    leaderboard.slice(
      0,
      100
    );

  saveJSON(
    CONFIG.storage.leaderboard,
    leaderboard
  );
}

function renderLeaderboard() {

  const body =
    $("leaderboardBody");

  if (!body) return;

  body.innerHTML = "";

  if (!leaderboard.length) {

    const row =
      document.createElement("tr");

    row.innerHTML = `
      <td colspan="4">
        ${escapeHTML(t("noRanking"))}
      </td>
    `;

    body.appendChild(row);

    return;
  }

  leaderboard.forEach(
    (player, index) => {

      const row =
        document.createElement("tr");

      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${escapeHTML(player.name)}</td>
        <td>${Number(player.points)}</td>
        <td>${Number(player.level)}</td>
      `;

      body.appendChild(row);
    }
  );
}

/* =========================================================
   PERSONALITY ENGINE
   ========================================================= */

const PERSONALITY_QUESTIONS = {

  ar: [
    {
      q: "أمامك قرار صعب ووقت قليل. ماذا تفعل؟",
      options: [
        ["أحلل الخيارات بسرعة", "analytical"],
        ["أختار فورًا", "fastThinker"],
        ["أبحث عن أفضل خطة", "strategic"],
        ["أجرب الخيار الأكثر جرأة", "riskTaker"]
      ]
    },
    {
      q: "إذا خسرت جولة بسبب قرارك، ماذا تفعل؟",
      options: [
        ["أحلل الخطأ", "analytical"],
        ["أبدأ الجولة التالية فورًا", "fastThinker"],
        ["أغير الخطة", "strategic"],
        ["أخاطر أكثر", "riskTaker"]
      ]
    },
    {
      q: "عندما ترى فرصة للفوز ولكن فيها مخاطرة؟",
      options: [
        ["أدرسها", "analytical"],
        ["أقرر بسرعة", "fastThinker"],
        ["أحسب تأثيرها على المباراة", "strategic"],
        ["أقتنصها", "riskTaker"]
      ]
    }
  ],

  en: [
    {
      q: "You face a difficult decision with little time. What do you do?",
      options: [
        ["Analyze quickly", "analytical"],
        ["Choose immediately", "fastThinker"],
        ["Look for the best plan", "strategic"],
        ["Take the bold option", "riskTaker"]
      ]
    },
    {
      q: "You lose a round because of your decision. What do you do?",
      options: [
        ["Analyze the mistake", "analytical"],
        ["Start the next round immediately", "fastThinker"],
        ["Change the plan", "strategic"],
        ["Take more risks", "riskTaker"]
      ]
    },
    {
      q: "You see a winning opportunity with some risk. What do you do?",
      options: [
        ["Study it", "analytical"],
        ["Decide quickly", "fastThinker"],
        ["Consider the bigger impact", "strategic"],
        ["Take the opportunity", "riskTaker"]
      ]
    }
  ],

  fr: [
    {
      q: "Vous devez prendre une décision difficile avec peu de temps. Que faites-vous ?",
      options: [
        ["J'analyse rapidement", "analytical"],
        ["Je choisis immédiatement", "fastThinker"],
        ["Je cherche le meilleur plan", "strategic"],
        ["Je prends l'option audacieuse", "riskTaker"]
      ]
    },
    {
      q: "Vous perdez une manche à cause de votre décision. Que faites-vous ?",
      options: [
        ["J'analyse l'erreur", "analytical"],
        ["Je commence immédiatement la suivante", "fastThinker"],
        ["Je change de plan", "strategic"],
        ["Je prends plus de risques", "riskTaker"]
      ]
    },
    {
      q: "Vous voyez une opportunité de gagner avec un certain risque. Que faites-vous ?",
      options: [
        ["Je l'étudie", "analytical"],
        ["Je décide rapidement", "fastThinker"],
        ["Je pense à l'impact global", "strategic"],
        ["Je saisis l'occasion", "riskTaker"]
      ]
    }
  ],

  es: [
    {
      q: "Tienes una decisión difícil y poco tiempo. ¿Qué haces?",
      options: [
        ["Analizo rápidamente", "analytical"],
        ["Elijo de inmediato", "fastThinker"],
        ["Busco el mejor plan", "strategic"],
        ["Tomo la opción arriesgada", "riskTaker"]
      ]
    },
    {
      q: "Pierdes una ronda por una decisión tuya. ¿Qué haces?",
      options: [
        ["Analizo el error", "analytical"],
        ["Empiezo la siguiente inmediatamente", "fastThinker"],
        ["Cambio el plan", "strategic"],
        ["Asumo más riesgos", "riskTaker"]
      ]
    },
    {
      q: "Ves una oportunidad de ganar con cierto riesgo. ¿Qué haces?",
      options: [
        ["La estudio", "analytical"],
        ["Decido rápido", "fastThinker"],
        ["Pienso en el impacto global", "strategic"],
        ["Aprovecho la oportunidad", "riskTaker"]
      ]
    }
  ],

  pt: [
    {
      q: "Você enfrenta uma decisão difícil com pouco tempo. O que faz?",
      options: [
        ["Analiso rapidamente", "analytical"],
        ["Escolho imediatamente", "fastThinker"],
        ["Procuro o melhor plano", "strategic"],
        ["Escolho a opção ousada", "riskTaker"]
      ]
    },
    {
      q: "Você perde uma rodada por causa de uma decisão sua. O que faz?",
      options: [
        ["Analiso o erro", "analytical"],
        ["Começo a próxima imediatamente", "fastThinker"],
        ["Mudo o plano", "strategic"],
        ["Assumo mais riscos", "riskTaker"]
      ]
    },
    {
      q: "Você vê uma oportunidade de vencer com algum risco. O que faz?",
      options: [
        ["Estudo a situação", "analytical"],
        ["Decido rapidamente", "fastThinker"],
        ["Penso no impacto geral", "strategic"],
        ["Aproveito a oportunidade", "riskTaker"]
      ]
    }
  ]
};

let personalityState = {
  active: false,
  index: 0,
  scores: {
    strategic: 0,
    fastThinker: 0,
    analytical: 0,
    riskTaker: 0
  }
};

function renderPersonality() {

  const container =
    $("personalityContent");

  if (!container) return;

  container.innerHTML = `
    <div class="personality-card">
      <h3>${escapeHTML(t("personalityName"))}</h3>

      <p>
        ${escapeHTML(t("personalityIntro"))}
      </p>

      <button
        class="main-button"
        id="startPersonalityBtn">
        ${escapeHTML(t("whoStart"))}
      </button>
    </div>
  `;

  $("startPersonalityBtn")
    ?.addEventListener(
      "click",
      startPersonality
    );
}

function startPersonality() {

  personalityState = {
    active: true,
    index: 0,
    scores: {
      strategic: 0,
      fastThinker: 0,
      analytical: 0,
      riskTaker: 0
    }
  };

  renderPersonalityQuestion();
}

function renderPersonalityQuestion() {

  const container =
    $("personalityContent");

  const bank =
    PERSONALITY_QUESTIONS[
      language
    ] || PERSONALITY_QUESTIONS.ar;

  const item =
    bank[personalityState.index];

  if (!item) {
    finishPersonality();
    return;
  }

  container.innerHTML = `
    <div class="personality-card">

      <h3>
        ${escapeHTML(t("personalityName"))}
      </h3>

      <p>
        ${escapeHTML(t("whoQuestion"))}
      </p>

      <h3 style="margin-top:15px;color:inherit;">
        ${escapeHTML(item.q)}
      </h3>

      <div class="answers" style="margin-top:20px;">
        ${item.options
          .map(
            ([text, type], index) => `
              <button
                class="answer-button personality-answer"
                data-type="${escapeHTML(type)}"
                data-index="${index}">
                ${escapeHTML(text)}
              </button>
            `
          )
          .join("")}
      </div>

    </div>
  `;

  container
    .querySelectorAll(
      ".personality-answer"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const type =
              button.dataset.type;

            personalityState.scores[type]++;

            personalityState.index++;

            renderPersonalityQuestion();
          }
        );

      }
    );
}

function finishPersonality() {

  const scores =
    personalityState.scores;

  const top =
    Object.entries(scores)
      .sort(
        (a, b) =>
          b[1] - a[1]
      )[0][0];

  const container =
    $("personalityContent");

  container.innerHTML = `
    <div class="personality-card">

      <h3>
        ${escapeHTML(t("personalityResult"))}
      </h3>

      <h2 style="margin:10px 0;">
        ${escapeHTML(t(top))}
      </h2>

      <p>
        ${escapeHTML(
          t(`${top}Desc`)
        )}
      </p>

      <div class="personality-meter">
        <span style="width:${Math.min(
          100,
          scores[top] * 33
        )}%"></span>
      </div>

      <button
        class="main-button"
        style="margin-top:20px;"
        onclick="startPersonality()">
        ${escapeHTML(t("whoStart"))}
      </button>

    </div>
  `;
}

/* =========================================================
   PAGE NAVIGATION
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

  const page =
    $(pageId);

  if (page) {
    page.classList.add(
      "active"
    );
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  if (pageId === "leaderboard") {
    renderLeaderboard();
  }

  if (pageId === "profile") {
    renderProfile();
  }

  if (pageId === "personality") {
    renderPersonality();
  }
}

/* =========================================================
   HELPERS
   ========================================================= */

function setText(
  id,
  value
) {

  const element =
    $(id);

  if (element) {
    element.textContent =
      value;
  }
}

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================================================
   TOAST
   ========================================================= */

let toastTimeout = null;

function showToast(message) {

  const toast =
    $("toast");

  if (!toast) return;

  toast.textContent =
    message;

  toast.classList.add(
    "show"
  );

  clearTimeout(
    toastTimeout
  );

  toastTimeout =
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
   INITIALIZATION
   ========================================================= */

function init() {

  document.documentElement.lang =
    language;

  document.documentElement.dir =
    language === "ar"
      ? "rtl"
      : "ltr";

  const languageSelect =
    $("language");

  if (languageSelect) {
    languageSelect.value =
      language;
  }

  applyTranslations();

  renderProfile();

  renderGames();

  renderLeaderboard();

  renderPersonality();

  showPage("home");
}

document.addEventListener(
  "DOMContentLoaded",
  init
);

/* =========================================================
   GLOBAL API
   ========================================================= */

window.changeLanguage =
  changeLanguage;

window.showPage =
  showPage;

window.saveProfile =
  saveProfile;

window.startGame =
  startGame;

window.startPersonality =
  startPersonality;
