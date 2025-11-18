import { Router } from 'express';
import {SourcePostParams, SourcesGetReq, SourcesGetRes, SourcesPostParams, SourcesPostRes} from "../types/api";

const sourcesRouter = Router();

/**
 * GET /api/sources
 * Lists all available drivers and their current status.
 */
sourcesRouter.get<{}, SourcesGetRes, SourcesGetReq>('/', async (req, res) => {
    try {
        const { driverRegistry } = req.context;
        const drivers = driverRegistry.getAllDrivers();

        // Get status for all drivers in parallel
        const statusPromises = drivers.map(async (driver) => {
            try {
                const status = await driver.getStatus();
                return {
                    metadata: driver.metadata,
                    status,
                };
            } catch (err) {
                console.error(`[API /sources] Failed to get status for ${driver.metadata.id}:`, err);
                return {
                    metadata: driver.metadata,
                    status: {
                        health: 'ERROR',
                        message: 'Failed to fetch status.',
                    },
                };
            }
        });

        const driverInfo = await Promise.all(statusPromises);
        res.json(driverInfo);

    } catch (err) {
        console.error('[API /sources] Error:', err);
        res.status(500).json({ error: 'Failed to get data sources.' });
    }
});

/**
 * POST /api/sources/:id/run
 * Triggers a manual data fetch for a specific driver.
 */
sourcesRouter.post<SourcesPostParams, SourcesPostRes, SourcesPostParams>('/:id/run', async (req, res) => {
    try {
        const { jobScheduler } = req.context;
        const { id: driverId } = req.params;

        if (typeof driverId !== 'string' || driverId.length === 0) {
            return res.status(400).json({ error: 'Invalid or missing driver ID.' });
        }

        // The JobScheduler handles finding the driver and running it
        const result = await jobScheduler.triggerManualRun(driverId);

        res.json({
            message: `Successfully triggered run for '${driverId}'.`,
            ...result,
        });
    } catch (err: any) {
        console.error('[API /sources/run] Error:', err);
        // Handle specific errors
        if (err.message && err.message.includes('not found')) {
            return res.status(444).json({ error: err.message });
        }
        res.status(500).json({ error: 'Failed to trigger manual run.' });
    }
});

export { sourcesRouter };