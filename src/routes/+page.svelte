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
	import Geocoder from '$lib/components/Geocoder.svelte';

	// State - using $state for Svelte 5 reactivity
	let showBasemapPanel = $state(false);
	let showLayersPanel = $state(false);
	let currentBasemap = $state('gray');
	let currentNetworkType = $state('fast');
	let currentNetworkColor = $state('bicycle');
	
	// Map state
	let center: [number, number] = $state(MAP_CONFIG.DEFAULT_CENTER);
	let zoom: number = $state(MAP_CONFIG.DEFAULT_ZOOM);
	let mapInstance: import('maplibre-gl').Map | undefined = $state(undefined);
	
	// Layer states - using a single reactive object for better maintainability
	const layerStates = $state({
		routeNetwork: false,
		coherentNetwork: false,
		cycleNetwork: false,
		gapAnalysis: false,
		localAuthorities: false
	});
	
	// Helper to update a specific layer state
	function setLayerState(key: keyof typeof layerStates, value: boolean) {
		layerStates[key] = value;
	}
	
	// Helper to get layer states as an object (for compatibility with existing code)
	function getLayerStates() {
		return { ...layerStates };
	}
	
	// Helper to set layer states from an object
	function setLayerStates(states: Partial<typeof layerStates>) {
		for (const [key, value] of Object.entries(states)) {
			if (key in layerStates) {
				if (typeof value === 'boolean') {
					layerStates[key as keyof typeof layerStates] = value;
				}
			}
		}
	}

	// URL state management
	let updateTimeout: ReturnType<typeof setTimeout>;
	let isUpdatingFromURL = false;

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
				}
			}
			
			// Parse active layers
			if (parts.length >= 6 && parts[5]) {
				const layersStr = parts[5];
				
				// Reset all layers to false first
				setLayerStates({
					routeNetwork: false,
					coherentNetwork: false,
					cycleNetwork: false,
					gapAnalysis: false,
					localAuthorities: false
				});
				
				// Enable specified layers
				if (layersStr !== 'none') {
					const activeLayers = layersStr.split(',');
					// Reset all layers to false first
					setLayerStates({
						routeNetwork: false,
						coherentNetwork: false,
						cycleNetwork: false,
						gapAnalysis: false,
						localAuthorities: false
					});
					
					// Enable specified layers
					activeLayers.forEach(layerName => {
						if (layerName in layerStates) {
							setLayerState(layerName as keyof typeof layerStates, true);
						}
					});
				}
			}
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
			// Get active layers using the helper function
			const currentLayerStates = getLayerStates();
			const activeLayers = Object.entries(currentLayerStates)
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


	// Computed values using $derived for Svelte 5
	const currentBasemapStyle = $derived(BASEMAPS[currentBasemap]?.style || BASEMAPS.gray.style);

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
		
		// Update URL immediately when basemap is changed
		if (browser && !isUpdatingFromURL) {
			debouncedUpdateURL();
		}
	}

	function toggleLayer(key: string) {
		if (key in layerStates) {
			setLayerState(key, !layerStates[key as keyof typeof layerStates]);
		}
		
		// Update URL immediately when layer is toggled
		if (browser && !isUpdatingFromURL) {
			debouncedUpdateURL();
		}
	}

	function setNetworkType(type: string) {
		currentNetworkType = type;
		
		// Update URL immediately when network type is changed
		if (browser && !isUpdatingFromURL) {
			debouncedUpdateURL();
		}
	}
	
	function setNetworkColor(color: string) {
		currentNetworkColor = color;
		
		// Update URL immediately when network color is changed
		if (browser && !isUpdatingFromURL) {
			debouncedUpdateURL();
		}
	}
</script>

{#if browser}
	<PMTilesProtocol />
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
			layerStates={getLayerStates()}
			currentNetworkType={currentNetworkType}
			currentNetworkColor={currentNetworkColor}
			onToggleLayer={toggleLayer}
			onNetworkTypeChange={setNetworkType}
			onNetworkColorChange={setNetworkColor}
		/>
	</CustomControl>

	<!-- Dynamic Layers -->
	<MapLayers activeLayers={getLayerStates()} networkType={currentNetworkType} networkColor={currentNetworkColor} />
</MapLibre>

