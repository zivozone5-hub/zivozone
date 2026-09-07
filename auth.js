/* ============================================================
   ZIVOZONE AUTH SYSTEM
   Firebase Authentication + Firestore
   ============================================================ */

(() => {
    "use strict";

    /*
     * يجب أن تكون إعدادات Firebase موجودة قبل هذا الملف
     * أو يتم وضعها هنا من Firebase Console.
     *
     * لا تضع أي مفاتيح سرية أو Service Account هنا.
     */

    const firebaseConfig = window.ZIVOZONE_FIREBASE_CONFIG;

    if (!firebaseConfig) {
        console.error(
            "ZIVOZONE: Firebase configuration is missing."
        );
        return;
    }

    let auth = null;
    let db = null;

    let currentUser = null;
    let currentPlayer = null;


    /* ---------------------------------------------------------
       FIREBASE INITIALIZATION
       --------------------------------------------------------- */

    async function initializeFirebase() {

        try {

            if (!window.firebase) {
                throw new Error(
                    "Firebase SDK لم يتم تحميله."
                );
            }

            if (!firebase.apps.length) {
                firebase.initializeApp(
                    firebaseConfig
                );
            }

            auth =
                firebase.auth();

            db =
                firebase.firestore();

            /*
             * مراقبة حالة تسجيل الدخول
             */
            auth.onAuthStateChanged(
                async user => {

                    currentUser =
                        user || null;

                    if (user) {

                        try {

                            currentPlayer =
                                await loadPlayer(
                                    user.uid
                                );

                        } catch (error) {

                            console.error(
                                "Player loading error:",
                                error
                            );

                            currentPlayer =
                                null;
                        }

                    } else {

                        currentPlayer =
                            null;
                    }


                    dispatchAuthEvent();
                }
            );


            window.dispatchEvent(
                new CustomEvent(
                    "zivozone-auth-ready"
                )
            );


            console.log(
                "🔥 ZIVOZONE Firebase READY"
            );

        } catch (error) {

            console.error(
                "Firebase initialization failed:",
                error
            );
        }
    }


    /* ---------------------------------------------------------
       LOAD PLAYER
       --------------------------------------------------------- */

    async function loadPlayer(uid) {

        if (!db) {
            throw new Error(
                "Firestore غير جاهز."
            );
        }

        const snapshot =
            await db
                .collection("players")
                .doc(uid)
                .get();


        if (!snapshot.exists) {
            return null;
        }


        return {
            uid,
            ...snapshot.data()
        };
    }


    /* ---------------------------------------------------------
       REGISTER
       --------------------------------------------------------- */

    async function registerPlayer(data) {

        if (!auth || !db) {

            throw new Error(
                "نظام الحسابات غير جاهز."
            );
        }


        const name =
            String(data.name || "")
                .trim();


        const age =
            Number(data.age);


        const email =
            String(data.email || "")
                .trim()
                .toLowerCase();


        const password =
            String(data.password || "");


        if (name.length < 2) {

            throw new Error(
                "اكتب اسم اللاعب بشكل صحيح."
            );
        }


        if (
            !Number.isInteger(age) ||
            age < 5 ||
            age > 100
        ) {

            throw new Error(
                "العمر يجب أن يكون بين 5 و100 سنة."
            );
        }


        if (!email.includes("@")) {

            throw new Error(
                "البريد الإلكتروني غير صحيح."
            );
        }


        if (password.length < 6) {

            throw new Error(
                "كلمة المرور يجب أن تكون 6 أحرف على الأقل."
            );
        }


        try {

            const result =
                await auth.createUserWithEmailAndPassword(
                    email,
                    password
                );


            const user =
                result.user;


            const player = {

                uid: user.uid,

                name,

                age,

                email,

                language:
                    data.language || "ar",

                level: 1,

                xp: 0,

                coins: 0,

                wins: 0,

                gamesPlayed: 0,

                createdAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp(),

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()
            };


            await db
                .collection("players")
                .doc(user.uid)
                .set(player);


            currentUser =
                user;


            currentPlayer =
                player;


            dispatchAuthEvent();


            return player;


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );


            if (
                error.code ===
                "auth/email-already-in-use"
            ) {

                throw new Error(
                    "هذا البريد مستخدم مسبقًا. جرّب تسجيل الدخول."
                );
            }


            if (
                error.code ===
                "auth/invalid-email"
            ) {

                throw new Error(
                    "البريد الإلكتروني غير صحيح."
                );
            }


            if (
                error.code ===
                "auth/weak-password"
            ) {

                throw new Error(
                    "كلمة المرور ضعيفة."
                );
            }


            throw new Error(
                error.message ||
                "تعذر إنشاء الحساب."
            );
        }
    }


    /* ---------------------------------------------------------
       LOGIN
       --------------------------------------------------------- */

    async function loginPlayer(
        email,
        password
    ) {

        if (!auth) {

            throw new Error(
                "نظام الحسابات غير جاهز."
            );
        }


        try {

            const result =
                await auth.signInWithEmailAndPassword(
                    String(email)
                        .trim()
                        .toLowerCase(),
                    String(password)
                );


            currentUser =
                result.user;


            currentPlayer =
                await loadPlayer(
                    result.user.uid
                );


            dispatchAuthEvent();


            return currentPlayer;


        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            if (
                error.code ===
                "auth/user-not-found"
            ) {

                throw new Error(
                    "لا يوجد حساب بهذا البريد."
                );
            }


            if (
                error.code ===
                "auth/wrong-password" ||
                error.code ===
                "auth/invalid-credential"
            ) {

                throw new Error(
                    "البريد أو كلمة المرور غير صحيحة."
                );
            }


            throw new Error(
                "تعذر تسجيل الدخول."
            );
        }
    }


    /* ---------------------------------------------------------
       LOGOUT
       --------------------------------------------------------- */

    async function logoutPlayer() {

        if (!auth) {
            return;
        }


        await auth.signOut();


        currentUser =
            null;


        currentPlayer =
            null;


        dispatchAuthEvent();
    }


    /* ---------------------------------------------------------
       UPDATE PLAYER
       --------------------------------------------------------- */

    async function updatePlayer(updates) {

        if (!currentUser) {

            throw new Error(
                "يجب تسجيل الدخول أولًا."
            );
        }


        if (!db) {

            throw new Error(
                "قاعدة البيانات غير جاهزة."
            );
        }


        /*
         * نسمح فقط بالحقول التي يحتاجها نظام ZIVOZONE.
         * هذا يمنع تعديل حقول حساسة بشكل غير مقصود.
         */

        const allowedFields = [

            "name",
            "age",
            "language",
            "level",
            "xp",
            "coins",
            "wins",
            "gamesPlayed"
        ];


        const cleanUpdates = {};


        allowedFields.forEach(
            field => {

                if (
                    Object.prototype
                        .hasOwnProperty
                        .call(
                            updates,
                            field
                        )
                ) {

                    cleanUpdates[field] =
                        updates[field];
                }
            }
        );


        cleanUpdates.updatedAt =
            firebase.firestore
                .FieldValue
                .serverTimestamp();


        await db
            .collection("players")
            .doc(currentUser.uid)
            .update(cleanUpdates);


        currentPlayer = {

            ...currentPlayer,

            ...cleanUpdates
        };


        dispatchAuthEvent();


        return currentPlayer;
    }


    /* ---------------------------------------------------------
       AUTH EVENT
       --------------------------------------------------------- */

    function dispatchAuthEvent() {

        window.dispatchEvent(

            new CustomEvent(
                "zivozone-auth",
                {
                    detail: {
                        user:
                            currentUser,

                        player:
                            currentPlayer
                    }
                }
            )
        );
    }


    /* ---------------------------------------------------------
       PUBLIC API
       --------------------------------------------------------- */

    window.ZIVOZONE_AUTH = {

        registerPlayer,

        loginPlayer,

        logoutPlayer,

        updatePlayer,

        getCurrentUser:
            () => currentUser,

        getCurrentPlayer:
            () => currentPlayer,

        isLoggedIn:
            () => Boolean(currentUser)
    };


    /* ---------------------------------------------------------
       START
       --------------------------------------------------------- */

    initializeFirebase();

})();
