<script lang="ts">
	import { BASEMAPS } from '$lib/config/basemaps.js';
	import { LAYERS } from '$lib/config/layers.js';
	import { LEGEND_CONFIGS } from '$lib/config/legends.js';
	import Legend from '$lib/components/Legend.svelte';
	import type { LegendConfig } from '$lib/config/legends.js';

	type ControlType = 'basemap' | 'layers';
	type Position = 'left' | 'right';

	interface Props {
		controlType: ControlType;
		showPanel: boolean;
		onToggle: () => void;
		title: string;
		position: Position;
		
		// Basemap props
		currentBasemap?: string;
		onBasemapSelect?: (key: string) => void;
		
		// Layers props
		layerStates?: Record<string, boolean>;
		currentNetworkType?: string;
		currentNetworkColor?: string;
		onToggleLayer?: (key: string) => void;
		onNetworkTypeChange?: (type: string) => void;
		onNetworkColorChange?: (color: string) => void;
	}

	let { 
		controlType,
		showPanel, 
		onToggle, 
		title, 
		position,
		currentBasemap,
		onBasemapSelect,
		layerStates,
		currentNetworkType,
		currentNetworkColor,
		onToggleLayer,
		onNetworkTypeChange,
		onNetworkColorChange
	}: Props = $props();

	function handleBasemapSelect(key: string) {
		onBasemapSelect?.(key);
		onToggle(); // Close panel after selection
	}

	function handleLayerToggle(key: string) {
		onToggleLayer?.(key);
		// Note: We don't auto-close the panel for layer selections
		// to allow users to toggle multiple layers
	}

	// Get legend config for a layer
	function getLegendConfig(layerKey: string): LegendConfig | null {
		if (!LEGEND_CONFIGS[layerKey]) return null;
		
		const legendConfig = LEGEND_CONFIGS[layerKey];
		if (typeof legendConfig === 'function') {
			// Route network legend that depends on network type and color
			return legendConfig(currentNetworkType, currentNetworkColor);
		} else {
			// Static legend config
			return legendConfig;
		}
	}
</script>

<div class="control-panel {position}" class:expanded={showPanel}>
	<button 
		class="panel-header" 
		{title}
		aria-label={title}
		onclick={onToggle}
	>
		{#if position === 'left'}
			<!-- Basemap icon -->
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
				<path d="M7.765 1.559a.5.5 0 0 1 .47 0l7.5 4a.5.5 0 0 1 0 .882l-7.5 4a.5.5 0 0 1-.47 0l-7.5-4a.5.5 0 0 1 0-.882z"/>
				<path d="m2.125 8.567-1.86.992a.5.5 0 0 0 0 .882l7.5 4a.5.5 0 0 0 .47 0l7.5-4a.5.5 0 0 0 0-.882l-1.86-.992-5.17 2.756a1.5 1.5 0 0 1-1.41 0z"/>
			</svg>
		{:else}
			<span>{title}</span>
			<svg 
				xmlns="http://www.w3.org/2000/svg" 
				width="12" 
				height="12" 
				fill="currentColor" 
				viewBox="0 0 16 16"
				class="arrow-icon"
				class:rotated={showPanel}
			>
				<path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
			</svg>
		{/if}
	</button>

	{#if showPanel}
		<div class="panel-content">
			{#if controlType === 'basemap'}
				<!-- Basemap options -->
			{#each Object.entries(BASEMAPS) as [key, basemap]}
				<button 
					class="option"
					class:selected={currentBasemap === key}
					onclick={() => handleBasemapSelect(key)}
					aria-label="Select {basemap.name} basemap"
				>
					{basemap.name}
				</button>
			{/each}
		{:else if controlType === 'layers'}
			<!-- Layer options -->
			{#each Object.entries(LAYERS) as [key, layer]}
					{#if key === 'routeNetwork'}
						<!-- Route Network as heading with visibility toggle and network type options -->
						<div class="layer-section">
							<div class="layer-header">
								<label class="layer-toggle">
									<input 
										type="checkbox" 
										checked={layerStates?.[key] || false}
										onchange={() => handleLayerToggle(key)}
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
								<!-- Route Network Legend -->
								{@const legendConfig = getLegendConfig(key)}
								{#if legendConfig}
									<div class="legend-container">
										<Legend config={legendConfig} />
									</div>
								{/if}
							{/if}
						</div>
					{:else}
						<!-- Regular layer checkbox -->
						<div class="option">
							<label>
								<input 
									type="checkbox" 
									checked={layerStates?.[key] || false}
									onchange={() => handleLayerToggle(key)}
								/>
								{layer.name}
							</label>
							<!-- Layer Legend -->
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
			{/if}
		</div>
	{/if}
</div>

<style>
	.control-panel {
		position: absolute;
		background-color: #fff;
		border-radius: 6px;
		box-shadow: 0 2px 8px rgba(0,0,0,.15);
		margin: 10px;
		z-index: 100;
		transition: all 0.2s ease;
	}

	.control-panel.left {
		left: 0;
		width: 40px;
	}

	.control-panel.right {
		right: 0;
		min-width: 120px;
	}

	.control-panel.expanded.left {
		width: 200px;
	}

	.control-panel.expanded.right {
		width: 250px;
	}

	.panel-header {
		background: none;
		border: 0;
		border-radius: 6px;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		padding: 8px 12px;
		font-size: 14px;
		font-weight: 500;
		color: #333;
		transition: background-color 0.2s ease;
	}

	.control-panel.left .panel-header {
		width: 40px;
		height: 40px;
		padding: 0;
		justify-content: center;
	}

	.control-panel.right .panel-header {
		justify-content: space-between;
		gap: 8px;
	}

	.panel-header:hover {
		background-color: #f0f0f0;
	}

	.panel-content {
		padding: 0 15px 15px 15px;
		max-height: 60vh;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.arrow-icon {
		transition: transform 0.2s ease;
	}

	.arrow-icon.rotated {
		transform: rotate(180deg);
	}

	.option {
		cursor: pointer;
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

	.option label {
		display: flex;
		align-items: center;
		cursor: pointer;
		width: 100%;
	}

	.option input[type="checkbox"], 
	.option input[type="radio"] {
		margin-right: 8px;
	}

	.layer-section {
		margin-bottom: 1px;
	}

	.layer-header {
		margin-bottom: 0;
	}

	.layer-toggle {
		display: flex;
		align-items: center;
		cursor: pointer;
		width: 100%;
	}

	.layer-toggle input[type="checkbox"] {
		margin-right: 8px;
	}

	.layer-heading {
		margin: 0;
		font-size: 14px;
		font-weight: 500;
		color: #333;
		flex: 1;
	}

	.network-types {
		display: flex;
		gap: 10px;
		margin-top: 8px;
		margin-left: 24px;
	}

	.network-types label {
		display: flex;
		align-items: center;
		font-size: 12px;
	}

	.network-types input[type="radio"] {
		margin-right: 4px;
	}

	.color-section {
		margin-top: 8px;
		margin-left: 24px;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.color-label {
		font-size: 12px;
		color: #333;
		font-weight: 500;
	}

	.color-dropdown {
		font-size: 12px;
		padding: 2px 4px;
		border: 1px solid #ccc;
		border-radius: 3px;
		background-color: #fff;
		cursor: pointer;
	}

	.color-dropdown:hover {
		border-color: #999;
	}

	.color-dropdown:focus {
		outline: none;
		border-color: #007acc;
		box-shadow: 0 0 0 1px #007acc;
	}

	.legend-container {
		margin-top: 12px;
		margin-left: 24px;
		padding: 8px 0;
	}

	.legend-container :global(.legend) {
		position: static !important;
		box-shadow: none !important;
		border: 1px solid #e0e0e0;
		border-radius: 4px;
		background-color: #f9f9f9;
		font-size: 11px;
	}

	.legend-container :global(.legend h4) {
		font-size: 12px;
		margin-bottom: 6px;
		color: #555;
	}
</style>
