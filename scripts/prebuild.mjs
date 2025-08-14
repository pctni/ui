#!/usr/bin/env node
/**
 * Cross-platform prebuild script to ensure required PMTiles assets are present.
 * Replaces build.sh and build.ps1 to avoid shell incompatibilities on Windows.
 */
import { existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { basename } from 'node:path';
import https from 'node:https';
import { createWriteStream } from 'node:fs';

const DEST_DIR = 'static';
const BASE_URL = 'https://github.com/pctni/ui/releases/download/v2025-08-14';
const FILES = [
  'corenet_network_ni.pmtiles',
  'gap_map.pmtiles',
  'cycle_net_processed.pmtiles',
  'Local_Authority.pmtiles',
  'route_network_fastest.pmtiles',
  'route_network_quietest.pmtiles'
];

function log(msg) { console.log(`[prebuild] ${msg}`); }

mkdirSync(DEST_DIR, { recursive: true });

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    https.get(url, res => {
      if (res.statusCode && res.statusCode >= 400) {
        file.close();
        return reject(new Error(`Failed ${url}: ${res.statusCode}`));
      }
      if (res.statusCode && res.statusCode >= 300 && res.headers.location) {
        file.close();
        return resolve(download(res.headers.location, dest));
      }
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve(undefined)));
    }).on('error', err => {
      file.close();
      reject(err);
    });
  });
}

(async () => {
  for (const name of FILES) {
    const dest = `${DEST_DIR}/${name}`;
    if (existsSync(dest)) {
      log(`Exists: ${name}`);
      continue;
    }
    const url = `${BASE_URL}/${name}`;
    log(`Downloading ${basename(url)} ...`);
    await download(url, dest);
    log(`Downloaded ${name}`);
  }
  // Handle optional clean flag passed via npm script: npm run build -- --clean
  if (process.argv.includes('--clean')) {
    log('Clean flag detected: removing node_modules and lock file');
    try { unlinkSync('package-lock.json'); } catch {}
    try { execSync('rimraf node_modules', { stdio: 'inherit' }); } catch {
      // fallback cross-platform removal
      try { execSync('rm -rf node_modules', { stdio: 'inherit' }); } catch {}
      try { execSync('rmdir /s /q node_modules', { stdio: 'inherit' }); } catch {}
    }
    execSync('npm install --force', { stdio: 'inherit' });
  }
})();
