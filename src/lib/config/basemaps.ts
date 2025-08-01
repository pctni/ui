import type { StyleSpecification } from 'maplibre-gl';

export interface BasemapConfig {
	name: string;
	style: string | StyleSpecification;
}

export const BASEMAPS: Record<string, BasemapConfig> = {
	gray: {
		name: 'Gray',
		style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
	},
	streets: {
		name: 'Streets',
		style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
	},
	cycling: {
		name: 'Cycling',
		style: {
			version: 8 as const,
			sources: { 
				'cyclosm-raster': { 
					type: 'raster' as const, 
					tiles: [
						'https://a.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', 
						'https://b.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', 
						'https://c.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png'
					], 
					tileSize: 256, 
					attribution: '© CyclOSM | Map data: © OpenStreetMap contributors' 
				} 
			},
			layers: [{ id: 'cyclosm-raster', type: 'raster' as const, source: 'cyclosm-raster' }]
		}
	},
	dark: {
		name: 'Dark',
		style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
	}
} as const;
