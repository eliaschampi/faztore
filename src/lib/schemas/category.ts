import type { NewCategories } from '../types';

// Validation helpers
const required = (value: unknown, field: string): void => {
	if (!value || (typeof value === 'string' && !value.trim())) {
		throw new Error(`${field} es requerido`);
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

// Category creation validation (form data)
export const validateCategoryCreation = (data: { name: string; description?: string }): void => {
	required(data.name, 'Nombre');
	minLength(data.name, 2, 'Nombre');
	maxLength(data.name, 100, 'Nombre');

	if (data.description && data.description.trim()) {
		maxLength(data.description, 500, 'Descripción');
	}
};

// Category update validation (form data)
export const validateCategoryUpdate = (data: { name: string; description?: string }): void => {
	required(data.name, 'Nombre');
	minLength(data.name, 2, 'Nombre');
	maxLength(data.name, 100, 'Nombre');

	if (data.description && data.description.trim()) {
		maxLength(data.description, 500, 'Descripción');
	}
};

// Database insertion validation
export const validateCategoryInsert = (data: NewCategories): void => {
	required(data.name, 'Nombre');
	minLength(data.name, 2, 'Nombre');
	maxLength(data.name, 100, 'Nombre');

	if (data.description && data.description.trim()) {
		maxLength(data.description, 500, 'Descripción');
	}
};

// Client-side validation that returns validation result instead of throwing
export const validateCategoryCreationSafe = (data: {
	name: string;
	description?: string;
}): { isValid: boolean; error?: string } => {
	try {
		validateCategoryCreation(data);
		return { isValid: true };
	} catch (error) {
		return {
			isValid: false,
			error: error instanceof Error ? error.message : 'Error de validación'
		};
	}
};

export const validateCategoryUpdateSafe = (data: {
	name: string;
	description?: string;
}): { isValid: boolean; error?: string } => {
	try {
		validateCategoryUpdate(data);
		return { isValid: true };
	} catch (error) {
		return {
			isValid: false,
			error: error instanceof Error ? error.message : 'Error de validación'
		};
	}
};
