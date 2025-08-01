<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import Message from '$lib/components/Message.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import { showToast } from '$lib/stores/Toast';
	import { ArrowLeft, Package } from 'lucide-svelte';
	import type { Brands, Categories } from '$lib/types';

	const { data, form } = $props<{
		data: {
			brands: Brands[];
			categories: Categories[];
			title: string;
		};
		form?: {
			error?: string;
		};
	}>();

	let isSubmitting = $state(false);

	function handleCancel() {
		goto('/products');
	}
</script>

<PageTitle title={data.title} description="Completa la información para crear un nuevo producto.">
	<button class="btn btn-ghost gap-2" onclick={handleCancel}>
		<ArrowLeft class="w-4 h-4" />
		Volver
	</button>
</PageTitle>

<!-- Form Container -->
<div class="card">
	<div class="card-body">
		<!-- Header -->
		<div class="flex items-center gap-4 mb-6">
			<div class="icon-container icon-container-primary">
				<Package class="w-6 h-6" />
			</div>
			<div>
				<h2 class="text-xl font-semibold">Nuevo Producto</h2>
				<p class="text-sm opacity-70">
					Completa la información para agregar un producto al catálogo
				</p>
			</div>
		</div>

		{#if form?.error}
			<div class="mb-6">
				<Message description={form.error} type="error" />
			</div>
		{/if}

		<form
			method="POST"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ result }) => {
					isSubmitting = false;
					if (result.type === 'redirect') {
						showToast('Producto creado exitosamente', 'success');
					}
				};
			}}
			class="space-y-6"
		>
			<!-- Información básica -->
			<fieldset class="fieldset bg-base-200">
				<legend class="fieldset-legend">Información básica</legend>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label class="label" for="name">
							<span class="label-text">Nombre del producto *</span>
						</label>
						<input
							id="name"
							name="name"
							type="text"
							class="input input-bordered w-full"
							placeholder="Ingresa el nombre del producto"
							required
							maxlength="100"
						/>
						<p class="label">Máximo 100 caracteres</p>
					</div>

					<div>
						<label class="label" for="sku">
							<span class="label-text">SKU</span>
						</label>
						<input
							id="sku"
							name="sku"
							type="text"
							class="input input-bordered w-full"
							placeholder="Código único del producto"
							maxlength="50"
						/>
						<p class="label">Código único para identificar el producto</p>
					</div>
				</div>
			</fieldset>

			<!-- Descripción -->
			<fieldset class="fieldset bg-base-200">
				<legend class="fieldset-legend">Descripción</legend>
				<div>
					<label class="label" for="description">
						<span class="label-text">Descripción del producto</span>
					</label>
					<textarea
						id="description"
						name="description"
						class="textarea textarea-bordered w-full"
						placeholder="Describe las características, beneficios y detalles importantes del producto..."
						rows="4"
						maxlength="1000"
					></textarea>
					<p class="label">Máximo 1000 caracteres</p>
				</div>
			</fieldset>

			<!-- Categorización -->
			<fieldset class="fieldset bg-base-200">
				<legend class="fieldset-legend">Categorización</legend>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label class="label" for="brand_code">
							<span class="label-text">Marca *</span>
						</label>
						<select
							id="brand_code"
							name="brand_code"
							class="select select-bordered w-full"
							required
						>
							<option value="">Seleccionar marca</option>
							{#each data.brands as brand (brand.code)}
								<option value={brand.code}>{brand.name}</option>
							{/each}
						</select>
						<p class="label">Selecciona la marca del producto</p>
					</div>

					<div>
						<label class="label" for="category_code">
							<span class="label-text">Categoría *</span>
						</label>
						<select
							id="category_code"
							name="category_code"
							class="select select-bordered w-full"
							required
						>
							<option value="">Seleccionar categoría</option>
							{#each data.categories as category (category.code)}
								<option value={category.code}>{category.name}</option>
							{/each}
						</select>
						<p class="label">Categoría a la que pertenece el producto</p>
					</div>
				</div>
			</fieldset>

			<!-- Precio -->
			<fieldset class="fieldset bg-base-200">
				<legend class="fieldset-legend">Precio</legend>
				<div class="max-w-sm">
					<label class="label" for="price">
						<span class="label-text">Precio de venta *</span>
					</label>
					<label class="input input-bordered flex items-center gap-2">
						<span>$</span>
						<input
							id="price"
							name="price"
							type="number"
							step="0.01"
							min="0"
							class="grow"
							placeholder="0.00"
							required
						/>
					</label>
					<p class="label">Precio en la moneda local</p>
				</div>
			</fieldset>

			<!-- Actions -->
			<div class="flex flex-col sm:flex-row justify-end gap-3 pt-4">
				<button type="button" class="btn btn-ghost" onclick={handleCancel} disabled={isSubmitting}>
					Cancelar
				</button>
				<button type="submit" class="btn btn-primary" disabled={isSubmitting}>
					{#if isSubmitting}
						<span class="loading loading-spinner loading-sm"></span>
						Creando producto...
					{:else}
						<Package class="w-4 h-4" />
						Crear Producto
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>
