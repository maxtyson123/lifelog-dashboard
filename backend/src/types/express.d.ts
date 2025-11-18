import { DriverRegistry } from '../core/driverRegistry';
import { Indexer } from '../core/indexer';
import { QueryEngine } from '../core/queryEngine';
import { JobScheduler } from '../core/jobScheduler';

// Add all core services to the Express request context
export interface AppContext {
    indexer: Indexer;
    driverRegistry: DriverRegistry;
    queryEngine: QueryEngine;
    jobScheduler: JobScheduler;
}

// Extend Express Request interface
declare global {
    namespace Express {
        interface Request {
            context: AppContext;
        }
    }
}