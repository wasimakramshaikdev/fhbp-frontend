import React, { useState, useEffect } from 'react';
import { Building2, CheckCircle2, XCircle, AlertCircle, Eye, ShieldCheck, Filter } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/ui/Table';
import { Spinner, EmptyState } from '../components/ui/Feedback';
import { formatCurrency, formatDate } from '../utils/formatters';

export const AdminHallsPage = () => {
  const { showSuccess, showError } = useToast();
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Rejection Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedHall, setSelectedHall] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchHalls = async () => {
    try {
      setLoading(true);
      const url = statusFilter ? `/admin/halls/?status=${statusFilter}` : '/admin/halls/';
      const res = await api.get(url);
      if (res.success) {
        setHalls(res.data);
      }
    } catch (err) {
      showError(err.message || 'Failed to load halls queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHalls();
  }, [statusFilter]);

  const handleApprove = async (hall) => {
    try {
      setActionLoading(true);
      const res = await api.post(`/admin/halls/${hall.id}/action/`, { action: 'APPROVE' });
      if (res.success) {
        showSuccess(`Approved '${hall.name}'! Listing is now active.`);
        fetchHalls();
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
      showError('Please provide a reason for rejecting the listing');
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.post(`/admin/halls/${selectedHall.id}/action/`, {
        action: 'REJECT',
        reason: rejectionReason,
      });
      if (res.success) {
        showSuccess(`Listing '${selectedHall.name}' has been rejected with feedback.`);
        setRejectModalOpen(false);
        setRejectionReason('');
        setSelectedHall(null);
        fetchHalls();
      }
    } catch (err) {
      showError(err.message || 'Rejection action failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Function Hall Approval Queue</h1>
          <p className="text-sm text-slate-500 mt-1">Review owner submissions, inspect capacity & policies, and approve marketplace listings</p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none"
          >
            <option value="">All Listings</option>
            <option value="UNDER_REVIEW">Pending Review</option>
            <option value="APPROVED">Approved / Live</option>
            <option value="REJECTED">Rejected</option>
            <option value="DRAFT">Drafts</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : halls.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No venue listings found"
          description="There are currently no listings matching this filter."
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_10px_25px_rgba(15,23,42,0.04)]">
          <Table>
            <TableHead>
              <TableRow className="border-slate-200 bg-slate-50">
                <TableHeaderCell className="text-slate-600">Hall Name & Locality</TableHeaderCell>
                <TableHeaderCell className="text-slate-600">Owner & Business</TableHeaderCell>
                <TableHeaderCell className="text-slate-600">Capacity & Type</TableHeaderCell>
                <TableHeaderCell className="text-slate-600">Pricing (Evening)</TableHeaderCell>
                <TableHeaderCell className="text-slate-600">Approval State</TableHeaderCell>
                <TableHeaderCell className="text-slate-600 text-right">Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {halls.map((hall) => {
                const isUnderReview = hall.approval_status === 'UNDER_REVIEW';
                const isApproved = hall.approval_status === 'APPROVED';
                const isRejected = hall.approval_status === 'REJECTED';

                return (
                  <TableRow key={hall.id} className="border-slate-200 hover:bg-slate-50">
                    <TableCell>
                      <div className="font-bold text-slate-900 text-sm">{hall.name}</div>
                      <div className="text-xs text-slate-500">{hall.locality}, {hall.city}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-slate-700">{hall.owner_business || hall.owner_name}</div>
                      <div className="text-xs text-slate-500">{hall.owner_phone || 'No phone'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-slate-600">{hall.min_capacity} - {hall.max_capacity} Guests</div>
                      <Badge variant="primary" size="sm">{hall.hall_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-bold text-slate-900">{formatCurrency(hall.base_price_evening)}</div>
                      <div className="text-[11px] text-slate-500">{hall.advance_percentage}% advance</div>
                    </TableCell>
                    <TableCell>
                      {isUnderReview && <Badge variant="warning">Under Review</Badge>}
                      {isApproved && <Badge variant="success">Approved</Badge>}
                      {isRejected && <Badge variant="danger">Rejected</Badge>}
                      {hall.approval_status === 'DRAFT' && <Badge variant="default">Draft</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isUnderReview && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              icon={CheckCircle2}
                              onClick={() => handleApprove(hall)}
                              disabled={actionLoading}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              icon={XCircle}
                              onClick={() => {
                                setSelectedHall(hall);
                                setRejectModalOpen(true);
                              }}
                              disabled={actionLoading}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {isApproved && (
                          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-4 h-4" /> Live
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Reject Reason Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title={`Reject Listing: ${selectedHall?.name}`}
        description="Specify why this listing cannot be approved so the owner can rectify and re-submit."
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Reason for Rejection / Required Modifications
            </label>
            <textarea
              rows={4}
              required
              className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:border-rose-500 focus:outline-none"
              placeholder="e.g. Please upload higher quality photos of the banquet stage and attach valid GST registration certificate..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
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
