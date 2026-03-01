import morgan from 'morgan';

morgan.token('user', req => req.user);
morgan.token('command', req => req.command);
morgan.token('tokens', req => req.tokens || 0);
morgan.token('cost', req => req.cost ? `$${req.cost.toFixed(6)}` : '-');

const logger = morgan(':method :command by :user :status - :response-time ms - Tokens: :tokens - Cost: :cost');

const req = {
    method: 'CMD',
    command: '/ask',
    user: 'TestUser#1234',
    tokens: 154,
    cost: 0.002
};

const res = {
    statusCode: 200,
    getHeader: () => undefined,
    _header: true,
    headersSent: true,
    finished: true,
    on: function (event, cb) {
        if (event === 'finish') {
            // trigger it immediately
            setTimeout(cb, 10);
        }
    },
    removeListener: () => { }
};

logger(req, res, (err) => {
    if (err) console.error(err);
});
