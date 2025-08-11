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
	import LayerPanel from '$lib/components/LayerPanel.svelte';
	import Geocoder from '$lib/components/Geocoder.svelte';

	// State: initial values and types
	let showBasemapPanel = $state(false);
	let isLayerPanelMinimized = $state(false); // For mobile layer panel toggle
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

	// Initialize from URL hash on mount - using onMount to avoid circular dependencies
	onMount(() => {
		if (browser) {
			parseURLHash();
			
			function handleHashChange() {
				parseURLHash();
			}
			
			window.addEventListener('hashchange', handleHashChange);
			
			return () => {
				window.removeEventListener('hashchange', handleHashChange);
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
	
	// Debounced URL updates now handled by $effect above
	
	// Handle map events
	function handleMoveEnd() {
		if (!isUpdatingFromURL && mapInstance && !showBasemapPanel) {
			center = [mapInstance.getCenter().lng, mapInstance.getCenter().lat];
			debouncedUpdateURL();
		}
	}
	
	function handleZoomEnd() {
		if (!isUpdatingFromURL && mapInstance && !showBasemapPanel) {
			zoom = mapInstance.getZoom();
			debouncedUpdateURL();
		}
	}

	// Note: This app uses a hybrid approach with Svelte 5:
	// - $state() for reactive state variables
	// - $derived() for simple computed values 
	// - onMount() for initial setup and event listeners (avoids circular dependencies)
	// - Manual functions for complex side effects like URL management

	// Computed values
	const currentBasemapStyle = $derived(BASEMAPS[currentBasemap]?.style || BASEMAPS.gray.style);
	
	// Manual URL update function - simpler and more predictable
	function updateURLHash() {
		if (!browser || !center || typeof zoom !== 'number' || isUpdatingFromURL) return;
		
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
	
	// Debounced URL updates
	function debouncedUpdateURL() {
		clearTimeout(updateTimeout);
		updateTimeout = setTimeout(updateURLHash, 100);
	}

	// Event handlers
	function togglePanel(panel: 'basemap') {
		if (panel === 'basemap') {
			showBasemapPanel = !showBasemapPanel;
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
		updateURLHash(); // Immediate update for network changes
	}

	function setNetworkColor(color: string) {
		currentNetworkColor = color;
		debouncedUpdateURL();
	}

	function toggleLayerPanelMinimized() {
		isLayerPanelMinimized = !isLayerPanelMinimized;
	}
</script>

{#if browser}
	<PMTilesProtocol />
{/if}

<!-- Main container with sidebar layout -->
<div class="app-container">
	<!-- Map container -->
	<div class="map-container">
		<MapLibre
			class="h-full max-sm:h-screen mobile-map-height"
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

			<!-- Geocoder with custom positioning -->
			<div class="custom-geocoder-position">
				<Geocoder map={mapInstance || null} apiKey={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN} />
			</div>

			<!-- Dynamic Layers -->
			<MapLayers activeLayers={layerStates} networkType={currentNetworkType} networkColor={currentNetworkColor} />
			
			<!-- Mobile-only floating Alpha button -->
			<div class="mobile-alpha-button">
				<button
					class="alpha-mobile"
					onclick={() => {
						// Access parent component's alpha modal function
						window.dispatchEvent(new CustomEvent('show-alpha-modal'));
					}}
					aria-label="Show alpha information"
					type="button"
				>
					ALPHA
				</button>
			</div>
		</MapLibre>
	</div>

	<!-- Right sidebar for layers -->
	<div class="layers-sidebar" class:minimized={isLayerPanelMinimized}>
		<div class="sidebar-header">
			<h3>Layers</h3>
			<!-- Toggle button for both desktop and mobile -->
			<button 
				class="panel-toggle-btn"
				onclick={toggleLayerPanelMinimized}
				aria-label={isLayerPanelMinimized ? 'Expand layer panel' : 'Minimize layer panel'}
			>
				<div class="chevron-icon" class:minimized={isLayerPanelMinimized}></div>
			</button>
		</div>
		{#if !isLayerPanelMinimized}
		<div class="sidebar-content">
			<LayerPanel
				layerStates={layerStates}
				currentNetworkType={currentNetworkType}
				currentNetworkColor={currentNetworkColor}
				onToggleLayer={toggleLayer}
				onNetworkTypeChange={setNetworkType}
				onNetworkColorChange={setNetworkColor}
			/>
		</div>
		{/if}
	</div>
</div>

<style>
	/* App layout with sidebar */
	.app-container {
		display: flex;
		height: 100%; /* Use 100% to fill the full viewport height */
		width: 100vw;
	}

	.map-container {
		flex: 1;
		height: 100%; /* Fill available height within the flex container */
	}

	.layers-sidebar {
		width: 320px;
		height: 100%; /* Match the main content area height */
		background-color: white;
		border-left: 1px solid #e2e8f0;
		display: flex;
		flex-direction: column;
		box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
		transition: width 0.3s ease;
	}

	/* Desktop minimized state */
	.layers-sidebar.minimized {
		width: 60px; /* Just show the toggle area */
	}

	.layers-sidebar.minimized .sidebar-header h3 {
		display: none; /* Hide title when minimized */
	}

	.layers-sidebar.minimized .panel-toggle-btn {
		margin: 0 auto; /* Center the toggle button when minimized */
	}

	.sidebar-header {
		padding: 1rem;
		border-bottom: 1px solid #e2e8f0;
		background-color: #f8fafc;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.sidebar-header h3 {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
		color: #1e293b;
	}

	.panel-toggle-btn {
		background: none;
		border: none;
		font-size: 1.2rem;
		cursor: pointer;
		padding: 0;
		color: #64748b;
		border-radius: 0.25rem;
		transition: background-color 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		min-width: 32px;
		min-height: 32px;
	}

	.panel-toggle-btn:hover {
		background-color: #e2e8f0;
	}

	/* CSS-based chevron icon */
	.chevron-icon {
		width: 8px;
		height: 8px;
		border-top: 2px solid #64748b;
		border-right: 2px solid #64748b;
		transform: rotate(45deg);
		transition: transform 0.2s ease;
	}

	/* Desktop: point left when expanded, right when minimized */
	.chevron-icon {
		transform: rotate(-135deg); /* Point left (hide panel) */
	}

	.chevron-icon.minimized {
		transform: rotate(45deg); /* Point right (show panel) */
	}

	/* Mobile: point down when expanded, up when minimized */
	@media (max-width: 640px) {
		.chevron-icon {
			transform: rotate(135deg); /* Point down (hide panel) */
		}

		.chevron-icon.minimized {
			transform: rotate(-45deg); /* Point up (show panel) */
		}
	}
	.sidebar-content {
		flex: 1;
		padding: 1rem;
		overflow-y: auto;
	}

	:global(.custom-geocoder-position) {
		position: absolute;
		top: 10px;
		left: 50px;
		z-index: 1000;
	}

	/* Mobile responsive layout */
	@media (max-width: 640px) {
		:global(.mobile-map-height) {
			height: 100dvh !important;
		}

		/* Show sidebar as bottom panel on mobile */
		.app-container {
			flex-direction: column;
		}

		.map-container {
			height: 60vh; /* Map takes 60% of viewport height when panel is expanded */
		}

		/* Dynamic map controls positioning based on panel state */
		:global(.maplibregl-ctrl-bottom-left) {
			bottom: 40vh !important; /* Default expanded state */
			transition: bottom 0.3s ease;
		}

		:global(.maplibregl-ctrl-bottom-right) {
			bottom: 40vh !important; /* Default expanded state */
			transition: bottom 0.3s ease;
		}

		.layers-sidebar {
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
			width: 100% !important; /* Override desktop width */
			height: 40vh; /* Panel takes 40% of viewport height when expanded */
			border-left: none;
			border-top: 1px solid #e2e8f0;
			box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
			z-index: 900; /* Keep below the Alpha modal overlay and mobile alpha button */
			transition: height 0.3s ease;
		}

		/* Mobile minimized state */
		.layers-sidebar.minimized {
			width: 100% !important; /* Keep full width on mobile */
			height: auto; /* Only show header when minimized */
		}

		.layers-sidebar.minimized .sidebar-header h3 {
			display: block; /* Show title on mobile even when minimized */
		}

		.layers-sidebar.minimized .panel-toggle-btn {
			margin: 0; /* Reset margin on mobile */
		}

		/* Adjust map when panel is minimized on mobile */
		.app-container:has(.layers-sidebar.minimized) .map-container {
			height: calc(100vh - 60px); /* Full height minus header height */
		}

		/* Adjust controls when panel is minimized on mobile */
		.app-container:has(.layers-sidebar.minimized) :global(.maplibregl-ctrl-bottom-left),
		.app-container:has(.layers-sidebar.minimized) :global(.maplibregl-ctrl-bottom-right) {
			bottom: 60px !important; /* Position above minimized header */
		}

		.sidebar-content {
			padding: 0.75rem;
		}

		.sidebar-header {
			padding: 0.75rem 1rem;
		}

		.sidebar-header h3 {
			font-size: 1rem;
		}
	}

	.mobile-alpha-button {
		position: absolute;
		bottom: 35px;
		right: 20px;
		z-index: 9999;
		display: none;
	}

	.alpha-mobile {
		background-color: #00703c;
		color: white;
		padding: 8px 12px;
		border-radius: 4px;
		font-weight: bold;
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 1px;
		cursor: pointer;
		border: none;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		transition: background-color 0.2s;
	}

	.alpha-mobile:hover {
		background-color: #005a30;
	}

	@media (max-width: 480px) {
		.mobile-alpha-button {
			display: block;
		}
	}


</style>
