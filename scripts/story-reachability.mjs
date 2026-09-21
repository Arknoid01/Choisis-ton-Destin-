// Vérifie que les histoires « autonomes » n'ont pas de scène ni de fin inatteignable.
// (Les épisodes de DLC — Cinq Lames, Signal Rouge — sont volontairement exclus : ils s'enchaînent entre fichiers.)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STORIES = ['aikito_v2', 'lame_diamant', 'dernieres_minutes_final'];
// Scènes volontairement isolées (restes d'anciennes versions)
const ALLOW = { dernieres_minutes_final: ['nora_fissure'] };
const SUFFIX = { fr: '', en: '_en', es: '_es' };

let failed = 0;
for (const base of STORIES) {
  for (const lang of ['fr', 'en', 'es']) {
    const name = base + SUFFIX[lang];
    const file = path.join(ROOT, 'stories', lang, `${name}.json`);
    if (!fs.existsSync(file)) { console.error(`KO : ${file} introuvable`); failed++; continue; }
    const { scenes } = JSON.parse(fs.readFileSync(file, 'utf8'));
    const start = Object.values(scenes).find(s => s.isStart)?.id || (scenes.prologue ? 'prologue' : Object.keys(scenes)[0]);
    const seen = new Set(); const stack = [start];
    while (stack.length) {
      const id = stack.pop();
      if (seen.has(id) || !scenes[id]) continue;
      seen.add(id);
      for (const c of scenes[id].choices || []) if (c.vers && !c.story) stack.push(c.vers);
    }
    const allowed = new Set(ALLOW[base] || []);
    const orphans = Object.keys(scenes).filter(id => !seen.has(id) && !allowed.has(id));
    const broken = Object.values(scenes).flatMap(s => (s.choices || []).filter(c => c.vers && !c.story && !scenes[c.vers]).map(c => `${s.id}→${c.vers}`));
    if (orphans.length || broken.length) {
      failed++;
      console.error(`KO : ${lang}/${name} — scènes inatteignables : [${orphans.join(', ')}] ; liens cassés : [${broken.join(', ')}]`);
    } else {
      console.log(`OK : ${lang}/${name} — ${seen.size} scènes atteignables`);
    }
  }
}
if (failed) { console.error(`\n${failed} histoire(s) avec problème.`); process.exit(1); }
console.log('\nToutes les scènes des histoires suivies sont atteignables.');
