# TimeTag for WhatsApp(Web) ⏱

See your contacts' local time directly inside WhatsApp Web.

![TimeTag for WhatsApp demo](demo.png)

## What it does

- Automatically detects each contact's likely timezone using available contact metadata
- Shows a small time tag next to every contact name in the sidebar: `Abby · 3:42 PM · 🇺🇸`
- Updates automatically every minute
- Works with both saved contacts and unsaved numbers
- Click any time tag to manually override a contact's timezone

## Installation (Developer Mode)

1. Download or clone this repo
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select the `whatsapp-timezone` folder
6. Open [WhatsApp Web](https://web.whatsapp.com) — time tags will appear automatically
7. If a time tag doesn't appear for a contact at first, open that contact's info page once to trigger timezone detection

## How it works

### Timezone detection

TimeTag estimates a contact's timezone using available contact metadata, such as phone number and location information when available.

For countries with multiple timezones (US, Australia, Russia, etc.), a default timezone may be used unless more specific information is available. 

### Manual override

You can always manually override the detected timezone by clicking the time tag and entering a city or country. Useful for:

- Contacts using a foreign SIM card
- People who've relocated but kept their old number
- Countries spanning multiple timezones

Overrides are stored locally in Chrome storage and persist across sessions. Manage them from the extension popup.

### Data & privacy

- **No data leaves your browser.** Everything runs locally.
- No account required, no server, no tracking.
- Contact data is only read from the WhatsApp Web DOM and never transmitted externally.

## Limitations

- Timezone detection is heuristic-based and may be inaccurate when a contact is currently in a different country from their phone number
- Location metadata may not always be available
- For countries spanning multiple timezones, a default timezone may be used unless manually overridden
- WhatsApp Web's DOM structure may change — if tags stop appearing after a WhatsApp update, open an issue

## Tech Stack

- Chrome Extension (Manifest V3)
- Vanilla JavaScript
- Content Scripts
- chrome.storage.local

## Roadmap

- [ ] Improve timezone detection accuracy for multi-timezone countries
- [ ] Better manual timezone search and autocomplete
- [ ] Show timezone details on hover
- [ ] Bulk import contacts with timezones from CSV
- [ ] Firefox support

## Contributing

PRs and suggestions welcome. 

## License

MIT
