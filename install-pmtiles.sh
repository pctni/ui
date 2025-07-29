#!/bin/bash

# Script to download and install pmtiles CLI tool
# Downloads from: https://github.com/protomaps/go-pmtiles/releases/download/v1.28.0/go-pmtiles_1.28.0_Linux_x86_64.tar.gz

set -e  # Exit on any error

# Configuration
PMTILES_VERSION="1.28.0"
DOWNLOAD_URL="https://github.com/protomaps/go-pmtiles/releases/download/v${PMTILES_VERSION}/go-pmtiles_${PMTILES_VERSION}_Linux_x86_64.tar.gz"
TEMP_DIR="/tmp/pmtiles-install"
INSTALL_DIR="$HOME/.local/bin"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Installing pmtiles CLI tool v${PMTILES_VERSION}...${NC}"

# Create temporary directory
echo "Creating temporary directory..."
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

# Download the archive
echo "Downloading pmtiles from GitHub releases..."
if command -v curl >/dev/null 2>&1; then
    curl -L -o pmtiles.tar.gz "$DOWNLOAD_URL"
elif command -v wget >/dev/null 2>&1; then
    wget -O pmtiles.tar.gz "$DOWNLOAD_URL"
else
    echo -e "${RED}Error: Neither curl nor wget is available. Please install one of them.${NC}"
    exit 1
fi

# Extract the archive
echo "Extracting archive..."
tar -xzf pmtiles.tar.gz

# Create install directory if it doesn't exist
echo "Creating install directory: $INSTALL_DIR"
mkdir -p "$INSTALL_DIR"

# Move the binary to the install directory
echo "Installing pmtiles binary..."
if [ -f "pmtiles" ]; then
    mv pmtiles "$INSTALL_DIR/"
    chmod +x "$INSTALL_DIR/pmtiles"
else
    echo -e "${RED}Error: pmtiles binary not found in extracted files${NC}"
    exit 1
fi

# Clean up
echo "Cleaning up temporary files..."
cd /
rm -rf "$TEMP_DIR"

# Check if install directory is in PATH
if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    echo -e "${YELLOW}Warning: $INSTALL_DIR is not in your PATH${NC}"
    echo "To use pmtiles from anywhere, add this line to your ~/.bashrc or ~/.profile:"
    echo "export PATH=\"\$PATH:$INSTALL_DIR\""
    echo ""
    echo "Or run this command now:"
    echo "echo 'export PATH=\"\$PATH:$INSTALL_DIR\"' >> ~/.bashrc && source ~/.bashrc"
else
    echo -e "${GREEN}$INSTALL_DIR is already in your PATH${NC}"
fi

# Verify installation
if [ -x "$INSTALL_DIR/pmtiles" ]; then
    echo -e "${GREEN}✓ pmtiles installed successfully!${NC}"
    echo "Location: $INSTALL_DIR/pmtiles"
    echo ""
    echo "Testing installation..."
    "$INSTALL_DIR/pmtiles" --version 2>/dev/null || echo "pmtiles binary is ready (version info may not be available)"
else
    echo -e "${RED}✗ Installation failed${NC}"
    exit 1
fi

echo -e "${GREEN}Installation complete!${NC}"
echo ""
echo "Usage examples:"
echo "  pmtiles info your-file.pmtiles"
echo "  pmtiles extract your-file.pmtiles --bbox=-180,-85,180,85"
echo "  pmtiles serve your-file.pmtiles"
