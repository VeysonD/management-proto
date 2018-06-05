import * as dotenv from 'dotenv';

dotenv.config();

import * as Express from 'express';
import * as Http from 'http';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';

import apiRouter from './routes/route-handler';
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
    app.get('/', (req, res) => {
        console.log('A request has been sent: ', req);
        const date = new Date();
        res.send(`API running at: ${date}`);
    });

    // api routes
    app.use('/api', apiRouter);

    // establish http server
    const server = Http.createServer(app);
    const { PORT, SERVER } = process.env;

    server.listen(PORT, () => {
        console.log(`Server is listening at http://${SERVER}:${PORT}`);
    });
}

run().catch((err => Logger.error(err)));