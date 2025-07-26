import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	// Validar permiso específico usando locals.can
	if (!(await locals.can('users:read'))) {
		return json([]);
	}

	// Obtener usuarios de la base de datos
	const users = await locals.db
		.selectFrom('users')
		.select(['code', 'name', 'last_name', 'email', 'is_super_admin'])
		.execute();

	return json(users);
};
