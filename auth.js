/**
 * ============================================================
 * ZIVOZONE AUTHENTICATION
 * Firebase Modular SDK
 * ============================================================
 *
 * الوظائف:
 * - إنشاء حساب
 * - تسجيل الدخول
 * - تسجيل الخروج
 * - إنشاء ملف اللاعب
 * - قراءة ملف اللاعب
 * - تحديث XP / Coins / Wins
 * - مراقبة حالة تسجيل الدخول
 *
 * Firestore:
 * users/{uid}
 * ============================================================
 */

import {
    initializeApp,
    getApps
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
   FIREBASE CONFIG
============================================================ */

const firebaseConfig = {

    apiKey: "AIzaSyCHTz-ENxA93WgzKcHaH7Ybcax2R_024s",

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


/* ============================================================
   FIREBASE INITIALIZATION
============================================================ */

let app;

try {

    app = getApps().length
        ? getApps()[0]
        : initializeApp(firebaseConfig);

} catch (error) {

    console.error(
        "ZIVOZONE Firebase initialization failed:",
        error
    );

    throw error;
}


const auth = getAuth(app);
const db = getFirestore(app);


/* ============================================================
   STATE
============================================================ */

let currentUser = null;
let currentPlayer = null;
let authReady = false;


/* ============================================================
   DEFAULT PLAYER
============================================================ */

function createDefaultPlayer(user, extra = {}) {

    return {

        uid: user.uid,

        name:
            extra.name ||
            user.displayName ||
            "ZIVO Player",

        email:
            user.email || "",

        age:
            Number(extra.age) || null,

        level: 1,

        xp: 0,

        coins: 0,

        wins: 0,

        losses: 0,

        gamesPlayed: 0,

        streak: 0,

        language: "ar",

        role: "player",

        createdAt: null,

        updatedAt: null
    };
}


/* ============================================================
   EVENT
============================================================ */

function emitAuthState() {

    window.dispatchEvent(

        new CustomEvent(
            "zivozone-auth",
            {
                detail: {

                    user: currentUser,

                    player: currentPlayer,

                    ready: authReady,

                    cloud: true

                }
            }
        )

    );
}


/* ============================================================
   VALIDATION
============================================================ */

function validateRegistration({
    name,
    email,
    password,
    age
}) {

    const cleanName =
        String(name || "").trim();

    const cleanEmail =
        String(email || "")
            .trim()
            .toLowerCase();

    const cleanPassword =
        String(password || "");

    const numericAge =
        Number(age);


    if (
        cleanName.length < 2 ||
        cleanName.length > 50
    ) {

        throw new Error(
            "اسم اللاعب يجب أن يكون بين حرفين و50 حرفًا."
        );
    }


    if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(cleanEmail)
    ) {

        throw new Error(
            "يرجى إدخال بريد إلكتروني صحيح."
        );
    }


    if (cleanPassword.length < 6) {

        throw new Error(
            "كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل."
        );
    }


    if (
        !Number.isInteger(numericAge) ||
        numericAge < 5 ||
        numericAge > 100
    ) {

        throw new Error(
            "العمر يجب أن يكون بين 5 و100 سنة."
        );
    }


    return {

        name: cleanName,

        email: cleanEmail,

        password: cleanPassword,

        age: numericAge
    };
}


/* ============================================================
   FIRESTORE PLAYER
============================================================ */

async function loadPlayer(user) {

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
        await getDoc(playerRef);


    if (snapshot.exists()) {

        return {

            uid: user.uid,

            ...snapshot.data()

        };
    }


    const player =
        createDefaultPlayer(user);


    await setDoc(
        playerRef,
        {
            ...player,

            createdAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp()
        }
    );


    return player;
}


/* ============================================================
   REGISTER
============================================================ */

async function register({
    name,
    email,
    password,
    age
}) {

    const data =
        validateRegistration({
            name,
            email,
            password,
            age
        });


    try {

        const credentials =
            await createUserWithEmailAndPassword(
                auth,
                data.email,
                data.password
            );


        const user =
            credentials.user;


        /* حفظ الاسم في Firebase Authentication */

        await updateProfile(
            user,
            {
                displayName: data.name
            }
        );


        const player =
            createDefaultPlayer(
                user,
                {
                    name: data.name,
                    age: data.age
                }
            );


        /* حفظ اللاعب في users/{uid} */

        await setDoc(

            doc(
                db,
                "users",
                user.uid
            ),

            {
                ...player,

                createdAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()
            }

        );


        currentUser = user;

        currentPlayer = player;


        emitAuthState();


        return player;

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );


        switch (error.code) {

            case "auth/email-already-in-use":

                throw new Error(
                    "هذا البريد الإلكتروني مستخدم مسبقًا."
                );


            case "auth/invalid-email":

                throw new Error(
                    "البريد الإلكتروني غير صحيح."
                );


            case "auth/weak-password":

                throw new Error(
                    "كلمة المرور ضعيفة. استخدم 6 أحرف على الأقل."
                );


            case "auth/network-request-failed":

                throw new Error(
                    "تعذر الاتصال بالإنترنت."
                );


            default:

                throw new Error(
                    error.message ||
                    "حدث خطأ أثناء إنشاء الحساب."
                );
        }
    }
}


/* ============================================================
   LOGIN
============================================================ */

async function login(
    email,
    password
) {

    const cleanEmail =
        String(email || "")
            .trim()
            .toLowerCase();

    const cleanPassword =
        String(password || "");


    if (!cleanEmail) {

        throw new Error(
            "أدخل البريد الإلكتروني."
        );
    }


    if (!cleanPassword) {

        throw new Error(
            "أدخل كلمة المرور."
        );
    }


    try {

        const credentials =
            await signInWithEmailAndPassword(
                auth,
                cleanEmail,
                cleanPassword
            );


        currentUser =
            credentials.user;


        currentPlayer =
            await loadPlayer(
                currentUser
            );


        emitAuthState();


        return currentPlayer;

    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        switch (error.code) {

            case "auth/invalid-credential":

            case "auth/wrong-password":

            case "auth/user-not-found":

                throw new Error(
                    "البريد الإلكتروني أو كلمة المرور غير صحيحة."
                );


            case "auth/invalid-email":

                throw new Error(
                    "البريد الإلكتروني غير صحيح."
                );


            case "auth/network-request-failed":

                throw new Error(
                    "تعذر الاتصال بالإنترنت."
                );


            default:

                throw new Error(
                    error.message ||
                    "تعذر تسجيل الدخول."
                );
        }
    }
}


/* ============================================================
   LOGOUT
============================================================ */

async function logout() {

    try {

        await signOut(auth);

        currentUser = null;

        currentPlayer = null;

        emitAuthState();

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

        throw new Error(
            "تعذر تسجيل الخروج."
        );
    }
}


/* ============================================================
   UPDATE PLAYER
============================================================ */

async function updatePlayer(
    patch
) {

    if (!currentUser) {

        throw new Error(
            "يجب تسجيل الدخول أولًا."
        );
    }


    if (
        !patch ||
        typeof patch !== "object"
    ) {

        throw new Error(
            "بيانات التحديث غير صحيحة."
        );
    }


    const allowedFields = [

        "name",
        "age",
        "level",
        "xp",
        "coins",
        "wins",
        "losses",
        "gamesPlayed",
        "streak",
        "language"

    ];


    const safePatch = {};


    for (
        const key of allowedFields
    ) {

        if (
            Object.prototype.hasOwnProperty
                .call(patch, key)
        ) {

            safePatch[key] =
                patch[key];
        }
    }


    safePatch.updatedAt =
        serverTimestamp();


    await setDoc(

        doc(
            db,
            "users",
            currentUser.uid
        ),

        safePatch,

        {
            merge: true
        }

    );


    currentPlayer = {

        ...currentPlayer,

        ...patch

    };


    emitAuthState();


    return currentPlayer;
}


/* ============================================================
   GETTERS
============================================================ */

function getUser() {

    return currentUser;
}


function getPlayer() {

    return currentPlayer;
}


function isLoggedIn() {

    return !!currentUser;
}


/* ============================================================
   AUTH STATE
============================================================ */

onAuthStateChanged(
    auth,
    async user => {

        try {

            if (!user) {

                currentUser = null;

                currentPlayer = null;

                authReady = true;

                emitAuthState();

                return;
            }


            currentUser = user;


            currentPlayer =
                await loadPlayer(user);


            authReady = true;


            emitAuthState();

        } catch (error) {

            console.error(
                "Auth state error:",
                error
            );


            currentUser = user;

            currentPlayer =
                createDefaultPlayer(user);

            authReady = true;

            emitAuthState();
        }
    }
);


/* ============================================================
   PUBLIC API
============================================================ */

window.ZIVOZONE_AUTH = {

    register,

    login,

    logout,

    update: updatePlayer,

    getUser,

    getPlayer,

    isLoggedIn,

    isReady: () => authReady

};


console.log(
    "🔥 ZIVOZONE Firebase Authentication ready."
);
