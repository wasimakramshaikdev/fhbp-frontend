import React from 'react';
import { Link } from 'react-router-dom';
import { SearchX, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 mx-auto">
          <SearchX className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900">404 - Page Not Found</h1>
          <p className="text-sm text-slate-500">
            The page or venue you are looking for does not exist or has been moved.
          </p>
        </div>
        <Link to="/">
          <Button variant="primary" icon={Home}>
            Return to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
};
