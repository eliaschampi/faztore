import { writable } from 'svelte/store';
import type { ToastState, ToastType } from '$lib/types';

let toastId = 0;
export const toasts = writable<ToastState[]>([]);

// Mapa para almacenar los timeouts de cada toast
const timeouts: Record<number, ReturnType<typeof setTimeout>> = {};

// Constante para el tiempo de vida del toast (en ms)
const TOAST_LIFETIME = 5000;

// Límite máximo de toasts simultáneos
const MAX_TOASTS = 5;

export function showToast(title: string, type: ToastType) {
	const id = ++toastId;
	const newToast: ToastState = { id, title, type };

	// Añadir el nuevo toast y limitar el número máximo
	toasts.update((prev) => {
		// Si ya tenemos el máximo de toasts, eliminar el más antiguo
		const updatedToasts = [...prev, newToast];
		if (updatedToasts.length > MAX_TOASTS) {
			const oldestToast = updatedToasts[0];
			removeToast(oldestToast.id);
			return updatedToasts.slice(1);
		}
		return updatedToasts;
	});

	// ProgSeder la eliminación automática
	timeouts[id] = setTimeout(() => {
		removeToast(id);
	}, TOAST_LIFETIME);
}

export function removeToast(id: number) {
	if (timeouts[id]) {
		clearTimeout(timeouts[id]);
		delete timeouts[id];
	}
	toasts.update((prev) => prev.filter((toast) => toast.id !== id));
}

export function clearAllToasts() {
	// Limpiar todos los timeouts
	Object.keys(timeouts).forEach((id) => {
		clearTimeout(timeouts[Number(id)]);
		delete timeouts[Number(id)];
	});

	// Limpiar la lista de toasts
	toasts.set([]);
}
