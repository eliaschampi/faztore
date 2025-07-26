/**
 * PERMISSION DEFINITIONS
 * Clean, organized permission definitions for the application
 * Used by PermissionsModal and other admin components
 */

export interface PermissionDefinition {
	key: string;
	label: string;
	category: string;
	description: string;
}

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
	// Usuarios
	{
		key: 'users:read',
		label: 'Ver usuarios',
		category: 'Usuarios',
		description: 'Ver lista de usuarios'
	},
	{
		key: 'users:create',
		label: 'Crear usuarios',
		category: 'Usuarios',
		description: 'Crear nuevos usuarios'
	},
	{
		key: 'users:update',
		label: 'Editar usuarios',
		category: 'Usuarios',
		description: 'Modificar usuarios existentes'
	},
	{
		key: 'users:delete',
		label: 'Eliminar usuarios',
		category: 'Usuarios',
		description: 'Eliminar usuarios'
	},
	{
		key: 'users:manage_permissions',
		label: 'Gestionar permisos',
		category: 'Usuarios',
		description: 'Asignar permisos a usuarios'
	},

	// Sedes
	{
		key: 'branches:read',
		label: 'Ver sedes',
		category: 'Administrativo',
		description: 'Ver sedes Administrativos'
	},
	{
		key: 'branches:create',
		label: 'Crear sedes',
		category: 'Administrativo',
		description: 'Crear nuevos sedes'
	},
	{
		key: 'branches:update',
		label: 'Editar sedes',
		category: 'Administrativo',
		description: 'Modificar sedes existentes'
	},
	{
		key: 'branches:delete',
		label: 'Eliminar sedes',
		category: 'Administrativo',
		description: 'Eliminar sedes'
	},

	// Sistema
	{
		key: 'system:config',
		label: 'Configuración',
		category: 'Sistema',
		description: 'Configurar el sistema'
	}
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get permissions grouped by category
 */
export function getPermissionsByCategory(): Record<string, PermissionDefinition[]> {
	return PERMISSION_DEFINITIONS.reduce(
		(acc, permission) => {
			if (!acc[permission.category]) {
				acc[permission.category] = [];
			}
			acc[permission.category].push(permission);
			return acc;
		},
		{} as Record<string, PermissionDefinition[]>
	);
}

/**
 * Get permission definition by key
 */
export function getPermissionByKey(key: string): PermissionDefinition | undefined {
	return PERMISSION_DEFINITIONS.find((p) => p.key === key);
}

/**
 * Parse permission key into entity and action
 */
export function parsePermissionKey(key: string): { entity: string; action: string } {
	const [entity, action] = key.split(':');
	return { entity, action };
}
