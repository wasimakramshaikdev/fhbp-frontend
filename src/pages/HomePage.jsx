import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Calendar, Users, MapPin, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const getLocalISODate = (source = new Date()) => {
  const offset = source.getTimezoneOffset();
  const adjusted = new Date(source.getTime() - offset * 60 * 1000);
  return adjusted.toISOString().slice(0, 10);
};

export const HomePage = () => {
  const navigate = useNavigate();
  const [city, setCity] = React.useState('Hyderabad');
  const [locality, setLocality] = React.useState('Madhapur');
  const [date, setDate] = React.useState(() => getLocalISODate());
  const [guests, setGuests] = React.useState('350');

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?city=${encodeURIComponent(city)}&locality=${encodeURIComponent(locality)}&date=${date}&guests=${guests}`);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-slate-950 text-white">
        <div className="absolute inset-0 opacity-90 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.32),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.2),_transparent_20%)]" />
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:36px_36px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-indigo-300/20 text-indigo-100 text-xs font-semibold shadow-lg shadow-indigo-950/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Verified Function Halls with Instant Slot Availability</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-[-0.06em] text-white leading-[0.96]">
              Book the Perfect Function Hall in <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-amber-300">Hyderabad</span>
            </h1>

            <p className="text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              Compare banquet halls, convention centers, and wedding lawns. Check real-time date availability, get transparent quotes, and reserve with advance payment.
            </p>
          </div>

          <div className="mt-12 max-w-5xl mx-auto rounded-[28px] border border-white/10 bg-white/95 p-4 sm:p-5 shadow-[0_20px_60px_rgba(15,23,42,0.55)] backdrop-blur-md text-slate-900">
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              <span className="rounded-full bg-slate-100 px-2.5 py-1">Trusted by 2,400+ hosts</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1">Verified venues</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1">Secure payments</span>
            </div>

            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" /> City / Locality
                </label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-indigo-600 focus:outline-none shadow-inner"
                >
                  <option value="Madhapur">Madhapur, Hyderabad</option>
                  <option value="Gachibowli">Gachibowli, Hyderabad</option>
                  <option value="Kondapur">Kondapur, Hyderabad</option>
                  <option value="Banjara Hills">Banjara Hills, Hyderabad</option>
                  <option value="Jubilee Hills">Jubilee Hills, Hyderabad</option>
                  <option value="Kukatpally">Kukatpally, Hyderabad</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Event Date
                </label>
                <input
                  type="date"
                  min={getLocalISODate()}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-900 focus:border-indigo-600 focus:outline-none shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600" /> Expected Guests
                </label>
                <input
                  type="number"
                  placeholder="e.g. 350"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-900 focus:border-indigo-600 focus:outline-none shadow-inner"
                />
              </div>

              <div>
                <Button type="submit" variant="primary" size="lg" className="w-full shadow-lg shadow-indigo-600/25" icon={Search}>
                  Search Halls
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-100/60 rounded-3xl py-14 px-8 border border-slate-200/60">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="default" className="mb-2">Simple 3-Step Booking</Badge>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">How PotlaEventSpaces Works</h2>
          <p className="text-slate-600 text-sm mt-2">Transparent function hall reservation with locked calendar dates and zero double booking.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-lg">1</div>
            <h3 className="text-lg font-bold text-slate-900">Discover & Check Slots</h3>
            <p className="text-sm text-slate-600 leading-relaxed">Search by locality, event date, and guest count. Inspect verified photos, capacity, and real-time open slots.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-lg">2</div>
            <h3 className="text-lg font-bold text-slate-900">Transparent Pricing & Hold</h3>
            <p className="text-sm text-slate-600 leading-relaxed">Select morning, evening, or full-day slots. Add catering, decor, or DJ options with an itemized price breakdown.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-lg">3</div>
            <h3 className="text-lg font-bold text-slate-900">Pay Advance & Confirm</h3>
            <p className="text-sm text-slate-600 leading-relaxed">Pay a 20% advance via secure UPI / Card. The date is locked, owner confirms, and balance is paid before the event.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
