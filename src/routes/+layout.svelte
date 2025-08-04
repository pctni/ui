<script lang="ts">
	import Header from './Header.svelte';
	import AlphaModal from '$lib/AlphaModal.svelte';
	import '../app.css';

	let { children } = $props();
	let showAlphaModal = $state(false);

	function handleAlphaModalClick() {
		showAlphaModal = true;
	}
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
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 0;
		width: 100%;
		margin: 0;
		box-sizing: border-box;
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
