# Instructions agents (Fableris / StoryForge)

## Branches

| Branche | Usage |
|---------|--------|
| **`main`** | = v1.8 (Play Store), fusion de `1.8` autorisée par le propriétaire le 2026-10-19 |
| **`1.7`**, **`1.8`** | Releases publiées, contenues dans `main` — plus de développement |
| **`1.9`**, **`1.9.5`**, **`2.0`** | Releases à venir (voir `BRANCHES.md`) |

## Vers `main` — autorisation requise pour les branches release

**Interdit sans autorisation explicite du propriétaire** (ex. « autorise le merge de la 1.9 sur main ») :

- Merger une branche release (`1.9`, `1.9.5`, `2.0`…) → **`main`**
- Cherry-pick / importer du code d'une branche release vers **`main`**

Le sens inverse (correctif sur `main` puis cherry-pick sur chaque branche release) est libre.

## Référence

- Règles Cursor : `.cursor/rules/release-1-7-protected.mdc`, `.cursor/rules/release-1-8-protected.mdc`
- CI : `.github/workflows/protect-release-branch.yml` (bloque `1.7` → `main` et `1.8` → `main` sans label)
- Tests : `npm test`, `npm run test:e2e`, `npm run test:billing`
