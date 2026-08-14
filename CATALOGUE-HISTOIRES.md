# Catalogue histoires Fableris

> **Document interne** — non affiché dans l'app. À mettre à jour à chaque publication.
> Dernière révision : **2026-08-14**

## Règle simple

Une histoire « publiée » = une entrée par langue dans `games.json`, avec si possible :

- `published` : date ISO (`YYYY-MM-DD`) pour le tri actus / communauté
- `community: true` + `author` si histoire communauté
- `pack` : `free`, `kids`, `cosmos`, `cinq_lames`, …
- `portal: true` pour les chapitres Signal Rouge accessibles via portail

Fichiers liés à tenir alignés :

| Fichier | Rôle |
|---------|------|
| `games.json` | Catalogue bibliothèque (obligatoire pour jouer) |
| `news.json` / `news_en.json` / `news_es.json` | Fil nouveautés (onglets Communauté & DLC) |
| `community.json` (+ EN/ES) | Popup communauté — histoires à la une |

## Légende

| Colonne | Signification |
|---------|---------------|
| **Traductions** | Fichiers JSON présents (`FR · EN · ES`) |
| **Statut** | `communauté` · `dlc (pack)` · `free` · `free (enfants)` |
| **Publié** | Langues présentes dans `games.json`, ou `non` |
| **Date** | Champ `published` dans `games.json` (sinon `—`) |

## Checklist nouvelle histoire

- [ ] Fichier(s) JSON FR (+ EN/ES si traduit)
- [ ] Entrée(s) `games.json` par langue
- [ ] `published` renseigné si mise en avant actus / communauté
- [ ] Entrée actus (`news*.json`) si communauté ou nouveau DLC
- [ ] Entrée `community*.json` si histoire communauté mise en avant
- [ ] Ligne ajoutée / mise à jour dans ce fichier

---

## Inventaire

- **30** histoires (fichier FR de référence)
- **30** publiées dans le catalogue
- **30** entièrement traduites FR · EN · ES

### Tableau complet

| Histoire | Fichier FR | Traductions | Statut | Publié | Date |
|----------|------------|-------------|--------|--------|------|
| L'Usine à Trombones | `usine_a_trombones.json` | FR · EN · ES | communauté | EN · ES · FR | 2026-08-14 |
| La Gare des Regrets | `gare_regret_v3.json` | FR · EN · ES | communauté | EN · ES · FR | 2026-08-07 |
| Les Cinq Lames — Erevane | `cinq_lames_manipulation.json` | FR · EN · ES | dlc (cinq_lames) | EN · ES · FR | — |
| Les Cinq Lames — La Fuite | `cinq_lames_fuite.json` | FR · EN · ES | dlc (cinq_lames) | EN · ES · FR | — |
| Les Cinq Lames — La Paranoïa | `cinq_lames_paranoia.json` | FR · EN · ES | dlc (cinq_lames) | EN · ES · FR | — |
| Les Cinq Lames — Le Combat Final | `cinq_lames_combat.json` | FR · EN · ES | dlc (cinq_lames) | EN · ES · FR | — |
| Les Cinq Lames — Mémoire d'Aryn | `cinq_lames_aryn.json` | FR · EN · ES | dlc (cinq_lames) | EN · ES · FR | — |
| Les Cinq Lames — Mémoire d'Ikar | `cinq_lames_ikar.json` | FR · EN · ES | dlc (cinq_lames) | EN · ES · FR | — |
| Les Cinq Lames — Mémoire de Taera | `cinq_lames_taera.json` | FR · EN · ES | dlc (cinq_lames) | EN · ES · FR | — |
| Les Cinq Lames — Mémoire de Vael | `cinq_lames_vael.json` | FR · EN · ES | dlc (cinq_lames) | EN · ES · FR | — |
| Les Cinq Lames — Prologue | `cinq_lames_prologue.json` | FR · EN · ES | dlc (cinq_lames) | EN · ES · FR | — |
| Le Signal Rouge — Dorian | `signal_rouge_ingenieur.json` | FR · EN · ES | dlc (cosmos) | EN · ES · FR | — |
| Le Signal Rouge — Maya | `signal_rouge_scientifique.json` | FR · EN · ES | dlc (cosmos) | EN · ES · FR | — |
| Le Signal Rouge — ORIS | `signal_rouge_ia.json` | FR · EN · ES | dlc (cosmos) | EN · ES · FR | — |
| Le Signal Rouge — Prologue | `signal_rouge_prologue.json` | FR · EN · ES | dlc (cosmos) | EN · ES · FR | 2026-08-10 |
| Le Signal Rouge — Rhea | `signal_rouge_commandante.json` | FR · EN · ES | dlc (cosmos) | EN · ES · FR | — |
| Le Signal Rouge — Verdict | `signal_rouge_verdict.json` | FR · EN · ES | dlc (cosmos) | EN · ES · FR | — |
| L'Horloger des Rêves | `horloger_des_reves.json` | FR · EN · ES | free | EN · ES · FR | 2026-08-14 |
| La Lame de Diamant | `lame_diamant.json` | FR · EN · ES | free | EN · ES · FR | — |
| Le Dernier Round | `le_dernier_round_boxe_complet.json` | FR · EN · ES | free | EN · ES · FR | — |
| Le Théâtre de Carcosa | `theatre_carcosa.json` | FR · EN · ES | free | EN · ES · FR | — |
| Les Dernières Minutes | `dernieres_minutes_final.json` | FR · EN · ES | free | EN · ES · FR | — |
| Les Gardiens de l'Harmonie | `gardiens_harmonie.json` | FR · EN · ES | free | EN · ES · FR | 2026-08-14 |
| Project Lazarus — L'Odyssée des Architects | `lazarus.json` | FR · EN · ES | free | EN · ES · FR | — |
| La Lumière qui a Peur du Noir | `lumiere_peur_du_noir.json` | FR · EN · ES | free (enfants) | EN · ES · FR | — |
| La Ville Sous l'Eau | `ville_sous_eau.json` | FR · EN · ES | free (enfants) | EN · ES · FR | — |
| Le Cirque des Faux Sourires | `cirque_faux_sourires.json` | FR · EN · ES | free (enfants) | EN · ES · FR | — |
| Le Marchand de Nuages | `marchand_nuages.json` | FR · EN · ES | free (enfants) | EN · ES · FR | — |
| Le Temps Perdu avec Aikito | `aikito_v2.json` | FR · EN · ES | free (enfants) | EN · ES · FR | — |
| Les Mots Qu'on Garde | `mots_quon_garde.json` | FR · EN · ES | free (enfants) | EN · ES · FR | — |

---

## Actus & communauté (rappel)

| Zone | Contenu actuel |
|------|----------------|
| Actus → Communauté | Usine à Trombones (2026-08-14), Gare des regrets (2026-08-07) |
| Actus → DLC | Pack Cosmos (2026-08-10), Cinq Lames (2026-07-01) |
| Popup communauté | Cyril (Usine) · Cosmos · William (Gare) |
