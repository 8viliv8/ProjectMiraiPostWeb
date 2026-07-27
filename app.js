/* =========================================================
   Project Mirai Post (Web) — ORBIT/Meloly と同じFirebaseプロジェクトに接続。
   断片を投函すると、Cloud Functions経由でClaude APIがmd相当の
   タイトル・目的・コンセプトを生成し、Firestoreの
   users/{uid}.pendingIdeas に積まれる。
   ORBIT側はここに積まれたものを読み込んで掲示板に表示する。
   ========================================================= */
import { initializeApp }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFunctions, httpsCallable }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-functions.js';

// ORBITと同じFirebaseプロジェクト(ORBIT/01のconfigと同一)
const firebaseConfig = {
  apiKey: "AIzaSyDYoZqDdhyS2q3GPmvdrfotJYxnsLydiQg",
  authDomain: "orbit-65a9b.firebaseapp.com",
  projectId: "orbit-65a9b",
  storageBucket: "orbit-65a9b.firebasestorage.app",
  messagingSenderId: "967386787141",
  appId: "1:967386787141:web:9a904e982e7daa44da622c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// Cloud Functionsをデプロイしたリージョンと合わせる(asia-northeast1)
const functions = getFunctions(app, "asia-northeast1");
const generateIdea = httpsCallable(functions, "generateIdeaFromFragment");

let currentUser = null;

const btnSignIn = document.getElementById('btnSignIn');
const authWho = document.getElementById('authWho');
const bodyEl = document.getElementById('body');
const btnPost = document.getElementById('btnPost');
const statusEl = document.getElementById('status');
const resultCard = document.getElementById('resultCard');

function setStatus(text){
  statusEl.textContent = text;
}

function showResult(item){
  resultCard.style.display = 'block';
  const quadrantLabel = {idea:'アイデア', nichijo:'日常', kaji:'家事', shigoto:'仕事'}[item.quadrant] || item.quadrant;
  resultCard.innerHTML = `
    <h3>${item.title}</h3>
    <div><span class="tag">${quadrantLabel}</span><span class="tag">#${item.tagGuess || '未分類'}</span></div>
    <p><b>目的:</b> ${item.purpose}</p>
    <p><b>コンセプト:</b> ${item.concept}</p>
    <p><b>キーワード:</b> ${(item.keywords||[]).join(' / ')}</p>
  `;
}

btnSignIn.addEventListener('click', () => {
  signInWithPopup(auth, new GoogleAuthProvider())
    .catch(e => setStatus('ログインに失敗しました: ' + e.message));
});

authWho.addEventListener('click', () => {
  if(confirm('ログアウトしますか？')) signOut(auth);
});

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if(user){
    btnSignIn.style.display = 'none';
    authWho.style.display = 'block';
    authWho.textContent = '✓ ' + (user.displayName || user.email);
    btnPost.disabled = false;
  } else {
    btnSignIn.style.display = 'inline-block';
    authWho.style.display = 'none';
    btnPost.disabled = true;
  }
});

btnPost.addEventListener('click', async () => {
  const fragment = bodyEl.value.trim();
  if(!fragment){
    setStatus('内容を入力してください。');
    return;
  }
  if(!currentUser){
    setStatus('先にログインしてください。');
    return;
  }
  btnPost.disabled = true;
  setStatus('投函中…(AIが整えています。数秒かかります)');
  resultCard.style.display = 'none';
  try{
    const res = await generateIdea({ fragment });
    setStatus('投函しました。ORBITの木箱に届きます。');
    showResult(res.data.item);
    bodyEl.value = '';
  }catch(e){
    console.error(e);
    setStatus('エラーが発生しました: ' + (e.message || e));
  }finally{
    btnPost.disabled = false;
  }
});
