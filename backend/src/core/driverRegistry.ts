import { IDriver } from '../types/driver.interface';
import { Indexer } from './indexer';

// Drivers
import { SpotifyDriver } from '../drivers/spotify.driver';
import { GoogleTakeoutDriver } from '../drivers/googleTakeout.driver';
import { AppleBackupDriver } from '../drivers/appleBackup.driver';

export class DriverRegistry {
    private drivers: Map<string, IDriver> = new Map();

    constructor(private indexer: Indexer) {}

    async loadDrivers() {

        // TODO: Load all dynamically
        const driversToLoad = [
            new SpotifyDriver(this.indexer),
            new GoogleTakeoutDriver(this.indexer),
            new AppleBackupDriver(this.indexer),
        ];

        for (const driver of driversToLoad) {
            try {
                await driver.init();
                this.drivers.set(driver.metadata.id, driver);
            } catch (err) {
                console.error(`Failed to load driver: ${driver.metadata.name}`, err);
            }
        }
    }

    getDriver(id: string): IDriver | undefined {
        return this.drivers.get(id);
    }

    getAllDrivers(): IDriver[] {
        return Array.from(this.drivers.values());
    }

    getDriverIds(): string[] {
        return Array.from(this.drivers.keys());
    }
}