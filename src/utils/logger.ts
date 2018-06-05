import * as Winston from 'winston';

const Logger = new Winston.Logger({
    transports: [
        new Winston.transports.File({
            level: 'info',
            filename: '/tmp/api-server.log',
            handleExceptions: true,
            json: true,
            maxsize: 5242880,
            maxFiles: 5,
            colorize: false,
            humanReadableUnhandledException: true,
        }),
        new Winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true,
            humanReadableUnhandledException: true,
        })
    ],
    exitOnError: false,
});

export default Logger;