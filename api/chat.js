import fetch from 'node-fetch';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { provider, messages } = req.body;

    try {
        let reply;

        switch(provider) {
            case 'groq':
                reply = await callGroq(messages);
                break;
            case 'openrouter':
                reply = await callOpenrouter(messages);
                break;
            case 'huggingface':
                reply = await callHuggingface(messages);
                break;
            default:
                return res.status(400).json({ error: 'Invalid provider' });
        }

        res.status(200).json({ reply });
    } catch (error) {
        console.error('Serverless function error:', error);
        res.status(500).json({ error: 'AI call failed' });
    }
}

async function callGroq(messages) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama3-8b-8192', // adjust as needed
            messages: messages
        })
    });

    const data = await response.json();
    return data.choices[0].message.content;
}

async function callOpenrouter(messages) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'mistral/mistral-7b-instruct', // adjust as needed
            messages: messages
        })
    });

    const data = await response.json();
    return data.choices[0].message.content;
}

async function callHuggingface(messages) {
    const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            inputs: messages.map(m => m.content).join('\n')
        })
    });

    const data = await response.json();
    return data.generated_text || JSON.stringify(data);
}
