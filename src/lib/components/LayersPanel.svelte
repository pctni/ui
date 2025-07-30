<script lang="ts">
	import { LAYERS } from '$lib/config/layers.js';

	interface Props {
		layerStates: Record<string, boolean>;
		currentNetworkType: string;
		onToggleLayer: (key: string) => void;
		onNetworkTypeChange: (type: string) => void;
	}

	let { layerStates, currentNetworkType, onToggleLayer, onNetworkTypeChange }: Props = $props();
</script>

<h3>Map Layers</h3>
<div class="options">
	{#each Object.entries(LAYERS) as [key, layer]}
		<div class="option">
			<label>
				<input 
					type="checkbox" 
					checked={layerStates[key]}
					onchange={() => onToggleLayer(key)}
				/>
				{layer.name}
			</label>
			{#if key === 'routeNetwork' && layerStates[key]}
				<div class="network-types">
					<label>
						<input 
							type="radio" 
							name="networkType" 
							value="fast" 
							checked={currentNetworkType === 'fast'}
							onchange={() => onNetworkTypeChange('fast')}
						/>
						Fastest
					</label>
					<label>
						<input 
							type="radio" 
							name="networkType" 
							value="quiet" 
							checked={currentNetworkType === 'quiet'}
							onchange={() => onNetworkTypeChange('quiet')}
						/>
						Quietest
					</label>
				</div>
			{/if}
		</div>
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
