import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, Building2, Pill, ArrowRight, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../services/socket';
import { useSocket, timeAgo } from '../../hooks/useHelpers';
import toast from 'react-hot-toast';
import { CardSkeleton } from '../../components/ui/Skeleton';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [recentMedicines, setRecentMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = getSocket();

  const fetchData = async () => {
    try {
      const [alertRes, medRes] = await Promise.all([
        api.get('/alerts'),
        api.get('/medicines?limit=6')
      ]);
      setAlerts(alertRes.data.data || []);
      setRecentMedicines(medRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useSocket(socket, user ? `alert:available:${user._id}` : 'noop', (data) => {
    toast.success(`${data.medicineName} is now in stock at ${data.pharmacyName}!`, {
      duration: 6000,
      icon: '🔔'
    });
    fetchData();
  });

  const pendingAlerts = alerts.filter((a) => a.status === 'pending');
  const notifiedAlerts = alerts.filter((a) => a.status === 'notified');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Welcome back, {user?.name}
            </h1>
            <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
              Citizen Portal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track medicine availability and monitor your active shortage alerts.
          </p>
        </div>
        <Link
          to="/search"
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors inline-flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search Medicines</span>
        </Link>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/search"
          className="bg-white border border-slate-200 hover:border-slate-300 p-5 rounded-xl shadow-xs transition-all group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 group-hover:bg-teal-100 transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                Find Medicines
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Check live inventory across nearby government dispensaries.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-teal-700 flex items-center gap-1 mt-4">
            Search catalog <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          to="/alerts"
          className="bg-white border border-slate-200 hover:border-slate-300 p-5 rounded-xl shadow-xs transition-all group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 group-hover:bg-amber-100 transition-colors">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                  My Stock Alerts
                </h3>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  {pendingAlerts.length} Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated alerts when out-of-stock drugs are replenished.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-800 flex items-center gap-1 mt-4">
            Manage alerts <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">10 Government Centers</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Connected via real-time WebSocket inventory synchronization.
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400 mt-4 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Ernakulam District Pilot
          </span>
        </div>
      </div>

      {/* Notifications Feed */}
      {notifiedAlerts.length > 0 && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Recent Arrival Notifications</span>
          </div>
          <div className="space-y-2">
            {notifiedAlerts.slice(0, 3).map((alert) => (
              <div
                key={alert._id}
                className="bg-white rounded-lg p-3.5 border border-emerald-100 flex items-center justify-between gap-3 text-xs shadow-2xs"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {alert.medicineId?.name} is now available at {alert.pharmacyId?.name}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Notified {alert.notifiedAt ? timeAgo(alert.notifiedAt) : 'Recently'}
                  </p>
                </div>
                <Link
                  to={`/medicine/${alert.medicineId?._id}`}
                  className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-semibold rounded hover:bg-emerald-100 transition-colors shrink-0"
                >
                  View Stock
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Browse Popular Catalog Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Essential Formulary Medicines</h2>
            <p className="text-xs text-slate-500">Frequently monitored government medications.</p>
          </div>
          <Link
            to="/search"
            className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentMedicines.map((med) => (
              <Link
                key={med._id}
                to={`/medicine/${med._id}`}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-xs transition-all group flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 group-hover:bg-teal-100 transition-colors">
                  <Pill className="w-4 h-4 text-teal-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                    {med.name}
                  </p>
                  <p className="text-[11px] text-slate-500">{med.category}</p>
                  <p
                    className={`text-xs mt-2 font-semibold ${
                      med.availablePharmacies > 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {med.availablePharmacies > 0
                      ? `In stock at ${med.availablePharmacies} ${
                          med.availablePharmacies === 1 ? 'pharmacy' : 'pharmacies'
                        }`
                      : 'Out of Stock'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
