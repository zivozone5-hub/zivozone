// ============================================================
// ZIVOZONE - Authentication & Player Profile
// Firebase v10+ Modular SDK
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

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
    setDoc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


// ============================================================
// Firebase Configuration
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyCHTz-ENxA93WgzKcHaH7Ybcax2R_024s",
    authDomain: "zivozone-fc6ed.firebaseapp.com",
    projectId: "zivozone-fc6ed",
    storageBucket: "zivozone-fc6ed.firebasestorage.app",
    messagingSenderId: "169366383094",
    appId: "1:169366383094:web:5875e8d24b1c543e4a7fd7",
    measurementId: "G-ZXW8LP39JY"
};


// ============================================================
// Initialize Firebase
// ============================================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);


// ============================================================
// ZIVOZONE Player Defaults
// ============================================================

const DEFAULT_PLAYER = {
    level: 1,
    xp: 0,
    coins: 0,
    wins: 0,
    losses: 0,
    gamesPlayed: 0,
    streak: 0,
    age: null,
    category: "general",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
};


// ============================================================
// Create Player Profile
// ============================================================

async function createPlayerProfile(user, extraData = {}) {

    if (!user || !user.uid) {
        throw new Error("بيانات اللاعب غير صحيحة.");
    }

    const playerRef = doc(db, "users", user.uid);

    const existingPlayer = await getDoc(playerRef);

    // لا نعيد إنشاء بيانات اللاعب إذا كان موجوداً
    if (existingPlayer.exists()) {
        return existingPlayer.data();
    }

    const playerData = {
        uid: user.uid,
        name: extraData.name || user.displayName || "لاعب ZIVOZONE",
        email: user.email || "",
        ...DEFAULT_PLAYER,
        ...extraData,
        updatedAt: serverTimestamp()
    };

    await setDoc(playerRef, playerData);

    return playerData;
}


// ============================================================
// Register
// ============================================================

export async function registerPlayer({
    name,
    email,
    password,
    age
}) {

    if (!name || name.trim().length < 2) {
        throw new Error("اكتب اسم اللاعب بشكل صحيح.");
    }

    if (!email || !email.includes("@")) {
        throw new Error("أدخل بريد إلكتروني صحيح.");
    }

    if (!password || password.length < 6) {
        throw new Error("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
    }

    if (!age || Number(age) < 5 || Number(age) > 100) {
        throw new Error("أدخل عمر اللاعب بشكل صحيح.");
    }

    try {

        const credential =
            await createUserWithEmailAndPassword(
                auth,
                email.trim(),
                password
            );

        const user = credential.user;

        await updateProfile(user, {
            displayName: name.trim()
        });

        await createPlayerProfile(user, {
            name: name.trim(),
            age: Number(age)
        });

        return {
            success: true,
            user
        };

    } catch (error) {

        console.error("ZIVOZONE Registration Error:", error);

        let message = "حدث خطأ أثناء إنشاء الحساب.";

        switch (error.code) {

            case "auth/email-already-in-use":
                message = "هذا البريد مستخدم مسبقاً.";
                break;

            case "auth/invalid-email":
                message = "البريد الإلكتروني غير صحيح.";
                break;

            case "auth/weak-password":
                message = "كلمة المرور ضعيفة.";
                break;

            case "auth/network-request-failed":
                message = "تأكد من اتصال الإنترنت.";
                break;

            default:
                message = error.message || message;
        }

        throw new Error(message);
    }
}


// ============================================================
// Login
// ============================================================

export async function loginPlayer(email, password) {

    if (!email || !password) {
        throw new Error("أدخل البريد وكلمة المرور.");
    }

    try {

        const credential =
            await signInWithEmailAndPassword(
                auth,
                email.trim(),
                password
            );

        return {
            success: true,
            user: credential.user
        };

    } catch (error) {

        console.error("ZIVOZONE Login Error:", error);

        let message = "تعذر تسجيل الدخول.";

        switch (error.code) {

            case "auth/invalid-credential":
                message = "البريد أو كلمة المرور غير صحيحة.";
                break;

            case "auth/user-not-found":
                message = "الحساب غير موجود.";
                break;

            case "auth/wrong-password":
                message = "كلمة المرور غير صحيحة.";
                break;

            case "auth/too-many-requests":
                message = "محاولات كثيرة. حاول لاحقاً.";
                break;

            case "auth/network-request-failed":
                message = "تأكد من اتصال الإنترنت.";
                break;

            default:
                message = error.message || message;
        }

        throw new Error(message);
    }
}


// ============================================================
// Logout
// ============================================================

export async function logoutPlayer() {

    try {

        await signOut(auth);

        return {
            success: true
        };

    } catch (error) {

        console.error("ZIVOZONE Logout Error:", error);

        throw new Error("تعذر تسجيل الخروج.");
    }
}


// ============================================================
// Get Current Player Profile
// ============================================================

export async function getCurrentPlayer() {

    const user = auth.currentUser;

    if (!user) {
        return null;
    }

    const playerRef = doc(db, "users", user.uid);

    const snapshot = await getDoc(playerRef);

    if (!snapshot.exists()) {

        return await createPlayerProfile(user);
    }

    return {
        id: snapshot.id,
        ...snapshot.data()
    };
}


// ============================================================
// Authentication State
// ============================================================

onAuthStateChanged(auth, async (user) => {

    try {

        if (user) {

            console.log(
                "🟢 ZIVOZONE Player Connected:",
                user.email
            );

            await createPlayerProfile(user);

            window.dispatchEvent(
                new CustomEvent("zivozone-auth", {
                    detail: {
                        loggedIn: true,
                        user
                    }
                })
            );

        } else {

            console.log("🔴 No player logged in.");

            window.dispatchEvent(
                new CustomEvent("zivozone-auth", {
                    detail: {
                        loggedIn: false,
                        user: null
                    }
                })
            );
        }

    } catch (error) {

        console.error(
            "ZIVOZONE Auth State Error:",
            error
        );
    }
});


// ============================================================
// Global API
// ============================================================

window.ZIVOZONE_AUTH = {
    registerPlayer,
    loginPlayer,
    logoutPlayer,
    getCurrentPlayer
};


// ============================================================
// Ready
// ============================================================

console.log("🚀 ZIVOZONE Authentication System Ready");
