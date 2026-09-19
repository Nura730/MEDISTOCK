import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Pill, Eye, EyeOff, LogIn, ShieldCheck, UserCheck, KeyRound, Sparkles } from 'lucide-react';
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
        case 'admin':
          navigate('/admin');
          break;
        case 'staff':
          navigate('/staff');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    switch (role) {
      case 'admin':
        setEmail('admin@medistock.demo');
        setPassword('Admin@123');
        break;
      case 'staff':
        setEmail('staff@medistock.demo');
        setPassword('Staff@123');
        break;
      case 'citizen':
        setEmail('citizen@medistock.demo');
        setPassword('Citizen@123');
        break;
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
        {/* Left Side: Brand & Initiative Notice */}
        <div className="md:col-span-5 bg-slate-900 text-white p-8 sm:p-10 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center">
                <Pill className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight">MediStock</span>
                <p className="text-[10px] text-teal-400 font-semibold uppercase tracking-wider">Public Health Portal</p>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-white leading-snug">
                Authorized Access Portal
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Secure gateway for government pharmacy officers, state healthcare analysts, and verified citizen accounts.
              </p>
            </div>

            <div className="pt-2 space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Role-based access control with real-time stock sync privileges.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <UserCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Immediate inventory audit trails across district dispensaries.</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 text-[11px] text-slate-500">
            Official Demonstration Platform • Ernakulam Pilot
          </div>
        </div>

        {/* Right Side: Authentication Form & 1-Click Demo Buttons */}
        <div className="md:col-span-7 p-8 sm:p-10 space-y-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sign In to MediStock</h1>
            <p className="text-xs text-slate-500 mt-1">Enter your registered email and credentials below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-3 focus:ring-blue-100 outline-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 transition"
                placeholder="officer@medistock.gov.in"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-3 focus:ring-blue-100 outline-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 transition"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-medium text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Authenticate & Continue</span>
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Evaluation / Demo Accounts Box */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Demo Quick-Fill:
              </span>
              <span className="text-[10px] text-slate-400">Click to load role</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { role: 'admin', label: 'State Admin', desc: 'admin@medistock.demo' },
                { role: 'staff', label: 'Pharmacy Staff', desc: 'staff@medistock.demo' },
                { role: 'citizen', label: 'Citizen User', desc: 'citizen@medistock.demo' }
              ].map(({ role, label, desc }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => fillDemo(role)}
                  className="p-2 bg-slate-50 hover:bg-teal-50/60 hover:border-teal-300 border border-slate-200 rounded-lg text-left transition-colors cursor-pointer"
                >
                  <p className="text-xs font-semibold text-slate-900">{label}</p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center pt-2">
            <Link to="/register" className="text-xs text-teal-700 hover:underline font-medium">
              Need a public account? Register as a Citizen →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
