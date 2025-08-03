<script lang="ts">
	import BasemapPanel from './BasemapPanel.svelte';
	import LayerPanel from './LayerPanel.svelte';

	type ControlType = 'basemap' | 'layers';
	type Position = 'left' | 'right';

	interface Props {
		controlType: ControlType;
		showPanel: boolean;
		onToggle: () => void;
		title: string;
		position: Position;

		// Basemap props
		currentBasemap?: string;
		onBasemapSelect?: (key: string) => void;

		// Layers props
		layerStates?: Record<string, boolean>;
		currentNetworkType?: string;
		currentNetworkColor?: string;
		onToggleLayer?: (key: string) => void;
		onNetworkTypeChange?: (type: string) => void;
		onNetworkColorChange?: (color: string) => void;
	}

	let {
		controlType,
		showPanel,
		onToggle,
		title,
		position,
		currentBasemap,
		onBasemapSelect,
		layerStates,
		currentNetworkType,
		currentNetworkColor,
		onToggleLayer,
		onNetworkTypeChange,
		onNetworkColorChange
	}: Props = $props();
</script>

<div class="control-panel {position}" class:expanded={showPanel}>
	<button class="panel-header" {title} aria-label={title} onclick={onToggle}>
		{#if position === 'left'}
			<!-- Basemap icon -->
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="18"
				height="18"
				fill="currentColor"
				viewBox="0 0 16 16"
			>
				<path
					d="M7.765 1.559a.5.5 0 0 1 .47 0l7.5 4a.5.5 0 0 1 0 .882l-7.5 4a.5.5 0 0 1-.47 0l-7.5-4a.5.5 0 0 1 0-.882z"
				/>
				<path
					d="m2.125 8.567-1.86.992a.5.5 0 0 0 0 .882l7.5 4a.5.5 0 0 0 .47 0l7.5-4a.5.5 0 0 0 0-.882l-1.86-.992-5.17 2.756a1.5 1.5 0 0 1-1.41 0z"
				/>
			</svg>
		{:else}
			<span>{title}</span>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="12"
				height="12"
				fill="currentColor"
				viewBox="0 0 16 16"
				class="arrow-icon"
				class:rotated={showPanel}
			>
				<path
					fill-rule="evenodd"
					d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
				/>
			</svg>
		{/if}
	</button>

	{#if showPanel}
		<div class="panel-content">
			{#if controlType === 'basemap'}
				<BasemapPanel {currentBasemap} {onBasemapSelect} {onToggle} />
			{:else if controlType === 'layers'}
				<LayerPanel
					{layerStates}
					{currentNetworkType}
					{currentNetworkColor}
					{onToggleLayer}
					{onNetworkTypeChange}
					{onNetworkColorChange}
				/>
			{/if}
		</div>
	{/if}
</div>

<style>
	.control-panel {
		position: relative;
		background-color: #fff;
		border-radius: 6px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		z-index: 100;
		transition: all 0.2s ease;
	}

	.control-panel.left {
		width: 30px;
	}

	.control-panel.right {
		min-width: 120px;
	}

	.control-panel.expanded.left {
		width: 180px;
	}

	.control-panel.expanded.right {
		width: 250px;
	}

	.panel-header {
		background: none;
		border: 0;
		border-radius: 6px;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		padding: 8px 12px;
		font-size: 14px;
		font-weight: 500;
		color: #333;
		transition: background-color 0.2s ease;
	}

	.control-panel.left .panel-header {
		width: 30px;
		height: 30px;
		padding: 0;
		justify-content: center;
	}

	.control-panel.right .panel-header {
		justify-content: space-between;
		gap: 8px;
	}

	.panel-header:hover {
		background-color: #f0f0f0;
	}

	.panel-content {
		padding: 0 15px 15px 15px;
		max-height: 60vh;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.arrow-icon {
		transition: transform 0.2s ease;
	}

	.arrow-icon.rotated {
		transform: rotate(180deg);
	}
</style>
