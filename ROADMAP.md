# Fableris / StoryForge — Roadmap mises à jour

> Dates **cible** de publication · branches GitHub / GitHub Pages  
> Détail technique complet : [`RELEASES.md`](RELEASES.md)

### Légende

| Colonne | Signification |
|---------|---------------|
| **Branche** | Branche Git à publier / pointer pour GitHub Pages |
| **Thème** | `sf-theme.js` → `SF_THEME` |
| **Publié** | Déjà dans le repo · **Planifié** | Calendrier validé, contenu partiel ou à faire |

---

## Base Play Store (avant branches release)

| Date cible | Branche | Version | Thème | Ajouts / modifs |
|------------|---------|---------|-------|-----------------|
| **1 septembre 2026** | `main` | **v1.6** | Normal | Horloger des Rêves + Gardiens de l'Harmonie (catalogue) · Polish DLC **Cosmos / Signal Rouge** · **Usine à Trombones** (communauté, Cyril) · Sync EN/ES Gardiens (Corvin, marque, cristal) · Progression (22 badges, accroche DLC portails, bandeau concours) · Onboarding « Commencez ici » · Actualités onglets **Communauté / DLC** · Bibliothèque (catégories repliables, Cosmos sous Cinq Lames) · Concours : **12 scènes min.** · Audit billing / i18n / tests |

---

## Release 1.7 — DLC Les Profondeurs

| Date cible | Branche | Version | Thème | Ajouts / modifs |
|------------|---------|---------|-------|-----------------|
| **Automne 2026** | `1.7` | **v1.7** | 🎃 Halloween* | **DLC Les Profondeurs** : 7 épisodes FR/EN/ES (pack `abysses`) · Révisions horreur post-playtest · Fins ep.7 (Audace / Lucidité) · **La Bande du Cimetière** (gratuit, Halloween) · Titres bibliothèque courts (« 1 — Amerrissage »…) · Pack Profondeurs **sous Cosmos** · Actualités : annonce DLC Profondeurs · Politique branches + CI |

\* Sur `1.7`, le thème Halloween est aussi présent en dev ; la **MàJ Halloween « officielle »** est plutôt **`1.8`**.

---

## Release 1.8 — MàJ Halloween

| Date cible | Branche | Version | Thème | Ajouts / modifs |
|------------|---------|---------|-------|-----------------|
| **Halloween 2026** (~oct.) | `1.8` | **v1.8** | 🎃 `halloween` | Thème global orange (lune, brume, accueil concours) · Concours **Frissons d'Halloween** (deadline **27 oct.**) · **Boo et la maison grise** (Bryan, enfant, secours concours) · Tout le contenu 1.7 (Profondeurs + Cimetière) · **Pages GitHub → branche `1.8`** pendant la saison |

---

## Release 1.9 — Post-Halloween

| Date cible | Branche | Version | Thème | Ajouts / modifs |
|------------|---------|---------|-------|-----------------|
| **~10–11 nov. 2026** | `1.9` | **v1.9** | Normal `default` | Retour thème classique (or Fableris) · Concours Halloween **fermé** · **Contenu conservé** (Profondeurs, Cimetière, Boo…) · Pas de nouveau récit |

---

## Release 1.9.5 — Multijoueur local

| Date cible | Branche | Version | Thème | Ajouts / modifs |
|------------|---------|---------|-------|-----------------|
| **Novembre 2026** | `1.9.5` | **v1.9.5** | Normal `default` | **Multijoueur local wifi** (bêta) : l'hôte crée une partie (code à 4 chiffres, 2 à 8 joueurs), vote synchronisé par scène (minuteur + horloges recalées), reconnexion avec rattrapage de scène manquée · Blocage DLC pour les joueurs qui ne le possèdent pas · Popup bêta + aide intégrée sur l'écran multijoueur · Nécessite l'app installée (Android) — indisponible en navigateur/Pages |

---

## Release 2.0 — Noël (1er décembre)

| Date cible | Branche | Version | Thème | Ajouts / modifs |
|------------|---------|---------|-------|-----------------|
| **1er déc. 2026** | `2.0` | **v2.0** | 🎄 `christmas` | Thème Noël (rouge/vert, sapin) · Bandeau accueil : *« C'est Noël avant l'heure avec Fableris »* · Concours **Magie de Noël** (deadline **15 déc.**) · **À produire** : 1 histoire Noël publique · 2 histoires enfant Noël (1 visible + 1 secours concours, hors « à la une ») |

---

## Release 2.1 — Lauréat concours Noël

| Date cible | Branche | Version | Thème | Ajouts / modifs |
|------------|---------|---------|-------|-----------------|
| **~20 déc. 2026** | `2.1` | **v2.1** | 🎄 `christmas` | Publication histoire **gagnante** du concours · Mise en avant communauté + actualités · Thème Noël **inchangé** |

---

## Release 2.2 — Post-Noël

| Date cible | Branche | Version | Thème | Ajouts / modifs |
|------------|---------|---------|-------|-----------------|
| **3–4 jan. 2027** | `2.2` | **v2.2** | Normal `default` | Retour thème standard · Concours Noël **fermé** · Bandeau saisonnier masqué · Histoires Noël **restent** au catalogue |

---

## Vue calendrier

```
1 sept 2026    main v1.6     Base Play (Cosmos, Gardiens, Horloger, communauté…)
Automne 2026   1.7 v1.7      Les Profondeurs (7 ep) + Cimetière + actu DLC
~Oct 2026      1.8 v1.8      Halloween thème + concours + Boo (Pages → 1.8)
~10-11 nov     1.9 v1.9      Thème normal, post-Halloween
Novembre 2026  1.9.5 v1.9.5  Multijoueur local wifi (bêta)
1er déc        2.0 v2.0      Noël thème + concours + histoires Noël (à finir)
~20 déc        2.1 v2.1      Lauréat concours Noël
3-4 jan 2027   2.2 v2.2      Retour thème normal post-Noël
```

---

## GitHub Pages (réglage manuel)

| Période | Branche Pages |
|---------|---------------|
| Halloween | `1.8` |
| Novembre | `1.9.5` (multijoueur non testable via Pages — nécessite l'app native) |
| Décembre | `2.0` → `2.1` |
| Janvier | `2.2` |

---

## Contenu communautaire publié

| Auteur | Histoire | Rôle |
|--------|----------|------|
| William | La gare des regrets | Première histoire communauté |
| Cyril | L'Usine à Trombones | Mise en avant + actualités |
| Bryan | Boo et la maison grise | Secours concours Halloween (`1.8`+) |

---

## Notes

1. **`main` reste en v1.6** tant qu'aucune release n'est mergée avec autorisation + label `release-X.Y-authorized`.
2. Les branches **`2.1`** et **`2.2`** sont planifiées dans [`RELEASES.md`](RELEASES.md) ; **`1.7`–`1.9`**, **`1.9.5`** et **`2.0`** existent aujourd'hui sur GitHub.
3. Prochain gros bloc : **histoires Noël sur `2.0`** (3 récits + catalogue FR/EN/ES).

---

## Interrupteur thème (`sf-theme.js`)

| Valeur | Branches |
|--------|----------|
| `default` | 1.9, 1.9.5, 2.2, hors saison |
| `halloween` | 1.8 |
| `christmas` | 2.0, 2.1 |
