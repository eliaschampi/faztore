/**
 * SERVER-SIDE PERMISSION UTILITIES
 * Simple, efficient permission checking for server-side operations
 * Clean architecture - no complex database queries per request
 */

import type { Database } from '$lib/database';

/**
 * Get all permissions for a user (called ONCE per session)
 * @param db - Database instance
 * @param userCode - User code
 * @returns Promise<string[]> - Array of permission keys ('entity:action')
 */
export async function getUserPermissions(db: Database, userCode: string): Promise<string[]> {
	try {
		// Check if user is super admin first
		const user = await db
			.selectFrom('users')
			.select(['is_super_admin'])
			.where('code', '=', userCode)
			.executeTakeFirst();

		// Super admin has all permissions - return a comprehensive list
		if (user?.is_super_admin) {
			return [
				// Users
				'users:read',
				'users:create',
				'users:update',
				'users:delete',
				'users:manage_permissions',
				// branches
				'branches:read',
				'branches:create',
				'branches:update',
				'branches:delete',
				// System
				'system:config'
			];
		}

		// Get specific permissions for regular users
		const permissions = await db
			.selectFrom('permissions')
			.select(['entity', 'action'])
			.where('user_code', '=', userCode)
			.execute();

		return permissions.map((p) => `${p.entity}:${p.action}`);
	} catch (error) {
		console.error('Error getting user permissions:', error);
		return [];
	}
}

/**
 * Check if user has a specific permission (for server-side validation)
 * @param userPermissions - User's permission array (from getUserPermissions)
 * @param permissionKey - Permission key to check
 * @returns boolean
 */
export function hasPermission(userPermissions: string[], permissionKey: string): boolean {
	return userPermissions.includes(permissionKey);
}

/**
 * Require permission middleware for API routes
 * @param userPermissions - User's permission array
 * @param permissionKey - Required permission
 * @returns { success: boolean; error?: string }
 */
export function requirePermission(
	userPermissions: string[] | undefined,
	permissionKey: string
): { success: boolean; error?: string } {
	if (!userPermissions) {
		return { success: false, error: 'Usuario no autenticado' };
	}

	if (!hasPermission(userPermissions, permissionKey)) {
		return {
			success: false,
			error: `Permiso requerido: ${permissionKey}`
		};
	}

	return { success: true };
}
