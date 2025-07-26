/**
 * Types for the reusable Table component
 */

import type { Snippet } from 'svelte';

/**
 * Represents a column in a table
 * @template T - The type of data in each row
 */
export interface TableColumn<T> {
	/** The key to access the data in the row object (optional if cell function is provided) */
	key?: keyof T | string;

	/** The label to display in the table header */
	label: string;

	/** Optional CSS class for the header cell */
	headerClass?: string;

	/** Optional CSS class for the data cells in this column */
	class?: string;

	/**
	 * Optional function to render custom cell content
	 * @param row - The row data
	 * @returns The content to render in the cell (string or other value)
	 */
	render?: Snippet<[T]>;
}
