"""Export Cooking and Alchemy item folders from the Unity project into the wiki.

Run on the machine that has the Neology project:

  python tools/export_consumable_folders.py

Writes data/consumable-folders.json used by the Items page filters.
"""
from __future__ import annotations

import json
import os
import re
from pathlib import Path

UNITY = Path(os.environ.get(
    "CROWNS_CALL_UNITY",
    r"C:\Users\davjk\Neology\Assets",
))
PREFABS = UNITY / "TNT_Physical_Components" / "Prefabs"
SITE = Path(__file__).resolve().parents[1]
OUT = SITE / "data" / "consumable-folders.json"


def clean_yaml_string(value: str) -> str:
    value = value.strip()
    if len(value) >= 2 and value[0] == '"' and value[-1] == '"':
        value = value[1:-1]
    return value.replace("\\\\", "\\")


def item_name_from_asset(path: Path) -> str | None:
    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return None
    match = re.search(r"^  itemName: (.*)$", text, re.M)
    if not match:
        return None
    return clean_yaml_string(match.group(1))


def find_roots(prefabs: Path) -> dict[str, Path]:
    roots: dict[str, Path] = {}
    if not prefabs.exists():
        raise SystemExit(f"Prefabs not found: {prefabs}")
    for dirpath, dirnames, _ in os.walk(prefabs):
        base = os.path.basename(dirpath)
        lowered = base.lower()
        if lowered == "cooking" or re.search(r"\bcooking\b", lowered):
            roots.setdefault("food", Path(dirpath))
        if lowered == "alchemy" or re.search(r"\balchemy\b", lowered):
            roots.setdefault("potions", Path(dirpath))
    return roots


def slugify(name: str) -> str:
    text = name.strip().lower()
    text = re.sub(r"^\d+\s*[-_.]\s*", "", text)
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-") or "group"


def walk_groups(root: Path) -> list[dict]:
    groups: list[dict] = []
    # Prefer immediate child folders as the filter groups.
    children = [p for p in sorted(root.iterdir()) if p.is_dir()]
    targets = children or [root]
    for folder in targets:
        names: set[str] = set()
        for dirpath, _, files in os.walk(folder):
            for filename in files:
                if not filename.endswith(".asset"):
                    continue
                name = item_name_from_asset(Path(dirpath) / filename)
                if name:
                    names.add(name)
        label = folder.name
        label = re.sub(r"^\d+\s*[-_.]\s*", "", label).strip() or folder.name
        groups.append({
            "value": slugify(label),
            "label": label,
            "folder": str(folder.relative_to(root)) if folder != root else ".",
            "items": sorted(names),
        })
    return groups


def main() -> None:
    roots = find_roots(PREFABS)
    if "food" not in roots or "potions" not in roots:
        found = [str(p) for p in PREFABS.rglob("*") if p.is_dir() and p.name.lower() in {"cooking", "alchemy"}]
        raise SystemExit(
            "Could not find Cooking and Alchemy folders under Prefabs.\n"
            f"Searched: {PREFABS}\n"
            f"Matches: {found[:20]}"
        )
    payload = {
        "source": str(PREFABS),
        "food": walk_groups(roots["food"]),
        "potions": walk_groups(roots["potions"]),
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUT}")
    print(f"Food groups: {len(payload['food'])}")
    for group in payload["food"]:
        print(f"  - {group['label']}: {len(group['items'])} items")
    print(f"Alchemy groups: {len(payload['potions'])}")
    for group in payload["potions"]:
        print(f"  - {group['label']}: {len(group['items'])} items")


if __name__ == "__main__":
    main()
