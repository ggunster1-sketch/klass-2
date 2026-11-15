export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ reply: 'Только POST' });
    }
    let body = req.body;
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    const { prompt, mode, image } = body || {};
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return res.status(200).json({ reply: '🔑 Ключ GROQ_API_KEY не найден в Vercel!' });
    }
    const endpoint = 'https://' + 'api.' + 'groq.com' + '/openai/v1/chat/completions';
    try {
        let payload;
        if (mode === 'homework' && image) {
            payload = {
                model: 'meta-llama/llama-4-scout-17b-16e-instruct',
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Ты добрая Умная Сова для ученика 2 класса 63-й школы Владивостока. Проверь фото тетради. Найди ошибки, но НЕ пиши готовый ответ. Похвали за старание, укажи на ошибку и дай подсказку, как исправить самому. Пиши коротко и с эмодзи.' },
                        { type: 'image_url', image_url: { url: image } }
                    ]
                }],
                temperature: 0.5,
                max_tokens: 800
            };
        } else {
            const sys = mode === 'story'
                ? 'Ты добрая Сова-сказочница из Волшебной Академии 63-й школы Владивостока. Сочини короткую добрую сказку (до 1000 знаков), где главный герой — указанный ребенок. Используй эмодзи.'
                : 'Ты веселая и мудрая Сова-наставница для учеников 2 класса 63-й школы Владивостока. Отвечай понятно, дружелюбно, коротко и с эмодзи.';
            payload = {
                model: 'openai/gpt-oss-20b',
                messages: [
                    { role: 'system', content: sys },
                    { role: 'user', content: prompt || 'Привет!' }
                ],
                temperature: 0.7,
                max_tokens: 1200
            };
        }
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + apiKey.trim(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const raw = await response.text();
        if (!raw) {
            return res.status(200).json({ reply: '⚠️ Пустой ответ Groq (код ' + response.status + ')' });
        }
        const data = JSON.parse(raw);
        if (!response.ok) {
            return res.status(200).json({ reply: '⚠️ Ошибка Groq: ' + (data.error ? data.error.message : raw.slice(0, 100)) });
        }
        const first = Array.isArray(data.choices) ? data.choices.at(0) : null;
        const reply = (first && first.message && first.message.content) || 'Сова задумалась, попробуй еще раз!';
        return res.status(200).json({ reply });
    } catch (e) {
        return res.status(200).json({ reply: '⚠️ Сбой: ' + e.message });
    }
}
