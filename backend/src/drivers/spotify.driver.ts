import { IDriver, DriverMetadata, DriverStatus } from '../types/driver.interface';
import { LogEvent, LogEventType } from '../types/schema';
import { Indexer } from '../core/indexer';
import { CONFIG } from '../config';
import fs from 'fs/promises';
import path from 'path';

// This is the core logic you'd implement for each driver
export class SpotifyDriver implements IDriver {
    metadata: DriverMetadata = {
        id: 'spotify',
        name: 'Spotify',
        description: 'Parses "MyData" Spotify exports.',
        isAutomatic: true,
    };

    private rawDataPath = path.join(CONFIG.NAS_PATH, 'raw/spotify');

    constructor(private indexer: Indexer) {}

    async init(): Promise<void> {
        // Ensure the raw data path exists
        await fs.mkdir(this.rawDataPath, { recursive: true });
        console.log('Spotify driver initialized.');
    }

    async runFetch(): Promise<{ newEvents: number }> {
        console.log('Running Spotify fetch...');

        // Todo: API to export spotify data?

        const newEvents = await this.parseData();
        if (newEvents.length > 0) {
            await this.indexer.addEvents(newEvents);
        }
        return { newEvents: newEvents.length };
    }

    async getStatus(): Promise<DriverStatus> {
        //TODO: Logic to check disk usage and last pull time
        return {
            lastPull: null,
            storageUsage: '0 MB',
            health: 'OK',
            message: 'Awaiting first run.',
        };
    }

    async parseData(): Promise<LogEvent[]> {


        console.warn('SpotifyDriver.parseData() is not implemented.');
        return []; // Return empty array until implemented

        const filePath = path.join(this.rawDataPath, 'endsong_0.json');
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const rawEvents = JSON.parse(fileContent);

        const logEvents: LogEvent[] = rawEvents.map(event => ({
          id: `spotify-${event.ts}-${event.trackName}`,
          timestamp: event.ts,
          sourceDriverId: 'spotify',
          eventType: 'MUSIC_LISTEN',
          data: {
            artist: event.artistName,
            track: event.trackName,
            msPlayed: event.msPlayed,
          },
          rawFileRef: filePath,
          tags: ['music', event.artistName]
        }));
        return logEvents;
    }
}