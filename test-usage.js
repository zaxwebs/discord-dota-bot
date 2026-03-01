import 'dotenv/config';
import OpenAI from 'openai';

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function run() {
    try {
        const response1 = await client.responses.create({ model: 'gpt-4o-mini', input: 'hi' });
        console.log('Responses usage:', response1.usage);

        const response2 = await client.chat.completions.create({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: 'hi' }], max_tokens: 10 });
        console.log('Chat format usage:', response2.usage);
    } catch (e) {
        console.error(e);
    }
}
run();
