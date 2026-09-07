/*
============================================================
 ZIVOZONE AUTH SYSTEM
 Firebase Authentication + Firestore
============================================================
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
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


/* =========================================================
   FIREBASE
========================================================= */

const firebaseConfig = {
    apiKey: "AIzaSyCHTz-ENxA93WgzKcHaH7Ybcax2R_024s",
    authDomain: "zivozone-fc6ed.firebaseapp.com",
    projectId: "zivozone-fc6ed",
    storageBucket: "zivozone-fc6ed.firebasestorage.app",
    messagingSenderId: "169366383094",
    appId: "1:169366383094:web:5875e8d24b1c543e4a7fd7",
    measurementId: "G-ZXW8LP39JY"
};


let firebaseApp = null;
let auth = null;
let db = null;

let currentUser = null;
let currentPlayer = null;


try {

    firebaseApp = initializeApp(firebaseConfig);

    auth = getAuth(firebaseApp);

    db = getFirestore(firebaseApp);

    console.log(
        "🔥 ZIVOZONE Firebase connected"
    );

} catch (error) {

    console.error(
        "Firebase initialization error:",
        error
    );
}


/* =========================================================
   DEFAULT PLAYER
========================================================= */

const DEFAULT_PLAYER = {

    uid: "",

    name: "ZIVO Player",

    email: "",

    age: null,

    language: "ar",

    role: "player",

    level: 1,

    xp: 0,

    coins: 0,

    wins: 0,

    losses: 0,

    gamesPlayed: 0,

    streak: 0,

    identityTests: 0,

    createdAt: null,

    updatedAt: null
};


/* =========================================================
   HELPERS
========================================================= */

function cleanText(value, maxLength = 100) {

    return String(value || "")
        .trim()
        .slice(0, maxLength);
}


function validEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(
            String(email || "")
                .trim()
                .toLowerCase()
        );
}


function validAge(age) {

    const number = Number(age);

    return (
        Number.isInteger(number) &&
        number >= 5 &&
        number <= 100
    );
}


function getErrorMessage(error) {

    const code = error?.code || "";

    const errors = {

        "auth/email-already-in-use":
            "هذا البريد الإلكتروني مستخدم مسبقًا.",

        "auth/invalid-email":
            "البريد الإلكتروني غير صحيح.",

        "auth/weak-password":
            "كلمة المرور يجب أن تكون 6 أحرف على الأقل.",

        "auth/invalid-credential":
            "البريد الإلكتروني أو كلمة المرور غير صحيحة.",

        "auth/user-not-found":
            "الحساب غير موجود.",

        "auth/wrong-password":
            "كلمة المرور غير صحيحة.",

        "auth/too-many-requests":
            "محاولات كثيرة. حاول لاحقًا.",

        "auth/network-request-failed":
            "تعذر الاتصال بالإنترنت.",

        "auth/operation-not-allowed":
            "Email/Password غير مفعل في Firebase.",

        "permission-denied":
            "لا توجد صلاحية للوصول إلى البيانات."
    };

    return (
        errors[code] ||
        error?.message ||
        "حدث خطأ غير متوقع."
    );
}


/* =========================================================
   PLAYER DOCUMENT
========================================================= */

async function getPlayer(uid) {

    if (!db || !uid) {
        return null;
    }

    const reference =
        doc(
            db,
            "users",
            uid
        );

    const snapshot =
        await getDoc(reference);

    if (!snapshot.exists()) {
        return null;
    }

    return {
        ...DEFAULT_PLAYER,
        ...snapshot.data()
    };
}


/* =========================================================
   CREATE PLAYER
========================================================= */

async function createPlayer(
    user,
    information = {}
) {

    if (!db || !user?.uid) {

        throw new Error(
            "لا يمكن إنشاء ملف اللاعب."
        );
    }


    const reference =
        doc(
            db,
            "users",
            user.uid
        );


    const existing =
        await getDoc(reference);


    if (existing.exists()) {

        return {
            ...DEFAULT_PLAYER,
            ...existing.data()
        };
    }


    const player = {

        ...DEFAULT_PLAYER,

        uid: user.uid,

        name:
            cleanText(
                information.name ||
                user.displayName ||
                "ZIVO Player",
                50
            ),

        email:
            user.email || "",

        age:
            validAge(information.age)
                ? Number(information.age)
                : null,

        language:
            information.language || "ar",

        createdAt:
            serverTimestamp(),

        updatedAt:
            serverTimestamp()
    };


    await setDoc(
        reference,
        player
    );


    return player;
}


/* =========================================================
   REGISTER
========================================================= */

async function registerPlayer({
    name,
    email,
    password,
    age,
    language = "ar"
}) {

    if (!auth || !db) {

        throw new Error(
            "خدمة الحسابات غير جاهزة."
        );
    }


    const cleanName =
        cleanText(name, 50);

    const cleanEmail =
        cleanText(email, 150)
            .toLowerCase();


    if (cleanName.length < 2) {

        throw new Error(
            "اسم اللاعب يجب أن يكون حرفين على الأقل."
        );
    }


    if (!validEmail(cleanEmail)) {

        throw new Error(
            "أدخل بريدًا إلكترونيًا صحيحًا."
        );
    }


    if (
        typeof password !== "string" ||
        password.length < 6
    ) {

        throw new Error(
            "كلمة المرور يجب أن تكون 6 أحرف على الأقل."
        );
    }


    if (!validAge(age)) {

        throw new Error(
            "العمر يجب أن يكون بين 5 و100 سنة."
        );
    }


    try {

        const credentials =
            await createUserWithEmailAndPassword(
                auth,
                cleanEmail,
                password
            );


        const user =
            credentials.user;


        await updateProfile(
            user,
            {
                displayName:
                    cleanName
            }
        );


        const player =
            await createPlayer(
                user,
                {
                    name: cleanName,
                    age: Number(age),
                    language
                }
            );


        currentUser = user;

        currentPlayer = player;


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
            "ZIVOZONE registration:",
            error
        );

        throw new Error(
            getErrorMessage(error)
        );
    }
}


/* =========================================================
   LOGIN
========================================================= */

async function loginPlayer(
    email,
    password
) {

    if (!auth) {

        throw new Error(
            "خدمة تسجيل الدخول غير جاهزة."
        );
    }


    const cleanEmail =
        cleanText(email, 150)
            .toLowerCase();


    if (!validEmail(cleanEmail)) {

        throw new Error(
            "أدخل بريدًا إلكترونيًا صحيحًا."
        );
    }


    if (!password) {

        throw new Error(
            "أدخل كلمة المرور."
        );
    }


    try {

        const credentials =
            await signInWithEmailAndPassword(
                auth,
                cleanEmail,
                password
            );


        const user =
            credentials.user;


        let player =
            await getPlayer(
                user.uid
            );


        if (!player) {

            player =
                await createPlayer(
                    user
                );
        }


        currentUser = user;

        currentPlayer = player;


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
            "ZIVOZONE login:",
            error
        );

        throw new Error(
            getErrorMessage(error)
        );
    }
}


/* =========================================================
   LOGOUT
========================================================= */

async function logoutPlayer() {

    if (!auth) {
        return;
    }


    try {

        await signOut(auth);

        currentUser = null;

        currentPlayer = null;


        dispatchAuth(
            false,
            null,
            null
        );


    } catch (error) {

        console.error(
            "ZIVOZONE logout:",
            error
        );

        throw new Error(
            "تعذر تسجيل الخروج."
        );
    }
}


/* =========================================================
   UPDATE PLAYER
========================================================= */

async function updatePlayer(
    updates = {}
) {

    if (!db || !currentUser) {

        throw new Error(
            "يجب تسجيل الدخول أولًا."
        );
    }


    const safeUpdates = {};


    if (
        updates.name !== undefined
    ) {

        safeUpdates.name =
            cleanText(
                updates.name,
                50
            );
    }


    if (
        updates.age !== undefined &&
        validAge(updates.age)
    ) {

        safeUpdates.age =
            Number(updates.age);
    }


    if (
        updates.language !== undefined
    ) {

        safeUpdates.language =
            cleanText(
                updates.language,
                10
            );
    }


    if (
        updates.xp !== undefined
    ) {

        safeUpdates.xp =
            Math.max(
                0,
                Number(updates.xp) || 0
            );
    }


    if (
        updates.coins !== undefined
    ) {

        safeUpdates.coins =
            Math.max(
                0,
                Number(updates.coins) || 0
            );
    }


    if (
        updates.wins !== undefined
    ) {

        safeUpdates.wins =
            Math.max(
                0,
                Number(updates.wins) || 0
            );
    }


    if (
        updates.losses !== undefined
    ) {

        safeUpdates.losses =
            Math.max(
                0,
                Number(updates.losses) || 0
            );
    }


    if (
        updates.gamesPlayed !== undefined
    ) {

        safeUpdates.gamesPlayed =
            Math.max(
                0,
                Number(updates.gamesPlayed) || 0
            );
    }


    safeUpdates.updatedAt =
        serverTimestamp();


    const reference =
        doc(
            db,
            "users",
            currentUser.uid
        );


    await updateDoc(
        reference,
        safeUpdates
    );


    currentPlayer = {
        ...currentPlayer,
        ...safeUpdates
    };


    dispatchAuth(
        true,
        currentUser,
        currentPlayer
    );


    return currentPlayer;
}


/* =========================================================
   AUTH EVENT
========================================================= */

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


/* =========================================================
   AUTH STATE
========================================================= */

if (auth) {

    onAuthStateChanged(
        auth,
        async user => {

            try {

                if (!user) {

                    currentUser = null;

                    currentPlayer = null;


                    dispatchAuth(
                        false,
                        null,
                        null
                    );


                    return;
                }


                currentUser =
                    user;


                let player =
                    await getPlayer(
                        user.uid
                    );


                if (!player) {

                    player =
                        await createPlayer(
                            user
                        );
                }


                currentPlayer =
                    player;


                dispatchAuth(
                    true,
                    user,
                    player
                );


                console.log(
                    "🟢 ZIVOZONE player:",
                    user.email
                );

            } catch (error) {

                console.error(
                    "Auth state error:",
                    error
                );


                dispatchAuth(
                    false,
                    null,
                    null
                );
            }
        }
    );
}


/* =========================================================
   PUBLIC API
========================================================= */

window.ZIVOZONE_AUTH = {

    registerPlayer,

    loginPlayer,

    logoutPlayer,

    getCurrentPlayer() {

        return currentPlayer;
    },

    getCurrentUser() {

        return currentUser;
    },

    updatePlayer
};


/*
 * Compatibility layer
 * حتى تعمل النسخ السابقة والجديدة معًا.
 */

window.ZIVOAuth = {

    register: registerPlayer,

    login: loginPlayer,

    logout: logoutPlayer,

    getCurrentPlayer() {

        return currentPlayer;
    },

    getCurrentUser() {

        return currentUser;
    },

    updatePlayer
};


window.dispatchEvent(
    new CustomEvent(
        "zivozone-auth-ready"
    )
);


console.log(
    "🚀 ZIVOZONE Authentication Ready"
);
