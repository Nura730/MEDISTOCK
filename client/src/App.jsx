import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public pages
import Landing from './pages/Landing';
import MedicineSearch from './pages/MedicineSearch';
import MedicineDetails from './pages/MedicineDetails';
import PharmacyDetails from './pages/PharmacyDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Citizen pages
import CitizenDashboard from './pages/citizen/Dashboard';
import MyAlerts from './pages/citizen/MyAlerts';

// Staff pages
import StaffDashboard from './pages/staff/Dashboard';
import StaffInventory from './pages/staff/Inventory';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import PharmacyManagement from './pages/admin/PharmacyManagement';
import MedicineManagement from './pages/admin/MedicineManagement';
import ShortageAnalytics from './pages/admin/ShortageAnalytics';

function AppLayout({ children, showFooter = true }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              borderRadius: '8px',
              padding: '10px 14px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px -2px rgba(15, 23, 42, 0.08)'
            },
            success: { iconTheme: { primary: '#0d9488', secondary: '#fff' } },
            error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } }
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/" element={<AppLayout><Landing /></AppLayout>} />
          <Route path="/search" element={<AppLayout><MedicineSearch /></AppLayout>} />
          <Route path="/medicine/:id" element={<AppLayout><MedicineDetails /></AppLayout>} />
          <Route path="/pharmacy/:id" element={<AppLayout><PharmacyDetails /></AppLayout>} />
          <Route path="/login" element={<AppLayout showFooter={false}><Login /></AppLayout>} />
          <Route path="/register" element={<AppLayout showFooter={false}><Register /></AppLayout>} />

          {/* Citizen */}
          <Route path="/dashboard" element={<ProtectedRoute roles={['citizen']}><AppLayout><CitizenDashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute roles={['citizen']}><AppLayout><MyAlerts /></AppLayout></ProtectedRoute>} />

          {/* Staff */}
          <Route path="/staff" element={<ProtectedRoute roles={['staff']}><AppLayout showFooter={false}><StaffDashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/staff/inventory" element={<ProtectedRoute roles={['staff']}><AppLayout showFooter={false}><StaffInventory /></AppLayout></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AppLayout showFooter={false}><AdminDashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/pharmacies" element={<ProtectedRoute roles={['admin']}><AppLayout showFooter={false}><PharmacyManagement /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/medicines" element={<ProtectedRoute roles={['admin']}><AppLayout showFooter={false}><MedicineManagement /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute roles={['admin']}><AppLayout showFooter={false}><ShortageAnalytics /></AppLayout></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<AppLayout><NotFound /></AppLayout>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
