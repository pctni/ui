<script lang="ts">
	import type { LegendConfig } from '$lib/config/legends.js';
	
	interface Props {
		config: LegendConfig;
		position?: 'bottom-left' | 'bottom-right';
		collapsed?: boolean;
	}

	let { config, position = 'bottom-left', collapsed = false }: Props = $props();
	
	let isCollapsed = $state(collapsed);

	function toggleCollapse() {
		isCollapsed = !isCollapsed;
	}
</script>

<div class="legend {position}" class:collapsed={isCollapsed}>
	<div class="legend-header">
		<h4 class="legend-title">{config.title}</h4>
		<button 
			class="collapse-button"
			onclick={toggleCollapse}
			aria-label={isCollapsed ? 'Expand legend' : 'Collapse legend'}
		>
			<svg 
				xmlns="http://www.w3.org/2000/svg" 
				width="12" 
				height="12" 
				fill="currentColor" 
				viewBox="0 0 16 16"
				class="arrow-icon"
				class:rotated={isCollapsed}
			>
				<path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
			</svg>
		</button>
	</div>
	
	{#if !isCollapsed}
		<div class="legend-content">
			{#if config.description}
				<p class="legend-description">{config.description}</p>
			{/if}
			
			<div class="legend-items {config.type}">
				{#if config.type === 'gradient'}
					<!-- Gradient legend for continuous data -->
					<div class="gradient-bar">
						{#each config.items as item, index}
							<div 
								class="gradient-segment" 
								style="background-color: {item.color}; flex: 1;"
								title="{item.label} trips per day"
							></div>
						{/each}
					</div>
					<div class="gradient-labels">
						<span class="label-start">{config.items[0]?.label || ''}</span>
						<span class="label-end">{config.items[config.items.length - 1]?.label || ''}</span>
					</div>
				{:else}
					<!-- Categorical legend for discrete data -->
					{#each config.items as item}
						<div class="legend-item">
							<div 
								class="legend-color" 
								style="background-color: {item.color}"
								aria-hidden="true"
							></div>
							<span class="legend-label">{item.label}</span>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.legend {
		position: absolute;
		background-color: rgba(255, 255, 255, 0.95);
		border-radius: 6px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		padding: 12px;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		font-size: 12px;
		z-index: 50;
		max-width: 250px;
		min-width: 180px;
		backdrop-filter: blur(4px);
		border: 1px solid rgba(0, 0, 0, 0.1);
	}

	.legend.bottom-left {
		bottom: 10px;
		left: 10px;
	}

	.legend.bottom-right {
		bottom: 10px;
		right: 10px;
	}

	.legend.collapsed {
		min-width: auto;
	}

	.legend-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}

	.legend-title {
		margin: 0;
		font-size: 13px;
		font-weight: 600;
		color: #333;
		line-height: 1.2;
	}

	.collapse-button {
		background: none;
		border: none;
		cursor: pointer;
		padding: 2px;
		border-radius: 2px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #666;
		transition: all 0.2s ease;
	}

	.collapse-button:hover {
		background-color: rgba(0, 0, 0, 0.1);
		color: #333;
	}

	.arrow-icon {
		transition: transform 0.2s ease;
	}

	.arrow-icon.rotated {
		transform: rotate(-90deg);
	}

	.legend-content {
		overflow: hidden;
	}

	.legend-description {
		margin: 0 0 8px 0;
		font-size: 11px;
		color: #666;
		line-height: 1.3;
	}

	.legend-items {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.legend-items.gradient {
		gap: 6px;
	}

	/* Gradient Legend Styles */
	.gradient-bar {
		display: flex;
		height: 16px;
		border-radius: 3px;
		overflow: hidden;
		border: 1px solid rgba(0, 0, 0, 0.2);
	}

	.gradient-segment {
		min-width: 8px;
	}

	.gradient-labels {
		display: flex;
		justify-content: space-between;
		font-size: 10px;
		color: #666;
		margin-top: 2px;
	}

	/* Categorical Legend Styles */
	.legend-item {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.legend-color {
		width: 12px;
		height: 12px;
		border-radius: 2px;
		border: 1px solid rgba(0, 0, 0, 0.2);
		flex-shrink: 0;
	}

	.legend-label {
		color: #333;
		line-height: 1.2;
		font-size: 11px;
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.legend {
			max-width: 200px;
			font-size: 11px;
		}
		
		.legend-title {
			font-size: 12px;
		}
		
		.legend-description {
			font-size: 10px;
		}
		
		.legend-label {
			font-size: 10px;
		}
	}

	/* Animation for expand/collapse */
	.legend-content {
		transition: all 0.2s ease-in-out;
	}

	.legend.collapsed .legend-content {
		display: none;
	}
</style>
