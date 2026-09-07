"use strict";

/*
 * ============================================================
 * ZIVOZONE - Core Application
 * Version: 1.0
 * نظام المستخدم + XP + Levels + ZIVO + Daily Challenges
 * ============================================================
 */

(function () {
    try {
        document.addEventListener("DOMContentLoaded", () => {
            ZivoZone.init();
        });
    } catch (error) {
        console.error("ZIVOZONE initialization error:", error);
    }
})();

/* ============================================================
   ZIVOZONE APPLICATION
   ============================================================ */

const ZivoZone = {

    STORAGE_KEY: "zivozone_player_v1",

    CONFIG: {
        startingXP: 0,
        startingZivo: 0,
        xpPerWin: 25,
        zivoPerWin: 10,
        dailyXP: 50,
        dailyZivo: 25
    },

    LANGUAGES: {
        ar: {
            name: "العربية",
            direction: "rtl"
        },
        en: {
            name: "English",
            direction: "ltr"
        },
        fr: {
            name: "Français",
            direction: "ltr"
        },
        es: {
            name: "Español",
            direction: "ltr"
        },
        tr: {
            name: "Türkçe",
            direction: "ltr"
        },
        de: {
            name: "Deutsch",
            direction: "ltr"
        }
    },

    LEVELS: [
        {
            level: 1,
            name: "المستكشف",
            minXP: 0
        },
        {
            level: 2,
            name: "المبتدئ",
            minXP: 100
        },
        {
            level: 3,
            name: "المتقدم",
            minXP: 250
        },
        {
            level: 4,
            name: "المحترف",
            minXP: 500
        },
        {
            level: 5,
            name: "الخبير",
            minXP: 900
        },
        {
            level: 6,
            name: "العبقري",
            minXP: 1500
        },
        {
            level: 7,
            name: "أسطورة ZIVO",
            minXP: 2500
        }
    ],

    player: null,

    /* ========================================================
       INIT
       ======================================================== */

    init() {

        try {

            this.loadPlayer();

            this.setupNavigation();
            this.setupProfile();
            this.setupLanguage();
            this.setupButtons();
            this.updateInterface();

            console.log("ZIVOZONE initialized successfully.");

        } catch (error) {

            console.error("ZIVOZONE init failed:", error);

            this.showNotification(
                "حدث خطأ أثناء تشغيل الموقع.",
                "error"
            );
        }
    },

    /* ========================================================
       PLAYER
       ======================================================== */

    createDefaultPlayer() {

        return {
            id: this.generatePlayerId(),

            name: "لاعب ZIVOZONE",

            email: "",

            age: null,

            language: "ar",

            xp: this.CONFIG.startingXP,

            zivo: this.CONFIG.startingZivo,

            wins: 0,

            gamesPlayed: 0,

            dailyChallengesCompleted: 0,

            currentStreak: 0,

            bestStreak: 0,

            lastLogin: null,

            lastDailyChallenge: null,

            createdAt: new Date().toISOString(),

            achievements: [],

            statistics: {
                intelligence: 0,
                reaction: 0,
                psychology: 0,
                knowledge: 0
            }
        };
    },

    generatePlayerId() {

        try {

            return (
                "ZIVO-" +
                Date.now().toString(36) +
                "-" +
                Math.random().toString(36).substring(2, 8)
            ).toUpperCase();

        } catch (error) {

            console.error("Player ID generation error:", error);

            return "ZIVO-" + Date.now();
        }
    },

    loadPlayer() {

        try {

            const savedData = localStorage.getItem(this.STORAGE_KEY);

            if (!savedData) {

                this.player = this.createDefaultPlayer();

                this.savePlayer();

                return;
            }

            const parsedData = JSON.parse(savedData);

            if (
                typeof parsedData !== "object" ||
                parsedData === null
            ) {

                throw new Error("Invalid player data.");
            }

            this.player = {
                ...this.createDefaultPlayer(),
                ...parsedData,

                statistics: {
                    ...this.createDefaultPlayer().statistics,
                    ...(parsedData.statistics || {})
                }
            };

            this.handleDailyLogin();

        } catch (error) {

            console.error("Player loading error:", error);

            this.player = this.createDefaultPlayer();

            this.savePlayer();
        }
    },

    savePlayer() {

        try {

            if (!this.player) {
                throw new Error("Player object does not exist.");
            }

            localStorage.setItem(
                this.STORAGE_KEY,
                JSON.stringify(this.player)
            );

            return true;

        } catch (error) {

            console.error("Player saving error:", error);

            this.showNotification(
                "تعذر حفظ بيانات اللاعب على هذا الجهاز.",
                "error"
            );

            return false;
        }
    },

    /* ========================================================
       LOGIN / PROFILE
       ======================================================== */

    registerPlayer(data) {

        try {

            if (!data || typeof data !== "object") {
                throw new Error("Invalid registration data.");
            }

            const name = String(data.name || "").trim();
            const email = String(data.email || "").trim();
            const age = Number(data.age);
            const language = String(data.language || "ar");

            if (name.length < 2) {

                this.showNotification(
                    "يرجى إدخال اسم صحيح.",
                    "error"
                );

                return false;
            }

            if (!this.validateEmail(email)) {

                this.showNotification(
                    "يرجى إدخال بريد إلكتروني صحيح.",
                    "error"
                );

                return false;
            }

            if (
                !Number.isInteger(age) ||
                age < 6 ||
                age > 100
            ) {

                this.showNotification(
                    "العمر يجب أن يكون بين 6 و100 سنة.",
                    "error"
                );

                return false;
            }

            if (!this.LANGUAGES[language]) {

                this.showNotification(
                    "اللغة المختارة غير مدعومة.",
                    "error"
                );

                return false;
            }

            this.player.name = name;
            this.player.email = email;
            this.player.age = age;
            this.player.language = language;

            this.savePlayer();

            this.applyLanguage(language);

            this.updateInterface();

            this.closeModal("registerModal");

            this.showNotification(
                `أهلاً ${name}! أهلاً بك في ZIVOZONE 🎮`,
                "success"
            );

            return true;

        } catch (error) {

            console.error("Registration error:", error);

            this.showNotification(
                "حدث خطأ أثناء إنشاء الملف.",
                "error"
            );

            return false;
        }
    },

    validateEmail(email) {

        try {

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

            return emailRegex.test(email);

        } catch (error) {

            console.error("Email validation error:", error);

            return false;
        }
    },

    /* ========================================================
       DAILY LOGIN
       ======================================================== */

    handleDailyLogin() {

        try {

            if (!this.player) {
                return;
            }

            const today = this.getDateKey();

            if (this.player.lastLogin === today) {
                return;
            }

            const previousDate = this.player.lastLogin;

            this.player.lastLogin = today;

            if (previousDate) {

                const yesterday = this.getDateKey(-1);

                if (previousDate === yesterday) {

                    this.player.currentStreak += 1;

                } else {

                    this.player.currentStreak = 1;
                }

            } else {

                this.player.currentStreak = 1;
            }

            if (
                this.player.currentStreak >
                this.player.bestStreak
            ) {

                this.player.bestStreak =
                    this.player.currentStreak;
            }

            this.savePlayer();

        } catch (error) {

            console.error("Daily login error:", error);
        }
    },

    /* ========================================================
       DATE
       ======================================================== */

    getDateKey(offsetDays = 0) {

        try {

            const date = new Date();

            date.setDate(
                date.getDate() + offsetDays
            );

            const year = date.getFullYear();

            const month = String(
                date.getMonth() + 1
            ).padStart(2, "0");

            const day = String(
                date.getDate()
            ).padStart(2, "0");

            return `${year}-${month}-${day}`;

        } catch (error) {

            console.error("Date key error:", error);

            return "";
        }
    },

    /* ========================================================
       XP SYSTEM
       ======================================================== */

    addXP(amount) {

        try {

            if (!Number.isFinite(amount) || amount <= 0) {
                return false;
            }

            const oldLevel =
                this.getCurrentLevel().level;

            this.player.xp += Math.floor(amount);

            const newLevel =
                this.getCurrentLevel().level;

            if (newLevel > oldLevel) {

                this.showNotification(
                    `🎉 مبروك! وصلت إلى المستوى ${newLevel}`,
                    "level"
                );

                this.unlockAchievement(
                    `الوصول إلى المستوى ${newLevel}`
                );
            }

            this.savePlayer();

            this.updateInterface();

            return true;

        } catch (error) {

            console.error("XP error:", error);

            return false;
        }
    },

    getCurrentLevel() {

        try {

            let currentLevel = this.LEVELS[0];

            for (const level of this.LEVELS) {

                if (this.player.xp >= level.minXP) {
                    currentLevel = level;
                }
            }

            return currentLevel;

        } catch (error) {

            console.error("Level calculation error:", error);

            return this.LEVELS[0];
        }
    },

    getNextLevel() {

        try {

            const current =
                this.getCurrentLevel();

            const index =
                this.LEVELS.findIndex(
                    level => level.level === current.level
                );

            if (
                index === -1 ||
                index === this.LEVELS.length - 1
            ) {
                return null;
            }

            return this.LEVELS[index + 1];

        } catch (error) {

            console.error("Next level error:", error);

            return null;
        }
    },

    getLevelProgress() {

        try {

            const current =
                this.getCurrentLevel();

            const next =
                this.getNextLevel();

            if (!next) {
                return 100;
            }

            const currentXP =
                this.player.xp - current.minXP;

            const requiredXP =
                next.minXP - current.minXP;

            if (requiredXP <= 0) {
                return 100;
            }

            return Math.min(
                100,
                Math.max(
                    0,
                    Math.round(
                        (currentXP / requiredXP) * 100
                    )
                )
            );

        } catch (error) {

            console.error("Progress calculation error:", error);

            return 0;
        }
    },

    /* ========================================================
       ZIVO COIN
       ======================================================== */

    addZivo(amount) {

        try {

            if (!Number.isFinite(amount) || amount <= 0) {
                return false;
            }

            this.player.zivo += Number(amount.toFixed(2));

            this.savePlayer();

            this.updateInterface();

            return true;

        } catch (error) {

            console.error("ZIVO transaction error:", error);

            return false;
        }
    },

    rewardPlayer(reward = {}) {

        try {

            const xp =
                Number(reward.xp || 0);

            const zivo =
                Number(reward.zivo || 0);

            const win =
                reward.win === true;

            if (xp > 0) {
                this.addXP(xp);
            }

            if (zivo > 0) {
                this.addZivo(zivo);
            }

            if (win) {
                this.player.wins += 1;
            }

            this.player.gamesPlayed += 1;

            this.savePlayer();

            this.updateInterface();

            return true;

        } catch (error) {

            console.error("Reward error:", error);

            return false;
        }
    },

    /* ========================================================
       GAME COMPLETED
       ======================================================== */

    completeGame(category = "knowledge", won = false) {

        try {

            const allowedCategories = [
                "intelligence",
                "reaction",
                "psychology",
                "knowledge"
            ];

            if (
                !allowedCategories.includes(category)
            ) {

                category = "knowledge";
            }

            const xpReward =
                won
                    ? this.CONFIG.xpPerWin
                    : 5;

            const zivoReward =
                won
                    ? this.CONFIG.zivoPerWin
                    : 1;

            this.rewardPlayer({
                xp: xpReward,
                zivo: zivoReward,
                win: won
            });

            this.player.statistics[category] +=
                won ? 1 : 0;

            this.savePlayer();

            this.showNotification(
                won
                    ? `🏆 فوز! +${xpReward} XP و +${zivoReward} ZIVO`
                    : `🎮 محاولة جيدة! +${xpReward} XP و +${zivoReward} ZIVO`,
                "success"
            );

            this.updateInterface();

        } catch (error) {

            console.error("Game completion error:", error);
        }
    },

    /* ========================================================
       DAILY CHALLENGE
       ======================================================== */

    canPlayDailyChallenge() {

        try {

            const today = this.getDateKey();

            return (
                this.player.lastDailyChallenge !== today
            );

        } catch (error) {

            console.error(
                "Daily challenge check error:",
                error
            );

            return false;
        }
    },

    completeDailyChallenge() {

        try {

            if (!this.canPlayDailyChallenge()) {

                this.showNotification(
                    "لقد أنهيت تحدي اليوم بالفعل. عد غداً 🔥",
                    "warning"
                );

                return false;
            }

            this.player.lastDailyChallenge =
                this.getDateKey();

            this.player.dailyChallengesCompleted += 1;

            this.addXP(this.CONFIG.dailyXP);

            this.addZivo(this.CONFIG.dailyZivo);

            this.unlockAchievement(
                "إكمال أول تحدي يومي"
            );

            this.savePlayer();

            this.showNotification(
                `🔥 تحدي اليوم مكتمل! +${this.CONFIG.dailyXP} XP و +${this.CONFIG.dailyZivo} ZIVO`,
                "success"
            );

            return true;

        } catch (error) {

            console.error(
                "Daily challenge completion error:",
                error
            );

            return false;
        }
    },

    /* ========================================================
       ACHIEVEMENTS
       ======================================================== */

    unlockAchievement(name) {

        try {

            if (!name) {
                return false;
            }

            if (
                this.player.achievements.includes(name)
            ) {
                return false;
            }

            this.player.achievements.push(name);

            this.savePlayer();

            this.showNotification(
                `🏅 إنجاز جديد: ${name}`,
                "achievement"
            );

            return true;

        } catch (error) {

            console.error(
                "Achievement error:",
                error
            );

            return false;
        }
    },

    /* ========================================================
       AGE-BASED DIFFICULTY
       ======================================================== */

    getDifficulty() {

        try {

            const age =
                Number(this.player.age || 18);

            const level =
                this.getCurrentLevel().level;

            if (age <= 9) {

                return Math.min(
                    2,
                    Math.max(1, level)
                );
            }

            if (age <= 13) {

                return Math.min(
                    4,
                    Math.max(1, level)
                );
            }

            if (age <= 17) {

                return Math.min(
                    6,
                    Math.max(1, level)
                );
            }

            return Math.min(
                7,
                Math.max(1, level)
            );

        } catch (error) {

            console.error(
                "Difficulty calculation error:",
                error
            );

            return 1;
        }
    },

    /* ========================================================
       USER INTERFACE
       ======================================================== */

    updateInterface() {

        try {

            if (!this.player) {
                return;
            }

            const level =
                this.getCurrentLevel();

            const progress =
                this.getLevelProgress();

            this.setText(
                [
                    "#playerName",
                    "[data-player-name]"
                ],
                this.player.name
            );

            this.setText(
                [
                    "#playerEmail",
                    "[data-player-email]"
                ],
                this.player.email || "لم يتم إضافة البريد"
            );

            this.setText(
                [
                    "#playerXP",
                    "[data-xp]"
                ],
                this.player.xp
            );

            this.setText(
                [
                    "#playerZivo",
                    "[data-zivo]"
                ],
                this.formatNumber(this.player.zivo)
            );

            this.setText(
                [
                    "#playerLevel",
                    "[data-level]"
                ],
                level.level
            );

            this.setText(
                [
                    "#playerLevelName",
                    "[data-level-name]"
                ],
                level.name
            );

            this.setText(
                [
                    "#playerWins",
                    "[data-wins]"
                ],
                this.player.wins
            );

            this.setText(
                [
                    "#playerGames",
                    "[data-games]"
                ],
                this.player.gamesPlayed
            );

            this.setText(
                [
                    "#playerStreak",
                    "[data-streak]"
                ],
                this.player.currentStreak
            );

            this.setProgress(
                [
                    "#xpProgress",
                    "[data-xp-progress]"
                ],
                progress
            );

            this.setText(
                [
                    "#difficulty",
                    "[data-difficulty]"
                ],
                this.getDifficulty()
            );

            this.updateDailyButton();

        } catch (error) {

            console.error(
                "Interface update error:",
                error
            );
        }
    },

    setText(selectors, value) {

        try {

            for (const selector of selectors) {

                const elements =
                    document.querySelectorAll(selector);

                elements.forEach(element => {

                    element.textContent =
                        String(value ?? "");

                });
            }

        } catch (error) {

            console.error(
                "Text update error:",
                error
            );
        }
    },

    setProgress(selectors, value) {

        try {

            const safeValue =
                Math.min(
                    100,
                    Math.max(0, Number(value) || 0)
                );

            for (const selector of selectors) {

                const elements =
                    document.querySelectorAll(selector);

                elements.forEach(element => {

                    element.style.width =
                        `${safeValue}%`;

                    element.setAttribute(
                        "aria-valuenow",
                        String(safeValue)
                    );
                });
            }

        } catch (error) {

            console.error(
                "Progress update error:",
                error
            );
        }
    },

    formatNumber(number) {

        try {

            return new Intl.NumberFormat(
                this.player?.language || "ar"
            ).format(number);

        } catch (error) {

            return String(number);
        }
    },

    /* ========================================================
       NAVIGATION
       ======================================================== */

    setupNavigation() {

        try {

            const links =
                document.querySelectorAll(
                    "[data-section], .nav-link, .menu-link"
                );

            links.forEach(link => {

                link.addEventListener(
                    "click",
                    event => {

                        const target =
                            link.dataset.section ||
                            link.getAttribute("href");

                        if (
                            !target ||
                            target === "#"
                        ) {
                            return;
                        }

                        const section =
                            document.querySelector(target);

                        if (!section) {
                            return;
                        }

                        event.preventDefault();

                        section.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });
                    }
                );
            });

        } catch (error) {

            console.error(
                "Navigation setup error:",
                error
            );
        }
    },

    /* ========================================================
       PROFILE
       ======================================================== */

    setupProfile() {

        try {

            const profileButtons =
                document.querySelectorAll(
                    "#profileBtn, [data-open-profile]"
                );

            profileButtons.forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        this.openModal("profileModal");

                        this.updateInterface();
                    }
                );
            });

            const registerButtons =
                document.querySelectorAll(
                    "#registerBtn, [data-register]"
                );

            registerButtons.forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        this.openModal("registerModal");
                    }
                );
            });

        } catch (error) {

            console.error(
                "Profile setup error:",
                error
            );
        }
    },

    /* ========================================================
       LANGUAGE
       ======================================================== */

    setupLanguage() {

        try {

            const selectors =
                document.querySelectorAll(
                    "#languageSelect, [data-language]"
                );

            selectors.forEach(select => {

                select.value =
                    this.player.language;

                select.addEventListener(
                    "change",
                    event => {

                        this.changeLanguage(
                            event.target.value
                        );
                    }
                );
            });

            this.applyLanguage(
                this.player.language
            );

        } catch (error) {

            console.error(
                "Language setup error:",
                error
            );
        }
    },

    changeLanguage(language) {

        try {

            if (!this.LANGUAGES[language]) {

                throw new Error(
                    "Unsupported language."
                );
            }

            this.player.language =
                language;

            this.savePlayer();

            this.applyLanguage(language);

            this.updateInterface();

        } catch (error) {

            console.error(
                "Language change error:",
                error
            );

            this.showNotification(
                "تعذر تغيير اللغة.",
                "error"
            );
        }
    },

    applyLanguage(language) {

        try {

            const languageData =
                this.LANGUAGES[language];

            if (!languageData) {
                return;
            }

            document.documentElement.lang =
                language;

            document.documentElement.dir =
                languageData.direction;

            document.body.dir =
                languageData.direction;

            document.querySelectorAll(
                "[data-lang-placeholder]"
            ).forEach(element => {

                const key =
                    element.dataset.langPlaceholder;

                const translations =
                    element.dataset[key];

                if (translations) {
                    element.placeholder =
                        translations;
                }
            });

        } catch (error) {

            console.error(
                "Language application error:",
                error
            );
        }
    },

    /* ========================================================
       BUTTONS
       ======================================================== */

    setupButtons() {

        try {

            /* Daily Challenge */

            document.querySelectorAll(
                "#dailyChallengeBtn, [data-daily-challenge]"
            ).forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        this.handleDailyChallengeClick();
                    }
                );
            });

            /* Game Buttons */

            document.querySelectorAll(
                "[data-game]"
            ).forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const game =
                            button.dataset.game;

                        this.startGame(game);
                    }
                );
            });

            /* Win Test Button
               مفيد أثناء بناء النسخة التجريبية */

            document.querySelectorAll(
                "[data-test-win]"
            ).forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        this.completeGame(
                            "knowledge",
                            true
                        );
                    }
                );
            });

            /* Modal close */

            document.querySelectorAll(
                "[data-close-modal]"
            ).forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const modal =
                            button.closest(".modal");

                        if (modal) {
                            modal.classList.remove(
                                "active"
                            );
                        }
                    }
                );
            });

            /* Register Form */

            const form =
                document.querySelector(
                    "#registerForm"
                );

            if (form) {

                form.addEventListener(
                    "submit",
                    event => {

                        event.preventDefault();

                        const formData =
                            new FormData(form);

                        this.registerPlayer({
                            name:
                                formData.get("name"),

                            email:
                                formData.get("email"),

                            age:
                                formData.get("age"),

                            language:
                                formData.get("language") ||
                                "ar"
                        });
                    }
                );
            }

        } catch (error) {

            console.error(
                "Button setup error:",
                error
            );
        }
    },

    /* ========================================================
       DAILY CHALLENGE CLICK
       ======================================================== */

    handleDailyChallengeClick() {

        try {

            if (!this.canPlayDailyChallenge()) {

                this.showNotification(
                    "تحدي اليوم مكتمل بالفعل 🔥",
                    "warning"
                );

                return;
            }

            /*
             * مؤقتاً:
             * عند الضغط يتم اعتبار التحدي مكتملاً.
             *
             * في المرحلة القادمة سنضع هنا:
             * سؤالاً حقيقياً
             * مؤقتاً زمنياً
             * إجابات
             * نقاط
             * نظام فوز/خسارة
             */

            const confirmed =
                window.confirm(
                    "هل أنت مستعد لتحدي اليوم؟"
                );

            if (!confirmed) {
                return;
            }

            this.completeDailyChallenge();

        } catch (error) {

            console.error(
                "Daily challenge click error:",
                error
            );
        }
    },

    /* ========================================================
       GAME SYSTEM
       ======================================================== */

    startGame(gameName) {

        try {

            if (!gameName) {

                this.showNotification(
                    "اللعبة غير محددة.",
                    "error"
                );

                return;
            }

            /*
             * هذه نقطة الربط الأساسية للألعاب.
             *
             * لاحقاً كل لعبة سيكون لها محرك خاص:
             *
             * intelligence
             * horror
             * psychology
             * reaction
             * knowledge
             */

            const games = {

                intelligence: "لعبة الذكاء",

                horror: "تجربة الرعب",

                psychology: "علم النفس",

                reaction: "اختبار سرعة الاستجابة",

                knowledge: "اختبار المعرفة",

                personality: "تحليل من أنا"

            };

            const gameTitle =
                games[gameName] || gameName;

            this.showNotification(
                `🎮 جاري تجهيز ${gameTitle}...`,
                "info"
            );

            /*
             * نرسل حدثاً عاماً يمكن لأي Game Engine
             * الاستماع إليه لاحقاً.
             */

            document.dispatchEvent(
                new CustomEvent(
                    "zivozone:game-start",
                    {
                        detail: {
                            game: gameName,

                            player: {
                                id: this.player.id,

                                age: this.player.age,

                                level:
                                    this.getCurrentLevel()
                                        .level,

                                xp: this.player.xp
                            }
                        }
                    }
                )
            );

        } catch (error) {

            console.error(
                "Game start error:",
                error
            );
        }
    },

    /* ========================================================
       MODALS
       ======================================================== */

    openModal(id) {

        try {

            const modal =
                document.getElementById(id);

            if (!modal) {
                return false;
            }

            modal.classList.add("active");

            return true;

        } catch (error) {

            console.error(
                "Open modal error:",
                error
            );

            return false;
        }
    },

    closeModal(id) {

        try {

            const modal =
                document.getElementById(id);

            if (!modal) {
                return false;
            }

            modal.classList.remove("active");

            return true;

        } catch (error) {

            console.error(
                "Close modal error:",
                error
            );

            return false;
        }
    },

    /* ========================================================
       DAILY BUTTON UI
       ======================================================== */

    updateDailyButton() {

        try {

            const buttons =
                document.querySelectorAll(
                    "#dailyChallengeBtn, [data-daily-challenge]"
                );

            const completed =
                !this.canPlayDailyChallenge();

            buttons.forEach(button => {

                button.disabled = completed;

                button.setAttribute(
                    "aria-disabled",
                    String(completed)
                );

                if (completed) {

                    button.textContent =
                        "✓ تحدي اليوم مكتمل";

                } else {

                    button.textContent =
                        "🔥 تحدي اليوم";
                }
            });

        } catch (error) {

            console.error(
                "Daily button update error:",
                error
            );
        }
    },

    /* ========================================================
       NOTIFICATIONS
       ======================================================== */

    showNotification(message, type = "info") {

        try {

            let container =
                document.getElementById(
                    "zivoNotifications"
                );

            if (!container) {

                container =
                    document.createElement("div");

                container.id =
                    "zivoNotifications";

                container.setAttribute(
                    "aria-live",
                    "polite"
                );

                container.style.position =
                    "fixed";

                container.style.top =
                    "20px";

                container.style.right =
                    "20px";

                container.style.zIndex =
                    "99999";

                container.style.display =
                    "flex";

                container.style.flexDirection =
                    "column";

                container.style.gap =
                    "10px";

                document.body.appendChild(
                    container
                );
            }

            const notification =
                document.createElement("div");

            notification.textContent =
                String(message);

            notification.dataset.type =
                type;

            notification.style.padding =
                "14px 18px";

            notification.style.borderRadius =
                "12px";

            notification.style.background =
                "#111827";

            notification.style.color =
                "#ffffff";

            notification.style.fontSize =
                "14px";

            notification.style.fontWeight =
                "600";

            notification.style.boxShadow =
                "0 10px 30px rgba(0,0,0,.25)";

            notification.style.maxWidth =
                "350px";

            notification.style.cursor =
                "pointer";

            notification.addEventListener(
                "click",
                () => {
                    notification.remove();
                }
            );

            container.appendChild(
                notification
            );

            window.setTimeout(
                () => {

                    if (
                        notification &&
                        notification.parentNode
                    ) {

                        notification.remove();
                    }

                },
                4500
            );

        } catch (error) {

            console.error(
                "Notification error:",
                error
            );
        }
    },

    /* ========================================================
       RESET PLAYER
       ======================================================== */

    resetPlayer() {

        try {

            const confirmed =
                window.confirm(
                    "هل أنت متأكد أنك تريد حذف تقدم اللاعب من هذا الجهاز؟"
                );

            if (!confirmed) {
                return false;
            }

            localStorage.removeItem(
                this.STORAGE_KEY
            );

            this.player =
                this.createDefaultPlayer();

            this.savePlayer();

            this.updateInterface();

            this.showNotification(
                "تم إنشاء ملف لاعب جديد.",
                "success"
            );

            return true;

        } catch (error) {

            console.error(
                "Reset player error:",
                error
            );

            return false;
        }
    },

    /* ========================================================
       EXPORT PLAYER DATA
       ======================================================== */

    exportPlayerData() {

        try {

            if (!this.player) {
                throw new Error(
                    "Player data unavailable."
                );
            }

            const safeData = {
                id: this.player.id,
                name: this.player.name,
                email: this.player.email,
                age: this.player.age,
                language: this.player.language,
                xp: this.player.xp,
                zivo: this.player.zivo,
                wins: this.player.wins,
                gamesPlayed: this.player.gamesPlayed,
                dailyChallengesCompleted:
                    this.player.dailyChallengesCompleted,
                currentStreak:
                    this.player.currentStreak,
                bestStreak:
                    this.player.bestStreak,
                statistics:
                    this.player.statistics,
                achievements:
                    this.player.achievements
            };

            const blob =
                new Blob(
                    [
                        JSON.stringify(
                            safeData,
                            null,
                            2
                        )
                    ],
                    {
                        type:
                            "application/json"
                    }
                );

            const url =
                URL.createObjectURL(blob);

            const anchor =
                document.createElement("a");

            anchor.href = url;

            anchor.download =
                "zivozone-player-data.json";

            document.body.appendChild(
                anchor
            );

            anchor.click();

            anchor.remove();

            URL.revokeObjectURL(url);

            this.showNotification(
                "تم تصدير بياناتك بنجاح.",
                "success"
            );

        } catch (error) {

            console.error(
                "Data export error:",
                error
            );

            this.showNotification(
                "تعذر تصدير البيانات.",
                "error"
            );
        }
    }
};

/* ============================================================
   GLOBAL ACCESS
   ============================================================ */

window.ZivoZone = ZivoZone;

/* ============================================================
   OPTIONAL GLOBAL HELPERS
   يمكن استدعاؤها من HTML
   ============================================================ */

window.startZivoGame = function (game) {

    try {

        ZivoZone.startGame(game);

    } catch (error) {

        console.error(
            "Global game function error:",
            error
        );
    }
};

window.completeZivoGame = function (
    category,
    won
) {

    try {

        ZivoZone.completeGame(
            category,
            Boolean(won)
        );

    } catch (error) {

        console.error(
            "Global game completion error:",
            error
        );
    }
};

window.addZivoXP = function (
    xp,
    zivo
) {

    try {

        if (Number(xp) > 0) {
            ZivoZone.addXP(
                Number(xp)
            );
        }

        if (Number(zivo) > 0) {
            ZivoZone.addZivo(
                Number(zivo)
            );
        }

    } catch (error) {

        console.error(
            "Global reward function error:",
            error
        );
    }
};
