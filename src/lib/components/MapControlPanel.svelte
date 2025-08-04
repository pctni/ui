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

<div class="relative bg-white rounded-md shadow-lg z-50 transition-all duration-200 {position === 'left' ? (showPanel ? 'w-44' : 'w-[30px]') : (showPanel ? 'w-72' : 'min-w-48')}">
	<button 
		class="bg-none border-0 rounded-md cursor-pointer flex items-center font-medium text-gray-800 transition-colors duration-200 hover:bg-gray-50 
		{position === 'left' 
			? 'w-[30px] h-[30px] p-0 justify-center shrink-0' 
			: 'w-full justify-between gap-2 py-2.5 px-4 text-base'
		}" 
		{title} 
		aria-label={title} 
		onclick={onToggle}
	>
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
				class="transition-transform duration-200 {showPanel ? 'rotate-180' : ''}"
			>
				<path
					fill-rule="evenodd"
					d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
				/>
			</svg>
		{/if}
	</button>

	{#if showPanel}
		<div class="px-4 pb-4 max-h-96 overflow-y-auto flex flex-col gap-2">
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


