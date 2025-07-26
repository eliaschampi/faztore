<script lang="ts">
	import { Users, School, UserRound, UserCog, Tag, Award } from 'lucide-svelte';
</script>

<!-- Stats Cards -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
	<!-- Users Count -->
	<a href="/users" class="card card-gradient-primary rounded-xl overflow-hidden cursor-pointer">
		<div class="card-body p-6">
			<div class="flex items-center justify-between">
				<h2 class="card-title text-xl font-semibold">Usuarios</h2>
				<div class="icon-container icon-container-primary">
					<Users size={24} />
				</div>
			</div>
			<p class="text-4xl font-bold mt-2 animate-fade-in">-</p>
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
				<h2 class="card-title text-xl font-semibold">Sedes</h2>
				<div class="icon-container icon-container-secondary">
					<School size={24} />
				</div>
			</div>
			<p class="text-4xl font-bold mt-2 animate-fade-in">-</p>
			<p class="text-sm opacity-70 mt-1">Sedes disponibles</p>
		</div>
	</a>

	<!-- Categories Count -->
	<a href="/categories" class="card card-gradient-accent rounded-xl overflow-hidden cursor-pointer">
		<div class="card-body p-6">
			<div class="flex items-center justify-between">
				<h2 class="card-title text-xl font-semibold">Categorías</h2>
				<div class="icon-container icon-container-accent">
					<Tag size={24} />
				</div>
			</div>
			<p class="text-4xl font-bold mt-2 animate-fade-in">-</p>
			<p class="text-sm opacity-70 mt-1">Categorías disponibles</p>
		</div>
	</a>

	<!-- Brands Count -->
	<a href="/brands" class="card card-gradient-info rounded-xl overflow-hidden cursor-pointer">
		<div class="card-body p-6">
			<div class="flex items-center justify-between">
				<h2 class="card-title text-xl font-semibold">Marcas</h2>
				<div class="icon-container icon-container-info">
					<Award size={24} />
				</div>
			</div>
			<p class="text-4xl font-bold mt-2 animate-fade-in">-</p>
			<p class="text-sm opacity-70 mt-1">Marcas disponibles</p>
		</div>
	</a>
</div>

<!-- Quick Access Cards -->
<h2 class="text-2xl font-semibold mb-4">Acceso Rápido</h2>
<div class="grid grid-cols-1 md:grid-cols-5 gap-6">
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
				<h2 class="card-title text-xl font-semibold">Sedes</h2>
				<p class="text-sm opacity-70 mt-2">Administra las Sedes del sistema</p>
			</div>
		</div>
	</a>

	<!-- Categories Management -->
	<a href="/categories" class="card card-gradient-info rounded-xl overflow-hidden cursor-pointer">
		<div class="card-body p-6">
			<div class="flex flex-col items-center text-center">
				<div class="icon-container icon-container-info p-4 mb-4">
					<Tag size={32} />
				</div>
				<h2 class="card-title text-xl font-semibold">Categorías</h2>
				<p class="text-sm opacity-70 mt-2">Administra las categorías del sistema</p>
			</div>
		</div>
	</a>

	<!-- Brands Management -->
	<a href="/brands" class="card card-gradient-secondary rounded-xl overflow-hidden cursor-pointer">
		<div class="card-body p-6">
			<div class="flex flex-col items-center text-center">
				<div class="icon-container icon-container-secondary p-4 mb-4">
					<Award size={32} />
				</div>
				<h2 class="card-title text-xl font-semibold">Marcas</h2>
				<p class="text-sm opacity-70 mt-2">Administra las marcas del sistema</p>
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
