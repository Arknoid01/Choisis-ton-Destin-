#!/usr/bin/env node
/** Garde le flag new sur les 5 histoires les plus récentes par langue (date published). */
import fs from 'fs';

const games = JSON.parse(fs.readFileSync('games.json', 'utf8'));
const langs = ['fr', 'en', 'es'];
const MAX_NEW = 5;

for (const lang of langs) {
  const items = games
    .filter(g => g.lang === lang)
    .map(g => ({
      file: g.file,
      published: g.published ? Date.parse(g.published) : 0
    }))
    .sort((a, b) => b.published - a.published);

  const keep = new Set(items.slice(0, MAX_NEW).map(i => i.file));

  games.forEach(g => {
    if (g.lang !== lang) return;
    if (g.new && !keep.has(g.file)) delete g.new;
    if (!g.new && keep.has(g.file)) g.new = true;
  });
}

fs.writeFileSync('games.json', JSON.stringify(games, null, 2) + '\n');
console.log('games.json — flag new limité à', MAX_NEW, 'par langue');
