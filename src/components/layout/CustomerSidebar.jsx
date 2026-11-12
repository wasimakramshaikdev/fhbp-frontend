import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, Heart, ReceiptText, UserCircle, LifeBuoy } from 'lucide-react';
import { cn } from '../../utils/cn';

export const CustomerSidebar = () => {
  const links = [
    { name: 'My Bookings', path: '/dashboard/bookings', icon: Calendar },
    { name: 'Saved Halls', path: '/dashboard/favorites', icon: Heart },
    { name: 'Payments & Invoices', path: '/dashboard/payments', icon: ReceiptText },
    { name: 'Profile Settings', path: '/dashboard/profile', icon: UserCircle },
    { name: 'Support & Help', path: '/dashboard/support', icon: LifeBuoy },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
      <div className="px-3 py-2 mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer Portal</h3>
      </div>
      <nav className="space-y-1">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition",
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
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
