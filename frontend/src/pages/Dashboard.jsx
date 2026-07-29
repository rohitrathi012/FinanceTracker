import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  DollarSign,
  PlusCircle,
  ArrowRightLeft,
  Calendar,
  Tag,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

export const Dashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [stats, setStats] = useState({ totalBalance: 0, totalIncome: 0, totalExpenses: 0, totalSavings: 0 });
  const [recentTx, setRecentTx] = useState([]);
  const [chartsData, setChartsData] = useState({ pie: [], bar: [], line: [] });
  const [loading, setLoading] = useState(true);

  // Modals status
  const [showAddTx, setShowAddTx] = useState(false);
  const [txType, setTxType] = useState('expense');
  const [txForm, setTxForm] = useState({ amount: '', category: 'Food', description: '', date: '' });
  const [uploadingReceipt, setUploadingReceipt] = useState(null);
  const [isCategorizing, setIsCategorizing] = useState(false);

  const categories = [
    'Food', 'Transportation', 'Shopping', 'Bills', 'Entertainment',
    'Healthcare', 'Education', 'Travel', 'Salary', 'Investment', 'Other'
  ];

  // Helper to format currency
  const formatCurrency = (val) => {
    const symbol = user?.currency === 'USD' ? '$' : user?.currency === 'EUR' ? '€' : '₹';
    return `${symbol}${Number(val).toLocaleString('en-IN')}`;
  };

  const loadDashboardData = async () => {
    try {
      const statsRes = await api.get('/transactions/dashboard-stats');
      const txRes = await api.get('/transactions?limit=5');
      const allTxRes = await api.get('/transactions?limit=1000'); // for chart computations

      if (statsRes.success) setStats(statsRes.stats);
      if (txRes.success) setRecentTx(txRes.transactions);

      // Process charts data
      if (allTxRes.success) {
        processCharts(allTxRes.transactions);
      }
    } catch (err) {
      addToast(err.message || 'Error loading dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const processCharts = (txList) => {
    // 1. Pie Chart: Expenses by Category
    const categoryTotals = {};
    txList.filter(t => t.type === 'expense').forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    const pieData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));

    // 2. Bar Chart: Monthly Income vs Expenses
    const monthlyData = {};
    txList.forEach(t => {
      const month = t.date.substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { name: month, Income: 0, Expense: 0 };
      }
      if (t.type === 'income') monthlyData[month].Income += t.amount;
      else monthlyData[month].Expense += t.amount;
    });
    const barData = Object.values(monthlyData).sort((a, b) => a.name.localeCompare(b.name)).slice(-6);

    // 3. Line Chart: Spend trend over time
    const lineData = txList
      .filter(t => t.type === 'expense')
      .slice(0, 10)
      .reverse()
      .map(t => ({
        date: new Date(t.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        Amount: t.amount
      }));

    setChartsData({ pie: pieData, bar: barData, line: lineData });
  };

  const handleDescChange = async (desc) => {
    setTxForm(prev => ({ ...prev, description: desc }));
    if (desc.length > 5 && txType === 'expense') {
      setIsCategorizing(true);
      try {
        const res = await api.post('/ai/categorize', { description: desc });
        if (res.success && res.category !== 'Other') {
          setTxForm(prev => ({ ...prev, category: res.category }));
        }
      } catch (err) {
        // Silent error for categorization helper
      } finally {
        setIsCategorizing(false);
      }
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!txForm.amount || !txForm.description) {
      return addToast('Please enter amount and description', 'error');
    }

    const formData = new FormData();
    formData.append('type', txType);
    formData.append('amount', txForm.amount);
    formData.append('category', txForm.category);
    formData.append('description', txForm.description);
    if (txForm.date) formData.append('date', txForm.date);
    if (uploadingReceipt) formData.append('receipt', uploadingReceipt);

    try {
      const res = await api.post('/transactions', formData);
      if (res.success) {
        addToast('Transaction recorded successfully!', 'success');
        setShowAddTx(false);
        setTxForm({ amount: '', category: 'Food', description: '', date: '' });
        setUploadingReceipt(null);
        loadDashboardData();
      }
    } catch (err) {
      addToast(err.message || 'Failed to record transaction', 'error');
    }
  };

  const PIE_COLORS = ['#34d399', '#3b82f6', '#fbbf24', '#f87171', '#a78bfa', '#f472b6', '#2dd4bf', '#818cf8', '#c084fc', '#22d3ee', '#94a3b8'];

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="relative flex h-16 w-16">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex h-16 w-16 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Premium Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-3xl border border-slate-700/50 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -left-24 h-48 w-48 bg-emerald-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 h-48 w-48 bg-blue-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-sm">Overview</h2>
          <p className="text-sm text-slate-300 mt-1 font-medium">Welcome back, {user?.name || 'User'}. Here's your financial summary.</p>
        </div>
        
        <div className="relative z-10 flex flex-wrap gap-3">
          <Link to="/ai-insights" className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all duration-300">
            <Sparkles size={16} className="animate-pulse" /> AI Insights
          </Link>
          <button
            onClick={() => { setTxType('income'); setTxForm(prev => ({ ...prev, category: 'Salary' })); setShowAddTx(true); }}
            className="flex items-center gap-2 rounded-2xl bg-slate-800/80 backdrop-blur-md border border-slate-600 px-5 py-2.5 text-sm font-bold text-emerald-400 hover:bg-slate-700 hover:-translate-y-0.5 transition-all duration-300 shadow-lg"
          >
            <PlusCircle size={16} /> Income
          </button>
          <button
            onClick={() => { setTxType('expense'); setTxForm(prev => ({ ...prev, category: 'Food' })); setShowAddTx(true); }}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 transition-all duration-300"
          >
            <PlusCircle size={16} /> Expense
          </button>
        </div>
      </div>

      {/* Premium Glassmorphic Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Total Balance', value: stats.totalBalance, icon: Wallet, color: 'emerald' },
          { title: 'Total Income', value: stats.totalIncome, icon: TrendingUp, color: 'blue' },
          { title: 'Total Expenses', value: stats.totalExpenses, icon: TrendingDown, color: 'rose' },
          { title: 'Total Savings', value: stats.totalSavings, icon: DollarSign, color: 'purple' },
        ].map((item, idx) => (
          <div key={idx} className="group relative rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white/10 hover:-translate-y-1 hover:shadow-2xl hover:border-white/20 transition-all duration-300 overflow-hidden">
            <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full bg-${item.color}-500/20 blur-2xl group-hover:bg-${item.color}-500/30 group-hover:scale-150 transition-all duration-700`}></div>
            <div className="flex items-center justify-between text-slate-300 relative z-10">
              <span className="text-sm font-semibold uppercase tracking-wider">{item.title}</span>
              <div className={`p-2.5 rounded-xl bg-${item.color}-500/10 border border-${item.color}-500/20 group-hover:scale-110 transition-transform`}>
                <item.icon size={20} className={`text-${item.color}-400 drop-shadow-md`} />
              </div>
            </div>
            <h3 className="mt-5 text-3xl font-black text-white relative z-10 drop-shadow-sm">{formatCurrency(item.value)}</h3>
          </div>
        ))}
      </div>

      {/* Interactive Analytics Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Bar Chart */}
        <div className="lg:col-span-2 rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md shadow-xl hover:border-white/10 transition-all duration-300">
          <h3 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full"></span>
            Monthly Cashflow
          </h3>
          <div className="h-80 w-full">
            {chartsData.bar.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-400 text-sm italic">No transaction history available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartsData.bar} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)', color: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="Income" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={24} />
                  <Bar dataKey="Expense" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md shadow-xl hover:border-white/10 transition-all duration-300">
          <h3 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2">
             <span className="w-2 h-6 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full"></span>
             Expense Distribution
          </h3>
          <div className="h-80 w-full relative">
            <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full"></div>
            {chartsData.pie.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-400 text-sm italic">No expense records found.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" className="relative z-10">
                <PieChart>
                  <Pie
                    data={chartsData.pie}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartsData.pie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} className="hover:opacity-80 transition-opacity outline-none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Spend Trends & Recent Transactions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trend Line Chart */}
        <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md shadow-xl hover:border-white/10 transition-all duration-300 lg:col-span-1">
          <h3 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2">
             <span className="w-2 h-6 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full"></span>
             Recent Spend Trend
          </h3>
          <div className="h-64 w-full">
            {chartsData.line.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-400 text-sm italic">Add expenses to view trends.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartsData.line} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)' }} />
                  <Line type="monotone" dataKey="Amount" stroke="#c084fc" strokeWidth={4} dot={{ fill: '#c084fc', r: 5, strokeWidth: 2, stroke: '#1e293b' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md shadow-xl lg:col-span-2 hover:border-white/10 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <span className="w-2 h-6 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"></span>
              Recent Transactions
            </h3>
            <Link to="/transactions" className="text-sm font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1 group">
              View All <ArrowRightLeft size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentTx.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-10 italic">No transactions recorded yet.</p>
            ) : (
              recentTx.map((tx) => (
                <div key={tx._id} className="group flex items-center justify-between rounded-2xl bg-white/[0.03] p-4 border border-white/[0.05] hover:bg-white/[0.08] hover:border-white/10 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg cursor-default">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl font-black text-lg shadow-inner ${
                      tx.type === 'income' ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-900 shadow-emerald-500/50' : 'bg-gradient-to-br from-rose-400 to-red-500 text-white shadow-rose-500/50'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-100 group-hover:text-white transition-colors">{tx.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs font-medium text-slate-400">
                        <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md"><Calendar size={12} /> {new Date(tx.date).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md"><Tag size={12} /> {tx.category}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-lg font-black tracking-tight ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-900 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] transform transition-all">
            <h3 className="text-2xl font-black text-white mb-6 capitalize flex items-center gap-3">
              <div className={`p-2 rounded-xl ${txType === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                <PlusCircle size={24} />
              </div>
              Add {txType}
            </h3>
            <form onSubmit={handleAddSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Amount</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-bold">$</span>
                  </div>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={txForm.amount}
                    onChange={(e) => setTxForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-8 pr-4 text-lg font-bold text-white outline-none focus:border-emerald-500 focus:bg-white/10 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Description</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="What was this for?"
                    value={txForm.description}
                    onChange={(e) => handleDescChange(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 px-4 text-sm font-medium text-white outline-none focus:border-emerald-500 focus:bg-white/10 transition-all placeholder:text-slate-600"
                  />
                  {isCategorizing && (
                    <div className="absolute right-3 top-3 text-emerald-400">
                      <Sparkles size={18} className="animate-pulse" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Category</label>
                <select
                  value={txForm.category}
                  onChange={(e) => setTxForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 px-4 text-sm font-medium text-white outline-none focus:border-emerald-500 focus:bg-white/10 transition-all appearance-none cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-slate-900 text-white">{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Date (Optional)</label>
                <input
                  type="date"
                  value={txForm.date}
                  onChange={(e) => setTxForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 px-4 text-sm font-medium text-white outline-none focus:border-emerald-500 focus:bg-white/10 transition-all"
                />
              </div>

              {txType === 'expense' && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Receipt Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setUploadingReceipt(e.target.files[0])}
                    className="w-full text-sm font-medium text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 transition-all"
                  />
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddTx(false)}
                  className="rounded-2xl px-6 py-3.5 text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:-translate-y-0.5 transition-all"
                >
                  Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
