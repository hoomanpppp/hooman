/***** Simple chat and local email signup *****/
const chatlog = document.getElementById('chatlog');
const sendBtn  = document.getElementById('sendBtn');
const userMsg  = document.getElementById('userMsg');
let currentUser = null;

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
const loginBtn  = document.getElementById('loginBtn');
const authModal = document.getElementById('authModal');
const closeBtn  = document.querySelector('.modal__close');
const signForm  = document.getElementById('signInForm');
const emailInput= document.getElementById('emailInput');
const chatHint  = document.querySelector('.chatbox__hint');

loginBtn.onclick = () => { authModal.classList.remove('hidden'); emailInput.focus(); };
closeBtn.onclick  = closeAuth;

signForm.onsubmit = async e => {
  e.preventDefault();
  const email = emailInput.value.trim();
  if(!email) return;
  currentUser = email;
  chatHint.textContent = `👋 Welcome ${email}! Tell us about your sample to receive a quote.`;
  authModal.classList.add('hidden');
  emailInput.value='';
  try{
    await fetch('/api/signup',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({email})
    });
  }catch(e){}
};
function closeAuth(){ authModal.classList.add('hidden'); }
