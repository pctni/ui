<script lang="ts">
	import type { LegendConfig } from '$lib/config/legends';

	let { config }: { config: LegendConfig } = $props();
</script>

<div class="legend">
	<h4>{config.description}</h4>
	<div class="items">
		{#if config.type === 'gradient'}
			{#each config.items as item}
				<div class="item">
					<span class="color" style="background-color: {item.color}"></span>
					<span class="label">{item.label}</span>
				</div>
			{/each}
		{:else if config.type === 'categorical'}
			{#each config.items as item}
				<div class="item">
					<span class="color" style="background-color: {item.color}"></span>
					<span class="label">{item.label}</span>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.legend {
		background: #fff;
		padding: 10px;
		border-radius: 4px;
		box-shadow: 0 1px 3px rgba(0,0,0,0.1);
	}
	h4 {
		margin: 0 0 5px 0;
		font-size: 12px;
	}
	.items {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.item {
		display: flex;
		align-items: center;
	}
	.color {
		width: 12px;
		height: 12px;
		margin-right: 5px;
		border: 1px solid #ccc;
	}
	.label {
		font-size: 11px;
	}
</style>
