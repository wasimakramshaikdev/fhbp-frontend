import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, XCircle, Star, Eye, AlertCircle, IndianRupee } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { BookingStatusBadge } from '../components/ui/BookingStatusBadge';
import { Spinner, EmptyState } from '../components/ui/Feedback';
import { formatCurrency, formatDate } from '../utils/formatters';

export const MyBookingsPage = () => {
  const { showSuccess, showError } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [payBalanceModalOpen, setPayBalanceModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/');
      if (res.success) {
        setBookings(res.data);
      }
    } catch (err) {
      showError('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const cancelledStatuses = ['CANCELLED', 'CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_OWNER', 'CANCELLED_BY_ADMIN', 'REFUNDED'];

  const tabs = [
    { id: 'upcoming', label: 'Upcoming', count: bookings.filter((b) => !cancelledStatuses.includes(b.status) && b.status !== 'COMPLETED').length },
    { id: 'past', label: 'Past', count: bookings.filter((b) => b.status === 'COMPLETED').length },
    { id: 'cancelled', label: 'Cancelled', count: bookings.filter((b) => cancelledStatuses.includes(b.status)).length },
  ];

  const visibleBookings = bookings.filter((b) => {
    if (activeTab === 'upcoming') return !cancelledStatuses.includes(b.status) && b.status !== 'COMPLETED';
    if (activeTab === 'past') return b.status === 'COMPLETED';
    if (activeTab === 'cancelled') return cancelledStatuses.includes(b.status);
    return true;
  });

  const attentionCount = bookings.filter((b) => cancelledStatuses.includes(b.status)).length;

  const handleCancelBooking = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      showError('Please provide a cancellation reason');
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.post(`/bookings/${selectedBooking.id}/cancel/`, { reason: cancelReason });
      if (res.success) {
        showSuccess(res.message);
        setCancelModalOpen(false);
        setCancelReason('');
        fetchBookings();
      }
    } catch (err) {
      showError(err.message || 'Failed to cancel booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayBalance = async () => {
    try {
      setActionLoading(true);
      const initRes = await api.post('/payments/razorpay/order/', {
        booking_id: selectedBooking.id,
        payment_type: 'BALANCE',
      });

      if (!initRes.success || !initRes.data?.gateway_order_id) {
        throw new Error(initRes.message || 'Payment initiation failed');
      }

      const orderData = initRes.data;
      const completeVerification = async (verifyPayload) => {
        const verifyRes = await api.post('/payments/razorpay/verify/', verifyPayload);
        if (!verifyRes.success) {
          throw new Error(verifyRes.message || 'Payment verification failed');
        }
        showSuccess('Balance payment verified and confirmed!');
        setPayBalanceModalOpen(false);
        fetchBookings();
      };

      const loadRazorpayScript = () => {
        return new Promise((resolve) => {
          if (typeof window !== 'undefined' && window.Razorpay) {
            resolve(true);
            return;
          }
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const scriptLoaded = await loadRazorpayScript();

      if (scriptLoaded && window.Razorpay && orderData.key_id && !orderData.key_id.startsWith('sim_')) {
        const options = {
          key: orderData.key_id,
          amount: orderData.amount_subunits || Math.round(orderData.amount * 100),
          currency: orderData.currency || 'INR',
          name: 'PotlaEventSpaces',
          description: `Balance Settlement for Booking #${selectedBooking.booking_number}`,
          image: '/favicon.svg',
          order_id: orderData.gateway_order_id || orderData.order_id,
          handler: async function (response) {
            try {
              setActionLoading(true);
              await completeVerification({
                gateway_order_id: response.razorpay_order_id,
                gateway_payment_id: response.razorpay_payment_id,
                gateway_signature: response.razorpay_signature,
              });
            } catch (err) {
              showError(err.message || 'Payment verification failed');
            } finally {
              setActionLoading(false);
            }
          },
          prefill: {
            name: orderData.contact_name || '',
            email: orderData.contact_email || '',
            contact: orderData.contact_phone || '',
          },
          theme: { color: '#4f46e5' },
          modal: { ondismiss: () => setActionLoading(false) },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        await completeVerification({
          gateway_order_id: orderData.gateway_order_id,
          gateway_payment_id: `pay_sim_${Date.now()}`,
          gateway_signature: 'valid_simulated_signature',
        });
      }
    } catch (err) {
      showError(err.message || 'Balance payment failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      showError('Please write a comment sharing your experience');
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.post(`/bookings/${selectedBooking.id}/review/`, { rating: reviewRating, comment: reviewComment });
      if (res.success) {
        showSuccess('Thank you! Your verified review has been published.');
        setReviewModalOpen(false);
        setReviewComment('');
        setReviewRating(5);
        fetchBookings();
      }
    } catch (err) {
      showError(err.message || 'Failed to submit review');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Spinner size="lg" /></div>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.08),_transparent_20%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_24%,_#f8fafc_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">My bookings</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your upcoming events, review completed stays, and track cancellations.</p>
        </div>

        {attentionCount > 0 && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-orange-50 px-4 py-3 text-sm text-amber-900 shadow-[0_10px_20px_rgba(251,191,36,0.08)]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            <span>
              You have <span className="font-bold">{attentionCount}</span> booking status update{attentionCount > 1 ? 's' : ''} requiring attention, including cancellations and refunds.
            </span>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-[0_10px_24px_rgba(15,23,42,0.04)] backdrop-blur-sm">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  activeTab === tab.id ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label} {tab.count > 0 && <span className="ml-1 text-xs opacity-80">({tab.count})</span>}
              </button>
            ))}
          </div>
        </div>

        {bookings.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No bookings yet"
            description="You haven't made any function hall reservations yet. Browse Hyderabad venues to get started."
            action={<Link to="/search"><Button variant="primary">Browse function halls</Button></Link>}
          />
        ) : visibleBookings.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No bookings in this section"
            description="Try another tab to view your event history or upcoming bookings."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {visibleBookings.map((b) => {
              const isConfirmed = b.status === 'CONFIRMED';
              const isPendingOwner = b.status === 'PENDING_OWNER_CONFIRMATION';
              const isCompleted = b.status === 'COMPLETED';
              const isRefunded = b.status === 'REFUNDED';
              const isCancelled = ['CANCELLED', 'CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_OWNER', 'CANCELLED_BY_ADMIN', 'REFUNDED'].includes(b.status);
              const isCustomerCancelled = b.status === 'CANCELLED_BY_CUSTOMER';
              const isPaidFull = parseFloat(b.amount_paid) >= parseFloat(b.total_amount);
              const balanceDue = parseFloat(b.total_amount) - parseFloat(b.amount_paid);
              const refundAmount = parseFloat(b.refund_amount || 0);
              const cancellationLabel =
                b.status === 'CANCELLED_BY_CUSTOMER'
                  ? 'Cancelled by customer'
                  : b.status === 'CANCELLED_BY_OWNER'
                    ? 'Cancelled by owner'
                    : b.status === 'CANCELLED_BY_ADMIN'
                      ? 'Cancelled by admin'
                      : b.status === 'CANCELLED'
                        ? 'Cancelled'
                        : isRefunded
                          ? 'Refund processed'
                          : 'Cancelled';

              return (
                <Card key={b.id} className={`overflow-hidden border-slate-200 shadow-[0_16px_28px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_36px_rgba(79,70,229,0.12)] ${isCancelled ? 'ring-1 ring-rose-100 bg-gradient-to-r from-white to-rose-50/40' : 'bg-white'}`}>
                  <div className="flex flex-col sm:flex-row">
                    <div className="w-full sm:w-56">
                      <img
                        src={b.primary_image || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=400&q=80'}
                        alt={b.hall_name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex-1 p-5 sm:p-6">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">#{b.booking_number}</span>
                            <BookingStatusBadge status={b.status} />
                          </div>
                          <h3 className="mt-2 text-xl font-bold text-slate-900">{b.hall_name}</h3>
                          <p className="text-xs text-slate-500">{b.hall_locality}, {b.hall_city}</p>
                        </div>

                        <div className="text-left sm:text-right">
                          <div className="text-lg font-black text-slate-900">
                            {isRefunded ? formatCurrency(refundAmount || b.amount_paid) : `${formatCurrency(b.amount_paid)} `}
                            {!isRefunded && <span className="text-xs font-normal text-slate-400">/ {formatCurrency(b.total_amount)}</span>}
                          </div>
                          <div className="text-[11px] font-semibold text-emerald-600">
                            {isRefunded
                              ? `Refunded to customer: ${formatCurrency(refundAmount || b.amount_paid)}`
                              : isCustomerCancelled
                                ? 'Customer cancellation initiated; no balance due'
                                : (isPaidFull ? 'Fully paid' : `Balance due: ${formatCurrency(balanceDue)}`)}
                          </div>
                        </div>
                      </div>

                      {isCancelled && (
                        <div className={`mt-4 flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${isRefunded ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
                          <AlertCircle className={`h-4 w-4 ${isRefunded ? 'text-amber-700' : 'text-rose-600'}`} />
                          <span>
                            {isRefunded
                              ? `Refund processed: ${formatCurrency(refundAmount || b.amount_paid)}`
                              : `${cancellationLabel} • no further action needed`}
                          </span>
                        </div>
                      )}

                      <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600 sm:grid-cols-3">
                        <div><span className="block text-slate-400">Date</span><span className="mt-1 block font-bold text-slate-900">{formatDate(b.event_date)}</span></div>
                        <div><span className="block text-slate-400">Slot</span><span className="mt-1 block font-bold text-slate-900">{b.time_slot}</span></div>
                        <div><span className="block text-slate-400">Guests</span><span className="mt-1 block font-bold text-slate-900">{b.guest_count}</span></div>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        <Button variant="outline" size="sm" icon={Eye} onClick={() => { setSelectedBooking(b); setDetailModalOpen(true); }}>
                          View details
                        </Button>

                        <div className="flex flex-wrap items-center gap-2">
                          {isConfirmed && !isPaidFull && !isCustomerCancelled && (
                            <Button variant="primary" size="sm" icon={IndianRupee} onClick={() => { setSelectedBooking(b); setPayBalanceModalOpen(true); }}>
                              Pay balance ({formatCurrency(balanceDue)})
                            </Button>
                          )}

                          {isCompleted && (
                            <Button variant="primary" size="sm" icon={Star} onClick={() => { setSelectedBooking(b); setReviewModalOpen(true); }}>
                              Leave a review
                            </Button>
                          )}

                          {(isConfirmed || isPendingOwner) && (
                            <Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50" icon={XCircle} onClick={() => { setSelectedBooking(b); setCancelModalOpen(true); }}>
                              Cancel booking
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {selectedBooking && (
        <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} title={`Booking details: #${selectedBooking.booking_number}`} description={`${selectedBooking.hall_name} on ${formatDate(selectedBooking.event_date)}`}>
          <div className="space-y-4 text-xs text-slate-600">
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex justify-between"><span>Status</span><BookingStatusBadge status={selectedBooking.status} /></div>
              <div className="flex justify-between"><span>Time slot</span><span className="font-bold text-slate-900">{selectedBooking.time_slot}</span></div>
              <div className="flex justify-between"><span>Expected guests</span><span className="font-bold text-slate-900">{selectedBooking.guest_count}</span></div>
              <div className="flex justify-between border-t border-slate-200 pt-2"><span>Total quotation</span><span className="font-bold text-slate-900">{formatCurrency(selectedBooking.total_amount)}</span></div>
              {selectedBooking.status === 'REFUNDED' ? (
                <div className="flex justify-between font-bold text-amber-700"><span>Refund processed</span><span>{formatCurrency(selectedBooking.refund_amount || selectedBooking.amount_paid)}</span></div>
              ) : (
                <div className="flex justify-between font-bold text-emerald-700"><span>Amount paid</span><span>{formatCurrency(selectedBooking.amount_paid)}</span></div>
              )}
            </div>
            <div className="flex justify-end"><Button variant="primary" onClick={() => setDetailModalOpen(false)}>Close</Button></div>
          </div>
        </Modal>
      )}

      {selectedBooking && (
        <Modal isOpen={cancelModalOpen} onClose={() => setCancelModalOpen(false)} title={`Cancel booking #${selectedBooking.booking_number}`} description="Are you sure you want to cancel this reservation?">
          <form onSubmit={handleCancelBooking} className="space-y-4">
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-900">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <span>Refund will be calculated automatically based on the venue's cancellation policy and days remaining until the event.</span>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Reason for cancellation</label>
              <textarea rows={3} required value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="e.g. Change in wedding date, personal emergency..." className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-rose-500 focus:outline-none" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setCancelModalOpen(false)}>Keep booking</Button>
              <Button type="submit" variant="danger" isLoading={actionLoading}>Confirm cancellation</Button>
            </div>
          </form>
        </Modal>
      )}

      {selectedBooking && (
        <Modal isOpen={payBalanceModalOpen} onClose={() => setPayBalanceModalOpen(false)} title="Pay outstanding balance" description={`Settlement for booking #${selectedBooking.booking_number}`}>
          <div className="space-y-4 text-xs">
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex justify-between"><span>Total booking amount</span><span className="font-semibold text-slate-900">{formatCurrency(selectedBooking.total_amount)}</span></div>
              <div className="flex justify-between"><span>Advance already paid</span><span className="font-semibold text-emerald-600">-{formatCurrency(selectedBooking.amount_paid)}</span></div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-indigo-600"><span>Balance due now</span><span>{formatCurrency(parseFloat(selectedBooking.total_amount) - parseFloat(selectedBooking.amount_paid))}</span></div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPayBalanceModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handlePayBalance} isLoading={actionLoading}>Pay balance via UPI / Card</Button>
            </div>
          </div>
        </Modal>
      )}

      {selectedBooking && (
        <Modal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title={`Rate & review: ${selectedBooking.hall_name}`} description={`Verified review for event completed on ${formatDate(selectedBooking.event_date)}`}>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Star rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setReviewRating(star)} className="p-1 text-2xl transition hover:scale-110 focus:outline-none">
                    <Star className={`h-7 w-7 ${reviewRating >= star ? 'fill-amber-500 text-amber-500' : 'text-slate-200'}`} />
                  </button>
                ))}
                <span className="ml-2 text-sm font-bold text-slate-800">{reviewRating}.0 stars</span>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Your review & experience</label>
              <textarea rows={4} required value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Share your thoughts about the ambience, air conditioning, stage lighting, and staff hospitality..." className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setReviewModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary" isLoading={actionLoading}>Submit verified review</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
