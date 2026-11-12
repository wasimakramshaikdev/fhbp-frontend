// import React, { Suspense, lazy } from 'react';
// import { Routes, Route } from 'react-router-dom';
// import { PublicLayout } from '../layouts/PublicLayout';
// import { CustomerLayout } from '../layouts/CustomerLayout';
// import { OwnerLayout } from '../layouts/OwnerLayout';
// import { AdminLayout } from '../layouts/AdminLayout';
// import { RoleProtectedRoute } from './RoleProtectedRoute';
// import { Spinner } from '../components/ui/Feedback';


// // Lazy Loaded Pages
// const HomePage = lazy(() => import('../pages/HomePage').then(m => ({ default: m.HomePage })));
// const SearchPage = lazy(() => import('../pages/SearchPage').then(m => ({ default: m.SearchPage })));
// const HallDetailPage = lazy(() => import('../pages/HallDetailPage').then(m => ({ default: m.HallDetailPage })));
// const CheckoutPage = lazy(() => import('../pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
// const HowItWorksPage = lazy(() => import('../pages/HowItWorksPage').then(m => ({ default: m.HowItWorksPage })));
// const LoginPage = lazy(() => import('../pages/LoginPage').then(m => ({ default: m.LoginPage })));
// const RegisterPage = lazy(() => import('../pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
// const PasswordResetPage = lazy(() => import('../pages/PasswordResetPage').then(m => ({ default: m.PasswordResetPage })));
// const ProfilePage = lazy(() => import('../pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
// const MyBookingsPage = lazy(() => import('../pages/MyBookingsPage').then(m => ({ default: m.MyBookingsPage })));
// const SavedHallsPage = lazy(() => import('../pages/SavedHallsPage').then(m => ({ default: m.SavedHallsPage })));
// const InvoicesPage = lazy(() => import('../pages/InvoicesPage').then(m => ({ default: m.InvoicesPage })));
// const OwnerOnboardingWizard = lazy(() => import('../pages/OwnerOnboardingWizard').then(m => ({ default: m.OwnerOnboardingWizard })));
// const OwnerDashboardPage = lazy(() => import('../pages/OwnerDashboardPage').then(m => ({ default: m.OwnerDashboardPage })));
// const OwnerListingsPage = lazy(() => import('../pages/OwnerListingsPage').then(m => ({ default: m.OwnerListingsPage })));
// const OwnerCalendarPage = lazy(() => import('../pages/OwnerCalendarPage').then(m => ({ default: m.OwnerCalendarPage })));
// const OwnerBookingsPage = lazy(() => import('../pages/OwnerBookingsPage').then(m => ({ default: m.OwnerBookingsPage })));
// const OwnerEarningsPage = lazy(() => import('../pages/OwnerEarningsPage').then(m => ({ default: m.OwnerEarningsPage })));
// const OwnerReviewsPage = lazy(() => import('../pages/OwnerReviewsPage').then(m => ({ default: m.OwnerReviewsPage })));
// const AdminDashboardPage = lazy(() => import('../pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
// const AdminOwnersPage = lazy(() => import('../pages/AdminOwnersPage').then(m => ({ default: m.AdminOwnersPage })));
// const AdminHallsPage = lazy(() => import('../pages/AdminHallsPage').then(m => ({ default: m.AdminHallsPage })));
// const AdminBookingsPage = lazy(() => import('../pages/AdminBookingsPage').then(m => ({ default: m.AdminBookingsPage })));
// const AdminDisputesPage = lazy(() => import('../pages/AdminDisputesPage').then(m => ({ default: m.AdminDisputesPage })));
// const AdminSettingsPage = lazy(() => import('../pages/AdminSettingsPage').then(m => ({ default: m.AdminSettingsPage })));
// const AdminAuditLogsPage = lazy(() => import('../pages/AdminAuditLogsPage').then(m => ({ default: m.AdminAuditLogsPage })));
// const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// const SuspenseLoader = () => (
//   <div className="min-h-[60vh] flex items-center justify-center">
//     <Spinner size="lg" />
//   </div>
// );

// export const AppRoutes = () => {
//   return (
//     <Suspense fallback={<SuspenseLoader />}>
//       <Routes>
//         {/* Public Pages */}
//         <Route element={<PublicLayout />}>
//           <Route path="/" element={<HomePage />} />
//           <Route path="/search" element={<SearchPage />} />
//           <Route path="/halls/:slug" element={<HallDetailPage />} />
//           <Route
//             path="/halls/:slug/book"
//             element={
//               <RoleProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
//                 <CheckoutPage />
//               </RoleProtectedRoute>
//             }
//           />
//           <Route path="/how-it-works" element={<HowItWorksPage />} />
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/register" element={<RegisterPage />} />
//           <Route path="/password-reset" element={<PasswordResetPage />} />
//           <Route path="*" element={<NotFoundPage />} />
//         </Route>

//         {/* Customer Protected Portal */}
//         <Route
//           element={
//             <RoleProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
//               <CustomerLayout />
//             </RoleProtectedRoute>
//           }
//         >
//           <Route path="/dashboard" element={<MyBookingsPage />} />
//           <Route path="/dashboard/bookings" element={<MyBookingsPage />} />
//           <Route path="/dashboard/favorites" element={<SavedHallsPage />} />
//           <Route path="/dashboard/payments" element={<InvoicesPage />} />
//           <Route path="/dashboard/profile" element={<ProfilePage />} />
//           <Route path="/dashboard/support" element={<MyBookingsPage />} />
//         </Route>

//         {/* Owner Protected Portal */}
//         <Route
//           element={
//             <RoleProtectedRoute allowedRoles={['OWNER', 'ADMIN']}>
//               <OwnerLayout />
//             </RoleProtectedRoute>
//           }
//         >
//           <Route path="/owner/onboarding" element={<OwnerOnboardingWizard />} />
//           <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
//           <Route path="/owner/bookings" element={<OwnerBookingsPage />} />
//           <Route path="/owner/calendar" element={<OwnerCalendarPage />} />
//           <Route path="/owner/listings" element={<OwnerListingsPage />} />
//           <Route path="/owner/earnings" element={<OwnerEarningsPage />} />
//           <Route path="/owner/reviews" element={<OwnerReviewsPage />} />
//           <Route path="/owner/settings" element={<ProfilePage />} />
//         </Route>

//         {/* Super Admin Control Plane */}
//         <Route
//           element={
//             <RoleProtectedRoute allowedRoles={['ADMIN']}>
//               <AdminLayout />
//             </RoleProtectedRoute>
//           }
//         >
//           <Route path="/admin" element={<AdminDashboardPage />} />
//           <Route path="/admin/owners" element={<AdminOwnersPage />} />
//           <Route path="/admin/halls" element={<AdminHallsPage />} />
//           <Route path="/admin/bookings" element={<AdminBookingsPage />} />
//           <Route path="/admin/disputes" element={<AdminDisputesPage />} />
//           <Route path="/admin/settings" element={<AdminSettingsPage />} />
//           <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
//         </Route>
//       </Routes>
//     </Suspense>
//   );
// };


import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

import { PublicLayout } from '../layouts/PublicLayout';
import { CustomerLayout } from '../layouts/CustomerLayout';
import { OwnerLayout } from '../layouts/OwnerLayout';
import { AdminLayout } from '../layouts/AdminLayout';

import { RoleProtectedRoute } from './RoleProtectedRoute';
import { Spinner } from '../components/ui/Feedback';


// ============================================================
// LAZY LOADED PAGES
// ============================================================

const HomePage = lazy(() =>
  import('../pages/HomePage').then(m => ({
    default: m.HomePage,
  }))
);

const SearchPage = lazy(() =>
  import('../pages/SearchPage').then(m => ({
    default: m.SearchPage,
  }))
);

const HallDetailPage = lazy(() =>
  import('../pages/HallDetailPage').then(m => ({
    default: m.HallDetailPage,
  }))
);

const CheckoutPage = lazy(() =>
  import('../pages/CheckoutPage').then(m => ({
    default: m.CheckoutPage,
  }))
);

const HowItWorksPage = lazy(() =>
  import('../pages/HowItWorksPage').then(m => ({
    default: m.HowItWorksPage,
  }))
);

const TermsPage = lazy(() =>
  import('../pages/LegalPages').then(m => ({
    default: m.TermsPage,
  }))
);

const PrivacyPage = lazy(() =>
  import('../pages/LegalPages').then(m => ({
    default: m.PrivacyPage,
  }))
);

const CancellationPage = lazy(() =>
  import('../pages/LegalPages').then(m => ({
    default: m.CancellationPage,
  }))
);

const LoginPage = lazy(() =>
  import('../pages/LoginPage').then(m => ({
    default: m.LoginPage,
  }))
);

const RegisterPage = lazy(() =>
  import('../pages/RegisterPage').then(m => ({
    default: m.RegisterPage,
  }))
);

const VerifyEmailPage = lazy(() =>
  import('../pages/VerifyEmailPage').then(m => ({
    default: m.VerifyEmailPage,
  }))
);

const PasswordResetPage = lazy(() =>
  import('../pages/PasswordResetPage').then(m => ({
    default: m.PasswordResetPage,
  }))
);

const ProfilePage = lazy(() =>
  import('../pages/ProfilePage').then(m => ({
    default: m.ProfilePage,
  }))
);

const MyBookingsPage = lazy(() =>
  import('../pages/MyBookingsPage').then(m => ({
    default: m.MyBookingsPage,
  }))
);

const SavedHallsPage = lazy(() =>
  import('../pages/SavedHallsPage').then(m => ({
    default: m.SavedHallsPage,
  }))
);

const InvoicesPage = lazy(() =>
  import('../pages/InvoicesPage').then(m => ({
    default: m.InvoicesPage,
  }))
);

const OwnerOnboardingWizard = lazy(() =>
  import('../pages/OwnerOnboardingWizard').then(m => ({
    default: m.OwnerOnboardingWizard,
  }))
);

const OwnerDashboardPage = lazy(() =>
  import('../pages/OwnerDashboardPage').then(m => ({
    default: m.OwnerDashboardPage,
  }))
);

const OwnerVerificationPage = lazy(() =>
  import('../pages/OwnerVerificationPage').then(m => ({
    default: m.OwnerVerificationPage,
  }))
);

const OwnerListingsPage = lazy(() =>
  import('../pages/OwnerListingsPage').then(m => ({
    default: m.OwnerListingsPage,
  }))
);

const OwnerCalendarPage = lazy(() =>
  import('../pages/OwnerCalendarPage').then(m => ({
    default: m.OwnerCalendarPage,
  }))
);

const OwnerBookingsPage = lazy(() =>
  import('../pages/OwnerBookingsPage').then(m => ({
    default: m.OwnerBookingsPage,
  }))
);

const OwnerEarningsPage = lazy(() =>
  import('../pages/OwnerEarningsPage').then(m => ({
    default: m.OwnerEarningsPage,
  }))
);

const OwnerReviewsPage = lazy(() =>
  import('../pages/OwnerReviewsPage').then(m => ({
    default: m.OwnerReviewsPage,
  }))
);

const AdminDashboardPage = lazy(() =>
  import('../pages/AdminDashboardPage').then(m => ({
    default: m.AdminDashboardPage,
  }))
);

const AdminOwnersPage = lazy(() =>
  import('../pages/AdminOwnersPage').then(m => ({
    default: m.AdminOwnersPage,
  }))
);

const AdminHallsPage = lazy(() =>
  import('../pages/AdminHallsPage').then(m => ({
    default: m.AdminHallsPage,
  }))
);

const AdminBookingsPage = lazy(() =>
  import('../pages/AdminBookingsPage').then(m => ({
    default: m.AdminBookingsPage,
  }))
);

const AdminDisputesPage = lazy(() =>
  import('../pages/AdminDisputesPage').then(m => ({
    default: m.AdminDisputesPage,
  }))
);

const AdminSettingsPage = lazy(() =>
  import('../pages/AdminSettingsPage').then(m => ({
    default: m.AdminSettingsPage,
  }))
);

const AdminAuditLogsPage = lazy(() =>
  import('../pages/AdminAuditLogsPage').then(m => ({
    default: m.AdminAuditLogsPage,
  }))
);

const NotFoundPage = lazy(() =>
  import('../pages/NotFoundPage').then(m => ({
    default: m.NotFoundPage,
  }))
);


// ============================================================
// SUSPENSE LOADER
// ============================================================

const SuspenseLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Spinner size="lg" />
  </div>
);


// ============================================================
// APPLICATION ROUTES
// ============================================================

export const AppRoutes = () => {
  return (
    <Suspense fallback={<SuspenseLoader />}>

      <Routes>

        {/* =====================================================
            PUBLIC PAGES
        ===================================================== */}
        <Route element={<PublicLayout />}>

          <Route
            path="/"
            element={<HomePage />}
          />

          <Route
            path="/search"
            element={<SearchPage />}
          />

          <Route
            path="/halls/:slug"
            element={<HallDetailPage />}
          />

          <Route
            path="/halls/:slug/book"
            element={
              <RoleProtectedRoute
                allowedRoles={['CUSTOMER', 'ADMIN']}
              >
                <CheckoutPage />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/how-it-works"
            element={<HowItWorksPage />}
          />

          <Route
            path="/terms"
            element={<TermsPage />}
          />

          <Route
            path="/privacy"
            element={<PrivacyPage />}
          />

          <Route
            path="/cancellation"
            element={<CancellationPage />}
          />

          <Route
            path="/login"
            element={<LoginPage />}
          />

          <Route
            path="/register"
            element={<RegisterPage />}
          />

          {/* Email OTP Verification */}
          <Route
            path="/verify-email"
            element={<VerifyEmailPage />}
          />

          <Route
            path="/password-reset"
            element={<PasswordResetPage />}
          />

          {/* 404 */}
          <Route
            path="*"
            element={<NotFoundPage />}
          />

        </Route>


        {/* =====================================================
            CUSTOMER PROTECTED PORTAL
        ===================================================== */}
        <Route
          element={
            <RoleProtectedRoute
              allowedRoles={['CUSTOMER', 'ADMIN']}
            >
              <CustomerLayout />
            </RoleProtectedRoute>
          }
        >

          <Route
            path="/dashboard"
            element={<MyBookingsPage />}
          />

          <Route
            path="/dashboard/bookings"
            element={<MyBookingsPage />}
          />

          <Route
            path="/dashboard/favorites"
            element={<SavedHallsPage />}
          />

          <Route
            path="/dashboard/payments"
            element={<InvoicesPage />}
          />

          <Route
            path="/dashboard/profile"
            element={<ProfilePage />}
          />

          <Route
            path="/dashboard/support"
            element={<MyBookingsPage />}
          />

        </Route>


        {/* =====================================================
            OWNER PROTECTED PORTAL
        ===================================================== */}
        <Route
          element={
            <RoleProtectedRoute
              allowedRoles={['OWNER', 'ADMIN']}
            >
              <OwnerLayout />
            </RoleProtectedRoute>
          }
        >

          <Route
            path="/owner/onboarding"
            element={<OwnerOnboardingWizard />}
          />

          <Route
            path="/owner/dashboard"
            element={<OwnerDashboardPage />}
          />

          <Route
            path="/owner/verification"
            element={<OwnerVerificationPage />}
          />

          <Route
            path="/owner/bookings"
            element={<OwnerBookingsPage />}
          />

          <Route
            path="/owner/calendar"
            element={<OwnerCalendarPage />}
          />

          <Route
            path="/owner/listings"
            element={<OwnerListingsPage />}
          />

          <Route
            path="/owner/earnings"
            element={<OwnerEarningsPage />}
          />

          <Route
            path="/owner/reviews"
            element={<OwnerReviewsPage />}
          />

          <Route
            path="/owner/settings"
            element={<ProfilePage />}
          />

        </Route>


        {/* =====================================================
            SUPER ADMIN CONTROL PLANE
        ===================================================== */}
        <Route
          element={
            <RoleProtectedRoute
              allowedRoles={['ADMIN']}
            >
              <AdminLayout />
            </RoleProtectedRoute>
          }
        >

          <Route
            path="/admin"
            element={<AdminDashboardPage />}
          />

          <Route
            path="/admin/owners"
            element={<AdminOwnersPage />}
          />

          <Route
            path="/admin/halls"
            element={<AdminHallsPage />}
          />

          <Route
            path="/admin/bookings"
            element={<AdminBookingsPage />}
          />

          <Route
            path="/admin/disputes"
            element={<AdminDisputesPage />}
          />

          <Route
            path="/admin/settings"
            element={<AdminSettingsPage />}
          />

          <Route
            path="/admin/audit-logs"
            element={<AdminAuditLogsPage />}
          />

        </Route>

      </Routes>

    </Suspense>
  );
};