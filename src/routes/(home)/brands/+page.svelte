<!-- src/routes/brands/+page.svelte -->
<script lang="ts">
	import { invalidate } from '$app/navigation';
	import Message from '$lib/components/Message.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import { showToast } from '$lib/stores/Toast';
	import { EllipsisVertical, Award, Plus, Edit, Trash2 } from 'lucide-svelte';
	import { formatDate } from '$lib/utils/formatDate';
	import { validateBrandCreationSafe, validateBrandUpdateSafe } from '$lib/schemas/brand';
	import type { Brands } from '$lib/types';
	import { can } from '$lib/stores/permissions';

	// Estados y referencias
	let modal: HTMLDialogElement | null = $state(null);
	let confirmModal: HTMLDialogElement | null = $state(null);
	let isEditing = $state(false);
	let message = $state('');
	let selectedBrand = $state<Brands | null>(null);

	const { data } = $props<{ data: { brands: Brands[] } }>();

	// Permissions - using Svelte 5 reactive approach
	let canCreate = $derived(can('brands:create'));
	let canUpdate = $derived(can('brands:update'));
	let canDelete = $derived(can('brands:delete'));

	// Abrir modal para crear
	function openCreateModal() {
		if (!canCreate) {
			return;
		}
		isEditing = false;
		selectedBrand = null;
		message = '';
		modal?.showModal();
	}

	// Abrir modal para editar
	function openEditModal(brand: Brands) {
		if (!canUpdate) {
			return;
		}
		isEditing = true;
		selectedBrand = brand;
		message = '';
		modal?.showModal();

		// Pre-fill form
		const nameInput = modal?.querySelector<HTMLInputElement>('#name');
		const descriptionInput = modal?.querySelector<HTMLTextAreaElement>('#description');
		if (nameInput) nameInput.value = brand.name || '';
		if (descriptionInput) descriptionInput.value = brand.description || '';
	}

	// Validar formulario
	function validateForm(formData: FormData): boolean {
		const name = formData.get('name')?.toString().trim() || '';
		const description = formData.get('description')?.toString().trim() || '';

		const validation = isEditing
			? validateBrandUpdateSafe({ name, description })
			: validateBrandCreationSafe({ name, description });

		if (!validation.isValid) {
			message = validation.error || 'Error de validación';
			return false;
		}

		message = '';
		return true;
	}

	// Enviar datos (crear o editar)
	async function handleSubmit(event: Event) {
		event.preventDefault();

		const formElement = event.currentTarget as HTMLFormElement;
		const dataToSend = new FormData(formElement);
		const action: 'create' | 'update' = isEditing ? 'update' : 'create';

		if (isEditing && selectedBrand) {
			dataToSend.append('code', selectedBrand.code);
		}

		if (!validateForm(dataToSend)) return;

		try {
			const response = await fetch(`?/${action}`, { method: 'POST', body: dataToSend });
			const res = await response.json();

			if (res.type === 'success') {
				showToast(`${isEditing ? 'Marca actualizada' : 'Marca creada'} exitosamente`, 'success');
				await invalidate('brands:load');
				modal?.close();
				isEditing = false;
			} else {
				message = `Ocurrió un error al ${isEditing ? 'actualizar' : 'crear'} la marca`;
			}
		} catch {
			message = `Ocurrió un error al ${isEditing ? 'actualizar' : 'crear'} la marca`;
		}
	}

	// Confirmar eliminación
	function confirmDelete(brand: Brands) {
		if (!canDelete) {
			return;
		}
		selectedBrand = brand;
		confirmModal?.showModal();
	}

	// Eliminar marca
	async function handleDelete() {
		if (!selectedBrand) return;

		try {
			const formData = new FormData();
			formData.append('code', selectedBrand.code);

			const response = await fetch('?/delete', { method: 'POST', body: formData });
			const res = await response.json();

			if (res.type === 'success') {
				showToast('Marca eliminada exitosamente', 'success');
				await invalidate('brands:load');
				confirmModal?.close();
			} else {
				showToast('Error eliminando marca', 'danger');
			}
		} catch {
			showToast('Error eliminando marca', 'danger');
		}
	}
</script>

<PageTitle
	title="Marcas"
	description="Aquí encontrarás todas las marcas disponibles en la aplicación."
>
	<button class="btn btn-primary" onclick={openCreateModal} disabled={!canCreate}>
		<Plus class="w-4 h-4" />
		Añadir
	</button>
</PageTitle>

<div class="space-y-4 p-4">
	{#each data.brands as brand (brand.code)}
		{@render brandItem(brand)}
	{/each}

	{#if data.brands.length === 0}
		<div class="empty-state">
			<div class="empty-state-icon">
				<Award size={48} />
			</div>
			<div class="empty-state-title">No hay marcas</div>
			<div class="empty-state-message">
				{#if canCreate}
					Comienza creando tu primera marca
				{:else}
					No tienes permisos para ver marcas
				{/if}
			</div>
		</div>
	{/if}
</div>

{#snippet brandItem(item: Brands)}
	<div
		class="rounded-box bg-base-200 py-3 px-4 hover:bg-base-300 transition-colors text-left relative"
	>
		<div class="flex items-center justify-between">
			<div class="flex-1">
				<div class="font-medium text-base-content">{item.name}</div>
				<div class="text-sm text-base-content/70">
					{item.description || 'Sin descripción'} • Creada {formatDate(item.created_at)}
				</div>
			</div>
			<div class="flex items-center gap-1">
				{#if item.created_at}
					<div class="badge badge-soft badge-primary">
						{new Date(item.created_at).getFullYear()}
					</div>
				{/if}
				<div class="divider divider-horizontal"></div>
				<div class="dropdown dropdown-end">
					<div tabindex="0" role="button" class="m-1 cursor-pointer">
						<EllipsisVertical class="w-4 h-4" />
					</div>
					<ul
						class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow border border-base-300"
					>
						{#if canUpdate}
							<li>
								<button onclick={() => openEditModal(item)} class="flex gap-3 py-2.5">
									<Edit class="h-4 w-4 text-info" />Editar
								</button>
							</li>
						{/if}
						{#if canDelete}
							<li>
								<button onclick={() => confirmDelete(item)} class="flex gap-3 py-2.5 text-error">
									<Trash2 class="h-4 w-4" />Eliminar
								</button>
							</li>
						{/if}
					</ul>
				</div>
			</div>
		</div>
	</div>
{/snippet}

<!-- Modal para crear/editar -->
<dialog bind:this={modal} class="modal">
	<div class="modal-box">
		<h3 class="text-lg font-bold mb-4">
			{isEditing ? 'Editar Marca' : 'Nueva Marca'}
		</h3>

		{#if message}
			<div class="mb-4">
				<Message description={message} type="error" />
			</div>
		{/if}

		<form onsubmit={handleSubmit} class="space-y-4">
			<fieldset class="fieldset bg-base-200 border-base-300 rounded-box border p-4">
				<legend class="fieldset-legend">Nombre *</legend>
				<input
					id="name"
					name="name"
					type="text"
					class="input w-full"
					placeholder="Nombre de la marca"
					required
					maxlength="100"
				/>
				<p class="input-hint">El nombre debe ser único y descriptivo</p>
			</fieldset>

			<fieldset class="fieldset bg-base-200 border-base-300 rounded-box border p-4">
				<legend class="fieldset-legend">Descripción</legend>
				<textarea
					id="description"
					name="description"
					class="textarea w-full"
					placeholder="Descripción de la marca (opcional)"
					rows="3"
					maxlength="500"
				></textarea>
				<p class="input-hint">Descripción opcional para explicar el propósito de la marca</p>
			</fieldset>

			<div class="modal-action">
				<button type="button" class="btn" onclick={() => modal?.close()}>Cancelar</button>
				<button type="submit" class="btn btn-primary">
					{isEditing ? 'Actualizar' : 'Crear'}
				</button>
			</div>
		</form>
	</div>
</dialog>

<!-- Modal de confirmación para eliminar -->
<dialog bind:this={confirmModal} class="modal">
	<div class="modal-box">
		<h3 class="text-lg font-bold mb-4">Confirmar eliminación</h3>
		<p class="mb-4">
			¿Estás seguro de que deseas eliminar la marca
			<strong>{selectedBrand?.name}</strong>?
		</p>
		<div class="modal-action">
			<button type="button" class="btn" onclick={() => confirmModal?.close()}>Cancelar</button>
			<button type="button" class="btn btn-error" onclick={handleDelete}>Eliminar</button>
		</div>
	</div>
</dialog>
