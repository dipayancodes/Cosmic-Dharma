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
