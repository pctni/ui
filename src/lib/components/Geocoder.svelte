<script lang="ts">
	import type { Map } from 'maplibre-gl';

	interface Props {
		map: Map | null | undefined;
		apiKey?: string;
	}

	let { map, apiKey = "" }: Props = $props();

	let query = $state('');
	let results = $state<any[]>([]);
	let show = $state(false);

	async function search() {
		if (!query.trim() || !apiKey) {
			results = [];
			show = false;
			return;
		}

		try {
			const response = await fetch(
				`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${apiKey}&country=gb&bbox=-8.2,54.0,-5.3,55.5&limit=5`
			);
			const data = await response.json();
			results = data.features || [];
			show = true;
		} catch (error) {
			console.error('Geocoding error:', error);
			results = [];
		}
	}

	function select(feature: any) {
		if (map && feature.center) {
			map.flyTo({ center: feature.center, zoom: 14 });
		}
		query = feature.place_name;
		show = false;
	}
</script>

{#if apiKey}
	<div class="geocoder">
		<input
			bind:value={query}
			oninput={search}
			onblur={() => setTimeout(() => show = false, 200)}
			placeholder="Search places in Northern Ireland..."
		/>
		{#if show && results.length}
			<div class="results">
				{#each results as result}
					<button onclick={() => select(result)}>
						{result.place_name}
					</button>
				{/each}
			</div>
		{/if}
	</div>
{:else}
	<div class="geocoder">
		<div class="warning">
			<p>Mapbox API key required</p>
			<p>Get one free at <a href="https://mapbox.com" target="_blank">mapbox.com</a></p>
		</div>
	</div>
{/if}

<style>
	.geocoder {
		position: relative;
		width: 250px;
	}

	input {
		width: 100%;
		padding: 10px 14px;
		border: 1px solid #ddd;
		border-radius: 6px;
		background: white;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
		font-size: 14px;
		outline: none;
		transition: border-color 0.2s ease;
	}

	input:focus {
		border-color: #0066cc;
		box-shadow: 0 2px 8px rgba(0,102,204,0.15);
	}

	.geocoder:focus-within input {
		border-radius: 6px 6px 0 0;
	}

	.results {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: white;
		border: 1px solid #ddd;
		border-top: none;
		border-radius: 0 0 6px 6px;
		box-shadow: 0 4px 12px rgba(0,0,0,0.15);
		max-height: 250px;
		overflow-y: auto;
		z-index: 1000;
		margin-top: 1px;
	}

	button {
		width: 100%;
		padding: 12px 16px;
		border: none;
		background: none;
		text-align: left;
		cursor: pointer;
		border-bottom: 1px solid #eee;
		font-size: 14px;
		line-height: 1.4;
		transition: background-color 0.2s ease;
		margin: 0;
		display: block;
	}

	button:hover {
		background: #f8f9fa;
	}

	button:last-child {
		border-bottom: none;
		border-radius: 0 0 6px 6px;
	}

	button:focus {
		outline: none;
		background: #e3f2fd;
	}

	.warning {
		background: white;
		border: 1px solid #ddd;
		border-radius: 4px;
		padding: 12px;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
		font-size: 14px;
	}

	.warning p {
		margin: 0 0 8px 0;
	}

	.warning p:last-child {
		margin-bottom: 0;
	}

	.warning a {
		color: #0066cc;
		text-decoration: none;
	}

	.warning a:hover {
		text-decoration: underline;
	}
</style>
