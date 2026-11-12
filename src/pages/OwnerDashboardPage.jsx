import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, CalendarCheck, CalendarDays, IndianRupee, Star, Building2, Plus, ArrowRight, Clock, Users, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
// import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/Card';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody
} from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/ui/Table';
import { Spinner } from '../components/ui/Feedback';
import { formatCurrency, formatDate } from '../utils/formatters';

export const OwnerDashboardPage = () => {
  const { user } = useAuth();
  const { showError } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/owner/dashboard/');
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        showError('Failed to load owner dashboard overview');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const metrics = data.metrics;
  const upcoming = data.upcoming_events;
  const verificationStatus = user?.owner_profile?.verification_status || 'PENDING';
  const verificationLabel = {
    PENDING: 'Verification pending',
    VERIFIED: 'Verified owner',
    REJECTED: 'Verification rejected',
    SUSPENDED: 'Account suspended',
  }[verificationStatus] || 'Verification pending';

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[26px] border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-violet-50 p-5 shadow-[0_12px_35px_rgba(99,102,241,0.08)]">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Venue Host Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time status of your bookings, venue revenue, and guest reviews</p>
        </div>
        <div className="flex gap-2">
          <Link to="/owner/onboarding">
            <Button variant="outline" size="sm" icon={Plus}>
              Add Venue
            </Button>
          </Link>
          <Link to="/owner/calendar">
            <Button variant="primary" size="sm" icon={CalendarDays}>
              View Calendar
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-orange-50 p-4 shadow-[0_10px_25px_rgba(251,191,36,0.08)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-700">Owner verification</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">{verificationLabel}</h2>
          </div>
          <Badge variant={verificationStatus === 'VERIFIED' ? 'success' : verificationStatus === 'PENDING' ? 'warning' : 'danger'}>
            {verificationStatus}
          </Badge>
        </div>
        <Link to="/owner/verification" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline">
          View KYC & verification status <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Wireframe Metric Cards (Screen 5) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5 border-slate-200 shadow-[0_12px_28px_rgba(15,23,42,0.04)] space-y-2 bg-gradient-to-br from-white to-indigo-50/50">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Requests</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">{metrics.pending_requests}</div>
          <Link to="/owner/bookings" className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
            <span>Respond now</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </Card>

        <Card className="p-5 border-slate-200 shadow-[0_12px_28px_rgba(15,23,42,0.04)] space-y-2 bg-gradient-to-br from-white to-emerald-50/60">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Confirmed (MTD)</span>
            <CalendarCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">{metrics.confirmed_this_month}</div>
          <span className="text-xs text-slate-400">Bookings this month</span>
        </Card>

        <Card className="p-5 border-slate-200 shadow-[0_12px_28px_rgba(15,23,42,0.04)] space-y-2 bg-gradient-to-br from-white to-violet-50/60">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Revenue (MTD)</span>
            <IndianRupee className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{formatCurrency(metrics.revenue_this_month)}</div>
          <Link to="/owner/earnings" className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
            <span>View payouts</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </Card>

        <Card className="p-5 border-slate-200 shadow-[0_12px_28px_rgba(15,23,42,0.04)] space-y-2 bg-gradient-to-br from-white to-amber-50/60">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Avg. Rating</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">{metrics.avg_rating > 0 ? metrics.avg_rating : "4.8"}★</div>
          <Link to="/owner/reviews" className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
            <span>Guest reviews</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </Card>
      </div>

      {/* Upcoming Events Table (Wireframe Screen 5) */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Scheduled reservations and pending responses</CardDescription>
          </div>
          <Link to="/owner/bookings">
            <Button variant="outline" size="sm">
              All Requests ({metrics.pending_requests + metrics.confirmed_this_month})
            </Button>
          </Link>
        </CardHeader>

        <CardBody className="p-0">
          {upcoming.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No upcoming events scheduled at this moment.
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Date & Slot</TableHeaderCell>
                  <TableHeaderCell>Venue</TableHeaderCell>
                  <TableHeaderCell>Customer</TableHeaderCell>
                  <TableHeaderCell>Guests</TableHeaderCell>
                  <TableHeaderCell>Gross Total</TableHeaderCell>
                  <TableHeaderCell className="text-right">Status</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {upcoming.map((evt) => (
                  <TableRow key={evt.id}>
                    <TableCell>
                      <div className="font-bold text-slate-900 text-xs">{formatDate(evt.event_date)}</div>
                      <div className="text-[11px] text-slate-400">{evt.time_slot}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-semibold text-slate-900">{evt.hall_name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-slate-800">{evt.customer_name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-slate-600">{evt.guest_count} guests</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-bold text-slate-900">{formatCurrency(evt.total_amount)}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={evt.status === 'CONFIRMED' ? 'success' : 'warning'}
                        size="sm"
                      >
                        {evt.status_display}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
