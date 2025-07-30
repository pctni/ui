<script lang="ts">
	import { BASEMAPS } from '$lib/config/basemaps.js';
	import { LAYERS } from '$lib/config/layers.js';

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
		onToggleLayer?: (key: string) => void;
		onNetworkTypeChange?: (type: string) => void;
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
		onToggleLayer,
		onNetworkTypeChange
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
</script>

<button 
	class="control-button {position === 'left' ? 'large' : 'wide'}" 
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
	<div class="panel {position}">
		<h3>{controlType === 'basemap' ? 'Basemap' : 'Map Layers'}</h3>
		<div class="options">
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
					<div class="option">
						<label>
							<input 
								type="checkbox" 
								checked={layerStates?.[key] || false}
								onchange={() => handleLayerToggle(key)}
							/>
							{layer.name}
						</label>
						{#if key === 'routeNetwork' && layerStates?.[key]}
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
						{/if}
					</div>
				{/each}
			{/if}
		</div>
	</div>
{/if}

<style>
	.control-button {
		background-color: #fff;
		border: 0;
		border-radius: 4px;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
		box-shadow: 0 0 0 2px rgba(0,0,0,.1);
		margin: 10px;
	}

	.control-button:hover {
		background-color: #f0f0f0;
	}

	.control-button.large {
		width: 40px;
		height: 40px;
		padding: 0;
	}

	.control-button.wide {
		padding: 8px 12px;
		gap: 8px;
		font-size: 14px;
		font-weight: 500;
		color: #333;
		min-width: 120px;
		justify-content: space-between;
	}

	.arrow-icon {
		transition: transform 0.2s ease;
	}

	.arrow-icon.rotated {
		transform: rotate(180deg);
	}

	.panel {
		position: absolute;
		top: 50px;
		background-color: #fff;
		border-radius: 6px;
		box-shadow: 0 2px 8px rgba(0,0,0,.15);
		padding: 15px;
		z-index: 100;
		width: 250px;
	}

	.panel.left {
		left: 10px;
		width: 200px;
	}

	.panel.right {
		right: 10px;
	}

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

	.network-types {
		display: flex;
		gap: 10px;
		margin-top: 5px;
		margin-left: 20px;
	}

	.network-types label {
		display: flex;
		align-items: center;
		font-size: 12px;
	}

	.network-types input[type="radio"] {
		margin-right: 4px;
	}
</style>
