import React, { useState, useEffect } from 'react';
import { CalendarRange, Filter, Search, IndianRupee } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/ui/Table';
import { BookingStatusBadge } from '../components/ui/BookingStatusBadge';
import { Spinner, EmptyState } from '../components/ui/Feedback';
import { formatCurrency, formatDate } from '../utils/formatters';

export const AdminBookingsPage = () => {
  const { showError } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const url = statusFilter ? `/admin/bookings/?status=${statusFilter}` : '/admin/bookings/';
      const res = await api.get(url);
      if (res.success) {
        setBookings(res.data);
      }
    } catch (err) {
      showError('Failed to load bookings list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Bookings Monitor</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time oversight across all function hall bookings, escrow payments, and cancellations</p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none"
        >
          <option value="">All Booking Statuses</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PENDING_OWNER_CONFIRMATION">Awaiting Owner</option>
          <option value="COMPLETED">Completed</option>
          <option value="DISPUTED">Disputed</option>
          <option value="CANCELLED_BY_CUSTOMER">Refund Due / Cancelled by Customer</option>
          <option value="CANCELLED_BY_OWNER">Cancelled by Owner</option>
          <option value="CANCELLED_BY_ADMIN">Cancelled by Admin</option>
          <option value="REFUND_PENDING">Refund Pending</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title="No bookings found"
          description="There are no reservations matching your filter."
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_10px_25px_rgba(15,23,42,0.04)]">
          <Table>
            <TableHead>
              <TableRow className="border-slate-200 bg-slate-50">
                <TableHeaderCell className="text-slate-600">Booking Ref</TableHeaderCell>
                <TableHeaderCell className="text-slate-600">Venue</TableHeaderCell>
                <TableHeaderCell className="text-slate-600">Customer</TableHeaderCell>
                <TableHeaderCell className="text-slate-600">Event Date & Slot</TableHeaderCell>
                <TableHeaderCell className="text-slate-600">Gross Total</TableHeaderCell>
                <TableHeaderCell className="text-slate-600">Paid Amount</TableHeaderCell>
                <TableHeaderCell className="text-slate-600 text-right">Status</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((b) => {
                const isCancelled = ['CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_OWNER', 'CANCELLED_BY_ADMIN', 'REFUNDED'].includes(b.status);
                const isRefunded = b.status === 'REFUNDED';

                return (
                <TableRow key={b.id} className={`border-slate-200 hover:bg-slate-50 ${isCancelled ? 'bg-rose-50/40' : ''}`}>
                  <TableCell>
                    <div className="font-bold text-slate-900 text-xs">#{b.booking_number}</div>
                    <div className="text-[10px] text-slate-500">{formatDate(b.created_at)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-semibold text-slate-700">{b.hall_name}</div>
                    <div className="text-[10px] text-slate-500">Host: {b.owner_name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-slate-700 font-medium">{b.customer_name}</div>
                    <div className="text-[10px] text-slate-500">{b.customer_email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-slate-700">{formatDate(b.event_date)}</div>
                    <div className="text-[10px] text-slate-500">{b.time_slot} ({b.guest_count} guests)</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-bold text-slate-900">{formatCurrency(b.total_amount)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-bold text-emerald-600">{formatCurrency(b.amount_paid)}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end gap-2">
                      <BookingStatusBadge status={b.status} />
                      {isCancelled && (
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-bold ${isRefunded ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-700'}`}>
                          {isRefunded ? `Refund processed: ${formatCurrency(b.refund_amount || b.amount_paid)}` : 'Cancellation recorded'}
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
    </div>
  );
};
