# Instructions agents (Fableris / StoryForge)

## Branches

| Branche | Usage |
|---------|--------|
| **`main`** | Base Play Store courante (v1.6 affichée) |
| **`1.7`** | Release 1.7 — lancement Halloween (thème 🎃, concours) |
| **`1.8`** | Release 1.8 — résultat du concours (thème 🎃) |
| **`1.9`** | Release 1.9 — post-Halloween, thème normal |
| **`1.9.5`** | Multijoueur local wifi (bêta) — **branche courante** |
| **`2.0`** | Noël — thème 🎄, contenu Noël en cours |

Détail des contenus et dates : `BRANCHES.md` et `ROADMAP.md`. `2.1` et `2.2` sont planifiées, pas encore créées.

## Sur `1.9.5` — libre

Checkout, commits, push et PR **vers `1.9.5`** : **aucune autorisation** requise.

## Vers `main` — autorisation requise

**Interdit sans autorisation explicite du propriétaire** :

- Merger **`1.7` → `main`**, **`1.8` → `main`**, **`1.9` → `main`** (ou `1.9.5`, `2.0` → `main`)
- Cherry-pick / importer du code des branches release vers **`main`**

Le sens inverse (correctif fait sur `main` puis reporté sur les branches) est autorisé quand le propriétaire le demande.
Labels : **`release-1.7-authorized`**, **`release-1.8-authorized`**, **`release-1.9-authorized`**

## Thème saisonnier

Interrupteur unique : **`sf-theme.js`** → `window.SF_THEME`

- **`1.7`**, **`1.8`** : `'halloween'`
- **`1.9`**, **`1.9.5`** : `'default'`
- **`2.0`** : `'christmas'`

## Tests (à lancer avant tout push)

- `npm test` — smoke tests catalogue
- `npm run test:e2e` — navigateur (Playwright + Chromium système, ~2 min) : stats de fin, pastille ✓, marque-pages, scroll, paragraphes, polices locales
- `npm run test:mp` — multijoueur avec faux réseau UDP/TCP (branche `1.9.5`)

## Multijoueur (branche `1.9.5`)

- Code : `multiplayer.js` (protocole), `multiplayer.html` (lobby), intégration dans `game.html` (`mp*`).
- Plugin TCP **vendorisé** dans `plugins/capacitor-tcp-socket-manager/` (voir `MODIFICATIONS.md`) — ne plus utiliser `patch-package`.
- Nécessite l'app native (Capacitor) ; indisponible en navigateur.

## Référence

- Règles Cursor : `.cursor/rules/release-1-*-protected.mdc` (présentes sur `1.7`–`1.9`)
- CI : `.github/workflows/protect-release-branch.yml` (retirée de `1.9.5`)
