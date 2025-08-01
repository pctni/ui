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
	import { onMount, tick } from 'svelte';
	
	// Import configuration
	import { BASEMAPS } from '$lib/config/basemaps.js';
	import { LAYERS, MAP_CONFIG } from '$lib/config/layers.js';
	import MapControlPanel from '$lib/components/MapControlPanel.svelte';
	import MapLayers from '$lib/components/MapLayers.svelte';
	import Geocoder from '$lib/components/Geocoder.svelte';

	// State - using simple reactive variables
	let showBasemapPanel = false;
	let showLayersPanel = false;
	let currentBasemap = 'gray';
	let currentNetworkType = 'fast';
	let currentNetworkColor = 'bicycle';
	
	// Map state
	let center: [number, number] = MAP_CONFIG.DEFAULT_CENTER;
	let zoom: number = MAP_CONFIG.DEFAULT_ZOOM;
	let mapInstance: import('maplibre-gl').Map | undefined;
	
	// Layer states
	const layerStates: Record<string, boolean> = {
		routeNetwork: false,
		coherentNetwork: false,
		cycleNetwork: false,
		gapAnalysis: false,
		localAuthorities: false
	};

	// URL state management
	let updateTimeout: ReturnType<typeof setTimeout>;
	let isUpdatingFromURL = false;
	let isInitialized = false;

	// Initialize from URL hash on mount
	onMount(() => {
		if (browser && window.location.hash) {
			parseAndApplyURL();
		}
	});	// Parse URL hash for initial state (doesn't update reactive variables)
	function parseURLHashToInitialState() {
		if (!browser && typeof window === 'undefined') return {};
		
		try {
			const hash = window.location.hash.slice(1);
			if (!hash) return {};
			
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
					initialState.zoom = newZoom;
					initialState.center = [newLng, newLat];
				}
			}
			
			// Parse basemap
			if (parts.length >= 4 && parts[3]) {
				const basemapName = parts[3];
				if (BASEMAPS[basemapName]) {
					initialState.basemap = basemapName;
				} else {
					console.warn('Unknown basemap:', basemapName, 'Available:', Object.keys(BASEMAPS));
				}
			}
			
			// Parse network type
			if (parts.length >= 5 && parts[4]) {
				const networkType = parts[4];
				if (networkType === 'fast' || networkType === 'quiet') {
					initialState.networkType = networkType;
				}
			}
			
			// Parse active layers
			if (parts.length >= 6 && parts[5]) {
				const layersStr = parts[5];
				const layers: Record<string, boolean> = {};
				
				// Reset all layers to false first
				Object.keys(layerStates).forEach(key => {
					layers[key] = false;
				});
				
				// Enable specified layers
				if (layersStr !== 'none') {
					const activeLayers = layersStr.split(',');
					activeLayers.forEach(layerName => {
						if (layers.hasOwnProperty(layerName)) {
							layers[layerName] = true;
						}
					});
				}
				
				initialState.layers = layers;
			}
			
			return initialState;
		} catch (error) {
			console.warn('Failed to parse URL hash:', error);
			return {};
		}
	}
	
	// Apply initial state when map is ready
	async function applyInitialState() {
		if (!isInitialized && mapInstance && initialState) {
			debugInfo += `\nApplying state: ${JSON.stringify(initialState)}`;
			console.log('applyInitialState: Starting with state:', initialState);
			isUpdatingFromURL = true;
			console.log('applyInitialState: Set isUpdatingFromURL to true');
			
			// Apply parsed state to reactive variables
			if (initialState.center) {
				center = initialState.center;
				debugInfo += `\nSet center: ${JSON.stringify(center)}`;
				console.log('Applied center:', center);
			}
			if (initialState.zoom) {
				zoom = initialState.zoom;
				debugInfo += `\nSet zoom: ${zoom}`;
				console.log('Applied zoom:', zoom);
			}
			if (initialState.basemap) {
				currentBasemap = initialState.basemap;
				debugInfo += `\nSet basemap: ${currentBasemap}`;
				console.log('Applied basemap:', currentBasemap);
			}
			if (initialState.networkType) {
				currentNetworkType = initialState.networkType;
				debugInfo += `\nSet network: ${currentNetworkType}`;
				console.log('Applied networkType:', currentNetworkType);
			}
			if (initialState.layers) {
				Object.assign(layerStates, initialState.layers);
				debugInfo += `\nSet layers: ${JSON.stringify(layerStates)}`;
				console.log('Applied layers:', layerStates);
			}
			
			// Clear initial state and mark as initialized
			initialState = {};
			isInitialized = true;
			debugInfo += `\nInitialized!`;
			console.log('applyInitialState: Set isInitialized to true');
			
			// Wait for all reactive updates to complete before clearing the flag
			await tick();
			setTimeout(() => {
				isUpdatingFromURL = false;
				debugInfo += `\nCleared update flag`;
				console.log('applyInitialState: Cleared isUpdatingFromURL flag');
			}, 100);
		}
	}
	
	// Watch for map instance to become available
	$: if (mapInstance && !isInitialized) {
		applyInitialState();
	}
	
	// Parse URL hash for hashchange events (after initialization)
	function parseURLHash() {
		if (!browser || !isInitialized) return;
		
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
		} finally {
			setTimeout(() => {
				isUpdatingFromURL = false;
			}, 200);
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
		if (isInitialized && !isUpdatingFromURL) {
			debouncedUpdateURL();
		}
	}
	
	function handleZoomEnd() {
		if (isInitialized && !isUpdatingFromURL) {
			debouncedUpdateURL();
		}
	}

	// Reactive statements to update URL when state changes (but not during initialization or URL updates)
	$: if (browser && isInitialized && !isUpdatingFromURL && (currentBasemap || currentNetworkType || currentNetworkColor)) {
		console.log('Reactive URL update triggered by basemap/network:', { currentBasemap, currentNetworkType, isInitialized, isUpdatingFromURL });
		debouncedUpdateURL();
	}
	
	$: if (browser && isInitialized && !isUpdatingFromURL && layerStates) {
		console.log('Reactive URL update triggered by layers:', { layerStates, isInitialized, isUpdatingFromURL });
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

	function setNetworkColor(color: string) {
		currentNetworkColor = color;
	}
</script>

{#if browser}
	<PMTilesProtocol />
{/if}

<!-- Debug Info -->
{#if debugInfo}
<div style="position: fixed; top: 60px; right: 10px; background: rgba(0,0,0,0.8); color: white; padding: 10px; font-family: monospace; z-index: 1000; max-width: 400px; font-size: 12px;">
	<strong>Debug Info:</strong><br>
	<pre>{debugInfo}</pre>
	<div>center: {JSON.stringify(center)}</div>
	<div>zoom: {zoom}</div>
	<div>basemap: {currentBasemap}</div>
	<div>network: {currentNetworkType}</div>
	<div>initialized: {isInitialized}</div>
	<div>updating: {isUpdatingFromURL}</div>
</div>
{/if}

<MapLibre
	class="h-[calc(100vh-90px)]"
	style={currentBasemapStyle}
	bind:center
	bind:zoom
	bind:map={mapInstance}
	onmoveend={handleMoveEnd}
	onzoomend={handleZoomEnd}
>
	<NavigationControl position="top-left" />
	<FullScreenControl position="top-left" />
	<GeolocateControl position="top-left" />
	<ScaleControl position="bottom-left" unit="metric" maxWidth={200}/>

	<!-- Search/Geocoder Control -->
	<CustomControl position="top-right">
		<Geocoder map={mapInstance || null} />
	</CustomControl>

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
			currentNetworkColor={currentNetworkColor}
			onToggleLayer={toggleLayer}
			onNetworkTypeChange={setNetworkType}
			onNetworkColorChange={setNetworkColor}
		/>
	</CustomControl>

	<!-- Dynamic Layers -->
	<MapLayers activeLayers={layerStates} networkType={currentNetworkType} networkColor={currentNetworkColor} />
</MapLibre>

