/**
 * API response types
 * Clean, minimalist approach for API responses
 * Following clean code philosophy with maximum efficiency
 */

// ============================================================================
// CORE API TYPES - Simple and efficient
// ============================================================================

export interface ApiResponse<T = unknown> {
	success: boolean;
	message?: string;
	data?: T;
	error?: string;
}

export interface ApiError {
	success: false;
	error: string;
	message?: string;
}

export interface ApiSuccess<T = unknown> {
	success: true;
	data: T;
	message?: string;
}

// ============================================================================
// UTILITY FUNCTIONS - Clean and simple
// ============================================================================

/**
 * Create success response
 */
export function success<T>(data: T, message?: string): ApiSuccess<T> {
	return {
		success: true,
		data,
		...(message && { message })
	};
}

/**
 * Create error response
 */
export function error(error: string, message?: string): ApiError {
	return {
		success: false,
		error,
		...(message && { message })
	};
}

/**
 * Create JSON response with status
 */
export function jsonResponse<T>(data: ApiResponse<T>, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
