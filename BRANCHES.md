# Politique des branches

## `main`

Prochaine mise à jour Play Store / web. Version affichée : **v1.6** (jusqu’au release 1.7).

Travail courant, correctifs et features **hors releases 1.7 / 1.8 / 1.9**.

## `1.7`

Branche de **release 1.7** (version affichée v1.7).

- **Travail libre** : commits, PR vers `1.7`, branches feature depuis `1.7`.
- **Vers `main` : interdit sans autorisation** — pas de merge, cherry-pick ni import de la 1.7 sur `main` tant que le propriétaire n’a pas explicitement validé la release.

### Release 1.7 (manuel, avec autorisation)

1. Finaliser sur `1.7`
2. Dire à l’agent ou valider soi-même : merge 1.7 → main autorisé
3. PR **`1.7` → `main`** + label **`release-1.7-authorized`**
4. Merger

La CI bloque **uniquement** les PR **`1.7` → `main`** sans ce label.

## `1.8`

Branche **Halloween** (version affichée v1.8, thème orange 🎃, concours actif).

- **Travail libre** : commits, PR vers `1.8`, branches feature depuis `1.8`.
- **Vers `main` : interdit sans autorisation**

### Release 1.8 (manuel, avec autorisation)

PR **`1.8` → `main`** + label **`release-1.8-authorized`**

## `1.9`

Branche **post-Halloween** (version affichée v1.9, thème normal, concours clos).

- **Travail libre** : commits, PR vers `1.9`, branches feature depuis `1.9`.
- **Vers `main` : interdit sans autorisation**

### Release 1.9 (manuel, avec autorisation)

1. Finaliser sur `1.9` (après la MàJ Halloween en production)
2. PR **`1.9` → `main`** + label **`release-1.9-authorized`**
3. Merger

La CI bloque les PR **`1.9` → `main`** sans ce label.

## GitHub Pages

Site : [arknoid01.github.io/Choisis-ton-Destin-/](https://arknoid01.github.io/Choisis-ton-Destin-/)

| Période | Branche Pages | Thème |
|---------|---------------|-------|
| Avant / pendant Halloween | **`1.8`** | Orange 🎃 |
| Après Halloween | **`1.9`** | Or classique |

Réglage : Repo → **Settings** → **Pages** → branche **`/` (root)`**.
