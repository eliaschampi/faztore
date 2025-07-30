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

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '../..');
const INIT_DIR = join(PROJECT_ROOT, 'database/init');
const MIGRATIONS_DIR = join(PROJECT_ROOT, 'database/migrations');

class Database {
	private pool = new Pool(devDbConfig);

	async query(text: string, params?: unknown[]): Promise<{ rows: unknown[] }> {
		const client = await this.pool.connect();
		try {
			const result = await client.query(text, params);
			return result;
		} finally {
			client.release();
		}
	}

	async close() {
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
			const result = await this.query(
				`SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`
			);
			return parseInt((result.rows[0] as { count: string }).count) > 0;
		} catch {
			return false;
		}
	}

	async resetDatabase() {
		await this.query(
			`DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO postgres; GRANT ALL ON SCHEMA public TO public;`
		);
	}
}

async function ensureMigrationsTable(db: Database) {
	await db.query(
		`CREATE TABLE IF NOT EXISTS migrations (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255) NOT NULL, executed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, batch INTEGER NOT NULL)`
	);
}

async function getExecutedMigrations(db: Database): Promise<MigrationRecord[]> {
	await ensureMigrationsTable(db);
	const result = await db.query(
		`SELECT id, name, executed_at, batch FROM migrations ORDER BY executed_at ASC`
	);
	return result.rows as MigrationRecord[];
}

async function getNextBatch(db: Database): Promise<number> {
	const result = await db.query(`SELECT COALESCE(MAX(batch), 0) + 1 as next_batch FROM migrations`);
	return (result.rows[0] as { next_batch: number }).next_batch;
}

async function recordMigration(db: Database, migration: MigrationFile, batch: number) {
	await db.query(`INSERT INTO migrations (id, name, batch) VALUES ($1, $2, $3)`, [
		migration.id,
		migration.name,
		batch
	]);
}

async function removeMigration(db: Database, migrationId: string) {
	await db.query(`DELETE FROM migrations WHERE id = $1`, [migrationId]);
}

async function readSqlFiles(directory: string): Promise<string[]> {
	try {
		const files = await fs.readdir(directory);
		return files.filter((file) => file.endsWith('.sql')).sort();
	} catch {
		return [];
	}
}

async function directoryExists(path: string): Promise<boolean> {
	try {
		return (await fs.stat(path)).isDirectory();
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

-- ==================== UP ====================
-- Add your forward migration SQL statements here

-- ==================== DOWN ====================
-- Add your rollback migration SQL statements here

`;
	await fs.writeFile(filepath, template);
	return filepath;
}

async function initializeDatabase(db: Database) {
	if (!(await directoryExists(INIT_DIR))) throw new Error(`Init directory not found: ${INIT_DIR}`);
	const files = await readSqlFiles(INIT_DIR);
	if (files.length === 0) throw new Error('No initialization files found');
	for (const file of files) {
		const sql = await fs.readFile(join(INIT_DIR, file), 'utf-8');
		await db.query(sql);
	}
}

function parseMigrationContent(content: string): { up: string; down: string } {
	const upMatch = content.match(
		/-- ==================== UP ====================([\s\S]*?)-- ==================== DOWN ====================/
	);
	const downMatch = content.match(/-- ==================== DOWN ====================([\s\S]*?)$/);
	return {
		up: upMatch ? upMatch[1].trim() : content.trim(),
		down: downMatch ? downMatch[1].trim() : ''
	};
}

async function runMigrations(db: Database) {
	const migrationFiles = await getMigrationFiles(MIGRATIONS_DIR);
	const executedMigrations = await getExecutedMigrations(db);
	const executedIds = new Set(executedMigrations.map((m) => m.id));
	const pendingMigrations = migrationFiles.filter((m) => !executedIds.has(m.id));

	if (pendingMigrations.length === 0) {
		console.log('No pending migrations');
		return;
	}

	const batch = await getNextBatch(db);
	console.log(`Running ${pendingMigrations.length} migration(s) in batch ${batch}:`);

	for (const migration of pendingMigrations) {
		console.log(`  • ${migration.id} - ${migration.name}`);
		const content = await fs.readFile(migration.path, 'utf-8');
		const { up } = parseMigrationContent(content);
		if (!up) throw new Error(`Migration ${migration.id} has no UP section`);
		await db.query(up);
		await recordMigration(db, migration, batch);
	}
	console.log(`Successfully executed ${pendingMigrations.length} migration(s)`);
}

async function rollbackMigrations(db: Database) {
	const executedMigrations = await getExecutedMigrations(db);
	if (executedMigrations.length === 0) {
		console.log('No migrations to rollback');
		return;
	}

	const lastBatch = Math.max(...executedMigrations.map((m) => m.batch));
	const migrationsToRollback = executedMigrations.filter((m) => m.batch === lastBatch).reverse();
	console.log(`Rolling back ${migrationsToRollback.length} migration(s) from batch ${lastBatch}:`);

	for (const migration of migrationsToRollback) {
		console.log(`  • ${migration.id} - ${migration.name}`);
		const migrationFiles = await getMigrationFiles(MIGRATIONS_DIR);
		const migrationFile = migrationFiles.find((f) => f.id === migration.id);

		if (!migrationFile) {
			console.warn(`  ⚠ Migration file not found for ${migration.id}, skipping SQL rollback`);
		} else {
			const content = await fs.readFile(migrationFile.path, 'utf-8');
			const { down } = parseMigrationContent(content);
			if (!down) {
				console.warn(`  ⚠ No DOWN section found in ${migration.id}, skipping SQL rollback`);
			} else {
				await db.query(down);
				console.log(`  ✓ Executed rollback SQL for ${migration.id}`);
			}
		}
		await removeMigration(db, migration.id);
	}
	console.log(`Successfully rolled back ${migrationsToRollback.length} migration(s)`);
}

async function showStatus(db: Database) {
	const executedMigrations = await getExecutedMigrations(db);
	const migrationFiles = await getMigrationFiles(MIGRATIONS_DIR);
	const executedIds = new Set(executedMigrations.map((m) => m.id));

	console.log('\n=== Migration Status ===\n');

	if (executedMigrations.length === 0) {
		console.log('✓ No migrations executed');
	} else {
		console.log('✓ Executed migrations:');
		executedMigrations.forEach((migration) =>
			console.log(`  ${migration.id} - ${migration.name} (batch ${migration.batch})`)
		);
	}

	const pendingMigrations = migrationFiles.filter((m) => !executedIds.has(m.id));
	if (pendingMigrations.length > 0) {
		console.log('\n⏳ Pending migrations:');
		pendingMigrations.forEach((migration) => console.log(`  ${migration.id} - ${migration.name}`));
	} else if (migrationFiles.length > 0) {
		console.log('\n✓ All migrations are up to date');
	}

	console.log(
		`\n📊 Summary: ${executedMigrations.length} executed, ${pendingMigrations.length} pending\n`
	);
}

async function run(args: string[]) {
	const command = args[2] || 'help';
	const db = new Database();

	try {
		switch (command) {
			case 'init':
				if (!(await db.checkConnection())) throw new Error('Cannot connect to database');
				await initializeDatabase(db);
				break;
			case 'migrate':
				if (!(await db.checkConnection())) throw new Error('Cannot connect to database');
				await runMigrations(db);
				break;
			case 'rollback':
				if (!(await db.checkConnection())) throw new Error('Cannot connect to database');
				await rollbackMigrations(db);
				break;
			case 'status':
				if (!(await db.checkConnection())) throw new Error('Cannot connect to database');
				await showStatus(db);
				break;
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
			case 'check:tables':
				if (!(await db.checkConnection())) {
					console.log('false');
					return;
				}
				console.log((await db.checkTables()).toString());
				break;
			case 'reset':
				if (!(await db.checkConnection())) {
					console.log('Database connection failed');
					process.exit(1);
				}
				console.log('🔄 Resetting database...');
				console.log('⚠️  This will destroy ALL data and schema!');
				await db.resetDatabase();
				console.log('✓ Database reset completed');
				console.log('💡 Run "./docker.sh setup" to reinitialize');
				break;

			case 'help':
			default:
				console.log(`🗄️  Faztore Migration System
Usage: npx tsx database/dev/migrate.ts <command>
Commands:
  init              Initialize database with init/ SQL files
  migrate           Run pending migrations (UP sections)
  rollback          Rollback last batch (DOWN sections)
  status            Show migration status
  create <name>     Create new migration file with UP/DOWN sections
  check             Check database connection
  check:tables      Check if tables exist
  reset             Reset database (destroys all data)`);
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
