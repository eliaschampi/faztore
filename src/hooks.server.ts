import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { getSession } from '$lib/auth/session';
import { dbInstance } from '$lib/config/server';
import { getUserPermissions, hasPermission } from '$lib/permissions/server';

// Database handle - attach database instance to locals
const databaseHandle: Handle = async ({ event, resolve }) => {
	event.locals.db = dbInstance;
	return resolve(event);
};

// Authentication handle - get session and user from cookies
const authHandle: Handle = async ({ event, resolve }) => {
	const session = await getSession(dbInstance, event.cookies);
	event.locals.session = session;
	event.locals.user = session?.user ?? null;

	// Get user permissions ONCE per session and store in locals
	// This avoids multiple database calls per request
	if (event.locals.user?.code) {
		event.locals.userPermissions = await getUserPermissions(
			event.locals.db,
			event.locals.user.code
		);
	} else {
		event.locals.userPermissions = [];
	}

	// Simple permission checker using cached permissions
	event.locals.can = async (permissionKey: string): Promise<boolean> => {
		return hasPermission(event.locals.userPermissions || [], permissionKey);
	};

	return resolve(event);
};

// Auth guard - redirect based on authentication state
const authGuard: Handle = async ({ event, resolve }) => {
	const isAuthPage = event.url.pathname.startsWith('/auth');
	const isApiRoute = event.url.pathname.startsWith('/api');

	// Skip auth guard for API routes (they handle auth internally)
	if (isApiRoute) {
		return resolve(event);
	}

	// Redirect to auth if not authenticated and not on auth page
	if (!event.locals.user && !isAuthPage) {
		throw redirect(303, '/auth');
	}

	// Redirect to dashboard if authenticated and on auth page
	if (event.locals.user && isAuthPage) {
		throw redirect(303, '/');
	}

	return resolve(event);
};

export const handle: Handle = sequence(databaseHandle, authHandle, authGuard);
