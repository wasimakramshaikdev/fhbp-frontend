import React, { useState } from 'react';
import { AlertTriangle, Building2, CheckCircle2, FileCheck2, ShieldCheck, UploadCloud } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../components/ui/Card';

export const OwnerVerificationPage = () => {
  const { user, login } = useAuth();
  const { showSuccess, showError } = useToast();
  const profile = user?.owner_profile || {};
  const status = profile.verification_status || 'PENDING';
  const [submitting, setSubmitting] = useState(false);
  const [idProof, setIdProof] = useState(null);
  const [businessProof, setBusinessProof] = useState(null);

  const statusMeta = {
    PENDING: {
      label: 'Pending Verification',
      variant: 'warning',
      description: 'Your venue details are being reviewed by the PotlaEventSpaces team.',
    },
    VERIFIED: {
      label: 'Verified',
      variant: 'success',
      description: 'Your account has been approved and your venue is eligible to go live.',
    },
    REJECTED: {
      label: 'Rejected',
      variant: 'danger',
      description: 'Your submission needs attention. Update the required details and re-submit.',
    },
    SUSPENDED: {
      label: 'Suspended',
      variant: 'danger',
      description: 'This account is temporarily suspended. Please contact support for review.',
    },
  }[status] || {
    label: 'Pending Verification',
    variant: 'warning',
    description: 'Your venue details are being reviewed by the PotlaEventSpaces team.',
  };

  const requiredItems = [
    { label: 'Business name', value: profile.business_name },
    { label: 'GSTIN / PAN', value: profile.pan_gst_number },
    { label: 'Registration number', value: profile.registration_number },
    { label: 'Address', value: profile.address },
    { label: 'Locality', value: profile.locality },
    { label: 'Bank account holder', value: profile.bank_account_holder },
    { label: 'IFSC code', value: profile.bank_ifsc_code },
  ];

  const rejectionReason = profile.verification_notes || profile.notes || 'Your verification documents require attention before approval.';

  const completion = Math.round(
    (requiredItems.filter((item) => item.value && String(item.value).trim()).length / requiredItems.length) * 100
  );

  const handleKycSubmit = async (event) => {
    event.preventDefault();
    if (!idProof && !businessProof) {
      showError('Please upload at least one KYC document before submitting.');
      return;
    }

    const formData = new FormData();
    if (idProof) formData.append('id_proof', idProof);
    if (businessProof) formData.append('business_proof', businessProof);

    try {
      setSubmitting(true);
      const response = await api.patch('/auth/me/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response?.success) {
        login(response.data);
        showSuccess('KYC documents uploaded successfully. The admin team will review them shortly.');
        setIdProof(null);
        setBusinessProof(null);
      } else {
        showError(response?.message || 'Unable to upload KYC documents right now.');
      }
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Unable to upload KYC documents right now.';
      showError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">KYC & Verification</h1>
          <p className="text-sm text-slate-500 mt-1">Complete your owner identity and business verification before publishing listings.</p>
        </div>
        <Badge variant={statusMeta.variant} size="lg">{statusMeta.label}</Badge>
      </div>

      {status === 'REJECTED' && (
        <Card className="border-rose-200 bg-rose-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-rose-700">
              <AlertTriangle className="w-5 h-5" />
              Verification feedback
            </CardTitle>
            <CardDescription className="text-rose-700/80">{rejectionReason}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card className="border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-violet-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            Verification status
          </CardTitle>
          <CardDescription>{statusMeta.description}</CardDescription>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
            <div className="text-sm font-bold text-slate-700">{completion}% complete</div>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Business profile checks
            </CardTitle>
            <CardDescription>These details are required for ownership verification and payout approval.</CardDescription>
          </CardHeader>
          <CardBody className="space-y-3">
            {requiredItems.map((item) => {
              const isComplete = !!(item.value && String(item.value).trim());
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5"
                >
                  <span className="text-sm text-slate-600">{item.label}</span>
                  {isComplete ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4" />
                      Added
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                      <AlertTriangle className="w-4 h-4" />
                      Missing
                    </span>
                  )}
                </div>
              );
            })}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-indigo-600" />
              What happens next
            </CardTitle>
            <CardDescription>Our admin team reviews the owner verification before your venue can be published.</CardDescription>
          </CardHeader>
          <CardBody className="space-y-4 text-sm text-slate-600">
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="font-semibold text-slate-800">1. Submit your business details</div>
              <p className="mt-1">Complete your payout and identity information in the profile section.</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="font-semibold text-slate-800">2. Admin review</div>
              <p className="mt-1">The PotlaEventSpaces admin team reviews your venue ownership and compliance profile.</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="font-semibold text-slate-800">3. Listing activation</div>
              <p className="mt-1">Once verified, you can create and publish listings without platform blockers.</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <form onSubmit={handleKycSubmit} className="space-y-4">
        <Card className="border-indigo-100 bg-indigo-50/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-indigo-600" />
              Upload KYC documents
            </CardTitle>
            <CardDescription>Submit ID proof and business proof so the admin team can verify your ownership profile.</CardDescription>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block rounded-2xl border border-dashed border-slate-300 bg-white p-4">
                <span className="mb-2 block text-sm font-semibold text-slate-700">ID proof</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-indigo-700"
                  onChange={(event) => setIdProof(event.target.files?.[0] || null)}
                />
                <span className="mt-2 block text-xs text-slate-500">{idProof ? idProof.name : 'Upload a government ID or address proof'}</span>
              </label>

              <label className="block rounded-2xl border border-dashed border-slate-300 bg-white p-4">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Business proof</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-indigo-700"
                  onChange={(event) => setBusinessProof(event.target.files?.[0] || null)}
                />
                <span className="mt-2 block text-xs text-slate-500">{businessProof ? businessProof.name : 'Upload GST, registration, or business certificate'}</span>
              </label>
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="primary" isLoading={submitting}>
                Submit KYC documents
              </Button>
            </div>
          </CardBody>
        </Card>
      </form>

      <div className="flex justify-end">
        <Button variant="primary" onClick={() => window.history.back()}>
          Back to dashboard
        </Button>
      </div>
    </div>
  );
};
