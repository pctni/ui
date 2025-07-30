<script lang="ts">
	import type { Map } from 'maplibre-gl';

	interface Props {
		map: Map | null | undefined;
	}

	let { map }: Props = $props();

	interface NominatimResult {
		place_id: number;
		licence: string;
		osm_type: string;
		osm_id: number;
		lat: string;
		lon: string;
		display_name: string;
		class: string;
		type: string;
		importance: number;
		boundingbox: [string, string, string, string]; // [lat_min, lat_max, lon_min, lon_max]
	}

	// Northern Ireland bounding box
	const NI_BOUNDS = {
		minLng: -8.2,   // Western boundary
		maxLng: -5.3,   // Eastern boundary  
		minLat: 54.0,   // Southern boundary
		maxLat: 55.5    // Northern boundary
	};

	let searchQuery = $state('');
	let searchResults: NominatimResult[] = $state([]);
	let showResults = $state(false);
	let isLoading = $state(false);
	let searchTimeout: ReturnType<typeof setTimeout>;

	// Debounced search function
	function debouncedSearch(query: string) {
		clearTimeout(searchTimeout);
		if (query.length < 2) {
			searchResults = [];
			showResults = false;
			return;
		}

		searchTimeout = setTimeout(() => {
			performSearch(query);
		}, 300);
	}

	// Perform the actual search
	async function performSearch(query: string) {
		if (!query.trim()) return;

		isLoading = true;
		showResults = true;

		try {
			// Build Nominatim query with Northern Ireland constraints
			const params = new URLSearchParams({
				q: query,
				format: 'json',
				addressdetails: '1',
				limit: '8',
				bounded: '1',
				viewbox: `${NI_BOUNDS.minLng},${NI_BOUNDS.maxLat},${NI_BOUNDS.maxLng},${NI_BOUNDS.minLat}`,
				countrycodes: 'gb', // Limit to Great Britain (includes Northern Ireland)
				'accept-language': 'en'
			});

			const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
			const results: NominatimResult[] = await response.json();

			// Further filter results to Northern Ireland bounds
			searchResults = results.filter(result => {
				const lat = parseFloat(result.lat);
				const lon = parseFloat(result.lon);
				return lat >= NI_BOUNDS.minLat && 
				       lat <= NI_BOUNDS.maxLat && 
				       lon >= NI_BOUNDS.minLng && 
				       lon <= NI_BOUNDS.maxLng;
			});

		} catch (error) {
			console.error('Geocoding error:', error);
			searchResults = [];
		} finally {
			isLoading = false;
		}
	}

	// Handle result selection
	function selectResult(result: NominatimResult) {
		if (!map) return;

		const lat = parseFloat(result.lat);
		const lng = parseFloat(result.lon);

		// Fly to the selected location
		map.flyTo({
			center: [lng, lat],
			zoom: 14,
			duration: 1000
		});

		// Clear search
		searchQuery = result.display_name;
		searchResults = [];
		showResults = false;
	}

	// Handle input changes
	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		searchQuery = target.value;
		debouncedSearch(searchQuery);
	}

	// Handle clearing search
	function clearSearch() {
		searchQuery = '';
		searchResults = [];
		showResults = false;
	}

	// Handle keyboard navigation
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			showResults = false;
		}
	}

	// Close results when clicking outside
	function handleClickOutside(event: Event) {
		const target = event.target as HTMLElement;
		if (!target.closest('.geocoder-container')) {
			showResults = false;
		}
	}
</script>

<svelte:window onclick={handleClickOutside} />

<div class="geocoder-container">
	<div class="search-input-container">
		<input 
			type="text" 
			bind:value={searchQuery}
			oninput={handleInput}
			onkeydown={handleKeydown}
			placeholder="Search places in Northern Ireland..."
			class="search-input"
			autocomplete="off"
		/>
		
		{#if searchQuery}
			<button 
				onclick={clearSearch}
				class="clear-button"
				title="Clear search"
				aria-label="Clear search"
			>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
					<path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm3.5 10.1l-1.4 1.4L8 9.4l-2.1 2.1-1.4-1.4L6.6 8 4.5 5.9l1.4-1.4L8 6.6l2.1-2.1 1.4 1.4L9.4 8l2.1 2.1z"/>
				</svg>
			</button>
		{/if}

		{#if isLoading}
			<div class="loading-indicator">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" class="spin">
					<path d="M8 0v4l3-3 1 1-3 3h4v2h-4l3 3-1 1-3-3v4H6v-4L3 9l-1-1 3-3H1V4h4L2 1l1-1 3 3V0h2z"/>
				</svg>
			</div>
		{/if}
	</div>

	{#if showResults && searchResults.length > 0}
		<div class="results-container">
			{#each searchResults as result}
				<button 
					onclick={() => selectResult(result)}
					class="result-item"
				>
					<div class="result-name">
						{result.display_name.split(',')[0]}
					</div>
					<div class="result-details">
						{result.display_name}
					</div>
				</button>
			{/each}
		</div>
	{:else if showResults && searchResults.length === 0 && !isLoading && searchQuery.length >= 2}
		<div class="results-container">
			<div class="no-results">
				No results found in Northern Ireland
			</div>
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
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	}

	.search-input:focus {
		outline: none;
		border-color: #0066cc;
		box-shadow: 0 2px 8px rgba(0,102,204,0.2);
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
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
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
		box-shadow: 0 4px 8px rgba(0,0,0,0.1);
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
