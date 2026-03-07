// ============================================================
// Cosmic Dharma — Automated Test Suite v4.0
// Tests: Planetary calculations, Dasha, Dosha, Edge Cases
// ============================================================
import { describe, it, expect } from 'vitest';
import {
  calculateBirthChart,
  dateToJD,
  jdToDate,
  getLahiriAyanamsha,
  SIGNS,
  NAKSHATRAS,
  DASHA_ORDER,
  DASHA_YEARS,
  PLANET_ABBR,
  _dateToJD,
  _jdToDate,
  _getLahiriAyanamsha,
  _getSunLongitude,
  _getMoonLongitude,
  _getSignIndex,
  _getDegreeInSign,
  _getNakshatraIndex,
  _getNakshatraPada,
  _getNavamsaSign,
  _getDashamsaSign,
  _getShastiamsaSign,
  _getHouseNumber,
  _isRetrograde,
  _getPlanetDignity,
  _toSidereal,
  _norm360,
  _calculateAscendant,
  _getPlanetLongitude,
  _getRahuKetu,
  _getObliquity,
  _getNutation,
  _daysInMonth,
  _isLeapYear,
} from './lib/vedic-engine';

// ============================================================
// 1. JULIAN DAY CONVERSION TESTS
// ============================================================
describe('Julian Day Conversion', () => {
  it('should compute JD for J2000.0 epoch correctly', () => {
    const jd = _dateToJD(2000, 1, 1, 12);
    expect(jd).toBeCloseTo(2451545.0, 2);
  });

  it('should compute JD for Meeus example date', () => {
    // 1957 Oct 4.81 UT = JD 2436116.31
    const jd = _dateToJD(1957, 10, 4, 19.44);
    expect(jd).toBeCloseTo(2436116.31, 1);
  });

  it('should compute JD for historical date', () => {
    // 2000 Jan 1 0:00 UT = JD 2451544.5
    const jd = _dateToJD(2000, 1, 1, 0);
    expect(jd).toBeCloseTo(2451544.5, 2);
  });

  it('should reverse JD to date correctly', () => {
    expect(_jdToDate(2451545.0)).toBe('2000-01-01');
  });

  it('should handle Feb 29 leap year', () => {
    const jd = _dateToJD(2000, 2, 29, 12);
    expect(_jdToDate(jd)).toBe('2000-02-29');
  });
});

// ============================================================
// 2. LAHIRI AYANAMSHA TESTS
// ============================================================
describe('Lahiri Ayanamsha', () => {
  it('should compute correct ayanamsha at J2000.0', () => {
    // Swiss Ephemeris: 23°51'25.53" = 23.857092°
    const jd = _dateToJD(2000, 1, 1, 12);
    const aya = _getLahiriAyanamsha(jd);
    expect(aya).toBeCloseTo(23.857, 2);
  });

  it('should compute reasonable ayanamsha for 2024', () => {
    const jd = _dateToJD(2024, 1, 1, 0);
    const aya = _getLahiriAyanamsha(jd);
    // ~24.19° for 2024 (23.857 + 24*0.01397)
    expect(aya).toBeGreaterThan(24.0);
    expect(aya).toBeLessThan(24.5);
  });

  it('should increase over time (precession)', () => {
    const jd1 = _dateToJD(1990, 1, 1, 0);
    const jd2 = _dateToJD(2020, 1, 1, 0);
    expect(_getLahiriAyanamsha(jd2)).toBeGreaterThan(_getLahiriAyanamsha(jd1));
  });

  it('should compute ayanamsha for 1956 March 21', () => {
    // The reference: 23°15'00.658" = 23.25018°
    const jd = _dateToJD(1956, 3, 21, 0);
    const aya = _getLahiriAyanamsha(jd);
    expect(aya).toBeCloseTo(23.25, 1);
  });
});

// ============================================================
// 3. OBLIQUITY & NUTATION TESTS
// ============================================================
describe('Obliquity and Nutation', () => {
  it('should compute obliquity near 23.44° at J2000', () => {
    const eps = _getObliquity(0);
    expect(eps).toBeCloseTo(23.44, 1);
  });

  it('should return nutation within expected bounds', () => {
    const nut = _getNutation(0);
    expect(Math.abs(nut.deltaPsi)).toBeLessThan(0.01);
    expect(Math.abs(nut.deltaEps)).toBeLessThan(0.01);
  });
});

// ============================================================
// 4. PLANET LONGITUDE TESTS
// ============================================================
describe('Planet Longitudes', () => {
  it('Sun longitude should be reasonable for Jan 1 2000', () => {
    const jd = _dateToJD(2000, 1, 1, 12);
    const lon = _getSunLongitude(jd);
    // Sun at ~280° (Sagittarius/Capricorn boundary)
    expect(lon).toBeGreaterThan(275);
    expect(lon).toBeLessThan(285);
  });

  it('Moon longitude should be reasonable for Jan 1 2000', () => {
    const jd = _dateToJD(2000, 1, 1, 12);
    const lon = _getMoonLongitude(jd);
    expect(lon).toBeGreaterThan(0);
    expect(lon).toBeLessThan(360);
  });

  it('All planet longitudes should be 0-360', () => {
    const jd = _dateToJD(1990, 6, 15, 3); // UTC for Mumbai 8:30 IST
    for (const planet of ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn']) {
      const lon = _getPlanetLongitude(jd, planet);
      expect(lon).toBeGreaterThanOrEqual(0);
      expect(lon).toBeLessThan(360);
    }
  });

  it('Rahu and Ketu should be 180° apart', () => {
    const jd = _dateToJD(1990, 6, 15, 3);
    const { rahu, ketu } = _getRahuKetu(jd);
    let diff = Math.abs(rahu - ketu);
    if (diff > 180) diff = 360 - diff;
    expect(diff).toBeCloseTo(180, 0);
  });
});

// ============================================================
// 5. SIGN, NAKSHATRA, PADA TESTS
// ============================================================
describe('Sign and Nakshatra', () => {
  it('should return correct sign index', () => {
    expect(_getSignIndex(0)).toBe(0);    // Aries
    expect(_getSignIndex(30)).toBe(1);   // Taurus
    expect(_getSignIndex(59.99)).toBe(1);
    expect(_getSignIndex(60)).toBe(2);   // Gemini
    expect(_getSignIndex(359.99)).toBe(11); // Pisces
  });

  it('should return correct degree in sign', () => {
    expect(_getDegreeInSign(15)).toBeCloseTo(15, 2);
    expect(_getDegreeInSign(31)).toBeCloseTo(1, 2);
    expect(_getDegreeInSign(350)).toBeCloseTo(20, 2);
  });

  it('should return correct nakshatra index', () => {
    expect(_getNakshatraIndex(0)).toBe(0);    // Ashwini
    expect(_getNakshatraIndex(13.33)).toBe(0);
    expect(_getNakshatraIndex(13.34)).toBe(1); // Bharani
  });

  it('should return pada 1-4', () => {
    expect(_getNakshatraPada(0)).toBe(1);
    expect(_getNakshatraPada(3.4)).toBe(2);
    expect(_getNakshatraPada(6.8)).toBe(3);
    expect(_getNakshatraPada(10.0)).toBe(4);
  });
});

// ============================================================
// 6. WHOLE SIGN HOUSES
// ============================================================
describe('Whole Sign Houses', () => {
  it('should return house 1 for planet in ascendant sign', () => {
    expect(_getHouseNumber(5, 0)).toBe(1);
  });

  it('should return house 7 for planet opposite ascendant', () => {
    expect(_getHouseNumber(185, 0)).toBe(7);
  });

  it('should handle wrap-around', () => {
    expect(_getHouseNumber(5, 10)).toBe(3);
  });
});

// ============================================================
// 7. DIVISIONAL CHARTS
// ============================================================
describe('Divisional Charts', () => {
  it('Navamsa: 0° Aries → Aries', () => {
    expect(_getNavamsaSign(0)).toBe(0);
  });

  it('Navamsa: 3.33° Aries → Taurus', () => {
    expect(_getNavamsaSign(3.34)).toBe(1);
  });

  it('Navamsa: 30° Taurus (start) → Capricorn', () => {
    expect(_getNavamsaSign(30)).toBe(9);
  });

  it('Dashamsa: 0° Aries → Aries', () => {
    expect(_getDashamsaSign(0)).toBe(0);
  });

  it('Dashamsa: 3° Aries → Taurus', () => {
    expect(_getDashamsaSign(3)).toBe(1);
  });

  it('Shastiamsa: 0° Aries → Aries', () => {
    expect(_getShastiamsaSign(0)).toBe(0);
  });
});

// ============================================================
// 8. PLANETARY DIGNITY
// ============================================================
describe('Planetary Dignity', () => {
  it('Sun exalted in Aries', () => {
    expect(_getPlanetDignity('Sun', 0, 10)).toBe('Exalted');
  });

  it('Sun debilitated in Libra', () => {
    expect(_getPlanetDignity('Sun', 6, 10)).toBe('Debilitated');
  });

  it('Sun in Leo own sign (outside Moolatrikona range)', () => {
    expect(_getPlanetDignity('Sun', 4, 25)).toBe('Own Sign');
  });

  it('Sun Moolatrikona in Leo 0-20', () => {
    expect(_getPlanetDignity('Sun', 4, 10)).toBe('Moolatrikona');
  });

  it('Venus exalted in Pisces', () => {
    expect(_getPlanetDignity('Venus', 11, 27)).toBe('Exalted');
  });

  it('Rahu is always Neutral', () => {
    expect(_getPlanetDignity('Rahu', 0, 0)).toBe('Neutral');
  });
});

// ============================================================
// 9. RETROGRADE DETECTION
// ============================================================
describe('Retrograde Detection', () => {
  it('Sun is never retrograde', () => {
    const jd = _dateToJD(2000, 1, 1, 12);
    expect(_isRetrograde('Sun', jd)).toBe(false);
  });

  it('Moon is never retrograde', () => {
    const jd = _dateToJD(2000, 1, 1, 12);
    expect(_isRetrograde('Moon', jd)).toBe(false);
  });

  it('Rahu is always retrograde', () => {
    const jd = _dateToJD(2000, 1, 1, 12);
    expect(_isRetrograde('Rahu', jd)).toBe(true);
  });
});

// ============================================================
// 10. SIDEREAL CONVERSION
// ============================================================
describe('Sidereal Conversion', () => {
  it('should subtract ayanamsha correctly', () => {
    expect(_toSidereal(50, 24)).toBeCloseTo(26, 2);
  });

  it('should wrap around 360', () => {
    expect(_toSidereal(10, 24)).toBeCloseTo(346, 0);
  });
});

// ============================================================
// 11. FULL BIRTH CHART INTEGRATION
// ============================================================
describe('Full Birth Chart', () => {
  it('should generate valid chart for Mumbai 1990-06-15 08:30', () => {
    const chart = calculateBirthChart('Test', 1990, 6, 15, 8, 30, 19.076, 72.8777, 5.5, 'Mumbai');
    expect(chart.planets).toHaveLength(9);
    expect(chart.ascendant.sign).toBeDefined();
    expect(chart.dashas).toHaveLength(9);
    expect(chart.doshas).toHaveLength(3);
  });

  it('should have valid planet data fields', () => {
    const chart = calculateBirthChart('Test', 1990, 6, 15, 8, 30, 19.076, 72.8777, 5.5, 'Mumbai');
    for (const p of chart.planets) {
      expect(p.name).toBeDefined();
      expect(p.abbr).toBeDefined();
      expect(p.sign).toBeDefined();
      expect(p.signIndex).toBeGreaterThanOrEqual(0);
      expect(p.signIndex).toBeLessThanOrEqual(11);
      expect(p.house).toBeGreaterThanOrEqual(1);
      expect(p.house).toBeLessThanOrEqual(12);
      expect(p.degreeInSign).toBeGreaterThanOrEqual(0);
      expect(p.degreeInSign).toBeLessThan(30);
      expect(p.nakshatraPada).toBeGreaterThanOrEqual(1);
      expect(p.nakshatraPada).toBeLessThanOrEqual(4);
    }
  });

  it('should have planet abbreviations', () => {
    expect(PLANET_ABBR['Sun']).toBe('SUN');
    expect(PLANET_ABBR['Moon']).toBe('MON');
    expect(PLANET_ABBR['Mars']).toBe('MAR');
    expect(PLANET_ABBR['Mercury']).toBe('MER');
    expect(PLANET_ABBR['Jupiter']).toBe('JUP');
    expect(PLANET_ABBR['Venus']).toBe('VEN');
    expect(PLANET_ABBR['Saturn']).toBe('SAT');
    expect(PLANET_ABBR['Rahu']).toBe('RAH');
    expect(PLANET_ABBR['Ketu']).toBe('KET');
  });

  it('Dasha should have 9 periods summing to ≤120 years', () => {
    const chart = calculateBirthChart('Test', 1990, 6, 15, 8, 30, 19.076, 72.8777, 5.5, 'Mumbai');
    expect(chart.dashas).toHaveLength(9);
    const total = chart.dashas.reduce((s, d) => s + d.years, 0);
    // First dasha is partial (remaining fraction), so total < 120
    expect(total).toBeGreaterThan(60);
    expect(total).toBeLessThanOrEqual(120);
    // Last 8 dashas should sum to their full years
    const last8 = chart.dashas.slice(1).reduce((s, d) => s + d.years, 0);
    const expectedLast8 = chart.dashas.slice(1).reduce((s, d) => s + DASHA_YEARS[d.planet], 0);
    expect(last8).toBeCloseTo(expectedLast8, 0);
  });

  it('each Dasha should have 9 antardasha', () => {
    const chart = calculateBirthChart('Test', 1990, 6, 15, 8, 30, 19.076, 72.8777, 5.5, 'Mumbai');
    for (const d of chart.dashas) {
      expect(d.antardasha).toHaveLength(9);
    }
  });

  it('houses should be 12 entries', () => {
    const chart = calculateBirthChart('Test', 1990, 6, 15, 8, 30, 19.076, 72.8777, 5.5, 'Mumbai');
    expect(chart.houses).toHaveLength(12);
  });

  it('divisional charts should have 9 planets each', () => {
    const chart = calculateBirthChart('Test', 1990, 6, 15, 8, 30, 19.076, 72.8777, 5.5, 'Mumbai');
    expect(chart.divisionalCharts.d1).toHaveLength(9);
    expect(chart.divisionalCharts.d9).toHaveLength(9);
    expect(chart.divisionalCharts.d10).toHaveLength(9);
    expect(chart.divisionalCharts.d60).toHaveLength(9);
  });
});

// ============================================================
// 12. EDGE CASES
// ============================================================
describe('Edge Cases', () => {
  it('should handle midnight birth', () => {
    const chart = calculateBirthChart('Midnight', 1995, 1, 1, 0, 0, 28.6139, 77.209, 5.5, 'Delhi');
    expect(chart.planets).toHaveLength(9);
    expect(chart.ascendant.sign).toBeDefined();
  });

  it('should handle leap year Feb 29', () => {
    const chart = calculateBirthChart('Leap', 2000, 2, 29, 12, 0, 19.076, 72.8777, 5.5, 'Mumbai');
    expect(chart.planets).toHaveLength(9);
  });

  it('should handle negative timezone', () => {
    const chart = calculateBirthChart('NYC', 2000, 6, 21, 12, 0, 40.7128, -74.006, -5, 'New York');
    expect(chart.planets).toHaveLength(9);
    expect(chart.ascendant.sign).toBeDefined();
  });

  it('should handle southern hemisphere', () => {
    const chart = calculateBirthChart('Sydney', 1985, 12, 25, 10, 0, -33.8688, 151.2093, 11, 'Sydney');
    expect(chart.planets).toHaveLength(9);
  });

  it('should throw on invalid month', () => {
    expect(() => calculateBirthChart('X', 2000, 13, 1, 12, 0, 0, 0, 0, 'X')).toThrow('Invalid month');
  });

  it('should throw on invalid hour', () => {
    expect(() => calculateBirthChart('X', 2000, 1, 1, 25, 0, 0, 0, 0, 'X')).toThrow('Invalid hour');
  });

  it('should throw on invalid latitude', () => {
    expect(() => calculateBirthChart('X', 2000, 1, 1, 12, 0, 91, 0, 0, 'X')).toThrow('Invalid latitude');
  });
});

// ============================================================
// 13. UTILITY TESTS
// ============================================================
describe('Utilities', () => {
  it('norm360 should normalize angles', () => {
    expect(_norm360(370)).toBeCloseTo(10, 5);
    expect(_norm360(-10)).toBeCloseTo(350, 5);
    expect(_norm360(0)).toBeCloseTo(0, 5);
    expect(_norm360(360)).toBeCloseTo(0, 5);
  });

  it('daysInMonth should be correct', () => {
    expect(_daysInMonth(2000, 2)).toBe(29);
    expect(_daysInMonth(2001, 2)).toBe(28);
    expect(_daysInMonth(2000, 1)).toBe(31);
    expect(_daysInMonth(2000, 4)).toBe(30);
  });

  it('isLeapYear should be correct', () => {
    expect(_isLeapYear(2000)).toBe(true);
    expect(_isLeapYear(1900)).toBe(false);
    expect(_isLeapYear(2004)).toBe(true);
    expect(_isLeapYear(2001)).toBe(false);
  });
});

// ============================================================
// 14. ASCENDANT CALCULATION
// ============================================================
describe('Ascendant Calculation', () => {
  it('should return a valid tropical longitude', () => {
    const jd = _dateToJD(1990, 6, 15, 3); // UTC
    const asc = _calculateAscendant(jd, 19.076, 72.8777);
    expect(asc).toBeGreaterThanOrEqual(0);
    expect(asc).toBeLessThan(360);
  });

  it('should differ for different locations', () => {
    const jd = _dateToJD(2000, 1, 1, 12);
    const asc1 = _calculateAscendant(jd, 19.076, 72.8777); // Mumbai
    const asc2 = _calculateAscendant(jd, 40.7128, -74.006); // NYC
    expect(asc1).not.toBeCloseTo(asc2, 1);
  });

  it('should give Cancer ascendant for June 15 1990 8:30 AM Mumbai (tropical ~116°)', () => {
    // 8:30 AM IST = 3:00 UTC; Cancer rises in the East in Mumbai at this time in June
    const jd = _dateToJD(1990, 6, 15, 3);
    const asc = _calculateAscendant(jd, 19.076, 72.8777);
    // Tropical Cancer = 90°-120°; expected ~116.5°
    expect(asc).toBeGreaterThan(90);
    expect(asc).toBeLessThan(130);
  });
});

// ============================================================
// 15. CROSS-VERIFICATION - Known chart patterns
// ============================================================
describe('Cross-Verification', () => {
  it('Sun should be in Taurus or Gemini for June 15 1990 (sidereal)', () => {
    const chart = calculateBirthChart('Test', 1990, 6, 15, 8, 30, 19.076, 72.8777, 5.5, 'Mumbai');
    const sun = chart.planets.find(p => p.name === 'Sun');
    // June 15 tropical Sun ~84° (Gemini), sidereal ~60° (Taurus/Gemini boundary)
    expect(['Taurus', 'Gemini']).toContain(sun!.sign);
  });

  it('ayanamsha for 1990 should be around 23.7°', () => {
    const jd = _dateToJD(1990, 6, 15, 3);
    const aya = _getLahiriAyanamsha(jd);
    expect(aya).toBeGreaterThan(23.5);
    expect(aya).toBeLessThan(24.2);
  });
});
