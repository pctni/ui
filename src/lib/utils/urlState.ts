import { browser } from '$app/environment';
import { BASEMAPS } from '$lib/config/basemaps.js';

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

export function parseURLHash(): URLParseResult {
	if (!browser) return {};
	
	try {
		const hash = window.location.hash.slice(1);
		if (!hash) return {};
		
		const parts = hash.split('/');
		const result: URLParseResult = {};
		
		// Parse map position (zoom/lat/lng)
		if (parts.length >= 3) {
			const [zoomStr, latStr, lngStr] = parts;
			const newZoom = parseFloat(zoomStr);
			const newLat = parseFloat(latStr);
			const newLng = parseFloat(lngStr);
			
			const isValidZoom = !isNaN(newZoom) && newZoom >= 0 && newZoom <= 24;
			const isValidLat = !isNaN(newLat) && newLat >= -90 && newLat <= 90;
			const isValidLng = !isNaN(newLng) && newLng >= -180 && newLng <= 180;
			
			if (isValidZoom && isValidLat && isValidLng) {
				result.zoom = newZoom;
				result.center = [newLng, newLat];
			}
		}
		
		// Parse basemap
		if (parts.length >= 4 && parts[3] && BASEMAPS[parts[3]]) {
			result.currentBasemap = parts[3];
		}
		
		// Parse network type
		if (parts.length >= 5) {
			const networkType = parts[4];
			result.currentNetworkType = (networkType === 'fast' || networkType === 'quiet') ? networkType : '';
		} else {
			result.currentNetworkType = '';
		}
		
		// Parse active layers
		if (parts.length >= 6 && parts[5]) {
			const layerStates: Record<string, boolean> = {
				routeNetwork: false,
				coherentNetwork: false,
				cycleNetwork: false,
				gapAnalysis: false,
				localAuthorities: false
			};
			
			if (parts[5] !== 'none') {
				parts[5].split(',').forEach(layerName => {
					if (layerStates.hasOwnProperty(layerName)) {
						layerStates[layerName] = true;
					}
				});
			}
			
			const networkType = result.currentNetworkType || '';
			layerStates.routeNetwork = networkType === 'fast' || networkType === 'quiet';
			result.layerStates = layerStates;
		}
		
		return result;
	} catch (error) {
		console.warn('Failed to parse URL hash:', error);
		return {};
	}
}

export function generateURLHash(state: MapState): string {
	if (!browser || !state.center || typeof state.zoom !== 'number') return '';
	
	try {
		const activeLayers = Object.entries(state.layerStates)
			.filter(([, value]) => value)
			.map(([key]) => key);
		
		const layersStr = activeLayers.length > 0 ? activeLayers.join(',') : 'none';
		const networkTypeStr = state.currentNetworkType || 'none';
		
		return `#${state.zoom.toFixed(2)}/${state.center[1].toFixed(4)}/${state.center[0].toFixed(4)}/${state.currentBasemap}/${networkTypeStr}/${layersStr}`;
	} catch (error) {
		console.warn('Failed to generate URL hash:', error);
		return '';
	}
}

export function updateBrowserURL(state: MapState): void {
	const newHash = generateURLHash(state);
	if (newHash && window.location.hash !== newHash) {
		window.history.replaceState(null, '', newHash);
	}
}

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
