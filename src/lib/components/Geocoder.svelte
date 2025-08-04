<script lang="ts">
	import type { Map } from 'maplibre-gl';

	interface Props {
		map: Map | null;
		apiKey: string;
	}

	let { map, apiKey }: Props = $props();

	let query = $state('');
	let results: GeocodingResult[] = $state([]);
	let isLoading = $state(false);
	let showResults = $state(false);
	let inputElement: HTMLInputElement;

	interface GeocodingResult {
		id: string;
		place_name: string;
		text: string;
		center: [number, number];
		context?: Array<{ id: string; text: string }>;
	}

	async function search() {
		if (!query.trim() || !apiKey) {
			results = [];
			showResults = false;
			return;
		}

		isLoading = true;
		try {
			// Mapbox Geocoding API with Northern Ireland bounding box
			const response = await fetch(
				`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
				new URLSearchParams({
					access_token: apiKey,
					country: 'gb',
					bbox: '-8.2,54.0,-5.3,55.5', // Northern Ireland bounding box
					limit: '5'
				})
			);

			if (!response.ok) {
				throw new Error(`Geocoding request failed: ${response.status}`);
			}

			const data = await response.json();
			results = data.features || [];
			showResults = true;
		} catch (error) {
			console.error('Geocoding error:', error);
			results = [];
			showResults = false;
		} finally {
			isLoading = false;
		}
	}

	function select(result: GeocodingResult) {
		if (map && result.center) {
			map.flyTo({
				center: result.center,
				zoom: 14,
				duration: 1500
			});
		}
		query = result.text;
		showResults = false;
		inputElement?.blur();
	}

	function clearSearch() {
		query = '';
		results = [];
		showResults = false;
		inputElement?.focus();
	}
</script>

<div class="geocoder-container">
	<div class="search-input-container">
		<input
			bind:this={inputElement}
			bind:value={query}
			oninput={search}
			placeholder="Search for places..."
			class="search-input"
			type="text"
		/>
		
		{#if isLoading}
			<div class="loading-indicator">
				<svg width="16" height="16" class="spin" viewBox="0 0 24 24">
					<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="32" stroke-dashoffset="32">
						<animate attributeName="stroke-dashoffset" dur="1s" values="32;0" repeatCount="indefinite"/>
					</circle>
				</svg>
			</div>
		{:else if query}
			<button onclick={clearSearch} class="clear-button" type="button" aria-label="Clear search">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>
		{/if}
	</div>
	
	{#if showResults}
		<div class="results-container">
			{#each results as result (result.id)}
				<button onclick={() => select(result)} class="result-item" type="button">
					<div class="result-name">{result.text}</div>
					<div class="result-details">{result.place_name}</div>
				</button>
			{:else}
				<div class="no-results">No results found</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.geocoder-container {
		position: relative;
		width: 280px;
		font-family: inherit;
	}

	.search-input-container {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-input {
		width: 100%;
		padding: 8px 40px 8px 12px;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 14px;
		background: white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.search-input:focus {
		outline: none;
		border-color: #0066cc;
		box-shadow: 0 2px 8px rgba(0, 102, 204, 0.2);
	}

	.clear-button {
		position: absolute;
		right: 8px;
		background: none;
		border: none;
		cursor: pointer;
		padding: 4px;
		color: #666;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.clear-button:hover {
		color: #333;
	}

	.loading-indicator {
		position: absolute;
		right: 8px;
		color: #666;
		display: flex;
		align-items: center;
	}

	.spin {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.results-container {
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

	.result-item {
		width: 100%;
		padding: 12px;
		border: none;
		background: none;
		text-align: left;
		cursor: pointer;
		border-bottom: 1px solid #eee;
		display: block;
	}

	.result-item:hover {
		background-color: #f5f5f5;
	}

	.result-item:last-child {
		border-bottom: none;
	}

	.result-name {
		font-weight: 500;
		color: #333;
		margin-bottom: 2px;
	}

	.result-details {
		font-size: 12px;
		color: #666;
		line-height: 1.3;
	}

	.no-results {
		padding: 12px;
		color: #666;
		font-style: italic;
		text-align: center;
	}
</style>
