<script lang="ts">
	import { BASEMAPS } from '$lib/config/basemaps.js';
	
	interface Props {
		currentBasemap: string;
		onSelect: (key: string) => void;
	}

	let { currentBasemap, onSelect }: Props = $props();
</script>

<h3>Basemap</h3>
<div class="options">
	{#each Object.entries(BASEMAPS) as [key, basemap]}
		<button 
			class="option"
			class:selected={currentBasemap === key}
			onclick={() => onSelect(key)}
			aria-label="Select {basemap.name} basemap"
		>
			{basemap.name}
		</button>
	{/each}
</div>

<style>
	h3 {
		margin: 0 0 10px 0;
		font-size: 16px;
		color: #333;
	}

	.options {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.option {
		cursor: pointer;
		padding: 8px 12px;
		border-radius: 4px;
		font-size: 14px;
		background: none;
		border: none;
		text-align: left;
		width: 100%;
		transition: background-color 0.2s ease;
	}

	.option:hover {
		background-color: #f0f0f0;
	}

	.option.selected {
		background-color: #007bff;
		color: #fff;
	}
</style>
