import pathlib

root = pathlib.Path(r"C:\Users\davjk\Documents\crowns-call")
for path in root.glob("*.html"):
    text = path.read_text(encoding="utf-8")
    if "wiki-nav" not in text or "all-items.html" in text:
        continue
    plain = '<a href="library.html">Library</a>'
    current = '<a href="library.html" aria-current="page">Library</a>'
    extra = '\n        <a href="all-items.html">All Items</a>'
    if current in text:
        text = text.replace(current, current + extra, 1)
    elif plain in text:
        text = text.replace(plain, plain + extra, 1)
    else:
        print("skip", path.name)
        continue
    path.write_text(text, encoding="utf-8")
    print("updated", path.name)
