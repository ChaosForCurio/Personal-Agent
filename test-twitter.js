// Quick test with regenerated credentials
const { TwitterApi } = require('twitter-api-v2');

async function testTwitter() {
    console.log('Testing Twitter API with new credentials...');
    
    const client = new TwitterApi({
        appKey: 'wlwfbqardUxADWaGxFy15ChR5',
        appSecret: 'UTu5D451BSUdTar7bIUU3ZurM9RzSp9OjZTiGUemv7vm7ix754',
        accessToken: '1984251741534355456-Ugs8bICcQkjoM09CyLWWBpoxRnUIGC',
        accessSecret: '5NQqrpWJ0vI2kvD6Xwl05fMhVVlvPgUUujhBt3f6Kfss4',
    });
    
    try {
        // Verify credentials
        console.log('\nVerifying credentials...');
        const me = await client.v2.me();
        console.log('✅ Authenticated as:', me.data.username);
        
        // Post tweet
        console.log('\nPosting tweet...');
        const tweetContent = `🚀 Just launched my Personal AI Agent!

It can:
✨ Post to X automatically
📰 Fetch trending AI news
📚 Research latest AI papers
🤖 Generate content with Gemini

Built with Next.js + AI

Want your own AI assistant? Let's build the future together! 🔥

#AI #AgentAI #NextJS #OpenSource`;

        const tweet = await client.v2.tweet(tweetContent);
        console.log('✅ Tweet posted successfully!');
        console.log('Tweet ID:', tweet.data.id);
        console.log('Tweet URL: https://x.com/' + me.data.username + '/status/' + tweet.data.id);
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.data) {
            console.error('Twitter API Response:', JSON.stringify(error.data, null, 2));
        }
    }
}

testTwitter();
