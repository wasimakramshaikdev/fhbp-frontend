import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Building2, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardBody } from '../components/ui/Card';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const redirectUrl = searchParams.get('redirect') || location.state?.from?.pathname || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      console.log('[AUTH DEBUG] login request initiated for:', email);
      const res = await api.post('/auth/login/', { email, password });
      console.log('[AUTH DEBUG] login response received: true');

      const resData = (res && res.data) ? res.data : res;
      const user = resData?.user || res?.user;
      const tokens = resData?.tokens || resData || res?.tokens;
      const accessToken = resData?.access_token || resData?.tokens?.access_token || res?.access_token || res?.tokens?.access_token;

      if ((res?.success !== false) && user && (accessToken || tokens)) {
        login(user, tokens || { access_token: accessToken });
        showSuccess('Logged in successfully!');

        if (redirectUrl) {
          navigate(redirectUrl);
        } else if (user.role === 'OWNER') {
          navigate('/owner/dashboard');
        } else if (user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/dashboard/bookings');
        }
      } else {
        setErrorMsg(res?.message || 'Invalid email or password');
      }
    } catch (err) {
      console.warn('[AUTH DEBUG] login error:', err);
      const payload = err?.response?.data || err || {};
      const message =
        payload?.message ||
        payload?.detail ||
        payload?.error ||
        err?.message ||
        'Invalid email or password. Please try again.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-600/20">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Sign in to PotlaEventSpaces</h1>
          <p className="text-sm text-slate-500">
            {redirectUrl ? 'Sign in to complete your venue reservation' : 'Manage bookings, view verified venues, or administer listings'}
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
              />

              <Input
                label="Password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
              />

              <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
                Sign In
              </Button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              Don't have an account?{' '}
              <Link to={redirectUrl ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : "/register"} className="font-semibold text-indigo-600 hover:text-indigo-700">
                Create an account
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
