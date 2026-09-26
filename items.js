/* Item library filters: quality/rarity is per-drop, not catalog. */
(function () {
  var listRoot = document.querySelector("[data-item-list]");
  var sheetRoot = document.querySelector("[data-item-sheet]");
  if (!listRoot && !sheetRoot) return;

  var MATERIALS = [
    "Wood", "Ice", "Stone", "Copper", "Tin", "Bronze", "Tungsten", "Iron",
    "Steel", "Darksteel", "Silver", "Gold", "Platinum", "Cobalt", "Titanium", "Mythril"
  ];

  var ARMOR_METALS = [
    "Copper", "Tin", "Bronze", "Tungsten", "Iron", "Steel", "Darksteel",
    "Silver", "Gold", "Platinum", "Cobalt", "Titanium", "Mythril"
  ];

  var CLOTH_FABRICS = [
    "Linen", "Wool", "Cotton", "Lace", "Silk", "Satin", "Denim", "Polyester", "Fleece"
  ];

  var LEATHER_GRADES = ["Soft", "Light", "Medium", "Supple", "Sturdy", "Heavy"];

  var ARMOR_FAMILIES = [
    { value: "special", label: "Special" },
    { value: "cloth", label: "Cloth" },
    { value: "leather", label: "Leather" },
    { value: "mail", label: "Mail" },
    { value: "plate", label: "Plate" },
    { value: "jewelry", label: "Jewelry" }
  ];

  var CATEGORIES = [
    { value: "weapons", label: "Weapons" },
    { value: "armor", label: "Armor" },
    { value: "tools", label: "Tools" },
    { value: "consumables", label: "Consumables" },
    { value: "materials", label: "Materials" }
  ];

  // Forced craftable materials (empty or odd types that still belong under Materials > Misc).
  var FORCE_MATERIALS = {
    "Paper": true,
    "Glass": true,
    "Empty Glass": true,
    "Alchemist's Vial": true,
    "Plastic": true,
    "Candle": true,
    "Yeast": true
  };

  // Forced craftable foods that lack prepared cooking type tags.
  var FORCE_FOOD = {
    "Brown Sugar": true,
    "Buttermilk": true,
    "Milk": true,
    "Tofu": true
  };

  var FRUIT_NAMES = {
    "Almond": true,
    "Apricot": true,
    "Avocado": true,
    "Banana": true,
    "Blackberry": true,
    "Blueberry": true,
    "Buckeye": true,
    "Cantaloupe": true,
    "Cashew": true,
    "Cashew Fruit": true,
    "Cherry": true,
    "Chestnut": true,
    "Chestnut Shell": true,
    "Coconut": true,
    "Coffee Cherry": true,
    "Cranberry": true,
    "Dragon Fruit": true,
    "Fig": true,
    "Gooseberry": true,
    "Grapefruit": true,
    "Green Apple": true,
    "Green Grapes": true,
    "Guava": true,
    "Hazelnut": true,
    "Honeydew Melon": true,
    "Kiwi": true,
    "Lemon": true,
    "Lime": true,
    "Lychee": true,
    "Mango": true,
    "Nutmeg": true,
    "Nutmeg Seed": true,
    "Olive": true,
    "Orange": true,
    "Papaya": true,
    "Passion Fruit": true,
    "Peach": true,
    "Peanut": true,
    "Pear": true,
    "Pineapple": true,
    "Pinecone": true,
    "Pistachio": true,
    "Plum": true,
    "Pomegranate": true,
    "Purple Grapes": true,
    "Raspberry": true,
    "Red Apple": true,
    "Red Grapes": true,
    "Samaras": true,
    "Star Fruit": true,
    "Strawberry": true,
    "Walnut": true,
    "Watermelon": true
  };

  var FLOWER_NAMES = {
    "Autumn Crocus": true,
    "Blue Chrysanthemum": true,
    "Bluebonnet": true,
    "Chamomile": true,
    "Daffodil": true,
    "Daisy": true,
    "Echinacea": true,
    "Elder Dandelion": true,
    "Hibiscus": true,
    "Jasmine": true,
    "Lavender": true,
    "Lily": true,
    "Lilypad": true,
    "Lotus": true,
    "Mana Tulip": true,
    "Mustard Flower": true,
    "Orange Tulip": true,
    "Pink Tulip": true,
    "Poppy": true,
    "Purple Chrysanthemum": true,
    "Red Chrysanthemum": true,
    "Red Tulip": true,
    "Rose": true,
    "Rosemary": true,
    "Sun Flower": true,
    "Water Hyacinth": true,
    "Water Lily": true,
    "White Chrysanthemum": true,
    "White Tulip": true,
    "Yellow Chrysanthemum": true,
    "Yellow Tulip": true,
    "Young Dandelion": true
  };

  var VEGETABLE_NAMES = {
    "Banana Pepper": true,
    "Beet": true,
    "Black Bean": true,
    "Broccoli": true,
    "Cabbage": true,
    "Cactus": true,
    "Carrot": true,
    "Cattail": true,
    "Cauliflower": true,
    "Cayenne Pepper": true,
    "Chickpea": true,
    "Chili Pepper": true,
    "Cucumber": true,
    "Eggplant": true,
    "Garlic": true,
    "Ghost Pepper": true,
    "Green Bean": true,
    "Green Bell Pepper": true,
    "Green Onion": true,
    "Habanero": true,
    "Jalapeño": true,
    "Kidney Bean": true,
    "Leek": true,
    "Lettuce": true,
    "Okra": true,
    "Paprika": true,
    "Papyrus": true,
    "Parsnip": true,
    "Pea": true,
    "Pinto Bean": true,
    "Potato": true,
    "Pumpkin": true,
    "Purple Onion": true,
    "Radish": true,
    "Red Bell Pepper": true,
    "Red Cabbage": true,
    "Seaweed": true,
    "Serrano Pepper": true,
    "Soy Bean": true,
    "Spinach": true,
    "Sweet Potato": true,
    "Tomato": true,
    "White Onion": true,
    "Yellow Bell Pepper": true,
    "Yellow Onion": true,
    "Yucca": true,
    "Zucchini": true
  };

  var FUNGI_NAMES = {
    "Chanterelle": true,
    "Cremini": true,
    "Death Cap": true,
    "Destroying Angel": true,
    "Fly Agaric": true,
    "Parasol": true,
    "Portobello": true,
    "Shitake": true,
    "White Button": true
  };

  var GRAIN_NAMES = {
    "Barley": true,
    "Canola": true,
    "Corn": true,
    "Flax": true,
    "Rice": true,
    "Rye": true,
    "Sugarcane": true,
    "Wheat": true
  };

  var PLANT_NAMES = {
    "Agave": true,
    "Allspice": true,
    "Almond": true,
    "Aloe Vera": true,
    "Autumn Crocus": true,
    "Bamboo": true,
    "Banana Pepper": true,
    "Barley": true,
    "Basil": true,
    "Bay Leaf": true,
    "Beet": true,
    "Belladonna": true,
    "Black Bean": true,
    "Black Pepper": true,
    "Blackberry": true,
    "Blue Chrysanthemum": true,
    "Blueberry": true,
    "Bluebonnet": true,
    "Broccoli": true,
    "Cabbage": true,
    "Cactus": true,
    "Canola": true,
    "Cantaloupe": true,
    "Caradamom": true,
    "Carrot": true,
    "Cashew": true,
    "Cattail": true,
    "Cauliflower": true,
    "Cayenne Pepper": true,
    "Chamomile": true,
    "Chanterelle": true,
    "Chickpea": true,
    "Chili Pepper": true,
    "Cinnamon": true,
    "Cloves": true,
    "Cocoa Bean": true,
    "Coffee": true,
    "Coriander": true,
    "Corn": true,
    "Cotton": true,
    "Cranberry": true,
    "Cremini": true,
    "Cucumber": true,
    "Cumin": true,
    "Daffodil": true,
    "Daisy": true,
    "Death Cap": true,
    "Destroying Angel": true,
    "Dragon Fruit": true,
    "Echinacea": true,
    "Eggplant": true,
    "Elder Dandelion": true,
    "Fenugreek": true,
    "Flax": true,
    "Fly Agaric": true,
    "Garlic": true,
    "Ghost Pepper": true,
    "Ginger": true,
    "Green Bean": true,
    "Green Bell Pepper": true,
    "Green Grapes": true,
    "Green Onion": true,
    "Guava": true,
    "Habanero": true,
    "Hibiscus": true,
    "Honey": true,
    "Honeydew Melon": true,
    "Jalapeño": true,
    "Jasmine": true,
    "Kidney Bean": true,
    "Kiwi": true,
    "Lavender": true,
    "Leek": true,
    "Lettuce": true,
    "Lily": true,
    "Lilypad": true,
    "Lotus": true,
    "Mana Tulip": true,
    "Mint": true,
    "Mustard": true,
    "Okra": true,
    "Orange Tulip": true,
    "Oregano": true,
    "Paprika": true,
    "Papyrus": true,
    "Parasol": true,
    "Parsley": true,
    "Parsnip": true,
    "Pea": true,
    "Peanut": true,
    "Pineapple": true,
    "Pink Tulip": true,
    "Pinto Bean": true,
    "Poison Ivy": true,
    "Poison Oak": true,
    "Poppy": true,
    "Portobello": true,
    "Potato": true,
    "Pumpkin": true,
    "Purple Chrysanthemum": true,
    "Purple Grapes": true,
    "Purple Onion": true,
    "Radish": true,
    "Raspberry": true,
    "Red Bell Pepper": true,
    "Red Chrysanthemum": true,
    "Red Grapes": true,
    "Red Tulip": true,
    "Rice": true,
    "Rose": true,
    "Rosemary": true,
    "Rye": true,
    "Sage": true,
    "Seaweed": true,
    "Serrano Pepper": true,
    "Sesame Seeds": true,
    "Shitake": true,
    "Soy Bean": true,
    "Spinach": true,
    "Strawberry": true,
    "Sugarcane": true,
    "Sun Flower": true,
    "Sweet Potato": true,
    "Thyme": true,
    "Tomato": true,
    "Tumbleweed": true,
    "Tumeric": true,
    "Vanilla": true,
    "Water Hyacinth": true,
    "Water Lily": true,
    "Watermelon": true,
    "Wheat": true,
    "White Button": true,
    "White Chrysanthemum": true,
    "White Onion": true,
    "White Tulip": true,
    "Yellow Bell Pepper": true,
    "Yellow Chrysanthemum": true,
    "Yellow Onion": true,
    "Yellow Tulip": true,
    "Young Dandelion": true,
    "Yucca": true,
    "Zucchini": true
  };



  var FOOD_GROUPS = [
    { value: "entrees", label: "Entrees", types: ["Entree", "Sushi", "Noodle", "Rice", "Soup", "Stew", "Toast"] },
    { value: "desserts", label: "Desserts", types: ["Dessert", "Cookie", "Pie", "Candy", "Popsicle"] },
    { value: "meats", label: "Meats", types: ["Meats", "Meat", "Sausage", "Seafood", "Egg"] },
    { value: "sauces", label: "Sauces", types: ["Sauce"] },
    { value: "breads", label: "Breads", types: ["Bread"] },
    { value: "dairy", label: "Dairy", types: ["Cheese", "Milk"] },
    { value: "ingredients", label: "Ingredients", types: ["Millable", "Milled"] }
  ];

  var FOOD_DETAILS = {
    entrees: [
      { value: "soup", label: "Soups" },
      { value: "stew", label: "Stews" },
      { value: "noodles", label: "Noodles" },
      { value: "rice", label: "Rice" },
      { value: "sushi", label: "Sushi" },
      { value: "pizza", label: "Pizza" },
      { value: "toast", label: "Toast" },
      { value: "beans", label: "Beans" },
      { value: "misc", label: "Misc" }
    ],
    desserts: [
      { value: "candy", label: "Candy" },
      { value: "cookie", label: "Cookie" },
      { value: "pie", label: "Pie" },
      { value: "popsicle", label: "Popsicle" },
      { value: "misc", label: "Misc" }
    ],
    meats: [
      { value: "cooked", label: "Cooked" },
      { value: "raw", label: "Raw" },
      { value: "ground", label: "Ground" }
    ],
    sauces: [
      { value: "butter", label: "Butter" },
      { value: "jam", label: "Jam" },
      { value: "jelly", label: "Jelly" },
      { value: "paste", label: "Paste" },
      { value: "syrup", label: "Syrup" },
      { value: "hot-sauce", label: "Hot Sauce" },
      { value: "oil", label: "Oil" },
      { value: "misc", label: "Misc" }
    ],
    ingredients: [
      { value: "powders", label: "Powders" },
      { value: "pigments", label: "Pigments" },
      { value: "seeds", label: "Seeds" },
      { value: "misc", label: "Misc" }
    ]
  };

  // Alchemy potion folders (Unity Prefabs/.../Alchemy): Protection, Attribute (+ vial/elixir/potions/flask),
  // Magic (+ mastery/resist), Immunities, Poison. Brews are a separate consumable branch.
  var POTION_GROUPS = [
    { value: "protection", label: "Protection Potion", types: ["Skin"] },
    { value: "attribute", label: "Attribute Potion", types: ["Attribute", "Vial", "Elixir", "Potions", "Flask"] },
    { value: "magic", label: "Magic Potion", types: ["Magic", "Mastery", "Resist"] },
    { value: "immunities", label: "Immunities", types: ["Immunity"] },
    { value: "poison", label: "Poison", types: ["Poison", "Venom"] },
    { value: "reagents", label: "Reagents", types: ["Inscription"] }
  ];

  var BREW_GROUPS = [
    { value: "juice", label: "Juice", types: ["Juice"] },
    { value: "tea", label: "Tea", types: ["Tea"] },
    { value: "coffee", label: "Coffee", types: ["Coffee"] },
    { value: "alcohol", label: "Alcohol", types: ["Alcohol", "Spirit", "Mixed"] }
  ];

  var POTION_DETAILS = {
    attribute: [
      { value: "vial", label: "Vials" },
      { value: "elixir", label: "Elixirs" },
      { value: "potions", label: "Potions" },
      { value: "flask", label: "Flasks" }
    ],
    magic: [
      { value: "mastery", label: "Mastery" },
      { value: "resist", label: "Resist" }
    ]
  };

  var PREPARED_FOOD_TYPES = [
    "Entree", "Sushi", "Noodle", "Rice", "Dessert", "Cookie", "Pie", "Candy", "Popsicle",
    "Toast", "Meats", "Meat", "Sausage", "Seafood", "Egg", "Soup", "Stew", "Sauce",
    "Bread", "Cheese", "Milk", "Milled", "Oil"
  ];

  var PREPARED_POTION_TYPES = [
    "Potion", "Potions", "Flask", "Vial", "Elixir", "Brew", "Juice", "Tea", "Coffee",
    "Alcohol", "Spirit", "Attribute", "Mastery", "Resist", "Immunity", "Skin", "Magic",
    "Poison", "Venom", "Pigment", "Inscription"
  ];

  var CRAFT_MARKERS = {
    Metal: true, Cloth: true, Leather: true, Mail: true, Plate: true, Ingot: true,
    Milled: true, Inscription: true, Weapon: true, Armor: true, Tool: true, Bag: true,
    Bow: true, Crossbow: true, Arrow: true, Splint: true, Bandage: true, Oil: true,
    Thread: true, String: true, Ink: true, Explosive: true,
    Linen: true, Wool: true, Cotton: true, Lace: true, Silk: true, Satin: true,
    Denim: true, Polyester: true, Fleece: true
  };
  MATERIALS.forEach(function (material) { CRAFT_MARKERS[material] = true; });

  var MAGIC_MARKERS = { Magic: true, Grimoire: true, Rune: true, Inscription: true };
  var RANGED_MARKERS = { Bow: true, Crossbow: true, Arrow: true };

  fetch("data/items.json?v=wiki-copy1")
    .then(function (response) {
      if (!response.ok) throw new Error("missing");
      return response.json();
    })
    .then(function (items) {
      return fetch("data/consumable-folders.json")
        .then(function (response) {
          if (!response.ok) return null;
          return response.json();
        })
        .catch(function () { return null; })
        .then(function (folders) {
          if (listRoot) renderList(items, folders);
          if (sheetRoot) renderSheet(items);
        });
    })
    .catch(function () {
      var target = listRoot || sheetRoot;
      target.textContent = "The item library did not load.";
    });

  function typeSet(types) {
    var set = {};
    (types || []).forEach(function (type) { set[type] = true; });
    return set;
  }

  function hasAny(set, names) {
    for (var i = 0; i < names.length; i++) {
      if (set[names[i]]) return true;
    }
    return false;
  }

  function categorize(types, name) {
    var set = typeSet(types);
    var trimmed = String(name || "").trim();
    var lower = trimmed.toLowerCase();
    if (FORCE_MATERIALS[trimmed]) return "materials";
    if (FORCE_FOOD[trimmed]) return "consumables";
    if (set.Bag || /(^| )(bag|sack|pouch|quiver)$/.test(lower) || /(^| )(bag|sack|pouch|quiver) /.test(lower)) {
      return "tools";
    }
    if (set.Explosive || set.Pyrotechnics) return "weapons";
    if (set.Weapon || set.Bow || set.Crossbow || set.Arrow) return "weapons";
    if (set.Armor || set.Equippable) return "armor";
    if (set.Tool) return "tools";
    if (set.Consumable || set.Potion || set.Brew) return "consumables";
    if (set.Metal || set.Wood || set.Cloth || set.Leather || set.Millable || set.Milled || set.Ingot || set.Gem || set.Stone || set.Thread || set.String || set.Ink) {
      return "materials";
    }
    for (var i = 0; i < MATERIALS.length; i++) {
      if (set[MATERIALS[i]]) return "materials";
    }
    return "misc";
  }

  function isCraftable(types, name) {
    var trimmed = String(name || "").trim();
    if (FORCE_MATERIALS[trimmed] || FORCE_FOOD[trimmed]) return true;
    var set = typeSet(types);
    for (var key in CRAFT_MARKERS) {
      if (set[key]) return true;
    }
    // Prepared cooking and alchemy results are craftable; raw Millable gathers are not.
    if (hasAny(set, PREPARED_FOOD_TYPES) || hasAny(set, PREPARED_POTION_TYPES)) return true;
    return false;
  }

  function weaponStyleOf(types) {
    var set = typeSet(types);
    if (set.Explosive || set.Pyrotechnics) return "explosives";
    if (hasAny(set, Object.keys(RANGED_MARKERS))) return "ranged";
    if (hasAny(set, Object.keys(MAGIC_MARKERS))) return "magical";
    return "physical";
  }

  function materialKindOf(types, name) {
    var set = typeSet(types);
    var trimmed = String(name || "").trim();
    if (set.Ingot || / Ingot$/i.test(trimmed)) return "ingot";
    if (/Leather Strips$/i.test(trimmed) || / Strips$/i.test(trimmed)) return "leather-strips";
    if (set.Leather) return "leather";
    if (set.Thread || / Thread$/i.test(trimmed)) return "thread";
    if (set.String || / String$/i.test(trimmed)) return "string";
    if (set.Ink || / Ink$/i.test(trimmed)) return "ink";
    if (set.Cloth) return "cloth";
    return "misc";
  }

  var FAUNA_FISH = {
    Bass: true, Clam: true, Cod: true, Crab: true, "Freshwater Eel": true, "Gold Fish": true,
    Herring: true, Lobster: true, Mackerel: true, Mussels: true, Octopus: true, Salmon: true,
    "Saltwater Eel": true, Shrimp: true, Squid: true, Starfish: true, Trout: true, Tuna: true
  };

  function faunaDetailOf(name) {
    var trimmed = String(name || "").trim();
    if (/Antler/i.test(trimmed) || /\bBones?\b/i.test(trimmed) || /Skull/i.test(trimmed) || /Ivory/i.test(trimmed)) {
      return "bones";
    }
    if (/^(Animal Guts|Animal Fat|Brain|Eyeball|Heart|Tail|Frog Legs)$/i.test(trimmed)) return "guts";
    if (/^Raw /i.test(trimmed) || FAUNA_FISH[trimmed] || /^Egg$/i.test(trimmed)) {
      return "meats";
    }
    if (/Pelt$/i.test(trimmed) || /Hide$/i.test(trimmed)) return "pelts";
    if (
      /^(Ladybug|Silkworm|Worm|Bee|Beetle|Black Ant|Red Ant|Caterpillar|Dragonfly|Firefly|Fly|Scorpion|Snail)$/i.test(trimmed)
      || /Jellyfish$/i.test(trimmed)
      || /Butterfly$/i.test(trimmed)
      || /Spider$/i.test(trimmed)
      || / Snake$/i.test(trimmed)
    ) {
      return "critters";
    }
    if (
      /^Feather$/i.test(trimmed)
      || /Head$/i.test(trimmed)
      || /^Head of /i.test(trimmed)
      || /^Wool$/i.test(trimmed)
      || /Dinosaur Egg$/i.test(trimmed)
    ) {
      return "misc";
    }
    return "";
  }

  function floraDetailOf(types, name) {
    var trimmed = String(name || "").trim();
    if (FLOWER_NAMES[trimmed]) return "flowers";
    if (FRUIT_NAMES[trimmed] || /^Coconut Meat$/i.test(trimmed)) return "fruits";
    if (VEGETABLE_NAMES[trimmed]) return "vegetables";
    if (FUNGI_NAMES[trimmed]) return "fungi";
    if (GRAIN_NAMES[trimmed]) return "grain";
    if (PLANT_NAMES[trimmed]) return "misc";
    return "";
  }

  function mineralDetailOf(types, name) {
    var set = typeSet(types);
    var trimmed = String(name || "").trim();
    if (/^(Sand|Sulfur|Coal|Salt Rock|Pink Salt Rock)$/i.test(trimmed)) return "misc";
    if (/\bOre\b/i.test(trimmed)) return "ore";
    if (set.Gem) return "gems";
    return "misc";
  }

  function gatherGroupOf(types, name) {
    var set = typeSet(types);
    var trimmed = String(name || "").trim();
    if (set.Coin || /Coin/i.test(trimmed)) return "currency";
    if (faunaDetailOf(trimmed)) return "fauna";
    if (floraDetailOf(types, trimmed)) return "flora";
    if (set.Gem || /\bOre\b/i.test(trimmed) || /^(Sand|Sulfur|Coal|Salt Rock|Pink Salt Rock)$/i.test(trimmed)) {
      return "minerals";
    }
    return "misc";
  }

  function gatherDetailOf(group, types, name) {
    var trimmed = String(name || "").trim();
    if (group === "flora") return floraDetailOf(types, trimmed) || "misc";
    if (group === "fauna") return faunaDetailOf(trimmed) || "misc";
    if (group === "minerals") return mineralDetailOf(types, trimmed);
    if (group === "misc") {
      if (
        /^(Bowl|Wooden Bowl|Cast Iron|Chalice|Cup|Fancy Cup|Fancy Goblet|Fancy Ladle|Fancy Mug|Fancy Plate|Fork|Goblet|Knife|Ladle|Mug|Plate|Spoon|Rolling Pin|Tankard)$/i.test(trimmed)
      ) {
        return "dishes";
      }
      if (
        /^Toy\b/i.test(trimmed)
        || /^War Piece\b/i.test(trimmed)
        || /^(Snow Globe|Dreamcatcher|Dream Catcher|Hourglass)$/i.test(trimmed)
      ) {
        return "toys";
      }
      if (/Tome$/i.test(trimmed) || /Teleportation Scroll$/i.test(trimmed)) return "tomes";
      if (/Sap$/i.test(trimmed)) return "sap";
      return "misc";
    }
    return "";
  }

  function toolKindOf(types, name) {
    var set = typeSet(types);
    var lower = String(name || "").toLowerCase();
    if (set.Bag || /(^| )(bag|sack|pouch|quiver)$/.test(lower)) return "bag";
    if (set.Pickaxe || /\bpickaxe\b/i.test(name || "")) return "pickaxe";
    if (/\bkey$/i.test(String(name || "").trim())) return "key";
    return "misc";
  }

  function sauceKindOf(name) {
    var trimmed = String(name || "").trim();
    if (/ Butter$/i.test(trimmed) || /^Butter$/i.test(trimmed)) return "butter";
    if (/ Jam$/i.test(trimmed) || /^Jam$/i.test(trimmed)) return "jam";
    if (/^Aguamiel$/i.test(trimmed)) return "jam";
    if (/ Jelly$/i.test(trimmed) || /^Jelly$/i.test(trimmed)) return "jelly";
    if (/ Paste$/i.test(trimmed) || /^Paste$/i.test(trimmed)) return "paste";
    if (/ Syrup$/i.test(trimmed) || /^Syrup$/i.test(trimmed)) return "syrup";
    if (/^(Caramel|Grenadine)$/i.test(trimmed)) return "syrup";
    if (/ Hot Sauce$/i.test(trimmed) || /^Hot Sauce$/i.test(trimmed)) return "hot-sauce";
    if (/ Oil$/i.test(trimmed) || /^Oil$/i.test(trimmed)) return "oil";
    return "";
  }

  function isSauceItem(types, name) {
    var set = typeSet(types);
    var trimmed = String(name || "").trim();
    if (set.Sauce || set.Oil || sauceKindOf(name)) return true;
    if (/^Guacamole$/i.test(trimmed)) return true;
    if (/^(Mashed Peas|Mashed Potatoes|Mashed Sweet Potato|Baba Ghanoush|Aguamiel)$/i.test(trimmed)) return true;
    return false;
  }

  function isGroundMeat(name) {
    var trimmed = String(name || "").trim();
    return /^Ground /i.test(trimmed) && !/Black Pepper/i.test(trimmed);
  }

  function isRefriedBeans(name) {
    return /^Refried .+\bBeans$/i.test(String(name || "").trim());
  }

  function isIngredientPowder(name) {
    var trimmed = String(name || "").trim();
    return / Powder$/i.test(trimmed)
      || / Flour$/i.test(trimmed)
      || /^Flour$/i.test(trimmed)
      || /^(Salt|Pink Salt|Sugar|Brown Sugar|Bone Meal|Ground Black Pepper)$/i.test(trimmed);
  }

  function isIngredientSeed(name) {
    return / Seeds?$/i.test(String(name || "").trim());
  }

  function isBrewDrink(types, name) {
    var set = typeSet(types);
    if (isSauceItem(types, name)) return false;
    if (set.Milk || set.Cheese) return false;
    if (set.Tea || set.Coffee || set.Alcohol || set.Spirit || set.Mixed || set.Juice) return true;
    // Plain Brew drinks that are not sauces/dairy.
    if (set.Brew && !set.Sauce) return true;
    return false;
  }

  function brewGroupOf(types, name) {
    var set = typeSet(types);
    var trimmed = String(name || "").trim();
    if (/^(Lemonade|Limeade)$/i.test(trimmed)) return "juice";
    if (set.Juice) return "juice";
    if (set.Tea) return "tea";
    if (set.Coffee) return "coffee";
    if (set.Alcohol || set.Spirit || set.Mixed) return "alcohol";
    return "";
  }

  function consumableBranchOf(types, name) {
    var set = typeSet(types);
    if (set.Splint) return "splint";
    if (set.Bandage) return "bandage";
    if (isSauceItem(types, name)) return "food";
    if (isBrewDrink(types, name)) return "brews";
    var foodTypes = [];
    FOOD_GROUPS.forEach(function (group) { foodTypes = foodTypes.concat(group.types); });
    var potionTypes = [];
    POTION_GROUPS.forEach(function (group) { potionTypes = potionTypes.concat(group.types); });
    var isFood = hasAny(set, foodTypes);
    var isPotion = hasAny(set, potionTypes) || set.Potion;
    if (set.Sauce && (set.Potion || set.Brew)) return "food";
    if (isFood && !isPotion) return "food";
    if (isPotion && !isFood) return "potions";
    if (isFood) return "food";
    if (isPotion) return "potions";
    if (set.Millable || set.Milled || set.Consumable) return "food";
    return "";
  }

  function groupMatch(groups, types) {
    var set = typeSet(types);
    for (var i = 0; i < groups.length; i++) {
      if (hasAny(set, groups[i].types)) return groups[i].value;
    }
    return "";
  }

  function foodGroupOf(types, name) {
    var set = typeSet(types);
    var trimmed = String(name || "").trim();
    if (isSauceItem(types, name)) return "sauces";
    if (/^Tofu$/i.test(trimmed)) return "entrees";
    if (/^Scrambled Egg$/i.test(trimmed)) return "meats";
    if (isRefriedBeans(name)) return "entrees";
    if (isGroundMeat(name)) return "meats";
    if (hasAny(set, ["Entree", "Sushi", "Noodle", "Rice", "Soup", "Stew", "Toast"])) return "entrees";
    if (hasAny(set, ["Dessert", "Cookie", "Pie", "Candy", "Popsicle"])) return "desserts";
    if (hasAny(set, ["Meats", "Meat", "Sausage", "Seafood", "Egg"])) return "meats";
    if (set.Bread) return "breads";
    if (set.Cheese || set.Milk || /^(Milk|Buttermilk)$/i.test(trimmed)) return "dairy";
    if (set.Millable || set.Milled || set.Consumable) return "ingredients";
    return "";
  }

  function foodDetailOf(group, types, name) {
    var set = typeSet(types);
    var itemName = String(name || "");
    if (group === "entrees") {
      if (set.Soup) return "soup";
      if (set.Stew) return "stew";
      if (set.Noodle) return "noodles";
      if (set.Rice) return "rice";
      if (set.Sushi) return "sushi";
      if (/\bPizza\b/i.test(itemName)) return "pizza";
      if (set.Toast) return "toast";
      if (isRefriedBeans(itemName)) return "beans";
      return "misc";
    }
    if (group === "desserts") {
      if (set.Candy) return "candy";
      if (set.Cookie) return "cookie";
      if (set.Pie) return "pie";
      if (set.Popsicle) return "popsicle";
      return "misc";
    }
    if (group === "meats") {
      if (isGroundMeat(itemName)) return "ground";
      if (/^Scrambled Egg$/i.test(itemName.trim())) return "cooked";
      if (/^(Scallop)$/i.test(itemName.trim())) return "cooked";
      if (/^(Shrimp Fillet|Tentacle)$/i.test(itemName.trim())) return "raw";
      if (/\bRaw\b/i.test(itemName)) return "raw";
      return "cooked";
    }
    if (group === "sauces") {
      if (set.Oil) return "oil";
      return sauceKindOf(name) || "misc";
    }
    if (group === "ingredients") {
      if (set.Pigment) return "pigments";
      if (isIngredientSeed(itemName)) return "seeds";
      return isIngredientPowder(itemName) ? "powders" : "misc";
    }
    return "";
  }

  function potionGroupOf(types, name) {
    var set = typeSet(types);
    if (/^Antidote$/i.test(String(name || "").trim())) return "immunities";
    if (set.Skin) return "protection";
    if (set.Attribute || set.Vial || set.Elixir || set.Potions || set.Flask) return "attribute";
    if (set.Magic || set.Mastery || set.Resist) return "magic";
    if (set.Immunity) return "immunities";
    if (set.Poison || set.Venom) return "poison";
    if (set.Inscription && !set.Pigment) return "reagents";
    return "";
  }

  function potionDetailOf(group, types) {
    var set = typeSet(types);
    var key = String(group || "").replace(/-potion$/, "");
    if (key === "attribute") {
      if (set.Vial) return "vial";
      if (set.Elixir) return "elixir";
      if (set.Potions) return "potions";
      if (set.Flask) return "flask";
      return "";
    }
    if (key === "magic") {
      if (set.Mastery) return "mastery";
      if (set.Resist) return "resist";
      return "";
    }
    return "";
  }

  function potionDetailsFor(group) {
    var key = String(group || "").replace(/-potion$/, "");
    return POTION_DETAILS[key] || null;
  }

  function materialOf(types, name) {
    var lower = String(name || "").toLowerCase();
    var byLength = MATERIALS.slice().sort(function (a, b) { return b.length - a.length; });
    for (var i = 0; i < byLength.length; i++) {
      var material = byLength[i];
      var key = material.toLowerCase();
      if (lower === key || lower.indexOf(key + " ") === 0 || lower.indexOf(key + "-") === 0) {
        return material;
      }
    }
    var set = typeSet(types);
    for (var j = 0; j < MATERIALS.length; j++) {
      if (set[MATERIALS[j]]) return MATERIALS[j];
    }
    return "";
  }

  function armorFamilyOf(types, name) {
    var lower = String(name || "").toLowerCase();
    if (lower.indexOf("bear ") === 0 || lower.indexOf("wolf ") === 0) return "special";
    var set = typeSet(types);
    if (set.Jewelry) return "jewelry";
    if (set.Mail) return "mail";
    if (set.Plate) return "plate";
    if (set.Cloth) return "cloth";
    if (set.Leather) return "leather";
    return "";
  }

  function armorDetailOf(types, name, family) {
    var set = typeSet(types);
    var lower = String(name || "").toLowerCase();
    if (family === "cloth") {
      for (var i = 0; i < CLOTH_FABRICS.length; i++) {
        var fabric = CLOTH_FABRICS[i];
        if (set[fabric] || lower.indexOf(fabric.toLowerCase() + " ") === 0) return fabric;
      }
      return "";
    }
    if (family === "leather") {
      for (var j = 0; j < LEATHER_GRADES.length; j++) {
        var grade = LEATHER_GRADES[j];
        if (new RegExp("\\b" + grade + "\\b", "i").test(name || "")) return grade;
      }
      return "";
    }
    if (family === "mail" || family === "plate" || family === "jewelry") {
      var byLength = ARMOR_METALS.slice().sort(function (a, b) { return b.length - a.length; });
      for (var k = 0; k < byLength.length; k++) {
        var metal = byLength[k];
        var key = metal.toLowerCase();
        if (lower.indexOf(key + " ") === 0 || lower.indexOf(key + "-") === 0 || set[metal]) {
          return metal;
        }
      }
      return "";
    }
    return "";
  }

  function buildConsumableMaps(folders) {
    var maps = { food: {}, potions: {}, foodGroups: [], potionGroups: [] };
    if (!folders) return maps;
    (folders.food || []).forEach(function (group) {
      maps.foodGroups.push({ value: group.value, label: group.label });
      (group.items || []).forEach(function (name) {
        maps.food[String(name).toLowerCase()] = group.value;
      });
    });
    (folders.potions || []).forEach(function (group) {
      maps.potionGroups.push({ value: group.value, label: group.label });
      (group.items || []).forEach(function (name) {
        maps.potions[String(name).toLowerCase()] = group.value;
      });
    });
    return maps;
  }

  function renderList(items, folders) {
    var consumableMaps = buildConsumableMaps(folders);
    var search = document.querySelector("[data-item-search]");
    var count = document.querySelector("[data-item-count]");
    var letterRoot = document.querySelector("[data-item-letters]");
    var taxonomyRoot = document.querySelector("[data-item-taxonomy]");
    var category = "all";
    var letter = "all";
    var craft = "all";
    var damage = "all";
    var material = "all";
    var armorFamily = "all";
    var armorDetail = "all";
    var toolKind = "all";
    var materialKind = "all";
    var gatherGroup = "all";
    var gatherDetail = "all";
    var consumableBranch = "all";
    var consumableGroup = "all";
    var consumableDetail = "all";
    var nodes = [];
    var foodGroupOptions = consumableMaps.foodGroups.length
      ? consumableMaps.foodGroups
      : FOOD_GROUPS.map(function (group) { return { value: group.value, label: group.label }; });
    var potionGroupOptions = consumableMaps.potionGroups.length
      ? consumableMaps.potionGroups
      : POTION_GROUPS.map(function (group) { return { value: group.value, label: group.label }; });

    items.forEach(function (item) {
      var types = item.types || [];
      var family = armorFamilyOf(types, item.name);
      var categoryValue = categorize(types, item.name);
      var craftValue = isCraftable(types, item.name) ? "craftable" : "gatherable";
      var branch = "";
      var groupValue = "";
      var detailValue = "";
      var gatherGroupValue = "";
      var gatherDetailValue = "";
      var materialKindValue = "";
      if (craftValue === "gatherable") {
        gatherGroupValue = gatherGroupOf(types, item.name);
        gatherDetailValue = gatherDetailOf(gatherGroupValue, types, item.name);
      }
      if (craftValue === "craftable" && categoryValue === "materials") {
        materialKindValue = materialKindOf(types, item.name);
      }
      if (categoryValue === "consumables") {
        var key = String(item.name || "").toLowerCase();
        var set = typeSet(types);
        if (set.Splint) {
          branch = "splint";
          groupValue = "";
        } else if (set.Bandage) {
          branch = "bandage";
          groupValue = "";
        } else if (consumableMaps.food[key]) {
          branch = "food";
          groupValue = consumableMaps.food[key];
          detailValue = foodDetailOf(groupValue, types, item.name);
        } else if (consumableMaps.potions[key]) {
          branch = "potions";
          groupValue = consumableMaps.potions[key];
          detailValue = potionDetailOf(groupValue, types);
        } else {
          branch = consumableBranchOf(types, item.name);
          if (branch === "food") {
            groupValue = foodGroupOf(types, item.name);
            detailValue = foodDetailOf(groupValue, types, item.name);
          } else if (branch === "potions") {
            groupValue = potionGroupOf(types, item.name) || groupMatch(POTION_GROUPS, types);
            detailValue = potionDetailOf(groupValue, types);
          } else if (branch === "brews") {
            groupValue = brewGroupOf(types, item.name) || groupMatch(BREW_GROUPS, types);
          }
        }
      }
      var link = document.createElement("a");
      link.href = "item.html?id=" + encodeURIComponent(item.id);
      link.textContent = item.name;
      link.dataset.name = item.name.toLowerCase();
      link.dataset.category = categoryValue;
      link.dataset.craft = craftValue;
      link.dataset.damage = weaponStyleOf(types);
      link.dataset.material = materialOf(types, item.name);
      link.dataset.armorFamily = family;
      link.dataset.armorDetail = armorDetailOf(types, item.name, family);
      link.dataset.toolKind = toolKindOf(types, item.name);
      link.dataset.materialKind = materialKindValue;
      link.dataset.gatherGroup = gatherGroupValue;
      link.dataset.gatherDetail = gatherDetailValue;
      link.dataset.consumableBranch = branch;
      link.dataset.consumableGroup = groupValue;
      link.dataset.consumableDetail = detailValue;
      link.dataset.letter = letterKey(item.name);
      link.dataset.sortName = item.name.toLowerCase();
      nodes.push(link);
      listRoot.appendChild(link);
    });

    if (letterRoot) {
      var letters = ["all"].concat("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")).concat(["#"]);
      letters.forEach(function (key) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "item-letter" + (key === "all" ? " is-active" : "");
        button.dataset.letter = key;
        button.textContent = key === "all" ? "All" : key;
        letterRoot.appendChild(button);
      });
      letterRoot.addEventListener("click", function (event) {
        var button = event.target.closest("[data-letter]");
        if (!button) return;
        letter = button.dataset.letter;
        setActive(letterRoot, button);
        renderTaxonomy();
        apply();
      });
    }

    if (taxonomyRoot) {
      taxonomyRoot.addEventListener("click", function (event) {
        var button = event.target.closest("button[data-tax]");
        if (!button) return;
        var level = button.dataset.tax;
        var value = button.dataset.value;
        if (level === "craft") {
          craft = value;
          category = "all";
          damage = "all";
          material = "all";
          armorFamily = "all";
          armorDetail = "all";
          toolKind = "all";
          materialKind = "all";
          gatherGroup = "all";
          gatherDetail = "all";
          consumableBranch = "all";
          consumableGroup = "all";
          consumableDetail = "all";
        } else if (level === "category") {
          category = value;
          damage = "all";
          material = "all";
          armorFamily = "all";
          armorDetail = "all";
          toolKind = "all";
          materialKind = "all";
          consumableBranch = "all";
          consumableGroup = "all";
          consumableDetail = "all";
        } else if (level === "damage") {
          damage = value;
          material = "all";
        } else if (level === "material") {
          material = value;
        } else if (level === "armorFamily") {
          armorFamily = value;
          armorDetail = "all";
        } else if (level === "armorDetail") {
          armorDetail = value;
        } else if (level === "toolKind") {
          toolKind = value;
        } else if (level === "materialKind") {
          materialKind = value;
        } else if (level === "gatherGroup") {
          gatherGroup = value;
          gatherDetail = "all";
        } else if (level === "gatherDetail") {
          gatherDetail = value;
        } else if (level === "consumableBranch") {
          consumableBranch = value;
          consumableGroup = "all";
          consumableDetail = "all";
        } else if (level === "consumableGroup") {
          consumableGroup = value;
          consumableDetail = "all";
        } else if (level === "consumableDetail") {
          consumableDetail = value;
        }
        renderTaxonomy();
        apply();
      });
    }

    if (search) {
      search.addEventListener("input", function () {
        renderTaxonomy();
        apply();
      });
    }
    renderTaxonomy();
    apply();

    function baseVisible(node) {
      var query = search ? search.value.trim().toLowerCase() : "";
      return (!query || node.dataset.name.indexOf(query) !== -1)
        && (letter === "all" || node.dataset.letter === letter);
    }

    function taxVisible(node) {
      return (craft === "all" || node.dataset.craft === craft)
        && (category === "all" || node.dataset.category === category)
        && (damage === "all" || node.dataset.damage === damage)
        && (material === "all" || node.dataset.material === material)
        && (armorFamily === "all" || node.dataset.armorFamily === armorFamily)
        && (armorDetail === "all" || node.dataset.armorDetail === armorDetail)
        && (toolKind === "all" || node.dataset.toolKind === toolKind)
        && (materialKind === "all" || node.dataset.materialKind === materialKind)
        && (gatherGroup === "all" || node.dataset.gatherGroup === gatherGroup)
        && (gatherDetail === "all" || node.dataset.gatherDetail === gatherDetail)
        && (consumableBranch === "all" || node.dataset.consumableBranch === consumableBranch)
        && (consumableGroup === "all" || node.dataset.consumableGroup === consumableGroup)
        && (consumableDetail === "all" || node.dataset.consumableDetail === consumableDetail);
    }

    function renderTaxonomy() {
      if (!taxonomyRoot) return;
      taxonomyRoot.innerHTML = "";

      appendTaxRow("Craftable or gatherable", "craft", [
        { value: "all", label: "All" },
        { value: "craftable", label: "Craftable" },
        { value: "gatherable", label: "Gatherable" }
      ], craft);

      if (craft === "gatherable") {
        appendTaxRow("Gathered type", "gatherGroup", [
          { value: "all", label: "All" },
          { value: "currency", label: "Currency" },
          { value: "flora", label: "Flora" },
          { value: "fauna", label: "Fauna" },
          { value: "minerals", label: "Minerals" },
          { value: "misc", label: "Misc" }
        ], gatherGroup);
      }

      if (craft === "gatherable" && gatherGroup === "flora") {
        appendTaxRow("Flora type", "gatherDetail", [
          { value: "all", label: "All" },
          { value: "flowers", label: "Flowers" },
          { value: "fruits", label: "Fruits" },
          { value: "vegetables", label: "Vegetables" },
          { value: "fungi", label: "Fungi" },
          { value: "grain", label: "Grain" },
          { value: "misc", label: "Misc" }
        ], gatherDetail);
      }

      if (craft === "gatherable" && gatherGroup === "fauna") {
        appendTaxRow("Fauna type", "gatherDetail", [
          { value: "all", label: "All" },
          { value: "meats", label: "Meats" },
          { value: "guts", label: "Guts" },
          { value: "bones", label: "Bones" },
          { value: "pelts", label: "Pelts & Hides" },
          { value: "critters", label: "Critters" },
          { value: "misc", label: "Misc" }
        ], gatherDetail);
      }

      if (craft === "gatherable" && gatherGroup === "minerals") {
        appendTaxRow("Mineral type", "gatherDetail", [
          { value: "all", label: "All" },
          { value: "gems", label: "Gems" },
          { value: "ore", label: "Ore" },
          { value: "misc", label: "Misc" }
        ], gatherDetail);
      }

      if (craft === "gatherable" && gatherGroup === "misc") {
        appendTaxRow("Misc type", "gatherDetail", [
          { value: "all", label: "All" },
          { value: "dishes", label: "Dishes" },
          { value: "toys", label: "Toys" },
          { value: "tomes", label: "Tomes" },
          { value: "sap", label: "Sap" },
          { value: "misc", label: "Misc" }
        ], gatherDetail);
      }

      if (craft === "craftable") {
        appendTaxRow("Item type", "category", [{ value: "all", label: "All" }].concat(CATEGORIES), category);
      }

      if (craft === "craftable" && category === "weapons") {
        appendTaxRow("Weapon type", "damage", [
          { value: "all", label: "All" },
          { value: "physical", label: "Physical" },
          { value: "ranged", label: "Ranged" },
          { value: "magical", label: "Magical" },
          { value: "explosives", label: "Explosives" }
        ], damage);
      }

      if (craft === "craftable" && category === "weapons" && damage === "physical") {
        appendTaxRow("Material", "material", [{ value: "all", label: "All materials" }].concat(
          MATERIALS.map(function (name) { return { value: name, label: name }; })
        ), material);
      }

      if (craft === "craftable" && category === "weapons" && damage === "ranged") {
        appendTaxRow("Material", "material", [{ value: "all", label: "All materials" }].concat(
          MATERIALS.map(function (name) { return { value: name, label: name }; })
        ), material);
      }

      if (craft === "craftable" && category === "armor") {
        appendTaxRow("Armor type", "armorFamily", [{ value: "all", label: "All" }].concat(ARMOR_FAMILIES), armorFamily);
      }

      if (craft === "craftable" && category === "armor" && armorFamily === "cloth") {
        appendTaxRow("Cloth", "armorDetail", [{ value: "all", label: "All cloth" }].concat(
          CLOTH_FABRICS.map(function (name) { return { value: name, label: name }; })
        ), armorDetail);
      }

      if (craft === "craftable" && category === "armor" && armorFamily === "leather") {
        appendTaxRow("Leather", "armorDetail", [{ value: "all", label: "All leather" }].concat(
          LEATHER_GRADES.map(function (name) { return { value: name, label: name }; })
        ), armorDetail);
      }

      if (craft === "craftable" && category === "armor" && (armorFamily === "mail" || armorFamily === "plate" || armorFamily === "jewelry")) {
        appendTaxRow("Metal", "armorDetail", [{ value: "all", label: "All metals" }].concat(
          ARMOR_METALS.map(function (name) { return { value: name, label: name }; })
        ), armorDetail);
      }

      if (craft === "craftable" && category === "tools") {
        appendTaxRow("Tool type", "toolKind", [
          { value: "all", label: "All" },
          { value: "pickaxe", label: "Pickaxe" },
          { value: "key", label: "Key" },
          { value: "bag", label: "Bag" },
          { value: "misc", label: "Misc" }
        ], toolKind);
      }

      if (craft === "craftable" && category === "materials") {
        appendTaxRow("Material type", "materialKind", [
          { value: "all", label: "All" },
          { value: "ingot", label: "Ingot" },
          { value: "leather", label: "Leather" },
          { value: "leather-strips", label: "Leather Strips" },
          { value: "thread", label: "Thread" },
          { value: "string", label: "String" },
          { value: "cloth", label: "Cloth" },
          { value: "ink", label: "Ink" },
          { value: "misc", label: "Misc" }
        ], materialKind);
      }

      if (craft === "craftable" && category === "consumables") {
        appendTaxRow("Consumable type", "consumableBranch", [
          { value: "all", label: "All" },
          { value: "food", label: "Food" },
          { value: "potions", label: "Potions" },
          { value: "brews", label: "Brews" },
          { value: "splint", label: "Splint" },
          { value: "bandage", label: "Bandage" }
        ], consumableBranch);
      }

      if (craft === "craftable" && category === "consumables" && consumableBranch === "food") {
        appendTaxRow("Cooking", "consumableGroup", [{ value: "all", label: "All food" }].concat(foodGroupOptions), consumableGroup);
      }

      if (craft === "craftable" && category === "consumables" && consumableBranch === "food" && FOOD_DETAILS[consumableGroup]) {
        appendTaxRow("Food type", "consumableDetail", [{ value: "all", label: "All" }].concat(FOOD_DETAILS[consumableGroup]), consumableDetail);
      }

      if (craft === "craftable" && category === "consumables" && consumableBranch === "potions") {
        appendTaxRow("Alchemy", "consumableGroup", [{ value: "all", label: "All potions" }].concat(potionGroupOptions), consumableGroup);
      }

      if (craft === "craftable" && category === "consumables" && consumableBranch === "potions" && potionDetailsFor(consumableGroup)) {
        appendTaxRow("Potion type", "consumableDetail", [{ value: "all", label: "All" }].concat(potionDetailsFor(consumableGroup)), consumableDetail);
      }

      if (craft === "craftable" && category === "consumables" && consumableBranch === "brews") {
        appendTaxRow("Brew type", "consumableGroup", [{ value: "all", label: "All brews" }].concat(
          BREW_GROUPS.map(function (group) { return { value: group.value, label: group.label }; })
        ), consumableGroup);
      }
    }

    function appendTaxRow(ariaLabel, level, options, activeValue) {
      var row = document.createElement("div");
      row.className = "item-tax-row";

      var group = document.createElement("div");
      group.className = "item-filters";
      group.setAttribute("role", "group");
      group.setAttribute("aria-label", ariaLabel);

      options.forEach(function (option) {
        var available = option.value === "all" || nodes.some(function (node) {
          if (!baseVisible(node)) return false;
          if (level === "craft") return node.dataset.craft === option.value;
          if (level === "category") {
            return (craft === "all" || node.dataset.craft === craft)
              && node.dataset.category === option.value;
          }
          if (level === "damage") {
            return (craft === "all" || node.dataset.craft === craft)
              && (category === "all" || node.dataset.category === category)
              && node.dataset.damage === option.value;
          }
          if (level === "material") {
            return (craft === "all" || node.dataset.craft === craft)
              && (category === "all" || node.dataset.category === category)
              && (damage === "all" || node.dataset.damage === damage)
              && node.dataset.material === option.value;
          }
          if (level === "armorFamily") {
            return (craft === "all" || node.dataset.craft === craft)
              && (category === "all" || node.dataset.category === category)
              && node.dataset.armorFamily === option.value;
          }
          if (level === "armorDetail") {
            return (craft === "all" || node.dataset.craft === craft)
              && (category === "all" || node.dataset.category === category)
              && (armorFamily === "all" || node.dataset.armorFamily === armorFamily)
              && node.dataset.armorDetail === option.value;
          }
          if (level === "toolKind") {
            return (craft === "all" || node.dataset.craft === craft)
              && (category === "all" || node.dataset.category === category)
              && node.dataset.toolKind === option.value;
          }
          if (level === "materialKind") {
            return (craft === "all" || node.dataset.craft === craft)
              && (category === "all" || node.dataset.category === category)
              && node.dataset.materialKind === option.value;
          }
          if (level === "gatherGroup") {
            return (craft === "all" || node.dataset.craft === craft)
              && node.dataset.gatherGroup === option.value;
          }
          if (level === "gatherDetail") {
            return (craft === "all" || node.dataset.craft === craft)
              && (gatherGroup === "all" || node.dataset.gatherGroup === gatherGroup)
              && node.dataset.gatherDetail === option.value;
          }
          if (level === "consumableBranch") {
            return (craft === "all" || node.dataset.craft === craft)
              && (category === "all" || node.dataset.category === category)
              && node.dataset.consumableBranch === option.value;
          }
          if (level === "consumableGroup") {
            return (craft === "all" || node.dataset.craft === craft)
              && (category === "all" || node.dataset.category === category)
              && (consumableBranch === "all" || node.dataset.consumableBranch === consumableBranch)
              && node.dataset.consumableGroup === option.value;
          }
          if (level === "consumableDetail") {
            return (craft === "all" || node.dataset.craft === craft)
              && (category === "all" || node.dataset.category === category)
              && (consumableBranch === "all" || node.dataset.consumableBranch === consumableBranch)
              && (consumableGroup === "all" || node.dataset.consumableGroup === consumableGroup)
              && node.dataset.consumableDetail === option.value;
          }
          return false;
        });
        if (!available && option.value !== "all") return;

        var button = document.createElement("button");
        button.type = "button";
        button.className = "item-filter" + (option.value === activeValue ? " is-active" : "");
        button.dataset.tax = level;
        button.dataset.value = option.value;
        button.textContent = option.label;
        group.appendChild(button);
      });

      row.appendChild(group);
      taxonomyRoot.appendChild(row);
    }

    function apply() {
      var shown = nodes.filter(function (node) {
        var visible = baseVisible(node) && taxVisible(node);
        node.hidden = !visible;
        return visible;
      });

      shown.sort(function (a, b) {
        return a.dataset.sortName.localeCompare(b.dataset.sortName);
      });

      shown.forEach(function (node) { listRoot.appendChild(node); });
      if (count) {
        count.textContent = shown.length + " of " + items.length + " items";
      }
    }
  }

  function letterKey(name) {
    var first = String(name || "").charAt(0).toUpperCase();
    return first >= "A" && first <= "Z" ? first : "#";
  }

  function setActive(root, active) {
    Array.prototype.forEach.call(root.querySelectorAll("button"), function (button) {
      button.classList.toggle("is-active", button === active);
    });
  }

  function renderSheet(items) {
    var params = new URLSearchParams(window.location.search);
    var id = params.get("id");
    var name = params.get("name");
    var item = null;
    for (var i = 0; i < items.length; i++) {
      if (id && items[i].id === id) { item = items[i]; break; }
      if (!id && name && items[i].name === name) { item = items[i]; break; }
    }
    if (!item) {
      sheetRoot.textContent = "That item is not in the library.";
      return;
    }
    document.title = item.name + " — Crown's Call";
    var html = "";
    if (item.icon) {
      html += '<img class="item-icon" src="' + item.icon + '" alt="">';
    }
    html += '<div><p class="eyebrow kicker">Item</p><h1>' + escapeHtml(item.name) + "</h1>";
    if (item.types && item.types.length) {
      html += "<p>" + item.types.map(escapeHtml).join(" · ") + "</p>";
    }
    if (item.width && item.height) {
      html += "<p>" + item.width + " by " + item.height + " inventory</p>";
    }
    if (item.slots && item.slots.length) {
      html += "<p>Worn in " + item.slots.map(escapeHtml).join(", ") + "</p>";
    }
    if (item.description) html += "<p>" + escapeHtml(item.description) + "</p>";
    if (item.id === "fort-blueprint" || /^Fort Blueprint$/i.test(item.name || "")) {
      html += "<p>Given to a new character after they complete the quest 'Getting Started'.</p>";
    }
    var labels = Object.keys(item.stats || {});
    if (labels.length) {
      html += "<table><thead><tr><th>Stat</th><th>Value</th></tr></thead><tbody>";
      labels.forEach(function (label) {
        html += "<tr><td>" + escapeHtml(label) + "</td><td>" + item.stats[label] + "</td></tr>";
      });
      html += "</tbody></table>";
    } else {
      html += "<p>This item has no listed stats in the current build.</p>";
    }
    html += '<p><a href="all-items.html">Back to Items</a></p></div>';
    sheetRoot.innerHTML = html;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
