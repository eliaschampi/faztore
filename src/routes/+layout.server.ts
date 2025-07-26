import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		user: locals.user,
		session: locals.session,
		userPermissions: locals.userPermissions || [] // Already loaded in hooks
	};
};
