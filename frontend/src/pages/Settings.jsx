import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Settings as SettingsIcon, Globe, CircleDollarSign, Palette } from 'lucide-react';

export const Settings = () => {
  const { user, updateSettings } = useAuth();
  const { addToast } = useToast();

  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [language, setLanguage] = useState(user?.language || 'en');
  const [theme, setTheme] = useState(user?.theme || 'dark');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateSettings({ currency, language, theme });
      if (res.success) {
        addToast('Application settings saved successfully!', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Error saving settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <SettingsIcon size={28} className="text-emerald-400" /> Preferences Settings
        </h2>
        <p className="text-sm text-slate-400">Configure language localizations, base currency formats, and visual styles.</p>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Currency Preference */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CircleDollarSign size={16} className="text-emerald-400" /> Base Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
            >
              <option value="INR">INR (₹) - Indian Rupee</option>
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
            </select>
          </div>

          {/* Language preference */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Globe size={16} className="text-emerald-400" /> Language Preferences
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
            >
              <option value="en">English (Default)</option>
              <option value="es">Español (Spanish)</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="fr">Français (French)</option>
              <option value="de">Deutsch (German)</option>
            </select>
          </div>

          {/* Theme setting */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Palette size={16} className="text-emerald-400" /> UI Visual Theme
            </label>
            <div className="flex gap-4">
              {['dark', 'light'].map((t) => (
                <label
                  key={t}
                  className={`flex flex-1 items-center justify-center rounded-xl border p-4 cursor-pointer font-semibold capitalize text-sm transition-all ${
                    theme === t
                      ? 'border-emerald-500 bg-emerald-500/5 text-emerald-400'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={t}
                    checked={theme === t}
                    onChange={() => setTheme(t)}
                    className="sr-only"
                  />
                  {t} Mode
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-semibold text-white shadow-md hover:opacity-95"
          >
            {loading ? 'Saving Preferences...' : 'Save Preferences'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default Settings;
