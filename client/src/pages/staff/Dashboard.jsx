import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, AlertTriangle, XCircle, CheckCircle2, Clock, Pill, ArrowRight, BarChart3, Search, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../services/socket';
import { useSocket, timeAgo, getApproxStock } from '../../hooks/useHelpers';
import StatusBadge from '../../components/ui/StatusBadge';
import { CardSkeleton } from '../../components/ui/Skeleton';

export default function StaffDashboard() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const socket = getSocket();

  const pharmacyId = user?.pharmacyId;

  const fetchInventory = async () => {
    if (!pharmacyId) return;
    try {
      const { data } = await api.get(`/inventory/pharmacy/${pharmacyId}`, { params: { search } });
      setInventory(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [pharmacyId, search]);

  useSocket(socket, 'inventory:updated', (data) => {
    if (data.pharmacyId?.toString() === pharmacyId) {
      fetchInventory();
    }
  });

  const getStatus = (item) => {
    if (item.quantity === 0) return 'Out of Stock';
    if (item.quantity <= item.lowStockThreshold) return 'Low Stock';
    return 'In Stock';
  };

  const inStock = inventory.filter((i) => getStatus(i) === 'In Stock').length;
  const lowStock = inventory.filter((i) => getStatus(i) === 'Low Stock').length;
  const outOfStock = inventory.filter((i) => getStatus(i) === 'Out of Stock').length;
  const criticalItems = inventory.filter((i) => getStatus(i) !== 'In Stock');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Workstation Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Dispensary Stock Control
            </h1>
            <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
              Hospital Staff Portal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Logged in as <strong>{user?.name}</strong> • Real-time patient availability updates enabled.
          </p>
        </div>

        <Link
          to="/staff/inventory"
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2 shrink-0 self-start sm:self-auto shadow-xs"
        >
          <Package className="w-4 h-4" />
          <span>Manage Full Inventory</span>
        </Link>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tracked Formulas</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">{inventory.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">In facility catalog</p>
        </div>

        <div className="bg-white border border-emerald-200/80 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">In Stock</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-2">{inStock}</p>
          <p className="text-[11px] text-emerald-600 mt-1">Ready for dispensing</p>
        </div>

        <div className="bg-white border border-amber-200/80 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">Low Stock Alert</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-amber-700 mt-2">{lowStock}</p>
          <p className="text-[11px] text-amber-600 mt-1">Below safety threshold</p>
        </div>

        <div className="bg-white border border-rose-200/80 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800">Depleted / Zero</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-rose-700 mt-2">{outOfStock}</p>
          <p className="text-[11px] text-rose-600 mt-1">Requiring immediate indent</p>
        </div>
      </div>

      {/* Attention Required Panel for Critical Shortages */}
      {criticalItems.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Priority Restock Attention Required ({criticalItems.length} items)</span>
            </h2>
            <Link to="/staff/inventory" className="text-xs font-semibold text-amber-900 hover:underline">
              Adjust stock levels →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {criticalItems.slice(0, 6).map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-lg p-3 border border-amber-100 flex items-center justify-between shadow-2xs text-xs"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{item.medicineId?.name}</p>
                  <p className="text-[11px] text-slate-400">Current count: <strong>{item.quantity} units</strong></p>
                </div>
                <StatusBadge status={getStatus(item)} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Search & Current Inventory Overview */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Current Pharmacy Stock Overview</h2>
            <p className="text-xs text-slate-500">Live view of medications managed by your facility.</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search facility inventory..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <CardSkeleton />
          </div>
        ) : inventory.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No inventory records registered for this pharmacy yet. Use "Manage Full Inventory" to add items.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Medicine Formulary</th>
                  <th className="px-4 py-3">Classification</th>
                  <th className="px-4 py-3">Available Quantity</th>
                  <th className="px-4 py-3">Status Indicator</th>
                  <th className="px-4 py-3">Last Modified</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory.slice(0, 10).map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-900">{item.medicineId?.name}</p>
                      <p className="text-[11px] text-slate-400">{item.medicineId?.genericName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                        {item.medicineId?.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {item.quantity} units
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={getStatus(item)} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">
                      {timeAgo(item.lastUpdated)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to="/staff/inventory"
                        className="text-xs font-semibold text-teal-700 hover:underline"
                      >
                        Edit Stock
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
