import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, CheckCircle2, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardBody } from '../components/ui/Card';

export const PasswordResetPage = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [email, setEmail] = useState('');
  const [token, setToken] = useState(tokenFromUrl || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.post('/auth/password-reset/', { email });
      if (res.success) {
        setSubmittedRequest(true);
        showSuccess('Password reset link dispatched.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.post('/auth/password-reset/confirm/', {
        token,
        new_password: newPassword,
      });
      if (res.success) {
        showSuccess('Password has been reset successfully. Please log in.');
        navigate('/login');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reset password. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mx-auto">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            {token ? 'Set New Password' : 'Reset Your Password'}
          </h1>
          <p className="text-sm text-slate-500">
            {token
              ? 'Enter your new secure password below'
              : 'Enter your registered email to receive a secure recovery token'}
          </p>
        </div>

        <Card className="shadow-lg border-slate-200">
          <CardBody className="p-8 space-y-5">
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {token ? (
              <form onSubmit={handleConfirmReset} className="space-y-4">
                <Input
                  label="Reset Token"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
                <Input
                  label="New Password"
                  type="password"
                  required
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  icon={Lock}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={Lock}
                />
                <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
                  Reset Password
                </Button>
              </form>
            ) : submittedRequest ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Recovery Instructions Sent</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  If an account exists with <span className="font-semibold text-slate-900">{email}</span>, we have dispatched password reset instructions.
                </p>
                <Link to="/login">
                  <Button variant="outline" className="w-full mt-4">
                    Return to Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <Input
                  label="Registered Email Address"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={Mail}
                />
                <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
                  Send Reset Link
                </Button>
              </form>
            )}

            <div className="pt-4 border-t border-slate-100 text-center">
              <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
