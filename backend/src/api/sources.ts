import { Router } from 'express';
import {SourcesGetReq, SourcesGetRes, SourcesPostParams, SourcesPostRes} from "../types/api";

const sourcesRouter = Router();

/**
 * GET /api/sources
 * Lists all available drivers and their current status.
 */
sourcesRouter.get<{}, SourcesGetRes, SourcesGetReq>('/', async (req, res) => {

    // TODO: Remove mock data and uncomment real implementation below
    const mockDriverInfo = [
        {
            metadata: {
                id: 'spotify',
                name: 'Spotify',
                description: 'Parses "MyData" Spotify exports.',
                isAutomatic: true
            },
            status: {
                lastPull: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
                storageUsage: '1.2 GB',
                health: 'OK',
                message: 'Last pull successful. 120 new events.'
            }
        },
        {
            metadata: {
                id: 'google-takeout',
                name: 'Google Takeout',
                description: 'Parses timeline, search, and activity.',
                isAutomatic: true
            },
            status: {
                lastPull: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                storageUsage: '5.8 GB',
                health: 'OK',
                message: 'Awaiting new Takeout zip file.'
            }
        },
        {
            metadata: {
                id: 'apple-backup',
                name: 'Apple iPhone Backup',
                description: 'Parses HealthKit and location data.',
                isAutomatic: false
            },
            status: {
                lastPull: null,
                storageUsage: '0 MB',
                health: 'WARN',
                message: 'Manual run required. Point to backup file.'
            }
        },
        {
            metadata: {
                id: 'system-logger',
                name: 'System Logger',
                description: 'Logs server health and performance.',
                isAutomatic: true
            },
            status: {
                lastPull: new Date().toISOString(),
                storageUsage: '15.2 MB',
                health: 'ERROR',
                message: 'Failed to write to log file. Check disk space.'
            }
        }
    ];

    res.json(mockDriverInfo as SourcesGetRes);

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
        res.json(driverInfo as any);

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