/***** Simple chat and local email signup *****/
const chatlog = document.getElementById('chatlog');
const sendBtn  = document.getElementById('sendBtn');
const userMsg  = document.getElementById('userMsg');
let currentUser = localStorage.getItem('userEmail');
let currentName = localStorage.getItem('userName');

sendBtn.onclick = send;
userMsg.addEventListener('keydown',e=>{ if(e.key==='Enter') send(); });

async function send(){
  const txt = userMsg.value.trim();
  if(!txt) return;
  push('user', txt);
  userMsg.value=''; userMsg.focus();
  const stub = push('assistant','…');
  try{
    const res = await fetch('/api/chat',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({prompt:txt, user:currentUser||'web'})
    });
    const data = await res.json();
    stub.textContent = data.reply || '⚠️ No response';
  }catch(e){ stub.textContent = '⚠️ Server error'; }
}
function push(role,msg){
  const div=document.createElement('div');
  div.className='bubble '+role;
  div.textContent=msg;
  chatlog.appendChild(div);chatlog.scrollTop=chatlog.scrollHeight;return div;
}

/***** Basic e-mail sign in *****/
const authBtns   = [document.getElementById('authBtn'),
                    document.getElementById('authBtnFooter')];
const authModal  = document.getElementById('authModal');
const closeBtn   = document.querySelector('.modal__close');
const signForm   = document.getElementById('authForm');
const nameInput  = document.getElementById('nameInput');
const emailInput = document.getElementById('emailInput');
const chatHint   = document.querySelector('.chatbox__hint');

function updateAuthButtons(){
  const text = currentUser ? 'Sign out' : 'Sign up / in';
  authBtns.forEach(btn => btn.textContent = text);
}

if(currentUser){
  const name = currentName || currentUser;
  chatHint.textContent = `👋 Welcome back ${name}! Ask anything about your sample.`;
}

updateAuthButtons();

authBtns.forEach(btn => btn.onclick = handleAuthBtn);
closeBtn.onclick  = closeAuth;

signForm.onsubmit = async e => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  if(!email) return;
  currentUser = email;
  currentName = name || email;
  chatHint.textContent = `👋 Welcome ${currentName}! Tell us about your sample to receive a quote.`;
  authModal.classList.add('hidden');
  emailInput.value='';
  nameInput.value='';
  localStorage.setItem('userEmail', email);
  if(name) localStorage.setItem('userName', name);
  try{
    await fetch('/api/signup',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({email, name})
    });
  }catch(e){}
  updateAuthButtons();
};
function handleAuthBtn(){
  if(currentUser){
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    currentUser = null;
    currentName = null;
    chatHint.textContent = 'Sign up or sign in to get a quote & keep history.';
    updateAuthButtons();
  }else{
    authModal.classList.remove('hidden');
    emailInput.focus();
  }
}
function closeAuth(){ authModal.classList.add('hidden'); }
