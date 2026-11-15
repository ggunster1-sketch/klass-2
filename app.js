const START_YEAR = 2025;
let gems = Number(localStorage.getItem('g')) || 10;
let petXp = Number(localStorage.getItem('px')) || 0;
let dzFree = localStorage.getItem('dz') !== null ? Number(localStorage.getItem('dz')) : 3;
let isVip = localStorage.getItem('vip') === '1';
let mode = 'math', ans = '';

function updateVL() {
  const n = new Date();
  const vl = new Date(n.getTime() + n.getTimezoneOffset() * 60000 + 36000000);
  const h = String(vl.getHours()).padStart(2, '0');
  const m = String(vl.getMinutes()).padStart(2, '0');
  const elC = document.getElementById('vlClock');
  if (elC) elC.innerText = `🕒 Владивосток: ${h}:${m}`;
  let gr = vl.getFullYear() - START_YEAR + (vl.getMonth() >= 8 ? 1 : 0);
  if (gr < 1) gr = 1;
  const lbl = `${gr} «Б»`;
  if (document.getElementById('topBadge')) document.getElementById('topBadge').innerText = `✨ АКАДЕМИЯ ${lbl}`;
  if (document.getElementById('mainTitle')) document.getElementById('mainTitle').innerText = `Волшебная Академия ${lbl}`;
  if (document.getElementById('lesTitle')) document.getElementById('lesTitle').innerText = `📜 Расписание ${lbl} (СОШ № 63)`;
}

function save() {
  localStorage.setItem('g', gems);
  localStorage.setItem('px', petXp);
  localStorage.setItem('dz', dzFree);
  document.getElementById('gems').innerText = gems;
  const st = [['🥚','Яйцо дракона'],['🐣','Малыш-дракон'],['🐉','Огненный дракон'],['🦖','Мега-Дракон']];
  let idx = petXp >= 100 ? 3 : petXp >= 50 ? 2 : petXp >= 20 ? 1 : 0;
  document.getElementById('petEmoji').innerText = st[idx][0];
  document.getElementById('petName').innerText = st[idx][1];
  document.getElementById('petFill').style.width = Math.min(100, (petXp % 50) * 2 + 15) + '%';
  const b = document.getElementById('dzBadge');
  if (b) b.innerText = isVip ? '👑 VIP: Безлимит' : `Бесплатно: ${dzFree} шт.`;
}

function openM(id) { document.getElementById(id).classList.add('open'); }
function closeM(id) { document.getElementById(id).classList.remove('open'); }

function triggerDZ() {
  if (!isVip && dzFree <= 0) return openM('mVip');
  document.getElementById('dzFile').click();
}

function checkPhoto(e) {
  const f = e.target.files[0];
  if (!f) return;
  const out = document.getElementById('dzOut');
  out.style.display = 'block';
  out.innerText = '🦉 Сова надела очки и проверяет тетрадь...';
  const r = new FileReader();
  r.onload = ev => {
    const img = new Image();
    img.onload = async () => {
      const c = document.createElement('canvas');
      const s = Math.min(1, 850 / img.width);
      c.width = img.width * s; c.height = img.height * s;
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      try {
        const res = await fetch('/api/owl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'homework', image: c.toDataURL('image/jpeg', 0.8) })
        });
        const d = await res.json();
        out.innerText = d.reply;
        if (!isVip && dzFree > 0) dzFree--;
        gems += 3; petXp += 10; save(); fireworks();
      } catch (err) { out.innerText = '⚠️ Ошибка отправки фото.'; }
    };
    img.src = ev.target.result;
  };
  r.readAsDataURL(f);
}

async function askAI() {
  const q = document.getElementById('qIn').value.trim();
  if (!q) return;
  const out = document.getElementById('aiOut');
  out.style.display = 'block'; out.innerText = '🦉 Сова думает...';
  try {
    const res = await fetch('/api/owl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: q, mode: 'chat' })
    });
    const d = await res.json();
    out.innerText = d.reply;
  } catch (e) { out.innerText = '⚠️ Ошибка связи.'; }
}

async function makeStory() {
  const n = document.getElementById('nameIn').value.trim() || 'Ученик 2 Б';
  const out = document.getElementById('storyOut');
  out.style.display = 'block'; out.innerText = '✨ Сочиняю сказку...';
  try {
    const res = await fetch('/api/owl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: n, mode: 'story' })
    });
    const d = await res.json();
    out.innerText = d.reply;
  } catch (e) { out.innerText = '⚠️ Ошибка.'; }
}

const words = [['В_РОБЕЙ','О'],['М_ЛОКО','О'],['К_РОВА','О'],['С_БАКА','О'],['Р_БЯТА','Е'],['М_ДВЕДЬ','Е'],['П_НАЛ','Е']];
function setMode(m) {
  mode = m;
  document.getElementById('tMath').classList.toggle('active', m === 'math');
  document.getElementById('tWords').classList.toggle('active', m === 'words');
  nextTask();
}

function nextTask() {
  const g = document.getElementById('grid'); g.innerHTML = '';
  let opts = [];
  if (mode === 'math') {
    const a = Math.floor(Math.random() * 4) + 2, b = Math.floor(Math.random() * 9) + 1;
    ans = String(a * b);
    document.getElementById('task').innerText = `${a} × ${b} = ?`;
    opts = [ans, String(a * b + 2), String(Math.max(1, a * b - 3))].sort(() => Math.random() - 0.5);
  } else {
    const w = words[Math.floor(Math.random() * words.length)];
    document.getElementById('task').innerText = w[0]; ans = w[1];
    opts = ['О', 'А', 'Е'].sort(() => Math.random() - 0.5);
  }
  opts.forEach(o => {
    const b = document.createElement('button');
    b.className = 'ans'; b.innerText = o;
    b.onclick = () => {
      if (o === ans) { b.classList.add('ok'); gems += 5; petXp += 5; save(); setTimeout(nextTask, 500); }
      else b.classList.add('no');
    };
    g.appendChild(b);
  });
}

function buy(h, p) {
  if (gems >= p) { gems -= p; document.getElementById('hat').innerText = h; save(); fireworks(); closeM('mShop'); }
  else alert('Не хватает кристаллов 💎!');
}

let trips = JSON.parse(localStorage.getItem('tr') || '["Семья Евы (3 чел.)"]');
function renderTrips() { const el = document.getElementById('tList'); if (el) el.innerHTML = '<b>Уже едут:</b> ' + trips.join(', '); }
function joinTrip() {
  const f = document.getElementById('tFam').value.trim(), c = document.getElementById('tCnt').value || 2;
  if (!f) return alert('Впиши фамилию!');
  trips.push(`${f} (${c} чел.)`); localStorage.setItem('tr', JSON.stringify(trips));
  renderTrips(); gems += 10; save(); fireworks();
}

function payDemo(t) { alert(`Выбран тариф: ${t}. На следующем шаге привяжем оплату ЮKassa / СБП!`); }
function owlClick() { document.getElementById('owlText').innerText = 'Ух-ух! 63-я школа рулит! 🎉'; fireworks(); }
function petClick() { alert(`Опыт питомца: ${petXp}. Решай примеры и проверяй ДЗ!`); }
function fireworks() {
  ['🎉','✨','💎','🌟','🦉'].forEach(e => {
    const s = document.createElement('div'); s.className = 'spark'; s.innerText = e;
    s.style.left = Math.random() * 88 + 'vw'; s.style.top = (60 + Math.random() * 25) + 'vh';
    document.body.appendChild(s); setTimeout(() => s.remove(), 1300);
  });
}

updateVL(); setInterval(updateVL, 30000); save(); nextTask(); renderTrips();
