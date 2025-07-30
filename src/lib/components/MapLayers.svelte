<script lang="ts">
	import { VectorTileSource, LineLayer, FillLayer } from 'svelte-maplibre-gl';
	import { LAYERS, MAP_CONFIG } from '$lib/config/layers.js';
	import type { LayerConfig } from '$lib/config/layers.js';
	import Legend from './Legend.svelte';
	import { LEGEND_CONFIGS } from '$lib/config/legends.js';
	import type { LegendConfig } from '$lib/config/legends.js';

	interface Props {
		activeLayers: Record<string, boolean>;
		networkType: string;
		networkColor?: string;
	}

	let { activeLayers, networkType, networkColor = 'bicycle' }: Props = $props();

	function renderLayer(key: string, layer: LayerConfig) {
		if (key === 'routeNetwork' && layer.getConfig) {
			const config = layer.getConfig(networkType, networkColor);
			return { key: `${key}-${networkType}-${networkColor}`, config };
		}
		return { key, config: layer };
	}

	// Generate legends for active layers
	const activeLegends = $derived(Object.entries(activeLayers)
		.filter(([key, isActive]) => isActive && LEGEND_CONFIGS[key])
		.map(([key, _], index) => {
			const legendConfig = LEGEND_CONFIGS[key];
			let config: LegendConfig;
			
			if (typeof legendConfig === 'function') {
				// Route network legend that depends on network type and color
				config = legendConfig(networkType, networkColor);
			} else {
				// Static legend config
				config = legendConfig;
			}
			
			return {
				key,
				config,
				position: index % 2 === 0 ? 'bottom-left' : 'bottom-right'
			};
		}));
</script>

{#each Object.entries(LAYERS) as [key, layer]}
	{#if activeLayers[key]}
		{@const { key: layerKey, config } = renderLayer(key, layer)}
		<VectorTileSource id={config.id} url={config.url} attribution="PCTNI">
			{#if config.type === 'fill'}
				<FillLayer
					sourceLayer={config.sourceLayer}
					paint={config.paint}
					minzoom={MAP_CONFIG.ZOOM.min}
					maxzoom={MAP_CONFIG.ZOOM.max}
				/>
			{:else}
				<LineLayer
					sourceLayer={config.sourceLayer}
					paint={config.paint}
					minzoom={MAP_CONFIG.ZOOM.min}
					maxzoom={MAP_CONFIG.ZOOM.max}
				/>
			{/if}
		</VectorTileSource>
	{/if}
{/each}

<!-- Render legends for active layers -->
{#each activeLegends as { key, config, position }, index}
	<Legend 
		{config} 
		position={position}
		style="bottom: {10 + (index * 60)}px;"
	/>
{/each}
