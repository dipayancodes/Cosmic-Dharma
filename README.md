# Cosmic Dharma — Premium Vedic Astrology Platform

## Project Overview
- **Name**: Cosmic Dharma
- **Owner**: Dipayan Ghosh
- **Goal**: Modern, premium Vedic astrology web app with fintech-style UI, dark deep-space theme, and AI-powered insights
- **Tech Stack**: Hono + TypeScript + TailwindCSS (CDN) + Cloudflare Pages
- **Astrology Engine**: VSOP87/Meeus algorithms with sidereal Lahiri Ayanamsha and Whole Sign houses

## Live URLs
- **Production**: https://cosmic-dharma.pages.dev
- **GitHub**: https://github.com/dipayancodes/Cosmic-Dharma

## Pages & Routes

### SPA Routes (Client-side rendered)
| Route | Description |
|---|---|
| `/` | Landing page with hero, features, how-it-works, testimonials, pricing, SEO content, FAQ, full footer |
| `/generate` | Kundli generator form with geocoding city search |
| `/dashboard` | Interactive dashboard with 12 analysis tabs |

### MPA Routes (Server-rendered for SEO)
| Route | Description |
|---|---|
| `/privacy` | Privacy Policy page |
| `/terms` | Terms & Conditions page |
| `/about` | About Us — team, mission, technology |
| `/contact` | Contact form with support information |

### API Routes
| Route | Method | Description |
|---|---|---|
| `/api/kundli` | POST | Generate complete Vedic birth chart |
| `/api/charts` | GET | Latest 50 saved charts (requires D1) |
| `/api/geocode` | GET | Global city search via Nominatim/OpenStreetMap |

### Static Assets
| Path | Description |
|---|---|
| `/favicon-96x96.png` | 96x96 PNG favicon |
| `/favicon.svg` | SVG crescent moon icon |
| `/favicon.ico` | ICO favicon |
| `/apple-touch-icon.png` | 180x180 Apple touch icon |
| `/site.webmanifest` | PWA manifest |
| `/static/styles.css` | All CSS styles |
| `/static/app.js` | Main SPA JavaScript |

### Error Pages
| Code | Theme |
|---|---|
| 404 | "Lost in the Cosmos" — cosmic themed not-found page |
| 500 | "Cosmic Disturbance" — server error page |

## Features (Completed)

### Landing Page
- Animated zodiac wheel background with 12 zodiac symbols
- Hero section with gradient tagline "Ancient Wisdom. Modern Clarity."
- "Powered by Vedic Sidereal System · Lahiri Ayanamsha" badge
- 6 feature cards, 3-step "How It Works", testimonials
- **Country/Currency selector** — 10 countries (IN, US, GB, EU, CA, AU, JP, SG, AE, BD) with dynamic pricing
- **600-word SEO content section** about Vedic astrology with keyword-rich text
- **FAQ section** — 21 collapsible questions with accordion interaction
- Full 4-column footer with Platform links, Legal links, Connect, branding

### SEO Implementation
- Per-page meta titles, descriptions, keywords, OG tags, Twitter cards
- Main keyword: "Vedic Astrology" + 14 supporting keywords
- JSON-LD structured data: WebSite schema + FAQPage schema (21 questions)
- Canonical URLs for all pages
- Robots meta tag: index, follow
- Semantic HTML structure

### Favicon & PWA
- favicon-96x96.png, favicon.svg, favicon.ico, apple-touch-icon.png (180x180)
- site.webmanifest with cosmic theme colors
- Complete `<link>` and `<meta>` tags in all pages

### Light Mode
- Gradient background (purple-tinted)
- Enhanced card styling with backdrop-blur and purple shadows
- Strong text contrast (#1e1b4b base)
- Extensive Tailwind utility overrides for visibility

### Branding
- Owner: **Dipayan Ghosh** — credited in footer, about page, contact page, legal pages
- "Powered by Vedic Sidereal System · Lahiri Ayanamsha" — in hero badge, footer, about page

### Kundli Generator (/generate)
- Full birth details form: name, DOB, time, place, gender
- Live geocoding city search via Nominatim/OpenStreetMap API
- Intelligent timezone estimation by country code
- Loading animation with Vedic-themed messaging
- Demo button for instant sample chart

### Vedic Astrology Engine v4.0 (TypeScript)
**Cross-verified against Drik Panchang** — all 9 planets match signs, nakshatras, and Navamsa chart exactly (max deviation: 7 arcminutes).

#### Calculation Methodology
- **Ayanamsha**: Lahiri (Chitra Paksha) — 50+ entry lookup table from Swiss Ephemeris reference values with linear interpolation (0.0" error at all reference dates 1900–2050)
- **Obliquity**: IAU 2006 formula (Lieske)
- **Nutation**: Simplified IAU 4-term with deltaPsi and deltaEps, consistently applied to all bodies
- **Sun**: VSOP87 truncated (Meeus Ch. 25), apparent longitude with aberration + nutation
- **Moon**: Full Meeus Ch. 47 (ELP truncated, 60 terms), with nutation correction for apparent position
- **Planets**: Full Keplerian orbital elements (Meeus), heliocentric→geocentric conversion, perturbation corrections for Jupiter-Saturn Great Inequality and Mars perturbations
- **Nodes**: Rahu/Ketu using **Mean Node** (Meeus Ch. 47 polynomial) — matches Drik Panchang default. Ketu enforced as exactly 180° from Rahu in sidereal and all divisional charts
- **Ascendant**: Full Meeus Ch. 14 formula with apparent sidereal time (GMST + nutation)
- **Houses**: Whole Sign system (classical Jyotish)
- **Nakshatras**: 27 nakshatras with pada, lord, deity
- **Divisional Charts**: All 15 Parashari vargas (D1–D60) with correct ascendants; Rahu-Ketu axis enforced as 6 signs apart in ALL divisional charts
- **Dasha**: Vimshottari Mahadasha + Antardasha with precise nakshatra fractions
- **Doshas**: Mangalik, Kaal Sarp, Pitra with severity and remedies
- **Sade Sati**: Real-time tracker using CURRENT transit Saturn
- **Yogas**: 15+ classical planetary combinations (Pancha Mahapurusha, Gaja Kesari, etc.)
- **Shadbala**: Six-fold planetary strength analysis
- **Ashtakavarga**: SAV + BAV bindu calculations
- **Arudha Padas**: All 12 Arudha Padas + Special Lagnas (Jaimini system)
- **Retrograde Detection**: 2-point derivative method
- **Dignity**: Exalted, Debilitated, Moolatrikona, Own Sign, Friend, Enemy, Neutral
- **Timezone Handling**: Proper UTC conversion with day-rollover support for all timezones (-12 to +14)

#### Accuracy Improvements (v4.0)
1. **Lahiri Ayanamsha**: Replaced polynomial formula with dense lookup table — 0.0" error at all Swiss Ephemeris reference points
2. **Mean Node**: Switched from broken hybrid to pure Mean Node polynomial matching Drik Panchang
3. **Rahu-Ketu Axis**: Enforced exact 180° in sidereal coordinates and all 15 divisional charts
4. **Moon Nutation**: Added nutation in longitude correction (was previously missing)
5. **Mars Perturbations**: Added Jupiter/Saturn perturbation terms from Meeus
6. **Consistent Nutation**: Standardized aberration + nutation corrections across all planets

### Dashboard (/dashboard) — 12 Sections
1. **Overview**: Profile cards, planetary table, quick chart, quick insights
2. **Birth Chart**: North & South Indian styles, clickable planets
3. **Divisional Charts**: All 15 vargas (D1–D60) with per-chart ascendants
4. **Yogas**: Active/inactive yoga analysis with descriptions
5. **Arudha Padas**: All 12 padas + Special Lagnas
6. **Shadbala**: Six-fold strength ranking and breakdown table
7. **Ashtakavarga**: SAV bar chart + BAV planet-wise table
8. **Doshas**: Detection, severity meters, modern explanations, remedies
9. **Sade Sati**: Phase tracker, timeline, recommendations
10. **Dasha**: Visual timeline bar, expandable Antardasha detail
11. **Transits**: 9 planet current positions, retrograde status, daily summary
12. **AI Insights**: Personality, Career, Love, Finance, Karma + 6-dimension strength radar

### UI Features
- Dark cosmic theme (default) + polished light theme with gradient background
- Glassmorphism cards with cosmic shadows
- Hover tooltips on chart planets
- Collapsible sections, FAQ accordion
- Sidebar navigation with profile card
- PDF export with branded header
- Mobile-responsive with hamburger menu
- Smooth page transitions and animations

## Data Architecture
- **Calculation Engine**: Pure TypeScript, no external dependencies (~2100 lines), cross-verified against Drik Panchang
- **Storage**: In-memory (D1 database optional for persistence)
- **Frontend**: Vanilla JS SPA with Tailwind CSS CDN
- **Geocoding**: Nominatim/OpenStreetMap API (no API key needed)
- **Accuracy Tests**: `test-accuracy.ts` (Lahiri verification, multi-country charts, all divisional chart Rahu-Ketu axis) + `verify-drikpanchang.ts` (real-time cross-verification against Drik Panchang)

## Running Tests
```bash
npm test        # Run all 95 tests
npm run test:watch  # Watch mode
```

## Deployment
- **Platform**: Cloudflare Pages
- **Status**: Active
- **Build**: `npm run build` → dist/_worker.js (~107 KB)
- **Last Updated**: 2026-06-27

## Not Yet Implemented
- Google + Email authentication
- MongoDB or D1 database persistence
- SEO-optimized blog
- Pro add-ons: compatibility matching, marriage/career timing, remedies, annual PDF
- Swiss Ephemeris integration (currently uses Meeus approximations)
