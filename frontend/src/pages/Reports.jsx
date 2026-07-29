import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { FileDown, Printer, Calendar, ArrowRightLeft } from 'lucide-react';

export const Reports = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [period, setPeriod] = useState('monthly');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (val) => {
    const symbol = user?.currency === 'USD' ? '$' : user?.currency === 'EUR' ? '€' : '₹';
    return `${symbol}${Number(val).toLocaleString('en-IN')}`;
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports?period=${period}`);
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      addToast(err.message || 'Error compiling report data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [period]);

  const handleExportCSV = () => {
    window.open('http://localhost:5000/api/reports/csv', '_blank');
    addToast('Downloading transactions report...', 'info');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-emerald-500">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-800 border-t-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 print:p-0">
      {/* Title / Action bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Financial Reports</h2>
          <p className="text-sm text-slate-400">Generate audits, export data sheets, or print transaction archives.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-2xl bg-slate-900 border border-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800/80 transition-all"
          >
            <Printer size={16} /> Print / PDF
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all"
          >
            <FileDown size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Period Selection (hidden during print) */}
      <div className="flex gap-2 rounded-2xl bg-slate-900/60 p-1.5 border border-slate-800/50 w-fit print:hidden">
        {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
              period === p
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Summary Box */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 shadow-md">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Income</span>
          <p className="mt-2.5 text-2xl font-bold text-emerald-400">{formatCurrency(data?.income || 0)}</p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 shadow-md">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Expenses</span>
          <p className="mt-2.5 text-2xl font-bold text-rose-400">{formatCurrency(data?.expense || 0)}</p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 shadow-md">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Savings</span>
          <p className="mt-2.5 text-2xl font-bold text-sky-400">{formatCurrency(data?.savings || 0)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Category breakdown list */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-lg">
          <h3 className="text-base font-bold text-slate-200 mb-4">Expenses by Category</h3>
          <div className="space-y-3.5">
            {Object.keys(data?.categoryBreakdown || {}).length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-6">No expenses found for this duration.</p>
            ) : (
              Object.entries(data.categoryBreakdown).map(([cat, amt]) => (
                <div key={cat} className="flex justify-between items-center text-sm py-1 border-b border-slate-800/30">
                  <span className="text-slate-400 font-medium">{cat}</span>
                  <span className="font-semibold text-slate-200">{formatCurrency(amt)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Transactions log list */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-lg lg:col-span-2">
          <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
            <ArrowRightLeft size={16} /> Transactions Audited
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {data?.transactions.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-8">No records available.</p>
            ) : (
              data?.transactions.map((tx) => (
                <div key={tx._id} className="flex justify-between items-center rounded-2xl bg-slate-950/40 p-4 border border-slate-800/30">
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{tx.description}</p>
                    <div className="flex gap-2 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(tx.date).toLocaleDateString()}</span>
                      <span>{tx.category}</span>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Reports;
