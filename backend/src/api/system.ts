import {Router} from 'express';
import os from 'os';

const systemRouter = Router();

/**
 * GET /api/system/logs
 * Returns the recent server logs.
 */
systemRouter.get('/logs', (req, res) => {
    const {logger} = req.context;
    res.json(logger.getRecent());
});

/**
 * GET /api/system/stats
 * Returns basic system health metrics.
 */

systemRouter.get('/stats', async (req, res) => {
    const { driverRegistry, jobScheduler, indexer } = req.context;

    const uptime = process.uptime();
    const drivers = driverRegistry.getAllDrivers();

    const indexStats = await indexer.getStats();
    const jobStats = jobScheduler.getStatus();

    res.json({
        uptime,
        cpuLoad: os.loadavg(),
        memory: {
            total: os.totalmem(),
            free: os.freemem(),
        },
        driverStatus: {
            total: drivers.length,
            active: drivers.filter(d => d.metadata.isAutomatic).length,
        },
        storage: {
            used: '4.2 GB',
            total: '4.0 TB',
            percent: 0.1
        },

        ingestion: {
            totalEvents: indexStats.totalEvents,
            activeJobs: jobStats.activeJobs,
            nextJobs: jobStats.nextJobs
        }
    });
});

export {systemRouter};