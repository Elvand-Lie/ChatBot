// example fragment in public/bundle.js
async function sendMessage() {
  const txt = userInput.value.trim();
  if (!txt) return;

  // append user message locally...
  messages.push({ role: 'user', content: txt });

  // send to backend
  const resp = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, mode: modeSelect.value })
  });
  const { reply } = await resp.json();

  // append AI reply locally...
  messages.push({ role: 'assistant', content: reply });
}
