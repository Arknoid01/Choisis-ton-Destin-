# Politique des branches

## `main`

Développement courant et prochaine mise à jour Play Store / web. Version affichée : **v1.6** (jusqu’au release 1.7).

Les agents Cursor et les PR automatiques ciblent **`main`** par défaut.

## `1.7`

Branche de **release 1.7** (version affichée v1.7). Contenu stabilisé pour la future MàJ 1.7.

- **Ne pas merger dans `main`** tant que la release n’est pas validée manuellement.
- **Agents IA :** interdits sans phrase explicite du propriétaire (« autorise la branche 1.7 »). Voir `AGENTS.md`.
- **GitHub :** toute PR impliquant `1.7` exige le label **`release-1.7-authorized`**.

### Release 1.7 (manuel)

1. Finaliser sur `1.7`
2. Ouvrir PR `1.7` → `main`
3. Ajouter le label `release-1.7-authorized`
4. Merger après revue
