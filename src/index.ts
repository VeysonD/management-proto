import * as dotenv from 'dotenv';

dotenv.config();

import * as Express from 'express';
import * as Http from 'http';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';


import Logger from './utils/logger';



process.on('unhandledRejection', reason => {
    console.error('Unhandled rejection at: ', reason);
});

async function run() {
    const app = Express();

    // enable cors
    app.use(cors());

    // add body to request objects
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    // test route
    app.get('/', (_req, res) => {
        const date = new Date();
        res.send(`API running at: ${date}`);
    });

    const server = Http.createServer(app);
    const { PORT, SERVER } = process.env;

    server.listen(PORT, () => {
        console.log(`Server is listening at ${SERVER}:${PORT}`);
    });
}

run().catch((err => Logger.error(err)));