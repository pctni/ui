Based on https://svelte-maplibre-gl.mierune.dev/docs/quickstart

## Development

Run it with:

```sh
npm run dev:safe  # Safe start with dependency check
# or
npm run dev      # Normal start
```

**Troubleshooting:**

- Build script issues: `chmod +x build.sh`
- Dependencies issues: `npm run deps:clean`
- Line ending issues: `sed -i 's/\r$//' build.sh && chmod +x build.sh`

Create the app in the current working directory:

```sh
npx sv create .
```

<!-- Using your knowledge of svelte 5 and neat tricks, make some simple changes that make the user experience better and make the website seem more fancy -->
