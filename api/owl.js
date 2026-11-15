export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ reply: 'Разрешен только POST-запрос' });
    }

    const { prompt, mode } = req.body || {};
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        return res.status(200).json({ reply: '🔑 Ключ GROQ_API_KEY не найден! Проверь Settings -> Environment Variables на Vercel и нажми Redeploy.' });
    }

    const systemPrompt = mode === 'story'
        ? 'Ты добрая Сова-сказочница из Волшебной Академии 2 «Б». Сочини короткую, увлекательную добрую сказку на русском языке (до 1200 знаков), где главный герой — указанный ребенок. Используй эмодзи.'
        : 'Ты веселая и мудрая Сова-наставница для учеников 2 класса (8-9 лет). Отвечай понятно, дружелюбно, коротко и с эмодзи на русском языке.';

    try {
        const response = await fetch('https://groq.com', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey.trim()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt || 'Привет!' }
                ],
                temperature: 0.7,
                max_tokens: 700
            })
        });

        const data = await response.json();

        if (!response.ok) {
            const errMsg = data.error ? data.error.message : 'Ошибка ответа от Groq';
            return res.status(200).json({ reply: '⚠️ Ошибка Groq: ' + errMsg });
        }

        const reply = data.choices[0].message.content;
        return res.status(200).json({ reply });
    } catch (e) {
        return res.status(200).json({ reply: '⚠️ Сбой сервера: ' + e.message });
    }
}
