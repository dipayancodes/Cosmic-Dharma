// ============================================================
// Cosmic Dharma — Premium Vedic Astrology SPA v4.0
// 3-letter planet abbreviations, sign numbers, precise calculations
// ============================================================

(function() {
'use strict';

// === State ===
let currentChart = null;
let currentPage = 'landing';
let currentDashTab = 'overview';
let chartStyle = 'north';
let currentDivisional = 'd1';
let selectedPlanet = null;
let sidebarOpen = false;
let darkMode = true;
let collapsedSections = {};
let expandedDashas = {};
let selectedCountry = 'IN';

const CURRENCIES = {
  IN: { symbol: '\u20B9', code: 'INR', name: 'India', free: '0', pro: '499' },
  US: { symbol: '$', code: 'USD', name: 'United States', free: '0', pro: '5.99' },
  GB: { symbol: '\u00A3', code: 'GBP', name: 'United Kingdom', free: '0', pro: '4.99' },
  EU: { symbol: '\u20AC', code: 'EUR', name: 'Europe', free: '0', pro: '5.49' },
  CA: { symbol: 'C$', code: 'CAD', name: 'Canada', free: '0', pro: '7.99' },
  AU: { symbol: 'A$', code: 'AUD', name: 'Australia', free: '0', pro: '8.99' },
  JP: { symbol: '\u00A5', code: 'JPY', name: 'Japan', free: '0', pro: '899' },
  SG: { symbol: 'S$', code: 'SGD', name: 'Singapore', free: '0', pro: '7.99' },
  AE: { symbol: 'AED', code: 'AED', name: 'UAE', free: '0', pro: '21.99' },
  BD: { symbol: '\u09F3', code: 'BDT', name: 'Bangladesh', free: '0', pro: '599' },
};

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const SIGN_SYMBOLS = ['\u2648','\u2649','\u264A','\u264B','\u264C','\u264D','\u264E','\u264F','\u2650','\u2651','\u2652','\u2653'];
const PLANET_COLORS = {
  Sun: '#f59e0b', Moon: '#e2e8f0', Mars: '#ef4444', Mercury: '#10b981',
  Jupiter: '#f59e0b', Venus: '#ec4899', Saturn: '#6366f1', Rahu: '#8b5cf6', Ketu: '#a78bfa'
};
const PLANET_GLYPHS = { Sun:'\u2609', Moon:'\u263D', Mars:'\u2642', Mercury:'\u263F', Jupiter:'\u2643', Venus:'\u2640', Saturn:'\u2644', Rahu:'\u260A', Ketu:'\u260B' };
const PLANET_ABBR = { Sun:'SUN', Moon:'MON', Mars:'MAR', Mercury:'MER', Jupiter:'JUP', Venus:'VEN', Saturn:'SAT', Rahu:'RAH', Ketu:'KET' };

// === Router ===
function navigate(page, data) {
  currentPage = page;
  if (data) currentChart = data;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  history.pushState({ page }, '', page === 'landing' ? '/' : '/' + page);
}

window.addEventListener('popstate', (e) => {
  if (e.state?.page) { currentPage = e.state.page; render(); }
});

// === Star Background ===
function createStars() {
  const container = document.createElement('div');
  container.className = 'stars-bg';
  const count = window.innerWidth < 768 ? 60 : 100;
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;--duration:${2+Math.random()*4}s;--max-opacity:${0.3+Math.random()*0.6};animation-delay:${Math.random()*5}s;width:${1+Math.random()*2}px;height:${1+Math.random()*2}px;`;
    container.appendChild(star);
  }
  return container;
}

// === Tooltip ===
let tooltipEl = null;
function showTooltip(e, html) {
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'chart-tooltip';
    document.body.appendChild(tooltipEl);
  }
  tooltipEl.innerHTML = html;
  const x = Math.min(e.clientX + 12, window.innerWidth - 220);
  const y = Math.min(e.clientY - 10, window.innerHeight - 100);
  tooltipEl.style.left = x + 'px';
  tooltipEl.style.top = y + 'px';
  tooltipEl.classList.add('visible');
}
function hideTooltip() {
  if (tooltipEl) tooltipEl.classList.remove('visible');
}

// === Main Render ===
function render() {
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.appendChild(createStars());
  switch(currentPage) {
    case 'landing': app.innerHTML += renderLanding(); break;
    case 'generate': app.innerHTML += renderGenerate(); break;
    case 'dashboard': app.innerHTML += renderDashboard(); break;
  }
  attachEvents();
}

// === NAV BAR ===
function renderNav(transparent = false) {
  return `
  <nav class="fixed top-0 left-0 right-0 z-50 ${transparent ? '' : 'bg-cosmic-900/80 backdrop-blur-xl border-b border-purple-500/10'}">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <a href="/" onclick="event.preventDefault();window.__nav('landing')" class="flex items-center gap-3 cursor-pointer group">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-lg font-bold group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all">\u2726</div>
          <span class="font-display text-lg font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Cosmic Dharma</span>
        </a>
        <div class="flex items-center gap-3">
          <a href="/about" class="hidden sm:inline text-sm text-white/50 hover:text-white transition-colors">About</a>
          <a href="/contact" class="hidden sm:inline text-sm text-white/50 hover:text-white transition-colors">Contact</a>
          <button onclick="window.__toggleTheme()" class="theme-toggle-btn w-9 h-9 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all" title="Toggle theme">
            <i class="fas ${darkMode ? 'fa-sun' : 'fa-moon'}"></i>
          </button>
          ${currentPage !== 'generate' ? `<button onclick="window.__nav('generate')" class="btn-primary text-sm py-2 px-5">Generate Kundli</button>` : ''}
        </div>
      </div>
    </div>
  </nav>`;
}

// ============================================================
// LANDING PAGE
// ============================================================
function renderLanding() {
  return `
  ${renderNav(true)}
  <section class="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">${renderZodiacWheel()}</div>
    </div>
    <div class="relative z-10 text-center px-4 max-w-4xl mx-auto">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/5 mb-8 animate-fade-in">
        <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
        <span class="text-sm text-purple-300/80">Powered by Vedic Sidereal System \u00b7 Lahiri Ayanamsha</span>
      </div>
      <h1 class="font-display text-5xl sm:text-7xl lg:text-8xl font-bold mb-6 animate-fade-in leading-tight">
        <span class="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">Ancient Wisdom.</span><br>
        <span class="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">Modern Clarity.</span>
      </h1>
      <p class="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 animate-fade-in delay-200 leading-relaxed">
        Discover your cosmic blueprint with precision Vedic astrology. AI-powered insights meet ancient wisdom in a platform designed for the modern seeker.
      </p>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in delay-300">
        <button onclick="window.__nav('generate')" class="btn-primary text-lg py-4 px-10 rounded-xl">
          <i class="fas fa-wand-magic-sparkles mr-2"></i>Generate Your Kundli
        </button>
        <a href="#features" class="btn-secondary text-lg py-4 px-10 rounded-xl">
          <i class="fas fa-compass mr-2"></i>Explore Features
        </a>
      </div>
      <div class="mt-16 flex items-center justify-center gap-8 text-white/30 text-sm animate-fade-in delay-500 flex-wrap">
        <div class="flex items-center gap-2"><i class="fas fa-shield-halved text-green-400/60"></i> Encrypted & Secure</div>
        <div class="flex items-center gap-2"><i class="fas fa-bolt text-yellow-400/60"></i> Instant Results</div>
        <div class="flex items-center gap-2"><i class="fas fa-brain text-purple-400/60"></i> AI-Powered</div>
      </div>
    </div>
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
      <i class="fas fa-chevron-down text-white/20 text-xl"></i>
    </div>
  </section>
  <section id="features" class="py-24 px-4">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="font-display text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Vedic Astrology, Reimagined</h2>
        <p class="text-white/40 text-lg max-w-2xl mx-auto">Precision calculations, interactive charts, and AI insights for your cosmic journey.</p>
      </div>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${[
          { icon:'fa-chart-pie', color:'purple', title:'Interactive Birth Charts', desc:'Toggle between North & South Indian styles. Click planets for instant details with degree, sign, and nakshatra tooltips.' },
          { icon:'fa-atom', color:'cyan', title:'Divisional Charts', desc:'D1 (Rashi), D9 (Navamsa), D10 (Dashamsa), D60 (Shastiamsa) \u2014 all with precise sidereal calculations.' },
          { icon:'fa-timeline', color:'amber', title:'Vimshottari Dasha', desc:'Complete Mahadasha-Antardasha timeline with visual progression. Instantly see your current and upcoming planetary periods.' },
          { icon:'fa-shield-virus', color:'red', title:'Dosha Analysis', desc:'Mangalik, Kaal Sarp, and Pitra Dosha detection with severity meters, modern explanations, and actionable remedies.' },
          { icon:'fa-satellite', color:'blue', title:'Sade Sati Tracker', desc:'Real-time Saturn transit tracking against your Moon sign with phase detection, timeline, and personalized recommendations.' },
          { icon:'fa-brain', color:'pink', title:'AI Insight Engine', desc:'Deep personality, career, love, finance, and karma analysis derived directly from your unique planetary positions.' }
        ].map(f => `
          <div class="glass-card p-8 group">
            <div class="w-14 h-14 rounded-2xl bg-${f.color === 'amber' ? 'amber' : f.color}-500/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <i class="fas ${f.icon} text-2xl" style="color:var(--neon-${f.color === 'amber' ? 'gold' : f.color === 'red' ? 'pink' : f.color})"></i>
            </div>
            <h3 class="font-display text-xl font-bold mb-3">${f.title}</h3>
            <p class="text-white/40 leading-relaxed text-sm">${f.desc}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  <section class="py-24 px-4">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="font-display text-4xl sm:text-5xl font-bold mb-4">How It Works</h2>
        <p class="text-white/40 text-lg">Three steps to unlock your cosmic blueprint</p>
      </div>
      <div class="grid md:grid-cols-3 gap-8">
        ${[
          { step:'01', title:'Enter Birth Details', desc:'Name, date, exact time, and birthplace with timezone auto-detection.', icon:'fa-keyboard' },
          { step:'02', title:'Precision Calculations', desc:'Sidereal positions computed with Lahiri Ayanamsha, Whole Sign houses, and full Meeus algorithms.', icon:'fa-microchip' },
          { step:'03', title:'Explore Your Dashboard', desc:'Interactive charts, AI-powered insights, doshas, dashas, and transits \u2014 all in one place.', icon:'fa-rocket' }
        ].map(s => `
          <div class="text-center glass-card p-8">
            <div class="text-6xl font-display font-bold bg-gradient-to-b from-purple-400/30 to-transparent bg-clip-text text-transparent mb-4">${s.step}</div>
            <div class="w-16 h-16 mx-auto mb-5 rounded-2xl bg-purple-500/10 flex items-center justify-center">
              <i class="fas ${s.icon} text-2xl text-purple-400"></i>
            </div>
            <h3 class="font-display text-xl font-bold mb-2">${s.title}</h3>
            <p class="text-white/40 text-sm">${s.desc}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  <section class="py-24 px-4">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="font-display text-4xl font-bold mb-4">What Seekers Say</h2>
      </div>
      <div class="grid md:grid-cols-3 gap-6">
        ${[
          { name:'Priya M.', role:'Software Engineer', text:'Finally, an astrology platform that doesn\u2019t look like it was built in 2005. The dashboard is stunning and the insights are remarkably accurate.' },
          { name:'Arjun K.', role:'Entrepreneur', text:'The Dasha timeline and career insights helped me understand my professional cycles. It\u2019s like having a cosmic advisor in your pocket.' },
          { name:'Meera S.', role:'Yoga Teacher', text:'I appreciate how the dosha analysis is presented without fear-mongering. Modern, respectful, and deeply knowledgeable.' }
        ].map(t => `
          <div class="glass-card p-8">
            <div class="flex gap-1 mb-4">${'\u2605'.repeat(5).split('').map(() => '<span class="text-amber-400">\u2605</span>').join('')}</div>
            <p class="text-white/60 mb-6 italic leading-relaxed">"${t.text}"</p>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center font-bold text-sm">${t.name[0]}</div>
              <div><div class="font-semibold text-sm">${t.name}</div><div class="text-white/30 text-xs">${t.role}</div></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  <section class="py-24 px-4">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="font-display text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Choose Your Path</h2>
        <p class="text-white/40 text-lg">Start free. Upgrade when the cosmos align.</p>
        <div class="mt-6 inline-flex items-center gap-3 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/5">
          <i class="fas fa-globe text-purple-400 text-sm"></i>
          <select id="country-selector" onchange="window.__setCountry(this.value)" class="bg-transparent text-sm text-white/70 border-none outline-none cursor-pointer" style="-webkit-appearance:none;appearance:none">
            ${Object.entries(CURRENCIES).map(([code, cur]) => '<option value="' + code + '"' + (code === selectedCountry ? ' selected' : '') + ' style="background:#1a1a2e;color:#e2e8f0">' + cur.name + ' (' + cur.code + ')</option>').join('')}
          </select>
        </div>
      </div>
      <div class="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        <div class="glass-card pricing-card p-8">
          <div class="text-sm text-white/40 font-medium mb-2">FREE</div>
          <div class="font-display text-4xl font-bold mb-1">${CURRENCIES[selectedCountry].symbol}${CURRENCIES[selectedCountry].free}</div>
          <div class="text-white/30 text-sm mb-6">Forever free</div>
          <ul class="space-y-3 mb-8">
            ${['Full birth chart (D1)','Basic planetary positions','Nakshatra details','Dosha detection','Dasha overview','3 charts per month'].map(f => `<li class="flex items-center gap-3 text-sm text-white/60"><i class="fas fa-check text-green-400 text-xs"></i>${f}</li>`).join('')}
          </ul>
          <button onclick="window.__nav('generate')" class="btn-secondary w-full py-3">Get Started</button>
        </div>
        <div class="glass-card pricing-card featured p-8 relative">
          <div class="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-xs font-bold">PRO</div>
          <div class="text-sm text-purple-400 font-medium mb-2">PRO</div>
          <div class="font-display text-4xl font-bold mb-1">${CURRENCIES[selectedCountry].symbol}${CURRENCIES[selectedCountry].pro}<span class="text-lg text-white/30">/mo</span></div>
          <div class="text-white/30 text-sm mb-6">Unlock the cosmos</div>
          <ul class="space-y-3 mb-8">
            ${['Everything in Free','All divisional charts','AI-powered insights engine','Compatibility matching','Marriage & career timing','Personalized remedies','Annual horoscope PDF','Unlimited charts','Priority support'].map(f => `<li class="flex items-center gap-3 text-sm text-white/60"><i class="fas fa-check text-purple-400 text-xs"></i>${f}</li>`).join('')}
          </ul>
          <button class="btn-primary w-full py-3">Coming Soon</button>
        </div>
      </div>
    </div>
  </section>
  ${renderSEOContent()}
  ${renderFAQSection()}
  ${renderFullFooter()}`;
}

function renderZodiacWheel() {
  const symbols = ['\u2648','\u2649','\u264A','\u264B','\u264C','\u264D','\u264E','\u264F','\u2650','\u2651','\u2652','\u2653'];
  let html = '<div class="zodiac-wheel opacity-20">';
  html += '<div class="zodiac-ring animate-spin-slow" style="width:400px;height:400px;top:0;left:0"></div>';
  html += '<div class="zodiac-ring" style="width:300px;height:300px;top:50px;left:50px;animation:spin-slow 45s linear infinite reverse"></div>';
  html += '<div class="zodiac-ring animate-spin-slow" style="width:200px;height:200px;top:100px;left:100px;animation-duration:35s"></div>';
  symbols.forEach((s, i) => {
    const angle = (i * 30 - 90) * Math.PI / 180;
    const x = 200 + 180 * Math.cos(angle) - 12;
    const y = 200 + 180 * Math.sin(angle) - 12;
    html += `<div class="zodiac-symbol" style="left:${x}px;top:${y}px;font-size:24px;color:rgba(168,85,250,0.4)">${s}</div>`;
  });
  html += '</div>';
  return html;
}

// ============================================================
// SEO CONTENT SECTION
// ============================================================
function renderSEOContent() {
  return `
  <section class="py-24 px-4" id="seo-content">
    <div class="max-w-4xl mx-auto">
      <div class="glass-card p-8 sm:p-12">
        <h2 class="font-display text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Vedic Astrology: Your Gateway to Cosmic Wisdom</h2>
        <div class="space-y-4 text-white/50 leading-relaxed text-sm">
          <p>Vedic astrology, also known as <strong class="text-white/70">Jyotish Shastra</strong> or the "Science of Light," is one of the oldest and most comprehensive astrological systems in the world, with roots dating back over 5,000 years to the ancient Vedic scriptures of India. Unlike Western tropical astrology, Vedic astrology uses the <strong class="text-white/70">sidereal zodiac</strong>, which is based on the actual, observable positions of stars and constellations in the sky. This fundamental difference makes Vedic astrology chart calculations astronomically precise, as they account for the slow drift known as the <strong class="text-white/70">precession of equinoxes</strong> through the application of the Lahiri Ayanamsha correction \u2014 currently approximately 24 degrees.</p>
          <p>At the heart of every <strong class="text-white/70">Vedic astrology birth chart</strong> (also called a Kundli or Janma Patri) lies the Ascendant, or Lagna \u2014 the zodiac sign rising on the eastern horizon at the exact moment of your birth. The Ascendant sets the framework for the entire horoscope, determining the placement of the twelve houses (Bhavas) that govern different areas of life: personality, wealth, siblings, home, children, health, partnerships, transformation, fortune, career, gains, and spiritual liberation. Combined with the positions of the nine Vedic planets \u2014 Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, and Ketu \u2014 your Vedic astrology birth chart becomes a unique cosmic fingerprint that reveals your life\u2019s potential, challenges, and dharmic path.</p>
          <p>One of the most powerful features unique to Vedic astrology is the <strong class="text-white/70">Nakshatra system</strong> \u2014 27 lunar mansions that divide the zodiac into finer segments of 13 degrees and 20 minutes each. Each Nakshatra has its own ruling deity, planetary lord, and symbolic meaning, offering a layer of personality insight far more nuanced than zodiac signs alone. Your birth Nakshatra (determined by the Moon\u2019s position) is also the starting point for the <strong class="text-white/70">Vimshottari Dasha</strong> system \u2014 a sophisticated planetary period timeline spanning 120 years that maps out the timing of major life events, opportunities, and challenges with remarkable precision.</p>
          <p>Cosmic Dharma brings this ancient wisdom into the modern era with our <strong class="text-white/70">free Vedic astrology birth chart calculator online</strong>. Our platform uses precise astronomical algorithms with the Lahiri Ayanamsha to compute your sidereal planetary positions, generate interactive North and South Indian chart formats, and produce all 15 Parashari divisional charts (D1 through D60) \u2014 from the foundational Rashi chart to the deeply karmic Shastiamsa. Whether you are exploring your Navamsa (D9) chart for marriage insights or your Dashamsa (D10) for career guidance, every calculation is performed with mathematical precision on our edge computing infrastructure.</p>
          <p>Beyond charts, Cosmic Dharma offers comprehensive <strong class="text-white/70">Dosha analysis</strong> (Mangalik, Kaal Sarp, and Pitra Dosha) with severity ratings and modern remedial suggestions, <strong class="text-white/70">Sade Sati tracking</strong> for Saturn\u2019s 7.5-year transit cycle, <strong class="text-white/70">Shadbala</strong> (six-fold planetary strength analysis), <strong class="text-white/70">Ashtakavarga</strong> bindu calculations for transit predictions, <strong class="text-white/70">Yoga detection</strong> for special planetary combinations like Gaja Kesari and Pancha Mahapurusha, and <strong class="text-white/70">Arudha Pada</strong> analysis from the Jaimini system. Our AI-powered insight engine synthesizes all of these data points to deliver personalized readings on personality, career, relationships, finances, and karmic patterns.</p>
          <p>Whether you are a seasoned Jyotish practitioner seeking a reliable <strong class="text-white/70">Vedic astrology chart calculator</strong>, a curious beginner wanting to understand your <strong class="text-white/70">Vedic astrology signs</strong>, or someone looking for a <strong class="text-white/70">free Vedic astrology chart</strong> with professional-grade accuracy \u2014 Cosmic Dharma is your comprehensive, modern platform for exploring the cosmos within. Start your journey today by generating your Kundli and discover the ancient wisdom written in your stars.</p>
        </div>
      </div>
    </div>
  </section>`;
}

// ============================================================
// FAQ SECTION
// ============================================================
const FAQ_DATA = [
  { q: 'Is Vedic astrology most accurate?', a: 'Vedic astrology is considered highly accurate by many practitioners because it uses the sidereal zodiac system based on actual star positions, with the Lahiri Ayanamsha correction accounting for the precession of equinoxes. This makes planetary positions more astronomically precise. However, accuracy also depends on exact birth time and the skill of interpretation.' },
  { q: 'How do I know my Vedic astrology?', a: 'To know your Vedic astrology profile, you need your exact date of birth, time of birth, and place of birth. Using these details, a Vedic astrology calculator like Cosmic Dharma generates your complete birth chart (Kundli) showing your Ascendant (Lagna), Moon sign (Rashi), Sun sign, Nakshatra, and all planetary positions.' },
  { q: 'What is happening in Vedic astrology right now?', a: 'Current planetary transits are constantly shifting as planets move through different signs and nakshatras. Cosmic Dharma provides real-time transit information using sidereal calculations. Generate your birth chart and check the Transits tab to see how current movements affect your personal chart.' },
  { q: 'What exactly is Vedic astrology?', a: 'Vedic astrology (Jyotish Shastra) is an ancient Indian system dating back over 5,000 years. It uses the sidereal zodiac based on actual star positions, incorporating unique concepts like Nakshatras (27 lunar mansions), Vimshottari Dasha (planetary periods), divisional charts (D1\u2013D60), and Doshas. It aims to understand one\u2019s dharma and karma.' },
  { q: 'Is astrology 100% correct?', a: 'No astrological system claims 100% accuracy. Vedic astrology provides a framework for understanding planetary influences and life patterns. Its accuracy depends on precise birth details (especially exact birth time), the precision of calculations like Lahiri Ayanamsha, and the depth of interpretation.' },
  { q: 'What is Vedic astrology?', a: 'Vedic astrology, known as Jyotish or the "Science of Light," is the traditional Hindu system of astrology from ancient India. It uses the sidereal zodiac with Lahiri Ayanamsha for precession correction and the Whole Sign house system. Key components include Rashi, Nakshatra, Graha, Bhava, Dasha, and Yoga.' },
  { q: 'Is Vedic astrology more accurate?', a: 'Many practitioners consider Vedic astrology more accurate because it uses the sidereal zodiac aligned with actual astronomical constellation positions, accounting for the ~24-degree precession drift. Additionally, tools like Nakshatras, Vimshottari Dasha, and divisional charts provide deeper analytical layers.' },
  { q: 'What is my Vedic astrology sign?', a: 'Your Vedic sign is determined by the Moon\u2019s position in a zodiac sign (Rashi) at birth using the sidereal zodiac. This often differs from your Western sun sign. Use Cosmic Dharma\u2019s free calculator \u2014 enter your birth date, time, and place to get your Moon sign, Sun sign, and Ascendant.' },
  { q: 'What is the difference between Western and Vedic astrology?', a: 'Key differences: (1) Western uses tropical zodiac (fixed to seasons), Vedic uses sidereal (fixed to stars); (2) Western focuses on Sun sign, Vedic emphasizes Moon sign and Ascendant; (3) Vedic has unique Vimshottari Dasha system; (4) Vedic uses 27 Nakshatras and up to 60 divisional charts; (5) Traditional Vedic uses 9 planets including Rahu/Ketu.' },
  { q: 'How to read a Vedic astrology chart?', a: 'Reading involves: (1) Identify the Ascendant (Lagna); (2) Note planetary positions in signs and houses; (3) Check planetary dignities; (4) Analyze house lords; (5) Look for Yogas; (6) Check each planet\u2019s Nakshatra; (7) Examine divisional charts; (8) Review Vimshottari Dasha for event timing.' },
  { q: 'Is Vedic astrology accurate?', a: 'Vedic astrology\u2019s accuracy is supported by astronomically precise sidereal calculations. The Lahiri Ayanamsha ensures positions match actual star positions. Combined with exact birth time, Vedic charts can provide remarkably detailed life insights. Cosmic Dharma uses precise Meeus-algorithm calculations for maximum accuracy.' },
  { q: 'What is Nakshatra in Vedic astrology?', a: 'Nakshatras are the 27 lunar mansions, each spanning 13\u00b020\u2032 of the zodiac. They offer finer division than the 12 signs for more precise analysis. Each has a ruling deity, planetary lord, and four padas (quarters). Your birth Nakshatra determines your Dasha starting period and reveals deep personality traits.' },
  { q: 'How to calculate Moon sign in Vedic astrology?', a: 'Your Vedic Moon sign is calculated by determining the Moon\u2019s sidereal longitude at your exact birth time, then subtracting the Ayanamsha (~24\u00b0). The resulting position falls in one of 12 signs. This requires precise calculations due to the Moon\u2019s rapid movement (~13\u00b0/day). Use Cosmic Dharma for instant, accurate results.' },
  { q: 'What is my sign in Vedic astrology?', a: 'In Vedic astrology you have three primary signs: (1) Moon Sign (Rashi) \u2014 most important; (2) Sun Sign \u2014 often different from Western; (3) Ascendant (Lagna) \u2014 the rising sign at birth. Generate your free chart on Cosmic Dharma to discover all three.' },
  { q: 'Which is more accurate \u2014 Vedic or Western astrology?', a: 'Both have strengths. Vedic is considered more astronomically accurate since the sidereal zodiac matches actual star positions. The ~24\u00b0 Ayanamsha difference means your Vedic sign may differ from Western. Vedic also offers unique predictive tools like Dasha for timing events. Many use both systems together.' },
  { q: 'Is Vedic astrology sidereal?', a: 'Yes, Vedic astrology uses the sidereal zodiac based on actual star positions. The Lahiri Ayanamsha (~24\u00b0) accounts for the precession of equinoxes \u2014 Earth\u2019s axial wobble causing tropical and sidereal zodiacs to drift apart by about 1\u00b0 every 72 years.' },
  { q: 'How to learn Vedic astrology?', a: 'Start with: (1) The 12 signs and their characteristics; (2) The 9 Vedic planets and significations; (3) The 12 houses; (4) Basic dignities (exaltation, debilitation); (5) The 27 Nakshatras; (6) North and South Indian chart formats. Practice by generating charts on Cosmic Dharma and studying the interpretations.' },
  { q: 'How to calculate Upapada Lagna in Vedic astrology?', a: 'Upapada Lagna (UL) is calculated from the 12th house: find the 12th house lord, count the same distance from that lord\u2019s position. The resulting sign is your UL, revealing spouse and marriage details. Cosmic Dharma calculates UL and all Arudha Padas automatically in the Arudha Padas tab.' },
  { q: 'What is Pada in Vedic astrology?', a: 'Pada has two meanings: (1) Nakshatra Pada \u2014 each Nakshatra is divided into 4 quarters of 3\u00b020\u2032 each, totaling 108 padas mapping to the Navamsa chart; (2) Arudha Pada \u2014 the manifested image of a house using Jaimini principles, showing how life areas appear to the outside world.' },
  { q: 'How to calculate Dasha periods in Vedic astrology?', a: 'Vimshottari Dasha starts from Moon\u2019s Nakshatra at birth. The remaining portion of the Nakshatra determines the first Mahadasha balance. Subsequent periods follow: Sun(6y), Moon(10y), Mars(7y), Rahu(18y), Jupiter(16y), Saturn(19y), Mercury(17y), Ketu(7y), Venus(20y) \u2014 totaling 120 years.' },
  { q: 'How to read Vedic astrology birth chart?', a: 'Start with the Ascendant for the house framework. Check Moon sign for emotional nature. Examine planets per house. Look at aspects (Drishti). Check for Yogas. Analyze Navamsa (D9) for marriage. Study the current Dasha for timing. Review Doshas for challenges. Cosmic Dharma provides all these automatically.' }
];

function renderFAQSection() {
  return `
  <section class="py-24 px-4" id="faq">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="font-display text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Frequently Asked Questions</h2>
        <p class="text-white/40 text-lg">Everything you need to know about Vedic astrology</p>
      </div>
      <div class="space-y-3" id="faq-accordion">
        ${FAQ_DATA.map((faq, i) => `
          <div class="glass-card overflow-hidden">
            <button class="w-full flex items-center justify-between p-5 text-left" onclick="window.__toggleFaq(${i})">
              <h3 class="font-display text-sm sm:text-base font-semibold pr-4">${faq.q}</h3>
              <i class="fas fa-chevron-down text-purple-400/50 text-xs transition-transform" id="faq-icon-${i}"></i>
            </button>
            <div class="px-5 overflow-hidden transition-all duration-300" id="faq-answer-${i}" style="max-height:0">
              <p class="text-white/50 text-sm leading-relaxed pb-5">${faq.a}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>`;
}

// ============================================================
// FULL FOOTER
// ============================================================
function renderFullFooter() {
  return `
  <footer class="border-t border-purple-500/10 py-16 px-4">
    <div class="max-w-7xl mx-auto">
      <div class="grid md:grid-cols-4 gap-10 mb-12">
        <div>
          <div class="flex items-center gap-3 mb-4">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-sm font-bold">\u2726</div>
            <span class="font-display font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Cosmic Dharma</span>
          </div>
          <p class="text-white/30 text-sm leading-relaxed mb-4">Premium Vedic astrology platform powered by the Sidereal system with Lahiri Ayanamsha. Ancient wisdom meets modern technology.</p>
          <p class="text-white/20 text-xs">Created by <strong class="text-purple-400/60">Dipayan Ghosh</strong></p>
        </div>
        <div>
          <h4 class="font-display font-bold text-sm mb-4 text-white/60">Platform</h4>
          <ul class="space-y-2 text-sm text-white/30">
            <li><a href="/" onclick="event.preventDefault();window.__nav('landing')" class="hover:text-purple-400 transition-colors">Home</a></li>
            <li><a href="/generate" onclick="event.preventDefault();window.__nav('generate')" class="hover:text-purple-400 transition-colors">Generate Kundli</a></li>
            <li><a href="/about" class="hover:text-purple-400 transition-colors">About Us</a></li>
            <li><a href="/contact" class="hover:text-purple-400 transition-colors">Contact Us</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-display font-bold text-sm mb-4 text-white/60">Legal</h4>
          <ul class="space-y-2 text-sm text-white/30">
            <li><a href="/privacy" class="hover:text-purple-400 transition-colors">Privacy Policy</a></li>
            <li><a href="/terms" class="hover:text-purple-400 transition-colors">Terms & Conditions</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-display font-bold text-sm mb-4 text-white/60">Connect</h4>
          <div class="flex gap-4 text-white/30 mb-4">
            <a href="#" class="hover:text-purple-400 transition-colors"><i class="fab fa-twitter text-lg"></i></a>
            <a href="#" class="hover:text-purple-400 transition-colors"><i class="fab fa-instagram text-lg"></i></a>
            <a href="#" class="hover:text-purple-400 transition-colors"><i class="fab fa-github text-lg"></i></a>
          </div>
          <div class="text-xs text-white/20 p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
            <i class="fas fa-om text-purple-400/40 mr-1"></i>
            Powered by Vedic Sidereal System \u00b7 Lahiri Ayanamsha
          </div>
        </div>
      </div>
      <div class="border-t border-purple-500/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-white/20 text-xs">\u00a9 2026 Cosmic Dharma. All rights reserved. Created by Dipayan Ghosh.</div>
        <div class="text-white/15 text-xs">Powered by Vedic Sidereal System \u00b7 Lahiri Ayanamsha</div>
      </div>
    </div>
  </footer>`;
}

// ============================================================
// KUNDLI GENERATOR
// ============================================================
function renderGenerate() {
  return `
  ${renderNav()}
  <section class="min-h-screen pt-24 pb-16 px-4">
    <div class="max-w-2xl mx-auto">
      <div class="text-center mb-10 animate-fade-in">
        <h1 class="font-display text-4xl sm:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Generate Your Kundli</h1>
        <p class="text-white/40">Enter your birth details for a precise Vedic birth chart</p>
      </div>
      <div class="glass-card p-8 sm:p-10 animate-scale-in">
        <form id="kundliForm" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-white/60 mb-2">Full Name</label>
            <input type="text" id="inp-name" class="cosmic-input" placeholder="Enter your full name" required>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-white/60 mb-2">Date of Birth</label>
              <input type="date" id="inp-dob" class="cosmic-input" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-white/60 mb-2">Time of Birth</label>
              <input type="time" id="inp-time" class="cosmic-input" value="12:00" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-white/60 mb-2">Gender <span class="text-white/30">(opt.)</span></label>
              <select id="inp-gender" class="cosmic-input">
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-white/60 mb-2">Birth Place</label>
            <input type="text" id="inp-place" class="cosmic-input" placeholder="e.g., Mumbai, India" required autocomplete="off">
            <div id="place-suggestions" class="hidden mt-2 glass-card-static max-h-48 overflow-y-auto rounded-xl"></div>
          </div>
          <div>
            <label class="block text-sm font-medium text-white/60 mb-2">Timezone <span class="text-white/30">(auto-detected from birthplace)</span></label>
            <div class="relative">
              <input type="text" id="inp-tz-display" class="cosmic-input pr-10" value="Select a birthplace first" disabled style="opacity:0.6;cursor:not-allowed">
              <div class="absolute right-3 top-1/2 -translate-y-1/2"><i class="fas fa-lock text-purple-400/40 text-xs"></i></div>
            </div>
            <p class="text-xs text-white/25 mt-1.5"><i class="fas fa-info-circle mr-1"></i>Timezone is locked to your birthplace for accurate calculations. Enter your birth time as local time at the birthplace.</p>
          </div>
          <input type="hidden" id="inp-lat" value="">
          <input type="hidden" id="inp-lng" value="">
          <input type="hidden" id="inp-tz" value="5.5">
          <div class="glass-card-static p-4 text-sm text-white/40 rounded-xl">
            <div class="flex items-start gap-3">
              <i class="fas fa-info-circle text-purple-400 mt-0.5"></i>
              <div>
                <strong class="text-white/60">Accuracy tip:</strong> Enter your birth time as <strong class="text-white/60">local time at your birthplace</strong>. The timezone is auto-detected from your selected location. If exact time is unknown, 12:00 PM is used as default. Check your birth certificate for the precise time.
              </div>
            </div>
          </div>
          <button type="submit" id="generateBtn" class="btn-primary w-full py-4 text-lg rounded-xl">
            <i class="fas fa-wand-magic-sparkles mr-2"></i>Generate My Birth Chart
          </button>
        </form>
        <div id="loadingState" class="hidden text-center py-12">
          <div class="cosmic-loader mx-auto mb-6"></div>
          <p class="text-purple-300 font-display text-lg mb-2">Calculating planetary positions\u2026</p>
          <p class="text-white/30 text-sm">Applying Lahiri Ayanamsha correction</p>
        </div>
      </div>
      <div class="text-center mt-8 animate-fade-in delay-300">
        <p class="text-white/30 text-sm mb-3">Want to try a demo first?</p>
        <button onclick="window.__loadDemo()" class="btn-secondary text-sm py-2 px-6"><i class="fas fa-play mr-2"></i>Load Sample Chart</button>
      </div>
    </div>
  </section>`;
}

// ============================================================
// DASHBOARD
// ============================================================
function renderDashboard() {
  if (!currentChart) { navigate('generate'); return ''; }
  const c = currentChart;
  const tabs = [
    { id:'overview', icon:'fa-home', label:'Overview' },
    { id:'chart', icon:'fa-chart-pie', label:'Birth Chart' },
    { id:'divisional', icon:'fa-layer-group', label:'Divisional' },
    { id:'yogas', icon:'fa-star', label:'Yogas' },
    { id:'arudha', icon:'fa-crosshairs', label:'Arudha Padas' },
    { id:'shadbala', icon:'fa-dumbbell', label:'Shadbala' },
    { id:'ashtakavarga', icon:'fa-table-cells', label:'Ashtakavarga' },
    { id:'doshas', icon:'fa-shield-virus', label:'Doshas' },
    { id:'sadesati', icon:'fa-satellite', label:'Sade Sati' },
    { id:'dasha', icon:'fa-timeline', label:'Dasha' },
    { id:'transits', icon:'fa-globe', label:'Transits' },
    { id:'insights', icon:'fa-brain', label:'AI Insights' },
  ];
  return `
  <button class="mobile-menu-btn fixed top-4 left-4 z-50 w-10 h-10 rounded-lg bg-cosmic-800/90 backdrop-blur border border-purple-500/20 flex items-center justify-center text-white/60 hover:text-white" onclick="window.__toggleSidebar()">
    <i class="fas ${sidebarOpen ? 'fa-times' : 'fa-bars'}"></i>
  </button>
  <div class="sidebar-overlay ${sidebarOpen ? 'active' : ''}" id="sidebarOverlay" onclick="window.__toggleSidebar()"></div>
  <aside class="sidebar ${sidebarOpen ? 'open' : ''}" id="sidebar">
    <div class="p-6 border-b border-purple-500/10 flex-shrink-0">
      <div class="flex items-center gap-3 mb-4 cursor-pointer" onclick="window.__nav('landing')">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-lg font-bold">\u2726</div>
        <span class="font-display font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Cosmic Dharma</span>
      </div>
      <div class="glass-card-static p-3 rounded-xl">
        <div class="text-sm font-semibold truncate">${c.name}</div>
        <div class="text-xs text-white/40 mt-1">${c.dateOfBirth} \u00b7 ${c.timeOfBirth}</div>
        <div class="text-xs text-white/30">${c.placeOfBirth}</div>
      </div>
    </div>
    <div class="flex-1 overflow-y-auto" style="min-height:0">
      <div class="py-4">
        <div class="px-5 text-[10px] text-white/20 font-semibold uppercase tracking-widest mb-2">Analysis</div>
        ${tabs.map(t => `<a class="sidebar-link ${currentDashTab === t.id ? 'active' : ''}" onclick="window.__setDashTab('${t.id}')"><i class="fas ${t.icon}"></i><span>${t.label}</span></a>`).join('')}
      </div>
      <div class="py-4 border-t border-purple-500/10">
        <div class="px-5 text-[10px] text-white/20 font-semibold uppercase tracking-widest mb-2">Actions</div>
        <a class="sidebar-link" onclick="window.__toggleTheme()"><i class="fas ${darkMode ? 'fa-sun' : 'fa-moon'}"></i><span>${darkMode ? 'Light Mode' : 'Dark Mode'}</span></a>
        <a class="sidebar-link" onclick="window.__downloadPDF()"><i class="fas fa-file-pdf"></i><span>Download PDF</span></a>
        <a class="sidebar-link" onclick="window.__nav('generate')"><i class="fas fa-plus"></i><span>New Chart</span></a>
      </div>
    </div>
  </aside>
  <div class="dashboard-content min-h-screen">
    <div class="pdf-header no-screen"><div class="brand">\u2726 Cosmic Dharma</div><div class="subtitle">Vedic Birth Chart \u2014 ${c.name} \u2014 ${c.dateOfBirth} ${c.timeOfBirth} \u2014 ${c.placeOfBirth}</div></div>
    ${renderDashContent()}
  </div>`;
}

function renderDashContent() {
  switch(currentDashTab) {
    case 'overview': return renderOverview();
    case 'chart': return renderChartTab();
    case 'divisional': return renderDivisionalTab();
    case 'yogas': return renderYogasTab();
    case 'arudha': return renderArudhaTab();
    case 'shadbala': return renderShadbalaTab();
    case 'ashtakavarga': return renderAshtakavargaTab();
    case 'doshas': return renderDoshaTab();
    case 'sadesati': return renderSadeSatiTab();
    case 'dasha': return renderDashaTab();
    case 'transits': return renderTransitTab();
    case 'insights': return renderInsightsTab();
    default: return renderOverview();
  }
}

// === Collapsible section helper ===
function sectionHeader(id, title, icon, extraHtml = '') {
  const collapsed = collapsedSections[id];
  return `<div class="flex items-center justify-between mb-5 section-collapse-toggle ${collapsed ? 'collapsed' : ''}" onclick="window.__toggleSection('${id}')">
    <h2 class="font-display text-xl font-bold flex items-center gap-3"><i class="fas ${icon} text-purple-400"></i> ${title}</h2>
    <div class="flex items-center gap-3">${extraHtml}<i class="fas fa-chevron-down collapse-icon text-white/20 text-xs"></i></div>
  </div>`;
}

// === OVERVIEW TAB ===
function renderOverview() {
  const c = currentChart;
  const asc = c.ascendant;
  const moon = c.planets.find(p => p.name === 'Moon');
  const sun = c.planets.find(p => p.name === 'Sun');
  return `
  <div class="page-enter">
    <div class="mb-8">
      <h1 class="font-display text-3xl font-bold mb-2">Welcome, ${c.name.split(' ')[0]}</h1>
      <p class="text-white/40 text-sm">Your cosmic profile at a glance</p>
    </div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      ${[
        { label:'Ascendant (Lagna)', value:asc.sign, sub:`${asc.degree.toFixed(1)}\u00b0 \u00b7 ${asc.nakshatra}`, icon:SIGN_SYMBOLS[asc.signIndex], color:'purple' },
        { label:'Moon Sign (Rashi)', value:moon.sign, sub:`${moon.degreeInSign.toFixed(1)}\u00b0 \u00b7 ${moon.nakshatra}`, icon:'\u263D', color:'blue' },
        { label:'Sun Sign', value:sun.sign, sub:`${sun.degreeInSign.toFixed(1)}\u00b0 \u00b7 ${sun.nakshatra}`, icon:'\u2609', color:'gold' },
        { label:'Birth Nakshatra', value:moon.nakshatra, sub:`Pada ${moon.nakshatraPada} \u00b7 Lord: ${moon.nakshatraLord}`, icon:'\u2727', color:'pink' }
      ].map(card => `
        <div class="glass-card p-5">
          <div class="text-xs text-white/30 mb-3 font-medium">${card.label}</div>
          <div class="flex items-center gap-3">
            <div class="text-3xl">${card.icon}</div>
            <div>
              <div class="font-display text-xl font-bold neon-text-${card.color}">${card.value}</div>
              <div class="text-xs text-white/40 mt-0.5">${card.sub}</div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="glass-card p-6 mb-8">
      ${sectionHeader('ov-planets', 'Planetary Positions', 'fa-globe')}
      <div class="collapsible-content ${collapsedSections['ov-planets'] ? 'collapsed' : ''}">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead><tr class="border-b border-purple-500/10">
              <th class="text-left py-3 px-3 text-white/40 font-medium">Planet</th>
              <th class="text-left py-3 px-3 text-white/40 font-medium">Sign</th>
              <th class="text-left py-3 px-3 text-white/40 font-medium">Degree</th>
              <th class="text-left py-3 px-3 text-white/40 font-medium hidden sm:table-cell">Nakshatra</th>
              <th class="text-left py-3 px-3 text-white/40 font-medium">House</th>
              <th class="text-left py-3 px-3 text-white/40 font-medium hidden sm:table-cell">Status</th>
            </tr></thead>
            <tbody>
              ${c.planets.map(p => `
                <tr class="border-b border-purple-500/5 hover:bg-purple-500/5 transition-colors cursor-pointer" onclick="window.__selectPlanet('${p.name}')">
                  <td class="py-3 px-3"><span class="planet-badge ${p.retrograde && p.name !== 'Rahu' && p.name !== 'Ketu' ? 'retro' : ''} ${p.dignity==='Exalted'?'exalted':''} ${p.dignity==='Debilitated'?'debilitated':''}"><span style="color:${PLANET_COLORS[p.name]}" class="font-bold">${PLANET_ABBR[p.name]}</span> ${p.retrograde && !['Rahu','Ketu'].includes(p.name) ? '<span class="text-red-400 text-xs">(R)</span>' : ''}</span></td>
                  <td class="py-3 px-3 text-white/70">${p.signIndex + 1} - ${p.sign}</td>
                  <td class="py-3 px-3 font-mono text-white/60">${p.degreeInSign.toFixed(2)}\u00b0</td>
                  <td class="py-3 px-3 text-white/50 hidden sm:table-cell">${p.nakshatra} (P${p.nakshatraPada})</td>
                  <td class="py-3 px-3"><span class="text-purple-300">H${p.house}</span></td>
                  <td class="py-3 px-3 hidden sm:table-cell"><span class="text-xs px-2 py-1 rounded-md ${p.dignity==='Exalted'?'bg-green-500/10 text-green-400':p.dignity==='Debilitated'?'bg-red-500/10 text-red-400':p.dignity==='Own Sign'?'bg-blue-500/10 text-blue-400':p.dignity==='Moolatrikona'?'bg-amber-500/10 text-amber-400':'bg-white/5 text-white/40'}">${p.dignity}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="grid lg:grid-cols-2 gap-6 mb-6">
      <div class="glass-card p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-display text-lg font-bold">Birth Chart (D1)</h2>
          <div class="flex gap-2">
            <button onclick="window.__setChartStyle('north')" class="tab-btn text-xs ${chartStyle==='north'?'active':''}">North</button>
            <button onclick="window.__setChartStyle('south')" class="tab-btn text-xs ${chartStyle==='south'?'active':''}">South</button>
          </div>
        </div>
        ${chartStyle === 'north' ? renderNorthChart(c.planets, c.ascendant.signIndex) : renderSouthChart(c.planets, c.ascendant.signIndex)}
      </div>
      <div class="glass-card p-6">
        <h2 class="font-display text-lg font-bold mb-4">Quick Insights</h2>
        <div class="space-y-3">
          ${c.doshas.slice(0,2).map(d => `
            <div class="flex items-center justify-between p-3 rounded-xl ${d.detected ? 'bg-amber-500/5 border border-amber-500/10' : 'bg-green-500/5 border border-green-500/10'}">
              <div class="flex items-center gap-3"><i class="fas ${d.detected?'fa-exclamation-triangle text-amber-400':'fa-check-circle text-green-400'}"></i><span class="text-sm font-medium">${d.name}</span></div>
              <span class="text-xs ${d.detected?'text-amber-400':'text-green-400'}">${d.detected?'Detected':'Not Found'}</span>
            </div>
          `).join('')}
          <div class="flex items-center justify-between p-3 rounded-xl ${c.sadeSati.isActive?'bg-blue-500/5 border border-blue-500/10':'bg-green-500/5 border border-green-500/10'}">
            <div class="flex items-center gap-3"><i class="fas fa-satellite ${c.sadeSati.isActive?'text-blue-400':'text-green-400'}"></i><span class="text-sm font-medium">Sade Sati</span></div>
            <span class="text-xs ${c.sadeSati.isActive?'text-blue-400':'text-green-400'}">${c.sadeSati.isActive?c.sadeSati.phase:'Not Active'}</span>
          </div>
          ${c.dashas.filter(d => d.isCurrent).map(d => `
            <div class="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
              <div class="flex items-center gap-3 mb-2"><i class="fas fa-timeline text-purple-400"></i><span class="text-sm font-medium">Current Mahadasha: <span class="text-purple-300">${d.planet}</span></span></div>
              <div class="text-xs text-white/40">${d.startDate} \u2192 ${d.endDate}</div>
              ${d.antardasha.filter(a => a.isCurrent).map(a => `<div class="text-xs text-white/50 mt-1">Antardasha: <span class="text-cyan-400">${a.planet}</span> (${a.startDate} \u2192 ${a.endDate})</div>`).join('')}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    <div class="grid lg:grid-cols-3 gap-6 mb-6">
      <div class="glass-card p-5">
        <h3 class="font-display text-sm font-bold mb-3 flex items-center gap-2"><i class="fas fa-star text-amber-400"></i> Active Yogas</h3>
        ${(c.yogas || []).filter(y => y.present).length > 0 ? 
          (c.yogas || []).filter(y => y.present).slice(0, 4).map(y => `<div class="flex items-center justify-between p-2 rounded-lg bg-green-500/5 border border-green-500/10 mb-2"><span class="text-xs font-medium text-green-300">${y.name}</span><span class="text-[10px] text-white/30">${y.type}</span></div>`).join('') + ((c.yogas || []).filter(y => y.present).length > 4 ? '<div class="text-[10px] text-purple-400 cursor-pointer" onclick="window.__setDashTab(\'yogas\')">+' + ((c.yogas || []).filter(y => y.present).length - 4) + ' more \u2192</div>' : '')
          : '<div class="text-xs text-white/30 text-center py-3">No special yogas detected</div>'}
      </div>
      <div class="glass-card p-5">
        <h3 class="font-display text-sm font-bold mb-3 flex items-center gap-2"><i class="fas fa-crosshairs text-cyan-400"></i> Key Arudha Padas</h3>
        ${c.arudhaPadas ? ['AL','A7','UL'].map(key => {
          const d = c.arudhaPadas[key];
          if (!d) return '';
          const labels = { AL:'Arudha Lagna', A7:'Darapada', UL:'Upapada' };
          return `<div class="flex items-center justify-between p-2 rounded-lg bg-cyan-500/5 border border-cyan-500/10 mb-2"><span class="text-xs font-medium text-cyan-300">${key} (${labels[key]})</span><span class="text-xs text-white/50">${d.sign}</span></div>`;
        }).join('') : '<div class="text-xs text-white/30 text-center py-3">Not available</div>'}
        <div class="text-[10px] text-purple-400 cursor-pointer mt-1" onclick="window.__setDashTab('arudha')">View all padas \u2192</div>
      </div>
      <div class="glass-card p-5">
        <h3 class="font-display text-sm font-bold mb-3 flex items-center gap-2"><i class="fas fa-compass text-purple-400"></i> Special Lagnas</h3>
        ${c.specialLagnas ? Object.entries(c.specialLagnas).map(([key, val]) => `<div class="flex items-center justify-between p-2 rounded-lg bg-purple-500/5 border border-purple-500/10 mb-2"><span class="text-xs font-medium text-purple-300">${val.abbr}</span><span class="text-xs text-white/50">${val.sign}</span></div>`).join('') : '<div class="text-xs text-white/30 text-center py-3">Not available</div>'}
      </div>
    </div>
  </div>`;
}

// === BIRTH CHART TAB ===
function renderChartTab() {
  const c = currentChart;
  return `
  <div class="page-enter">
    <div class="flex items-center justify-between mb-6 flex-wrap gap-4">
      <div><h1 class="font-display text-2xl font-bold">Birth Chart (Rashi)</h1><p class="text-white/40 text-sm mt-1">D1 chart \u00b7 Whole Sign houses \u00b7 Lahiri Ayanamsha</p></div>
      <div class="flex gap-2">
        <button onclick="window.__setChartStyle('north')" class="tab-btn ${chartStyle==='north'?'active':''}">North Indian</button>
        <button onclick="window.__setChartStyle('south')" class="tab-btn ${chartStyle==='south'?'active':''}">South Indian</button>
      </div>
    </div>
    <div class="grid lg:grid-cols-5 gap-6">
      <div class="lg:col-span-3 glass-card p-6 sm:p-8">
        <div class="max-w-lg mx-auto">${chartStyle === 'north' ? renderNorthChart(c.planets, c.ascendant.signIndex) : renderSouthChart(c.planets, c.ascendant.signIndex)}</div>
      </div>
      <div class="lg:col-span-2">
        ${selectedPlanet ? renderPlanetDetail(c.planets.find(p => p.name === selectedPlanet), null) : `
          <div class="glass-card p-6 text-center"><i class="fas fa-hand-pointer text-4xl text-purple-400/30 mb-4 block"></i><p class="text-white/40 text-sm">Click on a planet in the chart to see detailed interpretation</p></div>
        `}
        <div class="glass-card p-5 mt-4">
          <h3 class="text-sm font-semibold text-white/60 mb-3">Chart Metadata</h3>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between"><span class="text-white/40">Ayanamsha</span><span class="text-white/70">${c.ayanamsha}\u00b0 (Lahiri)</span></div>
            <div class="flex justify-between"><span class="text-white/40">House System</span><span class="text-white/70">Whole Sign</span></div>
            <div class="flex justify-between"><span class="text-white/40">Julian Day</span><span class="text-white/70 font-mono">${c.julianDay.toFixed(4)}</span></div>
            <div class="flex justify-between"><span class="text-white/40">Coordinates</span><span class="text-white/70">${c.latitude.toFixed(4)}\u00b0N, ${c.longitude.toFixed(4)}\u00b0E</span></div>
            <div class="flex justify-between"><span class="text-white/40">Timezone</span><span class="text-white/70">UTC${c.timezone >= 0 ? '+' : ''}${c.timezone}</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function renderPlanetDetail(p, divContext) {
  if (!p) return '';
  // divContext: { sign, signIndex, house, chartLabel } when viewing a divisional chart
  const sign = divContext ? divContext.sign : p.sign;
  const signIdx = divContext ? divContext.signIndex : p.signIndex;
  const house = divContext ? divContext.house : p.house;
  const chartLabel = divContext ? divContext.chartLabel : null;
  return `
  <div class="glass-card p-6 animate-slide-right">
    <div class="flex items-center gap-4 mb-5">
      <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold" style="background:${PLANET_COLORS[p.name]}15;box-shadow:0 0 25px ${PLANET_COLORS[p.name]}10;color:${PLANET_COLORS[p.name]}">${PLANET_ABBR[p.name]}</div>
      <div><h3 class="font-display text-xl font-bold">${p.name}</h3><div class="text-sm text-white/50">${signIdx + 1} - ${sign} ${chartLabel ? '<span class="text-purple-400">(' + chartLabel + ')</span>' : '\u00b7 ' + p.nakshatra}</div></div>
    </div>
    <div class="space-y-2.5 text-sm">
      ${(divContext ? [
        ['Sign in ' + chartLabel, `${signIdx + 1} - ${sign}`],
        ['House in ' + chartLabel, `H${house}`],
        ['D1 Sign (Rashi)', `${p.signIndex + 1} - ${p.sign} (${p.signSanskrit})`],
        ['D1 Degree', `${p.degreeInSign.toFixed(2)}\u00b0`],
        ['Nakshatra', `${p.nakshatra} (Pada ${p.nakshatraPada})`],
        ['D1 House', `H${p.house}`],
        ['Dignity (D1)', p.dignity],
        ['Retrograde', p.retrograde ? 'Yes \u211E' : 'No'],
        ['Navamsa (D9)', p.navamsaSign],
        ['Dashamsa (D10)', p.dashamsaSign],
      ] : [
        ['Sidereal Longitude', `${p.siderealLongitude.toFixed(4)}\u00b0`],
        ['Degree in Sign', `${p.degreeInSign.toFixed(2)}\u00b0`],
        ['Sign (Rashi)', `${p.signIndex + 1} - ${p.sign} (${p.signSanskrit})`],
        ['Nakshatra', `${p.nakshatra} (Pada ${p.nakshatraPada})`],
        ['Nakshatra Lord', p.nakshatraLord],
        ['Nakshatra Deity', p.nakshatraDeity],
        ['House', `${p.house}`],
        ['Dignity', p.dignity],
        ['Retrograde', p.retrograde ? 'Yes \u211E' : 'No'],
        ['Navamsa (D9)', p.navamsaSign],
        ['Dashamsa (D10)', p.dashamsaSign],
      ]).map(([label, val]) => `<div class="flex justify-between"><span class="text-white/40">${label}</span><span class="${label.includes('Dignity') ? (p.dignity === 'Exalted' ? 'text-green-400' : p.dignity === 'Debilitated' ? 'text-red-400' : 'text-white/70') : label === 'Retrograde' ? (p.retrograde ? 'text-red-400' : 'text-green-400') : 'text-white/70'} ${label.includes('Longitude') || label.includes('Degree') ? 'font-mono' : ''}">${val}</span></div>`).join('')}
    </div>
  </div>`;
}

// === NORTH INDIAN CHART — Standard Diamond Layout ===
// ================================================================
// NORTH INDIAN CHART — Precise geometric layout
// ================================================================
// Layout: Outer square + inner diamond (connecting midpoints) + corner diagonals
// Creates 4 diamond houses (kendras: 1,4,7,10) and 8 triangle houses
// H1(ASC) = top center diamond, counter-clockwise: H2..H12
//
//      ┌──────────────┬──────────────┐
//      │ \    H2      │    H12    /  │
//      │   \          │        /     │
//      │     ◆ ─ ─ ─ ─ ─ ─ ─ ◆      │
//      │   / H1(ASC)  │        \ H10 │ (Note: H1 visible above
//      │  H3  \       │      /  H11  │  center; H10 visible right)
//      ├───────\──────┼────/─────────┤
//      │  H3  / \     │  / \   H11   │
//      │     /   ◆ H4 │ H10◆   \    │
//      │  H5  \ /     │     \ /  H9  │
//      ├───────/──────┼────\─────────┤
//      │     / H7     │      \       │
//      │   ◆ ─ ─ ─ ─ ─ ─ ─ ─ ◆      │
//      │   \          │        /     │
//      │ /    H6      │    H8    \   │
//      └──────────────┴──────────────┘
//
function renderNorthChart(planets, ascSignIdx) {
  const S = 440;  // SVG size (slightly larger for breathing room)
  const P = 20;   // padding
  const L = P, R = S - P, T = P, B = S - P;
  const MX = S / 2, MY = S / 2;

  const planetsByHouse = {};
  planets.forEach(p => {
    const h = p.house;
    if (!planetsByHouse[h]) planetsByHouse[h] = [];
    planetsByHouse[h].push(p);
  });

  // Key geometric points
  // Diamond-square intersection points (where corner diagonals meet diamond edges)
  const half = (R - L) / 4; // quarter size = 100
  const INT_TL = { x: L + half, y: T + half };      // (120, 120)
  const INT_TR = { x: R - half, y: T + half };       // (320, 120)
  const INT_BL = { x: L + half, y: B - half };       // (120, 320)
  const INT_BR = { x: R - half, y: B - half };       // (320, 320)

  // Precise geometric centroids for each of the 12 houses
  // Diamond houses (kendras) = 4 vertices → centroid is average of 4 points
  // Triangle houses = 3 vertices → centroid is average of 3 points
  const houseCentroids = [
    { x: MX,                                y: (T + INT_TL.y + MY + INT_TR.y) / 4 },            // H1:  top diamond (ASC)
    { x: (L + MX + INT_TL.x) / 3,          y: (T + T + INT_TL.y) / 3 },                        // H2:  upper-left triangle
    { x: (L + L + INT_TL.x) / 3,           y: (T + MY + INT_TL.y) / 3 },                       // H3:  left-upper triangle
    { x: (L + INT_TL.x + MX + INT_BL.x) / 4, y: MY },                                          // H4:  left diamond
    { x: (L + L + INT_BL.x) / 3,           y: (MY + B + INT_BL.y) / 3 },                       // H5:  lower-left triangle
    { x: (L + MX + INT_BL.x) / 3,          y: (B + B + INT_BL.y) / 3 },                        // H6:  bottom-left triangle
    { x: MX,                                y: (B + INT_BL.y + MY + INT_BR.y) / 4 },            // H7:  bottom diamond
    { x: (R + MX + INT_BR.x) / 3,          y: (B + B + INT_BR.y) / 3 },                        // H8:  bottom-right triangle
    { x: (R + R + INT_BR.x) / 3,           y: (MY + B + INT_BR.y) / 3 },                       // H9:  right-lower triangle
    { x: (R + INT_TR.x + MX + INT_BR.x) / 4, y: MY },                                          // H10: right diamond
    { x: (R + R + INT_TR.x) / 3,           y: (T + MY + INT_TR.y) / 3 },                       // H11: right-upper triangle
    { x: (R + MX + INT_TR.x) / 3,          y: (T + T + INT_TR.y) / 3 },                        // H12: upper-right triangle
  ];

  // Sign number positions: placed in the outer corner/edge of each house (away from center)
  // For narrow side triangles (H3,H5,H9,H11), push sign numbers towards the outer corner
  const signNumPos = [
    { x: MX,     y: T + 34 },            // H1:  near top of diamond
    { x: L + 36, y: T + 22 },            // H2:  near top-left corner
    { x: L + 18, y: T + 50 },            // H3:  near top-left outer corner
    { x: L + 34, y: MY - 6 },            // H4:  near left edge of diamond
    { x: L + 18, y: B - 50 },            // H5:  near bottom-left outer corner
    { x: L + 36, y: B - 22 },            // H6:  near bottom-left corner
    { x: MX,     y: B - 26 },            // H7:  near bottom of diamond
    { x: R - 36, y: B - 22 },            // H8:  near bottom-right corner
    { x: R - 18, y: B - 50 },            // H9:  near bottom-right outer corner
    { x: R - 34, y: MY - 6 },            // H10: near right edge of diamond
    { x: R - 18, y: T + 50 },            // H11: near top-right outer corner
    { x: R - 36, y: T + 22 },            // H12: near top-right corner
  ];

  // --- Build SVG ---
  let svg = `<svg viewBox="0 0 ${S} ${S}" class="ni-svg" xmlns="http://www.w3.org/2000/svg">`;

  // Background
  svg += `<rect x="0" y="0" width="${S}" height="${S}" fill="none"/>`;

  // Outer square
  svg += `<rect x="${L}" y="${T}" width="${R-L}" height="${B-T}" fill="none" stroke="var(--ni-line, rgba(168,85,250,0.3))" stroke-width="1.5"/>`;

  // Inner diamond
  svg += `<polygon points="${MX},${T} ${R},${MY} ${MX},${B} ${L},${MY}" fill="none" stroke="var(--ni-line, rgba(168,85,250,0.3))" stroke-width="1.5"/>`;

  // Diagonal lines from corners to center (house dividers)
  const diags = [[L,T,MX,MY],[R,T,MX,MY],[L,B,MX,MY],[R,B,MX,MY]];
  diags.forEach(([x1,y1,x2,y2]) => {
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--ni-line-dim, rgba(168,85,250,0.18))" stroke-width="1"/>`;
  });

  // Draw each house content
  for (let h = 1; h <= 12; h++) {
    const centroid = houseCentroids[h - 1];
    const snPos = signNumPos[h - 1];
    const signIdx = (ascSignIdx + h - 1) % 12;
    const isDiamond = [1, 4, 7, 10].includes(h);

    // Sign number — small, in outer corner of house
    svg += `<text x="${snPos.x}" y="${snPos.y}" text-anchor="middle" dominant-baseline="central" fill="var(--ni-sign-color, rgba(168,85,250,0.5))" font-size="11" font-weight="600" font-family="'Space Grotesk',sans-serif">${signIdx + 1}</text>`;

    // ASC label for house 1
    if (h === 1) {
      svg += `<text x="${MX}" y="${T + 14}" text-anchor="middle" fill="var(--ni-asc-color, #a855f7)" font-size="9" font-weight="700" font-family="'Space Grotesk',sans-serif" letter-spacing="1">ASC</text>`;
    }

    // Planets — centered at house centroid, vertically stacked
    const housePlanets = planetsByHouse[h] || [];
    if (housePlanets.length === 0) continue;

    // Adaptive sizing: reduce font/spacing when many planets in one house
    const count = housePlanets.length;
    const maxComfort = isDiamond ? 4 : 3;
    const fontSize = count > maxComfort ? 9 : 10;
    const lineH = count > maxComfort ? 11 : 13;

    const totalH = count * lineH;
    // Start Y so that the block is centered at the centroid
    const startY = centroid.y - totalH / 2 + lineH / 2;

    housePlanets.forEach((p, idx) => {
      const yPos = startY + idx * lineH;
      const color = PLANET_COLORS[p.name] || '#ccc';
      const abbr = PLANET_ABBR[p.name] || p.name.substring(0, 3).toUpperCase();
      const retMark = (p.retrograde && !['Rahu', 'Ketu'].includes(p.name)) ? '\u1D3F' : '';
      svg += `<text x="${centroid.x}" y="${yPos}" text-anchor="middle" dominant-baseline="central" fill="${color}" font-size="${fontSize}" font-weight="700" class="planet-in-chart" data-planet="${p.name}" style="cursor:pointer" font-family="'Space Grotesk',sans-serif">${abbr}${retMark}</text>`;
    });
  }

  svg += `</svg>`;
  return `<div class="ni-chart">${svg}</div>`;
}

// === SOUTH INDIAN CHART — Fixed standard layout ===
// Signs are FIXED: Pisces(12) top-left → clockwise → Aquarius(11)
// The 4x4 grid with center 2x2 for name/date:
// Row 0: Pisces(12)  Aries(1)     Taurus(2)   Gemini(3)
// Row 1: Aquarius(11) [center]     [center]    Cancer(4)
// Row 2: Capricorn(10)[center]     [center]    Leo(5)
// Row 3: Sagittarius(9) Scorpio(8) Libra(7)   Virgo(6)
function renderSouthChart(planets, ascSignIdx) {
  // signOrder maps each of the 16 grid cells (row-major) to sign index (0-based), -1 = center
  const signOrder = [11, 0, 1, 2, 10, -1, -1, 3, 9, -1, -1, 4, 8, 7, 6, 5];
  const planetsBySign = {};
  planets.forEach(p => { if (!planetsBySign[p.signIndex]) planetsBySign[p.signIndex] = []; planetsBySign[p.signIndex].push(p); });
  
  let html = '<div class="si-chart">';
  let centerRendered = false;
  for (let i = 0; i < 16; i++) {
    const signIdx = signOrder[i];
    if (signIdx === -1) {
      if (!centerRendered) {
        html += `<div class="si-center"><div class="font-display font-bold text-sm" style="color:rgba(168,85,250,0.6)">${currentChart.name.split(' ')[0]}</div><div class="text-[10px] mt-1" style="color:rgba(255,255,255,0.25)">${currentChart.dateOfBirth}</div><div class="text-[9px]" style="color:rgba(255,255,255,0.2)">${currentChart.timeOfBirth}</div></div>`;
        centerRendered = true;
      }
      continue;
    }
    const isAsc = signIdx === ascSignIdx;
    const signPlanets = planetsBySign[signIdx] || [];
    html += `<div class="si-cell ${isAsc ? 'si-cell-asc' : ''}">`;
    // Sign number — top-left corner, clearly visible
    html += `<span class="si-sign-num">${signIdx + 1}</span>`;
    // ASC label — top-right corner
    if (isAsc) html += `<span class="si-asc-label">ASC</span>`;
    // Planets section — centered, with clear spacing
    html += `<div class="si-planets">`;
    signPlanets.forEach(p => {
      const abbr = PLANET_ABBR[p.name] || p.name.substring(0, 3).toUpperCase();
      const retMark = (p.retrograde && !['Rahu','Ketu'].includes(p.name)) ? '<sup style="font-size:5px;color:#ef4444;vertical-align:super">R</sup>' : '';
      html += `<span class="si-planet" style="color:${PLANET_COLORS[p.name]}" data-planet="${p.name}" title="${PLANET_ABBR[p.name]} ${p.degreeInSign.toFixed(1)}\u00b0 ${p.sign} | House ${p.house} | ${p.nakshatra}">${abbr}${retMark}</span>`;
    });
    html += `</div></div>`;
  }
  html += '</div>';
  return html;
}

// === DIVISIONAL CHARTS TAB ===
// FIXED: Each divisional chart now uses its OWN ascendant from the engine, not D1's ascendant
function renderDivisionalTab() {
  const c = currentChart;
  const divCharts = {
    d1:'Rashi (D1)', d2:'Hora (D2)', d3:'Drekkana (D3)', d7:'Saptamsa (D7)',
    d9:'Navamsa (D9)', d10:'Dashamsa (D10)', d12:'Dwadasamsa (D12)',
    d16:'Shodasamsa (D16)', d20:'Vimsamsa (D20)', d24:'Chaturvimsamsa (D24)',
    d27:'Bhamsa (D27)', d30:'Trimsamsa (D30)', d40:'Khavedamsa (D40)',
    d45:'Akshavedamsa (D45)', d60:'Shastiamsa (D60)'
  };
  const descriptions = {
    d1: 'The Rashi chart (D1) is your main birth chart showing overall life themes and planetary strengths.',
    d2: 'The Hora chart (D2) analyzes wealth accumulation and financial prosperity. Only Leo (Sun) and Cancer (Moon) signs are used.',
    d3: 'The Drekkana chart (D3) reveals information about siblings, courage, and short journeys.',
    d7: 'The Saptamsa chart (D7) examines children, progeny, and creative expressions.',
    d9: 'The Navamsa chart (D9) reveals your soul\'s deeper purpose, marriage potential, and spiritual path. Most important after D1.',
    d10: 'The Dashamsa chart (D10) specifically analyzes career trajectory, professional achievements, and public reputation.',
    d12: 'The Dwadasamsa chart (D12) reveals information about parents, ancestral karma, and lineage.',
    d16: 'The Shodasamsa chart (D16) analyzes vehicles, comforts, luxuries, and overall happiness.',
    d20: 'The Vimsamsa chart (D20) examines spiritual practices, worship, and religious inclinations.',
    d24: 'The Chaturvimsamsa chart (D24) reveals academic achievements, learning, and education.',
    d27: 'The Bhamsa/Nakshatramsa chart (D27) analyzes physical strength, stamina, and vitality.',
    d30: 'The Trimsamsa chart (D30) reveals potential misfortunes, evils, and challenges to overcome.',
    d40: 'The Khavedamsa chart (D40) examines auspicious and inauspicious effects inherited from ancestors.',
    d45: 'The Akshavedamsa chart (D45) analyzes overall character, conduct, and moral nature.',
    d60: 'The Shastiamsa chart (D60) is the most precise divisional chart, confirming planetary effects and past-life karma.'
  };

  // Get data for current divisional chart — use the chart's OWN ascendant
  const divData = c.divisionalCharts[currentDivisional];
  if (!divData) { currentDivisional = 'd1'; return renderDivisionalTab(); }

  const divAscSignIdx = divData.ascendantSignIndex;
  const chartPlanets = divData.planets;

  // Build fake planet objects for chart rendering, using the DIVISIONAL ascendant for house numbers
  const fakePlanets = chartPlanets.map(d => {
    const orig = c.planets.find(p => p.name === d.planet);
    return { ...orig, signIndex: d.signIndex, sign: d.sign, house: ((d.signIndex - divAscSignIdx + 12) % 12) + 1 };
  });

  return `
  <div class="page-enter">
    <div class="flex items-center justify-between mb-6 flex-wrap gap-4">
      <div><h1 class="font-display text-2xl font-bold">Divisional Charts (Vargas)</h1><p class="text-white/40 text-sm mt-1">All 15 Parashari divisional charts with correct ascendants</p></div>
    </div>
    <div class="flex gap-2 flex-wrap mb-6">
      ${Object.entries(divCharts).map(([key, label]) => `<button onclick="window.__setDivisional('${key}')" class="tab-btn text-xs ${currentDivisional===key?'active':''}">${label}</button>`).join('')}
    </div>
    <div class="grid lg:grid-cols-5 gap-6">
      <div class="lg:col-span-3 glass-card p-6 sm:p-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="font-display text-lg font-semibold">${divCharts[currentDivisional]}</h2>
            <p class="text-xs text-white/30 mt-1">Ascendant: ${divData.ascendantSign} (${divAscSignIdx + 1})</p>
          </div>
          <div class="flex gap-2"><button onclick="window.__setChartStyle('north')" class="tab-btn text-xs ${chartStyle==='north'?'active':''}">North</button><button onclick="window.__setChartStyle('south')" class="tab-btn text-xs ${chartStyle==='south'?'active':''}">South</button></div>
        </div>
        ${chartStyle === 'north' ? renderNorthChart(fakePlanets, divAscSignIdx) : renderSouthChart(fakePlanets, divAscSignIdx)}
      </div>
      <div class="lg:col-span-2">
        ${selectedPlanet ? (function() {
          const sp = c.planets.find(p => p.name === selectedPlanet);
          const dp = chartPlanets.find(d => d.planet === selectedPlanet);
          if (sp && dp) {
            const hNum = ((dp.signIndex - divAscSignIdx + 12) % 12) + 1;
            return renderPlanetDetail(sp, { sign: dp.sign, signIndex: dp.signIndex, house: hNum, chartLabel: divCharts[currentDivisional] });
          }
          return '';
        })() : ''}
        <div class="glass-card p-6 mb-4${selectedPlanet ? ' mt-4' : ''}">
          <h3 class="font-display text-lg font-semibold mb-4">Positions in ${divCharts[currentDivisional]}</h3>
          <div class="space-y-2">${chartPlanets.map(d => {
            const houseNum = ((d.signIndex - divAscSignIdx + 12) % 12) + 1;
            return `<div class="flex items-center justify-between p-2 rounded-lg hover:bg-purple-500/5 transition-colors cursor-pointer ${selectedPlanet === d.planet ? 'bg-purple-500/10 border border-purple-500/20' : ''}" onclick="window.__selectPlanet('${d.planet}')"><div class="flex items-center gap-3"><span style="color:${PLANET_COLORS[d.planet]}" class="font-bold text-xs">${PLANET_ABBR[d.planet]}</span><span class="text-sm">${d.planet}</span></div><div class="text-right"><div class="text-sm text-white/60">${d.signIndex + 1} - ${d.sign}</div><div class="text-[10px] text-white/30">H${houseNum}</div></div></div>`;
          }).join('')}</div>
        </div>
        <div class="glass-card p-4">
          <div class="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10"><p class="text-xs text-white/40 leading-relaxed">${descriptions[currentDivisional] || ''}</p></div>
        </div>
      </div>
    </div>
  </div>`;
}

// === DOSHA TAB ===
function renderDoshaTab() {
  return `
  <div class="page-enter">
    <div class="mb-6"><h1 class="font-display text-2xl font-bold">Dosha Analysis</h1><p class="text-white/40 text-sm mt-1">Modern interpretation of classical Vedic doshas</p></div>
    <div class="grid gap-6">
      ${currentChart.doshas.map(d => `
        <div class="glass-card p-6 sm:p-8">
          <div class="flex items-start justify-between mb-4 flex-wrap gap-4">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl flex items-center justify-center ${d.detected?'bg-amber-500/10':'bg-green-500/10'}"><i class="fas ${d.detected?'fa-exclamation-triangle text-amber-400':'fa-check-circle text-green-400'} text-xl"></i></div>
              <div><h2 class="font-display text-xl font-bold">${d.name}</h2><span class="text-sm ${d.detected?'text-amber-400':'text-green-400'}">${d.detected?'Detected':'Not Present'}</span></div>
            </div>
            ${d.detected ? `<div class="text-right"><div class="text-xs text-white/30 mb-1">Severity</div><div class="font-display text-2xl font-bold ${d.severity>60?'text-red-400':d.severity>30?'text-amber-400':'text-green-400'}">${d.severity}%</div></div>` : ''}
          </div>
          ${d.detected ? `<div class="severity-meter ${d.severity>60?'severity-high':d.severity>30?'severity-medium':'severity-low'} mb-5"><div class="fill" style="width:${d.severity}%"></div></div>` : ''}
          <p class="text-white/50 leading-relaxed text-sm mb-5">${d.description}</p>
          ${d.remedies.length > 0 ? `
            <div class="mt-4">
              <h3 class="text-sm font-semibold text-white/60 mb-3"><i class="fas fa-hand-sparkles text-purple-400 mr-2"></i>Recommended Remedies</h3>
              <div class="grid sm:grid-cols-2 gap-2">${d.remedies.map(r => `<div class="flex items-start gap-2 p-3 rounded-lg bg-purple-500/5 border border-purple-500/10"><i class="fas fa-circle text-purple-400/40 text-[5px] mt-1.5"></i><span class="text-sm text-white/60">${r}</span></div>`).join('')}</div>
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  </div>`;
}

// === SADE SATI TAB ===
function renderSadeSatiTab() {
  const ss = currentChart.sadeSati;
  return `
  <div class="page-enter">
    <div class="mb-6"><h1 class="font-display text-2xl font-bold">Sade Sati Tracker</h1><p class="text-white/40 text-sm mt-1">Saturn's 7.5-year transit through your Moon sign</p></div>
    <div class="glass-card p-6 sm:p-8 mb-6">
      <div class="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center ${ss.isActive?'bg-blue-500/10 neon-glow-blue':'bg-green-500/10'}"><span class="text-3xl">\u2644</span></div>
          <div><h2 class="font-display text-2xl font-bold">${ss.isActive?'Sade Sati Active':'Sade Sati Not Active'}</h2><div class="text-sm text-white/40">Moon: ${ss.moonSign} \u00b7 Transit Saturn: ${ss.saturnSign}</div></div>
        </div>
        <div class="px-4 py-2 rounded-full ${ss.isActive?'bg-blue-500/10 border border-blue-500/30 text-blue-400':'bg-green-500/10 border border-green-500/30 text-green-400'} text-sm font-medium">${ss.isActive?ss.phase:'Inactive'}</div>
      </div>
      ${ss.isActive ? `
        <div class="mb-6">
          <div class="flex justify-between text-xs text-white/40 mb-2"><span>Start: ${ss.startDate}</span><span>${ss.progress.toFixed(0)}% complete</span><span>End: ${ss.endDate}</span></div>
          <div class="timeline-bar"><div class="progress" style="width:${ss.progress}%"></div></div>
        </div>
        <div class="grid sm:grid-cols-3 gap-4 mb-6">${['Rising (1st Phase)','Peak (2nd Phase)','Setting (3rd Phase)'].map(phase => `
          <div class="p-4 rounded-xl text-center ${ss.phase===phase?'bg-purple-500/10 border border-purple-500/30':'bg-white/5 border border-white/5'}">
            <div class="text-xs text-white/40 mb-1">${phase}</div>
            <i class="fas ${phase.includes('Rising')?'fa-arrow-up text-amber-400':phase.includes('Peak')?'fa-circle text-red-400':'fa-arrow-down text-green-400'} text-lg"></i>
            ${ss.phase===phase?'<div class="text-xs text-purple-400 mt-1 font-medium">Current</div>':''}
          </div>
        `).join('')}</div>
      ` : ''}
      <div class="p-5 rounded-xl bg-purple-500/5 border border-purple-500/10">
        <h3 class="text-sm font-semibold text-white/60 mb-2"><i class="fas fa-info-circle text-purple-400 mr-2"></i>Analysis</h3>
        <p class="text-sm text-white/50 leading-relaxed">${ss.effects}</p>
      </div>
      ${ss.recommendations.length > 0 ? `
        <div class="mt-6"><h3 class="text-sm font-semibold text-white/60 mb-3"><i class="fas fa-hand-sparkles text-purple-400 mr-2"></i>Recommendations</h3>
        <div class="grid sm:grid-cols-2 gap-2">${ss.recommendations.map(r => `<div class="flex items-start gap-2 p-3 rounded-lg bg-white/[0.03]"><i class="fas fa-circle text-purple-400/40 text-[5px] mt-1.5"></i><span class="text-sm text-white/60">${r}</span></div>`).join('')}</div></div>
      ` : ''}
    </div>
  </div>`;
}

// === DASHA TAB ===
function renderDashaTab() {
  const dashas = currentChart.dashas;
  return `
  <div class="page-enter">
    <div class="mb-6"><h1 class="font-display text-2xl font-bold">Vimshottari Dasha System</h1><p class="text-white/40 text-sm mt-1">Planetary period timeline based on Moon's Nakshatra position</p></div>
    <div class="glass-card p-6 mb-6">
      ${sectionHeader('dasha-timeline', 'Mahadasha Timeline', 'fa-chart-bar')}
      <div class="collapsible-content ${collapsedSections['dasha-timeline'] ? 'collapsed' : ''}">
        <div class="flex gap-1 h-10 rounded-xl overflow-hidden mb-4">
          ${dashas.map(d => {
            const widthPct = (d.years / 120 * 100);
            return `<div class="h-full flex items-center justify-center text-xs font-bold transition-all hover:opacity-100 ${d.isCurrent?'opacity-100':'opacity-40'}" style="width:${Math.max(widthPct, 3)}%;background:${PLANET_COLORS[d.planet]}25;border:1px solid ${PLANET_COLORS[d.planet]}40;color:${PLANET_COLORS[d.planet]}" title="${d.planet}: ${d.startDate} to ${d.endDate}">${widthPct > 6 ? (PLANET_ABBR[d.planet] || d.planet.substring(0,3)) : ''}</div>`;
          }).join('')}
        </div>
        <div class="flex flex-wrap gap-3 text-xs">${dashas.map(d => `<span class="flex items-center gap-1.5 ${d.isCurrent?'text-white':'text-white/30'}"><span class="w-2 h-2 rounded-full" style="background:${PLANET_COLORS[d.planet]}"></span>${PLANET_ABBR[d.planet]} (${d.years}y)</span>`).join('')}</div>
      </div>
    </div>
    <div class="glass-card p-6">
      <h2 class="font-display text-lg font-semibold mb-4">Detailed Periods</h2>
      <div class="space-y-1" id="dasha-periods">
        ${dashas.map((d, idx) => {
          const isExp = expandedDashas[idx];
          return `
          <div class="dasha-row-wrap ${d.isCurrent?'current':''} ${isExp?'expanded':''}" data-dasha-idx="${idx}" onclick="window.__toggleDasha(${idx})">
            <div class="dasha-row-header">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0" style="background:${PLANET_COLORS[d.planet]}12;color:${PLANET_COLORS[d.planet]}">${PLANET_ABBR[d.planet]}</div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap"><span class="font-semibold text-sm">${d.planet} Mahadasha</span>${d.isCurrent?'<span class="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium">Active</span>':''}</div>
                <div class="text-xs text-white/40 mt-0.5">${d.startDate} \u2192 ${d.endDate} \u00b7 ${d.years} years</div>
              </div>
              <i class="fas fa-chevron-down dasha-chevron text-white/20 text-xs"></i>
            </div>
            <div class="dasha-detail">
              <div class="dasha-detail-inner">
                <div class="text-xs text-white/30 mb-2 font-medium">Antardasha Periods:</div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-1">${d.antardasha.map(a => `
                  <div class="dasha-sub-item flex items-center justify-between px-3 py-2 rounded-lg ${a.isCurrent?'bg-cyan-500/10 border border-cyan-500/20':'bg-white/[0.02]'}">
                    <div class="flex items-center gap-2"><span class="text-xs font-bold" style="color:${PLANET_COLORS[a.planet]}">${PLANET_ABBR[a.planet]}</span><span class="text-xs ${a.isCurrent?'text-cyan-400 font-medium':'text-white/50'}">${a.planet}</span>${a.isCurrent?'<span class="text-[10px] text-cyan-400">\u25CF</span>':''}</div>
                    <span class="text-[10px] text-white/30">${a.startDate} \u2192 ${a.endDate}</span>
                  </div>
                `).join('')}</div>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
  </div>`;
}

// === TRANSITS TAB ===
function renderTransitTab() {
  const transits = currentChart.transits;
  return `
  <div class="page-enter">
    <div class="mb-6"><h1 class="font-display text-2xl font-bold">Planetary Transits</h1><p class="text-white/40 text-sm mt-1">Current planetary positions and their effects</p></div>
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      ${transits.map(t => `
        <div class="glass-card p-5 group">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold" style="background:${PLANET_COLORS[t.planet]}12;color:${PLANET_COLORS[t.planet]}">${PLANET_ABBR[t.planet]}</div>
              <div><div class="font-semibold text-sm">${PLANET_ABBR[t.planet]} - ${t.planet}</div><div class="text-xs text-white/40">${t.degree.toFixed(1)}\u00b0 ${t.sign} (${t.signIndex + 1})</div></div>
            </div>
            ${t.retrograde && !['Rahu','Ketu'].includes(t.planet) ? '<span class="text-xs text-red-400 font-medium px-2 py-0.5 rounded bg-red-500/10">\u211E Retro</span>' : ''}
          </div>
          <p class="text-xs text-white/40 leading-relaxed">${t.effects}</p>
        </div>
      `).join('')}
    </div>
    <div class="glass-card p-6">
      <h2 class="font-display text-lg font-semibold mb-4"><i class="fas fa-lightbulb text-amber-400 mr-2"></i>Today's Cosmic Summary</h2>
      <p class="text-white/50 text-sm leading-relaxed">${generateDailySummary(transits)}</p>
    </div>
  </div>`;
}

function generateDailySummary(transits) {
  const retros = transits.filter(t => t.retrograde && !['Rahu','Ketu'].includes(t.planet));
  const today = new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
  let s = `As of ${today}, `;
  if (retros.length > 0) s += `${retros.map(r => r.planet).join(' and ')} ${retros.length > 1 ? 'are' : 'is'} in retrograde motion, inviting introspection in those domains. `;
  const jup = transits.find(t => t.planet === 'Jupiter');
  const sat = transits.find(t => t.planet === 'Saturn');
  s += `Jupiter in ${jup?.sign || 'transit'} brings expansion and opportunity, while Saturn in ${sat?.sign || 'transit'} teaches discipline. `;
  s += `Align your actions with the prevailing planetary energies \u2014 focus on what you can control and trust your dharmic path.`;
  return s;
}

// === AI INSIGHTS TAB ===
function renderInsightsTab() {
  const ins = currentChart.insights;
  const sections = [
    { title:'Personality Profile', icon:'fa-user', color:'purple', content:ins.personality },
    { title:'Career & Purpose', icon:'fa-briefcase', color:'blue', content:ins.career },
    { title:'Love & Relationships', icon:'fa-heart', color:'pink', content:ins.love },
    { title:'Financial Potential', icon:'fa-coins', color:'gold', content:ins.finance },
    { title:'Karma & Dharma', icon:'fa-om', color:'cyan', content:ins.karma }
  ];
  return `
  <div class="page-enter">
    <div class="mb-6"><h1 class="font-display text-2xl font-bold">AI Insight Engine</h1><p class="text-white/40 text-sm mt-1">Personalized analysis derived from your planetary positions</p></div>
    <div class="glass-card p-6 mb-6">
      <h2 class="font-display text-lg font-semibold mb-4"><i class="fas fa-chart-line text-purple-400 mr-2"></i>Strength Profile</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        ${Object.entries(ins.strengths).map(([key, val]) => `
          <div class="text-center">
            <div class="relative w-20 h-20 mx-auto mb-2">
              <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="3"/>
                <circle cx="18" cy="18" r="16" fill="none" stroke="url(#grad-${key})" stroke-width="3" stroke-dasharray="${val} ${100-val}" stroke-linecap="round"/>
                <defs><linearGradient id="grad-${key}"><stop offset="0%" stop-color="#a855f7"/><stop offset="100%" stop-color="#00d4ff"/></linearGradient></defs>
              </svg>
              <div class="absolute inset-0 flex items-center justify-center font-display font-bold text-lg">${val}</div>
            </div>
            <div class="text-xs text-white/50 capitalize">${key}</div>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="grid gap-6">
      ${sections.map((s, i) => `
        <div class="glass-card p-6 sm:p-8">
          ${sectionHeader(`insight-${i}`, s.title, s.icon)}
          <div class="collapsible-content ${collapsedSections[`insight-${i}`] ? 'collapsed' : ''}">
            <div class="text-white/50 leading-relaxed text-sm whitespace-pre-line">${s.content}</div>
          </div>
        </div>
      `).join('')}
    </div>
  </div>`;
}

// === YOGAS TAB ===
function renderYogasTab() {
  const c = currentChart;
  const yogas = c.yogas || [];
  const presentYogas = yogas.filter(y => y.present);
  const absentYogas = yogas.filter(y => !y.present);
  const typeColors = {
    'Pancha Mahapurusha': 'amber', 'Wealth & Wisdom': 'green', 'Power & Authority': 'purple',
    'Wealth': 'emerald', 'Intelligence': 'cyan', 'Wealth & Courage': 'orange',
    'Virtue & Fame': 'blue', 'Fortune from Adversity': 'indigo', 'Cancellation of Debilitation': 'teal',
    'Knowledge & Arts': 'pink', 'Challenge': 'red', 'Leadership': 'violet'
  };
  return `
  <div class="page-enter">
    <div class="mb-6"><h1 class="font-display text-2xl font-bold">Yoga Analysis</h1><p class="text-white/40 text-sm mt-1">Classical Vedic planetary combinations in your chart</p></div>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div class="glass-card p-4 text-center"><div class="font-display text-3xl font-bold text-green-400">${presentYogas.length}</div><div class="text-xs text-white/40 mt-1">Active Yogas</div></div>
      <div class="glass-card p-4 text-center"><div class="font-display text-3xl font-bold text-white/30">${absentYogas.length}</div><div class="text-xs text-white/40 mt-1">Not Present</div></div>
      <div class="glass-card p-4 text-center"><div class="font-display text-3xl font-bold text-purple-400">${presentYogas.filter(y => y.type.includes('Mahapurusha')).length}</div><div class="text-xs text-white/40 mt-1">Mahapurusha</div></div>
      <div class="glass-card p-4 text-center"><div class="font-display text-3xl font-bold text-amber-400">${presentYogas.filter(y => y.type.includes('Wealth') || y.type.includes('Power')).length}</div><div class="text-xs text-white/40 mt-1">Raja/Dhana</div></div>
    </div>
    ${presentYogas.length > 0 ? `
    <div class="glass-card p-6 mb-6">
      <h2 class="font-display text-lg font-bold mb-4 flex items-center gap-2"><i class="fas fa-check-circle text-green-400"></i> Active Yogas in Your Chart</h2>
      <div class="grid gap-4">
        ${presentYogas.map(y => `
          <div class="p-5 rounded-xl bg-green-500/5 border border-green-500/10">
            <div class="flex items-start justify-between mb-3 flex-wrap gap-2">
              <div>
                <h3 class="font-display text-lg font-bold text-green-300">${y.name}</h3>
                <span class="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400/70">${y.type}</span>
              </div>
              <div class="flex gap-1">${y.planets.map(p => `<span class="text-xs font-bold px-2 py-0.5 rounded-md" style="color:${PLANET_COLORS[p]||'#a855f7'};background:${(PLANET_COLORS[p]||'#a855f7')}12">${PLANET_ABBR[p]||p}</span>`).join('')}</div>
            </div>
            <p class="text-sm text-white/50 leading-relaxed">${y.description}</p>
          </div>
        `).join('')}
      </div>
    </div>` : ''}
    <div class="glass-card p-6">
      <h2 class="font-display text-lg font-bold mb-4 flex items-center gap-2"><i class="fas fa-times-circle text-white/20"></i> Not Present</h2>
      <div class="grid sm:grid-cols-2 gap-3">
        ${absentYogas.map(y => `
          <div class="p-3 rounded-lg bg-white/[0.02] border border-white/5">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-white/40">${y.name}</span>
              <span class="text-[10px] text-white/20">${y.type}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </div>`;
}

// === ARUDHA PADAS TAB ===
function renderArudhaTab() {
  const c = currentChart;
  const ap = c.arudhaPadas || {};
  const sl = c.specialLagnas || {};
  const arudhaNames = {
    AL: { full: 'Arudha Lagna', house: 1, desc: 'How the world perceives you; your public image and social standing.' },
    A2: { full: 'Dhana Pada', house: 2, desc: 'Perceived wealth and family status; how others view your finances.' },
    A3: { full: 'Vikrama Pada', house: 3, desc: 'Perceived courage and communication; reputation among siblings.' },
    A4: { full: 'Sukha Pada', house: 4, desc: 'Perceived happiness, home life, and emotional comfort.' },
    A5: { full: 'Mantra Pada', house: 5, desc: 'Perceived intelligence, creative output, and children.' },
    A6: { full: 'Roga Pada', house: 6, desc: 'How enemies and diseases manifest in your life externally.' },
    A7: { full: 'Darapada', house: 7, desc: 'Your spouse\'s public image; how partnerships appear to the world.' },
    A8: { full: 'Mrityu Pada', house: 8, desc: 'Perception of longevity and transformative events.' },
    A9: { full: 'Dharma Pada', house: 9, desc: 'Perceived dharma, guru connections, and fortune.' },
    A10: { full: 'Rajya Pada', house: 10, desc: 'How your career and authority appear to the world.' },
    A11: { full: 'Labha Pada', house: 11, desc: 'Perceived gains, income flow, and social network.' },
    UL: { full: 'Upapada Lagna', house: 12, desc: 'Nature and quality of marriage; spouse\'s character and background.' }
  };
  return `
  <div class="page-enter">
    <div class="mb-6"><h1 class="font-display text-2xl font-bold">Arudha Padas & Special Lagnas</h1><p class="text-white/40 text-sm mt-1">Jaimini system — how life areas manifest in the material world</p></div>
    <div class="glass-card p-6 mb-6">
      <h2 class="font-display text-lg font-bold mb-4 flex items-center gap-2"><i class="fas fa-compass text-purple-400"></i> Special Lagnas</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        ${Object.entries(sl).map(([key, val]) => `
          <div class="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 text-center">
            <div class="text-xs text-purple-300/60 font-semibold mb-1">${val.abbr || key.replace(/([A-Z])/g, ' $1').trim()}</div>
            <div class="font-display text-xl font-bold text-purple-300">${val.sign}</div>
            <div class="text-[10px] text-white/30 mt-1">Sign ${val.signIndex + 1}</div>
            <div class="text-[10px] text-white/20 mt-1">${key === 'horaLagna' ? 'Wealth & prosperity' : key === 'ghatiLagna' ? 'Power & fame' : key === 'bhavaLagna' ? 'Physical existence' : 'True self'}</div>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="glass-card p-6 mb-6">
      <h2 class="font-display text-lg font-bold mb-4 flex items-center gap-2"><i class="fas fa-crosshairs text-cyan-400"></i> Key Arudha Padas</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        ${['AL','A7','UL'].map(key => {
          const data = ap[key];
          const info = arudhaNames[key];
          if (!data) return '';
          return `
          <div class="p-5 rounded-xl bg-cyan-500/5 border border-cyan-500/15">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-bold text-cyan-300">${key} — ${info.full}</span>
              <span class="text-xs text-white/30">H${info.house}</span>
            </div>
            <div class="font-display text-2xl font-bold mb-2">${data.sign}</div>
            <div class="text-xs text-white/30 mb-2">Sign ${data.signIndex + 1}</div>
            <p class="text-xs text-white/40 leading-relaxed">${info.desc}</p>
          </div>`;
        }).join('')}
      </div>
    </div>
    <div class="glass-card p-6">
      <h2 class="font-display text-lg font-bold mb-4 flex items-center gap-2"><i class="fas fa-th text-amber-400"></i> All 12 Arudha Padas</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        ${Object.entries(ap).map(([key, data]) => {
          const info = arudhaNames[key] || { full: key, house: '?', desc: '' };
          return `
          <div class="p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-purple-500/20 transition-colors">
            <div class="flex items-center justify-between">
              <div>
                <span class="font-bold text-sm text-purple-300">${key}</span>
                <span class="text-xs text-white/30 ml-2">${info.full}</span>
              </div>
              <div class="text-right">
                <span class="text-sm font-semibold">${data.sign}</span>
                <span class="text-[10px] text-white/30 ml-1">(${data.signIndex + 1})</span>
              </div>
            </div>
            <p class="text-[10px] text-white/25 mt-1">${info.desc}</p>
          </div>`;
        }).join('')}
      </div>
    </div>
  </div>`;
}

// === SHADBALA TAB ===
function renderShadbalaTab() {
  const c = currentChart;
  const sb = c.shadbala || {};
  const planets = Object.entries(sb).sort((a,b) => b[1].total - a[1].total);
  const maxTotal = Math.max(...planets.map(([,v]) => v.total), 60);
  const rankColors = { 'Very Strong': 'text-green-400', 'Strong': 'text-emerald-400', 'Average': 'text-amber-400', 'Weak': 'text-orange-400', 'Very Weak': 'text-red-400' };
  return `
  <div class="page-enter">
    <div class="mb-6"><h1 class="font-display text-2xl font-bold">Shadbala — Six-fold Strength</h1><p class="text-white/40 text-sm mt-1">Composite planetary strength analysis based on position, direction, time, and nature</p></div>
    <div class="glass-card p-6 mb-6">
      <h2 class="font-display text-lg font-bold mb-4 flex items-center gap-2"><i class="fas fa-ranking-star text-amber-400"></i> Planetary Strength Ranking</h2>
      <div class="space-y-4">
        ${planets.map(([name, data], idx) => {
          const pct = Math.round((data.total / maxTotal) * 100);
          return `
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0" style="background:${PLANET_COLORS[name]}15;color:${PLANET_COLORS[name]}">${PLANET_ABBR[name]}</div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-semibold">${name}</span>
                <div class="flex items-center gap-3">
                  <span class="${rankColors[data.rank] || 'text-white/50'} text-xs font-medium">${data.rank}</span>
                  <span class="font-display text-lg font-bold">${data.total}</span>
                </div>
              </div>
              <div class="h-2 rounded-full bg-white/5 overflow-hidden">
                <div class="h-full rounded-full transition-all" style="width:${pct}%;background:${PLANET_COLORS[name]}"></div>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
    <div class="glass-card p-6">
      <h2 class="font-display text-lg font-bold mb-4 flex items-center gap-2"><i class="fas fa-table text-purple-400"></i> Strength Breakdown</h2>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-purple-500/10">
            <th class="text-left py-3 px-3 text-white/40 font-medium">Planet</th>
            <th class="text-center py-3 px-3 text-white/40 font-medium">Sthana</th>
            <th class="text-center py-3 px-3 text-white/40 font-medium">Dig</th>
            <th class="text-center py-3 px-3 text-white/40 font-medium">Kala</th>
            <th class="text-center py-3 px-3 text-white/40 font-medium">Naisargika</th>
            <th class="text-center py-3 px-3 text-white/40 font-medium">Total</th>
            <th class="text-center py-3 px-3 text-white/40 font-medium">Rank</th>
          </tr></thead>
          <tbody>
            ${planets.map(([name, data]) => `
              <tr class="border-b border-purple-500/5 hover:bg-purple-500/5">
                <td class="py-3 px-3"><span style="color:${PLANET_COLORS[name]}" class="font-bold">${PLANET_ABBR[name]}</span> <span class="text-white/50">${name}</span></td>
                <td class="py-3 px-3 text-center font-mono text-white/60">${data.sthana}</td>
                <td class="py-3 px-3 text-center font-mono text-white/60">${data.dig}</td>
                <td class="py-3 px-3 text-center font-mono text-white/60">${data.kala}</td>
                <td class="py-3 px-3 text-center font-mono text-white/60">${data.naisargika}</td>
                <td class="py-3 px-3 text-center font-mono font-bold">${data.total}</td>
                <td class="py-3 px-3 text-center"><span class="${rankColors[data.rank] || 'text-white/50'} text-xs font-medium">${data.rank}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="mt-4 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
        <p class="text-xs text-white/40 leading-relaxed"><strong class="text-white/60">Sthana Bala:</strong> Positional strength (dignity). <strong class="text-white/60">Dig Bala:</strong> Directional strength. <strong class="text-white/60">Kala Bala:</strong> Temporal strength. <strong class="text-white/60">Naisargika Bala:</strong> Natural inherent strength.</p>
      </div>
    </div>
  </div>`;
}

// === ASHTAKAVARGA TAB ===
function renderAshtakavargaTab() {
  const c = currentChart;
  const av = c.ashtakavarga || {};
  if (!av.SAV || !av.planetBAV) return '<div class="page-enter"><div class="glass-card p-6 text-center text-white/40">Ashtakavarga data not available.</div></div>';
  const totalBindu = av.SAV.reduce((s, v) => s + v, 0);
  const avgPerSign = (totalBindu / 12).toFixed(1);
  const strongSigns = av.signStrength ? av.signStrength.filter(s => s.strength === 'Strong') : [];
  const weakSigns = av.signStrength ? av.signStrength.filter(s => s.strength === 'Weak') : [];
  return `
  <div class="page-enter">
    <div class="mb-6"><h1 class="font-display text-2xl font-bold">Ashtakavarga</h1><p class="text-white/40 text-sm mt-1">Bindu-based transit strength system — SAV (Sarvashtakavarga) & BAV (Bhinnashtakavarga)</p></div>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div class="glass-card p-4 text-center"><div class="font-display text-3xl font-bold text-purple-400">${totalBindu}</div><div class="text-xs text-white/40 mt-1">Total Bindus</div></div>
      <div class="glass-card p-4 text-center"><div class="font-display text-3xl font-bold text-cyan-400">${avgPerSign}</div><div class="text-xs text-white/40 mt-1">Avg per Sign</div></div>
      <div class="glass-card p-4 text-center"><div class="font-display text-3xl font-bold text-green-400">${strongSigns.length}</div><div class="text-xs text-white/40 mt-1">Strong Signs</div></div>
      <div class="glass-card p-4 text-center"><div class="font-display text-3xl font-bold text-red-400">${weakSigns.length}</div><div class="text-xs text-white/40 mt-1">Weak Signs</div></div>
    </div>
    <div class="glass-card p-6 mb-6">
      <h2 class="font-display text-lg font-bold mb-4 flex items-center gap-2"><i class="fas fa-chart-bar text-cyan-400"></i> SAV — Sign-wise Total Bindus</h2>
      <div class="grid grid-cols-12 gap-1 items-end h-40 mb-4">
        ${av.SAV.map((val, idx) => {
          const maxSAV = Math.max(...av.SAV);
          const pct = Math.round((val / maxSAV) * 100);
          const color = val >= 30 ? '#10b981' : val >= 25 ? '#f59e0b' : '#ef4444';
          return `<div class="flex flex-col items-center gap-1"><div class="text-[9px] font-mono font-bold" style="color:${color}">${val}</div><div class="w-full rounded-t" style="height:${pct}%;background:${color}30;border:1px solid ${color}60"></div><div class="text-[8px] text-white/30 mt-1">${SIGNS[idx].substring(0,3)}</div></div>`;
        }).join('')}
      </div>
      <div class="flex items-center gap-4 text-[10px] text-white/30"><span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-500"></span> \u226530 Strong</span><span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-amber-500"></span> 25-29 Moderate</span><span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-500"></span> &lt;25 Weak</span></div>
    </div>
    <div class="glass-card p-6">
      <h2 class="font-display text-lg font-bold mb-4 flex items-center gap-2"><i class="fas fa-table-cells text-purple-400"></i> BAV — Planet-wise Bindus by Sign</h2>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead><tr class="border-b border-purple-500/10">
            <th class="py-2 px-2 text-left text-white/40">Planet</th>
            ${SIGNS.map(s => `<th class="py-2 px-1 text-center text-white/30">${s.substring(0,3)}</th>`).join('')}
            <th class="py-2 px-2 text-center text-white/40">Total</th>
          </tr></thead>
          <tbody>
            ${['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'].map(pName => {
              const bav = av.planetBAV[pName] || new Array(12).fill(0);
              const total = bav.reduce((s, v) => s + v, 0);
              return `<tr class="border-b border-purple-500/5">
                <td class="py-2 px-2"><span style="color:${PLANET_COLORS[pName]}" class="font-bold">${PLANET_ABBR[pName]}</span></td>
                ${bav.map(v => `<td class="py-2 px-1 text-center font-mono ${v >= 5 ? 'text-green-400' : v >= 3 ? 'text-white/60' : 'text-red-400/60'}">${v}</td>`).join('')}
                <td class="py-2 px-2 text-center font-bold">${total}</td>
              </tr>`;
            }).join('')}
            <tr class="border-t-2 border-purple-500/20 font-bold">
              <td class="py-2 px-2 text-white/60">SAV</td>
              ${av.SAV.map(v => `<td class="py-2 px-1 text-center ${v >= 30 ? 'text-green-400' : v >= 25 ? 'text-amber-400' : 'text-red-400'}">${v}</td>`).join('')}
              <td class="py-2 px-2 text-center text-purple-300">${totalBindu}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mt-4 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
        <p class="text-xs text-white/40 leading-relaxed">Ashtakavarga shows the benefic points (bindus) each planet receives in each sign. Higher bindus indicate more favorable transits through that sign. SAV (total row) shows combined strength — signs with 30+ bindus are very favorable for important activities.</p>
      </div>
    </div>
  </div>`;
}

// ============================================================
// CITY DATABASE — Now uses live geocoding API (Nominatim via proxy)
// Fallback static cities for offline/fast matching
// ============================================================
const CITIES = [
  { name:'Mumbai, India', lat:19.076, lng:72.8777, tz:5.5 },
  { name:'Delhi, India', lat:28.6139, lng:77.209, tz:5.5 },
  { name:'Bangalore, India', lat:12.9716, lng:77.5946, tz:5.5 },
  { name:'Chennai, India', lat:13.0827, lng:80.2707, tz:5.5 },
  { name:'Kolkata, India', lat:22.5726, lng:88.3639, tz:5.5 },
  { name:'Hyderabad, India', lat:17.385, lng:78.4867, tz:5.5 },
  { name:'New York, USA', lat:40.7128, lng:-74.006, tz:-5 },
  { name:'London, UK', lat:51.5074, lng:-0.1278, tz:0 },
  { name:'Tokyo, Japan', lat:35.6762, lng:139.6503, tz:9 },
  { name:'Sydney, Australia', lat:-33.8688, lng:151.2093, tz:11 },
];

// Debounce utility
let _geocodeTimer = null;
let _lastGeoQuery = '';

async function fetchGeocodeResults(query) {
  if (!query || query.length < 2) return [];
  try {
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
}

// ============================================================
// EVENT HANDLERS
// ============================================================
function attachEvents() {
  const form = document.getElementById('kundliForm');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
    const placeInput = document.getElementById('inp-place');
    if (placeInput) {
      placeInput.addEventListener('input', handlePlaceInput);
      placeInput.addEventListener('blur', () => { setTimeout(() => { const s = document.getElementById('place-suggestions'); if (s) s.classList.add('hidden'); }, 200); });
    }
  }

  // Chart planet tooltips via event delegation
  // Uses divisional chart data when on divisional tab
  document.addEventListener('mouseover', (e) => {
    const el = e.target.closest('[data-planet]');
    if (el && currentChart) {
      const pName = el.dataset.planet;
      const p = currentChart.planets.find(x => x.name === pName);
      if (!p) return;
      // If we're on the divisional tab and not D1, show divisional data
      if (currentDashTab === 'divisional' && currentDivisional !== 'd1') {
        const divData = currentChart.divisionalCharts[currentDivisional];
        if (divData) {
          const dp = divData.planets.find(x => x.planet === pName);
          if (dp) {
            const divAsc = divData.ascendantSignIndex;
            const houseNum = ((dp.signIndex - divAsc + 12) % 12) + 1;
            showTooltip(e, `<strong>${PLANET_ABBR[pName]} - ${pName}</strong><br>${dp.sign} (${dp.signIndex + 1})<br>House ${houseNum}<br><span style="opacity:0.6">${currentDivisional.toUpperCase()} chart</span>`);
            return;
          }
        }
      }
      showTooltip(e, `<strong>${PLANET_ABBR[p.name]} - ${p.name}</strong><br>${p.degreeInSign.toFixed(2)}\u00b0 ${p.sign} (${p.signIndex + 1})<br>${p.nakshatra} P${p.nakshatraPada}<br>House ${p.house} \u00b7 ${p.dignity}`);
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('[data-planet]')) hideTooltip();
  });
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-planet]');
    if (el) { window.__selectPlanet(el.dataset.planet); }
  });
}

function handlePlaceInput(e) {
  const val = e.target.value.trim();
  const suggestions = document.getElementById('place-suggestions');
  if (!val || val.length < 2) { suggestions.classList.add('hidden'); return; }
  
  // Clear previous timer
  if (_geocodeTimer) clearTimeout(_geocodeTimer);
  
  // Quick local match first (instant)
  const localMatches = CITIES.filter(c => c.name.toLowerCase().includes(val.toLowerCase())).slice(0, 3);
  if (localMatches.length > 0 && val.length < 4) {
    renderSuggestions(localMatches, suggestions, false);
    return;
  }
  
  // Show loading state
  suggestions.classList.remove('hidden');
  suggestions.innerHTML = '<div class="px-4 py-3 text-sm text-white/30"><i class="fas fa-spinner fa-spin mr-2"></i>Searching worldwide...</div>';
  
  // Debounce API call (300ms)
  _geocodeTimer = setTimeout(async () => {
    if (val !== e.target.value.trim()) return; // user typed more
    const apiResults = await fetchGeocodeResults(val);
    
    // Merge with local fallback if API returns nothing
    let results = apiResults;
    if (results.length === 0) {
      results = CITIES.filter(c => c.name.toLowerCase().includes(val.toLowerCase())).slice(0, 8);
    }
    
    renderSuggestions(results, suggestions, true);
  }, 300);
}

function renderSuggestions(results, container, isApi) {
  if (results.length === 0) {
    container.innerHTML = '<div class="px-4 py-3 text-sm text-white/30"><i class="fas fa-map-marker-alt mr-2 text-red-400/50"></i>No places found. Try a different spelling.</div>';
    container.classList.remove('hidden');
    return;
  }
  container.classList.remove('hidden');
  container.innerHTML = results.map(c => {
    const displayName = c.name || c.fullName || 'Unknown';
    const tzStr = c.tz >= 0 ? `UTC+${c.tz}` : `UTC${c.tz}`;
    return `<div class="px-4 py-3 cursor-pointer hover:bg-purple-500/10 transition-colors text-sm border-b border-purple-500/5 last:border-0 flex items-center gap-3" onclick="window.__selectCity('${displayName.replace(/'/g, "\\'")}',${c.lat},${c.lng},${c.tz})">
      <i class="fas fa-map-marker-alt text-purple-400/50 flex-shrink-0"></i>
      <div class="flex-1 min-w-0">
        <div class="truncate">${displayName}</div>
        <div class="text-[10px] text-white/25 mt-0.5">${c.lat.toFixed(4)}\u00b0, ${c.lng.toFixed(4)}\u00b0 \u00b7 ${tzStr}</div>
      </div>
    </div>`;
  }).join('');
}

function formatTimezoneDisplay(tz) {
  const sign = tz >= 0 ? '+' : '-';
  const abs = Math.abs(tz);
  const hours = Math.floor(abs);
  const mins = Math.round((abs - hours) * 60);
  const tzStr = 'UTC' + sign + hours + (mins > 0 ? ':' + String(mins).padStart(2, '0') : ':00');
  // Common timezone abbreviation lookup
  const TZ_NAMES = {
    '5.5': 'IST', '0': 'GMT', '1': 'CET', '2': 'EET', '3': 'MSK',
    '3.5': 'IRST', '4': 'GST', '4.5': 'AFT', '5': 'PKT', '5.75': 'NPT',
    '6': 'BST', '6.5': 'MMT', '7': 'ICT', '8': 'CST/SGT', '9': 'JST/KST',
    '9.5': 'ACST', '10': 'AEST', '11': 'SBT', '12': 'NZST',
    '-3': 'ART', '-3.5': 'NST', '-4': 'AST', '-5': 'EST', '-6': 'CST',
    '-7': 'MST', '-8': 'PST', '-9': 'AKST', '-10': 'HST'
  };
  const abbr = TZ_NAMES[String(tz)] || '';
  return abbr ? tzStr + ' (' + abbr + ')' : tzStr;
}

window.__selectCity = (name, lat, lng, tz) => {
  document.getElementById('inp-place').value = name;
  document.getElementById('inp-lat').value = lat;
  document.getElementById('inp-lng').value = lng;
  document.getElementById('inp-tz').value = tz;
  // Update visible timezone display
  const tzDisplay = document.getElementById('inp-tz-display');
  if (tzDisplay) {
    tzDisplay.value = formatTimezoneDisplay(tz);
    tzDisplay.style.opacity = '1';
  }
  document.getElementById('place-suggestions').classList.add('hidden');
};

async function handleFormSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('inp-name').value;
  const dob = document.getElementById('inp-dob').value;
  const time = document.getElementById('inp-time').value;
  const place = document.getElementById('inp-place').value;
  let lat = document.getElementById('inp-lat').value;
  let lng = document.getElementById('inp-lng').value;
  let tz = document.getElementById('inp-tz').value;
  
  // If no lat/lng selected, try geocoding the typed place name
  if (!lat || !lng) {
    // Try local match first
    const city = CITIES.find(c => c.name.toLowerCase().includes(place.toLowerCase()));
    if (city) {
      lat = city.lat; lng = city.lng; tz = city.tz;
      // Also update the visible timezone
      const tzDisplay = document.getElementById('inp-tz-display');
      if (tzDisplay) { tzDisplay.value = formatTimezoneDisplay(tz); tzDisplay.style.opacity = '1'; }
    } else {
      // Try API geocode
      try {
        const results = await fetchGeocodeResults(place);
        if (results.length > 0) {
          lat = results[0].lat; lng = results[0].lng; tz = results[0].tz;
          // Also update the visible timezone
          const tzDisplay = document.getElementById('inp-tz-display');
          if (tzDisplay) { tzDisplay.value = formatTimezoneDisplay(tz); tzDisplay.style.opacity = '1'; }
        } else {
          alert('Could not find location. Please select a place from the suggestions dropdown.');
          return;
        }
      } catch {
        alert('Please select a birth place from the suggestions.');
        return;
      }
    }
  }
  const [year, month, day] = dob.split('-');
  const [hour, minute] = time.split(':');
  document.getElementById('kundliForm').classList.add('hidden');
  document.getElementById('loadingState').classList.remove('hidden');
  try {
    const res = await fetch('/api/kundli', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ name, year:parseInt(year), month:parseInt(month), day:parseInt(day), hour:parseInt(hour), minute:parseInt(minute), latitude:parseFloat(lat), longitude:parseFloat(lng), timezone:parseFloat(tz), place }) });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    currentChart = data;
    currentDashTab = 'overview';
    navigate('dashboard', data);
  } catch (err) {
    alert('Error generating chart: ' + err.message);
    document.getElementById('kundliForm').classList.remove('hidden');
    document.getElementById('loadingState').classList.add('hidden');
  }
}

// Global handlers
window.__nav = (page) => navigate(page);
window.__setDashTab = (tab) => { currentDashTab = tab; sidebarOpen = false; document.body.style.overflow = ''; render(); };
window.__setChartStyle = (style) => { chartStyle = style; render(); };
window.__setDivisional = (div) => { currentDivisional = div; render(); };
window.__selectPlanet = (name) => { selectedPlanet = name; render(); };
window.__toggleSidebar = () => { 
  sidebarOpen = !sidebarOpen; 
  const sb = document.getElementById('sidebar'); 
  const ov = document.getElementById('sidebarOverlay');
  if(sb) sb.classList.toggle('open', sidebarOpen); 
  if(ov) ov.classList.toggle('active', sidebarOpen);
  document.body.style.overflow = sidebarOpen ? 'hidden' : '';
};
window.__toggleSection = (id) => { collapsedSections[id] = !collapsedSections[id]; render(); };

// Dasha expand/collapse — direct DOM manipulation, NO re-render
window.__toggleDasha = (idx) => {
  expandedDashas[idx] = !expandedDashas[idx];
  const row = document.querySelector('[data-dasha-idx="' + idx + '"]');
  if (!row) return;
  row.classList.toggle('expanded', !!expandedDashas[idx]);
};

window.__toggleTheme = () => {
  darkMode = !darkMode;
  document.documentElement.classList.toggle('dark', darkMode);
  render();
};

window.__downloadPDF = () => { window.print(); };

window.__setCountry = (code) => {
  if (CURRENCIES[code]) {
    selectedCountry = code;
    render();
  }
};

window.__toggleFaq = (idx) => {
  const answer = document.getElementById('faq-answer-' + idx);
  const icon = document.getElementById('faq-icon-' + idx);
  if (!answer) return;
  const isOpen = answer.style.maxHeight && answer.style.maxHeight !== '0px';
  // Close all others
  document.querySelectorAll('[id^="faq-answer-"]').forEach(function(el) { el.style.maxHeight = '0px'; });
  document.querySelectorAll('[id^="faq-icon-"]').forEach(function(el) { el.style.transform = 'rotate(0deg)'; });
  if (!isOpen) {
    answer.style.maxHeight = answer.scrollHeight + 'px';
    if (icon) icon.style.transform = 'rotate(180deg)';
  }
};

window.__loadDemo = () => {
  const form = document.getElementById('kundliForm');
  if (form) {
    document.getElementById('inp-name').value = 'Cosmic Explorer';
    document.getElementById('inp-dob').value = '1990-06-15';
    document.getElementById('inp-time').value = '08:30';
    document.getElementById('inp-place').value = 'Mumbai, India';
    document.getElementById('inp-lat').value = '19.076';
    document.getElementById('inp-lng').value = '72.8777';
    document.getElementById('inp-tz').value = '5.5';
    var tzDisplay = document.getElementById('inp-tz-display');
    if (tzDisplay) { tzDisplay.value = formatTimezoneDisplay(5.5); tzDisplay.style.opacity = '1'; }
    form.dispatchEvent(new Event('submit'));
  }
};

// === Init ===
const path = window.location.pathname;
const MPA_ROUTES = ['/privacy', '/terms', '/about', '/contact'];
if (MPA_ROUTES.includes(path)) {
  // MPA pages are server-rendered — do not render SPA
} else {
  if (path === '/dashboard' && !currentChart) currentPage = 'generate';
  else if (path === '/generate') currentPage = 'generate';
  else if (path === '/dashboard') currentPage = 'dashboard';
  else currentPage = 'landing';
  render();
}

})();
