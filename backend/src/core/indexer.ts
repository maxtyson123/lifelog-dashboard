import knex, { Knex } from 'knex';
import { LogEvent } from '../types/schema';
import {systemLogger} from "./logger";

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
        systemLogger.info('Indexer', `Using database at: ${dbPath}`);

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

        systemLogger.info('Indexer', 'Initializing database schema...');
        try {
            const exists = await this.db.schema.hasTable(EVENTS_TABLE);

            if (!exists) {
                systemLogger.info('Indexer', `Creating table: ${EVENTS_TABLE}`);
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
                systemLogger.warn('Indexer', `Table already exists: ${EVENTS_TABLE}`);
            }
            this.isInitialized = true;
            systemLogger.success('Indexer', 'Database schema initialized successfully.');
        } catch (err) {
            systemLogger.error('Indexer', 'Failed to initialize database schema.');
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

        systemLogger.info('Indexer', `Adding ${events.length} new events to the index.`);

        try {
            const eventsToInsert = events.map(event => ({
                ...event,
                data: JSON.stringify(event.data),
                tags: JSON.stringify(event.tags || []),
            }));

            await this.db.transaction(async (trx) => {
                await trx(EVENTS_TABLE).insert(eventsToInsert).onConflict('id').ignore();
            });

            systemLogger.success('Indexer', `Successfully added/updated ${events.length} events.`);
        } catch (err) {
            systemLogger.error('Indexer', 'Error batch-inserting events.');
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

    /**
     * Returns stats for the system dashboard.
     */
    async getStats(): Promise<{ totalEvents: number }> {
        if (!this.isInitialized) return { totalEvents: 0 };

        const result = await this.db(EVENTS_TABLE).count('id as total').first();
        return {
            totalEvents: result ? Number(result.total) : 0
        };
    }

    async close(): Promise<void> {
        await this.db.destroy();
        this.isInitialized = false;
        systemLogger.info('Indexer', 'Database connection closed.');
    }
}