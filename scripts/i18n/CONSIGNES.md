# Consignes de traduction — Fableris (livres dont vous êtes le héros)

Tu traduis des histoires interactives du FRANÇAIS vers la langue cible, au niveau d'un roman publié :
naturel, idiomatique, fidèle au sens ET au ton. Jamais mot à mot.

## Fichiers
- Entrée : `work/<histoire>_fr.json` — forme `{"name", "stats":[libellés], "scenes": {id: {"title","location","narrator","text","choices":[…]}}}`.
- Sortie : `work/<histoire>_<lang>.json` — EXACTEMENT la même structure : mêmes clés, mêmes ids de scène,
  même nombre et même ordre de choix. JSON valide UTF-8 (ensure_ascii=False).
  Pour les gros fichiers, procède par morceaux (ex. plusieurs fichiers partiels assemblés par un petit script Python),
  mais traduis TOUT : aucune scène ni aucun champ oublié, aucun résumé.

## Langue cible
- **en** = anglais AMÉRICAIN (theater, color, traveler, center, gray…).
- **es** = espagnol neutre (compréhensible en Espagne et en Amérique latine), tutoiement (« tú »).

## Règles
- Le narrateur tutoie le joueur : « you » / « tú ». Garde le rythme : phrases courtes restent courtes,
  les retours à la ligne `\n` et lignes vides sont conservés tels quels.
- NE TRADUIS PAS : les ids, `{{player}}` (à garder tel quel, même nombre d'occurrences),
  les noms propres inventés (personnages, villes, lieux nommés) — identiques partout.
- Gras : garde exactement les paires `**…**` du FR (même nombre, jamais à cheval sur deux lignes).
  Répliques FR `**« … »**` → en : `**"…"**` ; es : `**«…»**`.
- Lignes citées commençant par `> ` : garde le `> `.
- `location` : court, en MAJUSCULES si le FR l'est (QUAI → PLATFORM / ANDÉN ; RUE PRINCIPALE → MAIN STREET / CALLE PRINCIPAL).
  Les heures : « 23H17 » → en « 11:17 PM », es « 23:17 ».
- `title` : traduis tel quel. Si le FR commence par « Fin — », traduis par « Ending — » / « Final — » ; sinon n'ajoute rien.
- Choix : actions à l'impératif, courtes (« Attendre le prochain train » → « Wait for the next train » / « Esperar el próximo tren »).
- Jeux de mots, expressions : trouve un équivalent naturel plutôt qu'un calque.
- Aucun champ vide si le FR ne l'est pas ; champ vide si le FR est vide.

## Glossaire « Les Cinq Lames » (série)
| FR | en | es |
|---|---|---|
| Les Cinq Lames | The Five Blades | Las Cinco Espadas |
| l'Ordre (des Cinq Lames / des Lames) | the Order (of the Five Blades / of the Blades) | la Orden (de las Cinco Espadas / de las Espadas) |
| une Lame (membre / arme de l'Ordre) | a Blade | una Espada |
| Mémoire de X / Mémoire d'X | X's Memory | Memoria de X |
| porteur (d'une Lame) | bearer | portador |
Noms gardés : Aryn, Ikar, Taera, Vael, Caël, Erevane, etc.
Titres d'épisodes (`name`) : « Les Cinq Lames — Mémoire d'Aryn » → « The Five Blades — Aryn's Memory » / « Las Cinco Espadas — Memoria de Aryn ».

## Contrôle obligatoire avant de rendre
```
cd /mnt/jeux/dev/Choisis-ton-Destin--main/scripts/i18n
python3 check_merge.py ../../stories/fr/<histoire>.json <sortie> <fichier cible du dépôt>
```
SANS `--write` (ne modifie AUCUN fichier du dépôt). Corrige jusqu'à « 0 problème(s) ».
Un avertissement « longueur » peut être légitime pour un champ très court ; tout le reste doit être à 0.
