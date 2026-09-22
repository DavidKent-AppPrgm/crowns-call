import pathlib
import re
import urllib.parse

path = pathlib.Path(r"C:\Users\davjk\Documents\crowns-call\flora.html")
text = path.read_text(encoding="utf-8")
before, rest = text.split("<h2>Fruits</h2>", 1)

def link_lists(html):
    def repl(match):
        name = match.group(1)
        quoted = urllib.parse.quote(name)
        return '<li><a href="item.html?name=%s">%s</a></li>' % (quoted, name)
    return re.sub(r"<li>([^<]+)</li>", repl, html)

linked = link_lists(rest)
path.write_text(before + "<h2>Fruits</h2>" + linked, encoding="utf-8")
print(linked.count("item.html?name="), "names linked")
