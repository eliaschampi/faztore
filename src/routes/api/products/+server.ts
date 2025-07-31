import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	// Validate permission using locals.can
	if (!(await locals.can('products:read'))) {
		return json([]);
	}

	// Get products from the optimized view
	const products = await locals.db
		.selectFrom('products_overview')
		.selectAll()
		.orderBy('name', 'asc')
		.execute();

	return json(products);
};
