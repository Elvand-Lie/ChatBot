document.getElementById('send-btn').addEventListener('click', async () => {
    const userInputEl = document.getElementById('user-input');
    const userInput = userInputEl.value.trim();
    const mode = document.getElementById('mode').value;
    const chatBox = document.getElementById('chat-box');

    if (!userInput) return;

    // Append user message instantly
    chatBox.innerHTML += `<div class="msg user-msg">${userInput}</div>`;
    userInputEl.value = '';

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: userInput }],
                mode: mode,
                provider: 'groq'
            })
        });

        const data = await response.json();

        // Create a new div for the AI message
        const aiDiv = document.createElement('div');
        aiDiv.className = 'msg ai-msg';
        chatBox.appendChild(aiDiv);

        // Typing animation
        typeTextEffect(aiDiv, data.reply || '[No response]');

    } catch (error) {
        console.error('Error fetching AI response:', error);
        chatBox.innerHTML += `
            <div class="msg error-msg">❌ Error: Unable to fetch AI response.</div>
        `;
    }
});

function typeTextEffect(container, text, speed = 20) {
    let i = 0;
    const interval = setInterval(() => {
        container.textContent += text.charAt(i);
        i++;
        if (i >= text.length) clearInterval(interval);
    }, speed);
}

document.getElementById('user-input').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    document.getElementById('send-btn').click();
  }
});

