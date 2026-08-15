# Instructions agents (Fableris / StoryForge)

## Branche par défaut

Travaillez sur **`main`**. Créez les branches feature en `cursor/<description>-0aad` **depuis `main`**.

## Branche release `1.7` — protégée

La branche **`1.7`** prépare la version 1.7. Elle **ne doit pas** être utilisée par un agent sans autorisation explicite du propriétaire.

**Interdit sans autorisation :**

- checkout / commit / push sur `1.7`
- PR impliquant `1.7` (base ou head)
- merge ou cherry-pick entre `1.7` et `main`

**Autorisation :** le propriétaire doit écrire explicitement qu'il autorise le travail sur `1.7` (ex. « autorise la branche 1.7 »).

**Release :** merge `1.7` → `main` uniquement quand le propriétaire le demande, en ajoutant le label GitHub `release-1.7-authorized` si la CI bloque la PR.

## Fichiers de référence

- Règle Cursor : `.cursor/rules/release-1-7-protected.mdc`
- CI : `.github/workflows/protect-release-branch.yml`
