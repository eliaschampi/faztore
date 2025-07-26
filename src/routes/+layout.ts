import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data }) => {
	return {
		user: data.user,
		session: data.session,
		userPermissions: data.userPermissions
	};
};
