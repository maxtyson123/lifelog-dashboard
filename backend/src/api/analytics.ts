import { Router } from 'express';
import {AnalyticsPostReq, AnalyticsPostRes} from "../types/api";

const analyticsRouter = Router();

/**
 * POST /api/analytics/query
 * Runs a specific, pre-defined analytics query.
 *
 * Body:
 * {
 * "queryName": "musicCountsBySource",
 * "timeRange": { ... },
 * "config": { ... }
 * }
 */
analyticsRouter.post<{}, AnalyticsPostRes, AnalyticsPostReq>('/query', async (req, res) => {
    try {
        const { queryEngine } = req.context;
        const { queryConfig } = req.body;

        if (!queryConfig || typeof queryConfig.type !== 'string') {
            return res.status(400).json({ error: 'Invalid request body. Missing "queryConfig" or "queryConfig.type".' });
        }

        //TODO: Proper build of queryConfig based on type and other params
        const results = await queryEngine.getAnalytics(queryConfig);

        res.json({
            query: queryConfig,
            results,
        });
    } catch (err: any) {
        console.error('[API /analytics] Error:', err);
        // Handle "not implemented" errors gracefully
        if (err.message && err.message.includes('not implemented')) {
            return res.status(404).json({ error: err.message });
        }
        res.status(500).json({ error: 'Failed to run analytics query.' });
    }
});

export { analyticsRouter };