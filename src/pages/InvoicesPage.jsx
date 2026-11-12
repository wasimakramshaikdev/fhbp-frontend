import React, { useState, useEffect } from 'react';
import { Receipt, Download, Printer, Eye, CheckCircle2, ShieldCheck, Building2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/ui/Table';
import { Spinner, EmptyState } from '../components/ui/Feedback';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';

export const InvoicesPage = () => {
  const { showError } = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Invoice Viewer Modal
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments/invoices/');
      if (res.success) {
        setPayments(res.data);
      }
    } catch (err) {
      showError('Failed to load payments history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleViewInvoice = async (bookingId) => {
    try {
      setInvoiceLoading(true);
      setInvoiceModalOpen(true);
      const res = await api.get(`/payments/booking/${bookingId}/invoice/`);
      if (res.success) {
        setInvoiceData(res.data);
      }
    } catch (err) {
      showError('Failed to load tax invoice');
      setInvoiceModalOpen(false);
    } finally {
      setInvoiceLoading(false);
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
        <h1 className="text-2xl font-bold text-slate-900">Payments & Tax Invoices</h1>
        <p className="text-sm text-slate-500 mt-1">Download GST-compliant tax invoices, payment receipts, and settlement history</p>
      </div>

      {payments.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No payment records found"
          description="When you make advance or balance payments for function halls, your official GST tax invoices will appear here."
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Payment Ref & Receipt</TableHeaderCell>
                <TableHeaderCell>Booking Ref & Venue</TableHeaderCell>
                <TableHeaderCell>Event Date</TableHeaderCell>
                <TableHeaderCell>Amount</TableHeaderCell>
                <TableHeaderCell>Method</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell className="text-right">Tax Invoice</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-bold text-slate-900 text-sm">{p.payment_reference}</div>
                    <div className="text-[11px] text-slate-400">{formatDateTime(p.paid_at || p.created_at)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-900 text-xs">#{p.booking_number}</div>
                    <div className="text-xs text-slate-500">{p.hall_name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-semibold text-slate-700">{formatDate(p.event_date)}</div>
                    <div className="text-[10px] text-slate-400">{p.payment_type}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-bold text-slate-900">{formatCurrency(p.amount)}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" size="sm">{p.payment_method}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="success" size="sm">Paid</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Eye}
                      onClick={() => handleViewInvoice(p.booking_id)}
                    >
                      View Invoice
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Tax Invoice Modal */}
      <Modal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        maxWidth="max-w-2xl"
        title="Tax Invoice / Receipt"
      >
        {invoiceLoading || !invoiceData ? (
          <div className="p-8 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="space-y-6 text-xs text-slate-700">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-black tracking-tight text-slate-900">
                  HALL<span className="text-indigo-600">BOOK</span>
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{invoiceData.seller.business_name}</h3>
                <p className="text-[11px] text-slate-500">{invoiceData.seller.address}</p>
                <div className="text-[11px] font-bold text-indigo-700 mt-1">GSTIN: {invoiceData.seller.gstin}</div>
              </div>
              <div className="text-right">
                <Badge variant="success">ORIGINAL TAX INVOICE</Badge>
                <div className="text-xs font-bold text-slate-900 mt-2">#{invoiceData.invoice_number}</div>
                <div className="text-[11px] text-slate-500">Date: {formatDate(invoiceData.invoice_date)}</div>
                <div className="text-[11px] text-slate-500">Booking: #{invoiceData.booking_number}</div>
              </div>
            </div>

            {/* Customer & Event Details */}
            <div className="grid grid-cols-2 gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block mb-0.5">Billed To (Customer):</span>
                <div>{invoiceData.customer.full_name}</div>
                <div className="text-slate-500">{invoiceData.customer.email}</div>
                <div className="text-slate-500">{invoiceData.customer.phone}</div>
              </div>
              <div>
                <span className="font-bold text-slate-900 block mb-0.5">Event Information:</span>
                <div>{invoiceData.event_details.venue_name}</div>
                <div className="text-slate-500">
                  {formatDate(invoiceData.event_details.event_date)} ({invoiceData.event_details.time_slot})
                </div>
                <div className="text-slate-500">{invoiceData.event_details.guest_count} Expected Guests</div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-[11px] font-bold text-slate-600 uppercase">
                  <tr>
                    <th className="p-2.5">Description</th>
                    <th className="p-2.5">SAC Code</th>
                    <th className="p-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoiceData.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5">{item.description}</td>
                      <td className="p-2.5 text-slate-500">{item.sac_code}</td>
                      <td className="p-2.5 text-right font-medium text-slate-900">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 ml-auto w-full sm:w-80 text-right">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Subtotal:</span>
                <span>{formatCurrency(invoiceData.financial_summary.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>CGST (9.0%):</span>
                <span>{formatCurrency(invoiceData.financial_summary.cgst_amount)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>SGST (9.0%):</span>
                <span>{formatCurrency(invoiceData.financial_summary.sgst_amount)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200 text-sm">
                <span>Grand Total:</span>
                <span>{formatCurrency(invoiceData.financial_summary.grand_total)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Total Amount Paid:</span>
                <span>{formatCurrency(invoiceData.financial_summary.amount_paid)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-xs">
                <span>Balance Due:</span>
                <span>{formatCurrency(invoiceData.financial_summary.balance_due)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <span className="text-[10px] text-slate-400">
                This is a computer-generated tax invoice issued by PotlaEventSpaces Technologies Pvt Ltd.
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" icon={Printer} onClick={() => window.print()}>
                  Print
                </Button>
                <Button variant="primary" size="sm" onClick={() => setInvoiceModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
