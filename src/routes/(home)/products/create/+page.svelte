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

<div class="max-w-4xl mx-auto">
	<!-- Header Card -->
	<div class="card bg-base-100 border border-base-300 mb-6">
		<div class="card-body">
			<div class="flex items-center gap-4">
				<div class="icon-container icon-container-primary">
					<Package class="w-6 h-6" />
				</div>
				<div>
					<h2 class="text-xl font-semibold text-base-content">Nuevo Producto</h2>
					<p class="text-sm text-base-content/70">
						Completa la información para agregar un producto al catálogo
					</p>
				</div>
			</div>

			{#if form?.error}
				<div class="mt-4">
					<Message description={form.error} type="error" />
				</div>
			{/if}
		</div>
	</div>

	<!-- Form Card -->
	<div class="card bg-base-100 border border-base-300">
		<div class="card-body">
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
				<div class="card card-gradient-neutral">
					<div class="card-body">
						<h3 class="card-title text-lg mb-4">Información básica</h3>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<fieldset class="fieldset">
								<label class="label" for="name">
									<span class="label-text font-medium">Nombre del producto *</span>
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
								<p class="label text-base-content/60">Máximo 100 caracteres</p>
							</fieldset>

							<fieldset class="fieldset">
								<label class="label" for="sku">
									<span class="label-text font-medium">SKU</span>
								</label>
								<input
									id="sku"
									name="sku"
									type="text"
									class="input input-bordered w-full"
									placeholder="Código único del producto"
									maxlength="50"
								/>
								<p class="label text-base-content/60">Código único para identificar el producto</p>
							</fieldset>
						</div>
					</div>
				</div>

				<!-- Descripción -->
				<div class="card card-gradient-neutral">
					<div class="card-body">
						<h3 class="card-title text-lg mb-4">Descripción</h3>
						<fieldset class="fieldset">
							<label class="label" for="description">
								<span class="label-text font-medium">Descripción del producto</span>
							</label>
							<textarea
								id="description"
								name="description"
								class="textarea textarea-bordered w-full"
								placeholder="Describe las características, beneficios y detalles importantes del producto..."
								rows="4"
								maxlength="1000"
							></textarea>
							<p class="label text-base-content/60">Máximo 1000 caracteres</p>
						</fieldset>
					</div>
				</div>

				<!-- Categorización -->
				<div class="card card-gradient-neutral">
					<div class="card-body">
						<h3 class="card-title text-lg mb-4">Categorización</h3>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<fieldset class="fieldset">
								<label class="label" for="brand_code">
									<span class="label-text font-medium">Marca *</span>
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
								<p class="label text-base-content/60">Selecciona la marca del producto</p>
							</fieldset>

							<fieldset class="fieldset">
								<label class="label" for="category_code">
									<span class="label-text font-medium">Categoría *</span>
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
								<p class="label text-base-content/60">Categoría a la que pertenece el producto</p>
							</fieldset>
						</div>
					</div>
				</div>

				<!-- Precio -->
				<div class="card card-gradient-neutral">
					<div class="card-body">
						<h3 class="card-title text-lg mb-4">Precio</h3>
						<div class="max-w-sm">
							<fieldset class="fieldset">
								<label class="label" for="price">
									<span class="label-text font-medium">Precio de venta *</span>
								</label>
								<div class="join w-full">
									<span class="join-item btn btn-disabled">$</span>
									<input
										id="price"
										name="price"
										type="number"
										step="0.01"
										min="0"
										class="input input-bordered join-item flex-1"
										placeholder="0.00"
										required
									/>
								</div>
								<p class="label text-base-content/60">Precio en la moneda local</p>
							</fieldset>
						</div>
					</div>
				</div>

				<!-- Actions -->
				<div class="card bg-base-200/50">
					<div class="card-body">
						<div class="flex flex-col sm:flex-row justify-end gap-3">
							<button
								type="button"
								class="btn btn-ghost"
								onclick={handleCancel}
								disabled={isSubmitting}
							>
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
					</div>
				</div>
			</form>
		</div>
	</div>
</div>
