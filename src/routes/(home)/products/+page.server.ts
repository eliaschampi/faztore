// routes/products/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import {
	validateProductCreation,
	validateProductUpdate,
	validateProductInsert
} from '$lib/schemas/product';

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

		// Get brands and categories for dropdowns
		const [brands, categories] = await Promise.all([
			locals.db.selectFrom('brands').select(['code', 'name']).orderBy('name', 'asc').execute(),
			locals.db.selectFrom('categories').select(['code', 'name']).orderBy('name', 'asc').execute()
		]);

		return { products, brands, categories, title: 'Productos' };
	} catch {
		return { products: [], brands: [], categories: [], title: 'Productos' };
	}
};

export const actions: Actions = {
	// create product
	create: async ({ locals, request }) => {
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
		const image_url = formData.get('image_url') as string;

		try {
			// Convert single image URL to images array for validation
			const images = image_url?.trim() ? [{ url: image_url.trim(), isPrimary: true }] : [];

			// Validate form data
			validateProductCreation({
				name,
				description,
				brand_code,
				category_code,
				price,
				sku,
				images
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
				images: JSON.stringify(images)
			};

			// Validate database insertion
			validateProductInsert(productData);

			await locals.db.insertInto('products').values(productData).execute();

			return { success: true };
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Error creando producto';
			return fail(400, { error: message });
		}
	},

	// update product
	update: async ({ locals, request }) => {
		// Check permission
		if (!(await locals.can('products:update'))) {
			return fail(403, { error: 'Sin permisos para actualizar productos' });
		}

		const formData = await request.formData();
		const productCode = formData.get('code') as string;
		const name = formData.get('name') as string;
		const description = formData.get('description') as string;
		const brand_code = formData.get('brand_code') as string;
		const category_code = formData.get('category_code') as string;
		const price = parseFloat(formData.get('price') as string);
		const sku = formData.get('sku') as string;
		const image_url = formData.get('image_url') as string;
		const is_active = formData.get('is_active') === 'true';

		try {
			// Convert single image URL to images array for validation
			const images = image_url?.trim() ? [{ url: image_url.trim(), isPrimary: true }] : [];

			// Validate form data
			validateProductUpdate({
				name,
				description,
				brand_code,
				category_code,
				price,
				sku,
				images
			});

			await locals.db
				.updateTable('products')
				.set({
					name: name.trim(),
					description: description?.trim() || null,
					brand_code,
					category_code,
					price,
					sku: sku?.trim() || null,
					images: JSON.stringify(images),
					is_active,
					updated_at: new Date()
				})
				.where('code', '=', productCode)
				.execute();

			return { success: true };
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Error actualizando producto';
			return fail(400, { error: message });
		}
	},

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
