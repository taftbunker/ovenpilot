const table=new URLSearchParams(location.search).get('table')||'';
if(table) document.getElementById('tableTxt').textContent=` (table ${table})`;
document.getElementById('f').addEventListener('submit',e=>{
  e.preventDefault();const v=id=>document.getElementById(id).value.trim();const err=document.getElementById('err');
  if(v('name').length<2) return err.textContent='Please enter your name.';
  if(normPhone(v('phone')).length!==10) return err.textContent='Please enter a 10-digit US mobile number.';
  if(v('email')&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email'))) return err.textContent='Please enter a valid email, or leave it blank.';
  if(!document.getElementById('consent').checked) return err.textContent='Please check the box to join the text list.';
  err.textContent='';
  const {contact,duplicate}=addContact({name:v('name'),phone:v('phone'),email:v('email'),birthday:v('bday'),table,consent:true});
  const db=loadDB();const sms=db.messages.filter(m=>m.type==='sms'&&m.to===contact.phone)[0];const em=db.messages.filter(m=>m.type==='email'&&m.to===contact.email)[0];
  document.getElementById('code').textContent=contact.code;
  if(duplicate){document.getElementById('doneTitle').textContent='Welcome back!';document.getElementById('dupNote').textContent='This number is already on the list, so here is your original code.'}
  document.getElementById('smsTo').textContent=fmtPhone(contact.phone);document.getElementById('sms').textContent=sms?sms.body:'';
  document.getElementById('emTo').textContent=contact.email;document.getElementById('emSub').textContent=em?em.subject:'';document.getElementById('emBody').textContent=em?em.body:'';document.getElementById('emCard').classList.toggle('hidden',!em);
  document.getElementById('formView').classList.add('hidden');document.getElementById('doneView').classList.remove('hidden');window.scrollTo(0,0);
});
