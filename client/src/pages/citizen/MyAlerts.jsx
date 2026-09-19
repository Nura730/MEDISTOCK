import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, BellOff, Clock, Pill, Building2, Trash2, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../services/socket';
import { useSocket, timeAgo, getStatusColor } from '../../hooks/useHelpers';
import toast from 'react-hot-toast';

export default function MyAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = getSocket();

  const fetchAlerts = async () => {
    try {
      const { data } = await api.get('/alerts');
      setAlerts(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, []);

  useSocket(socket, user ? `alert:available:${user._id}` : 'noop', (data) => {
    toast.success(`${data.medicineName} is now available at ${data.pharmacyName}!`, { duration: 6000, icon: '🔔' });
    fetchAlerts();
  });

  const handleDelete = async (alertId) => {
    try {
      await api.delete(`/alerts/${alertId}`);
      setAlerts(prev => prev.filter(a => a._id !== alertId));
      toast.success('Alert removed');
    } catch (err) {
      toast.error('Failed to remove alert');
    }
  };

  const pendingAlerts = alerts.filter(a => a.status === 'pending');
  const notifiedAlerts = alerts.filter(a => a.status === 'notified');

  return (
    <div className="page-enter max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Availability Alerts</h1>
        <p className="text-gray-500 mt-1">Get notified when out-of-stock medicines become available</p>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>)}</div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <BellOff className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No alerts yet</h3>
          <p className="text-gray-500 mb-6">Search for a medicine and click "Notify Me" on out-of-stock items</p>
          <Link to="/search" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors inline-flex items-center gap-2">
            Find Medicine
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending */}
          {pendingAlerts.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" /> Active Alerts ({pendingAlerts.length})
              </h2>
              <div className="space-y-3">
                {pendingAlerts.map(alert => (
                  <div key={alert._id} className="bg-white rounded-xl border border-amber-200 p-5 flex flex-col sm:flex-row sm:items-center gap-4 animate-fade-in">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Pill className="w-4 h-4 text-blue-600" />
                        <Link to={`/medicine/${alert.medicineId?._id}`} className="font-semibold text-gray-900 hover:text-blue-600">
                          {alert.medicineId?.name || 'Unknown'}
                        </Link>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{alert.pharmacyId?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                        <Clock className="w-3 h-3" /> Created {timeAgo(alert.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-lg border border-amber-200">
                        Waiting
                      </span>
                      <button onClick={() => handleDelete(alert._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" aria-label="Delete alert">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notified */}
          {notifiedAlerts.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Available ({notifiedAlerts.length})
              </h2>
              <div className="space-y-3">
                {notifiedAlerts.map(alert => (
                  <div key={alert._id} className="bg-emerald-50 rounded-xl border border-emerald-200 p-5 flex flex-col sm:flex-row sm:items-center gap-4 animate-fade-in">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Pill className="w-4 h-4 text-emerald-600" />
                        <Link to={`/medicine/${alert.medicineId?._id}`} className="font-semibold text-emerald-800 hover:text-emerald-900">
                          {alert.medicineId?.name || 'Unknown'}
                        </Link>
                      </div>
                      <p className="text-sm text-emerald-700">
                        Now available at {alert.pharmacyId?.name}
                      </p>
                      {alert.notifiedAt && (
                        <p className="text-xs text-emerald-600 mt-1">Available since {timeAgo(alert.notifiedAt)}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/medicine/${alert.medicineId?._id}`} className="px-3.5 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700">
                        View
                      </Link>
                      <button onClick={() => handleDelete(alert._id)} className="p-2 text-emerald-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" aria-label="Remove alert">
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
