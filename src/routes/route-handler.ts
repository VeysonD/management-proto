import * as Express from 'express';

const apiRouter = Express.Router();

apiRouter.get('/', (_req, res) => {
    const date = new Date();
    res.send(`API route check: ${date}`);
});

export default apiRouter;