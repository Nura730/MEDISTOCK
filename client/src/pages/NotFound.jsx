import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft, HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[65vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md mx-auto space-y-5 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-2xs">
          <HelpCircle className="w-8 h-8 text-slate-500" />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-1">Status 404</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Page Not Found</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            The page you requested could not be located on the MediStock public health platform.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
          <Link
            to="/search"
            className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-2xs"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span>Search Formulary</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
