/******************* CHAT + AUTH ONLY  *******************
   All diagram-tooltip code removed.                  */
const chatlog = document.getElementById('chatlog');
const sendBtn = document.getElementById('sendBtn');
const userMsg = document.getElementById('userMsg');

sendBtn.onclick = send;
userMsg.addEventListener('keydown',e=>{ if(e.key==='Enter') send(); });

async function send(){
  const txt = userMsg.value.trim();
  if(!txt) return;
  push('user', txt);
  userMsg.value=''; userMsg.focus();
  const stub = push('assistant','…');

  try{
    const res  = await fetch('/api/chat',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        prompt:txt,
        user:firebase.auth().currentUser?.email||'web'
      })
    });
    const data = await res.json();
    stub.textContent = data.reply || '⚠️ No response';
  }catch(e){
    stub.textContent = '⚠️ Server error';
  }
}
function push(role,msg){
  const div = document.createElement('div');
  div.className = `bubble ${role}`;
  div.textContent = msg;
  chatlog.appendChild(div);
  chatlog.scrollTop = chatlog.scrollHeight;
  return div;
}

/*************** Firebase email-link auth ***************/
const fbCfg = {
  apiKey:     "YOUR-FIREBASE-API-KEY",
  authDomain: "YOUR-PROJECT.firebaseapp.com",
  projectId:  "YOUR-PROJECT",
};
firebase.initializeApp(fbCfg);

const ui = new firebaseui.auth.AuthUI(firebase.auth());
document.getElementById('loginBtn').onclick = openAuth;
document.querySelector('.modal__close').onclick = closeAuth;

function openAuth(){
  document.getElementById('authModal').classList.remove('hidden');
  ui.start('#firebaseui-auth-container',{
    signInOptions:[firebase.auth.EmailAuthProvider.PROVIDER_ID],
    credentialHelper:firebaseui.auth.CredentialHelper.NONE,
    callbacks:{ signInSuccessWithAuthResult }
  });
}
function signInSuccessWithAuthResult(){
  closeAuth();
  const user = firebase.auth().currentUser;
  document.querySelector('.chatbox__hint').textContent =
      `👋 Welcome ${user.email}! Tell us about your sample to receive a quote.`;
  return false;
}
function closeAuth(){
  document.getElementById('authModal').classList.add('hidden');
}
