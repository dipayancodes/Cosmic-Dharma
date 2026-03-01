# Cosmic Dharma — Premium Vedic Astrology Platform

## Project Overview
- **Name**: Cosmic Dharma
- **Goal**: A modern, premium Vedic astrology web application that feels like a fintech/AI dashboard — not a traditional astrology website.
- **Design Philosophy**: TradingView + Apple UI + Spiritual luxury brand. Deep space cosmic theme with neon accents, glassmorphism cards, and smooth animations.
- **Tech Stack**: Hono (Edge Runtime) + TypeScript + TailwindCSS + Cloudflare Pages

## Live URLs
- **Sandbox**: https://3000-izbyr0e6mghojn1xi0q5g-ad490db5.sandbox.novita.ai
- **Landing Page**: `/`
- **Kundli Generator**: `/generate`
- **Dashboard**: `/dashboard`
- **API**: `/api/kundli` (POST)

## Completed Features

### 1. Landing Page
- ✅ Animated zodiac constellation wheel background
- ✅ Hero section with "Ancient Wisdom. Modern Clarity." tagline
- ✅ CTA: Generate Your Kundli
- ✅ Features section explaining Vedic astrology in modern way
- ✅ How It Works (3-step process)
- ✅ Testimonials section
- ✅ Pricing section (Free + Pro tiers)
- ✅ Footer with social links

### 2. Kundli Generator
- ✅ Full Name input
- ✅ Date of Birth picker
- ✅ Exact Time of Birth input
- ✅ Birth Place with autocomplete (42 cities worldwide)
- ✅ Gender (optional)
- ✅ Loading animation with calculation status
- ✅ Demo chart button for quick testing

### 3. Vedic Astrology Engine (Sidereal · Lahiri Ayanamsha)
- ✅ Lahiri Ayanamsha calculation
- ✅ Julian Day Number conversion
- ✅ Planetary longitude calculations (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn)
- ✅ Rahu/Ketu (Mean Lunar Nodes)
- ✅ Sidereal position conversion
- ✅ Ascendant (Lagna) calculation with local sidereal time
- ✅ Equal house system
- ✅ Nakshatra determination (27 nakshatras with pada)
- ✅ Retrograde detection
- ✅ Planetary dignity (Exalted, Debilitated, Own Sign, Moolatrikona)
- ✅ Navamsa (D9) calculation
- ✅ Dashamsa (D10) calculation
- ✅ Shastiamsa (D60) calculation
- ✅ Vimshottari Dasha system (Mahadasha + Antardasha)

### 4. Dashboard Features

#### A. Overview Panel
- ✅ Ascendant (Lagna) with degree and nakshatra
- ✅ Moon Sign (Rashi)
- ✅ Sun Sign
- ✅ Birth Nakshatra with pada and lord
- ✅ Complete planetary positions table
- ✅ Quick birth chart preview
- ✅ Quick insights (doshas, sade sati, current dasha)

#### B. Interactive Birth Chart
- ✅ North Indian style diamond chart
- ✅ South Indian style grid chart
- ✅ Toggle between styles
- ✅ Clickable planets
- ✅ Planet detail panel (longitude, nakshatra, dignity, divisional positions)

#### C. Divisional Charts
- ✅ D1 (Rashi) — Main birth chart
- ✅ D9 (Navamsa) — Marriage/Soul purpose
- ✅ D10 (Dashamsa) — Career
- ✅ D60 (Shastiamsa) — Past life karma
- ✅ Chart switcher tabs with smooth transitions
- ✅ Both North/South Indian rendering for all charts
- ✅ Planet position table per divisional chart

#### D. Dosha Analysis
- ✅ Mangalik Dosha detection (Mars in 1,2,4,7,8,12 houses)
- ✅ Kaal Sarp Dosha detection (all planets between Rahu-Ketu)
- ✅ Pitra Dosha detection (Sun-Rahu proximity)
- ✅ Severity level meter (0-100%)
- ✅ Modern, non-fear-based explanations
- ✅ Personalized remedies for each dosha

#### E. Sade Sati Tracker
- ✅ Active/Inactive status detection
- ✅ Phase detection (Rising/Peak/Setting)
- ✅ Timeline progress bar
- ✅ Start and end date estimation
- ✅ Phase visualization
- ✅ Detailed effects summary per phase
- ✅ Recommendations and remedies

#### F. Vimshottari Dasha System
- ✅ Complete Mahadasha table (all 9 periods)
- ✅ Current Mahadasha highlighted
- ✅ Antardasha sub-periods for each Mahadasha
- ✅ Visual timeline bar with proportional widths
- ✅ Current Antardasha highlighted
- ✅ Expandable rows for detailed view

#### G. Planetary Transits
- ✅ Current transit positions for all 9 planets
- ✅ Retrograde status indication
- ✅ Personalized transit effects
- ✅ Today's cosmic summary

#### H. AI Insight Engine
- ✅ Personality Profile analysis
- ✅ Career & Purpose guidance
- ✅ Love & Relationships insights
- ✅ Financial Potential analysis
- ✅ Karma & Dharma interpretation
- ✅ Strength/Weakness radar chart (6 dimensions)

### 5. UX & Design
- ✅ Dark cosmic theme (midnight blue, deep purple, neon accents)
- ✅ Animated star background
- ✅ Glassmorphism cards throughout
- ✅ Smooth page transitions
- ✅ Dashboard sidebar navigation
- ✅ Light mode toggle
- ✅ Mobile responsive
- ✅ Print/PDF download support
- ✅ Premium typography (Inter + Space Grotesk)
- ✅ Neon glow effects on planets
- ✅ Gradient buttons with shine animation
- ✅ SEO optimized meta tags

### 6. API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/kundli` | Generate full Vedic birth chart |
| GET | `/api/charts` | Get saved charts (requires D1) |

### 7. API Request Body (POST /api/kundli)
```json
{
  "name": "Full Name",
  "year": 1990,
  "month": 6,
  "day": 15,
  "hour": 8,
  "minute": 30,
  "latitude": 19.076,
  "longitude": 72.8777,
  "timezone": 5.5,
  "place": "Mumbai, India"
}
```

## Data Architecture
- **Calculation Engine**: Pure TypeScript — no external dependencies
- **Storage**: Cloudflare D1 (optional, for saving charts)
- **State Management**: Client-side SPA state

## Pro Features (Coming Soon)
- 🔜 Detailed compatibility matching (Kundli Milan)
- 🔜 Marriage timing prediction
- 🔜 Career timing prediction
- 🔜 Personalized remedies engine
- 🔜 Annual horoscope report PDF
- 🔜 Google/Email authentication
- 🔜 Blog section for astrology content
- 🔜 Shareable public chart links

## Deployment
- **Platform**: Cloudflare Pages
- **Status**: ✅ Active (Development)
- **Build**: `npm run build` → `dist/`
- **Deploy**: `npm run deploy:prod`

## Project Structure
```
webapp/
├── src/
│   ├── index.tsx          # Hono app with routes & API
│   └── lib/
│       └── vedic-engine.ts # Complete Vedic astrology engine
├── public/static/
│   ├── app.js             # Full SPA frontend
│   └── styles.css         # Cosmic theme styles
├── ecosystem.config.cjs   # PM2 config
├── wrangler.jsonc         # Cloudflare config
├── vite.config.ts         # Build config
├── tsconfig.json          # TypeScript config
└── package.json
```
