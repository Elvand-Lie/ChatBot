document.getElementById('sendBtn').addEventListener('click', async () => {
    const userInput = document.getElementById('userInput').value;

    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            provider: 'groq',  // or 'openrouter', 'huggingface'
            messages: [
                { role: 'user', content: userInput }
            ]
        })
    });

    const data = await response.json();
    console.log('AI says:', data.reply);

    // Example: Display reply on page
    document.getElementById('responseBox').innerText = data.reply;
});