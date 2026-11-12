import React from 'react';
import { cn } from '../../utils/cn';

export const Checkbox = React.forwardRef(({
  label,
  description,
  error,
  className,
  id,
  ...props
}, ref) => {
  const checkboxId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          className={cn(
            "h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition",
            error && "border-rose-500",
            className
          )}
          {...props}
        />
      </div>
      {(label || description) && (
        <div className="ml-3 text-sm">
          {label && (
            <label htmlFor={checkboxId} className="font-medium text-slate-800 cursor-pointer">
              {label}
            </label>
          )}
          {description && <p className="text-slate-500 text-xs mt-0.5">{description}</p>}
          {error && <p className="text-rose-600 text-xs mt-1">{error}</p>}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export const Radio = React.forwardRef(({
  label,
  description,
  className,
  id,
  ...props
}, ref) => {
  const radioId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          ref={ref}
          id={radioId}
          type="radio"
          className={cn(
            "h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500 transition",
            className
          )}
          {...props}
        />
      </div>
      {(label || description) && (
        <div className="ml-3 text-sm">
          {label && (
            <label htmlFor={radioId} className="font-medium text-slate-800 cursor-pointer">
              {label}
            </label>
          )}
          {description && <p className="text-slate-500 text-xs mt-0.5">{description}</p>}
        </div>
      )}
    </div>
  );
});

Radio.displayName = 'Radio';
