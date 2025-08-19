export interface LegendConfig {
	type: 'gradient' | 'categorical';
	items: {
		color: string;
		label: string;
		value?: number | string;
	}[];
	description?: string;
}

// Color schemes based on the layer configurations
export const LEGEND_CONFIGS: Record<
	string,
	LegendConfig | ((networkType?: string, networkColor?: string) => LegendConfig)
> = {
	routeNetwork: (networkType: string = 'fast', networkColor: string = 'bicycle') => {
		if (['quietness'].includes(networkColor)) {
			return {
				type: 'gradient' as const,
				description: 'Cycle friendliness score (quietness)',
				items: [
					{ color: '#5a0f52', label: '0-25', value: 0 },
					{ color: '#d6899d', label: '25-50', value: 25 },
					{ color: '#4cb4b2', label: '50-75', value: 50 },
					{ color: '#0b651f', label: '75-100', value: 75 }
				]
			};
		}
		if (['gradient'].includes(networkColor)) {
			return {
				type: 'gradient' as const,
				description: 'Average gradient %',
				items: [
					{ color: '#6f5138', label: '0-3%', value: 0 },
					{ color: '#d89078', label: '4-5%', value: 0.04 },
					{ color: '#f8bfb4', label: '5%+', value: 0.05 }
				]
			};
		}
		const colorFieldLabels: Record<string, string> = {
			bicycle: 'Baseline cycling',
			bicycle_govtarget: 'Government target',
			bicycle_godutch: 'Go Dutch'
		};
		return {
			type: 'gradient' as const,
			description: `${colorFieldLabels[networkColor] || 'Cycling levels'} - trips per day`,
			items: [
				{ color: '#808080', label: '1-49', value: 1 },
				{ color: '#ffff00', label: '50-199', value: 50 },
				{ color: '#80ff00', label: '200-499', value: 200 },
				{ color: '#0080ff', label: '500-999', value: 500 },
				{ color: '#ff00ff', label: '1,000+', value: 1000 }
			]
		};
	},

	coherentNetwork: {
		type: 'categorical' as const,
		description: 'Coherent network alignment',
		items: [{ color: '#ffbf00', label: 'Coherent Network' }]
	},

	cycleNetwork: {
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
		type: 'categorical' as const,
		description: 'Priority gaps in cycle network',
		items: [
			{ color: '#ff0000', label: 'Critical Gap' },
			{ color: '#ff8000', label: 'High Priority Gap' },
			{ color: '#ffff00', label: 'Medium Priority Gap' },
			{ color: '#cccccc', label: 'No Gap' }
		]
	}
};
