import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, X, Filter, Pill, Building2, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { useDebounce, getStatusColor } from '../hooks/useHelpers';

const categories = ['All', 'Analgesic', 'Antibiotic', 'Antihypertensive', 'Antidiabetic', 'Antihistamine', 'Antacid', 'Respiratory', 'Antiplatelet', 'Rehydration', 'Supplement'];

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gray-100 rounded-xl shrink-0"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-100 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-100 rounded w-1/2 mb-3"></div>
          <div className="h-4 bg-gray-100 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
}

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
        setMedicines(data.data);
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
    <div className="page-enter max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Find Medicine</h1>
        <p className="text-gray-500">Search by medicine name, generic name, or category</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="flex items-center px-4 py-3">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medicines... (e.g., Paracetamol 500mg)"
            className="flex-1 px-3 py-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400"
            autoFocus
            aria-label="Search medicines"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 cursor-pointer" aria-label="Clear search">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
              category === cat
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : medicines.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Pill className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No medicines found</h3>
          <p className="text-gray-500 mb-4">Try searching with a different name or category</p>
          {query && (
            <button onClick={() => { setQuery(''); setCategory('All'); }} className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{medicines.length} medicine{medicines.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {medicines.map((med, idx) => (
              <Link
                to={`/medicine/${med._id}`}
                key={med._id}
                className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-blue-200 transition-all group animate-fade-in"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                    <Pill className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate">{med.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Generic: {med.genericName}</p>
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {med.category}
                      </span>
                      {med.strength && (
                        <span className="text-xs text-gray-400">{med.strength}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-3 text-sm">
                      <Building2 className="w-3.5 h-3.5 text-gray-400" />
                      <span className={med.availablePharmacies > 0 ? 'text-emerald-700 font-medium' : 'text-red-600 font-medium'}>
                        {med.availablePharmacies > 0
                          ? `Available at ${med.availablePharmacies} ${med.availablePharmacies === 1 ? 'pharmacy' : 'pharmacies'}`
                          : 'Currently unavailable'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors mt-1 shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
