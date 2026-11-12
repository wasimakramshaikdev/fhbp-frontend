import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { Building2, Calendar, Users, Clock, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, CreditCard, QrCode, Landmark, Receipt } from 'lucide-react';
import api, { getStoredAccessToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card, CardHeader, CardTitle, CardDescription, CardBody, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PriceBreakdown } from '../components/ui/PriceBreakdown';
import { formatCurrency, formatDate } from '../utils/formatters';

const getLocalISODate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getMinBookingDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return getLocalISODate(date);
};

export const CheckoutPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const stateData = location.state || {};

  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Confirmation
  const [loading, setLoading] = useState(false);
  const [hall, setHall] = useState(stateData.hall || null);
  const [bookingResult, setBookingResult] = useState(null);

  // Form State
  const [eventDate, setEventDate] = useState(stateData.eventDate || getMinBookingDate());
  const [timeSlot, setTimeSlot] = useState(stateData.timeSlot || 'EVENING');
  const [guestCount, setGuestCount] = useState(stateData.guestCount || 300);
  const [guestError, setGuestError] = useState('');
  const [eventDateError, setEventDateError] = useState('');
  const [contactName, setContactName] = useState(user?.full_name || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [specialRequests, setSpecialRequests] = useState('');

  // Add-ons State
  const [hasCatering, setHasCatering] = useState(stateData.hasCatering ?? true);
  const [cateringType, setCateringType] = useState(stateData.cateringType || 'VEG');
  const [hasDecor, setHasDecor] = useState(stateData.hasDecor ?? false);
  const [hasDj, setHasDj] = useState(stateData.hasDj ?? false);

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  // Sync contact details when user state loads
  useEffect(() => {
    if (user) {
      if (!contactName && user.full_name) setContactName(user.full_name);
      if (!contactPhone && user.phone) setContactPhone(user.phone);
    }
  }, [user]);

  // Fetch Hall if not in router state
  useEffect(() => {
    if (!hall) {
      const fetchHall = async () => {
        try {
          const res = await api.get(`/halls/${slug}/`);
          if (res.success) {
            setHall(res.data);
            setGuestCount(Math.max(res.data.min_capacity, 250));
          }
        } catch (e) {
          showError('Failed to load venue for booking');
        }
      };
      fetchHall();
    }
  }, [slug, hall]);

  if (!hall) {
    return <div className="min-h-[50vh] flex items-center justify-center"><p className="text-sm text-slate-500">Loading checkout...</p></div>;
  }

  // Calculated Quotation
  const rent = timeSlot === 'MORNING'
    ? parseFloat(hall.base_price_morning)
    : timeSlot === 'EVENING'
    ? parseFloat(hall.base_price_evening)
    : parseFloat(hall.base_price_full_day);

  const perPlate = cateringType === 'VEG' ? parseFloat(hall.veg_plate_price) : parseFloat(hall.non_veg_plate_price);
  const cateringAmount = hasCatering ? (guestCount * perPlate) : 0;
  const decorAmount = hasDecor ? parseFloat(hall.decor_price) : 0;
  const djAmount = hasDj ? parseFloat(hall.dj_price) : 0;

  const subtotal = rent + cateringAmount + decorAmount + djAmount;
  const taxAmount = subtotal * 0.18;
  const totalAmount = subtotal + taxAmount;
  const advancePercentage = parseFloat(hall.advance_percentage) || 20;
  const advanceAmount = totalAmount * (advancePercentage / 100);
  const balanceAmount = totalAmount - advanceAmount;

  const validateGuestCount = (value) => {
    if (Number.isNaN(Number(value))) {
      return 'Please enter a valid guest count.';
    }

    if (value < hall.min_capacity || value > hall.max_capacity) {
      return `Guest count must be between ${hall.min_capacity} and ${hall.max_capacity}.`;
    }

    return '';
  };

  const validateEventDateInput = (value) => {
    if (!value) {
      return 'Please select an event date.';
    }

    const today = getLocalISODate(new Date());
    if (value < today) {
      return 'Event date cannot be in the past.';
    }

    const minimumBookingDate = getMinBookingDate();
    if (value < minimumBookingDate) {
      return 'Bookings must be made at least 1 day in advance.';
    }

    return '';
  };

  const handleCreateIntent = async (e) => {
    e.preventDefault();
    const tokenInStorage = getStoredAccessToken();
    console.log(`[CHECKOUT AUTH] userPresent: ${Boolean(user)} accessTokenPresent: ${Boolean(tokenInStorage)}`);

    if (!user || !tokenInStorage) {
      console.warn(`[CHECKOUT AUTH] User is not authenticated. Redirecting to login.`);
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }
    if (!contactName || !contactPhone) {
      showError('Please provide contact name and phone number');
      return;
    }

    const nextGuestError = validateGuestCount(Number(guestCount));
    if (nextGuestError) {
      setGuestError(nextGuestError);
      showError(nextGuestError);
      return;
    }
    setGuestError('');

    const nextEventDateError = validateEventDateInput(eventDate);
    if (nextEventDateError) {
      setEventDateError(nextEventDateError);
      showError(nextEventDateError);
      return;
    }
    setEventDateError('');

    setLoading(true);
    try {
      const payload = {
        hall_id: hall.id,
        event_date: eventDate,
        time_slot: timeSlot,
        guest_count: guestCount,
        contact_name: contactName,
        contact_phone: contactPhone,
        special_requests: specialRequests,
        has_catering: hasCatering,
        catering_type: cateringType,
        has_decor: hasDecor,
        has_dj: hasDj,
      };

      const res = await api.post('/bookings/create-intent/', payload);
      if (res.success) {
        setBookingResult(res.data);
        setStep(2);
        showSuccess('Slot temporarily locked for 15 minutes! Please complete advance payment.');
      }
    // } catch (err) {
    //   showError(err.message || 'Failed to hold booking slot. The slot may have just been reserved.');
    // } finally {
    } catch (err) {
      console.log('[BOOKING ERROR FULL]', err);
      console.log('[BOOKING ERROR JSON]', JSON.stringify(err, null, 2));

      const apiErrors = err?.errors || err?.error?.errors || {};
      const eventDateError =
        apiErrors.event_date?.[0] ||
        apiErrors.eventDate?.[0] ||
        apiErrors.non_field_errors?.[0] ||
        err?.message ||
        'Failed to hold booking slot. The slot may have just been reserved.';

      showError(eventDateError);
    } finally {
      setLoading(false);
    }
  };

  const handlePayAdvance = async () => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }
    if (!bookingResult) return;
    setLoading(true);

    try {
      // 1. Create Order via Razorpay Order Backend Endpoint
      const initRes = await api.post('/payments/razorpay/order/', {
        booking_id: bookingResult.id,
        payment_type: 'ADVANCE',
        payment_method: paymentMethod,
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

        const updatedBooking = await api.get(`/bookings/${bookingResult.id}/`);
        setBookingResult(updatedBooking.data || {
          ...bookingResult,
          status: 'PENDING_OWNER_CONFIRMATION',
          amount_paid: advanceAmount,
        });

        setStep(3);
        showSuccess('Advance payment verified! Booking submitted to hall owner.');
      };

      // Helper to dynamically load Razorpay Checkout script
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
          description: `Advance Deposit for Booking #${bookingResult.booking_number}`,
          image: '/favicon.svg',
          order_id: orderData.gateway_order_id || orderData.order_id,
          handler: async function (response) {
            try {
              setLoading(true);
              await completeVerification({
                gateway_order_id: response.razorpay_order_id,
                gateway_payment_id: response.razorpay_payment_id,
                gateway_signature: response.razorpay_signature,
              });
            } catch (err) {
              showError(err.message || 'Payment verification failed');
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: orderData.contact_name || user?.full_name || '',
            email: orderData.contact_email || user?.email || '',
            contact: orderData.contact_phone || user?.phone || '',
          },
          theme: {
            color: '#4f46e5',
          },
          modal: {
            ondismiss: function () {
              console.log('[RAZORPAY] Checkout modal dismissed by user');
              setLoading(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          console.error('[RAZORPAY] Payment failed:', response.error);
          showError(response.error?.description || 'Payment was unsuccessful. Please try again.');
          setLoading(false);
        });
        rzp.open();
      } else {
        // Offline / Test Simulated Gateway fallback
        const paymentId = `pay_test_${Date.now()}`;
        await completeVerification({
          gateway_order_id: orderData.gateway_order_id,
          gateway_payment_id: paymentId,
          gateway_signature: 'valid_simulated_signature',
        });
      }
    } catch (err) {
      showError(err.message || 'Payment processing failed');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Checkout Progress Stepper */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Book & Confirm Venue</h1>
        <p className="text-sm text-slate-500">{hall.name} — {hall.locality}, {hall.city}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 rounded-[26px] border border-slate-200 bg-white/90 p-3 shadow-[0_12px_28px_rgba(15,23,42,0.05)] backdrop-blur-sm">
        {[
          { step: 1, title: '1. Event Details' },
          { step: 2, title: '2. Payment' },
          { step: 3, title: '3. Confirmation' },
        ].map((s) => (
          <div
            key={s.step}
            className={`py-2.5 px-3 rounded-xl text-center text-xs font-bold transition ${
              step === s.step
                ? 'bg-indigo-600 text-white shadow-sm'
                : step > s.step
                ? 'bg-emerald-50 text-emerald-800'
                : 'bg-slate-50 text-slate-400'
            }`}
          >
            {s.title}
          </div>
        ))}
      </div>

      {/* STEP 1: Details */}
      {step === 1 && (
        <form onSubmit={handleCreateIntent} className="space-y-6">
          <Card className="overflow-hidden border-slate-200 shadow-[0_18px_38px_rgba(15,23,42,0.06)]">
            <CardHeader>
              <CardTitle>1. Event & Contact Details</CardTitle>
              <CardDescription>Confirm your dates, expected guests, and point-of-contact info</CardDescription>
            </CardHeader>
            <CardBody className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Contact Person Name"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Rahul Sharma"
                />
                <Input
                  label="Contact Phone Number"
                  required
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91 9876543210"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Event Date"
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />

                <Input
                  label={`Guests (${hall.min_capacity} - ${hall.max_capacity})`}
                  type="number"
                  min={hall.min_capacity}
                  max={hall.max_capacity}
                  required
                  value={guestCount}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setGuestCount(e.target.value === '' ? '' : value);
                    setGuestError(validateGuestCount(e.target.value === '' ? 0 : value));
                  }}
                />
                {guestError && (
                  <p className="mt-2 text-xs font-medium text-rose-600">{guestError}</p>
                )}
              </div>

              {/* Time Slot */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Confirmed Time Slot
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'MORNING', label: 'Morning', hours: '08:00 – 14:00' },
                    { id: 'EVENING', label: 'Evening', hours: '16:00 – 23:00' },
                    { id: 'FULL_DAY', label: 'Full Day', hours: '08:00 – 23:00' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setTimeSlot(s.id)}
                      className={`p-3 rounded-xl border text-center transition ${
                        timeSlot === s.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block text-xs font-bold">{s.label}</span>
                      <span className="block text-[10px] opacity-80 mt-0.5">{s.hours}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Addons Selection */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Service Add-ons</label>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={hasCatering}
                        onChange={(e) => setHasCatering(e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      <span className="text-sm font-medium text-slate-800">Catering Service ({guestCount} guests)</span>
                    </div>
                    {hasCatering && (
                      <select
                        value={cateringType}
                        onChange={(e) => setCateringType(e.target.value)}
                        className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1"
                      >
                        <option value="VEG">Veg (₹{hall.veg_plate_price}/plate)</option>
                        <option value="NON_VEG">Non-Veg (₹{hall.non_veg_plate_price}/plate)</option>
                      </select>
                    )}
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={hasDecor}
                        onChange={(e) => setHasDecor(e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      <span className="text-sm font-medium text-slate-800">Premium Stage & Floral Decor</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900">{formatCurrency(hall.decor_price)}</span>
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={hasDj}
                        onChange={(e) => setHasDj(e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      <span className="text-sm font-medium text-slate-800">DJ Setup & Sound System</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900">{formatCurrency(hall.dj_price)}</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Special Requests / Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Need early stage setup by 6 AM, welcome drink counters..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="font-bold uppercase tracking-wider text-amber-800">Cancellation & refund notice</p>
                <ul className="mt-3 space-y-2 text-sm leading-6">
                  <li>• More than 90 days before event: 95% refund, less processing fee.</li>
                  <li>• 30 to 90 days before event: 50% refund.</li>
                  <li>• Less than 30 days before event: 0% refund.</li>
                  <li>• The initial advance is non-refundable once paid, and one reschedule request is allowed up to 60 days before the event when available.</li>
                </ul>
              </div>

              {/* Price Breakdown Component */}
              <PriceBreakdown
                hallRent={rent}
                hasCatering={hasCatering}
                cateringAmount={cateringAmount}
                hasDecor={hasDecor}
                decorAmount={decorAmount}
                hasDj={hasDj}
                djAmount={djAmount}
                subtotal={subtotal}
                taxAmount={taxAmount}
                totalAmount={totalAmount}
                advanceAmount={advanceAmount}
                balanceAmount={balanceAmount}
                advancePercentage={advancePercentage}
              />
            </CardBody>
            <CardFooter className="flex justify-between">
              <Link to={`/halls/${slug}`}>
                <Button variant="outline" icon={ArrowLeft}>
                  Back to Venue
                </Button>
              </Link>
              <Button type="submit" variant="primary" size="lg" isLoading={loading}>
                Proceed to Payment <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}

      {/* STEP 2: Payment */}
      {step === 2 && bookingResult && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>2. Complete Advance Payment</CardTitle>
              <CardDescription>
                Booking reference: <span className="font-bold text-indigo-600">#{bookingResult.booking_number}</span> — Slot held for 15 minutes
              </CardDescription>
            </CardHeader>
            <CardBody className="space-y-6">
              {/* Order Summary Box */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Venue</span>
                  <span className="font-semibold text-slate-900">{hall.name}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Date & Slot</span>
                  <span className="font-semibold text-slate-900">{formatDate(eventDate)} ({timeSlot})</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Total Quotation</span>
                  <span className="font-bold text-slate-900">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-bold text-emerald-700">
                  <span>Advance Payable Now ({advancePercentage}%):</span>
                  <span>{formatCurrency(advanceAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Balance due before event date:</span>
                  <span>{formatCurrency(balanceAmount)}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Payment Method (Powered by Razorpay Secure)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'UPI', label: 'UPI / QR Code', icon: QrCode, desc: 'GooglePay, PhonePe, Paytm' },
                    { id: 'CREDIT_CARD', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, MasterCard, RuPay' },
                    { id: 'NET_BANKING', label: 'Net Banking', icon: Landmark, desc: 'All Major Indian Banks' },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                          paymentMethod === m.id
                            ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-500/20'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-2 ${paymentMethod === m.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <div>
                          <div className="text-xs font-bold text-slate-900">{m.label}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  100% Escrow Protection: Your advance is securely held until the venue owner confirms your reservation. If declined, 100% refund is issued instantly.
                </span>
              </div>
            </CardBody>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} icon={ArrowLeft}>
                Modify Details
              </Button>
              <Button
                variant="success"
                size="lg"
                onClick={handlePayAdvance}
                isLoading={loading}
              >
                Pay {formatCurrency(advanceAmount)} & Confirm
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* STEP 3: Confirmation */}
      {step === 3 && bookingResult && (
        <Card className="border-emerald-200 shadow-xl overflow-hidden">
          <div className="bg-emerald-600 text-white p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-white text-emerald-600 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black">Booking Request Submitted!</h2>
            <p className="text-sm text-emerald-100 max-w-md mx-auto">
              Your advance payment of <span className="font-bold text-white">{formatCurrency(advanceAmount)}</span> has been securely processed.
            </p>
          </div>

          <CardBody className="p-8 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block">Booking Reference</span>
                <span className="font-bold text-slate-900 text-sm">{bookingResult.booking_number}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Event Date</span>
                <span className="font-bold text-slate-900 text-sm">{formatDate(eventDate)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Time Slot</span>
                <span className="font-bold text-slate-900 text-sm">{timeSlot}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Current Status</span>
                <Badge variant="warning">Pending Owner Confirmation</Badge>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900">What Happens Next?</h4>
              <ol className="space-y-2 text-xs text-slate-600 list-decimal list-inside leading-relaxed">
                <li>The hall owner has been alerted with your booking request.</li>
                <li>They will review your event details and confirm within 24 hours.</li>
                <li>Once confirmed, your calendar date is locked and you can settle the balance anytime before the event date.</li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
              <Link to="/dashboard/bookings" className="flex-1">
                <Button variant="primary" className="w-full">
                  Go to My Bookings
                </Button>
              </Link>
              <Link to="/search" className="flex-1">
                <Button variant="outline" className="w-full">
                  Explore More Venues
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};
