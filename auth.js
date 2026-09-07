"use strict";

/*
 * =========================================================
 * ZIVOZONE AUTH SYSTEM
 * =========================================================
 *
 * يدعم:
 * 1. Firebase Authentication عند توفر إعدادات Firebase.
 * 2. وضع تجريبي محلي Local Demo Mode عند عدم توفر Firebase.
 *
 * لا يتم تخزين كلمات المرور في LocalStorage.
 * في الوضع التجريبي يتم استخدام كلمة المرور فقط للتحقق
 * أثناء جلسة المتصفح، ولا يتم عرضها للمستخدم.
 * =========================================================
 */

(function () {

    const STORAGE_KEY = "zivozone_demo_user";

    let firebaseReady = false;
    let auth = null;
    let db = null;

    let currentUser = null;


    /* =====================================================
       HELPERS
    ===================================================== */

    function $(id) {
        return document.getElementById(id);
    }


    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function showToast(message, type = "success") {

        if (typeof window.zivoToast === "function") {

            window.zivoToast(
                message,
                type
            );

            return;
        }

        const container =
            $("toast-container");

        if (!container) {
            alert(message);
            return;
        }

        const toast =
            document.createElement("div");

        toast.className =
            `toast ${type}`;

        toast.textContent =
            message;

        container.appendChild(toast);

        setTimeout(() => {

            toast.remove();

        }, 3500);
    }


    function getDemoUser() {

        try {

            const raw =
                localStorage.getItem(
                    STORAGE_KEY
                );

            if (!raw) {
                return null;
            }

            return JSON.parse(raw);

        } catch (error) {

            console.error(
                "ZIVOZONE demo user error:",
                error
            );

            localStorage.removeItem(
                STORAGE_KEY
            );

            return null;
        }
    }


    function saveDemoUser(user) {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(user)
        );
    }


    function clearDemoUser() {

        localStorage.removeItem(
            STORAGE_KEY
        );
    }


    /* =====================================================
       FIREBASE INITIALIZATION
    ===================================================== */

    function initializeFirebase() {

        try {

            if (
                typeof firebase === "undefined"
            ) {

                console.warn(
                    "Firebase SDK غير موجود."
                );

                return false;
            }


            const config =
                window.ZIVOZONE_FIREBASE_CONFIG;


            if (
                !config ||
                !config.apiKey ||
                !config.authDomain ||
                !config.projectId
            ) {

                console.info(
                    "ZIVOZONE يعمل في Demo Mode."
                );

                return false;
            }


            if (
                !firebase.apps.length
            ) {

                firebase.initializeApp(
                    config
                );

            }


            auth =
                firebase.auth();

            db =
                firebase.firestore();

            firebaseReady = true;


            auth.onAuthStateChanged(
                handleFirebaseAuthState
            );


            return true;

        } catch (error) {

            console.error(
                "Firebase initialization failed:",
                error
            );

            firebaseReady = false;

            return false;
        }
    }


    /* =====================================================
       FIREBASE AUTH STATE
    ===================================================== */

    function handleFirebaseAuthState(user) {

        if (!user) {

            currentUser = null;

            updateAuthUI();

            return;
        }


        currentUser = {

            uid: user.uid,

            email:
                user.email || "",

            displayName:
                user.displayName ||
                "لاعب ZIVOZONE",

            mode: "firebase"

        };


        updateAuthUI();


        loadFirebasePlayer(
            user
        );
    }


    /* =====================================================
       LOAD FIREBASE PLAYER
    ===================================================== */

    async function loadFirebasePlayer(user) {

        if (!db) {
            return;
        }


        try {

            const ref =
                db.collection("players")
                    .doc(user.uid);


            const snapshot =
                await ref.get();


            if (!snapshot.exists) {

                await ref.set({

                    uid: user.uid,

                    name:
                        user.displayName ||
                        "لاعب ZIVOZONE",

                    email:
                        user.email || "",

                    age: 18,

                    level: 1,

                    xp: 0,

                    coins: 0,

                    wins: 0,

                    createdAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp(),

                    updatedAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                });

            }

        } catch (error) {

            console.error(
                "Player profile error:",
                error
            );
        }
    }


    /* =====================================================
       REGISTER
    ===================================================== */

    async function registerUser(
        name,
        email,
        password,
        age
    ) {

        name =
            String(name || "")
                .trim();

        email =
            String(email || "")
                .trim()
                .toLowerCase();

        password =
            String(password || "");

        age =
            Number(age);


        if (name.length < 2) {

            throw new Error(
                "اكتب اسمًا صحيحًا."
            );
        }


        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                .test(email)
        ) {

            throw new Error(
                "أدخل بريدًا إلكترونيًا صحيحًا."
            );
        }


        if (password.length < 6) {

            throw new Error(
                "كلمة المرور يجب أن تكون 6 أحرف على الأقل."
            );
        }


        if (
            !Number.isFinite(age) ||
            age < 5 ||
            age > 100
        ) {

            throw new Error(
                "أدخل عمرًا بين 5 و100 سنة."
            );
        }


        /* Firebase */

        if (firebaseReady) {

            try {

                const credential =
                    await auth.createUserWithEmailAndPassword(
                        email,
                        password
                    );


                const user =
                    credential.user;


                await user.updateProfile({

                    displayName: name

                });


                if (db) {

                    await db
                        .collection("players")
                        .doc(user.uid)
                        .set({

                            uid: user.uid,

                            name: name,

                            email: email,

                            age: age,

                            level: 1,

                            xp: 0,

                            coins: 0,

                            wins: 0,

                            createdAt:
                                firebase
                                    .firestore
                                    .FieldValue
                                    .serverTimestamp(),

                            updatedAt:
                                firebase
                                    .firestore
                                    .FieldValue
                                    .serverTimestamp()

                        });

                }


                closeAuthModal();

                showToast(
                    "تم إنشاء حسابك بنجاح 🎉",
                    "success"
                );


                return true;

            } catch (error) {

                throw new Error(
                    firebaseErrorMessage(
                        error
                    )
                );
            }
        }


        /* Demo Mode */

        const existing =
            getDemoUser();


        if (
            existing &&
            existing.email === email
        ) {

            throw new Error(
                "هذا البريد مسجل بالفعل."
            );
        }


        const user = {

            uid:
                `demo_${Date.now()}`,

            name: name,

            email: email,

            age: age,

            level: 1,

            xp: 0,

            coins: 0,

            wins: 0,

            createdAt:
                new Date().toISOString(),

            mode: "demo"

        };


        saveDemoUser(user);

        currentUser = user;


        closeAuthModal();

        updateAuthUI();


        showToast(
            "تم إنشاء حسابك بنجاح 🎉",
            "success"
        );


        if (
            typeof window.zivoLoadPlayer ===
            "function"
        ) {

            window.zivoLoadPlayer(
                user
            );

        }


        return true;
    }


    /* =====================================================
       LOGIN
    ===================================================== */

    async function loginUser(
        email,
        password
    ) {

        email =
            String(email || "")
                .trim()
                .toLowerCase();

        password =
            String(password || "");


        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                .test(email)
        ) {

            throw new Error(
                "أدخل بريدًا إلكترونيًا صحيحًا."
            );
        }


        if (!password) {

            throw new Error(
                "أدخل كلمة المرور."
            );
        }


        /* Firebase */

        if (firebaseReady) {

            try {

                await auth
                    .signInWithEmailAndPassword(
                        email,
                        password
                    );


                closeAuthModal();

                showToast(
                    "تم تسجيل الدخول بنجاح 👋",
                    "success"
                );


                return true;

            } catch (error) {

                throw new Error(
                    firebaseErrorMessage(
                        error
                    )
                );
            }
        }


        /* Demo Mode */

        const user =
            getDemoUser();


        if (!user) {

            throw new Error(
                "لا يوجد حساب تجريبي. أنشئ حسابًا أولًا."
            );
        }


        if (
            user.email !== email
        ) {

            throw new Error(
                "البريد الإلكتروني غير صحيح."
            );
        }


        /*
         * Demo Mode:
         * لا نعتمد على كلمة مرور مخزنة في المتصفح.
         * الهدف هنا اختبار تدفق الموقع فقط.
         */

        currentUser = user;


        closeAuthModal();

        updateAuthUI();


        showToast(
            "تم تسجيل الدخول بنجاح 👋",
            "success"
        );


        if (
            typeof window.zivoLoadPlayer ===
            "function"
        ) {

            window.zivoLoadPlayer(
                user
            );

        }


        return true;
    }


    /* =====================================================
       LOGOUT
    ===================================================== */

    async function logoutUser() {

        try {

            if (firebaseReady && auth) {

                await auth.signOut();

            } else {

                clearDemoUser();

                currentUser = null;

            }


            updateAuthUI();


            showToast(
                "تم تسجيل الخروج.",
                "success"
            );


        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

            showToast(
                "حدث خطأ أثناء تسجيل الخروج.",
                "error"
            );
        }
    }


    /* =====================================================
       FIREBASE ERROR MESSAGES
    ===================================================== */

    function firebaseErrorMessage(error) {

        const code =
            error &&
            error.code
                ? error.code
                : "";


        const messages = {

            "auth/email-already-in-use":
                "هذا البريد مستخدم بالفعل.",

            "auth/invalid-email":
                "البريد الإلكتروني غير صحيح.",

            "auth/weak-password":
                "كلمة المرور ضعيفة.",

            "auth/user-not-found":
                "لا يوجد حساب بهذا البريد.",

            "auth/wrong-password":
                "كلمة المرور غير صحيحة.",

            "auth/invalid-credential":
                "بيانات الدخول غير صحيحة.",

            "auth/too-many-requests":
                "محاولات كثيرة. حاول لاحقًا.",

            "auth/network-request-failed":
                "تعذر الاتصال بالإنترنت."

        };


        return (
            messages[code] ||
            "تعذر تنفيذ العملية. حاول مرة أخرى."
        );
    }


    /* =====================================================
       AUTH MODAL
    ===================================================== */

    function openAuthModal() {

        const root =
            $("modal-root");


        if (!root) {
            return;
        }


        root.setAttribute(
            "aria-hidden",
            "false"
        );


        root.innerHTML = `

            <div
                class="modal-backdrop"
                data-close-modal
            >

                <div
                    class="modal-card"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="auth-title"
                    onclick="event.stopPropagation()"
                >

                    <button
                        class="modal-close"
                        type="button"
                        data-close-auth
                        aria-label="إغلاق"
                    >
                        ×
                    </button>


                    <span class="eyebrow">
                        ZIVOZONE ACCOUNT
                    </span>


                    <h2 id="auth-title">
                        أهلاً بك في ZIVOZONE 👋
                    </h2>


                    <p>
                        أنشئ حسابك مجانًا واحفظ
                        مستواك وXP وZIVO وانتصاراتك.
                    </p>


                    <div class="auth-tabs">

                        <button
                            id="tab-register"
                            class="btn btn-primary"
                            type="button"
                        >
                            إنشاء حساب
                        </button>


                        <button
                            id="tab-login"
                            class="btn btn-ghost"
                            type="button"
                        >
                            تسجيل الدخول
                        </button>

                    </div>


                    <form
                        id="register-form"
                    >

                        <input
                            id="register-name"
                            type="text"
                            maxlength="50"
                            autocomplete="name"
                            placeholder="اسم اللاعب"
                            required
                        >


                        <input
                            id="register-email"
                            type="email"
                            maxlength="120"
                            autocomplete="email"
                            placeholder="البريد الإلكتروني"
                            required
                        >


                        <input
                            id="register-age"
                            type="number"
                            min="5"
                            max="100"
                            placeholder="العمر"
                            required
                        >


                        <input
                            id="register-password"
                            type="password"
                            minlength="6"
                            maxlength="100"
                            autocomplete="new-password"
                            placeholder="كلمة المرور — 6 أحرف على الأقل"
                            required
                        >


                        <button
                            class="btn btn-primary"
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
                            maxlength="120"
                            autocomplete="email"
                            placeholder="البريد الإلكتروني"
                            required
                        >


                        <input
                            id="login-password"
                            type="password"
                            maxlength="100"
                            autocomplete="current-password"
                            placeholder="كلمة المرور"
                            required
                        >


                        <button
                            class="btn btn-primary"
                            type="submit"
                        >
                            🔐 دخول
                        </button>

                    </form>


                    <div
                        class="notice"
                        style="margin-top:16px"
                    >

                        ${
                            firebaseReady
                                ? "الحسابات مرتبطة بـ Firebase."
                                : "الوضع الحالي تجريبي محلي. سنربط Firebase بالكامل لاحقًا."
                        }

                    </div>

                </div>

            </div>

        `;


        bindAuthModal();


        setTimeout(() => {

            const input =
                $("register-name");

            if (input) {
                input.focus();
            }

        }, 50);
    }


    function bindAuthModal() {

        const root =
            $("modal-root");


        if (!root) {
            return;
        }


        const registerTab =
            $("tab-register");


        const loginTab =
            $("tab-login");


        const registerForm =
            $("register-form");


        const loginForm =
            $("login-form");


        const closeButton =
            root.querySelector(
                "[data-close-auth]"
            );


        const backdrop =
            root.querySelector(
                "[data-close-modal]"
            );


        if (registerTab) {

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

        }


        if (loginTab) {

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

                    const email =
                        $("login-email");

                    if (email) {
                        email.focus();
                    }

                }
            );

        }


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeAuthModal
            );

        }


        if (backdrop) {

            backdrop.addEventListener(
                "click",
                closeAuthModal
            );

        }


        if (registerForm) {

            registerForm.addEventListener(
                "submit",
                async function (event) {

                    event.preventDefault();


                    const button =
                        registerForm.querySelector(
                            "button[type='submit']"
                        );


                    if (button) {
                        button.disabled = true;
                    }


                    try {

                        await registerUser(

                            $("register-name").value,

                            $("register-email").value,

                            $("register-password").value,

                            $("register-age").value

                        );

                    } catch (error) {

                        console.error(error);

                        showToast(
                            error.message ||
                            "تعذر إنشاء الحساب.",
                            "error"
                        );

                    } finally {

                        if (button) {
                            button.disabled = false;
                        }

                    }

                }
            );

        }


        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                async function (event) {

                    event.preventDefault();


                    const button =
                        loginForm.querySelector(
                            "button[type='submit']"
                        );


                    if (button) {
                        button.disabled = true;
                    }


                    try {

                        await loginUser(

                            $("login-email").value,

                            $("login-password").value

                        );

                    } catch (error) {

                        console.error(error);

                        showToast(
                            error.message ||
                            "تعذر تسجيل الدخول.",
                            "error"
                        );

                    } finally {

                        if (button) {
                            button.disabled = false;
                        }

                    }

                }
            );

        }


        document.addEventListener(
            "keydown",
            handleEscapeKey,
            {
                once: true
            }
        );
    }


    function handleEscapeKey(event) {

        if (
            event.key === "Escape"
        ) {

            closeAuthModal();

        }
    }


    function closeAuthModal() {

        const root =
            $("modal-root");


        if (!root) {
            return;
        }


        root.setAttribute(
            "aria-hidden",
            "true"
        );


        root.innerHTML = "";
    }


    /* =====================================================
       AUTH UI
    ===================================================== */

    function updateAuthUI() {

        const loginButton =
            $("login-btn");


        const logoutButton =
            $("logout-btn");


        const name =
            $("profile-name");


        const email =
            $("profile-email");


        if (currentUser) {

            if (loginButton) {

                loginButton.textContent =
                    `👤 ${currentUser.displayName || currentUser.name || "حسابي"}`;

            }


            if (logoutButton) {

                logoutButton.hidden =
                    false;

            }


            if (name) {

                name.textContent =
                    currentUser.displayName ||
                    currentUser.name ||
                    "لاعب ZIVOZONE";

            }


            if (email) {

                email.textContent =
                    currentUser.email ||
                    "";

            }


            document.body.classList.add(
                "authenticated"
            );

        } else {

            if (loginButton) {

                loginButton.textContent =
                    "🔐 إنشاء حساب / دخول";

            }


            if (logoutButton) {

                logoutButton.hidden =
                    true;

            }


            if (name) {

                name.textContent =
                    "زائر";

            }


            if (email) {

                email.textContent =
                    "سجل حسابك لحفظ تقدمك.";

            }


            document.body.classList.remove(
                "authenticated"
            );
        }
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    window.ZivoAuth = {

        open:
            openAuthModal,

        close:
            closeAuthModal,

        register:
            registerUser,

        login:
            loginUser,

        logout:
            logoutUser,

        getCurrentUser:
            function () {
                return currentUser;
            },

        isLoggedIn:
            function () {
                return Boolean(
                    currentUser
                );
            },

        isFirebase:
            function () {
                return firebaseReady;
            }

    };


    /* =====================================================
       INITIALIZE
    ===================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            initializeFirebase();


            if (!firebaseReady) {

                currentUser =
                    getDemoUser();

                updateAuthUI();

            }


            const loginButton =
                $("login-btn");


            if (loginButton) {

                loginButton.addEventListener(
                    "click",
                    openAuthModal
                );

            }


            const logoutButton =
                $("logout-btn");


            if (logoutButton) {

                logoutButton.addEventListener(
                    "click",
                    logoutUser
                );

            }

        }
    );


})();
