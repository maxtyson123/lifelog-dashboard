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

        // Base music type: TODO: expand
        if (config.type === 'music_counts') {
            const query = this.indexer.getQueryBuilder();

            const result = await query
                .where('eventType', 'MUSIC_LISTEN')
                .groupBy('sourceDriverId')
                .count('id as eventCount')
                .select('sourceDriverId');

            return result;
        }

        throw new Error(`Analytics type '${config.type}' not implemented.`);
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