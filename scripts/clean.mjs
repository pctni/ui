#!/usr/bin/env node
/**
 * Clean script: remove node_modules and lockfile (optional) for a pristine install.
 * This is intentionally separate from prebuild to keep builds pure and reproducible.
 */
import { rmSync, existsSync } from 'node:fs';

function log(msg){ console.log(`[clean] ${msg}`); }

if (existsSync('node_modules')) {
  log('Removing node_modules');
  try { rmSync('node_modules', { recursive: true, force: true }); } catch (e) { console.error(e); }
} else {
  log('node_modules not present');
}

if (process.argv.includes('--lock')) {
  if (existsSync('package-lock.json')) {
    log('Removing package-lock.json');
    try { rmSync('package-lock.json'); } catch (e) { console.error(e); }
  }
}

log('Clean complete.');
