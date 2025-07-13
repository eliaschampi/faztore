/**
 * Database Core Module - Clean, organized database access
 * Exports connection, configuration, and utilities for SvelteKit application
 */

// Core database connection and configuration
export { createDatabase, createDatabaseConnection, db, type Database } from './connection';

// Re-export types for convenience
export type { Database as DB, User, NewUser, UserUpdate } from '../../src/lib/types/index';
