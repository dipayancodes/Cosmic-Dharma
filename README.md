# Cosmic Dharma — Premium Vedic Astrology Platform

## Project Overview
- **Name**: Cosmic Dharma
- **Goal**: Modern, premium Vedic astrology web app with fintech-style UI, dark deep-space theme, and AI-powered insights
- **Tech Stack**: Hono + TypeScript + TailwindCSS (CDN) + Cloudflare Pages
- **Astrology Engine**: VSOP87/Meeus algorithms with sidereal Lahiri Ayanamsha and Whole Sign houses

## Live URLs
- **Sandbox**: https://3000-izbyr0e6mghojn1xi0q5g-ad490db5.sandbox.novita.ai

## Features (Completed)

### Landing Page
- Animated zodiac wheel background with 12 zodiac symbols
- Hero section with gradient tagline "Ancient Wisdom. Modern Clarity."
- 6 feature cards, 3-step "How It Works", testimonials, pricing (Free + Pro)

### Kundli Generator (/generate)
- Full birth details form: name, DOB, time, place, gender
- City autocomplete with 42 cities (India, USA, UK, UAE, Japan, etc.)
- Auto-detection of latitude, longitude, and timezone
- Loading animation with Vedic-themed messaging
- Demo button for instant sample chart

### Vedic Astrology Engine (TypeScript)
- **Ayanamsha**: Lahiri (Newcomb precession, IAE standard)
- **Obliquity**: IAU 2006 formula (Lieske)
- **Nutation**: Simplified IAU with deltaPsi and deltaEps
- **Planets**: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn (VSOP87/Meeus)
- **Nodes**: Rahu/Ketu with perturbation corrections
- **Ascendant**: Full Meeus formula with apparent sidereal time
- **Houses**: Whole Sign system (classical Jyotish)
- **Nakshatras**: 27 nakshatras with pada, lord, deity
- **Divisional Charts**: D1, D9 (Navamsa), D10 (Dashamsa), D60 (Shastiamsa)
- **Dasha**: Vimshottari Mahadasha + Antardasha with precise nakshatra fractions
- **Doshas**: Mangalik, Kaal Sarp, Pitra with severity and remedies
- **Sade Sati**: Real-time tracker using CURRENT transit Saturn
- **Retrograde Detection**: 2-point derivative method
- **Dignity**: Exalted, Debilitated, Moolatrikona, Own Sign, Friend, Enemy, Neutral

### Dashboard (/dashboard) — 8 Sections
1. **Overview**: Profile cards (Lagna, Moon, Sun, Nakshatra), planetary table, quick chart, quick insights
2. **Birth Chart**: North & South Indian styles, clickable planets with degree labels
3. **Divisional Charts**: Tabs for D1/D9/D10/D60 with descriptions
4. **Doshas**: Detection, severity meters, modern explanations, remedies
5. **Sade Sati**: Phase tracker, timeline, recommendations
6. **Dasha**: Visual timeline bar, collapsible Antardasha detail
7. **Transits**: 9 planet current positions, retrograde status, daily summary
8. **AI Insights**: Personality, Career, Love, Finance, Karma + 6-dimension strength radar

### UI Features
- Dark cosmic theme (default) + premium light theme (#F8F9FB)
- Glassmorphism (dark only), no glow in light mode
- Hover tooltips on chart planets (sign, degree, nakshatra, house, dignity)
- Collapsible sections in dashboard
- Sidebar navigation with profile card
- PDF export with branded header (print-optimized)
- Mobile-responsive with hamburger menu
- Smooth page transitions and animations
- Skeleton loader CSS ready

### Automated Test Suite (95 tests)
- Julian Day conversion and round-trip
- Lahiri Ayanamsha range and precession
- Obliquity and nutation bounds
- All planet longitude ranges
- Sign, degree, nakshatra, pada math
- Whole Sign house calculations
- D9/D10/D60 divisional chart formulas
- Planetary dignity (exalt/debilitate/moola)
- Retrograde detection
- Full birth chart integration
- Edge cases: midnight, 23:59, leap year, timezone (-8 to +11), southern hemisphere

## API Endpoints

### POST /api/kundli
Generate a complete Vedic birth chart.
```json
{
  "name": "string",
  "year": 1990, "month": 6, "day": 15,
  "hour": 8, "minute": 30,
  "latitude": 19.076, "longitude": 72.8777,
  "timezone": 5.5, "place": "Mumbai, India"
}
```

### GET /api/charts
Returns latest 50 saved charts (requires D1 database).

## Data Architecture
- **Calculation Engine**: Pure TypeScript, no external dependencies
- **Storage**: In-memory (D1 database optional for persistence)
- **Frontend**: Vanilla JS SPA with Tailwind CSS CDN

## Running Tests
```bash
npm test        # Run all 95 tests
npm run test:watch  # Watch mode
```

## Deployment
- **Platform**: Cloudflare Pages
- **Status**: Active
- **Tech Stack**: Hono + TypeScript + TailwindCSS CDN
- **Build**: `npm run build` → dist/_worker.js (56.7 KB)
- **Last Updated**: 2026-03-02

## Not Yet Implemented
- Google Maps API autocomplete (currently uses static city list)
- Google + Email authentication
- MongoDB or D1 database persistence
- SEO-optimized blog
- Pro add-ons: compatibility matching, marriage/career timing, remedies, annual PDF
- Swiss Ephemeris integration (currently uses Meeus approximations)
