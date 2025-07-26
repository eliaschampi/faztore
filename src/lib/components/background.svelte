<!--
	Enhanced Background Component

	Features:
	- Modern gradient nodes with glow effects
	- Smooth animations with configurable speed
	- Interactive mouse/touch response
	- Network-style connections between nodes
	- Performance optimized with selective rendering
	- Theme-aware color integration
	- Configurable animation and interaction modes

	Performance improvements:
	- 60fps animation loop with frame limiting
	- Selective rendering based on mouse proximity
	- Optimized canvas operations
	- Reduced DOM manipulation
-->
<script lang="ts">
	import { onMount } from 'svelte';

	// Props with defaults for modern, performant experience
	const {
		opacity = 0.15,
		maxOpacity = 0.4,
		zIndex = '',
		gridSpacing = 40,
		nodeSize = 1.5,
		sigma = 120,
		animationSpeed = 0.002,
		enableAnimation = true,
		enableInteraction = true
	} = $props();

	let canvas = $state<HTMLCanvasElement | null>(null);
	let ctx = $state<CanvasRenderingContext2D | null>(null);
	let width = $state(0);
	let height = $state(0);
	let mouseX = $state(0);
	let mouseY = $state(0);
	let rgbColor = $state<{ r: number; g: number; b: number } | null>(null);
	let animationFrame = $state<number | null>(null);
	let time = $state(0);
	let nodes = $state<Array<{ x: number; y: number; baseX: number; baseY: number }>>([]);

	// Performance optimizations
	const RENDER_DISTANCE = 300; // Only render nodes within this distance from mouse
	const TARGET_FPS = 60;
	const FRAME_TIME = 1000 / TARGET_FPS;

	onMount(() => {
		setup();
		computeColor();
		generateNodes();

		if (enableAnimation) {
			startAnimation();
		} else {
			render();
		}

		const handleResize = () => {
			setup();
			generateNodes();
			if (!enableAnimation) render();
		};

		const handlePointerMove = (e: MouseEvent | TouchEvent) => {
			if (!enableInteraction) return;

			if (e instanceof MouseEvent) {
				mouseX = e.clientX;
				mouseY = e.clientY;
			} else if (e.touches?.[0]) {
				mouseX = e.touches[0].clientX;
				mouseY = e.touches[0].clientY;
			}
		};

		// Theme change observer for dynamic color updates
		const observer = new MutationObserver(() => {
			computeColor();
		});
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme']
		});

		window.addEventListener('resize', handleResize);
		if (enableInteraction) {
			window.addEventListener('mousemove', handlePointerMove);
			window.addEventListener('touchmove', handlePointerMove);
		}

		return () => {
			if (animationFrame) cancelAnimationFrame(animationFrame);
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('mousemove', handlePointerMove);
			window.removeEventListener('touchmove', handlePointerMove);
			observer.disconnect();
		};
	});

	function setup() {
		if (!canvas) return;
		width = window.innerWidth;
		height = window.innerHeight;
		canvas.width = width;
		canvas.height = height;
		ctx = canvas.getContext('2d');

		// Set canvas rendering optimizations
		if (ctx) {
			ctx.imageSmoothingEnabled = true;
			ctx.imageSmoothingQuality = 'high';
		}
	}

	function computeColor() {
		const primaryColor = getCSSVariable('--color-primary', 'oklch(75% 0.18 130)');
		rgbColor = oklchToRgb(primaryColor);
	}

	function getCSSVariable(varName: string, fallback: string = ''): string {
		if (typeof window === 'undefined') return fallback;
		return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || fallback;
	}

	function generateNodes() {
		nodes = [];
		for (let x = 0; x <= width + gridSpacing; x += gridSpacing) {
			for (let y = 0; y <= height + gridSpacing; y += gridSpacing) {
				nodes.push({
					x,
					y,
					baseX: x,
					baseY: y
				});
			}
		}
	}

	function oklchToRgb(oklch: string): { r: number; g: number; b: number } {
		const defaultColor = { r: 120, g: 220, b: 150 };
		try {
			const tempEl = document.createElement('div');
			tempEl.style.color = oklch;
			document.body.appendChild(tempEl);
			const computedColor = getComputedStyle(tempEl).color;
			document.body.removeChild(tempEl);
			const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
			return rgbMatch
				? {
						r: parseInt(rgbMatch[1], 10),
						g: parseInt(rgbMatch[2], 10),
						b: parseInt(rgbMatch[3], 10)
					}
				: defaultColor;
		} catch {
			return defaultColor;
		}
	}

	function startAnimation() {
		let lastTime = 0;

		const animate = (currentTime: number) => {
			if (currentTime - lastTime >= FRAME_TIME) {
				time += animationSpeed;
				render();
				lastTime = currentTime;
			}
			animationFrame = requestAnimationFrame(animate);
		};

		animationFrame = requestAnimationFrame(animate);
	}

	function render() {
		if (!ctx || !rgbColor) return;

		ctx.clearRect(0, 0, width, height);

		// Performance optimization: only render visible nodes
		const visibleNodes = enableInteraction
			? nodes.filter((node) => {
					const dx = node.x - mouseX;
					const dy = node.y - mouseY;
					return Math.sqrt(dx * dx + dy * dy) < RENDER_DISTANCE;
				})
			: nodes;

		for (const node of visibleNodes) {
			// Apply subtle animation offset if enabled
			let x = node.baseX;
			let y = node.baseY;

			if (enableAnimation) {
				const waveX = Math.sin(time + node.baseX * 0.01) * 2;
				const waveY = Math.cos(time + node.baseY * 0.01) * 2;
				x += waveX;
				y += waveY;
			}

			// Calculate interaction effects
			let nodeOpacity = opacity;
			let nodeRadius = nodeSize;
			let glowIntensity = 0;

			if (enableInteraction) {
				const dx = x - mouseX;
				const dy = y - mouseY;
				const distance = Math.sqrt(dx * dx + dy * dy);
				const falloff = Math.exp(-(distance * distance) / (2 * sigma * sigma));

				nodeOpacity = opacity + (maxOpacity - opacity) * falloff;
				nodeRadius = nodeSize * (0.8 + 0.4 * falloff);
				glowIntensity = falloff;
			}

			// Draw connection lines to nearby nodes (creates network effect)
			if (enableAnimation && glowIntensity > 0.1) {
				drawConnections(x, y, glowIntensity);
			}

			// Draw the node with gradient effect
			drawNode(x, y, nodeRadius, nodeOpacity, glowIntensity);
		}
	}

	function drawNode(
		x: number,
		y: number,
		radius: number,
		nodeOpacity: number,
		glowIntensity: number
	) {
		if (!ctx || !rgbColor) return;

		// Create radial gradient for modern look
		const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);

		// Base color with enhanced brightness for glow
		const baseR = Math.min(255, rgbColor.r + 30 * glowIntensity);
		const baseG = Math.min(255, rgbColor.g + 20 * glowIntensity);
		const baseB = Math.min(255, rgbColor.b + 10 * glowIntensity);

		gradient.addColorStop(0, `rgba(${baseR}, ${baseG}, ${baseB}, ${nodeOpacity})`);
		gradient.addColorStop(0.7, `rgba(${baseR}, ${baseG}, ${baseB}, ${nodeOpacity * 0.6})`);
		gradient.addColorStop(1, `rgba(${baseR}, ${baseG}, ${baseB}, 0)`);

		ctx.fillStyle = gradient;
		ctx.beginPath();
		ctx.arc(x, y, radius * (1 + glowIntensity * 0.5), 0, 2 * Math.PI);
		ctx.fill();
	}

	function drawConnections(x: number, y: number, intensity: number) {
		if (!ctx || !rgbColor || intensity < 0.3) return;

		const connectionDistance = gridSpacing * 1.5;

		for (const otherNode of nodes) {
			const dx = otherNode.x - x;
			const dy = otherNode.y - y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			if (distance > 0 && distance < connectionDistance) {
				const connectionOpacity = intensity * 0.3 * (1 - distance / connectionDistance);

				ctx.strokeStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${connectionOpacity})`;
				ctx.lineWidth = 0.5;
				ctx.beginPath();
				ctx.moveTo(x, y);
				ctx.lineTo(otherNode.x, otherNode.y);
				ctx.stroke();
			}
		}
	}
</script>

<canvas bind:this={canvas} class="absolute inset-0 {zIndex} pointer-events-none" aria-hidden="true">
</canvas>
