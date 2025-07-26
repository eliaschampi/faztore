<script lang="ts">
	interface Props {
		currentPage: number;
		totalPages: number;
		onPageChange: (page: number) => void;
		maxVisiblePages?: number;
		class?: string;
	}

	const {
		currentPage,
		totalPages,
		onPageChange,
		maxVisiblePages = 5,
		class: className = ''
	}: Props = $props();

	// Calculate visible page numbers
	const visiblePages = $derived.by(() => {
		const pages: number[] = [];
		const maxPages = Math.min(maxVisiblePages, totalPages);
		const startPage = Math.max(
			1,
			Math.min(totalPages - maxPages + 1, currentPage - Math.floor(maxPages / 2))
		);

		for (let i = 0; i < maxPages; i++) {
			pages.push(startPage + i);
		}

		return pages;
	});

	function goToPage(page: number) {
		if (page >= 1 && page <= totalPages && page !== currentPage) {
			onPageChange(page);
		}
	}
</script>

{#if totalPages > 1}
	<div class="flex justify-center mt-6 {className}">
		<div class="join">
			<button
				class="join-item btn btn-sm btn-primary btn-soft {currentPage === 1 ? 'btn-disabled' : ''}"
				onclick={() => goToPage(currentPage - 1)}
				disabled={currentPage === 1}
				aria-label="Página anterior"
			>
				«
			</button>

			{#each visiblePages as pageNum (pageNum)}
				<button
					class="join-item btn btn-sm {pageNum === currentPage ? 'btn-primary' : 'btn-soft'}"
					onclick={() => goToPage(pageNum)}
					aria-label="Página {pageNum}"
					aria-current={pageNum === currentPage ? 'page' : undefined}
				>
					{pageNum}
				</button>
			{/each}

			<button
				class="join-item btn btn-sm btn-primary btn-soft {currentPage === totalPages
					? 'btn-disabled'
					: ''}"
				onclick={() => goToPage(currentPage + 1)}
				disabled={currentPage === totalPages}
				aria-label="Página siguiente"
			>
				»
			</button>
		</div>
	</div>
{/if}
