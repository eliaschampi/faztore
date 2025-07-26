<script lang="ts">
	import type { Snippet } from 'svelte';

	interface TableColumn<T> {
		key?: keyof T;
		label: string;
		headerClass?: string;
		class?: string;
		render?: Snippet<[T]>;
	}

	const {
		columns,
		rows,
		emptyMessage = 'Sin datos para mostrar.',
		bordered = true,
		striped = true,
		compact = false,
		hover = true,
		className = ''
	} = $props<{
		columns: TableColumn<any>[]; // eslint-disable-line @typescript-eslint/no-explicit-any
		// TODO: Fix this type
		rows: unknown[];
		emptyMessage?: string;
		bordered?: boolean;
		striped?: boolean;
		compact?: boolean;
		hover?: boolean;
		className?: string;
	}>();
</script>

<div class={`overflow-x-auto rounded-lg ${className}`}>
	<table
		class={`table w-full
			${striped ? 'table-zebra' : ''}
			${compact ? 'table-xs' : 'table-sm'}
			${bordered ? 'border border-base-300/30' : ''}
			${hover ? 'hover' : ''}
			bg-base-100/50`}
	>
		<thead class="bg-base-200/70">
			<tr>
				{#each columns as col (col.label)}
					<th class={`${col.headerClass || ''}`}>{col.label}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#if rows.length === 0}
				<tr>
					<td colspan={columns.length} class="text-center py-8 opacity-50">{emptyMessage}</td>
				</tr>
			{:else}
				{#each rows as row (row)}
					<tr class="transition-colors border-b border-base-300 last:border-b-0">
						{#each columns as col (col.label)}
							<td class={`${col.class || ''}`}>
								{#if col.render}
									{@render col.render(row)}
								{:else if col.key}
									{row[col.key] ?? '—'}
								{:else}
									—
								{/if}
							</td>
						{/each}
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

<style>
	.table th,
	.table td {
		vertical-align: middle;
	}
</style>
