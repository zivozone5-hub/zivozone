// ============================================================
// ZIVOZONE - Firebase Configuration
// ============================================================

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth
} from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore
} from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ------------------------------------------------------------
// Firebase project configuration
// ------------------------------------------------------------

const firebaseConfig = {
    apiKey: "AIzaSyCHTz-ENxa930VgzKcHah7Ybcax2R_024s",
    authDomain: "zivozone-fc6ed.firebaseapp.com",
    projectId: "zivozone-fc6ed",
    storageBucket: "zivozone-fc6ed.firebasestorage.app",
    messagingSenderId: "169366383094",
    appId: "1:169366383094:web:5875e8d241bc1543e4a7fd7",
    measurementId: "G-ZXW8LP39JY"
};

// ------------------------------------------------------------
// Initialize Firebase
// ------------------------------------------------------------

const app = initializeApp(firebaseConfig);

// Firebase Authentication
const auth = getAuth(app);

// Cloud Firestore
const db = getFirestore(app);

// ------------------------------------------------------------
// Export
// ------------------------------------------------------------

export {
    app,
    auth,
    db
};
