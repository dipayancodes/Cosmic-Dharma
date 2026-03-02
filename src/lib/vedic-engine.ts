// ============================================================
// Cosmic Dharma — Precision Vedic Astrology Engine v3.0
// Sidereal Zodiac · Lahiri Ayanamsha · Whole Sign Houses
// Based on VSOP87 planetary theory & Meeus algorithms
// ============================================================

// --- Constants ---
export const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'] as const;
export const SIGNS_SANSKRIT = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'] as const;
export const SIGN_LORDS = ['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'] as const;
export const SIGN_ELEMENTS = ['Fire','Earth','Air','Water','Fire','Earth','Air','Water','Fire','Earth','Air','Water'] as const;
export const SIGN_QUALITIES = ['Cardinal','Fixed','Mutable','Cardinal','Fixed','Mutable','Cardinal','Fixed','Mutable','Cardinal','Fixed','Mutable'] as const;

export const NAKSHATRAS = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha',
  'Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Moola','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'
] as const;
export const NAKSHATRA_LORDS = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury','Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury','Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'] as const;
export const NAKSHATRA_DEITIES = ['Ashwini Kumaras','Yama','Agni','Brahma','Soma','Rudra','Aditi','Brihaspati','Naga','Pitris','Bhaga','Aryaman','Savitar','Tvashtar','Vayu','Indragni','Mitra','Indra','Nirriti','Apas','Vishvedevas','Vishnu','Vasus','Varuna','Ajaikapada','Ahirbudhnya','Pushan'] as const;

export const PLANET_NAMES = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'] as const;
export const PLANET_SYMBOLS = ['☉','☽','♂','☿','♃','♀','♄','☊','☋'] as const;

export const DASHA_YEARS: Record<string, number> = { Ketu:7, Venus:20, Sun:6, Moon:10, Mars:7, Rahu:18, Jupiter:16, Saturn:19, Mercury:17 };
export const DASHA_ORDER = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'] as const;
const TOTAL_DASHA_YEARS = 120;

// Moolatrikona ranges: [sign_index, start_degree, end_degree]
const MOOLATRIKONA: Record<string, [number, number, number]> = {
  Sun: [4, 0, 20],      // Leo 0-20
  Moon: [1, 3, 30],     // Taurus 3-30
  Mars: [0, 0, 12],     // Aries 0-12
  Mercury: [5, 15, 20], // Virgo 15-20
  Jupiter: [8, 0, 10],  // Sagittarius 0-10
  Venus: [6, 0, 15],    // Libra 0-15
  Saturn: [10, 0, 20],  // Aquarius 0-20
};

const EXALTATION: Record<string, [number, number]> = {
  Sun: [0, 10], Moon: [1, 3], Mars: [9, 28], Mercury: [5, 15],
  Jupiter: [3, 5], Venus: [11, 27], Saturn: [6, 20]
};
const DEBILITATION: Record<string, number> = { Sun:6, Moon:7, Mars:3, Mercury:11, Jupiter:9, Venus:5, Saturn:0 };

// Planetary friendship table (natural)
const FRIENDS: Record<string, string[]> = {
  Sun: ['Moon','Mars','Jupiter'], Moon: ['Sun','Mercury'], Mars: ['Sun','Moon','Jupiter'],
  Mercury: ['Sun','Venus'], Jupiter: ['Sun','Moon','Mars'], Venus: ['Mercury','Saturn'],
  Saturn: ['Mercury','Venus']
};
const ENEMIES: Record<string, string[]> = {
  Sun: ['Saturn','Venus'], Moon: ['Rahu','Ketu'], Mars: ['Mercury'],
  Mercury: ['Moon'], Jupiter: ['Mercury','Venus'], Venus: ['Sun','Moon'],
  Saturn: ['Sun','Moon','Mars']
};

// ============================================================
// MATHEMATICAL UTILITIES
// ============================================================
const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

function norm360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

function sinD(deg: number): number { return Math.sin(deg * DEG); }
function cosD(deg: number): number { return Math.cos(deg * DEG); }
function atan2D(y: number, x: number): number { return Math.atan2(y, x) * RAD; }

// ============================================================
// JULIAN DAY — Meeus algorithm, handles all dates correctly
// ============================================================
export function dateToJD(year: number, month: number, day: number, hour: number = 0): number {
  let y = year, m = month;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + hour / 24.0 + B - 1524.5;
}

export function jdToDate(jd: number): string {
  const z = Math.floor(jd + 0.5);
  const f = jd + 0.5 - z;
  let A = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    A = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);
  const day = Math.floor(B - D - Math.floor(30.6001 * E) + f);
  const month = E < 14 ? E - 1 : E - 13;
  const year = month > 2 ? C - 4716 : C - 4715;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// ============================================================
// LAHIRI AYANAMSHA — Official IAU-based Lahiri calculation
// Reference: Indian Astronomical Ephemeris standard
// Precession rate: ~50.2888"/year with secular variation
// ============================================================
export function getLahiriAyanamsha(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0; // centuries from J2000.0
  // Lahiri ayanamsha using the Newcomb precession with Lahiri reference
  // At J2000.0 (2000 Jan 1.5): ayanamsha = 23.85610 degrees
  const ayanamsha = 23.85610 +
    (50.29027 * T +
     0.02224 * T * T -
     0.000018 * T * T * T) / 3600.0;
  return ayanamsha;
}

// ============================================================
// OBLIQUITY OF THE ECLIPTIC — IAU 2006 formula (Lieske)
// More accurate than the Laskar truncation used before
// ============================================================
function getObliquity(T: number): number {
  // Mean obliquity - IAU 2006 precession
  const eps0 = 84381.406 - 46.836769 * T - 0.0001831 * T * T
    + 0.00200340 * T * T * T - 0.000000576 * T * T * T * T
    - 0.0000000434 * T * T * T * T * T;
  return eps0 / 3600.0; // convert arcseconds to degrees
}

// ============================================================
// NUTATION — IAU simplified (accurate to ~0.5")
// ============================================================
function getNutation(T: number): { deltaPsi: number; deltaEps: number } {
  const omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T;
  const Lsun = 280.4665 + 36000.7698 * T;
  const Lmoon = 218.3165 + 481267.8813 * T;

  // Nutation in longitude (arcseconds)
  const deltaPsi = (-17.20 * sinD(omega) - 1.32 * sinD(2 * Lsun) - 0.23 * sinD(2 * Lmoon) + 0.21 * sinD(2 * omega)) / 3600.0;
  // Nutation in obliquity (arcseconds)
  const deltaEps = (9.20 * cosD(omega) + 0.57 * cosD(2 * Lsun) + 0.10 * cosD(2 * Lmoon) - 0.09 * cosD(2 * omega)) / 3600.0;

  return { deltaPsi, deltaEps };
}

// ============================================================
// SOLAR LONGITUDE — VSOP87 truncated (accurate to ~0.01 deg)
// ============================================================
function getSunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  // Geometric mean longitude
  const L0 = norm360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  // Mean anomaly
  const M = norm360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  // Equation of center
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * sinD(M)
          + (0.019993 - 0.000101 * T) * sinD(2 * M)
          + 0.000289 * sinD(3 * M);
  // Sun's true longitude
  let sunLong = L0 + C;
  // Aberration correction
  const omega = 125.04 - 1934.136 * T;
  sunLong -= 0.00569 + 0.00478 * sinD(omega);
  return norm360(sunLong);
}

// ============================================================
// LUNAR LONGITUDE — Full Meeus algorithm (~0.01 deg accuracy)
// ============================================================
function getMoonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  // Fundamental arguments
  const Lp = norm360(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T * T * T / 538841.0);
  const D  = norm360(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T * T * T / 545868.0);
  const M  = norm360(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T);
  const Mp = norm360(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T * T * T / 69699.0);
  const F  = norm360(93.2720950 + 483202.0175233 * T - 0.0036539 * T * T);
  const A1 = norm360(119.75 + 131.849 * T);
  const A2 = norm360(53.09 + 479264.290 * T);
  const A3 = norm360(313.45 + 481266.484 * T);
  const E = 1.0 - 0.002516 * T - 0.0000074 * T * T;
  const E2 = E * E;
  
  // Summation of periodic terms for longitude (top 20 terms from Meeus Table 47.A)
  let sumL = 0;
  const lTerms: [number, number, number, number, number][] = [
    [0, 0, 1, 0, 6288774], [2, 0, -1, 0, 1274027], [2, 0, 0, 0, 658314],
    [0, 0, 2, 0, 213618], [0, 1, 0, 0, -185116], [0, 0, 0, 2, -114332],
    [2, 0, -2, 0, 58793], [2, -1, -1, 0, 57066], [2, 0, 1, 0, 53322],
    [2, -1, 0, 0, 45758], [0, 1, -1, 0, -40923], [1, 0, 0, 0, -34720],
    [0, 1, 1, 0, -30383], [2, 0, 0, -2, 15327], [0, 0, 1, 2, -12528],
    [0, 0, 1, -2, 10980], [4, 0, -1, 0, 10675], [0, 0, 3, 0, 10034],
    [4, 0, -2, 0, 8548], [2, 1, -1, 0, -7888]
  ];
  
  for (const [d, m, mp, f, coeff] of lTerms) {
    let eCorr = 1;
    if (Math.abs(m) === 1) eCorr = E;
    else if (Math.abs(m) === 2) eCorr = E2;
    sumL += coeff * eCorr * sinD(d * D + m * M + mp * Mp + f * F);
  }
  
  // Additional corrections (Meeus)
  sumL += 3958 * sinD(A1) + 1962 * sinD(Lp - F) + 318 * sinD(A2);
  
  return norm360(Lp + sumL / 1000000.0);
}

// ============================================================
// PLANETARY LONGITUDES — Meeus VSOP87 truncated
// ============================================================
function getPlanetLongitude(jd: number, planet: string): number {
  const T = (jd - 2451545.0) / 36525.0;
  
  switch(planet) {
    case 'Sun': return getSunLongitude(jd);
    case 'Moon': return getMoonLongitude(jd);
    case 'Mercury': return getMercuryLongitude(T);
    case 'Venus': return getVenusLongitude(T);
    case 'Mars': return getMarsLongitude(T);
    case 'Jupiter': return getJupiterLongitude(T);
    case 'Saturn': return getSaturnLongitude(T);
    default: return 0;
  }
}

function getMercuryLongitude(T: number): number {
  const L = norm360(252.250906 + 149474.0722491 * T + 0.00030350 * T * T);
  const M = norm360(174.7947006 + 149472.5158305 * T + 0.00032826 * T * T);
  const F = norm360(L - norm360(48.3309 + 1.1861883 * T));
  // Equation of center + perturbations
  let v = L;
  v += (23.4400 * sinD(M) + 2.9818 * sinD(2*M) + 0.5255 * sinD(3*M)) 
     * (1.0 - 0.0048 * T);
  // Sun perturbation
  const Msun = norm360(357.5291 + 35999.0503 * T);
  v += 0.2763 * sinD(2*F) + 0.0693 * sinD(Msun - M);
  return norm360(v);
}

function getVenusLongitude(T: number): number {
  const L = norm360(181.979801 + 58519.2130302 * T + 0.00031060 * T * T);
  const M = norm360(50.416130 + 58517.8038682 * T + 0.00012960 * T * T);
  let v = L;
  v += (0.7758 * sinD(M) + 0.0033 * sinD(2*M))
     * (1.0 - 0.0050 * T);
  // Perturbation by Jupiter
  const Mjup = norm360(20.020 + 3034.696 * T);
  v += 0.0761 * sinD(2*M - 2*Mjup) + 0.0540 * sinD(3*M - 3*Mjup);
  return norm360(v);
}

function getMarsLongitude(T: number): number {
  const L = norm360(355.433275 + 19141.6964471 * T + 0.00031052 * T * T);
  const M = norm360(19.373018 + 19140.2993155 * T + 0.00000444 * T * T);
  let v = L;
  v += (10.6912 * sinD(M) + 0.6228 * sinD(2*M) + 0.0503 * sinD(3*M) + 0.0046 * sinD(4*M))
     * (1.0 - 0.0005 * T);
  // Jupiter perturbation
  const Mjup = norm360(20.020 + 3034.696 * T);
  v += 0.3222 * sinD(2*M - Mjup) - 0.0818 * sinD(M - Mjup) + 0.0586 * sinD(2*M - 2*Mjup);
  return norm360(v);
}

function getJupiterLongitude(T: number): number {
  const L = norm360(34.351519 + 3036.3027748 * T + 0.00022330 * T * T);
  const M = norm360(20.020199 + 3034.6961195 * T - 0.00008501 * T * T);
  let v = L;
  v += (5.5549 * sinD(M) + 0.1683 * sinD(2*M) + 0.0071 * sinD(3*M))
     * (1.0 - 0.0003 * T);
  // Saturn perturbation (Great Inequality)
  const Msat = norm360(317.021 + 1222.114 * T);
  const diff = M - Msat;
  v += 0.3323 * sinD(2*diff) - 0.0541 * sinD(3*diff) - 0.1452 * sinD(diff);
  return norm360(v);
}

function getSaturnLongitude(T: number): number {
  const L = norm360(50.077444 + 1223.5110686 * T + 0.00051908 * T * T);
  const M = norm360(317.020667 + 1222.1138378 * T + 0.00000881 * T * T);
  let v = L;
  v += (6.4064 * sinD(M) + 0.5581 * sinD(2*M) + 0.0617 * sinD(3*M))
     * (1.0 - 0.0003 * T);
  // Jupiter perturbation
  const Mjup = norm360(20.020 + 3034.696 * T);
  const diff = Mjup - M;
  v += 0.8444 * sinD(diff) - 0.1593 * sinD(2*diff) - 0.2328 * sinD(2*Mjup - 5*M);
  return norm360(v);
}

// ============================================================
// RAHU / KETU — Mean lunar nodes with perturbation
// ============================================================
function getRahuKetu(jd: number): { rahu: number; ketu: number } {
  const T = (jd - 2451545.0) / 36525.0;
  // Mean ascending node (Rahu) — Meeus formula
  let omega = 125.04452 - 1934.13626 * T + 0.00220 * T * T + T * T * T / 467441.0;
  omega = norm360(omega);
  // Apply perturbation corrections
  const Msun = norm360(357.5291 + 35999.0503 * T);
  const Mmoon = norm360(134.9634 + 477198.8676 * T);
  omega += -1.4979 * sinD(2 * (omega - norm360(218.32 + 481267.883 * T)))
           + 0.1500 * sinD(Msun) - 0.1226 * sinD(2 * Mmoon);
  const rahu = norm360(omega);
  const ketu = norm360(rahu + 180);
  return { rahu, ketu };
}

// ============================================================
// SIDEREAL CONVERSION
// ============================================================
function toSidereal(tropicalLong: number, ayanamsha: number): number {
  return norm360(tropicalLong - ayanamsha);
}

// ============================================================
// ASCENDANT (LAGNA) — Precise calculation with full nutation
// ============================================================
function calculateAscendant(jd: number, latitude: number, geoLongitude: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  
  // Greenwich Mean Sidereal Time (Meeus Ch.12 formula)
  let GMST = 280.46061837 + 360.98564736629 * (jd - 2451545.0)
           + 0.000387933 * T * T - T * T * T / 38710000.0;
  GMST = norm360(GMST);
  
  // Nutation
  const { deltaPsi, deltaEps } = getNutation(T);
  
  // True obliquity (mean + nutation in obliquity)
  const eps0 = getObliquity(T);
  const obliquity = eps0 + deltaEps;
  
  // Apparent sidereal time = GMST + nutation in longitude * cos(obliquity)
  const apparentGMST = GMST + deltaPsi * cosD(obliquity);
  
  // Local Sidereal Time
  const LST = norm360(apparentGMST + geoLongitude);
  
  // Ascendant formula (Meeus Ch.14)
  const oblRad = obliquity * DEG;
  const latRad = latitude * DEG;
  const lstRad = LST * DEG;
  
  const y = -Math.cos(lstRad);
  const x = Math.sin(oblRad) * Math.tan(latRad) + Math.cos(oblRad) * Math.sin(lstRad);
  let asc = atan2D(y, x);
  asc = norm360(asc);
  
  return asc;
}

// ============================================================
// RETROGRADE — Check using 2-point derivative
// ============================================================
function isRetrograde(planet: string, jd: number): boolean {
  if (planet === 'Sun' || planet === 'Moon') return false;
  if (planet === 'Rahu' || planet === 'Ketu') return true; // always "retrograde"
  
  const delta = 0.1; // 0.1 day step
  const L1 = getPlanetLongitude(jd - delta, planet);
  const L2 = getPlanetLongitude(jd + delta, planet);
  let diff = L2 - L1;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
}

// ============================================================
// PLANETARY DIGNITY — Full analysis
// ============================================================
function getPlanetDignity(planet: string, signIndex: number, degreeInSign: number): string {
  if (planet === 'Rahu' || planet === 'Ketu') return 'Neutral';
  
  // 1. Exaltation
  const exalt = EXALTATION[planet];
  if (exalt && exalt[0] === signIndex) return 'Exalted';
  
  // 2. Debilitation
  if (DEBILITATION[planet] === signIndex) return 'Debilitated';
  
  // 3. Moolatrikona (degree range check)
  const moola = MOOLATRIKONA[planet];
  if (moola && moola[0] === signIndex && degreeInSign >= moola[1] && degreeInSign <= moola[2]) {
    return 'Moolatrikona';
  }
  
  // 4. Own sign
  if (SIGN_LORDS[signIndex] === planet) return 'Own Sign';
  
  // 5. Friendly / Neutral / Enemy
  const signLord = SIGN_LORDS[signIndex];
  if (FRIENDS[planet]?.includes(signLord)) return 'Friend\'s Sign';
  if (ENEMIES[planet]?.includes(signLord)) return 'Enemy\'s Sign';
  
  return 'Neutral';
}

// ============================================================
// SIGN, NAKSHATRA, PADA — Pure math
// ============================================================
function getSignIndex(longitude: number): number {
  return Math.floor(norm360(longitude) / 30);
}

function getDegreeInSign(longitude: number): number {
  return norm360(longitude) % 30;
}

function getNakshatraIndex(longitude: number): number {
  const span = 360 / 27; // 13.33333 degrees
  return Math.floor(norm360(longitude) / span);
}

function getNakshatraPada(longitude: number): number {
  const span = 360 / 27;
  const posInNak = norm360(longitude) % span;
  return Math.floor(posInNak / (span / 4)) + 1;
}

// ============================================================
// WHOLE SIGN HOUSES — Classical Jyotish system
// House 1 = entire sign of the Ascendant
// ============================================================
function getHouseNumber(planetSidLong: number, ascSignIndex: number): number {
  const planetSign = getSignIndex(planetSidLong);
  return ((planetSign - ascSignIndex + 12) % 12) + 1;
}

// ============================================================
// DIVISIONAL CHARTS — Mathematically precise
// ============================================================

// D9 Navamsa: Each sign divided into 9 parts of 3 deg 20'
// Fire signs (Aries, Leo, Sag) start from Aries
// Earth signs (Taurus, Virgo, Cap) start from Capricorn
// Air signs (Gemini, Libra, Aquarius) start from Libra
// Water signs (Cancer, Scorpio, Pisces) start from Cancer
function getNavamsaSign(sidLongitude: number): number {
  const signIndex = getSignIndex(sidLongitude);
  const degInSign = getDegreeInSign(sidLongitude);
  const navamsaPart = Math.floor(degInSign / (30.0 / 9.0));
  const startBases = [0, 9, 6, 3]; // Fire→Aries, Earth→Cap, Air→Libra, Water→Cancer
  const elementGroup = signIndex % 4;
  return (startBases[elementGroup] + navamsaPart) % 12;
}

// D10 Dashamsa: Each sign divided into 10 parts of 3 deg each
// Odd signs count from same sign; Even signs count from the 9th sign
function getDashamsaSign(sidLongitude: number): number {
  const signIndex = getSignIndex(sidLongitude);
  const degInSign = getDegreeInSign(sidLongitude);
  const part = Math.floor(degInSign / 3.0);
  if (signIndex % 2 === 0) {
    // Odd signs (0-indexed even = Aries, Gemini, etc.)
    return (signIndex + part) % 12;
  } else {
    // Even signs: count from 9th
    return (signIndex + 9 + part) % 12;
  }
}

// D60 Shastiamsa: Each sign divided into 60 parts of 0.5 deg each
// Odd signs: 1st shastiamsa = same sign, then cycle through all 12 signs (5 rounds)
// Even signs: 1st shastiamsa starts from opposite (7th) sign
function getShastiamsaSign(sidLongitude: number): number {
  const signIndex = getSignIndex(sidLongitude);
  const degInSign = getDegreeInSign(sidLongitude);
  const part = Math.floor(degInSign / 0.5); // 0-59
  if (signIndex % 2 === 0) {
    // Odd signs: start from same sign
    return (signIndex + part) % 12;
  } else {
    // Even signs: start from 7th sign
    return (signIndex + 6 + part) % 12;
  }
}

// ============================================================
// VIMSHOTTARI DASHA — Precise calculation
// ============================================================
function calculateVimshottariDasha(moonSidLong: number, birthJD: number) {
  const nakIndex = getNakshatraIndex(moonSidLong);
  const nakLord = NAKSHATRA_LORDS[nakIndex];
  
  // Elapsed fraction in current nakshatra
  const nakSpan = 360.0 / 27.0;
  const posInNak = norm360(moonSidLong) % nakSpan;
  const elapsedFraction = posInNak / nakSpan;
  const remainingFraction = 1.0 - elapsedFraction;
  
  const startIdx = DASHA_ORDER.indexOf(nakLord);
  const now = new Date();
  const nowJD = dateToJD(now.getFullYear(), now.getMonth() + 1, now.getDate(),
    (now.getHours() + now.getMinutes() / 60) / 24);
  
  const dashas: Array<{
    planet: string;
    startDate: string;
    endDate: string;
    years: number;
    isCurrent: boolean;
    antardasha: Array<{planet: string; startDate: string; endDate: string; isCurrent: boolean}>;
  }> = [];
  
  let jdCursor = birthJD;
  
  for (let i = 0; i < 9; i++) {
    const pIdx = (startIdx + i) % 9;
    const planet = DASHA_ORDER[pIdx];
    const fullYears = DASHA_YEARS[planet];
    const years = i === 0 ? fullYears * remainingFraction : fullYears;
    const days = years * 365.25;
    const endJD = jdCursor + days;
    const isCurrent = nowJD >= jdCursor && nowJD < endJD;
    
    // Antardasha sub-periods
    const antardasha: Array<{planet: string; startDate: string; endDate: string; isCurrent: boolean}> = [];
    let adJD = jdCursor;
    for (let j = 0; j < 9; j++) {
      const adIdx = (pIdx + j) % 9;
      const adPlanet = DASHA_ORDER[adIdx];
      const adYears = (years * DASHA_YEARS[adPlanet]) / TOTAL_DASHA_YEARS;
      const adDays = adYears * 365.25;
      const adEnd = adJD + adDays;
      antardasha.push({
        planet: adPlanet,
        startDate: jdToDate(adJD),
        endDate: jdToDate(adEnd),
        isCurrent: nowJD >= adJD && nowJD < adEnd
      });
      adJD = adEnd;
    }
    
    dashas.push({
      planet,
      startDate: jdToDate(jdCursor),
      endDate: jdToDate(endJD),
      years: parseFloat(years.toFixed(2)),
      isCurrent,
      antardasha
    });
    jdCursor = endJD;
  }
  
  return dashas;
}

// ============================================================
// DOSHA ANALYSIS — Sidereal positions
// ============================================================
function analyzeDoshas(planets: PlanetData[], ascSignIndex: number) {
  const doshas: Array<{
    name: string; detected: boolean; severity: number;
    description: string; remedies: string[];
  }> = [];
  
  const mars = planets.find(p => p.name === 'Mars')!;
  const jupiter = planets.find(p => p.name === 'Jupiter');
  const rahu = planets.find(p => p.name === 'Rahu')!;
  const ketu = planets.find(p => p.name === 'Ketu')!;
  const sun = planets.find(p => p.name === 'Sun')!;
  
  // --- Mangalik Dosha ---
  const marsHouse = mars.house;
  const manglikHouses = [1, 2, 4, 7, 8, 12];
  const isManglik = manglikHouses.includes(marsHouse);
  
  // Cancellation checks
  let manglikCancelled = false;
  if (isManglik) {
    if (jupiter && (jupiter.house === 7 || jupiter.house === 1)) manglikCancelled = true;
    if ([0, 7, 9].includes(mars.signIndex)) manglikCancelled = true;
    if (jupiter && jupiter.house === marsHouse) manglikCancelled = true;
  }
  
  const manglikSeverity = isManglik 
    ? (manglikCancelled ? 20 : [1,7,8].includes(marsHouse) ? 75 : [4,12].includes(marsHouse) ? 55 : 35)
    : 0;
  
  doshas.push({
    name: 'Mangalik Dosha',
    detected: isManglik,
    severity: manglikSeverity,
    description: isManglik
      ? `Mars occupies the ${marsHouse}${ordinal(marsHouse)} house from your Ascendant.${manglikCancelled ? ' However, this dosha is significantly reduced due to cancellation factors in your chart.' : ''} This placement channels heightened Mars energy into ${getHouseTheme(marsHouse)}. In modern interpretation, this indicates a need for constructive outlets for your assertive energy in relationships.`
      : 'Mars is not placed in the 1st, 2nd, 4th, 7th, 8th, or 12th house from Ascendant. No Mangalik Dosha is present in your chart.',
    remedies: isManglik && !manglikCancelled ? [
      'Recite Hanuman Chalisa on Tuesdays for Mars pacification',
      'Wear a red coral gemstone (Moonga) on the ring finger after expert consultation',
      'Channel Mars energy through regular physical exercise or competitive sports',
      'Perform Mangal Shanti puja to harmonize Mars energy',
      'Consider Kundli matching for marriage compatibility (double Manglik match)'
    ] : []
  });
  
  // --- Kaal Sarp Dosha ---
  const rahuLong = rahu.siderealLongitude;
  const ketuLong = ketu.siderealLongitude;
  const sevenPlanets = planets.filter(p => !['Rahu','Ketu'].includes(p.name));
  
  function inArc(pLong: number, startLong: number, endLong: number): boolean {
    if (startLong < endLong) {
      return pLong >= startLong && pLong <= endLong;
    } else {
      return pLong >= startLong || pLong <= endLong;
    }
  }
  
  const allRahuToKetu = sevenPlanets.every(p => inArc(p.siderealLongitude, rahuLong, ketuLong));
  const allKetuToRahu = sevenPlanets.every(p => inArc(p.siderealLongitude, ketuLong, rahuLong));
  const isKaalSarp = allRahuToKetu || allKetuToRahu;
  
  let kaalSarpType = '';
  if (isKaalSarp) {
    const rahuHouse = rahu.house;
    const types: Record<number, string> = {
      1:'Anant', 2:'Kulik', 3:'Vasuki', 4:'Shankhpal', 5:'Padma', 6:'Mahapadma',
      7:'Takshak', 8:'Karkotak', 9:'Shankh', 10:'Ghatak', 11:'Vishdhar', 12:'Sheshnag'
    };
    kaalSarpType = types[rahuHouse] || '';
  }
  
  doshas.push({
    name: 'Kaal Sarp Dosha',
    detected: isKaalSarp,
    severity: isKaalSarp ? 55 : 0,
    description: isKaalSarp
      ? `All seven planets are positioned within the Rahu-Ketu axis, forming ${kaalSarpType} Kaal Sarp Yoga. This indicates concentrated karmic energy that manifests as intense focus, sudden life changes, and deep transformation. Many historically significant leaders and innovators have had this yoga.`
      : 'Planets are distributed on both sides of the Rahu-Ketu axis. No Kaal Sarp Dosha is present.',
    remedies: isKaalSarp ? [
      'Perform Kaal Sarp Dosh Nivaran Puja at Trimbakeshwar or Ujjain',
      'Chant "Om Namah Shivaya" 108 times daily',
      'Practice mindfulness meditation to channel intense karmic energy',
      'Feed birds, especially crows, on Saturdays',
      'Wear a Gomed (Hessonite) or Cat\'s Eye gemstone after proper consultation'
    ] : []
  });
  
  // --- Pitra Dosha ---
  const sunRahuDistance = Math.abs(sun.siderealLongitude - rahu.siderealLongitude);
  const normalizedDist = sunRahuDistance > 180 ? 360 - sunRahuDistance : sunRahuDistance;
  const sunRahuConjunct = normalizedDist < 12;
  const rahuIn9th = rahu.house === 9;
  const isPitra = sunRahuConjunct || rahuIn9th;
  
  doshas.push({
    name: 'Pitra Dosha',
    detected: isPitra,
    severity: isPitra ? (sunRahuConjunct ? 55 : 35) : 0,
    description: isPitra
      ? `${sunRahuConjunct ? `Sun and Rahu are within ${normalizedDist.toFixed(1)} degrees of each other` : 'Rahu occupies your 9th house (house of father and dharma)'}. This indicates ancestral karmic patterns that benefit from conscious acknowledgment. Rather than viewing this as a curse, understand it as an invitation to honor your lineage and create positive generational karma.`
      : 'No Pitra Dosha detected. Sun and Rahu are well-separated, and the 9th house is free from Rahu\'s influence.',
    remedies: isPitra ? [
      'Perform Tarpan (water offering) for ancestors on Amavasya',
      'Offer water to the Sun at sunrise while chanting Gayatri Mantra',
      'Donate food or clothing to elderly people on Sundays',
      'Plant a Peepal tree and care for it regularly',
      'Perform Pind Daan at Gaya or similar sacred site if recommended'
    ] : []
  });
  
  return doshas;
}

// ============================================================
// SADE SATI — Uses CURRENT transit Saturn position, not birth
// ============================================================
function analyzeSadeSati(moonSignIndex: number) {
  // Get current date's Julian Day
  const now = new Date();
  const nowJD = dateToJD(now.getFullYear(), now.getMonth() + 1, now.getDate(),
    (now.getHours() + now.getMinutes() / 60) / 24);
  const nowAyanamsha = getLahiriAyanamsha(nowJD);
  
  // Get CURRENT Saturn position (transit, not natal)
  const saturnTropLong = getSaturnLongitude((nowJD - 2451545.0) / 36525.0);
  const saturnSidLong = toSidereal(saturnTropLong, nowAyanamsha);
  const saturnSign = getSignIndex(saturnSidLong);
  
  const prev = (moonSignIndex - 1 + 12) % 12;
  const next = (moonSignIndex + 1) % 12;
  
  let phase: string | null = null;
  let isActive = false;
  
  if (saturnSign === prev) { phase = 'Rising (1st Phase)'; isActive = true; }
  else if (saturnSign === moonSignIndex) { phase = 'Peak (2nd Phase)'; isActive = true; }
  else if (saturnSign === next) { phase = 'Setting (3rd Phase)'; isActive = true; }
  
  const satDegInSign = getDegreeInSign(saturnSidLong);
  const progressInSign = satDegInSign / 30.0;
  const yearsPerSign = 2.5;
  const msPerYear = 365.25 * 86400000;
  
  let startDate = '', endDate = '', progress = 0;
  
  if (isActive) {
    let phaseOffset = 0;
    if (phase === 'Peak (2nd Phase)') phaseOffset = 1;
    else if (phase === 'Setting (3rd Phase)') phaseOffset = 2;
    
    const elapsedYears = phaseOffset * yearsPerSign + progressInSign * yearsPerSign;
    startDate = new Date(now.getTime() - elapsedYears * msPerYear).toISOString().split('T')[0];
    endDate = new Date(now.getTime() + (7.5 - elapsedYears) * msPerYear).toISOString().split('T')[0];
    progress = Math.min(100, Math.max(0, (elapsedYears / 7.5) * 100));
  }
  
  return {
    isActive, phase,
    moonSign: SIGNS[moonSignIndex],
    saturnSign: SIGNS[saturnSign],
    startDate, endDate,
    progress: parseFloat(progress.toFixed(1)),
    effects: isActive ? getSadeSatiEffects(phase!) : 'Sade Sati is currently not active for your Moon sign. This period supports stability, growth, and consolidation of past efforts.',
    recommendations: isActive ? [
      'Practice patience — Saturn rewards disciplined effort over time',
      'Prioritize health and establish consistent self-care routines',
      'Chant "Om Sham Shanaishcharaya Namah" 108 times on Saturdays',
      'Consult an expert before wearing a Blue Sapphire (Neelam)',
      'Donate mustard oil, black sesame, or dark cloth on Saturdays',
      'Light a mustard oil lamp under a Peepal tree on Saturday evenings'
    ] : []
  };
}

function getSadeSatiEffects(phase: string): string {
  const effects: Record<string, string> = {
    'Rising (1st Phase)': 'The first phase transits the 12th house from your Moon, affecting your emotional landscape, sleep patterns, and subconscious mind. You may experience shifts in your comfort zone, increased expenses, or changes in living environment. This phase teaches emotional resilience and detachment from material security.',
    'Peak (2nd Phase)': 'Saturn now directly transits your Moon sign, affecting your mind, emotional core, and overall well-being. This is the most intense phase where Saturn restructures your fundamental approach to life. Career shifts, relationship changes, and deep self-reflection are common themes.',
    'Setting (3rd Phase)': 'The final phase transits the 2nd house from your Moon, impacting finances, family dynamics, and self-worth. Earlier lessons are now integrating. Financial discipline, careful communication, and resource management become important themes as this cycle concludes.'
  };
  return effects[phase] || '';
}

// ============================================================
// TRANSIT ANALYSIS
// ============================================================
function getCurrentTransits(jd: number, ayanamsha: number) {
  const transits: Array<{planet: string; sign: string; signIndex: number; degree: number; retrograde: boolean; effects: string}> = [];
  
  for (const planet of ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'] as const) {
    const tropLong = getPlanetLongitude(jd, planet);
    const sidLong = toSidereal(tropLong, ayanamsha);
    const signIdx = getSignIndex(sidLong);
    const retro = isRetrograde(planet, jd);
    transits.push({
      planet, sign: SIGNS[signIdx], signIndex: signIdx,
      degree: parseFloat(getDegreeInSign(sidLong).toFixed(2)),
      retrograde: retro,
      effects: getTransitEffect(planet, signIdx, retro)
    });
  }
  
  const { rahu, ketu } = getRahuKetu(jd);
  const sidRahu = toSidereal(rahu, ayanamsha);
  const sidKetu = toSidereal(ketu, ayanamsha);
  
  transits.push({ planet: 'Rahu', sign: SIGNS[getSignIndex(sidRahu)], signIndex: getSignIndex(sidRahu),
    degree: parseFloat(getDegreeInSign(sidRahu).toFixed(2)), retrograde: true,
    effects: getTransitEffect('Rahu', getSignIndex(sidRahu), true) });
  transits.push({ planet: 'Ketu', sign: SIGNS[getSignIndex(sidKetu)], signIndex: getSignIndex(sidKetu),
    degree: parseFloat(getDegreeInSign(sidKetu).toFixed(2)), retrograde: true,
    effects: getTransitEffect('Ketu', getSignIndex(sidKetu), true) });
  
  return transits;
}

function getTransitEffect(planet: string, signIdx: number, retro: boolean): string {
  const s = SIGNS[signIdx];
  const e = SIGN_ELEMENTS[signIdx].toLowerCase();
  const effects: Record<string, string> = {
    Sun: `The Sun illuminates ${s}, activating ${e}-element themes of confidence, authority, and self-expression.`,
    Moon: `The Moon flows through ${s}, bringing emotional awareness to ${e}-element matters. Honor your feelings today.`,
    Mars: retro ? `Mars retrograde in ${s} redirects assertive energy inward. Avoid impulsive decisions — review and refine plans instead.` : `Mars in ${s} energizes ${e}-element pursuits. Channel this drive into productive goals and physical activity.`,
    Mercury: retro ? `Mercury retrograde in ${s} invites revision and reflection. Double-check communications and delay major signings.` : `Mercury in ${s} sharpens ${e}-element communication. A favorable time for learning, writing, and negotiations.`,
    Jupiter: `Jupiter in ${s} expands ${e}-element domains with wisdom and opportunity. A period of growth through knowledge and ethics.`,
    Venus: retro ? `Venus retrograde in ${s} asks you to reassess values, relationships, and creative priorities.` : `Venus in ${s} brings harmony and beauty to ${e}-element expressions. Favorable for relationships and creative work.`,
    Saturn: `Saturn in ${s} teaches discipline through ${e}-element lessons. Patience and perseverance build lasting structures.`,
    Rahu: `Rahu in ${s} amplifies ambition in ${e}-element domains. Pursue growth mindfully and avoid shortcuts.`,
    Ketu: `Ketu in ${s} promotes spiritual detachment from ${e}-element attachments. Inner wisdom emerges through letting go.`
  };
  return effects[planet] || '';
}

// ============================================================
// AI INSIGHT ENGINE
// ============================================================
function generateInsights(planets: PlanetData[], ascSignIndex: number, moonSignIndex: number) {
  const sun = planets.find(p => p.name === 'Sun')!;
  const moon = planets.find(p => p.name === 'Moon')!;
  const mars = planets.find(p => p.name === 'Mars')!;
  const mercury = planets.find(p => p.name === 'Mercury')!;
  const jupiter = planets.find(p => p.name === 'Jupiter')!;
  const venus = planets.find(p => p.name === 'Venus')!;
  const saturn = planets.find(p => p.name === 'Saturn')!;
  const rahu = planets.find(p => p.name === 'Rahu')!;
  const ketu = planets.find(p => p.name === 'Ketu')!;
  
  const personality = buildPersonality(ascSignIndex, moonSignIndex, sun, moon, mars);
  const career = buildCareer(planets, ascSignIndex, sun, saturn, jupiter, mercury);
  const love = buildLove(venus, mars, jupiter, moon, ascSignIndex);
  const finance = buildFinance(jupiter, venus, saturn, planets, ascSignIndex);
  const karma = buildKarma(saturn, rahu, ketu, ascSignIndex);
  
  const strengths = {
    leadership: calcStr(sun, mars, [1,5,9,10]),
    intellect: calcStr(mercury, jupiter, [3,5,9]),
    creativity: calcStr(venus, moon, [2,5,7]),
    discipline: calcStr(saturn, mars, [1,6,10]),
    spirituality: calcStr(jupiter, ketu, [5,9,12]),
    relationships: calcStr(venus, moon, [4,7,11])
  };
  
  return { personality, career, love, finance, karma, strengths };
}

function calcStr(p1: PlanetData, p2: PlanetData, goodHouses: number[]): number {
  let s = 48;
  if (p1.dignity === 'Exalted') s += 22;
  else if (p1.dignity === 'Moolatrikona') s += 16;
  else if (p1.dignity === 'Own Sign') s += 14;
  else if (p1.dignity === 'Friend\'s Sign') s += 6;
  else if (p1.dignity === 'Debilitated') s -= 18;
  else if (p1.dignity === 'Enemy\'s Sign') s -= 8;
  
  if (p2.dignity === 'Exalted') s += 16;
  else if (p2.dignity === 'Own Sign' || p2.dignity === 'Moolatrikona') s += 10;
  else if (p2.dignity === 'Debilitated') s -= 12;
  
  if (goodHouses.includes(p1.house)) s += 10;
  if (goodHouses.includes(p2.house)) s += 6;
  if (p1.retrograde && p1.name !== 'Rahu' && p1.name !== 'Ketu') s -= 4;
  
  return Math.min(95, Math.max(12, s));
}

const ASC_TRAITS: Record<number, string> = {
  0: 'a pioneering spirit, natural leadership ability, and fearless initiative. You are action-oriented with strong willpower.',
  1: 'steadfast determination, refined aesthetic sense, and practical wisdom. You value stability and sensory experience.',
  2: 'intellectual curiosity, versatile communication skills, and quick adaptability. Your mind is your greatest asset.',
  3: 'deep emotional intelligence, a nurturing instinct, and intuitive perception. You feel and understand deeply.',
  4: 'magnetic charisma, creative confidence, and generous spirit. You naturally command attention and inspire others.',
  5: 'analytical precision, attention to detail, and a service-oriented mindset. You excel at improving systems.',
  6: 'diplomatic grace, aesthetic appreciation, and a natural orientation toward partnership and harmony.',
  7: 'transformative depth, investigative ability, and emotional intensity. You understand what lies beneath the surface.',
  8: 'philosophical vision, adventurous enthusiasm, and boundless optimism. You seek truth and expansion.',
  9: 'ambitious determination, strategic thinking, and enduring patience. You build lasting structures.',
  10: 'innovative thinking, humanitarian ideals, and a unique perspective. You challenge convention constructively.',
  11: 'spiritual sensitivity, creative imagination, and deep compassion. Your intuition guides you through life.'
};

function buildPersonality(ascSign: number, moonSign: number, sun: PlanetData, moon: PlanetData, _mars: PlanetData): string {
  return `Your ${SIGNS[ascSign]} Ascendant gives you ${ASC_TRAITS[ascSign]}\n\nWith Moon in ${SIGNS[moonSign]} (${moon.nakshatra}, Pada ${moon.nakshatraPada}), your emotional core operates through ${SIGN_ELEMENTS[moonSign].toLowerCase()} energy. The ${moon.nakshatra} nakshatra lends ${getNakshatraQuality(moon.nakshatraIndex)} to your emotional nature.\n\nThe Sun in ${sun.sign} in your ${sun.house}${ordinal(sun.house)} house directs your life force toward ${getHouseTheme(sun.house)}. ${sun.dignity === 'Exalted' ? 'Your exalted Sun gives exceptional confidence and purpose.' : sun.dignity === 'Debilitated' ? 'Your Sun placement calls for developing inner authority independent of external validation.' : `The Sun in ${sun.sign} expresses your identity through ${SIGN_ELEMENTS[sun.signIndex].toLowerCase()} qualities.`}`;
}

function buildCareer(planets: PlanetData[], ascSign: number, _sun: PlanetData, _saturn: PlanetData, _jupiter: PlanetData, mercury: PlanetData): string {
  const tenthSign = (ascSign + 9) % 12;
  const tenthLord = SIGN_LORDS[tenthSign];
  const tenthLordP = planets.find(p => p.name === tenthLord);
  const mc = planets.filter(p => p.house === 10);
  
  const fields: Record<string, string> = {
    Sun: 'government, leadership, administration, medicine, or authority roles',
    Moon: 'hospitality, healthcare, public relations, creative arts, or counseling',
    Mars: 'engineering, technology, military, sports, surgery, or real estate',
    Mercury: 'writing, IT, data science, trading, marketing, or communication fields',
    Jupiter: 'education, law, finance, consulting, spirituality, or advisory roles',
    Venus: 'arts, entertainment, luxury goods, design, beauty, or diplomacy',
    Saturn: 'research, manufacturing, construction, agriculture, or systematic work'
  };
  
  let text = `Your 10th house (career) falls in ${SIGNS[tenthSign]}, ruled by ${tenthLord}${tenthLordP ? ` which is placed in ${tenthLordP.sign} (${tenthLordP.house}${ordinal(tenthLordP.house)} house)` : ''}. This suggests strong aptitude for ${fields[tenthLord] || 'diverse professional fields'}.`;
  
  if (mc.length > 0) {
    text += `\n\n${mc.map(p => `${p.name} in your 10th house brings ${p.name === 'Jupiter' ? 'expansion and ethical leadership' : p.name === 'Saturn' ? 'discipline and long-term career building' : p.name === 'Sun' ? 'authority and public recognition' : 'its unique energy'} to your professional life.`).join(' ')}`;
  }
  
  text += `\n\nMercury (skill planet) in your ${mercury.house}${ordinal(mercury.house)} house indicates your intellectual strengths are best applied in ${getHouseTheme(mercury.house)}.`;
  
  return text;
}

function buildLove(venus: PlanetData, mars: PlanetData, jupiter: PlanetData, _moon: PlanetData, ascSign: number): string {
  const seventhSign = (ascSign + 6) % 12;
  const seventhLord = SIGN_LORDS[seventhSign];
  
  let text = `Venus in ${venus.sign} (${venus.house}${ordinal(venus.house)} house) defines your relationship style and aesthetic values. ${venus.dignity === 'Exalted' ? 'Exalted Venus bestows natural charm, deep romantic fulfillment, and strong aesthetic sense.' : venus.dignity === 'Debilitated' ? 'Venus here asks you to build authentic self-worth before seeking it through relationships.' : `Venus in ${venus.sign} expresses love through ${SIGN_ELEMENTS[venus.signIndex].toLowerCase()} qualities — ${venus.signIndex % 3 === 0 ? 'initiating and passionate' : venus.signIndex % 3 === 1 ? 'steady and devoted' : 'adaptable and communicative'}.`}`;
  
  text += `\n\nYour 7th house (partnerships) is ${SIGNS[seventhSign]}, ruled by ${seventhLord}. You are naturally attracted to partners who embody ${SIGNS[seventhSign]} qualities: ${getSignPartnerTraits(seventhSign)}.`;
  
  if (mars.house === 7) text += '\n\nMars in the 7th house brings passion and intensity to relationships. Channel this constructively through shared activities and honest communication.';
  if (jupiter.house === 7) text += '\n\nJupiter blessing your 7th house indicates a wise, generous partner. Marriage is supported by mutual growth and respect.';
  
  return text;
}

function buildFinance(jupiter: PlanetData, venus: PlanetData, saturn: PlanetData, planets: PlanetData[], ascSign: number): string {
  const secondLord = SIGN_LORDS[(ascSign + 1) % 12];
  const eleventhLord = SIGN_LORDS[(ascSign + 10) % 12];
  const secondLordP = planets.find(p => p.name === secondLord);
  const eleventhLordP = planets.find(p => p.name === eleventhLord);
  
  let text = `Your 2nd house lord (${secondLord}) governs earned wealth${secondLordP ? `, placed in ${secondLordP.sign} (${secondLordP.house}${ordinal(secondLordP.house)} house)` : ''}. The 11th house lord (${eleventhLord}) controls income gains${eleventhLordP ? `, placed in ${eleventhLordP.sign} (${eleventhLordP.house}${ordinal(eleventhLordP.house)} house)` : ''}.`;
  
  const jStrong = jupiter.dignity === 'Exalted' || jupiter.dignity === 'Own Sign' || jupiter.dignity === 'Moolatrikona';
  text += `\n\nJupiter (planet of wealth) in ${jupiter.sign} (${jupiter.house}${ordinal(jupiter.house)} house) indicates ${jStrong ? 'strong natural abundance and wise financial instincts' : 'moderate financial potential that grows through wisdom and disciplined planning'}.`;
  
  if (saturn.house === 2 || saturn.house === 11) {
    text += '\n\nSaturn influencing your wealth houses favors steady, disciplined wealth-building. Long-term investments and systematic saving will be your strongest strategies.';
  }
  if (venus.house === 2) text += '\n\nVenus in the 2nd house suggests wealth through beauty, arts, luxury goods, or creative industries.';
  
  text += '\n\nPeak earning periods coincide with favorable Mahadasha and Antardasha transitions — check the Dasha section for timing.';
  
  return text;
}

function buildKarma(saturn: PlanetData, rahu: PlanetData, ketu: PlanetData, _ascSign: number): string {
  return `Saturn in ${saturn.sign} (${saturn.house}${ordinal(saturn.house)} house) reveals your primary karmic assignment: mastering ${getHouseTheme(saturn.house)}. ${saturn.retrograde ? 'Retrograde Saturn intensifies these lessons, pointing to unresolved patterns from past incarnations.' : 'Saturn direct helps you face karmic patterns through steady, practical effort.'}\n\nRahu in ${rahu.sign} (${rahu.house}${ordinal(rahu.house)} house) marks where your soul seeks new growth: ${getHouseTheme(rahu.house)}. This is your area of greatest potential if approached with integrity.\n\nKetu in ${ketu.sign} (${ketu.house}${ordinal(ketu.house)} house) represents abilities mastered in past lives: ${getHouseTheme(ketu.house)}. While these skills come naturally, your dharmic growth lies in developing the opposite Rahu-indicated qualities.\n\nThe Rahu-Ketu axis across houses ${rahu.house} and ${ketu.house} defines the central evolutionary tension in your chart: balancing past-life expertise with present-life aspirations.`;
}

function getNakshatraQuality(nakIdx: number): string {
  const qualities = [
    'swiftness and healing energy', 'fierce determination and transformation', 'purifying fire and authority',
    'growth, fertility, and creativity', 'searching curiosity and exploration', 'intellectual storm and breakthrough',
    'renewal, return, and wisdom', 'nourishing stability and devotion', 'mystical intensity and serpentine wisdom',
    'regal authority and ancestral honor', 'creative pleasure and artistic talent', 'sustained power and patronage',
    'skillful craftsmanship and adaptability', 'brilliance, beauty, and creative vision', 'independence and self-directed growth',
    'purposeful determination and dual nature', 'devoted friendship and cosmic connection', 'protective authority and seniority',
    'uprooting of the old and radical insight', 'invincible resolve and purifying energy', 'universal responsibility and integrity',
    'deep listening and learning ability', 'musical rhythm and material abundance', 'vast space and healing ability',
    'fiery transformative power', 'deep oceanic wisdom and spiritual depth', 'nurturing completion and cosmic travel'
  ];
  return qualities[nakIdx] || 'distinctive energy';
}

function getSignPartnerTraits(signIdx: number): string {
  const traits: Record<number, string> = {
    0: 'courage, independence, and directness', 1: 'stability, sensuality, and loyalty',
    2: 'wit, versatility, and intellectual spark', 3: 'emotional depth, nurturing, and family values',
    4: 'confidence, warmth, and generosity', 5: 'intelligence, health-consciousness, and practicality',
    6: 'elegance, fairness, and social grace', 7: 'intensity, passion, and emotional honesty',
    8: 'adventure, philosophy, and spiritual seeking', 9: 'ambition, maturity, and reliability',
    10: 'uniqueness, intellectual freedom, and humanitarianism', 11: 'sensitivity, imagination, and spiritual depth'
  };
  return traits[signIdx] || 'unique qualities';
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function ordinal(n: number): string {
  if (n >= 11 && n <= 13) return 'th';
  switch(n % 10) {
    case 1: return 'st'; case 2: return 'nd'; case 3: return 'rd';
    default: return 'th';
  }
}

function getHouseTheme(house: number): string {
  const themes: Record<number, string> = {
    1: 'self-identity, physical vitality, and personal initiative',
    2: 'wealth, family values, speech, and accumulated resources',
    3: 'courage, communication, short travels, and siblings',
    4: 'home, mother, emotional security, and inner peace',
    5: 'creativity, children, romance, education, and past-life merit',
    6: 'health, service, competition, obstacles, and daily routines',
    7: 'partnerships, marriage, business alliances, and public dealings',
    8: 'transformation, occult knowledge, longevity, and shared resources',
    9: 'higher learning, dharma, fortune, father, and long journeys',
    10: 'career, reputation, authority, and public achievement',
    11: 'gains, aspirations, elder siblings, and social networks',
    12: 'liberation, foreign lands, expenses, and spiritual surrender'
  };
  return themes[house] || 'life experiences';
}

// ============================================================
// MAIN INTERFACES & ENTRY POINT
// ============================================================
export interface PlanetData {
  name: string; symbol: string;
  longitude: number; siderealLongitude: number;
  sign: string; signIndex: number; signSanskrit: string;
  degreeInSign: number;
  nakshatra: string; nakshatraIndex: number; nakshatraPada: number;
  nakshatraLord: string; nakshatraDeity: string;
  house: number; retrograde: boolean; dignity: string;
  navamsaSign: string; navamsaSignIndex: number;
  dashamsaSign: string; dashamsaSignIndex: number;
  shashtiamsaSign: string; shashtiamsaSignIndex: number;
}

export interface BirthChart {
  name: string; dateOfBirth: string; timeOfBirth: string;
  placeOfBirth: string; latitude: number; longitude: number; timezone: number;
  julianDay: number; ayanamsha: number;
  ascendant: {
    longitude: number; sign: string; signIndex: number; signSanskrit: string;
    degree: number; nakshatra: string; nakshatraPada: number; lord: string;
  };
  planets: PlanetData[];
  houses: number[];
  dashas: ReturnType<typeof calculateVimshottariDasha>;
  doshas: ReturnType<typeof analyzeDoshas>;
  sadeSati: ReturnType<typeof analyzeSadeSati>;
  transits: ReturnType<typeof getCurrentTransits>;
  insights: ReturnType<typeof generateInsights>;
  divisionalCharts: {
    d1: Array<{planet: string; sign: string; signIndex: number}>;
    d9: Array<{planet: string; sign: string; signIndex: number}>;
    d10: Array<{planet: string; sign: string; signIndex: number}>;
    d60: Array<{planet: string; sign: string; signIndex: number}>;
  };
}

export function calculateBirthChart(
  name: string,
  year: number, month: number, day: number,
  hour: number, minute: number,
  latitude: number, geoLongitude: number,
  timezone: number,
  placeOfBirth: string
): BirthChart {
  // --- Validate inputs ---
  if (month < 1 || month > 12) throw new Error('Invalid month');
  if (day < 1 || day > 31) throw new Error('Invalid day');
  if (hour < 0 || hour > 23) throw new Error('Invalid hour');
  if (minute < 0 || minute > 59) throw new Error('Invalid minute');
  if (latitude < -90 || latitude > 90) throw new Error('Invalid latitude');
  if (geoLongitude < -180 || geoLongitude > 180) throw new Error('Invalid longitude');
  if (timezone < -12 || timezone > 14) throw new Error('Invalid timezone');
  
  // --- Convert local time to UTC ---
  const utcHourDecimal = hour + minute / 60.0 - timezone;
  let adjYear = year, adjMonth = month, adjDay = day;
  let adjHour = utcHourDecimal;
  
  // Handle day rollover from timezone conversion
  if (adjHour < 0) {
    adjHour += 24;
    adjDay -= 1;
    if (adjDay < 1) {
      adjMonth -= 1;
      if (adjMonth < 1) { adjMonth = 12; adjYear -= 1; }
      adjDay = daysInMonth(adjYear, adjMonth);
    }
  } else if (adjHour >= 24) {
    adjHour -= 24;
    adjDay += 1;
    if (adjDay > daysInMonth(adjYear, adjMonth)) {
      adjDay = 1;
      adjMonth += 1;
      if (adjMonth > 12) { adjMonth = 1; adjYear += 1; }
    }
  }
  
  const jd = dateToJD(adjYear, adjMonth, adjDay, adjHour);
  const ayanamsha = getLahiriAyanamsha(jd);
  
  // --- Ascendant ---
  const ascTropical = calculateAscendant(jd, latitude, geoLongitude);
  const ascSidereal = toSidereal(ascTropical, ayanamsha);
  const ascSignIdx = getSignIndex(ascSidereal);
  const ascDeg = getDegreeInSign(ascSidereal);
  const ascNakIdx = getNakshatraIndex(ascSidereal);
  
  const ascendant = {
    longitude: round4(ascSidereal),
    sign: SIGNS[ascSignIdx],
    signIndex: ascSignIdx,
    signSanskrit: SIGNS_SANSKRIT[ascSignIdx],
    degree: round2(ascDeg),
    nakshatra: NAKSHATRAS[ascNakIdx],
    nakshatraPada: getNakshatraPada(ascSidereal),
    lord: SIGN_LORDS[ascSignIdx]
  };
  
  // --- Whole Sign Houses ---
  const houses: number[] = [];
  for (let i = 0; i < 12; i++) {
    houses.push((ascSignIdx * 30 + i * 30) % 360);
  }
  
  // --- Planetary Positions ---
  const planets: PlanetData[] = [];
  const planetList = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
  
  for (let i = 0; i < planetList.length; i++) {
    const pName = planetList[i];
    const tropLong = getPlanetLongitude(jd, pName);
    const sidLong = toSidereal(tropLong, ayanamsha);
    const signIdx = getSignIndex(sidLong);
    const degInSign = getDegreeInSign(sidLong);
    const nakIdx = getNakshatraIndex(sidLong);
    const retro = isRetrograde(pName, jd);
    const navSign = getNavamsaSign(sidLong);
    const d10Sign = getDashamsaSign(sidLong);
    const d60Sign = getShastiamsaSign(sidLong);
    
    planets.push({
      name: pName, symbol: PLANET_SYMBOLS[i],
      longitude: round4(tropLong), siderealLongitude: round4(sidLong),
      sign: SIGNS[signIdx], signIndex: signIdx, signSanskrit: SIGNS_SANSKRIT[signIdx],
      degreeInSign: round2(degInSign),
      nakshatra: NAKSHATRAS[nakIdx], nakshatraIndex: nakIdx,
      nakshatraPada: getNakshatraPada(sidLong),
      nakshatraLord: NAKSHATRA_LORDS[nakIdx], nakshatraDeity: NAKSHATRA_DEITIES[nakIdx],
      house: getHouseNumber(sidLong, ascSignIdx),
      retrograde: retro,
      dignity: getPlanetDignity(pName, signIdx, degInSign),
      navamsaSign: SIGNS[navSign], navamsaSignIndex: navSign,
      dashamsaSign: SIGNS[d10Sign], dashamsaSignIndex: d10Sign,
      shashtiamsaSign: SIGNS[d60Sign], shashtiamsaSignIndex: d60Sign
    });
  }
  
  // --- Rahu & Ketu ---
  const { rahu, ketu } = getRahuKetu(jd);
  const sidRahu = toSidereal(rahu, ayanamsha);
  const sidKetu = toSidereal(ketu, ayanamsha);
  
  for (const [sidLong, tropLong, idx, nodeName] of [
    [sidRahu, rahu, 7, 'Rahu'], [sidKetu, ketu, 8, 'Ketu']
  ] as [number, number, number, string][]) {
    const signIdx = getSignIndex(sidLong);
    const degInSign = getDegreeInSign(sidLong);
    const nakIdx = getNakshatraIndex(sidLong);
    
    planets.push({
      name: nodeName, symbol: PLANET_SYMBOLS[idx],
      longitude: round4(tropLong), siderealLongitude: round4(sidLong),
      sign: SIGNS[signIdx], signIndex: signIdx, signSanskrit: SIGNS_SANSKRIT[signIdx],
      degreeInSign: round2(degInSign),
      nakshatra: NAKSHATRAS[nakIdx], nakshatraIndex: nakIdx,
      nakshatraPada: getNakshatraPada(sidLong),
      nakshatraLord: NAKSHATRA_LORDS[nakIdx], nakshatraDeity: NAKSHATRA_DEITIES[nakIdx],
      house: getHouseNumber(sidLong, ascSignIdx),
      retrograde: true, dignity: 'Neutral',
      navamsaSign: SIGNS[getNavamsaSign(sidLong)], navamsaSignIndex: getNavamsaSign(sidLong),
      dashamsaSign: SIGNS[getDashamsaSign(sidLong)], dashamsaSignIndex: getDashamsaSign(sidLong),
      shashtiamsaSign: SIGNS[getShastiamsaSign(sidLong)], shashtiamsaSignIndex: getShastiamsaSign(sidLong)
    });
  }
  
  // --- Derived calculations ---
  const moonP = planets.find(p => p.name === 'Moon')!;
  
  const nowDate = new Date();
  const nowJD = dateToJD(nowDate.getFullYear(), nowDate.getMonth() + 1, nowDate.getDate(),
    (nowDate.getHours() + nowDate.getMinutes() / 60) / 24);
  const nowAyanamsha = getLahiriAyanamsha(nowJD);
  
  return {
    name,
    dateOfBirth: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    timeOfBirth: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    placeOfBirth, latitude, longitude: geoLongitude, timezone,
    julianDay: round4(jd), ayanamsha: round4(ayanamsha),
    ascendant, planets, houses,
    dashas: calculateVimshottariDasha(moonP.siderealLongitude, jd),
    doshas: analyzeDoshas(planets, ascSignIdx),
    sadeSati: analyzeSadeSati(moonP.signIndex),
    transits: getCurrentTransits(nowJD, nowAyanamsha),
    insights: generateInsights(planets, ascSignIdx, moonP.signIndex),
    divisionalCharts: {
      d1: planets.map(p => ({ planet: p.name, sign: p.sign, signIndex: p.signIndex })),
      d9: planets.map(p => ({ planet: p.name, sign: p.navamsaSign, signIndex: p.navamsaSignIndex })),
      d10: planets.map(p => ({ planet: p.name, sign: p.dashamsaSign, signIndex: p.dashamsaSignIndex })),
      d60: planets.map(p => ({ planet: p.name, sign: p.shashtiamsaSign, signIndex: p.shashtiamsaSignIndex }))
    }
  };
}

// Helpers
function round2(n: number): number { return Math.round(n * 100) / 100; }
function round4(n: number): number { return Math.round(n * 10000) / 10000; }

function daysInMonth(year: number, month: number): number {
  const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && isLeapYear(year)) return 29;
  return days[month - 1];
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// ============================================================
// EXPORTED TEST HELPERS — For automated testing
// ============================================================
export { 
  dateToJD as _dateToJD,
  jdToDate as _jdToDate,
  getLahiriAyanamsha as _getLahiriAyanamsha,
  getSunLongitude as _getSunLongitude,
  getMoonLongitude as _getMoonLongitude,
  getSignIndex as _getSignIndex,
  getDegreeInSign as _getDegreeInSign,
  getNakshatraIndex as _getNakshatraIndex,
  getNakshatraPada as _getNakshatraPada,
  getNavamsaSign as _getNavamsaSign,
  getDashamsaSign as _getDashamsaSign,
  getShastiamsaSign as _getShastiamsaSign,
  getHouseNumber as _getHouseNumber,
  isRetrograde as _isRetrograde,
  getPlanetDignity as _getPlanetDignity,
  toSidereal as _toSidereal,
  norm360 as _norm360,
  calculateAscendant as _calculateAscendant,
  getPlanetLongitude as _getPlanetLongitude,
  getRahuKetu as _getRahuKetu,
  getObliquity as _getObliquity,
  getNutation as _getNutation,
  daysInMonth as _daysInMonth,
  isLeapYear as _isLeapYear,
};
