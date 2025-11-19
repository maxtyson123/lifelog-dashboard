import knex, { Knex } from 'knex';
import { LogEvent } from '../types/schema';

const EVENTS_TABLE = 'log_events';

/**
 * Manages the SQLite database for indexing all LogEvents.
 * This class is responsible for schema creation and all read/write operations
 * to the fast index.
 */
export class Indexer {
    private db: Knex;
    private dbPath: string;
    private isInitialized = false;

    constructor(dbPath: string) {
        this.dbPath = dbPath;
        console.log(`[Indexer] Initializing with DB at: ${dbPath}`);

        this.db = knex({
            client: 'better-sqlite3',
            connection: {
                filename: dbPath,
            },
            useNullAsDefault: true,
            pool: {
                min: 1,
                max: 1,
                afterCreate: (conn: any, done: Function) => {
                    try {
                        conn.pragma('foreign_keys = ON');
                        done(null, conn);
                    } catch (err) {
                        done(err, conn);
                    }
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

                    // Store the specific data payload (LocationData, MusicData, etc.) as a JSON string
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
            const eventsToInsert = events.map(event => ({
                ...event,
                data: JSON.stringify(event.data),
                tags: JSON.stringify(event.tags || []),
            }));

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
     */
    getQueryBuilder(): Knex.QueryBuilder {
        if (!this.isInitialized) {
            throw new Error('Indexer is not initialized. Call init() first.');
        }
        return this.db(EVENTS_TABLE);
    }

    async close(): Promise<void> {
        await this.db.destroy();
        this.isInitialized = false;
        console.log('[Indexer] Database connection closed.');
    }
}