import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { validateProductCreation, validateProductInsert } from '$lib/schemas/product';

export const load: PageServerLoad = async ({ locals }) => {
	// Check permission
	if (!(await locals.can('products:create'))) {
		redirect(302, '/products');
	}

	try {
		// Get brands and categories for dropdowns
		const [brands, categories] = await Promise.all([
			locals.db.selectFrom('brands').select(['code', 'name']).orderBy('name', 'asc').execute(),
			locals.db.selectFrom('categories').select(['code', 'name']).orderBy('name', 'asc').execute()
		]);

		return { brands, categories, title: 'Crear Producto' };
	} catch {
		return { brands: [], categories: [], title: 'Crear Producto' };
	}
};

export const actions: Actions = {
	default: async ({ locals, request }) => {
		// Check permission
		if (!(await locals.can('products:create'))) {
			return fail(403, { error: 'Sin permisos para crear productos' });
		}

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const description = formData.get('description') as string;
		const brand_code = formData.get('brand_code') as string;
		const category_code = formData.get('category_code') as string;
		const price = parseFloat(formData.get('price') as string);
		const sku = formData.get('sku') as string;

		try {
			// Validate form data (omitting images for now)
			validateProductCreation({
				name,
				description,
				brand_code,
				category_code,
				price,
				sku,
				images: []
			});

			// Prepare data for insertion
			const productData = {
				name: name.trim(),
				description: description?.trim() || null,
				brand_code,
				category_code,
				user_code: locals.user!.code,
				price,
				sku: sku?.trim() || null,
				images: JSON.stringify([])
			};

			// Validate database insertion
			validateProductInsert(productData);

			await locals.db.insertInto('products').values(productData).execute();

			// Redirect to products list on success
			redirect(302, '/products');
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Error creando producto';
			return fail(400, { error: message });
		}
	}
};
