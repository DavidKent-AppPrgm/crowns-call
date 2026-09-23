/* norarity: item quality is per-drop, not catalog rarity */
(function () {
  var listRoot = document.querySelector("[data-item-list]");
  var sheetRoot = document.querySelector("[data-item-sheet]");
  if (!listRoot && !sheetRoot) return;

  var MATERIALS = [
    "Wood", "Ice", "Stone", "Copper", "Tin", "Bronze", "Tungsten", "Iron",
    "Steel", "Darksteel", "Silver", "Gold", "Platinum", "Cobalt", "Titanium", "Mythril"
  ];

  var CATEGORIES = [
    { value: "weapons", label: "Weapons" },
    { value: "armor", label: "Armor" },
    { value: "tools", label: "Tools" },
    { value: "consumables", label: "Consumables" },
    { value: "materials", label: "Materials" },
    { value: "misc", label: "Misc" }
  ];

  var CRAFT_MARKERS = {
    Metal: true, Cloth: true, Leather: true, Mail: true, Plate: true, Ingot: true,
    Milled: true, Inscription: true, Weapon: true, Armor: true, Tool: true, Bag: true,
    Linen: true, Wool: true, Cotton: true, Lace: true, Silk: true, Satin: true,
    Denim: true, Polyester: true, Fleece: true
  };
  MATERIALS.forEach(function (material) { CRAFT_MARKERS[material] = true; });

  var MAGIC_MARKERS = { Magic: true, Grimoire: true, Rune: true, Inscription: true };

  fetch("data/items.json")
    .then(function (response) {
      if (!response.ok) throw new Error("missing");
      return response.json();
    })
    .then(function (items) {
      if (listRoot) renderList(items);
      if (sheetRoot) renderSheet(items);
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

  function categorize(types) {
    var set = typeSet(types);
    if (set.Weapon) return "weapons";
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
    return false;
  }

  function isMagical(types) {
    var set = typeSet(types);
    for (var key in MAGIC_MARKERS) {
      if (set[key]) return true;
    }
    return false;
  }

  function materialOf(types) {
    var set = typeSet(types);
    for (var i = 0; i < MATERIALS.length; i++) {
      if (set[MATERIALS[i]]) return MATERIALS[i];
    }
    return "";
  }

  function renderList(items) {
    var search = document.querySelector("[data-item-search]");
    var count = document.querySelector("[data-item-count]");
    var letterRoot = document.querySelector("[data-item-letters]");
    var taxonomyRoot = document.querySelector("[data-item-taxonomy]");
    var category = "all";
    var letter = "all";
    var craft = "all";
    var damage = "all";
    var material = "all";
    var nodes = [];

    items.forEach(function (item) {
      var types = item.types || [];
      var link = document.createElement("a");
      link.href = "item.html?id=" + encodeURIComponent(item.id);
      link.textContent = item.name;
      link.dataset.name = item.name.toLowerCase();
      link.dataset.category = categorize(types);
      link.dataset.craft = isCraftable(types) ? "craftable" : "uncraftable";
      link.dataset.damage = isMagical(types) ? "magical" : "physical";
      link.dataset.material = materialOf(types);
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
        } else if (level === "category") {
          category = value;
          damage = "all";
          material = "all";
        } else if (level === "damage") {
          damage = value;
          material = "all";
        } else if (level === "material") {
          material = value;
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
        && (material === "all" || node.dataset.material === material);
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
          { value: "magical", label: "Magical" }
        ], damage);
      }

      if (craft !== "all" && category === "weapons" && damage === "physical") {
        appendTaxRow("Material", "material", [{ value: "all", label: "All materials" }].concat(
          MATERIALS.map(function (name) { return { value: name, label: name }; })
        ), material);
      }

      if (craft !== "all" && category === "armor") {
        appendTaxRow("Material", "material", [{ value: "all", label: "All materials" }].concat(
          MATERIALS.map(function (name) { return { value: name, label: name }; })
        ), material);
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
