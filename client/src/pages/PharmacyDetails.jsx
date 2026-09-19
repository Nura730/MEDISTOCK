import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, MapPin, Phone, Clock, ArrowLeft, Pill, ShieldCheck, Search } from 'lucide-react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { useSocket, timeAgo, getApproxStock } from '../hooks/useHelpers';
import StatusBadge from '../components/ui/StatusBadge';
import { CardSkeleton, TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

export default function PharmacyDetails() {
  const { id } = useParams();
  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const socket = getSocket();

  const fetchData = async () => {
    try {
      const { data } = await api.get(`/pharmacies/${id}`);
      setPharmacy(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useSocket(socket, 'inventory:updated', (data) => {
    if (data.pharmacyId?.toString() === id) {
      fetchData();
    }
  });

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="h-6 w-36 skeleton-shimmer rounded" />
        <CardSkeleton />
        <TableSkeleton rows={6} cols={4} />
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <EmptyState
          icon={Building2}
          title="Pharmacy not found"
          description="We couldn't retrieve the facility profile for this location."
          action={
            <Link
              to="/search"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Search
            </Link>
          }
        />
      </div>
    );
  }

  const inventoryList = pharmacy.inventory || [];
  const inStock = inventoryList.filter((i) => i.status === 'In Stock');
  const lowStock = inventoryList.filter((i) => i.status === 'Low Stock');
  const outOfStock = inventoryList.filter((i) => i.status === 'Out of Stock');

  const filteredInventory = inventoryList.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.medicineId?.name?.toLowerCase().includes(q) ||
      item.medicineId?.genericName?.toLowerCase().includes(q) ||
      item.medicineId?.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back link */}
      <div>
        <Link
          to="/search"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Medicine Discovery
        </Link>
      </div>

      {/* Facility Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-teal-400 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                  {pharmacy.name}
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-teal-600" /> Government Facility
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{pharmacy.address}, {pharmacy.city}, {pharmacy.district}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Hours: <strong className="text-slate-800 font-semibold">{pharmacy.openingTime} – {pharmacy.closingTime}</strong></span>
          </div>
          {pharmacy.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>Contact: <strong className="text-slate-800 font-semibold">{pharmacy.phone}</strong></span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-slate-400" />
            <span>Formulations Tracked: <strong className="text-slate-800 font-semibold">{inventoryList.length} items</strong></span>
          </div>
        </div>
      </div>

      {/* Inventory Health Strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-emerald-200/80 rounded-xl p-4 shadow-2xs">
          <p className="text-xs font-semibold text-emerald-800">In Stock</p>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{inStock.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Available for dispensing</p>
        </div>
        <div className="bg-white border border-amber-200/80 rounded-xl p-4 shadow-2xs">
          <p className="text-xs font-semibold text-amber-800">Low Stock</p>
          <p className="text-2xl font-extrabold text-amber-700 mt-1">{lowStock.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Near critical threshold</p>
        </div>
        <div className="bg-white border border-rose-200/80 rounded-xl p-4 shadow-2xs">
          <p className="text-xs font-semibold text-rose-800">Out of Stock</p>
          <p className="text-2xl font-extrabold text-rose-700 mt-1">{outOfStock.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Pending replenishment</p>
        </div>
      </div>

      {/* Inventory Filter & Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Current Medicine Stock Listing</h2>
            <p className="text-xs text-slate-500">Live dispensary inventory updated via hospital stock system.</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter facility stock..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {filteredInventory.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-xs text-slate-500">No medicines match your filter for this pharmacy.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Medicine</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Availability</th>
                  <th className="px-4 py-3">Approx. Level</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInventory.map((item) => (
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
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-medium">
                      {getApproxStock(item.quantity)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/medicine/${item.medicineId?._id}`}
                        className="text-xs font-semibold text-teal-700 hover:underline"
                      >
                        View Details
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
