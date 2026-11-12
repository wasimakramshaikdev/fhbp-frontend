import React, { useState, useEffect } from 'react';
import { Scale, AlertCircle, CheckCircle2, XCircle, Eye, ShieldCheck, IndianRupee, ExternalLink } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/ui/Table';
import { Spinner, EmptyState } from '../components/ui/Feedback';
import { formatCurrency, formatDate } from '../utils/formatters';

export const AdminDisputesPage = () => {
  const { showSuccess, showError } = useToast();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Settlement Modal State
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolutionType, setResolutionType] = useState('CUSTOMER_REFUND');
  const [refundAmount, setRefundAmount] = useState(0);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/disputes/');
      if (res.success) {
        setDisputes(res.data);
      }
    } catch (err) {
      showError('Failed to load dispute cases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleOpenResolveModal = (disp) => {
    setSelectedDispute(disp);
    setRefundAmount(disp.amount_paid || 0);
    setResolutionType('CUSTOMER_REFUND');
    setAdminNotes('');
    setResolveModalOpen(true);
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!adminNotes.trim()) {
      showError('Please provide administrative resolution notes');
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        resolution_type: resolutionType,
        refund_amount: resolutionType.includes('REFUND') ? parseFloat(refundAmount) || 0 : 0,
        admin_notes: adminNotes,
      };

      const res = await api.post(`/admin/disputes/${selectedDispute.id}/resolve/`, payload);
      if (res.success) {
        showSuccess(res.message);
        setResolveModalOpen(false);
        fetchDisputes();
      }
    } catch (err) {
      showError(err.message || 'Failed to settle dispute');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bookings & Dispute Resolution</h1>
        <p className="text-sm text-slate-500 mt-1">Review customer dispute evidence, adjudicate conflicting claims, and execute escrow refunds</p>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : disputes.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="No open disputes"
          description="There are currently zero active dispute tickets or refund claims lodged across the platform."
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_10px_25px_rgba(15,23,42,0.04)]">
          <Table>
            <TableHead>
              <TableRow className="border-slate-200 bg-slate-50">
                <TableHeaderCell className="text-slate-600">Booking ID & Venue</TableHeaderCell>
                <TableHeaderCell className="text-slate-600">Customer & Claim</TableHeaderCell>
                <TableHeaderCell className="text-slate-600">Amount Paid</TableHeaderCell>
                <TableHeaderCell className="text-slate-600">Status</TableHeaderCell>
                <TableHeaderCell className="text-slate-600">Lodged Date</TableHeaderCell>
                <TableHeaderCell className="text-slate-600 text-right">Action</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {disputes.map((disp) => {
                const isOpen = disp.status === 'OPEN' || disp.status === 'UNDER_REVIEW';

                return (
                  <TableRow key={disp.id} className="border-slate-200 hover:bg-slate-50">
                    <TableCell>
                      <div className="font-bold text-slate-900 text-sm">#{disp.booking_number}</div>
                      <div className="text-xs text-slate-500">{disp.hall_name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-semibold text-slate-700">{disp.customer_name}</div>
                      <div className="text-xs text-amber-600 font-medium">{disp.reason}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-bold text-slate-900">{formatCurrency(disp.amount_paid)}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isOpen ? 'warning' : 'success'} size="sm">
                        {disp.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {formatDate(disp.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      {isOpen ? (
                        <Button
                          variant="danger"
                          size="sm"
                          icon={Scale}
                          onClick={() => handleOpenResolveModal(disp)}
                        >
                          Review & Resolve
                        </Button>
                      ) : (
                        <Badge variant="default" size="sm">
                          {disp.resolution_type}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Settle Dispute Modal (Wireframe Admin Screen 3) */}
      {selectedDispute && (
        <Modal
          isOpen={resolveModalOpen}
          onClose={() => setResolveModalOpen(false)}
          maxWidth="max-w-2xl"
          title={`Dispute Case: #${selectedDispute.booking_number}`}
          description={`Customer: ${selectedDispute.customer_name} • Venue: ${selectedDispute.hall_name}`}
        >
          <form onSubmit={handleResolveSubmit} className="space-y-6 text-xs text-slate-900">
            {/* Case Details Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div>
                <span className="font-bold text-slate-500 block uppercase tracking-wider text-[10px]">Claim Reason</span>
                <span className="font-bold text-rose-700 text-sm">{selectedDispute.reason}</span>
              </div>

              <div>
                <span className="font-bold text-slate-500 block uppercase tracking-wider text-[10px]">Description & Evidence</span>
                <p className="text-slate-700 leading-relaxed mt-0.5">{selectedDispute.description}</p>
              </div>

              {selectedDispute.evidence_urls?.length > 0 && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-500 block text-[10px] mb-1">Attached Evidence:</span>
                  <div className="flex gap-2">
                    {selectedDispute.evidence_urls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-[11px] hover:bg-indigo-100"
                      >
                        Evidence #{idx + 1} <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Resolution Selector */}
            <div className="space-y-3">
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Adjudication Decision
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'CUSTOMER_REFUND', label: 'Issue Full Refund', desc: `Refund ₹${selectedDispute.amount_paid}` },
                  { id: 'PARTIAL_REFUND', label: 'Partial Settlement', desc: 'Custom refund amount' },
                  { id: 'OWNER_FAVORED', label: 'Reject Claim', desc: 'Release payout to owner' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setResolutionType(opt.id)}
                    className={`p-3 rounded-xl border text-left transition ${
                      resolutionType === opt.id
                        ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-500/20'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-slate-900">{opt.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {resolutionType === 'PARTIAL_REFUND' && (
              <Input
                label="Partial Refund Amount (₹)"
                type="number"
                max={selectedDispute.amount_paid}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                required
              />
            )}

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Official Compliance Notes
              </label>
              <textarea
                rows={3}
                required
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Explain the legal / policy justification for this decision (recorded in immutable audit trail)..."
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" onClick={() => setResolveModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={actionLoading}>
                Execute Resolution Decision
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
