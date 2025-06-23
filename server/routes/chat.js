const router = require('express').Router();
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs/promises');

// Load philosophers from JSON file
async function loadPhilosophers() {
  const raw = await fs.readFile(path.resolve(__dirname, '../philosophers.json'), 'utf8');
  return JSON.parse(raw).philosophers;
}

// Build teaching context based on question keywords
function buildContext(question, philosophers) {
  const q = question.toLowerCase();
  let picks = philosophers.filter(p => {
    const theme = p.core_doctrine_or_theme.toLowerCase();
    return (
      (q.includes('will') && theme.includes('will')) ||
      (q.includes('action') && theme.includes('action')) ||
      (q.includes('suffer') && theme.includes('suffering')) ||
      (q.includes('freedom') && theme.includes('freedom'))
    );
  });
  if (!picks.length) {
    picks = philosophers.filter(p => ['Nietzsche','Epictetus','Buddha'].includes(p.name));
  }
  return picks.map(p => `${p.name}: ${p.core_doctrine_or_theme}.`).join(' | ');
}

// Multi-provider stubs
async function callGroq(messages)     { /* … */ }
async function callOpenrouter(messages){ /* … */ }
async function callHuggingface(messages){ /* … */ }

// Generate system prompt based on selected mode
function getSystemPrompt(mode) {
  switch (mode) {
    case 'simple':
      return 'You are Antithesis in Simple Mode. Answer in one sentence, then 1–2 short practical tips. Challenge false escapes, stay respectful.';
    case 'core':
      return 'You are Antithesis in Core Mode. Reveal essential truth concisely, without fluff or jargon. End with a crisp insight.';
    case 'profound':
      return 'You are Antithesis in Profound Mode. Start with a bold insight, explore with depth, conclude with an unsettling question.';
    case 'devil':
      return 'You are Antithesis in Devil’s Advocate Mode. Expose contradictions, offer no comfort, end with a biting twist.';
    default:
      return 'You are Antithesis.';
  }
}

router.post('/', async (req, res) => {
  try {
    const { messages: clientMessages = [], mode = 'simple' } = req.body;
    const philosophers = await loadPhilosophers();

    // grab the last user message
    const lastMsg = clientMessages.slice(-1)[0] || {};
    const teaching = buildContext(lastMsg.content || '', philosophers);
    const systemPrompt = getSystemPrompt(mode);

    const fullMessages = [
      { role: 'system',  content: systemPrompt },
      { role: 'system',  content: `Draw on these teachings: ${teaching}` },
      ...clientMessages
    ];

    // try Groq → OpenRouter → HuggingFace
    let reply;
    try { reply = await callGroq(fullMessages); }
    catch {
      try { reply = await callOpenrouter(fullMessages); }
      catch {
        reply = await callHuggingface(fullMessages).catch(() => '❌ All providers failed.');
      }
    }

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
