import React from 'react';
import { formatCurrency } from '../../utils/formatters';

export const PriceBreakdown = ({
  hallRent = 0,
  hasCatering = false,
  cateringAmount = 0,
  hasDecor = false,
  decorAmount = 0,
  hasDj = false,
  djAmount = 0,
  subtotal = 0,
  discountAmount = 0,
  taxAmount = 0,
  totalAmount = 0,
  advanceAmount = 0,
  balanceAmount = 0,
  advancePercentage = 20,
  className = '',
}) => {
  return (
    <div className={`rounded-2xl bg-slate-50 p-5 border border-slate-200/80 space-y-3 ${className}`}>
      <h4 className="text-sm font-semibold text-slate-900 pb-2 border-b border-slate-200">
        Price Breakdown
      </h4>
      
      <div className="space-y-2 text-sm text-slate-600">
        <div className="flex justify-between">
          <span>Base Hall Rent</span>
          <span className="font-medium text-slate-900">{formatCurrency(hallRent)}</span>
        </div>

        {hasCatering && (
          <div className="flex justify-between">
            <span>Catering Service</span>
            <span className="font-medium text-slate-900">{formatCurrency(cateringAmount)}</span>
          </div>
        )}

        {hasDecor && (
          <div className="flex justify-between">
            <span>Premium Decor</span>
            <span className="font-medium text-slate-900">{formatCurrency(decorAmount)}</span>
          </div>
        )}

        {hasDj && (
          <div className="flex justify-between">
            <span>DJ & Sound System</span>
            <span className="font-medium text-slate-900">{formatCurrency(djAmount)}</span>
          </div>
        )}

        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>Promotional Discount</span>
            <span>-{formatCurrency(discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between text-xs text-slate-500 pt-1 border-t border-slate-200">
          <span>GST / Taxes (18%)</span>
          <span>{formatCurrency(taxAmount)}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-200 space-y-2">
        <div className="flex justify-between text-base font-bold text-slate-900">
          <span>Total Quotation</span>
          <span className="text-indigo-600">{formatCurrency(totalAmount)}</span>
        </div>

        <div className="flex justify-between text-sm font-medium text-emerald-700 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200/60">
          <span>Advance Payable ({advancePercentage}%):</span>
          <span className="font-bold">{formatCurrency(advanceAmount)}</span>
        </div>

        <div className="flex justify-between text-xs text-slate-500 px-1">
          <span>Balance due before event:</span>
          <span>{formatCurrency(balanceAmount)}</span>
        </div>
      </div>
    </div>
  );
};
