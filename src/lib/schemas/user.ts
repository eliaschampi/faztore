import type { NewUsers } from '../types';

// Validation helpers
const required = (value: unknown, field: string): void => {
	if (!value || (typeof value === 'string' && !value.trim())) {
		throw new Error(`${field} es requerido`);
	}
};

const validEmail = (email: string): void => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		throw new Error('Email inválido');
	}
};

const minLength = (value: string, min: number, field: string): void => {
	if (value.length < min) {
		throw new Error(`${field} debe tener al menos ${min} caracteres`);
	}
};

const maxLength = (value: string, max: number, field: string): void => {
	if (value.length > max) {
		throw new Error(`${field} no puede exceder ${max} caracteres`);
	}
};

// User creation validation (form data)
export const validateUserCreation = (data: {
	name: string;
	last_name: string;
	email: string;
	password: string;
}): void => {
	required(data.name, 'Nombre');
	maxLength(data.name, 100, 'Nombre');

	required(data.last_name, 'Apellido');
	maxLength(data.last_name, 150, 'Apellido');

	required(data.email, 'Email');
	validEmail(data.email);
	maxLength(data.email, 255, 'Email');

	required(data.password, 'Contraseña');
	minLength(data.password, 8, 'Contraseña');
};

// User update validation (form data)
export const validateUserUpdate = (data: {
	name: string;
	last_name: string;
	email: string;
}): void => {
	required(data.name, 'Nombre');
	maxLength(data.name, 100, 'Nombre');

	required(data.last_name, 'Apellido');
	maxLength(data.last_name, 150, 'Apellido');

	required(data.email, 'Email');
	validEmail(data.email);
	maxLength(data.email, 255, 'Email');
};

// Database insertion validation
export const validateUserInsert = (data: NewUsers): void => {
	required(data.email, 'Email');
	validEmail(data.email);
	maxLength(data.email, 255, 'Email');

	required(data.password_hash, 'Password hash');
	maxLength(data.password_hash, 255, 'Password hash');

	if (data.name) {
		maxLength(data.name, 100, 'Nombre');
	}

	if (data.last_name) {
		maxLength(data.last_name, 150, 'Apellido');
	}
};

// Client-side validation that returns validation result instead of throwing
export const validateUserCreationSafe = (data: {
	name: string;
	last_name: string;
	email: string;
	password: string;
}): { isValid: boolean; error?: string } => {
	try {
		validateUserCreation(data);
		return { isValid: true };
	} catch (error) {
		return {
			isValid: false,
			error: error instanceof Error ? error.message : 'Error de validación'
		};
	}
};

export const validateUserUpdateSafe = (data: {
	name: string;
	last_name: string;
	email: string;
}): { isValid: boolean; error?: string } => {
	try {
		validateUserUpdate(data);
		return { isValid: true };
	} catch (error) {
		return {
			isValid: false,
			error: error instanceof Error ? error.message : 'Error de validación'
		};
	}
};

// Password validation
export const validatePassword = (password: string, confirmPassword?: string): void => {
	required(password, 'Contraseña');
	minLength(password, 8, 'Contraseña');

	if (confirmPassword !== undefined && password !== confirmPassword) {
		throw new Error('Las contraseñas no coinciden');
	}
};

export const validatePasswordSafe = (
	password: string,
	confirmPassword?: string
): { isValid: boolean; error?: string } => {
	try {
		validatePassword(password, confirmPassword);
		return { isValid: true };
	} catch (error) {
		return {
			isValid: false,
			error: error instanceof Error ? error.message : 'Error de validación'
		};
	}
};
