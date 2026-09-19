import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, XCircle, TrendingUp, Building2, Pill, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import { useSocket } from '../../hooks/useHelpers';
import { TableSkeleton } from '../../components/ui/Skeleton';

export default function ShortageAnalytics() {
  const [shortages, setShortages] = useState(null);
  const [pharmacyStats, setPharmacyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = getSocket();

  const fetchData = async () => {
    try {
      const [shortageRes, pharmRes] = await Promise.all([
        api.get('/admin/shortages'),
        api.get('/admin/pharmacy-stats')
      ]);
      setShortages(shortageRes.data.data);
      setPharmacyStats(pharmRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useSocket(socket, 'dashboard:statsUpdated', () => fetchData());

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="h-8 w-64 skeleton-shimmer rounded" />
        <TableSkeleton rows={6} cols={3} />
      </div>
    );
  }

  const outOfStockData = (shortages?.outOfStock || []).map((item) => ({
    name: item.medicine?.name?.length > 14 ? item.medicine.name.slice(0, 14) + '…' : item.medicine?.name,
    affected: item.pharmaciesAffected
  }));

  const lowStockData = (shortages?.lowStock || []).map((item) => ({
    name: item.medicine?.name?.length > 14 ? item.medicine.name.slice(0, 14) + '…' : item.medicine?.name,
    affected: item.pharmaciesAffected
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin"
          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          title="Back to Admin Dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            District Shortage Intelligence & Allocation Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time multi-pharmacy stock depletion alerts for state intervention.
          </p>
        </div>
      </div>

      {/* Critical Shortage Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Out of Stock Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Completely Out of Stock Drugs</span>
              </h3>
              <p className="text-xs text-slate-500">Government centres with zero units on hand</p>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              {outOfStockData.length} Affected
            </span>
          </div>

          {outOfStockData.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No complete stock depletions recorded across the district network.
            </div>
          ) : (
            <div className="h-64 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={outOfStockData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-25} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="affected" name="Facilities Depleted" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Low Stock Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Drugs Nearing Depletion Threshold</span>
              </h3>
              <p className="text-xs text-slate-500">Stock below standard safety reserve</p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {lowStockData.length} Formulations
            </span>
          </div>

          {lowStockData.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No medications currently breaching low stock thresholds.
            </div>
          ) : (
            <div className="h-64 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lowStockData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-25} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="affected" name="Facilities Near Low Stock" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Facility-Level Stock Compliance Health */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-600" />
            <span>Facility-Wise Formulary Compliance Rates</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed breakdown of stocked vs depleted medicines per government healthcare centre.
          </p>
        </div>

        <div className="space-y-3">
          {pharmacyStats.map((ps) => {
            const total = ps.totalMedicines || 1;
            const inStockPct = Math.round((ps.inStock / total) * 100);
            const lowStockPct = Math.round((ps.lowStock / total) * 100);
            const outOfStockPct = Math.round((ps.outOfStock / total) * 100);

            return (
              <div
                key={ps._id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50 transition-colors space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                      {ps.pharmacy?.name ? ps.pharmacy.name.charAt(0) : 'P'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{ps.pharmacy?.name}</h4>
                      <p className="text-[11px] text-slate-500">{ps.totalMedicines} formulary drugs assigned</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="text-emerald-700">{ps.inStock} In Stock</span>
                    <span className="text-amber-700">{ps.lowStock} Low</span>
                    <span className="text-rose-700">{ps.outOfStock} Out of Stock</span>
                  </div>
                </div>

                {/* Visual Ratio Bar */}
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden flex">
                  <div style={{ width: `${inStockPct}%` }} className="bg-emerald-500 h-full" title={`In stock: ${inStockPct}%`} />
                  <div style={{ width: `${lowStockPct}%` }} className="bg-amber-400 h-full" title={`Low stock: ${lowStockPct}%`} />
                  <div style={{ width: `${outOfStockPct}%` }} className="bg-rose-500 h-full" title={`Out of stock: ${outOfStockPct}%`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
