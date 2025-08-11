<script lang="ts">
	import Header from './Header.svelte';
	import AlphaModal from '$lib/AlphaModal.svelte';
	import '../app.css';
	import { onMount } from 'svelte';

	let { children } = $props();
	let showAlphaModal = $state(false);

	function handleAlphaModalClick() {
		showAlphaModal = true;
	}

	onMount(() => {
		function handleCustomAlphaEvent() {
			showAlphaModal = true;
		}

		window.addEventListener('show-alpha-modal', handleCustomAlphaEvent);

		return () => {
			window.removeEventListener('show-alpha-modal', handleCustomAlphaEvent);
		};
	});
</script>

<div class="app">
	<Header onAlphaModalClick={handleAlphaModalClick} />
	<AlphaModal bind:showAlphaModal />

	<main>
		{@render children()}
	</main>

	<footer>
		<p>
			<!-- Removed SvelteKit documentation link -->
		</p>
	</footer>
</div>

<style>
	.app {
		display: grid;
		grid-template-rows: auto 1fr;
		height: 100vh;
	}

	main {
		display: flex;
		flex-direction: column;
		padding: 0;
		width: 100%;
		margin: 0;
		box-sizing: border-box;
		overflow: hidden;
	}

	footer {
		display: none;
	}

	/* Footer hidden since it's empty */

	/* Override default background */
	:global(body) {
		background: white;
	}
</style>
