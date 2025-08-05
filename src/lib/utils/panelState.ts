// Types for panel management
export type PanelType = 'basemap' | 'layers';

export interface PanelState {
	showBasemapPanel: boolean;
	showLayersPanel: boolean;
}

/**
 * Toggle a panel and ensure only one panel is open at a time
 */
export function togglePanel(
	currentState: PanelState,
	panelToToggle: PanelType
): PanelState {
	if (panelToToggle === 'basemap') {
		return {
			showBasemapPanel: !currentState.showBasemapPanel,
			showLayersPanel: false // Always close the other panel
		};
	} else {
		return {
			showLayersPanel: !currentState.showLayersPanel,
			showBasemapPanel: false // Always close the other panel
		};
	}
}

/**
 * Close all panels
 */
export function closeAllPanels(): PanelState {
	return {
		showBasemapPanel: false,
		showLayersPanel: false
	};
}

/**
 * Check if any panel is currently open
 */
export function isAnyPanelOpen(state: PanelState): boolean {
	return state.showBasemapPanel || state.showLayersPanel;
}
