/* Kingdom NPC library: list on Peoples, sheet on person.html. */
(function () {
  var listRoot = document.querySelector("[data-people-list]");
  var sheetRoot = document.querySelector("[data-person-sheet]");
  if (!listRoot && !sheetRoot) return;

  fetch("data/people.json?v=peoples4")
    .then(function (response) {
      if (!response.ok) throw new Error("missing");
      return response.json();
    })
    .then(function (people) {
      if (listRoot) renderList(people);
      if (sheetRoot) renderSheet(people);
    })
    .catch(function () {
      var target = listRoot || sheetRoot;
      target.textContent = "The people library did not load.";
    });

  function renderList(people) {
    listRoot.innerHTML = "";
    people.forEach(function (person) {
      var link = document.createElement("a");
      link.className = "people-card";
      link.href = "person.html?id=" + encodeURIComponent(person.id);
      link.setAttribute("role", "button");

      var name = document.createElement("span");
      name.className = "people-card__name";
      name.textContent = person.name;

      var role = document.createElement("span");
      role.className = "people-card__role";
      role.textContent = (person.roles || []).join(" · ");

      link.appendChild(name);
      if (person.roles && person.roles.length) link.appendChild(role);
      listRoot.appendChild(link);
    });
  }

  function renderSheet(people) {
    var params = new URLSearchParams(window.location.search);
    var id = params.get("id");
    var name = params.get("name");
    var person = null;
    for (var i = 0; i < people.length; i++) {
      if (id && people[i].id === id) {
        person = people[i];
        break;
      }
      if (!id && name && people[i].name === name) {
        person = people[i];
        break;
      }
    }
    if (!person) {
      sheetRoot.textContent = "That person is not in the library.";
      return;
    }

    document.title = person.name + " — Crown's Call";
    var html = "";
    html += '<div><p class="eyebrow kicker">NPC</p><h1>' + escapeHtml(person.name) + "</h1>";
    if (person.roles && person.roles.length) {
      html += "<p>" + person.roles.map(escapeHtml).join(" · ") + "</p>";
    }
    if (person.description) {
      html += "<p>" + escapeHtml(person.description) + "</p>";
    } else {
      html += "<p>This person has no listed details in the current build.</p>";
    }
    html += '<p><a href="peoples.html#npcs">Back to Peoples</a></p></div>';
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
