import { Kysely, sql } from 'kysely';

/**
 * Migration: create-users-table
 * Created: 2024-07-13T00:00:00.000Z
 */

export async function up(db: Kysely<unknown>): Promise<void> {
	// Enable UUID extension
	await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(db);

	// Create users table
	await db.schema
		.createTable('users')
		.addColumn('code', 'uuid', (col) => col.defaultTo(sql`uuid_generate_v4()`))
		.addColumn('email', 'varchar(255)', (col) => col.notNull())
		.addColumn('username', 'varchar(255)', (col) => col.notNull())
		.addColumn('password_hash', 'varchar(255)', (col) => col.notNull())
		.addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
		.addColumn('updated_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
		.execute();

	// Add constraints
	await db.schema.alterTable('users').addPrimaryKeyConstraint('users_pkey', ['code']).execute();
	await db.schema.alterTable('users').addUniqueConstraint('users_email_key', ['email']).execute();

	await db.schema
		.alterTable('users')
		.addUniqueConstraint('users_username_key', ['username'])
		.execute();

	// Create indexes
	await db.schema.createIndex('idx_users_email').on('users').column('email').execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	// Drop indexes
	await db.schema.dropIndex('idx_users_created_at').execute();
	await db.schema.dropIndex('idx_users_email').execute();

	// Drop table (constraints are dropped automatically)
	await db.schema.dropTable('users').execute();
}
