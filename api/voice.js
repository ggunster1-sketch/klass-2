export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Только POST' });
    }
    let body = req.body;
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    const { audioBase64 } = body || {};
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || !audioBase64) {
        return res.status(200).json({ text: '' });
    }
    try {
        const cleanBase64 = audioBase64.includes(',') ? audioBase64.split(',').at(1) : audioBase64;
        const buffer = Buffer.from(cleanBase64, 'base64');
        const blob = new Blob([buffer], { type: 'audio/webm' });

        const formData = new FormData();
        formData.append('file', blob, 'speech.webm');
        formData.append('model', 'whisper-large-v3-turbo');
        formData.append('language', 'ru');

        const response = await fetch('https://groq.com', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + apiKey.trim() },
            body: formData
        });
        const data = await response.json();
        return res.status(200).json({ text: data.text || '' });
    } catch (e) {
        return res.status(200).json({ text: '', error: e.message });
    }
}
