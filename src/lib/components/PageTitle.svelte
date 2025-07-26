<!-- PageHeader.svelte -->
<script lang="ts">
	let { children, title, description } = $props();
</script>

<div class="header-container relative w-full flex justify-center items-center py-8 overflow-hidden">
	<!-- SVG Background Pattern with Animation (minimalist wave-like effect) -->
	<svg
		class="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
		viewBox="0 0 1440 320"
		preserveAspectRatio="none"
	>
		<path
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-opacity="0.1"
			d="M0,160 C320,300 720,0 1440,160"
			class="wave-path"
		/>
		<path
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-opacity="0.1"
			d="M0,200 C400,50 800,350 1440,200"
			class="wave-path wave-path-delay"
		/>
	</svg>

	<div
		class="card w-full max-w-xl glass bg-base-100/50 backdrop-blur-md shadow transition-all duration-500 hover:scale-102"
	>
		<div class="card-body text-center space-y-3 p-6">
			<h1 class="text-2xl font-bold animate-fade-in-up" aria-label="Page Title">
				{title}
			</h1>
			<p
				class="text-description animate-fade-in-up animation-delay-200"
				aria-label="Page Description"
			>
				{description}
			</p>
			<div class="flex justify-center">
				{@render children?.()}
			</div>
		</div>
	</div>
</div>
<div class="divider my-0 opacity-50"></div>

<style>
	/* Enhanced Text Description (DaisyUI-compatible) */
	.text-description {
		color: color-mix(in oklch, var(--color-base-content), transparent 25%);
	}

	/* Background Pattern with Radial Gradients and Pulse Animation */
	.header-container::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background:
			radial-gradient(
				circle at 20% 30%,
				color-mix(in oklch, var(--color-primary), transparent 75%),
				transparent 50%
			),
			radial-gradient(
				circle at 80% 70%,
				color-mix(in oklch, var(--color-accent), transparent 75%),
				transparent 50%
			);
		filter: blur(40px);
		animation: pulse 8s infinite ease-in-out;
		will-change: transform;
	}

	/* SVG Wave Animation (mimics animated SVG paths) */
	.wave-path {
		animation: wave 10s infinite linear;
	}
	.wave-path-delay {
		animation-delay: 2s;
	}

	@keyframes wave {
		0% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(-1440px); /* Full width cycle for seamless loop */
		}
	}

	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
			opacity: 0.8;
		}
		50% {
			transform: scale(1.05);
			opacity: 1;
		}
	}

	/* Entrance Animations (Tailwind-inspired, with delays) */
	.animate-fade-in-up {
		animation: fade-in-up 0.6s ease-out forwards;
		opacity: 0;
		transform: translateY(20px);
	}
	.animation-delay-200 {
		animation-delay: 0.2s;
	}

	@keyframes fade-in-up {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Responsive Adjustments (Tailwind breakpoints) */
	@media (max-width: 640px) {
		.card {
			max-width: 100%;
			padding: 1rem;
		}
		h1 {
			font-size: 2rem;
		}
	}
</style>
