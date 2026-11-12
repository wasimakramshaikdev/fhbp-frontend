import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, MapPin, Users, Star, ArrowRight, Building2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Spinner, EmptyState } from '../components/ui/Feedback';
import { formatCurrency } from '../utils/formatters';

export const SavedHallsPage = () => {
  const { showSuccess, showError } = useToast();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await api.get('/favorites/');
      if (res.success) {
        const favoriteList = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : Array.isArray(res.data?.results)
              ? res.data.results
              : [];
        setFavorites(favoriteList);
      }
    } catch (err) {
      showError('Failed to load saved venues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (hallId, hallName) => {
    try {
      const res = await api.post(`/favorites/${hallId}/toggle/`);
      if (res.success) {
        showSuccess(res.message || `Removed '${hallName}' from saved venues`);
        setFavorites((prev) => prev.filter((f) => f.hall?.id !== hallId));
      } else {
        showError(res.message || 'Failed to remove from saved venues');
      }
    } catch (err) {
      showError('Failed to remove from saved venues');
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
        <h1 className="text-2xl font-bold text-slate-900">Saved Function Halls</h1>
        <p className="text-sm text-slate-500 mt-1">Keep track of your shortlisted venues for weddings, parties, and conferences</p>
      </div>

      {favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No saved venues yet"
          description="When browsing function halls in Hyderabad, click the heart icon to shortlist your favorites."
          action={
            <Link to="/search">
              <Button variant="primary">Explore Function Halls</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {favorites.map((fav) => {
            const hall = fav.hall;
            return (
              <Card key={fav.id} className="border-slate-200 hover:shadow-lg transition-all duration-200">
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                  <img
                    src={hall.primary_image || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80"}
                    alt={hall.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemoveFavorite(hall.id, hall.name)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-md text-rose-600 hover:bg-white transition shadow-sm"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-900 flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{hall.avg_rating > 0 ? hall.avg_rating : "4.8"}</span>
                    <span className="text-slate-400">({hall.review_count > 0 ? hall.review_count : "120"})</span>
                  </div>
                </div>

                <CardBody className="space-y-3">
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">{hall.hall_type}</span>
                  <h3 className="text-lg font-bold text-slate-900">{hall.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {hall.locality}, {hall.city}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">Up to {hall.max_capacity} guests</span>
                      <div className="text-base font-bold text-slate-900">
                        {formatCurrency(hall.base_price_evening)} <span className="text-xs font-normal text-slate-500">onwards</span>
                      </div>
                    </div>
                    <Link to={`/halls/${hall.slug}`}>
                      <Button variant="primary" size="sm">
                        View & Book
                      </Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
