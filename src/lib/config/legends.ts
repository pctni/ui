export interface LegendItem {
	color: string;
	label: string;
	value?: number | string;
}

export interface LegendConfig {
	title: string;
	type: 'gradient' | 'categorical';
	items: LegendItem[];
	description?: string;
}

// Color schemes based on the layer configurations
export const LEGEND_CONFIGS: Record<string, LegendConfig | ((networkType?: string, networkColor?: string) => LegendConfig)> = {
	routeNetwork: (networkType: string = 'fast', networkColor: string = 'bicycle') => {
		const colorFieldLabels: Record<string, string> = {
			'bicycle': 'Baseline cycling',
			'bicycle_govtarget': 'Government target',
			'bicycle_go_dutch': 'Go Dutch'
		};

		return {
			title: `Route Network (${networkType === 'fast' ? 'Fastest' : 'Quietest'})`,
			type: 'gradient' as const,
			description: `${colorFieldLabels[networkColor] || 'Cycling levels'} - trips per day`,
			items: [
				{ color: '#808080', label: '1-49', value: 1 },
				{ color: '#ffff00', label: '50-99', value: 50 },
				{ color: '#80ff00', label: '100-249', value: 100 },
				{ color: '#00ffff', label: '250-499', value: 250 },
				{ color: '#80c0ff', label: '500-999', value: 500 },
				{ color: '#0080ff', label: '1,000-1,999', value: 1000 },
				{ color: '#0000ff', label: '2,000-2,999', value: 2000 },
				{ color: '#ff00ff', label: '3,000+', value: 3000 }
			]
		};
	},

	coherentNetwork: {
		title: 'Coherent Network',
		type: 'gradient' as const,
		description: 'Go Dutch cycling potential - trips per day',
		items: [
			{ color: '#ffbf00', label: '0-999', value: 0 },
			{ color: '#de3163', label: '1,000+', value: 1000 }
		]
	},

	cycleNetwork: {
		title: 'Cycle Network',
		type: 'categorical' as const,
		description: 'Existing cycle infrastructure types',
		items: [
			{ color: '#006400', label: 'Segregated Track (wide)' },
			{ color: '#3cb371', label: 'Off Road Path' },
			{ color: '#90ee90', label: 'Segregated Track (narrow)' },
			{ color: '#ffd700', label: 'Shared Footway' },
			{ color: '#ff0000', label: 'Painted Cycle Lane' },
			{ color: '#cccccc', label: 'Other/Unknown' }
		]
	},

	gapAnalysis: {
		title: 'Gap Analysis',
		type: 'categorical' as const,
		description: 'Priority gaps in cycle network',
		items: [
			{ color: '#ff0000', label: 'Critical Gap' },
			{ color: '#ff8000', label: 'High Priority Gap' },
			{ color: '#ffff00', label: 'Medium Priority Gap' },
			{ color: '#cccccc', label: 'No Gap' }
		]
	},

	localAuthorities: {
		title: 'Local Authorities',
		type: 'categorical' as const,
		description: 'Northern Ireland council areas',
		items: [
			{ color: '#a6cee3', label: 'Antrim and Newtownabbey' },
			{ color: '#1f78b4', label: 'Armagh, Banbridge and Craigavon' },
			{ color: '#b2df8a', label: 'Belfast' },
			{ color: '#33a02c', label: 'Causeway Coast and Glens' },
			{ color: '#fb9a99', label: 'Derry and Strabane' },
			{ color: '#e31a1c', label: 'Fermanagh and Omagh' },
			{ color: '#fdbf6f', label: 'Lisburn and Castlereagh' },
			{ color: '#ff7f00', label: 'Mid and East Antrim' },
			{ color: '#cab2d6', label: 'Mid Ulster' },
			{ color: '#6a3d9a', label: 'Newry, Mourne and Down' },
			{ color: '#ffff99', label: 'Ards and North Down' }
		]
	}
};
