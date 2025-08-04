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
	import MapLayers from '$lib/components/MapLayers.svelte';

	// State - using simple reactive variables
	let showBasemapPanel = $state(false);
	let showLayersPanel = $state(false);
	let currentBasemap = $state('gray');
	let currentNetworkType = $state(''); // No network selected by default
	let currentNetworkColor = $state('bicycle');
	
	// Map state
	let center = $state<[number, number]>(MAP_CONFIG.DEFAULT_CENTER);
	let zoom = $state<number>(MAP_CONFIG.DEFAULT_ZOOM);
	let mapInstance = $state<import('maplibre-gl').Map | undefined>();
	
	// Layer states
	let layerStates = $state<Record<string, boolean>>({
		routeNetwork: false, // Off by default - user must actively select a network type
		coherentNetwork: false,
		cycleNetwork: false,
		gapAnalysis: false,
		localAuthorities: false
	});

	// URL state management
	let updateTimeout: ReturnType<typeof setTimeout>;
	let isUpdatingFromURL = $state(false);

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
			isUpdatingFromURL = true;

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
				} else if (networkType === 'none' || networkType === '') {
					currentNetworkType = '';
				}
			} else {
				currentNetworkType = '';
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
			
			// Set route network layer state based on network type
			layerStates.routeNetwork = currentNetworkType !== '' && (currentNetworkType === 'fast' || currentNetworkType === 'quiet');
		} catch (error) {
			console.warn('Failed to parse URL hash:', error);
		} finally {
			setTimeout(() => {
				isUpdatingFromURL = false;
			}, 0);
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
			const networkTypeStr = currentNetworkType || 'none';
			
			// Format: #zoom/lat/lng/basemap/networkType/layers
			const newHash = `#${zoom.toFixed(2)}/${center[1].toFixed(4)}/${center[0].toFixed(4)}/${currentBasemap}/${networkTypeStr}/${layersStr}`;
			
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
		if (!isUpdatingFromURL && mapInstance && !showBasemapPanel && !showLayersPanel) {
			center = [mapInstance.getCenter().lng, mapInstance.getCenter().lat];
			debouncedUpdateURL();
		}
	}
	
	function handleZoomEnd() {
		if (!isUpdatingFromURL && mapInstance && !showBasemapPanel && !showLayersPanel) {
			zoom = mapInstance.getZoom();
			debouncedUpdateURL();
		}
	}

	// Note: URL updates are handled by explicit event handlers and function calls to avoid reactive loops

	// Computed values
	const currentBasemapStyle = $derived(BASEMAPS[currentBasemap]?.style || BASEMAPS.gray.style);

	// Event handlers
	function togglePanel(panel: 'basemap' | 'layers') {
		if (panel === 'basemap') {
			showBasemapPanel = !showBasemapPanel;
			showLayersPanel = false; // Always close the other panel
		} else {
			showLayersPanel = !showLayersPanel;
			showBasemapPanel = false; // Always close the other panel
		}
	}

	function selectBasemap(key: string) {
		currentBasemap = key;
		showBasemapPanel = false;
		debouncedUpdateURL();
	}

	function toggleLayer(key: string) {
		layerStates[key] = !layerStates[key];
		debouncedUpdateURL();
	}

	function setNetworkType(type: string) {
		if (type === '' || currentNetworkType === type) {
			// If already selected or explicitly turning off, turn off the layer
			currentNetworkType = '';
			layerStates.routeNetwork = false;
		} else {
			// Select the new network type and turn on the layer
			currentNetworkType = type;
			layerStates.routeNetwork = true;
		}
		updateURLHash();
	}

	function setNetworkColor(color: string) {
		currentNetworkColor = color;
		debouncedUpdateURL();
	}
</script>

{#if browser}
	<PMTilesProtocol />
{/if}

<MapLibre
	class="h-[calc(100vh-90px)]"
	style={currentBasemapStyle}
	center={center}
	zoom={zoom}
	bind:map={mapInstance}
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
			title="Layers"
			position="right"
			layerStates={layerStates}
			currentNetworkType={currentNetworkType}
			currentNetworkColor={currentNetworkColor}
			onToggleLayer={toggleLayer}
			onNetworkTypeChange={setNetworkType}
			onNetworkColorChange={setNetworkColor}
		/>
	</CustomControl>

	<!-- Dynamic Layers -->
	<MapLayers activeLayers={layerStates} networkType={currentNetworkType} networkColor={currentNetworkColor} />
</MapLibre>

