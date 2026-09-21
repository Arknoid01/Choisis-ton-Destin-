# Instructions agents (Fableris / StoryForge)

## Branches

| Branche | Usage |
|---------|--------|
| **`main`** | Prochaine MàJ courante (v1.6 affichée) |
| **`1.7`** | Release 1.7 |
| **`1.8`** | Release Halloween — thème 🎃, concours actif |
| **`1.9`** | Post-Halloween — thème normal (branche courante) |

## Sur `1.9` — libre

Checkout, commits, push et PR **vers `1.9`** : **aucune autorisation** requise.

## Vers `main` — autorisation requise

**Interdit sans autorisation explicite du propriétaire** :

- Merger **`1.7` → `main`**, **`1.8` → `main`** ou **`1.9` → `main`**
- Cherry-pick / importer du code des branches release vers **`main`**

Labels : **`release-1.7-authorized`**, **`release-1.8-authorized`**, **`release-1.9-authorized`**

## Thème saisonnier

Interrupteur unique : **`sf-theme.js`** → `window.SF_THEME`

- **`1.8`** : `'halloween'`
- **`1.9`** : `'default'`

## Référence

- Règles Cursor : `.cursor/rules/release-1-*-protected.mdc`
- CI : `.github/workflows/protect-release-branch.yml`
