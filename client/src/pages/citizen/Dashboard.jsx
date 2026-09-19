import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, Building2, Pill, ArrowRight, Clock } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../services/socket';
import { useSocket, getStatusColor, getStatusDot, timeAgo } from '../../hooks/useHelpers';
import toast from 'react-hot-toast';

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
      setAlerts(alertRes.data.data);
      setRecentMedicines(medRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useSocket(socket, user ? `alert:available:${user._id}` : 'noop', (data) => {
    toast.success(`${data.medicineName} is now available at ${data.pharmacyName}!`, { duration: 6000, icon: '🔔' });
    fetchData();
  });

  const pendingAlerts = alerts.filter(a => a.status === 'pending');
  const notifiedAlerts = alerts.filter(a => a.status === 'notified');

  return (
    <div className="page-enter max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h1>
        <p className="text-gray-500 mt-1">Track medicine availability and manage your alerts</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link to="/search" className="bg-blue-600 hover:bg-blue-700 rounded-xl p-5 text-white transition-colors group">
          <Search className="w-6 h-6 mb-3" />
          <h3 className="font-semibold">Find Medicine</h3>
          <p className="text-sm text-blue-200 mt-1">Search availability nearby</p>
        </Link>
        <Link to="/alerts" className="bg-white hover:shadow-md border border-gray-200 rounded-xl p-5 transition-all group">
          <Bell className="w-6 h-6 mb-3 text-amber-500" />
          <h3 className="font-semibold text-gray-900">My Alerts <span className="text-sm font-normal text-gray-500">({pendingAlerts.length} active)</span></h3>
          <p className="text-sm text-gray-500 mt-1">View availability notifications</p>
        </Link>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <Building2 className="w-6 h-6 mb-3 text-emerald-500" />
          <h3 className="font-semibold text-gray-900">10+ Pharmacies</h3>
          <p className="text-sm text-gray-500 mt-1">Connected across Ernakulam</p>
        </div>
      </div>

      {/* Recent Notifications */}
      {notifiedAlerts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Notifications</h2>
          <div className="space-y-3">
            {notifiedAlerts.slice(0, 3).map(alert => (
              <div key={alert._id} className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-emerald-800 font-medium">
                    {alert.medicineId?.name} is now available at {alert.pharmacyId?.name}
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">{alert.notifiedAt ? timeAgo(alert.notifiedAt) : 'Recently'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Browse Medicines */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Browse Medicines</h2>
          <Link to="/search" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentMedicines.map(med => (
              <Link key={med._id} to={`/medicine/${med._id}`} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-blue-200 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-100">
                    <Pill className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{med.name}</p>
                    <p className="text-xs text-gray-500">{med.category}</p>
                  </div>
                </div>
                <p className={`text-sm mt-3 font-medium ${med.availablePharmacies > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {med.availablePharmacies > 0 ? `${med.availablePharmacies} pharmacies` : 'Unavailable'}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
