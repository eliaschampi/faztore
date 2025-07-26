import type { NewProducts, ProductImage } from '../types';

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

const minValue = (value: number, min: number, field: string): void => {
	if (value < min) {
		throw new Error(`${field} debe ser mayor o igual a ${min}`);
	}
};

const isValidUUID = (value: string): boolean => {
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(value);
};

// Image validation helpers
const isValidUrl = (url: string): boolean => {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
};

const validateImages = (images: ProductImage[]): void => {
	if (images.length > 10) {
		throw new Error('Máximo 10 imágenes permitidas');
	}

	const primaryImages = images.filter((img) => img.isPrimary);
	if (primaryImages.length > 1) {
		throw new Error('Solo puede haber una imagen principal');
	}

	for (const image of images) {
		if (!image.url || !isValidUrl(image.url)) {
			throw new Error('URL de imagen inválida');
		}
	}
};

// Product creation validation (form data)
export const validateProductCreation = (data: {
	name: string;
	description?: string;
	brand_code: string;
	category_code: string;
	price: number;
	sku?: string;
	images?: ProductImage[];
}): void => {
	required(data.name, 'Nombre');
	minLength(data.name, 2, 'Nombre');
	maxLength(data.name, 100, 'Nombre');

	required(data.brand_code, 'Marca');
	if (!isValidUUID(data.brand_code)) {
		throw new Error('Marca inválida');
	}

	required(data.category_code, 'Categoría');
	if (!isValidUUID(data.category_code)) {
		throw new Error('Categoría inválida');
	}

	required(data.price, 'Precio');
	minValue(data.price, 0, 'Precio');

	if (data.description && data.description.trim()) {
		maxLength(data.description, 1000, 'Descripción');
	}

	if (data.sku && data.sku.trim()) {
		maxLength(data.sku, 50, 'SKU');
	}

	if (data.images && data.images.length > 0) {
		validateImages(data.images);
	}
};

// Product update validation (form data)
export const validateProductUpdate = (data: {
	name: string;
	description?: string;
	brand_code: string;
	category_code: string;
	price: number;
	sku?: string;
	images?: ProductImage[];
}): void => {
	required(data.name, 'Nombre');
	minLength(data.name, 2, 'Nombre');
	maxLength(data.name, 100, 'Nombre');

	required(data.brand_code, 'Marca');
	if (!isValidUUID(data.brand_code)) {
		throw new Error('Marca inválida');
	}

	required(data.category_code, 'Categoría');
	if (!isValidUUID(data.category_code)) {
		throw new Error('Categoría inválida');
	}

	required(data.price, 'Precio');
	minValue(data.price, 0, 'Precio');

	if (data.description && data.description.trim()) {
		maxLength(data.description, 1000, 'Descripción');
	}

	if (data.sku && data.sku.trim()) {
		maxLength(data.sku, 50, 'SKU');
	}

	if (data.images && data.images.length > 0) {
		validateImages(data.images);
	}
};

// Database insertion validation
export const validateProductInsert = (data: NewProducts): void => {
	required(data.name, 'Nombre');
	minLength(data.name, 2, 'Nombre');
	maxLength(data.name, 100, 'Nombre');

	required(data.brand_code, 'Marca');
	required(data.category_code, 'Categoría');
	required(data.user_code, 'Usuario');
	required(data.price, 'Precio');
	minValue(Number(data.price), 0, 'Precio');

	if (data.description && data.description.trim()) {
		maxLength(data.description, 1000, 'Descripción');
	}

	if (data.sku && data.sku.trim()) {
		maxLength(data.sku, 50, 'SKU');
	}

	if (data.images) {
		const images = Array.isArray(data.images) ? data.images : JSON.parse(data.images as string);
		validateImages(images);
	}
};

// Client-side validation that returns validation result instead of throwing
export const validateProductCreationSafe = (data: {
	name: string;
	description?: string;
	brand_code: string;
	category_code: string;
	price: number;
	sku?: string;
	images?: ProductImage[];
}): { isValid: boolean; error?: string } => {
	try {
		validateProductCreation(data);
		return { isValid: true };
	} catch (error) {
		return {
			isValid: false,
			error: error instanceof Error ? error.message : 'Error de validación'
		};
	}
};

export const validateProductUpdateSafe = (data: {
	name: string;
	description?: string;
	brand_code: string;
	category_code: string;
	price: number;
	sku?: string;
	images?: ProductImage[];
}): { isValid: boolean; error?: string } => {
	try {
		validateProductUpdate(data);
		return { isValid: true };
	} catch (error) {
		return {
			isValid: false,
			error: error instanceof Error ? error.message : 'Error de validación'
		};
	}
};
