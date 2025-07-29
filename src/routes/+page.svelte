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
  import type { StyleSpecification } from 'maplibre-gl';
  
  // Types
  interface LayerConfig {
    name: string;
    id: string;
    url: string;
    sourceLayer: string;
    type: 'line' | 'fill';
    paint: any;
    hasNetworkTypes?: boolean;
    getConfig?: (networkType: string) => LayerConfig;
  }

  interface BasemapConfig {
    name: string;
    style: string | StyleSpecification;
  }

  // Configuration constants
  const MAP_BOUNDS: [number, number, number, number] = [-7.815460, 54.049760, -5.447300, 55.220990];
  const MAP_ZOOM = { min: 6, max: 18 };
  
  const BASEMAPS: Record<string, BasemapConfig> = {
    gray: {
      name: 'Gray',
      style: {
        version: 8 as const,
        sources: { 
          'esri-gray': { 
            type: 'raster' as const, 
            tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'], 
            tileSize: 256, 
            attribution: '© Esri' 
          } 
        },
        layers: [{ id: 'esri-gray', type: 'raster' as const, source: 'esri-gray' }]
      }
    },
    streets: {
      name: 'Streets',
      style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
    },
    cycling: {
      name: 'Cycling',
      style: {
        version: 8 as const,
        sources: { 
          'cyclosm-raster': { 
            type: 'raster' as const, 
            tiles: [
              'https://a.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', 
              'https://b.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', 
              'https://c.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png'
            ], 
            tileSize: 256, 
            attribution: '© CyclOSM | Map data: © OpenStreetMap contributors' 
          } 
        },
        layers: [{ id: 'cyclosm-raster', type: 'raster' as const, source: 'cyclosm-raster' }]
      }
    }
  };

  const LAYERS: Record<string, LayerConfig> = {
    routeNetwork: {
      name: 'Route Network',
      id: 'route-network',
      url: 'pmtiles:///route_network_fastest.pmtiles',
      sourceLayer: 'route_network_fastest',
      type: 'line',
      hasNetworkTypes: true,
      paint: {},
      getConfig: (networkType: string) => ({
        name: 'Route Network',
        id: `route-network-${networkType}`,
        url: `pmtiles:///route_network_${networkType}est.pmtiles`,
        sourceLayer: `route_network_${networkType}est`,
        type: 'line' as const,
        paint: {
          'line-color': [
            'interpolate', ['linear'], ['get', `all_${networkType}est_bicycle_go_dutch`],
            1, '#808080', 49, '#808080', 50, '#ffff00', 99, '#ffff00',
            100, '#80ff00', 249, '#80ff00', 250, '#00ffff', 499, '#00ffff',
            500, '#80c0ff', 999, '#80c0ff', 1000, '#0080ff', 1999, '#0080ff',
            2000, '#0000ff', 2999, '#0000ff', 3000, '#ff00ff'
          ],
          'line-width': [
            'interpolate', ['linear'], ['zoom'],
            6, 0.4, 8, 1, 10, 2, 12, 4, 14, 8, 16, 14, 18, 24
          ]
        }
      })
    },
    coherentNetwork: {
      name: 'Coherent Network',
      id: 'coherent-network',
      url: 'pmtiles:///corenet_network_ni.pmtiles',
      sourceLayer: 'corenet_network_ni_2025-06',
      type: 'line',
      paint: {
        'line-color': [
          'step', ['to-number', ['get', 'all_fastest_bicycle_go_dutch'], 0],
          '#ffbf00', 1000, '#de3163'
        ],
        'line-width': ['interpolate', ['linear'], ['zoom'], 8, 3, 12, 5, 16, 8]
      }
    },
    cycleNetwork: {
      name: 'Cycle Network',
      id: 'cycle-network',
      url: 'pmtiles:///cycle_net_processed.pmtiles',
      sourceLayer: 'cycle_net_processed',
      type: 'line',
      paint: {
        'line-color': [
          'match', ['get', 'cycle_segregation'],
          'Segregated Track (wide)', '#006400',
          'Off Road Path', '#3cb371',
          'Segregated Track (narrow)', '#90ee90',
          'Shared Footway', '#ffd700',
          'Painted Cycle Lane', '#ff0000',
          '#cccccc'
        ],
        'line-width': ['interpolate', ['linear'], ['zoom'], 8, 1, 12, 2, 16, 4]
      }
    },
    gapAnalysis: {
      name: 'Gap Analysis',
      id: 'gap-analysis',
      url: 'pmtiles:///gap_map.pmtiles',
      sourceLayer: 'gap_map_2025-06',
      type: 'line',
      paint: {
        'line-color': [
          'match', ['get', 'gap_priority'],
          'Critical Gap', '#ff0000',
          'High Priority Gap', '#ff8000',
          'Medium Priority Gap', '#ffff00',
          'No Gap', '#cccccc',
          'rgba(0, 0, 0, 0)'
        ],
        'line-width': [
          'case', ['==', ['get', 'gap_priority'], 'No Gap'], 1, 3
        ]
      }
    },
    localAuthorities: {
      name: 'Local Authorities',
      id: 'local-authorities',
      url: 'pmtiles:///Local_Authority.pmtiles',
      sourceLayer: 'Local_Authority_2025-06',
      type: 'fill',
      paint: {
        'fill-color': [
          'match', ['get', 'LGDNAME'],
          'ANTRIM AND NEWTOWNABBEY', '#a6cee3',
          'ARMAGH CITY, BANBRIDGE AND CRAIGAVON', '#1f78b4',
          'BELFAST', '#b2df8a',
          'CAUSEWAY COAST AND GLENS', '#33a02c',
          'DERRY CITY AND STRABANE', '#fb9a99',
          'FERMANAGH AND OMAGH', '#e31a1c',
          'LISBURN AND CASTLEREAGH', '#fdbf6f',
          'MID AND EAST ANTRIM', '#ff7f00',
          'MID ULSTER', '#cab2d6',
          'NEWRY, MOURNE AND DOWN', '#6a3d9a',
          'ARDS AND NORTH DOWN', '#ffff99',
          '#cccccc'
        ],
        'fill-opacity': 0.5,
        'fill-outline-color': 'black'
      }
    }
  };

  // State
  let showBasemapPanel = false;
  let showLayersPanel = false;
  let currentBasemap = 'gray';
  let currentNetworkType = 'fast';
  
  // URL state management for map position
  let center: [number, number] = [-6.6, 54.6]; // Default center for Northern Ireland
  let zoom: number = 8; // Default zoom
  
  const layerStates: Record<string, boolean> = {
    routeNetwork: false,
    coherentNetwork: false,
    cycleNetwork: false,
    gapAnalysis: false,
    localAuthorities: false
  };

  // URL state management functions
  let updateTimeout: NodeJS.Timeout;

  // Initialize from URL hash on mount
  onMount(() => {
    if (browser) {
      parseURLHash();
      // Listen for hash changes (back/forward navigation)
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
      const hash = window.location.hash.slice(1); // Remove #
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
          center = [newLng, newLat]; // MapLibre uses [lng, lat] format
        }
      }
      
      // Parse basemap (4th part)
      if (parts.length >= 4 && parts[3]) {
        const basemapName = parts[3];
        if (BASEMAPS[basemapName]) {
          currentBasemap = basemapName;
        }
      }
      
      // Parse network type (5th part)
      if (parts.length >= 5 && parts[4]) {
        const networkType = parts[4];
        if (networkType === 'fast' || networkType === 'quiet') {
          currentNetworkType = networkType;
        }
      }
      
      // Parse active layers (6th part)
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
  
  // Debounce URL updates to avoid too frequent updates during pan/zoom
  function debouncedUpdateURL() {
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(updateURLHash, 100);
  }
  
  // Handle map move events
  function handleMoveEnd() {
    debouncedUpdateURL();
  }
  
  function handleZoomEnd() {
    debouncedUpdateURL();
  }

  // Reactive statement to update URL when any state changes
  $: if (center && center.length === 2 && typeof zoom === 'number' && browser) {
    debouncedUpdateURL();
  }
  
  // Watch for changes in layer states
  $: if (browser && layerStates) {
    debouncedUpdateURL();
  }
  
  // Watch for changes in basemap
  $: if (browser && currentBasemap) {
    debouncedUpdateURL();
  }
  
  // Watch for changes in network type
  $: if (browser && currentNetworkType) {
    debouncedUpdateURL();
  }

  // Computed values
  $: currentBasemapStyle = BASEMAPS[currentBasemap]?.style || BASEMAPS.gray.style;

  // Functions
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
</script>

{#if browser}
  <PMTilesProtocol />
{/if}

<MapLibre
  class="h-[calc(100vh-100px)]"
  style={currentBasemapStyle}
  bind:center
  bind:zoom
  on:moveend={handleMoveEnd}
  on:zoomend={handleZoomEnd}
>
  <NavigationControl position="top-left" />
  <FullScreenControl position="top-left" />
  <GeolocateControl position="top-left" />
  <ScaleControl position="bottom-left" unit="metric" maxWidth={200}/>

  <!-- Basemap Control -->
  <CustomControl position="top-left">
    <button 
      class="control-button large" 
      title="Change basemap"
      aria-label="Change basemap"
      onclick={() => togglePanel('basemap')}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
        <path d="M7.765 1.559a.5.5 0 0 1 .47 0l7.5 4a.5.5 0 0 1 0 .882l-7.5 4a.5.5 0 0 1-.47 0l-7.5-4a.5.5 0 0 1 0-.882z"/>
        <path d="m2.125 8.567-1.86.992a.5.5 0 0 0 0 .882l7.5 4a.5.5 0 0 0 .47 0l7.5-4a.5.5 0 0 0 0-.882l-1.86-.992-5.17 2.756a1.5 1.5 0 0 1-1.41 0z"/>
      </svg>
    </button>
  </CustomControl>

  <!-- Layers Control -->
  <CustomControl position="top-right">
    <button 
      class="control-button wide" 
      title="Toggle layers"
      aria-label="Toggle map layers panel"
      onclick={() => togglePanel('layers')}
    >
      <span>Map Layers</span>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="12" 
        height="12" 
        fill="currentColor" 
        viewBox="0 0 16 16"
        class="arrow-icon"
        class:rotated={showLayersPanel}
      >
        <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
      </svg>
    </button>
  </CustomControl>

  <!-- Basemap Panel -->
  {#if showBasemapPanel}
    <CustomControl position="top-left">
      <div class="panel left">
        <h3>Basemap</h3>
        <div class="options">
          {#each Object.entries(BASEMAPS) as [key, basemap]}
            <button 
              class="option"
              class:selected={currentBasemap === key}
              onclick={() => selectBasemap(key)}
              aria-label={`Select ${basemap.name} basemap`}
            >
              {basemap.name}
            </button>
          {/each}
        </div>
      </div>
    </CustomControl>
  {/if}

  <!-- Layers Panel -->
  {#if showLayersPanel}
    <CustomControl position="top-right">
      <div class="panel right">
        <h3>Map Layers</h3>
        <div class="options">
          {#each Object.entries(LAYERS) as [key, layer]}
            <div class="option">
              <label>
                <input type="checkbox" bind:checked={layerStates[key]} />
                {layer.name}
              </label>
              {#if key === 'routeNetwork' && layerStates[key]}
                <div class="network-types">
                  <label>
                    <input type="radio" name="networkType" value="fast" bind:group={currentNetworkType} />
                    Fastest
                  </label>
                  <label>
                    <input type="radio" name="networkType" value="quiet" bind:group={currentNetworkType} />
                    Quietest
                  </label>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </CustomControl>
  {/if}

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
              minzoom={MAP_ZOOM.min}
              maxzoom={MAP_ZOOM.max}
            />
          </VectorTileSource>
        {/key}
      {:else}
        <VectorTileSource id={layer.id} url={layer.url} attribution="PCTNI">
          {#if layer.type === 'fill'}
            <FillLayer
              sourceLayer={layer.sourceLayer}
              paint={layer.paint}
              minzoom={MAP_ZOOM.min}
              maxzoom={MAP_ZOOM.max}
            />
          {:else}
            <LineLayer
              sourceLayer={layer.sourceLayer}
              paint={layer.paint}
              minzoom={MAP_ZOOM.min}
              maxzoom={MAP_ZOOM.max}
            />
          {/if}
        </VectorTileSource>
      {/if}
    {/if}
  {/each}
</MapLibre>

<style>
  .control-button {
    background-color: #fff;
    border: 0;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 0 0 2px rgba(0,0,0,.1);
    margin: 10px;
  }

  .control-button:hover {
    background-color: #f0f0f0;
  }

  .control-button.large {
    width: 40px;
    height: 40px;
    padding: 0;
  }

  .control-button.wide {
    padding: 8px 12px;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    min-width: 120px;
    justify-content: space-between;
  }

  .arrow-icon {
    transition: transform 0.2s ease;
  }

  .arrow-icon.rotated {
    transform: rotate(180deg);
  }

  .panel {
    position: absolute;
    top: 50px;
    background-color: #fff;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0,0,0,.15);
    padding: 15px;
    z-index: 100;
    width: 250px;
  }

  .panel.left {
    left: 10px;
    width: 200px;
  }

  .panel.right {
    right: 10px;
  }

  .panel h3 {
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

  .option.selected {
    background-color: #007bff;
    color: #fff;
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