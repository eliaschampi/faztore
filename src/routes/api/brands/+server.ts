import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	// Validate permission using locals.can
	if (!(await locals.can('brands:read'))) {
		return json([]);
	}

	// Get brands from database
	const brands = await locals.db
		.selectFrom('brands')
		.select(['code', 'name', 'description', 'created_at', 'updated_at'])
		.orderBy('name', 'asc')
		.execute();

	return json(brands);
};
