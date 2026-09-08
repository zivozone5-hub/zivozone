/* ============================================================
   ZIVOZONE AUTH SYSTEM
   Firebase Authentication
   Guest Mode
   Firestore Player Profile
============================================================ */

(() => {

    "use strict";


    /* ========================================================
       CONFIG
    ======================================================== */

    const CONFIG =
        window.ZIVOZONE_FIREBASE_CONFIG;


    const LOCAL_KEY =
        "zivozone_player_cache_v6";


    /* ========================================================
       STATE
    ======================================================== */

    let firebaseReady = false;

    let authReady = false;

    let firestoreReady = false;

    let auth = null;

    let db = null;

    let currentUser = null;

    let currentPlayer = null;


    /* ========================================================
       DEFAULT PLAYER
    ======================================================== */

    function createDefaultPlayer(user = {}) {

        return {

            uid:
                user.uid || "",

            name:
                user.name || "لاعب ZIVO",

            age:
                Number(user.age) || 18,

            email:
                user.email || "",

            level:
                1,

            xp:
                0,

            coins:
                0,

            wins:
                0,

            gamesPlayed:
                0,

            language:
                "ar",

            createdAt:
                null

        };

    }


    /* ========================================================
       EVENTS
    ======================================================== */

    function emit() {

        window.dispatchEvent(

            new CustomEvent(
                "zivozone-auth",
                {
                    detail: {

                        user:
                            currentUser,

                        player:
                            currentPlayer,

                        ready:
                            authReady,

                        cloud:
                            firebaseReady,

                        firestore:
                            firestoreReady

                    }
                }
            )

        );

    }


    /* ========================================================
       LOCAL CACHE
    ======================================================== */

    function saveLocalCache() {

        try {

            localStorage.setItem(

                LOCAL_KEY,

                JSON.stringify({

                    user:
                        currentUser,

                    player:
                        currentPlayer

                })

            );

        } catch (error) {

            console.warn(
                "ZIVOZONE local cache error:",
                error
            );

        }

    }


    function loadLocalCache() {

        try {

            const raw =
                localStorage.getItem(LOCAL_KEY);

            if (!raw)
                return;

            const data =
                JSON.parse(raw);

            if (data?.user) {

                currentUser =
                    data.user;

                currentPlayer =
                    data.player ||
                    createDefaultPlayer(
                        data.user
                    );

            }

        } catch (error) {

            console.warn(
                "ZIVOZONE cache load error:",
                error
            );

        }

    }


    /* ========================================================
       FIREBASE INITIALIZATION
    ======================================================== */

    async function initFirebase() {

        if (
            !CONFIG ||
            !window.firebase
        ) {

            console.warn(
                "ZIVOZONE Firebase configuration unavailable."
            );

            return false;

        }


        try {

            if (!firebase.apps.length) {

                firebase.initializeApp(
                    CONFIG
                );

            }


            auth =
                firebase.auth();


            firebaseReady =
                true;


            try {

                db =
                    firebase.firestore();

                firestoreReady =
                    true;

            } catch (firestoreError) {

                console.warn(
                    "Firestore unavailable:",
                    firestoreError
                );

                db =
                    null;

                firestoreReady =
                    false;

            }


            try {

                await auth.setPersistence(
                    firebase.auth.Auth.Persistence.LOCAL
                );

            } catch (persistenceError) {

                console.warn(
                    "Auth persistence warning:",
                    persistenceError
                );

            }


            auth.onAuthStateChanged(
                handleAuthState
            );


            return true;

        } catch (error) {

            console.error(
                "Firebase initialization failed:",
                error
            );

            firebaseReady =
                false;

            return false;

        }

    }


    /* ========================================================
       AUTH STATE
    ======================================================== */

    async function handleAuthState(firebaseUser) {

        if (!firebaseUser) {

            currentUser =
                null;

            /*
             * لا نحذف الكاش مباشرة.
             * هذا يساعد الواجهة على الاستقرار.
             */

            currentPlayer =
                null;

            authReady =
                true;

            emit();

            return;

        }


        currentUser = {

            uid:
                firebaseUser.uid,

            email:
                firebaseUser.email || "",

            emailVerified:
                !!firebaseUser.emailVerified

        };


        currentPlayer =
            createDefaultPlayer(
                currentUser
            );


        /* ====================================================
           FIRESTORE PROFILE
        ==================================================== */

        if (
            db &&
            firestoreReady
        ) {

            try {

                const snapshot =
                    await db
                        .collection("players")
                        .doc(firebaseUser.uid)
                        .get();


                if (snapshot.exists) {

                    currentPlayer = {

                        ...createDefaultPlayer(
                            currentUser
                        ),

                        ...snapshot.data(),

                        uid:
                            firebaseUser.uid,

                        email:
                            firebaseUser.email || ""

                    };

                }

            } catch (error) {

                console.warn(
                    "Could not load player profile:",
                    error
                );

            }

        }


        saveLocalCache();

        authReady =
            true;

        emit();

    }


    /* ========================================================
       REGISTER
    ======================================================== */

    async function register(data) {

        if (
            !firebaseReady ||
            !auth
        ) {

            throw new Error(
                "Firebase غير جاهز. تأكد من تحميل الصفحة مرة أخرى."
            );

        }


        const name =
            String(
                data.name || ""
            ).trim();


        const email =
            String(
                data.email || ""
            )
                .trim()
                .toLowerCase();


        const password =
            String(
                data.password || ""
            );


        const age =
            Number(
                data.age
            );


        /* ====================================================
           VALIDATION
        ==================================================== */

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
                "العمر يجب أن يكون بين 5 و100."
            );

        }


        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                .test(email)
        ) {

            throw new Error(
                "البريد الإلكتروني غير صحيح."
            );

        }


        if (password.length < 6) {

            throw new Error(
                "كلمة المرور يجب أن تكون 6 أحرف على الأقل."
            );

        }


        /* ====================================================
           CREATE FIREBASE USER
        ==================================================== */

        const result =
            await auth
                .createUserWithEmailAndPassword(
                    email,
                    password
                );


        const firebaseUser =
            result.user;


        if (!firebaseUser) {

            throw new Error(
                "تعذر إنشاء الحساب."
            );

        }


        currentUser = {

            uid:
                firebaseUser.uid,

            email:
                firebaseUser.email || email,

            emailVerified:
                !!firebaseUser.emailVerified

        };


        currentPlayer = {

            ...createDefaultPlayer(
                currentUser
            ),

            name:
                name,

            age:
                age

        };


        /* ====================================================
           FIRESTORE
        ==================================================== */

        if (
            db &&
            firestoreReady
        ) {

            try {

                await db
                    .collection("players")
                    .doc(firebaseUser.uid)
                    .set(

                        {

                            ...currentPlayer,

                            createdAt:
                                firebase.firestore.FieldValue
                                    .serverTimestamp()

                        },

                        {
                            merge:
                                true
                        }

                    );

            } catch (error) {

                console.warn(
                    "Player profile save failed:",
                    error
                );

            }

        }


        saveLocalCache();

        emit();


        return currentPlayer;

    }


    /* ========================================================
       LOGIN
    ======================================================== */

    async function login(
        email,
        password
    ) {

        if (
            !firebaseReady ||
            !auth
        ) {

            throw new Error(
                "Firebase غير جاهز."
            );

        }


        email =
            String(
                email || ""
            )
                .trim()
                .toLowerCase();


        password =
            String(
                password || ""
            );


        if (!email) {

            throw new Error(
                "اكتب البريد الإلكتروني."
            );

        }


        if (!password) {

            throw new Error(
                "اكتب كلمة المرور."
            );

        }


        await auth
            .signInWithEmailAndPassword(
                email,
                password
            );


        return currentPlayer;

    }


    /* ========================================================
       LOGOUT
    ======================================================== */

    async function logout() {

        if (
            auth &&
            firebaseReady
        ) {

            await auth.signOut();

        }


        currentUser =
            null;

        currentPlayer =
            null;


        try {

            localStorage.removeItem(
                LOCAL_KEY
            );

        } catch (error) {

            console.warn(error);

        }


        emit();

    }


    /* ========================================================
       UPDATE PLAYER
    ======================================================== */

    async function updatePlayer(
        patch = {}
    ) {

        if (!currentPlayer)
            return null;


        currentPlayer = {

            ...currentPlayer,

            ...patch

        };


        saveLocalCache();


        if (
            db &&
            firestoreReady &&
            currentUser?.uid
        ) {

            try {

                await db
                    .collection("players")
                    .doc(currentUser.uid)
                    .set(

                        patch,

                        {
                            merge:
                                true
                        }

                    );

            } catch (error) {

                console.warn(
                    "Player cloud update failed:",
                    error
                );

            }

        }


        emit();


        return currentPlayer;

    }


    /* ========================================================
       GETTERS
    ======================================================== */

    function getUser() {

        return currentUser;

    }


    function getPlayer() {

        return currentPlayer;

    }


    function isLoggedIn() {

        return !!(
            currentUser &&
            currentPlayer
        );

    }


    function isReady() {

        return authReady;

    }


    function isCloudReady() {

        return firebaseReady;

    }


    function isFirestoreReady() {

        return firestoreReady;

    }


    /* ========================================================
       INITIALIZATION
    ======================================================== */

    async function init() {

        loadLocalCache();

        await initFirebase();

        authReady =
            true;

        emit();

    }


    /* ========================================================
       PUBLIC API
    ======================================================== */

    window.ZIVOZONE_AUTH = {

        register,

        login,

        logout,

        update:
            updatePlayer,

        getUser,

        getPlayer,

        isLoggedIn,

        isReady,

        isCloudReady,

        isFirestoreReady

    };


    /* ========================================================
       START
    ======================================================== */

    init();

})();
