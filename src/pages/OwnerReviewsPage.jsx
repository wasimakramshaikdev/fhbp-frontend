import React, { useState, useEffect } from 'react';
import { Star, MessageSquareQuote, Send, CheckCircle2, User, Building2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Spinner, EmptyState } from '../components/ui/Feedback';
import { formatDate } from '../utils/formatters';

export const OwnerReviewsPage = () => {
  const { showSuccess, showError } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Respond Modal State
  const [respondModalOpen, setRespondModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/owner/reviews/');
      if (res.success) {
        setReviews(res.data);
      }
    } catch (err) {
      showError('Failed to load guest reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleOpenRespondModal = (review) => {
    setSelectedReview(review);
    setResponseText(review.owner_response || '');
    setRespondModalOpen(true);
  };

  const handleRespondSubmit = async (e) => {
    e.preventDefault();
    if (!responseText.trim()) {
      showError('Please enter a response message');
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.post(`/reviews/${selectedReview.id}/respond/`, {
        owner_response: responseText,
      });
      if (res.success) {
        showSuccess('Your public response has been published!');
        setRespondModalOpen(false);
        fetchReviews();
      }
    } catch (err) {
      showError(err.message || 'Failed to submit response');
    } finally {
      setActionLoading(false);
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
        <h1 className="text-2xl font-bold text-slate-900">Guest Reviews & Ratings</h1>
        <p className="text-sm text-slate-500 mt-1">Review feedback from verified completed bookings and respond to customers publicly</p>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          icon={MessageSquareQuote}
          title="No guest reviews yet"
          description="Reviews will appear here after customers complete their events at your venues."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {reviews.map((r) => (
            <Card key={r.id} className="border-slate-200 shadow-xs">
              <CardBody className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                      {(r.customer_name || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{r.customer_name}</div>
                      <span className="text-xs text-slate-400">Reviewed for {r.hall_name} • {formatDate(r.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 text-xs font-bold text-slate-900">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{r.rating}.0 Stars</span>
                  </div>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed italic">
                  "{r.comment}"
                </p>

                {/* Owner Response Box if present */}
                {r.owner_response && (
                  <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1">
                    <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Your Public Response ({formatDate(r.owner_responded_at)}):</span>
                    </div>
                    <p className="text-xs text-indigo-950 leading-relaxed">{r.owner_response}</p>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={MessageSquareQuote}
                    onClick={() => handleOpenRespondModal(r)}
                  >
                    {r.owner_response ? 'Edit Response' : 'Reply Publicly'}
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Response Modal */}
      {selectedReview && (
        <Modal
          isOpen={respondModalOpen}
          onClose={() => setRespondModalOpen(false)}
          title={`Reply to ${selectedReview.customer_name}'s Review`}
          description={`Venue: ${selectedReview.hall_name} (${selectedReview.rating}★)`}
        >
          <form onSubmit={handleRespondSubmit} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 italic">
              "{selectedReview.comment}"
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Your Public Response
              </label>
              <textarea
                rows={4}
                required
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="e.g. Thank you for your feedback! It was an honor hosting your special event..."
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setRespondModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={actionLoading} icon={Send}>
                Publish Response
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
