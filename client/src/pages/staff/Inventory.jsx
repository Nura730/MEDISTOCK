import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Save, X, Package, Pill, AlertTriangle, Check, SlidersHorizontal } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../services/socket';
import { useSocket, timeAgo } from '../../hooks/useHelpers';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';

export default function StaffInventory() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState(null);
  const [editQty, setEditQty] = useState('');
  const [editThreshold, setEditThreshold] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addMedId, setAddMedId] = useState('');
  const [addQty, setAddQty] = useState('');
  const [addThreshold, setAddThreshold] = useState('10');
  const [saving, setSaving] = useState(false);
  const socket = getSocket();

  const pharmacyId = user?.pharmacyId;

  const fetchData = async () => {
    if (!pharmacyId) return;
    try {
      const [invRes, medRes] = await Promise.all([
        api.get(`/inventory/pharmacy/${pharmacyId}`),
        api.get('/medicines?limit=100')
      ]);
      setInventory(invRes.data.data || []);
      setMedicines(medRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pharmacyId]);

  useSocket(socket, 'inventory:updated', (data) => {
    if (data.pharmacyId?.toString() === pharmacyId) {
      fetchData();
    }
  });

  const getStatus = (item) => {
    if (item.quantity === 0) return 'Out of Stock';
    if (item.quantity <= item.lowStockThreshold) return 'Low Stock';
    return 'In Stock';
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setEditQty(item.quantity.toString());
    setEditThreshold(item.lowStockThreshold.toString());
  };

  const handleSave = async (id) => {
    const qty = parseInt(editQty);
    const thresh = parseInt(editThreshold);
    if (isNaN(qty) || qty < 0) {
      toast.error('Invalid quantity');
      return;
    }
    if (isNaN(thresh) || thresh < 0) {
      toast.error('Invalid threshold');
      return;
    }
    setSaving(true);
    try {
      await api.put(`/inventory/${id}`, { quantity: qty, lowStockThreshold: thresh });
      toast.success('Stock updated successfully');
      setEditId(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update stock');
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    if (!addMedId) {
      toast.error('Select a medicine');
      return;
    }
    const qty = parseInt(addQty);
    const thresh = parseInt(addThreshold);
    if (isNaN(qty) || qty < 0) {
      toast.error('Invalid quantity');
      return;
    }
    setSaving(true);
    try {
      await api.post('/inventory', {
        pharmacyId,
        medicineId: addMedId,
        quantity: qty,
        lowStockThreshold: thresh || 10
      });
      toast.success('Medicine added to inventory');
      setShowAdd(false);
      setAddMedId('');
      setAddQty('');
      setAddThreshold('10');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add medicine');
    } finally {
      setSaving(false);
    }
  };

  const existingMedIds = inventory.map((i) => i.medicineId?._id);
  const availableMedicines = medicines.filter((m) => !existingMedIds.includes(m._id));

  const filtered = search
    ? inventory.filter(
        (i) =>
          i.medicineId?.name?.toLowerCase().includes(search.toLowerCase()) ||
          i.medicineId?.genericName?.toLowerCase().includes(search.toLowerCase()) ||
          i.medicineId?.category?.toLowerCase().includes(search.toLowerCase())
      )
    : inventory;

  if (!pharmacyId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <EmptyState
          icon={AlertTriangle}
          title="No facility assigned"
          description="Your staff account has not been associated with a government pharmacy yet. Please reach out to your district administrator."
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/staff"
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Inventory Ledger & Stock Adjustment
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Live updates reflect instantly across public search and district alert systems.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer shadow-xs"
        >
          {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAdd ? 'Close Intake Form' : 'Add New Medicine Formulation'}</span>
        </button>
      </div>

      {/* Inline Add Medicine Card */}
      {showAdd && (
        <div className="bg-white border border-teal-200 rounded-xl p-5 shadow-xs animate-fade-in space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal-600" />
              <span>Register New Medicine into Facility Catalog</span>
            </h3>
            <span className="text-[11px] text-slate-500">{availableMedicines.length} unassigned drugs available</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Select Formulation</label>
              <select
                value={addMedId}
                onChange={(e) => setAddMedId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white outline-none focus:border-blue-600"
              >
                <option value="">Choose medicine from formulary...</option>
                {availableMedicines.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.genericName}) — {m.category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Starting Quantity</label>
              <input
                type="number"
                value={addQty}
                onChange={(e) => setAddQty(e.target.value)}
                placeholder="Units on hand"
                min="0"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Safety Threshold</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={addThreshold}
                  onChange={(e) => setAddThreshold(e.target.value)}
                  placeholder="Low stock alert at"
                  min="0"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs outline-none focus:border-blue-600"
                />
                <button
                  onClick={handleAdd}
                  disabled={saving}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg text-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Add'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3.5 py-2 shadow-xs">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter inventory by name, generic composition, or category..."
          className="bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none flex-1"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Table Container */}
      {loading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No inventory records matched"
          description={
            search
              ? 'No medicines match your search term.'
              : 'This facility has zero registered medicines in inventory.'
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Medicine Formulation</th>
                  <th className="px-4 py-3">Current Stock</th>
                  <th className="px-4 py-3">Low Threshold</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Sync</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const isEditing = editId === item._id;
                  const currentStatus = getStatus(item);

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-900">{item.medicineId?.name}</p>
                        <p className="text-[11px] text-slate-400">
                          {item.medicineId?.genericName} • {item.medicineId?.category}
                        </p>
                      </td>

                      <td className="px-4 py-3.5">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editQty}
                            onChange={(e) => setEditQty(e.target.value)}
                            min="0"
                            className="w-24 px-2 py-1 border border-blue-500 rounded bg-white text-xs font-semibold outline-none ring-2 ring-blue-100"
                            autoFocus
                          />
                        ) : (
                          <span className="font-bold text-slate-900 text-sm">{item.quantity}</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editThreshold}
                            onChange={(e) => setEditThreshold(e.target.value)}
                            min="0"
                            className="w-20 px-2 py-1 border border-slate-300 rounded bg-white text-xs outline-none"
                          />
                        ) : (
                          <span className="text-slate-500">{item.lowStockThreshold}</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <StatusBadge status={currentStatus} size="sm" />
                      </td>

                      <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                        {timeAgo(item.lastUpdated)}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSave(item._id)}
                              disabled={saving}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded transition-colors disabled:opacity-50"
                            >
                              {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditId(null)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-xs rounded transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(item)}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-colors cursor-pointer"
                          >
                            Update
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden divide-y divide-slate-100">
            {filtered.map((item) => {
              const isEditing = editId === item._id;
              const currentStatus = getStatus(item);

              return (
                <div key={item._id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{item.medicineId?.name}</p>
                      <p className="text-xs text-slate-500">{item.medicineId?.category}</p>
                    </div>
                    <StatusBadge status={currentStatus} size="sm" />
                  </div>

                  {isEditing ? (
                    <div className="bg-slate-50 p-3 rounded-lg space-y-3 border border-slate-200">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] text-slate-500 block mb-1">New Quantity</label>
                          <input
                            type="number"
                            value={editQty}
                            onChange={(e) => setEditQty(e.target.value)}
                            min="0"
                            className="w-full px-2 py-1.5 border border-blue-400 rounded bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-500 block mb-1">Threshold</label>
                          <input
                            type="number"
                            value={editThreshold}
                            onChange={(e) => setEditThreshold(e.target.value)}
                            min="0"
                            className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-xs"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditId(null)}
                          className="px-3 py-1 text-xs text-slate-600 bg-white border border-slate-200 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSave(item._id)}
                          disabled={saving}
                          className="px-3 py-1 text-xs bg-emerald-600 text-white rounded font-medium"
                        >
                          {saving ? 'Saving...' : 'Apply Stock'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-1">
                      <div className="text-xs text-slate-600">
                        Stock: <strong className="text-slate-900">{item.quantity} units</strong> (Threshold: {item.lowStockThreshold})
                      </div>
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded"
                      >
                        Adjust
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
