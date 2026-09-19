import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, XCircle, TrendingUp, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import { useSocket } from '../../hooks/useHelpers';

const COLORS = ['#3b82f6', '#059669', '#d97706', '#dc2626', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b'];

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
      setPharmacyStats(pharmRes.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);
  useSocket(socket, 'dashboard:statsUpdated', () => fetchData());

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-6">{[1,2,3].map(i => <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse"></div>)}</div>
      </div>
    );
  }

  const outOfStockData = (shortages?.outOfStock || []).map(item => ({
    name: item.medicine?.name?.length > 15 ? item.medicine.name.slice(0, 15) + '…' : item.medicine?.name,
    affected: item.pharmaciesAffected
  }));

  const lowStockData = (shortages?.lowStock || []).map(item => ({
    name: item.medicine?.name?.length > 15 ? item.medicine.name.slice(0, 15) + '…' : item.medicine?.name,
    affected: item.pharmaciesAffected
  }));

  const pharmPieData = pharmacyStats.slice(0, 6).map((p, i) => ({
    name: p.pharmacy?.name?.replace('Government Pharmacy - ', '') || 'Unknown',
    outOfStock: p.outOfStock,
    color: COLORS[i % COLORS.length]
  })).filter(p => p.outOfStock > 0);

  return (
    <div className="page-enter max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/admin" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shortage Analytics</h1>
          <p className="text-gray-500 mt-0.5">Monitor medicine shortages across pharmacies</p>
        </div>
      </div>

      {/* Out of Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-red-600" /> Out of Stock — Medicines
          </h3>
          <p className="text-sm text-gray-500 mb-4">Medicines unavailable at multiple pharmacies</p>
          {outOfStockData.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">No out-of-stock medicines</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={outOfStockData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="affected" name="Pharmacies Affected" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> Low Stock — Medicines
          </h3>
          <p className="text-sm text-gray-500 mb-4">Medicines running low at multiple pharmacies</p>
          {lowStockData.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">No low-stock medicines</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={lowStockData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="affected" name="Pharmacies Affected" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Pharmacy-level */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-1">
          <Building2 className="w-4 h-4 text-blue-600" /> Pharmacy-Level Shortage Details
        </h3>
        <p className="text-sm text-gray-500 mb-4">Out-of-stock medicine count by pharmacy</p>
        <div className="space-y-3">
          {pharmacyStats.map(ps => (
            <div key={ps._id} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 min-w-0">
                <Building2 className="w-5 h-5 text-gray-400 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{ps.pharmacy?.name}</p>
                  <p className="text-xs text-gray-500">{ps.totalMedicines} medicines tracked</p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0 text-sm">
                <span className="text-emerald-600 font-medium">{ps.inStock} <span className="text-xs text-gray-400">in stock</span></span>
                <span className="text-amber-600 font-medium">{ps.lowStock} <span className="text-xs text-gray-400">low</span></span>
                <span className="text-red-600 font-medium">{ps.outOfStock} <span className="text-xs text-gray-400">out</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
