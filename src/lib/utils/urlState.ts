import { browser } from '$app/environment';
import { BASEMAPS } from '$lib/config/basemaps.js';

// Types for URL state management
export interface MapState {
	zoom: number;
	center: [number, number];
	currentBasemap: string;
	currentNetworkType: string;
	layerStates: Record<string, boolean>;
}

export interface URLParseResult {
	zoom?: number;
	center?: [number, number];
	currentBasemap?: string;
	currentNetworkType?: string;
	layerStates?: Record<string, boolean>;
}

/**
 * Parse URL hash pattern: #zoom/lat/lng/basemap/networkType/layers
 */
export function parseURLHash(): URLParseResult {
	if (!browser) return {};
	
	try {
		const hash = window.location.hash.slice(1);
		if (!hash) return {};
		
		const parts = hash.split('/');
		const result: URLParseResult = {};
		
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
				result.zoom = newZoom;
				result.center = [newLng, newLat];
			}
		}
		
		// Parse basemap
		if (parts.length >= 4 && parts[3]) {
			const basemapName = parts[3];
			if (BASEMAPS[basemapName]) {
				result.currentBasemap = basemapName;
			}
		}
		
		// Parse network type
		if (parts.length >= 5 && parts[4]) {
			const networkType = parts[4];
			if (networkType === 'fast' || networkType === 'quiet') {
				result.currentNetworkType = networkType;
			} else if (networkType === 'none' || networkType === '') {
				result.currentNetworkType = '';
			}
		} else {
			result.currentNetworkType = '';
		}
		
		// Parse active layers
		if (parts.length >= 6 && parts[5]) {
			const layersStr = parts[5];
			const layerStates: Record<string, boolean> = {
				routeNetwork: false,
				coherentNetwork: false,
				cycleNetwork: false,
				gapAnalysis: false,
				localAuthorities: false
			};
			
			// Enable specified layers
			if (layersStr !== 'none') {
				const activeLayers = layersStr.split(',');
				activeLayers.forEach(layerName => {
					if (layerStates.hasOwnProperty(layerName)) {
						layerStates[layerName] = true;
					}
				});
			}
			
			// Set route network layer state based on network type
			const networkType = result.currentNetworkType || '';
			layerStates.routeNetwork = networkType !== '' && (networkType === 'fast' || networkType === 'quiet');
			
			result.layerStates = layerStates;
		}
		
		return result;
	} catch (error) {
		console.warn('Failed to parse URL hash:', error);
		return {};
	}
}

/**
 * Generate URL hash from current map state
 */
export function generateURLHash(state: MapState): string {
	if (!browser || !state.center || typeof state.zoom !== 'number') return '';
	
	try {
		// Get active layers
		const activeLayers = Object.entries(state.layerStates)
			.filter(([key, value]) => value)
			.map(([key, value]) => key);
		
		const layersStr = activeLayers.length > 0 ? activeLayers.join(',') : 'none';
		const networkTypeStr = state.currentNetworkType || 'none';
		
		// Format: #zoom/lat/lng/basemap/networkType/layers
		return `#${state.zoom.toFixed(2)}/${state.center[1].toFixed(4)}/${state.center[0].toFixed(4)}/${state.currentBasemap}/${networkTypeStr}/${layersStr}`;
	} catch (error) {
		console.warn('Failed to generate URL hash:', error);
		return '';
	}
}

/**
 * Update browser URL with current map state
 */
export function updateBrowserURL(state: MapState): void {
	const newHash = generateURLHash(state);
	
	if (newHash && window.location.hash !== newHash) {
		window.history.replaceState(null, '', newHash);
	}
}

/**
 * Create a debounced version of a function
 */
export function debounce<T extends (...args: any[]) => void>(
	func: T, 
	delay: number
): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout>;
	
	return (...args: Parameters<T>) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => func(...args), delay);
	};
}
