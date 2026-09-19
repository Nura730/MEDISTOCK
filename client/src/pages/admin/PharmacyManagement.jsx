import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, Plus, Edit2, Trash2, X, Save, MapPin, Phone, Clock } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function PharmacyManagement() {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', address: '', city: '', district: 'Ernakulam', state: 'Kerala',
    latitude: '', longitude: '', phone: '', openingTime: '09:00 AM', closingTime: '06:00 PM'
  });

  const fetchPharmacies = async () => {
    try {
      const { data } = await api.get('/pharmacies');
      setPharmacies(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPharmacies(); }, []);

  const resetForm = () => {
    setForm({ name: '', address: '', city: '', district: 'Ernakulam', state: 'Kerala', latitude: '', longitude: '', phone: '', openingTime: '09:00 AM', closingTime: '06:00 PM' });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (pharmacy) => {
    setForm({
      name: pharmacy.name, address: pharmacy.address, city: pharmacy.city, district: pharmacy.district,
      state: pharmacy.state || 'Kerala', latitude: pharmacy.latitude, longitude: pharmacy.longitude,
      phone: pharmacy.phone || '', openingTime: pharmacy.openingTime, closingTime: pharmacy.closingTime
    });
    setEditId(pharmacy._id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.address || !form.city) {
      toast.error('Name, address, and city are required');
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/pharmacies/${editId}`, form);
        toast.success('Pharmacy updated');
      } else {
        await api.post('/pharmacies', form);
        toast.success('Pharmacy created');
      }
      resetForm();
      fetchPharmacies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save pharmacy');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this pharmacy? This will also remove all its inventory.')) return;
    try {
      await api.delete(`/pharmacies/${id}`);
      toast.success('Pharmacy deleted');
      fetchPharmacies();
    } catch (err) {
      toast.error('Failed to delete pharmacy');
    }
  };

  const filtered = search
    ? pharmacies.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.city.toLowerCase().includes(search.toLowerCase()))
    : pharmacies;

  return (
    <div className="page-enter max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/admin" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Pharmacy Management</h1>
          <p className="text-gray-500 mt-0.5">{pharmacies.length} government pharmacies</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm flex items-center gap-1.5 cursor-pointer">
          <Plus className="w-4 h-4" /> Add Pharmacy
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{editId ? 'Edit Pharmacy' : 'Add New Pharmacy'}</h3>
            <button onClick={resetForm} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Pharmacy Name *" className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500 bg-white" />
            <input value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} placeholder="Address *" className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500 bg-white" />
            <input value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} placeholder="City *" className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500 bg-white" />
            <input value={form.district} onChange={(e) => setForm({...form, district: e.target.value})} placeholder="District" className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500 bg-white" />
            <input value={form.latitude} onChange={(e) => setForm({...form, latitude: e.target.value})} placeholder="Latitude" type="number" step="any" className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500 bg-white" />
            <input value={form.longitude} onChange={(e) => setForm({...form, longitude: e.target.value})} placeholder="Longitude" type="number" step="any" className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500 bg-white" />
            <input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="Phone" className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500 bg-white" />
            <input value={form.openingTime} onChange={(e) => setForm({...form, openingTime: e.target.value})} placeholder="Opening Time" className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500 bg-white" />
            <input value={form.closingTime} onChange={(e) => setForm({...form, closingTime: e.target.value})} placeholder="Closing Time" className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500 bg-white" />
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : editId ? 'Update' : 'Create'}
            </button>
            <button onClick={resetForm} className="px-5 py-2 bg-white border border-gray-300 text-gray-600 font-medium rounded-lg text-sm cursor-pointer">Cancel</button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-2.5 mb-6">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search pharmacies..." className="bg-transparent text-sm outline-none flex-1" />
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>)}</div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(pharmacy => (
            <div key={pharmacy._id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{pharmacy.name}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {pharmacy.address}, {pharmacy.city}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {pharmacy.openingTime} – {pharmacy.closingTime}</span>
                      {pharmacy.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {pharmacy.phone}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleEdit(pharmacy)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(pharmacy._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
