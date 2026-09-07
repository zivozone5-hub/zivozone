(() => {
  "use strict";

  /*
   * ZIVOZONE APP ENGINE
   * Version: 1.0
   *
   * هذا الملف يحول ZIVOZONE من واجهة ثابتة إلى
   * منصة تفاعلية تعمل محلياً.
   *
   * البيانات الحالية تحفظ في localStorage.
   * عند إضافة Backend لاحقاً سيتم استبدال طبقة التخزين
   * المحلية بقاعدة بيانات وحسابات حقيقية.
   */

  const STORAGE_KEY = "zivozone_player_v1";
  const DAILY_KEY = "zivozone_daily_v1";

  const GAME_XP = {
    reaction: 80,
    memory: 90,
    focus: 80,
    logic: 100,
    accuracy: 90,
    brain: 100,
    football: 110,
    personality: 120,
    horror: 100
  };

  const GAME_COIN = {
    reaction: 1,
    memory: 2,
    focus: 1,
    logic: 2,
    accuracy: 2,
    brain: 2,
    football: 3,
    personality: 2,
    horror: 3
  };

  const DEFAULT_PLAYER = {
    id: "",
    name: "",
    email: "",
    country: "",
    age: 18,

    level: 1,
    xp: 0,
    coins: 0,

    games: 0,
    wins: 0,
    accuracy: 0,
    streak: 0,

    attributes: {
      intelligence: 50,
      speed: 50,
      focus: 50,
      accuracy: 50,
      logic: 50,
      football: 50
    },

    personality: {
      risk: 50,
      patience: 50,
      reaction: 50,
      logic: 50,
      competitiveness: 50
    },

    achievements: []
  };

  let player = loadPlayer();
  let currentGame = null;
  let gameState = null;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    try {
      ensurePlayerId();
      savePlayer();

      injectEngineStyles();
      createGameModal();
      createProfileModal();
      createToast();

      bindNavigation();
      bindGameButtons();
      bindProfileButtons();
      bindDailyButton();
      bindBattleButton();

      updateUI();
      updateDailyChallenge();

      if (!player.name) {
        setTimeout(() => openProfileModal(true), 800);
      }
    } catch (error) {
      console.error("ZIVOZONE initialization error:", error);
      showToast("حدث خطأ أثناء تشغيل ZIVOZONE", "error");
    }
  }

  /* =========================================================
     PLAYER SYSTEM
  ========================================================= */

  function loadPlayer() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return structuredClone(DEFAULT_PLAYER);
      }

      const saved = JSON.parse(raw);

      return {
        ...structuredClone(DEFAULT_PLAYER),
        ...saved,
        attributes: {
          ...DEFAULT_PLAYER.attributes,
          ...(saved.attributes || {})
        },
        personality: {
          ...DEFAULT_PLAYER.personality,
          ...(saved.personality || {})
        }
      };
    } catch (error) {
      console.error("Player loading error:", error);
      return structuredClone(DEFAULT_PLAYER);
    }
  }

  function savePlayer() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
    } catch (error) {
      console.error("Player saving error:", error);
      showToast("تعذر حفظ تقدم اللاعب", "error");
    }
  }

  function ensurePlayerId() {
    if (!player.id) {
      player.id =
        "ZV-" +
        Date.now().toString(36).toUpperCase() +
        "-" +
        Math.random().toString(36).substring(2, 7).toUpperCase();
    }
  }

  function calculateLevel() {
    return Math.floor(player.xp / 500) + 1;
  }

  function addProgress(xp, coins, attribute = null, attributeAmount = 0) {
    try {
      const oldLevel = player.level;

      player.xp += Math.max(0, Number(xp) || 0);
      player.coins += Math.max(0, Number(coins) || 0);

      player.level = calculateLevel();

      if (attribute && player.attributes[attribute] !== undefined) {
        player.attributes[attribute] = clamp(
          player.attributes[attribute] + attributeAmount,
          0,
          100
        );
      }

      savePlayer();
      updateUI();

      if (player.level > oldLevel) {
        unlockAchievement("LEVEL_" + player.level);
        showToast(`🎉 وصلت إلى المستوى ${player.level}!`, "success");
      }
    } catch (error) {
      console.error("Progress error:", error);
    }
  }

  function registerGameResult({
    game,
    won,
    xp = GAME_XP[game] || 50,
    coins = GAME_COIN[game] || 1,
    attribute = null,
    attributeAmount = 1
  }) {
    try {
      player.games++;

      if (won) {
        player.wins++;

        addProgress(
          xp,
          coins,
          attribute,
          attributeAmount
        );
      } else {
        addProgress(
          Math.floor(xp * 0.2),
          0,
          attribute,
          Math.max(0, Math.floor(attributeAmount / 3))
        );
      }

      calculateAccuracy();
      updateStreak();

      savePlayer();
      updateUI();
    } catch (error) {
      console.error("Game result error:", error);
    }
  }

  function calculateAccuracy() {
    if (player.games <= 0) {
      player.accuracy = 0;
      return;
    }

    player.accuracy = Math.round(
      (player.wins / player.games) * 100
    );
  }

  function updateStreak() {
    try {
      const today = new Date().toISOString().split("T")[0];
      const data = JSON.parse(
        localStorage.getItem(DAILY_KEY) || "{}"
      );

      if (data.lastPlayed === today) {
        return;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const yesterdayString = yesterday
        .toISOString()
        .split("T")[0];

      if (data.lastPlayed === yesterdayString) {
        player.streak++;
      } else {
        player.streak = 1;
      }

      data.lastPlayed = today;

      localStorage.setItem(
        DAILY_KEY,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error("Streak error:", error);
    }
  }

  /* =========================================================
     PROFILE
  ========================================================= */

  function openProfileModal(firstTime = false) {
    const modal = document.getElementById("zivo-profile-modal");

    if (!modal) return;

    const nameInput = modal.querySelector("#zivo-name");
    const emailInput = modal.querySelector("#zivo-email");
    const countryInput = modal.querySelector("#zivo-country");
    const ageInput = modal.querySelector("#zivo-age");

    if (nameInput) nameInput.value = player.name;
    if (emailInput) emailInput.value = player.email;
    if (countryInput) countryInput.value = player.country;
    if (ageInput) ageInput.value = player.age;

    modal.classList.add("active");

    if (firstTime) {
      showToast("أنشئ هويتك في ZIVOZONE للبدء 🚀", "info");
    }
  }

  function saveProfile() {
    try {
      const name = document
        .getElementById("zivo-name")
        ?.value.trim();

      const email = document
        .getElementById("zivo-email")
        ?.value.trim();

      const country = document
        .getElementById("zivo-country")
        ?.value.trim();

      const age = Number(
        document.getElementById("zivo-age")?.value
      );

      if (!name || name.length < 2) {
        showToast("اكتب اسمًا صحيحًا", "error");
        return;
      }

      if (!validateEmail(email)) {
        showToast("أدخل بريدًا إلكترونيًا صحيحًا", "error");
        return;
      }

      if (!Number.isInteger(age) || age < 6 || age > 100) {
        showToast("العمر يجب أن يكون بين 6 و100 سنة", "error");
        return;
      }

      player.name = sanitizeText(name);
      player.email = sanitizeText(email);
      player.country = sanitizeText(country || "Global");
      player.age = age;

      savePlayer();
      updateUI();

      closeModal("zivo-profile-modal");

      showToast(
        `مرحباً ${player.name} 👋 أهلاً بك في ZIVOZONE`,
        "success"
      );
    } catch (error) {
      console.error("Profile save error:", error);
      showToast("تعذر حفظ الملف الشخصي", "error");
    }
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /* =========================================================
     GAME BUTTONS
  ========================================================= */

  function bindGameButtons() {
    const buttons = document.querySelectorAll("button, a");

    buttons.forEach((button) => {
      const text = normalize(button.textContent);

      if (
        text.includes("reaction") ||
        text.includes("رد") ||
        text.includes("سرعة")
      ) {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          startGame("reaction");
        });
      }

      if (
        text.includes("memory") ||
        text.includes("ذاكرة")
      ) {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          startGame("memory");
        });
      }

      if (
        text.includes("focus") ||
        text.includes("تركيز")
      ) {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          startGame("focus");
        });
      }

      if (
        text.includes("logic") ||
        text.includes("منطق")
      ) {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          startGame("logic");
        });
      }

      if (
        text.includes("target") ||
        text.includes("دقة")
      ) {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          startGame("accuracy");
        });
      }

      if (
        text.includes("number rush") ||
        text.includes("brain") ||
        text.includes("ذكاء")
      ) {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          startGame("brain");
        });
      }

      if (
        text.includes("football iq") ||
        text.includes("كرة القدم")
      ) {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          startGame("football");
        });
      }

      if (
        text.includes("who am i") ||
        text.includes("من أنا")
      ) {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          startGame("personality");
        });
      }

      if (
        text.includes("horror") ||
        text.includes("رعب")
      ) {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          startGame("horror");
        });
      }

      if (
        text.includes("start playing") ||
        text.includes("ابدأ اللعب")
      ) {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          scrollToGames();
        });
      }

      if (
        text.includes("play now") ||
        text.includes("العب الآن")
      ) {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          scrollToGames();
        });
      }
    });
  }

  function scrollToGames() {
    const games = document.querySelector("#games");

    if (games) {
      games.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }

  /* =========================================================
     GAME ENGINE
  ========================================================= */

  function startGame(game) {
    try {
      currentGame = game;

      const modal = document.getElementById("zivo-game-modal");

      if (!modal) return;

      const title = modal.querySelector("#zivo-game-title");
      const content = modal.querySelector("#zivo-game-content");

      title.textContent = getGameName(game);

      content.innerHTML = "";

      modal.classList.add("active");

      switch (game) {
        case "reaction":
          playReactionGame(content);
          break;

        case "memory":
          playMemoryGame(content);
          break;

        case "focus":
          playFocusGame(content);
          break;

        case "logic":
          playLogicGame(content);
          break;

        case "accuracy":
          playAccuracyGame(content);
          break;

        case "brain":
          playBrainGame(content);
          break;

        case "football":
          playFootballGame(content);
          break;

        case "personality":
          playPersonalityGame(content);
          break;

        case "horror":
          playHorrorGame(content);
          break;

        default:
          content.innerHTML =
            "<p>هذه اللعبة غير متوفرة حالياً.</p>";
      }
    } catch (error) {
      console.error("Game start error:", error);
      showToast("تعذر تشغيل اللعبة", "error");
    }
  }

  /* =========================================================
     REACTION GAME
  ========================================================= */

  function playReactionGame(container) {
    const difficulty = getDifficulty();

    container.innerHTML = `
      <div class="zivo-game-intro">
        <h3>⚡ اختبار سرعة رد الفعل</h3>
        <p>انتظر حتى يتغير اللون ثم اضغط بسرعة.</p>
        <div id="reaction-box" class="zivo-reaction-box">
          انتظر...
        </div>
        <div id="reaction-result"></div>
      </div>
    `;

    const box = container.querySelector("#reaction-box");
    const result = container.querySelector("#reaction-result");

    let started = false;
    let finished = false;
    let startTime = 0;

    const delay = Math.max(
      1000,
      2500 - difficulty * 150
    );

    const timer = setTimeout(() => {
      if (finished) return;

      started = true;
      startTime = performance.now();

      box.classList.add("ready");
      box.textContent = "اضغط الآن!";
    }, delay);

    box.addEventListener("click", () => {
      if (finished) return;

      if (!started) {
        clearTimeout(timer);

        finished = true;

        result.innerHTML = `
          <strong>ضغطت مبكراً ❌</strong>
          <p>السرعة مهمة، لكن التوقيت أهم.</p>
        `;

        registerGameResult({
          game: "reaction",
          won: false,
          attribute: "speed",
          attributeAmount: 1
        });

        return;
      }

      finished = true;

      const reaction = Math.round(
        performance.now() - startTime
      );

      const target =
        player.age < 13
          ? 850
          : player.age < 18
          ? 650
          : 550;

      const won = reaction <= target;

      result.innerHTML = `
        <strong>${reaction}ms</strong>
        <p>${won ? "🔥 ممتاز!" : "حاول مرة أخرى!"}</p>
        <p>${won ? "+80 XP | +1 ZVC" : "+16 XP"}</p>
      `;

      registerGameResult({
        game: "reaction",
        won,
        attribute: "speed",
        attributeAmount: won ? 2 : 1
      });
    });
  }

  /* =========================================================
     MEMORY GAME
  ========================================================= */

  function playMemoryGame(container) {
    const difficulty = getDifficulty();

    const size =
      difficulty <= 2
        ? 3
        : difficulty <= 5
        ? 4
        : 5;

    const total = size * size;

    container.innerHTML = `
      <h3>🧠 تحدي الذاكرة</h3>
      <p>احفظ المربعات المضيئة ثم اضغط عليها.</p>

      <div
        id="memory-grid"
        class="zivo-memory-grid"
        style="grid-template-columns: repeat(${size}, 1fr);"
      ></div>

      <div id="memory-result"></div>
    `;

    const grid = container.querySelector("#memory-grid");
    const result = container.querySelector("#memory-result");

    const cells = [];

    for (let i = 0; i < total; i++) {
      const cell = document.createElement("button");

      cell.type = "button";
      cell.className = "zivo-memory-cell";
      cell.dataset.index = String(i);
      cell.textContent = "";

      grid.appendChild(cell);
      cells.push(cell);
    }

    const amount = Math.min(
      Math.max(2, Math.floor(difficulty / 2) + 2),
      Math.floor(total / 2)
    );

    const pattern = [];

    while (pattern.length < amount) {
      const index = Math.floor(Math.random() * total);

      if (!pattern.includes(index)) {
        pattern.push(index);
      }
    }

    pattern.forEach((index) => {
      cells[index].classList.add("show-pattern");
    });

    setTimeout(() => {
      cells.forEach((cell) => {
        cell.classList.remove("show-pattern");
      });
    }, 1600 + difficulty * 120);

    const selected = new Set();

    cells.forEach((cell) => {
      cell.addEventListener("click", () => {
        const index = Number(cell.dataset.index);

        if (selected.has(index)) return;

        selected.add(index);

        if (pattern.includes(index)) {
          cell.classList.add("correct");
        } else {
          cell.classList.add("wrong");
        }

        if (selected.size === pattern.length) {
          const success = pattern.every((i) =>
            selected.has(i)
          );

          result.innerHTML = `
            <h3>${success ? "🎉 ذاكرة ممتازة!" : "انتهى التحدي"}</h3>
            <p>${success ? "+90 XP | +2 ZVC" : "+18 XP"}</p>
          `;

          registerGameResult({
            game: "memory",
            won: success,
            attribute: "intelligence",
            attributeAmount: success ? 2 : 1
          });
        }
      });
    });
  }

  /* =========================================================
     FOCUS GAME
  ========================================================= */

  function playFocusGame(container) {
    const symbols = ["◆", "●", "■", "▲"];

    const different = symbols[
      Math.floor(Math.random() * symbols.length)
    ];

    const base = symbols.filter(
      (s) => s !== different
    )[Math.floor(Math.random() * 3)];

    const count =
      getDifficulty() <= 3 ? 12 : 20;

    container.innerHTML = `
      <h3>👁 اختبار التركيز</h3>
      <p>اضغط الرمز المختلف.</p>
      <div id="focus-grid" class="zivo-focus-grid"></div>
      <div id="focus-result"></div>
    `;

    const grid = container.querySelector("#focus-grid");
    const result = container.querySelector("#focus-result");

    const differentIndex =
      Math.floor(Math.random() * count);

    for (let i = 0; i < count; i++) {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "zivo-focus-item";
      button.textContent =
        i === differentIndex
          ? different
          : base;

      button.addEventListener("click", () => {
        const correct = i === differentIndex;

        result.innerHTML = `
          <h3>${correct ? "🎯 ممتاز!" : "❌ ليست هي"}</h3>
          <p>${correct ? "+80 XP | +1 ZVC" : "+16 XP"}</p>
        `;

        registerGameResult({
          game: "focus",
          won: correct,
          attribute: "focus",
          attributeAmount: correct ? 2 : 1
        });
      });

      grid.appendChild(button);
    }
  }

  /* =========================================================
     LOGIC GAME
  ========================================================= */

  function playLogicGame(container) {
    const difficulty = getDifficulty();

    const questions = [
      {
        q: "ما الرقم التالي؟ 2 - 4 - 8 - 16 - ؟",
        a: ["18", "24", "32", "36"],
        c: 2
      },
      {
        q: "إذا كان كل ZIVO لاعبًا ذكيًا، وأحمد ZIVO، ماذا نستنتج؟",
        a: [
          "أحمد لاعب ذكي",
          "أحمد لاعب كرة قدم",
          "لا يمكن معرفة شيء",
          "أحمد سريع"
        ],
        c: 0
      },
      {
        q: "ما الرقم التالي؟ 3 - 6 - 12 - 24 - ؟",
        a: ["30", "36", "48", "60"],
        c: 2
      },
      {
        q: "أي كلمة لا تنتمي للمجموعة؟",
        a: [
          "تفاحة",
          "برتقال",
          "موز",
          "سيارة"
        ],
        c: 3
      }
    ];

    const question =
      questions[
        Math.floor(
          Math.random() * questions.length
        )
      ];

    container.innerHTML = `
      <h3>🧩 Logic Rush</h3>
      <p>${question.q}</p>

      <div id="logic-options" class="zivo-options"></div>

      <div id="logic-result"></div>
    `;

    const options =
      container.querySelector("#logic-options");

    question.a.forEach((answer, index) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "zivo-option";
      button.textContent = answer;

      button.addEventListener("click", () => {
        const correct = index === question.c;

        container.querySelector(
          "#logic-result"
        ).innerHTML = `
          <h3>${correct ? "🧠 إجابة صحيحة!" : "❌ إجابة خاطئة"}</h3>
          <p>${correct ? "+100 XP | +2 ZVC" : "+20 XP"}</p>
        `;

        registerGameResult({
          game: "logic",
          won: correct,
          attribute: "logic",
          attributeAmount: correct ? 3 : 1
        });
      });

      options.appendChild(button);
    });
  }

  /* =========================================================
     BRAIN GAME
  ========================================================= */

  function playBrainGame(container) {
    const difficulty = getDifficulty();

    const max =
      player.age < 13
        ? 10 + difficulty * 3
        : 20 + difficulty * 5;

    const a = randomInt(2, max);
    const b = randomInt(2, max);

    const operations = ["+", "-"];
    const operation =
      operations[randomInt(0, operations.length - 1)];

    const correct =
      operation === "+"
        ? a + b
        : a - b;

    const answers = new Set([correct]);

    while (answers.size < 4) {
      answers.add(
        correct + randomInt(-10, 10)
      );
    }

    const shuffled = [...answers].sort(
      () => Math.random() - 0.5
    );

    container.innerHTML = `
      <h3>🔢 Number Rush</h3>

      <div class="zivo-question">
        ${a} ${operation} ${b} = ؟
      </div>

      <div id="brain-options" class="zivo-options"></div>

      <div id="brain-result"></div>
    `;

    const options =
      container.querySelector("#brain-options");

    shuffled.forEach((answer) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "zivo-option";
      button.textContent = answer;

      button.addEventListener("click", () => {
        const won = answer === correct;

        container.querySelector(
          "#brain-result"
        ).innerHTML = `
          <h3>${won ? "🔥 رائع!" : "❌ حاول مرة أخرى"}</h3>
          <p>${won ? "+100 XP | +2 ZVC" : "+20 XP"}</p>
        `;

        registerGameResult({
          game: "brain",
          won,
          attribute: "intelligence",
          attributeAmount: won ? 3 : 1
        });
      });

      options.appendChild(button);
    });
  }

  /* =========================================================
     ACCURACY GAME
  ========================================================= */

  function playAccuracyGame(container) {
    container.innerHTML = `
      <h3>🎯 Target</h3>
      <p>اضغط الهدف قبل أن يتحرك.</p>

      <div id="accuracy-area" class="zivo-accuracy-area">
        <button id="accuracy-target" type="button">🎯</button>
      </div>

      <div id="accuracy-result"></div>
    `;

    const area =
      container.querySelector("#accuracy-area");

    const target =
      container.querySelector("#accuracy-target");

    const result =
      container.querySelector("#accuracy-result");

    function moveTarget() {
      const rect = area.getBoundingClientRect();

      target.style.left =
        `${randomInt(5, Math.max(5, rect.width - 60))}px`;

      target.style.top =
        `${randomInt(5, Math.max(5, rect.height - 60))}px`;
    }

    moveTarget();

    const timeout = setTimeout(() => {
      result.innerHTML = `
        <h3>انتهى الوقت ⏱️</h3>
      `;

      registerGameResult({
        game: "accuracy",
        won: false,
        attribute: "accuracy",
        attributeAmount: 1
      });
    }, 5000);

    target.addEventListener("click", () => {
      clearTimeout(timeout);

      result.innerHTML = `
        <h3>🎯 إصابة ناجحة!</h3>
        <p>+90 XP | +2 ZVC</p>
      `;

      registerGameResult({
        game: "accuracy",
        won: true,
        attribute: "accuracy",
        attributeAmount: 3
      });
    });
  }

  /* =========================================================
     FOOTBALL IQ
  ========================================================= */

  function playFootballGame(container) {
    const questions = [
      {
        q: "فريقك يخسر 1-0 والدقيقة 85. ما القرار الأكثر هجومية؟",
        a: [
          "زيادة عدد اللاعبين في الثلث الأخير",
          "التراجع للدفاع",
          "إضاعة الوقت",
          "إيقاف الهجوم"
        ],
        c: 0
      },
      {
        q: "مهاجمك أصبح في موقف 1 ضد 1 مع الحارس. ماذا يحتاج؟",
        a: [
          "قرار سريع وهادئ",
          "العودة للخلف",
          "انتظار المدافعين",
          "إضاعة الكرة"
        ],
        c: 0
      },
      {
        q: "عند فقدان الكرة مباشرة، ما المبدأ المهم؟",
        a: [
          "الضغط أو استعادة التنظيم سريعًا",
          "التوقف",
          "الخروج من الملعب",
          "ترك الخصم"
        ],
        c: 0
      }
    ];

    const question =
      questions[
        randomInt(0, questions.length - 1)
      ];

    container.innerHTML = `
      <h3>⚽ Football IQ</h3>
      <p>${question.q}</p>

      <div id="football-options" class="zivo-options"></div>

      <div id="football-result"></div>
    `;

    const options =
      container.querySelector("#football-options");

    question.a.forEach((answer, index) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "zivo-option";
      button.textContent = answer;

      button.addEventListener("click", () => {
        const won = index === question.c;

        container.querySelector(
          "#football-result"
        ).innerHTML = `
          <h3>${won ? "⚽ قرار ممتاز!" : "❌ قرار غير مثالي"}</h3>
          <p>${won ? "+110 XP | +3 ZVC" : "+22 XP"}</p>
        `;

        registerGameResult({
          game: "football",
          won,
          attribute: "football",
          attributeAmount: won ? 3 : 1
        });
      });

      options.appendChild(button);
    });
  }

  /* =========================================================
     PERSONALITY / WHO AM I
  ========================================================= */

  function playPersonalityGame(container) {
    const questions = [
      {
        q: "عندما تواجه تحدياً صعباً، ماذا تفعل غالباً؟",
        a: [
          ["أبحث عن حل فوراً", "logic", 5],
          ["أجرب أكثر من طريقة", "risk", 5],
          ["أنتظر وأحلل", "patience", 5],
          ["أطلب مساعدة", "reaction", 3]
        ]
      },
      {
        q: "في المنافسة، ما الذي يهمك أكثر؟",
        a: [
          ["الفوز", "competitiveness", 5],
          ["التعلم", "patience", 5],
          ["السرعة", "reaction", 5],
          ["التخطيط", "logic", 5]
        ]
      },
      {
        q: "لو حصل شيء غير متوقع؟",
        a: [
          ["أتصرف بسرعة", "reaction", 5],
          ["أحلل أولاً", "logic", 5],
          ["أجازف", "risk", 5],
          ["أنتظر", "patience", 5]
        ]
      }
    ];

    const question =
      questions[
        randomInt(0, questions.length - 1)
      ];

    container.innerHTML = `
      <h3>🎭 من أنا؟</h3>
      <p>${question.q}</p>

      <div id="personality-options" class="zivo-options"></div>

      <div id="personality-result"></div>
    `;

    const options =
      container.querySelector(
        "#personality-options"
      );

    question.a.forEach((item) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "zivo-option";
      button.textContent = item[0];

      button.addEventListener("click", () => {
        const type = item[1];
        const value = item[2];

        if (
          player.personality[type] !== undefined
        ) {
          player.personality[type] = clamp(
            player.personality[type] + value,
            0,
            100
          );
        }

        savePlayer();

        container.querySelector(
          "#personality-result"
        ).innerHTML = `
          <h3>🧬 تم تسجيل إجابتك</h3>
          <p>سنستخدم إجاباتك تدريجياً لبناء ZIVO IDENTITY الخاصة بك.</p>
          <p>+120 XP | +2 ZVC</p>
        `;

        registerGameResult({
          game: "personality",
          won: true,
          attribute: "logic",
          attributeAmount: 2
        });

        updatePersonalityAnalysis();
      });

      options.appendChild(button);
    });
  }

  /* =========================================================
     HORROR GAME
  ========================================================= */

  function playHorrorGame(container) {
    const scenarios = [
      {
        text: "أنت وحدك في غرفة مظلمة. تسمع صوتاً خلفك...",
        answers: [
          "أهرب فوراً",
          "ألتفت وأتحقق",
          "أبقى مكانك وأراقب"
        ]
      },
      {
        text: "هاتفك يضيء فجأة برسالة من رقم مجهول: لا تفتح الباب.",
        answers: [
          "أفتح الباب",
          "أتجاهل الرسالة",
          "أتحقق أولاً من مصدر الرسالة"
        ]
      }
    ];

    const scenario =
      scenarios[
        randomInt(0, scenarios.length - 1)
      ];

    container.innerHTML = `
      <div class="zivo-horror">
        <h3>👁️ ZIVO HORROR</h3>

        <p class="zivo-horror-text">
          ${scenario.text}
        </p>

        <div id="horror-options" class="zivo-options"></div>

        <div id="horror-result"></div>
      </div>
    `;

    const options =
      container.querySelector("#horror-options");

    scenario.answers.forEach((answer, index) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "zivo-option";
      button.textContent = answer;

      button.addEventListener("click", () => {
        const brave =
          index === 1 || index === 2;

        container.querySelector(
          "#horror-result"
        ).innerHTML = `
          <h3>${brave ? "👁️ قرار جريء" : "😨 قرار حذر"}</h3>
          <p>+${brave ? 100 : 20} XP</p>
          ${
            brave
              ? "<p>+3 ZVC</p>"
              : ""
          }
        `;

        registerGameResult({
          game: "horror",
          won: brave,
          attribute: "reaction",
          attributeAmount: brave ? 3 : 1
        });
      });

      options.appendChild(button);
    });
  }

  /* =========================================================
     DAILY CHALLENGE
  ========================================================= */

  function bindDailyButton() {
    const buttons = document.querySelectorAll("button, a");

    buttons.forEach((button) => {
      const text = normalize(button.textContent);

      if (
        text.includes("start daily") ||
        text.includes("التحدي اليومي")
      ) {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          startDailyChallenge();
        });
      }
    });
  }

  function startDailyChallenge() {
    const daily = getDailyData();

    if (daily.completed) {
      showToast(
        "أكملت تحدي اليوم بالفعل 🔥 عد غداً لتحدٍ جديد",
        "info"
      );
      return;
    }

    const game =
      daily.games[daily.progress] || "brain";

    showToast(
      `التحدي ${daily.progress + 1} من 4`,
      "info"
    );

    startGame(game);
  }

  function getDailyData() {
    try {
      const today = new Date()
        .toISOString()
        .split("T")[0];

      const saved = JSON.parse(
        localStorage.getItem(DAILY_KEY) || "{}"
      );

      if (saved.date !== today) {
        const data = {
          date: today,
          progress: 0,
          completed: false,
          games: [
            "brain",
            "reaction",
            "focus",
            "football"
          ]
        };

        localStorage.setItem(
          DAILY_KEY,
          JSON.stringify(data)
        );

        return data;
      }

      return saved;
    } catch (error) {
      console.error("Daily data error:", error);

      return {
        date: new Date()
          .toISOString()
          .split("T")[0],
        progress: 0,
        completed: false,
        games: [
          "brain",
          "reaction",
          "focus",
          "football"
        ]
      };
    }
  }

  function updateDailyChallenge() {
    try {
      const daily = getDailyData();

      const counter = document.querySelector(
        "#daily-progress"
      );

      if (counter) {
        counter.textContent =
          `${daily.progress} / 4`;
      }
    } catch (error) {
      console.error(error);
    }
  }

  /* =========================================================
     UI UPDATE
  ========================================================= */

  function updateUI() {
    try {
      const textMap = {
        ".player-level":
          player.level,

        ".player-xp":
          player.xp,

        ".player-coins":
          player.coins,

        ".player-streak":
          player.streak,

        ".player-games":
          player.games,

        ".player-wins":
          player.wins,

        ".player-accuracy":
          `${player.accuracy}%`
      };

      Object.entries(textMap).forEach(
        ([selector, value]) => {
          document
            .querySelectorAll(selector)
            .forEach((element) => {
              element.textContent = value;
            });
        }
      );

      const nameElements =
        document.querySelectorAll(
          ".player-name"
        );

      nameElements.forEach((element) => {
        element.textContent =
          player.name || "ZIVO PLAYER";
      });

      const idElements =
        document.querySelectorAll(
          ".player-id"
        );

      idElements.forEach((element) => {
        element.textContent =
          player.id;
      });

      updateAttribute(
        ".intel-value",
        player.attributes.intelligence
      );

      updateAttribute(
        ".speed-value",
        player.attributes.speed
      );

      updateAttribute(
        ".focus-value",
        player.attributes.focus
      );

      updateAttribute(
        ".accuracy-value",
        player.attributes.accuracy
      );

      updateAttribute(
        ".logic-value",
        player.attributes.logic
      );

      updateAttribute(
        ".football-value",
        player.attributes.football
      );

      updatePersonalityAnalysis();
      updateDailyChallenge();
    } catch (error) {
      console.error("UI update error:", error);
    }
  }

  function updateAttribute(selector, value) {
    document
      .querySelectorAll(selector)
      .forEach((element) => {
        element.textContent =
          Math.round(value);
      });
  }

  /* =========================================================
     PERSONALITY ANALYSIS
  ========================================================= */

  function updatePersonalityAnalysis() {
    const analysis =
      document.querySelector(
        "#zivo-personality-analysis"
      );

    if (!analysis) return;

    const p = player.personality;

    const strongest = Object.entries(p)
      .sort((a, b) => b[1] - a[1])[0];

    const descriptions = {
      risk:
        "شخصية تميل إلى التجربة والمجازفة المحسوبة.",

      patience:
        "شخصية هادئة تميل إلى التفكير قبل اتخاذ القرار.",

      reaction:
        "شخصية سريعة الاستجابة وتتميز بردود الفعل.",

      logic:
        "شخصية تحليلية تميل إلى التفكير المنطقي.",

      competitiveness:
        "شخصية تنافسية تحب التحدي وتحقيق النتائج."
    };

    analysis.innerHTML = `
      <strong>🧬 ZIVO IDENTITY</strong>
      <p>
        ${descriptions[strongest[0]] || "يتم تحليل شخصيتك..."}
      </p>
      <small>
        التحليل يتطور مع مشاركتك في الألعاب والتحديات.
      </small>
    `;
  }

  /* =========================================================
     ACHIEVEMENTS
  ========================================================= */

  function unlockAchievement(id) {
    if (player.achievements.includes(id)) {
      return;
    }

    player.achievements.push(id);
    savePlayer();

    showToast(
      `🏆 إنجاز جديد: ${id}`,
      "success"
    );
  }

  /* =========================================================
     BATTLE
  ========================================================= */

  function bindBattleButton() {
    const buttons = document.querySelectorAll(
      "button, a"
    );

    buttons.forEach((button) => {
      const text = normalize(
        button.textContent
      );

      if (
        text.includes("find battle") ||
        text.includes("battle") ||
        text.includes("معركة")
      ) {
        button.addEventListener(
          "click",
          (event) => {
            event.preventDefault();

            showToast(
              "⚔️ نظام Battle المحلي جاهز. نظام اللاعبين الحقيقي سيتم ربطه بالـ Backend لاحقاً.",
              "info"
            );
          }
        );
      }
    });
  }

  /* =========================================================
     NAVIGATION
  ========================================================= */

  function bindNavigation() {
    document
      .querySelectorAll(
        'a[href="#profile"], [data-profile]'
      )
      .forEach((element) => {
        element.addEventListener(
          "click",
          (event) => {
            event.preventDefault();
            openProfileModal();
          }
        );
      });

    document
      .querySelectorAll(
        "#profile-btn, .profile-button"
      )
      .forEach((element) => {
        element.addEventListener(
          "click",
          openProfileModal
        );
      });
  }

  /* =========================================================
     MODALS
  ========================================================= */

  function createGameModal() {
    if (
      document.getElementById(
        "zivo-game-modal"
      )
    ) {
      return;
    }

    const modal =
      document.createElement("div");

    modal.id = "zivo-game-modal";
    modal.className = "zivo-modal";

    modal.innerHTML = `
      <div class="zivo-modal-card">
        <button
          type="button"
          class="zivo-close"
          data-close="zivo-game-modal"
          aria-label="Close"
        >
          ×
        </button>

        <div class="zivo-modal-header">
          <span>⚡ ZIVOZONE</span>
          <h2 id="zivo-game-title">
            اللعبة
          </h2>
        </div>

        <div id="zivo-game-content"></div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener(
      "click",
      (event) => {
        if (
          event.target === modal ||
          event.target.matches(
            "[data-close]"
          )
        ) {
          closeModal(
            "zivo-game-modal"
          );
        }
      }
    );
  }

  function createProfileModal() {
    if (
      document.getElementById(
        "zivo-profile-modal"
      )
    ) {
      return;
    }

    const modal =
      document.createElement("div");

    modal.id =
      "zivo-profile-modal";

    modal.className =
      "zivo-modal";

    modal.innerHTML = `
      <div class="zivo-modal-card">

        <button
          type="button"
          class="zivo-close"
          data-close="zivo-profile-modal"
        >
          ×
        </button>

        <h2>🧬 ZIVO PLAYER</h2>

        <p>
          أنشئ هويتك داخل ZIVOZONE.
        </p>

        <label>
          الاسم
          <input
            id="zivo-name"
            type="text"
            maxlength="40"
            autocomplete="name"
            placeholder="اسم اللاعب"
          >
        </label>

        <label>
          البريد الإلكتروني
          <input
            id="zivo-email"
            type="email"
            maxlength="120"
            autocomplete="email"
            placeholder="example@email.com"
          >
        </label>

        <label>
          العمر
          <input
            id="zivo-age"
            type="number"
            min="6"
            max="100"
            value="18"
          >
        </label>

        <label>
          الدولة
          <input
            id="zivo-country"
            type="text"
            maxlength="50"
            placeholder="Jordan"
          >
        </label>

        <button
          id="zivo-save-profile"
          class="zivo-primary-button"
          type="button"
        >
          حفظ الهوية 🚀
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener(
      "click",
      (event) => {
        if (
          event.target === modal ||
          event.target.matches(
            "[data-close]"
          )
        ) {
          closeModal(
            "zivo-profile-modal"
          );
        }
      }
    );

    modal
      .querySelector(
        "#zivo-save-profile"
      )
      .addEventListener(
        "click",
        saveProfile
      );
  }

  function closeModal(id) {
    const modal =
      document.getElementById(id);

    if (modal) {
      modal.classList.remove("active");
    }
  }

  /* =========================================================
     TOAST
  ========================================================= */

  function createToast() {
    if (
      document.getElementById(
        "zivo-toast"
      )
    ) {
      return;
    }

    const toast =
      document.createElement("div");

    toast.id = "zivo-toast";
    toast.className = "zivo-toast";

    document.body.appendChild(toast);
  }

  function showToast(message, type = "info") {
    const toast =
      document.getElementById(
        "zivo-toast"
      );

    if (!toast) return;

    toast.textContent = message;
    toast.dataset.type = type;
    toast.classList.add("show");

    clearTimeout(
      showToast.timer
    );

    showToast.timer =
      setTimeout(() => {
        toast.classList.remove(
          "show"
        );
      }, 3000);
  }

  /* =========================================================
     GAME HELPERS
  ========================================================= */

  function getDifficulty() {
    /*
     * الصعوبة تعتمد على:
     * 1. العمر
     * 2. مستوى اللاعب
     * 3. عدد الألعاب
     *
     * الهدف أن الطفل لا يحصل على أسئلة
     * بنفس صعوبة اللاعب المتقدم.
     */

    const ageFactor =
      player.age < 10
        ? 1
        : player.age < 13
        ? 2
        : player.age < 16
        ? 3
        : player.age < 21
        ? 4
        : 5;

    const levelFactor =
      Math.min(5, Math.ceil(player.level / 3));

    const experienceFactor =
      Math.min(3, Math.floor(player.games / 20));

    return clamp(
      ageFactor +
        levelFactor +
        experienceFactor,
      1,
      10
    );
  }

  function getGameName(game) {
    const names = {
      reaction: "⚡ Reaction",
      memory: "🧠 Memory",
      focus: "👁 Focus",
      logic: "🧩 Logic Rush",
      accuracy: "🎯 Accuracy",
      brain: "🔢 Number Rush",
      football: "⚽ Football IQ",
      personality: "🎭 Who Am I?",
      horror: "👁️ ZIVO Horror"
    };

    return names[game] || "ZIVO GAME";
  }

  function randomInt(min, max) {
    return Math.floor(
      Math.random() *
        (max - min + 1)
    ) + min;
  }

  function clamp(value, min, max) {
    return Math.min(
      max,
      Math.max(min, value)
    );
  }

  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function sanitizeText(value) {
    return String(value || "")
      .replace(/[<>]/g, "")
      .trim();
  }

  /* =========================================================
     ENGINE STYLES
  ========================================================= */

  function injectEngineStyles() {
    if (
      document.getElementById(
        "zivo-engine-styles"
      )
    ) {
      return;
    }

    const style =
      document.createElement("style");

    style.id =
      "zivo-engine-styles";

    style.textContent = `
      .zivo-modal {
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: rgba(3,5,15,.82);
        backdrop-filter: blur(12px);
      }

      .zivo-modal.active {
        display: flex;
      }

      .zivo-modal-card {
        width: min(700px, 96vw);
        max-height: 90vh;
        overflow-y: auto;
        padding: 28px;
        border-radius: 24px;
        background:
          linear-gradient(
            145deg,
            rgba(25,28,55,.98),
            rgba(10,12,28,.98)
          );
        border: 1px solid rgba(255,255,255,.1);
        box-shadow:
          0 30px 100px rgba(0,0,0,.55);
        color: white;
        position: relative;
      }

      .zivo-close {
        position: absolute;
        top: 14px;
        right: 14px;
        width: 40px;
        height: 40px;
        border: 0;
        border-radius: 50%;
        background: rgba(255,255,255,.08);
        color: white;
        font-size: 25px;
        cursor: pointer;
      }

      .zivo-modal-header {
        margin-bottom: 20px;
      }

      .zivo-modal-header span {
        color: #00e5ff;
        font-size: 12px;
        letter-spacing: 2px;
      }

      .zivo-game-intro,
      .zivo-modal-card {
        text-align: center;
      }

      .zivo-options {
        display: grid;
        gap: 12px;
        margin-top: 20px;
      }

      .zivo-option,
      .zivo-primary-button {
        border: 0;
        border-radius: 14px;
        padding: 14px 18px;
        color: white;
        background:
          linear-gradient(
            135deg,
            #7c3cff,
            #00b8ff
          );
        cursor: pointer;
        font-size: 15px;
        transition: .2s ease;
      }

      .zivo-option:hover,
      .zivo-primary-button:hover {
        transform: translateY(-2px);
        filter: brightness(1.1);
      }

      .zivo-reaction-box {
        height: 220px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 20px;
        background: #181b32;
        margin: 20px 0;
        font-size: 25px;
        font-weight: 800;
        cursor: pointer;
      }

      .zivo-reaction-box.ready {
        background: #00d88a;
        color: #04130d;
      }

      .zivo-memory-grid {
        display: grid;
        gap: 8px;
        max-width: 420px;
        margin: 20px auto;
      }

      .zivo-memory-cell {
        aspect-ratio: 1;
        border: 0;
        border-radius: 10px;
        background: #1d2140;
        cursor: pointer;
      }

      .zivo-memory-cell.show-pattern {
        background: #8b5cff;
        box-shadow: 0 0 20px #8b5cff;
      }

      .zivo-memory-cell.correct {
        background: #00d88a;
      }

      .zivo-memory-cell.wrong {
        background: #ff375f;
      }

      .zivo-focus-grid {
        display: grid;
        grid-template-columns:
          repeat(5, 1fr);
        gap: 8px;
        margin: 20px auto;
        max-width: 420px;
      }

      .zivo-focus-item {
        aspect-ratio: 1;
        border: 0;
        border-radius: 12px;
        background: #1d2140;
        color: white;
        font-size: 24px;
        cursor: pointer;
      }

      .zivo-question {
        font-size: 34px;
        font-weight: 900;
        margin: 30px 0;
      }

      .zivo-accuracy-area {
        height: 300px;
        position: relative;
        margin-top: 20px;
        border-radius: 20px;
        background:
          radial-gradient(
            circle,
            rgba(0,229,255,.12),
            rgba(20,20,50,.5)
          );
        overflow: hidden;
      }

      #accuracy-target {
        position: absolute;
        width: 55px;
        height: 55px;
        border: 0;
        border-radius: 50%;
        background: #7c3cff;
        color: white;
        cursor: pointer;
        font-size: 24px;
      }

      .zivo-horror {
        background:
          radial-gradient(
            circle at center,
            #251132,
            #030305 70%
          );
        padding: 25px;
        border-radius: 20px;
      }

      .zivo-horror-text {
        font-size: 20px;
        line-height: 1.9;
        margin: 30px 0;
      }

      .zivo-modal-card label {
        display: block;
        text-align: right;
        margin: 15px 0;
      }

      .zivo-modal-card input {
        width: 100%;
        box-sizing: border-box;
        margin-top: 7px;
        padding: 13px;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,.12);
        background: rgba(255,255,255,.06);
        color: white;
        outline: none;
      }

      .zivo-toast {
        position: fixed;
        bottom: 25px;
        left: 50%;
        transform:
          translate(-50%, 30px);
        opacity: 0;
        pointer-events: none;
        z-index: 100000;
        padding: 14px 22px;
        border-radius: 14px;
        background: #15182d;
        color: white;
        box-shadow:
          0 10px 40px rgba(0,0,0,.4);
        transition: .3s ease;
      }

      .zivo-toast.show {
        transform:
          translate(-50%, 0);
        opacity: 1;
      }

      .zivo-toast[data-type="success"] {
        border: 1px solid #00d88a;
      }

      .zivo-toast[data-type="error"] {
        border: 1px solid #ff375f;
      }

      .zivo-toast[data-type="info"] {
        border: 1px solid #00b8ff;
      }

      @media(max-width:600px) {
        .zivo-modal-card {
          padding: 20px;
        }

        .zivo-focus-grid {
          grid-template-columns:
            repeat(4, 1fr);
        }

        .zivo-question {
          font-size: 27px;
        }
      }
    `;

    document.head.appendChild(style);
  }
})();
