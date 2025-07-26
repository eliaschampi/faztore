import jwt from 'jsonwebtoken';
import { jwtConfig } from '$lib/config/server';

export interface JWTPayload {
	userCode: string;
	email: string;
	iat?: number;
	exp?: number;
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: { userCode: string; email: string }): string {
	return jwt.sign(payload, jwtConfig.secret, {
		expiresIn: jwtConfig.expiresIn as jwt.SignOptions['expiresIn']
	});
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
	try {
		return jwt.verify(token, jwtConfig.secret) as JWTPayload;
	} catch (error) {
		console.error('Fallo verificacion JWT:', error);
		return null;
	}
}

/**
 * Decode a JWT token without verification (for debugging)
 */
export function decodeToken(token: string): JWTPayload | null {
	try {
		return jwt.decode(token) as JWTPayload;
	} catch (error) {
		console.error('Fallo decodificacion JWT:', error);
		return null;
	}
}
