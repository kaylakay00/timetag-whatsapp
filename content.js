// WhatsApp Local Time - Content Script
const PROCESSED_ATTR = "data-watz-done";
const TAG_CLASS = "watz-time-tag";
const TAG_CLASS_UNKNOWN = "watz-time-tag-unknown";
let contactCache = {};

// ============================================================
// STORAGE
// ============================================================

async function loadOverrides() {
  return new Promise((resolve) => {
    chrome.storage.local.get("overrides", (result) => {
      resolve(result.overrides || {});
    });
  });
}

async function saveOverride(contactKey, timezone) {
  const overrides = await loadOverrides();
  overrides[contactKey] = timezone;
  chrome.storage.local.set({ overrides });
}

// ============================================================
// CONTACT DETECTION
// ============================================================

function getContactKey(element) {
  const nameEl =
    element.querySelector('[data-testid="cell-frame-title"] span[dir="auto"]') ||
    element.querySelector('span[dir="auto"][title]') ||
    element.querySelector('span[dir="auto"]');
  return nameEl ? nameEl.textContent.trim() : null;
}

function formatLabel(timeStr, flag) {
  return flag ? `${timeStr} ${flag}` : timeStr;
}

// ============================================================
// TIMEZONE PICKER MODAL
// ============================================================

function buildCityList() {
  // Build a searchable list from CITY_TZ (defined in city-tz.js)
  const seen = new Set();
  const entries = [];
  for (const [city, tz] of Object.entries(CITY_TZ)) {
    const key = tz;
    if (seen.has(key)) continue;
    seen.add(key);
    // Make a display-friendly label
    const display = city.charAt(0).toUpperCase() + city.slice(1);
    entries.push({ city: display, tz, searchText: `${display} ${tz}`.toLowerCase() });
  }
  // Also add country names and regions for broader search
  const extras = [
    { city: "United Kingdom", tz: "Europe/London", searchText: "united kingdom uk britain england europe/london" },
    { city: "France", tz: "Europe/Paris", searchText: "france europe/paris" },
    { city: "Germany", tz: "Europe/Berlin", searchText: "germany deutschland europe/berlin" },
    { city: "Italy", tz: "Europe/Rome", searchText: "italy italia europe/rome" },
    { city: "Spain", tz: "Europe/Madrid", searchText: "spain espana europe/madrid" },
    { city: "Netherlands", tz: "Europe/Amsterdam", searchText: "netherlands holland europe/amsterdam" },
    { city: "Sweden", tz: "Europe/Stockholm", searchText: "sweden europe/stockholm" },
    { city: "Norway", tz: "Europe/Oslo", searchText: "norway europe/oslo" },
    { city: "Denmark", tz: "Europe/Copenhagen", searchText: "denmark europe/copenhagen" },
    { city: "Finland", tz: "Europe/Helsinki", searchText: "finland europe/helsinki" },
    { city: "Poland", tz: "Europe/Warsaw", searchText: "poland europe/warsaw" },
    { city: "Switzerland", tz: "Europe/Zurich", searchText: "switzerland schweiz europe/zurich" },
    { city: "Belgium", tz: "Europe/Brussels", searchText: "belgium europe/brussels" },
    { city: "Portugal", tz: "Europe/Lisbon", searchText: "portugal europe/lisbon" },
    { city: "Greece", tz: "Europe/Athens", searchText: "greece europe/athens" },
    { city: "Turkey", tz: "Europe/Istanbul", searchText: "turkey türkiye europe/istanbul" },
    { city: "China", tz: "Asia/Shanghai", searchText: "china asia/shanghai asia/beijing" },
    { city: "Japan", tz: "Asia/Tokyo", searchText: "japan asia/tokyo" },
    { city: "South Korea", tz: "Asia/Seoul", searchText: "south korea korea asia/seoul" },
    { city: "India", tz: "Asia/Kolkata", searchText: "india asia/kolkata asia/calcutta" },
    { city: "Singapore", tz: "Asia/Singapore", searchText: "singapore asia/singapore" },
    { city: "Thailand", tz: "Asia/Bangkok", searchText: "thailand asia/bangkok" },
    { city: "Vietnam", tz: "Asia/Ho_Chi_Minh", searchText: "vietnam asia/ho_chi_minh asia/saigon" },
    { city: "Indonesia", tz: "Asia/Jakarta", searchText: "indonesia asia/jakarta" },
    { city: "Malaysia", tz: "Asia/Kuala_Lumpur", searchText: "malaysia asia/kuala_lumpur" },
    { city: "Philippines", tz: "Asia/Manila", searchText: "philippines asia/manila" },
    { city: "Pakistan", tz: "Asia/Karachi", searchText: "pakistan asia/karachi" },
    { city: "Bangladesh", tz: "Asia/Dhaka", searchText: "bangladesh asia/dhaka" },
    { city: "UAE", tz: "Asia/Dubai", searchText: "uae dubai emirates asia/dubai" },
    { city: "Saudi Arabia", tz: "Asia/Riyadh", searchText: "saudi arabia asia/riyadh" },
    { city: "Israel", tz: "Asia/Jerusalem", searchText: "israel asia/jerusalem" },
    { city: "Egypt", tz: "Africa/Cairo", searchText: "egypt africa/cairo" },
    { city: "Nigeria", tz: "Africa/Lagos", searchText: "nigeria africa/lagos" },
    { city: "Kenya", tz: "Africa/Nairobi", searchText: "kenya africa/nairobi" },
    { city: "South Africa", tz: "Africa/Johannesburg", searchText: "south africa africa/johannesburg" },
    { city: "Canada", tz: "America/Toronto", searchText: "canada america/toronto" },
    { city: "Mexico", tz: "America/Mexico_City", searchText: "mexico america/mexico_city" },
    { city: "Brazil", tz: "America/Sao_Paulo", searchText: "brazil brasil america/sao_paulo" },
    { city: "Argentina", tz: "America/Argentina/Buenos_Aires", searchText: "argentina america/argentina/buenos_aires" },
    { city: "Colombia", tz: "America/Bogota", searchText: "colombia america/bogota" },
    { city: "Chile", tz: "America/Santiago", searchText: "chile america/santiago" },
    { city: "Australia", tz: "Australia/Sydney", searchText: "australia australia/sydney" },
    { city: "New Zealand", tz: "Pacific/Auckland", searchText: "new zealand pacific/auckland" },
  ];
  for (const e of extras) {
    if (!seen.has(e.tz)) {
      seen.add(e.tz);
      entries.push(e);
    }
  }
  // Sort alphabetically by city name
  entries.sort((a, b) => a.city.localeCompare(b.city));
  return entries;
}

let CITY_ENTRIES = null;

function getCityEntries() {
  if (!CITY_ENTRIES) CITY_ENTRIES = buildCityList();
  return CITY_ENTRIES;
}

function searchCities(query) {
  const q = query.toLowerCase().trim();
  if (!q) return getCityEntries().slice(0, 15); // show first 15 by default
  const results = [];
  for (const entry of getCityEntries()) {
    if (entry.searchText.includes(q)) {
      results.push(entry);
      if (results.length >= 15) break;
    }
  }
  return results;
}

function showTimezonePicker(tag, rowEl, contactKey, currentTzLabel) {
  // Remove any existing picker
  document.querySelector(".watz-picker-overlay")?.remove();

  const isUnknown = currentTzLabel === "unknown";
  const currentTimezone = tag ? tag.getAttribute("data-tz") : null;

  // Build overlay
  const overlay = document.createElement("div");
  overlay.className = "watz-picker-overlay";

  const modal = document.createElement("div");
  modal.className = "watz-picker-modal";

  // Header
  const header = document.createElement("div");
  header.className = "watz-picker-header";
  header.innerHTML = `
    <div class="watz-picker-title">Set timezone for <strong>${escapeHTML(contactKey)}</strong></div>
    ${!isUnknown ? `<div class="watz-picker-current">Current: ${escapeHTML(currentTzLabel)}</div>` : ""}
  `;

  // Search input
  const searchWrap = document.createElement("div");
  searchWrap.className = "watz-picker-search-wrap";
  const searchInput = document.createElement("input");
  searchInput.className = "watz-picker-search";
  searchInput.type = "text";
  searchInput.placeholder = "Search city or country...";
  searchInput.autocomplete = "off";
  searchWrap.appendChild(searchInput);

  // Results list
  const resultsList = document.createElement("div");
  resultsList.className = "watz-picker-results";

  // Footer actions
  const footer = document.createElement("div");
  footer.className = "watz-picker-footer";

  if (!isUnknown) {
    const clearBtn = document.createElement("button");
    clearBtn.className = "watz-picker-btn-clear";
    clearBtn.textContent = "Clear override";
    clearBtn.addEventListener("click", () => {
      overlay.remove();
      loadOverrides().then((overrides) => {
        delete overrides[contactKey];
        chrome.storage.local.set({ overrides });
        delete contactCache[contactKey];
        rowEl.removeAttribute(PROCESSED_ATTR);
        // Remove time tag
        const t = rowEl.querySelector(`.${TAG_CLASS}`);
        if (t) t.remove();
        addUnknownTag(rowEl, contactKey);
      });
    });
    footer.appendChild(clearBtn);
  }

  const closeBtn = document.createElement("button");
  closeBtn.className = "watz-picker-btn-close";
  closeBtn.textContent = "Cancel";
  closeBtn.addEventListener("click", () => overlay.remove());
  footer.appendChild(closeBtn);

  // Assemble
  modal.appendChild(header);
  modal.appendChild(searchWrap);
  modal.appendChild(resultsList);
  modal.appendChild(footer);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Focus search
  setTimeout(() => searchInput.focus(), 50);

  // Render results function
  let selectedIdx = -1;

  function renderResults(results) {
    resultsList.innerHTML = "";
    selectedIdx = -1;
    if (results.length === 0) {
      resultsList.innerHTML = `<div class="watz-picker-empty">No matches. Try a different search.</div>`;
      return;
    }
    results.forEach((entry, i) => {
      const item = document.createElement("div");
      item.className = "watz-picker-item";
      const tzShort = entry.tz.split("/").pop().replace(/_/g, " ");
      item.innerHTML = `
        <span class="watz-picker-item-city">${escapeHTML(entry.city)}</span>
        <span class="watz-picker-item-tz">${escapeHTML(tzShort)}</span>
      `;
      item.addEventListener("mousedown", (e) => {
        e.preventDefault();
        applyTimezone(entry.tz);
      });
      item.addEventListener("mouseenter", () => {
        resultsList.querySelectorAll(".watz-picker-item.active").forEach(el => el.classList.remove("active"));
        item.classList.add("active");
        selectedIdx = i;
      });
      resultsList.appendChild(item);
    });
  }

  function applyTimezone(timezone) {
    saveOverride(contactKey, timezone);
    const flag = contactCache[contactKey]?.flag || "";
    contactCache[contactKey] = { timezone, flag };
    // Remove unknown tag if present
    rowEl.querySelector(`.${TAG_CLASS_UNKNOWN}`)?.remove();
    rowEl.removeAttribute(PROCESSED_ATTR);
    overlay.remove();
    processAllRows();
  }

  // Initial render — show current timezone first if known
  let initialResults = searchCities("");
  if (!isUnknown && currentTimezone) {
    // Prepend the current timezone entry highlighted
    const currentEntry = getCityEntries().find(e => e.tz === currentTimezone);
    // Just show default list first
  }
  renderResults(initialResults);

  // Search input handler
  searchInput.addEventListener("input", () => {
    const results = searchCities(searchInput.value);
    renderResults(results);
  });

  // Keyboard navigation
  searchInput.addEventListener("keydown", (e) => {
    const items = resultsList.querySelectorAll(".watz-picker-item");
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (items.length === 0) return;
      selectedIdx = Math.min(selectedIdx + 1, items.length - 1);
      items.forEach(el => el.classList.remove("active"));
      items[selectedIdx].classList.add("active");
      items[selectedIdx].scrollIntoView({ block: "nearest" });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (items.length === 0) return;
      selectedIdx = Math.max(selectedIdx - 1, 0);
      items.forEach(el => el.classList.remove("active"));
      items[selectedIdx].classList.add("active");
      items[selectedIdx].scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIdx >= 0 && items[selectedIdx]) {
        items[selectedIdx].querySelector(".watz-picker-item-city");
        const entry = searchCities(searchInput.value)[selectedIdx];
        if (entry) applyTimezone(entry.tz);
      }
    } else if (e.key === "Escape") {
      overlay.remove();
    }
  });

  // Click overlay background to close
  overlay.addEventListener("mousedown", (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function makeOverrideHandler(tag, rowEl, contactKey, getCurrentTzLabel) {
  return (e) => {
    e.stopPropagation();
    e.preventDefault();
    const currentLabel = getCurrentTzLabel();
    showTimezonePicker(tag, rowEl, contactKey, currentLabel);
  };
}

// ============================================================
// TIME TAG RENDERING
// ============================================================

function upsertTimeTag(rowEl, timeStr, flag, tzLabel, timezone, contactKey) {
  // Remove unknown tag if present
  rowEl.querySelector(`.${TAG_CLASS_UNKNOWN}`)?.remove();

  let tag = rowEl.querySelector(`.${TAG_CLASS}`);
  if (!tag) {
    tag = document.createElement("span");
    tag.className = TAG_CLASS;

    const nameSpan =
      rowEl.querySelector('[data-testid="cell-frame-title"] span[dir="auto"]') ||
      rowEl.querySelector('span[dir="auto"][title]') ||
      rowEl.querySelector('span[dir="auto"]');

    if (nameSpan && nameSpan.parentElement) {
      nameSpan.parentElement.insertAdjacentElement("afterend", tag);
    } else {
      return;
    }

    tag.addEventListener("click", makeOverrideHandler(tag, rowEl, contactKey, () => tzLabel));
  }

  tag.textContent = formatLabel(timeStr, flag);
  tag.setAttribute("data-tz", timezone);
  tag.setAttribute("data-flag", flag || "");

  // Enhanced tooltip: show city name, IANA zone, and GMT offset
  const cityName = timezone.split("/").pop().replace(/_/g, " ");
  const gmtOffset = getGMTOffset(timezone);
  const dstNote = isDST(timezone) ? " (DST active)" : "";
  tag.setAttribute("title", `${cityName} · ${tzLabel} · GMT${gmtOffset}${dstNote}\nClick to change`);
}

// Add a placeholder tag for contacts whose timezone we don't know yet
function addUnknownTag(rowEl, contactKey) {
  if (rowEl.querySelector(`.${TAG_CLASS}`) || rowEl.querySelector(`.${TAG_CLASS_UNKNOWN}`)) return;

  const nameSpan =
    rowEl.querySelector('[data-testid="cell-frame-title"] span[dir="auto"]') ||
    rowEl.querySelector('span[dir="auto"][title]') ||
    rowEl.querySelector('span[dir="auto"]');

  if (!nameSpan || !nameSpan.parentElement) return;

  const tag = document.createElement("span");
  tag.className = `${TAG_CLASS} ${TAG_CLASS_UNKNOWN}`;
  tag.textContent = "🌐 ?";
  tag.setAttribute("title", "Timezone unknown · click to set");
  tag.style.opacity = "0.5";

  nameSpan.parentElement.insertAdjacentElement("afterend", tag);
  tag.addEventListener("click", makeOverrideHandler(tag, rowEl, contactKey, () => "unknown"));
}

// ============================================================
// Row Processing
// ============================================================

async function processRow(rowEl, overrides) {
  const contactKey = getContactKey(rowEl);
  if (!contactKey) return;

  // Skip system/app rows (WhatsApp, Instagram, etc.)
  const isSystemContact = ["WhatsApp", "Instagram", "Telegram"].includes(contactKey);
  if (isSystemContact) return;

  // Skip already-processed rows (optimization)
  if (rowEl.hasAttribute(PROCESSED_ATTR)) return;

  // Refresh existing known tag
  const existing = rowEl.querySelector(`.${TAG_CLASS}:not(.${TAG_CLASS_UNKNOWN})`);
  if (existing) {
    const tz = existing.getAttribute("data-tz");
    const flag = existing.getAttribute("data-flag") || "";
    if (tz) existing.textContent = formatLabel(getLocalTime(tz), flag);
    return;
  }

  let timezone = overrides[contactKey] || null;
  let flag = "";

  if (!timezone && contactCache[contactKey]?.timezone) {
    timezone = contactCache[contactKey].timezone;
    flag = contactCache[contactKey].flag || "";
  }

  // Try phone number visible in the row text
  if (!timezone) {
    const rowText = rowEl.innerText || "";
    const phoneMatch = rowText.match(/\+[\d\s\-().]{7,18}/);
    if (phoneMatch) {
      const result = getTimezoneFromPhone(phoneMatch[0]);
      if (result) { timezone = result.timezone; flag = result.flag; }
    }
  }

  if (timezone) {
    contactCache[contactKey] = { timezone, flag };
    const timeStr = getLocalTime(timezone);
    const tzLabel = getTimezoneLabel(timezone);
    if (timeStr) {
      upsertTimeTag(rowEl, timeStr, flag, tzLabel, timezone, contactKey);
      rowEl.setAttribute(PROCESSED_ATTR, "1");
    }
  } else {
    // No timezone found — show placeholder so user can set it manually
    addUnknownTag(rowEl, contactKey);
  }
}

async function processAllRows() {
  const overrides = await loadOverrides();
  const rows = document.querySelectorAll(
    '[data-testid="cell-frame-container"], [role="listitem"], div[tabindex="-1"][data-id]'
  );
  rows.forEach((row) => processRow(row, overrides));
}

// ============================================================
// Contact Info Panel Scanner
// ============================================================

function getContactInfoPanelName() {
  const subtitleName = document.querySelector('[data-testid="contact-info-subtitle selectable-text"]');
  if (subtitleName) {
    const t = subtitleName.textContent.trim();
    if (t.length > 0 && !t.startsWith("+")) return t;
  }
  const header = document.querySelector('[data-testid="conversation-info-header-chat-title"]');
  return header ? header.textContent.trim() : null;
}

function scanForPhoneNumbers() {
  const SYSTEM = ["WhatsApp", "Instagram", "Telegram"];

  // Strategy 1: contact info panel is open
  const panelName = getContactInfoPanelName();
  if (panelName && !SYSTEM.includes(panelName)) {
    const phoneEls = document.querySelectorAll('[data-testid="selectable-text"]');
    for (const el of phoneEls) {
      const text = el.textContent.trim();
      if (!text.startsWith("+") || text.length < 8 || text.length > 25) continue;
      const result = getTimezoneFromPhone(text);
      if (result && !contactCache[panelName]?.timezone) {
        contactCache[panelName] = { timezone: result.timezone, flag: result.flag };
        processAllRows();
      }
      break;
    }
  }

  // Strategy 2: unsaved contacts showing phone numbers in chat list
  const rows = document.querySelectorAll(
    '[data-testid="cell-frame-container"], [role="listitem"]'
  );
  for (const row of rows) {
    const titleEl = row.querySelector('[data-testid="cell-frame-title"] span[dir="auto"]');
    if (!titleEl) continue;
    const name = titleEl.textContent.trim();
    if (!name.startsWith("+")) continue;
    const result = getTimezoneFromPhone(name);
    if (result && !contactCache[name]?.timezone) {
      contactCache[name] = { timezone: result.timezone, flag: result.flag };
    }
  }
}

// ============================================================
// Clock & Observer
// ============================================================

function startClock() {
  setInterval(() => {
    document.querySelectorAll(`.${TAG_CLASS}:not(.${TAG_CLASS_UNKNOWN})`).forEach((tag) => {
      const tz = tag.getAttribute("data-tz");
      const flag = tag.getAttribute("data-flag") || "";
      if (tz) tag.textContent = formatLabel(getLocalTime(tz), flag);
    });
  }, 60 * 1000);
}

function startObserver() {
  let debounce;
  const observer = new MutationObserver(() => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      processAllRows();
      scanForPhoneNumbers();
    }, 500);
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
}

(async function init() {
  const waitForApp = setInterval(() => {
    if (document.querySelector('[data-testid="cell-frame-container"], [role="listitem"]')) {
      clearInterval(waitForApp);
      processAllRows();
      scanForPhoneNumbers();
      startClock();
      startObserver();
    }
  }, 1000);
})();
