import pathlib

path = pathlib.Path(r"C:\Users\davjk\Documents\crowns-call\flora.html")
text = path.read_text(encoding="utf-8")

def item(name):
    from urllib.parse import quote
    return '<li><a href="item.html?name=%s">%s</a></li>' % (quote(name), name)

replacements = {
    '<li><a href="item.html?name=Apple">Apple</a></li>': item("Green Apple") + item("Red Apple"),
    '<li><a href="item.html?name=Bee%20Hive">Bee Hive</a></li>': item("Honey"),
    '<li><a href="item.html?name=Bellpepper">Bellpepper</a></li>': item("Green Bell Pepper") + item("Red Bell Pepper") + item("Yellow Bell Pepper"),
    '<li><a href="item.html?name=Cardamom">Cardamom</a></li>': item("Caradamom"),
    '<li><a href="item.html?name=Chrysanthemum">Chrysanthemum</a></li>': item("Blue Chrysanthemum") + item("Purple Chrysanthemum") + item("Red Chrysanthemum") + item("White Chrysanthemum") + item("Yellow Chrysanthemum"),
    '<li><a href="item.html?name=Cocoa">Cocoa</a></li>': item("Cocoa Bean"),
    '<li><a href="item.html?name=Dandelion">Dandelion</a></li>': item("Elder Dandelion") + item("Young Dandelion"),
    '<li><a href="item.html?name=Grapes">Grapes</a></li>': item("Green Grapes") + item("Purple Grapes") + item("Red Grapes"),
    '<li><a href="item.html?name=Onion">Onion</a></li>': item("Green Onion") + item("Purple Onion") + item("White Onion") + item("Yellow Onion"),
    '<li><a href="item.html?name=Sunflower">Sunflower</a></li>': item("Sun Flower"),
    '<li><a href="item.html?name=Tulips">Tulips</a></li>': item("Mana Tulip") + item("Orange Tulip") + item("Pink Tulip") + item("Red Tulip") + item("White Tulip") + item("Yellow Tulip"),
}
# Grass is ground cover, not an inventory item.
text = text.replace('<li><a href="item.html?name=Grass">Grass</a></li>', "<li>Grass</li>")
for old, new in replacements.items():
    if old not in text:
        print("MISSING", old)
    else:
        text = text.replace(old, new)
# Jalapeño may have been linked with a bad encoding.
import re
text = re.sub(r'<li><a href="item.html\?name=[^"]*">Jalape.o</a></li>', item("Jalapeño"), text)
path.write_text(text, encoding="utf-8")
print("done")
