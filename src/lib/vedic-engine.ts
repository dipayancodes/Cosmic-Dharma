// ============================================================
// Cosmic Dharma — Precision Vedic Astrology Engine v4.0
// Sidereal Zodiac · Lahiri Ayanamsha · Whole Sign Houses
// Full Meeus Keplerian Method for Planets + VSOP87 Sun
// Moon: Meeus ELP/MPP02 truncated
// Reference: "Astronomical Algorithms" Jean Meeus, 2nd Ed.
// Swiss Ephemeris documentation for Lahiri ayanamsha
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
export const PLANET_SYMBOLS = ['\u2609','\u263D','\u2642','\u263F','\u2643','\u2640','\u2644','\u260A','\u260B'] as const;

// 3-letter abbreviations for chart display
export const PLANET_ABBR: Record<string, string> = {
  Sun:'SUN', Moon:'MON', Mars:'MAR', Mercury:'MER', Jupiter:'JUP',
  Venus:'VEN', Saturn:'SAT', Rahu:'RAH', Ketu:'KET'
};

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
function tanD(deg: number): number { return Math.tan(deg * DEG); }
function atan2D(y: number, x: number): number { return Math.atan2(y, x) * RAD; }
function asinD(x: number): number { return Math.asin(x) * RAD; }

// ============================================================
// JULIAN DAY — Meeus algorithm (Ch. 7), handles all dates correctly
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
// LAHIRI AYANAMSHA — Per Swiss Ephemeris / IAE standard
// Reference: Swiss Ephemeris doc section 2.8.5
// Lahiri defined: 23°15'00.658" on 21 March 1956, 0:00 TDT
// At J2000.0: 23°51'25.53" = 23.857092°
// Precession: IAU 1976 (Lieske) general precession:
//   PN = 5029.0966" * T + 1.11161" * T² - 0.000113" * T³
// where T = Julian centuries from J2000.0
// ============================================================
export function getLahiriAyanamsha(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  // Lahiri ayanamsha at J2000.0 = 23°51'25.53" = 23.857092°
  // Using IAU 1976 precession from J2000.0
  const ayaJ2000 = 23.857092;  // 23°51'25.53"
  const precessionArcsec = 5029.0966 * T + 1.11161 * T * T - 0.000113 * T * T * T;
  return ayaJ2000 + precessionArcsec / 3600.0;
}

// ============================================================
// OBLIQUITY OF THE ECLIPTIC — IAU 2006 formula
// ============================================================
function getObliquity(T: number): number {
  const eps0 = 84381.406 - 46.836769 * T - 0.0001831 * T * T
    + 0.00200340 * T * T * T - 0.000000576 * T * T * T * T
    - 0.0000000434 * T * T * T * T * T;
  return eps0 / 3600.0;
}

// ============================================================
// NUTATION — IAU simplified (Meeus Ch. 22, ~0.5" accuracy)
// ============================================================
function getNutation(T: number): { deltaPsi: number; deltaEps: number } {
  const omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T;
  const Lsun = 280.4665 + 36000.7698 * T;
  const Lmoon = 218.3165 + 481267.8813 * T;

  const deltaPsi = (-17.20 * sinD(omega) - 1.32 * sinD(2 * Lsun) - 0.23 * sinD(2 * Lmoon) + 0.21 * sinD(2 * omega)) / 3600.0;
  const deltaEps = (9.20 * cosD(omega) + 0.57 * cosD(2 * Lsun) + 0.10 * cosD(2 * Lmoon) - 0.09 * cosD(2 * omega)) / 3600.0;

  return { deltaPsi, deltaEps };
}

// ============================================================
// SOLAR LONGITUDE — Meeus Ch. 25 (VSOP87 truncated, ~0.01° accuracy)
// Returns GEOCENTRIC APPARENT ecliptic longitude
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
  // Apparent longitude (aberration + nutation)
  const omega = 125.04 - 1934.136 * T;
  sunLong -= 0.00569 + 0.00478 * sinD(omega);
  return norm360(sunLong);
}

// ============================================================
// LUNAR LONGITUDE — Full Meeus Ch. 47 (ELP truncated, ~0.01° accuracy)
// Returns GEOCENTRIC ecliptic longitude
// ============================================================
function getMoonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const Lp = norm360(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T * T * T / 538841.0 - T * T * T * T / 65194000.0);
  const D  = norm360(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T * T * T / 545868.0 - T * T * T * T / 113065000.0);
  const M  = norm360(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T * T * T / 24490000.0);
  const Mp = norm360(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T * T * T / 69699.0 - T * T * T * T / 14712000.0);
  const F  = norm360(93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - T * T * T / 3526000.0 + T * T * T * T / 863310000.0);
  const A1 = norm360(119.75 + 131.849 * T);
  const A2 = norm360(53.09 + 479264.290 * T);
  const A3 = norm360(313.45 + 481266.484 * T);
  const E = 1.0 - 0.002516 * T - 0.0000074 * T * T;
  const E2 = E * E;
  
  // Top 60 terms from Meeus Table 47.A
  const lTerms: [number, number, number, number, number][] = [
    [0,0,1,0,6288774],[2,0,-1,0,1274027],[2,0,0,0,658314],[0,0,2,0,213618],
    [0,1,0,0,-185116],[0,0,0,2,-114332],[2,0,-2,0,58793],[2,-1,-1,0,57066],
    [2,0,1,0,53322],[2,-1,0,0,45758],[0,1,-1,0,-40923],[1,0,0,0,-34720],
    [0,1,1,0,-30383],[2,0,0,-2,15327],[0,0,1,2,-12528],[0,0,1,-2,10980],
    [4,0,-1,0,10675],[0,0,3,0,10034],[4,0,-2,0,8548],[2,1,-1,0,-7888],
    [2,1,0,0,-6766],[1,0,-1,0,-5163],[1,1,0,0,4987],[2,-1,1,0,4036],
    [2,0,2,0,3994],[4,0,0,0,3861],[2,0,-3,0,3665],[0,1,-2,0,-2689],
    [2,0,-1,2,-2602],[2,-1,-2,0,2390],[1,0,1,0,-2348],[2,-2,0,0,2236],
    [0,1,2,0,-2120],[0,2,0,0,-2069],[2,-2,-1,0,2048],[2,0,1,-2,-1773],
    [2,0,0,2,-1595],[4,-1,-1,0,1215],[0,0,2,2,-1110],[3,0,-1,0,-892],
    [2,1,1,0,-810],[4,-1,-2,0,759],[0,2,-1,0,-713],[2,2,-1,0,-700],
    [2,1,-2,0,691],[2,-1,0,-2,596],[4,0,1,0,549],[0,0,4,0,537],
    [4,-1,0,0,520],[1,0,-2,0,-487],[2,1,0,-2,-399],[0,0,2,-2,-381],
    [1,1,1,0,351],[3,0,-2,0,-340],[4,0,-3,0,330],[2,-1,2,0,327],
    [0,2,1,0,-323],[1,1,-1,0,299],[2,0,3,0,294]
  ];
  
  let sumL = 0;
  for (const [d, m, mp, f, coeff] of lTerms) {
    let eCorr = 1;
    if (Math.abs(m) === 1) eCorr = E;
    else if (Math.abs(m) === 2) eCorr = E2;
    sumL += coeff * eCorr * sinD(d * D + m * M + mp * Mp + f * F);
  }
  
  sumL += 3958 * sinD(A1) + 1962 * sinD(Lp - F) + 318 * sinD(A2);
  
  return norm360(Lp + sumL / 1000000.0);
}

// ============================================================
// PLANETARY LONGITUDES — Full Meeus Keplerian Method
// Using orbital elements from Meeus "Astronomical Formulae for
// Calculators" Table 1 (epoch T from 1900 Jan 0.5 ET)
// Then converting heliocentric → geocentric ecliptic longitude
// ============================================================

// Orbital elements: [L0, L1, L2, L3, a, e0, e1, e2, e3, i0, i1, i2, w0, w1, w2, w3, W0, W1, W2, W3]
// T is Julian centuries from 1900 Jan 0.5 ET (JD 2415020.0)
interface OrbitalElements {
  L: number; a: number; e: number; i: number; w: number; W: number;
}

function getOrbitalElements(planet: string, T1900: number): OrbitalElements {
  const T = T1900;
  const T2 = T * T;
  const T3 = T * T * T;
  
  switch(planet) {
    case 'Mercury': return {
      L: norm360(178.179078 + 149474.07078 * T + 0.0003011 * T2),
      a: 0.3870986,
      e: 0.20561421 + 0.00002046 * T - 0.000000030 * T2,
      i: 7.002881 + 0.0018608 * T - 0.0000183 * T2,
      w: 28.753753 + 0.3702806 * T + 0.0001208 * T2,
      W: 47.145944 + 1.1852083 * T + 0.0001739 * T2
    };
    case 'Venus': return {
      L: norm360(342.767053 + 58519.21191 * T + 0.0003097 * T2),
      a: 0.7233316,
      e: 0.00682069 - 0.00004774 * T + 0.000000091 * T2,
      i: 3.393631 + 0.0010058 * T - 0.0000010 * T2,
      w: 54.384186 + 0.5081861 * T - 0.0013864 * T2,
      W: 75.779647 + 0.8998500 * T + 0.0004100 * T2
    };
    case 'Earth': return {
      L: norm360(99.696678 + 36000.76892 * T + 0.0003025 * T2),
      a: 1.0000002,
      e: 0.01675104 - 0.0000418 * T - 0.000000126 * T2,
      i: 0,
      w: 101.220833 + 1.7191750 * T + 0.0004528 * T2 + 0.000000150 * T3,
      W: 0
    };
    case 'Mars': return {
      L: norm360(293.737334 + 19141.69551 * T + 0.0003107 * T2),
      a: 1.5236883,
      e: 0.09331290 + 0.000092064 * T - 0.000000077 * T2,
      i: 1.850333 - 0.0006750 * T + 0.0000126 * T2,
      w: 285.431761 + 1.0697667 * T + 0.0001313 * T2 + 0.00000414 * T3,
      W: 48.786442 + 0.7709917 * T - 0.0000014 * T2 - 0.00000533 * T3
    };
    case 'Jupiter': return {
      L: norm360(238.049257 + 3036.301986 * T + 0.0003347 * T2 - 0.00000165 * T3),
      a: 5.202561,
      e: 0.04833475 + 0.000164180 * T - 0.0000004676 * T2 - 0.0000000017 * T3,
      i: 1.308736 - 0.0056961 * T + 0.0000039 * T2,
      w: 273.277558 + 0.5594317 * T + 0.00070405 * T2 + 0.00000508 * T3,
      W: 99.443414 + 1.0105300 * T + 0.00035222 * T2 - 0.00000851 * T3
    };
    case 'Saturn': return {
      L: norm360(266.564377 + 1223.509884 * T + 0.0003245 * T2 - 0.0000058 * T3),
      a: 9.554747,
      e: 0.05589232 - 0.00034550 * T - 0.000000728 * T2 + 0.00000000074 * T3,
      i: 2.492519 - 0.0039189 * T - 0.00001549 * T2 + 0.00000004 * T3,
      w: 338.307800 + 1.0852207 * T + 0.00097854 * T2 + 0.00000992 * T3,
      W: 112.790414 + 0.8731951 * T - 0.00015218 * T2 - 0.00000531 * T3
    };
    default:
      return { L:0, a:1, e:0, i:0, w:0, W:0 };
  }
}

// Solve Kepler's equation M = E - e*sin(E) by iteration
function solveKepler(M_deg: number, e: number): number {
  const M_rad = M_deg * DEG;
  let E = M_rad;
  for (let iter = 0; iter < 30; iter++) {
    const dE = (M_rad - (E - e * Math.sin(E))) / (1 - e * Math.cos(E));
    E += dE;
    if (Math.abs(dE) < 1e-12) break;
  }
  return E * RAD; // return in degrees
}

// Compute heliocentric ecliptic longitude and radius for a planet
function heliocentricPosition(elem: OrbitalElements): { lon: number; r: number; lat: number } {
  const p = elem.w + elem.W; // longitude of perihelion
  const M = norm360(elem.L - p); // mean anomaly
  const E = solveKepler(M, elem.e);
  
  // True anomaly
  const tanHalfNu = Math.sqrt((1 + elem.e) / (1 - elem.e)) * Math.tan(E * DEG / 2);
  let nu = 2 * Math.atan(tanHalfNu) * RAD;
  
  // Radius vector
  const r = elem.a * (1 - elem.e * cosD(E));
  
  // Argument of latitude
  const u = norm360(elem.L + nu - M - elem.W);
  
  // Ecliptic longitude
  let lon: number;
  if (elem.i < 0.001) {
    // Near-zero inclination (like Earth reference)
    lon = norm360(elem.W + u);
  } else {
    // Full formula with inclination
    const sinLonMinusW = cosD(elem.i) * sinD(u);
    const cosLonMinusW = cosD(u);
    const lonMinusW = atan2D(sinLonMinusW, cosLonMinusW);
    lon = norm360(lonMinusW + elem.W);
  }
  
  // Ecliptic latitude
  const lat = asinD(sinD(u) * sinD(elem.i));
  
  return { lon, r, lat };
}

// Convert heliocentric to geocentric ecliptic longitude
function helioToGeo(planetHel: { lon: number; r: number; lat: number },
                     earthHel: { lon: number; r: number; lat: number }): number {
  // Convert to rectangular heliocentric ecliptic
  const xp = planetHel.r * cosD(planetHel.lat) * cosD(planetHel.lon);
  const yp = planetHel.r * cosD(planetHel.lat) * sinD(planetHel.lon);
  const zp = planetHel.r * sinD(planetHel.lat);
  
  const xe = earthHel.r * cosD(earthHel.lon); // Earth lat ~0
  const ye = earthHel.r * sinD(earthHel.lon);
  const ze = 0;
  
  // Geocentric rectangular
  const xg = xp - xe;
  const yg = yp - ye;
  const zg = zp - ze;
  
  // Geocentric ecliptic longitude
  return norm360(atan2D(yg, xg));
}

// Perturbation corrections for Jupiter and Saturn (Great Inequality)
// Meeus "Astronomical Formulae for Calculators" Ch. 23
function applyPerturbations(planet: string, T1900: number, lon: number): number {
  if (planet === 'Jupiter') {
    const A = 331.7 + 862.0 * T1900; // mean longitude of Saturn
    const P = norm360(A);
    // Perturbation by Saturn
    lon += (0.3314 - 0.0104 * T1900) * sinD(norm360(163.6 + 1.4 * T1900))
         + (0.0644 - 0.0006 * T1900) * cosD(norm360(163.6 + 1.4 * T1900))
         + 0.1985 * sinD(norm360(318.4 + 1222.1 * T1900 - 238.0 - 3036.3 * T1900))
         - 0.1283 * cosD(norm360(318.4 + 1222.1 * T1900 - 238.0 - 3036.3 * T1900));
  } else if (planet === 'Saturn') {
    // Perturbation by Jupiter
    lon += (-0.8142 + 0.0094 * T1900) * sinD(norm360(163.6 + 1.4 * T1900))
         + (-0.0520 + 0.0023 * T1900) * cosD(norm360(163.6 + 1.4 * T1900))
         + 0.1164 * sinD(norm360(238.0 + 3036.3 * T1900 - 318.4 - 1222.1 * T1900))
         + 0.1488 * cosD(norm360(238.0 + 3036.3 * T1900 - 318.4 - 1222.1 * T1900));
  }
  return norm360(lon);
}

// Main planet longitude function
function getPlanetLongitude(jd: number, planet: string): number {
  if (planet === 'Sun') return getSunLongitude(jd);
  if (planet === 'Moon') return getMoonLongitude(jd);
  
  const T1900 = (jd - 2415020.0) / 36525.0; // centuries from 1900.0
  
  const planetElem = getOrbitalElements(planet, T1900);
  const earthElem = getOrbitalElements('Earth', T1900);
  
  const planetHel = heliocentricPosition(planetElem);
  const earthHel = heliocentricPosition(earthElem);
  
  let geoLon = helioToGeo(planetHel, earthHel);
  
  // Apply perturbations for Jupiter and Saturn
  if (planet === 'Jupiter' || planet === 'Saturn') {
    geoLon = applyPerturbations(planet, T1900, geoLon);
  }
  
  // Aberration correction (~20.5")
  geoLon -= 0.005694;
  
  return norm360(geoLon);
}

// ============================================================
// RAHU / KETU — Mean lunar nodes (Meeus Ch. 47)
// ============================================================
function getRahuKetu(jd: number): { rahu: number; ketu: number } {
  const T = (jd - 2451545.0) / 36525.0;
  // Mean ascending node (Rahu) — Meeus formula
  let omega = 125.0445479 - 1934.1362891 * T + 0.0020754 * T * T
              + T * T * T / 467441.0 - T * T * T * T / 60616000.0;
  omega = norm360(omega);
  
  // Apply primary perturbation corrections for true node
  const Msun = norm360(357.5291092 + 35999.0502909 * T);
  const Mmoon = norm360(134.9633964 + 477198.8675055 * T);
  const D = norm360(297.8501921 + 445267.1114034 * T);
  const F = norm360(93.2720950 + 483202.0175233 * T);
  
  // True node corrections (simplified)
  omega += -1.4979 * sinD(2 * D)
           - 0.1500 * sinD(Msun)
           + 0.1226 * sinD(2 * D - Mmoon)
           - 0.1176 * sinD(2 * Mmoon)
           + 0.0801 * sinD(2 * D - 2 * Mmoon);
  
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
// Meeus Ch. 14 + proper apparent sidereal time
// ============================================================
function calculateAscendant(jd: number, latitude: number, geoLongitude: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  
  // Greenwich Mean Sidereal Time (Meeus Ch.12)
  let GMST = 280.46061837 + 360.98564736629 * (jd - 2451545.0)
           + 0.000387933 * T * T - T * T * T / 38710000.0;
  GMST = norm360(GMST);
  
  // Nutation
  const { deltaPsi, deltaEps } = getNutation(T);
  
  // True obliquity
  const eps0 = getObliquity(T);
  const obliquity = eps0 + deltaEps;
  
  // Apparent sidereal time = GMST + nutation in longitude * cos(obliquity)
  const apparentGMST = GMST + deltaPsi * cosD(obliquity);
  
  // Local Sidereal Time
  const LST = norm360(apparentGMST + geoLongitude);
  
  // Ascendant formula (Meeus)
  const y = -cosD(LST);
  const x = sinD(obliquity) * tanD(latitude) + cosD(obliquity) * sinD(LST);
  let asc = atan2D(y, x);
  asc = norm360(asc);
  
  return asc;
}

// ============================================================
// RETROGRADE — Check using 2-point derivative
// ============================================================
function isRetrograde(planet: string, jd: number): boolean {
  if (planet === 'Sun' || planet === 'Moon') return false;
  if (planet === 'Rahu' || planet === 'Ketu') return true;
  
  const delta = 0.5; // half-day step for better derivative
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
  
  const exalt = EXALTATION[planet];
  if (exalt && exalt[0] === signIndex) return 'Exalted';
  
  if (DEBILITATION[planet] === signIndex) return 'Debilitated';
  
  const moola = MOOLATRIKONA[planet];
  if (moola && moola[0] === signIndex && degreeInSign >= moola[1] && degreeInSign <= moola[2]) {
    return 'Moolatrikona';
  }
  
  if (SIGN_LORDS[signIndex] === planet) return 'Own Sign';
  
  const signLord = SIGN_LORDS[signIndex];
  if (FRIENDS[planet]?.includes(signLord)) return "Friend's Sign";
  if (ENEMIES[planet]?.includes(signLord)) return "Enemy's Sign";
  
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
// ============================================================
function getHouseNumber(planetSidLong: number, ascSignIndex: number): number {
  const planetSign = getSignIndex(planetSidLong);
  return ((planetSign - ascSignIndex + 12) % 12) + 1;
}

// ============================================================
// DIVISIONAL CHARTS — Mathematically precise
// ============================================================

// D9 Navamsa: Each sign divided into 9 parts of 3°20'
// Fire signs (Aries, Leo, Sag) start from Aries (0)
// Earth signs (Taurus, Virgo, Cap) start from Capricorn (9)
// Air signs (Gemini, Libra, Aquarius) start from Libra (6)
// Water signs (Cancer, Scorpio, Pisces) start from Cancer (3)
function getNavamsaSign(sidLongitude: number): number {
  const signIndex = getSignIndex(sidLongitude);
  const degInSign = getDegreeInSign(sidLongitude);
  const navamsaPart = Math.floor(degInSign / (30.0 / 9.0));
  // Element group: Fire=0, Earth=1, Air=2, Water=3
  const elementGroup = signIndex % 4;
  const startBases = [0, 9, 6, 3]; // Fire→Aries, Earth→Cap, Air→Libra, Water→Cancer
  return (startBases[elementGroup] + navamsaPart) % 12;
}

// D10 Dashamsa: Each sign divided into 10 parts of 3° each
// Odd signs (1,3,5...) count from same sign; Even signs (2,4,6...) count from 9th sign
function getDashamsaSign(sidLongitude: number): number {
  const signIndex = getSignIndex(sidLongitude);
  const degInSign = getDegreeInSign(sidLongitude);
  const part = Math.floor(degInSign / 3.0);
  if (signIndex % 2 === 0) {
    // Odd signs (0-indexed: Aries=0, Gemini=2, etc.)
    return (signIndex + part) % 12;
  } else {
    // Even signs: count from 9th
    return (signIndex + 9 + part) % 12;
  }
}

// D60 Shastiamsa: Each sign divided into 60 parts of 0.5° each
function getShastiamsaSign(sidLongitude: number): number {
  const signIndex = getSignIndex(sidLongitude);
  const degInSign = getDegreeInSign(sidLongitude);
  const part = Math.floor(degInSign / 0.5);
  if (signIndex % 2 === 0) {
    return (signIndex + part) % 12;
  } else {
    return (signIndex + 6 + part) % 12;
  }
}

// ============================================================
// VIMSHOTTARI DASHA — Precise calculation
// ============================================================
function calculateVimshottariDasha(moonSidLong: number, birthJD: number) {
  const nakIndex = getNakshatraIndex(moonSidLong);
  const nakLord = NAKSHATRA_LORDS[nakIndex];
  
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
// DOSHA ANALYSIS
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
      ? `Mars occupies the ${marsHouse}${ordinal(marsHouse)} house from your Ascendant.${manglikCancelled ? ' However, this dosha is significantly reduced due to cancellation factors in your chart.' : ''} This placement channels heightened Mars energy into ${getHouseTheme(marsHouse)}.`
      : 'Mars is not placed in the 1st, 2nd, 4th, 7th, 8th, or 12th house from Ascendant. No Mangalik Dosha is present.',
    remedies: isManglik && !manglikCancelled ? [
      'Recite Hanuman Chalisa on Tuesdays',
      'Wear a red coral gemstone after expert consultation',
      'Channel Mars energy through regular physical exercise',
      'Perform Mangal Shanti puja',
      'Consider Kundli matching for marriage compatibility'
    ] : []
  });
  
  // --- Kaal Sarp Dosha ---
  const rahuLong = rahu.siderealLongitude;
  const ketuLong = ketu.siderealLongitude;
  const sevenPlanets = planets.filter(p => !['Rahu','Ketu'].includes(p.name));
  
  function inArc(pLong: number, startLong: number, endLong: number): boolean {
    if (startLong < endLong) return pLong >= startLong && pLong <= endLong;
    return pLong >= startLong || pLong <= endLong;
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
      ? `All seven planets are within the Rahu-Ketu axis, forming ${kaalSarpType} Kaal Sarp Yoga. This indicates concentrated karmic energy.`
      : 'Planets are distributed on both sides of the Rahu-Ketu axis. No Kaal Sarp Dosha.',
    remedies: isKaalSarp ? [
      'Perform Kaal Sarp Dosh Nivaran Puja at Trimbakeshwar',
      'Chant "Om Namah Shivaya" 108 times daily',
      'Practice mindfulness meditation',
      'Feed birds on Saturdays',
      'Wear Gomed or Cat\'s Eye after consultation'
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
      ? `${sunRahuConjunct ? `Sun and Rahu are within ${normalizedDist.toFixed(1)}\u00b0` : 'Rahu occupies the 9th house'}. Ancestral karmic patterns indicated.`
      : 'No Pitra Dosha detected.',
    remedies: isPitra ? [
      'Perform Tarpan for ancestors on Amavasya',
      'Offer water to the Sun at sunrise',
      'Donate food or clothing to elderly on Sundays',
      'Plant a Peepal tree',
      'Perform Pind Daan if recommended'
    ] : []
  });
  
  return doshas;
}

// ============================================================
// SADE SATI — Current transit Saturn
// ============================================================
function analyzeSadeSati(moonSignIndex: number) {
  const now = new Date();
  const nowJD = dateToJD(now.getFullYear(), now.getMonth() + 1, now.getDate(),
    (now.getHours() + now.getMinutes() / 60) / 24);
  const nowAyanamsha = getLahiriAyanamsha(nowJD);
  
  const saturnTropLong = getPlanetLongitude(nowJD, 'Saturn');
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
    effects: isActive ? getSadeSatiEffects(phase!) : 'Sade Sati is not active for your Moon sign.',
    recommendations: isActive ? [
      'Practice patience and disciplined effort',
      'Prioritize health and self-care routines',
      'Chant "Om Sham Shanaishcharaya Namah" on Saturdays',
      'Consult before wearing Blue Sapphire',
      'Donate mustard oil or dark cloth on Saturdays',
      'Light a mustard oil lamp under a Peepal tree on Saturdays'
    ] : []
  };
}

function getSadeSatiEffects(phase: string): string {
  const effects: Record<string, string> = {
    'Rising (1st Phase)': 'Saturn transits the 12th from your Moon, affecting emotional landscape and subconscious. Teaches emotional resilience.',
    'Peak (2nd Phase)': 'Saturn directly transits your Moon sign. Most intense phase affecting mind and wellbeing. Career shifts and deep reflection.',
    'Setting (3rd Phase)': 'Saturn transits the 2nd from your Moon, impacting finances and family. Lessons integrate as this cycle concludes.'
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
    Sun: `SUN illuminates ${s}, activating ${e}-element themes of confidence and authority.`,
    Moon: `MON flows through ${s}, bringing emotional awareness to ${e}-element matters.`,
    Mars: retro ? `MAR retrograde in ${s} redirects energy inward. Review plans.` : `MAR in ${s} energizes ${e}-element pursuits.`,
    Mercury: retro ? `MER retrograde in ${s} invites revision. Double-check communications.` : `MER in ${s} sharpens ${e}-element communication.`,
    Jupiter: `JUP in ${s} expands ${e}-element domains with wisdom and opportunity.`,
    Venus: retro ? `VEN retrograde in ${s} asks to reassess values and relationships.` : `VEN in ${s} brings harmony to ${e}-element expressions.`,
    Saturn: `SAT in ${s} teaches discipline through ${e}-element lessons.`,
    Rahu: `RAH in ${s} amplifies ambition in ${e}-element domains.`,
    Ketu: `KET in ${s} promotes spiritual detachment from ${e}-element attachments.`
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
  else if (p1.dignity === "Friend's Sign") s += 6;
  else if (p1.dignity === 'Debilitated') s -= 18;
  else if (p1.dignity === "Enemy's Sign") s -= 8;
  
  if (p2.dignity === 'Exalted') s += 16;
  else if (p2.dignity === 'Own Sign' || p2.dignity === 'Moolatrikona') s += 10;
  else if (p2.dignity === 'Debilitated') s -= 12;
  
  if (goodHouses.includes(p1.house)) s += 10;
  if (goodHouses.includes(p2.house)) s += 6;
  if (p1.retrograde && p1.name !== 'Rahu' && p1.name !== 'Ketu') s -= 4;
  
  return Math.min(95, Math.max(12, s));
}

const ASC_TRAITS: Record<number, string> = {
  0: 'a pioneering spirit, natural leadership, and fearless initiative.',
  1: 'steadfast determination, refined aesthetic sense, and practical wisdom.',
  2: 'intellectual curiosity, versatile communication, and quick adaptability.',
  3: 'deep emotional intelligence, nurturing instinct, and intuitive perception.',
  4: 'magnetic charisma, creative confidence, and generous spirit.',
  5: 'analytical precision, attention to detail, and service-oriented mindset.',
  6: 'diplomatic grace, aesthetic appreciation, and partnership orientation.',
  7: 'transformative depth, investigative ability, and emotional intensity.',
  8: 'philosophical vision, adventurous enthusiasm, and boundless optimism.',
  9: 'ambitious determination, strategic thinking, and enduring patience.',
  10: 'innovative thinking, humanitarian ideals, and unique perspective.',
  11: 'spiritual sensitivity, creative imagination, and deep compassion.'
};

function buildPersonality(ascSign: number, moonSign: number, sun: PlanetData, moon: PlanetData, _mars: PlanetData): string {
  return `Your ${SIGNS[ascSign]} Ascendant gives you ${ASC_TRAITS[ascSign]}\n\nWith Moon in ${SIGNS[moonSign]} (${moon.nakshatra}, Pada ${moon.nakshatraPada}), your emotional core operates through ${SIGN_ELEMENTS[moonSign].toLowerCase()} energy. The ${moon.nakshatra} nakshatra lends ${getNakshatraQuality(moon.nakshatraIndex)} to your emotional nature.\n\nThe Sun in ${sun.sign} in your ${sun.house}${ordinal(sun.house)} house directs your life force toward ${getHouseTheme(sun.house)}.`;
}

function buildCareer(planets: PlanetData[], ascSign: number, _sun: PlanetData, _saturn: PlanetData, _jupiter: PlanetData, mercury: PlanetData): string {
  const tenthSign = (ascSign + 9) % 12;
  const tenthLord = SIGN_LORDS[tenthSign];
  const tenthLordP = planets.find(p => p.name === tenthLord);
  
  const fields: Record<string, string> = {
    Sun: 'government, leadership, administration, or authority roles',
    Moon: 'hospitality, healthcare, public relations, or counseling',
    Mars: 'engineering, technology, military, sports, or real estate',
    Mercury: 'writing, IT, data science, trading, or communication',
    Jupiter: 'education, law, finance, consulting, or advisory roles',
    Venus: 'arts, entertainment, luxury goods, design, or diplomacy',
    Saturn: 'research, manufacturing, construction, or systematic work'
  };
  
  let text = `Your 10th house falls in ${SIGNS[tenthSign]}, ruled by ${tenthLord}${tenthLordP ? ` placed in ${tenthLordP.sign} (H${tenthLordP.house})` : ''}. Aptitude for ${fields[tenthLord] || 'diverse fields'}.`;
  text += `\n\nMER in H${mercury.house} indicates intellectual strengths best applied in ${getHouseTheme(mercury.house)}.`;
  return text;
}

function buildLove(venus: PlanetData, mars: PlanetData, jupiter: PlanetData, _moon: PlanetData, ascSign: number): string {
  const seventhSign = (ascSign + 6) % 12;
  const seventhLord = SIGN_LORDS[seventhSign];
  
  let text = `VEN in ${venus.sign} (H${venus.house}) defines your relationship style. ${venus.dignity === 'Exalted' ? 'Exalted VEN bestows natural charm and romantic fulfillment.' : venus.dignity === 'Debilitated' ? 'VEN here asks to build authentic self-worth.' : `VEN in ${venus.sign} expresses love through ${SIGN_ELEMENTS[venus.signIndex].toLowerCase()} qualities.`}`;
  text += `\n\nYour 7th house is ${SIGNS[seventhSign]}, ruled by ${seventhLord}. Attracted to partners with ${getSignPartnerTraits(seventhSign)}.`;
  if (mars.house === 7) text += '\n\nMAR in H7 brings passion to relationships.';
  if (jupiter.house === 7) text += '\n\nJUP in H7 indicates a wise, generous partner.';
  return text;
}

function buildFinance(jupiter: PlanetData, venus: PlanetData, saturn: PlanetData, planets: PlanetData[], ascSign: number): string {
  const secondLord = SIGN_LORDS[(ascSign + 1) % 12];
  const eleventhLord = SIGN_LORDS[(ascSign + 10) % 12];
  
  let text = `2nd lord (${secondLord}) governs earned wealth. 11th lord (${eleventhLord}) controls income gains.`;
  const jStrong = jupiter.dignity === 'Exalted' || jupiter.dignity === 'Own Sign' || jupiter.dignity === 'Moolatrikona';
  text += `\n\nJUP in ${jupiter.sign} (H${jupiter.house}): ${jStrong ? 'strong natural abundance' : 'moderate potential growing through wisdom'}.`;
  if (saturn.house === 2 || saturn.house === 11) text += '\n\nSAT in wealth houses favors disciplined wealth-building.';
  return text;
}

function buildKarma(saturn: PlanetData, rahu: PlanetData, ketu: PlanetData, _ascSign: number): string {
  return `SAT in ${saturn.sign} (H${saturn.house}): karmic assignment in ${getHouseTheme(saturn.house)}.\n\nRAH in ${rahu.sign} (H${rahu.house}): soul seeks growth in ${getHouseTheme(rahu.house)}.\n\nKET in ${ketu.sign} (H${ketu.house}): past-life mastery in ${getHouseTheme(ketu.house)}.`;
}

function getNakshatraQuality(nakIdx: number): string {
  const qualities = [
    'swiftness and healing energy', 'fierce determination', 'purifying fire and authority',
    'growth and creativity', 'searching curiosity', 'intellectual breakthrough',
    'renewal and wisdom', 'nourishing stability', 'mystical intensity',
    'regal authority', 'creative pleasure', 'sustained power',
    'skillful craftsmanship', 'brilliance and beauty', 'independence and self-direction',
    'purposeful determination', 'devoted friendship', 'protective authority',
    'radical insight', 'invincible resolve', 'universal responsibility',
    'deep listening ability', 'rhythmic abundance', 'vast healing ability',
    'fiery transformative power', 'deep oceanic wisdom', 'nurturing completion'
  ];
  return qualities[nakIdx] || 'distinctive energy';
}

function getSignPartnerTraits(signIdx: number): string {
  const traits: Record<number, string> = {
    0: 'courage and directness', 1: 'stability and loyalty',
    2: 'wit and versatility', 3: 'emotional depth and family values',
    4: 'confidence and warmth', 5: 'intelligence and practicality',
    6: 'elegance and fairness', 7: 'intensity and passion',
    8: 'adventure and philosophy', 9: 'ambition and reliability',
    10: 'uniqueness and freedom', 11: 'sensitivity and imagination'
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
    1: 'self-identity and vitality',
    2: 'wealth, family, and speech',
    3: 'courage, communication, and siblings',
    4: 'home, mother, and inner peace',
    5: 'creativity, children, and education',
    6: 'health, service, and competition',
    7: 'partnerships and marriage',
    8: 'transformation and longevity',
    9: 'higher learning and dharma',
    10: 'career and public achievement',
    11: 'gains and aspirations',
    12: 'liberation and spiritual surrender'
  };
  return themes[house] || 'life experiences';
}

// ============================================================
// MAIN INTERFACES & ENTRY POINT
// ============================================================
export interface PlanetData {
  name: string; symbol: string; abbr: string;
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
      name: pName, symbol: PLANET_SYMBOLS[i], abbr: PLANET_ABBR[pName],
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
      name: nodeName, symbol: PLANET_SYMBOLS[idx], abbr: PLANET_ABBR[nodeName],
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
// EXPORTED TEST HELPERS
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
