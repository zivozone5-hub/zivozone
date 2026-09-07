(() => {

    "use strict";


    // ========================================================
    // ZIVOZONE AUTHENTICATION
    // ========================================================

    const firebaseConfig =
        window.ZIVOZONE_FIREBASE_CONFIG;


    if (!firebaseConfig) {

        console.error(
            "ZIVOZONE: Firebase configuration is missing."
        );

        window.ZIVOZONE_AUTH = createFallbackAuth(
            "تعذر تحميل إعدادات Firebase."
        );

        return;
    }


    if (
        typeof firebase === "undefined"
    ) {

        console.error(
            "ZIVOZONE: Firebase SDK is not loaded."
        );

        window.ZIVOZONE_AUTH = createFallbackAuth(
            "تعذر تحميل Firebase."
        );

        return;
    }


    // ========================================================
    // FIREBASE INITIALIZATION
    // ========================================================

    let app;
    let auth;
    let db;


    try {

        if (!firebase.apps.length) {

            app = firebase.initializeApp(
                firebaseConfig
            );

        } else {

            app = firebase.app();

        }


        auth =
            firebase.auth();


        db =
            firebase.firestore();


    } catch (error) {

        console.error(
            "ZIVOZONE Firebase initialization error:",
            error
        );


        window.ZIVOZONE_AUTH =
            createFallbackAuth(
                "حدث خطأ أثناء الاتصال بخدمة الحسابات."
            );

        return;
    }


    // ========================================================
    // ERROR TRANSLATION
    // ========================================================

    function translateError(error) {

        console.error(
            "ZIVOZONE Auth Error:",
            error
        );


        const code =
            error?.code || "";


        switch (code) {

            case "auth/email-already-in-use":
                return "هذا البريد مستخدم مسبقًا.";

            case "auth/invalid-email":
                return "البريد الإلكتروني غير صحيح.";

            case "auth/weak-password":
                return "كلمة المرور يجب أن تكون 6 أحرف على الأقل.";

            case "auth/invalid-credential":
                return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";

            case "auth/user-not-found":
                return "لا يوجد حساب بهذا البريد.";

            case "auth/wrong-password":
                return "كلمة المرور غير صحيحة.";

            case "auth/too-many-requests":
                return "محاولات كثيرة. حاول لاحقًا.";

            case "auth/network-request-failed":
                return "تحقق من اتصال الإنترنت.";

            case "auth/api-key-not-valid":
                return "مفتاح Firebase غير صالح.";

            case "permission-denied":
                return "ليس لديك صلاحية لهذه العملية.";

            default:
                return (
                    error?.message ||
                    "حدث خطأ. حاول مرة أخرى."
                );
        }
    }


    // ========================================================
    // REGISTER
    // ========================================================

    async function register(
        name,
        email,
        password
    ) {

        name =
            String(name || "").trim();

        email =
            String(email || "").trim();

        password =
            String(password || "");


        if (!name) {

            throw new Error(
                "اكتب اسمك."
            );

        }


        if (!email) {

            throw new Error(
                "اكتب البريد الإلكتروني."
            );

        }


        if (password.length < 6) {

            throw new Error(
                "كلمة المرور يجب أن تكون 6 أحرف على الأقل."
            );

        }


        try {

            const credential =
                await auth.createUserWithEmailAndPassword(
                    email,
                    password
                );


            const user =
                credential.user;


            // تحديث اسم المستخدم
            await user.updateProfile({

                displayName:
                    name

            });


            // إنشاء ملف اللاعب
            await db
                .collection("players")
                .doc(user.uid)
                .set({

                    uid:
                        user.uid,

                    name:
                        name,

                    email:
                        email,

                    level:
                        1,

                    xp:
                        0,

                    coins:
                        0,

                    wins:
                        0,

                    createdAt:
                        firebase.firestore.FieldValue.serverTimestamp(),

                    updatedAt:
                        firebase.firestore.FieldValue.serverTimestamp()

                }, {

                    merge:
                        true

                });


            return user;

        } catch (error) {

            const message =
                translateError(error);


            const translated =
                new Error(message);


            translated.code =
                error?.code;


            throw translated;
        }
    }


    // ========================================================
    // LOGIN
    // ========================================================

    async function login(
        email,
        password
    ) {

        email =
            String(email || "").trim();

        password =
            String(password || "");


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


        try {

            const credential =
                await auth.signInWithEmailAndPassword(
                    email,
                    password
                );


            return credential.user;

        } catch (error) {

            const message =
                translateError(error);


            const translated =
                new Error(message);


            translated.code =
                error?.code;


            throw translated;
        }
    }


    // ========================================================
    // LOGOUT
    // ========================================================

    async function logout() {

        try {

            await auth.signOut();

        } catch (error) {

            throw new Error(
                translateError(error)
            );

        }

    }


    // ========================================================
    // UPDATE PROFILE
    // ========================================================

    async function update(
        data = {}
    ) {

        const user =
            auth.currentUser;


        if (!user) {

            throw new Error(
                "يجب تسجيل الدخول أولًا."
            );

        }


        try {

            const updateData = {};


            if (
                typeof data.name === "string" &&
                data.name.trim()
            ) {

                updateData.name =
                    data.name.trim();


                await user.updateProfile({

                    displayName:
                        data.name.trim()

                });

            }


            if (
                typeof data.level === "number"
            ) {

                updateData.level =
                    data.level;

            }


            if (
                typeof data.xp === "number"
            ) {

                updateData.xp =
                    data.xp;

            }


            if (
                typeof data.coins === "number"
            ) {

                updateData.coins =
                    data.coins;

            }


            if (
                typeof data.wins === "number"
            ) {

                updateData.wins =
                    data.wins;

            }


            updateData.updatedAt =
                firebase.firestore.FieldValue.serverTimestamp();


            await db
                .collection("players")
                .doc(user.uid)
                .set(
                    updateData,
                    {
                        merge: true
                    }
                );


            return true;

        } catch (error) {

            throw new Error(
                translateError(error)
            );

        }

    }


    // ========================================================
    // GET CURRENT USER
    // ========================================================

    function getUser() {

        return auth.currentUser || null;

    }


    // ========================================================
    // GET PLAYER
    // ========================================================

    async function getPlayer() {

        const user =
            auth.currentUser;


        if (!user) {
            return null;
        }


        try {

            const snapshot =
                await db
                    .collection("players")
                    .doc(user.uid)
                    .get();


            if (!snapshot.exists) {

                return {

                    uid:
                        user.uid,

                    name:
                        user.displayName ||
                        "لاعب ZIVOZONE",

                    email:
                        user.email || "",

                    level:
                        1,

                    xp:
                        0,

                    coins:
                        0,

                    wins:
                        0

                };

            }


            return {

                uid:
                    user.uid,

                ...snapshot.data()

            };

        } catch (error) {

            console.error(
                "ZIVOZONE getPlayer error:",
                error
            );


            return null;
        }
    }


    // ========================================================
    // LOGIN STATE
    // ========================================================

    function isLoggedIn() {

        return !!auth.currentUser;

    }


    // ========================================================
    // AUTH STATE
    // ========================================================

    auth.onAuthStateChanged(
        async (user) => {

            window.ZIVOZONE_AUTH_USER =
                user || null;


            window.dispatchEvent(
                new CustomEvent(
                    "zivozone-auth-state",
                    {
                        detail: {
                            user
                        }
                    }
                )
            );

        }
    );


    // ========================================================
    // PUBLIC API
    // ========================================================

    window.ZIVOZONE_AUTH = {

        register,

        login,

        logout,

        update,

        getUser,

        getPlayer,

        isLoggedIn,

        auth,

        db

    };


    console.log(
        "✅ ZIVOZONE Authentication initialized."
    );


    // ========================================================
    // FALLBACK
    // ========================================================

    function createFallbackAuth(
        message
    ) {

        const fail =
            async function () {

                throw new Error(
                    message
                );

            };


        return {

            register:
                fail,

            login:
                fail,

            logout:
                async () => {},

            update:
                fail,

            getUser:
                () => null,

            getPlayer:
                async () => null,

            isLoggedIn:
                () => false

        };

    }

})();
