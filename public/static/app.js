// ============================================================
// Cosmic Dharma — Premium Vedic Astrology SPA v3.0
// Complete UI overhaul: charts, tooltips, themes, PDF, perf
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

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const SIGN_SYMBOLS = ['\u2648','\u2649','\u264A','\u264B','\u264C','\u264D','\u264E','\u264F','\u2650','\u2651','\u2652','\u2653'];
const PLANET_COLORS = {
  Sun: '#f59e0b', Moon: '#e2e8f0', Mars: '#ef4444', Mercury: '#10b981',
  Jupiter: '#f59e0b', Venus: '#ec4899', Saturn: '#6366f1', Rahu: '#8b5cf6', Ketu: '#a78bfa'
};
const PLANET_GLYPHS = { Sun:'\u2609', Moon:'\u263D', Mars:'\u2642', Mercury:'\u263F', Jupiter:'\u2643', Venus:'\u2640', Saturn:'\u2644', Rahu:'\u260A', Ketu:'\u260B' };

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
          { name:'Priya M.', role:'Software Engineer', text:'Finally, an astrology platform that doesn\\'t look like it was built in 2005. The dashboard is stunning and the insights are remarkably accurate.' },
          { name:'Arjun K.', role:'Entrepreneur', text:'The Dasha timeline and career insights helped me understand my professional cycles. It\\'s like having a cosmic advisor in your pocket.' },
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
      </div>
      <div class="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        <div class="glass-card pricing-card p-8">
          <div class="text-sm text-white/40 font-medium mb-2">FREE</div>
          <div class="font-display text-4xl font-bold mb-1">\u20B90</div>
          <div class="text-white/30 text-sm mb-6">Forever free</div>
          <ul class="space-y-3 mb-8">
            ${['Full birth chart (D1)','Basic planetary positions','Nakshatra details','Dosha detection','Dasha overview','3 charts per month'].map(f => `<li class="flex items-center gap-3 text-sm text-white/60"><i class="fas fa-check text-green-400 text-xs"></i>${f}</li>`).join('')}
          </ul>
          <button onclick="window.__nav('generate')" class="btn-secondary w-full py-3">Get Started</button>
        </div>
        <div class="glass-card pricing-card featured p-8 relative">
          <div class="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-xs font-bold">PRO</div>
          <div class="text-sm text-purple-400 font-medium mb-2">PRO</div>
          <div class="font-display text-4xl font-bold mb-1">\u20B9499<span class="text-lg text-white/30">/mo</span></div>
          <div class="text-white/30 text-sm mb-6">Unlock the cosmos</div>
          <ul class="space-y-3 mb-8">
            ${['Everything in Free','All divisional charts','AI-powered insights engine','Compatibility matching','Marriage & career timing','Personalized remedies','Annual horoscope PDF','Unlimited charts','Priority support'].map(f => `<li class="flex items-center gap-3 text-sm text-white/60"><i class="fas fa-check text-purple-400 text-xs"></i>${f}</li>`).join('')}
          </ul>
          <button class="btn-primary w-full py-3">Coming Soon</button>
        </div>
      </div>
    </div>
  </section>
  <footer class="border-t border-purple-500/10 py-12 px-4">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-sm font-bold">\u2726</div>
        <span class="font-display font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Cosmic Dharma</span>
      </div>
      <div class="text-white/30 text-sm">\u00a9 2026 Cosmic Dharma. Ancient wisdom, modern technology.</div>
      <div class="flex gap-4 text-white/30">
        <a href="#" class="hover:text-purple-400 transition-colors"><i class="fab fa-twitter"></i></a>
        <a href="#" class="hover:text-purple-400 transition-colors"><i class="fab fa-instagram"></i></a>
        <a href="#" class="hover:text-purple-400 transition-colors"><i class="fab fa-github"></i></a>
      </div>
    </div>
  </footer>`;
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
          <input type="hidden" id="inp-lat" value="">
          <input type="hidden" id="inp-lng" value="">
          <input type="hidden" id="inp-tz" value="5.5">
          <div class="glass-card-static p-4 text-sm text-white/40 rounded-xl">
            <div class="flex items-start gap-3">
              <i class="fas fa-info-circle text-purple-400 mt-0.5"></i>
              <div>
                <strong class="text-white/60">Accuracy tip:</strong> Exact birth time is essential for an accurate Ascendant (Lagna). If unknown, 12:00 PM is used as default. Check your birth certificate for the precise time.
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
    { id:'doshas', icon:'fa-shield-virus', label:'Doshas' },
    { id:'sadesati', icon:'fa-satellite', label:'Sade Sati' },
    { id:'dasha', icon:'fa-timeline', label:'Dasha' },
    { id:'transits', icon:'fa-globe', label:'Transits' },
    { id:'insights', icon:'fa-brain', label:'AI Insights' },
  ];
  return `
  <button class="mobile-menu-btn fixed top-4 left-4 z-50 w-10 h-10 rounded-lg bg-cosmic-800/90 backdrop-blur border border-purple-500/20 flex items-center justify-center text-white/60 hover:text-white" onclick="window.__toggleSidebar()">
    <i class="fas fa-bars"></i>
  </button>
  <aside class="sidebar ${sidebarOpen ? 'open' : ''}" id="sidebar">
    <div class="p-6 border-b border-purple-500/10">
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
  </aside>
  <div class="dashboard-content md:ml-[280px] min-h-screen p-4 sm:p-6 lg:p-8 pt-16 md:pt-8">
    <div class="pdf-header no-screen"><div class="brand">\u2726 Cosmic Dharma</div><div class="subtitle">Vedic Birth Chart \u2014 ${c.name} \u2014 ${c.dateOfBirth} ${c.timeOfBirth} \u2014 ${c.placeOfBirth}</div></div>
    ${renderDashContent()}
  </div>`;
}

function renderDashContent() {
  switch(currentDashTab) {
    case 'overview': return renderOverview();
    case 'chart': return renderChartTab();
    case 'divisional': return renderDivisionalTab();
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
                  <td class="py-3 px-3"><span class="planet-badge ${p.retrograde && p.name !== 'Rahu' && p.name !== 'Ketu' ? 'retro' : ''} ${p.dignity==='Exalted'?'exalted':''} ${p.dignity==='Debilitated'?'debilitated':''}"><span style="color:${PLANET_COLORS[p.name]}">${p.symbol}</span> ${p.name} ${p.retrograde && !['Rahu','Ketu'].includes(p.name) ? '<span class="text-red-400 text-xs">(R)</span>' : ''}</span></td>
                  <td class="py-3 px-3 text-white/70">${SIGN_SYMBOLS[p.signIndex]} ${p.sign}</td>
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
    <div class="grid lg:grid-cols-2 gap-6">
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
        ${selectedPlanet ? renderPlanetDetail(c.planets.find(p => p.name === selectedPlanet)) : `
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

function renderPlanetDetail(p) {
  if (!p) return '';
  return `
  <div class="glass-card p-6 animate-slide-right">
    <div class="flex items-center gap-4 mb-5">
      <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style="background:${PLANET_COLORS[p.name]}15;box-shadow:0 0 25px ${PLANET_COLORS[p.name]}10">${p.symbol}</div>
      <div><h3 class="font-display text-xl font-bold">${p.name}</h3><div class="text-sm text-white/50">${p.sign} \u00b7 ${p.nakshatra}</div></div>
    </div>
    <div class="space-y-2.5 text-sm">
      ${[
        ['Sidereal Longitude', `${p.siderealLongitude.toFixed(4)}\u00b0`],
        ['Degree in Sign', `${p.degreeInSign.toFixed(2)}\u00b0`],
        ['Sign (Rashi)', `${SIGN_SYMBOLS[p.signIndex]} ${p.sign} (${p.signSanskrit})`],
        ['Nakshatra', `${p.nakshatra} (Pada ${p.nakshatraPada})`],
        ['Nakshatra Lord', p.nakshatraLord],
        ['Nakshatra Deity', p.nakshatraDeity],
        ['House', `${p.house}`],
        ['Dignity', p.dignity],
        ['Retrograde', p.retrograde ? 'Yes \u211E' : 'No'],
        ['Navamsa (D9)', p.navamsaSign],
        ['Dashamsa (D10)', p.dashamsaSign],
      ].map(([label, val]) => `<div class="flex justify-between"><span class="text-white/40">${label}</span><span class="${label === 'Dignity' ? (p.dignity === 'Exalted' ? 'text-green-400' : p.dignity === 'Debilitated' ? 'text-red-400' : 'text-white/70') : label === 'Retrograde' ? (p.retrograde ? 'text-red-400' : 'text-green-400') : 'text-white/70'} ${label === 'Sidereal Longitude' || label === 'Degree in Sign' ? 'font-mono' : ''}">${val}</span></div>`).join('')}
    </div>
  </div>`;
}

// === NORTH INDIAN CHART — Improved with anti-overlap and tooltips ===
function renderNorthChart(planets, ascSignIdx) {
  const size = 400;
  const mid = size / 2;
  const planetsByHouse = {};
  planets.forEach(p => { const h = p.house; if (!planetsByHouse[h]) planetsByHouse[h] = []; planetsByHouse[h].push(p); });

  // House center positions in the diamond layout
  const hp = [
    { x: mid, y: 68 },       // H1
    { x: 100, y: 68 },       // H2
    { x: 56, y: mid/2+18 },  // H3
    { x: 56, y: mid },       // H4
    { x: 56, y: mid+mid/2-18 }, // H5
    { x: 100, y: size-68 },  // H6
    { x: mid, y: size-68 },  // H7
    { x: size-100, y: size-68 }, // H8
    { x: size-56, y: mid+mid/2-18 }, // H9
    { x: size-56, y: mid },  // H10
    { x: size-56, y: mid/2+18 }, // H11
    { x: size-100, y: 68 },  // H12
  ];

  let svg = `<svg viewBox="0 0 ${size} ${size}" class="w-full h-auto" style="max-width:${size}px">`;
  svg += `<rect width="${size}" height="${size}" fill="transparent" rx="16"/>`;
  svg += `<rect x="10" y="10" width="${size-20}" height="${size-20}" fill="none" stroke="rgba(168,85,250,0.2)" stroke-width="1.5" rx="4"/>`;
  svg += `<polygon points="${mid},15 ${size-15},${mid} ${mid},${size-15} 15,${mid}" fill="none" stroke="rgba(168,85,250,0.2)" stroke-width="1.5"/>`;
  svg += `<line x1="10" y1="10" x2="${mid}" y2="${mid}" stroke="rgba(168,85,250,0.1)" stroke-width="1"/>`;
  svg += `<line x1="${size-10}" y1="10" x2="${mid}" y2="${mid}" stroke="rgba(168,85,250,0.1)" stroke-width="1"/>`;
  svg += `<line x1="10" y1="${size-10}" x2="${mid}" y2="${mid}" stroke="rgba(168,85,250,0.1)" stroke-width="1"/>`;
  svg += `<line x1="${size-10}" y1="${size-10}" x2="${mid}" y2="${mid}" stroke="rgba(168,85,250,0.1)" stroke-width="1"/>`;

  for (let h = 1; h <= 12; h++) {
    const pos = hp[h - 1];
    const signIdx = (ascSignIdx + h - 1) % 12;
    svg += `<text x="${pos.x}" y="${pos.y - 15}" text-anchor="middle" fill="rgba(255,255,255,0.2)" font-size="9" font-weight="400">${SIGN_SYMBOLS[signIdx]}${signIdx + 1}</text>`;
    if (h === 1) svg += `<text x="${pos.x}" y="${pos.y - 28}" text-anchor="middle" fill="#a855f7" font-size="9" font-weight="700">ASC</text>`;
    
    // Planets — spread vertically to avoid overlap
    const housePlanets = planetsByHouse[h] || [];
    const total = housePlanets.length;
    const startY = pos.y - (total - 1) * 8;
    housePlanets.forEach((p, idx) => {
      const yPos = startY + idx * 16;
      const color = PLANET_COLORS[p.name];
      const retMark = (p.retrograde && !['Rahu','Ketu'].includes(p.name)) ? '\u1D3F' : '';
      svg += `<text x="${pos.x}" y="${yPos}" text-anchor="middle" fill="${color}" font-size="12" font-weight="600" class="planet-in-chart" data-planet="${p.name}" style="cursor:pointer">${p.symbol}${retMark}</text>`;
      // Degree label below planet
      svg += `<text x="${pos.x}" y="${yPos + 10}" text-anchor="middle" fill="rgba(255,255,255,0.18)" font-size="7">${p.degreeInSign.toFixed(0)}\u00b0</text>`;
    });
  }
  svg += `</svg>`;
  return `<div class="ni-chart">${svg}</div>`;
}

// === SOUTH INDIAN CHART — Improved with tooltips ===
function renderSouthChart(planets, ascSignIdx) {
  const signOrder = [11, 0, 1, 2, 10, -1, -1, 3, 9, -1, -1, 4, 8, 7, 6, 5];
  const planetsBySign = {};
  planets.forEach(p => { if (!planetsBySign[p.signIndex]) planetsBySign[p.signIndex] = []; planetsBySign[p.signIndex].push(p); });
  
  let html = '<div class="si-chart">';
  for (let i = 0; i < 16; i++) {
    const signIdx = signOrder[i];
    if (signIdx === -1) {
      if (i === 5) html += `<div class="si-center">${currentChart.name.split(' ')[0]}<br><span class="text-xs">${currentChart.dateOfBirth}</span></div>`;
      continue;
    }
    const isAsc = signIdx === ascSignIdx;
    const signPlanets = planetsBySign[signIdx] || [];
    html += `<div class="si-cell ${isAsc ? 'border-purple-500/50' : ''}">`;
    html += `<span class="sign-num">${SIGN_SYMBOLS[signIdx]}${signIdx+1}</span>`;
    if (isAsc) html += `<span class="absolute top-0.5 right-1 text-[8px] text-purple-400 font-bold">ASC</span>`;
    html += `<div class="flex flex-wrap justify-center gap-1">`;
    signPlanets.forEach(p => {
      const retMark = (p.retrograde && !['Rahu','Ketu'].includes(p.name)) ? '<sup class="text-red-400" style="font-size:6px">R</sup>' : '';
      html += `<span class="text-xs font-semibold cursor-pointer hover:scale-125 transition-transform" style="color:${PLANET_COLORS[p.name]}" data-planet="${p.name}" title="${p.name} ${p.degreeInSign.toFixed(1)}\u00b0 ${p.sign}">${p.symbol}${retMark}</span>`;
    });
    html += `</div></div>`;
  }
  html += '</div>';
  return html;
}

// === DIVISIONAL CHARTS TAB ===
function renderDivisionalTab() {
  const c = currentChart;
  const divCharts = { d1:'Rashi (D1)', d9:'Navamsa (D9)', d10:'Dashamsa (D10)', d60:'Shastiamsa (D60)' };
  const chartData = c.divisionalCharts[currentDivisional];
  const fakePlanets = chartData.map(d => {
    const orig = c.planets.find(p => p.name === d.planet);
    return { ...orig, signIndex: d.signIndex, sign: d.sign, house: ((d.signIndex - c.ascendant.signIndex + 12) % 12) + 1 };
  });
  const descriptions = {
    d1: 'The Rashi chart (D1) is your main birth chart, showing overall life themes, planetary strengths, and the foundation for all other analyses.',
    d9: 'The Navamsa chart (D9) reveals your soul\u2019s deeper purpose, marriage potential, and spiritual path. It is considered the most important divisional chart after D1.',
    d10: 'The Dashamsa chart (D10) specifically analyzes your career trajectory, professional achievements, and public reputation.',
    d60: 'The Shastiamsa chart (D60) is the most precise divisional chart, used for confirming planetary effects and past-life karma indicators.'
  };
  return `
  <div class="page-enter">
    <div class="flex items-center justify-between mb-6 flex-wrap gap-4">
      <div><h1 class="font-display text-2xl font-bold">Divisional Charts</h1><p class="text-white/40 text-sm mt-1">Explore D1, D9, D10, and D60 charts</p></div>
      <div class="flex gap-2 flex-wrap">${Object.entries(divCharts).map(([key, label]) => `<button onclick="window.__setDivisional('${key}')" class="tab-btn ${currentDivisional===key?'active':''}">${label}</button>`).join('')}</div>
    </div>
    <div class="grid lg:grid-cols-5 gap-6">
      <div class="lg:col-span-3 glass-card p-6 sm:p-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-display text-lg font-semibold">${divCharts[currentDivisional]}</h2>
          <div class="flex gap-2"><button onclick="window.__setChartStyle('north')" class="tab-btn text-xs ${chartStyle==='north'?'active':''}">North</button><button onclick="window.__setChartStyle('south')" class="tab-btn text-xs ${chartStyle==='south'?'active':''}">South</button></div>
        </div>
        ${chartStyle === 'north' ? renderNorthChart(fakePlanets, c.ascendant.signIndex) : renderSouthChart(fakePlanets, c.ascendant.signIndex)}
      </div>
      <div class="lg:col-span-2 glass-card p-6">
        <h3 class="font-display text-lg font-semibold mb-4">Positions in ${divCharts[currentDivisional]}</h3>
        <div class="space-y-2">${chartData.map(d => {
          const orig = c.planets.find(p => p.name === d.planet);
          return `<div class="flex items-center justify-between p-2 rounded-lg hover:bg-purple-500/5 transition-colors cursor-pointer" onclick="window.__selectPlanet('${d.planet}')"><div class="flex items-center gap-3"><span style="color:${PLANET_COLORS[d.planet]}">${orig.symbol}</span><span class="text-sm">${d.planet}</span></div><div class="text-sm text-white/60">${SIGN_SYMBOLS[d.signIndex]} ${d.sign}</div></div>`;
        }).join('')}</div>
        <div class="mt-6 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10"><p class="text-xs text-white/40 leading-relaxed">${descriptions[currentDivisional]}</p></div>
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
            return `<div class="h-full flex items-center justify-center text-xs font-bold transition-all hover:opacity-100 ${d.isCurrent?'opacity-100':'opacity-40'}" style="width:${Math.max(widthPct, 3)}%;background:${PLANET_COLORS[d.planet]}25;border:1px solid ${PLANET_COLORS[d.planet]}40;color:${PLANET_COLORS[d.planet]}" title="${d.planet}: ${d.startDate} to ${d.endDate}">${widthPct > 6 ? d.planet.substring(0, 3) : ''}</div>`;
          }).join('')}
        </div>
        <div class="flex flex-wrap gap-3 text-xs">${dashas.map(d => `<span class="flex items-center gap-1.5 ${d.isCurrent?'text-white':'text-white/30'}"><span class="w-2 h-2 rounded-full" style="background:${PLANET_COLORS[d.planet]}"></span>${d.planet} (${d.years}y)</span>`).join('')}</div>
      </div>
    </div>
    <div class="glass-card p-6">
      <h2 class="font-display text-lg font-semibold mb-4">Detailed Periods</h2>
      <div class="space-y-1">
        ${dashas.map(d => `
          <div class="dasha-row ${d.isCurrent?'current':''}" onclick="this.querySelector('.ad-content')?.classList.toggle('hidden')">
            <div class="flex items-center gap-4 flex-1 min-w-0">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style="background:${PLANET_COLORS[d.planet]}12"><span style="color:${PLANET_COLORS[d.planet]}">${PLANET_GLYPHS[d.planet]}</span></div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2"><span class="font-semibold text-sm">${d.planet} Mahadasha</span>${d.isCurrent?'<span class="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium">Active</span>':''}</div>
                <div class="text-xs text-white/40 mt-0.5">${d.startDate} \u2192 ${d.endDate} \u00b7 ${d.years} years</div>
              </div>
              <i class="fas fa-chevron-down text-white/15 text-xs"></i>
            </div>
            <div class="ad-content hidden mt-4 pl-14">
              <div class="text-xs text-white/30 mb-2 font-medium">Antardasha Periods:</div>
              <div class="grid sm:grid-cols-2 gap-1">${d.antardasha.map(a => `
                <div class="flex items-center justify-between px-3 py-2 rounded-lg ${a.isCurrent?'bg-cyan-500/10 border border-cyan-500/20':'bg-white/[0.02]'}">
                  <div class="flex items-center gap-2"><span class="text-xs" style="color:${PLANET_COLORS[a.planet]}">${PLANET_GLYPHS[a.planet]}</span><span class="text-xs ${a.isCurrent?'text-cyan-400 font-medium':'text-white/50'}">${a.planet}</span>${a.isCurrent?'<span class="text-[10px] text-cyan-400">\u25CF</span>':''}</div>
                  <span class="text-[10px] text-white/30">${a.startDate} \u2192 ${a.endDate}</span>
                </div>
              `).join('')}</div>
            </div>
          </div>
        `).join('')}
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
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style="background:${PLANET_COLORS[t.planet]}12"><span style="color:${PLANET_COLORS[t.planet]}">${PLANET_GLYPHS[t.planet]}</span></div>
              <div><div class="font-semibold text-sm">${t.planet}</div><div class="text-xs text-white/40">${t.degree.toFixed(1)}\u00b0 ${t.sign}</div></div>
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

// ============================================================
// CITY DATABASE
// ============================================================
const CITIES = [
  { name:'Mumbai, India', lat:19.076, lng:72.8777, tz:5.5 },
  { name:'Delhi, India', lat:28.6139, lng:77.209, tz:5.5 },
  { name:'Bangalore, India', lat:12.9716, lng:77.5946, tz:5.5 },
  { name:'Chennai, India', lat:13.0827, lng:80.2707, tz:5.5 },
  { name:'Kolkata, India', lat:22.5726, lng:88.3639, tz:5.5 },
  { name:'Hyderabad, India', lat:17.385, lng:78.4867, tz:5.5 },
  { name:'Pune, India', lat:18.5204, lng:73.8567, tz:5.5 },
  { name:'Ahmedabad, India', lat:23.0225, lng:72.5714, tz:5.5 },
  { name:'Jaipur, India', lat:26.9124, lng:75.7873, tz:5.5 },
  { name:'Lucknow, India', lat:26.8467, lng:80.9462, tz:5.5 },
  { name:'Surat, India', lat:21.1702, lng:72.8311, tz:5.5 },
  { name:'Varanasi, India', lat:25.3176, lng:82.9739, tz:5.5 },
  { name:'Chandigarh, India', lat:30.7333, lng:76.7794, tz:5.5 },
  { name:'Patna, India', lat:25.6093, lng:85.1376, tz:5.5 },
  { name:'Bhopal, India', lat:23.2599, lng:77.4126, tz:5.5 },
  { name:'Indore, India', lat:22.7196, lng:75.8577, tz:5.5 },
  { name:'Nagpur, India', lat:21.1458, lng:79.0882, tz:5.5 },
  { name:'Coimbatore, India', lat:11.0168, lng:76.9558, tz:5.5 },
  { name:'Kochi, India', lat:9.9312, lng:76.2673, tz:5.5 },
  { name:'Thiruvananthapuram, India', lat:8.5241, lng:76.9366, tz:5.5 },
  { name:'Guwahati, India', lat:26.1445, lng:91.7362, tz:5.5 },
  { name:'Visakhapatnam, India', lat:17.6868, lng:83.2185, tz:5.5 },
  { name:'New York, USA', lat:40.7128, lng:-74.006, tz:-5 },
  { name:'Los Angeles, USA', lat:34.0522, lng:-118.2437, tz:-8 },
  { name:'Chicago, USA', lat:41.8781, lng:-87.6298, tz:-6 },
  { name:'London, UK', lat:51.5074, lng:-0.1278, tz:0 },
  { name:'Dubai, UAE', lat:25.2048, lng:55.2708, tz:4 },
  { name:'Singapore', lat:1.3521, lng:103.8198, tz:8 },
  { name:'Sydney, Australia', lat:-33.8688, lng:151.2093, tz:11 },
  { name:'Toronto, Canada', lat:43.6532, lng:-79.3832, tz:-5 },
  { name:'San Francisco, USA', lat:37.7749, lng:-122.4194, tz:-8 },
  { name:'Houston, USA', lat:29.7604, lng:-95.3698, tz:-6 },
  { name:'Kathmandu, Nepal', lat:27.7172, lng:85.324, tz:5.75 },
  { name:'Colombo, Sri Lanka', lat:6.9271, lng:79.8612, tz:5.5 },
  { name:'Dhaka, Bangladesh', lat:23.8103, lng:90.4125, tz:6 },
  { name:'Islamabad, Pakistan', lat:33.6844, lng:73.0479, tz:5 },
  { name:'Lahore, Pakistan', lat:31.5204, lng:74.3587, tz:5 },
  { name:'Karachi, Pakistan', lat:24.8607, lng:67.0011, tz:5 },
  { name:'Tokyo, Japan', lat:35.6762, lng:139.6503, tz:9 },
  { name:'Berlin, Germany', lat:52.52, lng:13.405, tz:1 },
  { name:'Paris, France', lat:48.8566, lng:2.3522, tz:1 },
  { name:'Amsterdam, Netherlands', lat:52.3676, lng:4.9041, tz:1 }
];

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
  document.addEventListener('mouseover', (e) => {
    const el = e.target.closest('[data-planet]');
    if (el && currentChart) {
      const p = currentChart.planets.find(x => x.name === el.dataset.planet);
      if (p) showTooltip(e, `<strong>${p.name} ${p.symbol}</strong><br>${p.degreeInSign.toFixed(2)}\u00b0 ${p.sign}<br>${p.nakshatra} P${p.nakshatraPada}<br>House ${p.house} \u00b7 ${p.dignity}`);
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
  const val = e.target.value.toLowerCase();
  const suggestions = document.getElementById('place-suggestions');
  if (!val || val.length < 2) { suggestions.classList.add('hidden'); return; }
  const matches = CITIES.filter(c => c.name.toLowerCase().includes(val)).slice(0, 8);
  if (matches.length === 0) { suggestions.classList.add('hidden'); return; }
  suggestions.classList.remove('hidden');
  suggestions.innerHTML = matches.map(c => `<div class="px-4 py-3 cursor-pointer hover:bg-purple-500/10 transition-colors text-sm border-b border-purple-500/5 last:border-0" onclick="window.__selectCity('${c.name}',${c.lat},${c.lng},${c.tz})"><i class="fas fa-map-marker-alt text-purple-400/50 mr-2"></i>${c.name}</div>`).join('');
}

window.__selectCity = (name, lat, lng, tz) => {
  document.getElementById('inp-place').value = name;
  document.getElementById('inp-lat').value = lat;
  document.getElementById('inp-lng').value = lng;
  document.getElementById('inp-tz').value = tz;
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
  if (!lat || !lng) {
    const city = CITIES.find(c => c.name.toLowerCase().includes(place.toLowerCase()));
    if (city) { lat = city.lat; lng = city.lng; tz = city.tz; } else { alert('Please select a birth place from the suggestions.'); return; }
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
window.__setDashTab = (tab) => { currentDashTab = tab; sidebarOpen = false; render(); };
window.__setChartStyle = (style) => { chartStyle = style; render(); };
window.__setDivisional = (div) => { currentDivisional = div; render(); };
window.__selectPlanet = (name) => { selectedPlanet = name; render(); };
window.__toggleSidebar = () => { sidebarOpen = !sidebarOpen; const sb = document.getElementById('sidebar'); if(sb) sb.classList.toggle('open'); };
window.__toggleSection = (id) => { collapsedSections[id] = !collapsedSections[id]; render(); };

window.__toggleTheme = () => {
  darkMode = !darkMode;
  document.documentElement.classList.toggle('dark', darkMode);
  render();
};

window.__downloadPDF = () => { window.print(); };

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
    form.dispatchEvent(new Event('submit'));
  }
};

// === Init ===
const path = window.location.pathname;
if (path === '/dashboard' && !currentChart) currentPage = 'generate';
else if (path === '/generate') currentPage = 'generate';
else if (path === '/dashboard') currentPage = 'dashboard';
else currentPage = 'landing';
render();

})();
