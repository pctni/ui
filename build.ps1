# build.ps1

# Check if there are any .pmtiles files in the static folder
$staticDir = "static"
$pmtilesFiles = Get-ChildItem -Path $staticDir -Filter "*.pmtiles" -ErrorAction SilentlyContinue

if ($pmtilesFiles.Count -eq 0) {
    Write-Host "Download the input data from the releases"
    exit 1
}

# Run the main build process
Write-Host "Running npm install..."
npm install

Write-Host "Running npm run build..."
npm run build
