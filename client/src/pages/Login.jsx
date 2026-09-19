import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Pill, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      switch (user.role) {
        case 'admin': navigate('/admin'); break;
        case 'staff': navigate('/staff'); break;
        default: navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    switch (role) {
      case 'admin': setEmail('admin@medistock.demo'); setPassword('Admin@123'); break;
      case 'staff': setEmail('staff@medistock.demo'); setPassword('Staff@123'); break;
      case 'citizen': setEmail('citizen@medistock.demo'); setPassword('Citizen@123'); break;
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Pill className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to MediStock</h1>
          <p className="text-gray-500 mt-2">Sign in to access your dashboard</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition text-sm"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-11 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition text-sm"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <><LogIn className="w-4 h-4" /> Sign In</>
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link to="/register" className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
              <UserPlus className="w-3.5 h-3.5" /> Create a citizen account
            </Link>
          </div>
        </div>

        {/* Demo Accounts */}
        <div className="mt-6 bg-blue-50 rounded-xl border border-blue-100 p-5">
          <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-1.5">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Demo Accounts
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { role: 'admin', label: 'Admin', email: 'admin@medistock.demo' },
              { role: 'staff', label: 'Staff', email: 'staff@medistock.demo' },
              { role: 'citizen', label: 'Citizen', email: 'citizen@medistock.demo' }
            ].map(({ role, label, email: demoEmail }) => (
              <button
                key={role}
                onClick={() => fillDemo(role)}
                className="px-3 py-2.5 bg-white rounded-lg border border-blue-200 hover:border-blue-400 text-center transition-colors cursor-pointer"
              >
                <p className="text-xs font-semibold text-gray-900">{label}</p>
                <p className="text-[10px] text-gray-500 mt-0.5 truncate">{demoEmail}</p>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-blue-700 mt-3 text-center">Click a role above to auto-fill credentials, then click Sign In</p>
        </div>
      </div>
    </div>
  );
}
