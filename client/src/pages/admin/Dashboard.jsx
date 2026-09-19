import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Pill, AlertTriangle, XCircle, TrendingUp, Search, BarChart3, Activity, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import { useSocket } from '../../hooks/useHelpers';

const COLORS = { inStock: '#059669', lowStock: '#d97706', outOfStock: '#dc2626' };

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
      setTrends(trendRes.data.data);
      setPharmacyStats(pharmRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useSocket(socket, 'dashboard:statsUpdated', () => fetchData());
  useSocket(socket, 'inventory:updated', () => fetchData());

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-8 bg-gray-100 rounded w-48 mb-8 animate-pulse"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1,2].map(i => <div key={i} className="h-80 bg-gray-100 rounded-xl animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  const pieData = [
    { name: 'In Stock', value: stats?.inStock || 0, color: COLORS.inStock },
    { name: 'Low Stock', value: stats?.lowStock || 0, color: COLORS.lowStock },
    { name: 'Out of Stock', value: stats?.outOfStock || 0, color: COLORS.outOfStock }
  ];

  const trendData = trends.slice(0, 8).map(t => ({
    name: t._id?.length > 12 ? t._id.slice(0, 12) + '…' : t._id,
    searches: t.count
  }));

  const pharmChartData = pharmacyStats.slice(0, 8).map(p => ({
    name: p.pharmacy?.name?.replace('Government Pharmacy - ', '') || 'Unknown',
    inStock: p.inStock,
    lowStock: p.lowStock,
    outOfStock: p.outOfStock
  }));

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">System-wide medicine availability overview</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/pharmacies" className="px-4 py-2 bg-white border border-gray-200 hover:border-blue-300 text-gray-700 font-medium rounded-lg text-sm flex items-center gap-1.5">
            <Building2 className="w-4 h-4" /> Pharmacies
          </Link>
          <Link to="/admin/medicines" className="px-4 py-2 bg-white border border-gray-200 hover:border-blue-300 text-gray-700 font-medium rounded-lg text-sm flex items-center gap-1.5">
            <Pill className="w-4 h-4" /> Medicines
          </Link>
          <Link to="/admin/analytics" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4" /> Analytics
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Building2, label: 'Pharmacies', value: stats?.totalPharmacies, color: 'text-blue-600 bg-blue-50', border: 'border-blue-100' },
          { icon: Pill, label: 'Medicines', value: stats?.totalMedicines, color: 'text-purple-600 bg-purple-50', border: 'border-purple-100' },
          { icon: AlertTriangle, label: 'Low Stock', value: stats?.lowStock, color: 'text-amber-600 bg-amber-50', border: 'border-amber-100' },
          { icon: XCircle, label: 'Out of Stock', value: stats?.outOfStock, color: 'text-red-600 bg-red-50', border: 'border-red-100' }
        ].map(({ icon: Icon, label, value, color, border }) => (
          <div key={label} className={`bg-white rounded-xl border p-5 ${border}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{value || 0}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Availability Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-1">Availability Distribution</h3>
          <p className="text-sm text-gray-500 mb-4">{stats?.totalInventoryRecords || 0} inventory records</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v} records`]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ background: d.color }}></div>
                <span className="text-gray-600">{d.name}: <strong>{d.value}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Pharmacy Inventory Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-1">Pharmacy Inventory Status</h3>
          <p className="text-sm text-gray-500 mb-4">Medicine stock by pharmacy</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={pharmChartData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="inStock" name="In Stock" fill={COLORS.inStock} stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="lowStock" name="Low Stock" fill={COLORS.lowStock} stackId="a" />
              <Bar dataKey="outOfStock" name="Out of Stock" fill={COLORS.outOfStock} stackId="a" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Search Trends + Critical Shortages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Searched */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" /> Most Searched Medicines
          </h3>
          <p className="text-sm text-gray-500 mb-4">Based on citizen search activity</p>
          {trendData.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">No search data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="searches" name="Searches" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Critical Shortages */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-600" /> Critical Shortages
          </h3>
          <p className="text-sm text-gray-500 mb-4">Medicines out of stock at multiple pharmacies</p>
          {!shortages?.outOfStock?.length ? (
            <p className="text-gray-400 text-sm py-8 text-center">No critical shortages</p>
          ) : (
            <div className="space-y-3">
              {shortages.outOfStock.map(item => (
                <div key={item._id} className="flex items-center justify-between px-4 py-3 bg-red-50 border border-red-100 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.medicine?.name}</p>
                    <p className="text-xs text-gray-500">{item.medicine?.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">{item.pharmaciesAffected}</p>
                    <p className="text-xs text-red-500">pharmacies affected</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
