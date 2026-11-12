import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, MapPin, Users, Star, IndianRupee, SlidersHorizontal, ArrowUpDown, Grid, Map, X, CheckCircle2, RotateCcw } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Pagination } from '../components/ui/Pagination';
import { Spinner, EmptyState } from '../components/ui/Feedback';
import { formatCurrency } from '../utils/formatters';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showError } = useToast();

  const [halls, setHalls] = useState([]);
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total_pages: 1, total_count: 0 });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [selectedMapHall, setSelectedMapHall] = useState(null);

  // URL State extraction
  const q = searchParams.get('q') || '';
  const city = searchParams.get('city') || 'Hyderabad';
  const locality = searchParams.get('locality') || '';
  const date = searchParams.get('date') || '';
  const guests = searchParams.get('guests') || '';
  const hallType = searchParams.get('hall_type') || '';
  const priceMin = searchParams.get('price_min') || '';
  const priceMax = searchParams.get('price_max') || '';
  const minRating = searchParams.get('min_rating') || '';
  const selectedAmenities = searchParams.getAll('amenities');
  const sort = searchParams.get('sort') || 'recommended';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Fetch Amenities Catalog
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const res = await api.get('/halls/amenities/');
        if (res.success) {
          setAmenitiesList(res.data);
        }
      } catch (e) {
        // Fallback amenities
        setAmenitiesList([
          { id: '1', name: 'Centralized AC', slug: 'ac' },
          { id: '2', name: 'Valet Parking', slug: 'valet-parking' },
          { id: '3', name: 'Generator Backup', slug: 'power-backup' },
          { id: '4', name: 'Bridal Room', slug: 'bridal-room' },
          { id: '5', name: 'In-house Catering', slug: 'catering' },
          { id: '6', name: 'Floral Stage Decor', slug: 'decor' },
        ]);
      }
    };
    fetchAmenities();
  }, []);

  // Fetch Halls matching search params
  const fetchHalls = async () => {
    try {
      setLoading(true);
      const queryStr = searchParams.toString();
      const res = await api.get(`/halls/?${queryStr}`);
      if (res.success) {
        setHalls(res.data);
        if (res.meta) setMeta(res.meta);
        if (res.data.length > 0) setSelectedMapHall(res.data[0]);
      }
    } catch (err) {
      showError('Failed to fetch function halls.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHalls();
  }, [searchParams]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const toggleAmenityFilter = (slug) => {
    const newParams = new URLSearchParams(searchParams);
    const current = newParams.getAll('amenities');
    newParams.delete('amenities');
    if (current.includes(slug)) {
      current.filter((s) => s !== slug).forEach((s) => newParams.append('amenities', s));
    } else {
      [...current, slug].forEach((s) => newParams.append('amenities', s));
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams({ city: 'Hyderabad' }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Search Bar */}
      <div className="overflow-hidden rounded-[28px] border border-white/60 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-[1px] shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
        <div className="rounded-[27px] bg-white/95 p-5 backdrop-blur-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                <Search className="w-3.5 h-3.5 text-indigo-600" /> Search Keyword
              </label>
              <input
                type="text"
                placeholder="Search hall name or area..."
                value={q}
                onChange={(e) => updateParam('q', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" /> Locality
              </label>
              <select
                value={locality}
                onChange={(e) => updateParam('locality', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none shadow-inner"
              >
                <option value="">All Hyderabad Localities</option>
                <option value="Madhapur">Madhapur</option>
                <option value="Gachibowli">Gachibowli</option>
                <option value="Kondapur">Kondapur</option>
                <option value="Banjara Hills">Banjara Hills</option>
                <option value="Jubilee Hills">Jubilee Hills</option>
                <option value="Kukatpally">Kukatpally</option>
                <option value="Hitech City">Hitech City</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-indigo-600" /> Expected Guests
              </label>
              <input
                type="number"
                placeholder="e.g. 350"
                value={guests}
                onChange={(e) => updateParam('guests', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none shadow-inner"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleClearFilters}
                icon={RotateCcw}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Results Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" /> Filters
              </h3>
              {(locality || hallType || priceMax || minRating || selectedAmenities.length > 0) && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Venue Type Filter */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Venue Type</h4>
              <div className="space-y-2">
                {[
                  { id: '', label: 'All Venue Types' },
                  { id: 'AC', label: 'AC Banquet Hall' },
                  { id: 'CONVENTION', label: 'Convention Center' },
                  { id: 'OPEN_LAWN', label: 'Open Lawn' },
                  { id: 'HYBRID', label: 'Hybrid (Lawn & Hall)' },
                ].map((t) => (
                  <label key={t.id} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="hall_type"
                      checked={hallType === t.id}
                      onChange={() => updateParam('hall_type', t.id)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{t.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Minimum Rating Filter */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Customer Rating</h4>
              <div className="space-y-2">
                {[
                  { val: '', label: 'Any Rating' },
                  { val: '4.5', label: '⭐ 4.5 & above' },
                  { val: '4.0', label: '⭐ 4.0 & above' },
                  { val: '3.5', label: '⭐ 3.5 & above' },
                ].map((r) => (
                  <label key={r.val} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="min_rating"
                      checked={minRating === r.val}
                      onChange={() => updateParam('min_rating', r.val)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Maximum Price Filter */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Max Base Price</h4>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="e.g. 60000"
                  value={priceMax}
                  onChange={(e) => updateParam('price_max', e.target.value)}
                />
              </div>
            </div>

            {/* Amenities Multi-Checkboxes */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Amenities</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {amenitiesList.map((am) => (
                  <label key={am.id} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(am.slug)}
                      onChange={() => toggleAmenityFilter(am.slug)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{am.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Right 3 Cols: Header Controls + Hall Cards / Map View */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-[0_10px_20px_rgba(15,23,42,0.04)] backdrop-blur-sm">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {locality ? `Function Halls in ${locality}` : 'All Verified Venues in Hyderabad'}
              </h2>
              <p className="text-xs text-slate-500">{meta.total_count} function halls available</p>
            </div>

            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === 'map' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Map View"
                >
                  <Map className="w-4 h-4" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">Sort:</span>
                <select
                  value={sort}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="capacity_desc">Capacity: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Grid or Map View */}
          {loading ? (
            <div className="min-h-[40vh] flex items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : halls.length === 0 ? (
            <EmptyState
              title="No function halls match your search"
              description="Try adjusting your guest count, price limits, or locality filters to explore available venues."
              action={
                <Button variant="outline" onClick={handleClearFilters}>
                  Reset All Filters
                </Button>
              }
            />
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {halls.map((hall) => (
                <Card key={hall.id} className="group overflow-hidden border-slate-200 shadow-[0_12px_24px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(79,70,229,0.14)]">
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    <img
                      src={hall.primary_image || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80"}
                      alt={hall.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-900 flex items-center gap-1 shadow-sm">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{hall.avg_rating > 0 ? hall.avg_rating : "4.8"}</span>
                      <span className="text-slate-400">({hall.review_count > 0 ? hall.review_count : "120"})</span>
                    </div>
                  </div>
                  <CardBody className="space-y-3">
                    <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">{hall.hall_type}</span>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition">{hall.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      {hall.locality}, {hall.city}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {hall.amenities?.slice(0, 3).map((am, i) => (
                        <span key={i} className="px-2 py-0.5 text-[10px] bg-slate-100 text-slate-600 rounded-md">
                          {am.name}
                        </span>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 block font-medium">Up to {hall.max_capacity} guests</span>
                        <div className="text-base font-bold text-slate-900">
                          {formatCurrency(hall.base_price_evening)} <span className="text-xs font-normal text-slate-500">onwards</span>
                        </div>
                      </div>
                      <Link to={`/halls/${hall.slug}`}>
                        <Button variant="primary" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            /* Map Pin View (Wireframe Screen 2) */
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 text-white space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-bold">Hyderabad Venue Coordinates Map</h3>
                </div>
                <span className="text-xs text-slate-400">Click any location pin to preview venue</span>
              </div>

              {/* Map Canvas Simulator with interactive pins */}
              <div className="relative h-96 w-full rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 overflow-hidden flex items-center justify-center p-4">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

                {/* Map Grid Road Lines Graphic */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                  <div className="w-3/4 h-3/4 border border-indigo-400 rounded-full animate-ping" />
                </div>

                {/* Interactive Pins */}
                <div className="relative z-10 w-full h-full">
                  {halls.map((hall, idx) => {
                    // Spread pins realistically based on index or coordinates
                    const topPos = 20 + ((idx * 27) % 60);
                    const leftPos = 15 + ((idx * 33) % 70);
                    const isSelected = selectedMapHall?.id === hall.id;

                    return (
                      <button
                        key={hall.id}
                        onClick={() => setSelectedMapHall(hall)}
                        style={{ top: `${topPos}%`, left: `${leftPos}%` }}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full font-bold text-xs shadow-xl transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white ring-4 ring-indigo-400/40 scale-110 z-30'
                            : 'bg-white text-slate-900 hover:bg-slate-100 hover:scale-105 z-20'
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{formatCurrency(hall.base_price_evening)}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Hall Popup Overlay */}
                {selectedMapHall && (
                  <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white text-slate-900 p-4 rounded-2xl shadow-2xl border border-slate-100 z-40 animate-in fade-in zoom-in-95">
                    <div className="flex gap-3">
                      <img
                        src={selectedMapHall.primary_image || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=300&q=80"}
                        alt={selectedMapHall.name}
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase">{selectedMapHall.locality}</span>
                        <h4 className="text-xs font-bold truncate text-slate-900">{selectedMapHall.name}</h4>
                        <div className="text-xs font-bold text-slate-900">{formatCurrency(selectedMapHall.base_price_evening)}</div>
                        <Link to={`/halls/${selectedMapHall.slug}`}>
                          <span className="text-[11px] font-bold text-indigo-600 hover:underline">
                            View Venue Page →
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={meta.page}
            totalPages={meta.total_pages}
            hasNext={meta.has_next}
            hasPrevious={meta.has_previous}
            onPageChange={(newPage) => updateParam('page', newPage.toString())}
          />
        </div>
      </div>
    </div>
  );
};
