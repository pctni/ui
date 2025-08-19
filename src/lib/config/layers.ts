export interface LayerConfig {
	name: string;
	id: string;
	url: string;
	sourceLayer: string;
	type: 'line' | 'fill';
	paint: any;
	hasNetworkTypes?: boolean;
	getConfig?: (networkType: string, networkColor?: string) => LayerConfig;
}

export const LAYERS: Record<string, LayerConfig> = {
	routeNetwork: {
		name: 'Route Network',
		id: 'route-network',
		url: 'pmtiles:///route_network_fastest.pmtiles',
		sourceLayer: 'route_network_fastest',
		type: 'line',
		hasNetworkTypes: true,
		paint: {},
		getConfig: (networkType: string, networkColor: string = 'bicycle') => {
			// Ensure unique layer and source ids for each networkType and color
			const layerId = `route-network-${networkType}-${networkColor}`;
			const url =
				networkType === 'fast'
					? 'pmtiles:///route_network_fastest.pmtiles'
					: 'pmtiles:///route_network_quietest.pmtiles';
			const sourceLayer =
				networkType === 'fast' ? 'route_network_fastest' : 'route_network_quietest';
			// Attribute names in tiles now directly match dropdown values
			const colorAttr = networkColor;
			let lineColor: any;
			if (['bicycle', 'bicycle_govtarget', 'bicycle_godutch'].includes(networkColor)) {
				// Trips per day ramp
				lineColor = [
					'interpolate',
					['linear'],
					['get', colorAttr],
					1, '#808080',
					49, '#808080',
					50, '#ffff00',
					199, '#ffff00',
					200, '#80ff00',
					499, '#80ff00',
					500, '#0080ff',
					999, '#0080ff',
					1000, '#ff00ff'
				];
			} else if (networkColor === 'quietness') {
				// Quietness score 0-100 (cycle friendliness) bins: 0-25 / 25-50 / 50-75 / 75-100
				// Colors approximated from provided legend screenshot
				lineColor = [
					'step',
					['get', 'quietness'],
					'#5a0f52',
					25, '#d6899d',
					50, '#4cb4b2',
					75, '#0b651f'
				];
			} else if (networkColor === 'gradient') {
				// Gradient fraction (e.g. 0.02 = 2%). Bins: 0-0.03, 0.04-0.05, >0.05
				// Update: least steep now uses previous middle tan, steeper segments lighter & redder
				lineColor = [
					'step',
					['get', 'gradient'],
					'#6f5138', // 0 - 0.029.. gentle (darker for stronger contrast)
					0.04, '#d89078', // 0.04 - 0.049.. moderate (mid tone)
					0.05, '#f8bfb4' // 0.05+ steep (lightest & redder)
				];
			} else {
				// Fallback single color
				lineColor = '#808080';
			}
			return {
				name: 'Route Network',
				id: layerId,
				url,
				sourceLayer,
				type: 'line' as const,
				paint: {
					'line-color': lineColor,
					'line-width': [
						'interpolate',
						['linear'],
						['zoom'],
						6,
						0.4,
						8,
						1,
						10,
						2,
						12,
						4,
						14,
						8,
						16,
						14,
						18,
						24
					]
				}
			};
		}
	},
	coherentNetwork: {
		name: 'Coherent Network',
		id: 'coherent-network',
		url: 'pmtiles:///corenet_network_ni.pmtiles',
		sourceLayer: 'corenet_network_ni',
		type: 'line',
		paint: {
			'line-color': '#ffbf00',
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
				'match',
				['get', 'cycle_segregation'],
				'Segregated Track (wide)',
				'#006400',
				'Off Road Path',
				'#3cb371',
				'Segregated Track (narrow)',
				'#90ee90',
				'Shared Footway',
				'#ffd700',
				'Painted Cycle Lane',
				'#ff0000',
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
				'match',
				['get', 'gap_priority'],
				'Critical Gap',
				'#ff0000',
				'High Priority Gap',
				'#ff8000',
				'Medium Priority Gap',
				'#ffff00',
				'No Gap',
				'#cccccc',
				'rgba(0, 0, 0, 0)'
			],
			'line-width': ['case', ['==', ['get', 'gap_priority'], 'No Gap'], 1, 3]
		}
	},
	localAuthorities: {
		name: 'Local Authority Boundaries',
		id: 'local-authorities',
		url: 'pmtiles:///Local_Authority.pmtiles',
		sourceLayer: 'Local_Authority_2025-06',
		type: 'line',
		paint: {
			'line-color': '#333333',
			'line-width': 2
		}
	}
} as const;

export const MAP_CONFIG = {
	BOUNDS: [-7.81546, 54.04976, -5.4473, 55.22099] as [number, number, number, number],
	ZOOM: { min: 6, max: 18 },
	DEFAULT_CENTER: [-6.6, 54.6] as [number, number],
	DEFAULT_ZOOM: 8
} as const;
