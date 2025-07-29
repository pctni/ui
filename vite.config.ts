import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(), 
		sveltekit(),
		// Custom plugin to handle range requests for PMTiles files
		{
			name: 'pmtiles-range-requests',
			configureServer(server) {
				server.middlewares.use((req, res, next) => {
					// Check if the request is for a PMTiles file
					// @ts-ignore - req.url exists but TypeScript doesn't know it
					if (req.url && req.url.endsWith('.pmtiles')) {
						// Ensure proper headers for range requests
						res.setHeader('Accept-Ranges', 'bytes');
						res.setHeader('Content-Type', 'application/octet-stream');
						res.setHeader('Access-Control-Allow-Origin', '*');
						res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
						res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Range, Accept-Ranges');
					}
					next();
				});
			}
		}
	]
});
