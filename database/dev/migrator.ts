#!/usr/bin/env tsx
import { promises as fs } from 'fs';
import { Migrator, FileMigrationProvider } from 'kysely';
import { createDatabase } from './connection';
import { spawn } from 'child_process';
import path from 'path';

/**
 * Database Migration Manager - Development Module
 * Clean, organized migration system for Faztore Admin
 * Uses process.env for development environment compatibility
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
function getNodeDatabaseConfig(): DatabaseConfig {
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

const MIGRATIONS_DIR = 'database/dev/migrations';

// Ensure migrations directory exists
await fs.mkdir(MIGRATIONS_DIR, { recursive: true });

const command = process.argv[2];
const name = process.argv[3];

const migrator = new Migrator({
	db: createDatabase(getNodeDatabaseConfig()),
	provider: new FileMigrationProvider({
		fs,
		path,
		migrationFolder: path.resolve(MIGRATIONS_DIR)
	})
});

switch (command) {
	case 'create':
		if (!name) {
			console.log('Usage: npm run db:migration <name>');
			process.exit(1);
		}
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
		const filename = `${timestamp}-${name.replace(/[^a-z0-9]/gi, '-')}.ts`;
		const template = `import { Kysely } from 'kysely';
		export async function up(db: Kysely<unknown>): Promise<void> {
			// Add your migration logic here
		}

		export async function down(db: Kysely<unknown>): Promise<void> {
			// Add your rollback logic here
		}`;
		await fs.writeFile(`${MIGRATIONS_DIR}/${filename}`, template);
		console.log(`✅ Created migration: ${filename}`);
		break;

	case 'up':
		console.log('🔄 Running migrations...');
		const { error, results } = await migrator.migrateToLatest();
		if (error) {
			console.error('❌ Migration failed:', error);
			process.exit(1);
		}
		if (results?.length === 0) {
			console.log('✅ No pending migrations');
		} else {
			console.log(`✅ Executed ${results?.length} migrations`);
			results?.forEach((result) => {
				console.log(`  - ${result.migrationName}: ${result.status}`);
			});
		}
		break;

	case 'down':
		console.log('🔄 Rolling back last migration...');
		const downResult = await migrator.migrateDown();
		if (downResult.error) {
			console.error('❌ Rollback failed:', downResult.error);
			process.exit(1);
		}
		console.log(`✅ Rolled back: ${downResult.results?.[0]?.migrationName}`);
		break;

	case 'reset':
		console.log('🔄 Resetting database...');
		// Drop all tables and re-run migrations
		const resetResult = await migrator.migrateDown();
		if (resetResult.error) {
			console.error('❌ Reset failed:', resetResult.error);
			process.exit(1);
		}
		const upResult = await migrator.migrateToLatest();
		if (upResult.error) {
			console.error('❌ Reset failed:', upResult.error);
			process.exit(1);
		}
		console.log('✅ Database reset completed');
		break;

	case 'shell':
		const config = getNodeDatabaseConfig();
		console.log('🔄 Opening database shell...');
		spawn(
			'psql',
			[
				'-h',
				config.host,
				'-U',
				config.username,
				'-d',
				config.database,
				'-p',
				config.port.toString()
			],
			{
				stdio: 'inherit',
				env: { ...process.env, PGPASSWORD: config.password }
			}
		);
		break;

	default:
		console.log('Usage: npm run db:migration <command>');
		console.log('Commands:');
		console.log('  create <name>  Create new migration');
		console.log('  up             Run pending migrations');
		console.log('  down           Rollback last migration');
		console.log('  reset          Reset database');
		console.log('  shell          Open database shell');
		process.exit(1);
}

process.exit(0);
