// ============================================================
// Cosmic Dharma - Vedic Astrology Calculation Engine
// Sidereal Zodiac with Lahiri Ayanamsha
// ============================================================

// --- Constants ---
const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const SIGNS_SANSKRIT = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];
const SIGN_LORDS = ['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
const SIGN_ELEMENTS = ['Fire','Earth','Air','Water','Fire','Earth','Air','Water','Fire','Earth','Air','Water'];
const SIGN_QUALITIES = ['Cardinal','Fixed','Mutable','Cardinal','Fixed','Mutable','Cardinal','Fixed','Mutable','Cardinal','Fixed','Mutable'];

const NAKSHATRAS = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha',
  'Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Moola','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'
];
const NAKSHATRA_LORDS = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury','Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury','Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
const NAKSHATRA_DEITIES = ['Ashwini Kumaras','Yama','Agni','Brahma','Soma','Rudra','Aditi','Brihaspati','Naga','Pitris','Bhaga','Aryaman','Savitar','Tvashtar','Vayu','Indragni','Mitra','Indra','Nirriti','Apas','Vishvedevas','Vishnu','Vasus','Varuna','Ajaikapada','Ahirbudhnya','Pushan'];

const PLANET_NAMES = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];
const PLANET_SYMBOLS = ['☉','☽','♂','☿','♃','♀','♄','☊','☋'];

// Vimshottari Dasha periods (years)
const DASHA_YEARS: Record<string, number> = { 'Ketu':7,'Venus':20,'Sun':6,'Moon':10,'Mars':7,'Rahu':18,'Jupiter':16,'Saturn':19,'Mercury':17 };
const DASHA_ORDER = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];

// Lahiri Ayanamsha calculation (approximation)
function getLahiriAyanamsha(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  // Lahiri ayanamsha: based on IAU standard
  const ayanamsha = 23.85 + 0.0137 * (jd - 2451545.0) / 365.25;
  return ayanamsha % 360;
}

// Julian Day Number from date
function dateToJD(year: number, month: number, day: number, hour: number = 0): number {
  let y = year, m = month;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + hour / 24.0 + B - 1524.5;
}

// Mean orbital elements for planetary longitude calculation
function getMeanLongitude(jd: number, planet: string): number {
  const T = (jd - 2451545.0) / 36525.0;
  let L = 0;
  
  switch(planet) {
    case 'Sun':
      L = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
      const M = 357.52911 + 35999.05029 * T;
      const Mrad = M * Math.PI / 180;
      L += (1.9146 - 0.004817 * T) * Math.sin(Mrad) + 0.019993 * Math.sin(2 * Mrad);
      break;
    case 'Moon':
      L = 218.3165 + 481267.8813 * T;
      const D = 297.8502 + 445267.1115 * T;
      const Ms = 357.5291 + 35999.0503 * T;
      const Mm = 134.9634 + 477198.8676 * T;
      const F = 93.2720 + 483202.0175 * T;
      const Dr = D * Math.PI / 180;
      const Msr = Ms * Math.PI / 180;
      const Mmr = Mm * Math.PI / 180;
      const Fr = F * Math.PI / 180;
      L += 6.289 * Math.sin(Mmr) + 1.274 * Math.sin(2 * Dr - Mmr) + 0.658 * Math.sin(2 * Dr) +
           0.214 * Math.sin(2 * Mmr) - 0.186 * Math.sin(Msr) - 0.114 * Math.sin(2 * Fr);
      break;
    case 'Mars':
      L = 355.433 + 19140.2993 * T;
      const Mmars = 19.3730 + 19139.8585 * T;
      const Mmarsr = Mmars * Math.PI / 180;
      L += 10.691 * Math.sin(Mmarsr) + 0.623 * Math.sin(2 * Mmarsr);
      break;
    case 'Mercury':
      L = 252.251 + 149472.6746 * T;
      const Mmerc = 174.7948 + 149472.5153 * T;
      const Mmercr = Mmerc * Math.PI / 180;
      L += 23.440 * Math.sin(Mmercr) + 2.9818 * Math.sin(2 * Mmercr);
      break;
    case 'Jupiter':
      L = 34.3515 + 3034.9057 * T;
      const Mjup = 20.0202 + 3034.6962 * T;
      const Mjupr = Mjup * Math.PI / 180;
      L += 5.555 * Math.sin(Mjupr) + 0.168 * Math.sin(2 * Mjupr);
      break;
    case 'Venus':
      L = 181.9798 + 58517.8157 * T;
      const Mven = 50.4161 + 58517.8039 * T;
      const Mvenr = Mven * Math.PI / 180;
      L += 0.7758 * Math.sin(Mvenr) + 0.0033 * Math.sin(2 * Mvenr);
      break;
    case 'Saturn':
      L = 50.077 + 1222.1138 * T;
      const Msat = 317.0207 + 1222.1138 * T;
      const Msatr = Msat * Math.PI / 180;
      L += 6.406 * Math.sin(Msatr) + 0.317 * Math.sin(2 * Msatr);
      break;
  }
  
  return ((L % 360) + 360) % 360;
}

// Calculate Rahu/Ketu (mean lunar nodes)
function getRahuKetu(jd: number): { rahu: number; ketu: number } {
  const T = (jd - 2451545.0) / 36525.0;
  let rahu = 125.0445 - 1934.1363 * T + 0.0020754 * T * T;
  rahu = ((rahu % 360) + 360) % 360;
  const ketu = (rahu + 180) % 360;
  return { rahu, ketu };
}

// Get sidereal longitude
function getSiderealLongitude(tropicalLong: number, ayanamsha: number): number {
  let sid = tropicalLong - ayanamsha;
  return ((sid % 360) + 360) % 360;
}

// Get sign index from longitude
function getSignIndex(longitude: number): number {
  return Math.floor(longitude / 30);
}

// Get degree within sign
function getDegreeInSign(longitude: number): number {
  return longitude % 30;
}

// Get nakshatra from longitude
function getNakshatraIndex(longitude: number): number {
  return Math.floor(longitude / (360 / 27));
}

// Get nakshatra pada
function getNakshatraPada(longitude: number): number {
  const nakshatraSpan = 360 / 27; // 13.333...
  const posInNakshatra = longitude % nakshatraSpan;
  return Math.floor(posInNakshatra / (nakshatraSpan / 4)) + 1;
}

// Calculate ascendant (Lagna)
function calculateAscendant(jd: number, latitude: number, longitude: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  // Local Sidereal Time
  const GMST = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T;
  const LST = ((GMST + longitude) % 360 + 360) % 360;
  
  const obliquity = 23.4393 - 0.0130 * T;
  const oblRad = obliquity * Math.PI / 180;
  const latRad = latitude * Math.PI / 180;
  const lstRad = LST * Math.PI / 180;
  
  const y = -Math.cos(lstRad);
  const x = Math.sin(oblRad) * Math.tan(latRad) + Math.cos(oblRad) * Math.sin(lstRad);
  let asc = Math.atan2(y, x) * 180 / Math.PI;
  asc = ((asc % 360) + 360) % 360;
  
  return asc;
}

// Determine if planet is retrograde (simplified)
function isRetrograde(planet: string, jd: number): boolean {
  if (planet === 'Sun' || planet === 'Moon' || planet === 'Rahu' || planet === 'Ketu') return false;
  const L1 = getMeanLongitude(jd, planet);
  const L2 = getMeanLongitude(jd + 1, planet);
  let diff = L2 - L1;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
}

// Planet exaltation signs
const EXALTATION: Record<string, number> = { 'Sun':0,'Moon':1,'Mars':9,'Mercury':5,'Jupiter':3,'Venus':11,'Saturn':6 };
const DEBILITATION: Record<string, number> = { 'Sun':6,'Moon':7,'Mars':3,'Mercury':11,'Jupiter':9,'Venus':5,'Saturn':0 };

function getPlanetDignity(planet: string, signIndex: number): string {
  if (planet === 'Rahu' || planet === 'Ketu') return 'Neutral';
  if (EXALTATION[planet] === signIndex) return 'Exalted';
  if (DEBILITATION[planet] === signIndex) return 'Debilitated';
  if (SIGN_LORDS[signIndex] === planet) return 'Own Sign';
  // Moolatrikona (simplified)
  const moola: Record<string, number> = { 'Sun':4,'Moon':1,'Mars':0,'Mercury':5,'Jupiter':8,'Venus':6,'Saturn':10 };
  if (moola[planet] === signIndex) return 'Moolatrikona';
  // Friend/enemy (simplified)
  return 'Neutral';
}

// Calculate house cusps (equal house system)
function calculateHouses(ascLongitude: number): number[] {
  const houses: number[] = [];
  for (let i = 0; i < 12; i++) {
    houses.push((ascLongitude + i * 30) % 360);
  }
  return houses;
}

// Get house number for a planet
function getHouseNumber(planetLong: number, ascLong: number): number {
  let diff = planetLong - ascLong;
  if (diff < 0) diff += 360;
  return Math.floor(diff / 30) + 1;
}

// Calculate Navamsa (D9)
function getNavamsaSign(longitude: number): number {
  const signIndex = getSignIndex(longitude);
  const degInSign = getDegreeInSign(longitude);
  const navamsaPada = Math.floor(degInSign / (30 / 9));
  // Starting navamsa sign depends on element of the rashi
  const startSigns = [0, 9, 6, 3]; // Fire, Earth, Air, Water
  const element = signIndex % 4;
  return (startSigns[element] + navamsaPada) % 12;
}

// Calculate D10 (Dashamsa)
function getDashamsaSign(longitude: number): number {
  const signIndex = getSignIndex(longitude);
  const degInSign = getDegreeInSign(longitude);
  const dashamsa = Math.floor(degInSign / 3);
  // Odd signs start from same sign, even signs start from 9th
  if (signIndex % 2 === 0) {
    return (signIndex + dashamsa) % 12;
  } else {
    return (signIndex + 9 + dashamsa) % 12;
  }
}

// Calculate D60 (Shastiamsa)
function getShastiamsaSign(longitude: number): number {
  const degInSign = getDegreeInSign(longitude);
  const shastiamsa = Math.floor(degInSign * 2); // 60 divisions of 0.5 degrees
  return shastiamsa % 12;
}

// Vimshottari Dasha calculation
function calculateVimshottariDasha(moonLongitude: number, birthJD: number) {
  const nakshatraIndex = getNakshatraIndex(moonLongitude);
  const nakshatraLord = NAKSHATRA_LORDS[nakshatraIndex];
  
  // Proportion of nakshatra remaining at birth
  const nakshatraSpan = 360 / 27;
  const posInNakshatra = moonLongitude % nakshatraSpan;
  const proportionRemaining = 1 - (posInNakshatra / nakshatraSpan);
  
  // Find starting dasha lord
  const startIndex = DASHA_ORDER.indexOf(nakshatraLord);
  
  // Build dasha periods
  const dashas: Array<{
    planet: string;
    startDate: string;
    endDate: string;
    years: number;
    isCurrent: boolean;
    antardasha: Array<{planet: string; startDate: string; endDate: string; isCurrent: boolean}>;
  }> = [];
  
  let currentJD = birthJD;
  const now = new Date();
  const nowJD = dateToJD(now.getFullYear(), now.getMonth() + 1, now.getDate());
  
  // First dasha has remaining portion
  for (let i = 0; i < 9; i++) {
    const planetIndex = (startIndex + i) % 9;
    const planet = DASHA_ORDER[planetIndex];
    const fullYears = DASHA_YEARS[planet];
    const years = i === 0 ? fullYears * proportionRemaining : fullYears;
    const daysInPeriod = years * 365.25;
    const endJD = currentJD + daysInPeriod;
    
    const startDate = jdToDate(currentJD);
    const endDate = jdToDate(endJD);
    const isCurrent = nowJD >= currentJD && nowJD < endJD;
    
    // Calculate Antardasha
    const antardasha: Array<{planet: string; startDate: string; endDate: string; isCurrent: boolean}> = [];
    let adJD = currentJD;
    for (let j = 0; j < 9; j++) {
      const adPlanetIndex = (planetIndex + j) % 9;
      const adPlanet = DASHA_ORDER[adPlanetIndex];
      const adYears = (years * DASHA_YEARS[adPlanet]) / 120;
      const adDays = adYears * 365.25;
      const adEndJD = adJD + adDays;
      
      antardasha.push({
        planet: adPlanet,
        startDate: jdToDate(adJD),
        endDate: jdToDate(adEndJD),
        isCurrent: nowJD >= adJD && nowJD < adEndJD
      });
      adJD = adEndJD;
    }
    
    dashas.push({ planet, startDate, endDate, years: parseFloat(years.toFixed(2)), isCurrent, antardasha });
    currentJD = endJD;
  }
  
  return dashas;
}

// JD to date string
function jdToDate(jd: number): string {
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
  
  const day = B - D - Math.floor(30.6001 * E);
  const month = E < 14 ? E - 1 : E - 13;
  const year = month > 2 ? C - 4716 : C - 4715;
  
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Dosha Analysis
function analyzeDoshas(planets: PlanetData[], ascSignIndex: number) {
  const doshas: Array<{
    name: string;
    detected: boolean;
    severity: number; // 0-100
    description: string;
    remedies: string[];
  }> = [];
  
  const mars = planets.find(p => p.name === 'Mars');
  const saturn = planets.find(p => p.name === 'Saturn');
  const rahu = planets.find(p => p.name === 'Rahu');
  const ketu = planets.find(p => p.name === 'Ketu');
  const sun = planets.find(p => p.name === 'Sun');
  
  // Mangalik Dosha
  if (mars) {
    const marsHouse = mars.house;
    const manglikHouses = [1, 2, 4, 7, 8, 12];
    const isManglik = manglikHouses.includes(marsHouse);
    const severity = isManglik ? ([1, 7, 8].includes(marsHouse) ? 75 : 45) : 0;
    
    doshas.push({
      name: 'Mangalik Dosha',
      detected: isManglik,
      severity,
      description: isManglik 
        ? `Mars is placed in the ${marsHouse}${getOrdinal(marsHouse)} house from Ascendant. This is a classical Mangalik placement that influences relationship dynamics and personal energy patterns. Modern interpretation views this as heightened Mars energy that needs constructive channeling.`
        : 'No Mangalik Dosha detected. Mars is well-placed for harmonious relationship dynamics.',
      remedies: isManglik ? [
        'Chant Hanuman Chalisa on Tuesdays',
        'Wear a coral gemstone after consultation',
        'Practice physical exercise to channel Mars energy',
        'Consider matching with another Manglik partner',
        'Perform Mangal Shanti Puja'
      ] : []
    });
  }
  
  // Kaal Sarp Dosha
  if (rahu && ketu) {
    const rahuLong = rahu.longitude;
    const ketuLong = ketu.longitude;
    const otherPlanets = planets.filter(p => p.name !== 'Rahu' && p.name !== 'Ketu');
    
    let allOneSide = true;
    const rahuToKetu = rahuLong < ketuLong;
    
    for (const p of otherPlanets) {
      if (rahuToKetu) {
        if (!(p.longitude >= rahuLong && p.longitude <= ketuLong)) {
          allOneSide = false;
          break;
        }
      } else {
        if (!(p.longitude >= rahuLong || p.longitude <= ketuLong)) {
          allOneSide = false;
          break;
        }
      }
    }
    
    // Check other side too
    if (!allOneSide) {
      allOneSide = true;
      for (const p of otherPlanets) {
        if (rahuToKetu) {
          if (!(p.longitude <= rahuLong || p.longitude >= ketuLong)) {
            allOneSide = false;
            break;
          }
        } else {
          if (!(p.longitude <= rahuLong && p.longitude >= ketuLong)) {
            allOneSide = false;
            break;
          }
        }
      }
    }
    
    doshas.push({
      name: 'Kaal Sarp Dosha',
      detected: allOneSide,
      severity: allOneSide ? 60 : 0,
      description: allOneSide
        ? 'All planets are positioned between Rahu and Ketu, forming Kaal Sarp Yoga. This indicates a karmic pattern from past lives that creates intense focus and transformation in specific life areas. Many successful leaders and innovators have this yoga.'
        : 'No Kaal Sarp Dosha detected. Planets are distributed on both sides of the Rahu-Ketu axis.',
      remedies: allOneSide ? [
        'Visit Trimbakeshwar temple for Kaal Sarp Puja',
        'Chant Rahu mantra on Saturdays',
        'Practice meditation and mindfulness',
        'Feed birds and animals regularly',
        'Wear a Gomed (Hessonite) after consultation'
      ] : []
    });
  }
  
  // Pitra Dosha
  if (sun && rahu) {
    const sunHouse = sun.house;
    const rahuHouse = rahu.house;
    const isPitra = sunHouse === rahuHouse || Math.abs(sun.longitude - rahu.longitude) < 15;
    
    doshas.push({
      name: 'Pitra Dosha',
      detected: isPitra,
      severity: isPitra ? 50 : 0,
      description: isPitra
        ? 'Sun-Rahu conjunction or close proximity indicates Pitra Dosha, suggesting ancestral karmic debts. This is an invitation to honor your lineage and create positive karma through service and gratitude.'
        : 'No Pitra Dosha detected. The Sun and Rahu are well-separated, indicating clear ancestral blessings.',
      remedies: isPitra ? [
        'Perform Tarpan on Amavasya (New Moon)',
        'Offer water to Sun at sunrise',
        'Donate to elderly care organizations',
        'Plant a Peepal tree',
        'Perform Narayan Bali Puja if recommended by pandit'
      ] : []
    });
  }
  
  return doshas;
}

// Sade Sati Analysis
function analyzeSadeSati(moonSignIndex: number, saturnLong: number) {
  const saturnSign = getSignIndex(saturnLong);
  const prevSign = (moonSignIndex - 1 + 12) % 12;
  const nextSign = (moonSignIndex + 1) % 12;
  
  let phase: string | null = null;
  let isActive = false;
  
  if (saturnSign === prevSign) {
    phase = 'Rising (1st Phase)';
    isActive = true;
  } else if (saturnSign === moonSignIndex) {
    phase = 'Peak (2nd Phase)';
    isActive = true;
  } else if (saturnSign === nextSign) {
    phase = 'Setting (3rd Phase)';
    isActive = true;
  }
  
  // Saturn transit duration approximation (2.5 years per sign)
  const saturnDegInSign = getDegreeInSign(saturnLong);
  const progressInSign = saturnDegInSign / 30;
  
  // Calculate approximate dates
  const now = new Date();
  const yearsPerSign = 2.5;
  const remainingInCurrentSign = (1 - progressInSign) * yearsPerSign;
  
  let startDate = '', endDate = '', progress = 0;
  
  if (isActive) {
    if (phase === 'Rising (1st Phase)') {
      const elapsed = progressInSign * yearsPerSign;
      startDate = new Date(now.getTime() - elapsed * 365.25 * 86400000).toISOString().split('T')[0];
      endDate = new Date(now.getTime() + (7.5 - elapsed) * 365.25 * 86400000).toISOString().split('T')[0];
      progress = (elapsed / 7.5) * 100;
    } else if (phase === 'Peak (2nd Phase)') {
      const elapsed = yearsPerSign + progressInSign * yearsPerSign;
      startDate = new Date(now.getTime() - elapsed * 365.25 * 86400000).toISOString().split('T')[0];
      endDate = new Date(now.getTime() + (7.5 - elapsed) * 365.25 * 86400000).toISOString().split('T')[0];
      progress = (elapsed / 7.5) * 100;
    } else {
      const elapsed = 2 * yearsPerSign + progressInSign * yearsPerSign;
      startDate = new Date(now.getTime() - elapsed * 365.25 * 86400000).toISOString().split('T')[0];
      endDate = new Date(now.getTime() + (7.5 - elapsed) * 365.25 * 86400000).toISOString().split('T')[0];
      progress = (elapsed / 7.5) * 100;
    }
  }
  
  return {
    isActive,
    phase,
    moonSign: SIGNS[moonSignIndex],
    saturnSign: SIGNS[saturnSign],
    startDate,
    endDate,
    progress: Math.min(100, Math.max(0, progress)),
    effects: isActive ? getSadeSatiEffects(phase!) : 'Sade Sati is not currently active. This is a favorable period for stability and growth.',
    recommendations: isActive ? [
      'Practice patience and discipline',
      'Focus on health and self-care',
      'Chant Shani mantra on Saturdays',
      'Wear a Blue Sapphire only after proper consultation',
      'Donate to underprivileged on Saturdays',
      'Light a mustard oil lamp on Saturdays'
    ] : []
  };
}

function getSadeSatiEffects(phase: string): string {
  switch(phase) {
    case 'Rising (1st Phase)':
      return 'The first phase affects your emotional landscape and family dynamics. You may experience shifts in your comfort zone that ultimately lead to emotional maturity. This is Saturn teaching you resilience through change.';
    case 'Peak (2nd Phase)':
      return 'The peak phase directly influences your mind and core identity. This is the most transformative period where Saturn restructures your fundamental approach to life. Career changes, relationship evolution, and deep self-reflection are common.';
    case 'Setting (3rd Phase)':
      return 'The final phase impacts your finances and immediate environment. The lessons are integrating and you\'re building a stronger foundation. Financial discipline and resource management become key themes.';
    default:
      return '';
  }
}

function getOrdinal(n: number): string {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return (s[(v - 20) % 10] || s[v] || s[0]);
}

// Planetary transit analysis
function getCurrentTransits(jd: number, ayanamsha: number) {
  const transits: Array<{planet: string; sign: string; signIndex: number; degree: number; retrograde: boolean; effects: string}> = [];
  
  for (const planet of ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn']) {
    const tropLong = getMeanLongitude(jd, planet);
    const sidLong = getSiderealLongitude(tropLong, ayanamsha);
    const signIdx = getSignIndex(sidLong);
    const retro = isRetrograde(planet, jd);
    
    transits.push({
      planet,
      sign: SIGNS[signIdx],
      signIndex: signIdx,
      degree: parseFloat(getDegreeInSign(sidLong).toFixed(2)),
      retrograde: retro,
      effects: getTransitEffect(planet, signIdx, retro)
    });
  }
  
  // Rahu/Ketu
  const { rahu, ketu } = getRahuKetu(jd);
  const sidRahu = getSiderealLongitude(rahu, ayanamsha);
  const sidKetu = getSiderealLongitude(ketu, ayanamsha);
  
  transits.push({
    planet: 'Rahu',
    sign: SIGNS[getSignIndex(sidRahu)],
    signIndex: getSignIndex(sidRahu),
    degree: parseFloat(getDegreeInSign(sidRahu).toFixed(2)),
    retrograde: true,
    effects: getTransitEffect('Rahu', getSignIndex(sidRahu), true)
  });
  
  transits.push({
    planet: 'Ketu',
    sign: SIGNS[getSignIndex(sidKetu)],
    signIndex: getSignIndex(sidKetu),
    degree: parseFloat(getDegreeInSign(sidKetu).toFixed(2)),
    retrograde: true,
    effects: getTransitEffect('Ketu', getSignIndex(sidKetu), true)
  });
  
  return transits;
}

function getTransitEffect(planet: string, signIdx: number, retro: boolean): string {
  const signName = SIGNS[signIdx];
  const effects: Record<string, string> = {
    'Sun': `Illuminating ${signName} themes — focus on ${SIGN_ELEMENTS[signIdx].toLowerCase()} element qualities. Express your authentic self.`,
    'Moon': `Emotional currents flowing through ${signName}. Honor your feelings and nurture your inner world.`,
    'Mars': `${retro ? 'Retrograde Mars in ' + signName + ' — redirect energy inward, avoid impulsive actions.' : 'Mars energizes ' + signName + ' — channel drive into productive pursuits.'}`,
    'Mercury': `${retro ? 'Mercury retrograde in ' + signName + ' — review, revise, reconnect. Avoid signing major contracts.' : 'Mercury in ' + signName + ' — clear communication and intellectual growth.'}`,
    'Jupiter': `Jupiter's expansive blessings in ${signName}. Growth, wisdom, and opportunities in ${SIGN_ELEMENTS[signIdx].toLowerCase()} domains.`,
    'Venus': `${retro ? 'Venus retrograde in ' + signName + ' — reassess values and relationships.' : 'Venus graces ' + signName + ' — beauty, harmony, and creative inspiration.'}`,
    'Saturn': `Saturn's structured lessons in ${signName}. Discipline and perseverance build lasting foundations.`,
    'Rahu': `Rahu's ambitious drive in ${signName}. Pursue growth mindfully, avoid shortcuts.`,
    'Ketu': `Ketu's spiritual detachment in ${signName}. Release attachments, embrace inner wisdom.`
  };
  return effects[planet] || '';
}

// AI Insight Generation
function generateInsights(planets: PlanetData[], ascSignIndex: number, moonSignIndex: number) {
  const ascLord = SIGN_LORDS[ascSignIndex];
  const moonLord = SIGN_LORDS[moonSignIndex];
  const sun = planets.find(p => p.name === 'Sun')!;
  const moon = planets.find(p => p.name === 'Moon')!;
  const mars = planets.find(p => p.name === 'Mars')!;
  const mercury = planets.find(p => p.name === 'Mercury')!;
  const jupiter = planets.find(p => p.name === 'Jupiter')!;
  const venus = planets.find(p => p.name === 'Venus')!;
  const saturn = planets.find(p => p.name === 'Saturn')!;
  
  // Personality
  const personality = generatePersonalityInsight(ascSignIndex, moonSignIndex, sun, moon, ascLord);
  
  // Career
  const career = generateCareerInsight(planets, ascSignIndex);
  
  // Love
  const love = generateLoveInsight(venus, mars, jupiter, moon, ascSignIndex);
  
  // Finance
  const finance = generateFinanceInsight(jupiter, venus, saturn, planets, ascSignIndex);
  
  // Karma
  const karma = generateKarmaInsight(saturn, rahu_ketu(planets), ascSignIndex, moonSignIndex);
  
  // Strengths radar data
  const strengths = {
    leadership: calculateStrength(sun, mars, ascSignIndex),
    intellect: calculateStrength(mercury, jupiter, ascSignIndex),
    creativity: calculateStrength(venus, moon, ascSignIndex),
    discipline: calculateStrength(saturn, mars, ascSignIndex),
    spirituality: calculateStrength(jupiter, planets.find(p => p.name === 'Ketu')!, ascSignIndex),
    relationships: calculateStrength(venus, moon, ascSignIndex)
  };
  
  return { personality, career, love, finance, karma, strengths };
}

function rahu_ketu(planets: PlanetData[]) {
  return {
    rahu: planets.find(p => p.name === 'Rahu')!,
    ketu: planets.find(p => p.name === 'Ketu')!
  };
}

function calculateStrength(p1: PlanetData, p2: PlanetData, ascSign: number): number {
  let score = 50;
  if (p1.dignity === 'Exalted') score += 20;
  if (p1.dignity === 'Own Sign') score += 15;
  if (p1.dignity === 'Debilitated') score -= 15;
  if (p2.dignity === 'Exalted') score += 15;
  if (p2.dignity === 'Own Sign') score += 10;
  if ([1, 4, 5, 7, 9, 10].includes(p1.house)) score += 10;
  if (p1.retrograde) score -= 5;
  return Math.min(95, Math.max(15, score));
}

function generatePersonalityInsight(ascSign: number, moonSign: number, sun: PlanetData, moon: PlanetData, ascLord: string): string {
  const traits: Record<number, string> = {
    0: 'pioneering spirit, natural leadership, and fearless initiative',
    1: 'steadfast determination, sensory appreciation, and material wisdom',
    2: 'intellectual curiosity, communication brilliance, and adaptability',
    3: 'deep emotional intelligence, nurturing nature, and intuitive wisdom',
    4: 'magnetic charisma, creative fire, and generous heart',
    5: 'analytical precision, service orientation, and practical intelligence',
    6: 'diplomatic grace, aesthetic sense, and partnership orientation',
    7: 'transformative depth, investigative mind, and emotional intensity',
    8: 'philosophical vision, adventurous spirit, and boundless optimism',
    9: 'ambitious drive, structural thinking, and lasting achievement',
    10: 'innovative thinking, humanitarian vision, and unique perspective',
    11: 'spiritual sensitivity, creative imagination, and compassionate soul'
  };
  
  return `Your ${SIGNS[ascSign]} Ascendant gives you ${traits[ascSign]}. With Moon in ${SIGNS[moonSign]}, your emotional core resonates with ${SIGN_ELEMENTS[moonSign].toLowerCase()} energy — ${moonSign < 6 ? 'externally expressive and action-oriented' : 'internally reflective and wisdom-seeking'}. The Sun in ${sun.sign} illuminates your ${sun.house}${getOrdinal(sun.house)} house, directing your life force toward ${getHouseTheme(sun.house)}. This combination creates a personality that is ${getElementBlend(ascSign, moonSign)}.`;
}

function generateCareerInsight(planets: PlanetData[], ascSign: number): string {
  const mc = planets.find(p => p.house === 10);
  const tenthLord = SIGN_LORDS[(ascSign + 9) % 12];
  const tenthLordPlanet = planets.find(p => p.name === tenthLord);
  
  const careerFields: Record<string, string[]> = {
    'Sun': ['government', 'leadership', 'administration', 'healthcare'],
    'Moon': ['hospitality', 'nursing', 'public relations', 'creative arts'],
    'Mars': ['engineering', 'military', 'sports', 'surgery', 'technology'],
    'Mercury': ['writing', 'IT', 'trading', 'accounting', 'marketing'],
    'Jupiter': ['education', 'law', 'finance', 'consulting', 'spirituality'],
    'Venus': ['arts', 'entertainment', 'luxury goods', 'design', 'beauty'],
    'Saturn': ['real estate', 'mining', 'agriculture', 'manufacturing', 'research']
  };
  
  const fields = careerFields[tenthLord] || ['diverse fields'];
  
  return `Your 10th house lord ${tenthLord} ${tenthLordPlanet ? `in ${tenthLordPlanet.sign} (${tenthLordPlanet.house}${getOrdinal(tenthLordPlanet.house)} house)` : ''} suggests natural talent in ${fields.join(', ')}. ${mc ? `With ${mc.name} in your 10th house, your career receives powerful ${mc.name} energy — ${mc.dignity === 'Exalted' ? 'exceptionally strong placement for professional success' : mc.dignity === 'Debilitated' ? 'requiring extra effort but building resilience' : 'providing steady career development'}.` : 'Your 10th house is unoccupied, suggesting your career path is shaped more by planetary periods and transits.'} Focus on leveraging your ${SIGNS[ascSign]} ascendant's natural ${SIGN_ELEMENTS[ascSign].toLowerCase()} energy for maximum professional impact.`;
}

function generateLoveInsight(venus: PlanetData, mars: PlanetData, jupiter: PlanetData, moon: PlanetData, ascSign: number): string {
  const sevenLord = SIGN_LORDS[(ascSign + 6) % 12];
  
  return `Venus in ${venus.sign} (${venus.house}${getOrdinal(venus.house)} house) shapes your love language and relationship desires. ${venus.dignity === 'Exalted' ? 'Exalted Venus blesses you with magnetic charm and deep romantic fulfillment.' : venus.dignity === 'Debilitated' ? 'Venus here asks you to develop self-worth before seeking validation through relationships.' : `Venus in ${venus.sign} brings ${SIGN_ELEMENTS[venus.signIndex].toLowerCase()} qualities to your romantic expression.`} Your 7th house lord ${sevenLord} indicates you're drawn to partners with ${SIGNS[(ascSign + 6) % 12]} qualities. ${mars.house === 7 ? 'Mars in the 7th house brings passion and intensity to partnerships — channel this energy constructively.' : ''} ${jupiter.house === 7 ? 'Jupiter in the 7th house is a beautiful blessing for a wise, supportive, and growth-oriented partnership.' : ''}`;
}

function generateFinanceInsight(jupiter: PlanetData, venus: PlanetData, saturn: PlanetData, planets: PlanetData[], ascSign: number): string {
  const secondLord = SIGN_LORDS[(ascSign + 1) % 12];
  const eleventhLord = SIGN_LORDS[(ascSign + 10) % 12];
  
  return `Your wealth indicators show ${jupiter.dignity === 'Exalted' || jupiter.dignity === 'Own Sign' ? 'strong' : 'moderate'} financial potential. The 2nd house lord ${secondLord} governs your earning capacity, while the 11th house lord ${eleventhLord} controls gains and income streams. ${saturn.house === 2 || saturn.house === 11 ? 'Saturn\'s influence on your wealth houses suggests steady, disciplined wealth building rather than sudden windfalls. Long-term investments and systematic saving will be your strongest financial strategy.' : ''} ${venus.house === 2 ? 'Venus in the 2nd house indicates wealth through beauty, arts, or luxury industries.' : ''} ${jupiter.house === 2 || jupiter.house === 11 ? 'Jupiter\'s placement promises expansion of wealth through wisdom, education, or advisory roles.' : ''} Your financial peak periods align with favorable Dasha transitions.`;
}

function generateKarmaInsight(saturn: PlanetData, rahuKetu: {rahu: PlanetData; ketu: PlanetData}, ascSign: number, moonSign: number): string {
  return `Saturn in ${saturn.sign} (${saturn.house}${getOrdinal(saturn.house)} house) reveals your primary karmic lessons in this lifetime: ${getHouseTheme(saturn.house)}. ${saturn.retrograde ? 'Retrograde Saturn deepens these karmic lessons, suggesting unfinished business from past lives in these areas.' : 'Saturn direct helps you face and resolve these karmic patterns more straightforwardly.'} Rahu in ${rahuKetu.rahu.sign} (${rahuKetu.rahu.house}${getOrdinal(rahuKetu.rahu.house)} house) shows where your soul wants to grow and evolve — ${getHouseTheme(rahuKetu.rahu.house)}. Ketu in ${rahuKetu.ketu.sign} (${rahuKetu.ketu.house}${getOrdinal(rahuKetu.ketu.house)} house) represents mastery brought from past lives — ${getHouseTheme(rahuKetu.ketu.house)}. Your dharmic path involves balancing these energies through conscious awareness and purposeful action.`;
}

function getHouseTheme(house: number): string {
  const themes: Record<number, string> = {
    1: 'self-identity, physical body, and personal initiative',
    2: 'wealth, family values, and speech',
    3: 'courage, communication, and siblings',
    4: 'home, mother, emotional foundations, and inner peace',
    5: 'creativity, children, romance, and past-life merit',
    6: 'health, service, competition, and daily routines',
    7: 'partnerships, marriage, and business relationships',
    8: 'transformation, occult knowledge, and shared resources',
    9: 'higher learning, dharma, father, and long journeys',
    10: 'career, reputation, and public status',
    11: 'gains, aspirations, and social networks',
    12: 'liberation, foreign lands, and spiritual surrender'
  };
  return themes[house] || 'life matters';
}

function getElementBlend(sign1: number, sign2: number): string {
  const e1 = SIGN_ELEMENTS[sign1];
  const e2 = SIGN_ELEMENTS[sign2];
  const blends: Record<string, string> = {
    'Fire-Fire': 'dynamically energetic, bold, and unstoppable',
    'Fire-Earth': 'practically ambitious with grounded vision',
    'Fire-Air': 'brilliantly innovative with endless ideas',
    'Fire-Water': 'passionately intuitive with deep emotional courage',
    'Earth-Earth': 'rock-solid, reliable, and materially gifted',
    'Earth-Air': 'intellectually practical with structured creativity',
    'Earth-Water': 'emotionally grounded with nurturing stability',
    'Air-Air': 'mentally agile, socially brilliant, and idea-driven',
    'Air-Water': 'emotionally intelligent with communicative depth',
    'Water-Water': 'profoundly intuitive, empathic, and spiritually attuned'
  };
  const key1 = `${e1}-${e2}`;
  const key2 = `${e2}-${e1}`;
  return blends[key1] || blends[key2] || 'uniquely balanced';
}

// ============================================================
// Main Calculation Interface
// ============================================================

export interface PlanetData {
  name: string;
  symbol: string;
  longitude: number;
  siderealLongitude: number;
  sign: string;
  signIndex: number;
  signSanskrit: string;
  degreeInSign: number;
  nakshatra: string;
  nakshatraIndex: number;
  nakshatraPada: number;
  nakshatraLord: string;
  nakshatraDeity: string;
  house: number;
  retrograde: boolean;
  dignity: string;
  navamsaSign: string;
  navamsaSignIndex: number;
  dashamsaSign: string;
  dashamsaSignIndex: number;
  shashtiamsaSign: string;
  shashtiamsaSignIndex: number;
}

export interface BirthChart {
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  latitude: number;
  longitude: number;
  timezone: number;
  julianDay: number;
  ayanamsha: number;
  ascendant: {
    longitude: number;
    sign: string;
    signIndex: number;
    signSanskrit: string;
    degree: number;
    nakshatra: string;
    nakshatraPada: number;
    lord: string;
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
  latitude: number, longitude_geo: number,
  timezone: number,
  placeOfBirth: string
): BirthChart {
  // Convert to UTC
  const utcHour = hour - timezone + minute / 60;
  const jd = dateToJD(year, month, day, utcHour);
  
  // Ayanamsha
  const ayanamsha = getLahiriAyanamsha(jd);
  
  // Ascendant
  const ascTropical = calculateAscendant(jd, latitude, longitude_geo);
  const ascSidereal = getSiderealLongitude(ascTropical, ayanamsha);
  const ascSignIndex = getSignIndex(ascSidereal);
  const ascDegree = getDegreeInSign(ascSidereal);
  const ascNakIndex = getNakshatraIndex(ascSidereal);
  
  const ascendant = {
    longitude: parseFloat(ascSidereal.toFixed(4)),
    sign: SIGNS[ascSignIndex],
    signIndex: ascSignIndex,
    signSanskrit: SIGNS_SANSKRIT[ascSignIndex],
    degree: parseFloat(ascDegree.toFixed(2)),
    nakshatra: NAKSHATRAS[ascNakIndex],
    nakshatraPada: getNakshatraPada(ascSidereal),
    lord: SIGN_LORDS[ascSignIndex]
  };
  
  // Calculate houses
  const houses = calculateHouses(ascSidereal);
  
  // Calculate planetary positions
  const planets: PlanetData[] = [];
  const planetList = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
  
  for (let i = 0; i < planetList.length; i++) {
    const pName = planetList[i];
    const tropLong = getMeanLongitude(jd, pName);
    const sidLong = getSiderealLongitude(tropLong, ayanamsha);
    const signIdx = getSignIndex(sidLong);
    const degInSign = getDegreeInSign(sidLong);
    const nakIdx = getNakshatraIndex(sidLong);
    const retro = isRetrograde(pName, jd);
    const navSign = getNavamsaSign(sidLong);
    const d10Sign = getDashamsaSign(sidLong);
    const d60Sign = getShastiamsaSign(sidLong);
    
    planets.push({
      name: pName,
      symbol: PLANET_SYMBOLS[i],
      longitude: parseFloat(tropLong.toFixed(4)),
      siderealLongitude: parseFloat(sidLong.toFixed(4)),
      sign: SIGNS[signIdx],
      signIndex: signIdx,
      signSanskrit: SIGNS_SANSKRIT[signIdx],
      degreeInSign: parseFloat(degInSign.toFixed(2)),
      nakshatra: NAKSHATRAS[nakIdx],
      nakshatraIndex: nakIdx,
      nakshatraPada: getNakshatraPada(sidLong),
      nakshatraLord: NAKSHATRA_LORDS[nakIdx],
      nakshatraDeity: NAKSHATRA_DEITIES[nakIdx],
      house: getHouseNumber(sidLong, ascSidereal),
      retrograde: retro,
      dignity: getPlanetDignity(pName, signIdx),
      navamsaSign: SIGNS[navSign],
      navamsaSignIndex: navSign,
      dashamsaSign: SIGNS[d10Sign],
      dashamsaSignIndex: d10Sign,
      shashtiamsaSign: SIGNS[d60Sign],
      shashtiamsaSignIndex: d60Sign
    });
  }
  
  // Rahu & Ketu
  const { rahu, ketu } = getRahuKetu(jd);
  const sidRahu = getSiderealLongitude(rahu, ayanamsha);
  const sidKetu = getSiderealLongitude(ketu, ayanamsha);
  
  for (const [nodeData, idx, nodeName] of [[sidRahu, 7, 'Rahu'], [sidKetu, 8, 'Ketu']] as [number, number, string][]) {
    const signIdx = getSignIndex(nodeData);
    const degInSign = getDegreeInSign(nodeData);
    const nakIdx = getNakshatraIndex(nodeData);
    const navSign = getNavamsaSign(nodeData);
    const d10Sign = getDashamsaSign(nodeData);
    const d60Sign = getShastiamsaSign(nodeData);
    
    planets.push({
      name: nodeName,
      symbol: PLANET_SYMBOLS[idx],
      longitude: nodeData,
      siderealLongitude: parseFloat(nodeData.toFixed(4)),
      sign: SIGNS[signIdx],
      signIndex: signIdx,
      signSanskrit: SIGNS_SANSKRIT[signIdx],
      degreeInSign: parseFloat(degInSign.toFixed(2)),
      nakshatra: NAKSHATRAS[nakIdx],
      nakshatraIndex: nakIdx,
      nakshatraPada: getNakshatraPada(nodeData),
      nakshatraLord: NAKSHATRA_LORDS[nakIdx],
      nakshatraDeity: NAKSHATRA_DEITIES[nakIdx],
      house: getHouseNumber(nodeData, ascSidereal),
      retrograde: true,
      dignity: 'Neutral',
      navamsaSign: SIGNS[navSign],
      navamsaSignIndex: navSign,
      dashamsaSign: SIGNS[d10Sign],
      dashamsaSignIndex: d10Sign,
      shashtiamsaSign: SIGNS[d60Sign],
      shashtiamsaSignIndex: d60Sign
    });
  }
  
  // Moon data for Dasha calculation
  const moonPlanet = planets.find(p => p.name === 'Moon')!;
  const saturnPlanet = planets.find(p => p.name === 'Saturn')!;
  
  // Current transit JD
  const nowDate = new Date();
  const nowJD = dateToJD(nowDate.getFullYear(), nowDate.getMonth() + 1, nowDate.getDate(), nowDate.getHours());
  
  // Divisional charts
  const buildDivisional = (getter: (p: PlanetData) => {sign: string; signIndex: number}) => {
    return planets.map(p => ({
      planet: p.name,
      ...getter(p)
    }));
  };
  
  const divisionalCharts = {
    d1: planets.map(p => ({ planet: p.name, sign: p.sign, signIndex: p.signIndex })),
    d9: planets.map(p => ({ planet: p.name, sign: p.navamsaSign, signIndex: p.navamsaSignIndex })),
    d10: planets.map(p => ({ planet: p.name, sign: p.dashamsaSign, signIndex: p.dashamsaSignIndex })),
    d60: planets.map(p => ({ planet: p.name, sign: p.shashtiamsaSign, signIndex: p.shashtiamsaSignIndex }))
  };
  
  return {
    name,
    dateOfBirth: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    timeOfBirth: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    placeOfBirth,
    latitude,
    longitude: longitude_geo,
    timezone,
    julianDay: jd,
    ayanamsha: parseFloat(ayanamsha.toFixed(4)),
    ascendant,
    planets,
    houses,
    dashas: calculateVimshottariDasha(moonPlanet.siderealLongitude, jd),
    doshas: analyzeDoshas(planets, ascSignIndex),
    sadeSati: analyzeSadeSati(moonPlanet.signIndex, saturnPlanet.siderealLongitude),
    transits: getCurrentTransits(nowJD, getLahiriAyanamsha(nowJD)),
    insights: generateInsights(planets, ascSignIndex, moonPlanet.signIndex),
    divisionalCharts
  };
}

// Export constants for frontend use
export { SIGNS, SIGNS_SANSKRIT, SIGN_LORDS, SIGN_ELEMENTS, NAKSHATRAS, PLANET_NAMES, PLANET_SYMBOLS, DASHA_ORDER, DASHA_YEARS };
