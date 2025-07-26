import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import type { DB } from './types';
import { dev } from '$app/environment';

// Database factory function that accepts configuration
export function createDatabase(config: {
	host: string;
	user: string;
	password: string;
	database: string;
	port: number;
}) {
	// Create connection pool
	const pool = new Pool({
		...config,
		max: dev ? 10 : 20,
		idleTimeoutMillis: 30000,
		connectionTimeoutMillis: 10000
	});

	// Create database instance
	const database = new Kysely<DB>({
		dialect: new PostgresDialect({ pool }),
		log: (event) => {
			if (dev && event.level === 'query') {
				// console.log('SQL:', event.query.sql);
				console.log('Parameters:', event.query.parameters);
			}
		}
	});

	// Graceful shutdown
	process.on('SIGTERM', async () => {
		console.log('Closing database pool...');
		await pool.end();
	});

	return database;
}

// Export the database type consistently
export type Database = Kysely<DB>;

// Re-export types for convenience
export type { DB } from './types';
