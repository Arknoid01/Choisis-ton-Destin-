# Instructions agents (Fableris / StoryForge)

Calendrier complet : **`RELEASES.md`**

## Branches release

| Branche | Usage |
|---------|--------|
| **`1.8`** | Halloween — thème 🎃 |
| **`1.9`** | Post-Halloween — thème normal |
| **`2.0`** | **Noël 1er déc.** — thème 🎄, concours, histoires (branche courante) |
| **`2.1`** | ~20 déc. — lauréat concours, thème 🎄 |
| **`2.2`** | 3–4 jan. — retour thème normal |

## Sur `2.0` — libre

Checkout, commits, push et PR **vers `2.0`** : aucune autorisation requise.

## Vers `main` — autorisation requise

Merger une branche release → `main` uniquement avec autorisation explicite + label  
`release-1.7-authorized` … `release-2.2-authorized`.

## Thème saisonnier

**`sf-theme.js`** → `window.SF_THEME`

- `1.8` → `halloween`
- `1.9`, `2.2` → `default`
- `2.0`, `2.1` → `christmas`

## Contenu 2.0 (TODO sur branche `2.0`)

- 1 histoire Noël (public)
- 2 histoires enfant Noël (1 secours concours, non featured)

## Référence

- `.cursor/rules/release-*-protected.mdc`
- `.github/workflows/protect-release-branch.yml`
