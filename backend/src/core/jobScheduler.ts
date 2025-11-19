import schedule from 'node-schedule';
import { DriverRegistry } from './driverRegistry';
import {systemLogger} from "./logger";

/**
 * Manages all scheduled tasks for fetching data.
 * It iterates over all loaded drivers and schedules automatic runs
 * for those that support it.
 */
export class JobScheduler {
    private registry: DriverRegistry;
    private scheduledJobs: Map<string, schedule.Job> = new Map();
    private activeJobCount = 0;

    constructor(registry: DriverRegistry) {
        this.registry = registry;
        systemLogger.success('JobScheduler', 'Initialized.');
    }

    /**
     * Starts the scheduler.
     * Finds all automatic drivers and creates a recurring job for them.
     */
    start() {
        systemLogger.info('JobScheduler', 'Starting scheduler...');
        const allDrivers = this.registry.getAllDrivers();

        let automaticJobs = 0;
        for (const driver of allDrivers) {
            if (driver.metadata.isAutomatic) {

                //TODO: Make scheduler per driver, currently 5 past each hour
                const rule = '5 * * * *';

                schedule.scheduleJob(rule, async () => {
                    this.activeJobCount++;
                    systemLogger.info('JobScheduler', `Running scheduled job for: ${driver.metadata.name}`);

                    try {
                        const result = await driver.runFetch();
                        systemLogger.success('JobScheduler', `Finished scheduled run for ${driver.metadata.name}. Imported ${result.newEvents} events.`);

                        if (result.warnings && result.warnings.length > 0) {
                            console.warn(
                                `[JobScheduler] WARNINGS from ${driver.metadata.name}:`,
                                result.warnings.join(', ')
                            );
                        }
                    } catch (err) {
                        systemLogger.error('JobScheduler', `Scheduled run for ${driver.metadata.name} failed.`);
                    } finally {
                        this.activeJobCount--;
                    }
                });

                automaticJobs++;
                systemLogger.info(`JobScheduler`, `Scheduled automatic run for '${driver.metadata.name}' with rule: ${rule}`);
            }
        }

        systemLogger.success('JobScheduler', `Started with ${automaticJobs} automatic jobs.`);
    }

    /**
     * Returns the current status of the scheduler for the dashboard.
     */
    getStatus() {
        // Get next invocation times
        const nextJobs = Array.from(this.scheduledJobs.entries()).map(([name, job]) => ({
            name,
            nextRun: job.nextInvocation()?.toISOString() || null
        })).sort((a, b) => {
            if (!a.nextRun) return 1;
            if (!b.nextRun) return -1;
            return new Date(a.nextRun).getTime() - new Date(b.nextRun).getTime();
        });

        return {
            activeJobs: this.activeJobCount,
            nextJobs: nextJobs.slice(0, 3)
        };
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

        systemLogger.info('JobScheduler', `Manual run triggered for: ${driver.metadata.name}`);
        try {
            this.activeJobCount++;
            const result = await driver.runFetch();
            systemLogger.success('JobScheduler', `Manual run for ${driver.metadata.name} finished. Found ${result.newEvents} new events.`);
            return result;
        } catch (err) {
            systemLogger.error('JobScheduler', `Manual run for ${driver.metadata.name} failed.`);
            // Re-throw the error so the API handler can catch it
            throw err;
        } finally {
            this.activeJobCount--;
        }
    }
}