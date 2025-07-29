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
BASE_URL="https://github.com/pctni/uitest/releases/download/v0.0.1"

# Array of pmtiles files to download
PMTILES_FILES=(
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
# Handle the rollup issue by removing package-lock.json and node_modules
if [ -f "package-lock.json" ]; then
  echo "Removing package-lock.json..."
  echo "Removing package-lock.json..."
  rm package-lock.json
fi

if [ -d "node_modules" ]; then
  echo "Removing node_modules..."
  rm -rf node_modules
fi

echo "Running npm install..."
npm install --force

echo "Running npm run build..."
npm run build