#!/usr/bin/env node
/**
 * Smoke tests catalogue Fableris :
 * - parité FR/EN/ES dans games.json
 * - community*.json ↔ games.json
 * - billing PLAY_PRODUCT_PACKS ↔ packs réels
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

let failures = 0;
function fail(msg) {
  console.error('FAIL:', msg);
  failures++;
}
function ok(msg) {
  console.log('OK:', msg);
}

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
}

function readText(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

const games = readJson('games.json');
const langs = ['fr', 'en', 'es'];

// ── Parité langues (même nombre d'entrées par lang)
const counts = Object.fromEntries(langs.map(l => [l, games.filter(g => g.lang === l).length]));
const countVals = Object.values(counts);
if (new Set(countVals).size !== 1) {
  fail(`Parité langues games.json : ${JSON.stringify(counts)}`);
} else {
  ok(`games.json — ${countVals[0]} entrées × 3 langues`);
}

// ── Fichiers uniques par langue
for (const lang of langs) {
  const files = games.filter(g => g.lang === lang).map(g => g.file);
  if (files.length !== new Set(files).size) fail(`Doublons file pour ${lang}`);
}

// ── new flag ≤ 5 par langue
for (const lang of langs) {
  const n = games.filter(g => g.lang === lang && g.new).length;
  if (n > 5) fail(`${lang} : ${n} entrées new (max 5)`);
  else ok(`${lang} — ${n} badge(s) new`);
}

// ── community.json featured stories
for (const rel of ['community.json', 'community_en.json', 'community_es.json']) {
  const data = readJson(rel);
  for (const story of data.featured_stories || []) {
    if (story.type === 'dlc') {
      fail(`${rel} contient encore une entrée DLC : ${story.title}`);
      continue;
    }
    const found = games.some(g => g.file === story.file);
    if (!found) fail(`${rel} — fichier absent de games.json : ${story.file}`);
  }
  ok(`${rel} — featured_stories cohérentes`);
}

// ── billing PLAY_PRODUCT_PACKS
const billing = readText('billing.js');
const m = billing.match(/PLAY_PRODUCT_PACKS\s*=\s*\[([^\]]*)\]/);
let playPacks = [];
if (!m) {
  fail('PLAY_PRODUCT_PACKS introuvable dans billing.js');
} else {
  playPacks = m[1].split(',').map(s => s.replace(/['"\s]/g, '')).filter(Boolean);
  for (const packId of playPacks) {
    const hasStories = games.some(g => g.pack === packId);
    if (!hasStories) fail(`Pack Play « ${packId} » sans histoires dans games.json`);
    const comingSoonMatch = billing.match(/COMING_SOON_PACKS\s*=\s*\[([^\]]*)\]/);
    const comingSoon = comingSoonMatch && comingSoonMatch[1].includes(packId);
    if (comingSoon) fail(`Pack Play « ${packId} » listé en coming soon`);
  }
  if (!playPacks.includes('cosmos')) fail('cosmos absent de PLAY_PRODUCT_PACKS');
  if (!playPacks.includes('cinq_lames')) fail('cinq_lames absent de PLAY_PRODUCT_PACKS');
  ok(`billing — PLAY_PRODUCT_PACKS : ${playPacks.join(', ')}`);
}

// ── PACK_CONFIG dans stories.html (packs avec histoires ou comingSoon)
const storiesHtml = readText('stories.html');
const packConfigMatch = storiesHtml.match(/const PACK_CONFIG = \{([\s\S]*?)\};/);
if (!packConfigMatch) fail('PACK_CONFIG introuvable');
else {
  const packIds = [...packConfigMatch[1].matchAll(/^\s{2}(\w+):\s*\{/gm)].map(x => x[1]);
  for (const packId of playPacks || []) {
    if (!packIds.includes(packId)) fail(`Pack Play « ${packId} » absent de PACK_CONFIG`);
  }
  ok('stories.html — PACK_CONFIG couvre les packs Play');
}

if (failures) {
  console.error(`\n${failures} échec(s)`);
  process.exit(1);
}
console.log('\nTous les smoke tests catalogue sont passés.');
