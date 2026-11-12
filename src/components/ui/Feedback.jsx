import React from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle, SearchX } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Spinner = ({ size = 'md', className }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div className="flex items-center justify-center p-4">
      <svg
        className={cn('animate-spin text-indigo-600', sizes[size], className)}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

export const Skeleton = ({ className, ...props }) => (
  <div className={cn("animate-pulse rounded-xl bg-slate-200/80", className)} {...props} />
);

export const Alert = ({
  title,
  children,
  variant = 'info',
  className,
}) => {
  const variants = {
    info: 'bg-indigo-50 border-indigo-200 text-indigo-900 icon-text-indigo',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    danger: 'bg-rose-50 border-rose-200 text-rose-900',
  };

  return (
    <div className={cn("p-4 rounded-xl border flex gap-3.5", variants[variant], className)}>
      <div className="shrink-0 mt-0.5">
        {variant === 'info' && <Info className="w-5 h-5 text-indigo-600" />}
        {variant === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        {variant === 'warning' && <AlertCircle className="w-5 h-5 text-amber-600" />}
        {variant === 'danger' && <XCircle className="w-5 h-5 text-rose-600" />}
      </div>
      <div>
        {title && <h4 className="text-sm font-semibold mb-1">{title}</h4>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
    </div>
  );
};

export const EmptyState = ({
  icon: Icon = SearchX,
  title = 'No records found',
  description = 'There are no items matching your criteria at this moment.',
  action,
  className,
}) => (
  <div className={cn("flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-100", className)}>
    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
      <Icon className="w-7 h-7" />
    </div>
    <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
    <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
    {action}
  </div>
);
