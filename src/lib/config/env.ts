// Client-side environment configuration for SvelteKit
// This file only contains configuration that can be safely used on the client

// Cookie configuration - safe for client
export const cookieConfig = {
	httpOnly: true,
	secure: true, // Will be overridden on server based on NODE_ENV
	sameSite: 'strict' as const,
	maxAge: 60 * 60 * 8, // 8 hours
	path: '/'
};
