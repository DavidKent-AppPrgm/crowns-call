/* Peoples attribute try-out: click a stat to spend and read its tooltip. */
(function () {
  var board = document.querySelector("[data-attr-board]");
  if (!board) return;

  var MAJOR_BUDGET = 5;
  var MINOR_BUDGET = 18;

  var ATTRS = {
    health: {
      pool: "major",
      name: "Health",
      blurb: "How much harm you can take before you fall.",
      note: "Health Points"
    },
    stamina: {
      pool: "major",
      name: "Stamina",
      blurb: "How much energy you have to spend on movement.",
      note: "Stamina Points"
    },
    mana: {
      pool: "major",
      name: "Mana",
      blurb: "The amount of power you have to cast magical abilities.",
      note: "Mana Points"
    },
    strength: {
      pool: "minor",
      name: "Strength",
      blurb: "How hard your blows land and how much force you can put behind them.",
      note: "Physical Damage Dealt"
    },
    toughness: {
      pool: "minor",
      name: "Toughness",
      blurb: "How well you shrug off hits and keep fighting through damage.",
      note: "Damage Reduction"
    },
    constitution: {
      pool: "minor",
      name: "Constitution",
      blurb: "How hardy your body stays under strain, poison, and wear.",
      note: "Health Regeneration"
    },
    agility: {
      pool: "minor",
      name: "Agility",
      blurb: "How quickly you move, dodge, and react in a fight.",
      note: "Movement Speed"
    },
    dexterity: {
      pool: "minor",
      name: "Dexterity",
      blurb: "How precisely you handle weapons, tools, and fine work.",
      note: "Physical Attack Speed"
    },
    endurance: {
      pool: "minor",
      name: "Endurance",
      blurb: "How long you can keep effort going before stamina runs out.",
      note: "Stamina Regeneration"
    },
    intelligence: {
      pool: "minor",
      name: "Intelligence",
      blurb: "How sharply you learn, plan, and shape magic.",
      note: "Magical Damage Dealt"
    },
    wisdom: {
      pool: "minor",
      name: "Wisdom",
      blurb: "How well you judge, focus, and recover your bearings.",
      note: "Spell Casting Speed"
    },
    spirit: {
      pool: "minor",
      name: "Spirit",
      blurb: "How strongly your will feeds magic and resists broken resolve.",
      note: "Mana Regeneration"
    }
  };

  var spent = {};
  Object.keys(ATTRS).forEach(function (key) { spent[key] = 0; });

  var selected = "";
  var majorLeft = board.querySelector("[data-attr-left='major']");
  var minorLeft = board.querySelector("[data-attr-left='minor']");
  var tooltip = board.querySelector("[data-attr-tooltip]");
  var tooltipTitle = board.querySelector("[data-attr-tooltip-title]");
  var tooltipBlurb = board.querySelector("[data-attr-tooltip-blurb]");
  var tooltipNote = board.querySelector("[data-attr-tooltip-note]");
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
      updateIdleStatus();
    }, 900);
  }

  function updateIdleStatus() {
    if (!status) return;
    var majorRemain = poolLeft("major");
    var minorRemain = poolLeft("minor");
    if (majorRemain === 0 && minorRemain === 0) {
      status.textContent = "All points spent. Refresh to try another build.";
    } else {
      status.textContent = "Click a stat to spend a point on it.";
    }
  }

  function placeTooltip(anchor) {
    if (!tooltip || !anchor) return;
    var boardRect = board.getBoundingClientRect();
    var rect = anchor.getBoundingClientRect();
    var top = rect.bottom - boardRect.top + 10;
    var left = rect.left - boardRect.left + rect.width / 2;

    tooltip.hidden = false;
    tooltip.style.top = top + "px";
    tooltip.style.left = left + "px";

    var tipWidth = tooltip.offsetWidth;
    var boardWidth = board.clientWidth;
    var minLeft = tipWidth / 2 + 8;
    var maxLeft = boardWidth - tipWidth / 2 - 8;
    if (left < minLeft) left = minLeft;
    if (left > maxLeft) left = maxLeft;
    tooltip.style.left = left + "px";
  }

  function showTooltip(key, anchor) {
    var attr = ATTRS[key];
    if (!attr || !tooltip) return;
    selected = key;
    tooltipTitle.textContent = attr.name;
    tooltipBlurb.textContent = attr.blurb;
    if (tooltipNote) tooltipNote.textContent = "* " + attr.note + " *";
    placeTooltip(anchor);
  }

  function hideTooltip() {
    selected = "";
    if (tooltip) tooltip.hidden = true;
  }

  function render() {
    if (majorLeft) majorLeft.textContent = String(poolLeft("major"));
    if (minorLeft) minorLeft.textContent = String(poolLeft("minor"));

    buttons.forEach(function (button) {
      var key = button.getAttribute("data-attr");
      var valueNode = button.querySelector("[data-attr-value]");
      if (valueNode) valueNode.textContent = String(spent[key]);
      button.classList.toggle("is-selected", key === selected);
      button.classList.toggle("is-filled", spent[key] > 0);
      button.classList.toggle("is-blocked", poolLeft(ATTRS[key].pool) <= 0);
    });

    if (!status.classList.contains("is-hot")) updateIdleStatus();
  }

  function spend(key, anchor) {
    var attr = ATTRS[key];
    if (!attr) return;
    showTooltip(key, anchor);
    if (poolLeft(attr.pool) <= 0) {
      flashStatus("No " + attr.pool + " points left.");
      render();
      return;
    }
    spent[key] += 1;
    flashStatus(attr.name + " +1");
    render();
    placeTooltip(anchor);
  }

  function reset() {
    Object.keys(spent).forEach(function (key) { spent[key] = 0; });
    hideTooltip();
    flashStatus("Points refreshed.");
    render();
  }

  board.addEventListener("click", function (event) {
    if (event.target.closest("[data-attr-reset]")) {
      reset();
      return;
    }
    var tile = event.target.closest("[data-attr]");
    if (tile && board.contains(tile)) {
      spend(tile.getAttribute("data-attr"), tile);
      return;
    }
    hideTooltip();
    render();
  });

  board.addEventListener("keydown", function (event) {
    var tile = event.target.closest("[data-attr]");
    if (!tile || !board.contains(tile)) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      spend(tile.getAttribute("data-attr"), tile);
    } else if (event.key === "Escape") {
      hideTooltip();
      render();
    }
  });

  document.addEventListener("click", function (event) {
    if (!board.contains(event.target)) {
      hideTooltip();
      render();
    }
  });

  window.addEventListener("resize", function () {
    if (selected) {
      var active = board.querySelector('[data-attr="' + selected + '"]');
      if (active) placeTooltip(active);
    }
  });

  render();
})();
