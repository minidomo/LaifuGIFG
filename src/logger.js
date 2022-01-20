'use strict';

const { pino } = require('pino');
const transport = pino.transport({
    targets: [
        {
            target: 'pino-pretty',
            options: { destination: 1 },
        },
        {
            target: 'pino/file',
            options: { destination: 'latest.log', append: false },
        },
    ],
});

const logger = pino(transport);

module.exports = logger;
