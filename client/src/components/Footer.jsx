import React from 'react';
import { Pill, ShieldCheck, PhoneCall, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Mandate */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
                <Pill className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">MediStock</span>
              <span className="text-[10px] uppercase font-semibold text-teal-300 bg-teal-950/80 border border-teal-800 px-2 py-0.5 rounded-full">
                Public Service
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              A centralized government pharmacy availability network. Empowering citizens with real-time medicine visibility, proximity tracking, and transparent shortage monitoring before traveling.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-400" /> Track 3: Public Welfare
              </span>
              <span className="flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-slate-400" /> Health Helpline: 104
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Platform Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/search" className="text-slate-400 hover:text-white transition-colors">
                  Find Essential Medicines
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-400 hover:text-white transition-colors">
                  Pharmacy Staff Portal
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-400 hover:text-white transition-colors">
                  State Health Admin Portal
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-slate-400 hover:text-white transition-colors">
                  Citizen Account Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* Guidelines & Disclaimer */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Public Notice
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Stock numbers shown are synchronized via live hospital inventory feeds. For emergency triage or immediate critical care, visit the nearest casualty department or dial 112.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© 2026 MediStock. Public Healthcare Digital Initiative.</p>
          <p className="flex items-center gap-2">
            <span>Official Demonstration Prototype</span>
            <span>•</span>
            <span>Ernakulam District Pilot</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
