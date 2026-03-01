// OpenAI-powered Dota 2 Q&A

import OpenAI from 'openai';
import { fetchMatchSummary } from './api.js';
import { calculateCost } from './logger.js';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a knowledgeable Dota 2 assistant. Answer questions about Dota 2 heroes, items, strategies, mechanics, meta, patches, and lore. You can fetch and analyze specific Dota 2 match details using a tool if a user provides a match ID. Keep answers concise (under 1500 characters) and informative. Use specific numbers and facts when possible. If a question is not related to Dota 2, politely redirect the user to ask a Dota 2 question instead.`;

const tools = [
    {
        type: "function",
        function: {
            name: "fetch_match_details",
            description: "Fetch a summary of a specific Dota 2 match by its numeric Match ID.",
            parameters: {
                type: "object",
                properties: {
                    match_id: {
                        type: "string",
                        description: "The Dota 2 Match ID (e.g. '7891234567'). Keep as string to avoid precision loss.",
                    },
                },
                required: ["match_id"],
            },
        }
    }
];

/**
 * Ask a Dota 2 question via OpenAI.
 * @param {string} question - The user's question
 * @returns {Promise<string>} The AI response
 */
export async function askDota(question) {
    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: question },
    ];

    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        tools: tools,
        max_tokens: 1024,
        temperature: 0.7,
    });

    const responseMessage = response.choices[0].message;

    // Check if the AI wanted to use a tool
    if (responseMessage.tool_calls) {
        messages.push(responseMessage);

        for (const toolCall of responseMessage.tool_calls) {
            const functionName = toolCall.function.name;
            const functionArgs = JSON.parse(toolCall.function.arguments);

            let functionResult = '';
            if (functionName === 'fetch_match_details') {
                try {
                    functionResult = await fetchMatchSummary(functionArgs.match_id);
                } catch (e) {
                    functionResult = JSON.stringify({ error: e.message });
                }
            }

            messages.push({
                tool_call_id: toolCall.id,
                role: 'tool',
                name: functionName,
                content: functionResult,
            });
        }

        // Send results back to the model for a final summary
        const secondResponse = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
            max_tokens: 1024,
        });

        const totalInput = (response.usage?.prompt_tokens || 0) + (secondResponse.usage?.prompt_tokens || 0);
        const totalOutput = (response.usage?.completion_tokens || 0) + (secondResponse.usage?.completion_tokens || 0);

        return {
            answer: secondResponse.choices[0].message.content,
            tokens: totalInput + totalOutput,
            cost: calculateCost('gpt-4o-mini', totalInput, totalOutput)
        };
    }

    const inputTokens = response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.completion_tokens || 0;

    return {
        answer: responseMessage.content,
        tokens: inputTokens + outputTokens,
        cost: calculateCost('gpt-4o-mini', inputTokens, outputTokens)
    };
}
