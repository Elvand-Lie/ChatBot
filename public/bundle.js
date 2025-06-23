document.getElementById('send-btn').addEventListener('click', async () => {
    const userInput = document.getElementById('user-input').value.trim();
    const mode = document.getElementById('mode').value; // read mode select dropdown

    if (!userInput) return;

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: userInput }],
                mode: mode,  // pass mode to the backend (simple, core, profound, devil)
                provider: 'groq' // or 'openrouter', 'huggingface' as needed
            })
        });

        const data = await response.json();

        console.log('AI says:', data.reply);
        document.getElementById('chat-box').innerHTML += `
            <div class="msg user-msg">${userInput}</div>
            <div class="msg ai-msg">${data.reply}</div>
        `;
        document.getElementById('user-input').value = ''; // Clear input box

    } catch (error) {
        console.error('Error fetching AI response:', error);
        document.getElementById('chat-box').innerHTML += `
            <div class="msg error-msg">❌ Error: Unable to fetch AI response.</div>
        `;
    }
});
