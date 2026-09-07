// ============================================================
// ZIVOZONE - Authentication System
// ============================================================

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase-config.js";

// ============================================================
// Configuration
// ============================================================

const USERS_COLLECTION = "users";

// ============================================================
// Helpers
// ============================================================

function getElement(...ids) {
    for (const id of ids) {
        const element = document.getElementById(id);

        if (element) {
            return element;
        }
    }

    return null;
}

function showMessage(message, type = "info") {
    let box = document.getElementById("authMessage");

    if (!box) {
        box = document.createElement("div");
        box.id = "authMessage";

        box.style.position = "fixed";
        box.style.left = "20px";
        box.style.bottom = "20px";
        box.style.zIndex = "99999";
        box.style.padding = "12px 18px";
        box.style.borderRadius = "12px";
        box.style.fontFamily = "Arial, sans-serif";
        box.style.fontSize = "14px";
        box.style.maxWidth = "350px";
        box.style.direction = "rtl";
        box.style.background = "#17152a";
        box.style.color = "#ffffff";
        box.style.boxShadow = "0 10px 30px rgba(0,0,0,.3)";

        document.body.appendChild(box);
    }

    box.textContent = message;

    if (type === "error") {
        box.style.border = "1px solid #ff4d6d";
    } else if (type === "success") {
        box.style.border = "1px solid #35d07f";
    } else {
        box.style.border = "1px solid #7c5cff";
    }

    box.style.display = "block";

    clearTimeout(box._timer);

    box._timer = setTimeout(() => {
        box.style.display = "none";
    }, 4500);
}

// ============================================================
// Firebase error translation
// ============================================================

function translateFirebaseError(error) {
    const code = error?.code || "";

    const messages = {
        "auth/email-already-in-use":
            "هذا البريد الإلكتروني مستخدم مسبقًا.",

        "auth/invalid-email":
            "البريد الإلكتروني غير صحيح.",

        "auth/weak-password":
            "كلمة المرور ضعيفة. استخدم كلمة مرور أقوى.",

        "auth/user-not-found":
            "لا يوجد حساب بهذا البريد الإلكتروني.",

        "auth/wrong-password":
            "كلمة المرور غير صحيحة.",

        "auth/invalid-credential":
            "البريد الإلكتروني أو كلمة المرور غير صحيحة.",

        "auth/too-many-requests":
            "تمت محاولات كثيرة. حاول مرة أخرى لاحقًا.",

        "auth/network-request-failed":
            "حدثت مشكلة في الاتصال بالإنترنت.",

        "auth/operation-not-allowed":
            "تسجيل الدخول بالبريد الإلكتروني غير مفعّل في Firebase."
    };

    return messages[code] || "حدث خطأ غير متوقع. حاول مرة أخرى.";
}

// ============================================================
// Create user profile in Firestore
// ============================================================

async function createUserProfile(user, extraData = {}) {
    if (!user) {
        throw new Error("لم يتم العثور على المستخدم.");
    }

    const userRef = doc(db, USERS_COLLECTION, user.uid);

    const existingUser = await getDoc(userRef);

    if (existingUser.exists()) {
        return existingUser.data();
    }

    const profile = {
        uid: user.uid,

        email: user.email || "",

        displayName:
            extraData.displayName ||
            user.displayName ||
            "لاعب ZIVOZONE",

        age:
            Number(extraData.age) > 0
                ? Number(extraData.age)
                : null,

        level: "beginner",

        xp: 0,

        score: 0,

        zivoCoins: 0,

        gamesPlayed: 0,

        gamesWon: 0,

        dailyChallengesCompleted: 0,

        createdAt: serverTimestamp(),

        updatedAt: serverTimestamp()
    };

    await setDoc(userRef, profile);

    return profile;
}

// ============================================================
// Register
// ============================================================

async function registerUser() {
    const emailInput = getElement(
        "registerEmail",
        "signupEmail",
        "email"
    );

    const passwordInput = getElement(
        "registerPassword",
        "signupPassword",
        "password"
    );

    const nameInput = getElement(
        "registerName",
        "signupName",
        "name",
        "displayName"
    );

    const ageInput = getElement(
        "registerAge",
        "signupAge",
        "age"
    );

    if (!emailInput || !passwordInput) {
        showMessage(
            "لم يتم العثور على حقول إنشاء الحساب في الصفحة.",
            "error"
        );

        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const displayName = nameInput
        ? nameInput.value.trim()
        : "";

    const age = ageInput
        ? Number(ageInput.value)
        : null;

    if (!email) {
        showMessage(
            "أدخل البريد الإلكتروني.",
            "error"
        );

        return;
    }

    if (password.length < 6) {
        showMessage(
            "كلمة المرور يجب أن تكون 6 أحرف على الأقل.",
            "error"
        );

        return;
    }

    try {
        const credential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = credential.user;

        if (displayName) {
            await updateProfile(user, {
                displayName
            });
        }

        await createUserProfile(user, {
            displayName,
            age
        });

        showMessage(
            "تم إنشاء حسابك بنجاح! أهلاً بك في ZIVOZONE 🎉",
            "success"
        );

        closeAuthModal();

    } catch (error) {
        console.error(
            "ZIVOZONE registration error:",
            error
        );

        showMessage(
            translateFirebaseError(error),
            "error"
        );
    }
}

// ============================================================
// Login
// ============================================================

async function loginUser() {
    const emailInput = getElement(
        "loginEmail",
        "signinEmail",
        "email"
    );

    const passwordInput = getElement(
        "loginPassword",
        "signinPassword",
        "password"
    );

    if (!emailInput || !passwordInput) {
        showMessage(
            "لم يتم العثور على حقول تسجيل الدخول.",
            "error"
        );

        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        showMessage(
            "أدخل البريد الإلكتروني وكلمة المرور.",
            "error"
        );

        return;
    }

    try {
        const credential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = credential.user;

        // Make sure profile exists.
        await createUserProfile(user);

        showMessage(
            "تم تسجيل الدخول بنجاح 👋",
            "success"
        );

        closeAuthModal();

    } catch (error) {
        console.error(
            "ZIVOZONE login error:",
            error
        );

        showMessage(
            translateFirebaseError(error),
            "error"
        );
    }
}

// ============================================================
// Logout
// ============================================================

async function logoutUser() {
    try {
        await signOut(auth);

        showMessage(
            "تم تسجيل الخروج بنجاح.",
            "success"
        );

    } catch (error) {
        console.error(
            "ZIVOZONE logout error:",
            error
        );

        showMessage(
            "تعذر تسجيل الخروج. حاول مرة أخرى.",
            "error"
        );
    }
}

// ============================================================
// Authentication state
// ============================================================

function updateUIForUser(user) {
    const loginButtons = document.querySelectorAll(
        '[data-auth="login"], #loginBtn, #loginButton, .login-btn'
    );

    const logoutButtons = document.querySelectorAll(
        '[data-auth="logout"], #logoutBtn, #logoutButton, .logout-btn'
    );

    const userElements = document.querySelectorAll(
        '[data-user-name], #userName, #profileName'
    );

    if (user) {

        loginButtons.forEach(button => {
            button.style.display = "none";
        });

        logoutButtons.forEach(button => {
            button.style.display = "";
        });

        userElements.forEach(element => {
            element.textContent =
                user.displayName ||
                user.email ||
                "لاعب ZIVOZONE";
        });

        document.body.classList.add("user-authenticated");

        window.zivoCurrentUser = user;

    } else {

        loginButtons.forEach(button => {
            button.style.display = "";
        });

        logoutButtons.forEach(button => {
            button.style.display = "none";
        });

        userElements.forEach(element => {
            element.textContent = "زائر";
        });

        document.body.classList.remove(
            "user-authenticated"
        );

        window.zivoCurrentUser = null;
    }
}

// ============================================================
// Auth modal
// ============================================================

function openAuthModal() {
    const modal = getElement(
        "authModal",
        "loginModal",
        "auth-modal"
    );

    if (modal) {
        modal.style.display = "flex";

        modal.classList.add("active");

        return;
    }

    createAuthModal();
}

function closeAuthModal() {
    const modal = getElement(
        "authModal",
        "loginModal",
        "auth-modal"
    );

    if (!modal) {
        return;
    }

    modal.style.display = "none";

    modal.classList.remove("active");
}

// ============================================================
// Create fallback authentication modal
// ============================================================

function createAuthModal() {

    if (document.getElementById("zivoAuthModal")) {
        return;
    }

    const modal = document.createElement("div");

    modal.id = "zivoAuthModal";

    modal.style.position = "fixed";
    modal.style.inset = "0";
    modal.style.zIndex = "99990";
    modal.style.background =
        "rgba(5, 4, 18, .82)";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.direction = "rtl";

    modal.innerHTML = `
        <div style="
            width:min(92%,420px);
            background:#111025;
            color:#fff;
            border-radius:24px;
            padding:28px;
            box-shadow:0 25px 80px rgba(0,0,0,.5);
        ">

            <button
                id="zivoAuthClose"
                type="button"
                style="
                    float:left;
                    background:none;
                    border:0;
                    color:#aaa;
                    font-size:24px;
                    cursor:pointer;
                "
            >
                ×
            </button>

            <h2 style="margin-top:0;">
                مرحبًا بك في ZIVOZONE
            </h2>

            <p style="color:#aaa;">
                أنشئ حسابك أو سجل الدخول للبدء.
            </p>

            <div style="display:grid;gap:10px;">

                <input
                    id="registerName"
                    type="text"
                    placeholder="اسم اللاعب"
                    autocomplete="name"
                    style="padding:13px;border-radius:10px;border:1px solid #333;background:#1b1930;color:#fff;"
                >

                <input
                    id="registerAge"
                    type="number"
                    min="5"
                    max="100"
                    placeholder="العمر"
                    style="padding:13px;border-radius:10px;border:1px solid #333;background:#1b1930;color:#fff;"
                >

                <input
                    id="registerEmail"
                    type="email"
                    placeholder="البريد الإلكتروني"
                    autocomplete="email"
                    style="padding:13px;border-radius:10px;border:1px solid #333;background:#1b1930;color:#fff;"
                >

                <input
                    id="registerPassword"
                    type="password"
                    placeholder="كلمة المرور - 6 أحرف على الأقل"
                    autocomplete="new-password"
                    style="padding:13px;border-radius:10px;border:1px solid #333;background:#1b1930;color:#fff;"
                >

                <button
                    id="zivoRegisterButton"
                    type="button"
                    style="
                        padding:14px;
                        border:0;
                        border-radius:12px;
                        background:#7c5cff;
                        color:#fff;
                        font-weight:bold;
                        cursor:pointer;
                    "
                >
                    إنشاء حساب
                </button>

                <hr style="
                    width:100%;
                    border:0;
                    border-top:1px solid #29273d;
                ">

                <input
                    id="loginEmail"
                    type="email"
                    placeholder="بريد تسجيل الدخول"
                    autocomplete="email"
                    style="padding:13px;border-radius:10px;border:1px solid #333;background:#1b1930;color:#fff;"
                >

                <input
                    id="loginPassword"
                    type="password"
                    placeholder="كلمة المرور"
                    autocomplete="current-password"
                    style="padding:13px;border-radius:10px;border:1px solid #333;background:#1b1930;color:#fff;"
                >

                <button
                    id="zivoLoginButton"
                    type="button"
                    style="
                        padding:14px;
                        border:1px solid #7c5cff;
                        border-radius:12px;
                        background:transparent;
                        color:#fff;
                        font-weight:bold;
                        cursor:pointer;
                    "
                >
                    تسجيل الدخول
                </button>

            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document
        .getElementById("zivoAuthClose")
        ?.addEventListener(
            "click",
            closeAuthModal
        );

    document
        .getElementById("zivoRegisterButton")
        ?.addEventListener(
            "click",
            registerUser
        );

    document
        .getElementById("zivoLoginButton")
        ?.addEventListener(
            "click",
            loginUser
        );
}

// ============================================================
// Bind existing buttons
// ============================================================

function bindAuthButtons() {

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-auth-action]"
                );

            if (!button) {
                return;
            }

            const action =
                button.dataset.authAction;

            if (action === "login") {
                openAuthModal();
            }

            if (action === "register") {
                openAuthModal();
            }

            if (action === "logout") {
                logoutUser();
            }
        }
    );

    document.addEventListener(
        "click",
        event => {

            const loginButton =
                event.target.closest(
                    "#loginBtn, #loginButton, .login-btn"
                );

            if (loginButton) {
                openAuthModal();
            }
        }
    );

    document.addEventListener(
        "click",
        event => {

            const logoutButton =
                event.target.closest(
                    "#logoutBtn, #logoutButton, .logout-btn"
                );

            if (logoutButton) {
                logoutUser();
            }
        }
    );
}

// ============================================================
// Initialize
// ============================================================

function initializeAuthentication() {

    bindAuthButtons();

    onAuthStateChanged(
        auth,
        async user => {

            updateUIForUser(user);

            if (user) {

                try {

                    await createUserProfile(user);

                } catch (error) {

                    console.error(
                        "Unable to create user profile:",
                        error
                    );

                }
            }
        }
    );

    console.log(
        "ZIVOZONE Authentication initialized."
    );
}

// ============================================================
// Public API
// ============================================================

window.ZIVOAUTH = {
    register: registerUser,
    login: loginUser,
    logout: logoutUser,
    open: openAuthModal,
    close: closeAuthModal,
    getCurrentUser: () => auth.currentUser
};

// Start when DOM is ready
if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeAuthentication
    );

} else {

    initializeAuthentication();

}
