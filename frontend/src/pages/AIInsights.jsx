import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { BrainCircuit, AlertCircle, HelpCircle, CheckCircle, TrendingUp, Sparkles } from 'lucide-react';

export const AIInsights = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (val) => {
    const symbol = user?.currency === 'USD' ? '$' : user?.currency === 'EUR' ? '€' : '₹';
    return `${symbol}${Number(val).toLocaleString('en-IN')}`;
  };

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ai/insights');
      if (res.success) {
        setInsights(res.predictions);
      }
    } catch (err) {
      addToast(err.message || 'Error loading AI insights', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

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
        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <BrainCircuit size={28} className="text-emerald-400" /> AI Financial Insights
        </h2>
        <p className="text-sm text-slate-400">Automated budget analysis, spend trend predictions, and customized savings tips.</p>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Next Month's Expense Forecast */}
        <div className="md:col-span-1 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6 shadow-lg backdrop-blur-md relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl group-hover:scale-125 transition-transform duration-500"></div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm tracking-wider uppercase">
            <Sparkles size={16} /> Monthly Forecast
          </div>
          <h3 className="mt-4 text-slate-400 text-sm font-medium">Predicted Expenses (Next Month)</h3>
          <p className="mt-2 text-4xl font-extrabold text-white">
            {formatCurrency(insights?.predictedExpense || 0)}
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-500/80">
            <TrendingUp size={14} /> Based on your historical trends
          </div>
        </div>

        {/* Dynamic Pattern Analysis */}
        <div className="md:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-lg backdrop-blur-md">
          <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <AlertCircle size={18} className="text-amber-400" /> Unusual Spending & Spikes
          </h3>
          <div className="min-h-24 flex flex-col justify-center">
            {insights?.analysis && insights.analysis !== 'No anomalies or spikes detected.' ? (
              <div className="space-y-3">
                {insights.analysis.split(' | ').map((anomaly, idx) => (
                  <div key={idx} className="rounded-2xl border border-amber-500/10 bg-amber-500/5 p-4 text-sm text-amber-400 leading-relaxed">
                    {anomaly}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-400 text-center flex flex-col items-center gap-2 py-6">
                <CheckCircle size={20} className="text-emerald-400" />
                No unusual spending patterns or significant category spikes detected this month.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Personalized Recommendations */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-lg backdrop-blur-sm">
        <h3 className="text-lg font-bold text-slate-200 mb-5 flex items-center gap-2">
          <HelpCircle size={18} className="text-emerald-400" /> AI Recommendations
        </h3>
        {insights?.recommendations && insights.recommendations.length > 0 ? (
          <div className="space-y-4">
            {insights.recommendations.map((rec, index) => (
              <div key={index} className="flex gap-3.5 items-start rounded-2xl bg-slate-950/40 p-4 border border-slate-800/30">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs">
                  {index + 1}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">{rec}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 py-6 text-center">No personalized recommendations yet. Keep updating your transactions!</p>
        )}
      </div>
    </div>
  );
};
export default AIInsights;
