<script lang="ts">
	import { getInitials } from '$lib/utils/initialName';
	import {
		UserRound,
		Calendar,
		ShieldCheck,
		Activity,
		LogIn,
		BadgeCheck,
		AlertCircle,
		Users
	} from 'lucide-svelte';

	interface LoginHistoryItem {
		date: string;
		ip: string;
		device: string;
		status: 'success' | 'failed';
		location?: string;
	}

	interface LevelWithUsers {
		code: string;
		name: string;
		created_at: string;
		users?: string[];
	}

	type ProfileProps = {
		data: {
			levels: LevelWithUsers[];
			user: Users | null;
		};
	};

	// Props from server
	const { data }: ProfileProps = $props();

	// User data
	let userEmail = $derived(data.user?.email || '');
	let createdAt = $derived(
		data.user?.created_at
			? new Date(data.user.created_at).toLocaleDateString('es-ES', {
					day: '2-digit',
					month: 'long',
					year: 'numeric'
				})
			: ''
	);

	// Login history with more realistic data
	const loginHistory = $state<LoginHistoryItem[]>([
		{
			date: new Date(data.user?.last_login || '').toLocaleString('es-ES'),
			ip: '192.168.1.1',
			device: 'Chrome en Windows',
			status: 'success',
			location: 'Lima, Perú'
		}
	]);

	// Tabs
	let activeTab = $state(0);
	const tabs = [
		{ name: 'Ciclos activos', icon: Activity },
		{ name: 'Dispositivos', icon: LogIn }
	];

	// Format role name
	function formatRole(role: string | undefined): string {
		if (!role) return 'Usuario';
		return role === 'admin' ? 'Administrador' : 'Usuario';
	}
</script>

<div class="container max-w-4xl px-4">
	<!-- Profile Card - Modern Design -->
	<div
		class="card bg-gradient-to-br from-base-200 to-base-100 shadow border border-base-300/30 overflow-hidden mb-8"
	>
		<div class="card-body p-0">
			<!-- Header with gradient -->
			<div
				class="relative h-40 sm:h-48 bg-gradient-to-r from-primary/40 via-primary/20 to-secondary/30 flex items-center justify-center"
			>
				<div class="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
					<div class="avatar">
						<div
							class="w-32 h-32 rounded-full ring-4 ring-base-100 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shadow-md"
						>
							{#if data.user?.photo_url}
								<img src={data.user?.photo_url} alt="Foto de perfil" class="mask mask-circle" />
							{:else}
								<span class="text-4xl font-bold text-primary">
									{getInitials(data.user?.name || '', data.user?.last_name || '')}
								</span>
							{/if}
						</div>
					</div>
				</div>
			</div>

			<!-- User information -->
			<div class="text-center mt-20 px-6 pb-6 space-y-4">
				<div>
					<h2 class="text-2xl font-bold">
						{data.user?.name || ''}
						{data.user?.last_name || ''}
					</h2>
					<div class="flex items-center justify-center gap-1.5 text-success mt-1.5">
						<span class="w-2 h-2 bg-success rounded-full animate-pulse"></span>
						<span class="text-sm">En línea</span>
					</div>
				</div>

				<p class="text-base-content/70 text-sm max-w-md mx-auto">
					{userEmail}
				</p>

				<!-- Stats cards -->
				<div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
					<div class="stat bg-base-200/50 rounded-xl shadow border border-base-300/20">
						<div class="stat-figure text-primary">
							<UserRound class="w-5 h-5" />
						</div>
						<div class="stat-title text-xs opacity-70">Rol</div>
						<div class="stat-value text-base font-medium">
							{formatRole(data.user?.role)}
						</div>
					</div>

					<div class="stat bg-base-200/50 rounded-xl shadow border border-base-300/20">
						<div class="stat-figure text-primary">
							<Calendar class="w-5 h-5" />
						</div>
						<div class="stat-title text-xs opacity-70">Registro</div>
						<div class="stat-value text-base font-medium">{createdAt}</div>
					</div>

					<div class="stat bg-base-200/50 rounded-xl shadow border border-base-300/20">
						<div class="stat-figure text-success">
							<BadgeCheck class="w-5 h-5" />
						</div>
						<div class="stat-title text-xs opacity-70">Estado</div>
						<div class="stat-value text-base font-medium text-success">Activo</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Tabs Section - Modern Design -->
	<div
		class="card bg-gradient-to-br from-base-200 to-base-100 shadow border border-base-300/30 overflow-hidden"
	>
		<div class="card-body p-0">
			<!-- Tab Headers -->
			<div class="tabs tabs-boxed bg-base-200/80 p-1.5 rounded-t-box">
				{#each tabs as tab, i (tab.name)}
					<button
						class="tab flex-1 gap-2 transition-all duration-200 {activeTab === i
							? 'tab-active bg-primary/10 font-medium'
							: ''}"
						onclick={() => (activeTab = i)}
					>
						{#if tab.icon === Activity}
							<Activity class="w-4 h-4" />
						{:else if tab.icon === LogIn}
							<LogIn class="w-4 h-4" />
						{/if}
						{tab.name}
					</button>
				{/each}
			</div>

			<!-- Tab Content -->
			<div class="p-5">
				{#if activeTab === 0}
					<!-- Levels Tab -->
					{#if data.levels.length === 0}
						<div class="flex flex-col items-center justify-center py-8 px-4 text-center">
							<div class="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mb-4">
								<Activity class="w-8 h-8 opacity-40" />
							</div>
							<h3 class="text-lg font-medium">No hay ciclos activos</h3>
							<p class="text-base-content/60 max-w-md mt-2">
								Aquí aparecerán los ciclos Administrativos a los que tienes acceso en el sistema.
							</p>
						</div>
					{:else}
						<div class="w-full">
							<ul class="divide-y divide-base-300/30 rounded-lg bg-base-100/50 shadow">
								{#each data.levels as level (level.code)}
									<li
										class="flex items-center justify-between py-3.5 px-4 hover:bg-base-200/50 transition-colors"
									>
										<div class="flex items-center gap-3">
											<div
												class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
											>
												<Activity class="w-4 h-4 text-primary" />
											</div>
											<div>
												<div class="font-medium">{level.name}</div>
												<div class="text-xs text-base-content/60">
													Año: {new Date(level.created_at).getFullYear()}
												</div>
											</div>
										</div>
										<div class="badge badge-primary badge-outline">
											{level.users?.length || 0} Usuarios
										</div>
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				{:else}
					<!-- Login History Tab -->
					{#if loginHistory.length === 0}
						<div class="flex flex-col items-center justify-center py-8 px-4 text-center">
							<div class="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mb-4">
								<LogIn class="w-8 h-8 opacity-40" />
							</div>
							<h3 class="text-lg font-medium">No hay historial de acceso</h3>
							<p class="text-base-content/60 max-w-md mt-2">
								Aquí aparecerá el historial de tus inicios de sesión en el sistema.
							</p>
						</div>
					{:else}
						<div class="overflow-x-auto">
							<table class="table table-zebra bg-base-100/50 rounded-lg">
								<thead>
									<tr>
										<th class="bg-base-200/50">Fecha y Hora</th>
										<th class="bg-base-200/50">Ubicación</th>
										<th class="bg-base-200/50">Dispositivo</th>
										<th class="bg-base-200/50">Estado</th>
									</tr>
								</thead>
								<tbody>
									{#each loginHistory as login (login.date)}
										<tr class="hover">
											<td class="font-medium">{login.date}</td>
											<td>{login.location || login.ip}</td>
											<td>{login.device}</td>
											<td>
												{#if login.status === 'success'}
													<div class="badge badge-success badge-sm gap-1">
														<ShieldCheck class="w-3 h-3" />
														Éxito
													</div>
												{:else}
													<div class="badge badge-error badge-sm gap-1">
														<AlertCircle class="w-3 h-3" />
														Fallido
													</div>
												{/if}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				{/if}
			</div>
		</div>
	</div>
</div>
