import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Plus, Edit, Eye, Power, AlertCircle, CheckCircle2, Clock, XCircle, Star } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Spinner, EmptyState } from '../components/ui/Feedback';
import { formatCurrency } from '../utils/formatters';

export const OwnerListingsPage = () => {
  const { showSuccess, showError } = useToast();
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingHallId, setSubmittingHallId] = useState(null);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/owner/listings/');
      if (res.success) {
        setHalls(res.data);
      }
    } catch (err) {
      showError(err.message || 'Failed to load property listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      const res = await api.post(`/owner/listings/${id}/toggle-status/`);
      if (res.success) {
        showSuccess(res.message);
        fetchListings();
      }
    } catch (err) {
      showError(err.message || 'Failed to toggle status');
    }
  };

  const handleReSubmit = async (id) => {
    if (submittingHallId) return;
    try {
      setSubmittingHallId(id);
      const res = await api.post(`/owner/listings/${id}/submit/`);
      if (res.success) {
        showSuccess('Listing re-submitted for Admin verification!');
        fetchListings();
      }
    } catch (err) {
      showError(err.message || 'Failed to submit listing');
    } finally {
      setSubmittingHallId(null);
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Function Halls</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your multi-property inventory, pricing, and live availability</p>
        </div>
        <Link to="/owner/onboarding">
          <Button variant="primary" icon={Plus}>
            Add New Property
          </Button>
        </Link>
      </div>

      {halls.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No venues listed yet"
          description="Start receiving bookings by onboarding your first function hall or lawn."
          action={
            <Link to="/owner/onboarding">
              <Button variant="primary" icon={Plus}>
                Onboard First Hall
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {halls.map((hall) => {
            const isApproved = hall.approval_status === 'APPROVED';
            const isUnderReview = hall.approval_status === 'UNDER_REVIEW';
            const isRejected = hall.approval_status === 'REJECTED';
            const isDraft = hall.approval_status === 'DRAFT';
            const isActive = hall.status === 'ACTIVE';

            return (
              <Card key={hall.id} className="overflow-hidden border-slate-200 shadow-xs">
                <div className="flex flex-col md:flex-row">
                  {/* Thumbnail */}
                  <div className="w-full md:w-64 aspect-video md:aspect-auto bg-slate-100 relative">
                    <img
                      src={hall.images?.[0]?.image_url || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80"}
                      alt={hall.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      {isApproved && (
                        <Badge variant={isActive ? "success" : "warning"}>
                          {isActive ? "Live on Marketplace" : "Temporarily Inactive"}
                        </Badge>
                      )}
                      {isUnderReview && <Badge variant="warning">Under Review</Badge>}
                      {isRejected && <Badge variant="danger">Changes Requested</Badge>}
                      {isDraft && <Badge variant="default">Draft</Badge>}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                          {hall.hall_type}
                        </span>
                        <h3 className="text-xl font-bold text-slate-900">{hall.name}</h3>
                        <p className="text-xs text-slate-500">{hall.locality}, {hall.city}</p>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold text-slate-900">
                          {formatCurrency(hall.base_price_evening)}
                        </div>
                        <span className="text-xs text-slate-400">Evening slot rate</span>
                      </div>
                    </div>

                    {/* Rejection Alert */}
                    {isRejected && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Admin Feedback: </span>
                          <span>{hall.rejection_reason || "Please update hall details and re-submit."}</span>
                        </div>
                      </div>
                    )}

                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-slate-100 text-xs text-slate-600">
                      <div>Capacity: <span className="font-semibold text-slate-900">{hall.min_capacity} - {hall.max_capacity}</span></div>
                      <div>Advance %: <span className="font-semibold text-slate-900">{hall.advance_percentage}%</span></div>
                      <div>Veg Plate: <span className="font-semibold text-slate-900">₹{hall.veg_plate_price}</span></div>
                      <div>Rating: <span className="font-semibold text-slate-900">⭐ {hall.avg_rating} ({hall.review_count})</span></div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex gap-2">
                        {isApproved && (
                          <Link to={`/halls/${hall.slug}`} target="_blank">
                            <Button variant="outline" size="sm" icon={Eye}>
                              View Public Page
                            </Button>
                          </Link>
                        )}
                        {(isDraft || isRejected) && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleReSubmit(hall.id)}
                            disabled={submittingHallId === hall.id}
                            isLoading={submittingHallId === hall.id}
                          >
                            {submittingHallId === hall.id ? 'Submitting...' : 'Submit for Approval'}
                          </Button>
                        )}
                      </div>

                      {isApproved && (
                        <Button
                          variant={isActive ? "outline" : "success"}
                          size="sm"
                          icon={Power}
                          onClick={() => handleToggleStatus(hall.id)}
                        >
                          {isActive ? "Deactivate Venue" : "Activate Venue"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
