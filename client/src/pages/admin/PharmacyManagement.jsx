import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, Plus, Edit2, Trash2, X, Save, MapPin, Phone, Clock, Search, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { CardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

export default function PharmacyManagement() {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    district: 'Ernakulam',
    state: 'Kerala',
    latitude: '',
    longitude: '',
    phone: '',
    openingTime: '09:00 AM',
    closingTime: '06:00 PM'
  });

  const fetchPharmacies = async () => {
    try {
      const { data } = await api.get('/pharmacies');
      setPharmacies(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const resetForm = () => {
    setForm({
      name: '',
      address: '',
      city: '',
      district: 'Ernakulam',
      state: 'Kerala',
      latitude: '',
      longitude: '',
      phone: '',
      openingTime: '09:00 AM',
      closingTime: '06:00 PM'
    });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (pharmacy) => {
    setForm({
      name: pharmacy.name,
      address: pharmacy.address,
      city: pharmacy.city,
      district: pharmacy.district,
      state: pharmacy.state || 'Kerala',
      latitude: pharmacy.latitude,
      longitude: pharmacy.longitude,
      phone: pharmacy.phone || '',
      openingTime: pharmacy.openingTime,
      closingTime: pharmacy.closingTime
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
    if (!confirm('Delete this pharmacy? This will also remove all its inventory records.')) return;
    try {
      await api.delete(`/pharmacies/${id}`);
      toast.success('Pharmacy deleted');
      fetchPharmacies();
    } catch (err) {
      toast.error('Failed to delete pharmacy');
    }
  };

  const filtered = search
    ? pharmacies.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.city.toLowerCase().includes(search.toLowerCase()) ||
          p.address.toLowerCase().includes(search.toLowerCase())
      )
    : pharmacies;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
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
              Government Pharmacy Network Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {pharmacies.length} participating public healthcare dispensaries in registry.
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
          <span>Register New Pharmacy</span>
        </button>
      </div>

      {/* Add / Edit Form Modal / Panel */}
      {showForm && (
        <div className="bg-white border border-teal-200 rounded-xl p-6 shadow-xs animate-fade-in space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>{editId ? 'Edit Pharmacy Record' : 'Register New Government Dispensary'}</span>
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
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Facility Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Govt. Pharmacy - Kochi Central"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Street Address *</label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="e.g. MG Road, Near Bus Station"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">City / Town *</label>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="e.g. Kochi"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">District</label>
              <input
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                placeholder="District"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Latitude</label>
              <input
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                placeholder="9.9312"
                type="number"
                step="any"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Longitude</label>
              <input
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                placeholder="76.2673"
                type="number"
                step="any"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Contact Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="0484-2351234"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Opening Time</label>
              <input
                value={form.openingTime}
                onChange={(e) => setForm({ ...form, openingTime: e.target.value })}
                placeholder="09:00 AM"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Closing Time</label>
              <input
                value={form.closingTime}
                onChange={(e) => setForm({ ...form, closingTime: e.target.value })}
                placeholder="06:00 PM"
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
              <span>{saving ? 'Saving...' : editId ? 'Update Pharmacy' : 'Register Pharmacy'}</span>
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

      {/* Search Controls */}
      <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3.5 py-2 shadow-xs">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter pharmacies by name, city, or address..."
          className="bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none flex-1"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Pharmacy Cards Grid */}
      {loading ? (
        <div className="grid gap-3">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No pharmacies found"
          description="No government dispensaries matched your search."
        />
      ) : (
        <div className="grid gap-3.5">
          {filtered.map((pharmacy) => (
            <div
              key={pharmacy._id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900 leading-tight">
                        {pharmacy.name}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.2 rounded-full">
                        <ShieldCheck className="w-3 h-3 text-teal-600" /> Public Facility
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{pharmacy.address}, {pharmacy.city}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{pharmacy.openingTime} – {pharmacy.closingTime}</span>
                      </span>
                      {pharmacy.phone && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{pharmacy.phone}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <Link
                    to={`/pharmacy/${pharmacy._id}`}
                    className="px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                  >
                    Public View
                  </Link>
                  <button
                    onClick={() => handleEdit(pharmacy)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Pharmacy"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(pharmacy._id)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Pharmacy"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
