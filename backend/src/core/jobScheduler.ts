import schedule from 'node-schedule';
import { DriverRegistry } from './driverRegistry';

/**
 * Manages all scheduled tasks for fetching data.
 * It iterates over all loaded drivers and schedules automatic runs
 * for those that support it.
 */
export class JobScheduler {
    private registry: DriverRegistry;

    constructor(registry: DriverRegistry) {
        this.registry = registry;
        console.log('[JobScheduler] Initialized.');
    }

    /**
     * Starts the scheduler.
     * Finds all automatic drivers and creates a recurring job for them.
     */
    start() {
        console.log('[JobScheduler] Starting scheduler...');
        const allDrivers = this.registry.getAllDrivers();

        let automaticJobs = 0;
        for (const driver of allDrivers) {
            if (driver.metadata.isAutomatic) {

                //TODO: Make scheduler per driver, currently 5 past each hour
                const rule = '5 * * * *';

                schedule.scheduleJob(rule, async () => {
                    console.log(`[JobScheduler] Running scheduled job for: ${driver.metadata.name}`);
                    try {
                        const result = await driver.runFetch();
                        console.log(
                            `[JobScheduler] SUCCESS: ${driver.metadata.name} run finished. ` +
                            `Found ${result.newEvents} new events.`
                        );
                        if (result.warnings && result.warnings.length > 0) {
                            console.warn(
                                `[JobScheduler] WARNINGS from ${driver.metadata.name}:`,
                                result.warnings.join(', ')
                            );
                        }
                    } catch (err) {
                        console.error(
                            `❌ [JobScheduler] FAILED: ${driver.metadata.name} run failed:`,
                            err
                        );
                    }
                });

                automaticJobs++;
                console.log(`[JobScheduler] Scheduled automatic run for '${driver.metadata.name}' with rule: ${rule}`);
            }
        }

        console.log(`[JobScheduler] Started with ${automaticJobs} automatic jobs.`);
    }

    /**
     * Triggers a manual fetch for a specific driver.
     * This is called by the API.
     * @param driverId - The ID of the driver to run.
     */
    async triggerManualRun(driverId: string): Promise<{ newEvents: number; warnings?: string[] }> {
        const driver = this.registry.getDriver(driverId);
        if (!driver) {
            throw new Error(`Driver with ID '${driverId}' not found.`);
        }

        console.log(`[JobScheduler] Triggering manual run for: ${driver.metadata.name}`);
        try {
            const result = await driver.runFetch();
            console.log(
                `[JobScheduler] SUCCESS: Manual run for ${driver.metadata.name} finished. ` +
                `Found ${result.newEvents} new events.`
            );
            return result;
        } catch (err) {
            console.error(
                `[JobScheduler] FAILED: Manual run for ${driver.metadata.name} failed:`,
                err
            );
            // Re-throw the error so the API handler can catch it
            throw err;
        }
    }
}