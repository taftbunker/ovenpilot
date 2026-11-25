const $=id=>document.getElementById(id);
Object.entries(TEMPLATES).forEach(([k,t])=>$('tpl').add(new Option(t.label,k)));
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function setTpl(){const k=$('tpl').value;$('msg').value=TEMPLATES[k].body;$('aud').value=k==='birthday'?'birthday':'all';$('when').value=k==='slow'?'mon4':'now';updCount()}
function audience(){const db=loadDB();let l=db.contacts.filter(c=>c.optedIn);if($('aud').value==='birthday'){const m=new Date().getMonth()+1;l=l.filter(c=>c.birthday&&+c.birthday.split('-')[1]===m)}return l}
function updCount(){const l=audience();$('count').textContent=`Will go to ${l.length} contact${l.length===1?'':'s'}.`;if(l.length){$('preview').classList.remove('hidden');$('pv').textContent=fill($('msg').value,l[0])}else $('preview').classList.add('hidden')}
function render(){const db=loadDB();const q=$('q').value.toLowerCase();
  const list=db.contacts.filter(c=>(c.name+c.phone+c.email).toLowerCase().includes(q)).slice().reverse();
  $('rows').innerHTML=list.map(c=>`<tr><td>${esc(c.name)}</td><td>${esc(fmtPhone(c.phone))}</td><td>${esc(c.email)}</td><td>${esc(c.table||'—')}</td><td><code>${esc(c.code)}</code></td>
   <td>${c.redeemed?'<span class="tag">Redeemed</span>':'<span class="tag no">Unclaimed</span>'}</td><td>${c.redeemed?'':`<button class="btn small secondary" data-r="${esc(c.id)}">Mark redeemed</button>`}</td></tr>`).join('');
  $('empty').style.display=db.contacts.length?'none':'block';
  const wk=Date.now()-7*864e5;$('sTotal').textContent=db.contacts.length;$('sWeek').textContent=db.contacts.filter(c=>new Date(c.createdAt)>wk).length;
  $('sRed').textContent=db.contacts.filter(c=>c.redeemed).length;$('sSent').textContent=db.messages.filter(m=>m.type==='sms').length;
  $('camps').innerHTML=db.campaigns.length?db.campaigns.map(c=>`<div class="item"><b>${esc(c.label)}</b> · ${c.sent} texts · ${new Date(c.at).toLocaleString()}${c.schedule?` · <i>${esc(c.schedule)}</i>`:''}<div class="fine">${esc(c.body)}</div></div>`).join(''):'<p class="fine">No blasts sent yet.</p>';
  updCount()}
$('rows').addEventListener('click',e=>{const id=e.target.dataset.r;if(!id)return;const db=loadDB();const c=db.contacts.find(x=>x.id===id);c.redeemed=true;saveDB(db);render()});
$('tpl').onchange=setTpl;$('aud').onchange=updCount;$('msg').oninput=updCount;$('q').oninput=render;
$('seed').onclick=()=>{seedDemo();render()};$('reset').onclick=()=>{if(confirm('Clear all demo data?')){localStorage.removeItem(DB_KEY);render()}};
$('send').onclick=()=>{const n=sendBlast($('tpl').value,$('msg').value,$('aud').value);
  if($('when').value==='mon4'){const db=loadDB();db.campaigns[0].schedule='Scheduled weekly: Mondays 4:00 PM (demo sends one batch now)';saveDB(db)}
  $('sendMsg').textContent=`✓ Simulated blast "sent" to ${n} contact${n===1?'':'s'}. No real texts were sent.`;render()};
setTpl();render();
