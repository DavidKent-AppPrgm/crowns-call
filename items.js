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
    { value: "materials", label: "Materials" },
    { value: "misc", label: "Misc" }
  ];

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
      { value: "soup", label: "Soup" },
      { value: "stew", label: "Stew" },
      { value: "sushi", label: "Sushi" },
      { value: "toast", label: "Toast" },
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
      { value: "misc", label: "Misc" }
    ],
    sauces: [
      { value: "butter", label: "Butter" },
      { value: "jam", label: "Jam" },
      { value: "jelly", label: "Jelly" },
      { value: "paste", label: "Paste" },
      { value: "syrup", label: "Syrup" },
      { value: "misc", label: "Misc" }
    ]
  };

  var POTION_GROUPS = [
    { value: "potions", label: "Potions", types: ["Potion", "Potions", "Flask", "Vial", "Elixir"] },
    { value: "brews", label: "Brews", types: ["Brew", "Juice", "Tea", "Coffee", "Alcohol", "Spirit"] },
    { value: "attributes", label: "Attributes", types: ["Attribute"] },
    { value: "masteries", label: "Masteries", types: ["Mastery"] },
    { value: "resists", label: "Resists", types: ["Resist"] },
    { value: "immunities", label: "Immunities", types: ["Immunity"] },
    { value: "skins", label: "Skins", types: ["Skin"] },
    { value: "magics", label: "Magic", types: ["Magic"] },
    { value: "poisons", label: "Poisons", types: ["Poison", "Venom"] },
    { value: "remedies", label: "Remedies", types: ["Oil"] },
    { value: "reagents", label: "Reagents", types: ["Pigment", "Inscription"] }
  ];

  var PREPARED_FOOD_TYPES = [
    "Entree", "Sushi", "Noodle", "Rice", "Dessert", "Cookie", "Pie", "Candy", "Popsicle",
    "Toast", "Meats", "Meat", "Sausage", "Seafood", "Egg", "Soup", "Stew", "Sauce",
    "Bread", "Cheese", "Milk", "Milled"
  ];

  var PREPARED_POTION_TYPES = [
    "Potion", "Potions", "Flask", "Vial", "Elixir", "Brew", "Juice", "Tea", "Coffee",
    "Alcohol", "Spirit", "Attribute", "Mastery", "Resist", "Immunity", "Skin", "Magic",
    "Poison", "Venom", "Oil", "Pigment", "Inscription"
  ];

  var CRAFT_MARKERS = {
    Metal: true, Cloth: true, Leather: true, Mail: true, Plate: true, Ingot: true,
    Milled: true, Inscription: true, Weapon: true, Armor: true, Tool: true, Bag: true,
    Bow: true, Crossbow: true, Arrow: true, Splint: true, Bandage: true,
    Linen: true, Wool: true, Cotton: true, Lace: true, Silk: true, Satin: true,
    Denim: true, Polyester: true, Fleece: true
  };
  MATERIALS.forEach(function (material) { CRAFT_MARKERS[material] = true; });

  var MAGIC_MARKERS = { Magic: true, Grimoire: true, Rune: true, Inscription: true };
  var RANGED_MARKERS = { Bow: true, Crossbow: true, Arrow: true };

  fetch("data/items.json?v=ccs1")
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
    var lower = String(name || "").toLowerCase();
    if (set.Bag || /(^| )(bag|sack|pouch|quiver)$/.test(lower) || /(^| )(bag|sack|pouch|quiver) /.test(lower)) {
      return "tools";
    }
    if (set.Weapon || set.Bow || set.Crossbow || set.Arrow) return "weapons";
    if (set.Armor || set.Equippable) return "armor";
    if (set.Tool) return "tools";
    if (set.Consumable || set.Potion || set.Brew) return "consumables";
    if (set.Metal || set.Wood || set.Cloth || set.Leather || set.Millable || set.Milled || set.Ingot || set.Gem || set.Stone) {
      return "materials";
    }
    for (var i = 0; i < MATERIALS.length; i++) {
      if (set[MATERIALS[i]]) return "materials";
    }
    return "misc";
  }

  function isCraftable(types) {
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
    if (hasAny(set, Object.keys(RANGED_MARKERS))) return "ranged";
    if (hasAny(set, Object.keys(MAGIC_MARKERS))) return "magical";
    return "physical";
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
    if (/ Jelly$/i.test(trimmed) || /^Jelly$/i.test(trimmed)) return "jelly";
    if (/ Paste$/i.test(trimmed) || /^Paste$/i.test(trimmed)) return "paste";
    if (/ Syrup$/i.test(trimmed) || /^Syrup$/i.test(trimmed)) return "syrup";
    return "";
  }

  function isSauceItem(types, name) {
    var set = typeSet(types);
    return !!(set.Sauce || sauceKindOf(name));
  }

  function consumableBranchOf(types, name) {
    var set = typeSet(types);
    if (set.Splint || set.Bandage) return "misc";
    if (isSauceItem(types, name)) return "food";
    var foodTypes = [];
    FOOD_GROUPS.forEach(function (group) { foodTypes = foodTypes.concat(group.types); });
    var potionTypes = [];
    POTION_GROUPS.forEach(function (group) { potionTypes = potionTypes.concat(group.types); });
    var isFood = hasAny(set, foodTypes);
    var isPotion = hasAny(set, potionTypes);
    if (set.Sauce && (set.Potion || set.Brew)) return "food";
    if (isFood && !isPotion) return "food";
    if (isPotion && !isFood) return "potions";
    if (isFood) return "food";
    if (isPotion) return "potions";
    if (set.Millable || set.Milled) return "food";
    return "misc";
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
    if (isSauceItem(types, name)) return "sauces";
    if (hasAny(set, ["Entree", "Sushi", "Noodle", "Rice", "Soup", "Stew", "Toast"])) return "entrees";
    if (hasAny(set, ["Dessert", "Cookie", "Pie", "Candy", "Popsicle"])) return "desserts";
    if (hasAny(set, ["Meats", "Meat", "Sausage", "Seafood", "Egg"])) return "meats";
    if (set.Bread) return "breads";
    if (set.Cheese || set.Milk) return "dairy";
    if (set.Millable || set.Milled) return "ingredients";
    return "";
  }

  function foodDetailOf(group, types, name) {
    var set = typeSet(types);
    if (group === "entrees") {
      if (set.Soup) return "soup";
      if (set.Stew) return "stew";
      if (set.Sushi) return "sushi";
      if (set.Toast) return "toast";
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
      if (/\bRaw\b/i.test(name || "")) return "raw";
      if (/^(Cooked|Grilled|Roasted|Boiled|Fried|Deviled|Hard Boiled|Canned)\b/i.test(name || "")
        || /\b(Bratwurst|Pepperoni|Steak|Ikayaki)\b/i.test(name || "")) {
        return "cooked";
      }
      return "misc";
    }
    if (group === "sauces") {
      return sauceKindOf(name) || "misc";
    }
    return "";
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
      var branch = "";
      var groupValue = "";
      var detailValue = "";
      if (categoryValue === "consumables") {
        var key = String(item.name || "").toLowerCase();
        var set = typeSet(types);
        if (set.Splint || set.Bandage) {
          branch = "misc";
          groupValue = "";
        } else if (consumableMaps.food[key]) {
          branch = "food";
          groupValue = consumableMaps.food[key];
          detailValue = foodDetailOf(groupValue, types, item.name);
        } else if (consumableMaps.potions[key]) {
          branch = "potions";
          groupValue = consumableMaps.potions[key];
        } else {
          branch = consumableBranchOf(types, item.name);
          if (branch === "food") {
            groupValue = foodGroupOf(types, item.name);
            detailValue = foodDetailOf(groupValue, types, item.name);
          } else if (branch === "potions") {
            groupValue = groupMatch(POTION_GROUPS, types);
          }
        }
      }
      var link = document.createElement("a");
      link.href = "item.html?id=" + encodeURIComponent(item.id);
      link.textContent = item.name;
      link.dataset.name = item.name.toLowerCase();
      link.dataset.category = categoryValue;
      link.dataset.craft = isCraftable(types) ? "craftable" : "uncraftable";
      link.dataset.damage = weaponStyleOf(types);
      link.dataset.material = materialOf(types, item.name);
      link.dataset.armorFamily = family;
      link.dataset.armorDetail = armorDetailOf(types, item.name, family);
      link.dataset.toolKind = toolKindOf(types, item.name);
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
        && (consumableBranch === "all" || node.dataset.consumableBranch === consumableBranch)
        && (consumableGroup === "all" || node.dataset.consumableGroup === consumableGroup)
        && (consumableDetail === "all" || node.dataset.consumableDetail === consumableDetail);
    }

    function renderTaxonomy() {
      if (!taxonomyRoot) return;
      taxonomyRoot.innerHTML = "";

      appendTaxRow("Craftable or uncraftable", "craft", [
        { value: "all", label: "All" },
        { value: "craftable", label: "Craftable" },
        { value: "uncraftable", label: "Uncraftable" }
      ], craft);

      if (craft !== "all") {
        appendTaxRow("Item type", "category", [{ value: "all", label: "All" }].concat(CATEGORIES), category);
      }

      if (craft !== "all" && category === "weapons") {
        appendTaxRow("Weapon type", "damage", [
          { value: "all", label: "All" },
          { value: "physical", label: "Physical" },
          { value: "ranged", label: "Ranged" },
          { value: "magical", label: "Magical" }
        ], damage);
      }

      if (craft !== "all" && category === "weapons" && damage === "physical") {
        appendTaxRow("Material", "material", [{ value: "all", label: "All materials" }].concat(
          MATERIALS.map(function (name) { return { value: name, label: name }; })
        ), material);
      }

      if (craft !== "all" && category === "weapons" && damage === "ranged") {
        appendTaxRow("Material", "material", [{ value: "all", label: "All materials" }].concat(
          MATERIALS.map(function (name) { return { value: name, label: name }; })
        ), material);
      }

      if (craft !== "all" && category === "armor") {
        appendTaxRow("Armor type", "armorFamily", [{ value: "all", label: "All" }].concat(ARMOR_FAMILIES), armorFamily);
      }

      if (craft !== "all" && category === "armor" && armorFamily === "cloth") {
        appendTaxRow("Cloth", "armorDetail", [{ value: "all", label: "All cloth" }].concat(
          CLOTH_FABRICS.map(function (name) { return { value: name, label: name }; })
        ), armorDetail);
      }

      if (craft !== "all" && category === "armor" && armorFamily === "leather") {
        appendTaxRow("Leather", "armorDetail", [{ value: "all", label: "All leather" }].concat(
          LEATHER_GRADES.map(function (name) { return { value: name, label: name }; })
        ), armorDetail);
      }

      if (craft !== "all" && category === "armor" && (armorFamily === "mail" || armorFamily === "plate" || armorFamily === "jewelry")) {
        appendTaxRow("Metal", "armorDetail", [{ value: "all", label: "All metals" }].concat(
          ARMOR_METALS.map(function (name) { return { value: name, label: name }; })
        ), armorDetail);
      }

      if (craft !== "all" && category === "tools") {
        appendTaxRow("Tool type", "toolKind", [
          { value: "all", label: "All" },
          { value: "pickaxe", label: "Pickaxe" },
          { value: "key", label: "Key" },
          { value: "bag", label: "Bag" },
          { value: "misc", label: "Misc" }
        ], toolKind);
      }

      if (craft !== "all" && category === "consumables") {
        appendTaxRow("Consumable type", "consumableBranch", [
          { value: "all", label: "All" },
          { value: "food", label: "Food" },
          { value: "potions", label: "Potions" },
          { value: "misc", label: "Misc" }
        ], consumableBranch);
      }

      if (craft !== "all" && category === "consumables" && consumableBranch === "food") {
        appendTaxRow("Cooking", "consumableGroup", [{ value: "all", label: "All food" }].concat(foodGroupOptions), consumableGroup);
      }

      if (craft !== "all" && category === "consumables" && consumableBranch === "food" && FOOD_DETAILS[consumableGroup]) {
        appendTaxRow("Food type", "consumableDetail", [{ value: "all", label: "All" }].concat(FOOD_DETAILS[consumableGroup]), consumableDetail);
      }

      if (craft !== "all" && category === "consumables" && consumableBranch === "potions") {
        appendTaxRow("Alchemy", "consumableGroup", [{ value: "all", label: "All potions" }].concat(potionGroupOptions), consumableGroup);
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
