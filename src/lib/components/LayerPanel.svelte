<script lang="ts">
	import { LAYERS } from '$lib/config/layers.js';
	import { LEGEND_CONFIGS } from '$lib/config/legends.js';
	import Legend from '$lib/components/Legend.svelte';

	let {
		layerStates,
		currentNetworkType,
		currentNetworkColor,
		onToggleLayer,
		onNetworkTypeChange,
		onNetworkColorChange
	} = $props();

	function getLegendConfig(layerKey: string) {
		if (!LEGEND_CONFIGS[layerKey]) return null;

		const legendConfig = LEGEND_CONFIGS[layerKey];
		if (typeof legendConfig === 'function') {
			return legendConfig(currentNetworkType, currentNetworkColor);
		} else {
			return legendConfig;
		}
	}
</script>

{#each Object.entries(LAYERS) as [key, layer]}
	{@const legendConfig = getLegendConfig(key)}
	{#if key === 'routeNetwork'}
		<div class="layer-section">
			<h4 class="layer-heading">{layer.name}</h4>
			<div class="network-types">
				<label>
					<input
						type="checkbox"
						checked={currentNetworkType === 'fast'}
						onchange={() => onNetworkTypeChange?.(currentNetworkType === 'fast' ? '' : 'fast')}
					/>
					Fastest
				</label>
				<label>
					<input
						type="checkbox"
						checked={currentNetworkType === 'quiet'}
						onchange={() => onNetworkTypeChange?.(currentNetworkType === 'quiet' ? '' : 'quiet')}
					/>
					Quietest
				</label>
			</div>
			<div class="color-section">
				<label class="color-label" for="network-color-select">Colour:</label>
				<select
					id="network-color-select"
					class="color-dropdown"
					value={currentNetworkColor || 'bicycle'}
					onchange={(e) => onNetworkColorChange?.((e.target as HTMLSelectElement).value)}
				>
					<option value="bicycle">Baseline cycling</option>
					<option value="bicycle_govtarget">Government target</option>
					<option value="bicycle_go_dutch">Go Dutch</option>
				</select>
			</div>
			{#if legendConfig && (currentNetworkType === 'fast' || currentNetworkType === 'quiet')}
				<div class="legend-container">
					<Legend config={legendConfig} />
				</div>
			{/if}
		</div>
	{:else}
		<div class="option">
			<label>
				<input
					type="checkbox"
					checked={layerStates?.[key] || false}
					onchange={() => onToggleLayer?.(key)}
				/>
				{layer.name}
			</label>
			{#if layerStates?.[key] && legendConfig}
				<div class="legend-container">
					<Legend config={legendConfig} />
				</div>
			{/if}
		</div>
	{/if}
{/each}

<style>
	.layer-section {
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.layer-heading {
		margin: 0 0 0.75rem 0;
		font-size: 1rem;
		font-weight: 600;
		color: #374151;
	}

	.network-types {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.network-types label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: #4b5563;
		cursor: pointer;
	}

	.network-types input[type='checkbox'] {
		margin: 0;
	}

	.color-section {
		margin-bottom: 1rem;
	}

	.color-label {
		display: block;
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
	}

	.color-dropdown {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		background-color: white;
	}

	.color-dropdown:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.option {
		margin-bottom: 1rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid #f3f4f6;
	}

	.option:last-child {
		border-bottom: none;
		margin-bottom: 0;
		padding-bottom: 0;
	}

	.option label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: #374151;
		cursor: pointer;
		margin-bottom: 0.5rem;
	}

	.option input[type='checkbox'] {
		margin: 0;
	}

	.legend-container {
		margin-top: 0.75rem;
		padding: 0.75rem;
		background-color: #f9fafb;
		border-radius: 0.375rem;
		border: 1px solid #e5e7eb;
	}
</style>
