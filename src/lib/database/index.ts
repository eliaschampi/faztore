import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import type { DB } from './types';

// Simple shared config for development tools (no SvelteKit dependencies)
export const devDbConfig = {
	host: process.env.DB_HOST || 'localhost',
	user: process.env.DB_USER || 'postgres',
	password: process.env.DB_PASSWORD || 'postgres',
	database: process.env.DB_NAME || 'faztore',
	port: parseInt(process.env.DB_PORT || '5432')
};

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
		max: process.env.NODE_ENV === 'development' ? 10 : 20,
		idleTimeoutMillis: 30000,
		connectionTimeoutMillis: 10000
	});

	// Create database instance
	const database = new Kysely<DB>({
		dialect: new PostgresDialect({ pool }),
		log: (event) => {
			if (process.env.NODE_ENV === 'development' && event.level === 'query') {
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
