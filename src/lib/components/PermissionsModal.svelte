<!-- src/lib/components/PermissionsModal.svelte -->
<script lang="ts">
	import { invalidate } from '$app/navigation';
	import Message from '$lib/components/Message.svelte';
	import { showToast } from '$lib/stores/Toast';
	import { Shield, Plus, X } from 'lucide-svelte';
	import { PERMISSION_DEFINITIONS, getPermissionByKey } from '$lib/permissions/definitions';
	import type { Users } from '$lib/types';

	type ApiPermission = {
		code: string;
		user_code: string;
		entity: string;
		action: string;
	};

	type PermissionProps = {
		user: Users;
		open?: boolean;
		onClose?: () => void;
	};

	const { user, open = false, onClose = () => {} }: PermissionProps = $props();

	// State management
	let modal: HTMLDialogElement | null = $state(null);
	let userPermissions = $state<string[]>([]); // Array of permission keys like 'users:read'
	let loading = $state(false);
	let error = $state('');
	let saving = $state(false);
	let selectedPermission = $state('');

	// Computed
	let availablePermissions = $derived(
		PERMISSION_DEFINITIONS.filter((p) => !userPermissions.includes(p.key))
	);

	// Modal control
	$effect(() => {
		if (open && modal) {
			modal.showModal();
			loadPermissions();
		} else if (!open && modal) {
			modal.close();
		}
	});

	// Close event handling
	$effect(() => {
		const modalElement = modal;
		if (!modalElement) return;

		const handleClose = () => onClose();
		modalElement.addEventListener('close', handleClose);
		return () => modalElement.removeEventListener('close', handleClose);
	});

	// Load permissions from API
	async function loadPermissions() {
		if (!user.code) return;

		loading = true;
		error = '';

		try {
			const response = await fetch(`/api/users/${user.code}/permissions`);
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Error fetching permissions');
			}

			const { permissions: permissionsData } = (await response.json()) as {
				permissions: ApiPermission[];
			};

			// Convert to permission keys format (entity:action)
			userPermissions = permissionsData.map((p) => `${p.entity}:${p.action}`);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error loading permissions';
			console.error('Permission loading error:', err);
		} finally {
			loading = false;
		}
	}

	// Add permission
	function addPermission() {
		if (selectedPermission && !userPermissions.includes(selectedPermission)) {
			userPermissions = [...userPermissions, selectedPermission];
			selectedPermission = '';
		}
	}

	// Remove permission
	function removePermission(permissionKey: string) {
		userPermissions = userPermissions.filter((p) => p !== permissionKey);
	}

	// Save permissions
	async function savePermissions() {
		saving = true;
		error = '';

		try {
			// Convert permission keys to API format
			const permissionsToSave = userPermissions.map((key) => {
				const [entity, action] = key.split(':');
				return { entity, user_action: action };
			});

			const response = await fetch(`/api/users/${user.code}/permissions`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ permissions: permissionsToSave })
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Error guardando permisos');
			}

			const result = await response.json();
			showToast(`Permisos actualizados correctamente (${result.count} permisos)`, 'success');
			await invalidate('users:permissions');
			closeModal();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error guardando permisos';
			console.error('Permission saving error:', err);
		} finally {
			saving = false;
		}
	}

	// Utility functions
	function closeModal() {
		modal?.close();
	}
</script>

<dialog bind:this={modal} class="modal">
	<div class="modal-box max-w-4xl">
		<div class="flex justify-between items-center mb-6">
			<h3 class="text-lg font-bold flex items-center gap-2">
				<Shield class="w-5 h-5 text-primary" />
				Permisos de Usuario: {user.name}
				{user.last_name}
			</h3>
		</div>

		{#if loading}
			<div class="flex justify-center my-8">
				<span class="loading loading-spinner loading-md text-primary"></span>
			</div>
		{:else if error}
			<div class="my-4">
				<Message description={error} type="error" />
				<div class="flex justify-center mt-4">
					<button class="btn btn-sm btn-primary" onclick={loadPermissions}>Reintentar</button>
				</div>
			</div>
		{:else}
			<!-- Add Permission Section -->
			<div class="mb-6 p-4 bg-base-200 rounded-lg">
				<h4 class="font-semibold mb-3">Agregar Permiso</h4>
				<div class="flex gap-2">
					<select bind:value={selectedPermission} class="select select-bordered flex-1">
						<option value="">Seleccionar permiso...</option>
						{#each availablePermissions as permission (permission.key)}
							<option value={permission.key}>
								{permission.category} - {permission.label}
							</option>
						{/each}
					</select>
					<button class="btn btn-primary" onclick={addPermission} disabled={!selectedPermission}>
						<Plus class="w-4 h-4" />
						Agregar
					</button>
				</div>
			</div>

			<!-- Current Permissions -->
			<div class="mb-4">
				<h4 class="font-semibold mb-3">Permisos Actuales ({userPermissions.length})</h4>
				{#if userPermissions.length === 0}
					<div class="text-center py-8 text-base-content/60">No hay permisos asignados</div>
				{:else}
					<div class="space-y-2 max-h-60 overflow-y-auto">
						{#each userPermissions as permissionKey (permissionKey)}
							{@const permission = getPermissionByKey(permissionKey)}
							{#if permission}
								<div class="flex items-center justify-between p-3 bg-base-300 rounded">
									<div>
										<div class="font-medium">{permission.label}</div>
										<div class="text-sm text-base-content/60">
											{permission.category} • {permission.description}
										</div>
									</div>
									<button
										class="btn btn-sm btn-ghost btn-circle text-error"
										onclick={() => removePermission(permissionKey)}
									>
										<X class="w-4 h-4" />
									</button>
								</div>
							{/if}
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		<div class="modal-action flex justify-center gap-2">
			<button class="btn" onclick={closeModal} disabled={saving}>Cancelar</button>
			<button
				class="btn btn-primary"
				onclick={savePermissions}
				disabled={loading || saving || !!error}
			>
				{#if saving}
					<span class="loading loading-spinner loading-xs"></span>
				{/if}
				Guardar Permisos
			</button>
		</div>
	</div>
</dialog>
