# Politique des branches

Voir aussi **`RELEASES.md`** pour le calendrier détaillé (contenu par MàJ).

## `main`

Prochaine mise à jour Play Store / web. Version affichée : **v1.6** (jusqu’aux merges release autorisés).

## Branches release (résumé)

| Branche | Cible | Thème `SF_THEME` | Rôle |
|---------|-------|------------------|------|
| **1.7** | — | — | Release Profondeurs / fin 1.7 |
| **1.8** | Halloween | `halloween` | MàJ Halloween 🎃 |
| **1.9** | ~10–11 nov. | `default` | Post-Halloween |
| **2.0** | **1er déc.** | `christmas` | Noël + concours + histoires (en cours) |
| **2.1** | **~20 déc.** | `christmas` | Lauréat concours communauté |
| **2.2** | **3–4 jan.** | `default` | Post-Noël |

## Règles communes

- **Travail libre** sur la branche release courante (commits, PR vers cette branche).
- **Vers `main` : interdit sans autorisation** + label `release-X.Y-authorized`.

## GitHub Pages

| Période | Branche |
|---------|---------|
| Halloween | `1.8` |
| Nov. | `1.9` |
| Décembre | `2.0` → `2.1` |
| Janvier | `2.2` |

Interrupteur thème : **`sf-theme.js`** → `window.SF_THEME` (`default` | `halloween` | `christmas`).
