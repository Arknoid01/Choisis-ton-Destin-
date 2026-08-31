# Fableris — Branches, mises à jour et contenu

> **Dernière mise à jour :** 31 août 2026  
> Référence pour savoir **ce qui est déjà dans chaque branche** et **ce qui arrive** dans les prochaines MàJ.

---

## Vue d'ensemble

| Branche | Version | Thème (`sf-theme.js`) | Statut | Cible publication |
|---------|---------|------------------------|--------|-------------------|
| **`main`** | v1.6 | `default` | ✅ En prod (Play / Pages) | Base Play Store — 1 sept. 2026 |
| **`1.7`** | v1.7 | `halloween`* | ✅ Prête (release contenu) | Automne 2026 |
| **`1.8`** | v1.8 | `halloween` | ✅ Prête (saison Halloween) | ~oct. 2026 |
| **`1.9`** | v1.9 | `default` | ✅ Prête (post-Halloween) | ~10–11 nov. 2026 |
| **`1.9.5`** | v1.9.5 | `default` | 🚧 En dev (multijoueur bêta) | Novembre 2026 |
| **`2.0`** | v2.0 | `christmas` | 🚧 En cours (contenu Noël à finir) | 1er déc. 2026 |
| **`2.1`** | v2.1 | `christmas` | 📋 Planifiée | ~20 déc. 2026 |
| **`2.2`** | v2.2 | `default` | 📋 Planifiée | 3–4 jan. 2027 |

\* Sur `1.7`, le thème Halloween sert au dev ; la **MàJ Halloween officielle** est la branche **`1.8`**.

### Légende

| Symbole | Signification |
|---------|---------------|
| ✅ | Contenu / technique déjà dans la branche |
| 🚧 | Branche active, travail en cours |
| 📋 | Planifiée, branche pas encore créée |
| ⏳ | Prévu dans la release, pas encore fait |

---

## Calendrier

```
1 sept 2026     main v1.6      Base Play (Cosmos, Gardiens, Horloger, communauté…)
Automne 2026    1.7 v1.7       Les Profondeurs (7 ep) + Cimetière + actu DLC
~Oct 2026       1.8 v1.8       Halloween thème + concours + Boo (Pages → 1.8)
~10-11 nov      1.9 v1.9       Thème normal, concours Halloween clos
Nov 2026        1.9.5 v1.9.5   Multijoueur local wifi (bêta, app native)
1er déc         2.0 v2.0       Noël thème + concours + histoires Noël
~20 déc         2.1 v2.1       Lauréat concours Noël
3-4 jan 2027    2.2 v2.2       Retour thème normal post-Noël
```

---

## `main` — v1.6 (production courante)

**Rôle :** prochaine MàJ Play Store / web **hors releases saisonnières**. Version affichée : **v1.6**.

### Déjà ajouté

**Contenu & catalogue**
- DLC **Les Cinq Lames** (27 histoires) et **Pack Cosmos / Signal Rouge** (18 histoires)
- Pack **Enfants** (18 histoires) + histoires **gratuites** (27)
- **Horloger des Rêves** et **Gardiens de l'Harmonie** (catalogue)
- Histoires communautaires : **La gare des regrets** (William), **L'Usine à Trombones** (Cyril)
- Sync traductions EN/ES (Gardiens, Corvin, marque, cristal)

**Fonctionnalités & polish**
- Page **Actualités** (onglets Communauté / DLC)
- **Progression** : 22 badges, accroche DLC portails, bandeau concours
- **Onboarding** « Commencez ici » + micro-démo (extrait *Le Phare de Cap Brume*, choix classique / enfant)
- **Bibliothèque** : catégories repliables, Cosmos sous Cinq Lames
- Mini-tuto en jeu (menu / marque-page) avec **pause** de l'histoire pendant l'affichage
- Concours communautaire actif (thème « Une rencontre inattendue », deadline 1er oct. 2026)
- Audit billing, i18n, tests

**Correctifs récents (main + cherry-pick releases)**
- Panneau **Options** : plus de débordement mobile (safe areas, `100dvh`)
- **Actualités** : impossible de lancer un DLC non débloqué depuis une carte (redirection bibliothèque)
- Politique branches release (`1.7` → `main` protégée par CI + label)

### Pas sur `main` (réservé aux branches release)

- DLC **Les Profondeurs** (`abysses`, 7 épisodes)
- **La Bande du Cimetière** (gratuit Halloween)
- **Boo et la maison grise** (Bryan)
- Thèmes saisonniers Halloween / Noël
- Multijoueur local

---

## `1.7` — v1.7 · Les Profondeurs

**Thème :** `halloween` (dev) · **Cible :** automne 2026

### Déjà ajouté (par rapport à `main`)

| Domaine | Détail |
|---------|--------|
| **DLC Les Profondeurs** | 7 épisodes FR/EN/ES (pack `abysses`, 21 entrées catalogue) — ep.1 Amerrissage → ep.7 Le Portail |
| **Histoire gratuite** | **La Bande du Cimetière** (`cimetiere_halloween`, FR/EN/ES) |
| **Bibliothèque** | Titres courts Profondeurs (« 1 — Amerrissage »…), pack **sous Cosmos** |
| **Actualités** | Annonce DLC Les Profondeurs (FR/EN/ES) |
| **Qualité** | Révisions horreur post-playtest, fins ep.7 (Audace / Lucidité), corrections typo Cimetière |
| **Technique** | Politique branches + CI protect-release |

### Concours / communauté

- Concours **Frissons d'Halloween** (deadline 27 oct. 2026) — actif sur cette branche

---

## `1.8` — v1.8 · MàJ Halloween

**Thème :** `halloween` · **Cible :** Halloween 2026 (~oct.)  
**GitHub Pages :** pointer sur `1.8` pendant la saison.

### Déjà ajouté (par rapport à `1.7`)

| Domaine | Détail |
|---------|--------|
| **Thème visuel** | Orange, lune, brume, accueil concours Halloween |
| **Communauté** | **Boo et la maison grise** (Bryan, enfant) — secours concours, FR/EN/ES |
| **Actualités** | Carte communautaire Boo |
| **Héritage** | Tout le contenu 1.7 (Profondeurs + Cimetière) |

### Concours

- **Frissons d'Halloween** — actif, deadline **27 octobre 2026**

---

## `1.9` — v1.9 · Post-Halloween

**Thème :** `default` · **Cible :** ~10–11 nov. 2026

### Déjà ajouté (par rapport à `1.8`)

| Domaine | Détail |
|---------|--------|
| **Thème** | Retour or Fableris (plus de déco Halloween) |
| **Concours** | Halloween **fermé** (`contest.active: false`) |
| **Actualités** | Annonce gagnante : **🏆 Boo et la maison grise** (Bryan) |
| **Contenu** | Tout conservé : Profondeurs, Cimetière, Boo, communauté |

### Pas de nouveau récit

Release de **transition** : même catalogue, ambiance normale.

---

## `1.9.5` — v1.9.5 · Multijoueur local (bêta)

**Thème :** `default` · **Cible :** novembre 2026  
**⚠️ Nécessite l'app Android installée** — non testable via GitHub Pages.

### Déjà ajouté

| Domaine | Détail |
|---------|--------|
| **Multijoueur wifi** | Hôte crée une partie (code 4 chiffres, 2–8 joueurs) |
| **Vote synchronisé** | Minuteur par scène, horloges recalées entre appareils |
| **Reconnexion** | Rattrapage de scène manquée, retour lobby synchronisé |
| **DLC** | Blocage si un joueur ne possède pas le pack de l'histoire |
| **UX** | Popup bêta, aide intégrée, tutos désactivés en MP |
| **App test** | Nom installé « Fableris MP Test » pour distinguer de la prod |

### Héritage

- Base identique à `1.9` (contenu Halloween conservé, thème normal)

---

## `2.0` — v2.0 · Noël

**Thème :** `christmas` · **Cible :** **1er décembre 2026**

### Déjà ajouté

| Domaine | Détail |
|---------|--------|
| **Thème Noël** | Rouge/vert, sapin (`sf-theme.css`) |
| **Accueil** | Bandeau *« C'est Noël avant l'heure avec Fableris »* |
| **Concours** | **Magie de Noël** — actif, deadline **15 déc. 2026** |
| **Doc** | `ROADMAP.md`, `RELEASES.md` |
| **Héritage** | Contenu 1.8/1.9 (Profondeurs, Cimetière, Boo, communauté) |

### ⏳ À produire (bloquant release)

- [ ] **1 histoire Noël** publique (pack free ou free+community)
- [ ] **2 histoires enfant Noël** (pack kids)
  - [ ] 1 visible catalogue / actualités
  - [ ] 1 secours concours (catalogue seulement, hors « à la une » — modèle Boo)
- [ ] Entrées `games.json` FR/EN/ES + actualités si besoin

---

## `2.1` — v2.1 · Lauréat Noël (planifiée)

**Thème :** `christmas` · **Cible :** ~20 décembre 2026 · **Branche :** pas encore créée

### Prévu

- Publication histoire **gagnante** du concours Noël (FR/EN/ES si possible)
- Mise en avant `featured_stories` + actualités communauté
- Thème Noël **inchangé**

---

## `2.2` — v2.2 · Post-Noël (planifiée)

**Thème :** `default` · **Cible :** 3–4 janvier 2027 · **Branche :** pas encore créée

### Prévu

- Retour thème standard (`SF_THEME = 'default'`)
- Concours Noël **fermé**
- Bandeau saisonnier masqué
- Histoires Noël **conservées** au catalogue

---

## Contenu communautaire publié

| Auteur | Histoire | Première branche | Rôle |
|--------|----------|------------------|------|
| William | La gare des regrets | `main` | Première histoire communauté |
| Cyril | L'Usine à Trombones | `main` | Mise en avant + actualités |
| Bryan | Boo et la maison grise | `1.8` | Secours concours Halloween · **Gagnante** (annoncée en `1.9`) |

---

## Packs DLC (référence)

| Pack | ID | Branche d'apparition | Histoires (FR) |
|------|----|----------------------|----------------|
| Gratuit | `free` | `main` | 27 |
| Enfants | `kids` | `main` | 18 |
| Les Cinq Lames | `cinq_lames` | `main` | 27 |
| Cosmos | `cosmos` | `main` | 18 |
| Les Profondeurs | `abysses` | `1.7` | 7 épisodes (×3 langues) |

Packs **à venir** (visibles « bientôt ») : Neon, Pirates, Wilds.

---

## Correctifs partagés entre branches

Ces correctifs ont été mergés sur **`main`** puis **cherry-pickés** sur `1.7`, `1.8`, `1.9`, `2.0` :

| Correctif | PR / commit |
|-----------|-------------|
| Panneau Options mobile (overflow viewport) | PR #56 |
| Blocage lancement DLC depuis Actualités si pack verrouillé | PR #57 |

Les branches release reçoivent aussi les **révisions Bande du Cimetière** et les **features onboarding / mini-tuto** au fil des cherry-picks ou merges manuels.

---

## GitHub Pages — quelle branche publier ?

| Période | Branche à pointer |
|---------|-------------------|
| Base / hors saison | `main` (v1.6) |
| Halloween | `1.8` |
| Post-Halloween | `1.9` |
| Multijoueur (app native) | `1.9.5` |
| Décembre | `2.0` puis `2.1` |
| Janvier | `2.2` |

---

## Politique Git (agents & contributeurs)

| Branche | Usage |
|---------|--------|
| **`main`** | MàJ courante v1.6 · correctifs généraux · **pas** de contenu release 1.7+ sans autorisation |
| **`1.7`**, **`1.8`**, … | Développement libre sur la branche release · PR **vers** cette branche OK |
| **`1.7` → `main`** | **Interdit** sans autorisation explicite du propriétaire + label GitHub **`release-1.7-authorized`** |

Références : `.cursor/rules/release-1-7-protected.mdc`, `AGENTS.md`, CI `.github/workflows/protect-release-branch.yml`.

---

## Fichiers utiles

| Fichier | Contenu |
|---------|---------|
| `BRANCHES.md` | Ce document — branches, contenu, calendrier |
| `ROADMAP.md` | Roadmap détaillée (présent sur `1.9.5`, `2.0`) |
| `RELEASES.md` | Checklists techniques par release (présent sur `2.0`) |
| `CATALOGUE-HISTOIRES.md` | Liste des histoires |
| `sf-theme.js` | Interrupteur thème : `default` · `halloween` · `christmas` |

---

## Prochaines priorités

1. **`2.0`** — écrire et intégrer les **3 histoires Noël** (FR/EN/ES)
2. **`1.9.5`** — stabiliser le multijoueur bêta avant publication app
3. **`2.1` / `2.2`** — créer les branches au moment du calendrier
4. **`main`** — reste v1.6 jusqu'à merge release autorisé
