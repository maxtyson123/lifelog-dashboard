import { Indexer } from './indexer';
import { LogEvent } from '../types/schema';
import {Knex} from "knex";

// Define filter types for the API
export interface SearchFilters {
    startDate?: string;
    endDate?: string;
    sources?: string[];
    eventTypes?: string[];
}

/**
 * Provides a high-level abstraction for querying the data.
 * This class is the main interface for the API handlers.
 * It translates API requests into complex database queries
 * using the Indexer.
 */
export class QueryEngine {
    constructor(private indexer: Indexer) {
        console.log('[QueryEngine] Initialized.');
    }

    /**
     * Performs a full-text search (or simple LIKE search) across all events.
     * @param queryText - The text to search for.
     * @param filters - Optional filters for time, source, etc.
     * @param limit - Max number of results.
     */
    async search(queryText: string, filters: SearchFilters = {}, limit = 50): Promise<LogEvent[]> {
        console.log(`[QueryEngine] Performing search for: "${queryText}"`);

        return [
            {
                id: 'mock-search-1',
                timestamp: new Date().toISOString(),
                sourceDriverId: 'spotify',
                eventType: 'MUSIC_LISTEN',
                data: { artist: 'Mock Artist', track: 'Song matching ' + queryText },
                tags: ['mock', 'search'],
            },
            {
                id: 'mock-search-2',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
                sourceDriverId: 'google-search',
                eventType: 'SEARCH',
                data: { query: `search for ${queryText}` },
                tags: ['mock'],
            },
            {
                id: 'mock-search-3',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                sourceDriverId: 'google-timeline',
                eventType: 'LOCATION',
                data: { latitude: 40.7128, longitude: -74.0060, activity: 'walking' },
                tags: ['mock', 'nyc'],
            }
        ].slice(0, limit) as any; // Respect the limit


        // Get a new query builder instance from the indexer
        const query = this.indexer.getQueryBuilder();

        //TODO: FTS5
        query.where('data', 'like', `%${queryText}%`);

        // Apply Filters
        this.applyFilters(query, filters);
        query.orderBy('timestamp', 'desc').limit(limit);

        // Run query
        const results = await query;
        return results.map(this.parseEventFromDb);
    }

    /**
     * Retrieves all events for a specific time range, for the Timeline page.
     * @param startDate - ISO 8601 string.
     * @param endDate - ISO 8601 string.
     */
    async getTimeline(startDate: string, endDate: string): Promise<LogEvent[]> {
        console.log(`[QueryEngine] Fetching timeline from ${startDate} to ${endDate}`);
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        const midPoint = new Date(start + (end - start) / 2).toISOString();
        const startPoint = new Date(start + 1000 * 60 * 15).toISOString(); // 15 mins in

        // Return mock data
        return [
            {
                id: 'mock-timeline-1',
                timestamp: startPoint,
                sourceDriverId: 'google-search',
                eventType: 'SEARCH',
                data: { query: 'mock search query' },
                tags: ['mock'],
            },
            {
                id: 'mock-timeline-2',
                timestamp: midPoint,
                sourceDriverId: 'spotify',
                eventType: 'MUSIC_LISTEN',
                data: { artist: 'Mock Artist', track: 'Mock Track' } as any,
                tags: ['mock'],
            },
            {
                id: 'mock-timeline-3',
                timestamp: new Date(new Date(midPoint).getTime() + 1000 * 60 * 60).toISOString(),
                sourceDriverId: 'google-timeline',
                eventType: 'LOCATION',
                data: { latitude: 40.7128, longitude: -74.0060, activity: 'running' },
                tags: ['mock', 'nyc'],
            }
        ];


        const query = this.indexer.getQueryBuilder();

        query
            .where('timestamp', '>=', startDate)
            .where('timestamp', '<=', endDate)
            .orderBy('timestamp', 'asc');

        const results = await query;
        return results.map(this.parseEventFromDb);
    }

    /**
     * Runs an aggregate query for the Analytics page.
     * This is a placeholder for a much more complex function.
     */
    async getAnalytics(config: any): Promise<any> {
        console.log(`[QueryEngine] Running analytics query: ${config.type}`);

        switch (config.type) {
            case 'music_counts_by_source':
                console.log('[QueryEngine] Returning MOCK data for music_counts_by_source');
                await new Promise(res => setTimeout(res, 800));
                return [
                    { sourceDriverId: 'spotify', eventCount: 5708 },
                    { sourceDriverId: 'apple_music_backup', eventCount: 1245 },
                    { sourceDriverId: 'google_takeout_music', eventCount: 320 },
                ];

            case 'stat_card_summary':
                console.log('[QueryEngine] Returning MOCK data for stat_card_summary');
                // Simulate a database delay
                await new Promise(res => setTimeout(res, 500));
                return {
                    totalEvents: 12402,
                    tracksPlayed: 5708,
                    placesVisited: 182,
                    activeDrivers: 3,
                    change: "+10.2% vs last month",
                };

            // LIVE QUERY (example)
            case 'total_event_count_LIVE':
                const result = await this.indexer.getQueryBuilder().count('id as total');
                return result[0];

            default:
                throw new Error(`Analytics type '${config.type}' not implemented.`);
        }
    }

    /**
     * A reusable helper to apply standard filters to a Knex query.
     */
    private applyFilters(query: Knex.QueryBuilder, filters: SearchFilters) {
        if (filters.startDate) {
            query.where('timestamp', '>=', filters.startDate);
        }
        if (filters.endDate) {
            query.where('timestamp', '<=', filters.endDate);
        }
        if (filters.sources && filters.sources.length > 0) {
            query.whereIn('sourceDriverId', filters.sources);
        }
        if (filters.eventTypes && filters.eventTypes.length > 0) {
            query.whereIn('eventType', filters.eventTypes);
        }
    }

    /**
     * De-serializes the 'data' and 'tags' fields from JSON
     * strings back into objects.
     */
    private parseEventFromDb(dbRow: any): LogEvent {
        return {
            ...dbRow,
            data: typeof dbRow.data === 'string' ? JSON.parse(dbRow.data) : dbRow.data,
            tags: typeof dbRow.tags === 'string' ? JSON.parse(dbRow.tags) : dbRow.tags,
        };
    }
}