document.body.insertAdjacentHTML('beforeend', `
<div class="modal" id="mTrips"><div class="m-box" style="border-color:#06d6a0">
  <button type="button" class="close" onclick="closeM('mTrips')">×</button>
  <h2 style="color:#06d6a0">🏕 Выезды 63-й школы (2 «Б»)</h2>
  <div style="background:#130f26;padding:11px;border-radius:12px;margin-bottom:10px">
    <div style="font-weight:900;color:#ffd166">🔥 Ближайший выезд: Семейные шашлыки!</div>
    <p style="margin-top:4px">📍 <b>Место:</b> Бухта Лазурная (Шамора), беседки</p>
    <p>📅 <b>Когда:</b> Ближайшая суббота в 11:00</p>
    <p>🎁 <b>Бонус детям:</b> +50 💎 и значок «Путешественник»!</p>
    <a href="https://2gis.ru" target="_blank" style="color:#4cc9f0;font-weight:800;text-decoration:none">🗺 Открыть маршрут в 2ГИС →</a>
  </div>
  <p style="font-weight:800;color:#ffd166">🙋‍♂️ Запись участников («Я еду!»):</p>
  <div class="row" style="margin-bottom:6px">
    <input type="text" id="tFam" placeholder="Фамилия семьи">
    <input type="number" id="tCnt" value="3" min="1" max="10" style="max-width:60px">
  </div>
  <button type="button" class="btn-gr" onclick="joinTrip()">✅ Записаться на выезд!</button>
  <div id="tList" style="margin-top:8px;font-size:.86rem;color:#a8dadc"></div>
  <hr style="border-color:#ffffff22;margin:12px 0">
  <p style="font-weight:800;color:#ffd166">🎒 Чек-лист «Что взять с собой»:</p>
  <label class="chk"><input type="checkbox"> Плед или раскладные стульчики</label>
  <label class="chk"><input type="checkbox"> Мяч, бадминтон или фрисби</label>
  <label class="chk"><input type="checkbox"> Вода, салфетки, спрей от клещей</label>
  <label class="chk"><input type="checkbox"> Теплая кофта (у моря во Владивостоке ветер!)</label>
</div></div>

<div class="modal" id="mVip"><div class="m-box">
  <button type="button" class="close" onclick="closeM('mVip')">×</button>
  <h2>👑 VIP-Академия 63-й школы</h2>
  <p style="color:#cbbfe8;font-size:.84rem">Дешевле 1 занятия с репетитором во Владивостоке (1 200 ₽), а работает весь месяц 24/7!</p>
  <ul style="margin:8px 0;font-size:.86rem">
    <li>📸 <b>Безлимит ИИ-проверки домашки</b> по фото</li>
    <li>🐉 <b>Полная эволюция питомца</b> до Мега-Дракона</li>
    <li>📖 <b>Безлимит персональных ИИ-сказок</b></li>
    <li>✨ <b>Золотая рамка</b> и двойные кристаллы</li>
  </ul>
  <div class="p-card best">
    <div class="p-tag">ВЫГОДА 300 ₽</div>
    <div style="font-weight:900;color:#ffd166">Учебное полугодие (6 мес.)</div>
    <div style="font-size:1.2rem;font-weight:900;margin:3px 0">199 ₽ / мес <span style="font-size:.8rem;font-weight:400;color:#cbbfe8">(1 194 ₽ за полгода)</span></div>
    <button type="button" class="btn-gr" onclick="payDemo('6 месяцев (1 194 ₽)')">💳 Оформить за 1 194 ₽ (+100 💎)</button>
  </div>
  <div class="p-card">
    <div style="font-weight:900">Подписка на 1 месяц</div>
    <div style="font-size:1.1rem;font-weight:900;margin:3px 0">249 ₽ / мес</div>
    <button type="button" class="btn-g" style="width:100%" onclick="payDemo('1 месяц (249 ₽)')">💳 Оформить на месяц за 249 ₽</button>
  </div>
</div></div>

<div class="modal" id="mStory"><div class="m-box">
  <button type="button" class="close" onclick="closeM('mStory')">×</button>
  <h2>📖 Персональная ИИ-сказка</h2>
  <p>Впиши имя ребенка, и Сова сочинит сказку!</p>
  <input type="text" id="nameIn" style="margin:8px 0" placeholder="Например: Ева и волшебный тигренок">
  <button type="button" class="btn-g" style="width:100%;padding:11px" onclick="makeStory()">✨ Сочинить сказку с Совой</button>
  <div class="rep" id="storyOut"></div>
</div></div>

<div class="modal" id="mShop"><div class="m-box">
  <button type="button" class="close" onclick="closeM('mShop')">×</button>
  <h2>🎩 Магазин украшений Совы</h2>
  <div class="s-row"><span>👑 Золотая корона</span><button type="button" class="btn-g" style="margin:0" onclick="buy('👑',15)">15 💎</button></div>
  <div class="s-row"><span>🎓 Шляпа мага</span><button type="button" class="btn-g" style="margin:0" onclick="buy('🎓',30)">30 💎</button></div>
  <div class="s-row"><span>🚀 Космо-шлем</span><button type="button" class="btn-g" style="margin:0" onclick="buy('🚀',50)">50 💎</button></div>
  <div class="s-row"><span>🎅 Шапка Деда Мороза</span><button type="button" class="btn-g" style="margin:0" onclick="buy('🎅',25)">25 💎</button></div>
</div></div>

<div class="modal" id="mLessons"><div class="m-box">
  <button type="button" class="close" onclick="closeM('mLessons')">×</button>
  <h2 id="lesTitle">📜 Расписание 2 «Б» (СОШ № 63)</h2>
  <p><b>1 урок:</b> 08:30 – 09:10 (перемена 10 мин)</p>
  <p><b>2 урок:</b> 09:20 – 10:00 (завтрак 20 мин)</p>
  <p><b>3 урок:</b> 10:20 – 11:00 (перемена 15 мин)</p>
  <p><b>4 урок:</b> 11:15 – 11:55 (перемена 10 мин)</p>
  <p><b>5 урок:</b> 12:05 – 12:45</p>
  <hr style="border-color:#ffffff22;margin:10px 0">
  <p style="font-weight:800;color:#ffd166">🔗 Полезные ссылки:</p>
  <a class="pill" href="https://uchi.ru" target="_blank">🎓 Учи.ру</a>
  <a class="pill" href="https://yandex.ru" target="_blank">📚 Яндекс.Учебник</a>
  <a class="pill" href="https://resh.edu.ru" target="_blank">🏫 РЭШ</a>
  <a class="pill" href="https://mishka-knizhka.ru" target="_blank">🎧 Аудиосказки</a>
</div></div>

<div class="modal" id="mParents"><div class="m-box">
  <button type="button" class="close" onclick="closeM('mParents')">×</button>
  <h2>🛡️ Родителям и Дни Рождения</h2>
  <p><b>🏫 Школа:</b> МБОУ СОШ № 63 г. Владивостока.</p>
  <p><b>🔄 Автопереход:</b> Каждый год 1 сентября класс автоматически переходит на год выше по времени Владивостока (UTC+10).</p>
  <hr style="border-color:#ffffff22;margin:10px 0">
  <p><b>🎂 Именинники:</b> Ева — 20 марта (2018 г.р.) 🎉</p>
</div></div>
`);
