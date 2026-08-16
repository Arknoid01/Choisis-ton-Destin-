#!/usr/bin/env python3
"""Copie les assets web (source de vérité = racine du repo) vers www/,
le dossier que Capacitor empaquette dans l'app native."""
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WWW = ROOT / "www"

EXCLUDE_DIRS = {"node_modules", ".git", "android", "www", "scripts"}
EXCLUDE_FILES = {"capacitor.config.json", "package.json", "package-lock.json"}
EXCLUDE_SUFFIXES = {".md"}

def should_skip(path: Path) -> bool:
    if path.name in EXCLUDE_DIRS or path.name in EXCLUDE_FILES:
        return True
    if path.suffix in EXCLUDE_SUFFIXES:
        return True
    return False

def copy_tree(src: Path, dst: Path):
    for item in src.iterdir():
        if should_skip(item):
            continue
        target = dst / item.name
        if item.is_dir():
            target.mkdir(parents=True, exist_ok=True)
            copy_tree(item, target)
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(item, target)

if __name__ == "__main__":
    if WWW.exists():
        shutil.rmtree(WWW)
    WWW.mkdir()
    copy_tree(ROOT, WWW)
    print(f"OK — assets copiés dans {WWW}")
