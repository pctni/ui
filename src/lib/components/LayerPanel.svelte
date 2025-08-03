<script lang="ts">
	import { LAYERS } from '$lib/config/layers.js';
	import { LEGEND_CONFIGS } from '$lib/config/legends.js';
	import Legend from '$lib/components/Legend.svelte';

	let { layerStates, currentNetworkType, currentNetworkColor, onToggleLayer, onNetworkTypeChange, onNetworkColorChange } = $props();

	function getLegendConfig(layerKey) {
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
	{#if key === 'routeNetwork'}
		<div class="layer-section">
			<div class="layer-header">
				<label class="layer-toggle">
					<input 
						type="checkbox" 
						checked={layerStates?.[key] || false}
						onchange={() => onToggleLayer?.(key)}
					/>
					<h4 class="layer-heading">{layer.name}</h4>
				</label>
			</div>
			{#if layerStates?.[key]}
				<div class="network-types">
					<label>
						<input 
							type="radio" 
							name="networkType" 
							value="fast" 
							checked={currentNetworkType === 'fast'}
							onchange={() => onNetworkTypeChange?.('fast')}
						/>
						Fastest
					</label>
					<label>
						<input 
							type="radio" 
							name="networkType" 
							value="quiet" 
							checked={currentNetworkType === 'quiet'}
							onchange={() => onNetworkTypeChange?.('quiet')}
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
						onchange={(e) => onNetworkColorChange?.(e.target.value)}
					>
						<option value="bicycle">Baseline cycling</option>
						<option value="bicycle_govtarget">Government target</option>
						<option value="bicycle_go_dutch">Go Dutch</option>
					</select>
				</div>
				{@const legendConfig = getLegendConfig(key)}
				{#if legendConfig}
					<div class="legend-container">
						<Legend config={legendConfig} />
					</div>
				{/if}
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
			{#if layerStates?.[key]}
				{@const legendConfig = getLegendConfig(key)}
				{#if legendConfig}
					<div class="legend-container">
						<Legend config={legendConfig} />
					</div>
				{/if}
			{/if}
		</div>
	{/if}
{/each}
