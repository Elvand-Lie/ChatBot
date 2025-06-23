const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages,                     // the array you’ve been building
    mode: modeSelect.value        // pass along simple|core|profound|devil
  })
});
const { reply } = await response.json();