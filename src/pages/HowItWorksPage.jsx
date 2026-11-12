import React from 'react';
import { ShieldCheck, Calendar, IndianRupee, Clock, CheckCircle2 } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export const HowItWorksPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center space-y-4">
        <Badge variant="primary">Marketplace Architecture</Badge>
        <h1 className="text-4xl font-extrabold text-slate-900">How PotlaEventSpaces Protects Your Event</h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-base">
          A transparent, double-booking immune booking system engineered for Indian banquet halls and convention centers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Atomic Concurrency & Temporary Holds</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            When you select a slot and click check availability, PostgreSQL locks the specific date and time slot with row-level transaction security. You receive a 15-minute exclusive hold while completing your advance payment.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Advance Deposit & Escrow Safety</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Pay a 20% advance directly to lock your booking. The venue owner verifies the booking within 24 hours. If an owner rejects, your 100% advance is refunded automatically.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <IndianRupee className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Transparent GST Invoicing</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Every booking produces an itemized tax invoice with base hall rent, per-plate catering, decor, DJ, and 18% GST (CGST + SGST) itemized without hidden convenience surcharges.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Verified Reviews Post-Event Only</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            To prevent fake ratings, reviews can only be submitted by customers who completed a verified booking after the event date has concluded.
          </p>
        </div>
      </div>
    </div>
  );
};
