export interface LayerConfig {
	name: string;
	id: string;
	url: string;
	sourceLayer: string;
	type: 'line' | 'fill';
	paint: any;
	hasNetworkTypes?: boolean;
	getConfig?: (networkType: string) => LayerConfig;
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
} as const;

export const MAP_CONFIG = {
	BOUNDS: [-7.815460, 54.049760, -5.447300, 55.220990] as [number, number, number, number],
	ZOOM: { min: 6, max: 18 },
	DEFAULT_CENTER: [-6.6, 54.6] as [number, number],
	DEFAULT_ZOOM: 8
} as const;
