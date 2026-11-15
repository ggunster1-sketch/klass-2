const VIP_CODE = 'EVA63';

function getYearsWord(age) {
  const n = Math.abs(age) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return 'лет';
  if (n1 > 1 && n1 < 5) return 'года';
  if (n1 === 1) return 'год';
  return 'лет';
}

document.body.insertAdjacentHTML('beforeend', `
<div class="modal" id="mAuth"><div class="m-box" style="border-color:#4cc9f0">
  <button type="button" class="close" onclick="closeM('mAuth')">×</button>
  <h2 style="color:#4cc9f0">👤 Профиль ученика / родителя</h2>
  <select id="uRole" style="width:100%;background:#130f26;color:#fff;padding:10px;border-radius:12px;border:1px solid #ffffff44;margin-bottom:8px;font-size:.95rem">
    <option value="student">👧 Я ученик класса</option>
    <option value="parent">👨‍👩‍👧 Я родитель</option>
  </select>
  <input type="text" id="uName" placeholder="Твоё имя (напр. Ева или папа Саша)" style="margin-bottom:8px">
  <input type="text" id="uChild" placeholder="Имя ребенка (если заполняет родитель)" style="margin-bottom:8px">
  <p style="font-size:.82rem;color:#ffd166;margin-bottom:4px">🎂 Полная дата рождения ребенка:</p>
  <div class="row" style="margin-top:0;margin-bottom:8px">
    <input type="number" id="uDay" placeholder="День (20)" min="1" max="31">
    <select id="uMonth" style="flex:1.5;background:#130f26;color:#fff;padding:10px;border-radius:12px;border:1px solid #ffffff44;font-size:.9rem">
      <option value="1">Января</option><option value="2">Февраля</option><option value="3" selected>Марта</option>
      <option value="4">Апреля</option><option value="5">Мая</option><option value="6">Июня</option>
      <option value="7">Июля</option><option value="8">Августа</option><option value="9">Сентября</option>
      <option value="10">Октября</option><option value="11">Ноября</option><option value="12">Декабря</option>
    </select>
    <input type="number" id="uYear" placeholder="Год (2018)" min="2010" max="2025">
  </div>
  <input type="text" id="uCode" placeholder="Семейный VIP-код (если есть)" style="margin-bottom:8px">
  <button type="button" class="btn-gr" onclick="saveProfile()">✅ Сохранить профиль</button>
  <div id="authStatus" style="margin-top:10px;font-size:.84rem;color:#ffd166;text-align:center"></div>
</div></div>
`);

(function initAuthUI() {
  const top = document.querySelector('.top');
  if (top) {
    const btn = document.createElement('button');
    btn.id = 'authBtn';
    btn.type = 'button';
    btn.className = 'btn-g';
    btn.style.cssText = 'margin:0;padding:6px 10px;font-size:.8rem;background:#4cc9f0';
    btn.onclick = () => openM('mAuth');
    top.insertBefore(btn, top.lastElementChild);
  }
  applyProfile();
})();

function saveProfile() {
  const role = document.getElementById('uRole').value;
  const name = document.getElementById('uName').value.trim();
  const child = document.getElementById('uChild').value.trim();
  const day = document.getElementById('uDay').value.trim();
  const month = document.getElementById('uMonth').value;
  const year = document.getElementById('uYear').value.trim();
  const code = document.getElementById('uCode').value.trim().toUpperCase();

  if (!name) return alert('Пожалуйста, впиши имя!');
  if (!day || !year) return alert('Укажи день и год рождения ребенка!');

  const user = { role, name, child: child || name, day, month, year, code };
  localStorage.setItem('acad_user', JSON.stringify(user));
  applyProfile();
  fireworks();
  closeM('mAuth');
}

function applyProfile() {
  const raw = localStorage.getItem('acad_user');
  const btn = document.getElementById('authBtn');
  if (!raw) {
    if (btn) btn.innerText = '🔑 Вход';
    return;
  }
  const u = JSON.parse(raw);
  const cName = (u.child || u.name).toLowerCase();
  const isEva = (cName === 'ева' && u.day === '20' && u.month === '3' && u.year === '2018') || u.code === VIP_CODE;

  if (isEva) {
    localStorage.setItem('vip', '1');
    if (typeof isVip !== 'undefined') isVip = true;
    if (typeof save === 'function') save();
  }

  const vipMark = localStorage.getItem('vip') === '1' ? ' 👑' : '';
  if (btn) btn.innerText = `👤 ${u.name}${vipMark}`;

  const n = new Date();
  const vl = new Date(n.getTime() + n.getTimezoneOffset() * 60000 + 36000000);
  const curY = vl.getFullYear();
  const bYear = Number(u.year);
  const age = curY - bYear;
  const targetName = u.role === 'parent' ? u.child : u.name;
  const dStr = `${String(u.day).padStart(2,'0')}.${String(u.month).padStart(2,'0')}.${bYear}`;

  const st = document.getElementById('authStatus');
  if (st) {
    st.innerText = isEva
      ? `👑 Вечный VIP без подписки активирован! Ребенок: ${targetName} (${dStr})`
      : `Профиль: ${u.name} | Ребенок: ${targetName} (${dStr})`;
  }

  const ban = document.getElementById('banTitle');
  if (ban && bYear > 2000) {
    if (String(vl.getDate()) === String(u.day) && String(vl.getMonth() + 1) === String(u.month)) {
      ban.innerText = `🎂 С ДНЁМ РОЖДЕНИЯ, ${targetName.toUpperCase()}! ТЕБЕ СЕГОДНЯ ${age} ${getYearsWord(age)}! 🎉`;
    } else {
      const nextAge = (vl.getMonth() + 1 > Number(u.month) || (vl.getMonth() + 1 === Number(u.month) && vl.getDate() > Number(u.day))) ? age + 1 : age;
      ban.innerText = `🎂 Именинник: ${targetName} (${dStr}) — исполнится ${nextAge} ${getYearsWord(nextAge)}!`;
    }
  }
}
