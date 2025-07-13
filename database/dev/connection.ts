import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

/**
 * Database Connection - Development Module
 * Uses process.env for development tools compatibility
 * Separate from core to avoid SvelteKit environment conflicts
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

// Parse DATABASE_URL into configuration object using process.env
export function getNodeDatabaseConfig(): DatabaseConfig {
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		throw new Error('DATABASE_URL environment variable is required');
	}

	const url = new URL(databaseUrl);
	return {
		host: url.hostname,
		user: url.username,
		username: url.username,
		password: url.password,
		database: url.pathname.slice(1),
		port: parseInt(url.port) || 5432
	};
}

// Database factory function for development tools
export function createDatabase(config: DatabaseConfig) {
	// Create connection pool
	const pool = new Pool({
		host: config.host,
		user: config.user,
		password: config.password,
		database: config.database,
		port: config.port,
		max: 10,
		idleTimeoutMillis: 30000,
		connectionTimeoutMillis: 10000
	});

	// Create database instance (using any for development tools)
	const database = new Kysely<unknown>({
		dialect: new PostgresDialect({ pool }),
		log: (event) => {
			if (event.level === 'query') {
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
