"""Read-only export of Crown's Call items into the wiki. Does not write into the Unity project."""
import json
import os
import re
import shutil

UNITY = r"C:\Users\davjk\Neology\Assets"
SCENE = os.path.join(UNITY, r"TNT_Scenes\Crown's Call\SceneLoader\UI_MenuScene.unity")
ITEMS_ROOT = os.path.join(UNITY, r"TNT_Physical_Components")
SITE = r"C:\Users\davjk\Documents\crowns-call"
ICON_DIR = os.path.join(SITE, "items", "icons")
OUT_JSON = os.path.join(SITE, "data", "items.json")
ITEM_SCRIPT = "697e716e31d782c45a2b932e08f5326b"
ATTR_SCRIPT = "6d1c7d567d271e6468b1cca8204dc4bc"
HANDLER_SCRIPT = "3e17d8a73dde16a449d76115be385708"

STATS = [
    ("item_CopperValue", "Value"),
    ("item_Weight", "Weight"),
    ("item_Max_Durability", "Max durability"),
    ("item_Health", "Health"),
    ("item_Strength", "Strength"),
    ("item_Toughness", "Toughness"),
    ("item_Constitution", "Constitution"),
    ("item_Stamina", "Stamina"),
    ("item_Agility", "Agility"),
    ("item_Dexterity", "Dexterity"),
    ("item_Endurance", "Endurance"),
    ("item_Mana", "Mana"),
    ("item_Intelligence", "Intelligence"),
    ("item_Wisdom", "Wisdom"),
    ("item_Spirit", "Spirit"),
    ("item_healthDamage", "Health damage"),
    ("item_staminaDamage", "Stamina damage"),
    ("item_manaDamage", "Mana damage"),
    ("item_Knockback", "Knockback"),
    ("item_ArmorPenetration", "Armor penetration"),
    ("item_AbsorbDamage", "Absorb"),
    ("item_HungerDamage", "Hunger"),
    ("item_HydrationDamage", "Hydration"),
    ("item_Fire_Resist", "Fire resist"),
    ("item_Water_Resist", "Water resist"),
    ("item_Earth_Resist", "Earth resist"),
    ("item_Air_Resist", "Air resist"),
    ("item_Light_Resist", "Light resist"),
    ("item_Dark_Resist", "Dark resist"),
    ("item_Soul_Resist", "Soul resist"),
    ("item_Arcane_Resist", "Arcane resist"),
    ("item_Nature_Resist", "Nature resist"),
    ("item_Fire_Mastery", "Fire mastery"),
    ("item_Water_Mastery", "Water mastery"),
    ("item_Earth_Mastery", "Earth mastery"),
    ("item_Air_Mastery", "Air mastery"),
    ("item_Light_Mastery", "Light mastery"),
    ("item_Dark_Mastery", "Dark mastery"),
    ("item_Soul_Mastery", "Soul mastery"),
    ("item_Arcane_Mastery", "Arcane mastery"),
    ("item_Nature_Mastery", "Nature mastery"),
]


def clean_yaml_string(value):
    value = value.strip()
    if len(value) >= 2 and value[0] == '"' and value[-1] == '"':
        value = value[1:-1]
    value = value.replace("\\\\", "\\")
    def hex_escape(match):
        return chr(int(match.group(1), 16))
    value = re.sub(r"\\x([0-9A-Fa-f]{2})", hex_escape, value)
    return value


def slugify(name):
    text = name.strip().lower()
    text = text.replace("'", "").replace("’", "")
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-") or "item"


def index_metas(root):
    assets, prefabs, images = {}, {}, {}
    image_ext = {".png", ".jpg", ".jpeg", ".tga", ".psd"}
    for dirpath, _, files in os.walk(root):
        for filename in files:
            if not filename.endswith(".meta"):
                continue
            source = filename[:-5]
            ext = os.path.splitext(source)[1].lower()
            path = os.path.join(dirpath, source)
            meta_path = os.path.join(dirpath, filename)
            guid = None
            with open(meta_path, "r", encoding="utf-8", errors="ignore") as handle:
                for _ in range(6):
                    line = handle.readline()
                    if line.startswith("guid: "):
                        guid = line.split("guid: ", 1)[1].strip()
                        break
            if not guid:
                continue
            if ext == ".asset":
                assets[guid] = path
            elif ext == ".prefab":
                prefabs[guid] = path
            elif ext in image_ext:
                images[guid] = path
    return assets, prefabs, images


def scene_item_guids():
    guids = []
    capturing = False
    seen_handler = False
    with open(SCENE, "r", encoding="utf-8", errors="ignore") as handle:
        for line in handle:
            if HANDLER_SCRIPT in line:
                seen_handler = True
                continue
            if seen_handler and line.startswith("  all_items:"):
                capturing = True
                continue
            if not capturing:
                continue
            match = re.search(r"guid: ([0-9a-f]{32})", line)
            if match and line.strip().startswith("-"):
                guids.append(match.group(1))
                continue
            if line.startswith("  ") and not line.startswith("  -"):
                break
            if line.startswith("---"):
                break
    return guids


def parse_asset(path):
    text = open(path, "r", encoding="utf-8", errors="ignore").read()
    if ITEM_SCRIPT not in text:
        return None

    def one(key):
        match = re.search(r"^  %s: (.*)$" % re.escape(key), text, re.M)
        return match.group(1).strip() if match else ""

    def seq(key):
        match = re.search(r"^  %s:\n((?:  - .*\n)*)" % re.escape(key), text, re.M)
        if not match:
            return []
        return [line[4:].strip() for line in match.group(1).splitlines() if line.strip()]

    prefab_2d = re.search(r"item_Prefab_2D: \{[^}]*guid: ([0-9a-f]{32})", text)
    prefab_3d = re.search(r"item_Prefab_3D: \{[^}]*guid: ([0-9a-f]{32})", text)
    return {
        "name": clean_yaml_string(one("itemName") or one("m_Name")),
        "rarity": int(one("item_rarity") or "0"),
        "width": int(one("width") or "0"),
        "height": int(one("height") or "0"),
        "types": seq("item_type"),
        "slots": seq("slot_types"),
        "description": one("book_Description").strip("'\""),
        "prefab_2d": prefab_2d.group(1) if prefab_2d else "",
        "prefab_3d": prefab_3d.group(1) if prefab_3d else "",
    }


def parse_stats(prefab_path):
    if not prefab_path or not os.path.exists(prefab_path):
        return {}
    text = open(prefab_path, "r", encoding="utf-8", errors="ignore").read()
    marker = "guid: %s" % ATTR_SCRIPT
    start = text.find(marker)
    if start < 0:
        return {}
    block = text[start:start + 8000]
    stats = {}
    for key, label in STATS:
        match = re.search(r"^  %s: (-?\d+)" % re.escape(key), block, re.M)
        if not match:
            continue
        value = int(match.group(1))
        if value != 0:
            stats[label] = value
    return stats


def sprite_guid(prefab_path):
    if not prefab_path or not os.path.exists(prefab_path):
        return ""
    text = open(prefab_path, "r", encoding="utf-8", errors="ignore").read()
    match = re.search(r"m_Sprite: \{[^}]*guid: ([0-9a-f]{32})", text)
    return match.group(1) if match else ""


def main():
    print("indexing")
    assets, prefabs, images = index_metas(ITEMS_ROOT)
    print("assets", len(assets), "prefabs", len(prefabs), "images", len(images))
    guids = scene_item_guids()
    print("scene items", len(guids))
    os.makedirs(ICON_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
    used = {}
    items = []
    missing = 0
    for index, guid in enumerate(guids):
        path = assets.get(guid)
        if not path:
            missing += 1
            continue
        data = parse_asset(path)
        if not data or not data["name"]:
            missing += 1
            continue
        base = slugify(data["name"])
        slug = base
        n = 2
        while slug in used:
            slug = "%s-%d" % (base, n)
            n += 1
        used[slug] = data["name"]
        icon = ""
        sprite = sprite_guid(prefabs.get(data["prefab_2d"], ""))
        image_path = images.get(sprite, "")
        if image_path and os.path.exists(image_path):
            ext = os.path.splitext(image_path)[1].lower() or ".png"
            dest_name = slug + ext
            dest = os.path.join(ICON_DIR, dest_name)
            if not os.path.exists(dest):
                shutil.copy2(image_path, dest)
            icon = "items/icons/" + dest_name
        stats = parse_stats(prefabs.get(data["prefab_3d"], ""))
        items.append({
            "id": slug,
            "name": data["name"],
            "rarity": data["rarity"],
            "width": data["width"],
            "height": data["height"],
            "types": data["types"],
            "slots": data["slots"],
            "description": data["description"],
            "stats": stats,
            "icon": icon,
        })
        if index and index % 400 == 0:
            print("parsed", index)
    with open(OUT_JSON, "w", encoding="utf-8") as handle:
        json.dump(items, handle, ensure_ascii=False, separators=(",", ":"))
    print("wrote", len(items), "missing", missing)


if __name__ == "__main__":
    main()
