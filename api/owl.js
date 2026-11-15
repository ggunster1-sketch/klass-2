export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt, mode } = req.body;
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ reply: 'Ух-ух! Ключ магии еще не добавлен в настройки Vercel.' });
    }

    const systemPrompt = mode === 'story'
        ? 'Ты мудрая добрая Сова-сказочница из Волшебной Академии 2 «Б». Сочиняй короткие, увлекательные, добрые волшебные сказки на русском языке (до 1500 знаков), где главный герой — указанный ребенок. Используй эмодзи.'
        : 'Ты мудрая, веселая и добрая Сова-наставница из Волшебной Академии для учеников 2 класса (8-9 лет). Отвечай понятно, дружелюбно, с юмором и эмодзи. Помогай с учебой, но не просто давай списать, а объясняй. Отвечай на русском языке.';

    try {
        const response = await fetch('https://groq.com', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 800
            })
        });

        const data = await response.json();
        const reply = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || 'Сова задумалась и просит спросить еще раз!';
        res.status(200).json({ reply });
    } catch (error) {
        res.status(500).json({ reply: 'Магическая связь прервалась. Попробуй через минутку!' });
    }
}
