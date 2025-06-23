import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs/promises';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, provider = 'groq', mode = 'simple' } = req.body;

  try {
    const philosophers = await loadPhilosophers();
    const latestUserMsg = messages.slice(-1)[0]?.content || '';
    const context = buildTeachingContext(latestUserMsg, philosophers);
    const systemPrompt = getSystemPrompt(mode);

    const fullMessages = [
      { role: 'system', content: systemPrompt },
      { role: 'system', content: `Draw on these teachings: ${context}` },
      ...messages
    ];

    let reply;

    switch (provider) {
      case 'groq':
        reply = await callGroq(fullMessages);
        break;
      case 'openrouter':
        reply = await callOpenrouter(fullMessages);
        break;
      case 'huggingface':
        reply = await callHuggingface(fullMessages);
        break;
      default:
        return res.status(400).json({ error: 'Invalid provider' });
    }

    res.status(200).json({ reply });
  } catch (err) {
    console.error('Serverless error:', err);
    res.status(500).json({ error: 'AI call failed' });
  }
}

function getSystemPrompt(mode) {
  switch (mode) {
    case 'simple':
      return 'You are Antithesis in Simple Mode, answer directly in one sentence, then 1–2 sentences of practical advice. Keep under 100 words.';
    case 'core':
      return 'You are Antithesis in Core Mode, reveal essential truths concisely. End with a crisp insight.';
    case 'profound':
      return 'You are Antithesis in Profound Mode, begin with a bold insight, then explore deeply and conclude with an unsettling question.';
    case 'devil':
      return 'You are Antithesis in Devil’s Advocate Mode, expose contradictions and hidden costs. End with a biting twist.';
    default:
      return 'You are Antithesis. Be clear, direct, and challenge assumptions.';
  }
}

function buildTeachingContext(question, philosophers) {
  const q = question.toLowerCase();
  const picks = philosophers.filter(p => {
    const theme = p.core_doctrine_or_theme.toLowerCase();
    return (
      (q.includes('will') && theme.includes('will')) ||
      (q.includes('action') && theme.includes('action')) ||
      (q.includes('suffer') && theme.includes('suffering')) ||
      (q.includes('freedom') && theme.includes('freedom'))
    );
  });

  const fallback = philosophers.filter(p => ['Nietzsche', 'Epictetus', 'Buddha'].includes(p.name));
  const final = picks.length ? picks : fallback;
  return final.map(p => `${p.name}: ${p.core_doctrine_or_theme}.`).join(' | ');
}

async function loadPhilosophers() {
  const filePath = path.resolve(process.cwd(), 'philosophers.json');
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw).philosophers;
}

async function callGroq(messages) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ model: 'llama3-8b-8192', messages })
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '[Groq returned no response]';
}

async function callOpenrouter(messages) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ model: 'meta-llama/llama-3.3-70b-instruct:free', messages })
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '[OpenRouter returned no response]';
}

async function callHuggingface(messages) {
  const res = await fetch('https://api-inference.huggingface.co/models/meta-llama/Llama-3.3-70B-Instruct', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: messages.map(m => m.content).join('\n')
    })
  });
  const data = await res.json();
  return data.generated_text || '[HuggingFace returned no text]';
}
