import morgan from 'morgan';

// Setup Morgan custom tokens
morgan.token('user', req => req.user);
morgan.token('command', req => req.command);
morgan.token('tokens', req => req.tokens || '-');
morgan.token('cost', req => req.cost ? `$${req.cost.toFixed(6)}` : '-');
morgan.token('duration', req => req.durationMs);

const format = ':method :command by :user :status - :duration ms - Tokens: :tokens - Cost: :cost';
const morganLogger = morgan(format);

/**
 * Logs a Discord interaction using Morgan format
 * @param {object} interaction - The Discord interaction object
 * @param {number} durationMs - How long the command took to execute (ms)
 * @param {number} status - HTTP-like status code (e.g., 200, 500)
 * @param {number} tokens - OpenAI tokens used (optional)
 * @param {number} cost - OpenAI API cost in USD (optional)
 */
export function logInteraction(interaction, durationMs, status = 200, tokens = 0, cost = 0) {
    const req = {
        method: 'CMD',
        command: `/${interaction.commandName}`,
        user: interaction.user.tag,
        durationMs,
        tokens,
        cost,
        headers: {},
        connection: { remoteAddress: '127.0.0.1' },
        originalUrl: '/',
        url: '/'
    };

    const res = {
        statusCode: status,
        getHeader: () => '',
        _header: true,
        finished: true,
        on: function (event, cb) {
            if (event === 'finish') cb();
        },
        removeListener: () => { }
    };

    morganLogger(req, res, (err) => {
        if (err) console.error(err);
    });
}

/**
 * Calculates the cost of an OpenAI API call
 * @param {string} model - The model name 
 * @param {number} inputTokens - Number of input tokens
 * @param {number} outputTokens - Number of output tokens
 */
export function calculateCost(model, inputTokens, outputTokens) {
    let inputCost = 0;
    let outputCost = 0;

    if (model.startsWith('gpt-4o-mini')) {
        inputCost = (inputTokens / 1_000_000) * 0.150;
        outputCost = (outputTokens / 1_000_000) * 0.600;
    } else if (model.startsWith('gpt-4o')) {
        inputCost = (inputTokens / 1_000_000) * 5.00;
        outputCost = (outputTokens / 1_000_000) * 15.00;
    }

    return inputCost + outputCost;
}
