import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	// Validate permission using locals.can
	if (!(await locals.can('categories:read'))) {
		return json([]);
	}

	// Get categories from database
	const categories = await locals.db
		.selectFrom('categories')
		.select(['code', 'name', 'description', 'created_at', 'updated_at'])
		.orderBy('name', 'asc')
		.execute();

	return json(categories);
};
