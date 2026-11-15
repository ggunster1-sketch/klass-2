export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ reply: 'Разрешен только POST-запрос' });
    }

    let body = req.body;
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    const { prompt, mode } = body || {};
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        return res.status(200).json({ reply: '🔑 Ключ GROQ_API_KEY не найден! Проверь настройки на Vercel.' });
    }

    const systemPrompt = mode === 'story'
        ? 'Ты добрая Сова-сказочница из Волшебной Академии 2 «Б». Сочини короткую, увлекательную добрую сказку на русском языке (до 1200 знаков), где главный герой — указанный ребенок. Используй эмодзи.'
        : 'Ты веселая и мудрая Сова-наставница для учеников 2 класса (8-9 лет). Отвечай понятно, дружелюбно, коротко и с эмодзи на русском языке.';

    const endpoint = 'https://' + 'api.' + 'groq.com' + '/openai/v1/chat/completions';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + apiKey.trim(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'openai/gpt-oss-20b',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt || 'Привет!' }
                ],
                temperature: 0.7,
                max_tokens: 1500
            })
        });

        const rawText = await response.text();
        const data = JSON.parse(rawText);

        if (!response.ok) {
            const errMsg = data.error ? data.error.message : rawText;
            return res.status(200).json({ reply: '⚠️ Ошибка Groq: ' + errMsg });
        }

        const first = Array.isArray(data.choices) ? data.choices.at(0) : null;
        const reply = (first && first.message && first.message.content) || ('Пустой ответ: ' + rawText.slice(0, 150));
        return res.status(200).json({ reply });
    } catch (e) {
        return res.status(200).json({ reply: '⚠️ Сбой: ' + e.message });
    }
}
