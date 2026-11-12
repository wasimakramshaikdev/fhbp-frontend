import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Building2, ShieldCheck, CreditCard, Save } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const ProfilePage = () => {
  const { user, login } = useAuth();
  const { showSuccess, showError } = useToast();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  
  // Owner fields
  const [businessName, setBusinessName] = useState(user?.owner_profile?.business_name || '');
  const [regNumber, setRegNumber] = useState(user?.owner_profile?.registration_number || '');
  const [panGst, setPanGst] = useState(user?.owner_profile?.pan_gst_number || '');
  const [address, setAddress] = useState(user?.owner_profile?.address || '');
  const [city, setCity] = useState(user?.owner_profile?.city || 'Hyderabad');
  const [locality, setLocality] = useState(user?.owner_profile?.locality || '');
  const [bankHolder, setBankHolder] = useState(user?.owner_profile?.bank_account_holder || '');
  const [bankNumber, setBankNumber] = useState('');
  const [bankIfsc, setBankIfsc] = useState(user?.owner_profile?.bank_ifsc_code || '');
  const [idProofFile, setIdProofFile] = useState(null);
  const [businessProofFile, setBusinessProofFile] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
      if (user.owner_profile) {
        setBusinessName(user.owner_profile.business_name || '');
        setRegNumber(user.owner_profile.registration_number || '');
        setPanGst(user.owner_profile.pan_gst_number || '');
        setAddress(user.owner_profile.address || '');
        setCity(user.owner_profile.city || 'Hyderabad');
        setLocality(user.owner_profile.locality || '');
        setBankHolder(user.owner_profile.bank_account_holder || '');
        setBankIfsc(user.owner_profile.bank_ifsc_code || '');
      }
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const hasKycFiles = !!idProofFile || !!businessProofFile;
    const payload = {
      full_name: fullName,
      phone,
    };

    if (user?.role === 'OWNER') {
      payload.business_name = businessName;
      payload.registration_number = regNumber;
      payload.pan_gst_number = panGst;
      payload.address = address;
      payload.city = city;
      payload.locality = locality;
      payload.bank_account_holder = bankHolder;
      payload.bank_ifsc_code = bankIfsc;
      if (bankNumber) {
        payload.bank_account_number = bankNumber;
      }
    }

    try {
      let res;
      if (hasKycFiles) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            formData.append(key, value);
          }
        });
        if (idProofFile) formData.append('id_proof', idProofFile);
        if (businessProofFile) formData.append('business_proof', businessProofFile);

        res = await api.patch('/auth/me/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await api.patch('/auth/me/', payload);
      }

      if (res.success) {
        login(res.data);
        showSuccess(hasKycFiles ? 'Profile and KYC documents updated successfully!' : 'Profile updated successfully!');
        setBankNumber('');
        setIdProofFile(null);
        setBusinessProofFile(null);
      }
    } catch (err) {
      showError(err?.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile & Security Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your personal details, contact numbers, and payout accounts</p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
        {/* Personal Details */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your identity details across PotlaEventSpaces</CardDescription>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                icon={User}
              />
              <Input
                label="Email Address"
                value={user?.email || ''}
                disabled
                icon={Mail}
                helperText="Email address cannot be changed."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                icon={Phone}
                placeholder="+91 9876543210"
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Account Role</label>
                <div className="flex items-center gap-2 pt-1.5 flex-wrap">
                  <Badge variant="primary">{user?.role}</Badge>
                  {user?.is_verified ? (
                    <Badge variant="success">Email Verified</Badge>
                  ) : (
                    <Badge variant="warning">Email Unverified</Badge>
                  )}
                  {user?.role === 'OWNER' && (
                    <>
                      {user?.owner_profile?.verification_status === 'VERIFIED' && (
                        <Badge variant="success">Owner Verified</Badge>
                      )}
                      {user?.owner_profile?.verification_status === 'PENDING' && (
                        <Badge variant="warning">Verification Pending</Badge>
                      )}
                      {user?.owner_profile?.verification_status === 'REJECTED' && (
                        <Badge variant="danger">Verification Rejected</Badge>
                      )}
                      {user?.owner_profile?.verification_status === 'SUSPENDED' && (
                        <Badge variant="danger">Verification Suspended</Badge>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Owner Business & Payout Info */}
        {user?.role === 'OWNER' && (
          <Card>
            <CardHeader>
              <CardTitle>Business & Payout Details</CardTitle>
              <CardDescription>Required for receiving direct bank payouts for completed bookings</CardDescription>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Registered Business Name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  icon={Building2}
                  required
                />
                <Input
                  label="GSTIN / PAN Number"
                  value={panGst}
                  onChange={(e) => setPanGst(e.target.value)}
                  placeholder="36AABCG1234F1Z5"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Plot 42, Hitech City"
                />
                <Input
                  label="Locality"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="Madhapur"
                />
                <Input
                  label="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  Bank Account for Payouts
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Account Holder Name"
                    value={bankHolder}
                    onChange={(e) => setBankHolder(e.target.value)}
                    placeholder="Grand Orchid Hospitality"
                  />
                  <Input
                    label="Account Number"
                    type="password"
                    value={bankNumber}
                    onChange={(e) => setBankNumber(e.target.value)}
                    placeholder={user?.owner_profile?.masked_bank_account || "•••• •••• ••••"}
                    helperText={user?.owner_profile?.masked_bank_account ? `Current: ${user.owner_profile.masked_bank_account}` : "Enter account number"}
                  />
                  <Input
                    label="IFSC Code"
                    value={bankIfsc}
                    onChange={(e) => setBankIfsc(e.target.value)}
                    placeholder="HDFC0001234"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h4 className="text-sm font-semibold text-slate-900">KYC Documents</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                    <span className="mb-2 block text-sm font-medium text-slate-700">ID proof</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-indigo-700"
                      onChange={(event) => setIdProofFile(event.target.files?.[0] || null)}
                    />
                    <span className="mt-2 block text-xs text-slate-500">{idProofFile ? idProofFile.name : 'Upload a valid government-issued ID'}</span>
                  </label>

                  <label className="block rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Business proof</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-indigo-700"
                      onChange={(event) => setBusinessProofFile(event.target.files?.[0] || null)}
                    />
                    <span className="mt-2 block text-xs text-slate-500">{businessProofFile ? businessProofFile.name : 'Upload GST or business registration proof'}</span>
                  </label>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="lg" icon={Save} isLoading={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
