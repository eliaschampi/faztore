import type { Database } from '$lib/database';
import { compare } from 'bcryptjs';
import { createSession, destroySession } from './session';
import type { Cookies } from '@sveltejs/kit';

export interface LoginCredentials {
	email: string;
	password: string;
}

/**
 * Authenticate user with email and password
 */
export async function login(db: Database, credentials: LoginCredentials, cookies: Cookies) {
	try {
		const { email, password } = credentials;

		// Find user by email
		const user = await db
			.selectFrom('users')
			.select(['code', 'email', 'password_hash', 'name'])
			.where('email', '=', email.toLowerCase())
			.executeTakeFirst();

		if (!user) {
			throw new Error('Usuario no encontrado');
		}

		// Verify password
		const isValidPassword = await compare(password, user.password_hash);
		if (!isValidPassword) {
			throw new Error('Contraseña incorrecta');
		}

		// Create session
		const session = await createSession(db, user.code, cookies);
		if (!session) {
			throw new Error('Falló al crear sesión');
		}

		return {
			success: true,
			user: session.user
		};
	} catch (error) {
		console.error('Login error:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Login failed'
		};
	}
}

/**
 * Logout user
 */
export async function logout(cookies: Cookies) {
	try {
		destroySession(cookies);
		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Ocurrió un error'
		};
	}
}
