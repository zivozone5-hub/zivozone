/* ============================================================
   ZIVOZONE AUTHENTICATION
   Firebase Compat + reliable local fallback
============================================================ */
(() => {
  'use strict';
  const KEY='zivozone_account_v6';
  const CONFIG=window.ZIVOZONE_FIREBASE_CONFIG;
  let user=null, player=null, cloud=false, ready=false, auth=null, db=null, initPromise=null;
  const t=k=>window.zivoT?window.zivoT(k):k;
  const defaultPlayer=(u)=>({uid:u.uid,name:u.name||'ZIVO Player',age:Number(u.age)||18,email:u.email||'',level:1,xp:0,coins:0,wins:0,losses:0,gamesPlayed:0,streak:0,bestStreak:0,language:window.ZIVOZONE_I18N?.get?.()||'ar'});
  const localAccounts=()=>{try{return JSON.parse(localStorage.getItem('zivozone_accounts')||'{}')}catch(e){return {}}};
  function saveLocal(){localStorage.setItem(KEY,JSON.stringify({user,player}))}
  function loadLocal(){try{const x=JSON.parse(localStorage.getItem(KEY)||'null');if(x?.user){user=x.user;player=x.player||defaultPlayer(user)}}catch(e){}}
  function emit(){window.dispatchEvent(new CustomEvent('zivozone-auth',{detail:{user,player,ready,cloud}}))}
  function firebaseMessage(code){const map={
    'auth/email-already-in-use':t('emailUsed'),
    'auth/invalid-email':t('emailError'),
    'auth/weak-password':'كلمة المرور ضعيفة.',
    'auth/wrong-password':t('badLogin'),
    'auth/invalid-credential':t('badLogin'),
    'auth/user-not-found':t('badLogin'),
    'auth/network-request-failed':t('offline'),
    'auth/too-many-requests':'تم إيقاف المحاولات مؤقتًا. حاول لاحقًا.'};return map[code]||t('firebaseError')}
  async function initFirebase(){
    if(!CONFIG||!window.firebase||!window.firebase.initializeApp)return false;
    try{
      if(!firebase.apps.length)firebase.initializeApp(CONFIG);
      auth=firebase.auth();db=firebase.firestore();cloud=true;
      try{auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)}catch(e){}
      try{await db.enablePersistence({synchronizeTabs:true})}catch(e){}
      auth.onAuthStateChanged(async u=>{
        if(!u){if(!String(user?.uid||'').startsWith('local_')){user=null;player=null;saveLocal()}emit();return}
        user={uid:u.uid,email:u.email||'',name:u.displayName||player?.name||'ZIVO Player'};
        try{const snap=await db.collection('players').doc(u.uid).get();player=snap.exists?{uid:u.uid,...snap.data()}:defaultPlayer(user);if(!snap.exists)await db.collection('players').doc(u.uid).set({...player,createdAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})}catch(e){player=player||defaultPlayer(user);console.warn('Firestore player load:',e)}
        saveLocal();emit();
      });
      return true;
    }catch(e){console.error('ZIVOZONE Firebase init:',e);cloud=false;return false}
  }
  async function register(data){
    await whenReady();
    const name=String(data.name||'').trim(),email=String(data.email||'').trim().toLowerCase(),password=String(data.password||''),age=Number(data.age);
    if(name.length<2)throw Error(t('nameError'));
    if(!Number.isInteger(age)||age<5||age>100)throw Error(t('ageError'));
    if(!/^\S+@\S+\.\S+$/.test(email))throw Error(t('emailError'));
    if(password.length<6)throw Error(t('passwordError'));
    const old=JSON.parse(localStorage.getItem('zivozone_state_v7')||localStorage.getItem('zivozone_state_v6')||localStorage.getItem('zivozone_state_v5')||'{}');
    if(cloud){
      try{
        const r=await auth.createUserWithEmailAndPassword(email,password),u=r.user;
        await u.updateProfile({displayName:name});
        user={uid:u.uid,email,name,age};
        player={...defaultPlayer(user),xp:Number(old.xp)||0,coins:Number(old.coins)||0,wins:Number(old.wins)||0,gamesPlayed:Number(old.gamesPlayed)||0,level:Number(old.level)||1,language:window.ZIVOZONE_I18N?.get?.()||'ar'};
        await db.collection('players').doc(u.uid).set({...player,createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
        saveLocal();emit();return player;
      }catch(e){throw Error(firebaseMessage(e.code))}
    }
    const accounts=localAccounts();if(accounts[email])throw Error(t('emailUsed'));
    accounts[email]={name,age,email,password};localStorage.setItem('zivozone_accounts',JSON.stringify(accounts));
    user={uid:'local_'+btoa(unescape(encodeURIComponent(email))).replace(/=/g,''),email,name,age};
    player={...defaultPlayer(user),xp:Number(old.xp)||0,coins:Number(old.coins)||0,wins:Number(old.wins)||0,gamesPlayed:Number(old.gamesPlayed)||0,level:Number(old.level)||1};saveLocal();emit();return player;
  }
  async function login(email,password){
    await whenReady();
    email=String(email||'').trim().toLowerCase();password=String(password||'');
    if(cloud){try{await auth.signInWithEmailAndPassword(email,password);return player}catch(e){throw Error(firebaseMessage(e.code))}}
    const a=localAccounts()[email];if(!a||a.password!==password)throw Error(t('badLogin'));
    user={uid:'local_'+btoa(unescape(encodeURIComponent(email))).replace(/=/g,''),email:a.email,name:a.name,age:a.age};
    const old=JSON.parse(localStorage.getItem(KEY)||'null');player=old?.player?.email===email?old.player:defaultPlayer(user);saveLocal();emit();return player;
  }
  async function logout(){if(cloud&&auth){try{await auth.signOut()}catch(e){}}user=null;player=null;localStorage.removeItem(KEY);emit()}
  async function update(patch){
    if(!player)return null;player={...player,...patch,language:patch.language||player.language||window.ZIVOZONE_I18N?.get?.()||'ar'};saveLocal();
    if(cloud&&db&&!String(player.uid).startsWith('local_')){try{await db.collection('players').doc(player.uid).set({...patch,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})}catch(e){console.warn('Firestore update:',e)}}
    emit();return player;
  }
  async function saveResult(result){
    if(!cloud||!db||!user||String(user.uid).startsWith('local_'))return false;
    try{await db.collection('players').doc(user.uid).collection('results').add({...result,createdAt:firebase.firestore.FieldValue.serverTimestamp()});return true}catch(e){console.warn('Result save:',e);return false}
  }
  async function setLanguage(lang){if(player){player.language=lang;saveLocal();if(cloud&&db&&!String(player.uid).startsWith('local_')){try{await db.collection('players').doc(player.uid).set({language:lang},{merge:true})}catch(e){}}emit()}}
  const isLoggedIn=()=>!!user&&!!player;
  async function init(){loadLocal();try{await initFirebase()}finally{ready=true;emit()}return {ready,cloud}}
  function whenReady(){return initPromise||Promise.resolve({ready,cloud})}
  window.ZIVOZONE_AUTH={register,login,logout,update,saveResult,setLanguage,getUser:()=>user,getPlayer:()=>player,isLoggedIn,init,whenReady,ready:()=>ready,isCloud:()=>cloud};
  initPromise=init();
})();
