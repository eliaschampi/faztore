// routes/branches/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, depends }) => {
	depends('branches:load');

	if (!(await locals.can('branches:read'))) {
		return { branches: [], title: 'Sedes' };
	}
	try {
		const branches = await locals.db.selectFrom('branches').selectAll().execute();
		return { branches, title: 'Sedes' };
	} catch {
		return { branches: [], title: 'Sedes' };
	}
};

export const actions: Actions = {
	// create branch
	create: async ({ locals, request }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const state = formData.get('state') === 'on'; // Convert checkbox value to boolean

		// Get selected users from form data
		const selectedUsers = formData.getAll('selectedUsers') as string[];

		// Validate that users were selected
		if (selectedUsers.length === 0) {
			return fail(400, { error: 'Debe seleccionar al menos un usuario' });
		}

		try {
			await locals.db
				.insertInto('branches')
				.values({ name, state, users: selectedUsers })
				.execute();
			return { success: true };
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Error creando Sede';
			return fail(400, { error: message });
		}
	},

	// update branch
	update: async ({ locals, request }) => {
		const formData = await request.formData();
		const branchCode = formData.get('code') as string;
		const name = formData.get('name') as string;
		const state = formData.get('state') === 'on'; // Convert checkbox value to boolean

		// Get selected users from form data
		const selectedUsers = formData.getAll('selectedUsers') as string[];

		// Validate that users were selected
		if (selectedUsers.length === 0) {
			return fail(400, { error: 'Debe seleccionar al menos un usuario' });
		}

		try {
			await locals.db
				.updateTable('branches')
				.set({ name, state, users: selectedUsers })
				.where('code', '=', branchCode)
				.execute();

			return { success: true };
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Error actualizando Sede';
			return fail(400, { error: message });
		}
	},

	// delete branch
	delete: async ({ locals, request }) => {
		const formData = await request.formData();
		const branchCode = formData.get('code') as string;

		try {
			await locals.db.deleteFrom('branches').where('code', '=', branchCode).execute();

			return { success: true };
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Error eliminando Sede';
			return fail(400, { error: message });
		}
	}
};
