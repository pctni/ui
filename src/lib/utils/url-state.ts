import { BASEMAPS } from '$lib/config/basemaps.js';

export type LayerStates = {
	routeNetwork: boolean;
	coherentNetwork: boolean;
	cycleNetwork: boolean;
	gapAnalysis: boolean;
	localAuthorities: boolean;
};

export type MapState = {
	zoom: number;
	center: [number, number];
	basemap: string;
	networkType: string;
	networkColor: string;
	layers: LayerStates;
};

/**
 * Validates coordinate values
 */
function isValidCoordinate(zoom: number, lat: number, lng: number): boolean {
	return !isNaN(zoom) && zoom >= 0 && zoom <= 24 &&
		   !isNaN(lat) && lat >= -90 && lat <= 90 &&
		   !isNaN(lng) && lng >= -180 && lng <= 180;
}

/**
 * Parses map position from URL parts
 */
function parseMapPosition(parts: string[]): { zoom: number; center: [number, number] } | null {
	if (parts.length < 3) return null;
	
	const [zoomStr, latStr, lngStr] = parts;
	const zoom = parseFloat(zoomStr);
	const lat = parseFloat(latStr);
	const lng = parseFloat(lngStr);
	
	return isValidCoordinate(zoom, lat, lng) ? { zoom, center: [lng, lat] } : null;
}

/**
 * Parses basemap from URL parts
 */
function parseBasemap(parts: string[]): string | null {
	if (parts.length < 4 || !parts[3]) return null;
	
	const basemapName = parts[3];
	return BASEMAPS[basemapName] ? basemapName : null;
}

/**
 * Parses network type from URL parts
 */
function parseNetworkType(parts: string[]): string | null {
	if (parts.length < 5 || !parts[4]) return null;
	
	const networkType = parts[4];
	return ['fast', 'quiet', 'none'].includes(networkType) ? networkType : null;
}

/**
 * Parses active layers from URL parts
 */
function parseActiveLayers(parts: string[], layerKeys: string[]): Partial<LayerStates> {
	if (parts.length < 6 || !parts[5]) return {};
	
	const layersStr = parts[5];
	if (layersStr === 'none') return {};
	
	const activeLayers = layersStr.split(',');
	return Object.fromEntries(
		layerKeys.map(key => [key, activeLayers.includes(key)])
	) as Partial<LayerStates>;
}

/**
 * Parses URL hash and returns map state updates
 */
export function parseURLHash(hash: string, layerKeys: string[]): Partial<MapState> {
	if (!hash) return {};
	
	const parts = hash.slice(1).split('/');
	const updates: Partial<MapState> = {};
	
	// Parse map position
	const position = parseMapPosition(parts);
	if (position) {
		updates.zoom = position.zoom;
		updates.center = position.center;
	}
	
	// Parse basemap
	const basemap = parseBasemap(parts);
	if (basemap) updates.basemap = basemap;
	
	// Parse network type
	const networkType = parseNetworkType(parts);
	if (networkType) updates.networkType = networkType;
	
	// Parse layers
	const layers = parseActiveLayers(parts, layerKeys);
	if (Object.keys(layers).length > 0) updates.layers = layers as LayerStates;
	
	return updates;
}

/**
 * Generates URL hash from current map state
 */
export function generateURLHash(state: MapState): string {
	const activeLayers = Object.entries(state.layers)
		.filter(([, value]) => value)
		.map(([key]) => key);
	
	const layersStr = activeLayers.length > 0 ? activeLayers.join(',') : 'none';
	const networkTypeStr = state.networkType || 'none';
	
	return `#${state.zoom.toFixed(2)}/${state.center[1].toFixed(4)}/${state.center[0].toFixed(4)}/${state.basemap}/${networkTypeStr}/${layersStr}`;
}
