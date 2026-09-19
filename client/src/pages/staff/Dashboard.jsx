import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, AlertTriangle, XCircle, CheckCircle, Clock, Pill, ArrowRight, BarChart3, Search } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../services/socket';
import { useSocket, getStatusColor, getStatusDot, timeAgo } from '../../hooks/useHelpers';
import toast from 'react-hot-toast';

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
      setInventory(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, [pharmacyId, search]);

  useSocket(socket, 'inventory:updated', (data) => {
    if (data.pharmacyId?.toString() === pharmacyId) fetchInventory();
  });

  const getStatus = (item) => {
    if (item.quantity === 0) return 'Out of Stock';
    if (item.quantity <= item.lowStockThreshold) return 'Low Stock';
    return 'In Stock';
  };

  const inStock = inventory.filter(i => getStatus(i) === 'In Stock').length;
  const lowStock = inventory.filter(i => getStatus(i) === 'Low Stock').length;
  const outOfStock = inventory.filter(i => getStatus(i) === 'Out of Stock').length;

  return (
    <div className="page-enter max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pharmacy Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your pharmacy's medicine inventory</p>
        </div>
        <Link to="/staff/inventory" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2 text-sm shrink-0">
          <Package className="w-4 h-4" /> Manage Inventory
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Package, label: 'Total Medicines', value: inventory.length, color: 'text-blue-600 bg-blue-50' },
          { icon: CheckCircle, label: 'In Stock', value: inStock, color: 'text-emerald-600 bg-emerald-50' },
          { icon: AlertTriangle, label: 'Low Stock', value: lowStock, color: 'text-amber-600 bg-amber-50' },
          { icon: XCircle, label: 'Out of Stock', value: outOfStock, color: 'text-red-600 bg-red-50' }
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Low Stock Alerts */}
      {(lowStock > 0 || outOfStock > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
          <h2 className="font-semibold text-amber-900 flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5" /> Attention Required
          </h2>
          <div className="space-y-2">
            {inventory.filter(i => getStatus(i) !== 'In Stock').slice(0, 5).map(item => (
              <div key={item._id} className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-amber-100">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusDot(getStatus(item))}`}></div>
                  <span className="text-sm font-medium text-gray-900">{item.medicineId?.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{item.quantity} units</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(getStatus(item))}`}>
                    {getStatus(item)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Inventory */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Inventory Overview</h2>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 max-w-xs">
            <Search className="w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search medicines..." className="bg-transparent text-sm outline-none flex-1" />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center"><div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div></div>
        ) : inventory.length === 0 ? (
          <div className="p-10 text-center">
            <Pill className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{search ? 'No medicines match your search' : 'No inventory data found'}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Medicine</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Threshold</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {inventory.map(item => (
                    <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{item.medicineId?.name}</p>
                        <p className="text-xs text-gray-500">{item.medicineId?.category}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.quantity}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{item.lowStockThreshold}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusColor(getStatus(item))}`}>
                          {getStatus(item)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{timeAgo(item.lastUpdated)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-50">
              {inventory.map(item => (
                <div key={item._id} className="px-5 py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{item.medicineId?.name}</p>
                      <p className="text-xs text-gray-500">{item.medicineId?.category}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusColor(getStatus(item))}`}>
                      {getStatus(item)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>Stock: <strong className="text-gray-900">{item.quantity}</strong></span>
                    <span>Threshold: {item.lowStockThreshold}</span>
                    <span>{timeAgo(item.lastUpdated)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
