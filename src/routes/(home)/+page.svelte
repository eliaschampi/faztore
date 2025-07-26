<script lang="ts">
	import { onMount } from 'svelte';
	import { Users, School, Activity, UserRound, UserCog } from 'lucide-svelte';
	import { showToast } from '$lib/stores/Toast';

	// State
	let isLoading = $state(true);
	let counts = $state<{
		users: number;
		branches: number;
		permissions: number;
	}>({
		users: 0,
		branches: 0,
		permissions: 0
	});

	// Load data on mount
	onMount(() => {
		const loadData = async () => {
			try {
				// Load basic counts
				const countsResponse = await fetch('/api/dashboard/counts');

				if (!countsResponse.ok) {
					throw new Error('Error al cargar datos de conteos');
				}

				// Parse response
				const countsData = await countsResponse.json();

				// Validate data
				if (typeof countsData === 'object' && countsData !== null) {
					counts = countsData;
				} else {
					showToast('Formato de datos de conteos inválido', 'danger');
				}
			} catch {
				showToast('Error al cargar datos del dashboard', 'danger');
			} finally {
				isLoading = false;
			}
		};

		// Start loading data
		loadData();
	});
</script>

<!-- Stats Cards -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
	<!-- Users Count -->
	<a href="/users" class="card card-gradient-primary rounded-xl overflow-hidden cursor-pointer">
		<div class="card-body p-6">
			<div class="flex items-center justify-between">
				<h2 class="card-title text-xl font-semibold">Usuarios</h2>
				<div class="icon-container icon-container-primary">
					<Users size={24} />
				</div>
			</div>
			{#if isLoading}
				<div class="flex justify-center items-center py-2">
					<span class="loading loading-spinner loading-md text-primary"></span>
				</div>
			{:else}
				<p class="text-4xl font-bold mt-2 animate-fade-in">{counts.users.toLocaleString()}</p>
			{/if}
			<p class="text-sm opacity-70 mt-1">Total de usuarios registrados</p>
		</div>
	</a>

	<!-- Branches Count -->
	<a
		href="/branches"
		class="card card-gradient-secondary rounded-xl overflow-hidden cursor-pointer"
	>
		<div class="card-body p-6">
			<div class="flex items-center justify-between">
				<h2 class="card-title text-xl font-semibold">Ramas</h2>
				<div class="icon-container icon-container-secondary">
					<School size={24} />
				</div>
			</div>
			{#if isLoading}
				<div class="flex justify-center items-center py-2">
					<span class="loading loading-spinner loading-md text-secondary"></span>
				</div>
			{:else}
				<p class="text-4xl font-bold mt-2 animate-fade-in">{counts.branches.toLocaleString()}</p>
			{/if}
			<p class="text-sm opacity-70 mt-1">Ramas disponibles</p>
		</div>
	</a>

	<!-- Permissions Count -->
	<a href="/users" class="card card-gradient-accent rounded-xl overflow-hidden cursor-pointer">
		<div class="card-body p-6">
			<div class="flex items-center justify-between">
				<h2 class="card-title text-xl font-semibold">Permisos</h2>
				<div class="icon-container icon-container-accent">
					<Activity size={24} />
				</div>
			</div>
			{#if isLoading}
				<div class="flex justify-center items-center py-2">
					<span class="loading loading-spinner loading-md text-accent"></span>
				</div>
			{:else}
				<p class="text-4xl font-bold mt-2 animate-fade-in">{counts.permissions.toLocaleString()}</p>
			{/if}
			<p class="text-sm opacity-70 mt-1">Permisos asignados</p>
		</div>
	</a>
</div>

<!-- Quick Access Cards -->
<h2 class="text-2xl font-semibold mb-4">Acceso Rápido</h2>
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
	<!-- Users Management -->
	<a href="/users" class="card card-gradient-primary rounded-xl overflow-hidden cursor-pointer">
		<div class="card-body p-6">
			<div class="flex flex-col items-center text-center">
				<div class="icon-container icon-container-primary p-4 mb-4">
					<UserCog size={32} />
				</div>
				<h2 class="card-title text-xl font-semibold">Usuarios</h2>
				<p class="text-sm opacity-70 mt-2">Gestiona usuarios y permisos del sistema</p>
			</div>
		</div>
	</a>

	<!-- Branches Management -->
	<a
		href="/branches"
		class="card card-gradient-secondary rounded-xl overflow-hidden cursor-pointer"
	>
		<div class="card-body p-6">
			<div class="flex flex-col items-center text-center">
				<div class="icon-container icon-container-secondary p-4 mb-4">
					<School size={32} />
				</div>
				<h2 class="card-title text-xl font-semibold">Ramas</h2>
				<p class="text-sm opacity-70 mt-2">Administra las ramas del sistema</p>
			</div>
		</div>
	</a>

	<!-- Profile -->
	<a href="/profile" class="card card-gradient-accent rounded-xl overflow-hidden cursor-pointer">
		<div class="card-body p-6">
			<div class="flex flex-col items-center text-center">
				<div class="icon-container icon-container-accent p-4 mb-4">
					<UserRound size={32} />
				</div>
				<h2 class="card-title text-xl font-semibold">Mi Perfil</h2>
				<p class="text-sm opacity-70 mt-2">Gestiona tu información personal</p>
			</div>
		</div>
	</a>
</div>
