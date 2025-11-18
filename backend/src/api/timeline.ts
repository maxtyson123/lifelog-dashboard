import { Router } from 'express';
import {SearchPostReq, SearchPostRes, TimelineGetReq, TimelineGetRes} from "../types/api";

const timelineRouter = Router();

/**
 * GET /api/timeline
 * Fetches all events within a given time range.
 */
timelineRouter.get<{}, TimelineGetRes, TimelineGetReq>('/', async (req, res) => {
    try {
        const { queryEngine } = req.context;
        const { startDate, endDate } = req.query;

        if (typeof startDate !== 'string' || typeof endDate !== 'string') {
            return res.status(400).json({
                error: 'Missing required query parameters: "startDate" and "endDate".'
            });
        }

        // Basic validation for ISO 8601 format (regex)
        const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|([+-]\d{2}:\d{2}))$/;
        if (!iso8601Regex.test(startDate) || !iso8601Regex.test(endDate)) {
            return res.status(400).json({
                error: 'Invalid date format. "startDate" and "endDate" must be full ISO 8601 strings.'
            });
        }

        const results = await queryEngine.getTimeline(startDate, endDate);

        res.json({
            range: { startDate, endDate },
            count: results.length,
            results,
        });
    } catch (err) {
        console.error('[API /timeline] Error:', err);
        res.status(500).json({ error: 'Failed to fetch timeline data.' });
    }
});

export { timelineRouter };