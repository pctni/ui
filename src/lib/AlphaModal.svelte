<script lang="ts">
	import { onMount } from 'svelte';

	let popupElement = $state<HTMLDivElement>();

	let { showAlphaModal = $bindable(false) } = $props();

	onMount(() => {
		// Only show modal if user hasn't dismissed it before
		if (!localStorage.getItem('alpha-modal-dismissed')) {
			showAlphaModal = true;
		}
	});

	function dismissModal() {
		showAlphaModal = false;
		// Remember that user dismissed the modal
		localStorage.setItem('alpha-modal-dismissed', 'true');
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			dismissModal();
		}
	}

	function handleOverlayClick(event: MouseEvent) {
		// Close if clicking on the overlay background (not the popup content)
		if (event.target === event.currentTarget) {
			dismissModal();
		}
	}
</script>

{#if showAlphaModal}
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
				<h3 id="popup-title">Propensity to Cycle Tool for Northern Ireland - ALPHA</h3>
				<button class="close-button" onclick={dismissModal} aria-label="Close alpha information">
					×
				</button>
			</div>
			<div class="popup-body">
				<p>
					The Propensity to Cycle Tool for Northern Ireland (PCTNI) is an <a
						href="https://github.com/pctni"
						target="_blank"
						rel="noopener noreferrer">open-source</a
					>
					planning support system that builds on the
					<a href="https://www.pct.bike" target="_blank" rel="noopener noreferrer"
						>Propensity to Cycle Tool for England and Wales (PCT)</a
					>
					and the
					<a href="https://www.npt.scot" target="_blank" rel="noopener noreferrer"
						>Network Planning Tool for Scotland (NPT)</a
					>. The tool is currently under active development so results may change. This tool uses
					imperfect input datasets including
					<a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer"
						>OpenStreetMap</a
					>. The results are intended to support planning and investment decisions, but should not
					be used as the sole basis for such decisions. Users should verify outputs against local
					knowledge and up-to-date datasets where available before proceeding with detailed design
					or investment decisions.
				</p>
				<p>
					The estimates of cycling potential are currently based on 2011 Census data on travel to
					work. The results should be interpreted based on the understanding that they highlight
					places of high cycling demand to major and long-standing work-places. The tool currently
					omits cycling potential for travel to schools, shopping, leisure and other purposes, a
					limitation that we are working to address in future updates.
				</p>
				<p>
					Users are solely responsible for how they interpret and use the data. If you identify any
					errors or have concerns about the data or tool, please let us know via the open access <a
						href="https://github.com/pctni/ui/issues"
						target="_blank"
						rel="noopener noreferrer">issue tracker</a
					>
					(requires a
					<a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub account</a
					>).
				</p>
				<p>
					<strong>Mapping data:</strong> Date of OSM data on which network results are based: July 2025.
				</p>
			</div>
			<div class="popup-footer">
				<button class="dismiss-button" onclick={dismissModal}> Continue </button>
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
		max-width: 600px;
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
		transition:
			background-color 0.2s,
			color 0.2s;
	}

	.close-button:hover {
		background-color: #f0f0f0;
		color: #333;
	}

	.popup-body {
		padding: 0 20px 15px 20px;
	}

	.popup-body p {
		margin: 0 0 15px 0;
		line-height: 1.5;
		color: #555;
	}

	.popup-body p:last-child {
		margin-bottom: 0;
	}

	.popup-body strong {
		color: #333;
	}

	.popup-footer {
		padding: 15px 20px 20px 20px;
		display: flex;
		justify-content: flex-end;
	}

	.dismiss-button {
		background-color: #00703c;
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
		background-color: #005a30;
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
