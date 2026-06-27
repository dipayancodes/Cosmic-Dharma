// Accuracy verification test for Vedic Engine
// Compare our calculations against Drik Panchang reference values

import { calculateBirthChart, dateToJD, getLahiriAyanamsha } from './src/lib/vedic-engine';

// ============================================================
// TEST 1: Lahiri Ayanamsha verification against Swiss Ephemeris
// Reference: Jagannatha Hora historical tables
// ============================================================
console.log('=== TEST 1: Lahiri Ayanamsha Verification ===');

const ayaTests: [number, number, number, string, number][] = [
  // [year, month, day, label, expected_degrees]
  // Reference: Swiss Ephemeris / Jagannatha Hora tables (Jan 1 values)
  [2000, 1, 1, 'Jan 1 2000 (J2000)', 23 + 51/60 + 11/3600],     // 23°51'11"
  [1990, 1, 1, 'Jan 1 1990',         23 + 44/60 + 39/3600],     // 23°44'39"
  [2010, 1, 1, 'Jan 1 2010',         23 + 58/60 + 31/3600],     // 23°58'31"
  [2020, 1, 1, 'Jan 1 2020',         24 + 6/60 + 21/3600],      // 24°06'21"
  [2025, 1, 1, 'Jan 1 2025',         24 + 6/60 + 53/3600],      // 24°06'53"
  [2026, 1, 1, 'Jan 1 2026',         24 + 7/60 + 47/3600],      // 24°07'47"
  [1980, 1, 1, 'Jan 1 1980',         23 + 36/60 + 23/3600],     // 23°36'23"
  [1970, 1, 1, 'Jan 1 1970',         23 + 26/60 + 47/3600],     // 23°26'47"
];

for (const [year, month, day, label, expected] of ayaTests) {
  const jd = dateToJD(year, month, day, 0);
  const computed = getLahiriAyanamsha(jd);
  const diff = (computed - expected) * 3600; // difference in arcseconds
  const status = Math.abs(diff) < 30 ? '✅' : Math.abs(diff) < 60 ? '⚠️' : '❌';
  const expectedDMS = `${Math.floor(expected)}°${String(Math.floor((expected % 1) * 60)).padStart(2, '0')}'${String(Math.round(((expected * 60) % 1) * 60)).padStart(2, '0')}"`;
  const computedDMS = `${Math.floor(computed)}°${String(Math.floor((computed % 1) * 60)).padStart(2, '0')}'${String(Math.round(((computed * 60) % 1) * 60)).padStart(2, '0')}"`;
  console.log(`${status} ${label}: Expected=${expectedDMS}, Got=${computedDMS}, Diff=${diff.toFixed(1)}" `);
}

// ============================================================
// TEST 2: Known Indian birth chart (verifiable on Drik Panchang)
// Test: Jan 15, 1990, 10:30 AM IST, Delhi (28.6139°N, 77.2090°E)
// ============================================================
console.log('\n=== TEST 2: Delhi Birth Chart (Jan 15, 1990, 10:30 AM IST) ===');
const chart1 = calculateBirthChart(
  'Test Delhi', 1990, 1, 15, 10, 30,
  28.6139, 77.2090, 5.5, 'New Delhi'
);

console.log(`Ayanamsha: ${chart1.ayanamsha.toFixed(4)}°`);
console.log(`Ascendant: ${chart1.ascendant.sign} ${chart1.ascendant.degree.toFixed(2)}°`);
console.log('\nPlanetary Positions (Sidereal):');
for (const p of chart1.planets) {
  const degDMS = `${Math.floor(p.degreeInSign)}°${String(Math.floor((p.degreeInSign % 1) * 60)).padStart(2, '0')}'`;
  console.log(`  ${p.name.padEnd(8)} ${p.sign.padEnd(13)} ${degDMS.padEnd(8)} H${p.house} ${p.nakshatra} (${p.retrograde ? 'R' : 'D'})`);
  if (p.name === 'Rahu' || p.name === 'Ketu') {
    console.log(`           D9: ${p.navamsaSign}`);
  }
}

// Check Rahu-Ketu axis (must be exactly 180° apart)
const rahuP = chart1.planets.find(p => p.name === 'Rahu')!;
const ketuP = chart1.planets.find(p => p.name === 'Ketu')!;
const axisDiff = Math.abs(rahuP.siderealLongitude - ketuP.siderealLongitude);
const axisOk = Math.abs(axisDiff - 180) < 0.01;
console.log(`\nRahu-Ketu Axis: ${axisDiff.toFixed(4)}° (should be 180°) ${axisOk ? '✅' : '❌'}`);

// Check D9 Navamsa Rahu-Ketu axis
const d9 = chart1.divisionalCharts['d9'];
const rahuD9 = d9.planets.find(p => p.planet === 'Rahu')!;
const ketuD9 = d9.planets.find(p => p.planet === 'Ketu')!;
const d9Diff = (ketuD9.signIndex - rahuD9.signIndex + 12) % 12;
console.log(`D9 Navamsa: Rahu=${rahuD9.sign}, Ketu=${ketuD9.sign}, Diff=${d9Diff} signs ${d9Diff === 6 ? '✅' : '❌'}`);

// ============================================================
// TEST 3: International birth chart — London
// Test: Jul 4, 1985, 14:00 BST (UTC+1), London (51.5074°N, -0.1278°W)
// ============================================================
console.log('\n=== TEST 3: London Birth Chart (Jul 4, 1985, 14:00 BST) ===');
const chart2 = calculateBirthChart(
  'Test London', 1985, 7, 4, 14, 0,
  51.5074, -0.1278, 1, 'London, UK'
);

console.log(`Ayanamsha: ${chart2.ayanamsha.toFixed(4)}°`);
console.log(`Ascendant: ${chart2.ascendant.sign} ${chart2.ascendant.degree.toFixed(2)}°`);
console.log('\nPlanetary Positions (Sidereal):');
for (const p of chart2.planets) {
  const degDMS = `${Math.floor(p.degreeInSign)}°${String(Math.floor((p.degreeInSign % 1) * 60)).padStart(2, '0')}'`;
  console.log(`  ${p.name.padEnd(8)} ${p.sign.padEnd(13)} ${degDMS.padEnd(8)} H${p.house} ${p.nakshatra} (${p.retrograde ? 'R' : 'D'})`);
}

const rahuP2 = chart2.planets.find(p => p.name === 'Rahu')!;
const ketuP2 = chart2.planets.find(p => p.name === 'Ketu')!;
const axisDiff2 = Math.abs(rahuP2.siderealLongitude - ketuP2.siderealLongitude);
const axisOk2 = Math.abs(axisDiff2 - 180) < 0.01;
console.log(`\nRahu-Ketu Axis: ${axisDiff2.toFixed(4)}° (should be 180°) ${axisOk2 ? '✅' : '❌'}`);

// ============================================================
// TEST 4: New York birth chart
// Test: Mar 20, 1995, 06:30 EST (UTC-5), New York (40.7128°N, -74.006°W)
// ============================================================
console.log('\n=== TEST 4: New York Birth Chart (Mar 20, 1995, 06:30 EST) ===');
const chart3 = calculateBirthChart(
  'Test NYC', 1995, 3, 20, 6, 30,
  40.7128, -74.006, -5, 'New York, USA'
);

console.log(`Ayanamsha: ${chart3.ayanamsha.toFixed(4)}°`);
console.log(`Ascendant: ${chart3.ascendant.sign} ${chart3.ascendant.degree.toFixed(2)}°`);
console.log('\nPlanetary Positions (Sidereal):');
for (const p of chart3.planets) {
  const degDMS = `${Math.floor(p.degreeInSign)}°${String(Math.floor((p.degreeInSign % 1) * 60)).padStart(2, '0')}'`;
  console.log(`  ${p.name.padEnd(8)} ${p.sign.padEnd(13)} ${degDMS.padEnd(8)} H${p.house} ${p.nakshatra} (${p.retrograde ? 'R' : 'D'})`);
}

// Verify ALL divisional charts have Rahu-Ketu 6 signs apart
console.log('\n=== TEST 5: Divisional Chart Rahu-Ketu Axis Verification ===');
const ALL_DIVS = ['d1','d2','d3','d7','d9','d10','d12','d16','d20','d24','d27','d30','d40','d45','d60'];
for (const div of ALL_DIVS) {
  const dc = chart1.divisionalCharts[div];
  const rahu = dc.planets.find(p => p.planet === 'Rahu')!;
  const ketu = dc.planets.find(p => p.planet === 'Ketu')!;
  const diff = (ketu.signIndex - rahu.signIndex + 12) % 12;
  const ok = diff === 6;
  console.log(`  ${div.padEnd(4)} Rahu=${rahu.sign.padEnd(13)} Ketu=${ketu.sign.padEnd(13)} Diff=${diff} signs ${ok ? '✅' : '❌'}`);
}

// ============================================================
// TEST 6: Verify timezone handling for edge cases
// ============================================================
console.log('\n=== TEST 6: Timezone Edge Cases ===');

// Birth at 2:00 AM IST should shift to previous day UTC
const chart4 = calculateBirthChart('TZ Test 1', 2000, 6, 15, 2, 0, 28.6139, 77.2090, 5.5, 'Delhi');
console.log(`Birth 2:00 AM IST Jun 15 → JD: ${chart4.julianDay} (should be ~Jun 14 UTC 20:30)`);

// Birth at 23:00 in UTC-5 should shift to next day UTC
const chart5 = calculateBirthChart('TZ Test 2', 2000, 6, 15, 23, 0, 40.7128, -74.006, -5, 'NYC');
console.log(`Birth 23:00 EST Jun 15 → JD: ${chart5.julianDay} (should be ~Jun 16 UTC 04:00)`);

// Birth at 12:00 noon GMT - no shift needed
const chart6 = calculateBirthChart('TZ Test 3', 2000, 6, 15, 12, 0, 51.5074, -0.1278, 0, 'London');
console.log(`Birth 12:00 GMT Jun 15 → JD: ${chart6.julianDay} (should be Jun 15 UTC 12:00)`);

console.log('\n=== ALL TESTS COMPLETE ===');
