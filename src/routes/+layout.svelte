<script lang="ts">
	let { children } = $props();
	import '../style.css';
	import Toast from '$lib/components/Toast.svelte';
</script>

<Toast />

{@render children()}
