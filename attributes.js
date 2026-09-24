/* Peoples attribute try-out: spend pools and read what each stat does. */
(function () {
  var board = document.querySelector("[data-attr-board]");
  if (!board) return;

  var MAJOR_BUDGET = 5;
  var MINOR_BUDGET = 18;

  var ATTRS = {
    health: {
      pool: "major",
      name: "Health",
      blurb: "How much harm you can take before you fall."
    },
    stamina: {
      pool: "major",
      name: "Stamina",
      blurb: "The store you spend on effort, movement, and physical work."
    },
    mana: {
      pool: "major",
      name: "Mana",
      blurb: "The store you spend on magic and spellcraft."
    },
    strength: {
      pool: "minor",
      name: "Strength",
      blurb: "How hard your blows land and how much force you can put behind them."
    },
    toughness: {
      pool: "minor",
      name: "Toughness",
      blurb: "How well you shrug off hits and keep fighting through damage."
    },
    constitution: {
      pool: "minor",
      name: "Constitution",
      blurb: "How hardy your body stays under strain, poison, and wear."
    },
    agility: {
      pool: "minor",
      name: "Agility",
      blurb: "How quickly you move, dodge, and react in a fight."
    },
    dexterity: {
      pool: "minor",
      name: "Dexterity",
      blurb: "How precisely you handle weapons, tools, and fine work."
    },
    endurance: {
      pool: "minor",
      name: "Endurance",
      blurb: "How long you can keep effort going before stamina runs out."
    },
    intelligence: {
      pool: "minor",
      name: "Intelligence",
      blurb: "How sharply you learn, plan, and shape magic."
    },
    wisdom: {
      pool: "minor",
      name: "Wisdom",
      blurb: "How well you judge, focus, and recover your bearings."
    },
    spirit: {
      pool: "minor",
      name: "Spirit",
      blurb: "How strongly your will feeds magic and resists broken resolve."
    }
  };

  var spent = {};
  Object.keys(ATTRS).forEach(function (key) { spent[key] = 0; });

  var selected = "";
  var majorLeft = board.querySelector("[data-attr-left='major']");
  var minorLeft = board.querySelector("[data-attr-left='minor']");
  var detail = board.querySelector("[data-attr-detail]");
  var detailTitle = board.querySelector("[data-attr-detail-title]");
  var detailBlurb = board.querySelector("[data-attr-detail-blurb]");
  var detailValue = board.querySelector("[data-attr-detail-value]");
  var detailPool = board.querySelector("[data-attr-detail-pool]");
  var status = board.querySelector("[data-attr-status]");
  var buttons = Array.prototype.slice.call(board.querySelectorAll("[data-attr]"));

  function poolLeft(pool) {
    var budget = pool === "major" ? MAJOR_BUDGET : MINOR_BUDGET;
    var used = 0;
    Object.keys(ATTRS).forEach(function (key) {
      if (ATTRS[key].pool === pool) used += spent[key];
    });
    return budget - used;
  }

  function flashStatus(message) {
    if (!status) return;
    status.textContent = message;
    status.classList.add("is-hot");
    window.clearTimeout(flashStatus.timer);
    flashStatus.timer = window.setTimeout(function () {
      status.classList.remove("is-hot");
    }, 900);
  }

  function render() {
    var majorRemain = poolLeft("major");
    var minorRemain = poolLeft("minor");
    if (majorLeft) majorLeft.textContent = String(majorRemain);
    if (minorLeft) minorLeft.textContent = String(minorRemain);

    buttons.forEach(function (button) {
      var key = button.getAttribute("data-attr");
      var valueNode = button.querySelector("[data-attr-value]");
      if (valueNode) valueNode.textContent = String(spent[key]);
      button.classList.toggle("is-selected", key === selected);
      button.classList.toggle("is-filled", spent[key] > 0);
      button.setAttribute("aria-pressed", key === selected ? "true" : "false");
      var remain = poolLeft(ATTRS[key].pool);
      button.classList.toggle("is-blocked", remain <= 0 && spent[key] === 0);
    });

    if (selected && ATTRS[selected]) {
      var attr = ATTRS[selected];
      detail.hidden = false;
      detailTitle.textContent = attr.name;
      detailBlurb.textContent = attr.blurb;
      detailValue.textContent = String(spent[selected]);
      detailPool.textContent = attr.pool === "major" ? "Major" : "Minor";
      detail.dataset.pool = attr.pool;
    } else {
      detail.hidden = true;
    }

    if (status && !status.classList.contains("is-hot")) {
      if (majorRemain === 0 && minorRemain === 0) {
        status.textContent = "All points spent. Refresh to try another build.";
      } else {
        status.textContent = "Select a stat to read it. Click + to spend a point, − to take one back.";
      }
    }
  }

  function selectAttr(key) {
    if (!ATTRS[key]) return;
    selected = key;
    render();
  }

  function addPoint(key) {
    var attr = ATTRS[key];
    if (!attr) return;
    if (poolLeft(attr.pool) <= 0) {
      flashStatus("No " + attr.pool + " points left.");
      return;
    }
    spent[key] += 1;
    selected = key;
    flashStatus(attr.name + " +1");
    render();
  }

  function removePoint(key) {
    var attr = ATTRS[key];
    if (!attr || spent[key] <= 0) return;
    spent[key] -= 1;
    selected = key;
    flashStatus(attr.name + " −1");
    render();
  }

  function reset() {
    Object.keys(spent).forEach(function (key) { spent[key] = 0; });
    selected = "";
    flashStatus("Points refreshed.");
    render();
  }

  board.addEventListener("click", function (event) {
    var resetBtn = event.target.closest("[data-attr-reset]");
    if (resetBtn) {
      reset();
      return;
    }

    var addBtn = event.target.closest("[data-attr-add]");
    if (addBtn) {
      addPoint(selected || addBtn.getAttribute("data-attr-add"));
      return;
    }

    var subBtn = event.target.closest("[data-attr-sub]");
    if (subBtn) {
      removePoint(selected || subBtn.getAttribute("data-attr-sub"));
      return;
    }

    var tile = event.target.closest("[data-attr]");
    if (!tile || !board.contains(tile)) return;
    var key = tile.getAttribute("data-attr");
    if (event.target.closest("[data-attr-tile-sub]")) {
      removePoint(key);
      return;
    }
    if (event.target.closest("[data-attr-tile-add]")) {
      addPoint(key);
      return;
    }
    selectAttr(key);
  });

  board.addEventListener("keydown", function (event) {
    var tile = event.target.closest("[data-attr]");
    if (!tile || !board.contains(tile)) return;
    var key = tile.getAttribute("data-attr");
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      addPoint(key);
    } else if (event.key === "-" || event.key === "_") {
      event.preventDefault();
      removePoint(key);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectAttr(key);
    }
  });

  render();
})();
