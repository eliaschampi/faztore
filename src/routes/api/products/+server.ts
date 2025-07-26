import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	// Validate permission using locals.can
	if (!(await locals.can('products:read'))) {
		return json([]);
	}

	// Get products from the optimized view using raw SQL
	const products = await locals.db
		.executeQuery(
			locals.db
				.selectFrom('products_overview')
				.selectAll()
				.orderBy('name', 'asc')
				.compile()
		);

	return json(products);
};
