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
// Page Routes — SPA serving
// ============================================================

const HTML_SHELL = (title: string, description: string) => `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Cosmic Dharma</title>
  <meta name="description" content="${description}">
  <meta name="theme-color" content="#0a0a1a">
  <meta property="og:title" content="${title} | Cosmic Dharma">
  <meta property="og:description" content="${description}">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌟</text></svg>">
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
              900: '#050510',
              800: '#0a0a1a',
              700: '#0f0f2e',
              600: '#161640',
              500: '#1e1e54',
              400: '#2a2a6e',
              300: '#4a3f8f',
              200: '#7c6bc4',
              100: '#a78bfa',
            },
            neon: {
              blue: '#00d4ff',
              purple: '#a855f7',
              pink: '#ec4899',
              gold: '#f59e0b',
              green: '#10b981',
              cyan: '#06b6d4',
            }
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
</head>
<body class="bg-cosmic-900 text-white font-sans antialiased min-h-screen overflow-x-hidden">
  <div id="app"></div>
  <script src="/static/app.js"></script>
</body>
</html>`

app.get('/', (c) => c.html(HTML_SHELL('Ancient Wisdom. Modern Clarity', 'Premium Vedic astrology platform with AI-powered insights. Generate your Kundli, explore birth charts, and discover your cosmic blueprint.')))
app.get('/generate', (c) => c.html(HTML_SHELL('Generate Your Kundli', 'Create your personalized Vedic birth chart with detailed planetary analysis.')))
app.get('/dashboard', (c) => c.html(HTML_SHELL('Your Cosmic Dashboard', 'Explore your complete Vedic birth chart with interactive charts and AI insights.')))
app.get('/dashboard/*', (c) => c.html(HTML_SHELL('Dashboard', 'Cosmic Dharma Dashboard')))

export default app
