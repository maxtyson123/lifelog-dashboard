import { LogEvent } from './schema';

export interface DriverMetadata {
    id: string;
    name: string;
    description: string;
    isAutomatic: boolean;
}

export interface DriverStatus {
    lastPull: string | null;
    storageUsage: string;
    health: 'OK' | 'WARN' | 'ERROR';
    message: string;
}

/**
 * Interface for all data source drivers.
 * Each driver is an isolated module responsible for its own data.
 */
export interface IDriver {
    metadata: DriverMetadata;

    /**
     * Initialize the driver. E.g., check for auth, mount points.
     */
    init(): Promise<void>;

    /**
     * Run a fetch and processing cycle.
     * This is called by the job scheduler or a manual trigger.
     * @returns A summary of the run.
     */
    runFetch(): Promise<{
        newEvents: number;
        warnings?: string[];
    }>;

    /**
     * Get the current status of the driver.
     */
    getStatus(): Promise<DriverStatus>;

    /**
     * Find raw data (e.loc, Spotify files) and parse them into LogEvents.
     * This is the core logic.
     */
    parseData(): Promise<LogEvent[]>;
}