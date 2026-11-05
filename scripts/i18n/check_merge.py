#!/usr/bin/env python3
"""Vérifie une traduction (fichier de travail traduit) et l'injecte dans l'histoire cible.

Usage : check_merge.py SOURCE_FR.json TRADUCTION.json CIBLE.json [--write] [--lang en|es]
- Base de l'histoire produite : la CIBLE existante (garde ses champs propres) ; chaque scène
  doit exister et avoir le même nombre de choix que le FR, sinon la scène FR est copiée.
- Contrôles : mêmes scènes, même nombre de choix, balises {{player}} et paires ** identiques
  au FR, aucun champ vide si le FR ne l'est pas, longueur plausible, peu de mots français restants.
Sans --write : rapport seulement.
"""
import json, re, sys, copy
from extract import extract, SCENE_FIELDS

# Mots-outils propres au français (absents de l'anglais ET de l'espagnol) : pas de « la », « que », « son »…
FR_WORDS = set("""les des une est pas qui dans pour avec mais vous nous elle ils elles cette ces très être
avoir fait sont était aussi encore sans leur tout comme plus quand alors donc jamais rien toujours""".split())

def fr_ratio(text):
    w = re.findall(r"[a-zàâçéèêëîïôûùüÿœáíóúñ]+", text.lower())
    return (sum(1 for x in w if x in FR_WORDS) / len(w)) if len(w) >= 6 else 0.0

def problems(fr_txt, tr_txt, where):
    out = []
    if fr_txt.strip() and not tr_txt.strip():
        out.append(f"{where}: vide")
        return out
    if fr_txt.count("{{player}}") != tr_txt.count("{{player}}"):
        out.append(f"{where}: {{{{player}}}} {fr_txt.count('{{player}}')}→{tr_txt.count('{{player}}')}")
    if re.search(r"(?<!\{)\{player\}|\{player\}(?!\})", tr_txt):
        out.append(f"{where}: balise player mal formée")
    if tr_txt.count("**") % 2:
        out.append(f"{where}: ** impair")
    elif fr_txt.count("**") != tr_txt.count("**"):
        out.append(f"{where}: ** {fr_txt.count('**')}→{tr_txt.count('**')}")
    for line in tr_txt.split("\n"):
        if line.count("**") % 2:
            out.append(f"{where}: gras qui traverse une ligne"); break
    if len(fr_txt) > 40:
        r = len(tr_txt) / len(fr_txt)
        if r < 0.55 or r > 1.7:
            out.append(f"{where}: longueur x{r:.2f}")
    if fr_ratio(tr_txt) > 0.12:
        out.append(f"{where}: semble encore en français")
    return out

def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    write = "--write" in sys.argv
    src, trp, dst = args
    fr_story = json.load(open(src, encoding="utf-8"))
    fr = extract(fr_story)
    tr = json.load(open(trp, encoding="utf-8"))
    target = json.load(open(dst, encoding="utf-8"))
    probs = []
    if set(tr["scenes"]) != set(fr["scenes"]):
        probs.append(f"scènes manquantes {set(fr['scenes'])-set(tr['scenes'])} / en trop {set(tr['scenes'])-set(fr['scenes'])}")
    for sid, fs in fr["scenes"].items():
        ts = tr["scenes"].get(sid)
        if not ts: continue
        for f in SCENE_FIELDS:
            probs += problems(fs[f], ts.get(f, ""), f"{sid}.{f}")
        if len(ts.get("choices", [])) != len(fs["choices"]):
            probs.append(f"{sid}: choix {len(fs['choices'])}→{len(ts.get('choices', []))}")
        else:
            for i, (a, b) in enumerate(zip(fs["choices"], ts["choices"])):
                probs += problems(a, b, f"{sid}.choix{i}")
    if len(tr.get("stats", [])) != len(fr["stats"]):
        probs.append("stats: nombre de libellés différent")
    print(f"{len(probs)} problème(s)")
    for p in probs[:80]: print("  -", p)
    if not write: return 1 if probs else 0
    if any(p.startswith("scènes") or ": choix " in p for p in probs):
        print("REFUS d'écrire : structure différente"); return 2

    # Injection
    out = copy.deepcopy(target)
    out["name"] = tr["name"] or out.get("name")
    for st, lab in zip(out.get("stats") or [], tr.get("stats", [])):
        if lab: st["label"] = lab
    tsc = out["scenes"]; fsc = fr_story["scenes"]
    by_id_t = tsc if isinstance(tsc, dict) else {s["id"]: s for s in tsc}
    by_id_f = fsc if isinstance(fsc, dict) else {s["id"]: s for s in fsc}
    copied = 0
    for sid, ts in tr["scenes"].items():
        scene = by_id_t.get(sid)
        if scene is None or len(scene.get("choices", [])) != len(by_id_f[sid].get("choices", [])):
            scene = copy.deepcopy(by_id_f[sid]); copied += 1
            if isinstance(tsc, dict): tsc[sid] = scene
            else:
                idx = next((i for i, s in enumerate(tsc) if s["id"] == sid), None)
                if idx is None: tsc.append(scene)
                else: tsc[idx] = scene
        for f in SCENE_FIELDS:
            if f in scene or ts.get(f): scene[f] = ts.get(f, "")
        for c, t in zip(scene.get("choices", []), ts["choices"]):
            c["text"] = t
    raw = open(dst, encoding="utf-8").read()
    ascii_ = "\\u00" in raw[:5000] and "é" not in raw
    indent = 2 if '\n  "' in raw[:200] else (None if "\n" not in raw[:500] else 1)
    json.dump(out, open(dst, "w", encoding="utf-8"), ensure_ascii=ascii_, indent=indent)
    print(f"écrit {dst} (scènes recopiées depuis le FR : {copied})")
    return 0

if __name__ == "__main__":
    sys.exit(main())
