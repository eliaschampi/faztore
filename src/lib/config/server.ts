// Server-side environment configuration for SvelteKit
// This file contains sensitive configuration that should ONLY be used on the server

import {
	DB_HOST,
	DB_USER,
	DB_PASSWORD,
	DB_NAME,
	DB_PORT,
	JWT_SECRET,
	JWT_EXPIRES_IN
} from '$env/static/private';

import { createDatabase } from '$lib/database';

export const dbInstance = createDatabase({
	host: DB_HOST || 'localhost',
	user: DB_USER || 'postgres',
	password: DB_PASSWORD || 'postgres',
	database: DB_NAME || 'faztore',
	port: parseInt(DB_PORT || '5432')
});
// JWT configuration - only available on server
export const jwtConfig = {
	secret: JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
	expiresIn: JWT_EXPIRES_IN || '8h'
};
