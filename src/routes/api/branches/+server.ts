import { getBranches } from '$lib/data/branches';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return json({ error: 'No Autorizado' }, { status: 401 });
	}

	const levels = await getBranches(locals.db, locals.user.code);
	return json({ levels });
};
