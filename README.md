# WhatsApp Local Time ⏱

A Chrome extension that shows your contacts' local time directly in WhatsApp Web — no manual timezone bookkeeping needed.

![WhatsApp Local Time demo](demo.png)

## What it does

- Automatically detects each contact's timezone from their phone country code (`+44` → London, `+81` → Tokyo, etc.)
- Shows a small time tag next to every contact name in the sidebar: `张三 · 3:42 PM`
- Updates every minute
- Works with saved contacts and unsaved numbers
- Click any time tag to manually override a contact's timezone (for people who use foreign SIM cards, or live in a different country than their number)

## Installation (Developer Mode)

1. Download or clone this repo
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked**
5. Select the `whatsapp-timezone` folder
6. Open [WhatsApp Web](https://web.whatsapp.com) — time tags will appear automatically

## How it works

### Timezone detection

Phone number country code → timezone mapping. Covers 80+ countries.

For countries with multiple timezones (US, Australia, Russia, etc.), the most populous / capital timezone is used as the default. You can always override manually.

### Manual override

Click any time tag to set a custom timezone for that contact. Useful for:
- Contacts using a foreign SIM card
- People who've relocated but kept their old number
- Countries spanning multiple timezones (US, Australia, etc.)

Overrides are stored locally in Chrome storage and persist across sessions. Manage them from the extension popup.

### Data & privacy

- **No data leaves your browser.** Everything runs locally.
- No account required, no server, no tracking.
- Phone numbers are only read from the WhatsApp Web DOM, never stored or transmitted.

## Limitations

- Requires international format numbers (`+country code...`). Contacts saved without `+` prefix won't be detected automatically — use manual override.
- For countries spanning multiple timezones (US, AU, RU, BR), defaults to the capital/most-populous timezone. Override as needed.
- WhatsApp Web's DOM structure may change — if tags stop appearing after a WhatsApp update, open an issue.

## Roadmap

- [ ] Auto-detect timezone from contact's "last seen" activity pattern
- [ ] Support Telegram Web
- [ ] Show timezone name on hover
- [ ] Bulk import contacts with timezones from CSV

## Contributing

PRs welcome. The core mapping is in `phone-tz.js` — easy to add missing country codes.

## License

MIT
