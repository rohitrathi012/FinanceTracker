import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { PlusCircle, Target, Trash2, Calendar, TrendingUp } from 'lucide-react';

export const Savings = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal control & Form state
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', targetAmount: '', currentAmount: '', targetDate: '' });
  const [depositGoalId, setDepositGoalId] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');

  const formatCurrency = (val) => {
    const symbol = user?.currency === 'USD' ? '$' : user?.currency === 'EUR' ? '€' : '₹';
    return `${symbol}${Number(val).toLocaleString('en-IN')}`;
  };

  const fetchGoals = async () => {
    try {
      const res = await api.get('/savings');
      if (res.success) {
        setGoals(res.goals);
      }
    } catch (err) {
      addToast(err.message || 'Error loading goals', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.targetAmount || !form.targetDate) {
      return addToast('Please enter name, target amount, and target date', 'error');
    }

    try {
      const res = await api.post('/savings', form);
      if (res.success) {
        addToast('Savings goal established successfully!', 'success');
        setShowAdd(false);
        setForm({ name: '', targetAmount: '', currentAmount: '', targetDate: '' });
        fetchGoals();
      }
    } catch (err) {
      addToast(err.message || 'Failed to create goal', 'error');
    }
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    if (!depositAmount) return addToast('Please enter deposit amount', 'error');

    try {
      const goalToUpdate = goals.find(g => g._id === depositGoalId);
      const nextAmount = parseFloat(goalToUpdate.currentAmount) + parseFloat(depositAmount);

      const res = await api.put(`/savings/${depositGoalId}`, { currentAmount: nextAmount });
      if (res.success) {
        addToast('Deposit added to savings goal!', 'success');
        setDepositGoalId(null);
        setDepositAmount('');
        fetchGoals();
      }
    } catch (err) {
      addToast(err.message || 'Deposit failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this savings goal?')) return;
    try {
      const res = await api.delete(`/savings/${id}`);
      if (res.success) {
        addToast('Goal removed', 'success');
        fetchGoals();
      }
    } catch (err) {
      addToast(err.message || 'Error deleting goal', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Savings Goals</h2>
          <p className="text-sm text-slate-400">Establish target metrics for long-term investments or asset acquisitions.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all"
        >
          <PlusCircle size={16} /> New Savings Goal
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-emerald-500">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-emerald-500"></div>
        </div>
      ) : goals.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-800 p-16 text-center">
          <Target className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-lg font-semibold text-slate-300">No Savings Goals</h3>
          <p className="text-sm text-slate-500 mt-1">Set a saving goal to automatically project completion dates and track percentages.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <div key={goal._id} className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Target size={18} />
                  </div>
                  <h3 className="font-bold text-slate-200">{goal.name}</h3>
                </div>
                <button
                  onClick={() => handleDelete(goal._id)}
                  className="rounded-lg p-1 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-slate-400">Saved:</span>
                  <span className="font-semibold text-slate-200">
                    {formatCurrency(goal.currentAmount)} <span className="text-xs text-slate-500">/ {formatCurrency(goal.targetAmount)}</span>
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${goal.progressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
                  <span>{goal.progressPercent}% Completed</span>
                  <span className="text-slate-500">Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                </div>

                {/* Completion projection */}
                <div className="rounded-2xl border border-slate-800/40 bg-slate-950/40 p-3 flex items-center justify-between text-xs">
                  <div className="text-slate-400 flex items-center gap-1.5"><Calendar size={14} /> Est. Completion:</div>
                  <div className="font-bold text-slate-200">{goal.estimatedCompletionDate}</div>
                </div>

                <button
                  onClick={() => setDepositGoalId(goal._id)}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-950 border border-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  <TrendingUp size={14} /> Quick Deposit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add savings goal modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">New Savings Target</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electric Vehicle"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Target Amount (INR)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 50000"
                  value={form.targetAmount}
                  onChange={(e) => setForm(prev => ({ ...prev, targetAmount: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Initial Savings (Optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 2000"
                  value={form.currentAmount}
                  onChange={(e) => setForm(prev => ({ ...prev, currentAmount: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Target Date</label>
                <input
                  type="date"
                  required
                  value={form.targetDate}
                  onChange={(e) => setForm(prev => ({ ...prev, targetDate: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-400 outline-none focus:border-emerald-500"
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
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Deposit Modal */}
      {depositGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xs rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">Add Deposit</h3>
            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Deposit Amount</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 5000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-200 outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setDepositGoalId(null)}
                  className="rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600"
                >
                  Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Savings;
