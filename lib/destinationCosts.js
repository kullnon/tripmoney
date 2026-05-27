// 2026 traveler cost estimates — USD per person per day, by tier.
// Sourced from a blend of Budget Your Trip, Numbeo, and travel-cost trackers,
// rounded to consistent ranges for comparability across destinations.
//
// `countryCode` matches the COUNTRIES list in src/TripApp.jsx so the tracker
// can pre-fill the country select on handoff. Destinations whose country
// isn't yet in that list fall through to "OT".
//
// `flightEstimates` is a map of origin-country code → rough round-trip
// economy fare in USD. Origins are the 12 countries surfaced in the
// estimator's "Departing from" dropdown. When the destination's country
// matches the origin (e.g. Paris from FR, Tokyo from JP), the value is 100
// — a placeholder short-haul/domestic budget line so the estimator never
// shows $0 for "flights".

export const ORIGINS = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "UK", name: "United Kingdom" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "ES", name: "Spain" },
  { code: "MX", name: "Mexico" },
  { code: "BR", name: "Brazil" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "ZA", name: "South Africa" },
  { code: "JP", name: "Japan" },
  { code: "AU", name: "Australia" },
];

export const ORIGIN_CODES = ORIGINS.map((o) => o.code);
export const DEFAULT_ORIGIN = "US";

export function originName(code) {
  const o = ORIGINS.find((x) => x.code === code);
  return o ? o.name : code;
}

export const destinationCosts = {
  "paris": {
    name: "Paris", country: "France", countryCode: "FR", currency: "EUR",
    flightEstimates: { US: 750, CA: 800, UK: 180, FR: 100, DE: 180, ES: 200, MX: 900, BR: 950, AE: 580, ZA: 950, JP: 1100, AU: 1500 },
    budget:   { accommodation: 60,  food: 35,  transport: 10, activities: 20 },
    midRange: { accommodation: 180, food: 70,  transport: 15, activities: 40 },
    luxury:   { accommodation: 450, food: 180, transport: 30, activities: 100 },
  },
  "tokyo": {
    name: "Tokyo", country: "Japan", countryCode: "JP", currency: "JPY",
    flightEstimates: { US: 1200, CA: 1250, UK: 1000, FR: 1000, DE: 1000, ES: 1100, MX: 1100, BR: 1700, AE: 800, ZA: 1300, JP: 100, AU: 950 },
    budget:   { accommodation: 50,  food: 30,  transport: 12, activities: 15 },
    midRange: { accommodation: 160, food: 60,  transport: 18, activities: 35 },
    luxury:   { accommodation: 420, food: 160, transport: 35, activities: 95 },
  },
  "bangkok": {
    name: "Bangkok", country: "Thailand", countryCode: "TH", currency: "THB",
    flightEstimates: { US: 1100, CA: 1200, UK: 850, FR: 900, DE: 900, ES: 950, MX: 1200, BR: 1800, AE: 550, ZA: 1000, JP: 600, AU: 700 },
    budget:   { accommodation: 20,  food: 15,  transport: 5,  activities: 10 },
    midRange: { accommodation: 75,  food: 30,  transport: 10, activities: 20 },
    luxury:   { accommodation: 250, food: 100, transport: 25, activities: 70 },
  },
  "bali": {
    name: "Bali", country: "Indonesia", countryCode: "ID", currency: "IDR",
    flightEstimates: { US: 1300, CA: 1350, UK: 1000, FR: 1050, DE: 1050, ES: 1100, MX: 1300, BR: 1900, AE: 700, ZA: 1100, JP: 700, AU: 600 },
    budget:   { accommodation: 20,  food: 12,  transport: 5,  activities: 12 },
    midRange: { accommodation: 70,  food: 28,  transport: 12, activities: 25 },
    luxury:   { accommodation: 280, food: 90,  transport: 30, activities: 75 },
  },
  "cancun": {
    name: "Cancun", country: "Mexico", countryCode: "MX", currency: "MXN",
    flightEstimates: { US: 480, CA: 550, UK: 850, FR: 900, DE: 900, ES: 800, MX: 100, BR: 900, AE: 1500, ZA: 1500, JP: 1200, AU: 1700 },
    budget:   { accommodation: 35,  food: 20,  transport: 8,  activities: 15 },
    midRange: { accommodation: 120, food: 50,  transport: 15, activities: 40 },
    luxury:   { accommodation: 350, food: 130, transport: 30, activities: 85 },
  },
  "rome": {
    name: "Rome", country: "Italy", countryCode: "IT", currency: "EUR",
    flightEstimates: { US: 760, CA: 800, UK: 200, FR: 180, DE: 200, ES: 200, MX: 950, BR: 1000, AE: 600, ZA: 900, JP: 1100, AU: 1500 },
    budget:   { accommodation: 55,  food: 30,  transport: 8,  activities: 18 },
    midRange: { accommodation: 160, food: 65,  transport: 12, activities: 40 },
    luxury:   { accommodation: 420, food: 170, transport: 28, activities: 100 },
  },
  "barcelona": {
    name: "Barcelona", country: "Spain", countryCode: "ES", currency: "EUR",
    flightEstimates: { US: 740, CA: 780, UK: 200, FR: 180, DE: 200, ES: 100, MX: 900, BR: 950, AE: 650, ZA: 850, JP: 1150, AU: 1500 },
    budget:   { accommodation: 50,  food: 28,  transport: 8,  activities: 16 },
    midRange: { accommodation: 150, food: 55,  transport: 12, activities: 35 },
    luxury:   { accommodation: 380, food: 150, transport: 28, activities: 90 },
  },
  "london": {
    name: "London", country: "United Kingdom", countryCode: "GB", currency: "GBP",
    flightEstimates: { US: 720, CA: 750, UK: 100, FR: 180, DE: 200, ES: 200, MX: 900, BR: 950, AE: 600, ZA: 900, JP: 1100, AU: 1500 },
    budget:   { accommodation: 70,  food: 40,  transport: 12, activities: 22 },
    midRange: { accommodation: 200, food: 80,  transport: 18, activities: 50 },
    luxury:   { accommodation: 500, food: 200, transport: 35, activities: 120 },
  },
  "dubai": {
    name: "Dubai", country: "UAE", countryCode: "AE", currency: "AED",
    flightEstimates: { US: 1100, CA: 1200, UK: 550, FR: 600, DE: 600, ES: 650, MX: 1500, BR: 1500, AE: 100, ZA: 750, JP: 900, AU: 1100 },
    budget:   { accommodation: 60,  food: 30,  transport: 10, activities: 25 },
    midRange: { accommodation: 200, food: 80,  transport: 20, activities: 60 },
    luxury:   { accommodation: 550, food: 220, transport: 40, activities: 150 },
  },
  "istanbul": {
    name: "Istanbul", country: "Turkey", countryCode: "TR", currency: "TRY",
    flightEstimates: { US: 850, CA: 900, UK: 300, FR: 350, DE: 350, ES: 400, MX: 1100, BR: 1200, AE: 400, ZA: 850, JP: 1000, AU: 1300 },
    budget:   { accommodation: 30,  food: 15,  transport: 5,  activities: 12 },
    midRange: { accommodation: 90,  food: 35,  transport: 10, activities: 25 },
    luxury:   { accommodation: 280, food: 110, transport: 22, activities: 75 },
  },
  "marrakech": {
    name: "Marrakech", country: "Morocco", countryCode: "MA", currency: "MAD",
    flightEstimates: { US: 950, CA: 1000, UK: 350, FR: 250, DE: 300, ES: 200, MX: 1200, BR: 1100, AE: 700, ZA: 800, JP: 1300, AU: 1700 },
    budget:   { accommodation: 25,  food: 15,  transport: 5,  activities: 10 },
    midRange: { accommodation: 80,  food: 35,  transport: 10, activities: 25 },
    luxury:   { accommodation: 280, food: 110, transport: 25, activities: 75 },
  },
  "cape-town": {
    name: "Cape Town", country: "South Africa", countryCode: "ZA", currency: "ZAR",
    flightEstimates: { US: 1400, CA: 1500, UK: 950, FR: 950, DE: 950, ES: 900, MX: 1700, BR: 1200, AE: 800, ZA: 100, JP: 1500, AU: 1500 },
    budget:   { accommodation: 30,  food: 15,  transport: 8,  activities: 12 },
    midRange: { accommodation: 100, food: 40,  transport: 12, activities: 30 },
    luxury:   { accommodation: 320, food: 130, transport: 30, activities: 85 },
  },
  "buenos-aires": {
    name: "Buenos Aires", country: "Argentina", countryCode: "AR", currency: "ARS",
    flightEstimates: { US: 900, CA: 1000, UK: 1100, FR: 1150, DE: 1150, ES: 1000, MX: 700, BR: 350, AE: 1500, ZA: 1300, JP: 1700, AU: 1700 },
    budget:   { accommodation: 30,  food: 18,  transport: 6,  activities: 12 },
    midRange: { accommodation: 95,  food: 40,  transport: 12, activities: 28 },
    luxury:   { accommodation: 290, food: 120, transport: 25, activities: 80 },
  },
  "lisbon": {
    name: "Lisbon", country: "Portugal", countryCode: "PT", currency: "EUR",
    flightEstimates: { US: 700, CA: 750, UK: 200, FR: 180, DE: 200, ES: 150, MX: 850, BR: 800, AE: 700, ZA: 800, JP: 1200, AU: 1500 },
    budget:   { accommodation: 40,  food: 25,  transport: 7,  activities: 14 },
    midRange: { accommodation: 130, food: 50,  transport: 12, activities: 30 },
    luxury:   { accommodation: 350, food: 140, transport: 25, activities: 80 },
  },
  "reykjavik": {
    name: "Reykjavik", country: "Iceland", countryCode: "OT", currency: "USD",
    flightEstimates: { US: 600, CA: 600, UK: 350, FR: 400, DE: 400, ES: 500, MX: 900, BR: 1100, AE: 900, ZA: 1100, JP: 1300, AU: 1700 },
    budget:   { accommodation: 80,  food: 45,  transport: 12, activities: 25 },
    midRange: { accommodation: 220, food: 95,  transport: 22, activities: 55 },
    luxury:   { accommodation: 500, food: 220, transport: 45, activities: 130 },
  },
  "santorini": {
    name: "Santorini", country: "Greece", countryCode: "GR", currency: "EUR",
    flightEstimates: { US: 850, CA: 900, UK: 400, FR: 400, DE: 400, ES: 450, MX: 1100, BR: 1100, AE: 600, ZA: 1000, JP: 1200, AU: 1500 },
    budget:   { accommodation: 55,  food: 30,  transport: 8,  activities: 15 },
    midRange: { accommodation: 180, food: 70,  transport: 15, activities: 40 },
    luxury:   { accommodation: 500, food: 200, transport: 30, activities: 110 },
  },
  "phuket": {
    name: "Phuket", country: "Thailand", countryCode: "TH", currency: "THB",
    flightEstimates: { US: 1150, CA: 1250, UK: 900, FR: 950, DE: 950, ES: 1000, MX: 1250, BR: 1900, AE: 600, ZA: 1100, JP: 650, AU: 750 },
    budget:   { accommodation: 25,  food: 15,  transport: 6,  activities: 12 },
    midRange: { accommodation: 90,  food: 35,  transport: 12, activities: 28 },
    luxury:   { accommodation: 300, food: 120, transport: 28, activities: 80 },
  },
  "hanoi": {
    name: "Hanoi", country: "Vietnam", countryCode: "VN", currency: "VND",
    flightEstimates: { US: 1100, CA: 1200, UK: 900, FR: 950, DE: 950, ES: 1000, MX: 1200, BR: 1800, AE: 600, ZA: 1100, JP: 550, AU: 700 },
    budget:   { accommodation: 18,  food: 12,  transport: 4,  activities: 8 },
    midRange: { accommodation: 65,  food: 25,  transport: 8,  activities: 18 },
    luxury:   { accommodation: 220, food: 85,  transport: 22, activities: 60 },
  },
  "cusco": {
    name: "Cusco", country: "Peru", countryCode: "PE", currency: "PEN",
    flightEstimates: { US: 700, CA: 800, UK: 1100, FR: 1100, DE: 1100, ES: 1000, MX: 600, BR: 700, AE: 1500, ZA: 1500, JP: 1700, AU: 1700 },
    budget:   { accommodation: 25,  food: 15,  transport: 5,  activities: 15 },
    midRange: { accommodation: 75,  food: 30,  transport: 10, activities: 30 },
    luxury:   { accommodation: 240, food: 100, transport: 22, activities: 85 },
  },
  "cartagena": {
    name: "Cartagena", country: "Colombia", countryCode: "CO", currency: "COP",
    flightEstimates: { US: 600, CA: 700, UK: 950, FR: 1000, DE: 1000, ES: 850, MX: 500, BR: 700, AE: 1500, ZA: 1400, JP: 1700, AU: 1800 },
    budget:   { accommodation: 25,  food: 15,  transport: 6,  activities: 12 },
    midRange: { accommodation: 85,  food: 35,  transport: 12, activities: 28 },
    luxury:   { accommodation: 260, food: 110, transport: 25, activities: 75 },
  },
  "kyoto": {
    name: "Kyoto", country: "Japan", countryCode: "JP", currency: "JPY",
    flightEstimates: { US: 1200, CA: 1250, UK: 1000, FR: 1000, DE: 1000, ES: 1100, MX: 1100, BR: 1700, AE: 800, ZA: 1300, JP: 100, AU: 950 },
    budget:   { accommodation: 50,  food: 28,  transport: 10, activities: 14 },
    midRange: { accommodation: 160, food: 55,  transport: 16, activities: 32 },
    luxury:   { accommodation: 420, food: 160, transport: 32, activities: 90 },
  },
  "seoul": {
    name: "Seoul", country: "South Korea", countryCode: "KR", currency: "KRW",
    flightEstimates: { US: 1150, CA: 1200, UK: 1000, FR: 1000, DE: 1000, ES: 1100, MX: 1100, BR: 1700, AE: 750, ZA: 1300, JP: 200, AU: 900 },
    budget:   { accommodation: 35,  food: 22,  transport: 8,  activities: 12 },
    midRange: { accommodation: 120, food: 45,  transport: 15, activities: 30 },
    luxury:   { accommodation: 360, food: 140, transport: 30, activities: 80 },
  },
  "sydney": {
    name: "Sydney", country: "Australia", countryCode: "AU", currency: "AUD",
    flightEstimates: { US: 1500, CA: 1600, UK: 1400, FR: 1400, DE: 1400, ES: 1500, MX: 1700, BR: 1800, AE: 1100, ZA: 1500, JP: 1000, AU: 100 },
    budget:   { accommodation: 55,  food: 30,  transport: 10, activities: 18 },
    midRange: { accommodation: 170, food: 65,  transport: 16, activities: 40 },
    luxury:   { accommodation: 440, food: 180, transport: 35, activities: 100 },
  },
  "queenstown": {
    name: "Queenstown", country: "New Zealand", countryCode: "NZ", currency: "NZD",
    flightEstimates: { US: 1600, CA: 1700, UK: 1500, FR: 1500, DE: 1500, ES: 1600, MX: 1800, BR: 1900, AE: 1200, ZA: 1600, JP: 1100, AU: 350 },
    budget:   { accommodation: 50,  food: 28,  transport: 10, activities: 22 },
    midRange: { accommodation: 160, food: 60,  transport: 18, activities: 50 },
    luxury:   { accommodation: 420, food: 170, transport: 35, activities: 120 },
  },
  "punta-cana": {
    name: "Punta Cana", country: "Dominican Republic", countryCode: "DO", currency: "DOP",
    flightEstimates: { US: 450, CA: 550, UK: 850, FR: 900, DE: 900, ES: 800, MX: 500, BR: 800, AE: 1500, ZA: 1500, JP: 1700, AU: 2000 },
    budget:   { accommodation: 40,  food: 25,  transport: 8,  activities: 15 },
    midRange: { accommodation: 150, food: 55,  transport: 15, activities: 40 },
    luxury:   { accommodation: 380, food: 150, transport: 30, activities: 95 },
  },
  "tulum": {
    name: "Tulum", country: "Mexico", countryCode: "MX", currency: "MXN",
    flightEstimates: { US: 520, CA: 600, UK: 900, FR: 950, DE: 950, ES: 850, MX: 100, BR: 900, AE: 1500, ZA: 1500, JP: 1300, AU: 1700 },
    budget:   { accommodation: 40,  food: 25,  transport: 8,  activities: 18 },
    midRange: { accommodation: 150, food: 60,  transport: 18, activities: 45 },
    luxury:   { accommodation: 420, food: 170, transport: 35, activities: 110 },
  },
  "costa-rica": {
    name: "Costa Rica (San José)", country: "Costa Rica", countryCode: "CR", currency: "CRC",
    flightEstimates: { US: 550, CA: 650, UK: 950, FR: 1000, DE: 1000, ES: 850, MX: 450, BR: 800, AE: 1500, ZA: 1500, JP: 1400, AU: 1800 },
    budget:   { accommodation: 30,  food: 18,  transport: 7,  activities: 15 },
    midRange: { accommodation: 100, food: 40,  transport: 15, activities: 35 },
    luxury:   { accommodation: 300, food: 120, transport: 30, activities: 90 },
  },
  "amalfi-coast": {
    name: "Amalfi Coast", country: "Italy", countryCode: "IT", currency: "EUR",
    flightEstimates: { US: 800, CA: 850, UK: 250, FR: 200, DE: 220, ES: 220, MX: 1000, BR: 1050, AE: 600, ZA: 950, JP: 1100, AU: 1500 },
    budget:   { accommodation: 70,  food: 35,  transport: 10, activities: 18 },
    midRange: { accommodation: 220, food: 80,  transport: 18, activities: 45 },
    luxury:   { accommodation: 550, food: 220, transport: 35, activities: 115 },
  },
  "maldives": {
    name: "Maldives", country: "Maldives", countryCode: "OT", currency: "USD",
    flightEstimates: { US: 1500, CA: 1600, UK: 1100, FR: 1100, DE: 1100, ES: 1100, MX: 1700, BR: 2000, AE: 400, ZA: 1100, JP: 1200, AU: 1300 },
    budget:   { accommodation: 110, food: 40,  transport: 15, activities: 25 },
    midRange: { accommodation: 380, food: 120, transport: 30, activities: 60 },
    luxury:   { accommodation: 900, food: 350, transport: 60, activities: 180 },
  },
  "zanzibar": {
    name: "Zanzibar", country: "Tanzania", countryCode: "OT", currency: "USD",
    flightEstimates: { US: 1500, CA: 1600, UK: 1000, FR: 1000, DE: 1000, ES: 1000, MX: 1700, BR: 1500, AE: 600, ZA: 600, JP: 1500, AU: 1700 },
    budget:   { accommodation: 30,  food: 18,  transport: 6,  activities: 15 },
    midRange: { accommodation: 110, food: 45,  transport: 12, activities: 35 },
    luxury:   { accommodation: 320, food: 130, transport: 28, activities: 95 },
  },
  "new-york": {
    name: "New York", country: "United States", countryCode: "US", currency: "USD",
    flightEstimates: { US: 100, CA: 400, UK: 700, FR: 750, DE: 750, ES: 700, MX: 450, BR: 900, AE: 1100, ZA: 1300, JP: 1100, AU: 1700 },
    budget:   { accommodation: 80,  food: 40,  transport: 12, activities: 22 },
    midRange: { accommodation: 220, food: 80,  transport: 18, activities: 50 },
    luxury:   { accommodation: 550, food: 220, transport: 35, activities: 130 },
  },
  "mexico-city": {
    name: "Mexico City", country: "Mexico", countryCode: "MX", currency: "MXN",
    flightEstimates: { US: 450, CA: 550, UK: 900, FR: 950, DE: 950, ES: 800, MX: 100, BR: 900, AE: 1500, ZA: 1500, JP: 1200, AU: 1700 },
    budget:   { accommodation: 25,  food: 18,  transport: 6,  activities: 12 },
    midRange: { accommodation: 90,  food: 40,  transport: 12, activities: 30 },
    luxury:   { accommodation: 280, food: 120, transport: 25, activities: 80 },
  },
  "prague": {
    name: "Prague", country: "Czech Republic", countryCode: "CZ", currency: "CZK",
    flightEstimates: { US: 760, CA: 800, UK: 250, FR: 220, DE: 180, ES: 250, MX: 1000, BR: 1100, AE: 600, ZA: 1000, JP: 1200, AU: 1500 },
    budget:   { accommodation: 30,  food: 20,  transport: 6,  activities: 12 },
    midRange: { accommodation: 100, food: 40,  transport: 12, activities: 28 },
    luxury:   { accommodation: 300, food: 120, transport: 25, activities: 75 },
  },
  "amsterdam": {
    name: "Amsterdam", country: "Netherlands", countryCode: "NL", currency: "EUR",
    flightEstimates: { US: 720, CA: 750, UK: 180, FR: 180, DE: 180, ES: 220, MX: 950, BR: 1000, AE: 600, ZA: 950, JP: 1100, AU: 1500 },
    budget:   { accommodation: 55,  food: 32,  transport: 10, activities: 18 },
    midRange: { accommodation: 170, food: 70,  transport: 16, activities: 45 },
    luxury:   { accommodation: 440, food: 180, transport: 32, activities: 110 },
  },
  "vienna": {
    name: "Vienna", country: "Austria", countryCode: "OT", currency: "EUR",
    flightEstimates: { US: 760, CA: 800, UK: 220, FR: 200, DE: 180, ES: 250, MX: 950, BR: 1100, AE: 600, ZA: 1000, JP: 1200, AU: 1500 },
    budget:   { accommodation: 45,  food: 28,  transport: 8,  activities: 15 },
    midRange: { accommodation: 150, food: 60,  transport: 14, activities: 40 },
    luxury:   { accommodation: 400, food: 160, transport: 28, activities: 100 },
  },
  "budapest": {
    name: "Budapest", country: "Hungary", countryCode: "OT", currency: "HUF",
    flightEstimates: { US: 770, CA: 850, UK: 250, FR: 220, DE: 200, ES: 300, MX: 1000, BR: 1100, AE: 600, ZA: 1000, JP: 1200, AU: 1500 },
    budget:   { accommodation: 28,  food: 18,  transport: 6,  activities: 12 },
    midRange: { accommodation: 95,  food: 38,  transport: 12, activities: 28 },
    luxury:   { accommodation: 280, food: 110, transport: 25, activities: 75 },
  },
  "singapore": {
    name: "Singapore", country: "Singapore", countryCode: "SG", currency: "SGD",
    flightEstimates: { US: 1250, CA: 1350, UK: 950, FR: 1000, DE: 1000, ES: 1100, MX: 1300, BR: 1900, AE: 600, ZA: 1100, JP: 600, AU: 600 },
    budget:   { accommodation: 45,  food: 25,  transport: 10, activities: 15 },
    midRange: { accommodation: 160, food: 60,  transport: 16, activities: 40 },
    luxury:   { accommodation: 450, food: 180, transport: 32, activities: 110 },
  },
  "hong-kong": {
    name: "Hong Kong", country: "Hong Kong", countryCode: "CN", currency: "HKD",
    flightEstimates: { US: 1100, CA: 1200, UK: 1000, FR: 1000, DE: 1000, ES: 1100, MX: 1100, BR: 1700, AE: 750, ZA: 1300, JP: 350, AU: 800 },
    budget:   { accommodation: 55,  food: 28,  transport: 10, activities: 16 },
    midRange: { accommodation: 180, food: 65,  transport: 16, activities: 42 },
    luxury:   { accommodation: 460, food: 180, transport: 32, activities: 110 },
  },
  "rio-de-janeiro": {
    name: "Rio de Janeiro", country: "Brazil", countryCode: "BR", currency: "BRL",
    flightEstimates: { US: 950, CA: 1050, UK: 1100, FR: 1100, DE: 1100, ES: 950, MX: 800, BR: 100, AE: 1500, ZA: 1100, JP: 1700, AU: 1700 },
    budget:   { accommodation: 30,  food: 20,  transport: 7,  activities: 14 },
    midRange: { accommodation: 110, food: 45,  transport: 14, activities: 35 },
    luxury:   { accommodation: 320, food: 130, transport: 28, activities: 90 },
  },
  "cairo": {
    name: "Cairo", country: "Egypt", countryCode: "EG", currency: "EGP",
    flightEstimates: { US: 1000, CA: 1100, UK: 500, FR: 500, DE: 500, ES: 550, MX: 1300, BR: 1300, AE: 350, ZA: 800, JP: 1100, AU: 1500 },
    budget:   { accommodation: 25,  food: 15,  transport: 5,  activities: 12 },
    midRange: { accommodation: 85,  food: 35,  transport: 10, activities: 28 },
    luxury:   { accommodation: 260, food: 105, transport: 22, activities: 75 },
  },
};

export const TIERS = [
  { id: "budget",   label: "Budget",    blurb: "Hostels, street food, public transit" },
  { id: "midRange", label: "Mid-range", blurb: "3-star hotels, restaurants, mixed transport" },
  { id: "luxury",   label: "Luxury",    blurb: "4–5 star, fine dining, private transport" },
];

export const HOME_CURRENCIES = [
  { code: "USD", symbol: "$",   name: "US Dollar" },
  { code: "EUR", symbol: "€",   name: "Euro" },
  { code: "GBP", symbol: "£",   name: "British Pound" },
  { code: "CAD", symbol: "C$",  name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$",  name: "Australian Dollar" },
  { code: "JPY", symbol: "¥",   name: "Japanese Yen" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "SEK", symbol: "kr",  name: "Swedish Krona" },
  { code: "NOK", symbol: "kr",  name: "Norwegian Krone" },
  { code: "DKK", symbol: "kr",  name: "Danish Krone" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso" },
  { code: "BRL", symbol: "R$",  name: "Brazilian Real" },
  { code: "INR", symbol: "₹",   name: "Indian Rupee" },
  { code: "SGD", symbol: "S$",  name: "Singapore Dollar" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  { code: "ZAR", symbol: "R",   name: "South African Rand" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
];

export function getDestination(slug) {
  return destinationCosts[slug] || null;
}

export function destinationSlugs() {
  return Object.keys(destinationCosts);
}

export function destinationList() {
  return Object.entries(destinationCosts).map(([slug, d]) => ({ slug, ...d }));
}

// Resolve the flight estimate for a destination from a given origin. Falls
// back to US if the origin is unknown (defensive — the dropdown should only
// ever pass codes we know).
export function flightEstimateFor(slug, originCode) {
  const dest = destinationCosts[slug];
  if (!dest) return 0;
  const fe = dest.flightEstimates || {};
  return fe[originCode] ?? fe[DEFAULT_ORIGIN] ?? 0;
}

// Featured grid on the homepage — 12 hand-picked.
export const POPULAR_SLUGS = [
  "paris", "tokyo", "bangkok", "bali",
  "rome", "barcelona", "london", "dubai",
  "new-york", "mexico-city", "santorini", "cancun",
];
