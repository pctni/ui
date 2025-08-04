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
		class="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] backdrop-blur-sm"
		onclick={handleOverlayClick}
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		aria-labelledby="popup-title"
		tabindex="-1"
		bind:this={popupElement}
	>
		<div class="popup-content bg-white rounded-lg shadow-xl max-w-2xl w-[90%] max-h-[90vh] overflow-auto">
			<div class="flex justify-between items-center p-5 border-b border-gray-200 mb-4">
				<h3 id="popup-title" class="m-0 text-gray-800 text-xl font-semibold">
					Propensity to Cycle Tool for Northern Ireland - ALPHA
				</h3>
				<button 
					class="bg-none border-0 text-2xl text-gray-500 cursor-pointer p-0 w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 hover:text-gray-800 transition-colors"
					onclick={dismissModal} 
					aria-label="Close alpha information"
				>
					×
				</button>
			</div>
			<div class="px-5 pb-4">
				<p class="mb-4 leading-relaxed text-gray-600">
					The <strong class="text-gray-800">Propensity to Cycle Tool for Northern Ireland (PCTNI)</strong> is an 
					<a href="https://github.com/pctni" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">open-source</a>
					planning support system for cycling infrastructure. Currently in active development.
				</p>
				<p class="mb-4 leading-relaxed text-gray-600">
					<strong class="text-gray-800">Data limitations:</strong> Based on 2011 Census work travel data and 
					<a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">OpenStreetMap</a>. 
					Results highlight cycling demand to major workplaces but omit schools, shopping, and leisure trips.
				</p>
				<p class="mb-0 leading-relaxed text-gray-600">
					<strong class="text-gray-800">Usage:</strong> Intended to support planning decisions. Verify outputs against local knowledge 
					before detailed design or investment. Report issues via 
					<a href="https://github.com/pctni/ui/issues" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">GitHub</a>.
				</p>
			</div>
			<div class="flex justify-end p-5 pt-4">
				<button 
					class="bg-green-700 text-white border-0 px-5 py-2.5 rounded cursor-pointer text-sm font-medium hover:bg-green-800 transition-colors"
					onclick={dismissModal}
				> 
					Continue 
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Minimal custom animations - most styling moved to Tailwind classes */
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

	.popup-content {
		animation: popup-appear 0.3s ease-out;
	}
</style>
