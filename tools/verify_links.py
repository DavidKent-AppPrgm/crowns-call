import json
import pathlib
import re
import urllib.parse

items = {item["name"] for item in json.load(open(r"C:\Users\davjk\Documents\crowns-call\data\items.json", encoding="utf-8"))}
root = pathlib.Path(r"C:\Users\davjk\Documents\crowns-call")
for filename in ("flora.html", "minerals.html"):
    text = (root / filename).read_text(encoding="utf-8")
    names = [urllib.parse.unquote(name) for name in re.findall(r"item\.html\?name=([^\"<]+)", text)]
    missing = [name for name in names if name not in items]
    print(filename, len(names), "missing", missing)
