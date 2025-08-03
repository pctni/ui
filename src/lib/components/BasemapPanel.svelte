<script lang="ts">
	import { BASEMAPS } from '$lib/config/basemaps.js';

	let { currentBasemap, onBasemapSelect, onToggle } = $props();

	function handleBasemapSelect(key: string) {
		onBasemapSelect?.(key);
		onToggle(); // Close panel after selection
	}
</script>

{#each Object.entries(BASEMAPS) as [key, basemap]}
	<button 
		class="option"
		class:selected={currentBasemap === key}
		onclick={() => handleBasemapSelect(key)}
		aria-label="Select {basemap.name} basemap"
	>
		{basemap.name}
	</button>
{/each}
