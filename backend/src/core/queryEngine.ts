import { Indexer } from './indexer';
import { LogEvent } from '../types/schema';

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