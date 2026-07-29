import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      return addToast('Please enter all fields', 'error');
    }

    setLoading(true);
    try {
      await register(username, email, password);
      addToast('Account created successfully!', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      {/* Background radial highlight */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]"></div>

      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-white font-black text-xl shadow-lg shadow-emerald-500/20">
            F
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Create Account</h2>
          <p className="mt-1.5 text-sm text-slate-400">Join FinanceAI and track your wealth today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <User size={18} />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 py-3 pl-11 pr-4 text-sm text-slate-200 outline-none transition-all focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Mail size={18} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 py-3 pl-11 pr-4 text-sm text-slate-200 outline-none transition-all focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 py-3 pl-11 pr-10 text-sm text-slate-200 outline-none transition-all focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:opacity-95 hover:shadow-emerald-500/35 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-emerald-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};
