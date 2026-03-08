import morgan from 'morgan';

// Setup Morgan custom tokens
morgan.token('user', req => req.user);
morgan.token('command', req => req.command);
morgan.token('tokens', req => req.tokens > 0 ? `- Tokens: ${req.tokens}` : '');
morgan.token('duration', req => req.durationMs);

const format = ':method :command by :user :status - :duration ms :tokens';
const morganLogger = morgan((tokens, req, res) => {
    return [
        tokens.method(req, res),
        tokens.command(req, res),
        'by',
        tokens.user(req, res),
        tokens.status(req, res),
        '-',
        tokens.duration(req, res),
        'ms',
        tokens.tokens(req, res)
    ].filter(Boolean).join(' ');
});

/**
 * Logs a Discord interaction using Morgan format
 * @param {object} interaction - The Discord interaction object
 * @param {number} durationMs - How long the command took to execute (ms)
 * @param {number} status - HTTP-like status code (e.g., 200, 500)
 * @param {number} tokens - OpenAI tokens used (optional)
 */
export function logInteraction(interaction, durationMs, status = 200, tokens = 0) {
    const req = {
        method: 'CMD',
        command: `/${interaction.commandName}`,
        user: interaction.user.tag,
        durationMs,
        tokens,
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
