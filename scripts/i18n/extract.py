#!/usr/bin/env python3
"""Extrait les textes traduisibles d'une histoire FR vers un fichier de travail.

Usage : extract.py stories/fr/theatre_carcosa.json travail.json
Le fichier de travail a la forme :
  {"name": str, "stats": [label…], "scenes": {id: {"title","location","narrator","text","choices":[str…]}}}
Le traducteur renvoie EXACTEMENT la même forme, textes traduits.
"""
import json, sys

SCENE_FIELDS = ("title", "location", "narrator", "text")

def extract(story):
    sc = story["scenes"]
    scenes = sc.values() if isinstance(sc, dict) else sc
    out = {"name": story.get("name", ""),
           "stats": [s.get("label", "") for s in story.get("stats") or []],
           "scenes": {}}
    for s in scenes:
        out["scenes"][s["id"]] = {
            **{f: s.get(f, "") or "" for f in SCENE_FIELDS},
            "choices": [(c.get("text") or "") for c in s.get("choices", [])],
        }
    return out

if __name__ == "__main__":
    src, dst = sys.argv[1], sys.argv[2]
    data = extract(json.load(open(src, encoding="utf-8")))
    json.dump(data, open(dst, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    words = sum(len(v.split()) for s in data["scenes"].values()
                for v in [s["title"], s["location"], s["narrator"], s["text"], *s["choices"]])
    print(f"{len(data['scenes'])} scènes, {words} mots → {dst}")
