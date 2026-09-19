import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Pill, Plus, Edit2, Trash2, X, Save, Search } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function MedicineManagement() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', genericName: '', strength: '', category: '', manufacturer: '', description: '' });

  const fetchMedicines = async () => {
    try {
      const { data } = await api.get('/medicines', { params: search ? { search } : {} });
      setMedicines(data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMedicines(); }, [search]);

  const resetForm = () => {
    setForm({ name: '', genericName: '', strength: '', category: '', manufacturer: '', description: '' });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (med) => {
    setForm({ name: med.name, genericName: med.genericName, strength: med.strength || '', category: med.category, manufacturer: med.manufacturer || '', description: med.description || '' });
    setEditId(med._id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.genericName || !form.category) {
      toast.error('Name, generic name, and category are required');
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/medicines/${editId}`, form);
        toast.success('Medicine updated');
      } else {
        await api.post('/medicines', form);
        toast.success('Medicine created');
      }
      resetForm();
      fetchMedicines();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this medicine? Related inventory will also be removed.')) return;
    try {
      await api.delete(`/medicines/${id}`);
      toast.success('Medicine deleted');
      fetchMedicines();
    } catch (err) { toast.error('Failed to delete'); }
  };

  return (
    <div className="page-enter max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/admin" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Medicine Management</h1>
          <p className="text-gray-500 mt-0.5">{medicines.length} medicines in the system</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm flex items-center gap-1.5 cursor-pointer">
          <Plus className="w-4 h-4" /> Add Medicine
        </button>
      </div>

      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{editId ? 'Edit Medicine' : 'Add New Medicine'}</h3>
            <button onClick={resetForm} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Medicine Name *" className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500 bg-white" />
            <input value={form.genericName} onChange={(e) => setForm({...form, genericName: e.target.value})} placeholder="Generic Name *" className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500 bg-white" />
            <input value={form.strength} onChange={(e) => setForm({...form, strength: e.target.value})} placeholder="Strength (e.g., 500mg)" className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500 bg-white" />
            <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500 bg-white">
              <option value="">Category *</option>
              {['Analgesic', 'Antibiotic', 'Antihypertensive', 'Antidiabetic', 'Antihistamine', 'Antacid', 'Respiratory', 'Antiplatelet', 'Rehydration', 'Supplement'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={form.manufacturer} onChange={(e) => setForm({...form, manufacturer: e.target.value})} placeholder="Manufacturer" className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500 bg-white" />
            <input value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Description" className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500 bg-white" />
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : editId ? 'Update' : 'Create'}
            </button>
            <button onClick={resetForm} className="px-5 py-2 bg-white border border-gray-300 text-gray-600 font-medium rounded-lg text-sm cursor-pointer">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-2.5 mb-6">
        <Search className="w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search medicines..." className="bg-transparent text-sm outline-none flex-1" />
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse"></div>)}</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="hidden md:block">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Medicine</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Strength</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Pharmacies</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {medicines.map(med => (
                  <tr key={med._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{med.name}</p>
                      <p className="text-xs text-gray-500">{med.genericName}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{med.strength || '-'}</td>
                    <td className="px-6 py-4"><span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{med.category}</span></td>
                    <td className="px-6 py-4 text-sm">
                      <span className={med.availablePharmacies > 0 ? 'text-emerald-600 font-medium' : 'text-gray-400'}>{med.availablePharmacies || 0} available</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(med)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(med._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden divide-y divide-gray-50">
            {medicines.map(med => (
              <div key={med._id} className="p-5 flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">{med.name}</p>
                  <p className="text-xs text-gray-500">{med.genericName} · {med.category}</p>
                  <p className="text-xs text-gray-400 mt-1">{med.availablePharmacies || 0} pharmacies</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEdit(med)} className="p-2 text-gray-400 hover:text-blue-600 cursor-pointer"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(med._id)} className="p-2 text-gray-400 hover:text-red-600 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
