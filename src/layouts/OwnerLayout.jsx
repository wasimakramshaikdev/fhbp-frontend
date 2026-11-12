import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { OwnerSidebar } from '../components/layout/OwnerSidebar';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui/Feedback';

export const OwnerLayout = () => {
  const { user, loading, isOwner, isAdmin } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (!user || (!isOwner && !isAdmin)) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.14),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.1),_transparent_22%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="flex flex-col md:flex-row gap-8">
          <OwnerSidebar />
          <main className="flex-1 min-w-0 rounded-[30px] border border-slate-200/80 bg-white/80 p-5 sm:p-6 shadow-[0_18px_45px_rgba(15,23,42,0.05)] backdrop-blur-sm">
            <Outlet />
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};
