<script lang="ts">
	import { onMount } from 'svelte';
	
	let showWarning = $state(false);
	let isFirefox = $state(false);
	let popupElement = $state<HTMLDivElement>();

	onMount(() => {
		// Check if the user is using Firefox
		isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
		
		// Only show warning if it's Firefox and user hasn't dismissed it before
		if (isFirefox && !localStorage.getItem('firefox-warning-dismissed')) {
			showWarning = true;
		}
	});

	function dismissWarning() {
		showWarning = false;
		// Remember that user dismissed the warning
		localStorage.setItem('firefox-warning-dismissed', 'true');
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			dismissWarning();
		}
	}

	function handleOverlayClick(event: MouseEvent) {
		// Close if clicking on the overlay background (not the popup content)
		if (event.target === event.currentTarget) {
			dismissWarning();
		}
	}
</script>

{#if showWarning}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div 
		class="popup-overlay" 
		onclick={handleOverlayClick}
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		aria-labelledby="popup-title"
		tabindex="-1"
		bind:this={popupElement}
	>
		<div class="popup-content">
			<div class="popup-header">
				<h3 id="popup-title">Browser Compatibility Notice</h3>
				<button class="close-button" onclick={dismissWarning} aria-label="Close warning">
					×
				</button>
			</div>
			<div class="popup-body">
				<p>
					<strong>Note:</strong> Layers may not work in your current browser, due to an 
					<a href="https://github.com/protomaps/PMTiles/issues/272" target="_blank" rel="noopener">issue</a> 
					with viewing the PMTiles file format on Firefox. Please re-open in a different browser such as Chrome.
				</p>
			</div>
			<div class="popup-footer">
				<button class="dismiss-button" onclick={dismissWarning}>
					Got it
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.popup-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
		backdrop-filter: blur(2px);
	}

	.popup-content {
		background: white;
		border-radius: 8px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
		max-width: 500px;
		width: 90%;
		max-height: 90vh;
		overflow: auto;
		animation: popup-appear 0.3s ease-out;
	}

	@keyframes popup-appear {
		from {
			opacity: 0;
			transform: scale(0.9) translateY(-20px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	.popup-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px 20px 0 20px;
		border-bottom: 1px solid #e5e5e5;
		margin-bottom: 15px;
	}

	.popup-header h3 {
		margin: 0;
		color: #333;
		font-size: 1.2em;
		font-weight: 600;
	}

	.close-button {
		background: none;
		border: none;
		font-size: 24px;
		color: #666;
		cursor: pointer;
		padding: 0;
		width: 30px;
		height: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		transition: background-color 0.2s, color 0.2s;
	}

	.close-button:hover {
		background-color: #f0f0f0;
		color: #333;
	}

	.popup-body {
		padding: 0 20px 15px 20px;
	}

	.popup-body p {
		margin: 0;
		line-height: 1.5;
		color: #555;
	}

	.popup-body a {
		color: var(--color-theme-1, #ff3e00);
		text-decoration: underline;
	}

	.popup-body a:hover {
		color: var(--color-theme-2, #4075a6);
	}

	.popup-footer {
		padding: 15px 20px 20px 20px;
		display: flex;
		justify-content: flex-end;
	}

	.dismiss-button {
		background-color: var(--color-theme-1, #ff3e00);
		color: white;
		border: none;
		padding: 10px 20px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 14px;
		font-weight: 500;
		transition: background-color 0.2s;
	}

	.dismiss-button:hover {
		background-color: var(--color-theme-2, #4075a6);
	}

	/* Mobile responsiveness */
	@media (max-width: 480px) {
		.popup-content {
			width: 95%;
			margin: 10px;
		}
		
		.popup-header,
		.popup-body,
		.popup-footer {
			padding-left: 15px;
			padding-right: 15px;
		}
		
		.popup-header h3 {
			font-size: 1.1em;
		}
	}
</style>
