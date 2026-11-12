import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { CustomerSidebar } from '../components/layout/CustomerSidebar';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui/Feedback';

export const CustomerLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="flex flex-col md:flex-row gap-8">
          <CustomerSidebar />
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};
