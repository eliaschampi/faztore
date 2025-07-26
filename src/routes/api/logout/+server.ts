import { json, redirect } from '@sveltejs/kit';
import { logout } from '$lib/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
	const result = await logout(cookies);

	if (result.success) {
		throw redirect(303, '/auth');
	}

	return json({ error: result.error }, { status: 500 });
};
