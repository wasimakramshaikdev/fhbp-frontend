import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Users, Building2, CalendarRange, IndianRupee, Scale, CheckCircle2, XCircle, Clock, ArrowRight, Eye, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/ui/Table';
import { Spinner, EmptyState } from '../components/ui/Feedback';
import { formatCurrency, formatDate } from '../utils/formatters';

export const AdminDashboardPage = () => {
  const { showSuccess, showError } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedHall, setSelectedHall] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard/');
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      showError('Failed to load admin overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleApprove = async (hallId, hallName) => {
    try {
      setActionLoading(true);
      const res = await api.post(`/admin/halls/${hallId}/action/`, { action: 'APPROVE' });
      if (res.success) {
        showSuccess(`Approved '${hallName}'! Listing is now active.`);
        fetchDashboard();
      }
    } catch (err) {
      showError(err.message || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      showError('Please provide a reason for rejecting the venue');
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.post(`/admin/halls/${selectedHall.id}/action/`, {
        action: 'REJECT',
        reason: rejectionReason,
      });
      if (res.success) {
        showSuccess(`Listing '${selectedHall.hall_name}' rejected.`);
        setRejectModalOpen(false);
        setRejectionReason('');
        setSelectedHall(null);
        fetchDashboard();
      }
    } catch (err) {
      showError(err.message || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const metrics = data.metrics;
  const pending = data.pending_approvals;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[26px] border border-rose-100 bg-gradient-to-r from-rose-50 via-white to-indigo-50 p-5 shadow-[0_12px_35px_rgba(99,102,241,0.08)]">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Platform Governance Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Super Admin control plane for listings verification, revenue, and dispute settlement</p>
        </div>

        <div className="flex gap-2">
          <Link to="/admin/disputes">
            <Button variant="danger" size="sm" icon={Scale}>
              Disputes ({metrics.open_disputes_count})
            </Button>
          </Link>
          <Link to="/admin/settings">
            <Button variant="outline" size="sm">
              Platform Settings
            </Button>
          </Link>
        </div>
      </div>

      {(metrics.refunds_this_month > 0 || metrics.total_refunded_bookings > 0) && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <span>
            <span className="font-bold">{metrics.total_refunded_bookings || metrics.refunds_this_month || 0}</span> refunded booking(s) are tracked in the system this month, totaling <span className="font-bold">{formatCurrency(metrics.refund_amount_mtd || 0)}</span>.
          </span>
        </div>
      )}

      {/* Wireframe Admin Metrics (Screen 1) */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-6">
        <div className="bg-gradient-to-br from-white to-rose-50 p-6 rounded-2xl border border-slate-200 shadow-[0_12px_28px_rgba(15,23,42,0.04)] space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Halls</div>
          <div className="text-3xl font-black text-slate-900">{metrics.total_halls}</div>
          <span className="text-xs text-slate-500">Listed across Hyderabad</span>
        </div>

        <div className="bg-gradient-to-br from-white to-indigo-50 p-6 rounded-2xl border border-slate-200 shadow-[0_12px_28px_rgba(15,23,42,0.04)] space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Owners</div>
          <div className="text-3xl font-black text-slate-900">{metrics.active_owners}</div>
          <Link to="/admin/owners" className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1">
            <span>Manage owners</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-gradient-to-br from-white to-violet-50 p-6 rounded-2xl border border-slate-200 shadow-[0_12px_28px_rgba(15,23,42,0.04)] space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Bookings (MTD)</div>
          <div className="text-3xl font-black text-slate-900">{metrics.bookings_this_month}</div>
          <Link to="/admin/bookings" className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1">
            <span>View transactions</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <Link to="/admin/bookings?status=CANCELLED_BY_CUSTOMER" className="bg-gradient-to-br from-white to-amber-50 p-6 rounded-2xl border border-slate-200 shadow-[0_12px_28px_rgba(15,23,42,0.04)] space-y-2 block hover:-translate-y-0.5 transition">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Refunds Due</div>
          <div className="text-3xl font-black text-amber-700">{metrics.refunds_due_count || 0}</div>
          <span className="text-xs text-slate-500">{formatCurrency(metrics.refunds_due_amount || 0)} awaiting refund</span>
        </Link>

        <div className="bg-gradient-to-br from-white to-amber-50 p-6 rounded-2xl border border-slate-200 shadow-[0_12px_28px_rgba(15,23,42,0.04)] space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Refunds (MTD)</div>
          <div className="text-3xl font-black text-amber-700">{metrics.refunds_this_month || 0}</div>
          <Link to="/admin/bookings?status=REFUNDED" className="text-xs font-semibold text-amber-700 hover:underline flex items-center gap-1">
            <span>{formatCurrency(metrics.refund_amount_mtd || 0)} refunded</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-gradient-to-br from-white to-emerald-50 p-6 rounded-2xl border border-slate-200 shadow-[0_12px_28px_rgba(15,23,42,0.04)] space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Commission Revenue</div>
          <div className="text-3xl font-black text-emerald-600">{formatCurrency(metrics.commission_revenue_mtd)}</div>
          <span className="text-xs text-slate-500">10% platform fee MTD</span>
        </div>
      </div>

      {/* Pending Approvals Table (Wireframe Admin Screen 1) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" /> Pending Hall Approvals
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Listings awaiting compliance verification</p>
          </div>
          <Link to="/admin/halls">
            <Button variant="outline" size="sm">
              View All Listings
            </Button>
          </Link>
        </div>

        {pending.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            No pending venue approval requests at this moment.
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow className="border-slate-800 bg-slate-800/50">
                <TableHeaderCell className="text-slate-300">Hall Name</TableHeaderCell>
                <TableHeaderCell className="text-slate-300">Owner / Business</TableHeaderCell>
                <TableHeaderCell className="text-slate-300">Locality</TableHeaderCell>
                <TableHeaderCell className="text-slate-300">Capacity</TableHeaderCell>
                <TableHeaderCell className="text-slate-300">Evening Rate</TableHeaderCell>
                <TableHeaderCell className="text-slate-300 text-right">Action</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pending.map((h) => (
                <TableRow key={h.id} className="border-slate-800 hover:bg-slate-800/40">
                  <TableCell>
                    <div className="font-bold text-white text-sm">{h.hall_name}</div>
                    <div className="text-xs text-slate-400">Submitted {formatDate(h.submitted_date)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-200">{h.owner_business || h.owner_name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-slate-300">{h.locality}, {h.city}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-slate-300">{h.min_capacity} - {h.max_capacity} Guests</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-bold text-slate-200">{formatCurrency(h.base_price_evening)}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="success"
                        size="sm"
                        icon={CheckCircle2}
                        onClick={() => handleApprove(h.id, h.hall_name)}
                        disabled={actionLoading}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={XCircle}
                        onClick={() => {
                          setSelectedHall(h);
                          setRejectModalOpen(true);
                        }}
                        disabled={actionLoading}
                      >
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title={`Reject Venue: ${selectedHall?.hall_name}`}
        description="Provide feedback to the hall owner regarding missing details or policies."
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Reason for Rejection
            </label>
            <textarea
              rows={4}
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Please upload higher quality photos of the banquet stage..."
              className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" isLoading={actionLoading}>
              Confirm Rejection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
