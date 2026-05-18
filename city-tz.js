// city-tz.js — fuzzy city name → IANA timezone lookup
// User types "london", "tokyo", "dubai", "new york" etc.

const CITY_TZ = {
  // Europe
  "london": "Europe/London",
  "manchester": "Europe/London",
  "edinburgh": "Europe/London",
  "dublin": "Europe/Dublin",
  "paris": "Europe/Paris",
  "berlin": "Europe/Berlin",
  "munich": "Europe/Berlin",
  "frankfurt": "Europe/Berlin",
  "hamburg": "Europe/Berlin",
  "amsterdam": "Europe/Amsterdam",
  "brussels": "Europe/Brussels",
  "madrid": "Europe/Madrid",
  "barcelona": "Europe/Madrid",
  "rome": "Europe/Rome",
  "milan": "Europe/Rome",
  "naples": "Europe/Rome",
  "vienna": "Europe/Vienna",
  "zurich": "Europe/Zurich",
  "geneva": "Europe/Zurich",
  "lisbon": "Europe/Lisbon",
  "porto": "Europe/Lisbon",
  "stockholm": "Europe/Stockholm",
  "oslo": "Europe/Oslo",
  "copenhagen": "Europe/Copenhagen",
  "helsinki": "Europe/Helsinki",
  "warsaw": "Europe/Warsaw",
  "prague": "Europe/Prague",
  "budapest": "Europe/Budapest",
  "bucharest": "Europe/Bucharest",
  "sofia": "Europe/Sofia",
  "athens": "Europe/Athens",
  "istanbul": "Europe/Istanbul",
  "ankara": "Europe/Istanbul",
  "kyiv": "Europe/Kiev",
  "kiev": "Europe/Kiev",
  "moscow": "Europe/Moscow",
  "st petersburg": "Europe/Moscow",
  "saint petersburg": "Europe/Moscow",
  "belgrade": "Europe/Belgrade",
  "zagreb": "Europe/Zagreb",
  "riga": "Europe/Riga",
  "tallinn": "Europe/Tallinn",
  "vilnius": "Europe/Vilnius",
  "bratislava": "Europe/Bratislava",
  "reykjavik": "Atlantic/Reykjavik",
  "luxembourg": "Europe/Luxembourg",
  "valletta": "Europe/Malta",
  "nicosia": "Asia/Nicosia",

  // Asia
  "tokyo": "Asia/Tokyo",
  "osaka": "Asia/Tokyo",
  "kyoto": "Asia/Tokyo",
  "seoul": "Asia/Seoul",
  "busan": "Asia/Seoul",
  "beijing": "Asia/Shanghai",
  "shanghai": "Asia/Shanghai",
  "shenzhen": "Asia/Shanghai",
  "guangzhou": "Asia/Shanghai",
  "chengdu": "Asia/Shanghai",
  "hong kong": "Asia/Hong_Kong",
  "hongkong": "Asia/Hong_Kong",
  "macau": "Asia/Macau",
  "taipei": "Asia/Taipei",
  "singapore": "Asia/Singapore",
  "bangkok": "Asia/Bangkok",
  "kuala lumpur": "Asia/Kuala_Lumpur",
  "kl": "Asia/Kuala_Lumpur",
  "jakarta": "Asia/Jakarta",
  "bali": "Asia/Makassar",
  "manila": "Asia/Manila",
  "ho chi minh": "Asia/Ho_Chi_Minh",
  "saigon": "Asia/Ho_Chi_Minh",
  "hanoi": "Asia/Bangkok",
  "phnom penh": "Asia/Phnom_Penh",
  "vientiane": "Asia/Vientiane",
  "yangon": "Asia/Rangoon",
  "rangoon": "Asia/Rangoon",
  "dhaka": "Asia/Dhaka",
  "colombo": "Asia/Colombo",
  "kathmandu": "Asia/Kathmandu",
  "karachi": "Asia/Karachi",
  "lahore": "Asia/Karachi",
  "islamabad": "Asia/Karachi",
  "mumbai": "Asia/Kolkata",
  "delhi": "Asia/Kolkata",
  "new delhi": "Asia/Kolkata",
  "bangalore": "Asia/Kolkata",
  "chennai": "Asia/Kolkata",
  "kolkata": "Asia/Kolkata",
  "calcutta": "Asia/Kolkata",
  "hyderabad": "Asia/Kolkata",
  "kabul": "Asia/Kabul",
  "tehran": "Asia/Tehran",
  "dubai": "Asia/Dubai",
  "abu dhabi": "Asia/Dubai",
  "doha": "Asia/Qatar",
  "riyadh": "Asia/Riyadh",
  "jeddah": "Asia/Riyadh",
  "kuwait": "Asia/Kuwait",
  "manama": "Asia/Bahrain",
  "muscat": "Asia/Muscat",
  "beirut": "Asia/Beirut",
  "amman": "Asia/Amman",
  "damascus": "Asia/Damascus",
  "baghdad": "Asia/Baghdad",
  "jerusalem": "Asia/Jerusalem",
  "tel aviv": "Asia/Jerusalem",
  "ulaanbaatar": "Asia/Ulaanbaatar",
  "thimphu": "Asia/Thimphu",

  // Americas
  "new york": "America/New_York",
  "nyc": "America/New_York",
  "boston": "America/New_York",
  "philadelphia": "America/New_York",
  "miami": "America/New_York",
  "atlanta": "America/New_York",
  "toronto": "America/Toronto",
  "montreal": "America/Toronto",
  "ottawa": "America/Toronto",
  "chicago": "America/Chicago",
  "houston": "America/Chicago",
  "dallas": "America/Chicago",
  "minneapolis": "America/Chicago",
  "mexico city": "America/Mexico_City",
  "guadalajara": "America/Mexico_City",
  "monterrey": "America/Mexico_City",
  "denver": "America/Denver",
  "calgary": "America/Edmonton",
  "edmonton": "America/Edmonton",
  "phoenix": "America/Phoenix",
  "los angeles": "America/Los_Angeles",
  "la": "America/Los_Angeles",
  "san francisco": "America/Los_Angeles",
  "seattle": "America/Los_Angeles",
  "vancouver": "America/Vancouver",
  "anchorage": "America/Anchorage",
  "honolulu": "Pacific/Honolulu",
  "hawaii": "Pacific/Honolulu",
  "sao paulo": "America/Sao_Paulo",
  "rio de janeiro": "America/Sao_Paulo",
  "rio": "America/Sao_Paulo",
  "brasilia": "America/Sao_Paulo",
  "buenos aires": "America/Argentina/Buenos_Aires",
  "bogota": "America/Bogota",
  "lima": "America/Lima",
  "santiago": "America/Santiago",
  "caracas": "America/Caracas",
  "havana": "America/Havana",
  "panama": "America/Panama",
  "quito": "America/Guayaquil",

  // Africa
  "cairo": "Africa/Cairo",
  "lagos": "Africa/Lagos",
  "nairobi": "Africa/Nairobi",
  "johannesburg": "Africa/Johannesburg",
  "joburg": "Africa/Johannesburg",
  "cape town": "Africa/Johannesburg",
  "casablanca": "Africa/Casablanca",
  "algiers": "Africa/Algiers",
  "tunis": "Africa/Tunis",
  "tripoli": "Africa/Tripoli",
  "accra": "Africa/Accra",
  "dakar": "Africa/Dakar",
  "addis ababa": "Africa/Addis_Ababa",
  "kampala": "Africa/Kampala",
  "dar es salaam": "Africa/Dar_es_Salaam",
  "harare": "Africa/Harare",
  "lusaka": "Africa/Lusaka",

  // Pacific & Oceania
  "sydney": "Australia/Sydney",
  "melbourne": "Australia/Melbourne",
  "brisbane": "Australia/Brisbane",
  "perth": "Australia/Perth",
  "adelaide": "Australia/Adelaide",
  "auckland": "Pacific/Auckland",
  "wellington": "Pacific/Auckland",
  "fiji": "Pacific/Fiji",
  "honolulu": "Pacific/Honolulu",
};

/**
 * Given a user-typed string like "london" or "new york" or "Asia/Tokyo",
 * return the best-matching IANA timezone string, or null if not found.
 */
function resolveTimezone(input) {
  if (!input) return null;
  const s = input.trim();

  // If it looks like a valid IANA tz already (contains "/"), validate and return
  if (s.includes("/")) {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: s });
      return s; // valid
    } catch (e) {
      // fall through to city lookup
    }
  }

  const key = s.toLowerCase();

  // Exact match
  if (CITY_TZ[key]) return CITY_TZ[key];

  // Partial match — find first city that starts with the input
  for (const [city, tz] of Object.entries(CITY_TZ)) {
    if (city.startsWith(key)) return tz;
  }

  // Substring match — find first city that contains the input
  for (const [city, tz] of Object.entries(CITY_TZ)) {
    if (city.includes(key)) return tz;
  }

  return null;
}
