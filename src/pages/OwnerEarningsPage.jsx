import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IndianRupee, Landmark, ShieldCheck, ArrowUpRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/ui/Table';
import { Spinner, EmptyState } from '../components/ui/Feedback';
import { formatCurrency, formatDate } from '../utils/formatters';

export const OwnerEarningsPage = () => {
  const { showError } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/owner/earnings/');
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        showError('Failed to load earnings summary');
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const summary = data.summary;
  const bank = data.bank_account;
  const payouts = data.payouts;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Earnings & Payouts</h1>
        <p className="text-sm text-slate-500 mt-1">Track gross revenue, platform commission deductions, and scheduled bank settlements</p>
      </div>

      {/* Wireframe Metric Cards (Screen 6) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6 border-slate-200 shadow-xs space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Earned (Gross)</div>
          <div className="text-3xl font-black text-slate-900">{formatCurrency(summary.total_gross)}</div>
          <span className="text-xs text-slate-500">Gross revenue across all venues</span>
        </Card>

        <Card className="p-6 border-slate-200 shadow-xs space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Platform Commission ({summary.commission_rate_pct}%)
          </div>
          <div className="text-3xl font-black text-rose-600">-{formatCurrency(summary.total_commission)}</div>
          <span className="text-xs text-slate-500">Includes payment gateway fee & hosting</span>
        </Card>

        <Card className="p-6 border-slate-200 shadow-xs space-y-2 bg-gradient-to-br from-indigo-900 to-slate-950 text-white border-transparent">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-300">Next Upcoming Payout</div>
          <div className="text-3xl font-black text-white">{formatCurrency(summary.next_payout_amount || summary.total_pending)}</div>
          <div className="text-xs text-indigo-200">
            {summary.next_payout_date ? `Scheduled on ${formatDate(summary.next_payout_date)}` : 'No pending settlements'}
          </div>
        </Card>
      </div>

      {/* Bank Account Info Card */}
      <Card className="border-slate-200 bg-slate-50 shadow-xs">
        <CardBody className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-xs">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                Direct Bank Deposit: {bank.holder_name || "Owner Account"} ({bank.masked_account})
              </div>
              <div className="text-xs text-slate-500">IFSC: {bank.ifsc_code || "Not configured"} • Dispatched 3 days post-event</div>
            </div>
          </div>

          <Link to="/owner/settings">
            <Button variant="outline" size="sm">
              Update Bank Account
            </Button>
          </Link>
        </CardBody>
      </Card>

      {/* Payouts Breakdown Table (Wireframe Screen 6) */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader>
          <CardTitle>Payout Breakdown by Booking</CardTitle>
          <CardDescription>Individual event gross receipts, 10% commission deduction, and net owner payout</CardDescription>
        </CardHeader>

        <CardBody className="p-0">
          {payouts.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No payouts recorded yet. Payout records are created automatically when customer reservations are confirmed.
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Booking Ref</TableHeaderCell>
                  <TableHeaderCell>Venue & Event Date</TableHeaderCell>
                  <TableHeaderCell>Gross Amount</TableHeaderCell>
                  <TableHeaderCell>Commission ({summary.commission_rate_pct}%)</TableHeaderCell>
                  <TableHeaderCell>Net Payout</TableHeaderCell>
                  <TableHeaderCell className="text-right">Payout Status</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payouts.map((p) => {
                  const isPaid = p.status === 'PAID';
                  const isScheduled = p.status === 'SCHEDULED';
                  const isHold = p.status === 'ON_HOLD';

                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="font-bold text-slate-900 text-xs">#{p.booking_number}</div>
                        <div className="text-[10px] text-slate-400">{p.transaction_reference}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-semibold text-slate-900">{p.hall_name}</div>
                        <div className="text-xs text-slate-500">{formatDate(p.event_date)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-bold text-slate-900">{formatCurrency(p.gross_amount)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-medium text-rose-600">-{formatCurrency(p.commission_amount)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-black text-emerald-700">{formatCurrency(p.net_amount)}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={isPaid ? 'success' : isHold ? 'danger' : 'warning'}
                          size="sm"
                        >
                          {isPaid ? 'Paid' : isHold ? 'On Hold (Dispute)' : `Pending (${formatDate(p.payout_date)})`}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
