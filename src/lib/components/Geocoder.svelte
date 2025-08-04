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
		minLng: -8.2, // Western boundary
		maxLng: -5.3, // Eastern boundary
		minLat: 54.0, // Southern boundary
		maxLat: 55.5 // Northern boundary
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
			searchResults = results.filter((result) => {
				const lat = parseFloat(result.lat);
				const lon = parseFloat(result.lon);
				return (
					lat >= NI_BOUNDS.minLat &&
					lat <= NI_BOUNDS.maxLat &&
					lon >= NI_BOUNDS.minLng &&
					lon <= NI_BOUNDS.maxLng
				);
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

<div class="relative w-70 font-inherit">
	<div class="relative flex items-center">
		<input
			type="text"
			bind:value={searchQuery}
			oninput={handleInput}
			onkeydown={handleKeydown}
			placeholder="Search places in Northern Ireland..."
			class="w-full py-2 pr-10 pl-3 border border-gray-300 rounded text-sm bg-white shadow-sm focus:outline-none focus:border-blue-600 focus:shadow-md"
			autocomplete="off"
		/>

		{#if searchQuery}
			<button
				onclick={clearSearch}
				class="absolute right-2 bg-none border-none cursor-pointer p-1 text-gray-600 flex items-center justify-center hover:text-gray-800"
				title="Clear search"
				aria-label="Clear search"
			>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
					<path
						d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm3.5 10.1l-1.4 1.4L8 9.4l-2.1 2.1-1.4-1.4L6.6 8 4.5 5.9l1.4-1.4L8 6.6l2.1-2.1 1.4 1.4L9.4 8l2.1 2.1z"
					/>
				</svg>
			</button>
		{/if}

		{#if isLoading}
			<div class="absolute right-2 text-gray-600 flex items-center">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" class="animate-spin">
					<path
						d="M8 0v4l3-3 1 1-3 3h4v2h-4l3 3-1 1-3-3v4H6v-4L3 9l-1-1 3-3H1V4h4L2 1l1-1 3 3V0h2z"
					/>
				</svg>
			</div>
		{/if}
	</div>

	{#if showResults && searchResults.length > 0}
		<div class="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b shadow-lg max-h-75 overflow-y-auto z-50">
			{#each searchResults as result}
				<button onclick={() => selectResult(result)} class="w-full p-3 border-none bg-none text-left cursor-pointer border-b border-gray-200 block hover:bg-gray-50 last:border-b-0">
					<div class="font-medium text-gray-800 mb-0.5">
						{result.display_name.split(',')[0]}
					</div>
					<div class="text-xs text-gray-600 leading-tight">
						{result.display_name}
					</div>
				</button>
			{/each}
		</div>
	{:else if showResults && searchResults.length === 0 && !isLoading && searchQuery.length >= 2}
		<div class="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b shadow-lg max-h-75 overflow-y-auto z-50">
			<div class="p-3 text-gray-600 italic text-center">No results found in Northern Ireland</div>
		</div>
	{/if}
</div>


