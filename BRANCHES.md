# Politique des branches

## `main`

Prochaine mise à jour Play Store / web. Version affichée : **v1.6** (jusqu’au release 1.7).

Travail courant, correctifs et features **hors release 1.7 / 1.8**.

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

Branche de **release 1.8** (version affichée v1.8).

- **Travail libre** : commits, PR vers `1.8`, branches feature depuis `1.8`.
- **Vers `main` : interdit sans autorisation** — pas de merge, cherry-pick ni import de la 1.8 sur `main` tant que le propriétaire n’a pas explicitement validé la release.

### Release 1.8 (manuel, avec autorisation)

1. Finaliser sur `1.8`
2. Dire à l’agent ou valider soi-même : merge 1.8 → main autorisé
3. PR **`1.8` → `main`** + label **`release-1.8-authorized`**
4. Merger

La CI bloque **uniquement** les PR **`1.8` → `main`** sans ce label.

## GitHub Pages

Site : [arknoid01.github.io/Choisis-ton-Destin-/](https://arknoid01.github.io/Choisis-ton-Destin-/)

**Source : branche `1.8`**, dossier `/` (racine).

Réglage GitHub (une fois, manuel — le token agent n’a pas les droits) :

1. Repo → **Settings** → **Pages**
2. *Build and deployment* → **Deploy from a branch**
3. Branch : **`1.8`** · Folder : **`/ (root)`**
4. Save

Chaque push sur `1.8` met à jour le site (version **v1.8**). Tant que ce réglage n’est pas fait, Pages reste sur **`1.7`** ou **`main`**.
