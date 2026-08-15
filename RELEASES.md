# Calendrier des releases Fableris

Plan validé — une branche par MàJ, comme pour Halloween (1.8 → 1.9).

| Release | Branche | Cible | Thème app | Contenu principal |
|---------|---------|-------|-----------|-------------------|
| **1.9** | `1.9` | ~10–11 nov. | `default` | Post-Halloween, concours clos |
| **2.0** | `2.0` | **1er déc.** | `christmas` | Concours Noël + histoires Noël + bandeau « avant l'heure » |
| **2.1** | `2.1` | **~20 déc.** | `christmas` | Histoire **communauté gagnante** du concours |
| **2.2** | `2.2` | **3–4 jan.** | `default` | Retour thème normal (contenu Noël conservé) |

## Release 2.0 (1er décembre)

### App / technique
- [x] Branche `2.0`, version **v2.0**
- [x] `sf-theme.js` → `SF_THEME = 'christmas'`
- [x] Thème visuel Noël (`sf-theme.css`)
- [x] Bandeau accueil : *« C'est Noël avant l'heure avec Fableris »*
- [x] Concours Noël actif (`community*.json`)

### Contenu à produire (sur `2.0`)
- [ ] **1 histoire Noël** (public, pack free ou free+community)
- [ ] **2 histoires enfant Noël** (pack kids)
  - [ ] 1 visible au catalogue / actualités
  - [ ] 1 **secours concours** (catalogue seulement, pas à la une — comme Boo Halloween)
- [ ] Entrées `games.json` FR/EN/ES + actualités si besoin

### Concours
- Thème : **Magie de Noël**
- Date limite suggérée : **2026-12-15** (lauréat publié en 2.1)
- 8–12 scènes, 2 fins min. ; mode enfant bienvenu

---

## Release 2.1 (~20 décembre)

- [ ] Branche `2.1` depuis `2.0`
- [ ] Publier l'histoire **gagnante** du concours (FR/EN/ES si possible)
- [ ] `featured_stories` + actualités communauté
- [ ] Thème Noël **inchangé** (`christmas`)

---

## Release 2.2 (3–4 janvier)

- [ ] Branche `2.2` depuis `2.1`
- [ ] `sf-theme.js` → `SF_THEME = 'default'`
- [ ] Concours Noël → `contest.active: false`
- [ ] Bandeau saisonnier masqué
- [ ] Histoires Noël **restent** dans la bibliothèque

---

## Interrupteur thème (rappel)

Fichier unique : **`sf-theme.js`** → `window.SF_THEME`

| Valeur | Usage |
|--------|--------|
| `default` | 1.9, 2.2, hors saison |
| `halloween` | 1.8 |
| `christmas` | 2.0, 2.1 |

## GitHub Pages (manuel)

| Période | Branche |
|---------|---------|
| Halloween | `1.8` |
| Nov. post-Halloween | `1.9` |
| Décembre | `2.0` puis `2.1` |
| Janvier | `2.2` |
