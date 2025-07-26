#!/usr/bin/env tsx

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import { devDbConfig } from '../../src/lib/database/index.js';

interface MigrationFile {
	id: string;
	name: string;
	path: string;
	timestamp: number;
}

interface MigrationRecord {
	id: string;
	name: string;
	executed_at: Date;
	batch: number;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../..');
const INIT_DIR = join(PROJECT_ROOT, 'database/init');
const MIGRATIONS_DIR = join(PROJECT_ROOT, 'database/migrations');

class Database {
	private pool: Pool;

	constructor() {
		this.pool = new Pool(devDbConfig);
	}

	async query(text: string, params?: unknown[]): Promise<unknown> {
		const client = await this.pool.connect();
		try {
			return await client.query(text, params);
		} finally {
			client.release();
		}
	}

	async close(): Promise<void> {
		await this.pool.end();
	}

	async checkConnection(): Promise<boolean> {
		try {
			await this.query('SELECT 1');
			return true;
		} catch {
			return false;
		}
	}

	async checkTables(): Promise<boolean> {
		try {
			const result = await this.query(`
				SELECT COUNT(*) as count
				FROM information_schema.tables
				WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
			`);
			return parseInt(result.rows[0].count) > 0;
		} catch {
			return false;
		}
	}

	async resetDatabase(): Promise<void> {
		await this.query(`
			DROP SCHEMA public CASCADE;
			CREATE SCHEMA public;
			GRANT ALL ON SCHEMA public TO postgres;
			GRANT ALL ON SCHEMA public TO public;
		`);
	}
}

async function ensureMigrationsTable(db: Database): Promise<void> {
	await db.query(`
		CREATE TABLE IF NOT EXISTS migrations (
			id VARCHAR(255) PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			executed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
			batch INTEGER NOT NULL
		)
	`);
}

async function getExecutedMigrations(db: Database): Promise<MigrationRecord[]> {
	await ensureMigrationsTable(db);
	const result = await db.query(`
		SELECT id, name, executed_at, batch
		FROM migrations
		ORDER BY executed_at ASC
	`);
	return result.rows;
}

async function getNextBatch(db: Database): Promise<number> {
	const result = await db.query(`
		SELECT COALESCE(MAX(batch), 0) + 1 as next_batch
		FROM migrations
	`);
	return result.rows[0].next_batch;
}

async function recordMigration(
	db: Database,
	migration: MigrationFile,
	batch: number
): Promise<void> {
	await db.query(`INSERT INTO migrations (id, name, batch) VALUES ($1, $2, $3)`, [
		migration.id,
		migration.name,
		batch
	]);
}

async function removeMigration(db: Database, migrationId: string): Promise<void> {
	await db.query(`DELETE FROM migrations WHERE id = $1`, [migrationId]);
}

async function readSqlFiles(directory: string): Promise<string[]> {
	try {
		const files = await fs.readdir(directory);
		return files.filter((file: string) => file.endsWith('.sql')).sort();
	} catch {
		return [];
	}
}

async function directoryExists(path: string): Promise<boolean> {
	try {
		const stat = await fs.stat(path);
		return stat.isDirectory();
	} catch {
		return false;
	}
}

async function getMigrationFiles(directory: string): Promise<MigrationFile[]> {
	if (!(await directoryExists(directory))) return [];

	const files = await readSqlFiles(directory);
	return files
		.map((file) => {
			const match = file.match(/^(\d{14})_(.+)\.sql$/);
			if (!match) throw new Error(`Invalid migration file: ${file}`);

			const [, timestamp, name] = match;
			return {
				id: timestamp,
				name: name.replace(/_/g, ' '),
				path: join(directory, file),
				timestamp: parseInt(timestamp)
			};
		})
		.sort((a, b) => a.timestamp - b.timestamp);
}

async function createMigrationFile(name: string): Promise<string> {
	await fs.mkdir(MIGRATIONS_DIR, { recursive: true });

	const timestamp = new Date()
		.toISOString()
		.replace(/[-:T]/g, '')
		.replace(/\.\d{3}Z$/, '');

	const filename = `${timestamp}_${name.replace(/\s+/g, '_').toLowerCase()}.sql`;
	const filepath = join(MIGRATIONS_DIR, filename);

	const template = `-- Migration: ${name}
-- Created: ${new Date().toISOString()}

-- Add your SQL statements here
`;

	await fs.writeFile(filepath, template);
	return filepath;
}

async function initializeDatabase(db: Database): Promise<void> {
	if (!(await directoryExists(INIT_DIR))) {
		throw new Error(`Init directory not found: ${INIT_DIR}`);
	}

	const files = await readSqlFiles(INIT_DIR);
	if (files.length === 0) throw new Error('No initialization files found');

	for (const file of files) {
		const filePath = join(INIT_DIR, file);
		const sql = await fs.readFile(filePath, 'utf-8');
		await db.query(sql);
	}
}

async function runMigrations(db: Database): Promise<void> {
	const migrationFiles = await getMigrationFiles(MIGRATIONS_DIR);
	const executedMigrations = await getExecutedMigrations(db);
	const executedIds = new Set(executedMigrations.map((m) => m.id));
	const pendingMigrations = migrationFiles.filter((m) => !executedIds.has(m.id));

	if (pendingMigrations.length === 0) return;

	const batch = await getNextBatch(db);

	for (const migration of pendingMigrations) {
		const sql = await fs.readFile(migration.path, 'utf-8');
		await db.query(sql);
		await recordMigration(db, migration, batch);
	}
}

async function rollbackMigrations(db: Database): Promise<void> {
	const executedMigrations = await getExecutedMigrations(db);
	if (executedMigrations.length === 0) return;

	const lastBatch = Math.max(...executedMigrations.map((m) => m.batch));
	const migrationsToRollback = executedMigrations.filter((m) => m.batch === lastBatch).reverse();

	for (const migration of migrationsToRollback) {
		await removeMigration(db, migration.id);
	}
}

async function showStatus(db: Database): Promise<void> {
	const executedMigrations = await getExecutedMigrations(db);
	const migrationFiles = await getMigrationFiles(MIGRATIONS_DIR);
	const executedIds = new Set(executedMigrations.map((m) => m.id));

	if (executedMigrations.length === 0) {
		console.log('No migrations executed');
	} else {
		console.log('Executed:');
		executedMigrations.forEach((migration) => {
			console.log(`  ${migration.id} - ${migration.name} (batch ${migration.batch})`);
		});
	}

	const pendingMigrations = migrationFiles.filter((m) => !executedIds.has(m.id));
	if (pendingMigrations.length > 0) {
		console.log('Pending:');
		pendingMigrations.forEach((migration) => {
			console.log(`  ${migration.id} - ${migration.name}`);
		});
	}

	console.log(`Total: ${executedMigrations.length} executed, ${pendingMigrations.length} pending`);
}

async function run(args: string[]): Promise<void> {
	const command = args[2] || 'help';
	const db = new Database();

	try {
		switch (command) {
			case 'init': {
				if (!(await db.checkConnection())) throw new Error('Cannot connect to database');
				await initializeDatabase(db);
				break;
			}
			case 'migrate': {
				if (!(await db.checkConnection())) throw new Error('Cannot connect to database');
				await runMigrations(db);
				break;
			}
			case 'rollback': {
				if (!(await db.checkConnection())) throw new Error('Cannot connect to database');
				await rollbackMigrations(db);
				break;
			}
			case 'status': {
				if (!(await db.checkConnection())) throw new Error('Cannot connect to database');
				await showStatus(db);
				break;
			}
			case 'create': {
				if (args.length <= 3) throw new Error('Migration name required');
				const name = args.slice(3).join(' ');
				const filepath = await createMigrationFile(name);
				console.log(`Created: ${filepath}`);
				break;
			}
			case 'check': {
				const connected = await db.checkConnection();
				console.log(connected ? 'Connected' : 'Failed');
				if (!connected) process.exit(1);
				break;
			}
			case 'check:tables': {
				if (!(await db.checkConnection())) {
					console.log('false');
					return;
				}
				const hasTables = await db.checkTables();
				console.log(hasTables.toString());
				break;
			}
			case 'reset': {
				if (!(await db.checkConnection())) {
					console.log('Database connection failed');
					process.exit(1);
				}
				await db.resetDatabase();
				console.log('Database reset completed');
				break;
			}

			case 'help':
			default:
				console.log(`
Usage: npx tsx database/dev/migrate.ts <command>

Commands:
  init              Initialize database
  migrate           Run migrations
  rollback          Rollback last batch
  status            Show status
  create <name>     Create migration
  check             Check connection
  check:tables      Check tables exist
  reset             Reset database (destroys all data)
`);
				break;
		}
	} catch (error) {
		console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
		process.exit(1);
	} finally {
		await db.close();
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	run(process.argv);
}
