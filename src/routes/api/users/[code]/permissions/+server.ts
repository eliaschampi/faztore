import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * USER PERMISSIONS API - Modern Clean Architecture
 *
 * ARCHITECTURE PRINCIPLE: Direct Kysely database access for simplicity and consistency
 */

// GET /api/users/[code]/permissions
export const GET: RequestHandler = async ({ params, locals }) => {
	const userCode = params.code;

	if (!userCode) {
		return json({ error: 'Codigo de usuario requerido' }, { status: 400 });
	}

	// Validar permiso para ver permisos de usuarios
	if (!(await locals.can('users:manage_permissions'))) {
		return json({ error: 'Permiso requerido: users:manage_permissions' }, { status: 403 });
	}

	try {
		const permissions = await locals.db
			.selectFrom('permissions')
			.selectAll()
			.where('user_code', '=', userCode)
			.execute();

		return json({ permissions: permissions || [] });
	} catch (error) {
		console.error('Error fetching permissions:', error);
		return json({ error: 'Error al obtener permisos de usuario' }, { status: 500 });
	}
};

// POST /api/users/[code]/permissions
export const POST: RequestHandler = async ({ params, request, locals }) => {
	const userCode = params.code;

	if (!userCode) {
		return json({ error: 'Codigo de usuario requerido' }, { status: 400 });
	}

	// Validar permiso para gestionar permisos de usuarios
	if (!(await locals.can('users:manage_permissions'))) {
		return json({ error: 'Permiso requerido: users:manage_permissions' }, { status: 403 });
	}

	try {
		const body = await request.json();
		const { permissions } = body as { permissions: { entity: string; user_action: string }[] };

		if (!permissions || !Array.isArray(permissions)) {
			return json({ error: 'Formato de permisos inválido' }, { status: 400 });
		}

		// Eliminar permisos existentes
		await locals.db.deleteFrom('permissions').where('user_code', '=', userCode).execute();

		// Insertar nuevos permisos
		const permissionsToInsert = permissions.map((p) => ({
			user_code: userCode as string,
			entity: p.entity,
			action: p.user_action
		}));

		if (permissionsToInsert.length > 0) {
			await locals.db.insertInto('permissions').values(permissionsToInsert).execute();
		}

		return json({
			success: true,
			count: permissionsToInsert.length
		});
	} catch (error) {
		console.error('Error saving permissions:', error);
		return json({ error: 'Error al guardar permisos' }, { status: 500 });
	}
};
