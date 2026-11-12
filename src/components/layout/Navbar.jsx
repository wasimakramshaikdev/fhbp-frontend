import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Building2, User as UserIcon, Heart, Calendar, LogOut, ShieldCheck, Menu, X, ChevronDown, Bell, CheckCircle2 } from 'lucide-react';
import api, { getStoredAccessToken } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import logoImage from '../../assets/logo.jpeg';

export const Navbar = () => {
  const { user, logout, isCustomer, isOwner, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const token = getStoredAccessToken();
    if (user && token) {
      const fetchNotifCount = async () => {
        const currentToken = getStoredAccessToken();
        if (!currentToken) return;
        try {
          const res = await api.get('/notifications/unread-count/');
          if (res && res.success) {
            setUnreadCount(res.data.unread_count || 0);
          }
        } catch (e) {
          // ignore background notification errors
        }
      };
      fetchNotifCount();
      const interval = setInterval(fetchNotifCount, 30000); // 30s poll
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
      setNotifications([]);
    }
  }, [user]);

  const handleOpenNotifications = async () => {
    setNotifDropdownOpen(!notifDropdownOpen);
    if (!notifDropdownOpen && user) {
      try {
        const res = await api.get('/notifications/');
        if (res.success) {
          setNotifications(res.data || []);
        }
      } catch (e) {
        // ignore
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/read-all/');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (e) {}
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src={logoImage}
              alt="PotlaEventSpaces logo"
              className="h-11 w-11 rounded-full object-cover shadow-md shadow-fuchsia-500/20 ring-2 ring-fuchsia-100"
            />
            <div className="flex flex-col leading-none">
              <span className="text-[0.72rem] font-semibold tracking-[0.28em] text-slate-400 uppercase">
                Potla
              </span>
              <span className="text-lg font-black tracking-[-0.04em] text-slate-900">
                Event<span className="text-indigo-600">Spaces</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {!isOwner && !isAdmin && (
            <nav className="hidden md:flex items-center gap-8">
              <Link
                to="/search"
                className={`text-sm font-medium transition ${
                  location.pathname === '/search' ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Browse Halls
              </Link>
              <Link
                to="/how-it-works"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
              >
                How It Works
              </Link>
            </nav>
          )}

          {/* User / Auth Controls */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={handleOpenNotifications}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition relative"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-150"
                      onMouseLeave={() => setNotifDropdownOpen(false)}
                    >
                      <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-900">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[11px] font-semibold text-indigo-600 hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.slice(0, 5).map((n) => (
                            <div key={n.id} className={`p-3 text-xs space-y-1 ${!n.is_read ? 'bg-indigo-50/50' : ''}`}>
                              <div className="font-bold text-slate-900">{n.title}</div>
                              <p className="text-slate-600 leading-relaxed">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Pill */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-3 p-1.5 pl-3 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition"
                  >
                    <div className="flex flex-col text-right">
                      <span className="text-xs font-semibold text-slate-900 leading-tight">
                        {user.full_name || user.email}
                      </span>
                      <span className="text-[10px] font-medium text-indigo-600 uppercase">
                        {user.role}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                      {(user.full_name || user.email)[0].toUpperCase()}
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 mr-1" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      {isCustomer && (
                        <>
                          <Link
                            to="/dashboard/bookings"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Calendar className="w-4 h-4 text-slate-400" />
                            My Bookings
                          </Link>
                          <Link
                            to="/dashboard/payments"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Building2 className="w-4 h-4 text-slate-400" />
                            Invoices & Receipts
                          </Link>
                        </>
                      )}

                      {isOwner && (
                        <Link
                          to="/owner/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Building2 className="w-4 h-4 text-indigo-600" />
                          Owner Dashboard
                        </Link>
                      )}

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <ShieldCheck className="w-4 h-4 text-rose-600" />
                          Admin Control Plane
                        </Link>
                      )}

                      <div className="border-t border-slate-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
          {!isOwner && !isAdmin && (
            <>
              <Link
                to="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Browse Halls
              </Link>
              <Link
                to="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                How It Works
              </Link>
            </>
          )}
          <div className="border-t border-slate-100 pt-3">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-1 text-xs font-semibold text-slate-400">
                  Signed in as {user.email}
                </div>
                {isCustomer && (
                  <Link
                    to="/dashboard/bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm text-slate-700"
                  >
                    My Bookings
                  </Link>
                )}
                {isOwner && (
                  <Link
                    to="/owner/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm text-indigo-600"
                  >
                    Owner Dashboard
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm text-rose-600"
                  >
                    Admin Control Plane
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-rose-600"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
