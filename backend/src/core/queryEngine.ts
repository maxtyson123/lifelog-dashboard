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
        console.log(`[QueryEngine] Performing MOCK search for: "${queryText}"`);
        await new Promise(res => setTimeout(res, 300));
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
     * Retrieves all events for a specific time range, for the History page.
     * @param startDate - ISO 8601 string.
     * @param endDate - ISO 8601 string.
     */
    async getHistory(startDate: string, endDate: string): Promise<LogEvent[]> {
        console.log(`[QueryEngine] Fetching history from ${startDate} to ${endDate}`);
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        const midPoint = new Date(start + (end - start) / 2).toISOString();
        const startPoint = new Date(start + 1000 * 60 * 15).toISOString(); // 15 mins in

        // Return mock data
        return [
            {
                id: 'mock-history-1',
                timestamp: startPoint,
                sourceDriverId: 'google-search',
                eventType: 'SEARCH',
                data: { query: 'mock search query' },
                tags: ['mock'],
            },
            {
                id: 'mock-history-2',
                timestamp: midPoint,
                sourceDriverId: 'spotify',
                eventType: 'MUSIC_LISTEN',
                data: { artist: 'Mock Artist', track: 'Mock Track' } as any,
                tags: ['mock'],
            },
            {
                id: 'mock-history-3',
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
     * Runs analytics queries.
     */
    async getAnalytics(config: any): Promise<any> {
        console.log(`[QueryEngine] Running analytics query type: ${config.type}`);

        // Simulate DB delay
        await new Promise(res => setTimeout(res, 400));

        if (config.type === 'multi_stream') {
            return this.handleMultiStream(config.streams, config.widgetType);
        }

        throw new Error(`Analytics type '${config.type}' not implemented.`);
    }

    /**
     * Iterates over requested data streams and generates result sets.
     */
    private async handleMultiStream(streams: any[], widgetType: string) {
        const results = [];

        for (const stream of streams) {
            let baseValue = 100 + (stream.label.length * 120);

            // MOCK: Boost value based on filter to make it look realistic
            if (stream.filters?.eventType === 'MUSIC_LISTEN') baseValue += 2000;
            if (stream.filters?.eventType === 'LOCATION') baseValue += 500;

            // Lists
            if (widgetType === 'stat-list') {
                results.push({
                    id: stream.id,
                    label: stream.label,
                    type: 'list',
                    data: [
                        { label: 'The Weekend', value: baseValue },
                        { label: 'Taylor Swift', value: Math.floor(baseValue * 0.8) },
                        { label: 'Daft Punk', value: Math.floor(baseValue * 0.6) },
                        { label: 'Kendrick Lamar', value: Math.floor(baseValue * 0.4) },
                        { label: 'Pink Floyd', value: Math.floor(baseValue * 0.2) },
                    ]
                });
                continue;
            }

            // Time Based (Line/Area Charts)
            if (widgetType === 'graph-line' || widgetType === 'graph-area') {
                const points = [];
                const now = new Date();
                // Generate 7 days of mock trend data
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(now.getDate() - i);
                    points.push({
                        date: d.toISOString().split('T')[0], // YYYY-MM-DD
                        value: Math.floor(baseValue / 7) + Math.floor(Math.random() * 100)
                    });
                }
                results.push({
                    id: stream.id,
                    label: stream.label,
                    color: stream.color,
                    type: 'series',
                    data: points
                });
                continue;
            }

            // Aggregations (Pie/Bar/Stat)
            results.push({
                id: stream.id,
                label: stream.label,
                color: stream.color,
                value: baseValue, // The total count/sum
                type: 'aggregate'
            });
        }

        return results;
    }

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

    private parseEventFromDb(dbRow: any): LogEvent {
        return {
            ...dbRow,
            data: typeof dbRow.data === 'string' ? JSON.parse(dbRow.data) : dbRow.data,
            tags: typeof dbRow.tags === 'string' ? JSON.parse(dbRow.tags) : dbRow.tags,
        };
    }
}