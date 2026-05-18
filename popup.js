// popup.js - manages the overrides list display

function renderOverrides(overrides) {
  const list = document.getElementById("overrideList");

  if (!overrides || Object.keys(overrides).length === 0) {
    list.innerHTML = `<div class="empty-state">No overrides yet.<br>Click any time tag in WhatsApp to override.</div>`;
    return;
  }

  list.innerHTML = "";
  for (const [name, tz] of Object.entries(overrides)) {
    const item = document.createElement("div");
    item.className = "override-item";

    const nameEl = document.createElement("span");
    nameEl.className = "override-name";
    nameEl.textContent = name;
    nameEl.title = name;

    const tzEl = document.createElement("span");
    tzEl.className = "override-tz";
    tzEl.textContent = tz.replace("America/", "").replace("Europe/", "").replace("Asia/", "").replace("Pacific/", "").replace("Africa/", "").replace("Atlantic/", "").replace("Indian/", "").replace("Australia/", "");
    tzEl.title = tz;

    const delBtn = document.createElement("button");
    delBtn.className = "override-del";
    delBtn.textContent = "×";
    delBtn.title = "Remove override";
    delBtn.addEventListener("click", () => {
      chrome.storage.local.get("overrides", (result) => {
        const updated = result.overrides || {};
        delete updated[name];
        chrome.storage.local.set({ overrides: updated }, () => {
          renderOverrides(updated);
        });
      });
    });

    item.appendChild(nameEl);
    item.appendChild(tzEl);
    item.appendChild(delBtn);
    list.appendChild(item);
  }
}

// Load and render on open
chrome.storage.local.get("overrides", (result) => {
  renderOverrides(result.overrides || {});
});
