<!-- src/routes/products/+page.svelte -->
<script lang="ts">
	import { invalidate } from '$app/navigation';
	import Message from '$lib/components/Message.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import Table from '$lib/components/Table.svelte';
	import { showToast } from '$lib/stores/Toast';
	import { Package, Plus, Edit, Trash2, Search } from 'lucide-svelte';
	import { formatDate } from '$lib/utils/formatDate';
	import type { Brands, Categories, ProductImage, ProductsOverview } from '$lib/types';
	import { can } from '$lib/stores/permissions';

	// Use the optimized view type

	// Estados y referencias
	let modal: HTMLDialogElement | null = $state(null);
	let confirmModal: HTMLDialogElement | null = $state(null);
	let isEditing = $state(false);
	let message = $state('');
	let selectedProduct = $state<ProductsOverview | null>(null);

	// Search and filter states
	let searchTerm = $state('');
	let selectedBrand = $state('');
	let selectedCategory = $state('');
	let showInactive = $state(false);
	let sortField = $state<string>('name');
	let sortDirection = $state<'asc' | 'desc'>('asc');

	const { data } = $props<{
		data: {
			products: ProductsOverview[];
			brands: Brands[];
			categories: Categories[];
		};
	}>();

	// Permissions
	let canCreate = $derived(can('products:create'));
	let canUpdate = $derived(can('products:update'));
	let canDelete = $derived(can('products:delete'));

	// Filtered and sorted products
	let filteredProducts = $derived(() => {
		let filtered = data.products.filter((product: ProductsOverview) => {
			const matchesSearch =
				!searchTerm ||
				product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				product.brand_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				product.category_name?.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesBrand = !selectedBrand || product.brand_code === selectedBrand;
			const matchesCategory = !selectedCategory || product.category_code === selectedCategory;
			const matchesActive = showInactive || product.is_active;

			return matchesSearch && matchesBrand && matchesCategory && matchesActive;
		});

		// Simple sorting
		if (sortField && sortDirection) {
			filtered.sort((a: ProductsOverview, b: ProductsOverview) => {
				let aVal = a[sortField as keyof ProductsOverview];
				let bVal = b[sortField as keyof ProductsOverview];

				if (sortField === 'price') {
					aVal = Number(aVal) || 0;
					bVal = Number(bVal) || 0;
				} else {
					aVal = String(aVal).toLowerCase();
					bVal = String(bVal).toLowerCase();
				}

				if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
				if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
				return 0;
			});
		}

		return filtered;
	});

	// Table columns - simplified
	const columns = [
		{
			label: 'Producto',
			class: 'font-medium',
			render: productCell
		},
		{
			key: 'brand_name' as keyof ProductsOverview,
			label: 'Marca',
			class: 'text-sm'
		},
		{
			key: 'category_name' as keyof ProductsOverview,
			label: 'Categoría',
			class: 'text-sm'
		},
		{
			label: 'Precio',
			class: 'font-mono font-medium',
			render: priceCell
		},
		{
			label: 'Estado',
			render: statusCell
		},
		{
			label: 'Creado',
			class: 'text-xs opacity-60',
			render: dateCell
		},
		{
			label: 'Acciones',
			class: 'text-right',
			render: actionsCell
		}
	];

	// Functions
	function openCreateModal() {
		if (!canCreate) return;
		isEditing = false;
		selectedProduct = null;
		message = '';
		modal?.showModal();
	}

	function openEditModal(productCode: string) {
		if (!canUpdate) return;
		const product = data.products.find((p: ProductsOverview) => p.code === productCode);
		if (!product) return;

		isEditing = true;
		selectedProduct = product;
		message = '';
		modal?.showModal();

		// Pre-fill form
		setTimeout(() => {
			const form = modal?.querySelector('form');
			if (form) {
				(form.querySelector('#name') as HTMLInputElement).value = product.name || '';
				(form.querySelector('#description') as HTMLTextAreaElement).value =
					product.description || '';
				(form.querySelector('#brand_code') as HTMLSelectElement).value = product.brand_code || '';
				(form.querySelector('#category_code') as HTMLSelectElement).value =
					product.category_code || '';
				(form.querySelector('#price') as HTMLInputElement).value = String(product.price || 0);
				(form.querySelector('#sku') as HTMLInputElement).value = product.sku || '';
				// Get primary image URL from images array
				const images: ProductImage[] = Array.isArray(product.images)
					? (product.images as unknown as ProductImage[])
					: JSON.parse(JSON.stringify(product.images) || '[]');
				const primaryImage = images.find((img) => img.isPrimary) || images[0];
				(form.querySelector('#image_url') as HTMLInputElement).value = primaryImage?.url || '';
				(form.querySelector('#is_active') as HTMLInputElement).checked = product.is_active || false;
			}
		}, 50);
	}

	function confirmDelete(productCode: string) {
		if (!canDelete) return;
		const product = data.products.find((p: ProductsOverview) => p.code === productCode);
		if (!product) return;

		selectedProduct = product;
		confirmModal?.showModal();
	}

	function clearFilters() {
		searchTerm = '';
		selectedBrand = '';
		selectedCategory = '';
		showInactive = false;
		sortField = 'name';
		sortDirection = 'asc';
	}

	function toggleSort(field: string) {
		if (sortField === field) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortField = field;
			sortDirection = 'asc';
		}
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const formData = new FormData(event.target as HTMLFormElement);

		if (isEditing && selectedProduct && selectedProduct.code) {
			formData.append('code', selectedProduct.code);
		}

		const action = isEditing ? '?/update' : '?/create';

		try {
			const response = await fetch(action, {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (result.type === 'success') {
				showToast('Producto guardado correctamente', 'success');
				modal?.close();
				await invalidate('products:load');
			} else {
				message = result.data?.error || 'Error al guardar producto';
			}
		} catch {
			message = 'Error de conexión';
		}
	}

	async function handleDelete() {
		if (!selectedProduct) return;

		try {
			const formData = new FormData();
			if (selectedProduct.code) {
				formData.append('code', selectedProduct.code);
			}

			const response = await fetch('?/delete', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (result.type === 'success') {
				showToast('Producto eliminado correctamente', 'success');
				confirmModal?.close();
				await invalidate('products:load');
			} else {
				showToast(result.data?.error || 'Error al eliminar producto', 'danger');
			}
		} catch {
			showToast('Error de conexión', 'danger');
		}
	}
</script>

<PageTitle title="Productos" description="Gestiona el catálogo de productos de tu tienda online.">
	<button class="btn btn-primary" onclick={openCreateModal} disabled={!canCreate}>
		<Plus class="w-4 h-4" />
		Nuevo Producto
	</button>
</PageTitle>

<!-- Search and Filters -->
<div class="bg-base-100 rounded-lg border border-base-300 p-4 mb-6">
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
		<!-- Search -->
		<div class="relative">
			<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-50" />
			<input
				type="text"
				placeholder="Buscar productos..."
				class="input input-bordered w-full pl-10"
				bind:value={searchTerm}
			/>
		</div>

		<!-- Brand Filter -->
		<select class="select select-bordered" bind:value={selectedBrand}>
			<option value="">Todas las marcas</option>
			{#each data.brands as brand (brand.code)}
				<option value={brand.code}>{brand.name}</option>
			{/each}
		</select>

		<!-- Category Filter -->
		<select class="select select-bordered" bind:value={selectedCategory}>
			<option value="">Todas las categorías</option>
			{#each data.categories as category (category.code)}
				<option value={category.code}>{category.name}</option>
			{/each}
		</select>

		<!-- Show Inactive -->
		<label class="flex items-center gap-2 cursor-pointer">
			<input type="checkbox" class="checkbox checkbox-sm" bind:checked={showInactive} />
			<span class="text-sm">Mostrar inactivos</span>
		</label>

		<!-- Sort -->
		<div class="flex gap-1">
			<button
				class="btn btn-outline btn-sm"
				onclick={() => toggleSort('name')}
				class:btn-active={sortField === 'name'}
			>
				Nombre {#if sortField === 'name'}{sortDirection === 'asc' ? '↑' : '↓'}{/if}
			</button>
			<button
				class="btn btn-outline btn-sm"
				onclick={() => toggleSort('price')}
				class:btn-active={sortField === 'price'}
			>
				Precio {#if sortField === 'price'}{sortDirection === 'asc' ? '↑' : '↓'}{/if}
			</button>
		</div>

		<!-- Clear Filters -->
		<button class="btn btn-ghost btn-sm" onclick={clearFilters}> Limpiar filtros </button>
	</div>
</div>

<!-- Results Summary -->
<div class="flex items-center justify-between mb-4">
	<div class="text-sm opacity-60">
		Mostrando {filteredProducts.length} de {data.products.length} productos
	</div>
</div>

<!-- Products Table -->
<div class="bg-base-100 rounded-lg border border-base-300 overflow-hidden">
	<Table
		{columns}
		rows={filteredProducts()}
		emptyMessage="No se encontraron productos"
		className="border-0"
	/>
</div>

<!-- Modal para crear/editar -->
<dialog bind:this={modal} class="modal">
	<div class="modal-box max-w-2xl">
		<h3 class="text-lg font-bold mb-4">
			{isEditing ? 'Editar Producto' : 'Nuevo Producto'}
		</h3>

		{#if message}
			<div class="mb-4">
				<Message description={message} type="error" />
			</div>
		{/if}

		<form onsubmit={handleSubmit} class="space-y-6">
			<!-- Información básica -->
			<fieldset
				class="fieldset bg-base-200 border-base-300 rounded-box border grid grid-cols-1 md:grid-cols-2 gap-4"
			>
				<legend class="fieldset-legend">Información básica</legend>

				<div>
					<label for="name">Nombre *</label>
					<input
						id="name"
						name="name"
						type="text"
						class="input w-full"
						placeholder="Nombre del producto"
						required
					/>
				</div>

				<div>
					<label for="sku">SKU</label>
					<input
						id="sku"
						name="sku"
						type="text"
						class="input w-full"
						placeholder="Código del producto"
					/>
				</div>
			</fieldset>

			<!-- Descripción y categorización -->
			<fieldset
				class="fieldset bg-base-200 border-base-300 rounded-box border grid grid-cols-1 md:grid-cols-2 gap-4"
			>
				<legend class="fieldset-legend">Descripción y categorización</legend>

				<div class="md:col-span-2">
					<label for="description">Descripción</label>
					<textarea
						id="description"
						name="description"
						class="textarea w-full"
						placeholder="Descripción del producto"
						rows="3"
					></textarea>
				</div>

				<div>
					<label for="brand_code">Marca *</label>
					<select id="brand_code" name="brand_code" class="select w-full" required>
						<option value="">Seleccionar marca</option>
						{#each data.brands as brand (brand.code)}
							<option value={brand.code}>{brand.name}</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="category_code">Categoría *</label>
					<select id="category_code" name="category_code" class="select w-full" required>
						<option value="">Seleccionar categoría</option>
						{#each data.categories as category (category.code)}
							<option value={category.code}>{category.name}</option>
						{/each}
					</select>
				</div>
			</fieldset>

			<!-- Precio y estado -->
			<fieldset
				class="fieldset bg-base-200 border-base-300 rounded-box border grid grid-cols-1 md:grid-cols-2 gap-4"
			>
				<legend class="fieldset-legend">Precio y estado</legend>

				<div>
					<label for="price">Precio *</label>
					<input
						id="price"
						name="price"
						type="number"
						step="0.01"
						min="0"
						class="input w-full"
						placeholder="0.00"
						required
					/>
				</div>

				{#if isEditing}
					<div class="flex items-center">
						<label class="flex items-center gap-2 cursor-pointer">
							<input id="is_active" name="is_active" type="checkbox" class="checkbox" />
							<span>Producto activo</span>
						</label>
					</div>
				{/if}
			</fieldset>

			<!-- Imagen del producto -->
			<fieldset class="fieldset bg-base-200 border-base-300 rounded-box border">
				<legend class="fieldset-legend">Imagen del producto</legend>

				<div class="space-y-2">
					<label for="image_url">URL de imagen principal</label>
					<div class="relative">
						<input
							id="image_url"
							name="image_url"
							type="url"
							class="input w-full pr-10"
							placeholder="https://ejemplo.com/imagen.jpg"
						/>
						<div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
							<svg
								class="w-5 h-5 text-base-content/40"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"
								></path>
							</svg>
						</div>
					</div>
					<p class="text-sm text-base-content/60">Soporte para múltiples imágenes próximamente</p>
				</div>
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
		<h3 class="text-lg font-bold">Confirmar eliminación</h3>
		<p class="py-4">
			¿Estás seguro de que deseas eliminar el producto
			<strong>{selectedProduct?.name}</strong>? Esta acción no se puede deshacer.
		</p>
		<div class="modal-action">
			<button class="btn" onclick={() => confirmModal?.close()}>Cancelar</button>
			<button class="btn btn-error" onclick={handleDelete}>Eliminar</button>
		</div>
	</div>
</dialog>

{#snippet productCell(product: ProductsOverview)}
	{@const images = Array.isArray(product.images)
		? (product.images as unknown as ProductImage[])
		: (JSON.parse(JSON.stringify(product.images) || '[]') as ProductImage[])}
	{@const primaryImage = images.find((img) => img.isPrimary) || images[0]}

	<div class="flex items-center gap-3">
		{#if primaryImage?.url}
			<div class="avatar">
				<div class="w-12 h-12 rounded-xl">
					<img src={primaryImage.url} alt={primaryImage.alt || product.name} class="object-cover" />
				</div>
			</div>
		{:else}
			<div class="avatar placeholder">
				<div class="w-12 h-12 rounded-xl bg-neutral text-neutral-content">
					<Package class="w-6 h-6" />
				</div>
			</div>
		{/if}
		<div class="min-w-0 flex-1">
			<div class="font-semibold text-base-content truncate">{product.name}</div>
			{#if product.sku}
				<div class="text-sm text-base-content/60 truncate">SKU: {product.sku}</div>
			{/if}
			{#if images.length > 1}
				<div class="text-xs text-primary font-medium">
					+{images.length - 1} imagen{images.length > 2 ? 'es' : ''} más
				</div>
			{/if}
		</div>
	</div>
{/snippet}

{#snippet priceCell(product: ProductsOverview)}
	<span class="font-mono font-medium">${Number(product.price).toFixed(2)}</span>
{/snippet}

{#snippet statusCell(product: ProductsOverview)}
	<div class="badge {product.is_active ? 'badge-success' : 'badge-error'} badge-sm">
		{product.is_active ? 'Activo' : 'Inactivo'}
	</div>
{/snippet}

{#snippet dateCell(product: ProductsOverview)}
	<span class="text-xs opacity-60">{product.created_at ? formatDate(product.created_at) : ''}</span>
{/snippet}

{#snippet actionsCell(product: ProductsOverview)}
	<div class="flex gap-1 justify-end">
		{#if canUpdate && product.code}
			<button class="btn btn-ghost btn-xs" onclick={() => openEditModal(product.code!)}>
				<Edit class="w-3 h-3" />
			</button>
		{/if}
		{#if canDelete && product.code}
			<button class="btn btn-ghost btn-xs text-error" onclick={() => confirmDelete(product.code!)}>
				<Trash2 class="w-3 h-3" />
			</button>
		{/if}
	</div>
{/snippet}
