const router = require('express').Router();
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs/promises');

async function loadPhilosophers() {
  const raw = await fs.readFile(path.resolve(__dirname, '../philosophers.json'), 'utf8');
  return JSON.parse(raw).philosophers;
}

function buildContext(question, philosophers) {
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
  if (!picks.length) {
    return philosophers.filter(p => ['Nietzsche', 'Epictetus', 'Buddha'].includes(p.name))
      .map(p => `${p.name}: ${p.core_doctrine_or_theme}.`).join(' | ');
  }
  return picks.map(p => `${p.name}: ${p.core_doctrine_or_theme}.`).join(' | ');
}

async function callGroq(messages) { /* … */ }
async function callOpenrouter(messages) { /* … */ }
async function callHuggingface(messages) { /* … */ }

router.post('/', async (req, res) => {
  try {
    const { messages: clientMessages, mode } = req.body;
    const philosophers = await loadPhilosophers();
    const teaching = buildContext(clientMessages.slice(-1)[0].content, philosophers);
    function getSystemPrompt() {
        switch(mode) {
          case 'simple':
            return '...';
          case 'core':
            return '...';
          case 'profound':
            return '...';
          case 'devil':
            return '...';
          default:
             return 'You are Antithesis in Simple Mode...';
          }
}
    const fullMessages = [
      { role: 'system', content: systemPrompt },
      { role: 'system', content: `Draw on these teachings: ${teaching}` },
      ...clientMessages
    ];

    // multi-API fallback
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
