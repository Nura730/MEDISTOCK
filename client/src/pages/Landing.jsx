import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Clock,
  Bell,
  ShieldCheck,
  Building2,
  ArrowRight,
  CheckCircle2,
  Pill,
  Activity,
  Sparkles,
  Zap,
  TrendingUp,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState('');
  const [livePillStatus, setLivePillStatus] = useState('Low Stock');
  const [lastUpdatedSec, setLastUpdatedSec] = useState(2);
  const navigate = useNavigate();

  // Subtle demo animation for live stock preview to demonstrate real-time capability
  useEffect(() => {
    const timer = setInterval(() => {
      setLivePillStatus((prev) => (prev === 'Low Stock' ? 'In Stock' : 'Low Stock'));
      setLastUpdatedSec(0);
    }, 9000);
    const secTimer = setInterval(() => {
      setLastUpdatedSec((s) => s + 1);
    }, 1000);
    return () => {
      clearInterval(timer);
      clearInterval(secTimer);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Hero Section — Split Layout on Calm Healthcare Canvas */}
      <section className="relative pt-8 sm:pt-14 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Mission & Search Interface */}
            <div className="lg:col-span-7 space-y-6">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-200/80 rounded-full text-teal-800 text-xs font-semibold tracking-wide shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Government Public Welfare Digital Service</span>
              </div>

              {/* Editorial Headline */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                  Find essential medicines. <br />
                  <span className="text-teal-700 font-bold">Know before you go.</span>
                </h1>
                <p className="text-base sm:text-lg text-slate-600 max-w-xl font-normal leading-relaxed pt-1">
                  Check live stock availability across government district hospitals, community health centres, and dispensaries before traveling.
                </p>
              </div>

              {/* Large Premium Search Field */}
              <form onSubmit={handleSearch} className="max-w-xl">
                <div className="relative flex items-center bg-white border-2 border-slate-200 hover:border-slate-300 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100 rounded-xl shadow-xs transition-all p-1.5">
                  <div className="flex items-center pl-3.5 pr-2 pointer-events-none text-slate-400">
                    <Search className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search medicine by brand or generic name..."
                    className="w-full py-2.5 px-1 bg-transparent text-slate-900 placeholder:text-slate-400 text-sm sm:text-base outline-none border-none font-normal"
                    aria-label="Search medicine name"
                  />
                  <button
                    type="submit"
                    className="shrink-0 px-4 sm:px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    <span>Search</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Popular Medicine Quick Chips */}
              <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap pt-1">
                <span className="font-semibold text-slate-700">Frequently Searched:</span>
                {['Paracetamol 500mg', 'Metformin 500mg', 'Amoxicillin 500mg', 'Insulin Regular'].map((med) => (
                  <button
                    key={med}
                    type="button"
                    onClick={() => navigate(`/search?q=${encodeURIComponent(med)}`)}
                    className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors font-medium cursor-pointer"
                  >
                    {med}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Realistic MediStock Live Availability Panel */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
                {/* Panel Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center">
                      <Pill className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">Paracetamol 500mg</h3>
                      <p className="text-xs text-slate-500">Generic: Paracetamol • Analgesic</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                    <span>Live Stock</span>
                  </div>
                </div>

                {/* Subtitle */}
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Nearby Government Facilities
                </p>

                {/* Facilities List */}
                <div className="space-y-3">
                  {/* Facility 1 */}
                  <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <h4 className="text-xs font-semibold text-slate-900 truncate">
                          Govt. Pharmacy — Kochi Central
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> 1.8 km away
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" /> 09:00 AM – 06:00 PM
                        </span>
                      </div>
                    </div>
                    <StatusBadge status="In Stock" size="sm" />
                  </div>

                  {/* Facility 2 (Live Animated item) */}
                  <div className="p-3.5 rounded-xl border border-teal-100 bg-teal-50/30 hover:bg-teal-50/50 transition-colors flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <h4 className="text-xs font-semibold text-slate-900 truncate">
                          Ernakulam General Hospital
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> 3.2 km away
                        </span>
                        <span className="text-teal-700 font-medium">~15 units</span>
                      </div>
                    </div>
                    <StatusBadge status={livePillStatus} size="sm" />
                  </div>

                  {/* Facility 3 */}
                  <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <h4 className="text-xs font-semibold text-slate-900 truncate">
                          Govt. Pharmacy — Aluva Town
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> 9.4 km away
                        </span>
                        <span className="text-rose-600 font-medium">Out of stock</span>
                      </div>
                    </div>
                    <StatusBadge status="Out of Stock" size="sm" />
                  </div>
                </div>

                {/* Footer status notice */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-slate-500 font-medium">
                    <Activity className="w-3.5 h-3.5 text-teal-600" /> Real-time Socket.IO Sync
                  </span>
                  <span>Updated {lastUpdatedSec}s ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Cohesive Metrics Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="text-center pt-2 md:pt-0">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">10+</p>
              <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">Government Pharmacies</p>
            </div>
            <div className="text-center pt-4 md:pt-0 md:pl-6">
              <p className="text-2xl sm:text-3xl font-extrabold text-teal-700">25+</p>
              <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">Essential Medicines</p>
            </div>
            <div className="text-center pt-4 md:pt-0 md:pl-6">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">1,000+</p>
              <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">Citizens Supported</p>
            </div>
            <div className="text-center pt-4 md:pt-0 md:pl-6">
              <div className="inline-flex items-center gap-1 text-2xl sm:text-3xl font-extrabold text-slate-900">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live</span>
              </div>
              <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">WebSocket Updates</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How MediStock Works — Horizontal Timeline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-1">Streamlined Experience</h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">How MediStock Works</h3>
          <p className="text-sm text-slate-500 mt-2">
            Eliminate tedious hospital-to-hospital journeys in three reliable steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {[
            {
              step: '01',
              title: 'Search Essential Drug',
              desc: 'Look up medicine by brand, generic formulation, or therapeutic class. Instant auto-suggestions guide you.'
            },
            {
              step: '02',
              title: 'Locate Nearest Stock',
              desc: 'View distance in kilometers, operating hours, and live inventory status across government facilities.'
            },
            {
              step: '03',
              title: 'Reserve or Set Alert',
              desc: 'If low or out of stock, activate an automated alert to be notified via dashboard the moment stock arrives.'
            }
          ].map(({ step, title, desc }) => (
            <div
              key={step}
              className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs hover:border-slate-300 transition-colors"
            >
              <div className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 inline-block px-2.5 py-1 rounded-md mb-4">
                Step {step}
              </div>
              <h4 className="text-base font-semibold text-slate-900 mb-2">{title}</h4>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Why MediStock Matters — Problem vs Impact Editorial Panel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: Problem explanation */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-700">Public Healthcare Mandate</span>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Solving medicine scarcity through real-time transparency
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Elderly citizens and low-income families frequently spend multiple hours and travel costs visiting government dispensaries only to be told that life-saving insulin or cardiovascular drugs are out of stock.
              </p>
              <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Eliminates fruitless travel through instant distance-based stock verification.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Empowers pharmacy staff with rapid stock adjustment tools.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Equips state health officials with shortage heatmaps for early reallocation.</span>
                </li>
              </ul>
            </div>

            {/* Right: Quantified Impact Panel */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                <span>Demonstrated Welfare Outcomes</span>
              </h4>
              <div className="space-y-3 divide-y divide-slate-100 text-xs">
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-slate-500">Travel time saved per patient</span>
                  <span className="font-semibold text-slate-900">~45 minutes</span>
                </div>
                <div className="pt-3 flex items-center justify-between">
                  <span className="text-slate-500">Inventory transparency rate</span>
                  <span className="font-semibold text-emerald-700">100% Digital</span>
                </div>
                <div className="pt-3 flex items-center justify-between">
                  <span className="text-slate-500">Government facilities linked</span>
                  <span className="font-semibold text-slate-900">10 Pilot Centres</span>
                </div>
                <div className="pt-3 flex items-center justify-between">
                  <span className="text-slate-500">Notification response</span>
                  <span className="font-semibold text-teal-700">&lt; 1 sec (Socket.IO)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Clean CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden shadow-sm">
          <div className="max-w-2xl mx-auto space-y-4">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Ready to verify essential medicine stock?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              Search available medicines in your district or access the authorized pharmacy administration portal.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/search"
                className="w-full sm:w-auto px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-sm rounded-lg transition-colors inline-flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Find a Medicine Now</span>
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm rounded-lg transition-colors border border-slate-700 inline-flex items-center justify-center gap-2"
              >
                <Building2 className="w-4 h-4 text-slate-300" />
                <span>Authorized Staff Sign In</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
