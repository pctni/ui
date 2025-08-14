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
		type: 'gradient' as const,
		description: 'Go Dutch cycling potential - trips per day',
		items: [
			{ color: '#ffbf00', label: '0-999', value: 0 },
			{ color: '#de3163', label: '1,000+', value: 1000 }
		]
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
