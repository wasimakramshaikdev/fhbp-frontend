import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarCheck, CalendarDays, Building, IndianRupee, MessageSquareQuote, Settings, ShieldCheck } from 'lucide-react';
import { cn } from '../../utils/cn';

export const OwnerSidebar = () => {
  const links = [
    { name: 'Dashboard', path: '/owner/dashboard', icon: LayoutDashboard },
    { name: 'KYC & Verification', path: '/owner/verification', icon: ShieldCheck },
    { name: 'Booking Requests', path: '/owner/bookings', icon: CalendarCheck },
    { name: 'Availability Calendar', path: '/owner/calendar', icon: CalendarDays },
    { name: 'My Listings', path: '/owner/listings', icon: Building },
    { name: 'Earnings & Payouts', path: '/owner/earnings', icon: IndianRupee },
    { name: 'Guest Reviews', path: '/owner/reviews', icon: MessageSquareQuote },
    { name: 'Venue Settings', path: '/owner/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 rounded-[26px] border border-slate-200/80 bg-white/85 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-sm">
      <div className="mb-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-3 text-white shadow-lg shadow-indigo-600/20">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-100">Venue Owner Portal</h3>
      </div>
      <nav className="space-y-1.5">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 border border-indigo-100 shadow-sm font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
