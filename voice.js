const READ_TEXTS = [
  "Утром на поляне у края леса проснулся маленький рыжий лисёнок. Он сладко потянулся, умыл пушистую мордочку лапкой и побежал искать друзей. Солнце ярко светило сквозь зелёные ветки высоких сосен, а весёлые птицы пели звонкие песни.",
  "В Приморском крае у самого синего моря стоит красивый город Владивосток. По утрам над бухтой Золотой Рог кричат белые чайки, а большие корабли уходят в далёкое плавание. Ребята из нашего класса очень любят гулять по набережной.",
  "Однажды весной ёжик нашёл под старым дубом блестящий жёлудь. Он решил посадить его на солнечной горке возле своего домика. Всё лето ёжик поливал росток родниковой водой, и к осени вырос крепкий молодой дубок."
];

let mediaRec = null;
let audioChunks = [];
let readStartTime = 0;
let curTextIdx = 0;

document.body.insertAdjacentHTML('beforeend', `
<div class="modal" id="mRead"><div class="m-box" style="border-color:#4cc9f0">
  <button type="button" class="close" onclick="stopAndCloseRead()">×</button>
  <h2 style="color:#4cc9f0">🎙 Тренажер скорочтения с ИИ</h2>
  <p style="font-size:.82rem;color:#cbbfe8">Норма 2 класса: <b>45–60 слов в минуту</b>. Нажми «Начать», прочитай текст вслух и нажми «Стоп»!</p>
  <div id="readBox" style="background:#130f26;padding:12px;border-radius:14px;border:1px solid #4cc9f055;font-size:1rem;line-height:1.5;margin:10px 0;color:#fff"></div>
  <div style="display:flex;gap:8px;margin-bottom:8px">
    <button type="button" class="btn-g" style="margin:0;flex:1;background:#342966;color:#fff" onclick="nextReadText()">🔄 Другой текст</button>
    <button type="button" id="recBtn" class="btn-gr" style="margin:0;flex:2" onclick="toggleRecord()">🎙 Начать чтение</button>
  </div>
  <div class="rep" id="readOut"></div>
</div></div>
`);

(function addReadButton() {
  const menu = document.querySelector('.menu');
  if (menu) {
    const btn = document.createElement('div');
    btn.className = 'm-btn vip';
    btn.style.gridColumn = 'span 2';
    btn.innerHTML = '<div style="font-size:1.7rem">🎙</div>VIP: Скорочтение с микрофоном (+15 💎)';
    btn.onclick = () => {
      if (localStorage.getItem('vip') !== '1') return openM('mVip');
      nextReadText();
      openM('mRead');
    };
    menu.insertBefore(btn, menu.firstChild);
  }
})();

function nextReadText() {
  curTextIdx = (curTextIdx + 1) % READ_TEXTS.length;
  document.getElementById('readBox').innerText = READ_TEXTS.at(curTextIdx);
  document.getElementById('readOut').style.display = 'none';
}

function stopAndCloseRead() {
  if (mediaRec && mediaRec.state === 'recording') mediaRec.stop();
  closeM('mRead');
}

async function toggleRecord() {
  const btn = document.getElementById('recBtn');
  const out = document.getElementById('readOut');

  if (mediaRec && mediaRec.state === 'recording') {
    mediaRec.stop();
    btn.innerText = '⏳ Сова считает слова...';
    btn.disabled = true;
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];
    mediaRec = new MediaRecorder(stream);
    mediaRec.ondataavailable = e => { if (e.data.size > 0) audioChunks.push(e.data); };

    mediaRec.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      const seconds = Math.max(3, (Date.now() - readStartTime) / 1000);
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onloadend = async () => {
        out.style.display = 'block';
        out.innerText = '🦉 Сова внимательно слушала и проверяет скорость...';
        try {
          const res = await fetch('/api/voice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audioBase64: reader.result })
          });
          const data = await res.json();
          const spoken = (data.text || '').trim();
          const wordsCount = spoken ? spoken.split(/\s+/).length : 0;
          const wpm = Math.round((wordsCount / seconds) * 60);

          let verdict = wpm >= 60 ? '🏆 Супер-скорость! Выше нормы 2 класса!'
                      : wpm >= 45 ? '🌟 Отличный результат! Твёрдая пятёрка!'
                      : '👍 Хорошее начало! Тренируйся каждый день, и скорость вырастет!';

          out.innerText = `⏱ Время: ${Math.round(seconds)} сек.\n🗣 Распознано слов: ${wordsCount}\n⚡ Скорость: ${wpm} слов/мин\n\n${verdict}\n\n📝 Что услышала Сова:\n«${spoken || 'Тишина (попробуй говорить громче)'}»`;

          if (wordsCount >= 5) {
            if (typeof gems !== 'undefined') gems += 15;
            if (typeof petXp !== 'undefined') petXp += 15;
            if (typeof save === 'function') save();
            if (typeof fireworks === 'function') fireworks();
          }
        } catch (err) {
          out.innerText = '⚠️ Ошибка связи с Совой.';
        }
        btn.innerText = '🎙 Начать чтение';
        btn.disabled = false;
      };
      reader.readAsDataURL(blob);
    };

    readStartTime = Date.now();
    mediaRec.start();
    btn.innerText = '⏹ Стоп (Я дочитал!)';
    btn.style.background = '#f72585';
    btn.style.color = '#fff';
  } catch (err) {
    alert('Разреши сайту доступ к микрофону в браузере телефона!');
  }
}
