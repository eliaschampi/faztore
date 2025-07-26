<script lang="ts">
	import { Moon, Sun, Palette, HelpCircle, InfoIcon, MessageCircle } from 'lucide-svelte';
	import { theme } from '$lib/stores/theme';

	// Theme options
	let isDarkTheme = $derived($theme === 'dark');

	// Theme toggle function (mismo que en layout.svelte)
	function toggleTheme() {
		theme.toggle();
	}

	function handleWspClick() {
		window.open('https://wa.link/376ly9', '_blank');
	}
</script>

<div class="container max-w-3xl px-4">
	<!-- System info card -->
	<div class="card bg-base-200 shadow border border-base-300/30 mb-8">
		<div class="card-body">
			<div class="flex items-center gap-4 mb-2">
				<div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
					<InfoIcon class="w-5 h-5 text-primary" />
				</div>
				<h2 class="text-xl font-semibold">Acerca del sistema</h2>
			</div>

			<p class="text-base-content/80 mb-4">
				Esta aplicación está diseñada para ofrecerte una experiencia limpia, rápida y eficiente.
			</p>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
				<div class="flex justify-between py-1 border-b border-base-300/50">
					<span class="text-base-content/70">Versión</span>
					<span class="font-medium">1.5.0</span>
				</div>
				<div class="flex justify-between py-1 border-b border-base-300/50">
					<span class="text-base-content/70">Framework</span>
					<span class="font-medium">SSR</span>
				</div>
				<div class="flex justify-between py-1 border-b border-base-300/50">
					<span class="text-base-content/70">Desarrollador</span>
					<span class="font-bold">Elias Champi</span>
				</div>
				<div class="flex justify-between py-1 border-b border-base-300/50">
					<span class="text-base-content/70">Última actualización</span>
					<span class="font-medium">Agosto 2025</span>
				</div>
			</div>
			<div class="flex justify-between py-1">
				<span class="text-base-content/70">Licencia</span>
				<span class="font-medium">MIT</span>
			</div>
			<div class="flex justify-between py-1">
				<span class="text-base-content/70">Derechos reservados</span>
				<span class="font-medium">© {new Date().getFullYear()} EliasChampi</span>
			</div>
		</div>
	</div>

	<!-- Theme settings -->
	<div class="card bg-base-200 shadow border border-base-300/30 mb-6">
		<div class="card-body">
			<div class="flex items-center gap-4 mb-2">
				<div
					class="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
				>
					<Palette class="w-5 h-5 text-primary" />
				</div>
				<h2 class="text-xl font-semibold">Tema</h2>
			</div>

			<div class="flex flex-col gap-6">
				<!-- Tema actual -->
				<div class="flex items-center justify-between bg-base-200 p-4 rounded-lg">
					<div class="flex items-center gap-3">
						{#if isDarkTheme}
							<div class="w-10 h-10 rounded-full bg-base-100 flex items-center justify-center">
								<Moon class="w-5 h-5" />
							</div>
							<span class="font-medium">Tema Oscuro</span>
						{:else}
							<div class="w-10 h-10 rounded-full bg-base-100 flex items-center justify-center">
								<Sun class="w-5 h-5" />
							</div>
							<span class="font-medium">Tema Claro</span>
						{/if}
					</div>
					<button class="btn btn-primary btn-sm" onclick={toggleTheme}> Cambiar tema </button>
				</div>
			</div>
		</div>
	</div>

	<!-- Help card -->
	<div class="card bg-base-200 shadow border border-base-300/30">
		<div class="card-body">
			<div class="flex items-center gap-4 mb-2">
				<div class="w-10 h-10 rounded-full bg-info/20 flex items-center justify-center">
					<HelpCircle class="w-5 h-5 text-info" />
				</div>
				<h2 class="text-xl font-semibold">Ayuda</h2>
			</div>
			<div class="text-center">
				<button onclick={handleWspClick} class="btn btn-soft btn-primary">
					<MessageCircle class="w-5 h-5" />
					Contacta al Desarrollador
				</button>
			</div>
		</div>
	</div>
</div>
