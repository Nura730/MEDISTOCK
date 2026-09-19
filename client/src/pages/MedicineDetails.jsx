import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Pill, MapPin, Clock, Bell, Building2, ArrowLeft, ShieldCheck, Check, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import { useSocket, getApproxStock, timeAgo, calculateDistance, DEFAULT_LOCATION } from '../hooks/useHelpers';
import StatusBadge from '../components/ui/StatusBadge';
import { CardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

export default function MedicineDetails() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [medicine, setMedicine] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertLoading, setAlertLoading] = useState(null);
  const [userAlerts, setUserAlerts] = useState([]);

  const socket = getSocket();

  const fetchData = async () => {
    try {
      const [medRes, availRes] = await Promise.all([
        api.get(`/medicines/${id}`),
        api.get(`/inventory/medicine/${id}`)
      ]);
      setMedicine(medRes.data.data);

      // Add distance and sort: available first, then closest
      const withDistance = (availRes.data.data || []).map((item) => ({
        ...item,
        distance: calculateDistance(
          DEFAULT_LOCATION.lat,
          DEFAULT_LOCATION.lng,
          item.pharmacy.latitude,
          item.pharmacy.longitude
        )
      }));
      withDistance.sort((a, b) => {
        if (a.quantity > 0 && b.quantity === 0) return -1;
        if (a.quantity === 0 && b.quantity > 0) return 1;
        return a.distance - b.distance;
      });
      setAvailability(withDistance);

      // Fetch user alerts if logged in
      if (isAuthenticated) {
        const alertRes = await api.get('/alerts');
        setUserAlerts((alertRes.data.data || []).filter((a) => a.medicineId?._id === id && a.status === 'pending'));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load medicine details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, isAuthenticated]);

  // Real-time stock update
  useSocket(socket, 'inventory:updated', (data) => {
    if (data.medicineId?.toString() === id) {
      fetchData();
    }
  });

  useSocket(socket, 'medicine:availabilityChanged', (data) => {
    if (data.medicineId?.toString() === id) {
      toast.success(`${data.medicineName} is now available at ${data.pharmacyName}!`, {
        duration: 6000,
        icon: '🎉'
      });
      fetchData();
    }
  });

  // User alert notification
  useSocket(socket, user ? `alert:available:${user._id}` : 'noop', (data) => {
    if (data.medicineId?.toString() === id) {
      toast.success(`Good news! ${data.medicineName} is now in stock at ${data.pharmacyName}.`, {
        duration: 8000,
        icon: '🔔'
      });
      fetchData();
    }
  });

  const handleCreateAlert = async (pharmacyId) => {
    if (!isAuthenticated) {
      toast.error('Please login to set availability alerts');
      return;
    }
    setAlertLoading(pharmacyId);
    try {
      await api.post('/alerts', { medicineId: id, pharmacyId, email: user.email });
      toast.success("Availability alert created! You'll be notified when this medicine becomes available.");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create alert');
    } finally {
      setAlertLoading(null);
    }
  };

  const hasAlertFor = (pharmacyId) => userAlerts.some((a) => a.pharmacyId?._id === pharmacyId);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="h-6 w-36 skeleton-shimmer rounded" />
        <CardSkeleton />
        <div className="space-y-4 pt-4">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <EmptyState
          icon={Pill}
          title="Medicine record not found"
          description="The requested medicine could not be retrieved from the central database."
          action={
            <Link
              to="/search"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Medicine Search
            </Link>
          }
        />
      </div>
    );
  }

  const inStockCount = availability.filter((a) => a.quantity > 0).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Navigation */}
      <div>
        <Link
          to="/search"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Search Results
        </Link>
      </div>

      {/* Medicine Overview Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
            <Pill className="w-6 h-6 text-teal-600" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {medicine.category}
              </span>
              {medicine.strength && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-800 border border-teal-200">
                  {medicine.strength}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {medicine.name}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Generic Composition: <span className="font-semibold text-slate-800">{medicine.genericName}</span>
            </p>

            {medicine.description && (
              <p className="text-xs sm:text-sm text-slate-500 mt-3 leading-relaxed border-t border-slate-100 pt-3">
                {medicine.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Government Pharmacy Availability</h2>
          <p className="text-xs text-slate-500">Sorted by live availability and distance from Kochi Central.</p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-700">
          <span>In Stock at {inStockCount} of {availability.length} Pharmacies</span>
        </div>
      </div>

      {/* Availability List */}
      {availability.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No registered pharmacy inventory records"
          description="There are currently no government centres stocking this formulation in the active pilot district."
        />
      ) : (
        <div className="space-y-3.5">
          {availability.map((item) => {
            const hasStock = item.quantity > 0;
            const hasAlert = hasAlertFor(item.pharmacy._id);

            return (
              <div
                key={item._id}
                className={`bg-white rounded-xl border p-5 sm:p-6 transition-all shadow-xs ${
                  hasStock ? 'border-slate-200 hover:border-slate-300' : 'border-slate-200/60 bg-slate-50/40'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                  {/* Pharmacy Information */}
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 leading-tight">
                        {item.pharmacy.name}
                      </h3>
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3 text-teal-600" /> Government
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{item.pharmacy.address}, {item.pharmacy.city}</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                      <span className="font-semibold text-slate-700">
                        {item.distance ? `${item.distance.toFixed(1)} km away` : 'Proximity calculated'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{item.pharmacy.openingTime} – {item.pharmacy.closingTime}</span>
                      </span>
                      {item.pharmacy.phone && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{item.pharmacy.phone}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Stock Status & Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                    <div className="flex flex-col md:items-end">
                      <StatusBadge status={item.status} size="sm" />
                      <span className="text-[11px] text-slate-400 mt-1">
                        {getApproxStock(item.quantity)} • updated {timeAgo(item.lastUpdated)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/pharmacy/${item.pharmacy._id}`}
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Pharmacy Profile
                      </Link>

                      {!hasStock && !hasAlert && (
                        <button
                          onClick={() => handleCreateAlert(item.pharmacy._id)}
                          disabled={alertLoading === item.pharmacy._id}
                          className="px-3 py-1.5 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Bell className="w-3.5 h-3.5" />
                          <span>{alertLoading === item.pharmacy._id ? 'Setting...' : 'Notify When In Stock'}</span>
                        </button>
                      )}

                      {hasAlert && (
                        <span className="px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Alert Set
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
