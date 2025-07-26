<script lang="ts">
	import { Plus, Upload } from 'lucide-svelte';

	interface Props {
		dis?: boolean;
		multiple?: boolean;
		accept?: string;
		variant?: 'primary' | 'outline';
		size?: 'sm' | 'md' | 'lg';
		icon?: 'plus' | 'upload';
		text?: string;
		class?: string;
		onFileSelect: (files: FileList) => void;
	}

	const {
		dis = false,
		multiple = true,
		accept = 'image/jpeg,image/png,image/webp',
		variant = 'primary',
		size = 'sm',
		icon = 'plus',
		text = 'Añadir',
		class: className = '',
		onFileSelect
	}: Props = $props();

	let fileInput: HTMLInputElement;

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files?.length) {
			onFileSelect(input.files);
			input.value = ''; // Reset input
		}
	}

	function triggerFileInput() {
		console.log('triggerFileInput called, dis:', dis, 'fileInput:', !!fileInput);
		if (!dis && fileInput) {
			fileInput.click();
		}
	}

	const IconComponent = icon === 'plus' ? Plus : Upload;
	const buttonClasses = `btn ${variant === 'primary' ? 'btn-primary' : 'btn-outline btn-primary'} btn-${size} ${className}`;
</script>

<button class={buttonClasses} disabled={dis} onclick={triggerFileInput}>
	<IconComponent size={16} />
	{text}
</button>
<input
	bind:this={fileInput}
	type="file"
	{accept}
	{multiple}
	class="hidden"
	onchange={handleFileChange}
	disabled={dis}
/>
