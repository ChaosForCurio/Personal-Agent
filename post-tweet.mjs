const content = `🚀 Just launched my Personal AI Agent!

It can:
✨ Post to X automatically
📰 Fetch trending AI news
📚 Research latest AI papers
🤖 Generate content with Gemini

Built with Next.js + AI

Want your own AI assistant? Let's build the future together! 🔥

#AI #AgentAI #NextJS #OpenSource`;

fetch('http://localhost:3000/api/post-twitter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
})
    .then(res => res.json())
    .then(data => console.log('Result:', JSON.stringify(data, null, 2)))
    .catch(err => console.error('Error:', err));
