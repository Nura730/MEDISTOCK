import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Save, X, Package, Pill, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../services/socket';
import { useSocket, getStatusColor, getStatusDot, timeAgo } from '../../hooks/useHelpers';
import toast from 'react-hot-toast';

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
      setInventory(invRes.data.data);
      setMedicines(medRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [pharmacyId]);

  useSocket(socket, 'inventory:updated', (data) => {
    if (data.pharmacyId?.toString() === pharmacyId) fetchData();
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
    if (isNaN(qty) || qty < 0) { toast.error('Invalid quantity'); return; }
    if (isNaN(thresh) || thresh < 0) { toast.error('Invalid threshold'); return; }
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
    if (!addMedId) { toast.error('Select a medicine'); return; }
    const qty = parseInt(addQty);
    const thresh = parseInt(addThreshold);
    if (isNaN(qty) || qty < 0) { toast.error('Invalid quantity'); return; }
    setSaving(true);
    try {
      await api.post('/inventory', { pharmacyId, medicineId: addMedId, quantity: qty, lowStockThreshold: thresh || 10 });
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

  const existingMedIds = inventory.map(i => i.medicineId?._id);
  const availableMedicines = medicines.filter(m => !existingMedIds.includes(m._id));

  const filtered = search
    ? inventory.filter(i => i.medicineId?.name?.toLowerCase().includes(search.toLowerCase()))
    : inventory;

  if (!pharmacyId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No pharmacy assigned</h2>
        <p className="text-gray-500">Your account is not linked to a pharmacy. Contact admin.</p>
      </div>
    );
  }

  return (
    <div className="page-enter max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/staff" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-500 mt-0.5">Update medicine stock quantities</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 text-sm cursor-pointer">
          <Plus className="w-4 h-4" /> Add Medicine
        </button>
      </div>

      {/* Add Medicine Form */}
      {showAdd && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6 animate-fade-in">
          <h3 className="font-semibold text-gray-900 mb-4">Add Medicine to Inventory</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <select value={addMedId} onChange={(e) => setAddMedId(e.target.value)} className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500 bg-white sm:col-span-2">
              <option value="">Select medicine...</option>
              {availableMedicines.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
            <input type="number" value={addQty} onChange={(e) => setAddQty(e.target.value)} placeholder="Quantity" min="0" className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500" />
            <div className="flex gap-2">
              <input type="number" value={addThreshold} onChange={(e) => setAddThreshold(e.target.value)} placeholder="Threshold" min="0" className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500 flex-1" />
              <button onClick={handleAdd} disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-2.5 mb-6">
        <Search className="w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search inventory..." className="bg-transparent text-sm outline-none flex-1" />
        {search && <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-4 h-4" /></button>}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse"></div>)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{search ? 'No medicines match your search' : 'No inventory records yet. Add medicines above.'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Desktop */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Medicine</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Current Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Threshold</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Updated</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(item => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{item.medicineId?.name}</p>
                      <p className="text-xs text-gray-500">{item.medicineId?.genericName} · {item.medicineId?.category}</p>
                    </td>
                    <td className="px-6 py-4">
                      {editId === item._id ? (
                        <input type="number" value={editQty} onChange={(e) => setEditQty(e.target.value)} min="0" className="w-20 px-2 py-1 border border-blue-400 rounded text-sm outline-none" autoFocus />
                      ) : (
                        <span className="text-sm font-semibold text-gray-900">{item.quantity}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editId === item._id ? (
                        <input type="number" value={editThreshold} onChange={(e) => setEditThreshold(e.target.value)} min="0" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm outline-none" />
                      ) : (
                        <span className="text-sm text-gray-500">{item.lowStockThreshold}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusColor(getStatus(item))}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getStatusDot(getStatus(item))}`}></span>
                        {getStatus(item)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{timeAgo(item.lastUpdated)}</td>
                    <td className="px-6 py-4 text-right">
                      {editId === item._id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleSave(item._id)} disabled={saving} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50">
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button onClick={() => setEditId(null)} className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 cursor-pointer">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => handleEdit(item)} className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-100 cursor-pointer">
                          Update Stock
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden divide-y divide-gray-50">
            {filtered.map(item => (
              <div key={item._id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">{item.medicineId?.name}</p>
                    <p className="text-xs text-gray-500">{item.medicineId?.category}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusColor(getStatus(item))}`}>
                    {getStatus(item)}
                  </span>
                </div>

                {editId === item._id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500">Quantity</label>
                        <input type="number" value={editQty} onChange={(e) => setEditQty(e.target.value)} min="0" className="w-full mt-1 px-3 py-2 border border-blue-400 rounded-lg text-sm outline-none" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Threshold</label>
                        <input type="number" value={editThreshold} onChange={(e) => setEditThreshold(e.target.value)} min="0" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleSave(item._id)} disabled={saving} className="flex-1 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg cursor-pointer disabled:opacity-50">
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button onClick={() => setEditId(null)} className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg cursor-pointer">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Stock: <strong className="text-gray-900">{item.quantity}</strong> · Threshold: {item.lowStockThreshold} · {timeAgo(item.lastUpdated)}
                    </div>
                    <button onClick={() => handleEdit(item)} className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg cursor-pointer shrink-0 ml-3">
                      Update
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
