fetch('qr/qr-target.txt').then(r=>r.text()).then(t=>document.getElementById('qrurl').textContent=t.trim()).catch(()=>{})
