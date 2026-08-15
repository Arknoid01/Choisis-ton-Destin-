# Instructions agents (Fableris / StoryForge)

## Branches

| Branche | Usage |
|---------|--------|
| **`main`** | Prochaine MàJ courante (v1.6 affichée) |
| **`1.7`** | Release 1.7 — développement libre |

## Sur `1.7` — libre

Checkout, commits, push et PR **vers `1.7`** : **aucune autorisation** requise.

## Vers `main` — autorisation requise pour la 1.7

**Interdit sans autorisation explicite du propriétaire** (ex. « autorise le merge de la 1.7 sur main ») :

- Merger **`1.7` → `main`**
- Cherry-pick / importer du code de **`1.7` vers `main`**
- PR **`1.7` → `main`**

Sur GitHub, ajouter le label **`release-1.7-authorized`** sur la PR `1.7` → `main` une fois autorisé.

## Référence

- Règle Cursor : `.cursor/rules/release-1-7-protected.mdc`
- CI : `.github/workflows/protect-release-branch.yml` (bloque seulement `1.7` → `main`)
