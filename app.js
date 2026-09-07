"use strict";

/*
 * ============================================================
 * ZIVOZONE — APP.JS
 * Version: 2.0
 *
 * Front-end game engine for the ZIVOZONE platform.
 *
 * Current architecture:
 * - Vanilla JavaScript
 * - No external libraries
 * - Local profile persistence
 * - XP / Level / Rank system
 * - 8 playable mini-games
 * - Daily challenge
 * - Simulated battle
 * - Local leaderboard
 *
 * IMPORTANT:
 * localStorage is intentionally used only for the current
 * static GitHub Pages version.
 *
 * Real authentication, anti-cheat protection, global ranking,
 * online battles and token economy must be handled server-side
 * when a backend is introduced.
 * ============================================================
 */


/* ============================================================
   1. APPLICATION CONSTANTS
   ============================================================ */

const APP_CONFIG = Object.freeze({
  storageKey: "zivozone_player_v2",
  leaderboardKey: "zivozone_leaderboard_v2",

  maxNameLength: 24,
  minNameLength: 2,

  baseLevelXp: 500,
  xpPerLevel: 500,

  maxAttribute: 100,
  minAttribute: 1,

  dailyTotal: 4,

  reactionRounds: 3,
  memoryRounds: 3,
  focusRounds: 5,
  logicRounds: 5,
  accuracyRounds: 5,
  numberRounds: 5,
  footballRounds: 5,
  whoAmIRounds: 6
});


/* ============================================================
   2. DEFAULT PLAYER
   ============================================================ */

const DEFAULT_PLAYER = {
  id: "",
  name: "ZIVO PLAYER",
  country: "JO",

  xp: 0,
  level: 1,

  games: 0,
  wins: 0,

  correct: 0,
  attempts: 0,

  streak: 0,
  lastDailyDate: null,

  dailyDate: null,
  dailyCompleted: 0,

  attributes: {
    intelligence: 50,
    speed: 50,
    focus: 50,
    accuracy: 50,
    logic: 50,
    football: 50
  },

  achievements: [],

  createdAt: null,
  updatedAt: null
};


/* ============================================================
   3. RANKS
   ============================================================ */

const RANKS = Object.freeze([
  {
    minLevel: 1,
    name: "ROOKIE"
  },
  {
    minLevel: 5,
    name: "RISING"
  },
  {
    minLevel: 10,
    name: "PRO"
  },
  {
    minLevel: 20,
    name: "ELITE"
  },
  {
    minLevel: 35,
    name: "MASTER"
  },
  {
    minLevel: 50,
    name: "LEGEND"
  }
]);


/* ============================================================
   4. ACHIEVEMENTS
   ============================================================ */

const ACHIEVEMENTS = Object.freeze([
  {
    id: "first_game",
    icon: "🎮",
    title: "First Step",
    description: "Play your first game.",
    check: player => player.games >= 1
  },

  {
    id: "five_games",
    icon: "🔥",
    title: "Getting Started",
    description: "Play 5 games.",
    check: player => player.games >= 5
  },

  {
    id: "ten_games",
    icon: "🏆",
    title: "Dedicated",
    description: "Play 10 games.",
    check: player => player.games >= 10
  },

  {
    id: "first_win",
    icon: "🥇",
    title: "First Win",
    description: "Win your first challenge.",
    check: player => player.wins >= 1
  },

  {
    id: "xp_1000",
    icon: "💎",
    title: "XP Hunter",
    description: "Reach 1,000 XP.",
    check: player => player.xp >= 1000
  },

  {
    id: "xp_5000",
    icon: "🚀",
    title: "XP Machine",
    description: "Reach 5,000 XP.",
    check: player => player.xp >= 5000
  },

  {
    id: "level_5",
    icon: "⭐",
    title: "Rising Star",
    description: "Reach Level 5.",
    check: player => player.level >= 5
  },

  {
    id: "level_10",
    icon: "👑",
    title: "ZIVO Pro",
    description: "Reach Level 10.",
    check: player => player.level >= 10
  },

  {
    id: "streak_3",
    icon: "🔥",
    title: "Hot Streak",
    description: "Reach a 3-day streak.",
    check: player => player.streak >= 3
  },

  {
    id: "streak_7",
    icon: "🌋",
    title: "Unstoppable",
    description: "Reach a 7-day streak.",
    check: player => player.streak >= 7
  },

  {
    id: "accuracy_80",
    icon: "🎯",
    title: "Sharp Mind",
    description: "Reach 80% accuracy.",
    check: player => calculateAccuracy(player) >= 80
  },

  {
    id: "legend",
    icon: "🌍",
    title: "ZIVO Legend",
    description: "Reach Level 50.",
    check: player => player.level >= 50
  }
]);


/* ============================================================
   5. GAME QUESTIONS
   ============================================================ */

const LOGIC_QUESTIONS = Object.freeze([
  {
    question: "What comes next? 2, 4, 8, 16, ?",
    options: ["20", "24", "32", "36"],
    answer: 2
  },

  {
    question: "What comes next? 3, 6, 12, 24, ?",
    options: ["30", "36", "48", "60"],
    answer: 2
  },

  {
    question: "Which number does not belong?",
    options: ["2", "4", "8", "15"],
    answer: 3
  },

  {
    question: "If 5 + 5 = 10, then 10 + 10 = ?",
    options: ["15", "20", "25", "30"],
    answer: 1
  },

  {
    question: "What is half of 100 plus 10?",
    options: ["40", "50", "60", "70"],
    answer: 2
  },

  {
    question: "Which shape has three sides?",
    options: ["Square", "Triangle", "Circle", "Rectangle"],
    answer: 1
  }
]);


const FOOTBALL_QUESTIONS = Object.freeze([
  {
    question:
      "You receive the ball under pressure with a teammate free behind the defender. What is usually the best decision?",

    options: [
      "Force a dribble into pressure",
      "Look for the free teammate",
      "Shoot immediately",
      "Stop and wait"
    ],

    answer: 1
  },

  {
    question:
      "Your team loses the ball high up the pitch. What should happen first?",

    options: [
      "Everyone runs forward",
      "Immediate counter-press if possible",
      "The goalkeeper leaves the goal",
      "Stop moving"
    ],

    answer: 1
  },

  {
    question:
      "A winger receives the ball with space and the striker is attacking the box. What should the winger consider?",

    options: [
      "Crossing options",
      "Ignoring teammates",
      "Running backwards only",
      "Stopping the attack"
    ],

    answer: 0
  },

  {
    question:
      "Why is scanning before receiving important?",

    options: [
      "To waste time",
      "To know the available options",
      "To avoid passing",
      "Only to impress spectators"
    ],

    answer: 1
  },

  {
    question:
      "What is a key benefit of moving without the ball?",

    options: [
      "Creating space and passing options",
      "Making the pitch smaller",
      "Avoiding teammates",
      "Stopping the attack"
    ],

    answer: 0
  },

  {
    question:
      "When defending, why is body orientation important?",

    options: [
      "It helps control direction and space",
      "It makes the player slower",
      "It has no purpose",
      "Only goalkeepers need it"
    ],

    answer: 0
  }
]);


/* ============================================================
   6. WHO AM I QUESTIONS
   ============================================================ */

const PERSONALITY_QUESTIONS = Object.freeze([
  {
    question: "When you face a difficult challenge, you usually:",
    options: [
      "Attack it immediately",
      "Think before acting",
      "Look for another route",
      "Ask someone for help"
    ]
  },

  {
    question: "In competition, what matters most?",
    options: [
      "Winning",
      "Improving",
      "Having fun",
      "Testing myself"
    ]
  },

  {
    question: "When something goes wrong, you:",
    options: [
      "Try again quickly",
      "Analyze the mistake",
      "Change the strategy",
      "Take a break"
    ]
  },

  {
    question: "You prefer:",
    options: [
      "Speed",
      "Accuracy",
      "Creativity",
      "Strategy"
    ]
  },

  {
    question: "In a team you are more likely to be:",
    options: [
      "The leader",
      "The thinker",
      "The creator",
      "The supporter"
    ]
  },

  {
    question: "When the pressure increases:",
    options: [
      "I become more aggressive",
      "I become more focused",
      "I become more creative",
      "I slow down and analyze"
    ]
  }
]);


/* ============================================================
   7. STATE
   ============================================================ */

let player = null;

let currentGame = null;

let gameTimer = null;

let gameTimeout = null;

let reactionStartTime = 0;

let reactionWaiting = false;

let memorySequence = [];

let memoryInput = [];

let focusCorrectIndex = -1;

let focusRounds = 0;

let accuracyRounds = 0;

let accuracyHits = 0;

let numberRound = 0;

let footballRound = 0;

let footballCorrect = 0;

let personalityScores = {
  speed: 0,
  strategy: 0,
  creativity: 0,
  leadership: 0
};


/* ============================================================
   8. DOM HELPER
   ============================================================ */

function $(selector) {
  try {
    return document.querySelector(selector);
  } catch (error) {
    console.error("ZIVOZONE selector error:", error);
    return null;
  }
}


function $$(selector) {
  try {
    return Array.from(document.querySelectorAll(selector));
  } catch (error) {
    console.error("ZIVOZONE selectors error:", error);
    return [];
  }
}


/* ============================================================
   9. SAFE STORAGE
   ============================================================ */

function loadStorage(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);

    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw);
  } catch (error) {
    console.error("ZIVOZONE storage read error:", error);
    return fallback;
  }
}


function saveStorage(key, value) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );

    return true;
  } catch (error) {
    console.error("ZIVOZONE storage write error:", error);
    showToast("Could not save your data on this device.");
    return false;
  }
}


/* ============================================================
   10. DATA SANITIZATION
   ============================================================ */

function sanitizeName(value) {
  try {
    if (typeof value !== "string") {
      return "ZIVO PLAYER";
    }

    return value
      .replace(/[\u0000-\u001F\u007F]/g, "")
      .trim()
      .slice(0, APP_CONFIG.maxNameLength);
  } catch (error) {
    console.error("Name sanitization error:", error);
    return "ZIVO PLAYER";
  }
}


function sanitizeCountry(value) {
  try {
    const allowedCountries = [
      "JO",
      "SA",
      "EG",
      "AE",
      "US",
      "GB",
      "FR"
    ];

    return allowedCountries.includes(value)
      ? value
      : "JO";
  } catch (error) {
    console.error("Country sanitization error:", error);
    return "JO";
  }
}


/* ============================================================
   11. PLAYER ID
   ============================================================ */

function generatePlayerId() {
  try {
    const timestamp =
      Date.now().toString(36).toUpperCase();

    const randomPart =
      Math.random()
        .toString(36)
        .slice(2, 7)
        .toUpperCase();

    return `ZIVO-${timestamp}-${randomPart}`;
  } catch (error) {
    console.error("Player ID generation error:", error);

    return `ZIVO-${Date.now()}`;
  }
}


/* ============================================================
   12. PLAYER NORMALIZATION
   ============================================================ */

function normalizePlayer(data) {
  try {
    const source =
      data && typeof data === "object"
        ? data
        : {};

    const normalized = {
      ...DEFAULT_PLAYER,
      ...source,

      id:
        typeof source.id === "string" && source.id.length > 0
          ? source.id
          : generatePlayerId(),

      name:
        sanitizeName(source.name),

      country:
        sanitizeCountry(source.country),

      xp:
        Number.isFinite(Number(source.xp))
          ? Math.max(0, Math.floor(Number(source.xp)))
          : 0,

      games:
        Number.isFinite(Number(source.games))
          ? Math.max(0, Math.floor(Number(source.games)))
          : 0,

      wins:
        Number.isFinite(Number(source.wins))
          ? Math.max(0, Math.floor(Number(source.wins)))
          : 0,

      correct:
        Number.isFinite(Number(source.correct))
          ? Math.max(0, Math.floor(Number(source.correct)))
          : 0,

      attempts:
        Number.isFinite(Number(source.attempts))
          ? Math.max(0, Math.floor(Number(source.attempts)))
          : 0,

      streak:
        Number.isFinite(Number(source.streak))
          ? Math.max(0, Math.floor(Number(source.streak)))
          : 0,

      dailyCompleted:
        Number.isFinite(Number(source.dailyCompleted))
          ? Math.max(
              0,
              Math.min(
                APP_CONFIG.dailyTotal,
                Math.floor(Number(source.dailyCompleted))
              )
            )
          : 0,

      achievements:
        Array.isArray(source.achievements)
          ? source.achievements.filter(
              item =>
                typeof item === "string" &&
                item.length <= 50
            )
          : [],

      attributes: {
        ...DEFAULT_PLAYER.attributes,
        ...(source.attributes || {})
      }
    };

    Object.keys(normalized.attributes).forEach(key => {
      const value =
        Number(normalized.attributes[key]);

      normalized.attributes[key] =
        Number.isFinite(value)
          ? clamp(
              Math.round(value),
              APP_CONFIG.minAttribute,
              APP_CONFIG.maxAttribute
            )
          : 50;
    });

    normalized.level =
      calculateLevel(normalized.xp);

    normalized.updatedAt =
      new Date().toISOString();

    if (!normalized.createdAt) {
      normalized.createdAt =
        normalized.updatedAt;
    }

    return normalized;
  } catch (error) {
    console.error("Player normalization error:", error);

    return {
      ...DEFAULT_PLAYER,
      id: generatePlayerId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}


/* ============================================================
   13. CLAMP
   ============================================================ */

function clamp(value, min, max) {
  return Math.min(
    Math.max(value, min),
    max
  );
}


/* ============================================================
   14. LEVEL SYSTEM
   ============================================================ */

function calculateLevel(xp) {
  try {
    const safeXp =
      Math.max(
        0,
        Number.isFinite(Number(xp))
          ? Number(xp)
          : 0
      );

    return Math.max(
      1,
      Math.floor(
        safeXp / APP_CONFIG.xpPerLevel
      ) + 1
    );
  } catch (error) {
    console.error("Level calculation error:", error);
    return 1;
  }
}


function getLevelProgress(xp) {
  try {
    const safeXp =
      Math.max(0, Number(xp) || 0);

    const currentLevel =
      calculateLevel(safeXp);

    const currentLevelStart =
      (currentLevel - 1) *
      APP_CONFIG.xpPerLevel;

    const progress =
      safeXp - currentLevelStart;

    return clamp(
      (progress /
        APP_CONFIG.xpPerLevel) *
        100,
      0,
      100
    );
  } catch (error) {
    console.error("Level progress error:", error);
    return 0;
  }
}


/* ============================================================
   15. RANK
   ============================================================ */

function getRank(level) {
  try {
    let currentRank = RANKS[0].name;

    for (const rank of RANKS) {
      if (level >= rank.minLevel) {
        currentRank = rank.name;
      }
    }

    return currentRank;
  } catch (error) {
    console.error("Rank calculation error:", error);
    return "ROOKIE";
  }
}


/* ============================================================
   16. ACCURACY
   ============================================================ */

function calculateAccuracy(targetPlayer = player) {
  try {
    if (!targetPlayer) {
      return 0;
    }

    if (!targetPlayer.attempts) {
      return 0;
    }

    return clamp(
      Math.round(
        (targetPlayer.correct /
          targetPlayer.attempts) *
          100
      ),
      0,
      100
    );
  } catch (error) {
    console.error("Accuracy calculation error:", error);
    return 0;
  }
}


/* ============================================================
   17. XP AWARD
   ============================================================ */

function awardXP(amount, reason = "Challenge") {
  try {
    if (!player) {
      return;
    }

    const safeAmount =
      clamp(
        Math.floor(Number(amount) || 0),
        0,
        1000
      );

    if (safeAmount <= 0) {
      return;
    }

    const oldLevel =
      player.level;

    player.xp += safeAmount;

    player.level =
      calculateLevel(player.xp);

    player.updatedAt =
      new Date().toISOString();

    savePlayer();

    updateUI();

    showToast(
      `+${safeAmount} XP — ${reason}`
    );

    if (player.level > oldLevel) {
      showToast(
        `🎉 LEVEL UP! You reached Level ${player.level}`
      );
    }

    checkAchievements();
  } catch (error) {
    console.error("XP award error:", error);
  }
}


/* ============================================================
   18. ATTRIBUTE UPDATE
   ============================================================ */

function improveAttribute(attribute, amount = 1) {
  try {
    if (!player) {
      return;
    }

    if (!Object.prototype.hasOwnProperty.call(
      player.attributes,
      attribute
    )) {
      return;
    }

    const safeAmount =
      clamp(
        Math.round(Number(amount) || 0),
        -10,
        10
      );

    player.attributes[attribute] =
      clamp(
        player.attributes[attribute] +
          safeAmount,
        APP_CONFIG.minAttribute,
        APP_CONFIG.maxAttribute
      );

    savePlayer();
    updateUI();
  } catch (error) {
    console.error("Attribute update error:", error);
  }
}


/* ============================================================
   19. GAME STATISTICS
   ============================================================ */

function registerAttempt(isCorrect, isWin = false) {
  try {
    if (!player) {
      return;
    }

    player.games += 1;

    player.attempts += 1;

    if (isCorrect) {
      player.correct += 1;
    }

    if (isWin) {
      player.wins += 1;
    }

    savePlayer();
    updateUI();

    checkAchievements();
  } catch (error) {
    console.error("Game statistics error:", error);
  }
}


/* ============================================================
   20. SAVE PLAYER
   ============================================================ */

function savePlayer() {
  try {
    if (!player) {
      return false;
    }

    player =
      normalizePlayer(player);

    return saveStorage(
      APP_CONFIG.storageKey,
      player
    );
  } catch (error) {
    console.error("Save player error:", error);
    return false;
  }
}


/* ============================================================
   21. LOAD PLAYER
   ============================================================ */

function loadPlayer() {
  try {
    const saved =
      loadStorage(
        APP_CONFIG.storageKey,
        null
      );

    player =
      normalizePlayer(
        saved || {
          ...DEFAULT_PLAYER,
          id: generatePlayerId(),
          createdAt: new Date().toISOString()
        }
      );

    updateDailyState();

    savePlayer();
  } catch (error) {
    console.error("Load player error:", error);

    player =
      normalizePlayer({
        ...DEFAULT_PLAYER,
        id: generatePlayerId()
      });
  }
}


/* ============================================================
   22. TOAST
   ============================================================ */

let toastTimeout = null;

function showToast(message) {
  try {
    const toast =
      $("#toast");

    if (!toast) {
      return;
    }

    toast.textContent =
      String(message);

    toast.classList.add("show");

    clearTimeout(toastTimeout);

    toastTimeout =
      setTimeout(() => {
        toast.classList.remove("show");
      }, 3000);
  } catch (error) {
    console.error("Toast error:", error);
  }
}


/* ============================================================
   23. UPDATE TEXT SAFELY
   ============================================================ */

function setText(id, value) {
  try {
    const element =
      document.getElementById(id);

    if (!element) {
      return;
    }

    element.textContent =
      String(value);
  } catch (error) {
    console.error(`UI update error for ${id}:`, error);
  }
}


/* ============================================================
   24. UPDATE PROFILE UI
   ============================================================ */

function updateUI() {
  try {
    if (!player) {
      return;
    }

    const rank =
      getRank(player.level);

    const accuracy =
      calculateAccuracy(player);

    const progress =
      getLevelProgress(player.xp);

    const initial =
      getInitial(player.name);

    setText(
      "heroLevel",
      player.level
    );

    setText(
      "heroXp",
      player.xp
    );

    setText(
      "heroStreak",
      player.streak
    );

    setText(
      "heroRank",
      `#${getPlayerRank()}`
    );

    setText(
      "heroAvatar",
      initial
    );

    setText(
      "heroName",
      player.name
    );

    setText(
      "heroRankName",
      rank
    );

    setText(
      "profileAvatar",
      initial
    );

    setText(
      "profileName",
      player.name
    );

    setText(
      "profileId",
      `ZIVO ID: ${player.id}`
    );

    setText(
      "profileRank",
      rank
    );

    setText(
      "profileLevel",
      player.level
    );

    setText(
      "profileXp",
      player.xp
    );

    setText(
      "statGames",
      player.games
    );

    setText(
      "statWins",
      player.wins
    );

    setText(
      "statAccuracy",
      `${accuracy}%`
    );

    setText(
      "statAchievements",
      player.achievements.length
    );

    setText(
      "battleYouAvatar",
      initial
    );

    setText(
      "battleYouName",
      player.name
    );

    setProgress(
      "heroProgress",
      progress
    );

    setProgress(
      "profileProgress",
      progress
    );

    updateHeroAttributes();
    updateFootballAttributes();
    updateDailyUI();
    renderAchievements();
    renderLeaderboard();

    updateYear();
  } catch (error) {
    console.error("Main UI update error:", error);
  }
}


/* ============================================================
   25. PROGRESS
   ============================================================ */

function setProgress(id, percentage) {
  try {
    const element =
      document.getElementById(id);

    if (!element) {
      return;
    }

    element.style.width =
      `${clamp(percentage, 0, 100)}%`;
  } catch (error) {
    console.error("Progress UI error:", error);
  }
}


/* ============================================================
   26. INITIAL
   ============================================================ */

function getInitial(name) {
  try {
    const safeName =
      sanitizeName(name);

    if (!safeName) {
      return "Z";
    }

    return safeName
      .charAt(0)
      .toUpperCase();
  } catch (error) {
    console.error("Initial error:", error);
    return "Z";
  }
}


/* ============================================================
   27. PLAYER RANK NUMBER
   ============================================================ */

function getPlayerRank() {
  try {
    const leaderboard =
      getLeaderboard();

    const index =
      leaderboard.findIndex(
        item => item.id === player.id
      );

    if (index === -1) {
      return "—";
    }

    return index + 1;
  } catch (error) {
    console.error("Player ranking error:", error);
    return "—";
  }
}


/* ============================================================
   28. FOOTBALL ATTRIBUTES
   ============================================================ */

function updateHeroAttributes() {
  try {
    setText(
      "heroIntelligence",
      player.attributes.intelligence
    );

    setText(
      "heroSpeed",
      player.attributes.speed
    );

    setText(
      "heroFocus",
      player.attributes.focus
    );

    setText(
      "heroFootball",
      player.attributes.football
    );

    setText(
      "attrIntelligence",
      player.attributes.intelligence
    );

    setText(
      "attrSpeed",
      player.attributes.speed
    );

    setText(
      "attrFocus",
      player.attributes.focus
    );

    setText(
      "attrAccuracy",
      player.attributes.accuracy
    );

    setText(
      "attrLogic",
      player.attributes.logic
    );

    setText(
      "attrFootball",
      player.attributes.football
    );
  } catch (error) {
    console.error("Hero attributes error:", error);
  }
}


function updateFootballAttributes() {
  try {
    const decision =
      Math.round(
        (
          player.attributes.intelligence +
          player.attributes.football
        ) / 2
      );

    const vision =
      Math.round(
        (
          player.attributes.focus +
          player.attributes.football
        ) / 2
      );

    const positioning =
      Math.round(
        (
          player.attributes.logic +
          player.attributes.football
        ) / 2
      );

    const football =
      player.attributes.football;

    setText(
      "skillDecision",
      decision
    );

    setText(
      "skillVision",
      vision
    );

    setText(
      "skillPositioning",
      positioning
    );

    setText(
      "skillFootball",
      football
    );

    setProgress(
      "barDecision",
      decision
    );

    setProgress(
      "barVision",
      vision
    );

    setProgress(
      "barPositioning",
      positioning
    );

    setProgress(
      "barFootball",
      football
    );
  } catch (error) {
    console.error("Football attribute error:", error);
  }
}


/* ============================================================
   29. YEAR
   ============================================================ */

function updateYear() {
  try {
    setText(
      "year",
      new Date().getFullYear()
    );
  } catch (error) {
    console.error("Year update error:", error);
  }
}


/* ============================================================
   30. DAILY SYSTEM
   ============================================================ */

function getTodayKey() {
  try {
    const date =
      new Date();

    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
  } catch (error) {
    console.error("Date key error:", error);

    return "";
  }
}


function getYesterdayKey() {
  try {
    const date =
      new Date();

    date.setDate(
      date.getDate() - 1
    );

    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
  } catch (error) {
    console.error("Yesterday key error:", error);

    return "";
  }
}


function updateDailyState() {
  try {
    if (!player) {
      return;
    }

    const today =
      getTodayKey();

    if (player.dailyDate !== today) {
      player.dailyDate =
        today;

      player.dailyCompleted = 0;
    }

    if (
      player.lastDailyDate ===
      getYesterdayKey()
    ) {
      // Keep current streak.
    } else if (
      player.lastDailyDate !== today &&
      player.lastDailyDate !== null
    ) {
      player.streak = 0;
    }

    savePlayer();
  } catch (error) {
    console.error("Daily state error:", error);
  }
}


function updateDailyUI() {
  try {
    setText(
      "dailyStatus",
      `${player.dailyCompleted} / ${APP_CONFIG.dailyTotal}`
    );

    setText(
      "dailyStreak",
      player.streak
    );
  } catch (error) {
    console.error("Daily UI error:", error);
  }
}


function completeDailyChallenge() {
  try {
    const today =
      getTodayKey();

    if (player.dailyDate !== today) {
      player.dailyDate = today;
      player.dailyCompleted = 0;
    }

    if (
      player.dailyCompleted >=
      APP_CONFIG.dailyTotal
    ) {
      return;
    }

    player.dailyCompleted += 1;

    if (
      player.dailyCompleted ===
      APP_CONFIG.dailyTotal
    ) {
      if (
        player.lastDailyDate ===
        getYesterdayKey()
      ) {
        player.streak += 1;
      } else if (
        player.lastDailyDate !== today
      ) {
        player.streak = 1;
      }

      player.lastDailyDate =
        today;

      awardXP(
        100,
        "Daily ZIVO completed"
      );

      showToast(
        `🔥 Daily complete! ${player.streak} day streak`
      );
    }

    savePlayer();
    updateUI();
  } catch (error) {
    console.error("Daily completion error:", error);
  }
}


/* ============================================================
   31. ACHIEVEMENTS
   ============================================================ */

function checkAchievements() {
  try {
    if (!player) {
      return;
    }

    let unlockedSomething =
      false;

    for (const achievement of ACHIEVEMENTS) {
      const alreadyUnlocked =
        player.achievements.includes(
          achievement.id
        );

      if (
        !alreadyUnlocked &&
        achievement.check(player)
      ) {
        player.achievements.push(
          achievement.id
        );

        unlockedSomething =
          true;

        showToast(
          `🏆 Achievement unlocked: ${achievement.title}`
        );
      }
    }

    if (unlockedSomething) {
      savePlayer();
      renderAchievements();
    }
  } catch (error) {
    console.error("Achievement check error:", error);
  }
}


function renderAchievements() {
  try {
    const container =
      $("#achievementGrid");

    if (!container || !player) {
      return;
    }

    container.replaceChildren();

    for (const achievement of ACHIEVEMENTS) {
      const unlocked =
        player.achievements.includes(
          achievement.id
        );

      const card =
        document.createElement("div");

      card.className =
        "achievement";

      if (!unlocked) {
        card.style.opacity = "0.42";
      }

      const icon =
        document.createElement("div");

      icon.className =
        "achievement-icon";

      icon.textContent =
        unlocked
          ? achievement.icon
          : "🔒";

      const title =
        document.createElement("strong");

      title.textContent =
        achievement.title;

      const description =
        document.createElement("small");

      description.textContent =
        unlocked
          ? achievement.description
          : "Locked";

      card.append(
        icon,
        title,
        description
      );

      container.appendChild(card);
    }
  } catch (error) {
    console.error("Achievement rendering error:", error);
  }
}


/* ============================================================
   32. LEADERBOARD
   ============================================================ */

function getDefaultLeaderboard() {
  return [
    {
      id: "demo-1",
      name: "ZIVO Master",
      country: "US",
      xp: 12450,
      level: 25
    },

    {
      id: "demo-2",
      name: "Brain Storm",
      country: "GB",
      xp: 10320,
      level: 21
    },

    {
      id: "demo-3",
      name: "Football IQ",
      country: "FR",
      xp: 8900,
      level: 18
    },

    {
      id: "demo-4",
      name: "Speed King",
      country: "SA",
      xp: 7250,
      level: 15
    },

    {
      id: "demo-5",
      name: "ZIVO Star",
      country: "JO",
      xp: 5900,
      level: 12
    }
  ];
}


function getLeaderboard() {
  try {
    const saved =
      loadStorage(
        APP_CONFIG.leaderboardKey,
        null
      );

    let leaderboard =
      Array.isArray(saved)
        ? saved
        : getDefaultLeaderboard();

    const playerEntry = {
      id: player.id,
      name: player.name,
      country: player.country,
      xp: player.xp,
      level: player.level
    };

    const existingIndex =
      leaderboard.findIndex(
        item => item.id === player.id
      );

    if (existingIndex >= 0) {
      leaderboard[existingIndex] =
        playerEntry;
    } else {
      leaderboard.push(
        playerEntry
      );
    }

    leaderboard =
      leaderboard
        .filter(
          item =>
            item &&
            typeof item.name === "string" &&
            Number.isFinite(Number(item.xp))
        )
        .sort(
          (a, b) =>
            Number(b.xp) -
            Number(a.xp)
        )
        .slice(0, 100);

    saveStorage(
      APP_CONFIG.leaderboardKey,
      leaderboard
    );

    return leaderboard;
  } catch (error) {
    console.error("Leaderboard error:", error);

    return [];
  }
}


function renderLeaderboard(mode = "global") {
  try {
    const container =
      $("#leaderboardRows");

    if (!container || !player) {
      return;
    }

    let leaderboard =
      getLeaderboard();

    if (mode === "country") {
      leaderboard =
        leaderboard.filter(
          item =>
            item.country ===
            player.country
        );
    }

    container.replaceChildren();

    leaderboard
      .slice(0, 10)
      .forEach((item, index) => {
        const row =
          document.createElement("div");

        row.className =
          "leader-row";

        const position =
          document.createElement("span");

        position.textContent =
          String(index + 1);

        const playerCell =
          document.createElement("div");

        playerCell.className =
          "leader-player";

        const avatar =
          document.createElement("div");

        avatar.className =
          "leader-avatar";

        avatar.textContent =
          getInitial(item.name);

        const name =
          document.createElement("strong");

        name.textContent =
          item.name;

        playerCell.append(
          avatar,
          name
        );

        const level =
          document.createElement("span");

        level.textContent =
          String(item.level);

        const xp =
          document.createElement("span");

        xp.textContent =
          String(item.xp);

        row.append(
          position,
          playerCell,
          level,
          xp
        );

        container.appendChild(row);
      });
  } catch (error) {
    console.error("Leaderboard rendering error:", error);
  }
}


/* ============================================================
   33. MODAL
   ============================================================ */

function openGameModal() {
  try {
    const modal =
      $("#gameModal");

    if (!modal) {
      return;
    }

    if (typeof modal.showModal === "function") {
      modal.showModal();
    } else {
      modal.setAttribute(
        "open",
        ""
      );
    }
  } catch (error) {
    console.error("Game modal open error:", error);
  }
}


function closeGameModal() {
  try {
    stopAllTimers();

    const modal =
      $("#gameModal");

    if (!modal) {
      return;
    }

    if (
      typeof modal.close ===
      "function"
    ) {
      modal.close();
    } else {
      modal.removeAttribute(
        "open"
      );
    }

    currentGame = null;
  } catch (error) {
    console.error("Game modal close error:", error);
  }
}


function openProfileModal() {
  try {
    const modal =
      $("#profileModal");

    const nameInput =
      $("#nameInput");

    const countryInput =
      $("#countryInput");

    if (!modal) {
      return;
    }

    if (nameInput) {
      nameInput.value =
        player.name;
    }

    if (countryInput) {
      countryInput.value =
        player.country;
    }

    if (typeof modal.showModal === "function") {
      modal.showModal();
    } else {
      modal.setAttribute(
        "open",
        ""
      );
    }
  } catch (error) {
    console.error("Profile modal error:", error);
  }
}


function closeProfileModal() {
  try {
    const modal =
      $("#profileModal");

    if (!modal) {
      return;
    }

    if (
      typeof modal.close ===
      "function"
    ) {
      modal.close();
    } else {
      modal.removeAttribute(
        "open"
      );
    }
  } catch (error) {
    console.error("Profile close error:", error);
  }
}


/* ============================================================
   34. TIMER CONTROL
   ============================================================ */

function stopAllTimers() {
  try {
    if (gameTimer) {
      clearInterval(gameTimer);
      gameTimer = null;
    }

    if (gameTimeout) {
      clearTimeout(gameTimeout);
      gameTimeout = null;
    }
  } catch (error) {
    console.error("Timer cleanup error:", error);
  }
}


/* ============================================================
   35. GAME STARTER
   ============================================================ */

function startGame(gameName) {
  try {
    stopAllTimers();

    currentGame =
      gameName;

    const content =
      $("#gameContent");

    if (!content) {
      throw new Error(
        "Game content container not found."
      );
    }

    content.replaceChildren();

    openGameModal();

    switch (gameName) {
      case "reaction":
        startReactionGame();
        break;

      case "memory":
        startMemoryGame();
        break;

      case "focus":
        startFocusGame();
        break;

      case "logic":
        startLogicGame();
        break;

      case "accuracy":
        startAccuracyGame();
        break;

      case "numbers":
        startNumberGame();
        break;

      case "football":
        startFootballGame();
        break;

      case "whoami":
        startWhoAmIGame();
        break;

      default:
        throw new Error(
          `Unknown game: ${gameName}`
        );
    }
  } catch (error) {
    console.error("Game start error:", error);

    showToast(
      "Could not start this challenge."
    );
  }
}


/* ============================================================
   36. GAME UI HELPERS
   ============================================================ */

function createGameScreen(title, description) {
  try {
    const container =
      document.createElement("div");

    container.className =
      "game-screen";

    const eyebrow =
      document.createElement("span");

    eyebrow.className =
      "eyebrow";

    eyebrow.textContent =
      "ZIVO CHALLENGE";

    const heading =
      document.createElement("h2");

    heading.textContent =
      title;

    const text =
      document.createElement("p");

    text.textContent =
      description;

    container.append(
      eyebrow,
      heading,
      text
    );

    return container;
  } catch (error) {
    console.error("Game screen creation error:", error);

    return document.createElement("div");
  }
}


function createGameBoard() {
  try {
    const board =
      document.createElement("div");

    board.className =
      "game-board";

    return board;
  } catch (error) {
    console.error("Game board creation error:", error);

    return document.createElement("div");
  }
}


function createButton(text, className = "btn btn-primary") {
  const button =
    document.createElement("button");

  button.type =
    "button";

  button.className =
    className;

  button.textContent =
    text;

  return button;
}


function finishGame(title, message, xp, isWin = true) {
  try {
    stopAllTimers();

    registerAttempt(
      isWin,
      isWin
    );

    if (isWin) {
      awardXP(
        xp,
        title
      );
    }

    const content =
      $("#gameContent");

    if (!content) {
      return;
    }

    content.replaceChildren();

    const screen =
      createGameScreen(
        title,
        message
      );

    const result =
      document.createElement("div");

    result.className =
      "game-result";

    const xpText =
      document.createElement("strong");

    xpText.textContent =
      `+${xp} XP`;

    const button =
      createButton(
        "PLAY AGAIN"
      );

    button.addEventListener(
      "click",
      () => {
        if (currentGame) {
          startGame(currentGame);
        }
      }
    );

    screen.append(
      result,
      button
    );

    result.appendChild(
      xpText
    );

    content.appendChild(
      screen
    );

    completeDailyChallenge();
  } catch (error) {
    console.error("Finish game error:", error);
  }
}


/* ============================================================
   37. REACTION GAME
   ============================================================ */

function startReactionGame() {
  try {
    const content =
      $("#gameContent");

    const screen =
      createGameScreen(
        "⚡ Reaction",
        "Wait for the signal. Click only when the target turns green."
      );

    const board =
      createGameBoard();

    const status =
      document.createElement("div");

    status.textContent =
      "GET READY...";

    status.style.fontSize =
      "2rem";

    status.style.fontWeight =
      "900";

    const button =
      createButton(
        "WAIT..."
      );

    button.disabled =
      true;

    button.style.minWidth =
      "220px";

    button.style.minHeight =
      "100px";

    board.append(
      status,
      button
    );

    screen.append(
      board
    );

    content.appendChild(
      screen
    );

    let round = 0;

    let totalTime = 0;

    let falseStart = false;

    const prepareRound =
      () => {
        if (round >= APP_CONFIG.reactionRounds) {
          const average =
            Math.round(
              totalTime /
                APP_CONFIG.reactionRounds
            );

          finishGame(
            "⚡ Reaction Complete",
            `Your average reaction time was ${average} ms.`,
            Math.max(
              40,
              180 -
                Math.floor(
                  average / 8
                )
            ),
            true
          );

          return;
        }

        round += 1;

        falseStart =
          false;

        status.textContent =
          `ROUND ${round}/${APP_CONFIG.reactionRounds}`;

        button.textContent =
          "WAIT...";

        button.disabled =
          false;

        button.style.background =
          "rgba(255,255,255,0.06)";

        const delay =
          1200 +
          Math.random() * 2500;

        gameTimeout =
          setTimeout(
            () => {
              reactionWaiting =
                true;

              reactionStartTime =
                performance.now();

              status.textContent =
                "CLICK NOW!";

              button.textContent =
                "🔥 CLICK!";

              button.style.background =
                "linear-gradient(135deg,#22c55e,#16a34a)";
            },
            delay
          );
      };

    button.addEventListener(
      "click",
      () => {
        try {
          if (!reactionWaiting) {
            if (!falseStart) {
              falseStart =
                true;

              status.textContent =
                "TOO EARLY!";

              button.disabled =
                true;

              clearTimeout(
                gameTimeout
              );

              gameTimeout =
                setTimeout(
                  prepareRound,
                  900
                );
            }

            return;
          }

          const reaction =
            Math.round(
              performance.now() -
                reactionStartTime
            );

          reactionWaiting =
            false;

          totalTime +=
            reaction;

          status.textContent =
            `${reaction} ms`;

          button.disabled =
            true;

          gameTimeout =
            setTimeout(
              prepareRound,
              900
            );
        } catch (error) {
          console.error(
            "Reaction click error:",
            error
          );
        }
      }
    );

    prepareRound();
  } catch (error) {
    console.error("Reaction game error:", error);
  }
}


/* ============================================================
   38. MEMORY GAME
   ============================================================ */

function startMemoryGame() {
  try {
    const content =
      $("#gameContent");

    const screen =
      createGameScreen(
        "🧠 Memory Grid",
        "Remember the highlighted squares and reproduce the pattern."
      );

    const board =
      createGameBoard();

    board.style.display =
      "grid";

    board.style.gridTemplateColumns =
      "repeat(4, 1fr)";

    board.style.gap =
      "8px";

    board.style.maxWidth =
      "420px";

    const status =
      document.createElement("p");

    status.textContent =
      "Memorize the pattern...";

    screen.append(
      status,
      board
    );

    content.appendChild(
      screen
    );

    let round =
      0;

    const startRound =
      () => {
        board.replaceChildren();

        round += 1;

        const tileCount =
          16;

        const sequenceLength =
          Math.min(
            3 + round,
            7
          );

        memorySequence =
          [];

        memoryInput =
          [];

        const used =
          new Set();

        while (
          memorySequence.length <
          sequenceLength
        ) {
          const index =
            Math.floor(
              Math.random() *
                tileCount
            );

          if (!used.has(index)) {
            used.add(index);
            memorySequence.push(index);
          }
        }

        const tiles = [];

        for (
          let i = 0;
          i < tileCount;
          i += 1
        ) {
          const tile =
            createButton(
              "",
              "btn btn-ghost"
            );

          tile.dataset.index =
            String(i);

          tile.style.height =
            "70px";

          tile.style.padding =
            "0";

          tile.style.background =
            "rgba(255,255,255,0.04)";

          tiles.push(tile);

          board.appendChild(
            tile
          );
        }

        memorySequence.forEach(
          (index, position) => {
            setTimeout(
              () => {
                const tile =
                  tiles[index];

                if (!tile) {
                  return;
                }

                tile.style.background =
                  "linear-gradient(135deg,#a855f7,#22d3ee)";

                setTimeout(
                  () => {
                    tile.style.background =
                      "rgba(255,255,255,0.04)";
                  },
                  450
                );
              },
              position * 500
            );
          }
        );

        const inputDelay =
          sequenceLength * 500 +
          700;

        setTimeout(
          () => {
            status.textContent =
              `ROUND ${round}/${APP_CONFIG.memoryRounds} — repeat the pattern`;

            tiles.forEach(
              tile => {
                tile.addEventListener(
                  "click",
                  () => {
                    handleMemoryInput(
                      tile,
                      tiles,
                      status,
                      startRound,
                      round
                    );
                  }
                );
              }
            );
          },
          inputDelay
        );
      };

    startRound();
  } catch (error) {
    console.error("Memory game error:", error);
  }
}


function handleMemoryInput(
  tile,
  tiles,
  status,
  nextRound,
  round
) {
  try {
    const index =
      Number(tile.dataset.index);

    memoryInput.push(
      index
    );

    tile.style.background =
      "rgba(34,211,238,0.4)";

    const currentIndex =
      memoryInput.length - 1;

    if (
      memoryInput[currentIndex] !==
      memorySequence[currentIndex]
    ) {
      registerAttempt(
        false,
        false
      );

      finishGame(
        "🧠 Memory Failed",
        "The pattern was broken. Try again and train your memory.",
        20,
        false
      );

      return;
    }

    if (
      memoryInput.length ===
      memorySequence.length
    ) {
      if (
        round >=
        APP_CONFIG.memoryRounds
      ) {
        improveAttribute(
          "intelligence",
          2
        );

        improveAttribute(
          "focus",
          1
        );

        finishGame(
          "🧠 Memory Complete",
          "Excellent memory control. You completed all rounds.",
          120,
          true
        );

        return;
      }

      status.textContent =
        "Correct! Next round...";

      setTimeout(
        nextRound,
        800
      );
    }
  } catch (error) {
    console.error(
      "Memory input error:",
      error
    );
  }
}


/* ============================================================
   39. FOCUS GAME
   ============================================================ */

function startFocusGame() {
  try {
    const content =
      $("#gameContent");

    const screen =
      createGameScreen(
        "👁 Focus",
        "Find the different symbol as quickly as possible."
      );

    const board =
      createGameBoard();

    const status =
      document.createElement("p");

    screen.append(
      status,
      board
    );

    content.appendChild(
      screen
    );

    focusRounds =
      0;

    const runRound =
      () => {
        focusRounds += 1;

        board.replaceChildren();

        const gridSize =
          16;

        const normal =
          "●";

        const different =
          "○";

        focusCorrectIndex =
          Math.floor(
            Math.random() *
              gridSize
          );

        board.style.display =
          "grid";

        board.style.gridTemplateColumns =
          "repeat(4,1fr)";

        board.style.gap =
          "10px";

        board.style.maxWidth =
          "420px";

        status.textContent =
          `ROUND ${focusRounds}/${APP_CONFIG.focusRounds}`;

        for (
          let i = 0;
          i < gridSize;
          i += 1
        ) {
          const button =
            createButton(
              i === focusCorrectIndex
                ? different
                : normal,
              "btn btn-ghost"
            );

          button.style.height =
            "65px";

          button.style.fontSize =
            "1.5rem";

          button.addEventListener(
            "click",
            () => {
              const correct =
                i ===
                focusCorrectIndex;

              registerAttempt(
                correct,
                correct
              );

              if (!correct) {
                finishGame(
                  "👁 Focus Failed",
                  "You clicked the wrong symbol.",
                  15,
                  false
                );

                return;
              }

              improveAttribute(
                "focus",
                2
              );

              if (
                focusRounds >=
                APP_CONFIG.focusRounds
              ) {
                finishGame(
                  "👁 Focus Complete",
                  "Excellent concentration.",
                  100,
                  true
                );

                return;
              }

              setTimeout(
                runRound,
                300
              );
            }
          );

          board.appendChild(
            button
          );
        }
      };

    runRound();
  } catch (error) {
    console.error("Focus game error:", error);
  }
}


/* ============================================================
   40. LOGIC GAME
   ============================================================ */

function startLogicGame() {
  try {
    const content =
      $("#gameContent");

    const screen =
      createGameScreen(
        "🧩 Logic Rush",
        "Solve the sequence and logic questions."
      );

    const board =
      createGameBoard();

    screen.append(
      board
    );

    content.appendChild(
      screen
    );

    let round =
      0;

    let correctAnswers =
      0;

    const questions =
      shuffleArray(
        [...LOGIC_QUESTIONS]
      ).slice(
        0,
        APP_CONFIG.logicRounds
      );

    const showQuestion =
      () => {
        if (
          round >=
          questions.length
        ) {
          const xp =
            40 +
            correctAnswers * 18;

          improveAttribute(
            "logic",
            correctAnswers
          );

          finishGame(
            "🧩 Logic Complete",
            `${correctAnswers}/${questions.length} correct answers.`,
            xp,
            correctAnswers >= 3
          );

          return;
        }

        const question =
          questions[round];

        board.replaceChildren();

        const title =
          document.createElement("h3");

        title.textContent =
          `Question ${round + 1}/${questions.length}`;

        const questionText =
          document.createElement("p");

        questionText.textContent =
          question.question;

        const options =
          document.createElement("div");

        options.style.display =
          "grid";

        options.style.gap =
          "10px";

        options.style.width =
          "100%";

        question.options.forEach(
          (option, index) => {
            const button =
              createButton(
                option,
                "btn btn-ghost"
              );

            button.addEventListener(
              "click",
              () => {
                const correct =
                  index ===
                  question.answer;

                registerAttempt(
                  correct,
                  correct
                );

                if (correct) {
                  correctAnswers += 1;

                  button.style.background =
                    "rgba(52,211,153,0.2)";
                } else {
                  button.style.background =
                    "rgba(251,113,133,0.2)";
                }

                round += 1;

                setTimeout(
                  showQuestion,
                  500
                );
              }
            );

            options.appendChild(
              button
            );
          }
        );

        board.append(
          title,
          questionText,
          options
        );
      };

    showQuestion();
  } catch (error) {
    console.error("Logic game error:", error);
  }
}


/* ============================================================
   41. ACCURACY GAME
   ============================================================ */

function startAccuracyGame() {
  try {
    const content =
      $("#gameContent");

    const screen =
      createGameScreen(
        "🎯 Target",
        "Click the target as quickly and accurately as possible."
      );

    const board =
      createGameBoard();

    board.style.position =
      "relative";

    board.style.minHeight =
      "300px";

    board.style.overflow =
      "hidden";

    screen.append(
      board
    );

    content.appendChild(
      screen
    );

    accuracyRounds =
      0;

    accuracyHits =
      0;

    const runRound =
      () => {
        accuracyRounds += 1;

        board.replaceChildren();

        const target =
          document.createElement("button");

        target.type =
          "button";

        target.textContent =
          "🎯";

        target.style.position =
          "absolute";

        target.style.width =
          "65px";

        target.style.height =
          "65px";

        target.style.borderRadius =
          "50%";

        target.style.border =
          "2px solid white";

        target.style.background =
          "linear-gradient(135deg,#a855f7,#22d3ee)";

        target.style.fontSize =
          "1.5rem";

        target.style.cursor =
          "pointer";

        const left =
          10 +
          Math.random() * 75;

        const top =
          10 +
          Math.random() * 70;

        target.style.left =
          `${left}%`;

        target.style.top =
          `${top}%`;

        board.appendChild(
          target
        );

        const timer =
          setTimeout(
            () => {
              registerAttempt(
                false,
                false
              );

              if (
                accuracyRounds >=
                APP_CONFIG.accuracyRounds
              ) {
                finishGame(
                  "🎯 Target Complete",
                  `You hit ${accuracyHits}/${APP_CONFIG.accuracyRounds} targets.`,
                  accuracyHits * 20,
                  accuracyHits >= 3
                );
              } else {
                runRound();
              }
            },
            2200
          );

        target.addEventListener(
          "click",
          () => {
            clearTimeout(
              timer
            );

            accuracyHits += 1;

            registerAttempt(
              true,
              true
            );

            improveAttribute(
              "accuracy",
              2
            );

            if (
              accuracyRounds >=
              APP_CONFIG.accuracyRounds
            ) {
              finishGame(
                "🎯 Target Complete",
                `You hit ${accuracyHits}/${APP_CONFIG.accuracyRounds} targets.`,
                50 +
                  accuracyHits * 18,
                accuracyHits >= 3
              );

              return;
            }

            runRound();
          }
        );
      };

    runRound();
  } catch (error) {
    console.error("Accuracy game error:", error);
  }
}


/* ============================================================
   42. NUMBER RUSH
   ============================================================ */

function startNumberGame() {
  try {
    const content =
      $("#gameContent");

    const screen =
      createGameScreen(
        "🔢 Number Rush",
        "Solve the arithmetic challenge before moving to the next round."
      );

    const board =
      createGameBoard();

    screen.append(
      board
    );

    content.appendChild(
      screen
    );

    numberRound =
      0;

    let correctAnswers =
      0;

    const runRound =
      () => {
        numberRound += 1;

        board.replaceChildren();

        const a =
          Math.floor(
            Math.random() *
              20
          ) + 5;

        const b =
          Math.floor(
            Math.random() *
              15
          ) + 2;

        const operators =
          ["+", "-", "×"];

        const operator =
          operators[
            Math.floor(
              Math.random() *
                operators.length
            )
          ];

        let answer;

        if (operator === "+") {
          answer =
            a + b;
        } else if (operator === "-") {
          answer =
            a - b;
        } else {
          answer =
            a * b;
        }

        const title =
          document.createElement("h3");

        title.textContent =
          `ROUND ${numberRound}/${APP_CONFIG.numberRounds}`;

        const question =
          document.createElement("div");

        question.textContent =
          `${a} ${operator} ${b} = ?`;

        question.style.fontSize =
          "2rem";

        question.style.fontWeight =
          "900";

        const input =
          document.createElement("input");

        input.type =
          "number";

        input.inputMode =
          "numeric";

        input.autocomplete =
          "off";

        input.style.width =
          "100%";

        input.style.maxWidth =
          "300px";

        input.style.padding =
          "15px";

        input.style.marginTop =
          "20px";

        input.style.borderRadius =
          "12px";

        input.style.border =
          "1px solid rgba(255,255,255,.1)";

        input.style.background =
          "#10131f";

        input.style.color =
          "#fff";

        const submit =
          createButton(
            "ANSWER"
          );

        submit.style.marginTop =
          "12px";

        const submitAnswer =
          () => {
            const value =
              Number(input.value);

            if (!Number.isFinite(value)) {
              showToast(
                "Enter a valid number."
              );

              return;
            }

            const correct =
              value === answer;

            registerAttempt(
              correct,
              correct
            );

            if (correct) {
              correctAnswers += 1;

              improveAttribute(
                "intelligence",
                1
              );
            }

            if (
              numberRound >=
              APP_CONFIG.numberRounds
            ) {
              finishGame(
                "🔢 Number Rush Complete",
                `${correctAnswers}/${APP_CONFIG.numberRounds} correct.`,
                40 +
                  correctAnswers * 18,
                correctAnswers >= 3
              );

              return;
            }

            runRound();
          };

        submit.addEventListener(
          "click",
          submitAnswer
        );

        input.addEventListener(
          "keydown",
          event => {
            if (
              event.key ===
              "Enter"
            ) {
              submitAnswer();
            }
          }
        );

        board.append(
          title,
          question,
          input,
          submit
        );

        setTimeout(
          () => input.focus(),
          50
        );
      };

    runRound();
  } catch (error) {
    console.error("Number game error:", error);
  }
}


/* ============================================================
   43. FOOTBALL IQ
   ============================================================ */

function startFootballGame() {
  try {
    const content =
      $("#gameContent");

    const screen =
      createGameScreen(
        "⚽ Football IQ",
        "Read the situation and choose the best football decision."
      );

    const board =
      createGameBoard();

    screen.append(
      board
    );

    content.appendChild(
      screen
    );

    footballRound =
      0;

    footballCorrect =
      0;

    const questions =
      shuffleArray(
        [...FOOTBALL_QUESTIONS]
      ).slice(
        0,
        APP_CONFIG.footballRounds
      );

    const runRound =
      () => {
        if (
          footballRound >=
          questions.length
        ) {
          const xp =
            60 +
            footballCorrect * 20;

          improveAttribute(
            "football",
            footballCorrect * 2
          );

          finishGame(
            "⚽ Football IQ Complete",
            `${footballCorrect}/${questions.length} correct football decisions.`,
            xp,
            footballCorrect >= 3
          );

          return;
        }

        const question =
          questions[footballRound];

        footballRound += 1;

        board.replaceChildren();

        const title =
          document.createElement("h3");

        title.textContent =
          `SITUATION ${footballRound}/${questions.length}`;

        const questionText =
          document.createElement("p");

        questionText.textContent =
          question.question;

        const options =
          document.createElement("div");

        options.style.display =
          "grid";

        options.style.gap =
          "10px";

        options.style.width =
          "100%";

        question.options.forEach(
          (option, index) => {
            const button =
              createButton(
                option,
                "btn btn-ghost"
              );

            button.addEventListener(
              "click",
              () => {
                const correct =
                  index ===
                  question.answer;

                registerAttempt(
                  correct,
                  correct
                );

                if (correct) {
                  footballCorrect += 1;

                  button.style.background =
                    "rgba(52,211,153,.2)";
                } else {
                  button.style.background =
                    "rgba(251,113,133,.2)";
                }

                setTimeout(
                  runRound,
                  450
                );
              }
            );

            options.appendChild(
              button
            );
          }
        );

        board.append(
          title,
          questionText,
          options
        );
      };

    runRound();
  } catch (error) {
    console.error("Football game error:", error);
  }
}


/* ============================================================
   44. WHO AM I
   ============================================================ */

function startWhoAmIGame() {
  try {
    const content =
      $("#gameContent");

    const screen =
      createGameScreen(
        "🎭 Who Am I?",
        "Answer honestly. ZIVO will build a fun personality profile from your choices."
      );

    const board =
      createGameBoard();

    screen.append(
      board
    );

    content.appendChild(
      screen
    );

    personalityScores = {
      speed: 0,
      strategy: 0,
      creativity: 0,
      leadership: 0
    };

    let round =
      0;

    const questions =
      [...PERSONALITY_QUESTIONS];

    const runRound =
      () => {
        if (
          round >=
          questions.length
        ) {
          showPersonalityResult(
            screen
          );

          return;
        }

        const question =
          questions[round];

        board.replaceChildren();

        const title =
          document.createElement("h3");

        title.textContent =
          `QUESTION ${round + 1}/${questions.length}`;

        const text =
          document.createElement("p");

        text.textContent =
          question.question;

        const options =
          document.createElement("div");

        options.style.display =
          "grid";

        options.style.gap =
          "10px";

        question.options.forEach(
          (option, index) => {
            const button =
              createButton(
                option,
                "btn btn-ghost"
              );

            button.addEventListener(
              "click",
              () => {
                registerAttempt(
                  true,
                  true
                );

                applyPersonalityChoice(
                  round,
                  index
                );

                round += 1;

                setTimeout(
                  runRound,
                  350
                );
              }
            );

            options.appendChild(
              button
            );
          }
        );

        board.append(
          title,
          text,
          options
        );
      };

    runRound();
  } catch (error) {
    console.error("Who Am I game error:", error);
  }
}


function applyPersonalityChoice(
  questionIndex,
  optionIndex
) {
  try {
    const mappings = [
      ["speed", "strategy", "creativity", "leadership"],
      ["leadership", "strategy", "creativity", "speed"],
      ["speed", "strategy", "creativity", "leadership"],
      ["speed", "accuracy", "creativity", "strategy"],
      ["leadership", "strategy", "creativity", "strategy"],
      ["speed", "focus", "creativity", "strategy"]
    ];

    const mapping =
      mappings[questionIndex];

    const result =
      mapping
        ? mapping[optionIndex]
        : "strategy";

    if (
      Object.prototype.hasOwnProperty.call(
        personalityScores,
        result
      )
    ) {
      personalityScores[result] += 1;
    }

    if (result === "speed") {
      improveAttribute(
        "speed",
        1
      );
    }

    if (result === "strategy") {
      improveAttribute(
        "logic",
        1
      );
    }

    if (result === "creativity") {
      improveAttribute(
        "intelligence",
        1
      );
    }

    if (result === "leadership") {
      improveAttribute(
        "football",
        1
      );
    }
  } catch (error) {
    console.error(
      "Personality scoring error:",
      error
    );
  }
}


function showPersonalityResult(screen) {
  try {
    const winner =
      Object.entries(
        personalityScores
      ).sort(
        (a, b) => b[1] - a[1]
      )[0][0];

    const titles = {
      speed: "⚡ THE SPEED THINKER",
      strategy: "🧠 THE STRATEGIST",
      creativity: "🎨 THE CREATOR",
      leadership: "👑 THE LEADER"
    };

    const descriptions = {
      speed:
        "You tend to make quick decisions and enjoy fast challenges.",

      strategy:
        "You naturally analyze situations and look for the smartest route.",

      creativity:
        "You like exploring different possibilities and unusual solutions.",

      leadership:
        "You enjoy responsibility, competition and influencing the outcome."
    };

    const board =
      screen.querySelector(
        ".game-board"
      );

    if (board) {
      board.replaceChildren();

      const title =
        document.createElement("h2");

      title.textContent =
        titles[winner];

      const description =
        document.createElement("p");

      description.textContent =
        descriptions[winner];

      const note =
        document.createElement("small");

      note.textContent =
        "Entertainment result only — not a psychological diagnosis.";

      const button =
        createButton(
          "FINISH"
        );

      button.addEventListener(
        "click",
        () => {
          finishGame(
            "🎭 Personality Complete",
            "Your ZIVO personality profile has been created.",
            90,
            true
          );
        }
      );

      board.append(
        title,
        description,
        note,
        button
      );
    }
  } catch (error) {
    console.error(
      "Personality result error:",
      error
    );
  }
}


/* ============================================================
   45. SHUFFLE
   ============================================================ */

function shuffleArray(array) {
  try {
    const result =
      [...array];

    for (
      let i = result.length - 1;
      i > 0;
      i -= 1
    ) {
      const j =
        Math.floor(
          Math.random() *
            (i + 1)
        );

      [
        result[i],
        result[j]
      ] = [
        result[j],
        result[i]
      ];
    }

    return result;
  } catch (error) {
    console.error("Shuffle error:", error);

    return array;
  }
}


/* ============================================================
   46. BATTLE SYSTEM
   ============================================================ */

function startBattle() {
  try {
    const button =
      $("#battleBtn");

    if (!button) {
      return;
    }

    button.disabled =
      true;

    button.textContent =
      "🔎 SEARCHING...";

    const opponentNames = [
      "Shadow Player",
      "ZIVO Ninja",
      "Brain Hunter",
      "Speed Runner",
      "Football Mind",
      "Focus Beast"
    ];

    const opponent =
      opponentNames[
        Math.floor(
          Math.random() *
            opponentNames.length
        )
      ];

    const delay =
      1500 +
      Math.random() * 1500;

    gameTimeout =
      setTimeout(
        () => {
          try {
            const opponentPower =
              30 +
              Math.floor(
                Math.random() *
                  70
              );

            const yourPower =
              Math.round(
                (
                  player.attributes.intelligence +
                  player.attributes.speed +
                  player.attributes.focus +
                  player.attributes.football
                ) / 4
              );

            const won =
              yourPower >=
              opponentPower;

            button.textContent =
              won
                ? "🏆 YOU WON"
                : "😤 TRY AGAIN";

            button.disabled =
              false;

            registerAttempt(
              won,
              won
            );

            if (won) {
              awardXP(
                75,
                "Battle victory"
              );

              improveAttribute(
                "speed",
                1
              );
            } else {
              showToast(
                `You lost to ${opponent}. Power: ${opponentPower}`
              );
            }

            const opponentName =
              document.querySelector(
                ".battle-box .fighter:nth-of-type(2) b"
              );

            if (opponentName) {
              opponentName.textContent =
                opponent;
            }

            const opponentStatus =
              document.querySelector(
                ".battle-box .fighter:nth-of-type(2) small"
              );

            if (opponentStatus) {
              opponentStatus.textContent =
                won
                  ? "DEFEATED"
                  : "WINNER";
            }

            setTimeout(
              () => {
                button.textContent =
                  "⚔️ FIND BATTLE";
              },
              2500
            );
          } catch (error) {
            console.error(
              "Battle result error:",
              error
            );

            button.disabled =
              false;

            button.textContent =
              "⚔️ FIND BATTLE";
          }
        },
        delay
      );
  } catch (error) {
    console.error("Battle error:", error);

    if (button) {
      button.disabled =
        false;

      button.textContent =
        "⚔️ FIND BATTLE";
    }
  }
}


/* ============================================================
   47. PROFILE SAVE
   ============================================================ */

function handleProfileSubmit(event) {
  try {
    event.preventDefault();

    const nameInput =
      $("#nameInput");

    const countryInput =
      $("#countryInput");

    if (!nameInput || !countryInput) {
      throw new Error(
        "Profile form fields are missing."
      );
    }

    const name =
      sanitizeName(
        nameInput.value
      );

    const country =
      sanitizeCountry(
        countryInput.value
      );

    if (
      name.length <
      APP_CONFIG.minNameLength
    ) {
      showToast(
        `Name must contain at least ${APP_CONFIG.minNameLength} characters.`
      );

      nameInput.focus();

      return;
    }

    player.name =
      name;

    player.country =
      country;

    player.updatedAt =
      new Date().toISOString();

    savePlayer();

    updateUI();

    closeProfileModal();

    showToast(
      "✅ ZIVO profile saved."
    );
  } catch (error) {
    console.error(
      "Profile submit error:",
      error
    );

    showToast(
      "Could not save your profile."
    );
  }
}


/* ============================================================
   48. NAVIGATION
   ============================================================ */

function setupNavigation() {
  try {
    const menuButton =
      $("#menuBtn");

    const nav =
      $("#mainNav");

    if (
      menuButton &&
      nav
    ) {
      menuButton.addEventListener(
        "click",
        () => {
          const open =
            nav.classList.toggle(
              "open"
            );

          menuButton.setAttribute(
            "aria-expanded",
            String(open)
          );
        }
      );

      nav.querySelectorAll("a")
        .forEach(link => {
          link.addEventListener(
            "click",
            () => {
              nav.classList.remove(
                "open"
              );

              menuButton.setAttribute(
                "aria-expanded",
                "false"
              );
            }
          );
        });
    }

    $$("[data-scroll]")
      .forEach(button => {
        button.addEventListener(
          "click",
          () => {
            try {
              const target =
                button.dataset.scroll;

              if (!target) {
                return;
              }

              const element =
                document.querySelector(
                  target
                );

              if (!element) {
                return;
              }

              element.scrollIntoView({
                behavior: "smooth",
                block: "start"
              });
            } catch (error) {
              console.error(
                "Scroll error:",
                error
              );
            }
          }
        );
      });
  } catch (error) {
    console.error(
      "Navigation setup error:",
      error
    );
  }
}


/* ============================================================
   49. GAME BUTTONS
   ============================================================ */

function setupGameButtons() {
  try {
    $$(".game-start")
      .forEach(button => {
        button.addEventListener(
          "click",
          () => {
            try {
              const gameCard =
                button.closest(
                  "[data-game]"
                );

              const gameName =
                button.dataset.game ||
                gameCard?.dataset.game;

              if (!gameName) {
                throw new Error(
                  "Game name is missing."
                );
              }

              startGame(
                gameName
              );
            } catch (error) {
              console.error(
                "Game button error:",
                error
              );
            }
          }
        );
      });
  } catch (error) {
    console.error(
      "Game button setup error:",
      error
    );
  }
}


/* ============================================================
   50. MODAL EVENTS
   ============================================================ */

function setupModals() {
  try {
    const modalClose =
      $("#modalClose");

    const profileClose =
      $("#profileModalClose");

    const editProfile =
      $("#editProfileBtn");

    const profileForm =
      $("#profileForm");

    if (modalClose) {
      modalClose.addEventListener(
        "click",
        closeGameModal
      );
    }

    if (profileClose) {
      profileClose.addEventListener(
        "click",
        closeProfileModal
      );
    }

    if (editProfile) {
      editProfile.addEventListener(
        "click",
        openProfileModal
      );
    }

    if (profileForm) {
      profileForm.addEventListener(
        "submit",
        handleProfileSubmit
      );
    }

    const gameModal =
      $("#gameModal");

    if (gameModal) {
      gameModal.addEventListener(
        "cancel",
        event => {
          event.preventDefault();

          closeGameModal();
        }
      );
    }

    const profileModal =
      $("#profileModal");

    if (profileModal) {
      profileModal.addEventListener(
        "cancel",
        event => {
          event.preventDefault();

          closeProfileModal();
        }
      );
    }
  } catch (error) {
    console.error(
      "Modal setup error:",
      error
    );
  }
}


/* ============================================================
   51. ADVERTISEMENT
   ============================================================ */

function setupAdvertisement() {
  try {
    const adSlot =
      $("#adSlot");

    const closeButton =
      adSlot?.querySelector(
        ".ad-close"
      );

    if (
      !adSlot ||
      !closeButton
    ) {
      return;
    }

    closeButton.addEventListener(
      "click",
      () => {
        adSlot.style.display =
          "none";
      }
    );
  } catch (error) {
    console.error(
      "Advertisement setup error:",
      error
    );
  }
}


/* ============================================================
   52. DAILY BUTTON
   ============================================================ */

function setupDailyButton() {
  try {
    const button =
      $("#dailyBtn");

    if (!button) {
      return;
    }

    button.addEventListener(
      "click",
      () => {
        try {
          if (
            player.dailyCompleted >=
            APP_CONFIG.dailyTotal
          ) {
            showToast(
              "🔥 You already completed today's Daily ZIVO."
            );

            return;
          }

          startGame(
            "logic"
          );
        } catch (error) {
          console.error(
            "Daily button error:",
            error
          );
        }
      }
    );
  } catch (error) {
    console.error(
      "Daily setup error:",
      error
    );
  }
}


/* ============================================================
   53. HEADER PLAY
   ============================================================ */

function setupHeaderPlay() {
  try {
    const button =
      $("#headerPlayBtn");

    if (!button) {
      return;
    }

    button.addEventListener(
      "click",
      () => {
        const games =
          [
            "reaction",
            "memory",
            "focus",
            "logic",
            "accuracy",
            "numbers",
            "football",
            "whoami"
          ];

        const randomGame =
          games[
            Math.floor(
              Math.random() *
                games.length
            )
          ];

        startGame(
          randomGame
        );
      }
    );
  } catch (error) {
    console.error(
      "Header play setup error:",
      error
    );
  }
}


/* ============================================================
   54. LEADERBOARD TABS
   ============================================================ */

function setupLeaderboardTabs() {
  try {
    $$("[data-board]")
      .forEach(button => {
        button.addEventListener(
          "click",
          () => {
            try {
              $$("[data-board]")
                .forEach(tab =>
                  tab.classList.remove(
                    "active"
                  )
                );

              button.classList.add(
                "active"
              );

              renderLeaderboard(
                button.dataset.board
              );
            } catch (error) {
              console.error(
                "Leaderboard tab error:",
                error
              );
            }
          }
        );
      });
  } catch (error) {
    console.error(
      "Leaderboard tabs setup error:",
      error
    );
  }
}


/* ============================================================
   55. GLOBAL KEYBOARD SHORTCUTS
   ============================================================ */

function setupKeyboard() {
  try {
    document.addEventListener(
      "keydown",
      event => {
        try {
          if (
            event.key ===
            "Escape"
          ) {
            closeGameModal();
            closeProfileModal();
          }
        } catch (error) {
          console.error(
            "Keyboard event error:",
            error
          );
        }
      }
    );
  } catch (error) {
    console.error(
      "Keyboard setup error:",
      error
    );
  }
}


/* ============================================================
   56. INIT
   ============================================================ */

function initializeZIVOZONE() {
  try {
    loadPlayer();

    setupNavigation();

    setupGameButtons();

    setupModals();

    setupAdvertisement();

    setupDailyButton();

    setupHeaderPlay();

    setupLeaderboardTabs();

    setupKeyboard();

    checkAchievements();

    updateUI();

    console.info(
      "ZIVOZONE initialized successfully."
    );
  } catch (error) {
    console.error(
      "ZIVOZONE initialization failed:",
      error
    );

    showToast(
      "ZIVOZONE loaded with limited functionality."
    );
  }
}


/* ============================================================
   57. START APPLICATION
   ============================================================ */

if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    initializeZIVOZONE,
    {
      once: true
    }
  );
} else {
  initializeZIVOZONE();
}
