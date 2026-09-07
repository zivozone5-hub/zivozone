// ============================================================
// ZIVOZONE - Firebase Authentication
// auth.js
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ============================================================
// FIREBASE CONFIG
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyCHTz-ENxa930vgzKcHaH7Ybcax2R_024s",
  authDomain: "zivozone-fc6ed.firebaseapp.com",
  projectId: "zivozone-fc6ed",
  storageBucket: "zivozone-fc6ed.firebasestorage.app",
  messagingSenderId: "169366383094",
  appId: "1:169366383094:web:5875e8d24b1c543e4a7fd7",
  measurementId: "G-ZXW8LP39JY"
};


// ============================================================
// INITIALIZE FIREBASE
// ============================================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);


// نجعلها متاحة لباقي ملفات الموقع
window.ZIVOZONE = {
  app,
  auth,
  db
};


// ============================================================
// HELPERS
// ============================================================

function getElement(...ids) {
  for (const id of ids) {
    const element = document.getElementById(id);
    if (element) return element;
  }

  return null;
}


function getValue(...ids) {
  const element = getElement(...ids);
  return element ? element.value.trim() : "";
}


function showMessage(message, type = "error") {

  let box = document.getElementById("authMessage");

  if (!box) {
    box = document.createElement("div");
    box.id = "authMessage";

    box.style.marginTop = "15px";
    box.style.padding = "12px 16px";
    box.style.borderRadius = "12px";
    box.style.fontSize = "14px";
    box.style.textAlign = "center";

    const container =
      document.getElementById("authModal") ||
      document.querySelector(".auth-modal") ||
      document.querySelector("form") ||
      document.body;

    container.appendChild(box);
  }

  box.textContent = message;

  if (type === "success") {
    box.style.background = "rgba(34,197,94,.15)";
    box.style.color = "#4ade80";
  } else {
    box.style.background = "rgba(239,68,68,.15)";
    box.style.color = "#f87171";
  }
}


function setLoading(button, loading) {

  if (!button) return;

  if (loading) {

    button.dataset.originalText = button.textContent;

    button.disabled = true;

    button.textContent = "جاري التنفيذ...";

    button.style.opacity = "0.7";

  } else {

    button.disabled = false;

    button.textContent =
      button.dataset.originalText || button.textContent;

    button.style.opacity = "1";
  }
}


// ============================================================
// FIREBASE ERROR TRANSLATION
// ============================================================

function firebaseError(error) {

  console.error("Firebase error:", error);

  switch (error.code) {

    case "auth/email-already-in-use":
      return "هذا البريد الإلكتروني مستخدم مسبقًا.";

    case "auth/invalid-email":
      return "البريد الإلكتروني غير صحيح.";

    case "auth/weak-password":
      return "كلمة المرور ضعيفة. استخدم 6 أحرف أو أكثر.";

    case "auth/invalid-credential":
      return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";

    case "auth/user-not-found":
      return "لا يوجد حساب بهذا البريد الإلكتروني.";

    case "auth/wrong-password":
      return "كلمة المرور غير صحيحة.";

    case "auth/too-many-requests":
      return "تم إجراء محاولات كثيرة. حاول لاحقًا.";

    case "auth/network-request-failed":
      return "تعذر الاتصال بالإنترنت.";

    case "auth/api-key-not-valid":
      return "مفتاح Firebase غير صالح. تأكد من إعدادات المشروع.";

    case "permission-denied":
      return "ليس لديك صلاحية لتنفيذ هذه العملية.";

    default:
      return "حدث خطأ. حاول مرة أخرى.";
  }
}


// ============================================================
// CREATE ACCOUNT
// ============================================================

async function createAccount() {

  const name = getValue(
    "registerName",
    "signupName",
    "name",
    "userName"
  );

  const email = getValue(
    "registerEmail",
    "signupEmail",
    "email"
  );

  const password = getValue(
    "registerPassword",
    "signupPassword",
    "password"
  );

  const confirmPassword = getValue(
    "registerConfirmPassword",
    "signupConfirmPassword",
    "confirmPassword"
  );

  const button = getElement(
    "registerButton",
    "signupButton",
    "createAccountButton"
  );


  if (!name) {
    showMessage("اكتب اسمك أولًا.");
    return;
  }


  if (!email) {
    showMessage("اكتب البريد الإلكتروني.");
    return;
  }


  if (!password) {
    showMessage("اكتب كلمة المرور.");
    return;
  }


  if (password.length < 6) {
    showMessage("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
    return;
  }


  if (confirmPassword && password !== confirmPassword) {
    showMessage("كلمتا المرور غير متطابقتين.");
    return;
  }


  try {

    setLoading(button, true);

    const credential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );


    // إضافة اسم المستخدم إلى Firebase Authentication
    await updateProfile(
      credential.user,
      {
        displayName: name
      }
    );


    // إنشاء ملف المستخدم في Firestore
    await setDoc(
      doc(db, "users", credential.user.uid),
      {
        uid: credential.user.uid,
        name: name,
        email: email,
        role: "user",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    );


    showMessage(
      "تم إنشاء حسابك بنجاح 🎉",
      "success"
    );


    // تحديث الواجهة
    updateUserInterface(credential.user);


    // إغلاق نافذة التسجيل إن وجدت
    closeAuthModal();


  } catch (error) {

    showMessage(firebaseError(error));

  } finally {

    setLoading(button, false);

  }
}


// ============================================================
// LOGIN
// ============================================================

async function loginAccount() {

  const email = getValue(
    "loginEmail",
    "signinEmail",
    "email"
  );

  const password = getValue(
    "loginPassword",
    "signinPassword",
    "password"
  );

  const button = getElement(
    "loginButton",
    "signinButton"
  );


  if (!email) {
    showMessage("اكتب البريد الإلكتروني.");
    return;
  }


  if (!password) {
    showMessage("اكتب كلمة المرور.");
    return;
  }


  try {

    setLoading(button, true);

    const credential =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );


    showMessage(
      "تم تسجيل الدخول بنجاح 👋",
      "success"
    );


    updateUserInterface(credential.user);


    closeAuthModal();


  } catch (error) {

    showMessage(firebaseError(error));

  } finally {

    setLoading(button, false);

  }
}


// ============================================================
// LOGOUT
// ============================================================

async function logoutAccount() {

  try {

    await signOut(auth);

    showMessage(
      "تم تسجيل الخروج بنجاح.",
      "success"
    );

    updateUserInterface(null);

  } catch (error) {

    showMessage(firebaseError(error));

  }
}


// ============================================================
// AUTH STATE
// ============================================================

onAuthStateChanged(auth, (user) => {

  if (user) {

    console.log(
      "ZIVOZONE user logged in:",
      user.uid
    );

    updateUserInterface(user);

  } else {

    console.log(
      "ZIVOZONE: No user logged in"
    );

    updateUserInterface(null);
  }

});


// ============================================================
// UPDATE WEBSITE UI
// ============================================================

function updateUserInterface(user) {

  const loggedInElements =
    document.querySelectorAll(
      "[data-auth='logged-in'], .logged-in-only"
    );

  const loggedOutElements =
    document.querySelectorAll(
      "[data-auth='logged-out'], .logged-out-only"
    );


  loggedInElements.forEach((element) => {

    element.style.display =
      user ? "" : "none";

  });


  loggedOutElements.forEach((element) => {

    element.style.display =
      user ? "none" : "";

  });


  const userNameElements =
    document.querySelectorAll(
      "[data-user-name], #currentUserName"
    );


  userNameElements.forEach((element) => {

    element.textContent =
      user?.displayName ||
      user?.email ||
      "مستخدم ZIVOZONE";

  });


  const userEmailElements =
    document.querySelectorAll(
      "[data-user-email], #currentUserEmail"
    );


  userEmailElements.forEach((element) => {

    element.textContent =
      user?.email || "";

  });
}


// ============================================================
// AUTH MODAL
// ============================================================

function closeAuthModal() {

  const modal =
    document.getElementById("authModal") ||
    document.querySelector(".auth-modal");

  if (!modal) return;

  modal.classList.remove("active");
  modal.classList.remove("show");

  modal.style.display = "none";
}


function openAuthModal() {

  const modal =
    document.getElementById("authModal") ||
    document.querySelector(".auth-modal");

  if (!modal) return;

  modal.style.display = "flex";

  requestAnimationFrame(() => {

    modal.classList.add("active");
    modal.classList.add("show");

  });
}


// ============================================================
// BUTTON EVENTS
// ============================================================

document.addEventListener("click", (event) => {

  const target =
    event.target.closest("button, a, [role='button']");

  if (!target) return;


  // إنشاء حساب
  if (
    target.matches(
      "#registerButton, #signupButton, #createAccountButton, [data-action='register'], [data-auth-action='register']"
    )
  ) {

    event.preventDefault();

    createAccount();

    return;
  }


  // تسجيل الدخول
  if (
    target.matches(
      "#loginButton, #signinButton, [data-action='login'], [data-auth-action='login']"
    )
  ) {

    event.preventDefault();

    loginAccount();

    return;
  }


  // تسجيل الخروج
  if (
    target.matches(
      "#logoutButton, [data-action='logout'], [data-auth-action='logout']"
    )
  ) {

    event.preventDefault();

    logoutAccount();

    return;
  }


  // فتح نافذة الحساب
  if (
    target.matches(
      "[data-action='open-auth'], #openAuthButton"
    )
  ) {

    event.preventDefault();

    openAuthModal();

    return;
  }


  // إغلاق النافذة
  if (
    target.matches(
      "#closeAuthButton, [data-action='close-auth']"
    )
  ) {

    event.preventDefault();

    closeAuthModal();

  }

});


// ============================================================
// FORM SUBMIT SUPPORT
// ============================================================

document.addEventListener("submit", (event) => {

  const form = event.target;

  if (
    form.matches(
      "#registerForm, #signupForm, [data-auth-form='register']"
    )
  ) {

    event.preventDefault();

    createAccount();

    return;
  }


  if (
    form.matches(
      "#loginForm, #signinForm, [data-auth-form='login']"
    )
  ) {

    event.preventDefault();

    loginAccount();

  }

});


// ============================================================
// EXPORT GLOBAL FUNCTIONS
// ============================================================

window.ZIVOZONE_AUTH = {

  createAccount,
  loginAccount,
  logoutAccount,
  openAuthModal,
  closeAuthModal,

  getCurrentUser: () => auth.currentUser

};


console.log(
  "✅ ZIVOZONE Firebase Authentication initialized successfully."
);
