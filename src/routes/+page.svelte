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

	// Import configuration and utilities
	import { BASEMAPS } from '$lib/config/basemaps.js';
	import { LAYERS, MAP_CONFIG } from '$lib/config/layers.js';
	import MapControlPanel from '$lib/components/MapControlPanel.svelte';
	import MapLayers from '$lib/components/MapLayers.svelte';
	import Geocoder from '$lib/components/Geocoder.svelte';
	import { debounce } from '$lib/utils/debounce.js';
	import {
		parseURLHash as parseURL,
		generateURLHash,
		type LayerStates,
		type MapState
	} from '$lib/utils/url-state.js';

	// UI Panel states
	let showBasemapPanel = $state(false);
	let showLayersPanel = $state(false);

	// Map state
	let center: [number, number] = $state(MAP_CONFIG.DEFAULT_CENTER);
	let zoom: number = $state(MAP_CONFIG.DEFAULT_ZOOM);
	let currentBasemap = $state('gray');
	let currentNetworkType = $state('fast');
	let currentNetworkColor = $state('bicycle');

	// Layer states
	const layerStates: LayerStates = $state({
		routeNetwork: false,
		coherentNetwork: false,
		cycleNetwork: false,
		gapAnalysis: false,
		localAuthorities: false
	});

	let mapInstance: import('maplibre-gl').Map | undefined = $state(undefined);
	let isUpdatingFromURL = false;
	let updateTimeout: number;

	// Layer keys for URL parsing
	const layerKeys = Object.keys(layerStates);

	// URL update functions
	const debouncedUpdateURL = debounce(updateURL, 100);
	
	function updateURL() {
		if (!browser || !center || typeof zoom !== 'number' || isUpdatingFromURL) return;

		try {
			const currentState: MapState = {
				zoom,
				center,
				basemap: currentBasemap,
				networkType: currentNetworkType,
				networkColor: currentNetworkColor,
				layers: layerStates
			};

			const newHash = generateURLHash(currentState);

			if (window.location.hash !== newHash) {
				window.history.replaceState(null, '', newHash);
			}
		} catch (error) {
			console.warn('Failed to update URL hash:', error);
		}
	}

	function applyStateUpdates(updates: Partial<MapState>) {
		isUpdatingFromURL = true;
		try {
			if (updates.zoom !== undefined) zoom = updates.zoom;
			if (updates.center !== undefined) center = updates.center;
			if (updates.basemap !== undefined) currentBasemap = updates.basemap;
			if (updates.networkType !== undefined) currentNetworkType = updates.networkType;
			if (updates.layers) {
				Object.assign(layerStates, updates.layers);
			}
		} finally {
			setTimeout(() => (isUpdatingFromURL = false), 0);
		}
	}

	onMount(() => {
		if (browser) {
			const handleHashChange = () => {
				const updates = parseURL(window.location.hash, layerKeys);
				applyStateUpdates(updates);
			};

			handleHashChange();
			window.addEventListener('hashchange', handleHashChange);
			return () => window.removeEventListener('hashchange', handleHashChange);
		}
	});

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
		updateURL();
	}

	function toggleLayer(key: string) {
		if (key in layerStates) {
			layerStates[key as keyof LayerStates] = !layerStates[key as keyof LayerStates];
		}
		updateURL();
	}

	function setOrClearNetworkType(type: string) {
		if (currentNetworkType === type) {
			currentNetworkType = '';
		} else {
			currentNetworkType = type;
		}
		updateURL();
	}

	function setNetworkColor(color: string) {
		currentNetworkColor = color;
		updateURL();
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
	<ScaleControl position="bottom-left" unit="metric" maxWidth={200} />

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
			{currentBasemap}
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
			{layerStates}
			{currentNetworkType}
			{currentNetworkColor}
			onToggleLayer={toggleLayer}
			onNetworkTypeChange={setOrClearNetworkType}
			onNetworkColorChange={setNetworkColor}
		/>
	</CustomControl>

	<!-- Dynamic Layers -->
	<MapLayers
		activeLayers={layerStates}
		networkType={currentNetworkType}
		networkColor={currentNetworkColor}
	/>
</MapLibre>
