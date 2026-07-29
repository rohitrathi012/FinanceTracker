import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ArrowUpDown,
  Wallet,
  Target,
  BrainCircuit,
  FileSpreadsheet,
  User,
  Settings,
  Shield,
  LogOut,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/transactions', label: 'Transactions', icon: ArrowUpDown },
    { to: '/budgets', label: 'Budgets', icon: Wallet },
    { to: '/savings', label: 'Savings Goals', icon: Target },
    { to: '/ai-insights', label: 'AI Insights', icon: BrainCircuit },
    { to: '/reports', label: 'Reports', icon: FileSpreadsheet },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  if (user && user.isAdmin) {
    navItems.push({ to: '/admin', label: 'Admin Panel', icon: Shield });
  }

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-900 text-slate-200 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-400 to-teal-600 text-white shadow-md shadow-emerald-500/20 font-bold text-lg">
              F
            </div>
            <span className="font-semibold text-lg bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              FinanceAI
            </span>
          </div>
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-1.5 hover:bg-slate-800 lg:hidden text-slate-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => {
                if (window.innerWidth < 1024) toggleSidebar();
              }}
              className={({ isActive }) =>
                `flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_12px_rgba(16,185,129,0.05)] border-l-2 border-emerald-500'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border-l-2 border-transparent'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/5"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};
