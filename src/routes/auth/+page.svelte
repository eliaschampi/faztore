<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { showToast } from '$lib/stores/Toast';
	import { type ActionResult } from '@sveltejs/kit';
	import { Mail, KeyRound, Eye, EyeOff } from 'lucide-svelte';
	import LogoHead from '$lib/components/LogoHead.svelte';
	import { fade, fly } from 'svelte/transition';

	let isLoading = $state(false);
	let email = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let isFormValid = $derived(email.includes('@') && password.length >= 6);

	const handleSubmit = () => {
		isLoading = true;
		return async ({ result }: { result: ActionResult }) => {
			isLoading = false;
			if (result.type === 'failure') {
				showToast(result.data?.error ?? 'Ocurrió un error', 'danger');
			}
			await applyAction(result);
		};
	};
</script>

<div class="w-full max-w-sm mx-auto" in:fade={{ duration: 300, delay: 150 }}>
	<div class="card bg-gradient-to-b from-base-100/90 to-base-200/80 backdrop-blur p-4">
		<LogoHead />

		<form
			action="?/login"
			method="POST"
			use:enhance={handleSubmit}
			class="card-body gap-6 pt-2"
			autocomplete="off"
			novalidate
		>
			<!-- Email Input -->
			<div in:fly={{ y: 10, duration: 300, delay: 200 }} class="form-control">
				<label for="email">
					<span class="label-text">Correo electrónico</span>
				</label>
				<label
					class="input input-bordered input-lg flex items-center gap-2 bg-base-200/50 hover:border-primary/30 focus-within:border-primary transition-all duration-200"
				>
					<Mail class="text-base-content/40 size-5" />
					<input
						id="email"
						type="email"
						name="email"
						bind:value={email}
						class="grow bg-transparent outline-none"
						placeholder="tu@correo.com"
						required
					/>
				</label>
			</div>

			<!-- Password Input -->
			<div in:fly={{ y: 10, duration: 300, delay: 300 }} class="form-control">
				<label for="password">
					<span class="label-text">Contraseña</span>
				</label>
				<label
					class="input input-bordered input-lg flex items-center gap-2 bg-base-200/50 hover:border-primary/30 focus-within:border-primary transition-all duration-200"
				>
					<KeyRound class="text-base-content/40 size-5" />
					<input
						id="password"
						type={showPassword ? 'text' : 'password'}
						name="password"
						bind:value={password}
						class="grow bg-transparent outline-none"
						placeholder="••••••••"
						required
					/>
					<button
						type="button"
						class="text-base-content/40 hover:text-primary focus:text-primary transition-colors duration-200"
						onclick={() => (showPassword = !showPassword)}
						aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
					>
						{#if showPassword}
							<EyeOff size={18} />
						{:else}
							<Eye size={18} />
						{/if}
					</button>
				</label>
			</div>

			<!-- Submit Button -->
			<button
				type="submit"
				class="btn btn-primary btn-lg w-full mt-2 group relative overflow-hidden"
				disabled={isLoading || !isFormValid}
				in:fly={{ y: 10, duration: 300, delay: 400 }}
			>
				<span
					class="absolute inset-0 w-0 bg-primary-content/10 group-hover:w-full group-focus:w-full transition-all duration-500 ease-out"
				></span>
				<span class="relative flex items-center justify-center">
					{#if isLoading}
						<span class="loading loading-spinner loading-sm"></span>
						<span class="ml-2">Procesando...</span>
					{:else}
						Iniciar sesión
					{/if}
				</span>
			</button>
		</form>
	</div>
</div>
