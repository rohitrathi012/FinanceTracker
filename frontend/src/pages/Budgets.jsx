import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { PlusCircle, Wallet, Trash2, AlertCircle } from 'lucide-react';

export const Budgets = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Budget Form
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ category: 'Food', limit: '', month: new Date().toISOString().substring(0, 7) });

  const categories = [
    'Food', 'Transportation', 'Shopping', 'Bills', 'Entertainment',
    'Healthcare', 'Education', 'Travel', 'Investment', 'Other'
  ];

  const formatCurrency = (val) => {
    const symbol = user?.currency === 'USD' ? '$' : user?.currency === 'EUR' ? '€' : '₹';
    return `${symbol}${Number(val).toLocaleString('en-IN')}`;
  };

  const fetchBudgets = async () => {
    try {
      const res = await api.get(`/budgets?month=${form.month}`);
      if (res.success) {
        setBudgets(res.budgets);
      }
    } catch (err) {
      addToast(err.message || 'Error loading budgets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [form.month]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.limit) return addToast('Please specify a limit', 'error');

    try {
      const res = await api.post('/budgets', form);
      if (res.success) {
        addToast('Budget target saved!', 'success');
        setShowAdd(false);
        setForm(prev => ({ ...prev, limit: '' }));
        fetchBudgets();
      }
    } catch (err) {
      addToast(err.message || 'Failed to save budget', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget limit?')) return;
    try {
      const res = await api.delete(`/budgets/${id}`);
      if (res.success) {
        addToast('Budget removed', 'success');
        fetchBudgets();
      }
    } catch (err) {
      addToast(err.message || 'Error deleting budget', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Budgets Management</h2>
          <p className="text-sm text-slate-400">Set and track category expenditure ceilings for the current month.</p>
        </div>
        <div className="flex gap-3">
          <input
            type="month"
            value={form.month}
            onChange={(e) => setForm(prev => ({ ...prev, month: e.target.value }))}
            className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-slate-300 outline-none"
          />
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all"
          >
            <PlusCircle size={16} /> Create Limit
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-emerald-500">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-emerald-500"></div>
        </div>
      ) : budgets.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-800 p-16 text-center">
          <Wallet className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-lg font-semibold text-slate-300">No Budget Caps Set</h3>
          <p className="text-sm text-slate-500 mt-1">Establish monthly category caps to trigger notifications and control spends.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const usagePercent = Math.min(100, Math.round((budget.spent / budget.limit) * 100));

            // Dynamic color selection
            let progressColor = 'bg-emerald-500';
            let textColor = 'text-emerald-400';
            let borderHighlight = 'border-slate-800';

            if (usagePercent >= 100) {
              progressColor = 'bg-rose-500';
              textColor = 'text-rose-400';
              borderHighlight = 'border-rose-500/20';
            } else if (usagePercent >= 80) {
              progressColor = 'bg-amber-500';
              textColor = 'text-amber-400';
              borderHighlight = 'border-amber-500/20';
            }

            return (
              <div
                key={budget._id}
                className={`rounded-3xl border ${borderHighlight} bg-slate-900/50 p-6 shadow-lg backdrop-blur-sm relative overflow-hidden`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-slate-200">{budget.category}</h3>
                  <button
                    onClick={() => handleDelete(budget._id)}
                    className="rounded-lg p-1 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="text-slate-400">Spent:</span>
                    <span className="font-semibold text-slate-200">
                      {formatCurrency(budget.spent)} <span className="text-xs text-slate-500">/ {formatCurrency(budget.limit)}</span>
                    </span>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${progressColor}`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className={textColor}>{usagePercent}% Consumed</span>
                    <span className="text-slate-500">
                      {formatCurrency(Math.max(0, budget.limit - budget.spent))} left
                    </span>
                  </div>

                  {usagePercent >= 80 && (
                    <div className={`mt-4 flex items-center gap-2 rounded-xl p-2.5 text-xs bg-slate-950/40 ${
                      usagePercent >= 100 ? 'text-rose-400 border border-rose-500/10' : 'text-amber-400 border border-amber-500/10'
                    }`}>
                      <AlertCircle size={14} />
                      <span>
                        {usagePercent >= 100 ? 'Exceeded budget target limit!' : 'Approaching budget ceiling!'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Budget Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Create Category Budget</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Monthly Limit (INR)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 5000"
                  value={form.limit}
                  onChange={(e) => setForm(prev => ({ ...prev, limit: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/10 hover:opacity-95"
                >
                  Set Cap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Budgets;
