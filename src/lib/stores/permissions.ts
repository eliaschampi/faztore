/**
 * UNIFIED PERMISSION SYSTEM - SVELTE 5 EDITION
 * Modern, efficient, SSR-safe approach - fetch ONCE, store in reactive state
 *
 * ARCHITECTURE:
 * - Permissions loaded ONCE per session from +layout.server.ts
 * - Stored in context-based approach compatible with SSR
 * - No SSR issues, no module-level subscriptions
 * - Clean, minimalist, solid approach with modern patterns
 */

import { getContext, setContext } from 'svelte';

// ============================================================================
// TYPES - Clean and minimal
// ============================================================================

export type PermissionKey = string; // Format: 'entity:action' (e.g., 'users:read')

// ============================================================================
// CONTEXT KEY - Context-based approach
// ============================================================================

const PERMISSIONS_CONTEXT_KEY = Symbol('permissions');

// ============================================================================
// PERMISSION STORE CLASS - Simple and efficient
// ============================================================================

class PermissionStore {
	private permissions: PermissionKey[] = [];

	constructor(initialPermissions: PermissionKey[] = []) {
		this.permissions = initialPermissions;
	}

	// Core permission checking methods
	can(permissionKey: PermissionKey): boolean {
		return this.permissions.includes(permissionKey);
	}

	canAny(...permissionKeys: PermissionKey[]): boolean {
		return permissionKeys.some((key) => this.permissions.includes(key));
	}

	canAll(...permissionKeys: PermissionKey[]): boolean {
		return permissionKeys.every((key) => this.permissions.includes(key));
	}

	// State management methods
	updatePermissions(permissions: PermissionKey[]): void {
		this.permissions = permissions;
	}

	clearPermissions(): void {
		this.permissions = [];
	}

	// Getter for all permissions
	getPermissions(): PermissionKey[] {
		return [...this.permissions];
	}
}

// ============================================================================
// CONTEXT FUNCTIONS - Initialize and access permissions
// ============================================================================

/**
 * Initialize permissions context (call this in your root layout)
 * @param initialPermissions - Permissions from page data
 */
export function initializePermissions(initialPermissions: PermissionKey[] = []): PermissionStore {
	const store = new PermissionStore(initialPermissions);
	setContext(PERMISSIONS_CONTEXT_KEY, store);
	return store;
}

/**
 * Get permissions store from context
 * @returns PermissionStore instance
 */
export function getPermissionStore(): PermissionStore {
	const store = getContext<PermissionStore>(PERMISSIONS_CONTEXT_KEY);
	if (!store) {
		throw new Error(
			'Permission store not found. Make sure to call initializePermissions() in your root layout.'
		);
	}
	return store;
}

// ============================================================================
// CONVENIENCE FUNCTIONS - Direct access to permission checks
// ============================================================================

/**
 * Check if user has a specific permission
 * @param permissionKey - Permission in format 'entity:action'
 * @returns boolean - Permission state
 */
export function can(permissionKey: PermissionKey): boolean {
	return getPermissionStore().can(permissionKey);
}

/**
 * Check if user has ANY of the specified permissions
 * @param permissionKeys - Array of permission keys
 * @returns boolean - True if user has at least one permission
 */
export function canAny(...permissionKeys: PermissionKey[]): boolean {
	return getPermissionStore().canAny(...permissionKeys);
}

/**
 * Check if user has ALL of the specified permissions
 * @param permissionKeys - Array of permission keys
 * @returns boolean - True if user has all permissions
 */
export function canAll(...permissionKeys: PermissionKey[]): boolean {
	return getPermissionStore().canAll(...permissionKeys);
}

/**
 * Get all user permissions
 * @returns PermissionKey[] - Array of permission keys
 */
export function getPermissions(): PermissionKey[] {
	return getPermissionStore().getPermissions();
}

/**
 * Update permissions (for admin operations like PermissionsModal)
 * @param permissions - New permission keys array
 */
export function updatePermissions(permissions: PermissionKey[]): void {
	getPermissionStore().updatePermissions(permissions);
}

/**
 * Clear all permissions (for logout)
 */
export function clearPermissions(): void {
	getPermissionStore().clearPermissions();
}
