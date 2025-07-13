/**
 * Database Module - Clean, organized database access
 * Re-exports from database/core for SvelteKit compatibility
 */

// Core database connection and configuration
export {
	createDatabase,
	createDatabaseConnection,
	db,
	type Database
} from '../../../database/core';

// Re-export types for convenience
export type { Database as DB, User, NewUser, UserUpdate } from '../types/index';
