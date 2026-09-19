import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center animate-fade-in-up">
        <p className="text-7xl font-extrabold text-blue-600 mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Page not found</h1>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <Link to="/search" className="px-5 py-2.5 bg-white border border-gray-200 hover:border-blue-300 text-gray-700 font-medium rounded-lg transition-colors flex items-center gap-2">
            <Search className="w-4 h-4" /> Find Medicine
          </Link>
        </div>
      </div>
    </div>
  );
}
