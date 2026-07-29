import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Bell, Sun, Moon, Menu, Check } from 'lucide-react';

export const Topbar = ({ toggleSidebar }) => {
  const { user, updateSettings } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.success) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      console.error('Error fetching notifications', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll notifications every 30 seconds for live updates
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}`);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    try {
      await api.delete('/notifications');
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTheme = () => {
    const nextTheme = user?.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900 px-6 text-slate-200">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-1.5 hover:bg-slate-800 lg:hidden text-slate-400"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-medium text-slate-100 hidden md:block">
          Welcome back, <span className="font-semibold text-emerald-400">{user?.username}</span>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
          title="Toggle Theme"
        >
          {user?.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white ring-2 ring-slate-900">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 mt-2.5 w-80 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl ring-1 ring-black/5 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="font-semibold text-sm">Notifications</span>
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-slate-400 hover:text-emerald-400"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto py-2 space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-center text-xs text-slate-500 py-4">No notifications yet</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className={`flex items-start gap-2.5 p-2 rounded-xl text-xs transition-colors ${
                        notif.read ? 'opacity-60 bg-transparent' : 'bg-slate-800/30'
                      }`}
                    >
                      <div className="flex-1">
                        <p className="text-slate-200 font-medium leading-relaxed">{notif.message}</p>
                        <span className="text-[10px] text-slate-500 block mt-1">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {!notif.read && (
                        <button
                          onClick={() => handleMarkAsRead(notif._id)}
                          className="rounded-full p-1 text-emerald-400 hover:bg-emerald-500/10"
                          title="Mark as read"
                        >
                          <Check size={12} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 font-semibold text-white shadow-md text-sm uppercase">
            {user?.username.substring(0, 2)}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-200">{user?.username}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.isAdmin ? 'Admin' : 'Member'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
