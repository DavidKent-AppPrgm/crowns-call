import os
import re

root = r"C:\Users\davjk\Neology\Assets\TNT_Physical_Components\Prefabs\2 - Items\0 - Gathering\0 - Plants"
wanted = ["Apple", "Bee Hive", "Bellpepper", "Cardamom", "Chrysanthemum", "Cocoa", "Dandelion", "Grapes", "Grass", "Onion", "Sunflower", "Tulips"]
for dirpath, _, files in os.walk(root):
    base = os.path.basename(dirpath)
    parent = os.path.basename(os.path.dirname(dirpath))
    if parent != "0 - Plants":
        continue
    if base not in wanted and "Jalap" not in base:
        continue
    names = []
    for filename in files:
        if not filename.endswith(".asset"):
            continue
        text = open(os.path.join(dirpath, filename), encoding="utf-8", errors="replace").read()
        match = re.search(r"^  itemName: (.*)$", text, re.M)
        if match:
            names.append(match.group(1).strip())
    if names:
        print(base, "=>", ", ".join(names))
