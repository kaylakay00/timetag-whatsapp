// WhatsApp Local Time - Content Script
const PROCESSED_ATTR = "data-watz-done";
const TAG_CLASS = "watz-time-tag";
const TAG_CLASS_UNKNOWN = "watz-time-tag-unknown";
let contactCache = {};

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

function makeOverrideHandler(tag, rowEl, contactKey, getCurrentTzLabel) {
  return (e) => {
    e.stopPropagation();
    e.preventDefault();
    const currentLabel = getCurrentTzLabel();
    const isUnknown = currentLabel === "unknown";
    const input = prompt(
      `Set timezone for "${contactKey}"\n` +
      (isUnknown
        ? `💡 Tip: Open this contact\'s chat and tap their name to view Contact Info — the timezone will be detected automatically.\n` +
          `💡 Have many contacts? You can bulk-import via the extension popup (upload .vcf from your phone).\n\n`
        : `Current: ${currentLabel}\n\n`) +
      `Or enter a city manually (e.g. "London", "Tokyo", "Dubai", "New York"):\n\nLeave blank to clear.`
    );
    if (input === null) return;
    if (input.trim() === "") {
      loadOverrides().then((overrides) => {
        delete overrides[contactKey];
        chrome.storage.local.set({ overrides });
        delete contactCache[contactKey];
        rowEl.removeAttribute(PROCESSED_ATTR);
        tag.remove();
        // Re-add unknown tag if still no data
        addUnknownTag(rowEl, contactKey);
      });
    } else {
      const resolved = resolveTimezone(input.trim());
      if (!resolved) {
        alert(`Couldn't find timezone for "${input}".\nTry a city name like "London", "Tokyo", "Dubai", "Sao Paulo".`);
        return;
      }
      saveOverride(contactKey, resolved);
      const existingFlag = contactCache[contactKey]?.flag || "";
      contactCache[contactKey] = { timezone: resolved, flag: existingFlag };
      // Remove unknown tag if present, trigger re-process
      tag.remove();
      rowEl.removeAttribute(PROCESSED_ATTR);
      processAllRows();
    }
  };
}

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
  tag.setAttribute("title", `${tzLabel} · click to set timezone`);
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

async function processRow(rowEl, overrides) {
  const contactKey = getContactKey(rowEl);
  if (!contactKey) return;

  // Skip system/app rows (WhatsApp, Instagram, etc.)
  const isSystemContact = ["WhatsApp", "Instagram", "Telegram"].includes(contactKey);
  if (isSystemContact) return;

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

// Get the name shown in the contact info panel (right side drawer)
function getContactInfoPanelName() {
  // Most reliable: the contact name subtitle in the panel (data-testid="contact-info-subtitle selectable-text")
  const subtitleName = document.querySelector('[data-testid="contact-info-subtitle selectable-text"]');
  if (subtitleName) {
    const t = subtitleName.textContent.trim();
    if (t.length > 0 && !t.startsWith("+")) return t;
  }
  // Fallback: conversation header title (when chat is open)
  const header = document.querySelector('[data-testid="conversation-info-header-chat-title"]');
  return header ? header.textContent.trim() : null;
}

// Scan ANY visible phone number on the page and try to associate it with a contact name
function scanForPhoneNumbers() {
  const SYSTEM = ["WhatsApp", "Instagram", "Telegram"];

  // Strategy 1: contact info panel is open — read name + phone directly by data-testid
  const panelName = getContactInfoPanelName();
  if (panelName && !SYSTEM.includes(panelName)) {
    // Phone in panel has data-testid="selectable-text" and starts with "+"
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

  // Strategy 2: scan chat list rows that show phone numbers directly (unsaved contacts)
  const rows = document.querySelectorAll(
    '[data-testid="cell-frame-container"], [role="listitem"]'
  );
  for (const row of rows) {
    const titleEl = row.querySelector('[data-testid="cell-frame-title"] span[dir="auto"]');
    if (!titleEl) continue;
    const name = titleEl.textContent.trim();
    if (!name.startsWith("+")) continue; // only unsaved contacts show phone as name
    const result = getTimezoneFromPhone(name);
    if (result && !contactCache[name]?.timezone) {
      contactCache[name] = { timezone: result.timezone, flag: result.flag };
    }
  }
}

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
    }, 200);
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });

  // Polling fallback every 3s — catches virtual list node-reuse on scroll
  setInterval(() => {
    processAllRows();
    scanForPhoneNumbers();
  }, 3000);
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
