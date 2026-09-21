// Tests E2E navigateur (Playwright + Chromium) — stats de fin, pastille ✓, marque-pages, scroll, paragraphes.
// Usage : npm run test:e2e   (CHROMIUM=/chemin/vers/chromium si différent de /usr/bin/chromium)
import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html':'text/html', '.js':'text/javascript', '.json':'application/json', '.css':'text/css', '.png':'image/png', '.svg':'image/svg+xml' };
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}/`, STORY='stories/fr/aikito_v2.json';
const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/usr/bin/chromium', args:['--no-sandbox'] });
let fails=0; const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c) fails++;};
async function ctx(h=900, fast=true){
  const c = await b.newContext({ viewport:{width:430,height:h} });
  if (fast) await c.addInitScript(()=>{ const st=window.setTimeout; window.setTimeout=(f,d,...a)=>st(f,(d||0)/8,...a); });
  await c.addInitScript(() => { if (sessionStorage.__i) return; sessionStorage.__i=1;
    localStorage.setItem('sf_options', JSON.stringify({textspeed:'fast'}));
    for (const k of ['sf_game_immersive_hint_shown','sf_game_fab_hint_shown','sf_lang_chosen','sf_demo_shown','sf_tuto_shown','sf_pin_setup_done','sf_game_immersive_hint_shown','sf_game_fab_hint_shown']) localStorage.setItem(k,'1');
    localStorage.setItem('sf_lang','fr'); localStorage.setItem('sf_player_name','Testeur'); });
  const p = await c.newPage(); p.errors=[]; p.dialogs=[];
  p.on('pageerror', e=>p.errors.push(e.message));
  p.on('dialog', d=>{p.dialogs.push(d.message()); d.accept();});
  return p;
}
async function start(p,story=STORY){
  await p.goto(BASE+'game.html?story='+encodeURIComponent(story));
  await p.waitForFunction(()=>document.getElementById('resume-btn')||(typeof currentId!=='undefined'&&currentId), null, {timeout:15000});
  if (await p.locator('#restart-btn').count()) await p.click('#restart-btn');
  await p.waitForFunction(()=>typeof currentId!=='undefined'&&currentId, null, {timeout:10000});
}
async function playToEnd(p){
  for (let i=0;i<150;i++){
    await p.waitForTimeout(300);
    const st = await p.evaluate(()=>{const s=story.scenes[currentId]; return {end:!!s.isEnd, ch:document.querySelectorAll('#choices-area:not(.hidden) .choice-btn').length}});
    if (st.end) { await p.waitForTimeout(800); return true; }
    // Les choix sont mélangés : on évite la voie « Léonie » pour rester sur la même fin (fin_douce)
    if (st.ch) {
      const solo = p.locator('#choices-area .choice-btn').filter({ hasNotText: /Léonie|petite fille|tous ensemble|Redescendre/ });
      await ((await solo.count()) ? solo : p.locator('#choices-area .choice-btn')).first().click();
    }
  }
  return false;
}
const stats = p=>p.evaluate(()=>JSON.parse(localStorage.sf_player_stats||'{}'));

console.log('\n1. Stats sans doublon');
{ const p=await ctx(); await start(p);
  ok(await playToEnd(p),'histoire jouée jusqu\'à une fin');
  let s=await stats(p); ok(s.storiesFinished===1&&s.endingsFound===1,`1re fin → storiesFinished=${s.storiesFinished}, endingsFound=${s.endingsFound}`);
  await start(p); ok(await playToEnd(p),'relance + même fin');
  s=await stats(p); ok(s.storiesFinished===1&&s.endingsFound===1,`après relance → storiesFinished=${s.storiesFinished}, endingsFound=${s.endingsFound}`);
  ok(JSON.stringify(s.finishedStories)===JSON.stringify([STORY]),'finishedStories = '+JSON.stringify(s.finishedStories));
  ok(!p.errors.length,'aucune erreur JS '+p.errors.join('|'));
  globalThis.doneCtx=p; }

console.log('\n2. Pastille ✓ (bibliothèque)');
{ const p=doneCtx; await p.goto(BASE+'stories.html'); await p.waitForTimeout(2500);
  const list=await p.locator('.story-done').count(), shelf=await p.locator('.book-done').count();
  ok(list+shelf>0,`pastilles trouvées : liste=${list}, étagère=${shelf}`);
  const title=await p.evaluate(()=>document.querySelector('.story-done')?.parentElement.textContent);
  console.log('     →',title);
  await p.screenshot({path:path.join(os.tmpdir(),'sf-e2e-library.png')});
  await p.click('#view-toggle-btn'); await p.waitForTimeout(800);
  const list2=await p.locator('.story-done').count(); ok(list2>0,`vue liste : pastilles ✓ = ${list2}`);
  await p.screenshot({path:path.join(os.tmpdir(),'sf-e2e-library-list.png')});
  ok(await p.evaluate(()=>SFShared.isStoryFinished('stories/fr/aikito_v2.json')),'SFShared.isStoryFinished(aikito)');
  ok(!(await p.evaluate(()=>SFShared.isStoryFinished('stories/fr/lazarus.json'))),'lazarus non terminée');
  ok(!p.errors.length,'aucune erreur JS '+p.errors.join('|')); }

console.log('\n3. Suppression de marque-page');
{ const p=await ctx(); await start(p); await p.waitForTimeout(1500);
  await p.evaluate(()=>saveBookmark());
  ok((await p.evaluate(()=>JSON.parse(localStorage.sf_bookmarks||'[]').length))===1,'marque-page créé');
  await p.evaluate(()=>{openMenu();toggleBookmarkList();}); await p.waitForTimeout(500);
  const x=p.locator('#bookmark-list button:has-text("✕"), [onclick*="removeBookmark"]').first();
  ok(await x.isVisible(),'bouton ✕ visible dans le menu');
  await p.screenshot({path:path.join(os.tmpdir(),'sf-e2e-bookmark-menu.png')});
  await x.click(); await p.waitForTimeout(300);
  ok(p.dialogs.length===1&&/marque-page/.test(p.dialogs[0]),'confirmation : '+p.dialogs[0]);
  const r=await p.evaluate(()=>({bm:JSON.parse(localStorage.sf_bookmarks||'[]').length, saves:Object.keys(localStorage).filter(k=>k.startsWith('sf_save_'))}));
  ok(r.bm===0&&r.saves.length===0,'marque-page + sauvegarde supprimés '+JSON.stringify(r));
  ok(!p.errors.length,'aucune erreur JS '+p.errors.join('|')); }

console.log('\n3b. ✕ refusé → rien supprimé, et ✕ dans la bibliothèque');
{ const p=await ctx(); await start(p); await p.waitForTimeout(1500);
  await p.evaluate(()=>saveBookmark());
  p.removeAllListeners('dialog'); p.on('dialog',d=>d.dismiss());
  await p.evaluate(()=>{openMenu();toggleBookmarkList();}); await p.waitForTimeout(500);
  await p.locator('[onclick*="removeBookmark"]').first().click(); await p.waitForTimeout(300);
  ok((await p.evaluate(()=>JSON.parse(localStorage.sf_bookmarks||'[]').length))===1,'annulation → marque-page conservé');
  p.removeAllListeners('dialog'); p.on('dialog',d=>{p.dialogs.push(d.message());d.accept();});
  await p.goto(BASE+'stories.html'); await p.waitForTimeout(2500);
  await p.click('#view-toggle-btn'); await p.waitForTimeout(800);
  if (!(await p.locator('#pack-bookmarks:not(.collapsed)').count())) await p.click('#pack-bookmarks .pack-header');
  await p.waitForTimeout(500);
  const btn=p.locator('#pack-bookmarks .bm-delete').first();
  ok(await btn.isVisible(),'bouton ✕ visible dans la bibliothèque (vue liste)');
  await p.screenshot({path:path.join(os.tmpdir(),'sf-e2e-library-bm.png')});
  await btn.click(); await p.waitForTimeout(500);
  ok((await p.evaluate(()=>JSON.parse(localStorage.sf_bookmarks||'[]').length))===0,'suppression depuis la bibliothèque');
  ok((await p.locator('#pack-bookmarks').count())===0,'section « Reprendre » disparue après rendu');
  ok(!p.errors.length,'aucune erreur JS '+p.errors.join('|')); }

console.log('\n4. Scroll : pas de saut en bas pendant la frappe');
{ const p=await ctx(520,false); await start(p,'stories/fr/gare_regret_v3.json');
  const id=await p.evaluate(()=>Object.values(story.scenes).sort((a,b)=>b.text.length-a.text.length)[0].id);
  await p.evaluate(id=>{ goToScene(id); },id);
  const samples=[]; for(let i=0;i<45;i++){ await p.waitForTimeout(300);
    samples.push(await p.evaluate(()=>{const a=document.getElementById('scroll-area'),c=document.querySelector('.cursor');
      return {top:Math.round(a.scrollTop),max:a.scrollHeight-a.clientHeight,vis:c?c.getBoundingClientRect().bottom<=a.getBoundingClientRect().bottom+2:null}})); }
  console.log('     scrollTop/max :',samples.filter((_,i)=>i%5==0).map(s=>`${s.top}/${s.max}`).join(' '));
  ok(samples.some(s=>s.top>0),'le scroll suit bien le curseur quand il atteint le bas');
  ok(samples.slice(0,3).every(s=>s.top===0),'pas de saut immédiat vers le bas');
  ok(samples[0].top<samples[0].max||samples[0].max===0,'début de frappe : pas collé en bas');
  ok(samples.every(s=>s.vis!==false),'le curseur reste toujours visible'); }

console.log('\n5. Espacement des paragraphes');
{ const p=await ctx(); await start(p); await p.waitForTimeout(3000);
  const r=await p.evaluate(()=>{const h=formatText('a\n\nb\nc'); return h;});
  ok(r.includes('para-gap')&&/b<br>c/.test(r)&&!/<br><br>/.test(r),'formatText : '+r);
  ok(await p.evaluate(()=>document.querySelectorAll('.scene-text .para-gap').length>0),'.para-gap présent dans la scène affichée'); }

console.log('\n6. Texte « Dernières minutes »');
for (const [l,f] of [['fr','dernieres_minutes_final.json'],['en','dernieres_minutes_final_en.json'],['es','dernieres_minutes_final_es.json']]){
  const t=fs.readFileSync(path.join(ROOT,`stories/${l}/${f}`),'utf8');
  ok(!/mange aussi ton café|eat your coffee too|como tu café/i.test(t)&&!/je mange aussi/.test(t), `${l} : ancienne phrase absente`);
  const m=t.match(/[^."]{0,40}(je bois|drink|bebo)[^."]{0,40}/i); console.log('     →',m&&m[0]);
}

console.log('\n8. Aikito : fin « Le Soir à Brindille » (voie Léonie) et choix masqué en solo');
{ const clickText = async (p, txt) => { await p.waitForFunction(t=>[...document.querySelectorAll('#choices-area:not(.hidden) .choice-btn')].some(b=>b.textContent.includes(t)), txt, {timeout:20000}); await p.locator('#choices-area .choice-btn', {hasText: txt}).first().click(); };
  const visible = p => p.evaluate(()=>[...document.querySelectorAll('#choices-area:not(.hidden) .choice-btn')].map(b=>b.textContent.trim()));
  // voie Léonie
  { const p=await ctx(); await start(p);
    await clickText(p,'Rester jouer'); await clickText(p,'la petite fille'); await clickText(p,'Monter sur la colline tous ensemble');
    await clickText(p,'Continuer vers le sommet'); await clickText(p,'S\'asseoir calmement');
    await p.waitForFunction(()=>[...document.querySelectorAll('#choices-area:not(.hidden) .choice-btn')].some(b=>b.textContent.includes('Rester encore un peu')),null,{timeout:20000});
    const opts=await visible(p); ok(opts.some(t=>t.includes('Redescendre au village avec Léonie')),'voie Léonie : « Redescendre… avec Léonie » proposé ('+JSON.stringify(opts)+')');
    await clickText(p,'Redescendre au village');
    await p.waitForFunction(()=>currentId==='fin_amis',null,{timeout:20000}); ok(true,'fin_amis atteinte'); }
  // voie solo
  { const p=await ctx(); await start(p);
    await clickText(p,'Suivre le bruit'); await clickText(p,'Continuer vers le sommet'); await clickText(p,'S\'asseoir calmement');
    await p.waitForFunction(()=>[...document.querySelectorAll('#choices-area:not(.hidden) .choice-btn')].some(b=>b.textContent.includes('Rester encore un peu')),null,{timeout:20000});
    const opts=await visible(p); ok(opts.length>0 && !opts.some(t=>t.includes('Léonie')),'voie solo : choix Léonie masqué ('+opts.join(' | ')+')'); }
}

console.log('\n7. Polices embarquées (aucun appel réseau externe)');
{ const p=await ctx(900,false); const external=[];
  await p.route('**/*', r => { const u=r.request().url(); if(!u.startsWith(BASE)) { external.push(u); return r.abort(); } return r.continue(); });
  const pages=['index.html','stories.html','game.html?story='+encodeURIComponent(STORY),'news.html','progress.html','ai-guide.html','story-editor.html'];
  for (const pg of pages) {
    await p.goto(BASE+pg); await p.waitForTimeout(1200);
    const r=await p.evaluate(async()=>{ await document.fonts.ready;
      const used=[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family.replace(/['"]/g,''));
      return [...new Set(used)]; });
    ok(r.length>0, `${pg.split('?')[0]} : polices locales chargées → ${r.join(', ')}`);
  }
  ok(external.length===0,'aucune requête externe ('+external.slice(0,2).join(' ')+')'); }
await b.close(); server.close(); console.log(fails?`\n❌ ${fails} échec(s)`:'\n✅ tout est vert'); process.exit(fails?1:0);
