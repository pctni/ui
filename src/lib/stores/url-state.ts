import { browser } from '$app/environment';
import { writable, derived, get } from 'svelte/store';

interface URLState {
	center: [number, number];
	zoom: number;
	basemap: string;
	networkType: string;
	activeLayers: Set<string>;
}

const DEFAULT_STATE: URLState = {
	center: [-6.6, 54.6],
	zoom: 8,
	basemap: 'gray',
	networkType: 'fast',
	activeLayers: new Set()
};

class URLStateManager {
	private _state = writable<URLState>(structuredClone(DEFAULT_STATE));
	private updateTimeout: ReturnType<typeof setTimeout> | null = null;

	constructor() {
		if (browser) {
			this.parseURLHash();
			window.addEventListener('hashchange', () => this.parseURLHash());
		}
	}

	get state() {
		return this._state;
	}

	// Method to get current state values
	getCurrentState() {
		return get(this._state);
	}

	// Method to be called when map moves/zooms
	onMapMove(center: [number, number], zoom: number) {
		this._state.update(state => ({ ...state, center, zoom }));
		this.debouncedUpdateURL();
	}

	setBasemap(basemap: string) {
		this._state.update(state => ({ ...state, basemap }));
		this.updateURL();
	}

	setNetworkType(networkType: string) {
		this._state.update(state => ({ ...state, networkType }));
		this.updateURL();
	}

	toggleLayer(layerKey: string) {
		this._state.update(state => {
			const newActiveLayers = new Set(state.activeLayers);
			if (newActiveLayers.has(layerKey)) {
				newActiveLayers.delete(layerKey);
			} else {
				newActiveLayers.add(layerKey);
			}
			return { ...state, activeLayers: newActiveLayers };
		});
		this.updateURL();
	}

	private parseURLHash() {
		if (!browser) return;

		try {
			const hash = window.location.hash.slice(1);
			if (!hash) return;

			const parts = hash.split('/');

			this._state.update(state => {
				const newState = { ...state };

				// Parse map position (zoom/lat/lng)
				if (parts.length >= 3) {
					const [zoomStr, latStr, lngStr] = parts;
					const newZoom = parseFloat(zoomStr);
					const newLat = parseFloat(latStr);
					const newLng = parseFloat(lngStr);

					if (this.isValidMapPosition(newZoom, newLat, newLng)) {
						newState.zoom = newZoom;
						newState.center = [newLng, newLat];
					}
				}

				// Parse basemap
				if (parts[3]) {
					newState.basemap = parts[3];
				}

				// Parse network type
				if (parts[4] && ['fast', 'quiet'].includes(parts[4])) {
					newState.networkType = parts[4];
				}

				// Parse active layers
				if (parts[5] && parts[5] !== 'none') {
					newState.activeLayers = new Set(parts[5].split(','));
				} else {
					newState.activeLayers = new Set();
				}

				return newState;
			});
		} catch (error) {
			console.warn('Failed to parse URL hash:', error);
		}
	}

	private isValidMapPosition(zoom: number, lat: number, lng: number): boolean {
		return (
			!isNaN(zoom) && zoom >= 0 && zoom <= 24 &&
			!isNaN(lat) && lat >= -90 && lat <= 90 &&
			!isNaN(lng) && lng >= -180 && lng <= 180
		);
	}

	private updateURL() {
		if (!browser) return;

		try {
			const state = get(this._state);
			const { center, zoom, basemap, networkType, activeLayers } = state;
			const layersStr = activeLayers.size > 0 ? Array.from(activeLayers).join(',') : 'none';
			
			const newHash = `#${zoom.toFixed(2)}/${center[1].toFixed(4)}/${center[0].toFixed(4)}/${basemap}/${networkType}/${layersStr}`;
			
			if (window.location.hash !== newHash) {
				window.history.replaceState(null, '', newHash);
			}
		} catch (error) {
			console.warn('Failed to update URL hash:', error);
		}
	}

	private debouncedUpdateURL() {
		if (this.updateTimeout) {
			clearTimeout(this.updateTimeout);
		}
		this.updateTimeout = setTimeout(() => this.updateURL(), 100);
	}
}

export function createURLStateManager() {
	return new URLStateManager();
}
