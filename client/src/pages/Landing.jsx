import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Clock, Bell, Shield, Users, Building2, ArrowRight, CheckCircle2, Pill, Activity, TrendingUp } from 'lucide-react';

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-8">
              <Shield className="w-4 h-4" />
              Government Public Welfare Initiative
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6">
              Find essential medicines.
              <span className="block text-blue-200 mt-1">Know before you go.</span>
            </h1>

            <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              Check medicine availability at nearby government pharmacies before you travel. Save time. Get what you need.
            </p>

            {/* Hero Search */}
            <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8">
              <div className="flex bg-white rounded-xl shadow-xl overflow-hidden">
                <div className="flex-1 flex items-center px-4 sm:px-5">
                  <Search className="w-5 h-5 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for a medicine... (e.g., Paracetamol)"
                    className="w-full px-3 py-4 text-gray-900 placeholder-gray-400 bg-transparent border-none outline-none text-base"
                    aria-label="Search medicines"
                  />
                </div>
                <button type="submit" className="px-6 sm:px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors flex items-center gap-2 shrink-0">
                  <span className="hidden sm:inline">Find Medicine</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-blue-200">
              <span>Popular:</span>
              {['Paracetamol', 'ORS', 'Amoxicillin', 'Insulin'].map((med) => (
                <button key={med} onClick={() => navigate(`/search?q=${med}`)} className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                  {med}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: Building2, value: '10+', label: 'Government Pharmacies', color: 'text-blue-600 bg-blue-50' },
              { icon: Pill, value: '25+', label: 'Medicines Tracked', color: 'text-emerald-600 bg-emerald-50' },
              { icon: Users, value: '1000+', label: 'Citizens Served', color: 'text-purple-600 bg-purple-50' },
              { icon: Activity, value: 'Real-time', label: 'Stock Updates', color: 'text-amber-600 bg-amber-50' }
            ].map(({ icon: Icon, value, label, color }) => (
              <div key={label} className="text-center">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How MediStock Works</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">Three simple steps to find your medicine</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {[
            { step: '1', icon: Search, title: 'Search Medicine', desc: 'Type the medicine name, generic name, or category. Results appear instantly with availability summary.' },
            { step: '2', icon: MapPin, title: 'Find Pharmacy', desc: 'See which nearby government pharmacies have your medicine in stock, with distance and opening hours.' },
            { step: '3', icon: Bell, title: 'Get Notified', desc: 'If a medicine is out of stock, set an alert. Get notified the moment it becomes available.' }
          ].map(({ step, icon: Icon, title, desc }) => (
            <div key={step} className="relative bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute -top-4 left-8 w-8 h-8 bg-blue-600 text-white text-sm font-bold rounded-full flex items-center justify-center">
                {step}
              </div>
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-5 mt-2">
                <Icon className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
              <p className="text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-blue-50 border-y border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Why MediStock matters</h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Citizens often travel to multiple government pharmacies, only to find that their essential medicine is unavailable. MediStock eliminates this uncertainty.
              </p>

              <div className="space-y-4">
                {[
                  'Save time — check availability before traveling',
                  'Know stock levels at nearby pharmacies',
                  'Get notified when out-of-stock medicines arrive',
                  'Help identify medicine shortages in your district',
                  'Support data-driven government healthcare decisions'
                ].map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <p className="text-gray-700">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8">
              <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" /> Platform Impact
              </h3>
              <div className="space-y-5">
                {[
                  { label: 'Travel time saved per citizen', value: '~45 mins', color: 'bg-emerald-500' },
                  { label: 'Medicine availability rate', value: '78%', color: 'bg-blue-500' },
                  { label: 'Pharmacies connected', value: '10 locations', color: 'bg-purple-500' },
                  { label: 'Real-time inventory updates', value: 'Active', color: 'bg-amber-500' }
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${color}`}></div>
                      <span className="text-sm text-gray-600">{label}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to find your medicine?</h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Search from 25+ essential medicines across 10 government pharmacies in your district.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/search')} className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 text-base cursor-pointer">
              <Search className="w-5 h-5" /> Find a Medicine
            </button>
            <button onClick={() => navigate('/login')} className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 text-base cursor-pointer">
              <Building2 className="w-5 h-5" /> I'm a Pharmacy Staff
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
