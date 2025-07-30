<script lang="ts">
	interface Props {
		showPanel: boolean;
		onToggle: () => void;
		title: string;
		children: import('svelte').Snippet;
		position: 'left' | 'right';
	}

	let { showPanel, onToggle, title, children, position }: Props = $props();
</script>

<button 
	class="control-button {position === 'left' ? 'large' : 'wide'}" 
	title={title}
	aria-label={title}
	onclick={onToggle}
>
	{#if position === 'left'}
		<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
			<path d="M7.765 1.559a.5.5 0 0 1 .47 0l7.5 4a.5.5 0 0 1 0 .882l-7.5 4a.5.5 0 0 1-.47 0l-7.5-4a.5.5 0 0 1 0-.882z"/>
			<path d="m2.125 8.567-1.86.992a.5.5 0 0 0 0 .882l7.5 4a.5.5 0 0 0 .47 0l7.5-4a.5.5 0 0 0 0-.882l-1.86-.992-5.17 2.756a1.5 1.5 0 0 1-1.41 0z"/>
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
			<path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
		</svg>
	{/if}
</button>

{#if showPanel}
	<div class="panel {position}">
		{@render children()}
	</div>
{/if}

<style>
	.control-button {
		background-color: #fff;
		border: 0;
		border-radius: 4px;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
		box-shadow: 0 0 0 2px rgba(0,0,0,.1);
		margin: 10px;
	}

	.control-button:hover {
		background-color: #f0f0f0;
	}

	.control-button.large {
		width: 40px;
		height: 40px;
		padding: 0;
	}

	.control-button.wide {
		padding: 8px 12px;
		gap: 8px;
		font-size: 14px;
		font-weight: 500;
		color: #333;
		min-width: 120px;
		justify-content: space-between;
	}

	.arrow-icon {
		transition: transform 0.2s ease;
	}

	.arrow-icon.rotated {
		transform: rotate(180deg);
	}

	.panel {
		position: absolute;
		top: 50px;
		background-color: #fff;
		border-radius: 6px;
		box-shadow: 0 2px 8px rgba(0,0,0,.15);
		padding: 15px;
		z-index: 100;
		width: 250px;
	}

	.panel.left {
		left: 10px;
		width: 200px;
	}

	.panel.right {
		right: 10px;
	}
</style>
