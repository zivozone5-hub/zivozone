(() => {
  'use strict';
  /* V1230.27 — Phase 5 content data for the two real mini-games that genuinely need language text
     ("lateral" hidden-object riddles, "language" sentence-order rush). This is DATA (riddle/sentence
     content), not UI chrome, same category as question-bank.js — kept in its own file and excluded
     from the hardcoded-Arabic gate for the same reason (see scripts/qa_no_hardcoded_arabic.py).
     V1230.36 — "اعمل كل شي", part 6: extended to real content in all 7 UI languages (ar/en/zh/hi/
     es/fr/fa). English is kept only as the final fallback for an unrecognized language code, not as
     a substitute for any of the 5 languages that previously fell back to it — every supported
     language now gets its own riddles and its own sentence-order puzzle. */

  const LATERAL = {
    ar: [
      { riddle: 'شيء كلما أخذت منه كبر، ما هو؟', answer: '🕳️', decoys: ['🍎', '⚽', '📚', '🔑', '🎈', '🪑', '🎵', '🧦'] },
      { riddle: 'له أسنان ولا يعض، ما هو؟', answer: '🪮', decoys: ['🦈', '🐍', '🍇', '📱', '🕯️', '🧢', '🎯', '🪑'] },
      { riddle: 'يمشي طوال حياته ولا يملك قدمين، ما هو؟', answer: '⏰', decoys: ['🐠', '📦', '🎻', '🧥', '🍉', '🖋️', '🪵', '🎲'] },
      { riddle: 'كلما زاد، قلّت الرؤية، ما هو؟', answer: '🌫️', decoys: ['💡', '🪟', '📷', '🧊', '🎨', '🪞', '🧵', '🔦'] },
      { riddle: 'بيت بلا أبواب ولا نوافذ، ما هو؟', answer: '🥚', decoys: ['🏠', '📦', '🧳', '🎁', '🪑', '🎒', '🛏️', '🪟'] },
    ],
    en: [
      { riddle: 'The more you take, the bigger it gets — what is it?', answer: '🕳️', decoys: ['🍎', '⚽', '📚', '🔑', '🎈', '🪑', '🎵', '🧦'] },
      { riddle: 'It has teeth but never bites — what is it?', answer: '🪮', decoys: ['🦈', '🐍', '🍇', '📱', '🕯️', '🧢', '🎯', '🪑'] },
      { riddle: 'It walks all its life without feet — what is it?', answer: '⏰', decoys: ['🐠', '📦', '🎻', '🧥', '🍉', '🖋️', '🪵', '🎲'] },
      { riddle: 'The more there is, the less you can see — what is it?', answer: '🌫️', decoys: ['💡', '🪟', '📷', '🧊', '🎨', '🪞', '🧵', '🔦'] },
      { riddle: 'A house with no doors or windows — what is it?', answer: '🥚', decoys: ['🏠', '📦', '🧳', '🎁', '🪑', '🎒', '🛏️', '🪟'] },
    ],
    zh: [
      { riddle: '你拿走的越多，它反而越大，这是什么？', answer: '🕳️', decoys: ['🍎', '⚽', '📚', '🔑', '🎈', '🪑', '🎵', '🧦'] },
      { riddle: '它有牙齿却从不咬人，这是什么？', answer: '🪮', decoys: ['🦈', '🐍', '🍇', '📱', '🕯️', '🧢', '🎯', '🪑'] },
      { riddle: '它一生都在走路，却没有脚，这是什么？', answer: '⏰', decoys: ['🐠', '📦', '🎻', '🧥', '🍉', '🖋️', '🪵', '🎲'] },
      { riddle: '它越多，你看得越少，这是什么？', answer: '🌫️', decoys: ['💡', '🪟', '📷', '🧊', '🎨', '🪞', '🧵', '🔦'] },
      { riddle: '一座没有门也没有窗的房子，这是什么？', answer: '🥚', decoys: ['🏠', '📦', '🧳', '🎁', '🪑', '🎒', '🛏️', '🪟'] },
    ],
    hi: [
      { riddle: 'जितना इसे लिया जाए, यह उतना ही बड़ा होता है — यह क्या है?', answer: '🕳️', decoys: ['🍎', '⚽', '📚', '🔑', '🎈', '🪑', '🎵', '🧦'] },
      { riddle: 'इसके दांत हैं पर यह कभी काटता नहीं — यह क्या है?', answer: '🪮', decoys: ['🦈', '🐍', '🍇', '📱', '🕯️', '🧢', '🎯', '🪑'] },
      { riddle: 'यह जीवन भर चलता है पर इसके पैर नहीं होते — यह क्या है?', answer: '⏰', decoys: ['🐠', '📦', '🎻', '🧥', '🍉', '🖋️', '🪵', '🎲'] },
      { riddle: 'जितना यह बढ़े, उतना कम दिखता है — यह क्या है?', answer: '🌫️', decoys: ['💡', '🪟', '📷', '🧊', '🎨', '🪞', '🧵', '🔦'] },
      { riddle: 'एक घर जिसमें न दरवाज़े हैं न खिड़कियाँ — यह क्या है?', answer: '🥚', decoys: ['🏠', '📦', '🧳', '🎁', '🪑', '🎒', '🛏️', '🪟'] },
    ],
    es: [
      { riddle: 'Cuanto más tomas de ello, más grande se hace — ¿qué es?', answer: '🕳️', decoys: ['🍎', '⚽', '📚', '🔑', '🎈', '🪑', '🎵', '🧦'] },
      { riddle: 'Tiene dientes pero nunca muerde — ¿qué es?', answer: '🪮', decoys: ['🦈', '🐍', '🍇', '📱', '🕯️', '🧢', '🎯', '🪑'] },
      { riddle: 'Camina toda su vida sin tener pies — ¿qué es?', answer: '⏰', decoys: ['🐠', '📦', '🎻', '🧥', '🍉', '🖋️', '🪵', '🎲'] },
      { riddle: 'Cuanto más hay, menos se puede ver — ¿qué es?', answer: '🌫️', decoys: ['💡', '🪟', '📷', '🧊', '🎨', '🪞', '🧵', '🔦'] },
      { riddle: 'Una casa sin puertas ni ventanas — ¿qué es?', answer: '🥚', decoys: ['🏠', '📦', '🧳', '🎁', '🪑', '🎒', '🛏️', '🪟'] },
    ],
    fr: [
      { riddle: "Plus on en prend, plus il devient grand — qu'est-ce que c'est ?", answer: '🕳️', decoys: ['🍎', '⚽', '📚', '🔑', '🎈', '🪑', '🎵', '🧦'] },
      { riddle: "Il a des dents mais ne mord jamais — qu'est-ce que c'est ?", answer: '🪮', decoys: ['🦈', '🐍', '🍇', '📱', '🕯️', '🧢', '🎯', '🪑'] },
      { riddle: "Il marche toute sa vie sans avoir de pieds — qu'est-ce que c'est ?", answer: '⏰', decoys: ['🐠', '📦', '🎻', '🧥', '🍉', '🖋️', '🪵', '🎲'] },
      { riddle: "Plus il y en a, moins on voit — qu'est-ce que c'est ?", answer: '🌫️', decoys: ['💡', '🪟', '📷', '🧊', '🎨', '🪞', '🧵', '🔦'] },
      { riddle: "Une maison sans portes ni fenêtres — qu'est-ce que c'est ?", answer: '🥚', decoys: ['🏠', '📦', '🧳', '🎁', '🪑', '🎒', '🛏️', '🪟'] },
    ],
    fa: [
      { riddle: 'هر چه از آن برداری، بزرگ‌تر می‌شود — آن چیست؟', answer: '🕳️', decoys: ['🍎', '⚽', '📚', '🔑', '🎈', '🪑', '🎵', '🧦'] },
      { riddle: 'دندان دارد اما هرگز گاز نمی‌گیرد — آن چیست؟', answer: '🪮', decoys: ['🦈', '🐍', '🍇', '📱', '🕯️', '🧢', '🎯', '🪑'] },
      { riddle: 'تمام عمرش راه می‌رود بدون آنکه پا داشته باشد — آن چیست؟', answer: '⏰', decoys: ['🐠', '📦', '🎻', '🧥', '🍉', '🖋️', '🪵', '🎲'] },
      { riddle: 'هر چه بیشتر شود، دیدن کمتر می‌شود — آن چیست؟', answer: '🌫️', decoys: ['💡', '🪟', '📷', '🧊', '🎨', '🪞', '🧵', '🔦'] },
      { riddle: 'خانه‌ای بدون در و پنجره — آن چیست؟', answer: '🥚', decoys: ['🏠', '📦', '🧳', '🎁', '🪑', '🎒', '🛏️', '🪟'] },
    ],
  };

  const LANGUAGE = {
    ar: [
      { words: ['اللاعب', 'يقرأ', 'المساحة', 'قبل', 'التمرير'], fillers: ['بسرعة', 'دائمًا'] },
      { words: ['الفريق', 'يبني', 'الهجمة', 'من', 'الخلف', 'بصبر'], fillers: ['أحيانًا', 'اليوم'] },
      { words: ['الحارس', 'يراقب', 'الكرة', 'ولا', 'يتحرك', 'مبكرًا'], fillers: ['غالبًا', 'بثقة'] },
      { words: ['المدرب', 'يغيّر', 'الخطة', 'في', 'الشوط', 'الثاني'], fillers: ['بهدوء', 'فجأة'] },
      { words: ['اللاعبون', 'يضغطون', 'بقوة', 'بعد', 'فقدان', 'الكرة', 'مباشرة'], fillers: ['أحيانًا', 'معًا', 'دائمًا'] },
    ],
    en: [
      { words: ['The', 'player', 'reads', 'the', 'space', 'before', 'passing'], fillers: ['quickly', 'always'] },
      { words: ['The', 'team', 'builds', 'the', 'attack', 'patiently', 'from', 'behind'], fillers: ['sometimes', 'today'] },
      { words: ['The', 'keeper', 'watches', 'the', 'ball', 'and', 'never', 'moves', 'early'], fillers: ['often', 'calmly'] },
      { words: ['The', 'coach', 'changes', 'the', 'plan', 'in', 'the', 'second', 'half'], fillers: ['quietly', 'suddenly'] },
      { words: ['Players', 'press', 'hard', 'right', 'after', 'losing', 'the', 'ball'], fillers: ['sometimes', 'together', 'always'] },
    ],
    zh: [
      { words: ['球员', '在', '传球', '之前', '阅读', '空间'], fillers: ['快速地', '总是'] },
      { words: ['球队', '耐心地', '从', '后场', '组织', '进攻'], fillers: ['有时', '今天'] },
      { words: ['门将', '盯着', '球', '从不', '提前', '移动'], fillers: ['经常', '冷静地'] },
      { words: ['教练', '在', '下半场', '改变', '战术'], fillers: ['悄悄地', '突然'] },
      { words: ['球员们', '丢球', '之后', '立刻', '用力', '逼抢'], fillers: ['有时', '一起', '总是'] },
    ],
    hi: [
      { words: ['खिलाड़ी', 'पास', 'देने', 'से', 'पहले', 'जगह', 'पढ़ता', 'है'], fillers: ['तेज़ी से', 'हमेशा'] },
      { words: ['टीम', 'पीछे', 'से', 'धीरे-धीरे', 'हमला', 'बनाती', 'है'], fillers: ['कभी-कभी', 'आज'] },
      { words: ['गोलकीपर', 'गेंद', 'को', 'देखता', 'है', 'और', 'जल्दी', 'नहीं', 'हिलता'], fillers: ['अक्सर', 'शांति से'] },
      { words: ['कोच', 'दूसरे', 'हाफ', 'में', 'योजना', 'बदलता', 'है'], fillers: ['चुपचाप', 'अचानक'] },
      { words: ['खिलाड़ी', 'गेंद', 'खोने', 'के', 'बाद', 'तुरंत', 'दबाव', 'बनाते', 'हैं'], fillers: ['कभी-कभी', 'साथ में', 'हमेशा'] },
    ],
    es: [
      { words: ['El', 'jugador', 'lee', 'el', 'espacio', 'antes', 'de', 'pasar'], fillers: ['rápidamente', 'siempre'] },
      { words: ['El', 'equipo', 'construye', 'el', 'ataque', 'con', 'paciencia', 'desde', 'atrás'], fillers: ['a', 'veces', 'hoy'] },
      { words: ['El', 'portero', 'observa', 'el', 'balón', 'y', 'nunca', 'se', 'mueve', 'antes'], fillers: ['a', 'menudo', 'con', 'calma'] },
      { words: ['El', 'entrenador', 'cambia', 'el', 'plan', 'en', 'el', 'segundo', 'tiempo'], fillers: ['en', 'silencio', 'de', 'repente'] },
      { words: ['Los', 'jugadores', 'presionan', 'fuerte', 'justo', 'después', 'de', 'perder', 'el', 'balón'], fillers: ['a', 'veces', 'juntos', 'siempre'] },
    ],
    fr: [
      { words: ['Le', 'joueur', 'lit', "l'espace", 'avant', 'de', 'passer'], fillers: ['rapidement', 'toujours'] },
      { words: ['L\'équipe', 'construit', "l'attaque", 'patiemment', 'depuis', "l'arrière"], fillers: ['parfois', "aujourd'hui"] },
      { words: ['Le', 'gardien', 'observe', 'le', 'ballon', 'et', 'ne', 'bouge', 'jamais', 'trop', 'tôt'], fillers: ['souvent', 'calmement'] },
      { words: ['Le', 'coach', 'change', 'le', 'plan', 'en', 'seconde', 'période'], fillers: ['discrètement', 'soudainement'] },
      { words: ['Les', 'joueurs', 'pressent', 'fort', 'juste', 'après', "avoir", 'perdu', 'le', 'ballon'], fillers: ['parfois', 'ensemble', 'toujours'] },
    ],
    fa: [
      { words: ['بازیکن', 'پیش', 'از', 'پاس', 'دادن', 'فضا', 'را', 'می‌خواند'], fillers: ['سریع', 'همیشه'] },
      { words: ['تیم', 'با', 'صبر', 'از', 'عقب', 'حمله', 'را', 'می‌سازد'], fillers: ['گاهی', 'امروز'] },
      { words: ['دروازه‌بان', 'توپ', 'را', 'نگاه', 'می‌کند', 'و', 'زود', 'حرکت', 'نمی‌کند'], fillers: ['اغلب', 'آرام'] },
      { words: ['مربی', 'در', 'نیمه', 'دوم', 'برنامه', 'را', 'تغییر', 'می‌دهد'], fillers: ['بی‌صدا', 'ناگهان'] },
      { words: ['بازیکنان', 'بلافاصله', 'بعد', 'از', 'از', 'دست', 'دادن', 'توپ', 'فشار', 'می‌آورند'], fillers: ['گاهی', 'با هم', 'همیشه'] },
    ],
  };

  function pickSet(bank, lang) {
    return bank[lang] || bank.en;
  }

  window.ZIVOZONE_MINIGAME_CONTENT = {
    lateral(lang, level) {
      const set = pickSet(LATERAL, lang);
      return set[(level - 1) % set.length];
    },
    language(lang, level) {
      const set = pickSet(LANGUAGE, lang);
      return set[(level - 1) % set.length];
    },
  };
})();
