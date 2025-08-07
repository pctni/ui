# Propensity to Cycle Tool for Northern Ireland

[![Netlify Status](https://api.netlify.com/api/v1/badges/d566e223-2100-4bba-ac82-92dd37964b73/deploy-status)](https://app.netlify.com/projects/pctni/deploys)

Visualise cycling potential in Northern Ireland. 

> This project is a work in progress. Features and data are being actively developed and may change.

## Functionality

The application provides an interactive map interface displaying:

- Route networks with color-coded cycling potential data with fastest and quietest route options between
- Existing cycling infrastructure including segregated tracks and cycle lanes
- Gap analysis showing missing connections in the cycle network
- Watch this space for more features...

Users can toggle different data layers, search for locations, change basemap styles, and share specific map views via URL parameters.

## Implementation

Built with [Svelte 5](https://svelte.dev/), [MapLibre GL JS](https://maplibre.org/), and [PMTiles](https://github.com/protomaps/PMTiles). 

## Development

Clone the repository and install dependencies:

```sh
gh repo clone pctni/ui
# or if you don't have GitHub CLI installed:
git clone https://github.com/pctni/ui.git
cd ui
npm install
```

Start the development server:

```sh
npm run dev
```

Open the application at http://localhost:5173

Build for production:

```sh
npm run build
```

The build process downloads required PMTiles data files and generates optimized static assets for deployment.

## Links

This project was inspired by previous open-source projects including:

- [Propensity to Cycle Tool (PCT)](https://www.pct.bike/)
- The [Cycle Route Uptake and Scenario Estimation (CRUSE)](https://cruse.bike) tool for the Republic of Ireland
- [Network Planning Tool for Scotland (NPT)](https://www.npt.scot/)
- The related [Network Planning Workspace (NPW)](https://www.npw.scot/)
- Active Travel England's [Plan Your Active Travel Schemes (PYATS)](https://plan.activetravelengland.gov.uk/)

## Contributing

Bug reports, feature requests and contributions are welcome. Please use the [issue tracker](https://github.com/pctni/ui/issues) to report issues or suggest improvements.
