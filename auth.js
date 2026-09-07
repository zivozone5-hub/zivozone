/**
 * ============================================================
 * ZIVOZONE - Authentication System
 * Firebase Modular SDK
 * ============================================================
 *
 * المسؤوليات:
 * - تهيئة Firebase
 * - تسجيل اللاعبين
 * - تسجيل الدخول
 * - تسجيل الخروج
 * - إنشاء ملف اللاعب في Firestore
 * - مراقبة حالة المصادقة
 *
 * ملاحظة أمنية:
 * هذا الملف لا يحتوي على أسرار سرية.
 * حماية بيانات اللاعب تعتمد أيضًا على Firestore Security Rules.
 * ============================================================
 */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


/* ============================================================
   FIREBASE CONFIGURATION
============================================================ */

const firebaseConfig = {
    apiKey: "AIzaSyCHTz-ENxA93WgzKcHaH7Ybcax2R_024s",
    authDomain: "zivozone-fc6ed.firebaseapp.com",
    projectId: "zivozone-fc6ed",
    storageBucket: "zivozone-fc6ed.firebasestorage.app",
    messagingSenderId: "169366383094",
    appId: "1:169366383094:web:5875e8d24b1c543e4a7fd7",
    measurementId: "G-ZXW8LP39JY"
};


/* ============================================================
   FIREBASE INITIALIZATION
============================================================ */

let firebaseApp = null;
let auth = null;
let db = null;

try {

    firebaseApp = initializeApp(firebaseConfig);

    auth = getAuth(firebaseApp);

    db = getFirestore(firebaseApp);

    console.log("🔥 ZIVOZONE Firebase initialized successfully.");

} catch (error) {

    console.error(
        "ZIVOZONE Firebase initialization failed:",
        error
    );
}


/* ============================================================
   PLAYER DEFAULT DATA
============================================================ */

const DEFAULT_PLAYER_DATA = {
    level: 1,
    xp: 0,
    coins: 0,

    wins: 0,
    losses: 0,
    gamesPlayed: 0,

    streak: 0,

    age: null,

    language: "ar",

    role: "player",

    createdAt: null,
    updatedAt: null
};


/* ============================================================
   VALIDATION
============================================================ */

function validateRegistrationData({
    name,
    email,
    password,
    age
}) {

    if (
        typeof name !== "string" ||
        name.trim().length < 2 ||
        name.trim().length > 50
    ) {
        throw new Error(
            "اسم اللاعب يجب أن يكون بين حرفين و50 حرفًا."
        );
    }


    if (
        typeof email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
        throw new Error(
            "يرجى إدخال بريد إلكتروني صحيح."
        );
    }


    if (
        typeof password !== "string" ||
        password.length < 6
    ) {
        throw new Error(
            "كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل."
        );
    }


    const numericAge = Number(age);

    if (
        !Number.isInteger(numericAge) ||
        numericAge < 5 ||
        numericAge > 100
    ) {
        throw new Error(
            "يرجى إدخال عمر صحيح بين 5 و100 سنة."
        );
    }

    return {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        age: numericAge
    };
}


/* ============================================================
   CREATE PLAYER PROFILE
============================================================ */

async function createPlayerProfile(
    user,
    playerInformation = {}
) {

    if (!user || !user.uid) {
        throw new Error(
            "لا يمكن إنشاء ملف لاعب بدون حساب صالح."
        );
    }


    if (!db) {
        throw new Error(
            "قاعدة البيانات غير متاحة حاليًا."
        );
    }


    const playerRef = doc(
        db,
        "users",
        user.uid
    );


    const existingPlayer =
        await getDoc(playerRef);


    /*
     * إذا كان الملف موجودًا، لا نعيد إنشاء بيانات اللاعب.
     * هذا يمنع فقدان XP والعملات والإحصائيات.
     */

    if (existingPlayer.exists()) {

        return {
            id: existingPlayer.id,
            ...existingPlayer.data()
        };
    }


    const playerData = {

        ...DEFAULT_PLAYER_DATA,

        uid: user.uid,

        name:
            playerInformation.name ||
            user.displayName ||
            "ZIVO Player",

        email:
            user.email || "",

        age:
            playerInformation.age ??
            null,

        language:
            playerInformation.language ||
            "ar",

        createdAt:
            serverTimestamp(),

        updatedAt:
            serverTimestamp()
    };


    await setDoc(
        playerRef,
        playerData
    );


    return {
        id: user.uid,
        ...playerData
    };
}


/* ============================================================
   REGISTER PLAYER
============================================================ */

async function registerPlayer({
    name,
    email,
    password,
    age,
    language = "ar"
}) {

    try {

        if (!auth) {
            throw new Error(
                "نظام الحسابات غير متاح حاليًا."
            );
        }


        const validated =
            validateRegistrationData({
                name,
                email,
                password,
                age
            });


        const credentials =
            await createUserWithEmailAndPassword(
                auth,
                validated.email,
                validated.password
            );


        const user =
            credentials.user;


        /*
         * حفظ اسم اللاعب في Firebase Authentication.
         */

        await updateProfile(
            user,
            {
                displayName:
                    validated.name
            }
        );


        /*
         * إنشاء ملف اللاعب في Firestore.
         */

        const player =
            await createPlayerProfile(
                user,
                {
                    name:
                        validated.name,

                    age:
                        validated.age,

                    language
                }
            );


        dispatchAuthEvent(
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
            "ZIVOZONE Registration Error:",
            error
        );


        throw new Error(
            translateFirebaseError(
                error
            )
        );
    }
}


/* ============================================================
   LOGIN PLAYER
============================================================ */

async function loginPlayer(
    email,
    password
) {

    try {

        if (!auth) {
            throw new Error(
                "نظام الحسابات غير متاح حاليًا."
            );
        }


        if (
            typeof email !== "string" ||
            !email.trim()
        ) {
            throw new Error(
                "أدخل البريد الإلكتروني."
            );
        }


        if (
            typeof password !== "string" ||
            !password
        ) {
            throw new Error(
                "أدخل كلمة المرور."
            );
        }


        const credentials =
            await signInWithEmailAndPassword(
                auth,
                email.trim().toLowerCase(),
                password
            );


        const user =
            credentials.user;


        const player =
            await createPlayerProfile(
                user
            );


        dispatchAuthEvent(
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
            "ZIVOZONE Login Error:",
            error
        );


        throw new Error(
            translateFirebaseError(
                error
            )
        );
    }
}


/* ============================================================
   LOGOUT
============================================================ */

async function logoutPlayer() {

    try {

        if (!auth) {
            throw new Error(
                "نظام الحسابات غير متاح."
            );
        }


        await signOut(auth);


        dispatchAuthEvent(
            false,
            null,
            null
        );


        return {
            success: true
        };


    } catch (error) {

        console.error(
            "ZIVOZONE Logout Error:",
            error
        );


        throw new Error(
            "تعذر تسجيل الخروج. حاول مرة أخرى."
        );
    }
}


/* ============================================================
   GET CURRENT PLAYER
============================================================ */

async function getCurrentPlayer() {

    try {

        if (!auth || !db) {
            return null;
        }


        const user =
            auth.currentUser;


        if (!user) {
            return null;
        }


        const playerRef =
            doc(
                db,
                "users",
                user.uid
            );


        const snapshot =
            await getDoc(
                playerRef
            );


        if (!snapshot.exists()) {

            return await createPlayerProfile(
                user
            );
        }


        return {
            id: snapshot.id,
            ...snapshot.data()
        };


    } catch (error) {

        console.error(
            "ZIVOZONE Get Player Error:",
            error
        );


        return null;
    }
}


/* ============================================================
   AUTH EVENT
============================================================ */

function dispatchAuthEvent(
    loggedIn,
    user,
    player
) {

    try {

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

    } catch (error) {

        console.error(
            "ZIVOZONE Auth Event Error:",
            error
        );
    }
}


/* ============================================================
   FIREBASE ERROR TRANSLATOR
============================================================ */

function translateFirebaseError(
    error
) {

    if (!error) {
        return "حدث خطأ غير معروف.";
    }


    switch (error.code) {

        case "auth/email-already-in-use":
            return "هذا البريد الإلكتروني مستخدم مسبقًا.";

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
            return "تم إجراء محاولات كثيرة. حاول لاحقًا.";

        case "auth/network-request-failed":
            return "تعذر الاتصال بالإنترنت.";

        case "auth/operation-not-allowed":
            return "طريقة تسجيل الدخول هذه غير مفعلة في Firebase.";

        default:

            return (
                error.message ||
                "حدث خطأ أثناء تنفيذ العملية."
            );
    }
}


/* ============================================================
   AUTH STATE LISTENER
============================================================ */

if (auth) {

    onAuthStateChanged(
        auth,
        async (user) => {

            try {

                if (user) {

                    console.log(
                        "🟢 ZIVOZONE Player:",
                        user.email
                    );


                    const player =
                        await createPlayerProfile(
                            user
                        );


                    dispatchAuthEvent(
                        true,
                        user,
                        player
                    );


                } else {

                    console.log(
                        "⚪ ZIVOZONE Guest Mode"
                    );


                    dispatchAuthEvent(
                        false,
                        null,
                        null
                    );
                }


            } catch (error) {

                console.error(
                    "ZIVOZONE Auth State Error:",
                    error
                );


                dispatchAuthEvent(
                    false,
                    null,
                    null
                );
            }
        }
    );
}


/* ============================================================
   PUBLIC ZIVOZONE AUTH API
============================================================ */

window.ZIVOZONE_AUTH = {

    registerPlayer,

    loginPlayer,

    logoutPlayer,

    getCurrentPlayer
};


/* ============================================================
   READY EVENT
============================================================ */

window.dispatchEvent(
    new CustomEvent(
        "zivozone-auth-ready"
    )
);


console.log(
    "🚀 ZIVOZONE Authentication System Ready"
);
