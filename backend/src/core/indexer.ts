import Knex from 'knex';
import { LogEvent } from '../types/schema';

// This is the name of our main table
const EVENTS_TABLE = 'log_events';

/**
 * Manages the SQLite database for indexing all LogEvents.
 * This class is responsible for schema creation and all read/write operations
 * to the fast index. It is powered by knex.js.
 */
export class Indexer {
    private db: Knex;
    private dbPath: string;
    private isInitialized = false;

    constructor(dbPath: string) {
        this.dbPath = dbPath;
        console.log(`[Indexer] Initializing with DB at: ${dbPath}`);
        this.db = Knex({
            client: 'better-sqlite3',
            connection: {
                filename: dbPath,
            },
            useNullAsDefault: true,
            // Enable foreign keys for potential future use
            pool: {
                afterCreate: (conn: any, cb: Function) => {
                    conn.run('PRAGMA foreign_keys = ON', cb);
                },
            },
        });
    }

    /**
     * Initializes the database schema.
     * Creates the `log_events` table if it doesn't exist.
     */
    async init(): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        console.log('[Indexer] Initializing database schema...');
        try {
            const exists = await this.db.schema.hasTable(EVENTS_TABLE);

            if (!exists) {
                console.log(`[Indexer] Creating table: ${EVENTS_TABLE}`);
                await this.db.schema.createTable(EVENTS_TABLE, (table) => {
                    table.string('id').primary();
                    table.string('sourceDriverId').notNullable().index();
                    table.string('eventType').notNullable().index();
                    table.timestamp('timestamp').notNullable().index();

                    table.json('data').notNullable();
                    table.json('tags');

                    table.string('rawFileRef');
                });

                // Add a composite index for typical timeline queries
                await this.db.schema.alterTable(EVENTS_TABLE, (table) => {
                    table.index(['timestamp', 'eventType'], 'idx_timestamp_event');
                });

            } else {
                console.log(`[Indexer] Table ${EVENTS_TABLE} already exists.`);
            }
            this.isInitialized = true;
            console.log('[Indexer] Database schema initialized successfully.');
        } catch (err) {
            console.error('[Indexer] Failed to initialize database:', err);
            throw err;
        }
    }

    /**
     * Adds a batch of new LogEvents to the index.
     * This is wrapped in a transaction for performance and safety.
     * @param events - An array of LogEvent objects to add.
     */
    async addEvents(events: LogEvent[]): Promise<void> {
        if (!this.isInitialized) {
            throw new Error('Indexer is not initialized. Call init() first.');
        }
        if (events.length === 0) {
            return;
        }

        console.log(`[Indexer] Adding ${events.length} new events...`);

        try {
            // Stringify JSON data for better-sqlite3
            const eventsToInsert = events.map(event => ({
                ...event,
                data: JSON.stringify(event.data),
                tags: JSON.stringify(event.tags || []),
            }));

            // Batch insert, skipping duplicates
            await this.db.transaction(async (trx) => {
                await trx(EVENTS_TABLE).insert(eventsToInsert).onConflict('id').ignore();
            });

            console.log(`[Indexer] Successfully added/updated ${events.length} events.`);
        } catch (err) {
            console.error('[Indexer] Error batch-inserting events:', err);
            throw err;
        }
    }

    /**
     * Provides a raw Knex query builder instance for the QueryEngine.
     * This allows building complex, optimized queries from another class.
     * @returns The Knex query builder instance.
     */
    getQueryBuilder(): Knex.QueryBuilder {
        if (!this.isInitialized) {
            throw new Error('Indexer is not initialized. Call init() first.');
        }
        // We return a function that creates a query builder for the events table
        // This ensures each query is fresh.
        return this.db(EVENTS_TABLE);
    }
}