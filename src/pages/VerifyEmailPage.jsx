// import React, { useState } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import {
//   Building2,
//   Mail,
//   ShieldCheck,
//   AlertCircle,
// } from 'lucide-react';

// import api from '../services/api';
// import { useAuth } from '../context/AuthContext';
// import { useToast } from '../context/ToastContext';

// import { Button } from '../components/ui/Button';
// import { Input } from '../components/ui/Input';
// import { Card, CardBody } from '../components/ui/Card';


// export const VerifyEmailPage = () => {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();

//   const { login } = useAuth();
//   const { showSuccess, showError } = useToast();

//   const email = searchParams.get('email') || '';
//   const role = searchParams.get('role') || 'CUSTOMER';

//   const [otp, setOtp] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [resending, setResending] = useState(false);
//   const [errorMsg, setErrorMsg] = useState('');


//   const handleVerifyOTP = async (e) => {
//     e.preventDefault();

//     setErrorMsg('');

//     if (!email) {
//       const message = 'Email address is missing.';
//       setErrorMsg(message);
//       showError(message);
//       return;
//     }

//     if (otp.length !== 6) {
//       const message = 'Please enter the 6-digit OTP.';
//       setErrorMsg(message);
//       showError(message);
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await api.post(
//         '/auth/verify-email-otp/',
//         {
//           email,
//           otp,
//         }
//       );

//       const resData = res?.data || res;

//       const user =
//         resData?.data?.user ||
//         resData?.user;

//       const tokens =
//         resData?.data?.tokens ||
//         resData?.tokens;

//       if (resData?.success !== false) {

//         showSuccess(
//           'Email verified successfully!'
//         );

//         if (user && tokens) {
//           login(user, tokens);
//         }

//         if (role === 'OWNER') {
//           navigate('/owner/onboarding');
//         } else {
//           navigate('/dashboard/bookings');
//         }

//       } else {
//         const message =
//           resData?.message ||
//           'OTP verification failed.';

//         setErrorMsg(message);
//         showError(message);
//       }

//     } catch (err) {

//       const message =
//         err?.response?.data?.message ||
//         err?.response?.data?.errors?.otp?.[0] ||
//         err?.message ||
//         'Invalid or expired OTP.';

//       setErrorMsg(message);
//       showError(message);

//     } finally {
//       setLoading(false);
//     }
//   };


//   const handleResendOTP = async () => {
//     setErrorMsg('');

//     if (!email) {
//       const message = 'Email address is missing.';
//       setErrorMsg(message);
//       showError(message);
//       return;
//     }

//     setResending(true);

//     try {
//       const res = await api.post(
//         '/auth/send-email-otp/',
//         {
//           email,
//         }
//       );

//       const resData = res?.data || res;

//       if (resData?.success !== false) {

//         showSuccess(
//           'A new OTP has been sent to your email.'
//         );

//         setOtp('');

//       } else {

//         const message =
//           resData?.message ||
//           'Failed to resend OTP.';

//         setErrorMsg(message);
//         showError(message);
//       }

//     } catch (err) {

//       const message =
//         err?.response?.data?.message ||
//         err?.message ||
//         'Failed to resend OTP.';

//       setErrorMsg(message);
//       showError(message);

//     } finally {
//       setResending(false);
//     }
//   };


//   return (
//     <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">

//       <div className="max-w-md w-full space-y-6">

//         {/* Header */}
//         <div className="text-center space-y-2">

//           <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-600/20">
//             <Building2 className="w-7 h-7" />
//           </div>

//           <h1 className="text-2xl font-black tracking-tight text-slate-900">
//             Verify your Email
//           </h1>

//           <p className="text-sm text-slate-500">
//             Enter the 6-digit OTP sent to
//           </p>

//           <p className="text-sm font-semibold text-slate-800 break-all">
//             {email}
//           </p>

//         </div>


//         <Card className="shadow-lg border-slate-200">

//           <CardBody className="p-8 space-y-5">

//             {/* Error Message */}
//             {errorMsg && (
//               <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center gap-2.5">

//                 <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />

//                 <span>
//                   {errorMsg}
//                 </span>

//               </div>
//             )}


//             {/* OTP Form */}
//             <form
//               onSubmit={handleVerifyOTP}
//               className="space-y-5"
//             >

//               <Input
//                 label="Verification OTP"
//                 type="text"
//                 required
//                 placeholder="Enter 6-digit OTP"
//                 value={otp}
//                 onChange={(e) => {
//                   const value = e.target.value
//                     .replace(/\D/g, '')
//                     .slice(0, 6);

//                   setOtp(value);
//                 }}
//                 icon={ShieldCheck}
//                 inputMode="numeric"
//                 maxLength={6}
//               />

//               <p className="text-xs text-slate-500">
//                 Please check your inbox and enter the OTP sent to your email address.
//               </p>


//               <Button
//                 type="submit"
//                 variant="primary"
//                 size="lg"
//                 className="w-full"
//                 isLoading={loading}
//               >
//                 Verify Email
//               </Button>

//             </form>


//             {/* Resend OTP */}
//             <div className="pt-4 border-t border-slate-100 text-center">

//               <p className="text-xs text-slate-500 mb-2">
//                 Didn't receive the OTP?
//               </p>

//               <button
//                 type="button"
//                 onClick={handleResendOTP}
//                 disabled={resending}
//                 className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
//               >
//                 {resending
//                   ? 'Sending...'
//                   : 'Resend OTP'}
//               </button>

//             </div>


//             {/* Email Info */}
//             <div className="flex items-center justify-center gap-2 text-xs text-slate-400">

//               <Mail className="w-4 h-4" />

//               <span>
//                 OTP expires after a limited time.
//               </span>

//             </div>

//           </CardBody>

//         </Card>

//       </div>

//     </div>
//   );
// };





import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  Building2,
  Mail,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardBody } from '../components/ui/Card';


export const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { login } = useAuth();
  const { showSuccess, showError } = useToast();

  const email = searchParams.get('email') || '';
  const role = searchParams.get('role') || 'CUSTOMER';
  const redirectUrl = searchParams.get('redirect') || '';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');


  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    setErrorMsg('');

    if (!email) {
      const message = 'Email address is missing. Please register again.';

      setErrorMsg(message);
      showError(message);

      return;
    }

    if (otp.length !== 6) {
      const message = 'Please enter the 6-digit OTP.';

      setErrorMsg(message);
      showError(message);

      return;
    }

    setLoading(true);

    try {
      const res = await api.post(
        '/auth/verify-email-otp/',
        {
          email,
          otp,
        }
      );

      const resData = res?.data || res;

      if (resData?.success === false) {
        const message =
          resData?.message ||
          'OTP verification failed.';

        setErrorMsg(message);
        showError(message);

        return;
      }

      const user =
        resData?.data?.user ||
        resData?.user;

      const tokens =
        resData?.data?.tokens ||
        resData?.tokens;

      if (!user || !tokens) {
        const message =
          'Email was verified, but authentication data was not received. Please log in again.';

        setErrorMsg(message);
        showError(message);

        return;
      }

      login(user, tokens);

      showSuccess(
        'Email verified successfully!'
      );

      if (redirectUrl) {
        navigate(
          redirectUrl,
          { replace: true }
        );

        return;
      }

      if (role === 'OWNER') {
        navigate(
          '/owner/onboarding',
          { replace: true }
        );
      } else {
        navigate(
          '/dashboard/bookings',
          { replace: true }
        );
      }

    } catch (err) {
      const errors =
        err?.response?.data?.errors || {};

      const message =
        errors?.otp?.[0] ||
        errors?.email?.[0] ||
        err?.response?.data?.message ||
        err?.message ||
        'Invalid or expired OTP.';

      setErrorMsg(message);
      showError(message);

    } finally {
      setLoading(false);
    }
  };


  const handleResendOTP = async () => {
    setErrorMsg('');

    if (!email) {
      const message =
        'Email address is missing. Please register again.';

      setErrorMsg(message);
      showError(message);

      return;
    }

    setResending(true);

    try {
      const res = await api.post(
        '/auth/send-email-otp/',
        {
          email,
        }
      );

      const resData = res?.data || res;

      if (resData?.success === false) {
        const message =
          resData?.message ||
          'Failed to resend OTP.';

        setErrorMsg(message);
        showError(message);

        return;
      }

      showSuccess(
        'A new OTP has been sent to your email.'
      );

      setOtp('');

    } catch (err) {
      const errors =
        err?.response?.data?.errors || {};

      const message =
        errors?.email?.[0] ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to resend OTP.';

      setErrorMsg(message);
      showError(message);

    } finally {
      setResending(false);
    }
  };


  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">

      <div className="max-w-md w-full space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">

          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-600/20">
            <Building2 className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Verify your Email
          </h1>

          <p className="text-sm text-slate-500">
            Enter the 6-digit OTP sent to
          </p>

          <p className="text-sm font-semibold text-slate-800 break-all">
            {email || 'your email address'}
          </p>

        </div>


        <Card className="shadow-lg border-slate-200">

          <CardBody className="p-8 space-y-5">

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center gap-2.5">

                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />

                <span>
                  {errorMsg}
                </span>

              </div>
            )}


            {/* OTP Form */}
            <form
              onSubmit={handleVerifyOTP}
              className="space-y-5"
            >

              <Input
                label="Verification OTP"
                type="text"
                required
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/\D/g, '')
                    .slice(0, 6);

                  setOtp(value);
                }}
                icon={ShieldCheck}
                inputMode="numeric"
                maxLength={6}
              />


              <p className="text-xs text-slate-500">
                Please check your inbox and enter the OTP sent to your email address.
              </p>


              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={loading}
              >
                Verify Email
              </Button>

            </form>


            {/* Resend OTP */}
            <div className="pt-4 border-t border-slate-100 text-center">

              <p className="text-xs text-slate-500 mb-2">
                Didn't receive the OTP?
              </p>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resending || loading}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
              >
                {resending
                  ? 'Sending...'
                  : 'Resend OTP'}
              </button>

            </div>


            {/* Email Info */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">

              <Mail className="w-4 h-4" />

              <span>
                OTP expires after a limited time.
              </span>

            </div>

          </CardBody>

        </Card>

      </div>

    </div>
  );
};