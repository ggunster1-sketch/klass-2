export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ reply: 'Разрешен только POST-запрос' });
    }

    let body = req.body;
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    const { prompt, mode, image } = body || {};
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        return res.status(200).json({ reply: '🔑 Ключ GROQ_API_KEY не найден! Проверь настройки на Vercel.' });
    }

    const endpoint = 'https://groq.com';

    try {
        let payload;

        if (mode === 'homework' && image) {
            payload = {
                model: 'meta-llama/llama-4-scout-17b-16e-instruct',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: 'Ты — добрая Умная Сова для ученика 2 класса 63-й школы Владивостока. Внимательно посмотри на фото тетради. Найди ошибки в примерах или словах. НИКОГДА не пиши сразу готовый ответ! Вместо этого похвали за аккуратность, укажи, где именно ошибка, и дай понятную подсказку, чтобы ребенок сам её исправил. Пиши коротко, дружелюбно и с эмодзи.'
                            },
                            {
                                type: 'image_url',
                                image_url: { url: image }
                            }
                        ]
                    }
                ],
                temperature: 0.5,
                max_tokens: 800
            };
        } else {
            const systemPrompt = mode === 'story'
                ? 'Ты добрая Сова-сказочница из Волшебной Академии 63-й школы Владивостока. Сочини короткую, увлекательную добрую сказку на русском языке (до 1200 знаков), где главный герой — указанный ребенок. Используй эмодзи.'
                : 'Ты веселая и мудрая Сова-наставница для учеников младших классов 63-й школы Владивостока. Отвечай понятно, дружелюбно, коротко и с эмодзи на русском языке.';

            payload = {
                model: 'openai/gpt-oss-20b',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt || 'Привет!' }
                ],
                temperature: 0.7,
                max_tokens: 1500
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

        const rawText = await response.text();
        const data = JSON.parse(rawText);

        if (!response.ok) {
            const errMsg = data.error ? data.error.message : rawText;
            return res.status(200).json({ reply: '⚠️ Ошибка Groq: ' + errMsg });
        }

        const first = Array.isArray(data.choices) ? data.choices.at(0) : null;
        const reply = (first && first.message && first.message.content) || 'Сова задумалась, попробуй еще раз!';
        return res.status(200).json({ reply });
    } catch (e) {
        return res.status(200).json({ reply: '⚠️ Сбой: ' + e.message });
    }
}

