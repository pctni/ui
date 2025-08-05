export type PanelType = 'basemap' | 'layers';

export interface PanelState {
	showBasemapPanel: boolean;
	showLayersPanel: boolean;
}

export function togglePanel(
	currentState: PanelState,
	panelToToggle: PanelType
): PanelState {
	if (panelToToggle === 'basemap') {
		return {
			showBasemapPanel: !currentState.showBasemapPanel,
			showLayersPanel: false
		};
	} else {
		return {
			showLayersPanel: !currentState.showLayersPanel,
			showBasemapPanel: false
		};
	}
}

export function closeAllPanels(): PanelState {
	return { showBasemapPanel: false, showLayersPanel: false };
}

export function isAnyPanelOpen(state: PanelState): boolean {
	return state.showBasemapPanel || state.showLayersPanel;
}
