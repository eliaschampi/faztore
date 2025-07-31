/**
 * Core domain types for my application
 * Clean, modern architecture using Kysely types directly
 *
 * ARCHITECTURE PRINCIPLE: Use Kysely-generated types as single source of truth
 * This eliminates redundancy and ensures type consistency
 */

import type { Selectable, Insertable, Updateable } from 'kysely';
import type { DB } from '$lib/database/types';

// ============================================================================
// PRIMARY TYPES - Direct from Kysely (Single Source of Truth)
// ============================================================================

// Clean frontend types using Kysely's Selectable utility
// This automatically handles ColumnType unwrapping and provides clean types
export type Users = Selectable<DB['users']>;
export type Branches = Selectable<DB['branches']>;
export type Brands = Selectable<DB['brands']>;
export type Categories = Selectable<DB['categories']>;
export type Products = Selectable<DB['products']>;
export type ProductsOverview = Selectable<DB['products_overview']>;
export type Permissions = Selectable<DB['permissions']>;

// Insertable types for creating new records
export type NewUsers = Insertable<DB['users']>;
export type NewBranches = Insertable<DB['branches']>;
export type NewBrands = Insertable<DB['brands']>;
export type NewCategories = Insertable<DB['categories']>;
export type NewProducts = Insertable<DB['products']>;
export type NewPermissions = Insertable<DB['permissions']>;

// Updateable types for updating existing records
export type UpdateUsers = Updateable<DB['users']>;
export type UpdateBranches = Updateable<DB['branches']>;
export type UpdateBrands = Updateable<DB['brands']>;
export type UpdateCategories = Updateable<DB['categories']>;
export type UpdateProducts = Updateable<DB['products']>;
export type UpdatePermissions = Updateable<DB['permissions']>;

// Re-export database types for internal use
export type { DB } from '$lib/database/types';

// ============================================================================
// BUSINESS DOMAIN TYPES - Application-specific extensions
// ============================================================================

// Product image interface for multiple images support
export interface ProductImage {
	url: string;
	alt?: string;
	isPrimary?: boolean;
}

// ============================================================================
// VALUE OBJECTS & ENUMS - Domain-specific types
// ============================================================================

export type EntityType = 'users' | 'branches' | 'brands' | 'categories' | 'permissions';

export type ToastType = 'success' | 'danger' | 'warning' | 'info';

// ============================================================================
// COMPOSITE TYPES - Business operations with joins
// ============================================================================

export interface SimpleUser {
	code: string;
	name: string;
	last_name: string;
}

export interface ToastState {
	id: number;
	title: string;
	type: ToastType;
}
