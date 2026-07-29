import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useToast } from '../components/Toast';
import { ShieldAlert, Users, Database, Shield, Lock, Unlock } from 'lucide-react';

export const Admin = () => {
  const { addToast } = useToast();

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.get('/admin/stats');
      const usersRes = await api.get('/admin/users');

      if (statsRes.success) setStats(statsRes.stats);
      if (usersRes.success) setUsers(usersRes.users);
    } catch (err) {
      addToast(err.message || 'Error loading administrator panel', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleAdmin = async (id) => {
    try {
      const res = await api.put(`/admin/users/${id}/toggle-admin`);
      if (res.success) {
        addToast(res.message, 'success');
        loadAdminData();
      }
    } catch (err) {
      addToast(err.message || 'Action failed', 'error');
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'blocked' : 'active';
    if (!window.confirm(`Are you sure you want to ${nextStatus === 'blocked' ? 'Block' : 'Unblock'} this user?`)) return;

    try {
      const res = await api.put(`/admin/users/${id}/status`, { status: nextStatus });
      if (res.success) {
        addToast(res.message, 'success');
        loadAdminData();
      }
    } catch (err) {
      addToast(err.message || 'Action failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-emerald-500">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-800 border-t-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <ShieldAlert size={28} className="text-rose-400" /> Admin Dashboard
        </h2>
        <p className="text-sm text-slate-400">Manage user accounts and view system usage statistics.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Registered Users</p>
            <h3 className="mt-1 text-2xl font-bold text-slate-200">{stats?.totalUsers}</h3>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
            <Database size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Transactions</p>
            <h3 className="mt-1 text-2xl font-bold text-slate-200">{stats?.totalTransactions}</h3>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
            <Shield size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aggregate Volumes</p>
            <h3 className="mt-1 text-2xl font-bold text-slate-200">
              ₹{Number(stats?.totalVolume || 0).toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
        <h3 className="text-lg font-bold text-slate-200 p-6 border-b border-slate-800">User Account Controls</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-950/20">
                <th className="p-4">Username</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Toggle Admin</th>
                <th className="p-4 text-center">Ban/Unban</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-sm">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="p-4 font-semibold text-slate-200">{u.username}</td>
                  <td className="p-4 text-slate-400">{u.email}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      u.isAdmin ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {u.isAdmin ? 'Admin' : 'Member'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleToggleAdmin(u._id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-emerald-400"
                      title="Toggle Admin Privilege"
                    >
                      <Shield size={16} />
                    </button>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleStatusChange(u._id, u.status)}
                      className={`rounded-lg p-2 ${
                        u.status === 'active' ? 'text-rose-400 hover:bg-rose-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                      title={u.status === 'active' ? 'Block user' : 'Unblock user'}
                    >
                      {u.status === 'active' ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Admin;
