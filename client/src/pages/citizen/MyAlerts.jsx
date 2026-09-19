import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, BellOff, Clock, Pill, Building2, Trash2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../services/socket';
import { useSocket, timeAgo } from '../../hooks/useHelpers';
import toast from 'react-hot-toast';
import EmptyState from '../../components/ui/EmptyState';
import { CardSkeleton } from '../../components/ui/Skeleton';

export default function MyAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = getSocket();

  const fetchAlerts = async () => {
    try {
      const { data } = await api.get('/alerts');
      setAlerts(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  useSocket(socket, user ? `alert:available:${user._id}` : 'noop', (data) => {
    toast.success(`${data.medicineName} is now available at ${data.pharmacyName}!`, {
      duration: 6000,
      icon: '🔔'
    });
    fetchAlerts();
  });

  const handleDelete = async (alertId) => {
    try {
      await api.delete(`/alerts/${alertId}`);
      setAlerts((prev) => prev.filter((a) => a._id !== alertId));
      toast.success('Alert removed');
    } catch (err) {
      toast.error('Failed to remove alert');
    }
  };

  const pendingAlerts = alerts.filter((a) => a.status === 'pending');
  const notifiedAlerts = alerts.filter((a) => a.status === 'notified');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          My Medicine Stock Alerts
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Automated notifications sent when out-of-stock medications are replenished by hospital pharmacy staff.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="No active stock alerts"
          description="You haven't requested notifications for any medicines. When an essential drug is out of stock, click 'Notify Me' on the medicine page to monitor it."
          action={
            <Link
              to="/search"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800"
            >
              <span>Explore Medicine Formulary</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          {/* Active / Pending Alerts */}
          {pendingAlerts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-amber-600" />
                  <span>Waiting for Restock ({pendingAlerts.length})</span>
                </h2>
              </div>

              <div className="space-y-2.5">
                {pendingAlerts.map((alert) => (
                  <div
                    key={alert._id}
                    className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Pill className="w-4 h-4 text-teal-600 shrink-0" />
                        <Link
                          to={`/medicine/${alert.medicineId?._id}`}
                          className="font-bold text-sm text-slate-900 hover:text-blue-700 transition-colors"
                        >
                          {alert.medicineId?.name || 'Essential Medicine'}
                        </Link>
                      </div>

                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Target Facility: <strong>{alert.pharmacyId?.name || 'Local Pharmacy'}</strong></span>
                      </p>

                      <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>Alert initiated {timeAgo(alert.createdAt)}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>Monitoring Stock</span>
                      </span>

                      <button
                        onClick={() => handleDelete(alert._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Cancel alert"
                        aria-label="Cancel alert"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fulfilled / Notified Alerts */}
          {notifiedAlerts.length > 0 && (
            <div className="space-y-3 pt-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Replenished & Available Now ({notifiedAlerts.length})</span>
              </h2>

              <div className="space-y-2.5">
                {notifiedAlerts.map((alert) => (
                  <div
                    key={alert._id}
                    className="bg-emerald-50/60 rounded-xl border border-emerald-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Pill className="w-4 h-4 text-emerald-700 shrink-0" />
                        <Link
                          to={`/medicine/${alert.medicineId?._id}`}
                          className="font-bold text-sm text-emerald-950 hover:underline"
                        >
                          {alert.medicineId?.name || 'Medicine'}
                        </Link>
                      </div>

                      <p className="text-xs text-emerald-800">
                        Available at: <strong>{alert.pharmacyId?.name}</strong>
                      </p>

                      <p className="text-[11px] text-emerald-600">
                        Stock update received {alert.notifiedAt ? timeAgo(alert.notifiedAt) : 'recently'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to={`/medicine/${alert.medicineId?._id}`}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs rounded-lg transition-colors"
                      >
                        View Stock
                      </Link>

                      <button
                        onClick={() => handleDelete(alert._id)}
                        className="p-1.5 text-emerald-600 hover:text-rose-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                        title="Dismiss notification"
                        aria-label="Dismiss notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
