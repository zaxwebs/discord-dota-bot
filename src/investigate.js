import OpenAI from 'openai';
import { calculateCost } from './logger.js';

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an advanced Dota 2 research assistant. Today's date is ${new Date().toISOString().split('T')[0]}. When a user asks a complex question about the meta, patches, item builds, or heroes, you MUST perform deep research to find the most accurate and up-to-date information before answering.
- ALWAYS search the web to find the exact current live patch version of Dota 2 BEFORE searching for meta information, because your training data cutoff means you do not know the current patch.
- Once you know the current patch, search the web to find recent patch notes, meta tier lists, and item build guides related to the user's query.

Synthesize the data you gather. Keep answers concise (under 1500 characters) and informative, citing the sources or data you found where relevant. If a question is not related to Dota 2, politely redirect the user to ask a Dota 2 question instead.`;

/**
 * Perform a deep investigation to answer a Dota 2 question using native OpenAI web search.
 * @param {string} question - The user's question
 * @returns {Promise<string>} The AI response
 */
export async function investigateDota(question) {
    try {
        const response = await client.responses.create({
            model: "gpt-4o",
            tools: [{ type: "web_search" }],
            input: [
                { role: "developer", content: SYSTEM_PROMPT },
                { role: "user", content: question }
            ],
            // Ensure we wait for the response to finish
            temperature: 0.7,
        });

        const inputTokens = response.usage?.input_tokens || 0;
        const outputTokens = response.usage?.output_tokens || 0;

        return {
            answer: response.output_text,
            tokens: inputTokens + outputTokens,
            cost: calculateCost('gpt-4o', inputTokens, outputTokens)
        };
    } catch (error) {
        console.error("AI Investigation failed:", error);
        return {
            answer: "I encountered an error while researching this topic. Try simplifying your query or asking a different question.",
            tokens: 0,
            cost: 0
        };
    }
}
