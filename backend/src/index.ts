import express from 'express';
import cors from 'cors';
import type { RequestHandler } from 'express';
import morgan from 'morgan';
import { CONFIG } from './config';
import { DriverRegistry } from './core/driverRegistry';
import { Indexer } from './core/indexer';
import { JobScheduler } from './core/jobScheduler';
import { apiRouter } from './api';
import {QueryEngine} from "./core/queryEngine";
import {__TEST_LOAD__} from "./types/express";

async function main() {
    const app = express();

    const x: __TEST_LOAD__ = true;

    // Middleware setup
    app.use(cors() as unknown as RequestHandler); //BS
    app.use(express.json());
    app.use(morgan('dev'));

    // Core system
    console.log('Initializing components...');
    const indexer = new Indexer(CONFIG.INDEX_DB_PATH);
    await indexer.init();
    const queryEngine = new QueryEngine(indexer)

    // Load all drivers
    const driverRegistry = new DriverRegistry(indexer);
    await driverRegistry.loadDrivers();

    // Start automatic fetching
    const jobScheduler = new JobScheduler(driverRegistry);
    jobScheduler.start();

    // Pass core systems to API routes via context
    app.use((req, res, next) => {
        req.context = { indexer, driverRegistry, jobScheduler, queryEngine };
        next();
    });
    app.use('/api', apiRouter);

    // Start
    app.listen(CONFIG.PORT, () => {
        console.log(`Backend server running on http://localhost:${CONFIG.PORT}`);
        console.log(`Loaded drivers: ${driverRegistry.getDriverIds().join(', ')}`);
    });
}

main().catch(err => {
    console.error('Server failed to start:', err);
    process.exit(1);
});