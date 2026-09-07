/**
 * ============================================================
 * ZIVOZONE AUTHENTICATION ENGINE
 * Firebase Authentication + Firestore
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
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


/* ============================================================
   FIREBASE CONFIG
============================================================ */

const firebaseConfig = {

    apiKey:
        "AIzaSyCHTz-ENxA93WgzKcHaH7Ybcax2R_024s",

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
   INITIALIZE FIREBASE
============================================================ */

const firebaseApp =
    initializeApp(firebaseConfig);

const auth =
    getAuth(firebaseApp);

const db =
    getFirestore(firebaseApp);


console.log(
    "🔥 ZIVOZONE Firebase Connected"
);


/* ============================================================
   DEFAULT PLAYER
============================================================ */

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
            "البريد الإلكتروني غير صحيح."
        );

    }


    if (
        password.length < 6
    ) {

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

        password,

        age: numericAge

    };

}


/* ============================================================
   FIREBASE ERROR TRANSLATOR
============================================================ */

function firebaseError(error) {

    const code =
        error?.code || "";


    const messages = {

        "auth/email-already-in-use":
            "هذا البريد الإلكتروني مستخدم مسبقًا.",

        "auth/invalid-email":
            "البريد الإلكتروني غير صحيح.",

        "auth/weak-password":
            "كلمة المرور ضعيفة.",

        "auth/invalid-credential":
            "البريد الإلكتروني أو كلمة المرور غير صحيحة.",

        "auth/user-not-found":
            "الحساب غير موجود.",

        "auth/wrong-password":
            "كلمة المرور غير صحيحة.",

        "auth/too-many-requests":
            "تم إجراء محاولات كثيرة. حاول لاحقًا.",

        "auth/network-request-failed":
            "تعذر الاتصال بالإنترنت.",

        "auth/operation-not-allowed":
            "تسجيل الدخول بالبريد غير مفعل في Firebase."

    };


    return (
        messages[code] ||
        "حدث خطأ أثناء تنفيذ العملية."
    );

}


/* ============================================================
   CREATE / LOAD PLAYER
============================================================ */

async function getOrCreatePlayer(

    user,

    extraData = {}

) {

    if (!user?.uid) {

        throw new Error(
            "حساب اللاعب غير صالح."
        );

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


    if (
        snapshot.exists()
    ) {

        return {

            id: snapshot.id,

            ...snapshot.data()

        };

    }


    const playerData = {

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
   REGISTER
============================================================ */

async function registerPlayer({

    name,

    email,

    password,

    age,

    language = "ar"

}) {

    try {

        const data =
            validateRegistration({

                name,

                email,

                password,

                age

            });


        const credentials =
            await createUserWithEmailAndPassword(

                auth,

                data.email,

                data.password

            );


        const user =
            credentials.user;


        await updateProfile(

            user,

            {

                displayName:
                    data.name

            }

        );


        const player =
            await getOrCreatePlayer(

                user,

                {

                    name:
                        data.name,

                    age:
                        data.age,

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
            "ZIVOZONE Register Error:",
            error
        );


        throw new Error(
            firebaseError(error)
        );

    }

}


/* ============================================================
   LOGIN
============================================================ */

async function loginPlayer(

    email,

    password

) {

    try {

        const cleanEmail =
            String(email || "")
                .trim()
                .toLowerCase();


        if (!cleanEmail) {

            throw new Error(
                "أدخل البريد الإلكتروني."
            );

        }


        if (!password) {

            throw new Error(
                "أدخل كلمة المرور."
            );

        }


        const credentials =
            await signInWithEmailAndPassword(

                auth,

                cleanEmail,

                password

            );


        const user =
            credentials.user;


        const player =
            await getOrCreatePlayer(
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
            firebaseError(error)
        );

    }

}


/* ============================================================
   LOGOUT
============================================================ */

async function logoutPlayer() {

    try {

        await signOut(
            auth
        );


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
            "تعذر تسجيل الخروج."
        );

    }

}


/* ============================================================
   GET CURRENT PLAYER
============================================================ */

async function getCurrentPlayer() {

    const user =
        auth.currentUser;


    if (!user) {

        return null;

    }


    return getOrCreatePlayer(
        user
    );

}


/* ============================================================
   UPDATE PLAYER
============================================================ */

async function updatePlayerData(

    updates

) {

    const user =
        auth.currentUser;


    if (!user) {

        throw new Error(
            "يجب تسجيل الدخول أولًا."
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

        "language",

        "lastDaily",

        "dailyWins",

        "identityCompleted"

    ];


    const cleanUpdates = {};


    for (
        const key of allowedFields
    ) {

        if (
            Object.prototype.hasOwnProperty
                .call(
                    updates,
                    key
                )
        ) {

            cleanUpdates[key] =
                updates[key];

        }

    }


    cleanUpdates.updatedAt =
        serverTimestamp();


    const playerRef =
        doc(

            db,

            "users",

            user.uid

        );


    await updateDoc(

        playerRef,

        cleanUpdates

    );


    return getOrCreatePlayer(
        user
    );

}


/* ============================================================
   AUTH EVENT
============================================================ */

function dispatchAuthEvent(

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


/* ============================================================
   AUTH STATE
============================================================ */

onAuthStateChanged(

    auth,

    async (user) => {

        try {

            if (!user) {

                dispatchAuthEvent(

                    false,

                    null,

                    null

                );

                return;

            }


            const player =
                await getOrCreatePlayer(
                    user
                );


            dispatchAuthEvent(

                true,

                user,

                player

            );


            console.log(
                "🟢 Player connected:",
                user.email
            );


        } catch (error) {

            console.error(
                "Auth state error:",
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


/* ============================================================
   AUTH MODAL
============================================================ */

function showAuthModal() {

    const root =
        document.getElementById(
            "modal-root"
        );


    if (!root) {

        alert(
            "نظام الحسابات غير جاهز."
        );

        return;

    }


    root.setAttribute(
        "aria-hidden",
        "false"
    );


    root.innerHTML = `

        <div class="modal-backdrop">

            <div
                class="modal-card"
                role="dialog"
                aria-modal="true"
            >

                <button
                    class="modal-close"
                    id="auth-close"
                    type="button"
                >
                    ×
                </button>


                <span class="eyebrow">
                    ZIVOZONE ACCOUNT
                </span>


                <h2 id="auth-title">
                    أنشئ حسابك في ZIVOZONE 🚀
                </h2>


                <p>
                    احفظ تقدمك ومستواك وXP
                    وعملات ZIVO من أي جهاز.
                </p>


                <div
                    class="auth-tabs"
                    style="
                        display:flex;
                        gap:10px;
                        margin:20px 0;
                    "
                >

                    <button
                        id="register-tab"
                        class="btn btn-primary"
                        type="button"
                    >
                        إنشاء حساب
                    </button>

                    <button
                        id="login-tab"
                        class="btn btn-ghost"
                        type="button"
                    >
                        تسجيل الدخول
                    </button>

                </div>


                <form id="register-form">

                    <input
                        id="auth-name"
                        type="text"
                        maxlength="50"
                        placeholder="اسم اللاعب"
                        required
                    >


                    <input
                        id="auth-email"
                        type="email"
                        maxlength="120"
                        placeholder="البريد الإلكتروني"
                        required
                    >


                    <input
                        id="auth-age"
                        type="number"
                        min="5"
                        max="100"
                        placeholder="العمر"
                        required
                    >


                    <input
                        id="auth-password"
                        type="password"
                        minlength="6"
                        maxlength="100"
                        placeholder="كلمة المرور"
                        required
                    >


                    <button
                        class="btn btn-primary full"
                        type="submit"
                    >
                        🚀 إنشاء حساب
                    </button>

                </form>


                <form
                    id="login-form"
                    hidden
                >

                    <input
                        id="login-email"
                        type="email"
                        placeholder="البريد الإلكتروني"
                        required
                    >


                    <input
                        id="login-password"
                        type="password"
                        placeholder="كلمة المرور"
                        required
                    >


                    <button
                        class="btn btn-primary full"
                        type="submit"
                    >
                        🔐 تسجيل الدخول
                    </button>

                </form>

            </div>

        </div>

    `;


    document
        .getElementById(
            "auth-close"
        )
        .addEventListener(
            "click",
            closeAuthModal
        );


    const registerTab =
        document.getElementById(
            "register-tab"
        );


    const loginTab =
        document.getElementById(
            "login-tab"
        );


    const registerForm =
        document.getElementById(
            "register-form"
        );


    const loginForm =
        document.getElementById(
            "login-form"
        );


    registerTab.addEventListener(
        "click",
        () => {

            registerForm.hidden =
                false;

            loginForm.hidden =
                true;

            registerTab.className =
                "btn btn-primary";

            loginTab.className =
                "btn btn-ghost";

        }
    );


    loginTab.addEventListener(
        "click",
        () => {

            registerForm.hidden =
                true;

            loginForm.hidden =
                false;

            registerTab.className =
                "btn btn-ghost";

            loginTab.className =
                "btn btn-primary";

        }
    );


    registerForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const button =
                registerForm.querySelector(
                    "button"
                );


            button.disabled =
                true;


            try {

                await registerPlayer({

                    name:
                        document
                            .getElementById(
                                "auth-name"
                            )
                            .value,

                    email:
                        document
                            .getElementById(
                                "auth-email"
                            )
                            .value,

                    password:
                        document
                            .getElementById(
                                "auth-password"
                            )
                            .value,

                    age:
                        document
                            .getElementById(
                                "auth-age"
                            )
                            .value

                });


                closeAuthModal();


                notify(
                    "تم إنشاء حسابك بنجاح 🎉"
                );


            } catch (error) {

                notify(
                    error.message,
                    "error"
                );

            } finally {

                button.disabled =
                    false;

            }

        }
    );


    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const button =
                loginForm.querySelector(
                    "button"
                );


            button.disabled =
                true;


            try {

                await loginPlayer(

                    document
                        .getElementById(
                            "login-email"
                        )
                        .value,

                    document
                        .getElementById(
                            "login-password"
                        )
                        .value

                );


                closeAuthModal();


                notify(
                    "أهلًا بعودتك 👋"
                );


            } catch (error) {

                notify(
                    error.message,
                    "error"
                );

            } finally {

                button.disabled =
                    false;

            }

        }
    );

}


/* ============================================================
   CLOSE MODAL
============================================================ */

function closeAuthModal() {

    const root =
        document.getElementById(
            "modal-root"
        );


    if (!root) {
        return;
    }


    root.innerHTML =
        "";

    root.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* ============================================================
   NOTIFICATION
============================================================ */

function notify(

    message,

    type = "success"

) {

    if (
        typeof window.zivoToast ===
        "function"
    ) {

        window.zivoToast(
            message,
            type
        );

        return;

    }


    alert(message);

}


/* ============================================================
   GLOBAL API
============================================================ */

window.ZIVOZONE_AUTH = {

    registerPlayer,

    loginPlayer,

    logoutPlayer,

    getCurrentPlayer,

    updatePlayerData,

    open:
        showAuthModal,

    close:
        closeAuthModal

};


/*
 * توافق مع app.js القديم
 */

window.ZivoAuth = {

    open:
        showAuthModal,

    close:
        closeAuthModal,

    register:
        registerPlayer,

    login:
        loginPlayer,

    logout:
        logoutPlayer,

    getCurrentUser:
        () => auth.currentUser,

    isLoggedIn:
        () => Boolean(
            auth.currentUser
        )

};


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const loginButton =
            document.getElementById(
                "login-btn"
            );


        if (loginButton) {

            loginButton.addEventListener(
                "click",
                showAuthModal
            );

        }

    }
);


console.log(
    "🚀 ZIVOZONE Authentication Engine Ready"
);
