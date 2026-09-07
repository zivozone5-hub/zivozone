/* ============================================================
   ZIVOZONE AUTHENTICATION
   Firebase Compat - Stable GitHub Pages Version
============================================================ */

(function () {

    "use strict";


    /* ========================================================
       FIREBASE CONFIG
    ======================================================== */

    const firebaseConfig = {

        apiKey:
            "AIzaSyCHTz-ENxa930vgzKcHaH7Ybcax2R_024s",

        authDomain:
            "zivozone-fc6ed.firebaseapp.com",

        projectId:
            "zivozone-fc6ed",

        storageBucket:
            "zivozone-fc6ed.firebasestorage.app",

        messagingSenderId:
            "169366383094",

        appId:
            "1:169366383094:web:5875e8d24b1c543e4a7fd7",

        measurementId:
            "G-ZXW8LP39JY"

    };


    /* ========================================================
       GLOBAL STATUS
    ======================================================== */

    window.ZIVOZONE_FIREBASE_CONFIG =
        firebaseConfig;


    let firebaseApp = null;

    let auth = null;

    let db = null;


    /* ========================================================
       FIREBASE INITIALIZATION
    ======================================================== */

    function initializeFirebase() {

        try {

            if (
                typeof firebase === "undefined"
            ) {

                throw new Error(
                    "Firebase SDK لم يتم تحميله."
                );

            }


            if (
                !firebase.apps.length
            ) {

                firebaseApp =
                    firebase.initializeApp(
                        firebaseConfig
                    );

            } else {

                firebaseApp =
                    firebase.app();

            }


            auth =
                firebase.auth();


            db =
                firebase.firestore();


            window.ZIVOZONE_FIREBASE_READY =
                true;


            console.log(
                "🔥 ZIVOZONE Firebase initialized successfully."
            );


            return true;

        } catch (error) {

            console.error(
                "ZIVOZONE Firebase initialization error:",
                error
            );


            window.ZIVOZONE_FIREBASE_READY =
                false;


            window.dispatchEvent(
                new CustomEvent(
                    "zivozone-firebase-error",
                    {
                        detail: error
                    }
                )
            );


            return false;

        }

    }


    const firebaseReady =
        initializeFirebase();


    /* ========================================================
       DEFAULT PLAYER
    ======================================================== */

    const DEFAULT_PLAYER = {

        level: 1,

        xp: 0,

        coins: 0,

        wins: 0,

        losses: 0,

        gamesPlayed: 0,

        streak: 0,

        age: null,

        language: "ar",

        role: "player"

    };


    /* ========================================================
       LOCAL FALLBACK
       
       إذا كان Firestore غير متاح،
       الحساب نفسه يبقى يعمل.
    ======================================================== */

    function localKey(uid) {

        return "zivozone_player_" + uid;

    }


    function getLocalPlayer(uid) {

        try {

            const raw =
                localStorage.getItem(
                    localKey(uid)
                );


            if (!raw) {

                return null;

            }


            return JSON.parse(raw);

        } catch {

            return null;

        }

    }


    function saveLocalPlayer(player) {

        try {

            if (
                player &&
                player.uid
            ) {

                localStorage.setItem(
                    localKey(player.uid),
                    JSON.stringify(player)
                );

            }

        } catch {

        }

    }


    /* ========================================================
       CREATE PLAYER
    ======================================================== */

    async function createPlayerProfile(
        user,
        extraData = {}
    ) {

        if (!user) {

            throw new Error(
                "لا يوجد لاعب صالح."
            );

        }


        const localPlayer =
            getLocalPlayer(user.uid);


        if (localPlayer) {

            return localPlayer;

        }


        const player = {

            ...DEFAULT_PLAYER,

            uid:
                user.uid,

            name:
                extraData.name ||
                user.displayName ||
                "ZIVO Player",

            email:
                user.email ||
                "",

            age:
                extraData.age ??
                null,

            language:
                extraData.language ||
                "ar",

            createdAt:
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()

        };


        /* ==============================================
           FIRESTORE
        =============================================== */

        if (db) {

            try {

                const ref =
                    db
                        .collection("users")
                        .doc(user.uid);


                const snap =
                    await ref.get();


                if (snap.exists) {

                    const existing = {

                        uid:
                            user.uid,

                        ...snap.data()

                    };


                    saveLocalPlayer(
                        existing
                    );


                    return existing;

                }


                await ref.set(
                    player
                );


                saveLocalPlayer(
                    player
                );


                return player;

            } catch (error) {

                console.warn(
                    "Firestore unavailable:",
                    error
                );

            }

        }


        saveLocalPlayer(
            player
        );


        return player;

    }


    /* ========================================================
       REGISTER
    ======================================================== */

    async function registerPlayer({
        name,
        email,
        password,
        age,
        language = "ar"
    }) {

        if (!firebaseReady || !auth) {

            throw new Error(
                "نظام الحسابات غير متاح حاليًا. أعد تحميل الصفحة."
            );

        }


        if (
            !name ||
            name.trim().length < 2
        ) {

            throw new Error(
                "اكتب اسم اللاعب."
            );

        }


        if (
            !email ||
            !email.includes("@")
        ) {

            throw new Error(
                "أدخل بريدًا إلكترونيًا صحيحًا."
            );

        }


        if (
            !password ||
            password.length < 6
        ) {

            throw new Error(
                "كلمة المرور يجب أن تكون 6 أحرف على الأقل."
            );

        }


        const numericAge =
            Number(age);


        if (
            !Number.isInteger(
                numericAge
            ) ||
            numericAge < 5 ||
            numericAge > 100
        ) {

            throw new Error(
                "أدخل عمرًا صحيحًا."
            );

        }


        try {

            const result =
                await auth.createUserWithEmailAndPassword(
                    email.trim().toLowerCase(),
                    password
                );


            const user =
                result.user;


            await user.updateProfile({

                displayName:
                    name.trim()

            });


            const player =
                await createPlayerProfile(
                    user,
                    {
                        name:
                            name.trim(),

                        age:
                            numericAge,

                        language

                    }
                );


            dispatchAuth(
                true,
                user,
                player
            );


            return {

                success: true,

                user,

                player

            };

        } catch (error) {

            console.error(
                "Register error:",
                error
            );


            throw new Error(
                translateError(
                    error
                )
            );

        }

    }


    /* ========================================================
       LOGIN
    ======================================================== */

    async function loginPlayer(
        email,
        password
    ) {

        if (!firebaseReady || !auth) {

            throw new Error(
                "نظام الحسابات غير متاح حاليًا."
            );

        }


        try {

            const result =
                await auth.signInWithEmailAndPassword(
                    email.trim().toLowerCase(),
                    password
                );


            const user =
                result.user;


            const player =
                await createPlayerProfile(
                    user
                );


            dispatchAuth(
                true,
                user,
                player
            );


            return {

                success: true,

                user,

                player

            };

        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            throw new Error(
                translateError(
                    error
                )
            );

        }

    }


    /* ========================================================
       LOGOUT
    ======================================================== */

    async function logoutPlayer() {

        if (!auth) {

            return;

        }


        await auth.signOut();


        dispatchAuth(
            false,
            null,
            null
        );

    }


    /* ========================================================
       CURRENT PLAYER
    ======================================================== */

    async function getCurrentPlayer() {

        if (!auth) {

            return null;

        }


        const user =
            auth.currentUser;


        if (!user) {

            return null;

        }


        return await createPlayerProfile(
            user
        );

    }


    /* ========================================================
       UPDATE PLAYER
    ======================================================== */

    async function updatePlayerData(
        changes
    ) {

        const user =
            auth &&
            auth.currentUser;


        if (!user) {

            return null;

        }


        let player =
            await createPlayerProfile(
                user
            );


        player = {

            ...player,

            ...changes,

            uid:
                user.uid,

            updatedAt:
                new Date().toISOString()

        };


        saveLocalPlayer(
            player
        );


        if (db) {

            try {

                await db
                    .collection("users")
                    .doc(user.uid)
                    .set(
                        player,
                        {
                            merge: true
                        }
                    );

            } catch (error) {

                console.warn(
                    "Player cloud update failed:",
                    error
                );

            }

        }


        dispatchAuth(
            true,
            user,
            player
        );


        return player;

    }


    /* ========================================================
       ADD XP
    ======================================================== */

    async function addXP(
        amount = 0
    ) {

        const player =
            await getCurrentPlayer();


        if (!player) {

            return null;

        }


        let xp =
            Number(player.xp || 0)
            +
            Number(amount || 0);


        let level =
            Number(player.level || 1);


        while (
            xp >= level * 100
        ) {

            xp -= level * 100;

            level++;

        }


        return await updatePlayerData({

            xp,

            level

        });

    }


    /* ========================================================
       ADD COINS
    ======================================================== */

    async function addCoins(
        amount = 0
    ) {

        const player =
            await getCurrentPlayer();


        if (!player) {

            return null;

        }


        return await updatePlayerData({

            coins:
                Number(
                    player.coins || 0
                )
                +
                Number(amount || 0)

        });

    }


    /* ========================================================
       AUTH EVENT
    ======================================================== */

    function dispatchAuth(
        loggedIn,
        user,
        player
    ) {

        window.dispatchEvent(

            new CustomEvent(
                "zivozone-auth",
                {
                    detail: {

                        loggedIn,

                        user,

                        player

                    }
                }
            )

        );

    }


    /* ========================================================
       ERROR TRANSLATOR
    ======================================================== */

    function translateError(
        error
    ) {

        if (!error) {

            return "حدث خطأ غير معروف.";

        }


        switch (
            error.code
        ) {

            case "auth/email-already-in-use":

                return "هذا البريد مستخدم مسبقًا.";

            case "auth/invalid-email":

                return "البريد الإلكتروني غير صحيح.";

            case "auth/weak-password":

                return "كلمة المرور ضعيفة.";

            case "auth/invalid-credential":

                return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";

            case "auth/user-not-found":

                return "الحساب غير موجود.";

            case "auth/wrong-password":

                return "كلمة المرور غير صحيحة.";

            case "auth/too-many-requests":

                return "محاولات كثيرة. حاول لاحقًا.";

            case "auth/network-request-failed":

                return "تعذر الاتصال بالإنترنت.";

            case "auth/operation-not-allowed":

                return "طريقة التسجيل غير مفعلة في Firebase.";

            default:

                return (
                    error.message ||
                    "حدث خطأ أثناء العملية."
                );

        }

    }


    /* ========================================================
       AUTH STATE
    ======================================================== */

    if (auth) {

        auth.onAuthStateChanged(
            async function (user) {

                if (user) {

                    try {

                        const player =
                            await createPlayerProfile(
                                user
                            );


                        dispatchAuth(
                            true,
                            user,
                            player
                        );

                    } catch (error) {

                        console.error(
                            error
                        );

                        dispatchAuth(
                            true,
                            user,
                            null
                        );

                    }

                } else {

                    dispatchAuth(
                        false,
                        null,
                        null
                    );

                }

            }
        );

    }


    /* ========================================================
       PUBLIC API
    ======================================================== */

    window.ZIVOZONE_AUTH = {

        registerPlayer,

        loginPlayer,

        logoutPlayer,

        getCurrentPlayer,

        updatePlayerData,

        addXP,

        addCoins

    };


    window.ZIVOZONE_FIREBASE = {

        app:
            firebaseApp,

        auth,

        db,

        config:
            firebaseConfig

    };


    /* ========================================================
       READY
    ======================================================== */

    window.dispatchEvent(

        new CustomEvent(
            "zivozone-auth-ready"
        )

    );


    console.log(
        "🚀 ZIVOZONE Authentication Ready"
    );


})();
