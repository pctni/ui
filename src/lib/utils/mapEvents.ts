import type { Map } from 'maplibre-gl';

// Types for map event handling
export interface MapEventHandlers {
	onMoveEnd: (map: Map) => void;
	onZoomEnd: (map: Map) => void;
}

/**
 * Create map event handlers with the given update callback
 */
export function createMapEventHandlers(
	updateCallback: (center: [number, number], zoom: number) => void,
	shouldUpdate: () => boolean
): MapEventHandlers {
	return {
		onMoveEnd: (map: Map) => {
			if (shouldUpdate()) {
				const center = map.getCenter();
				const zoom = map.getZoom();
				updateCallback([center.lng, center.lat], zoom);
			}
		},
		
		onZoomEnd: (map: Map) => {
			if (shouldUpdate()) {
				const center = map.getCenter();
				const zoom = map.getZoom();
				updateCallback([center.lng, center.lat], zoom);
			}
		}
	};
}

/**
 * Utility to check if map updates should be processed
 */
export function shouldProcessMapUpdate(
	isUpdatingFromURL: boolean,
	mapInstance: Map | undefined,
	showBasemapPanel: boolean,
	showLayersPanel: boolean
): boolean {
	return !isUpdatingFromURL && !!mapInstance && !showBasemapPanel && !showLayersPanel;
}
