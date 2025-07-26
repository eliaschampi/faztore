import { getBranches } from '$lib/data/branches';
import type { Branches } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.code;
	let branches: Branches[] = [];

	if (userId) {
		branches = await getBranches(locals.db, userId);
	}

	return {
		branches,
		user: locals.session?.user || null,
		title: 'Mi perfil'
	};
};
