let basePresets = {};
let userPresets = {};
let components = [];
let clicks = [0, 0, 0, 0];
let currentPreset = null;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("preset-select").addEventListener("change", onPresetChange);
  document.getElementById("custom-components").innerHTML = '';
  loadPresets();
});

function showTab(tab) {
  document.getElementById("tab-alloy").style.display = tab === "alloy" ? "block" : "none";
  document.getElementById("tab-ore").style.display = tab === "ore" ? "block" : "none";

  document.getElementById("tab-btn-alloy").classList.toggle("active", tab === "alloy");
  document.getElementById("tab-btn-ore").classList.toggle("active", tab === "ore");
}

function loadPresets() {
  fetch("/get_presets")
    .then(res => res.json())
    .then(data => {
      basePresets = data.all;
      userPresets = data.user;
      updatePresetSelect(basePresets);
    });
}

function updatePresetSelect(presets) {
  const select = document.getElementById("preset-select");
  select.innerHTML = "";

  for (let name in presets) {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  }

  onPresetChange();
}

function onPresetChange() {
  const name = document.getElementById("preset-select").value;
  currentPreset = basePresets[name];
  components = currentPreset.components;
  clicks = [0, 0, 0, 0];
  renderComponents();
  calculate();

  // Показываем или скрываем кнопку удаления

  const deleteBtn = document.getElementById("delete-btn");
  deleteBtn.style.display = userPresets.hasOwnProperty(name) ? "inline-block" : "none";
}


function renderComponents() {
  const container = document.getElementById("components-container");
  container.innerHTML = "";

  components.forEach((c, i) => {
    const [name] = c;
    const div = document.createElement("div");
    div.className = "component";
    div.innerHTML = `
      <b>${name}</b>
      <button onclick="change(${i}, -1)">–</button>
      <span id="count-${i}">0</span> сл.
      <button onclick="change(${i}, 1)">+</button>
      <span id="result-${i}"></span>
    `;
    container.appendChild(div);
  });
}

function change(i, delta) {
  clicks[i] = Math.max(0, clicks[i] + delta);
  document.getElementById(`count-${i}`).textContent = clicks[i];
  calculate();
}

function calculate() {
  fetch("/calculate", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clicks, preset: currentPreset })
  })
    .then(res => res.json())
    .then(data => {
      data.result.forEach((r, i) => {
        const el = document.getElementById(`result-${i}`);
        el.textContent = `→ ${r.percent.toFixed(1)}% / ${r.mb.toFixed(0)} mB`;
        el.className = r.valid ? 'valid' : 'invalid';
      });

      document.getElementById("result").innerHTML =
        `<b>Итого:</b> ${data.total_mb.toFixed(0)} mB = ${data.total_slitki.toFixed(0)} слитков`;
    });
}

function resetAll() {
  clicks = [0, 0, 0, 0];
  renderComponents();
  calculate();
}

function addCustomComponent() {
  const div = document.createElement("div");
  div.className = "component";
  div.innerHTML = `
    <input placeholder="Название">
    <input type="number" placeholder="Мин %" style="width: 60px;">
    <input type="number" placeholder="Макс %" style="width: 60px;">
  `;
  document.getElementById("custom-components").appendChild(div);
}

function saveRecipe() {
  const name = document.getElementById("new-name").value.trim();
  const rows = document.querySelectorAll("#custom-components .component");
  const components = [];

  rows.forEach(row => {
    const inputs = row.querySelectorAll("input");
    const title = inputs[0].value.trim();
    const min = parseFloat(inputs[1].value);
    const max = parseFloat(inputs[2].value);
    if (title && !isNaN(min) && !isNaN(max)) {
      components.push([title, min, max]);
    }
  });

  if (!name || components.length < 1 || components.length > 4) {
    alert("Укажите название и от 1 до 4 компонентов.");
    return;
  }

  fetch("/save_recipe", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, components })
  }).then(() => loadPresets());
}

function deleteCurrentRecipe() {
  const name = document.getElementById("preset-select").value;

  if (!confirm(`Удалить рецепт "${name}"?`)) return;

  fetch("/delete_recipe", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  }).then(() => loadPresets());
}

function calculateOre() {
  const poor = parseInt(document.getElementById("ore-poor").value || 0);
  const normal = parseInt(document.getElementById("ore-normal").value || 0);
  const rich = parseInt(document.getElementById("ore-rich").value || 0);

  const total_poor = (poor * 24) / 144;
  const total_normal = (normal * 36) / 144;
  const total_rich = (rich * 48) / 144;
  const sum_ignots = total_poor + total_normal + total_rich;

  document.getElementById("ore-result").innerHTML = `
    <b>Бедных слитков:</b> ${total_poor.toFixed(1)}<br>
    <b>Нормальных слитков:</b> ${total_normal.toFixed(1)}<br>
    <b>Богатых слитков:</b> ${total_rich.toFixed(1)}<br>
    <b>Итого:</b> ${sum_ignots.toFixed(1)} слитков
  `;
}

const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  themeToggle.checked = theme === "dark";
  themeIcon.textContent = theme === "dark" ? "🌙" : "☀️";
  localStorage.setItem("theme", theme);
}

themeToggle.addEventListener("change", () => {
  const newTheme = themeToggle.checked ? "dark" : "light";
  applyTheme(newTheme);
});

document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("theme") || "light";
  applyTheme(saved);
});