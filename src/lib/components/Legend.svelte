<script lang="ts">
	import type { LegendConfig } from '$lib/config/legends.js';
	
	interface Props {
		config: LegendConfig;
	}

	let { config }: Props = $props();
</script>

<!-- Simple legend content without box styling -->
<div class="legend-content">
	{#if config.description}
		<p class="legend-description">{config.description}</p>
	{/if}
	
	<div class="legend-items {config.type}">
		{#if config.type === 'gradient'}
			<!-- Gradient legend for continuous data -->
			<div class="gradient-bar">
				{#each config.items as item}
					<div class="gradient-stop" style="background-color: {item.color};"></div>
				{/each}
			</div>
			<div class="gradient-labels">
				<span class="min-label">{config.items[0]?.label || ''}</span>
				<span class="max-label">{config.items[config.items.length - 1]?.label || ''}</span>
			</div>
		{:else}
			<!-- Categorical legend for discrete data -->
			{#each config.items as item}
				<div class="legend-item">
					<div class="color-swatch" style="background-color: {item.color};"></div>
					<span class="item-label">{item.label}</span>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.legend-content {
		margin-top: 8px;
		font-size: 11px;
		color: #333;
	}

	.legend-description {
		margin: 0 0 6px 0;
		font-style: italic;
		color: #666;
		font-size: 10px;
	}

	.legend-items {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.legend-items.gradient {
		gap: 4px;
	}

	.gradient-bar {
		display: flex;
		height: 12px;
		border-radius: 2px;
		overflow: hidden;
		border: 1px solid #ddd;
	}

	.gradient-stop {
		flex: 1;
	}

	.gradient-labels {
		display: flex;
		justify-content: space-between;
		font-size: 9px;
		color: #555;
		margin-top: 2px;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.color-swatch {
		width: 12px;
		height: 12px;
		border-radius: 2px;
		border: 1px solid #ccc;
		flex-shrink: 0;
	}

	.item-label {
		font-size: 10px;
		color: #333;
	}
</style>
