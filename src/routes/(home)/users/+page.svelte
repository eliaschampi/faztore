<!-- src/routes/users/+page.svelte -->
<script lang="ts">
	import { invalidate } from '$app/navigation';
	import Message from '$lib/components/Message.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import PermissionsModal from '$lib/components/PermissionsModal.svelte';
	import { showToast } from '$lib/stores/Toast';
	import { onMount, onDestroy } from 'svelte';
	import { EllipsisVertical } from 'lucide-svelte';

	import { getInitials } from '$lib/utils/initialName';
	import { formatDate } from '$lib/utils/formatDate';
	import {
		validateUserCreationSafe,
		validateUserUpdateSafe,
		validatePasswordSafe
	} from '$lib/schemas/user';
	import type { Users } from '$lib/types';
	import { can } from '$lib/stores/permissions';
	import { page } from '$app/state';

	// Estados y referencias
	let modal: HTMLDialogElement | null = $state(null);
	let confirmModal: HTMLDialogElement | null = $state(null);
	let passwordModal: HTMLDialogElement | null = $state(null);
	let isEditing = $state(false);
	let message = $state('');
	let passwordMessage = $state('');
	let selectedUser = $state<Users | null>(null);
	let showPermissionsModal = $state(false);
	let selectedAvatar = $state('avatar.svg');
	const passwordPattern = '^(?=.*[A-Z])(?=.*\\d).{8,}$';
	const { data } = $props<{ data: { users: Users[] } }>();

	// Available avatars
	const avatars = [
		{ src: 'avatar.svg', label: 'Default' },
		{ src: 'woman1.svg', label: 'Woman 1' },
		{ src: 'woman2.svg', label: 'Woman 2' },
		{ src: 'man1.svg', label: 'Man 1' },
		{ src: 'man2.svg', label: 'Man 2' }
	];

	// permissions - using Svelte 5 reactive approach
	let canCreate = $derived(can('users:create'));
	let canDelete = $derived(can('users:delete'));
	let canUpdate = $derived(can('users:update'));
	let canManagePermissions = $derived(can('users:manage_permissions'));

	const mySelf = (userId: string) => {
		return userId === page.data.user?.code;
	};

	function openCreateModal() {
		if (!canCreate) {
			return;
		}
		isEditing = false;
		selectedAvatar = 'avatar.svg';
		modal?.showModal();
	}

	function openEditModal(user: Users) {
		isEditing = true;
		selectedUser = user;
		selectedAvatar = user.photo_url || 'avatar.svg';
		modal?.showModal();

		const nameInput = modal?.querySelector<HTMLInputElement>('#name');
		const lastnameInput = modal?.querySelector<HTMLInputElement>('#last_name');
		const emailInput = modal?.querySelector<HTMLInputElement>('#email');
		const passwordInput = modal?.querySelector<HTMLInputElement>('#password');

		if (nameInput) nameInput.value = user.name || '';
		if (lastnameInput) lastnameInput.value = user.last_name || '';
		if (emailInput) emailInput.value = user.email || '';
		if (passwordInput) passwordInput.value = '';
	}

	function openDeleteConfirmModal(user: Users) {
		selectedUser = user;
		confirmModal?.showModal();
	}

	function openPasswordModal(user: Users) {
		selectedUser = user;
		passwordMessage = '';
		passwordModal?.showModal();
	}

	function openPermissionsModal(user: Users) {
		selectedUser = user;
		showPermissionsModal = true;
	}

	// Reset permissions modal state when it's closed
	$effect(() => {
		if (!showPermissionsModal) {
			setTimeout(() => {
				if (!showPermissionsModal) {
					selectedUser = null;
				}
			}, 300); // Small delay to ensure the modal is properly closed
		}
	});

	// Schema-based validation for consistent validation rules
	function validateForm(formData: FormData): boolean {
		const name = formData.get('name')?.toString().trim() || '';
		const last_name = formData.get('last_name')?.toString().trim() || '';
		const email = formData.get('email')?.toString().trim() || '';
		const password = formData.get('password')?.toString().trim() || '';

		// Basic required field check
		if (!name || !last_name || !email) {
			message = 'Todos los campos son obligatorios';
			return false;
		}

		if (!isEditing && !password) {
			message = 'La contraseña es obligatoria al crear un usuario';
			return false;
		}

		// Use schema validation for detailed rules
		const validation = isEditing
			? validateUserUpdateSafe({ name, last_name, email })
			: validateUserCreationSafe({ name, last_name, email, password });

		if (!validation.isValid) {
			message = validation.error || 'Error de validación';
			return false;
		}

		message = '';
		return true;
	}

	// Schema-based password validation
	function validatePasswordForm(formData: FormData): boolean {
		const password = formData.get('password')?.toString().trim() || '';
		const confirmPassword = formData.get('confirm_password')?.toString().trim() || '';

		const validation = validatePasswordSafe(password, confirmPassword);

		if (!validation.isValid) {
			passwordMessage = validation.error || 'Error de validación';
			return false;
		}

		passwordMessage = '';
		return true;
	}

	// Enviar datos (crear o editar)
	async function handleSubmit(event: Event) {
		event.preventDefault();

		const formElement = event.currentTarget as HTMLFormElement;
		const dataToSend = new FormData(formElement);
		const action: 'create' | 'update' = isEditing ? 'update' : 'create';

		// Add the selected avatar
		dataToSend.append('photo_url', selectedAvatar);

		if (isEditing) {
			dataToSend.append('user_id', selectedUser?.code || '');
		}

		if (!validateForm(dataToSend)) return;

		try {
			const response = await fetch(`?/${action}`, { method: 'POST', body: dataToSend });
			const res = await response.json();

			if (res.type === 'success') {
				showToast(
					`${isEditing ? 'Usuario actualizado' : 'Usuario creado'} exitosamente`,
					'success'
				);
				await invalidate('users:load');
				modal?.close();
			} else {
				message = res.error || `Error al ${isEditing ? 'actualizar' : 'crear'} el usuario`;
			}
		} catch {
			message = 'Error de red al procesar la solicitud';
		}
	}

	// Manejar actualización de contraseña
	async function handlePasswordUpdate(event: Event) {
		event.preventDefault();
		if (!selectedUser || !canDelete) return;
		const formElement = event.currentTarget as HTMLFormElement;
		const dataToSend = new FormData(formElement);
		dataToSend.append('user_id', selectedUser.code);

		if (!validatePasswordForm(dataToSend)) return;

		try {
			const response = await fetch('?/updatePassword', { method: 'POST', body: dataToSend });
			const res = await response.json();

			if (res.type === 'success') {
				showToast('Contraseña actualizada exitosamente', 'success');
				passwordModal?.close();
			} else {
				passwordMessage = res.error || 'Error al actualizar la contraseña';
			}
		} catch {
			passwordMessage = 'Error de red al actualizar la contraseña';
		}
	}

	// Reiniciar formulario al cerrar modal
	function resetFormOnClose() {
		selectedUser = null;
		message = '';
		const form = modal?.querySelector('form');
		if (form) form.reset();
	}

	onMount(() => {
		modal?.addEventListener('close', resetFormOnClose);
	});

	onDestroy(() => {
		modal?.removeEventListener('close', resetFormOnClose);
	});

	// Manejar eliminación
	async function handleDelete() {
		if (!selectedUser) return;

		const dataToSend = new FormData();
		dataToSend.append('user_id', selectedUser.code);

		try {
			const response = await fetch('?/delete', { method: 'POST', body: dataToSend });
			const res = await response.json();
			confirmModal?.close();

			if (res.type === 'success') {
				showToast('Usuario eliminado exitosamente', 'success');
				await invalidate('users:load');
			} else {
				showToast(res.error || 'Error al eliminar el usuario', 'danger');
			}
		} catch {
			showToast('Error de red al eliminar el usuario', 'danger');
		}
	}
</script>

<PageTitle title="Usuarios" description="Lista de usuarios disponibles en la aplicación.">
	<button class="btn btn-primary" onclick={openCreateModal} disabled={!canCreate}
		>Agregar Usuario
	</button>
</PageTitle>

<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
	{#each data.users as user (user.code)}
		{@render userCard(user)}
	{/each}
</div>
<!-- Modal para crear o editar -->
<dialog bind:this={modal} class="modal">
	<div class="modal-box">
		<form onsubmit={handleSubmit} autocomplete="off">
			<h3 class="text-lg font-bold">{isEditing ? 'Editar' : 'Crear'} usuario</h3>
			<fieldset class="fieldset bg-base-200 border border-base-300 p-4 rounded-box">
				<label class="fieldset-legend" for="name">Nombre</label>
				<input
					id="name"
					name="name"
					type="text"
					class="input w-full validator"
					placeholder="Nombre"
					required
					aria-required="true"
				/>
				<label class="fieldset-legend" for="last_name">Apellidos</label>
				<input
					id="last_name"
					name="last_name"
					type="text"
					class="input w-full validator"
					placeholder="Apellidos"
					required
					aria-required="true"
				/>
				<label class="fieldset-legend" for="email">Correo electrónico</label>
				<input
					id="email"
					name="email"
					type="email"
					class="input w-full validator"
					placeholder="Correo electrónico"
					required
					aria-required="true"
				/>
				{#if !isEditing}
					<label class="fieldset-legend" for="password">Contraseña</label>
					<input
						id="password"
						name="password"
						type="password"
						class="input w-full validator"
						placeholder="Contraseña"
						required
						aria-required="true"
					/>
				{/if}
				<div class="mt-4">
					<div class="fieldset-legend mb-2 block">Avatar</div>
					<div class="flex flex-wrap gap-3 justify-center">
						{#each avatars as avatar (avatar.src)}
							<label class="flex flex-col items-center cursor-pointer group">
								<input
									type="radio"
									name="avatar"
									value={avatar.src}
									class="hidden"
									checked={selectedAvatar === avatar.src}
									onchange={() => (selectedAvatar = avatar.src)}
								/>
								<div
									class={`w-16 h-16 rounded-full overflow-hidden border-2 transition-all ${selectedAvatar === avatar.src ? 'border-secondary scale-110' : 'border-base-300 group-hover:border-primary/50'}`}
								>
									<img src={avatar.src} alt={avatar.label} class="w-full h-full object-cover" />
								</div>
							</label>
						{/each}
					</div>
				</div>
			</fieldset>
			{#if message}
				<div class="px-2 mt-2">
					<Message description={message} type="warning" />
				</div>
			{/if}
			<div class="modal-action flex justify-center gap-2">
				<button class="btn btn-error" type="button" onclick={() => modal?.close()}>Cancelar</button>
				<button class="btn btn-primary" type="submit">
					{isEditing ? 'Actualizar' : 'Guardar'}
				</button>
			</div>
		</form>
	</div>
</dialog>

<!-- Modal para confirmar eliminación -->
<dialog bind:this={confirmModal} class="modal">
	<div class="modal-box">
		<h3 class="text-lg font-bold">Confirmar eliminación</h3>
		<p class="py-4">
			¿Estás seguro de eliminar a "{selectedUser?.name}
			{selectedUser?.last_name}"?
		</p>
		<div class="modal-action flex justify-center gap-2">
			<button class="btn" onclick={() => confirmModal?.close()}>Cancelar</button>
			<button class="btn btn-error" onclick={handleDelete}>Eliminar</button>
		</div>
	</div>
</dialog>

<!-- Modal para cambiar contraseña -->
<dialog bind:this={passwordModal} class="modal">
	<div class="modal-box">
		<form onsubmit={handlePasswordUpdate} autocomplete="off">
			<h3 class="text-lg font-bold">Cambiar contraseña</h3>
			<p class="text-sm text-base-content/70 mb-4">
				Establece una nueva contraseña para {selectedUser?.name}
				{selectedUser?.last_name}
			</p>
			<fieldset class="fieldset bg-base-200 border border-base-300 p-4 rounded-box">
				<label class="fieldset-legend" for="new_password">Nueva contraseña</label>
				<input
					id="new_password"
					name="password"
					type="password"
					class="input w-full validator"
					pattern={passwordPattern}
					placeholder="Nueva contraseña"
					required
					aria-required="true"
				/>
				<div class="text-xs text-base-content/60 mt-1 mb-2">
					Mínimo 8 caracteres, al menos 1 mayúscula y 1 número
				</div>
				<label class="fieldset-legend" for="confirm_password">Confirmar contraseña</label>
				<input
					id="confirm_password"
					name="confirm_password"
					type="password"
					class="input w-full validator"
					placeholder="Confirmar contraseña"
					required
					aria-required="true"
				/>
			</fieldset>
			{#if passwordMessage}
				<div class="px-2 mt-2">
					<Message description={passwordMessage} type="warning" />
				</div>
			{/if}
			<div class="modal-action flex justify-center gap-2">
				<button class="btn btn-ghost" type="button" onclick={() => passwordModal?.close()}>
					Cancelar
				</button>
				<button class="btn btn-primary" type="submit">Actualizar contraseña</button>
			</div>
		</form>
	</div>
</dialog>

<!-- Componente modal de permisos -->
{#if selectedUser}
	<PermissionsModal
		user={selectedUser}
		open={showPermissionsModal}
		onClose={() => (showPermissionsModal = false)}
	/>
{/if}

{#snippet userCard(user: Users)}
	<div
		class="card bg-gradient-to-br from-base-200 to-base-100 hover:from-base-100 hover:to-base-200 transition-all duration-300 border border-base-300/50 rounded-xl overflow-hidden group"
	>
		<div class="card-body p-5 space-y-4">
			<div
				class="absolute top-3 right-3 dropdown dropdown-end opacity-0 group-hover:opacity-100 transition-opacity"
			>
				<div tabindex="0" role="button" class="btn btn-ghost btn-xs btn-circle">
					<EllipsisVertical class="w-4 h-4" />
				</div>
				<ul
					class="dropdown-content menu bg-base-200 rounded-box z-10 w-48 p-2 border border-base-300/20"
				>
					{#if canManagePermissions}
						<li>
							<button onclick={() => openPermissionsModal(user)} class="text-xs">
								Gestionar Permisos
							</button>
						</li>
					{/if}
					{#if canDelete}
						<li>
							<button onclick={() => openDeleteConfirmModal(user)} class="text-xs text-error">
								Eliminar
							</button>
						</li>
					{/if}
					{#if mySelf(user.code) || canUpdate}
						<li>
							<button onclick={() => openEditModal(user)} class="text-xs">
								Actualizar Información
							</button>
						</li>
						<li>
							<button onclick={() => openPasswordModal(user)} class="text-xs">
								Cambiar Contraseña
							</button>
						</li>
					{/if}
				</ul>
			</div>
			<!-- Header with avatar and name -->
			<div class="flex items-center gap-4">
				<div class="avatar">
					<div
						class="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center ring-2 ring-primary/20"
					>
						{#if user.photo_url}
							<img
								src={user.photo_url}
								alt="User profile"
								class="object-cover w-full h-full"
								loading="lazy"
							/>
						{:else}
							<span class="text-lg font-bold text-primary">
								{getInitials(user.name || '', user.last_name || '')}
							</span>
						{/if}
					</div>
				</div>

				<div class="flex-1 min-w-0">
					<h3 class="font-bold text-lg text-base-content">
						{user.name}
						{user.last_name}
					</h3>
					<p class="text-sm text-base-content/70 truncate">{user.email}</p>
				</div>
			</div>

			<!-- Stats -->
			<div class="text-sm text-base-content/60 space-y-2">
				<div class="flex items-center gap-2">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
						></path>
					</svg>
					<span>Creado {formatDate(user.created_at)}</span>
				</div>
				<div class="flex items-center gap-2">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
						></path>
					</svg>
					<span>Login {formatDate(user.last_login || '')}</span>
				</div>
			</div>
		</div>
	</div>
{/snippet}
