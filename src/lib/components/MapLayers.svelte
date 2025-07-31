<script lang="ts">
	import { VectorTileSource, LineLayer, FillLayer } from 'svelte-maplibre-gl';
	import { LAYERS, MAP_CONFIG } from '$lib/config/layers.js';
	import type { LayerConfig } from '$lib/config/layers.js';

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
</script>

{#each Object.entries(LAYERS) as [key, layer]}
	{#if activeLayers[key]}
		{@const { key: layerKey, config } = renderLayer(key, layer)}
		{#key layerKey}
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
		{/key}
	{/if}
{/each}
