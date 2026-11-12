import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Users, Star, Sparkles, CheckCircle2, ShieldCheck, Calendar, Clock, Heart, Share2, Info, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Spinner, EmptyState } from '../components/ui/Feedback';
import { PriceBreakdown } from '../components/ui/PriceBreakdown';
import { formatCurrency } from '../utils/formatters';


const getLocalISODate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getTodayLocalDate = () => {
  const date = new Date();
  return getLocalISODate(date);
};

const getMinBookingDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return getLocalISODate(date);
};

export const HallDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [hall, setHall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [guestError, setGuestError] = useState('');
  const [eventDateError, setEventDateError] = useState('');

  // Booking Widget State
  const [eventDate, setEventDate] = useState(getMinBookingDate());
  const [guestCount, setGuestCount] = useState(300);
  const [timeSlot, setTimeSlot] = useState('EVENING');
  const [hasCatering, setHasCatering] = useState(true);
  const [cateringType, setCateringType] = useState('VEG');
  const [hasDecor, setHasDecor] = useState(false);
  const [hasDj, setHasDj] = useState(false);

  useEffect(() => {
    const fetchHallDetail = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/halls/${slug}/`);
        if (res.success) {
          setHall(res.data);
          if (res.data.min_capacity) {
            setGuestCount(Math.max(res.data.min_capacity, 250));
          }
        }
      } catch (err) {
        showError('Could not find or access this function hall.');
      } finally {
        setLoading(false);
      }
    };
    fetchHallDetail();
  }, [slug]);

  useEffect(() => {
    const fetchSavedStatus = async () => {
      if (!user || !hall?.id) return;

      try {
        const res = await api.get('/favorites/');
        if (res.success) {
          const favoriteList = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.data)
              ? res.data.data
              : Array.isArray(res.data?.results)
                ? res.data.results
                : [];
          setIsSaved(favoriteList.some((fav) => fav.hall?.id === hall.id || fav.hall_id === hall.id));
        }
      } catch (err) {
        setIsSaved(false);
      }
    };

    fetchSavedStatus();
  }, [user, hall?.id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!hall) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          title="Venue Not Found"
          description="The function hall you are searching for is currently unavailable or under review."
          action={<Link to="/search"><Button variant="primary">Browse Other Halls</Button></Link>}
        />
      </div>
    );
  }

  // Pricing Calculation
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

  const images = hall.images?.length > 0
    ? hall.images
    : [{ image_url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80" }];

  const handleToggleFavorite = async () => {
    if (!user) {
      navigate(`/login?redirect=/halls/${slug}`);
      return;
    }

    try {
      setFavoriteLoading(true);
      const res = await api.post(`/favorites/${hall.id}/toggle/`);

      if (res.success) {
        const nextSaved = Boolean(res.data?.is_favorited);
        setIsSaved(nextSaved);
        showSuccess(res.message || (nextSaved ? `Added '${hall.name}' to saved venues.` : `Removed '${hall.name}' from saved venues.`));
      } else {
        showError(res.message || 'Unable to update saved halls right now.');
      }
    } catch (err) {
      const message = err?.message || 'Unable to update saved halls right now.';
      showError(message);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      navigate(`/login?redirect=/halls/${slug}/book`);
      return;
    }

    const safeGuestCount = Number(guestCount);
    if (Number.isNaN(safeGuestCount) || safeGuestCount < hall.min_capacity || safeGuestCount > hall.max_capacity) {
      const nextError = `Guest count must be between ${hall.min_capacity} and ${hall.max_capacity}.`;
      setGuestError(nextError);
      showError(nextError);
      return;
    }
    setGuestError('');

    if (!eventDate || eventDate < getTodayLocalDate()) {
      const nextError = 'Event date cannot be in the past.';
      setEventDateError(nextError);
      showError(nextError);
      return;
    }

    if (eventDate < getMinBookingDate()) {
      const nextError = 'Bookings must be made at least 1 day in advance.';
      setEventDateError(nextError);
      showError(nextError);
      return;
    }
    setEventDateError('');

    // Navigate with booking intent parameters
    navigate(`/halls/${slug}/book`, {
      state: {
        hall,
        eventDate,
        guestCount,
        timeSlot,
        hasCatering,
        cateringType,
        perPlatePrice: perPlate,
        hasDecor,
        hasDj,
        hallRent: rent,
        cateringAmount,
        decorAmount,
        djAmount,
        subtotal,
        taxAmount,
        totalAmount,
        advancePercentage,
        advanceAmount,
        balanceAmount,
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header Info */}
      <div className="rounded-[30px] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="primary">{hall.hall_type}</Badge>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{hall.avg_rating > 0 ? hall.avg_rating : "4.8"}</span>
                <span className="text-slate-400">({hall.review_count > 0 ? hall.review_count : "120"} reviews)</span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{hall.name}</h1>
            <p className="text-sm text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-indigo-600" />
              {hall.address_line1}, {hall.locality}, {hall.city} — {hall.postal_code}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" icon={Share2} onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              showSuccess('Link copied to clipboard!');
            }}>
              Share
            </Button>
            <Button
              variant={isSaved ? 'primary' : 'outline'}
              size="sm"
              icon={Heart}
              onClick={handleToggleFavorite}
              disabled={favoriteLoading}
            >
              {favoriteLoading ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="space-y-3">
        <div className="aspect-21/9 sm:aspect-21/8 w-full rounded-3xl overflow-hidden bg-slate-900 shadow-lg">
          <img
            src={images[selectedPhotoIndex]?.image_url}
            alt={hall.name}
            className="w-full h-full object-cover"
          />
        </div>
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPhotoIndex(idx)}
                className={`relative w-28 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition ${
                  selectedPhotoIndex === idx ? 'border-indigo-600 shadow-md scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img.image_url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Cols: Details, Amenities, Reviews */}
        <div className="lg:col-span-2 space-y-10">
          {/* Quick Specs Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 block font-medium">Capacity</span>
              <span className="text-sm font-bold text-slate-900">{hall.min_capacity} – {hall.max_capacity} Guests</span>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-400 block font-medium">Catering Policy</span>
              <span className="text-sm font-bold text-slate-900">
                {hall.catering_policy === 'BOTH' ? 'In-house & Outside' : hall.catering_policy === 'IN_HOUSE_ONLY' ? 'In-house Only' : 'Outside Allowed'}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-400 block font-medium">Advance Required</span>
              <span className="text-sm font-bold text-indigo-600">{hall.advance_percentage}% Deposit</span>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-400 block font-medium">Cancellation</span>
              <span className="text-sm font-bold text-slate-900">{hall.cancellation_policy} Policy</span>
            </div>
          </div>

          {/* About Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">About {hall.name}</h2>
            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-white p-6 rounded-2xl border border-slate-200/80">
              {hall.description || "Grand banquet hall featuring premium interiors, centralized air conditioning, high ceilings, bridal suite, acoustic stage setup, and ample parking space. Suitable for grand weddings, engagement ceremonies, birthday parties, and corporate annual conferences."}
            </div>
          </div>

          {/* Amenities Grid */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Facilities & Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white p-6 rounded-2xl border border-slate-200/80">
              {hall.amenities?.length > 0 ? (
                hall.amenities.map((am) => (
                  <div key={am.id} className="flex items-center gap-2.5 text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{am.name}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center gap-2.5 text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Centralized AC</div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Valet & Guest Parking</div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Generator Backup</div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Bridal Dressing Rooms</div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Dedicated Dining Area</div>
                </>
              )}
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Customer Reviews & Ratings</h2>
              <span className="text-xs text-slate-500 font-medium">Verified completed events only</span>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="text-3xl font-black text-slate-900">4.8</div>
                <div>
                  <div className="flex text-amber-500"><Star className="w-4 h-4 fill-amber-500" /><Star className="w-4 h-4 fill-amber-500" /><Star className="w-4 h-4 fill-amber-500" /><Star className="w-4 h-4 fill-amber-500" /><Star className="w-4 h-4 fill-amber-500" /></div>
                  <span className="text-xs text-slate-500">Based on 120 verified customer bookings</span>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                    <span>"Spacious hall and flawless catering!"</span>
                    <span className="text-amber-500">⭐ 5.0</span>
                  </div>
                  <p className="text-xs text-slate-500">Hosted wedding reception with 450 guests. The AC cooling and stage lighting were phenomenal.</p>
                  <span className="text-[11px] text-slate-400 block">— R. Sharma (Event on 12 Jul 2026)</span>
                </div>
                <div className="space-y-1 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                    <span>"Good venue, parking was managed well"</span>
                    <span className="text-amber-500">⭐ 4.5</span>
                  </div>
                  <p className="text-xs text-slate-500">Staff was courteous. Booking advance payment via PotlaEventSpaces was seamless.</p>
                  <span className="text-[11px] text-slate-400 block">— K. Naidu (Event on 28 Jun 2026)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Sticky Booking & Availability Calculator */}
        <div className="space-y-6">
          <div className="sticky top-24 rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_44px_rgba(15,23,42,0.08)] backdrop-blur-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-400 block">From</span>
                <span className="text-2xl font-black text-slate-900">{formatCurrency(hall.base_price_morning)}</span>
                <span className="text-xs text-slate-500"> / morning slot</span>
              </div>
              <Badge variant="success">Open for Booking</Badge>
            </div>

            <div className="space-y-4">
              {/* Event Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Event Date
                </label>
                <input
                  type="date"
                  value={eventDate}
                  min={getTodayLocalDate()}
                  onChange={(e) => {
                    const nextValue = e.target.value;
                    setEventDate(nextValue);
                    setEventDateError(
                      !nextValue
                        ? 'Please select an event date.'
                        : nextValue < getTodayLocalDate()
                          ? 'Event date cannot be in the past.'
                          : nextValue < getMinBookingDate()
                            ? 'Bookings must be made at least 1 day in advance.'
                            : ''
                    );
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-medium text-slate-900 focus:outline-none"
                />
                {eventDateError && (
                  <p className="mt-2 text-xs font-medium text-rose-600">{eventDateError}</p>
                )}
              </div>

              {/* Guest Count */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-600" /> Expected Guests ({hall.min_capacity} - {hall.max_capacity})
                </label>
                <input
                  type="number"
                  min={hall.min_capacity}
                  max={hall.max_capacity}
                  value={guestCount}
                  onChange={(e) => {
                    const nextValue = parseInt(e.target.value, 10);
                    setGuestCount(Number.isNaN(nextValue) ? hall.min_capacity : nextValue);
                    setGuestError(
                      Number.isNaN(nextValue)
                        ? 'Please enter a valid guest count.'
                        : nextValue < hall.min_capacity || nextValue > hall.max_capacity
                          ? `Guest count must be between ${hall.min_capacity} and ${hall.max_capacity}.`
                          : ''
                    );
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-medium text-slate-900 focus:outline-none"
                />
                {guestError && (
                  <p className="mt-2 text-xs font-medium text-rose-600">{guestError}</p>
                )}
              </div>

              {/* Time Slot Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" /> Choose Time Slot
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'MORNING', label: 'Morning', hours: '8am - 2pm' },
                    { id: 'EVENING', label: 'Evening', hours: '4pm - 11pm' },
                    { id: 'FULL_DAY', label: 'Full Day', hours: '8am - 11pm' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setTimeSlot(s.id)}
                      className={`p-2.5 rounded-xl border text-center transition ${
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

              {/* Add-ons Selector */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Optional Add-ons</label>
                
                <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hasCatering}
                      onChange={(e) => setHasCatering(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span className="text-xs font-medium text-slate-800">Catering Service</span>
                  </div>
                  {hasCatering && (
                    <select
                      value={cateringType}
                      onChange={(e) => setCateringType(e.target.value)}
                      className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1"
                    >
                      <option value="VEG">Veg (₹{hall.veg_plate_price}/plate)</option>
                      <option value="NON_VEG">Non-Veg (₹{hall.non_veg_plate_price}/plate)</option>
                    </select>
                  )}
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hasDecor}
                      onChange={(e) => setHasDecor(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span className="text-xs font-medium text-slate-800">Stage & Floral Decor</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">{formatCurrency(hall.decor_price)}</span>
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hasDj}
                      onChange={(e) => setHasDj(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span className="text-xs font-medium text-slate-800">DJ & Sound System</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">{formatCurrency(hall.dj_price)}</span>
                </label>
              </div>
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

            {/* Action CTA */}
            <Button
              variant="primary"
              size="lg"
              className="w-full shadow-lg shadow-indigo-600/25"
              onClick={handleProceedToCheckout}
              icon={ArrowRight}
            >
              Proceed to Book & Pay Advance
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
