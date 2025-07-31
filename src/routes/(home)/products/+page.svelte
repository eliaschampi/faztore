<!-- src/routes/products/+page.svelte -->
<script lang="ts">
	import { invalidate, goto } from '$app/navigation';

	import PageTitle from '$lib/components/PageTitle.svelte';
	import Table from '$lib/components/Table.svelte';
	import { showToast } from '$lib/stores/Toast';
	import { Package, Plus, Trash2, Search } from 'lucide-svelte';
	import { formatDate } from '$lib/utils/formatDate';
	import type { ProductImage, ProductsOverview } from '$lib/types';
	import { can } from '$lib/stores/permissions';

	// Use the optimized view type

	// Estados y referencias
	let confirmModal: HTMLDialogElement | null = $state(null);
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
		};
	}>();

	// Permissions
	let canCreate = $derived(can('products:create'));
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
		goto('/products/create');
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
		{#if canDelete && product.code}
			<button class="btn btn-ghost btn-xs text-error" onclick={() => confirmDelete(product.code!)}>
				<Trash2 class="w-3 h-3" />
			</button>
		{/if}
	</div>
{/snippet}
