import React from 'react';
import { cn } from '../../utils/cn';

export const Card = ({ children, className, ...props }) => (
  <div className={cn("bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden", className)} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ children, className, ...props }) => (
  <div className={cn("px-6 py-5 border-b border-slate-100", className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className, ...props }) => (
  <h3 className={cn("text-lg font-semibold text-slate-900 tracking-tight", className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className, ...props }) => (
  <p className={cn("text-sm text-slate-500 mt-1", className)} {...props}>
    {children}
  </p>
);

export const CardBody = ({ children, className, ...props }) => (
  <div className={cn("p-6", className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className, ...props }) => (
  <div className={cn("px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between", className)} {...props}>
    {children}
  </div>
);
