<script lang="ts">
	import { CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-svelte';

	// Accept properties for type and description
	export let type = 'success';
	export let description = '';

	// Map each type to a corresponding icon and styling
	const iconMap: Record<string, typeof CheckCircle> = {
		success: CheckCircle,
		warning: AlertTriangle,
		danger: AlertCircle,
		info: Info
	};

	const styleMap: Record<string, string> = {
		success: 'rounded-md border-l-4 border-green-500 bg-green-500/10 px-4 py-3 text-green-600',
		warning: 'rounded-md border-l-4 border-yellow-500 bg-yellow-500/10 px-4 py-3 text-yellow-600',
		danger: 'rounded-md border-l-4 border-red-500 bg-red-500/10 px-4 py-3 text-red-600',
		info: 'rounded-md border-l-4 border-blue-500 bg-blue-500/10 px-4 py-3 text-blue-600'
	};

	// Fallback to success if an unsupported type is provided
	const Icon = iconMap[type] || CheckCircle;
	const classes = styleMap[type] || styleMap.success;
</script>

<div class={classes}>
	<p class="text-sm">
		<Icon class="me-1 -mt-0.5 inline-flex opacity-60" size={16} aria-hidden="true" />
		{description}
	</p>
</div>
