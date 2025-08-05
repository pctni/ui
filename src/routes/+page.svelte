<script lang="ts">
	import { 
		MapLibre, 
		FullScreenControl, 
		GeolocateControl, 
		ScaleControl,
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
	
	// Import utilities
	import { parseURLHash, updateBrowserURL, debounce, type MapState } from '$lib/utils/urlState.js';
	import { createMapEventHandlers, shouldProcessMapUpdate } from '$lib/utils/mapEvents.js';
	import { togglePanel as togglePanelUtil, type PanelType } from '$lib/utils/panelState.js';

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
	let isUpdatingFromURL = $state(false);

	// Initialize from URL hash on mount - using onMount to avoid circular dependencies
	onMount(() => {
		if (browser) {
			applyURLState();
			
			function handleHashChange() {
				applyURLState();
			}
			
			window.addEventListener('hashchange', handleHashChange);
			
			return () => {
				window.removeEventListener('hashchange', handleHashChange);
			};
		}
	});
	
	// Apply URL state to component state
	function applyURLState() {
		if (!browser) return;
		
		try {
			isUpdatingFromURL = true;
			const urlState = parseURLHash();
			
			if (urlState.zoom !== undefined) zoom = urlState.zoom;
			if (urlState.center !== undefined) center = urlState.center;
			if (urlState.currentBasemap !== undefined) currentBasemap = urlState.currentBasemap;
			if (urlState.currentNetworkType !== undefined) currentNetworkType = urlState.currentNetworkType;
			if (urlState.layerStates !== undefined) {
				// Update layer states
				Object.assign(layerStates, urlState.layerStates);
			}
		} catch (error) {
			console.warn('Failed to apply URL state:', error);
		} finally {
			setTimeout(() => {
				isUpdatingFromURL = false;
			}, 0);
		}
	}
	
	// Debounced URL updates now handled by utility functions

	// Note: This app uses a hybrid approach with Svelte 5:
	// - $state() for reactive state variables
	// - $derived() for simple computed values 
	// - onMount() for initial setup and event listeners (avoids circular dependencies)
	// - Manual functions for complex side effects like URL management

	// Computed values
	const currentBasemapStyle = $derived(BASEMAPS[currentBasemap]?.style || BASEMAPS.gray.style);
	
	// Create a debounced URL update function
	const debouncedUpdateURL = debounce(() => {
		if (!isUpdatingFromURL) {
			const currentState: MapState = {
				zoom,
				center,
				currentBasemap,
				currentNetworkType,
				layerStates
			};
			updateBrowserURL(currentState);
		}
	}, 100);

	// Create map event handlers using utility
	const mapEventHandlers = createMapEventHandlers(
		(newCenter, newZoom) => {
			center = newCenter;
			zoom = newZoom;
			debouncedUpdateURL();
		},
		() => shouldProcessMapUpdate(isUpdatingFromURL, mapInstance, showBasemapPanel, showLayersPanel)
	);

	// Event handlers
	function togglePanel(panel: PanelType) {
		const newState = togglePanelUtil(
			{ showBasemapPanel, showLayersPanel },
			panel
		);
		showBasemapPanel = newState.showBasemapPanel;
		showLayersPanel = newState.showLayersPanel;
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
		updateURLHash(); // Immediate update for network changes
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
	onmoveend={() => mapEventHandlers.onMoveEnd(mapInstance!)}
	onzoomend={() => mapEventHandlers.onZoomEnd(mapInstance!)}
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

	<!-- Geocoder with custom positioning -->
	<div class="custom-geocoder-position">
		<Geocoder map={mapInstance || null} />
	</div>

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

<style>
	:global(.custom-geocoder-position) {
		position: absolute;
		top: 10px;
		left: 50px;
		z-index: 1000;
	}
</style>
