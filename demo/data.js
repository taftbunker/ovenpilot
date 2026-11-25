// Shared demo "backend" — everything lives in localStorage. No real SMS/email is ever sent.
const DB_KEY='bellaCucinaDemo.v1';
const RESTAURANT={name:'Bella Cucina',city:'Austin, TX',phone:'(512) 555-0142',offer:'Free Appetizer'};
function loadDB(){try{return JSON.parse(localStorage.getItem(DB_KEY))||{contacts:[],messages:[],campaigns:[]}}catch(e){return{contacts:[],messages:[],campaigns:[]}}}
function saveDB(db){localStorage.setItem(DB_KEY,JSON.stringify(db))}
function normPhone(p){const d=(p||'').replace(/\D/g,'');if(d.length===11&&d[0]==='1')return d.slice(1);return d}
function validPhone(p){return /^[2-9]\d{2}[2-9]\d{6}$/.test(normPhone(p))} // NANP, like the real app
function fmtPhone(d){return d.length===10?`(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`:d}
function makeCode(){const c='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='BC-';for(let i=0;i<4;i++)s+=c[Math.floor(Math.random()*c.length)];return s}
function addContact({name,phone,email,birthday,table,consent,ageConfirmed}){
  const db=loadDB();const p=normPhone(phone);
  const existing=db.contacts.find(c=>c.phone===p);
  if(existing) return {contact:existing,duplicate:true};
  const contact={id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),name:name.trim(),phone:p,email:email.trim().toLowerCase(),birthday:birthday||'',table:table||'',
    code:makeCode(),redeemed:false,optedIn:!!consent,ageConfirmed:!!ageConfirmed,source:'Table QR',createdAt:new Date().toISOString()};
  db.contacts.push(contact);
  const first=contact.name.split(' ')[0];
  db.messages.push({type:'sms',to:contact.phone,at:contact.createdAt,body:`${RESTAURANT.name}: Hi ${first}! Your ${RESTAURANT.offer} is ready. Show code ${contact.code} to your server. Reply STOP to opt out.`});
  if(contact.email) db.messages.push({type:'email',to:contact.email,at:contact.createdAt,subject:`Your free appetizer at ${RESTAURANT.name} 🍝`,body:`Ciao ${first},\n\nThanks for joining the ${RESTAURANT.name} VIP list! Here's your claim code:\n\n    ${contact.code}\n\nShow it to your server for one free appetizer (one per guest, dine-in).\n\nGrazie,\nThe ${RESTAURANT.name} team`});
  saveDB(db);return {contact,duplicate:false};
}
const TEMPLATES={
  slow:{label:'Slow-hour BOGO (Mon 4 PM)',body:'{restaurant}: Hey {first}! Slow Monday = your win. Buy one pasta, get one FREE today 4–6 PM. Show this text. Reply STOP to opt out.'},
  birthday:{label:'Birthday treat',body:'{restaurant}: Happy birthday, {first}! 🎂 Enjoy a free tiramisu on us this week. Show this text to your server. Reply STOP to opt out.'},
  weekly:{label:'Weekly special',body:"{restaurant}: This week's special, {first}: Lobster ravioli + a glass of house wine for $24. Book: (512) 555-0142. Reply STOP to opt out."}
};
function fill(tpl,c){return tpl.replace(/{first}/g,c.name.split(' ')[0]).replace(/{restaurant}/g,RESTAURANT.name)}
function sendBlast(key,body,audience){
  const db=loadDB();const now=new Date();let list=db.contacts.filter(c=>c.optedIn);
  if(audience==='birthday'){const m=now.getMonth()+1;list=list.filter(c=>c.birthday&&parseInt(c.birthday.split('-')[1],10)===m)}
  list.forEach(c=>db.messages.push({type:'sms',to:c.phone,at:now.toISOString(),campaign:key,body:fill(body,c)}));
  db.campaigns.unshift({key,label:(TEMPLATES[key]||{label:'Custom'}).label,body,sent:list.length,at:now.toISOString()});
  saveDB(db);return list.length;
}
function seedDemo(){
  const people=[['Maria Gonzalez','5125550101','maria.g@example.com','1990-11-04','4'],['James Carter','5125550102','jcarter@example.com','1985-03-15','7'],
  ['Aisha Patel','5125550103','aisha.p@example.com','1998-11-21','2'],['Tyler Nguyen','5125550104','tnguyen@example.com','2001-07-09','12'],['Sofia Rossi','5125550105','sofia.r@example.com','1993-01-30','9']];
  people.forEach(([n,p,e,b,t])=>addContact({name:n,phone:p,email:e,birthday:b,table:t,consent:true}));
  const d=loadDB();d.contacts.forEach(c=>{if(c.phone==='5125550102'||c.phone==='5125550104')c.redeemed=true});saveDB(d);
}
