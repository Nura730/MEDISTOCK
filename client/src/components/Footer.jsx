import { Pill, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Pill className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">MediStock</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
              A public-service platform to check medicine availability at government pharmacies before you travel.
            </p>
            <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-amber-400 rounded-full"></span>
              Demo prototype — not connected to live government systems
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/search" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Find Medicine</Link>
              <Link to="/login" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Pharmacy Login</Link>
              <Link to="/login" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Admin Portal</Link>
            </div>
          </div>

          {/* Future Scope */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Coming Soon</h4>
            <div className="flex flex-col gap-2 text-sm text-gray-500">
              <span>SMS & WhatsApp Alerts</span>
              <span>Malayalam Interface</span>
              <span>QR Medicine Lookup</span>
              <span>Demand Forecasting</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            © 2026 MediStock. Built for public welfare.
          </p>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-400" /> for Kerala
          </p>
        </div>
      </div>
    </footer>
  );
}
