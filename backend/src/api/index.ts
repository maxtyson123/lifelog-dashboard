import { Router } from 'express';
import { searchRouter } from './search';
import { historyRouter } from './history';
import { analyticsRouter } from './analytics';
import { sourcesRouter } from './sources';
import {systemRouter} from "./system";

const apiRouter = Router();

// Mount all the specific routers
apiRouter.use('/search', searchRouter);
apiRouter.use('/history', historyRouter);
apiRouter.use('/analytics', analyticsRouter);
apiRouter.use('/sources', sourcesRouter);
apiRouter.use('/system', systemRouter);

// Health check
apiRouter.get('/status', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});

export { apiRouter };