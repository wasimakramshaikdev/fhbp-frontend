import React from 'react';
import { cn } from '../../utils/cn';

export const Table = ({ children, className }) => (
  <div className="w-full overflow-x-auto rounded-xl border border-slate-200">
    <table className={cn("w-full text-left border-collapse text-sm", className)}>
      {children}
    </table>
  </div>
);

export const TableHead = ({ children, className }) => (
  <thead className={cn("bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500", className)}>
    {children}
  </thead>
);

export const TableBody = ({ children, className }) => (
  <tbody className={cn("divide-y divide-slate-100 bg-white", className)}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className, onClick, ...props }) => (
  <tr
    onClick={onClick}
    className={cn(
      "transition-colors hover:bg-slate-50/75",
      onClick && "cursor-pointer",
      className
    )}
    {...props}
  >
    {children}
  </tr>
);

export const TableHeaderCell = ({ children, className }) => (
  <th className={cn("px-4 py-3.5 tracking-wider", className)}>
    {children}
  </th>
);

export const TableCell = ({ children, className }) => (
  <td className={cn("px-4 py-3.5 text-slate-700", className)}>
    {children}
  </td>
);
