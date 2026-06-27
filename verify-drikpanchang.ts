// Cross-verification: Compare our engine to Drik Panchang output
// Drik Panchang shows: Jun 27, 2026, 11:29 AM, Buffalo (42.8864°N, 78.8784°W), TZ -4 (EDT)
import { calculateBirthChart, dateToJD, getLahiriAyanamsha } from './src/lib/vedic-engine';

console.log('=== CROSS-VERIFICATION: Our Engine vs Drik Panchang ===');
console.log('Date: Jun 27, 2026, 11:29 AM EDT, Buffalo NY (42.8864°N, 78.8784°W)\n');

const chart = calculateBirthChart(
  'Drik Test', 2026, 6, 27, 11, 29,
  42.8864, -78.8784, -4, 'Buffalo, USA'
);

// Drik Panchang reference values (from their page):
const DRIK_REF: Record<string, { sign: string; deg: number; min: number; nak: string }> = {
  Sun:     { sign: 'Gemini',      deg: 11, min: 46, nak: 'Ardra' },
  Moon:    { sign: 'Scorpio',     deg: 16, min: 4,  nak: 'Anuradha' },  // "Vish" = Vrishchika = Scorpio
  Mars:    { sign: 'Taurus',      deg: 4,  min: 56, nak: 'Krittika' },  // "Vibh" = Vrishabha = Taurus
  Mercury: { sign: 'Cancer',      deg: 1,  min: 51, nak: 'Punarvasu' },
  Jupiter: { sign: 'Cancer',      deg: 5,  min: 13, nak: 'Pushya' },
  Venus:   { sign: 'Cancer',      deg: 22, min: 9,  nak: 'Ashlesha' },
  Saturn:  { sign: 'Pisces',      deg: 19, min: 48, nak: 'Revati' },
  Rahu:    { sign: 'Aquarius',    deg: 8,  min: 32, nak: 'Shatabhisha' },
  Ketu:    { sign: 'Leo',         deg: 8,  min: 32, nak: 'Magha' },
};

// Drik Panchang D9 (Navamsa) reference values:
const DRIK_D9_REF: Record<string, string> = {
  Sun:     'Capricorn',    // "Maka"
  Moon:    'Scorpio',      // "Vish"
  Mars:    'Aquarius',     // "Kumb"
  Mercury: 'Cancer',       // "Kark"
  Jupiter: 'Leo',          // "Simh"
  Venus:   'Capricorn',    // "Maka"
  Saturn:  'Sagittarius',  // "Dhan"
  Rahu:    'Sagittarius',  // "Dhan"
  Ketu:    'Gemini',       // "Mitu"
};

// Drik shows Lagna (Ascendant) in Simha (Leo) at 19°24'
console.log('--- ASCENDANT ---');
console.log(`Drik Panchang: Leo 19°24'`);
console.log(`Our Engine:    ${chart.ascendant.sign} ${Math.floor(chart.ascendant.degree)}°${String(Math.floor((chart.ascendant.degree % 1) * 60)).padStart(2, '0')}'`);
const ascMatch = chart.ascendant.sign === 'Leo';
console.log(`Sign Match: ${ascMatch ? '✅' : '❌'}\n`);

console.log('--- PLANETARY POSITIONS (D1 Rashi Chart) ---');
let totalErrors = 0;
for (const p of chart.planets) {
  const ref = DRIK_REF[p.name];
  if (!ref) continue;
  
  const ourDeg = Math.floor(p.degreeInSign);
  const ourMin = Math.floor((p.degreeInSign % 1) * 60);
  const refDeg = ref.deg;
  const refMin = ref.min;
  
  const signMatch = p.sign === ref.sign;
  const nakMatch = p.nakshatra === ref.nak;
  const arcminDiff = Math.abs((ourDeg * 60 + ourMin) - (refDeg * 60 + refMin));
  const degreeOk = arcminDiff <= 15; // Within 15 arcminutes tolerance
  
  const status = signMatch && nakMatch ? '✅' : '❌';
  if (!signMatch || !nakMatch) totalErrors++;
  
  console.log(`${status} ${p.name.padEnd(8)} Drik: ${ref.sign.padEnd(12)} ${String(refDeg).padStart(2)}°${String(refMin).padStart(2, '0')}'  |  Ours: ${p.sign.padEnd(12)} ${String(ourDeg).padStart(2)}°${String(ourMin).padStart(2, '0')}'  |  Diff: ${arcminDiff}'  Nak: ${nakMatch ? '✅' : `❌ ${p.nakshatra} vs ${ref.nak}`}`);
}

console.log('\n--- NAVAMSA CHART (D9) ---');
let d9Errors = 0;
const d9 = chart.divisionalCharts['d9'];
for (const dp of d9.planets) {
  const ref = DRIK_D9_REF[dp.planet];
  if (!ref) continue;
  
  const match = dp.sign === ref;
  if (!match) d9Errors++;
  
  console.log(`${match ? '✅' : '❌'} ${dp.planet.padEnd(8)} Drik D9: ${ref.padEnd(13)}  |  Ours D9: ${dp.sign}`);
}

// Check Rahu-Ketu axis in D9
const rahuD9 = d9.planets.find(p => p.planet === 'Rahu')!;
const ketuD9 = d9.planets.find(p => p.planet === 'Ketu')!;
const d9Diff = (ketuD9.signIndex - rahuD9.signIndex + 12) % 12;
console.log(`\nRahu-Ketu D9 axis: ${d9Diff} signs apart ${d9Diff === 6 ? '✅' : '❌'}`);

console.log(`\n--- SUMMARY ---`);
console.log(`D1 Sign/Nakshatra errors: ${totalErrors}`);
console.log(`D9 Navamsa errors: ${d9Errors}`);
console.log(`Ascendant sign: ${ascMatch ? 'MATCH ✅' : 'MISMATCH ❌'}`);
console.log(`Overall: ${totalErrors === 0 && d9Errors === 0 && ascMatch ? '✅ ALL MATCH' : '⚠️ HAS DIFFERENCES'}`);
