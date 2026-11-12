import React, { useState, useEffect } from 'react';
import { Settings2, Save, CheckCircle2, ShieldAlert, Percent, Clock, Receipt } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../components/ui/Card';
import { Spinner } from '../components/ui/Feedback';

export const AdminSettingsPage = () => {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  const [commissionPct, setCommissionPct] = useState(10.0);
  const [taxRatePct, setTaxRatePct] = useState(18.0);
  const [advancePct, setAdvancePct] = useState(20.0);
  const [holdTtlMinutes, setHoldTtlMinutes] = useState(15);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/settings/');
        if (res.success && res.data) {
          if (res.data.PLATFORM_COMMISSION_PCT) setCommissionPct(res.data.PLATFORM_COMMISSION_PCT.percentage || 10.0);
          if (res.data.DEFAULT_GST_TAX_RATE) setTaxRatePct(res.data.DEFAULT_GST_TAX_RATE.rate || 18.0);
          if (res.data.DEFAULT_ADVANCE_PCT) setAdvancePct(res.data.DEFAULT_ADVANCE_PCT.percentage || 20.0);
          if (res.data.BOOKING_HOLD_TTL_MINUTES) setHoldTtlMinutes(res.data.BOOKING_HOLD_TTL_MINUTES.minutes || 15);
        }
      } catch (err) {
        showError('Failed to load system settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);

    try {
      const payload = {
        PLATFORM_COMMISSION_PCT: { percentage: parseFloat(commissionPct) || 10.0 },
        DEFAULT_GST_TAX_RATE: { rate: parseFloat(taxRatePct) || 18.0 },
        DEFAULT_ADVANCE_PCT: { percentage: parseFloat(advancePct) || 20.0 },
        BOOKING_HOLD_TTL_MINUTES: { minutes: parseInt(holdTtlMinutes) || 15 },
      };

      const res = await api.patch('/admin/settings/', payload);
      if (res.success) {
        showSuccess('Platform parameters updated and logged in audit trail.');
      }
    } catch (err) {
      showError(err.message || 'Failed to update settings');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Platform Settings & Financial Rules</h1>
        <p className="text-sm text-slate-400 mt-1">Configure global platform commission rates, taxation rules, and checkout TTL limits</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="border-slate-800">
            <CardTitle className="text-white flex items-center gap-2">
              <Percent className="w-5 h-5 text-indigo-400" /> Platform Marketplace Commission
            </CardTitle>
            <CardDescription className="text-slate-400">
              Configurable percentage deducted from gross venue earnings prior to owner payout
            </CardDescription>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Commission Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={commissionPct}
                  onChange={(e) => setCommissionPct(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
                <span className="text-[11px] text-slate-500 mt-1 block">Default 10.0% standard platform fee</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="border-slate-800">
            <CardTitle className="text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-400" /> Taxation & Advance Percentages
            </CardTitle>
            <CardDescription className="text-slate-400">
              Goods & Services Tax (GST) rate and checkout advance deposit configuration
            </CardDescription>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  GST Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={taxRatePct}
                  onChange={(e) => setTaxRatePct(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
                <span className="text-[11px] text-slate-500 mt-1 block">18.0% standard event venue GST</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Default Advance Required (%)
                </label>
                <input
                  type="number"
                  step="1"
                  min="5"
                  max="100"
                  value={advancePct}
                  onChange={(e) => setAdvancePct(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
                <span className="text-[11px] text-slate-500 mt-1 block">Default 20% advance deposit at checkout</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="border-slate-800">
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" /> Checkout Slot Hold TTL
            </CardTitle>
            <CardDescription className="text-slate-400">
              Duration in minutes that a slot remains locked in HELD state while awaiting customer payment
            </CardDescription>
          </CardHeader>
          <CardBody>
            <div className="max-w-xs">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Hold Duration (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={holdTtlMinutes}
                onChange={(e) => setHoldTtlMinutes(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                required
              />
              <span className="text-[11px] text-slate-500 mt-1 block">15 minutes standard reservation hold</span>
            </div>
          </CardBody>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="lg" icon={Save} isLoading={saveLoading}>
            Save Platform Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
