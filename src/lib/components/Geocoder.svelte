<script lang="ts">
	import type { Map } from 'maplibre-gl';

	let { map, apiKey = "" }: { map: Map | null; apiKey?: string } = $props();

	let query = $state('');
	let results = $state<any[]>([]);
	let showResults = $state(false);
	let selectedIndex = $state(-1);

	async function search() {
		if (!query.trim() || !apiKey) {
			results = [];
			showResults = false;
			selectedIndex = -1;
			return;
		}

		try {
			const response = await fetch(
				`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${apiKey}&country=gb&bbox=-8.2,54.0,-5.3,55.5&limit=5`
			);
			const data = await response.json();
			results = data.features || [];
			showResults = true;
			selectedIndex = -1;
		} catch {
			results = [];
			showResults = false;
			selectedIndex = -1;
		}
	}

	function select(result: any) {
		if (map && result.center) {
			map.flyTo({ center: result.center, zoom: 14 });
		}
		query = result.text;
		showResults = false;
		selectedIndex = -1;
	}

	function clear() {
		query = '';
		results = [];
		showResults = false;
		selectedIndex = -1;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!showResults || !results.length) return;

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				selectedIndex = selectedIndex < results.length - 1 ? selectedIndex + 1 : 0;
				break;
			case 'ArrowUp':
				event.preventDefault();
				selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : results.length - 1;
				break;
			case 'Enter':
				event.preventDefault();
				if (selectedIndex >= 0 && selectedIndex < results.length) {
					select(results[selectedIndex]);
				}
				break;
			case 'Escape':
				showResults = false;
				selectedIndex = -1;
				break;
		}
	}
</script>

<div class="geocoder">
	<input
		bind:value={query}
		oninput={search}
		onkeydown={handleKeydown}
		disabled={!apiKey}
		placeholder={apiKey ? "Search..." : "API key required"}
		class="input"
		class:disabled={!apiKey}
	/>
	
	{#if query && apiKey}
		<button onclick={clear} class="clear">×</button>
	{/if}
	
	{#if showResults && results.length}
		<div class="results">
			{#each results as result, index}
				<button 
					onclick={() => select(result)} 
					class="result"
					class:selected={index === selectedIndex}
				>
					<div class="name">{result.text}</div>
					<div class="details">{result.place_name}</div>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.geocoder {
		position: relative;
		width: 160px;
	}

	.input {
		width: 100%;
		padding: 6px 30px 6px 10px;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 13px;
		background: white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.input:focus {
		outline: none;
		border-color: #0066cc;
		box-shadow: 0 2px 8px rgba(0, 102, 204, 0.2);
	}

	.input.disabled {
		background: #f5f5f5;
		color: #999;
		cursor: not-allowed;
	}

	.clear {
		position: absolute;
		right: 6px;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		cursor: pointer;
		color: #666;
		font-size: 16px;
		width: 18px;
		height: 18px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.clear:hover {
		color: #333;
	}

	.results {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: white;
		border: 1px solid #ccc;
		border-top: none;
		border-radius: 0 0 4px 4px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		max-height: 300px;
		overflow-y: auto;
		z-index: 1000;
	}

	.result {
		width: 100%;
		padding: 12px;
		border: none;
		background: none;
		text-align: left;
		cursor: pointer;
		border-bottom: 1px solid #eee;
		display: block;
	}

	.result:hover {
		background-color: #f5f5f5;
	}

	.result.selected {
		background-color: #e3f2fd;
	}

	.result:last-child {
		border-bottom: none;
	}

	.name {
		font-weight: 500;
		color: #333;
		margin-bottom: 2px;
	}

	.details {
		font-size: 12px;
		color: #666;
	}
</style>
