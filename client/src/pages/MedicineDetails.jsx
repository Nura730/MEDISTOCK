import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Pill, MapPin, Clock, Bell, CheckCircle, AlertTriangle, XCircle, Building2, ExternalLink, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import { useSocket, getStatusColor, getStatusDot, getApproxStock, timeAgo, calculateDistance, DEFAULT_LOCATION } from '../hooks/useHelpers';

function StatusIcon({ status }) {
  if (status === 'In Stock') return <CheckCircle className="w-4 h-4 text-emerald-600" />;
  if (status === 'Low Stock') return <AlertTriangle className="w-4 h-4 text-amber-600" />;
  return <XCircle className="w-4 h-4 text-red-600" />;
}

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

      // Add distance and sort
      const withDistance = availRes.data.data.map(item => ({
        ...item,
        distance: calculateDistance(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng, item.pharmacy.latitude, item.pharmacy.longitude)
      }));
      withDistance.sort((a, b) => {
        if (a.quantity > 0 && b.quantity === 0) return -1;
        if (a.quantity === 0 && b.quantity > 0) return 1;
        return a.distance - b.distance;
      });
      setAvailability(withDistance);

      // Fetch user alerts
      if (isAuthenticated) {
        const alertRes = await api.get('/alerts');
        setUserAlerts(alertRes.data.data.filter(a => a.medicineId?._id === id && a.status === 'pending'));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load medicine details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id, isAuthenticated]);

  // Real-time updates
  useSocket(socket, 'inventory:updated', (data) => {
    if (data.medicineId?.toString() === id) {
      fetchData();
    }
  });

  useSocket(socket, 'medicine:availabilityChanged', (data) => {
    if (data.medicineId?.toString() === id) {
      toast.success(`${data.medicineName} is now available at ${data.pharmacyName}!`, { duration: 6000, icon: '🎉' });
      fetchData();
    }
  });

  // Listen for user-specific alert notifications
  useSocket(socket, user ? `alert:available:${user._id}` : 'noop', (data) => {
    if (data.medicineId?.toString() === id) {
      toast.success(`Good news! ${data.medicineName} is now available at ${data.pharmacyName}.`, { duration: 8000, icon: '🔔' });
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
      toast.success('Availability alert created! You\'ll be notified when this medicine becomes available.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create alert');
    } finally {
      setAlertLoading(null);
    }
  };

  const hasAlertFor = (pharmacyId) => userAlerts.some(a => a.pharmacyId?._id === pharmacyId);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-100 rounded w-48 mb-4"></div>
          <div className="h-8 bg-gray-100 rounded w-72 mb-2"></div>
          <div className="h-5 bg-gray-100 rounded w-56 mb-8"></div>
          <div className="grid gap-4">{[1,2,3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-xl"></div>)}</div>
        </div>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Pill className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Medicine not found</h2>
        <Link to="/search" className="text-blue-600 hover:text-blue-700 font-medium">← Back to search</Link>
      </div>
    );
  }

  const inStockCount = availability.filter(a => a.quantity > 0).length;

  return (
    <div className="page-enter max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link to="/search" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to search
      </Link>

      {/* Medicine Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
            <Pill className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{medicine.name}</h1>
            <p className="text-gray-500 mt-1">Generic: {medicine.genericName}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{medicine.category}</span>
              {medicine.strength && <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{medicine.strength}</span>}
            </div>
            {medicine.description && <p className="text-sm text-gray-500 mt-3">{medicine.description}</p>}
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Pharmacy Availability
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({inStockCount} of {availability.length} pharmacies)
          </span>
        </h2>
      </div>

      {availability.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No pharmacies currently carry this medicine</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {availability.map((item, idx) => (
            <div
              key={item._id}
              className={`bg-white rounded-xl border p-5 sm:p-6 transition-all hover:shadow-md animate-fade-in ${
                item.quantity > 0 ? 'border-gray-200' : 'border-gray-100 opacity-80'
              }`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900">{item.pharmacy.name}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{item.pharmacy.address}</p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {item.distance.toFixed(1)} km
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {item.pharmacy.openingTime} – {item.pharmacy.closingTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex flex-col items-start sm:items-end gap-3 sm:min-w-[180px]">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${getStatusColor(item.status)}`}>
                    <StatusIcon status={item.status} />
                    <span>{item.status}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">{getApproxStock(item.quantity)}</span>
                    <span className="mx-1.5">·</span>
                    <span>{timeAgo(item.lastUpdated)}</span>
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/pharmacy/${item.pharmacy._id}`} className="px-3.5 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                      View Pharmacy
                    </Link>
                    {item.quantity === 0 && !hasAlertFor(item.pharmacy._id) && (
                      <button
                        onClick={() => handleCreateAlert(item.pharmacy._id)}
                        disabled={alertLoading === item.pharmacy._id}
                        className="px-3.5 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        {alertLoading === item.pharmacy._id ? 'Setting...' : 'Notify Me'}
                      </button>
                    )}
                    {hasAlertFor(item.pharmacy._id) && (
                      <span className="px-3.5 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5" /> Alert Active
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
