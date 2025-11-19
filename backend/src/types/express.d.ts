import { DriverRegistry } from '../core/driverRegistry';
import { Indexer } from '../core/indexer';
import { QueryEngine } from '../core/queryEngine';
import { JobScheduler } from '../core/jobScheduler';

// Extend Express Request interface
declare module 'express-serve-static-core' {
    interface Request {
        context: {
            indexer: Indexer;
            driverRegistry: DriverRegistry;
            queryEngine: QueryEngine;
            jobScheduler: JobScheduler;
        };
    }
}

type __TEST_LOAD__ = true;