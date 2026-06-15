// Convert ISO country code to flag emoji (e.g. "SG" → 🇸🇬)
// Regional indicator letters start at U+1F1E6 (= 'A'), so offset = 0x1F1E6 - 65
function countryCodeToFlag(iso2) {
  return iso2.toUpperCase().split('').map(c =>
    String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)
  ).join('');
}

// Phone country code → { timezone, flag }
const PHONE_TZ_MAP = {
  "1":   { tz: "America/New_York",                   iso: "US" },
  "7":   { tz: "Europe/Moscow",                      iso: "RU" },
  "20":  { tz: "Africa/Cairo",                       iso: "EG" },
  "27":  { tz: "Africa/Johannesburg",                iso: "ZA" },
  "30":  { tz: "Europe/Athens",                      iso: "GR" },
  "31":  { tz: "Europe/Amsterdam",                   iso: "NL" },
  "32":  { tz: "Europe/Brussels",                    iso: "BE" },
  "33":  { tz: "Europe/Paris",                       iso: "FR" },
  "34":  { tz: "Europe/Madrid",                      iso: "ES" },
  "36":  { tz: "Europe/Budapest",                    iso: "HU" },
  "39":  { tz: "Europe/Rome",                        iso: "IT" },
  "40":  { tz: "Europe/Bucharest",                   iso: "RO" },
  "41":  { tz: "Europe/Zurich",                      iso: "CH" },
  "43":  { tz: "Europe/Vienna",                      iso: "AT" },
  "44":  { tz: "Europe/London",                      iso: "GB" },
  "45":  { tz: "Europe/Copenhagen",                  iso: "DK" },
  "46":  { tz: "Europe/Stockholm",                   iso: "SE" },
  "47":  { tz: "Europe/Oslo",                        iso: "NO" },
  "48":  { tz: "Europe/Warsaw",                      iso: "PL" },
  "49":  { tz: "Europe/Berlin",                      iso: "DE" },
  "51":  { tz: "America/Lima",                       iso: "PE" },
  "52":  { tz: "America/Mexico_City",                iso: "MX" },
  "53":  { tz: "America/Havana",                     iso: "CU" },
  "54":  { tz: "America/Argentina/Buenos_Aires",     iso: "AR" },
  "55":  { tz: "America/Sao_Paulo",                  iso: "BR" },
  "56":  { tz: "America/Santiago",                   iso: "CL" },
  "57":  { tz: "America/Bogota",                     iso: "CO" },
  "58":  { tz: "America/Caracas",                    iso: "VE" },
  "60":  { tz: "Asia/Kuala_Lumpur",                  iso: "MY" },
  "61":  { tz: "Australia/Sydney",                   iso: "AU" },
  "62":  { tz: "Asia/Jakarta",                       iso: "ID" },
  "63":  { tz: "Asia/Manila",                        iso: "PH" },
  "64":  { tz: "Pacific/Auckland",                   iso: "NZ" },
  "65":  { tz: "Asia/Singapore",                     iso: "SG" },
  "66":  { tz: "Asia/Bangkok",                       iso: "TH" },
  "81":  { tz: "Asia/Tokyo",                         iso: "JP" },
  "82":  { tz: "Asia/Seoul",                         iso: "KR" },
  "84":  { tz: "Asia/Ho_Chi_Minh",                   iso: "VN" },
  "86":  { tz: "Asia/Shanghai",                      iso: "CN" },
  "90":  { tz: "Europe/Istanbul",                    iso: "TR" },
  "91":  { tz: "Asia/Kolkata",                       iso: "IN" },
  "92":  { tz: "Asia/Karachi",                       iso: "PK" },
  "93":  { tz: "Asia/Kabul",                         iso: "AF" },
  "94":  { tz: "Asia/Colombo",                       iso: "LK" },
  "95":  { tz: "Asia/Rangoon",                       iso: "MM" },
  "98":  { tz: "Asia/Tehran",                        iso: "IR" },
  "212": { tz: "Africa/Casablanca",                  iso: "MA" },
  "213": { tz: "Africa/Algiers",                     iso: "DZ" },
  "216": { tz: "Africa/Tunis",                       iso: "TN" },
  "218": { tz: "Africa/Tripoli",                     iso: "LY" },
  "220": { tz: "Africa/Banjul",                      iso: "GM" },
  "221": { tz: "Africa/Dakar",                       iso: "SN" },
  "234": { tz: "Africa/Lagos",                       iso: "NG" },
  "254": { tz: "Africa/Nairobi",                     iso: "KE" },
  "255": { tz: "Africa/Dar_es_Salaam",               iso: "TZ" },
  "256": { tz: "Africa/Kampala",                     iso: "UG" },
  "260": { tz: "Africa/Lusaka",                      iso: "ZM" },
  "263": { tz: "Africa/Harare",                      iso: "ZW" },
  "351": { tz: "Europe/Lisbon",                      iso: "PT" },
  "352": { tz: "Europe/Luxembourg",                  iso: "LU" },
  "353": { tz: "Europe/Dublin",                      iso: "IE" },
  "354": { tz: "Atlantic/Reykjavik",                 iso: "IS" },
  "355": { tz: "Europe/Tirane",                      iso: "AL" },
  "356": { tz: "Europe/Malta",                       iso: "MT" },
  "357": { tz: "Asia/Nicosia",                       iso: "CY" },
  "358": { tz: "Europe/Helsinki",                    iso: "FI" },
  "359": { tz: "Europe/Sofia",                       iso: "BG" },
  "370": { tz: "Europe/Vilnius",                     iso: "LT" },
  "371": { tz: "Europe/Riga",                        iso: "LV" },
  "372": { tz: "Europe/Tallinn",                     iso: "EE" },
  "380": { tz: "Europe/Kiev",                        iso: "UA" },
  "381": { tz: "Europe/Belgrade",                    iso: "RS" },
  "385": { tz: "Europe/Zagreb",                      iso: "HR" },
  "386": { tz: "Europe/Ljubljana",                   iso: "SI" },
  "420": { tz: "Europe/Prague",                      iso: "CZ" },
  "421": { tz: "Europe/Bratislava",                  iso: "SK" },
  "852": { tz: "Asia/Hong_Kong",                     iso: "HK" },
  "853": { tz: "Asia/Macau",                         iso: "MO" },
  "855": { tz: "Asia/Phnom_Penh",                    iso: "KH" },
  "856": { tz: "Asia/Vientiane",                     iso: "LA" },
  "880": { tz: "Asia/Dhaka",                         iso: "BD" },
  "886": { tz: "Asia/Taipei",                        iso: "TW" },
  "960": { tz: "Indian/Maldives",                    iso: "MV" },
  "961": { tz: "Asia/Beirut",                        iso: "LB" },
  "962": { tz: "Asia/Amman",                         iso: "JO" },
  "963": { tz: "Asia/Damascus",                      iso: "SY" },
  "964": { tz: "Asia/Baghdad",                       iso: "IQ" },
  "965": { tz: "Asia/Kuwait",                        iso: "KW" },
  "966": { tz: "Asia/Riyadh",                        iso: "SA" },
  "967": { tz: "Asia/Aden",                          iso: "YE" },
  "968": { tz: "Asia/Muscat",                        iso: "OM" },
  "971": { tz: "Asia/Dubai",                         iso: "AE" },
  "972": { tz: "Asia/Jerusalem",                     iso: "IL" },
  "973": { tz: "Asia/Bahrain",                       iso: "BH" },
  "974": { tz: "Asia/Qatar",                         iso: "QA" },
  "975": { tz: "Asia/Thimphu",                       iso: "BT" },
  "976": { tz: "Asia/Ulaanbaatar",                   iso: "MN" },
  "977": { tz: "Asia/Kathmandu",                     iso: "NP" },
};

/**
 * Extract country code from a phone number string
 * Returns { timezone, flag } or null
 */
function getTimezoneFromPhone(phoneNumber) {
  if (!phoneNumber) return null;

  const cleaned = phoneNumber.replace(/[\s\-().]/g, "");
  if (!cleaned.startsWith("+")) return null;

  const digits = cleaned.slice(1);

  for (const len of [3, 2, 1]) {
    const code = digits.slice(0, len);
    if (PHONE_TZ_MAP[code]) {
      const { tz, iso } = PHONE_TZ_MAP[code];
      return { timezone: tz, flag: countryCodeToFlag(iso) };
    }
  }

  return null;
}

/**
 * Format current local time in a given timezone
 * Returns something like "3:42 PM"
 */
function getLocalTime(timezone) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date());
  } catch (e) {
    return null;
  }
}

/**
 * Get short timezone label, e.g. "SGT", "GMT+8"
 */
function getTimezoneLabel(timezone) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "short",
    }).formatToParts(new Date());
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    return tzPart ? tzPart.value : "";
  } catch (e) {
    return "";
  }
}

/**
 * Get GMT offset string, e.g. "+8:00", "-5:00"
 */
function getGMTOffset(timezone) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "longOffset",
    }).formatToParts(new Date());
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    return tzPart ? tzPart.value.replace("GMT", "") : "";
  } catch (e) {
    return "";
  }
}

/**
 * Check if a timezone is currently observing DST
 */
function isDST(timezone) {
  try {
    const now = new Date();
    const jan = new Date(now.getFullYear(), 0, 1);
    const offsetNow = now.toLocaleString("en-US", { timeZone: timezone, timeZoneName: "short" });
    const offsetJan = jan.toLocaleString("en-US", { timeZone: timezone, timeZoneName: "short" });
    // Compare offsets: if different, DST is active (rough heuristic)
    const extract = (s) => s.match(/GMT[+\-\d:]+/)?.[0] || "";
    return extract(offsetNow) !== extract(offsetJan);
  } catch (e) {
    return false;
  }
}
