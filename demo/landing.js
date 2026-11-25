const table=new URLSearchParams(location.search).get('table')||'';
if(/^[A-Za-z0-9-]{1,6}$/.test(table)) document.getElementById('tableTxt').textContent=` (table ${table})`;
const todayISO=new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);document.getElementById('bday').max=todayISO;
let submitting=false;
document.getElementById('f').addEventListener('submit',e=>{
  e.preventDefault();if(submitting)return;const v=id=>document.getElementById(id).value.trim();const err=document.getElementById('err');
  if(v('name').length<2) return err.textContent='Please enter your name.';
  if(!validPhone(v('phone'))) return err.textContent='Please enter a 10-digit US mobile number.';
  if(v('bday')&&(v('bday')>todayISO||v('bday')<'1900-01-01')) return err.textContent='Please enter a real birthday (not in the future), or leave it blank.';
  if(v('email')&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email'))) return err.textContent='Please enter a valid email, or leave it blank.';
  if(!document.getElementById('consent').checked) return err.textContent='Please check the box to join the text list (13 or older).';
  err.textContent='';submitting=true;e.target.querySelector('button[type=submit]').disabled=true; // double-tap safe
  const {contact,duplicate}=addContact({name:v('name').slice(0,80),phone:v('phone'),email:v('email'),birthday:v('bday'),table,consent:true,ageConfirmed:true});
  const db=loadDB();const sms=db.messages.filter(m=>m.type==='sms'&&m.to===contact.phone)[0];const em=db.messages.filter(m=>m.type==='email'&&m.to===contact.email)[0];
  document.getElementById('code').textContent=contact.code;
  if(duplicate){document.getElementById('doneTitle').textContent='Welcome back!';document.getElementById('dupNote').textContent='This number is already on the list, so here is your original code.'}
  document.getElementById('smsTo').textContent=fmtPhone(contact.phone);document.getElementById('sms').textContent=sms?sms.body:'';
  document.getElementById('emTo').textContent=contact.email;document.getElementById('emSub').textContent=em?em.subject:'';document.getElementById('emBody').textContent=em?em.body:'';document.getElementById('emCard').classList.toggle('hidden',!em);
  document.getElementById('formView').classList.add('hidden');document.getElementById('doneView').classList.remove('hidden');window.scrollTo(0,0);
});
