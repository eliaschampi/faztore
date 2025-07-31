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
	<button class="btn btn-ghost" onclick={handleCancel}>
		<ArrowLeft class="w-4 h-4" />
		Volver
	</button>
</PageTitle>

<div class="max-w-4xl mx-auto p-6">
	<div class="bg-base-100 rounded-lg border border-base-300 p-6">
		<div class="flex items-center gap-3 mb-6">
			<div class="avatar placeholder">
				<div class="w-12 h-12 rounded-xl bg-primary text-primary-content">
					<Package class="w-6 h-6" />
				</div>
			</div>
			<div>
				<h2 class="text-xl font-semibold">Nuevo Producto</h2>
				<p class="text-sm text-base-content/70">Información básica del producto</p>
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
			<fieldset class="fieldset bg-base-200 border-base-300 rounded-box border p-4">
				<legend class="fieldset-legend">Información básica</legend>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label class="label" for="name">
							<span class="label-text">Nombre *</span>
						</label>
						<input
							id="name"
							name="name"
							type="text"
							class="input input-bordered w-full"
							placeholder="Nombre del producto"
							required
							maxlength="100"
						/>
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
							placeholder="Código del producto"
							maxlength="50"
						/>
					</div>
				</div>
			</fieldset>

			<!-- Descripción -->
			<fieldset class="fieldset bg-base-200 border-base-300 rounded-box border p-4">
				<legend class="fieldset-legend">Descripción</legend>
				<div>
					<label class="label" for="description">
						<span class="label-text">Descripción del producto</span>
					</label>
					<textarea
						id="description"
						name="description"
						class="textarea textarea-bordered w-full"
						placeholder="Describe las características del producto..."
						rows="4"
						maxlength="1000"
					></textarea>
				</div>
			</fieldset>

			<!-- Categorización -->
			<fieldset class="fieldset bg-base-200 border-base-300 rounded-box border p-4">
				<legend class="fieldset-legend">Categorización</legend>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label class="label" for="brand_code">
							<span class="label-text">Marca *</span>
						</label>
						<select id="brand_code" name="brand_code" class="select select-bordered w-full" required>
							<option value="">Seleccionar marca</option>
							{#each data.brands as brand (brand.code)}
								<option value={brand.code}>{brand.name}</option>
							{/each}
						</select>
					</div>

					<div>
						<label class="label" for="category_code">
							<span class="label-text">Categoría *</span>
						</label>
						<select id="category_code" name="category_code" class="select select-bordered w-full" required>
							<option value="">Seleccionar categoría</option>
							{#each data.categories as category (category.code)}
								<option value={category.code}>{category.name}</option>
							{/each}
						</select>
					</div>
				</div>
			</fieldset>

			<!-- Precio -->
			<fieldset class="fieldset bg-base-200 border-base-300 rounded-box border p-4">
				<legend class="fieldset-legend">Precio</legend>
				<div class="max-w-sm">
					<label class="label" for="price">
						<span class="label-text">Precio *</span>
					</label>
					<div class="relative">
						<span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/70">$</span>
						<input
							id="price"
							name="price"
							type="number"
							step="0.01"
							min="0"
							class="input input-bordered w-full pl-8"
							placeholder="0.00"
							required
						/>
					</div>
				</div>
			</fieldset>

			<!-- Actions -->
			<div class="flex justify-end gap-3 pt-4">
				<button type="button" class="btn btn-ghost" onclick={handleCancel} disabled={isSubmitting}>
					Cancelar
				</button>
				<button type="submit" class="btn btn-primary" disabled={isSubmitting}>
					{#if isSubmitting}
						<span class="loading loading-spinner loading-sm"></span>
						Creando...
					{:else}
						Crear Producto
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>
