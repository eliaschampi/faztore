import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import type { DB } from '../../src/lib/types/core/database';
import { dev } from '$app/environment';
import { DATABASE_URL } from '$env/static/private';

/**
 * Database Connection - Core Module
 * Clean, minimalist database connection using SvelteKit environment pattern
 */

// Database configuration interface
interface DatabaseConfig {
	host: string;
	user: string;
	username: string;
	password: string;
	database: string;
	port: number;
}

// Parse DATABASE_URL into configuration object
function getDatabaseConfig(): DatabaseConfig {
	if (!DATABASE_URL) {
		throw new Error('DATABASE_URL environment variable is required');
	}

	const url = new URL(DATABASE_URL);
	return {
		host: url.hostname,
		user: url.username,
		username: url.username,
		password: url.password,
		database: url.pathname.slice(1),
		port: parseInt(url.port) || 5432
	};
}

// Database factory function that accepts configuration
export function createDatabase(config: DatabaseConfig) {
	// Create connection pool
	const pool = new Pool({
		host: config.host,
		user: config.user,
		password: config.password,
		database: config.database,
		port: config.port,
		max: dev ? 10 : 20,
		idleTimeoutMillis: 30000,
		connectionTimeoutMillis: 10000
	});

	// Create database instance
	const database = new Kysely<DB>({
		dialect: new PostgresDialect({ pool }),
		log: (event) => {
			if (dev && event.level === 'query') {
				console.log('SQL:', event.query.sql);
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

// Create database connection using environment configuration
export function createDatabaseConnection() {
	const config = getDatabaseConfig();
	return createDatabase(config);
}

// Create and export the main database instance
export const db = createDatabaseConnection();

// Export the database type consistently
export type Database = Kysely<DB>;

// Re-export types for convenience
export type { DB } from '../../src/lib/types/core/database';
