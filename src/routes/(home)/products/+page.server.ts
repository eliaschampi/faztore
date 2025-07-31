// routes/products/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, depends }) => {
	depends('products:load');

	if (!(await locals.can('products:read'))) {
		return { products: [], brands: [], categories: [], title: 'Productos' };
	}

	try {
		// Get products from the optimized view
		const products = await locals.db
			.selectFrom('products_overview')
			.selectAll()
			.orderBy('name', 'asc')
			.execute();

		// Get brands for filter dropdown
		const brands = await locals.db
			.selectFrom('brands')
			.select(['code', 'name'])
			.orderBy('name', 'asc')
			.execute();

		// Get categories for filter dropdown
		const categories = await locals.db
			.selectFrom('categories')
			.select(['code', 'name'])
			.orderBy('name', 'asc')
			.execute();

		return { products, brands, categories, title: 'Productos' };
	} catch {
		return { products: [], brands: [], categories: [], title: 'Productos' };
	}
};

export const actions: Actions = {
	// delete product
	delete: async ({ locals, request }) => {
		// Check permission
		if (!(await locals.can('products:delete'))) {
			return fail(403, { error: 'Sin permisos para eliminar productos' });
		}

		const formData = await request.formData();
		const productCode = formData.get('code') as string;

		try {
			await locals.db.deleteFrom('products').where('code', '=', productCode).execute();

			return { success: true };
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Error eliminando producto';
			return fail(400, { error: message });
		}
	}
};
