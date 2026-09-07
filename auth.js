/* =========================================================
   ZIVOZONE - AUTHENTICATION SYSTEM
   Firebase Authentication + Firestore
   ========================================================= */

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp
} from
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* =========================================================
   FIREBASE CONFIG
   ========================================================= */

const firebaseConfig = {
    apiKey: "AIzaSyC8aY0v9dR2mF1kJ7xP0qW3nL6sT4uV8z",
    authDomain: "zivozone-7f3a2.firebaseapp.com",
    projectId: "zivozone-7f3a2",
    storageBucket: "zivozone-7f3a2.firebasestorage.app",
    messagingSenderId: "582019374661",
    appId: "1:582019374661:web:8c2f0a7c1d9b6e5f4a3c2b"
};


/* =========================================================
   INITIALIZE FIREBASE
   ========================================================= */

let firebaseApp;
let auth;
let db;

try {

    firebaseApp = initializeApp(firebaseConfig);

    auth = getAuth(firebaseApp);

    db = getFirestore(firebaseApp);

    console.log("ZIVOZONE Firebase initialized successfully.");

} catch (error) {

    console.error(
        "ZIVOZONE Firebase initialization error:",
        error
    );

    showToast(
        "تعذر الاتصال بخدمة الحسابات.",
        "error"
    );
}


/* =========================================================
   GLOBAL STATE
   ========================================================= */

let currentUser = null;

let currentPlayer = null;


/* =========================================================
   DEFAULT PLAYER
   ========================================================= */

const DEFAULT_PLAYER = {
    displayName: "Player",
    age: null,

    level: 1,
    xp: 0,

    coins: 0,
    wins: 0,

    gamesPlayed: 0,

    identityTests: 0,

    createdAt: null,
    updatedAt: null
};


/* =========================================================
   DOM HELPERS
   ========================================================= */

function getElement(id) {

    return document.getElementById(id);
}


function setText(id, value) {

    const element = getElement(id);

    if (!element) {
        return;
    }

    element.textContent = String(value ?? "");
}


function showElement(id) {

    const element = getElement(id);

    if (!element) {
        return;
    }

    element.hidden = false;
}


function hideElement(id) {

    const element = getElement(id);

    if (!element) {
        return;
    }

    element.hidden = true;
}


/* =========================================================
   TOAST SYSTEM
   ========================================================= */

function showToast(message, type = "info") {

    const container =
        getElement("toast-container");

    if (!container) {
        console.log(message);
        return;
    }


    const toast =
        document.createElement("div");

    toast.className =
        `toast toast-${type}`;

    toast.textContent =
        message;


    container.appendChild(toast);


    window.setTimeout(() => {

        toast.classList.add("is-visible");

    }, 20);


    window.setTimeout(() => {

        toast.classList.remove("is-visible");

        window.setTimeout(() => {

            toast.remove();

        }, 300);

    }, 3500);
}


/* =========================================================
   FIREBASE ERROR TRANSLATION
   ========================================================= */

function getFirebaseErrorMessage(error) {

    const code = error?.code || "";


    const messages = {

        "auth/email-already-in-use":
            "هذا البريد الإلكتروني مستخدم مسبقًا.",

        "auth/invalid-email":
            "البريد الإلكتروني غير صحيح.",

        "auth/weak-password":
            "كلمة المرور ضعيفة. استخدم 6 أحرف على الأقل.",

        "auth/user-not-found":
            "لا يوجد حساب بهذا البريد الإلكتروني.",

        "auth/wrong-password":
            "كلمة المرور غير صحيحة.",

        "auth/invalid-credential":
            "البريد الإلكتروني أو كلمة المرور غير صحيحة.",

        "auth/too-many-requests":
            "تم إجراء محاولات كثيرة. حاول لاحقًا.",

        "auth/network-request-failed":
            "تعذر الاتصال بالإنترنت.",

        "auth/operation-not-allowed":
            "طريقة تسجيل الدخول هذه غير مفعلة في Firebase.",

        "auth/user-disabled":
            "هذا الحساب تم تعطيله.",

        "permission-denied":
            "ليس لديك صلاحية للوصول إلى بيانات الحساب.",

        "unavailable":
            "خدمة Firebase غير متاحة حاليًا."

    };


    return (
        messages[code] ||
        "حدث خطأ غير متوقع. حاول مرة أخرى."
    );
}


/* =========================================================
   VALIDATION
   ========================================================= */

function validateEmail(email) {

    const value =
        String(email || "")
            .trim()
            .toLowerCase();


    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}


function validatePassword(password) {

    return String(password || "").length >= 6;
}


function normalizeAge(age) {

    const value =
        Number.parseInt(age, 10);


    if (
        Number.isNaN(value) ||
        value < 5 ||
        value > 100
    ) {

        return null;
    }


    return value;
}


/* =========================================================
   PLAYER LEVEL SYSTEM
   ========================================================= */

function calculateLevel(xp) {

    const safeXP =
        Math.max(0, Number(xp) || 0);


    return Math.floor(
        safeXP / 500
    ) + 1;
}


function calculateXPToNextLevel(level) {

    const safeLevel =
        Math.max(1, Number(level) || 1);


    return safeLevel * 500;
}


/* =========================================================
   LOAD PLAYER FROM FIRESTORE
   ========================================================= */

async function loadPlayer(uid) {

    if (!db || !uid) {
        return null;
    }


    try {

        const playerRef =
            doc(
                db,
                "players",
                uid
            );


        const snapshot =
            await getDoc(playerRef);


        if (!snapshot.exists()) {

            return null;
        }


        return {
            ...DEFAULT_PLAYER,
            ...snapshot.data()
        };

    } catch (error) {

        console.error(
            "Failed to load player:",
            error
        );

        showToast(
            getFirebaseErrorMessage(error),
            "error"
        );

        return null;
    }
}


/* =========================================================
   CREATE PLAYER DOCUMENT
   ========================================================= */

async function createPlayerDocument(
    user,
    extraData = {}
) {

    if (!db || !user?.uid) {

        throw new Error(
            "Firebase Firestore is not available."
        );
    }


    const playerRef =
        doc(
            db,
            "players",
            user.uid
        );


    const player = {

        ...DEFAULT_PLAYER,

        displayName:
            extraData.displayName ||
            user.displayName ||
            "Player",

        age:
            normalizeAge(
                extraData.age
            ),

        createdAt:
            serverTimestamp(),

        updatedAt:
            serverTimestamp()
    };


    await setDoc(
        playerRef,
        player
    );


    return player;
}


/* =========================================================
   UPDATE PLAYER
   ========================================================= */

async function updatePlayer(
    updates = {}
) {

    if (
        !db ||
        !currentUser?.uid
    ) {

        throw new Error(
            "لا يوجد لاعب مسجل الدخول."
        );
    }


    const safeUpdates = {
        ...updates,
        updatedAt: serverTimestamp()
    };


    const playerRef =
        doc(
            db,
            "players",
            currentUser.uid
        );


    await updateDoc(
        playerRef,
        safeUpdates
    );


    currentPlayer = {
        ...currentPlayer,
        ...updates
    };


    updatePlayerUI();

    return currentPlayer;
}


/* =========================================================
   REGISTER
   ========================================================= */

async function registerUser({
    email,
    password,
    displayName,
    age
}) {

    if (!auth) {

        throw new Error(
            "Firebase Authentication غير جاهز."
        );
    }


    const cleanEmail =
        String(email || "")
            .trim()
            .toLowerCase();


    const cleanName =
        String(displayName || "")
            .trim()
            .slice(0, 50);


    const cleanAge =
        normalizeAge(age);


    if (!validateEmail(cleanEmail)) {

        showToast(
            "أدخل بريدًا إلكترونيًا صحيحًا.",
            "error"
        );

        return null;
    }


    if (!validatePassword(password)) {

        showToast(
            "كلمة المرور يجب أن تكون 6 أحرف على الأقل.",
            "error"
        );

        return null;
    }


    if (!cleanName) {

        showToast(
            "اكتب اسم اللاعب.",
            "error"
        );

        return null;
    }


    if (cleanAge === null) {

        showToast(
            "أدخل عمرًا صحيحًا بين 5 و100 سنة.",
            "error"
        );

        return null;
    }


    try {

        const credential =
            await createUserWithEmailAndPassword(
                auth,
                cleanEmail,
                password
            );


        const user =
            credential.user;


        await updateProfile(
            user,
            {
                displayName: cleanName
            }
        );


        await createPlayerDocument(
            user,
            {
                displayName: cleanName,
                age: cleanAge
            }
        );


        showToast(
            "تم إنشاء حسابك بنجاح 🎉",
            "success"
        );


        closeModal();


        return user;

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );


        showToast(
            getFirebaseErrorMessage(error),
            "error"
        );


        return null;
    }
}


/* =========================================================
   LOGIN
   ========================================================= */

async function loginUser(
    email,
    password
) {

    if (!auth) {

        throw new Error(
            "Firebase Authentication غير جاهز."
        );
    }


    const cleanEmail =
        String(email || "")
            .trim()
            .toLowerCase();


    if (!validateEmail(cleanEmail)) {

        showToast(
            "أدخل بريدًا إلكترونيًا صحيحًا.",
            "error"
        );

        return null;
    }


    if (!password) {

        showToast(
            "أدخل كلمة المرور.",
            "error"
        );

        return null;
    }


    try {

        const credential =
            await signInWithEmailAndPassword(
                auth,
                cleanEmail,
                password
            );


        showToast(
            "تم تسجيل الدخول بنجاح 👋",
            "success"
        );


        closeModal();


        return credential.user;

    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        showToast(
            getFirebaseErrorMessage(error),
            "error"
        );


        return null;
    }
}


/* =========================================================
   LOGOUT
   ========================================================= */

async function logoutUser() {

    if (!auth) {
        return;
    }


    try {

        await signOut(auth);


        currentUser = null;

        currentPlayer = null;


        showToast(
            "تم تسجيل الخروج.",
            "success"
        );


        updatePlayerUI();

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );


        showToast(
            getFirebaseErrorMessage(error),
            "error"
        );
    }
}


/* =========================================================
   PLAYER UI
   ========================================================= */

function updatePlayerUI() {

    const player =
        currentPlayer || DEFAULT_PLAYER;


    const isLoggedIn =
        Boolean(currentUser);


    const name =
        isLoggedIn
            ? (
                player.displayName ||
                currentUser.displayName ||
                "Player"
            )
            : "Guest";


    const email =
        isLoggedIn
            ? (
                currentUser.email ||
                "—"
            )
            : "لم يتم تسجيل الدخول";


    const level =
        isLoggedIn
            ? calculateLevel(player.xp)
            : 1;


    const xp =
        isLoggedIn
            ? Number(player.xp) || 0
            : 0;


    const coins =
        isLoggedIn
            ? Number(player.coins) || 0
            : 0;


    const wins =
        isLoggedIn
            ? Number(player.wins) || 0
            : 0;


    /* Profile */

    setText(
        "profile-name",
        name
    );

    setText(
        "profile-email",
        email
    );

    setText(
        "profile-level",
        level
    );

    setText(
        "profile-xp",
        xp
    );

    setText(
        "profile-coins",
        coins
    );

    setText(
        "profile-wins",
        wins
    );


    /* Quick player */

    setText(
        "quick-player-name",
        name
    );

    setText(
        "quick-level",
        level
    );

    setText(
        "quick-xp",
        xp
    );

    setText(
        "quick-coins",
        coins
    );


    /* Economy */

    setText(
        "economy-coins",
        coins
    );

    setText(
        "economy-xp",
        xp
    );

    setText(
        "economy-wins",
        wins
    );


    /* Level chip */

    const levelChip =
        getElement(
            "player-level-chip"
        );


    if (levelChip) {

        levelChip.textContent =
            `Level ${level}`;
    }


    /* Progress */

    const currentLevelXP =
        (level - 1) * 500;


    const nextLevelXP =
        calculateXPToNextLevel(level);


    const progress =
        Math.min(
            100,
            Math.max(
                0,
                (
                    (xp - currentLevelXP) /
                    (nextLevelXP - currentLevelXP)
                ) * 100
            )
        );


    const progressBar =
        getElement(
            "xp-progress"
        );


    if (progressBar) {

        progressBar.style.width =
            `${progress}%`;
    }


    const progressContainer =
        document.querySelector(
            '[role="progressbar"]'
        );


    if (progressContainer) {

        progressContainer.setAttribute(
            "aria-valuenow",
            String(Math.round(progress))
        );
    }


    /* Login / Logout */

    const loginButtons =
        document.querySelectorAll(
            '[data-action="login"]'
        );


    loginButtons.forEach(
        button => {

            if (isLoggedIn) {

                button.textContent =
                    "حسابي";

            } else {

                button.textContent =
                    "تسجيل الدخول";
            }
        }
    );


    if (isLoggedIn) {

        showElement(
            "logout-btn"
        );

    } else {

        hideElement(
            "logout-btn"
        );
    }


    /* Profile notice */

    const note =
        getElement(
            "profile-note"
        );


    if (note) {

        note.textContent =
            isLoggedIn
                ? "حسابك متصل الآن ويتم حفظ تقدمك على ZIVOZONE."
                : "سجّل حسابك لحفظ تقدمك وملفك بشكل دائم.";
    }
}


/* =========================================================
   LOGIN / REGISTER MODAL
   ========================================================= */

function openAuthModal(
    mode = "login"
) {

    const root =
        getElement(
            "modal-root"
        );


    if (!root) {
        return;
    }


    root.innerHTML = "";


    const modal =
        document.createElement("div");


    modal.className =
        "modal-overlay";


    modal.innerHTML = `
        <div
            class="modal-card auth-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
        >

            <button
                type="button"
                class="modal-close"
                id="auth-close"
                aria-label="إغلاق"
            >
                ×
            </button>


            <div class="modal-header">

                <span class="eyebrow">
                    ZIVOZONE ACCOUNT
                </span>

                <h2 id="auth-modal-title">
                    ${mode === "login"
                        ? "تسجيل الدخول"
                        : "إنشاء حساب جديد"}
                </h2>

                <p>
                    ${mode === "login"
                        ? "ارجع إلى عالمك وأكمل تقدمك."
                        : "أنشئ ملف لاعب واحفظ تقدمك على ZIVOZONE."}
                </p>

            </div>


            <form
                id="auth-form"
                novalidate
            >

                ${
                    mode === "register"
                        ? `
                            <label>
                                اسم اللاعب

                                <input
                                    id="auth-name"
                                    type="text"
                                    maxlength="50"
                                    autocomplete="name"
                                    required
                                    placeholder="اكتب اسمك"
                                >
                            </label>


                            <label>
                                العمر

                                <input
                                    id="auth-age"
                                    type="number"
                                    min="5"
                                    max="100"
                                    autocomplete="bday"
                                    required
                                    placeholder="العمر"
                                >
                            </label>
                        `
                        : ""
                }


                <label>
                    البريد الإلكتروني

                    <input
                        id="auth-email"
                        type="email"
                        maxlength="150"
                        autocomplete="email"
                        required
                        placeholder="name@example.com"
                    >
                </label>


                <label>
                    كلمة المرور

                    <input
                        id="auth-password"
                        type="password"
                        minlength="6"
                        autocomplete="${
                            mode === "login"
                                ? "current-password"
                                : "new-password"
                        }"
                        required
                        placeholder="6 أحرف على الأقل"
                    >
                </label>


                <button
                    id="auth-submit"
                    type="submit"
                    class="btn btn-primary full"
                >
                    ${
                        mode === "login"
                            ? "دخول"
                            : "إنشاء الحساب"
                    }
                </button>

            </form>


            <div class="auth-switch">

                <span>
                    ${
                        mode === "login"
                            ? "ليس لديك حساب؟"
                            : "لديك حساب بالفعل؟"
                    }
                </span>


                <button
                    type="button"
                    id="auth-switch-btn"
                    class="link-button"
                >
                    ${
                        mode === "login"
                            ? "إنشاء حساب"
                            : "تسجيل الدخول"
                    }
                </button>

            </div>

        </div>
    `;


    root.appendChild(modal);


    root.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "modal-open"
    );


    const closeButton =
        getElement(
            "auth-close"
        );


    closeButton?.addEventListener(
        "click",
        closeModal
    );


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                closeModal();
            }
        }
    );


    const switchButton =
        getElement(
            "auth-switch-btn"
        );


    switchButton?.addEventListener(
        "click",
        () => {

            openAuthModal(
                mode === "login"
                    ? "register"
                    : "login"
            );
        }
    );


    const form =
        getElement(
            "auth-form"
        );


    form?.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const submitButton =
                getElement(
                    "auth-submit"
                );


            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "جاري المعالجة...";
            }


            try {

                const email =
                    getElement(
                        "auth-email"
                    )?.value;


                const password =
                    getElement(
                        "auth-password"
                    )?.value;


                if (
                    mode === "register"
                ) {

                    const displayName =
                        getElement(
                            "auth-name"
                        )?.value;


                    const age =
                        getElement(
                            "auth-age"
                        )?.value;


                    await registerUser({

                        email,
                        password,
                        displayName,
                        age

                    });

                } else {

                    await loginUser(
                        email,
                        password
                    );
                }

            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        mode === "login"
                            ? "دخول"
                            : "إنشاء الحساب";
                }
            }
        }
    );


    window.setTimeout(
        () => {

            getElement(
                "auth-email"
            )?.focus();

        },
        50
    );
}


/* =========================================================
   CLOSE MODAL
   ========================================================= */

function closeModal() {

    const root =
        getElement(
            "modal-root"
        );


    if (!root) {
        return;
    }


    root.innerHTML = "";


    root.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "modal-open"
    );
}


/* =========================================================
   LOGIN BUTTONS
   ========================================================= */

function bindAuthButtons() {

    const buttons =
        document.querySelectorAll(
            '[data-action="login"]'
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    if (currentUser) {

                        document
                            .getElementById(
                                "profile"
                            )
                            ?.scrollIntoView({
                                behavior: "smooth"
                            });

                        return;
                    }


                    openAuthModal(
                        "login"
                    );
                }
            );
        }
    );


    const logout =
        getElement(
            "logout-btn"
        );


    logout?.addEventListener(
        "click",
        logoutUser
    );
}


/* =========================================================
   AUTH STATE
   ========================================================= */

function startAuthListener() {

    if (!auth) {
        return;
    }


    onAuthStateChanged(
        auth,
        async user => {

            currentUser =
                user || null;


            if (!user) {

                currentPlayer =
                    null;


                updatePlayerUI();

                return;
            }


            let player =
                await loadPlayer(
                    user.uid
                );


            /*
             * إذا كان المستخدم موجودًا في Authentication
             * ولكن لا يوجد له ملف Firestore، ننشئ الملف.
             */

            if (!player) {

                try {

                    player =
                        await createPlayerDocument(
                            user,
                            {
                                displayName:
                                    user.displayName ||
                                    "Player"
                            }
                        );

                } catch (error) {

                    console.error(
                        "Player creation error:",
                        error
                    );

                    player =
                        {
                            ...DEFAULT_PLAYER,

                            displayName:
                                user.displayName ||
                                "Player"
                        };
                }
            }


            currentPlayer =
                player;


            updatePlayerUI();


            console.log(
                "ZIVOZONE user:",
                user.email
            );
        }
    );
}


/* =========================================================
   PUBLIC API
   app.js يستطيع استخدامها عبر window.ZIVOAuth
   ========================================================= */

window.ZIVOAuth = {

    getCurrentUser() {

        return currentUser;
    },


    getCurrentPlayer() {

        return currentPlayer;
    },


    login: loginUser,


    register: registerUser,


    logout: logoutUser,


    updatePlayer,


    loadPlayer,


    openLogin() {

        openAuthModal(
            "login"
        );
    },


    openRegister() {

        openAuthModal(
            "register"
        );
    },


    closeModal
};


/* =========================================================
   INITIALIZATION
   ========================================================= */

function initializeAuth() {

    bindAuthButtons();

    startAuthListener();

    updatePlayerUI();


    /*
     * نترك app.js يعمل بشكل مستقل.
     * هذا يمنع نظام المصادقة من إيقاف الموقع
     * إذا حدث خطأ في Firebase.
     */

    console.log(
        "ZIVOZONE Auth system ready."
    );
}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeAuth,
        {
            once: true
        }
    );

} else {

    initializeAuth();
}
