(function () {
  var listRoot = document.querySelector("[data-item-list]");
  var sheetRoot = document.querySelector("[data-item-sheet]");
  if (!listRoot && !sheetRoot) return;

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

  function categorize(types) {
    var set = {};
    (types || []).forEach(function (type) { set[type] = true; });
    if (set.Weapon) return "weapons";
    if (set.Armor || set.Equippable) return "armor";
    if (set.Tool) return "tools";
    if (set.Entree || set.Dessert || set.Cookie || set.Toast || set.Meats || set.Sauce) return "food";
    if (set.Consumable || set.Potion || set.Brew) return "consumables";
    if (set.Metal || set.Wood || set.Cloth || set.Leather || set.Millable || set.Milled || set.Ingot || set.Gem) {
      return "materials";
    }
    return "other";
  }

  function renderList(items) {
    var search = document.querySelector("[data-item-search]");
    var count = document.querySelector("[data-item-count]");
    var sort = document.querySelector("[data-item-sort]");
    var categoryRoot = document.querySelector("[data-item-categories]");
    var rarityRoot = document.querySelector("[data-item-rarities]");
    var letterRoot = document.querySelector("[data-item-letters]");
    var category = "all";
    var rarity = "all";
    var letter = "all";
    var nodes = [];

    items.forEach(function (item) {
      var link = document.createElement("a");
      link.href = "item.html?id=" + encodeURIComponent(item.id);
      link.textContent = item.name;
      link.dataset.name = item.name.toLowerCase();
      link.dataset.rarity = String(item.rarity);
      link.dataset.category = categorize(item.types);
      link.dataset.letter = letterKey(item.name);
      link.dataset.sortName = item.name.toLowerCase();
      link.dataset.sortRarity = String(item.rarity);
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
        apply();
      });
    }

    if (categoryRoot) {
      categoryRoot.addEventListener("click", function (event) {
        var button = event.target.closest("[data-category]");
        if (!button) return;
        category = button.dataset.category;
        setActive(categoryRoot, button);
        apply();
      });
    }

    if (rarityRoot) {
      rarityRoot.addEventListener("click", function (event) {
        var button = event.target.closest("[data-rarity]");
        if (!button) return;
        rarity = button.dataset.rarity;
        setActive(rarityRoot, button);
        apply();
      });
    }

    if (search) search.addEventListener("input", apply);
    if (sort) sort.addEventListener("change", apply);
    apply();

    function apply() {
      var query = search ? search.value.trim().toLowerCase() : "";
      var mode = sort ? sort.value : "name";
      var shown = nodes.filter(function (node) {
        var visible = (!query || node.dataset.name.indexOf(query) !== -1)
          && (category === "all" || node.dataset.category === category)
          && (rarity === "all" || node.dataset.rarity === rarity)
          && (letter === "all" || node.dataset.letter === letter);
        node.hidden = !visible;
        return visible;
      });

      shown.sort(function (a, b) {
        if (mode === "rarity-desc") {
          return Number(b.dataset.sortRarity) - Number(a.dataset.sortRarity)
            || a.dataset.sortName.localeCompare(b.dataset.sortName);
        }
        if (mode === "rarity-asc") {
          return Number(a.dataset.sortRarity) - Number(b.dataset.sortRarity)
            || a.dataset.sortName.localeCompare(b.dataset.sortName);
        }
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
    html += "<p>Rarity " + item.rarity;
    if (item.width && item.height) html += " · " + item.width + " by " + item.height + " inventory";
    html += "</p>";
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
