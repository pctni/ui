#!/bin/bash

# Build script for PCTNI UI
# Downloads PMTiles files and builds the application

set -e  # Exit on any error

echo "Starting PCTNI build process..."

# Create static directory if it doesn't exist
mkdir -p static

# Download PMTiles files if they don't exist
PMTILES_FILES=(
    "route_network_fastest.pmtiles"
    "route_network_quietest.pmtiles"
    "corenet_network_ni.pmtiles"
    "cycle_net_processed.pmtiles"
    "gap_map.pmtiles"
    "Local_Authority.pmtiles"
)

BASE_URL="https://github.com/pctni/pctni/releases/download/v0.1.0"

for file in "${PMTILES_FILES[@]}"; do
    if [ ! -f "static/$file" ]; then
        echo "Downloading $file..."
        if command -v curl >/dev/null 2>&1; then
            curl -L -o "static/$file" "$BASE_URL/$file"
        elif command -v wget >/dev/null 2>&1; then
            wget -O "static/$file" "$BASE_URL/$file"
        else
            echo "Error: Neither curl nor wget is available"
            exit 1
        fi
    else
        echo "$file already exists, skipping download"
    fi
done

echo "PMTiles files ready"
echo "Build script completed successfully"