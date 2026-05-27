// 2026 traveler cost estimates — USD per person per day, by tier.
// Sourced from a blend of Budget Your Trip, Numbeo, and travel-cost trackers,
// rounded to consistent ranges for comparability across destinations.
//
// `countryCode` matches the COUNTRIES list in src/TripApp.jsx so the tracker
// can pre-fill the country select on handoff. Destinations whose country
// isn't yet in that list fall through to "OT".
//
// `flightEstimateUSD` is a rough round-trip economy fare from a major US hub.

export const destinationCosts = {
  "paris": {
    name: "Paris", country: "France", countryCode: "FR", currency: "EUR",
    flightEstimateUSD: 750,
    budget:   { accommodation: 60,  food: 35,  transport: 10, activities: 20 },
    midRange: { accommodation: 180, food: 70,  transport: 15, activities: 40 },
    luxury:   { accommodation: 450, food: 180, transport: 30, activities: 100 },
  },
  "tokyo": {
    name: "Tokyo", country: "Japan", countryCode: "JP", currency: "JPY",
    flightEstimateUSD: 1200,
    budget:   { accommodation: 50,  food: 30,  transport: 12, activities: 15 },
    midRange: { accommodation: 160, food: 60,  transport: 18, activities: 35 },
    luxury:   { accommodation: 420, food: 160, transport: 35, activities: 95 },
  },
  "bangkok": {
    name: "Bangkok", country: "Thailand", countryCode: "TH", currency: "THB",
    flightEstimateUSD: 1100,
    budget:   { accommodation: 20,  food: 15,  transport: 5,  activities: 10 },
    midRange: { accommodation: 75,  food: 30,  transport: 10, activities: 20 },
    luxury:   { accommodation: 250, food: 100, transport: 25, activities: 70 },
  },
  "bali": {
    name: "Bali", country: "Indonesia", countryCode: "ID", currency: "IDR",
    flightEstimateUSD: 1300,
    budget:   { accommodation: 20,  food: 12,  transport: 5,  activities: 12 },
    midRange: { accommodation: 70,  food: 28,  transport: 12, activities: 25 },
    luxury:   { accommodation: 280, food: 90,  transport: 30, activities: 75 },
  },
  "cancun": {
    name: "Cancun", country: "Mexico", countryCode: "MX", currency: "MXN",
    flightEstimateUSD: 480,
    budget:   { accommodation: 35,  food: 20,  transport: 8,  activities: 15 },
    midRange: { accommodation: 120, food: 50,  transport: 15, activities: 40 },
    luxury:   { accommodation: 350, food: 130, transport: 30, activities: 85 },
  },
  "rome": {
    name: "Rome", country: "Italy", countryCode: "IT", currency: "EUR",
    flightEstimateUSD: 760,
    budget:   { accommodation: 55,  food: 30,  transport: 8,  activities: 18 },
    midRange: { accommodation: 160, food: 65,  transport: 12, activities: 40 },
    luxury:   { accommodation: 420, food: 170, transport: 28, activities: 100 },
  },
  "barcelona": {
    name: "Barcelona", country: "Spain", countryCode: "ES", currency: "EUR",
    flightEstimateUSD: 740,
    budget:   { accommodation: 50,  food: 28,  transport: 8,  activities: 16 },
    midRange: { accommodation: 150, food: 55,  transport: 12, activities: 35 },
    luxury:   { accommodation: 380, food: 150, transport: 28, activities: 90 },
  },
  "london": {
    name: "London", country: "United Kingdom", countryCode: "GB", currency: "GBP",
    flightEstimateUSD: 720,
    budget:   { accommodation: 70,  food: 40,  transport: 12, activities: 22 },
    midRange: { accommodation: 200, food: 80,  transport: 18, activities: 50 },
    luxury:   { accommodation: 500, food: 200, transport: 35, activities: 120 },
  },
  "dubai": {
    name: "Dubai", country: "UAE", countryCode: "AE", currency: "AED",
    flightEstimateUSD: 1100,
    budget:   { accommodation: 60,  food: 30,  transport: 10, activities: 25 },
    midRange: { accommodation: 200, food: 80,  transport: 20, activities: 60 },
    luxury:   { accommodation: 550, food: 220, transport: 40, activities: 150 },
  },
  "istanbul": {
    name: "Istanbul", country: "Turkey", countryCode: "TR", currency: "TRY",
    flightEstimateUSD: 850,
    budget:   { accommodation: 30,  food: 15,  transport: 5,  activities: 12 },
    midRange: { accommodation: 90,  food: 35,  transport: 10, activities: 25 },
    luxury:   { accommodation: 280, food: 110, transport: 22, activities: 75 },
  },
  "marrakech": {
    name: "Marrakech", country: "Morocco", countryCode: "MA", currency: "MAD",
    flightEstimateUSD: 950,
    budget:   { accommodation: 25,  food: 15,  transport: 5,  activities: 10 },
    midRange: { accommodation: 80,  food: 35,  transport: 10, activities: 25 },
    luxury:   { accommodation: 280, food: 110, transport: 25, activities: 75 },
  },
  "cape-town": {
    name: "Cape Town", country: "South Africa", countryCode: "ZA", currency: "ZAR",
    flightEstimateUSD: 1400,
    budget:   { accommodation: 30,  food: 15,  transport: 8,  activities: 12 },
    midRange: { accommodation: 100, food: 40,  transport: 12, activities: 30 },
    luxury:   { accommodation: 320, food: 130, transport: 30, activities: 85 },
  },
  "buenos-aires": {
    name: "Buenos Aires", country: "Argentina", countryCode: "AR", currency: "ARS",
    flightEstimateUSD: 900,
    budget:   { accommodation: 30,  food: 18,  transport: 6,  activities: 12 },
    midRange: { accommodation: 95,  food: 40,  transport: 12, activities: 28 },
    luxury:   { accommodation: 290, food: 120, transport: 25, activities: 80 },
  },
  "lisbon": {
    name: "Lisbon", country: "Portugal", countryCode: "PT", currency: "EUR",
    flightEstimateUSD: 700,
    budget:   { accommodation: 40,  food: 25,  transport: 7,  activities: 14 },
    midRange: { accommodation: 130, food: 50,  transport: 12, activities: 30 },
    luxury:   { accommodation: 350, food: 140, transport: 25, activities: 80 },
  },
  "reykjavik": {
    name: "Reykjavik", country: "Iceland", countryCode: "OT", currency: "USD",
    flightEstimateUSD: 600,
    budget:   { accommodation: 80,  food: 45,  transport: 12, activities: 25 },
    midRange: { accommodation: 220, food: 95,  transport: 22, activities: 55 },
    luxury:   { accommodation: 500, food: 220, transport: 45, activities: 130 },
  },
  "santorini": {
    name: "Santorini", country: "Greece", countryCode: "GR", currency: "EUR",
    flightEstimateUSD: 850,
    budget:   { accommodation: 55,  food: 30,  transport: 8,  activities: 15 },
    midRange: { accommodation: 180, food: 70,  transport: 15, activities: 40 },
    luxury:   { accommodation: 500, food: 200, transport: 30, activities: 110 },
  },
  "phuket": {
    name: "Phuket", country: "Thailand", countryCode: "TH", currency: "THB",
    flightEstimateUSD: 1150,
    budget:   { accommodation: 25,  food: 15,  transport: 6,  activities: 12 },
    midRange: { accommodation: 90,  food: 35,  transport: 12, activities: 28 },
    luxury:   { accommodation: 300, food: 120, transport: 28, activities: 80 },
  },
  "hanoi": {
    name: "Hanoi", country: "Vietnam", countryCode: "VN", currency: "VND",
    flightEstimateUSD: 1100,
    budget:   { accommodation: 18,  food: 12,  transport: 4,  activities: 8 },
    midRange: { accommodation: 65,  food: 25,  transport: 8,  activities: 18 },
    luxury:   { accommodation: 220, food: 85,  transport: 22, activities: 60 },
  },
  "cusco": {
    name: "Cusco", country: "Peru", countryCode: "PE", currency: "PEN",
    flightEstimateUSD: 700,
    budget:   { accommodation: 25,  food: 15,  transport: 5,  activities: 15 },
    midRange: { accommodation: 75,  food: 30,  transport: 10, activities: 30 },
    luxury:   { accommodation: 240, food: 100, transport: 22, activities: 85 },
  },
  "cartagena": {
    name: "Cartagena", country: "Colombia", countryCode: "CO", currency: "COP",
    flightEstimateUSD: 600,
    budget:   { accommodation: 25,  food: 15,  transport: 6,  activities: 12 },
    midRange: { accommodation: 85,  food: 35,  transport: 12, activities: 28 },
    luxury:   { accommodation: 260, food: 110, transport: 25, activities: 75 },
  },
  "kyoto": {
    name: "Kyoto", country: "Japan", countryCode: "JP", currency: "JPY",
    flightEstimateUSD: 1200,
    budget:   { accommodation: 50,  food: 28,  transport: 10, activities: 14 },
    midRange: { accommodation: 160, food: 55,  transport: 16, activities: 32 },
    luxury:   { accommodation: 420, food: 160, transport: 32, activities: 90 },
  },
  "seoul": {
    name: "Seoul", country: "South Korea", countryCode: "KR", currency: "KRW",
    flightEstimateUSD: 1150,
    budget:   { accommodation: 35,  food: 22,  transport: 8,  activities: 12 },
    midRange: { accommodation: 120, food: 45,  transport: 15, activities: 30 },
    luxury:   { accommodation: 360, food: 140, transport: 30, activities: 80 },
  },
  "sydney": {
    name: "Sydney", country: "Australia", countryCode: "AU", currency: "AUD",
    flightEstimateUSD: 1500,
    budget:   { accommodation: 55,  food: 30,  transport: 10, activities: 18 },
    midRange: { accommodation: 170, food: 65,  transport: 16, activities: 40 },
    luxury:   { accommodation: 440, food: 180, transport: 35, activities: 100 },
  },
  "queenstown": {
    name: "Queenstown", country: "New Zealand", countryCode: "NZ", currency: "NZD",
    flightEstimateUSD: 1600,
    budget:   { accommodation: 50,  food: 28,  transport: 10, activities: 22 },
    midRange: { accommodation: 160, food: 60,  transport: 18, activities: 50 },
    luxury:   { accommodation: 420, food: 170, transport: 35, activities: 120 },
  },
  "punta-cana": {
    name: "Punta Cana", country: "Dominican Republic", countryCode: "DO", currency: "DOP",
    flightEstimateUSD: 450,
    budget:   { accommodation: 40,  food: 25,  transport: 8,  activities: 15 },
    midRange: { accommodation: 150, food: 55,  transport: 15, activities: 40 },
    luxury:   { accommodation: 380, food: 150, transport: 30, activities: 95 },
  },
  "tulum": {
    name: "Tulum", country: "Mexico", countryCode: "MX", currency: "MXN",
    flightEstimateUSD: 520,
    budget:   { accommodation: 40,  food: 25,  transport: 8,  activities: 18 },
    midRange: { accommodation: 150, food: 60,  transport: 18, activities: 45 },
    luxury:   { accommodation: 420, food: 170, transport: 35, activities: 110 },
  },
  "costa-rica": {
    name: "Costa Rica (San José)", country: "Costa Rica", countryCode: "CR", currency: "CRC",
    flightEstimateUSD: 550,
    budget:   { accommodation: 30,  food: 18,  transport: 7,  activities: 15 },
    midRange: { accommodation: 100, food: 40,  transport: 15, activities: 35 },
    luxury:   { accommodation: 300, food: 120, transport: 30, activities: 90 },
  },
  "amalfi-coast": {
    name: "Amalfi Coast", country: "Italy", countryCode: "IT", currency: "EUR",
    flightEstimateUSD: 800,
    budget:   { accommodation: 70,  food: 35,  transport: 10, activities: 18 },
    midRange: { accommodation: 220, food: 80,  transport: 18, activities: 45 },
    luxury:   { accommodation: 550, food: 220, transport: 35, activities: 115 },
  },
  "maldives": {
    name: "Maldives", country: "Maldives", countryCode: "OT", currency: "USD",
    flightEstimateUSD: 1500,
    budget:   { accommodation: 110, food: 40,  transport: 15, activities: 25 },
    midRange: { accommodation: 380, food: 120, transport: 30, activities: 60 },
    luxury:   { accommodation: 900, food: 350, transport: 60, activities: 180 },
  },
  "zanzibar": {
    name: "Zanzibar", country: "Tanzania", countryCode: "OT", currency: "USD",
    flightEstimateUSD: 1500,
    budget:   { accommodation: 30,  food: 18,  transport: 6,  activities: 15 },
    midRange: { accommodation: 110, food: 45,  transport: 12, activities: 35 },
    luxury:   { accommodation: 320, food: 130, transport: 28, activities: 95 },
  },
  "new-york": {
    name: "New York", country: "United States", countryCode: "US", currency: "USD",
    flightEstimateUSD: 350,
    budget:   { accommodation: 80,  food: 40,  transport: 12, activities: 22 },
    midRange: { accommodation: 220, food: 80,  transport: 18, activities: 50 },
    luxury:   { accommodation: 550, food: 220, transport: 35, activities: 130 },
  },
  "mexico-city": {
    name: "Mexico City", country: "Mexico", countryCode: "MX", currency: "MXN",
    flightEstimateUSD: 450,
    budget:   { accommodation: 25,  food: 18,  transport: 6,  activities: 12 },
    midRange: { accommodation: 90,  food: 40,  transport: 12, activities: 30 },
    luxury:   { accommodation: 280, food: 120, transport: 25, activities: 80 },
  },
  "prague": {
    name: "Prague", country: "Czech Republic", countryCode: "CZ", currency: "CZK",
    flightEstimateUSD: 760,
    budget:   { accommodation: 30,  food: 20,  transport: 6,  activities: 12 },
    midRange: { accommodation: 100, food: 40,  transport: 12, activities: 28 },
    luxury:   { accommodation: 300, food: 120, transport: 25, activities: 75 },
  },
  "amsterdam": {
    name: "Amsterdam", country: "Netherlands", countryCode: "NL", currency: "EUR",
    flightEstimateUSD: 720,
    budget:   { accommodation: 55,  food: 32,  transport: 10, activities: 18 },
    midRange: { accommodation: 170, food: 70,  transport: 16, activities: 45 },
    luxury:   { accommodation: 440, food: 180, transport: 32, activities: 110 },
  },
  "vienna": {
    name: "Vienna", country: "Austria", countryCode: "OT", currency: "EUR",
    flightEstimateUSD: 760,
    budget:   { accommodation: 45,  food: 28,  transport: 8,  activities: 15 },
    midRange: { accommodation: 150, food: 60,  transport: 14, activities: 40 },
    luxury:   { accommodation: 400, food: 160, transport: 28, activities: 100 },
  },
  "budapest": {
    name: "Budapest", country: "Hungary", countryCode: "OT", currency: "HUF",
    flightEstimateUSD: 770,
    budget:   { accommodation: 28,  food: 18,  transport: 6,  activities: 12 },
    midRange: { accommodation: 95,  food: 38,  transport: 12, activities: 28 },
    luxury:   { accommodation: 280, food: 110, transport: 25, activities: 75 },
  },
  "singapore": {
    name: "Singapore", country: "Singapore", countryCode: "SG", currency: "SGD",
    flightEstimateUSD: 1250,
    budget:   { accommodation: 45,  food: 25,  transport: 10, activities: 15 },
    midRange: { accommodation: 160, food: 60,  transport: 16, activities: 40 },
    luxury:   { accommodation: 450, food: 180, transport: 32, activities: 110 },
  },
  "hong-kong": {
    name: "Hong Kong", country: "Hong Kong", countryCode: "CN", currency: "HKD",
    flightEstimateUSD: 1100,
    budget:   { accommodation: 55,  food: 28,  transport: 10, activities: 16 },
    midRange: { accommodation: 180, food: 65,  transport: 16, activities: 42 },
    luxury:   { accommodation: 460, food: 180, transport: 32, activities: 110 },
  },
  "rio-de-janeiro": {
    name: "Rio de Janeiro", country: "Brazil", countryCode: "BR", currency: "BRL",
    flightEstimateUSD: 950,
    budget:   { accommodation: 30,  food: 20,  transport: 7,  activities: 14 },
    midRange: { accommodation: 110, food: 45,  transport: 14, activities: 35 },
    luxury:   { accommodation: 320, food: 130, transport: 28, activities: 90 },
  },
  "cairo": {
    name: "Cairo", country: "Egypt", countryCode: "EG", currency: "EGP",
    flightEstimateUSD: 1000,
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

// Featured grid on the homepage — 12 hand-picked.
export const POPULAR_SLUGS = [
  "paris", "tokyo", "bangkok", "bali",
  "rome", "barcelona", "london", "dubai",
  "new-york", "mexico-city", "santorini", "cancun",
];
