// routes/brands/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import {
	validateBrandCreation,
	validateBrandUpdate,
	validateBrandInsert
} from '$lib/schemas/brand';

export const load: PageServerLoad = async ({ locals, depends }) => {
	depends('brands:load');

	if (!(await locals.can('brands:read'))) {
		return { brands: [], title: 'Marcas' };
	}
	try {
		const brands = await locals.db
			.selectFrom('brands')
			.selectAll()
			.orderBy('name', 'asc')
			.execute();
		return { brands, title: 'Marcas' };
	} catch {
		return { brands: [], title: 'Marcas' };
	}
};

export const actions: Actions = {
	// create brand
	create: async ({ locals, request }) => {
		// Check permission
		if (!(await locals.can('brands:create'))) {
			return fail(403, { error: 'Sin permisos para crear marcas' });
		}

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const description = formData.get('description') as string;

		try {
			// Validate form data
			validateBrandCreation({ name, description });

			// Prepare data for insertion
			const brandData = {
				name: name.trim(),
				description: description?.trim() || null
			};

			// Validate database insertion
			validateBrandInsert(brandData);

			await locals.db.insertInto('brands').values(brandData).execute();

			return { success: true };
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Error creando marca';
			return fail(400, { error: message });
		}
	},

	// update brand
	update: async ({ locals, request }) => {
		// Check permission
		if (!(await locals.can('brands:update'))) {
			return fail(403, { error: 'Sin permisos para actualizar marcas' });
		}

		const formData = await request.formData();
		const brandCode = formData.get('code') as string;
		const name = formData.get('name') as string;
		const description = formData.get('description') as string;

		try {
			// Validate form data
			validateBrandUpdate({ name, description });

			await locals.db
				.updateTable('brands')
				.set({
					name: name.trim(),
					description: description?.trim() || null,
					updated_at: new Date()
				})
				.where('code', '=', brandCode)
				.execute();

			return { success: true };
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Error actualizando marca';
			return fail(400, { error: message });
		}
	},

	// delete brand
	delete: async ({ locals, request }) => {
		// Check permission
		if (!(await locals.can('brands:delete'))) {
			return fail(403, { error: 'Sin permisos para eliminar marcas' });
		}

		const formData = await request.formData();
		const brandCode = formData.get('code') as string;

		try {
			await locals.db.deleteFrom('brands').where('code', '=', brandCode).execute();

			return { success: true };
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Error eliminando marca';
			return fail(400, { error: message });
		}
	}
};
