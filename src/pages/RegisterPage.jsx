// import React, { useState } from 'react';
// import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
// import { Building2, Mail, Lock, User, Phone, Briefcase, AlertCircle } from 'lucide-react';
// import api from '../services/api';
// import { useAuth } from '../context/AuthContext';
// import { useToast } from '../context/ToastContext';
// import { Button } from '../components/ui/Button';
// import { Input } from '../components/ui/Input';
// import { Card, CardBody } from '../components/ui/Card';

// export const RegisterPage = () => {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const location = useLocation();
//   const { login } = useAuth();
//   const { showSuccess, showError } = useToast();

//   const [role, setRole] = useState('CUSTOMER');
//   const [fullName, setFullName] = useState('');
//   const [email, setEmail] = useState('');
//   const [phone, setPhone] = useState('');
//   const [password, setPassword] = useState('');
//   const [businessName, setBusinessName] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState('');

//   const redirectUrl = searchParams.get('redirect') || location.state?.from?.pathname || '';

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setErrorMsg('');

//     try {
//       const res = await api.post('/auth/register/', {
//         full_name: fullName,
//         email,
//         phone,
//         password,
//         role,
//         business_name: role === 'OWNER' ? businessName : undefined,
//       });

//       const resData = (res && res.data) ? res.data : res;
//       const user = resData?.user || res?.user;
//       const tokens = resData?.tokens || resData || res?.tokens;
//       const accessToken = resData?.access_token || resData?.tokens?.access_token || res?.access_token || res?.tokens?.access_token;

//       if ((res?.success !== false) && user && (accessToken || tokens)) {
//         login(user, tokens || { access_token: accessToken });
//         showSuccess('Account registered successfully!');

//         if (redirectUrl) {
//           navigate(redirectUrl);
//         } else if (role === 'OWNER') {
//           navigate('/owner/onboarding');
//         } else {
//           navigate('/dashboard/bookings');
//         }
//       } else {
//         setErrorMsg(res?.message || 'Registration failed');
//       }
//     } catch (err) {
//       setErrorMsg(err.message || 'Registration failed. Please check your information.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
//       <div className="max-w-md w-full space-y-6">
//         <div className="text-center space-y-2">
//           <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-600/20">
//             <Building2 className="w-7 h-7" />
//           </div>
//           <h1 className="text-2xl font-black tracking-tight text-slate-900">Create your Account</h1>
//           <p className="text-sm text-slate-500">Join the premier function hall marketplace in Hyderabad</p>
//         </div>

//         <Card className="shadow-lg border-slate-200">
//           <CardBody className="p-8 space-y-5">
//             {/* Role Switcher */}
//             <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
//               <button
//                 type="button"
//                 onClick={() => setRole('CUSTOMER')}
//                 className={`py-2 text-xs font-bold rounded-lg transition ${
//                   role === 'CUSTOMER' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
//                 }`}
//               >
//                 I am a Customer
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setRole('OWNER')}
//                 className={`py-2 text-xs font-bold rounded-lg transition ${
//                   role === 'OWNER' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
//                 }`}
//               >
//                 I am a Hall Owner
//               </button>
//             </div>

//             {errorMsg && (
//               <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center gap-2.5">
//                 <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
//                 <span>{errorMsg}</span>
//               </div>
//             )}

//             <form onSubmit={handleSubmit} className="space-y-4">
//               <Input
//                 label="Full Name"
//                 required
//                 placeholder="Ravi Sharma"
//                 value={fullName}
//                 onChange={(e) => setFullName(e.target.value)}
//                 icon={User}
//               />

//               <Input
//                 label="Email Address"
//                 type="email"
//                 required
//                 placeholder="ravi@example.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 icon={Mail}
//               />

//               <Input
//                 label="Phone Number"
//                 type="tel"
//                 required
//                 placeholder="+91 9876543210"
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//                 icon={Phone}
//               />

//               {role === 'OWNER' && (
//                 <Input
//                   label="Venue / Business Name"
//                   required
//                   placeholder="Grand Orchid Banquets & Convention"
//                   value={businessName}
//                   onChange={(e) => setBusinessName(e.target.value)}
//                   icon={Briefcase}
//                 />
//               )}

//               <Input
//                 label="Password"
//                 type="password"
//                 required
//                 placeholder="At least 8 characters"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 icon={Lock}
//               />

//               <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
//                 Create Account
//               </Button>
//             </form>

//             <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
//               Already have an account?{' '}
//               <Link to={redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : "/login"} className="font-semibold text-indigo-600 hover:text-indigo-700">
//                 Sign in
//               </Link>
//             </div>
//           </CardBody>
//         </Card>
//       </div>
//     </div>
//   );
// };






// import React, { useState } from 'react';
// import {
//   Link,
//   useNavigate,
//   useSearchParams,
//   useLocation,
// } from 'react-router-dom';

// import {
//   Building2,
//   Mail,
//   Lock,
//   User,
//   Phone,
//   Briefcase,
//   AlertCircle,
//   Eye,
//   EyeOff,
// } from 'lucide-react';

// import api from '../services/api';
// import { useAuth } from '../context/AuthContext';
// import { useToast } from '../context/ToastContext';
// import { Button } from '../components/ui/Button';
// import { Input } from '../components/ui/Input';
// import { Card, CardBody } from '../components/ui/Card';


// export const RegisterPage = () => {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const location = useLocation();

//   const { login } = useAuth();
//   const { showSuccess, showError } = useToast();

//   const [role, setRole] = useState('CUSTOMER');
//   const [fullName, setFullName] = useState('');
//   const [email, setEmail] = useState('');
//   const [phone, setPhone] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [businessName, setBusinessName] = useState('');

//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const [loading, setLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState('');

//   const redirectUrl =
//     searchParams.get('redirect') ||
//     location.state?.from?.pathname ||
//     '';


//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setErrorMsg('');

//     // Password confirmation validation
//     if (password !== confirmPassword) {
//       const message = 'Passwords do not match.';
//       setErrorMsg(message);
//       showError(message);
//       return;
//     }

//     // Minimum password length validation
//     if (password.length < 8) {
//       const message = 'Password must be at least 8 characters.';
//       setErrorMsg(message);
//       showError(message);
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await api.post('/auth/register/', {
//         full_name: fullName,
//         email,
//         phone,
//         password,
//         role,
//         business_name:
//           role === 'OWNER'
//             ? businessName
//             : undefined,
//       });

//       const resData = res?.data || res;

//       const user =
//         resData?.user ||
//         resData?.data?.user ||
//         res?.user;

//       const tokens =
//         resData?.tokens ||
//         resData?.data?.tokens ||
//         res?.tokens;

//       const accessToken =
//         resData?.access_token ||
//         resData?.data?.access_token ||
//         resData?.tokens?.access_token ||
//         resData?.data?.tokens?.access_token ||
//         res?.access_token ||
//         res?.tokens?.access_token;


//       if (
//         res?.success !== false &&
//         user &&
//         (accessToken || tokens)
//       ) {
//         login(
//           user,
//           tokens || {
//             access_token: accessToken,
//           }
//         );

//         showSuccess(
//           'Account registered successfully!'
//         );

//         if (redirectUrl) {
//           navigate(redirectUrl);
//         } else if (role === 'OWNER') {
//           navigate('/owner/onboarding');
//         } else {
//           navigate('/dashboard/bookings');
//         }

//       } else {
//         const message =
//           resData?.message ||
//           res?.message ||
//           'Registration failed.';

//         setErrorMsg(message);
//         showError(message);
//       }

//     } catch (err) {
//       const message =
//         err?.response?.data?.message ||
//         err?.response?.data?.errors?.email?.[0] ||
//         err?.response?.data?.errors?.password?.[0] ||
//         err?.message ||
//         'Registration failed. Please check your information.';

//       setErrorMsg(message);
//       showError(message);

//     } finally {
//       setLoading(false);
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
//             Create your Account
//           </h1>

//           <p className="text-sm text-slate-500">
//             Join the premier function hall marketplace in Hyderabad
//           </p>

//         </div>


//         {/* Registration Card */}
//         <Card className="shadow-lg border-slate-200">

//           <CardBody className="p-8 space-y-5">

//             {/* Role Switcher */}
//             <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">

//               <button
//                 type="button"
//                 onClick={() => setRole('CUSTOMER')}
//                 className={`py-2 text-xs font-bold rounded-lg transition ${
//                   role === 'CUSTOMER'
//                     ? 'bg-white text-indigo-700 shadow-xs'
//                     : 'text-slate-600 hover:text-slate-900'
//                 }`}
//               >
//                 I am a Customer
//               </button>


//               <button
//                 type="button"
//                 onClick={() => setRole('OWNER')}
//                 className={`py-2 text-xs font-bold rounded-lg transition ${
//                   role === 'OWNER'
//                     ? 'bg-white text-indigo-700 shadow-xs'
//                     : 'text-slate-600 hover:text-slate-900'
//                 }`}
//               >
//                 I am a Hall Owner
//               </button>

//             </div>


//             {/* Error Message */}
//             {errorMsg && (
//               <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center gap-2.5">

//                 <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />

//                 <span>{errorMsg}</span>

//               </div>
//             )}


//             {/* Registration Form */}
//             <form
//               onSubmit={handleSubmit}
//               className="space-y-4"
//             >

//               <Input
//                 label="Full Name"
//                 required
//                 placeholder="Ravi Sharma"
//                 value={fullName}
//                 onChange={(e) =>
//                   setFullName(e.target.value)
//                 }
//                 icon={User}
//               />


//               <Input
//                 label="Email Address"
//                 type="email"
//                 required
//                 placeholder="ravi@example.com"
//                 value={email}
//                 onChange={(e) =>
//                   setEmail(e.target.value)
//                 }
//                 icon={Mail}
//               />


//               <Input
//                 label="Phone Number"
//                 type="tel"
//                 required
//                 placeholder="+91 9876543210"
//                 value={phone}
//                 onChange={(e) =>
//                   setPhone(e.target.value)
//                 }
//                 icon={Phone}
//               />


//               {/* Owner Business Name */}
//               {role === 'OWNER' && (
//                 <Input
//                   label="Venue / Business Name"
//                   required
//                   placeholder="Grand Orchid Banquets & Convention"
//                   value={businessName}
//                   onChange={(e) =>
//                     setBusinessName(e.target.value)
//                   }
//                   icon={Briefcase}
//                 />
//               )}


//               {/* Password */}
//               <div className="relative">

//                 <Input
//                   label="Password"
//                   type={
//                     showPassword
//                       ? 'text'
//                       : 'password'
//                   }
//                   required
//                   placeholder="At least 8 characters"
//                   value={password}
//                   onChange={(e) =>
//                     setPassword(e.target.value)
//                   }
//                   icon={Lock}
//                 />

//                 <button
//                   type="button"
//                   onClick={() =>
//                     setShowPassword(!showPassword)
//                   }
//                   className="absolute right-3 bottom-3 text-slate-400 hover:text-slate-700 transition"
//                   aria-label={
//                     showPassword
//                       ? 'Hide password'
//                       : 'Show password'
//                   }
//                 >
//                   {showPassword ? (
//                     <EyeOff className="w-5 h-5" />
//                   ) : (
//                     <Eye className="w-5 h-5" />
//                   )}
//                 </button>

//               </div>


//               {/* Confirm Password */}
//               <div className="relative">

//                 <Input
//                   label="Confirm Password"
//                   type={
//                     showConfirmPassword
//                       ? 'text'
//                       : 'password'
//                   }
//                   required
//                   placeholder="Re-enter your password"
//                   value={confirmPassword}
//                   onChange={(e) =>
//                     setConfirmPassword(e.target.value)
//                   }
//                   icon={Lock}
//                 />

//                 <button
//                   type="button"
//                   onClick={() =>
//                     setShowConfirmPassword(
//                       !showConfirmPassword
//                     )
//                   }
//                   className="absolute right-3 bottom-3 text-slate-400 hover:text-slate-700 transition"
//                   aria-label={
//                     showConfirmPassword
//                       ? 'Hide password'
//                       : 'Show password'
//                   }
//                 >
//                   {showConfirmPassword ? (
//                     <EyeOff className="w-5 h-5" />
//                   ) : (
//                     <Eye className="w-5 h-5" />
//                   )}
//                 </button>

//               </div>


//               {/* Password Match Message */}
//               {confirmPassword && (
//                 <p
//                   className={`text-xs ${
//                     password === confirmPassword
//                       ? 'text-emerald-600'
//                       : 'text-rose-600'
//                   }`}
//                 >
//                   {password === confirmPassword
//                     ? 'Passwords match ✓'
//                     : 'Passwords do not match'}
//                 </p>
//               )}


//               {/* Submit Button */}
//               <Button
//                 type="submit"
//                 variant="primary"
//                 size="lg"
//                 className="w-full"
//                 isLoading={loading}
//               >
//                 Create Account
//               </Button>

//             </form>


//             {/* Login Link */}
//             <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">

//               Already have an account?{' '}

//               <Link
//                 to={
//                   redirectUrl
//                     ? `/login?redirect=${encodeURIComponent(
//                         redirectUrl
//                       )}`
//                     : '/login'
//                 }
//                 className="font-semibold text-indigo-600 hover:text-indigo-700"
//               >
//                 Sign in
//               </Link>

//             </div>

//           </CardBody>

//         </Card>

//       </div>

//     </div>
//   );
// };



// import React, { useState } from 'react';
// import {
//   Link,
//   useNavigate,
//   useSearchParams,
//   useLocation,
// } from 'react-router-dom';

// import {
//   Building2,
//   Mail,
//   Lock,
//   User,
//   Phone,
//   Briefcase,
//   AlertCircle,
//   Eye,
//   EyeOff,
// } from 'lucide-react';

// import api from '../services/api';
// import { useToast } from '../context/ToastContext';
// import { Button } from '../components/ui/Button';
// import { Input } from '../components/ui/Input';
// import { Card, CardBody } from '../components/ui/Card';


// export const RegisterPage = () => {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const location = useLocation();

//   const { showSuccess, showError } = useToast();

//   const [role, setRole] = useState('CUSTOMER');
//   const [fullName, setFullName] = useState('');
//   const [email, setEmail] = useState('');
//   const [phone, setPhone] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [businessName, setBusinessName] = useState('');

//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const [loading, setLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState('');

//   const redirectUrl =
//     searchParams.get('redirect') ||
//     location.state?.from?.pathname ||
//     '';


//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setErrorMsg('');

//     // Frontend password confirmation validation
//     if (password !== confirmPassword) {
//       const message = 'Passwords do not match.';
//       setErrorMsg(message);
//       showError(message);
//       return;
//     }

//     if (password.length < 8) {
//       const message = 'Password must be at least 8 characters.';
//       setErrorMsg(message);
//       showError(message);
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await api.post('/auth/register/', {
//         full_name: fullName,
//         email,
//         phone,
//         password,
//         confirm_password: confirmPassword,
//         role,
//         business_name:
//           role === 'OWNER'
//             ? businessName
//             : undefined,
//       });

//       const resData = res?.data || res;

//       const isSuccess =
//         resData?.success !== false &&
//         res?.success !== false;

//       if (isSuccess) {
//         showSuccess(
//           'Account created successfully! Please verify your email with the OTP.'
//         );

//         // Redirect to OTP verification page.
//         // Pass the email, role and original redirect destination.
//         navigate(
//           `/verify-email?email=${encodeURIComponent(
//             email
//           )}&role=${encodeURIComponent(
//             role
//           )}&redirect=${encodeURIComponent(
//             redirectUrl
//           )}`
//         );

//       } else {
//         const message =
//           resData?.message ||
//           res?.message ||
//           'Registration failed.';

//         setErrorMsg(message);
//         showError(message);
//       }

//     } catch (err) {
//       const errors = err?.response?.data?.errors || {};

//       const message =
//         errors?.email?.[0] ||
//         errors?.phone?.[0] ||
//         errors?.password?.[0] ||
//         errors?.confirm_password?.[0] ||
//         errors?.business_name?.[0] ||
//         err?.response?.data?.message ||
//         err?.message ||
//         'Registration failed. Please check your information.';

//       setErrorMsg(message);
//       showError(message);

//     } finally {
//       setLoading(false);
//     }
//   };


//   return (
//     <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">

//       <div className="max-w-md w-full space-y-6">

//         <div className="text-center space-y-2">

//           <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-600/20">
//             <Building2 className="w-7 h-7" />
//           </div>

//           <h1 className="text-2xl font-black tracking-tight text-slate-900">
//             Create your Account
//           </h1>

//           <p className="text-sm text-slate-500">
//             Join the premier function hall marketplace in Hyderabad
//           </p>

//         </div>


//         <Card className="shadow-lg border-slate-200">

//           <CardBody className="p-8 space-y-5">

//             {/* Role Switcher */}
//             <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">

//               <button
//                 type="button"
//                 onClick={() => setRole('CUSTOMER')}
//                 className={`py-2 text-xs font-bold rounded-lg transition ${
//                   role === 'CUSTOMER'
//                     ? 'bg-white text-indigo-700 shadow-xs'
//                     : 'text-slate-600 hover:text-slate-900'
//                 }`}
//               >
//                 I am a Customer
//               </button>

//               <button
//                 type="button"
//                 onClick={() => setRole('OWNER')}
//                 className={`py-2 text-xs font-bold rounded-lg transition ${
//                   role === 'OWNER'
//                     ? 'bg-white text-indigo-700 shadow-xs'
//                     : 'text-slate-600 hover:text-slate-900'
//                 }`}
//               >
//                 I am a Hall Owner
//               </button>

//             </div>


//             {errorMsg && (
//               <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center gap-2.5">

//                 <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />

//                 <span>{errorMsg}</span>

//               </div>
//             )}


//             <form
//               onSubmit={handleSubmit}
//               className="space-y-4"
//             >

//               <Input
//                 label="Full Name"
//                 required
//                 placeholder="Ravi Sharma"
//                 value={fullName}
//                 onChange={(e) => setFullName(e.target.value)}
//                 icon={User}
//               />


//               <Input
//                 label="Email Address"
//                 type="email"
//                 required
//                 placeholder="ravi@example.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 icon={Mail}
//               />


//               <Input
//                 label="Phone Number"
//                 type="tel"
//                 required
//                 placeholder="+91 9876543210"
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//                 icon={Phone}
//               />


//               {role === 'OWNER' && (
//                 <Input
//                   label="Venue / Business Name"
//                   required
//                   placeholder="Grand Orchid Banquets & Convention"
//                   value={businessName}
//                   onChange={(e) => setBusinessName(e.target.value)}
//                   icon={Briefcase}
//                 />
//               )}


//               {/* Password */}
//               <div className="relative">

//                 <Input
//                   label="Password"
//                   type={showPassword ? 'text' : 'password'}
//                   required
//                   placeholder="At least 8 characters"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   icon={Lock}
//                 />

//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 bottom-3 text-slate-400 hover:text-slate-700 transition"
//                   aria-label={
//                     showPassword
//                       ? 'Hide password'
//                       : 'Show password'
//                   }
//                 >
//                   {showPassword ? (
//                     <EyeOff className="w-5 h-5" />
//                   ) : (
//                     <Eye className="w-5 h-5" />
//                   )}
//                 </button>

//               </div>


//               {/* Confirm Password */}
//               <div className="relative">

//                 <Input
//                   label="Confirm Password"
//                   type={
//                     showConfirmPassword
//                       ? 'text'
//                       : 'password'
//                   }
//                   required
//                   placeholder="Re-enter your password"
//                   value={confirmPassword}
//                   onChange={(e) =>
//                     setConfirmPassword(e.target.value)
//                   }
//                   icon={Lock}
//                 />

//                 <button
//                   type="button"
//                   onClick={() =>
//                     setShowConfirmPassword(
//                       !showConfirmPassword
//                     )
//                   }
//                   className="absolute right-3 bottom-3 text-slate-400 hover:text-slate-700 transition"
//                   aria-label={
//                     showConfirmPassword
//                       ? 'Hide password'
//                       : 'Show password'
//                   }
//                 >
//                   {showConfirmPassword ? (
//                     <EyeOff className="w-5 h-5" />
//                   ) : (
//                     <Eye className="w-5 h-5" />
//                   )}
//                 </button>

//               </div>


//               {confirmPassword && (
//                 <p
//                   className={`text-xs ${
//                     password === confirmPassword
//                       ? 'text-emerald-600'
//                       : 'text-rose-600'
//                   }`}
//                 >
//                   {password === confirmPassword
//                     ? 'Passwords match ✓'
//                     : 'Passwords do not match'}
//                 </p>
//               )}


//               <Button
//                 type="submit"
//                 variant="primary"
//                 size="lg"
//                 className="w-full"
//                 isLoading={loading}
//               >
//                 Create Account
//               </Button>

//             </form>


//             <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">

//               Already have an account?{' '}

//               <Link
//                 to={
//                   redirectUrl
//                     ? `/login?redirect=${encodeURIComponent(
//                         redirectUrl
//                       )}`
//                     : '/login'
//                 }
//                 className="font-semibold text-indigo-600 hover:text-indigo-700"
//               >
//                 Sign in
//               </Link>

//             </div>

//           </CardBody>

//         </Card>

//       </div>

//     </div>
//   );
// };


import React, { useState } from 'react';
import {
  Link,
  useNavigate,
  useSearchParams,
  useLocation,
} from 'react-router-dom';

import {
  Building2,
  Mail,
  Lock,
  User,
  Phone,
  Briefcase,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardBody } from '../components/ui/Card';


export const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const { showSuccess, showError } = useToast();

  const [role, setRole] = useState('CUSTOMER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessName, setBusinessName] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const redirectUrl =
    searchParams.get('redirect') ||
    location.state?.from?.pathname ||
    '';


  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMsg('');

    if (password !== confirmPassword) {
      const message = 'Passwords do not match.';

      setErrorMsg(message);
      showError(message);

      return;
    }

    if (password.length < 8) {
      const message = 'Password must be at least 8 characters.';

      setErrorMsg(message);
      showError(message);

      return;
    }

    if (
      role === 'OWNER' &&
      !businessName.trim()
    ) {
      const message =
        'Business name is required for Hall Owner registration.';

      setErrorMsg(message);
      showError(message);

      return;
    }

    setLoading(true);

    try {
      const res = await api.post(
        '/auth/register/',
        {
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          confirm_password: confirmPassword,
          role,
          business_name:
            role === 'OWNER'
              ? businessName.trim()
              : '',
        }
      );

      const resData = res?.data || res;

      if (resData?.success !== false) {
        showSuccess(
          'Account created successfully! Please verify your email with the OTP.'
        );

        const verifyParams = new URLSearchParams({
          email: email.trim(),
          role,
        });

        if (redirectUrl) {
          verifyParams.set(
            'redirect',
            redirectUrl
          );
        }

        navigate(
          `/verify-email?${verifyParams.toString()}`
        );

        return;
      }

      const message =
        resData?.message ||
        'Registration failed.';

      setErrorMsg(message);
      showError(message);

    } catch (err) {
      const payload = err?.response?.data || err || {};
      const errors = payload?.errors || err?.response?.data?.errors || {};
      const message =
        payload?.message ||
        errors?.email?.[0] ||
        errors?.phone?.[0] ||
        errors?.password?.[0] ||
        errors?.confirm_password?.[0] ||
        errors?.business_name?.[0] ||
        payload?.detail ||
        err?.message ||
        'Registration failed. Please check your information.';

      setErrorMsg(message);
      showError(message);

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">

      <div className="max-w-md w-full space-y-6">

        <div className="text-center space-y-2">

          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-600/20">
            <Building2 className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Create your Account
          </h1>

          <p className="text-sm text-slate-500">
            Join the premier function hall marketplace in Hyderabad
          </p>

        </div>


        <Card className="shadow-lg border-slate-200">

          <CardBody className="p-8 space-y-5">

            {/* Role Switcher */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">

              <button
                type="button"
                onClick={() => setRole('CUSTOMER')}
                className={`py-2 text-xs font-bold rounded-lg transition ${
                  role === 'CUSTOMER'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                I am a Customer
              </button>

              <button
                type="button"
                onClick={() => setRole('OWNER')}
                className={`py-2 text-xs font-bold rounded-lg transition ${
                  role === 'OWNER'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                I am a Hall Owner
              </button>

            </div>


            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center gap-2.5">

                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />

                <span>
                  {errorMsg}
                </span>

              </div>
            )}


            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              <Input
                label="Full Name"
                required
                placeholder="Ravi Sharma"
                value={fullName}
                onChange={(e) =>
                  setFullName(e.target.value)
                }
                icon={User}
              />


              <Input
                label="Email Address"
                type="email"
                required
                placeholder="ravi@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                icon={Mail}
              />


              <Input
                label="Phone Number"
                type="tel"
                required
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                icon={Phone}
              />


              {role === 'OWNER' && (
                <Input
                  label="Venue / Business Name"
                  required
                  placeholder="Grand Orchid Banquets & Convention"
                  value={businessName}
                  onChange={(e) =>
                    setBusinessName(e.target.value)
                  }
                  icon={Briefcase}
                />
              )}


              {/* Password */}
              <div className="relative">

                <Input
                  label="Password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  required
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  icon={Lock}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-3 bottom-3 text-slate-400 hover:text-slate-700 transition"
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>

              </div>


              {/* Confirm Password */}
              <div className="relative">

                <Input
                  label="Confirm Password"
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  required
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  icon={Lock}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  className="absolute right-3 bottom-3 text-slate-400 hover:text-slate-700 transition"
                  aria-label={
                    showConfirmPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>

              </div>


              {confirmPassword && (
                <p
                  className={`text-xs ${
                    password === confirmPassword
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                  }`}
                >
                  {password === confirmPassword
                    ? 'Passwords match ✓'
                    : 'Passwords do not match'}
                </p>
              )}


              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={loading}
              >
                Create Account
              </Button>

            </form>


            <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">

              Already have an account?{' '}

              <Link
                to={
                  redirectUrl
                    ? `/login?redirect=${encodeURIComponent(
                        redirectUrl
                      )}`
                    : '/login'
                }
                className="font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Sign in
              </Link>

            </div>

          </CardBody>

        </Card>

      </div>

    </div>
  );
};