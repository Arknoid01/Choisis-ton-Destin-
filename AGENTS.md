# Instructions agents (Fableris / StoryForge)

## Branches

| Branche | Usage |
|---------|--------|
| **`main`** | Prochaine MàJ courante (v1.6 affichée) |
| **`1.7`** | Release 1.7 — développement libre |
| **`1.8`** | Release 1.8 — développement libre (branche courante) |

## Sur `1.8` — libre

Checkout, commits, push et PR **vers `1.8`** : **aucune autorisation** requise.

## Vers `main` — autorisation requise pour la 1.7 et la 1.8

**Interdit sans autorisation explicite du propriétaire** (ex. « autorise le merge de la 1.8 sur main ») :

- Merger **`1.7` → `main`** ou **`1.8` → `main`**
- Cherry-pick / importer du code de **`1.7` ou `1.8` vers `main`**
- PR **`1.7` → `main`** ou **`1.8` → `main`**

Sur GitHub, ajouter le label **`release-1.7-authorized`** ou **`release-1.8-authorized`** sur la PR correspondante une fois autorisé.

## Référence

- Règles Cursor : `.cursor/rules/release-1-7-protected.mdc`, `.cursor/rules/release-1-8-protected.mdc`
- CI : `.github/workflows/protect-release-branch.yml` (bloque `1.7` → `main` et `1.8` → `main`)
