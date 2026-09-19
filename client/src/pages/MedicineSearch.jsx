import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, X, Pill, Building2, ChevronRight, Filter, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useDebounce } from '../hooks/useHelpers';
import { CardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const categories = [
  'All',
  'Analgesic',
  'Antibiotic',
  'Antihypertensive',
  'Antidiabetic',
  'Antihistamine',
  'Antacid',
  'Respiratory',
  'Antiplatelet',
  'Rehydration',
  'Supplement'
];

export default function MedicineSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState('All');
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const fetchMedicines = async () => {
      setLoading(true);
      try {
        const params = {};
        if (debouncedQuery) params.search = debouncedQuery;
        if (category !== 'All') params.category = category;
        const { data } = await api.get('/medicines', { params });
        setMedicines(data.data || []);
      } catch (err) {
        console.error('Search error:', err);
        setMedicines([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMedicines();
  }, [debouncedQuery, category]);

  useEffect(() => {
    if (debouncedQuery) {
      setSearchParams({ q: debouncedQuery });
    } else {
      setSearchParams({});
    }
  }, [debouncedQuery]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Find Essential Medicines
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Real-time stock verification across registered district government pharmacies.
        </p>
      </div>

      {/* Search Bar & Filter Bar */}
      <div className="space-y-3">
        <div className="relative flex items-center bg-white border border-slate-200 focus-within:border-blue-600 focus-within:ring-3 focus-within:ring-blue-100 rounded-xl shadow-xs transition-all">
          <div className="pl-3.5 pr-2 pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by brand name or generic formula (e.g. Paracetamol, Metformin)..."
            className="w-full py-3 px-1 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent outline-none border-none"
            autoFocus
            aria-label="Search medicine name"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="mr-3 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 pl-1 pr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" /> Class:
          </span>
          {categories.map((cat) => {
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Results Summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <span>
          {loading ? 'Searching database...' : `${medicines.length} medicine formulation${medicines.length === 1 ? '' : 's'} found`}
        </span>
        {(query || category !== 'All') && (
          <button
            onClick={() => {
              setQuery('');
              setCategory('All');
            }}
            className="text-teal-700 hover:underline font-medium cursor-pointer"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : medicines.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="No matching medicines found"
          description="We couldn't locate any records matching your search criteria in this district."
          action={
            <button
              onClick={() => {
                setQuery('');
                setCategory('All');
              }}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              Show All Available Medicines
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {medicines.map((med) => {
            const hasPharmacies = med.availablePharmacies > 0;
            return (
              <Link
                key={med._id}
                to={`/medicine/${med._id}`}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 group-hover:bg-teal-100 transition-colors">
                      <Pill className="w-5 h-5 text-teal-700" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                      {med.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-700 transition-colors leading-tight">
                      {med.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      Generic: <span className="text-slate-700 font-medium">{med.genericName}</span>
                    </p>
                    {med.strength && (
                      <p className="text-[11px] text-slate-400 mt-0.5">Strength: {med.strength}</p>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span
                      className={`font-semibold ${
                        hasPharmacies ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {hasPharmacies
                        ? `In stock at ${med.availablePharmacies} ${
                            med.availablePharmacies === 1 ? 'pharmacy' : 'pharmacies'
                          }`
                        : 'Currently Out of Stock'}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
