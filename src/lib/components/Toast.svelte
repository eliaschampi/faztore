<script lang="ts">
	import { fade } from 'svelte/transition';
	import { toasts, removeToast, clearAllToasts } from '$lib/stores/Toast';
	import { Info, X as XIcon, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-svelte';
	import { createPortal } from '$lib/actions/createPortal';
	import { onDestroy } from 'svelte';

	// Definimos estilos e iconos por tipo
	const themeStyles = {
		success: {
			icon: 'text-green-500 bg-green-100 dark:bg-green-800 dark:text-green-200',
			component: CheckCircle
		},
		danger: {
			icon: 'text-red-500 bg-red-100 dark:bg-red-800 dark:text-red-200',
			component: AlertCircle
		},
		warning: {
			icon: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-800 dark:text-yellow-200',
			component: AlertTriangle
		},
		info: {
			icon: 'text-blue-500 bg-blue-100 dark:bg-blue-800 dark:text-blue-200',
			component: Info
		}
	};

	// Limpiar todos los toasts cuando se destruye el componente
	onDestroy(() => {
		clearAllToasts();
	});
</script>

<!-- Usamos la acción createPortal para mover el contenedor al nodo en el body -->
<div use:createPortal class="fixed top-5 right-5 space-y-2 z-50">
	{#each $toasts as toast (toast.id)}
		<div
			transition:fade
			class="flex items-center w-full max-w-xs p-4 rounded-lg shadow-sm bg-base-300 gap-2"
			role="alert"
		>
			<div
				class={`inline-flex items-center justify-center shrink-0 w-8 h-8 rounded-lg ${themeStyles[toast.type].icon}`}
			>
				<svelte:component this={themeStyles[toast.type].component} class="w-4 h-4" />
			</div>
			<div class="ml-3 text-sm font-normal">
				{toast.title}
			</div>
			<button
				type="button"
				onclick={() => removeToast(toast.id)}
				class="btn btn-ghost btn-circle"
				aria-label="Close"
			>
				<XIcon class="w-4 h-4" />
			</button>
		</div>
	{/each}
</div>
