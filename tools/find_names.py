import json

items = json.load(open(r"C:\Users\davjk\Documents\crowns-call\data\items.json", encoding="utf-8"))
needles = ["Apple", "Bee", "Bellpepper", "Bell Pepper", "Cardamom", "Chrysanthemum", "Cocoa", "Dandelion", "Grape", "Grass", "Jalap", "Onion", "Sunflower", "Tulip"]
for needle in needles:
    hits = [item["name"] for item in items if needle.lower() in item["name"].lower()]
    print(needle, "->", hits[:12])
