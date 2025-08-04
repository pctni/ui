#!/bin/bash
# build.sh

# Exit on any error
set -e

# Function to detect if we're on Linux
is_linux() {
    [[ "$(uname)" == "Linux" ]]
}

# Function to detect if we're on Windows/PowerShell
is_windows() {
    [[ "$(uname)" == "MINGW"* ]] || [[ "$(uname)" == "MSYS"* ]] || [[ "$(uname)" == "CYGWIN"* ]]
}

# --- Download PMTiles files if they don't exist ---
DEST_DIR="static"
BASE_URL="https://github.com/pctni/ui/releases/download/v0.0.1"

# Array of pmtiles files to download
PMTILES_FILES=(
  "corenet_network_ni.pmtiles"
  "gap_map.pmtiles"
  "cycle_net_processed.pmtiles"
  "Local_Authority.pmtiles"
  "route_network_fastest.pmtiles"
  "route_network_quietest.pmtiles"
)

# Create the destination directory if it doesn't exist
mkdir -p "$DEST_DIR"

# Download each pmtiles file using a for loop
for FILENAME in "${PMTILES_FILES[@]}"; do
  DEST_FILE="$DEST_DIR/$FILENAME"
  URL="$BASE_URL/$FILENAME"
  
  # Check if the file already exists
  if [ ! -f "$DEST_FILE" ]; then
    echo "File $DEST_FILE not found. Downloading..."
    
    # Download the file using curl
    curl -L -o "$DEST_FILE" "$URL"
    
    echo "Download of $FILENAME complete."
  else
    echo "File $DEST_FILE already exists. Skipping download."
  fi
done

# --- Run the rest of the original build command from netlify.toml ---
echo "Running the main build process..."

# Only remove and reinstall if needed
if [ "$1" = "--clean" ]; then
  echo "Clean build requested..."
  [ -f "package-lock.json" ] && rm package-lock.json
  [ -d "node_modules" ] && rm -rf node_modules
  npm install --force
fi

# Check if this is a dev command
if [ "$1" = "dev" ] || [[ "$0" == *"vite dev"* ]]; then
  # Skip build for dev mode, just ensure dependencies
  if [ ! -d "node_modules" ]; then
    npm install --force
  fi
else
  # For production builds, just download pmtiles - vite build will be called separately
  echo "PMTiles files ready for build."
fi
