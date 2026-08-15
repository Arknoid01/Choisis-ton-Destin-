# Politique des branches

## `main`

Prochaine mise à jour Play Store / web. Version affichée : **v1.6** (jusqu’au release 1.7).

Travail courant, correctifs et features **hors release 1.7**.

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

## GitHub Pages

Le site public ([arknoid01.github.io/Choisis-ton-Destin-/](https://arknoid01.github.io/Choisis-ton-Destin-/)) est déployé depuis la branche **`1.7`** (workflow `deploy-pages.yml`).

**Réglage unique (si pas déjà fait) :** GitHub → *Settings* → *Pages* → *Build and deployment* → **Source : GitHub Actions**.

Chaque push sur `1.7` redéploie le site (version v1.7).
