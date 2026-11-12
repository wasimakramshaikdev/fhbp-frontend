import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Camera, IndianRupee, Send, CheckCircle2, AlertCircle, Plus, Trash2, Star, ArrowRight, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card, CardHeader, CardTitle, CardDescription, CardBody, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { formatCurrency } from '../utils/formatters';

export const OwnerOnboardingWizard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [amenitiesList, setAmenitiesList] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address_line1: '',
    address_line2: '',
    city: 'Hyderabad',
    locality: 'Madhapur',
    postal_code: '500081',
    min_capacity: 150,
    max_capacity: 500,
    hall_type: 'AC',
    base_price_morning: 35000,
    base_price_evening: 48000,
    base_price_full_day: 75000,
    advance_percentage: 20,
    catering_policy: 'BOTH',
    veg_plate_price: 550,
    non_veg_plate_price: 800,
    decor_price: 15000,
    dj_price: 10000,
    cancellation_policy: 'MODERATE',
    amenity_ids: [],
    initial_images: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&q=80'
    ]
  });

  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const res = await api.get('/halls/amenities/');
        if (res.success) {
          setAmenitiesList(res.data);
          // Pre-select first 3 amenities by default
          setFormData((prev) => ({
            ...prev,
            amenity_ids: res.data.slice(0, 3).map((a) => a.id),
          }));
        }
      } catch (err) {
        console.warn('Failed to load amenities:', err);
      }
    };
    fetchAmenities();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setFormData((prev) => ({
      ...prev,
      initial_images: [...prev.initial_images, newImageUrl.trim()],
    }));
    setNewImageUrl('');
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      initial_images: prev.initial_images.filter((_, idx) => idx !== index),
    }));
  };

  const toggleAmenity = (id) => {
    setFormData((prev) => {
      const exists = prev.amenity_ids.includes(id);
      return {
        ...prev,
        amenity_ids: exists
          ? prev.amenity_ids.filter((item) => item !== id)
          : [...prev.amenity_ids, id],
      };
    });
  };

  const handleSubmitListing = async () => {
    if (loading) return;

    setLoading(true);
    try {
      // 1. Create Draft Hall
      const createRes = await api.post('/owner/listings/', formData);
      if (!createRes.success) {
        throw new Error(createRes.message || 'Creation failed');
      }

      const hallId = createRes.data.id;

      // 2. Submit for Admin Approval
      const submitRes = await api.post(`/owner/listings/${hallId}/submit/`);
      if (submitRes.success) {
        showSuccess('Hall submitted for Admin approval! Status is now Under Review.');
        navigate('/owner/listings');
      }
    } catch (err) {
      showError(err.message || 'Failed to submit venue listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
          <Building2 className="w-4 h-4" />
          <span>Venue Onboarding Wizard</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">List Your Function Hall</h1>
        <p className="text-sm text-slate-500">
          Complete the 4-step listing process to publish your venue on PotlaEventSpaces
        </p>
      </div>

      {/* Step Indicator */}
      <div className="grid grid-cols-4 gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        {[
          { step: 1, title: '1. Basic Info' },
          { step: 2, title: '2. Photos' },
          { step: 3, title: '3. Pricing & Rules' },
          { step: 4, title: '4. Submit for Approval' },
        ].map((item) => (
          <div
            key={item.step}
            onClick={() => item.step < currentStep && setCurrentStep(item.step)}
            className={`flex items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition text-center cursor-pointer ${
              currentStep === item.step
                ? 'bg-indigo-600 text-white shadow-sm'
                : currentStep > item.step
                ? 'bg-indigo-50 text-indigo-700'
                : 'bg-slate-50 text-slate-400 cursor-not-allowed'
            }`}
          >
            {item.title}
          </div>
        ))}
      </div>

      {/* STEP 1: Basic Info */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1 — Basic Hall Information</CardTitle>
            <CardDescription>Enter venue name, location, capacity, and venue type</CardDescription>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              label="Hall Name"
              placeholder="e.g. Grand Orchid Banquets & Convention"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description & Ambiance</label>
              <textarea
                rows={4}
                className="w-full rounded-xl border border-slate-300 p-3.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                placeholder="Describe your hall's ambience, stage dimensions, ceiling height, chandeliers, and acoustic setup..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Street Address"
                placeholder="Plot 42, Road No 36"
                value={formData.address_line1}
                onChange={(e) => handleChange('address_line1', e.target.value)}
                required
              />
              <Select
                label="Locality in Hyderabad"
                value={formData.locality}
                onChange={(e) => handleChange('locality', e.target.value)}
              >
                <option value="Madhapur">Madhapur</option>
                <option value="Gachibowli">Gachibowli</option>
                <option value="Kondapur">Kondapur</option>
                <option value="Banjara Hills">Banjara Hills</option>
                <option value="Jubilee Hills">Jubilee Hills</option>
                <option value="Kukatpally">Kukatpally</option>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Min Capacity (Guests)"
                type="number"
                value={formData.min_capacity}
                onChange={(e) => handleChange('min_capacity', parseInt(e.target.value) || 0)}
              />
              <Input
                label="Max Capacity (Guests)"
                type="number"
                value={formData.max_capacity}
                onChange={(e) => handleChange('max_capacity', parseInt(e.target.value) || 0)}
              />
              <Select
                label="Hall Type"
                value={formData.hall_type}
                onChange={(e) => handleChange('hall_type', e.target.value)}
              >
                <option value="AC">AC Banquet Hall</option>
                <option value="NON_AC">Non-AC Hall</option>
                <option value="OPEN_LAWN">Open Lawn</option>
                <option value="HYBRID">Hybrid (Lawn & Hall)</option>
                <option value="CONVENTION">Convention Center</option>
              </Select>
            </div>

            {/* Amenities Checklist */}
            <div className="pt-3 border-t border-slate-100">
              <label className="block text-sm font-medium text-slate-700 mb-2">Available Amenities & Facilities</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {amenitiesList.map((am) => (
                  <button
                    type="button"
                    key={am.id}
                    onClick={() => toggleAmenity(am.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition text-left ${
                      formData.amenity_ids.includes(am.id)
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        formData.amenity_ids.includes(am.id) ? 'text-indigo-600' : 'text-slate-300'
                      }`}
                    />
                    <span>{am.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardBody>
          <CardFooter>
            <div className="ml-auto">
              <Button
                variant="primary"
                onClick={() => {
                  if (!formData.name || !formData.address_line1) {
                    showError('Please fill in required fields (Name and Address)');
                    return;
                  }
                  setCurrentStep(2);
                }}
              >
                Next: Upload Photos <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      {/* STEP 2: Photos */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2 — Hall Photography & Gallery</CardTitle>
            <CardDescription>Add high-resolution image URLs showcasing your banquet stage, seating, and lighting</CardDescription>
          </CardHeader>
          <CardBody className="space-y-6">
            <div className="flex gap-2">
              <Input
                placeholder="Paste public image URL (e.g. https://...)"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
              />
              <Button variant="secondary" onClick={handleAddImage} icon={Plus}>
                Add Photo
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {formData.initial_images.map((url, idx) => (
                <div key={idx} className="relative rounded-2xl overflow-hidden border border-slate-200 group aspect-video bg-slate-100 shadow-xs">
                  <img src={url} alt={`Hall preview ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2">
                    {idx === 0 ? (
                      <Badge variant="primary">Cover Photo</Badge>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-900/80 text-white rounded-md">
                        Photo #{idx + 1}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition hover:bg-rose-700 shadow-md"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </CardBody>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep(1)} icon={ArrowLeft}>
              Back
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (formData.initial_images.length === 0) {
                  showError('Please add at least 1 photo for your listing');
                  return;
                }
                setCurrentStep(3);
              }}
            >
              Next: Pricing & Rules <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 3: Pricing & Rules */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3 — Pricing Structure & Booking Policies</CardTitle>
            <CardDescription>Configure base rent for time slots, catering policies, addons, and advance deposit %</CardDescription>
          </CardHeader>
          <CardBody className="space-y-6">
            {/* Slot Pricing */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">Slot Rent Rates (INR)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Morning Slot (08:00 - 14:00)"
                  type="number"
                  value={formData.base_price_morning}
                  onChange={(e) => handleChange('base_price_morning', parseFloat(e.target.value) || 0)}
                />
                <Input
                  label="Evening Slot (16:00 - 23:00)"
                  type="number"
                  value={formData.base_price_evening}
                  onChange={(e) => handleChange('base_price_evening', parseFloat(e.target.value) || 0)}
                />
                <Input
                  label="Full Day Slot (08:00 - 23:00)"
                  type="number"
                  value={formData.base_price_full_day}
                  onChange={(e) => handleChange('base_price_full_day', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Catering & Addons */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">Catering & Per-Plate Pricing</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                  label="Catering Policy"
                  value={formData.catering_policy}
                  onChange={(e) => handleChange('catering_policy', e.target.value)}
                >
                  <option value="BOTH">In-house & Outside Allowed</option>
                  <option value="IN_HOUSE_ONLY">In-house Catering Only</option>
                  <option value="OUTSIDE_ALLOWED">Outside Catering Allowed</option>
                </Select>
                <Input
                  label="Veg Plate Price (₹)"
                  type="number"
                  value={formData.veg_plate_price}
                  onChange={(e) => handleChange('veg_plate_price', parseFloat(e.target.value) || 0)}
                />
                <Input
                  label="Non-Veg Plate Price (₹)"
                  type="number"
                  value={formData.non_veg_plate_price}
                  onChange={(e) => handleChange('non_veg_plate_price', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Decor & DJ */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">Add-on Services</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Premium Stage Decor Fee (₹)"
                  type="number"
                  value={formData.decor_price}
                  onChange={(e) => handleChange('decor_price', parseFloat(e.target.value) || 0)}
                />
                <Input
                  label="DJ & Sound System Setup (₹)"
                  type="number"
                  value={formData.dj_price}
                  onChange={(e) => handleChange('dj_price', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Advance & Cancellation */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">Deposit & Cancellation Rules</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Advance Deposit Required (%)"
                  type="number"
                  min="10"
                  max="100"
                  value={formData.advance_percentage}
                  onChange={(e) => handleChange('advance_percentage', parseFloat(e.target.value) || 0)}
                  helperText="Default 20% advance payable by customer at checkout."
                />
                <Select
                  label="Cancellation Policy"
                  value={formData.cancellation_policy}
                  onChange={(e) => handleChange('cancellation_policy', e.target.value)}
                >
                  <option value="FLEXIBLE">Flexible (Full refund up to 14 days)</option>
                  <option value="MODERATE">Moderate (70% refund up to 30 days)</option>
                  <option value="STRICT">Strict (50% refund up to 30 days)</option>
                </Select>
              </div>
            </div>
          </CardBody>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep(2)} icon={ArrowLeft}>
              Back
            </Button>
            <Button variant="primary" onClick={() => setCurrentStep(4)}>
              Review & Submit <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 4: Review & Submit */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4 — Review & Submit for Admin Approval</CardTitle>
            <CardDescription>Confirm your venue details. Once submitted, listing status will be set to 'Under Review'.</CardDescription>
          </CardHeader>
          <CardBody className="space-y-6">
            {/* Live Preview Card */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-1/3 aspect-video rounded-xl overflow-hidden bg-slate-200">
                  <img src={formData.initial_images[0]} alt="Cover" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary">{formData.hall_type}</Badge>
                    <Badge variant="warning">Status: Under Review</Badge>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{formData.name}</h3>
                  <p className="text-xs text-slate-500">{formData.address_line1}, {formData.locality}, {formData.city}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-200">
                    <div>Capacity: <span className="font-bold text-slate-900">{formData.min_capacity} - {formData.max_capacity} Guests</span></div>
                    <div>Evening Rent: <span className="font-bold text-indigo-600">{formatCurrency(formData.base_price_evening)}</span></div>
                    <div>Advance: <span className="font-bold text-slate-900">{formData.advance_percentage}%</span></div>
                    <div>Catering: <span className="font-bold text-slate-900">₹{formData.veg_plate_price}/veg plate</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 leading-relaxed flex gap-3">
              <AlertCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                By submitting this listing, you agree to the PotlaEventSpaces Host Terms. Our verification team will review your photos, capacity guidelines, and locality within 24 hours before making the venue live for customer reservations.
              </span>
            </div>
          </CardBody>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep(3)} icon={ArrowLeft}>
              Back
            </Button>
            <Button
              variant="success"
              size="lg"
              onClick={handleSubmitListing}
              isLoading={loading}
              icon={Send}
            >
              Submit for Admin Approval
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};
