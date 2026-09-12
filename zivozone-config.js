/* ZIVOZONE V1086 — centralized public runtime configuration */
(() => {
  'use strict';
  const existing = window.ZIVOZONE_CONFIG || {};
  window.ZIVOZONE_CONFIG = Object.freeze({
    ...existing,
    APP_VERSION: '1086.0',
    ADMIN_EMAIL: 'raefalbtish@gmail.com',
    ADMIN_NAME: 'رائف البطوش'
  });

  window.ZIVOZONE_FIREBASE_CONFIG = {
    apiKey:'AIzaSyCHTz-ENxa930vgzKcHaH7Ybcax2R_024s',
    authDomain:'zivozone-fc6ed.firebaseapp.com',
    projectId:'zivozone-fc6ed',
    storageBucket:'zivozone-fc6ed.firebasestorage.app',
    messagingSenderId:'169366383094',
    appId:'1:169366383094:web:5875e8d24b1c543e4a7fd7',
    measurementId:'G-ZXW8LP39JY'
  };
  window.ZIVOZONE_API={aiEndpoint:'',sportsNewsEndpoint:'',aiCallable:'zivoAI',sportsCallable:'getSportsBroadcast'};
  window.ZIVOZONE_GAME_RULES={questionSeconds:30,version:'V1086-clean-engine'};
  window.ZIVOZONE_SECURITY={appCheckSiteKey:'6LcDYbctAAAAAHJP_2BRgSXi3cnq1iKxCNTH1zBW'};
  window.ZIVOZONE_AI_CONFIG={model:'gemini-3.5-flash-lite',dailyLimit:10};
})();
