import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Pill, Menu, X, Search, LayoutDashboard, Bell, LogOut, User, LogIn, Shield } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'staff': return '/staff';
      default: return '/dashboard';
    }
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setMobileOpen(false)}>
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900 tracking-tight">MediStock</span>
              <span className="hidden sm:inline text-[10px] text-blue-600 font-semibold ml-1.5 bg-blue-50 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Beta</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/search" className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/search') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <span className="flex items-center gap-1.5"><Search className="w-4 h-4" /> Find Medicine</span>
            </Link>

            {isAuthenticated && (
              <Link to={getDashboardLink()} className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(getDashboardLink()) ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <span className="flex items-center gap-1.5"><LayoutDashboard className="w-4 h-4" /> Dashboard</span>
              </Link>
            )}

            {isAuthenticated && user?.role === 'citizen' && (
              <Link to="/alerts" className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/alerts') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <span className="flex items-center gap-1.5"><Bell className="w-4 h-4" /> My Alerts</span>
              </Link>
            )}
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                    {user?.role === 'admin' ? <Shield className="w-3.5 h-3.5 text-blue-600" /> : <User className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-gray-900 leading-tight">{user?.name}</p>
                    <p className="text-gray-500 capitalize">{user?.role}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" aria-label="Logout">
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                <LogIn className="w-4 h-4" /> Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg" aria-label="Toggle menu">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 animate-fade-in">
            <div className="flex flex-col gap-1">
              <Link to="/search" onClick={() => setMobileOpen(false)} className={`px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${isActive('/search') ? 'bg-blue-50 text-blue-700' : 'text-gray-600'}`}>
                <Search className="w-4 h-4" /> Find Medicine
              </Link>

              {isAuthenticated && (
                <Link to={getDashboardLink()} onClick={() => setMobileOpen(false)} className={`px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${isActive(getDashboardLink()) ? 'bg-blue-50 text-blue-700' : 'text-gray-600'}`}>
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
              )}

              {isAuthenticated && user?.role === 'citizen' && (
                <Link to="/alerts" onClick={() => setMobileOpen(false)} className={`px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${isActive('/alerts') ? 'bg-blue-50 text-blue-700' : 'text-gray-600'}`}>
                  <Bell className="w-4 h-4" /> My Alerts
                </Link>
              )}

              <hr className="my-2 border-gray-100" />

              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 text-red-600 hover:bg-red-50">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 text-blue-600">
                  <LogIn className="w-4 h-4" /> Login
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
