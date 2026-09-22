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

  function renderList(items) {
    var search = document.querySelector("[data-item-search]");
    var count = document.querySelector("[data-item-count]");
    var nodes = items.map(function (item) {
      var link = document.createElement("a");
      link.href = "item.html?id=" + encodeURIComponent(item.id);
      link.textContent = item.name;
      link.dataset.name = item.name.toLowerCase();
      return link;
    });
    nodes.forEach(function (node) { listRoot.appendChild(node); });

    function apply() {
      var query = search ? search.value.trim().toLowerCase() : "";
      var shown = 0;
      nodes.forEach(function (node) {
        var visible = !query || node.dataset.name.indexOf(query) !== -1;
        node.hidden = !visible;
        if (visible) shown += 1;
      });
      if (count) count.textContent = shown + " of " + items.length;
    }
    if (search) search.addEventListener("input", apply);
    apply();
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
    html += '<p><a href="all-items.html">All items</a></p></div>';
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
