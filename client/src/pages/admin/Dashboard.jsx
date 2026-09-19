import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Pill, AlertTriangle, XCircle, TrendingUp, Search, BarChart3, Activity, ChevronRight, ShieldCheck } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import { useSocket } from '../../hooks/useHelpers';
import StatusBadge from '../../components/ui/StatusBadge';
import { CardSkeleton } from '../../components/ui/Skeleton';

const CHART_COLORS = {
  inStock: '#10b981',
  lowStock: '#f59e0b',
  outOfStock: '#ef4444'
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [shortages, setShortages] = useState(null);
  const [trends, setTrends] = useState([]);
  const [pharmacyStats, setPharmacyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = getSocket();

  const fetchData = async () => {
    try {
      const [statsRes, shortageRes, trendRes, pharmRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/shortages'),
        api.get('/admin/search-trends'),
        api.get('/admin/pharmacy-stats')
      ]);
      setStats(statsRes.data.data);
      setShortages(shortageRes.data.data);
      setTrends(trendRes.data.data || []);
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
  useSocket(socket, 'inventory:updated', () => fetchData());

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="h-8 w-64 skeleton-shimmer rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const pieData = [
    { name: 'In Stock', value: stats?.inStock || 0, color: CHART_COLORS.inStock },
    { name: 'Low Stock', value: stats?.lowStock || 0, color: CHART_COLORS.lowStock },
    { name: 'Out of Stock', value: stats?.outOfStock || 0, color: CHART_COLORS.outOfStock }
  ];

  const trendData = trends.slice(0, 7).map((t) => ({
    name: t._id?.length > 14 ? t._id.slice(0, 14) + '…' : t._id,
    searches: t.count
  }));

  const totalInventory = (stats?.inStock || 0) + (stats?.lowStock || 0) + (stats?.outOfStock || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Command Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              State Health Mission Command Center
            </h1>
            <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
              District Analytics
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            System-wide medicine availability and automated shortage tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/admin/pharmacies"
            className="px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Pharmacies</span>
          </Link>
          <Link
            to="/admin/medicines"
            className="px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Pill className="w-3.5 h-3.5 text-slate-500" />
            <span>Formulary</span>
          </Link>
          <Link
            to="/admin/analytics"
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Shortage Heatmap</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Registered Pharmacies</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">{stats?.totalPharmacies || 0}</p>
          <p className="text-[11px] text-slate-400 mt-1">Across Ernakulam district</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Essential Formulations</span>
            <Pill className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">{stats?.totalMedicines || 0}</p>
          <p className="text-[11px] text-slate-400 mt-1">Government monitored drugs</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Inventory Records</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">{totalInventory}</p>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            {stats?.inStock || 0} in stock ({totalInventory ? Math.round(((stats?.inStock || 0) / totalInventory) * 100) : 0}%)
          </p>
        </div>

        <div className="bg-white border border-rose-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800">Critical Shortages</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-rose-700 mt-2">{shortages?.outOfStock?.length || 0}</p>
          <p className="text-[11px] text-rose-600 font-medium mt-1">Requiring state reallocation</p>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Distribution Pie Chart */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">District Stock Distribution</h3>
            <p className="text-xs text-slate-500 mt-0.5">Availability breakdown across all linked facilities</p>
          </div>

          <div className="h-56 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center text-xs">
            <div>
              <div className="flex items-center justify-center gap-1 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>In Stock</span>
              </div>
              <p className="font-bold text-slate-900 mt-0.5">{stats?.inStock || 0}</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Low Stock</span>
              </div>
              <p className="font-bold text-slate-900 mt-0.5">{stats?.lowStock || 0}</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Out of Stock</span>
              </div>
              <p className="font-bold text-slate-900 mt-0.5">{stats?.outOfStock || 0}</p>
            </div>
          </div>
        </div>

        {/* Citizen Search Demand Trends */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Public Demand & Search Frequency</h3>
            <p className="text-xs text-slate-500 mt-0.5">Most queried formulations by citizens in the past 30 days</p>
          </div>

          <div className="h-64 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="searches" fill="#0d9488" radius={[4, 4, 0, 0]} name="Citizen Queries" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-slate-400 text-right pt-2 border-t border-slate-100">
            Real-time query telemetry aggregated from public portal searches.
          </p>
        </div>
      </div>

      {/* Critical Shortages Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/40">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Critical District Shortages Requiring Action</span>
            </h2>
            <p className="text-xs text-slate-500">Medicines out of stock at multiple government centers simultaneously.</p>
          </div>
          <Link
            to="/admin/analytics"
            className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1"
          >
            <span>Full Shortage Heatmap</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {!shortages?.outOfStock || shortages.outOfStock.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No critical shortages identified across the network at this time.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Medicine Formulation</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Affected Facilities</th>
                  <th className="px-4 py-3">Severity Level</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shortages.outOfStock.slice(0, 8).map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-900">{item.medicine?.name}</p>
                      <p className="text-[11px] text-slate-400">{item.medicine?.genericName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                        {item.medicine?.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-rose-700">
                      {item.pharmaciesAffected} government facilities
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> High Shortage
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/medicine/${item.medicine?._id}`}
                        className="text-xs font-semibold text-teal-700 hover:underline"
                      >
                        Inspect Stock
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
