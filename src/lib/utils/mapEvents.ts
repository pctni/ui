import type { Map } from 'maplibre-gl';

export interface MapEventHandlers {
	onMoveEnd: (map: Map) => void;
	onZoomEnd: (map: Map) => void;
}

export function createMapEventHandlers(
	updateCallback: (center: [number, number], zoom: number) => void,
	shouldUpdate: () => boolean
): MapEventHandlers {
	return {
		onMoveEnd: (map: Map) => {
			if (shouldUpdate()) {
				const center = map.getCenter();
				updateCallback([center.lng, center.lat], map.getZoom());
			}
		},
		onZoomEnd: (map: Map) => {
			if (shouldUpdate()) {
				const center = map.getCenter();
				updateCallback([center.lng, center.lat], map.getZoom());
			}
		}
	};
}

export function shouldProcessMapUpdate(
	isUpdatingFromURL: boolean,
	mapInstance: Map | undefined,
	showBasemapPanel: boolean,
	showLayersPanel: boolean
): boolean {
	return !isUpdatingFromURL && !!mapInstance && !showBasemapPanel && !showLayersPanel;
}
