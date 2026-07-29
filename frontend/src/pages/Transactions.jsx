import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import {
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Image,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export const Transactions = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [order, setOrder] = useState('desc');

  // Preview Receipt Modal
  const [receiptUrl, setReceiptUrl] = useState(null);

  const categories = [
    'Food', 'Transportation', 'Shopping', 'Bills', 'Entertainment',
    'Healthcare', 'Education', 'Travel', 'Salary', 'Investment', 'Other'
  ];

  const formatCurrency = (val) => {
    const symbol = user?.currency === 'USD' ? '$' : user?.currency === 'EUR' ? '€' : '₹';
    return `${symbol}${Number(val).toLocaleString('en-IN')}`;
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let query = `?page=${page}&limit=10&sortBy=${sortBy}&order=${order}`;
      if (search) query += `&search=${search}`;
      if (type) query += `&type=${type}`;
      if (category) query += `&category=${category}`;
      if (startDate) query += `&startDate=${startDate}`;
      if (endDate) query += `&endDate=${endDate}`;

      const res = await api.get(`/transactions${query}`);
      if (res.success) {
        setTransactions(res.transactions);
        setTotal(res.total);
        setPages(res.pages);
      }
    } catch (err) {
      addToast(err.message || 'Error fetching transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, type, category, startDate, endDate, sortBy, order]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const res = await api.delete(`/transactions/${id}`);
      if (res.success) {
        addToast('Transaction deleted successfully', 'success');
        fetchTransactions();
      }
    } catch (err) {
      addToast(err.message || 'Error deleting transaction', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Transactions History</h2>
        <p className="text-sm text-slate-400">Search, filter, and audit your recorded income and expenses.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 py-3 pl-11 pr-4 text-sm text-slate-200 outline-none focus:border-emerald-500/50"
            />
          </div>
          <button
            type="submit"
            className="rounded-2xl bg-slate-950 border border-slate-800 px-6 font-semibold text-sm hover:bg-slate-800 text-slate-300"
          >
            Search
          </button>
        </form>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 outline-none focus:border-emerald-500 text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 outline-none focus:border-emerald-500 text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Sort By</label>
            <div className="flex gap-1.5">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
              </select>
              <button
                onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
                className="rounded-xl border border-slate-800 bg-slate-950 p-2 hover:bg-slate-800 text-slate-400"
              >
                <ArrowUpDown size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-emerald-500">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-emerald-500"></div>
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-center text-sm text-slate-500 py-16">No records matched your filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-950/20">
                  <th className="p-4">Description</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4 text-center">Receipt</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-4 font-semibold text-slate-200">{tx.description}</td>
                    <td className="p-4 text-slate-400">{tx.category}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {tx.type === 'income' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="p-4 font-bold text-slate-200">{formatCurrency(tx.amount)}</td>
                    <td className="p-4 text-center">
                      {tx.receiptPath ? (
                        <button
                          onClick={() => setReceiptUrl(`http://localhost:5000${tx.receiptPath}`)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-emerald-400"
                        >
                          <Image size={18} />
                        </button>
                      ) : (
                        <span className="text-xs text-slate-600">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(tx._id)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {pages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-800 p-4 text-sm text-slate-400">
                <span>Page {page} of {pages}</span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-2 hover:bg-slate-800 disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={page === pages}
                    onClick={() => setPage(p => p + 1)}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-2 hover:bg-slate-800 disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {receiptUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="relative max-w-lg w-full rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-2xl">
            <button
              onClick={() => setReceiptUrl(null)}
              className="absolute right-4 top-4 rounded-full bg-slate-950/80 p-1.5 text-slate-400 hover:text-slate-200"
            >
              <X size={18} />
            </button>
            <img src={receiptUrl} alt="Receipt Details" className="w-full rounded-2xl object-contain max-h-[80vh]" />
          </div>
        </div>
      )}
    </div>
  );
};
export default Transactions;
