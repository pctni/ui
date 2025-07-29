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

# --- Download PMTiles file if it doesn't exist ---
DEST_DIR="static"
FILENAME="route_network_fastest.pmtiles"
DEST_FILE="$DEST_DIR/$FILENAME"
URL="https://github.com/pctni/uitest/releases/download/v0.0.1/$FILENAME"

# Check if the file already exists
if [ ! -f "$DEST_FILE" ]; then
  echo "File $DEST_FILE not found. Downloading..."
  
  # Create the destination directory if it doesn't exist
  mkdir -p "$DEST_DIR"
  
  # Download the file using curl
  curl -L -o "$DEST_FILE" "$URL"
  
  echo "Download complete."
else
  echo "File $DEST_FILE already exists. Skipping download."
fi

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
npm install

echo "Running npm run build..."
npm run build