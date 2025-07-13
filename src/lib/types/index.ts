/**
 * Type Exports - Clean, organized type definitions
 * Auto-generated types from database schema + helper types
 */

// Re-export auto-generated database types
export type { DB as Database, Users } from './core/database';

// Import for helper type creation
import type { Insertable, Selectable, Updateable } from 'kysely';
import type { Users } from './core/database';

// User types - clean, consistent naming
export type User = Selectable<Users>;
export type NewUser = Insertable<Users>;
export type UserUpdate = Updateable<Users>;
