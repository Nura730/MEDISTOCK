import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, MapPin, Phone, Clock, ArrowLeft, CheckCircle, AlertTriangle, XCircle, Pill, Shield } from 'lucide-react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { useSocket, getStatusColor, getStatusDot, timeAgo } from '../hooks/useHelpers';

export default function PharmacyDetails() {
  const { id } = useParams();
  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => { fetchData(); }, [id]);

  useSocket(socket, 'inventory:updated', (data) => {
    if (data.pharmacyId?.toString() === id) fetchData();
  });

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="h-6 bg-gray-100 rounded w-32 mb-6"></div>
        <div className="h-8 bg-gray-100 rounded w-64 mb-4"></div>
        <div className="h-48 bg-gray-100 rounded-xl mb-6"></div>
        <div className="h-64 bg-gray-100 rounded-xl"></div>
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Pharmacy not found</h2>
        <Link to="/search" className="text-blue-600 hover:text-blue-700 font-medium">← Back to search</Link>
      </div>
    );
  }

  const inStock = pharmacy.inventory?.filter(i => i.status === 'In Stock') || [];
  const lowStock = pharmacy.inventory?.filter(i => i.status === 'Low Stock') || [];
  const outOfStock = pharmacy.inventory?.filter(i => i.status === 'Out of Stock') || [];

  return (
    <div className="page-enter max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/search" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to search
      </Link>

      {/* Pharmacy Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
            <Building2 className="w-7 h-7 text-blue-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{pharmacy.name}</h1>
            <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
              <Shield className="w-3.5 h-3.5" /> Government Pharmacy
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <span>{pharmacy.address}, {pharmacy.city}, {pharmacy.district}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{pharmacy.openingTime} – {pharmacy.closingTime}</span>
              </div>
              {pharmacy.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{pharmacy.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'In Stock', count: inStock.length, color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: CheckCircle },
          { label: 'Low Stock', count: lowStock.length, color: 'text-amber-700 bg-amber-50 border-amber-200', icon: AlertTriangle },
          { label: 'Out of Stock', count: outOfStock.length, color: 'text-red-700 bg-red-50 border-red-200', icon: XCircle }
        ].map(({ label, count, color, icon: Icon }) => (
          <div key={label} className={`rounded-xl border p-4 text-center ${color}`}>
            <Icon className="w-5 h-5 mx-auto mb-1" />
            <p className="text-2xl font-bold">{count}</p>
            <p className="text-xs font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Medicine Availability Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Medicine Availability</h2>
          <p className="text-sm text-gray-500">{pharmacy.inventory?.length || 0} medicines tracked</p>
        </div>

        {!pharmacy.inventory || pharmacy.inventory.length === 0 ? (
          <div className="p-10 text-center">
            <Pill className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No inventory data available</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {pharmacy.inventory.map((item) => (
              <div key={item._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${getStatusDot(item.status)}`}></div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {item.medicine?.name || 'Unknown Medicine'}
                    </p>
                    <p className="text-xs text-gray-500">{item.medicine?.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                  <span className="text-xs text-gray-400 hidden sm:inline">{timeAgo(item.lastUpdated)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
