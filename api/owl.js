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

    try {
        const response = await fetch('https://groq.com', {
            method: 'POST',
            redirect: 'follow',
            headers: {
                'Authorization': `Bearer ${apiKey.trim()}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (compatible; AcademyBot/1.0)'
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt || 'Привет!' }
                ],
                temperature: 0.7,
                max_tokens: 600
            })
        });

        const rawText = await response.text();
        if (!rawText) {
            return res.status(200).json({ reply: '⚠️ Пустой ответ. Статус: ' + response.status + ' | URL: ' + response.url });
        }

        const data = JSON.parse(rawText);
        if (!response.ok) {
            const errMsg = data.error ? data.error.message : rawText;
            return res.status(200).json({ reply: '⚠️ Ошибка API: ' + errMsg });
        }

        const firstChoice = Array.isArray(data.choices) ? data.choices : null;
        const reply = (firstChoice && firstChoice.message && firstChoice.message.content) || 'Сова задумалась!';
        return res.status(200).json({ reply });
    } catch (e) {
        return res.status(200).json({ reply: '⚠️ Сбой: ' + e.message });
    }
}
