#!/usr/bin/env node
/**
 * Prebuild (pure): ensure required PMTiles assets exist.
 * No dependency installs or side-effects beyond downloading absent data files.
 */
import { existsSync, mkdirSync, createWriteStream } from 'node:fs';
import https from 'node:https';
import { basename } from 'node:path';

const DEST_DIR = 'static';
const RELEASE_TAG = process.env.RELEASE_TAG || 'v2025-08-19';
const BASE_URL = `https://github.com/pctni/ui/releases/download/${RELEASE_TAG}`;
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

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const out = createWriteStream(dest);
    https.get(url, res => {
      if (res.statusCode >= 400) {
        out.close();
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      if (res.statusCode >= 300 && res.headers.location) {
        out.close();
        return resolve(download(res.headers.location, dest));
      }
      res.pipe(out);
      out.on('finish', () => out.close(resolve));
    }).on('error', err => {
      out.close();
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
  log('Prebuild complete.');
})().catch(err => {
  console.error('[prebuild] Error', err);
  process.exit(1);
});
