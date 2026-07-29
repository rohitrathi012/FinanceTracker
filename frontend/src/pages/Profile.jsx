import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { User, Mail, Lock, ShieldCheck } from 'lucide-react';

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      return addToast('Passwords do not match', 'error');
    }

    setLoading(true);
    try {
      const updateData = { username, email };
      if (password) updateData.password = password;

      const res = await updateProfile(updateData);
      if (res.success) {
        addToast('Profile updated successfully!', 'success');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">User Profile</h2>
        <p className="text-sm text-slate-400">Update account credentials and profile details.</p>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Badge indicator */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 font-bold uppercase">
              {user?.username.substring(0, 2)}
            </div>
            <div>
              <p className="font-bold text-slate-200">{user?.username}</p>
              <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400 capitalize">
                <ShieldCheck size={14} className="text-emerald-400" />
                {user?.isAdmin ? 'Administrator access' : 'Standard member'}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500"><User size={16} /></span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-slate-200 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500"><Mail size={16} /></span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-slate-200 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">New Password (Optional)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500"><Lock size={16} /></span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-slate-200 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Confirm New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500"><Lock size={16} /></span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-slate-200 outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 hover:opacity-95"
          >
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default Profile;
