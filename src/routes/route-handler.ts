import * as Express from 'express';
import client from '../db/config';

const apiRouter = Express.Router();

apiRouter.get('/', (_req, res) => {
    console.log({client});
    const date = new Date();
    res.send(`API route check: ${date}`);
});

export default apiRouter;