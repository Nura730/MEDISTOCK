import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Pill, Plus, Edit2, Trash2, X, Save, Search } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { TableSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

const CATEGORIES = [
  'Analgesic',
  'Antibiotic',
  'Antihypertensive',
  'Antidiabetic',
  'Antihistamine',
  'Antacid',
  'Respiratory',
  'Antiplatelet',
  'Rehydration',
  'Supplement'
];

export default function MedicineManagement() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    genericName: '',
    strength: '',
    category: '',
    manufacturer: '',
    description: ''
  });

  const fetchMedicines = async () => {
    try {
      const { data } = await api.get('/medicines', { params: search ? { search } : {} });
      setMedicines(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [search]);

  const resetForm = () => {
    setForm({
      name: '',
      genericName: '',
      strength: '',
      category: '',
      manufacturer: '',
      description: ''
    });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (med) => {
    setForm({
      name: med.name,
      genericName: med.genericName,
      strength: med.strength || '',
      category: med.category,
      manufacturer: med.manufacturer || '',
      description: med.description || ''
    });
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
        toast.success('Medicine registered');
      }
      resetForm();
      fetchMedicines();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this medicine formulation? Related pharmacy inventory records will also be removed.')) return;
    try {
      await api.delete(`/medicines/${id}`);
      toast.success('Medicine deleted');
      fetchMedicines();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              State Essential Drugs Formulary
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {medicines.length} formulations registered in the government procurement catalog.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register Formulation</span>
        </button>
      </div>

      {/* Form Panel */}
      {showForm && (
        <div className="bg-white border border-teal-200 rounded-xl p-6 shadow-xs animate-fade-in space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Pill className="w-4 h-4 text-teal-600" />
              <span>{editId ? 'Modify Formulation Entry' : 'Register New Medicine Formulation'}</span>
            </h3>
            <button
              onClick={resetForm}
              className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Brand / Trade Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Paracetamol 500mg"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Generic Formula *</label>
              <input
                value={form.genericName}
                onChange={(e) => setForm({ ...form, genericName: e.target.value })}
                placeholder="e.g. Paracetamol"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Strength / Dosage</label>
              <input
                value={form.strength}
                onChange={(e) => setForm({ ...form, strength: e.target.value })}
                placeholder="e.g. 500mg, 10ml, 40IU"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Therapeutic Class *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white outline-none focus:border-blue-600"
              >
                <option value="">Select therapeutic class...</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Manufacturer / Batch Source</label>
              <input
                value={form.manufacturer}
                onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                placeholder="e.g. Jan Aushadhi / Kerala State Drugs"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Clinical Description</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Primary indication or dosage note"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : editId ? 'Update Formulation' : 'Register Formulation'}</span>
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-lg text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3.5 py-2 shadow-xs">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter formulary by medicine name or generic formula..."
          className="bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none flex-1"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Medicines Table */}
      {loading ? (
        <TableSkeleton rows={8} cols={5} />
      ) : medicines.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="No formulations registered"
          description={search ? 'No medicines match your query.' : 'The formulary catalog is currently empty.'}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Medicine Formulation</th>
                  <th className="px-4 py-3">Generic Composition</th>
                  <th className="px-4 py-3">Strength</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Manufacturer</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {medicines.map((med) => (
                  <tr key={med._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      {med.name}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {med.genericName}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {med.strength || 'Standard'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {med.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                      {med.manufacturer || 'Government Supply'}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/medicine/${med._id}`}
                          className="px-2 py-1 text-xs text-teal-700 hover:underline font-semibold"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleEdit(med)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded cursor-pointer"
                          title="Edit Formulation"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(med._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                          title="Delete Formulation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
