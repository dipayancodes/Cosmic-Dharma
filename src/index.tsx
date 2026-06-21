import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { calculateBirthChart } from './lib/vedic-engine'

type Bindings = {
  DB?: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())

// ============================================================
// API Routes
// ============================================================

// Generate Kundli
app.post('/api/kundli', async (c) => {
  try {
    const body = await c.req.json()
    const { name, year, month, day, hour, minute, latitude, longitude, timezone, place } = body
    
    if (!name || !year || !month || !day || latitude === undefined || longitude === undefined) {
      return c.json({ error: 'Missing required fields' }, 400)
    }
    
    const chart = calculateBirthChart(
      name,
      parseInt(year), parseInt(month), parseInt(day),
      parseInt(hour || 12), parseInt(minute || 0),
      parseFloat(latitude), parseFloat(longitude),
      parseFloat(timezone || 5.5),
      place || 'Unknown'
    )
    
    // Store in D1 if available
    if (c.env?.DB) {
      try {
        await c.env.DB.prepare(
          `INSERT INTO charts (id, name, birth_data, chart_data, created_at) VALUES (?, ?, ?, ?, datetime('now'))`
        ).bind(
          crypto.randomUUID(),
          name,
          JSON.stringify({ year, month, day, hour, minute, latitude, longitude, timezone, place }),
          JSON.stringify(chart)
        ).run()
      } catch (e) {
        // DB not available, continue without storage
      }
    }
    
    return c.json(chart)
  } catch (e: any) {
    return c.json({ error: e.message || 'Calculation error' }, 500)
  }
})

// Get saved charts
app.get('/api/charts', async (c) => {
  if (!c.env?.DB) return c.json([])
  try {
    const result = await c.env.DB.prepare('SELECT * FROM charts ORDER BY created_at DESC LIMIT 50').all()
    return c.json(result.results || [])
  } catch {
    return c.json([])
  }
})

// Geocoding proxy — uses Nominatim (OpenStreetMap) for global city search

// Timezone estimation by country code — covers the most common cases
// For countries with multiple timezones (US, Russia, etc.), uses longitude fallback
function estimateTimezone(countryCode: string, lon: number, lat: number): number {
  // Single-timezone countries with known standard offsets
  const COUNTRY_TZ: Record<string, number> = {
    // South Asia
    'in': 5.5, 'lk': 5.5, 'np': 5.75, 'bd': 6, 'pk': 5, 'af': 4.5, 'bt': 6, 'mv': 5,
    // East Asia
    'cn': 8, 'hk': 8, 'mo': 8, 'tw': 8, 'jp': 9, 'kr': 9, 'kp': 9, 'mn': 8, 'sg': 8,
    'my': 8, 'ph': 8, 'th': 7, 'vn': 7, 'kh': 7, 'la': 7, 'mm': 6.5,
    // Middle East
    'ae': 4, 'sa': 3, 'qa': 3, 'bh': 3, 'kw': 3, 'om': 4, 'ye': 3, 'jo': 3, 'lb': 2,
    'sy': 3, 'iq': 3, 'ir': 3.5, 'il': 2, 'ps': 2, 'tr': 3,
    // Europe (CET = UTC+1)
    'fr': 1, 'de': 1, 'it': 1, 'es': 1, 'nl': 1, 'be': 1, 'at': 1, 'ch': 1, 'pl': 1,
    'cz': 1, 'sk': 1, 'hu': 1, 'hr': 1, 'si': 1, 'se': 1, 'no': 1, 'dk': 1, 'fi': 2,
    'ee': 2, 'lv': 2, 'lt': 2, 'ro': 2, 'bg': 2, 'gr': 2, 'cy': 2, 'ua': 2, 'md': 2,
    'rs': 1, 'ba': 1, 'me': 1, 'mk': 1, 'al': 1, 'lu': 1, 'li': 1, 'mc': 1, 'ad': 1,
    'mt': 1, 'va': 1, 'sm': 1, 'ie': 0, 'is': 0, 'gb': 0, 'pt': 0,
    // Africa
    'eg': 2, 'za': 2, 'ng': 1, 'ke': 3, 'et': 3, 'tz': 3, 'ug': 3, 'gh': 0, 'ma': 1,
    'dz': 1, 'tn': 1, 'ly': 2, 'sd': 2, 'ao': 1, 'cm': 1, 'ci': 0, 'sn': 0,
    // Oceania
    'nz': 12, 'fj': 12,
    // Americas (single-tz)
    'ar': -3, 'cl': -4, 'co': -5, 'pe': -5, 'ec': -5, 've': -4, 'bo': -4, 'py': -4,
    'uy': -3, 'cr': -6, 'pa': -5, 'cu': -5, 'do': -4, 'ht': -5, 'jm': -5, 'tt': -4,
    'pr': -4, 'gt': -6, 'hn': -6, 'ni': -6, 'sv': -6,
  }

  if (COUNTRY_TZ[countryCode] !== undefined) return COUNTRY_TZ[countryCode]

  // Multi-timezone countries — use longitude-based estimation
  // US
  if (countryCode === 'us') {
    if (lon < -135) return -10 // Hawaii
    if (lon < -127) return -9  // Alaska
    if (lon < -112) return -8  // Pacific
    if (lon < -102) return -7  // Mountain
    if (lon < -87)  return -6  // Central
    return -5 // Eastern
  }
  // Canada
  if (countryCode === 'ca') {
    if (lon < -127) return -8
    if (lon < -112) return -7
    if (lon < -90)  return -6
    if (lon < -70)  return -5
    return -3.5 // Newfoundland
  }
  // Brazil
  if (countryCode === 'br') {
    if (lon < -60) return -4 // Amazon
    return -3 // Brasilia
  }
  // Russia
  if (countryCode === 'ru') {
    if (lon < 42)  return 3
    if (lon < 52)  return 4
    if (lon < 69)  return 5
    if (lon < 82)  return 6
    if (lon < 93)  return 7
    if (lon < 105) return 8
    if (lon < 120) return 9
    if (lon < 135) return 10
    if (lon < 150) return 11
    return 12
  }
  // Australia
  if (countryCode === 'au') {
    if (lon < 120) return 8    // AWST
    if (lon < 142) return 9.5  // ACST
    return 10 // AEST
  }

  // Fallback: longitude-based (rounded to nearest 0.5)
  const rawTz = lon / 15
  return Math.round(rawTz * 2) / 2
}

app.get('/api/geocode', async (c) => {
  const q = c.req.query('q')
  if (!q || q.length < 2) return c.json([])
  
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=8&addressdetails=1&accept-language=en`
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CosmicDharma/4.0 (Vedic Astrology App)',
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) return c.json([])
    
    const data: any[] = await response.json()
    
    // Transform Nominatim results to our format
    const results = data
      .filter((r: any) => r.lat && r.lon)
      .map((r: any) => {
        const lat = parseFloat(r.lat)
        const lon = parseFloat(r.lon)
        
        // Build display name from address parts
        const addr = r.address || {}
        const parts: string[] = []
        if (addr.city || addr.town || addr.village || addr.hamlet) {
          parts.push(addr.city || addr.town || addr.village || addr.hamlet)
        }
        if (addr.state || addr.state_district) {
          parts.push(addr.state || addr.state_district)
        }
        if (addr.country) {
          parts.push(addr.country)
        }
        const displayName = parts.length > 0 ? parts.join(', ') : r.display_name.split(',').slice(0, 3).join(',').trim()
        
        // Timezone estimation — use country code for known offsets, fallback to longitude
        const cc = (addr.country_code || '').toLowerCase()
        const tz = estimateTimezone(cc, lon, lat)
        
        return {
          name: displayName,
          lat: Math.round(lat * 10000) / 10000,
          lng: Math.round(lon * 10000) / 10000,
          tz: tz,
          type: r.type || 'place',
          fullName: r.display_name
        }
      })
    
    return c.json(results)
  } catch (e) {
    return c.json([])
  }
})

// ============================================================
// Page Routes — MPA with per-page SEO
// ============================================================

const SITE_URL = 'https://cosmic-dharma.pages.dev'
const SITE_NAME = 'Cosmic Dharma'
const OWNER_NAME = 'Dipayan Ghosh'

const HEAD_COMMON = `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#0a0a1a">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <meta name="author" content="${OWNER_NAME}">
  <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="shortcut icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <meta name="apple-mobile-web-app-title" content="CosmicD" />
  <link rel="manifest" href="/site.webmanifest" />
  <link rel="canonical" href="${SITE_URL}" />
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.0/css/all.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            cosmic: {
              900: '#050510', 800: '#0a0a1a', 700: '#0f0f2e',
              600: '#161640', 500: '#1e1e54', 400: '#2a2a6e',
              300: '#4a3f8f', 200: '#7c6bc4', 100: '#a78bfa',
            },
            neon: { blue: '#00d4ff', purple: '#a855f7', pink: '#ec4899', gold: '#f59e0b', green: '#10b981', cyan: '#06b6d4' }
          },
          fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
            display: ['Space Grotesk', 'sans-serif'],
          }
        }
      }
    }
  </script>
  <link href="/static/styles.css" rel="stylesheet">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7078476777062347" crossorigin="anonymous"></script>`

const HTML_SHELL = (opts: {
  title: string, description: string, keywords?: string,
  ogType?: string, ogImage?: string, canonical?: string,
  jsonLd?: string, bodyClass?: string
}) => `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  ${HEAD_COMMON}
  <title>${opts.title} | ${SITE_NAME} — Free Vedic Astrology Birth Chart Calculator</title>
  <meta name="description" content="${opts.description}">
  <meta name="keywords" content="${opts.keywords || 'vedic astrology, vedic astrology chart, vedic astrology calculator, vedic astrology birth chart, vedic astrology birth chart calculator, vedic astrology birth chart calculator online, vedic astrology chart calculator, free vedic astrology chart, vedic astrology reading, what is vedic astrology, vedic astrology dasha calculator online, vedic astrology signs, vedic astrology birth chart generator, kundli, jyotish, horoscope'}">
  <meta property="og:title" content="${opts.title} | ${SITE_NAME}">
  <meta property="og:description" content="${opts.description}">
  <meta property="og:type" content="${opts.ogType || 'website'}">
  <meta property="og:url" content="${opts.canonical || SITE_URL}">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:locale" content="en_US">
  <meta property="og:image" content="${opts.ogImage || SITE_URL + '/apple-touch-icon.png'}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${opts.title} | ${SITE_NAME}">
  <meta name="twitter:description" content="${opts.description}">
  ${opts.canonical ? `<link rel="canonical" href="${opts.canonical}" />` : ''}
  ${opts.jsonLd || ''}
</head>
<body class="bg-cosmic-900 text-white font-sans antialiased min-h-screen overflow-x-hidden ${opts.bodyClass || ''}">
  <div id="app"></div>
  <script src="/static/app.js"></script>
</body>
</html>`

// --- JSON-LD Structured Data ---
const WEBSITE_JSONLD = `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"WebSite","name":"${SITE_NAME}","url":"${SITE_URL}","description":"Free Vedic astrology birth chart calculator with Lahiri Ayanamsha. Generate your Kundli, explore divisional charts, Vimshottari Dasha, and AI-powered insights.","publisher":{"@type":"Person","name":"${OWNER_NAME}"},"potentialAction":{"@type":"SearchAction","target":"${SITE_URL}/generate","query-input":"required name=search_term"}}
</script>`

const FAQ_JSONLD = `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
{"@type":"Question","name":"Is Vedic astrology most accurate?","acceptedAnswer":{"@type":"Answer","text":"Vedic astrology, also known as Jyotish, is considered highly accurate by many practitioners because it uses the sidereal zodiac system (actual star positions) with the Lahiri Ayanamsha correction. This accounts for the precession of equinoxes, making planetary positions more astronomically precise than tropical systems. However, accuracy also depends on exact birth time and the skill of the astrologer interpreting the chart."}},
{"@type":"Question","name":"How do I know my Vedic astrology?","acceptedAnswer":{"@type":"Answer","text":"To know your Vedic astrology profile, you need your exact date of birth, time of birth, and place of birth. Using these details, a Vedic astrology calculator like Cosmic Dharma can generate your complete birth chart (Kundli) showing your Ascendant (Lagna), Moon sign (Rashi), Sun sign, Nakshatra, planetary positions, and divisional charts."}},
{"@type":"Question","name":"What is happening in Vedic astrology right now?","acceptedAnswer":{"@type":"Answer","text":"Current Vedic astrological transits are constantly changing as planets move through different signs and nakshatras. The Cosmic Dharma platform provides real-time planetary transit information calculated using the sidereal zodiac. You can generate your birth chart and check the Transits tab to see how current planetary movements affect your personal chart."}},
{"@type":"Question","name":"What exactly is Vedic astrology?","acceptedAnswer":{"@type":"Answer","text":"Vedic astrology (Jyotish Shastra) is an ancient Indian system of astrology dating back over 5,000 years. Unlike Western astrology which uses the tropical zodiac, Vedic astrology uses the sidereal zodiac based on actual star positions. It incorporates unique concepts like Nakshatras (27 lunar mansions), Vimshottari Dasha (planetary period system), divisional charts (D1-D60), and Doshas. It is rooted in the Vedic scriptures and aims to understand one's dharma (life purpose) and karma."}},
{"@type":"Question","name":"Is astrology 100% correct?","acceptedAnswer":{"@type":"Answer","text":"No system of astrology claims 100% accuracy. Vedic astrology provides a framework for understanding planetary influences and life patterns based on your birth chart. Its accuracy depends on precise birth details (especially exact birth time), the mathematical precision of calculations (like Lahiri Ayanamsha), and the depth of interpretation. Cosmic Dharma uses precise astronomical algorithms to ensure maximum computational accuracy."}},
{"@type":"Question","name":"What is vedic astrology?","acceptedAnswer":{"@type":"Answer","text":"Vedic astrology, known as Jyotish or the 'Science of Light,' is the traditional Hindu system of astrology originating from ancient India. It uses the sidereal zodiac (based on fixed star positions), the Lahiri Ayanamsha for precession correction, and the Whole Sign house system. Key components include the Rashi (zodiac sign), Nakshatra (lunar mansion), Graha (planets), Bhava (houses), Dasha (planetary periods), and Yoga (planetary combinations)."}},
{"@type":"Question","name":"Is vedic astrology more accurate?","acceptedAnswer":{"@type":"Answer","text":"Many practitioners consider Vedic astrology more accurate than Western astrology because it uses the sidereal zodiac, which aligns with actual astronomical positions of constellations. The sidereal system accounts for the ~24-degree difference caused by precession of equinoxes. Additionally, Vedic astrology's unique tools like Nakshatras, Vimshottari Dasha, and divisional charts provide deeper layers of analysis."}},
{"@type":"Question","name":"What is my vedic astrology sign?","acceptedAnswer":{"@type":"Answer","text":"Your Vedic astrology sign is determined by the position of the Moon in a particular zodiac sign (Rashi) at the time of your birth, using the sidereal zodiac. This is different from your Western sun sign. To find your Vedic sign, use a Vedic astrology birth chart calculator like Cosmic Dharma — enter your birth date, time, and place to get your Moon sign, Sun sign, and Ascendant."}},
{"@type":"Question","name":"What is the difference between western and vedic astrology?","acceptedAnswer":{"@type":"Answer","text":"The key differences are: (1) Zodiac System — Western uses tropical (fixed to seasons), Vedic uses sidereal (fixed to stars); (2) Primary Sign — Western focuses on Sun sign, Vedic emphasizes Moon sign and Ascendant; (3) Planetary Periods — Vedic has the unique Vimshottari Dasha system; (4) Divisions — Vedic uses 27 Nakshatras and up to 60 divisional charts; (5) Outer Planets — Traditional Vedic uses 9 planets (including Rahu/Ketu), not Uranus/Neptune/Pluto."}},
{"@type":"Question","name":"How to read vedic astrology chart?","acceptedAnswer":{"@type":"Answer","text":"Reading a Vedic chart involves: (1) Identify the Ascendant (Lagna) — the rising sign at birth; (2) Note planetary positions in signs and houses; (3) Check planetary dignities (exalted, debilitated, own sign); (4) Analyze house lords and their placements; (5) Look for Yogas (special planetary combinations); (6) Check the Nakshatra of each planet; (7) Examine divisional charts for specific life areas; (8) Review the Vimshottari Dasha for timing of events."}},
{"@type":"Question","name":"Is vedic astrology accurate?","acceptedAnswer":{"@type":"Answer","text":"Vedic astrology's accuracy is supported by its use of astronomically precise sidereal calculations. The Lahiri Ayanamsha ensures planetary positions match actual star positions. When combined with exact birth time, Vedic charts can provide remarkably detailed life insights. Cosmic Dharma uses precise Meeus-algorithm astronomical calculations for maximum positional accuracy."}},
{"@type":"Question","name":"What is nakshatra in vedic astrology?","acceptedAnswer":{"@type":"Answer","text":"Nakshatras are the 27 lunar mansions in Vedic astrology, each spanning 13°20' of the zodiac. They provide a finer division than the 12 zodiac signs, allowing more precise personality analysis and prediction. Each Nakshatra has a ruling deity, planetary lord, and four padas (quarters). Your birth Nakshatra (Moon's Nakshatra) determines your Vimshottari Dasha starting period and reveals deep personality traits."}},
{"@type":"Question","name":"How to calculate moon sign vedic astrology?","acceptedAnswer":{"@type":"Answer","text":"Your Vedic Moon sign is calculated by determining the Moon's sidereal longitude at your exact birth time and place, then subtracting the Ayanamsha (Lahiri Ayanamsha ≈ 24°). The resulting position falls in one of the 12 zodiac signs. This requires precise astronomical calculations accounting for the Moon's rapid movement (~13° per day). Use Cosmic Dharma's free calculator for instant, accurate results."}},
{"@type":"Question","name":"What is my sign in vedic astrology?","acceptedAnswer":{"@type":"Answer","text":"In Vedic astrology, you have three primary signs: (1) Moon Sign (Rashi) — most important, based on Moon's sidereal position; (2) Sun Sign — based on Sun's sidereal position (often different from your Western sign); (3) Ascendant (Lagna) — the rising sign at your birth moment. Generate your free Vedic birth chart on Cosmic Dharma to discover all three."}},
{"@type":"Question","name":"Which is more accurate vedic or western astrology?","acceptedAnswer":{"@type":"Answer","text":"Both systems have their strengths. Vedic astrology is considered more astronomically accurate because the sidereal zodiac matches actual star positions. The ~24° Ayanamsha difference means your Vedic sign may differ from your Western sign. Vedic also offers unique predictive tools like Vimshottari Dasha for timing events. Many practitioners use both systems for a comprehensive understanding."}},
{"@type":"Question","name":"Is vedic astrology sidereal?","acceptedAnswer":{"@type":"Answer","text":"Yes, Vedic astrology uses the sidereal zodiac, which is based on the actual positions of stars and constellations. The most commonly used correction is the Lahiri Ayanamsha (currently ~24°), which accounts for the precession of equinoxes — the slow wobble of Earth's axis that causes the tropical and sidereal zodiacs to drift apart by about 1° every 72 years."}},
{"@type":"Question","name":"How to learn vedic astrology?","acceptedAnswer":{"@type":"Answer","text":"Start by learning: (1) The 12 zodiac signs and their characteristics; (2) The 9 Vedic planets (Navagraha) and their significations; (3) The 12 houses and what they represent; (4) Basic planetary dignities (exaltation, debilitation); (5) The 27 Nakshatras; (6) How to read North and South Indian chart formats. Practice by generating charts on Cosmic Dharma and studying the detailed interpretations provided for each planetary position."}},
{"@type":"Question","name":"How to calculate upapada lagna in vedic astrology?","acceptedAnswer":{"@type":"Answer","text":"Upapada Lagna (UL) is calculated from the 12th house: (1) Find the lord of the 12th house from your Ascendant; (2) Count the same number of signs from the 12th house lord's position as the 12th lord is from the 12th house; (3) The resulting sign is your Upapada Lagna. It reveals details about your spouse and marriage. Cosmic Dharma automatically calculates UL and all Arudha Padas in the Arudha Padas tab."}},
{"@type":"Question","name":"What is pada in vedic astrology?","acceptedAnswer":{"@type":"Answer","text":"Pada has two meanings in Vedic astrology: (1) Nakshatra Pada — each of the 27 Nakshatras is divided into 4 quarters (padas) of 3°20' each, totaling 108 padas that map to the Navamsa (D9) chart; (2) Arudha Pada — the manifested image of a house, calculated using Jaimini astrology principles. Arudha Padas show how different life areas (career, marriage, wealth) appear to the outside world."}},
{"@type":"Question","name":"How to calculate dasha periods vedic astrology?","acceptedAnswer":{"@type":"Answer","text":"Vimshottari Dasha is calculated from the Moon's Nakshatra at birth: (1) Find the Moon's Nakshatra and its ruling planet; (2) Calculate how much of the Nakshatra the Moon has traversed; (3) The remaining portion determines the balance of the first Mahadasha; (4) Subsequent Mahadashas follow a fixed order: Sun(6y), Moon(10y), Mars(7y), Rahu(18y), Jupiter(16y), Saturn(19y), Mercury(17y), Ketu(7y), Venus(20y). Total cycle = 120 years."}},
{"@type":"Question","name":"How to read vedic astrology birth chart?","acceptedAnswer":{"@type":"Answer","text":"To read a Vedic birth chart: (1) Start with the Ascendant — it sets the house framework; (2) Check the Moon sign for emotional nature; (3) Examine planets in each house for life area influences; (4) Look at planetary aspects (Drishti); (5) Check for Yogas like Gaja Kesari, Budhaditya, or Pancha Mahapurusha; (6) Analyze the Navamsa (D9) for marriage and soul purpose; (7) Study the current Dasha period for timing; (8) Review Doshas for challenges. Cosmic Dharma provides all these analyses automatically."}}
]}
</script>`

// --- MPA Page Content Generators ---

const MPA_NAV = `
<nav class="fixed top-0 left-0 right-0 z-50 bg-cosmic-900/80 backdrop-blur-xl border-b border-purple-500/10">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <a href="/" class="flex items-center gap-3 group">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-lg font-bold group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all">\u2726</div>
        <span class="font-display text-lg font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Cosmic Dharma</span>
      </a>
      <div class="flex items-center gap-3">
        <a href="/about" class="hidden sm:inline text-sm text-white/50 hover:text-white transition-colors">About</a>
        <a href="/contact" class="hidden sm:inline text-sm text-white/50 hover:text-white transition-colors">Contact</a>
        <a href="/generate" class="btn-primary text-sm py-2 px-5">Generate Kundli</a>
      </div>
    </div>
  </div>
</nav>`

const MPA_FOOTER = `
<footer class="border-t border-purple-500/10 py-16 px-4 mt-16">
  <div class="max-w-7xl mx-auto">
    <div class="grid md:grid-cols-4 gap-10 mb-12">
      <div>
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-sm font-bold">\u2726</div>
          <span class="font-display font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Cosmic Dharma</span>
        </div>
        <p class="text-white/30 text-sm leading-relaxed mb-4">Premium Vedic astrology platform powered by the Sidereal system with Lahiri Ayanamsha. Ancient wisdom meets modern technology.</p>
        <p class="text-white/20 text-xs">Created by <strong class="text-purple-400/60">${OWNER_NAME}</strong></p>
      </div>
      <div>
        <h4 class="font-display font-bold text-sm mb-4 text-white/60">Platform</h4>
        <ul class="space-y-2 text-sm text-white/30">
          <li><a href="/" class="hover:text-purple-400 transition-colors">Home</a></li>
          <li><a href="/generate" class="hover:text-purple-400 transition-colors">Generate Kundli</a></li>
          <li><a href="/about" class="hover:text-purple-400 transition-colors">About Us</a></li>
          <li><a href="/contact" class="hover:text-purple-400 transition-colors">Contact Us</a></li>
        </ul>
      </div>
      <div>
        <h4 class="font-display font-bold text-sm mb-4 text-white/60">Legal</h4>
        <ul class="space-y-2 text-sm text-white/30">
          <li><a href="/privacy" class="hover:text-purple-400 transition-colors">Privacy Policy</a></li>
          <li><a href="/terms" class="hover:text-purple-400 transition-colors">Terms & Conditions</a></li>
        </ul>
      </div>
      <div>
        <h4 class="font-display font-bold text-sm mb-4 text-white/60">Connect</h4>
        <div class="flex gap-4 text-white/30 mb-4">
          <a href="#" class="hover:text-purple-400 transition-colors"><i class="fab fa-twitter text-lg"></i></a>
          <a href="#" class="hover:text-purple-400 transition-colors"><i class="fab fa-instagram text-lg"></i></a>
          <a href="#" class="hover:text-purple-400 transition-colors"><i class="fab fa-github text-lg"></i></a>
        </div>
        <div class="text-xs text-white/20 p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
          <i class="fas fa-om text-purple-400/40 mr-1"></i>
          Powered by Vedic Sidereal System &middot; Lahiri Ayanamsha
        </div>
      </div>
    </div>
    <div class="border-t border-purple-500/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="text-white/20 text-xs">&copy; 2026 ${SITE_NAME}. All rights reserved. Created by ${OWNER_NAME}.</div>
      <div class="text-white/15 text-xs">Powered by Vedic Sidereal System &middot; Lahiri Ayanamsha</div>
    </div>
  </div>
</footer>`

function wrapMPAPage(title: string, content: string) {
  return `${MPA_NAV}<main class="pt-20 pb-8 px-4 min-h-screen"><div class="max-w-4xl mx-auto">${content}</div></main>${MPA_FOOTER}`
}

// --- SPA Routes (Home, Generate, Dashboard) ---
app.get('/', (c) => c.html(HTML_SHELL({
  title: 'Free Vedic Astrology Birth Chart Calculator Online',
  description: 'Cosmic Dharma is a free Vedic astrology birth chart calculator online. Generate your Kundli with precise Lahiri Ayanamsha calculations, explore divisional charts (D1-D60), Vimshottari Dasha periods, Dosha analysis, and AI-powered insights. The most accurate vedic astrology chart calculator.',
  keywords: 'vedic astrology, vedic astrology chart, vedic astrology calculator, vedic astrology birth chart, vedic astrology birth chart calculator, vedic astrology birth chart calculator online, vedic astrology chart calculator, free vedic astrology chart, vedic astrology reading, what is vedic astrology, vedic astrology dasha calculator online, vedic astrology signs, vedic astrology birth chart generator, kundli, jyotish, horoscope, nakshatra, dasha, dosha, sade sati, ashtakavarga, shadbala, yoga, arudha pada',
  canonical: SITE_URL,
  ogType: 'website',
  jsonLd: WEBSITE_JSONLD + FAQ_JSONLD
})))

app.get('/generate', (c) => c.html(HTML_SHELL({
  title: 'Generate Your Free Vedic Birth Chart (Kundli)',
  description: 'Generate your free Vedic astrology birth chart with precise sidereal calculations. Enter your birth details for a complete Kundli with planetary positions, Nakshatras, Dashas, Doshas, and AI insights.',
  canonical: SITE_URL + '/generate',
  keywords: 'vedic astrology birth chart generator, free kundli generator, vedic astrology calculator, vedic birth chart online, jyotish calculator, vedic astrology birth chart calculator online'
})))

app.get('/dashboard', (c) => c.html(HTML_SHELL({
  title: 'Your Cosmic Dashboard — Interactive Vedic Chart Analysis',
  description: 'Explore your complete Vedic birth chart with interactive North & South Indian charts, divisional charts, Vimshottari Dasha timeline, Dosha analysis, and AI-powered insights.',
  canonical: SITE_URL + '/dashboard'
})))

app.get('/dashboard/*', (c) => c.html(HTML_SHELL({
  title: 'Dashboard — Vedic Astrology Analysis',
  description: 'Detailed Vedic astrology analysis with interactive charts, planetary positions, and personalized insights.',
  canonical: SITE_URL + '/dashboard'
})))

// --- MPA Routes: Privacy Policy ---
app.get('/privacy', (c) => c.html(HTML_SHELL({
  title: 'Privacy Policy',
  description: 'Privacy Policy for Cosmic Dharma — Learn how we collect, use, and protect your personal data including birth chart information.',
  canonical: SITE_URL + '/privacy',
  bodyClass: 'mpa-page',
  jsonLd: `<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage","name":"Privacy Policy","description":"Privacy Policy for Cosmic Dharma","url":"${SITE_URL}/privacy","publisher":{"@type":"Person","name":"${OWNER_NAME}"}}</script>`
}) + `<script>
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('app').innerHTML = \`${wrapMPAPage('Privacy Policy', `
    <div class="animate-fade-in">
      <h1 class="font-display text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Privacy Policy</h1>
      <p class="text-white/40 text-sm mb-8">Last updated: June 2026</p>
      <div class="glass-card p-8 sm:p-10 space-y-6 text-white/60 leading-relaxed text-sm">
        <section>
          <h2 class="font-display text-xl font-bold text-white/90 mb-3"><i class="fas fa-shield-halved text-purple-400 mr-2"></i>1. Information We Collect</h2>
          <p>When you use Cosmic Dharma, we may collect the following information:</p>
          <ul class="list-disc pl-6 mt-2 space-y-1">
            <li><strong class="text-white/80">Birth Details:</strong> Name, date of birth, time of birth, and place of birth that you voluntarily provide to generate your Vedic birth chart (Kundli).</li>
            <li><strong class="text-white/80">Usage Data:</strong> Anonymous analytics data including pages visited, time spent, and browser type.</li>
            <li><strong class="text-white/80">Device Information:</strong> Browser type, operating system, and device identifiers for service optimization.</li>
          </ul>
        </section>
        <section>
          <h2 class="font-display text-xl font-bold text-white/90 mb-3"><i class="fas fa-lock text-green-400 mr-2"></i>2. How We Use Your Information</h2>
          <ul class="list-disc pl-6 space-y-1">
            <li>To generate your Vedic astrology birth chart and provide personalized astrological analysis.</li>
            <li>To improve our calculation algorithms and user experience.</li>
            <li>To display relevant advertisements through Google AdSense.</li>
            <li>To respond to your inquiries and support requests.</li>
          </ul>
        </section>
        <section>
          <h2 class="font-display text-xl font-bold text-white/90 mb-3"><i class="fas fa-database text-cyan-400 mr-2"></i>3. Data Storage & Security</h2>
          <p>Your birth chart calculations are performed on our secure edge servers (Cloudflare Workers). We use industry-standard encryption and security measures. Birth data entered for chart generation may be temporarily stored for session purposes but is not permanently retained without your explicit consent.</p>
        </section>
        <section>
          <h2 class="font-display text-xl font-bold text-white/90 mb-3"><i class="fas fa-cookie text-amber-400 mr-2"></i>4. Cookies & Third-Party Services</h2>
          <p>We use cookies for essential site functionality and analytics. Third-party services include:</p>
          <ul class="list-disc pl-6 mt-2 space-y-1">
            <li><strong class="text-white/80">Google AdSense:</strong> For displaying advertisements. Google may use cookies to serve ads based on your browsing history.</li>
            <li><strong class="text-white/80">Google Fonts:</strong> For typography rendering.</li>
            <li><strong class="text-white/80">OpenStreetMap/Nominatim:</strong> For geocoding birth place locations.</li>
          </ul>
        </section>
        <section>
          <h2 class="font-display text-xl font-bold text-white/90 mb-3"><i class="fas fa-user-shield text-pink-400 mr-2"></i>5. Your Rights</h2>
          <p>You have the right to: access your personal data, request data deletion, opt out of data collection, and withdraw consent at any time. To exercise these rights, contact us at the email provided on our <a href="/contact" class="text-purple-400 hover:text-purple-300 underline">Contact page</a>.</p>
        </section>
        <section>
          <h2 class="font-display text-xl font-bold text-white/90 mb-3"><i class="fas fa-child text-blue-400 mr-2"></i>6. Children's Privacy</h2>
          <p>Cosmic Dharma is not directed at children under 13. We do not knowingly collect personal information from children under 13 years of age.</p>
        </section>
        <section>
          <h2 class="font-display text-xl font-bold text-white/90 mb-3"><i class="fas fa-sync text-green-400 mr-2"></i>7. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date. Continued use of the service constitutes acceptance of the revised policy.</p>
        </section>
        <section>
          <h2 class="font-display text-xl font-bold text-white/90 mb-3"><i class="fas fa-envelope text-purple-400 mr-2"></i>8. Contact</h2>
          <p>For privacy-related inquiries, please visit our <a href="/contact" class="text-purple-400 hover:text-purple-300 underline">Contact Us</a> page. Owner: <strong class="text-white/80">${OWNER_NAME}</strong>.</p>
        </section>
      </div>
    </div>
  `)}\`;
});
</script>`))

// --- MPA Routes: Terms & Conditions ---
app.get('/terms', (c) => c.html(HTML_SHELL({
  title: 'Terms & Conditions',
  description: 'Terms and Conditions for using Cosmic Dharma — Free Vedic Astrology Birth Chart Calculator.',
  canonical: SITE_URL + '/terms',
  bodyClass: 'mpa-page'
}) + `<script>
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('app').innerHTML = \`${wrapMPAPage('Terms & Conditions', `
    <div class="animate-fade-in">
      <h1 class="font-display text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Terms &amp; Conditions</h1>
      <p class="text-white/40 text-sm mb-8">Last updated: June 2026</p>
      <div class="glass-card p-8 sm:p-10 space-y-6 text-white/60 leading-relaxed text-sm">
        <section>
          <h2 class="font-display text-xl font-bold text-white/90 mb-3"><i class="fas fa-file-contract text-purple-400 mr-2"></i>1. Acceptance of Terms</h2>
          <p>By accessing and using Cosmic Dharma ("the Service"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the Service. The Service is owned and operated by <strong class="text-white/80">${OWNER_NAME}</strong>.</p>
        </section>
        <section>
          <h2 class="font-display text-xl font-bold text-white/90 mb-3"><i class="fas fa-star text-cyan-400 mr-2"></i>2. Service Description</h2>
          <p>Cosmic Dharma provides a free Vedic astrology birth chart calculator using the Sidereal zodiac system with Lahiri Ayanamsha. Our services include Kundli generation, divisional chart analysis, Vimshottari Dasha calculation, Dosha analysis, and AI-generated astrological insights.</p>
        </section>
        <section>
          <h2 class="font-display text-xl font-bold text-white/90 mb-3"><i class="fas fa-exclamation-triangle text-amber-400 mr-2"></i>3. Disclaimer</h2>
          <p><strong class="text-white/80">Vedic astrology is for entertainment and spiritual guidance purposes only.</strong> The astrological readings, predictions, and insights provided by Cosmic Dharma should not be considered as professional advice for medical, legal, financial, or life decisions. We do not guarantee the accuracy of predictions. Always consult qualified professionals for important life decisions.</p>
        </section>
        <section>
          <h2 class="font-display text-xl font-bold text-white/90 mb-3"><i class="fas fa-user-check text-green-400 mr-2"></i>4. User Responsibilities</h2>
          <ul class="list-disc pl-6 space-y-1">
            <li>You must provide accurate birth details for chart calculations.</li>
            <li>You agree not to misuse, reverse-engineer, or scrape the Service.</li>
            <li>You are responsible for maintaining the confidentiality of any saved chart data.</li>
            <li>You must not use the Service for any unlawful purpose.</li>
          </ul>
        </section>
        <section>
          <h2 class="font-display text-xl font-bold text-white/90 mb-3"><i class="fas fa-copyright text-pink-400 mr-2"></i>5. Intellectual Property</h2>
          <p>All content, design, code, algorithms, and branding of Cosmic Dharma are the intellectual property of ${OWNER_NAME}. You may not reproduce, distribute, or create derivative works without express written permission.</p>
        </section>
        <section>
          <h2 class="font-display text-xl font-bold text-white/90 mb-3"><i class="fas fa-ban text-red-400 mr-2"></i>6. Limitation of Liability</h2>
          <p>Cosmic Dharma and its owner shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of the Service. The Service is provided "as is" without warranties of any kind.</p>
        </section>
        <section>
          <h2 class="font-display text-xl font-bold text-white/90 mb-3"><i class="fas fa-gavel text-purple-400 mr-2"></i>7. Governing Law</h2>
          <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in India.</p>
        </section>
        <section>
          <h2 class="font-display text-xl font-bold text-white/90 mb-3"><i class="fas fa-envelope text-blue-400 mr-2"></i>8. Contact</h2>
          <p>For questions about these terms, visit our <a href="/contact" class="text-purple-400 hover:text-purple-300 underline">Contact Us</a> page. Owner: <strong class="text-white/80">${OWNER_NAME}</strong>.</p>
        </section>
      </div>
    </div>
  `)}\`;
});
</script>`))

// --- MPA Routes: About Us ---
app.get('/about', (c) => c.html(HTML_SHELL({
  title: 'About Us — Ancient Wisdom, Modern Technology',
  description: 'Learn about Cosmic Dharma — a premium Vedic astrology platform created by Dipayan Ghosh. Built with precision Lahiri Ayanamsha calculations and modern web technology.',
  canonical: SITE_URL + '/about',
  bodyClass: 'mpa-page',
  jsonLd: `<script type="application/ld+json">{"@context":"https://schema.org","@type":"AboutPage","name":"About Cosmic Dharma","description":"About Cosmic Dharma Vedic Astrology Platform","url":"${SITE_URL}/about","publisher":{"@type":"Person","name":"${OWNER_NAME}"}}</script>`
}) + `<script>
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('app').innerHTML = \`${wrapMPAPage('About Us', `
    <div class="animate-fade-in">
      <h1 class="font-display text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">About Cosmic Dharma</h1>
      <p class="text-white/40 text-sm mb-8">Ancient Wisdom. Modern Clarity.</p>
      <div class="glass-card p-8 sm:p-10 space-y-8 text-white/60 leading-relaxed text-sm mb-8">
        <div class="flex items-center gap-6 p-6 rounded-2xl bg-gradient-to-r from-purple-500/5 to-cyan-500/5 border border-purple-500/10">
          <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-3xl font-bold flex-shrink-0">\u2726</div>
          <div>
            <h2 class="font-display text-2xl font-bold text-white/90 mb-1">Created by ${OWNER_NAME}</h2>
            <p class="text-white/40">Founder, Developer & Vedic Astrology Enthusiast</p>
            <p class="text-xs text-purple-400/60 mt-1">Powered by Vedic Sidereal System &middot; Lahiri Ayanamsha</p>
          </div>
        </div>
        <section>
          <h2 class="font-display text-xl font-bold text-white/90 mb-3"><i class="fas fa-om text-purple-400 mr-2"></i>Our Mission</h2>
          <p>Cosmic Dharma was born from a deep passion for Vedic astrology and a desire to make this ancient science accessible to everyone. Our mission is to bridge the gap between the profound wisdom of Jyotish Shastra and modern technology, delivering precision Vedic astrology calculations through an intuitive, beautiful interface.</p>
        </section>
        <section>
          <h2 class="font-display text-xl font-bold text-white/90 mb-3"><i class="fas fa-microchip text-cyan-400 mr-2"></i>Technical Excellence</h2>
          <p>Every calculation on Cosmic Dharma is powered by:</p>
          <ul class="list-disc pl-6 mt-2 space-y-1">
            <li><strong class="text-white/80">Lahiri Ayanamsha</strong> — The most widely accepted sidereal correction for precise planetary positions.</li>
            <li><strong class="text-white/80">Meeus Algorithms</strong> — Astronomical-grade planetary position calculations.</li>
            <li><strong class="text-white/80">Whole Sign House System</strong> — The traditional Vedic house system for authentic Jyotish analysis.</li>
            <li><strong class="text-white/80">15 Divisional Charts (D1-D60)</strong> — Complete Parashari Varga system.</li>
            <li><strong class="text-white/80">Vimshottari Dasha</strong> — 120-year planetary period system with Mahadasha-Antardasha breakdowns.</li>
          </ul>
        </section>
        <section>
          <h2 class="font-display text-xl font-bold text-white/90 mb-3"><i class="fas fa-chart-pie text-pink-400 mr-2"></i>What We Offer</h2>
          <div class="grid sm:grid-cols-2 gap-4 mt-4">
            <div class="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10"><strong class="text-white/80">Birth Chart (Kundli)</strong><br>Interactive North & South Indian charts with click-to-explore planetary details.</div>
            <div class="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10"><strong class="text-white/80">Divisional Charts</strong><br>All 15 Parashari divisional charts from D1 (Rashi) to D60 (Shastiamsa).</div>
            <div class="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10"><strong class="text-white/80">Dasha Analysis</strong><br>Complete Vimshottari Dasha with visual timeline and Antardasha details.</div>
            <div class="p-4 rounded-xl bg-green-500/5 border border-green-500/10"><strong class="text-white/80">AI Insights</strong><br>Personality, career, love, finance, and karma analysis from your chart.</div>
          </div>
        </section>
        <section>
          <h2 class="font-display text-xl font-bold text-white/90 mb-3"><i class="fas fa-heart text-red-400 mr-2"></i>Our Values</h2>
          <p>We believe in making Vedic astrology accessible, authentic, and respectful. We present dosha analysis without fear-mongering, offer modern interpretations of ancient concepts, and prioritize user privacy. All birth data is processed securely and never shared with third parties.</p>
        </section>
      </div>
    </div>
  `)}\`;
});
</script>`))

// --- MPA Routes: Contact Us ---
app.get('/contact', (c) => c.html(HTML_SHELL({
  title: 'Contact Us',
  description: 'Contact the Cosmic Dharma team for support, feedback, or collaboration inquiries. We would love to hear from you.',
  canonical: SITE_URL + '/contact',
  bodyClass: 'mpa-page',
  jsonLd: `<script type="application/ld+json">{"@context":"https://schema.org","@type":"ContactPage","name":"Contact Cosmic Dharma","description":"Contact page for Cosmic Dharma","url":"${SITE_URL}/contact","publisher":{"@type":"Person","name":"${OWNER_NAME}"}}</script>`
}) + `<script>
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('app').innerHTML = \`${wrapMPAPage('Contact Us', `
    <div class="animate-fade-in">
      <h1 class="font-display text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Contact Us</h1>
      <p class="text-white/40 text-sm mb-8">We would love to hear from you</p>
      <div class="grid md:grid-cols-2 gap-8">
        <div class="glass-card p-8 sm:p-10">
          <h2 class="font-display text-xl font-bold mb-6"><i class="fas fa-paper-plane text-purple-400 mr-2"></i>Send a Message</h2>
          <form class="space-y-5" onsubmit="event.preventDefault();alert('Thank you for your message! We will get back to you soon.')">
            <div>
              <label class="block text-sm font-medium text-white/60 mb-2">Your Name</label>
              <input type="text" class="cosmic-input" placeholder="Enter your name" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-white/60 mb-2">Email Address</label>
              <input type="email" class="cosmic-input" placeholder="your@email.com" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-white/60 mb-2">Subject</label>
              <select class="cosmic-input">
                <option>General Inquiry</option>
                <option>Bug Report</option>
                <option>Feature Request</option>
                <option>Feedback</option>
                <option>Business / Collaboration</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-white/60 mb-2">Message</label>
              <textarea class="cosmic-input" rows="5" placeholder="Write your message here..." required style="resize:vertical"></textarea>
            </div>
            <button type="submit" class="btn-primary w-full py-3"><i class="fas fa-paper-plane mr-2"></i>Send Message</button>
          </form>
        </div>
        <div class="space-y-6">
          <div class="glass-card p-8">
            <h2 class="font-display text-xl font-bold mb-4"><i class="fas fa-info-circle text-cyan-400 mr-2"></i>Get in Touch</h2>
            <div class="space-y-4 text-sm text-white/60">
              <div class="flex items-start gap-3"><i class="fas fa-user text-purple-400 mt-0.5"></i><div><strong class="text-white/80">Owner</strong><br>${OWNER_NAME}</div></div>
              <div class="flex items-start gap-3"><i class="fas fa-globe text-cyan-400 mt-0.5"></i><div><strong class="text-white/80">Website</strong><br>cosmic-dharma.pages.dev</div></div>
              <div class="flex items-start gap-3"><i class="fas fa-code text-green-400 mt-0.5"></i><div><strong class="text-white/80">GitHub</strong><br><a href="https://github.com/dipayancodes/Cosmic-Dharma" target="_blank" class="text-purple-400 hover:text-purple-300 underline">dipayancodes/Cosmic-Dharma</a></div></div>
            </div>
          </div>
          <div class="glass-card p-8">
            <h2 class="font-display text-xl font-bold mb-4"><i class="fas fa-clock text-amber-400 mr-2"></i>Response Time</h2>
            <p class="text-sm text-white/60 leading-relaxed">We aim to respond to all inquiries within 24-48 hours. For urgent matters, please mention "URGENT" in the subject line.</p>
          </div>
          <div class="glass-card p-6 text-center">
            <div class="text-xs text-white/20 p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
              <i class="fas fa-om text-purple-400/40 mr-1"></i>
              Powered by Vedic Sidereal System &middot; Lahiri Ayanamsha
            </div>
          </div>
        </div>
      </div>
    </div>
  `)}\`;
});
</script>`))

// --- Error Pages ---

// 404 Not Found
app.notFound((c) => {
  return c.html(HTML_SHELL({
    title: '404 — Page Not Found',
    description: 'The page you are looking for does not exist. Navigate back to Cosmic Dharma.',
    canonical: SITE_URL
  }) + `<script>
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('app').innerHTML = \`
    ${MPA_NAV}
    <main class="pt-20 min-h-screen flex items-center justify-center px-4">
      <div class="text-center max-w-lg animate-fade-in">
        <div class="text-9xl font-display font-bold bg-gradient-to-b from-purple-400/40 to-transparent bg-clip-text text-transparent mb-6">404</div>
        <h1 class="font-display text-3xl font-bold mb-3">Lost in the Cosmos</h1>
        <p class="text-white/40 mb-8 leading-relaxed">The celestial page you seek has drifted beyond our constellation. Perhaps the stars will guide you home.</p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="/" class="btn-primary py-3 px-8 rounded-xl"><i class="fas fa-home mr-2"></i>Return Home</a>
          <a href="/generate" class="btn-secondary py-3 px-8 rounded-xl"><i class="fas fa-wand-magic-sparkles mr-2"></i>Generate Kundli</a>
        </div>
      </div>
    </main>
    ${MPA_FOOTER}
  \`;
});
</script>`, 404)
})

// 500 Error Handler
app.onError((err, c) => {
  console.error('Server error:', err)
  return c.html(HTML_SHELL({
    title: '500 — Server Error',
    description: 'Something went wrong. Please try again later.',
    canonical: SITE_URL
  }) + `<script>
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('app').innerHTML = \`
    ${MPA_NAV}
    <main class="pt-20 min-h-screen flex items-center justify-center px-4">
      <div class="text-center max-w-lg animate-fade-in">
        <div class="text-9xl font-display font-bold bg-gradient-to-b from-red-400/40 to-transparent bg-clip-text text-transparent mb-6">500</div>
        <h1 class="font-display text-3xl font-bold mb-3">Cosmic Disturbance</h1>
        <p class="text-white/40 mb-8 leading-relaxed">A temporary disturbance in the cosmic field. Our celestial engineers are realigning the stars. Please try again in a moment.</p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="/" class="btn-primary py-3 px-8 rounded-xl"><i class="fas fa-home mr-2"></i>Return Home</a>
          <a href="javascript:location.reload()" class="btn-secondary py-3 px-8 rounded-xl"><i class="fas fa-redo mr-2"></i>Try Again</a>
        </div>
      </div>
    </main>
    ${MPA_FOOTER}
  \`;
});
</script>`, 500)
})

export default app
