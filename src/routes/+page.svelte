<script lang="ts">
	import { 
		MapLibre, 
		FullScreenControl, 
		GeolocateControl, 
		ScaleControl,
		VectorTileSource,
		LineLayer,
		FillLayer,
		CustomControl,
		NavigationControl
	} from 'svelte-maplibre-gl';
	import { PMTilesProtocol } from '@svelte-maplibre-gl/pmtiles';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	
	// Import configuration
	import { BASEMAPS } from '$lib/config/basemaps.js';
	import { LAYERS, MAP_CONFIG } from '$lib/config/layers.js';
	import MapControlPanel from '$lib/components/MapControlPanel.svelte';

	// State - using simple reactive variables
	let showBasemapPanel = false;
	let showLayersPanel = false;
	let currentBasemap = 'gray';
	let currentNetworkType = 'fast';
	
	// Map state
	let center: [number, number] = MAP_CONFIG.DEFAULT_CENTER;
	let zoom: number = MAP_CONFIG.DEFAULT_ZOOM;
	
	// Layer states
	const layerStates: Record<string, boolean> = {
		routeNetwork: false,
		coherentNetwork: false,
		gapAnalysis: false,
		localAuthorities: false
	};

	// URL state management
	let updateTimeout: ReturnType<typeof setTimeout>;

	// Initialize from URL hash on mount
	onMount(() => {
		if (browser) {
			parseURLHash();
			window.addEventListener('hashchange', parseURLHash);
			
			return () => {
				window.removeEventListener('hashchange', parseURLHash);
			};
		}
	});
	
	// Parse URL hash pattern: #zoom/lat/lng/basemap/networkType/layers
	function parseURLHash() {
		if (!browser) return;
		
		try {
			const hash = window.location.hash.slice(1);
			if (!hash) return;
			
			const parts = hash.split('/');
			
			// Parse basic map position (zoom/lat/lng)
			if (parts.length >= 3) {
				const [zoomStr, latStr, lngStr] = parts;
				const newZoom = parseFloat(zoomStr);
				const newLat = parseFloat(latStr);
				const newLng = parseFloat(lngStr);
				
				// Validate ranges
				const isValidZoom = !isNaN(newZoom) && newZoom >= 0 && newZoom <= 24;
				const isValidLat = !isNaN(newLat) && newLat >= -90 && newLat <= 90;
				const isValidLng = !isNaN(newLng) && newLng >= -180 && newLng <= 180;
				
				if (isValidZoom && isValidLat && isValidLng) {
					zoom = newZoom;
					center = [newLng, newLat];
				}
			}
			
			// Parse basemap
			if (parts.length >= 4 && parts[3]) {
				const basemapName = parts[3];
				if (BASEMAPS[basemapName]) {
					currentBasemap = basemapName;
				}
			}
			
			// Parse network type
			if (parts.length >= 5 && parts[4]) {
				const networkType = parts[4];
				if (networkType === 'fast' || networkType === 'quiet') {
					currentNetworkType = networkType;
				}
			}
			
			// Parse active layers
			if (parts.length >= 6 && parts[5]) {
				const layersStr = parts[5];
				
				// Reset all layers to false first
				Object.keys(layerStates).forEach(key => {
					layerStates[key] = false;
				});
				
				// Enable specified layers
				if (layersStr !== 'none') {
					const activeLayers = layersStr.split(',');
					activeLayers.forEach(layerName => {
						if (layerStates.hasOwnProperty(layerName)) {
							layerStates[layerName] = true;
						}
					});
				}
			}
		} catch (error) {
			console.warn('Failed to parse URL hash:', error);
		}
	}
	
	// Update URL with current map state
	function updateURLHash() {
		if (!browser || !center || typeof zoom !== 'number') return;
		
		try {
			// Get active layers
			const activeLayers = Object.entries(layerStates)
				.filter(([key, value]) => value)
				.map(([key, value]) => key);
			
			const layersStr = activeLayers.length > 0 ? activeLayers.join(',') : 'none';
			
			// Format: #zoom/lat/lng/basemap/networkType/layers
			const newHash = `#${zoom.toFixed(2)}/${center[1].toFixed(4)}/${center[0].toFixed(4)}/${currentBasemap}/${currentNetworkType}/${layersStr}`;
			
			// Only update if hash actually changed
			if (window.location.hash !== newHash) {
				window.history.replaceState(null, '', newHash);
			}
		} catch (error) {
			console.warn('Failed to update URL hash:', error);
		}
	}
	
	// Debounce URL updates
	function debouncedUpdateURL() {
		clearTimeout(updateTimeout);
		updateTimeout = setTimeout(updateURLHash, 100);
	}
	
	// Handle map events
	function handleMoveEnd() {
		debouncedUpdateURL();
	}
	
	function handleZoomEnd() {
		debouncedUpdateURL();
	}

	// Reactive statements to update URL when state changes
	$: if (center && center.length === 2 && typeof zoom === 'number' && browser) {
		debouncedUpdateURL();
	}
	
	$: if (browser && layerStates) {
		debouncedUpdateURL();
	}
	
	$: if (browser && currentBasemap) {
		debouncedUpdateURL();
	}
	
	$: if (browser && currentNetworkType) {
		debouncedUpdateURL();
	}

	// Computed values
	$: currentBasemapStyle = BASEMAPS[currentBasemap]?.style || BASEMAPS.gray.style;

	// Event handlers
	function togglePanel(panel: 'basemap' | 'layers') {
		if (panel === 'basemap') {
			showBasemapPanel = !showBasemapPanel;
			if (showBasemapPanel) showLayersPanel = false;
		} else {
			showLayersPanel = !showLayersPanel;
			if (showLayersPanel) showBasemapPanel = false;
		}
	}

	function selectBasemap(key: string) {
		currentBasemap = key;
		showBasemapPanel = false;
	}

	function toggleLayer(key: string) {
		layerStates[key] = !layerStates[key];
	}

	function setNetworkType(type: string) {
		currentNetworkType = type;
	}
</script>

{#if browser}
	<PMTilesProtocol />
{/if}

<MapLibre
	class="h-[calc(100vh-100px)]"
	style={currentBasemapStyle}
	bind:center
	bind:zoom
	onmoveend={handleMoveEnd}
	onzoomend={handleZoomEnd}
>
	<NavigationControl position="top-left" />
	<FullScreenControl position="top-left" />
	<GeolocateControl position="top-left" />
	<ScaleControl position="bottom-left" unit="metric" maxWidth={200}/>

	<!-- Basemap Control -->
	<CustomControl position="top-left">
		<MapControlPanel 
			controlType="basemap"
			showPanel={showBasemapPanel}
			onToggle={() => togglePanel('basemap')}
			title="Change basemap"
			position="left"
			currentBasemap={currentBasemap}
			onBasemapSelect={selectBasemap}
		/>
	</CustomControl>

	<!-- Layers Control -->
	<CustomControl position="top-right">
		<MapControlPanel 
			controlType="layers"
			showPanel={showLayersPanel}
			onToggle={() => togglePanel('layers')}
			title="Map Layers"
			position="right"
			layerStates={layerStates}
			currentNetworkType={currentNetworkType}
			onToggleLayer={toggleLayer}
			onNetworkTypeChange={setNetworkType}
		/>
	</CustomControl>

	<!-- Dynamic Layers -->
	{#each Object.entries(LAYERS) as [key, layer]}
		{#if layerStates[key]}
			{#if key === 'routeNetwork' && layer.getConfig}
				{#key currentNetworkType}
					{@const config = layer.getConfig(currentNetworkType)}
					<VectorTileSource id={config.id} url={config.url} attribution="PCTNI">
						<LineLayer
							sourceLayer={config.sourceLayer}
							paint={config.paint}
							minzoom={MAP_CONFIG.ZOOM.min}
							maxzoom={MAP_CONFIG.ZOOM.max}
						/>
					</VectorTileSource>
				{/key}
			{:else}
				<VectorTileSource id={layer.id} url={layer.url} attribution="PCTNI">
					{#if layer.type === 'fill'}
						<FillLayer
							sourceLayer={layer.sourceLayer}
							paint={layer.paint}
							minzoom={MAP_CONFIG.ZOOM.min}
							maxzoom={MAP_CONFIG.ZOOM.max}
						/>
					{:else}
						<LineLayer
							sourceLayer={layer.sourceLayer}
							paint={layer.paint}
							minzoom={MAP_CONFIG.ZOOM.min}
							maxzoom={MAP_CONFIG.ZOOM.max}
						/>
					{/if}
				</VectorTileSource>
			{/if}
		{/if}
	{/each}
</MapLibre>

