import React, { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VolunteerProvider } from './context/VolunteerContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardErrorBoundary from './components/DashboardErrorBoundary';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Programs from './pages/Programs';
import Leaderboard from './pages/Leaderboard';
import Certificates from './pages/certificates/Certificates';
import CertificateDetails from './pages/certificates/CertificateDetails';
import Announcements from './pages/announcements/Announcements';
import AnnouncementDetails from './pages/announcements/AnnouncementDetails';
import NotificationCenter from './pages/notifications/NotificationCenter';
import ProfileSetup from './pages/ProfileSetup';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import VerifyCertificate from './pages/VerifyCertificate';

// Volunteer Pages
import ApplicationForm from './pages/applications/ApplicationForm';
import MyApplications from './pages/applications/MyApplications';
import ApplicationDetails from './pages/applications/ApplicationDetails';
import MyPrograms from './pages/programs/MyPrograms';
import ProgramDetail from './pages/programs/ProgramDetail';
import AttendanceDashboard from './pages/attendance/AttendanceDashboard';
import CheckIn from './pages/attendance/CheckIn';
import CheckOut from './pages/attendance/CheckOut';
import AttendanceHistory from './pages/attendance/AttendanceHistory';
import VolunteerHours from './pages/attendance/VolunteerHours';
import Messages from './pages/messages/Messages';
import Support from './pages/support/Support';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPrograms from './pages/admin/AdminPrograms';
import AdminApplications from './pages/admin/AdminApplications';
import AdminAttendance from './pages/admin/AdminAttendance';
import AdminInsights from './pages/admin/AdminInsights';
import Reports from './pages/admin/Reports';
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';
import AdminAnnouncementDashboard from './pages/admin/AdminAnnouncementDashboard';
import AdminCertificates from './pages/admin/AdminCertificates';
import AdminAnnouncementCreate from './pages/admin/AdminAnnouncementCreate';
import AdminReviewDashboard from './pages/admin/AdminReviewDashboard';
import ContributionAdminConsole from './pages/admin/ContributionAdminConsole';
import AdminRedemptions from './pages/admin/AdminRedemptions';

// Volunteer Pages
import VolunteerAnalytics from './pages/volunteer/VolunteerAnalytics';
import VolunteerImpactCenter from './pages/volunteer/VolunteerImpactCenter';
import Contributions from './pages/contributions/Contributions';
import ContributionWizard from './components/contributions/ContributionWizard';
import MyContributions from './pages/contributions/MyContributions';
import ContributionDetailPage from './pages/contributions/ContributionDetailPage';
import Marketplace from './pages/marketplace/Marketplace';

// Matching Pages
import RecommendedPrograms from './pages/matching/RecommendedPrograms';
import RecommendedVolunteers from './pages/matching/RecommendedVolunteers';
import SavedRecommendations from './pages/recommendations/SavedRecommendations';
import RecommendationHistory from './pages/recommendations/RecommendationHistory';

// Guard for auth pages
const RedirectIfAuthenticated = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    const token = localStorage.getItem('authToken');
    if (token && !user) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f1ea' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #4a90e2', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '1rem', color: '#333', fontWeight: 500 }}>Checking session...</p>
        </div>
      );
    }
    return children;
  }

  if (user) {
    const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'COORDINATOR'];
    if (adminRoles.includes(user?.role?.toUpperCase())) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AuthExpiredHandler = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handler = () => {
      if (!user) {
        navigate('/login?expired=true', { replace: true });
      }
    };
    window.addEventListener('auth-expired', handler);
    return () => window.removeEventListener('auth-expired', handler);
  }, [navigate, user]);

  return null;
};

function App() {
  return (
    <AuthProvider>
      <VolunteerProvider>
        <SocketProvider>
          <BrowserRouter>
            <AuthExpiredHandler />
            <Suspense fallback={
              <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-primary, #4a90e2)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              </div>
            }>
              <Routes>
                {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="programs" element={<Programs />} />
                <Route path="programs/:id" element={<ProgramDetail />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="login" element={
                  <RedirectIfAuthenticated>
                    <Login />
                  </RedirectIfAuthenticated>
                } />
                <Route path="register" element={
                  <RedirectIfAuthenticated>
                    <Register />
                  </RedirectIfAuthenticated>
                } />
                <Route path="unauthorized" element={<Unauthorized />} />
                <Route path="verify/:id" element={<VerifyCertificate />} />
              </Route>

              {/* Protected Volunteer Routes */}
              <Route element={
                <ProtectedRoute allowedRoles={['VOLUNTEER', 'COORDINATOR', 'ADMIN', 'SUPER_ADMIN']}>
                  <NotificationsProvider>
                    <DashboardErrorBoundary>
                      <DashboardLayout />
                    </DashboardErrorBoundary>
                  </NotificationsProvider>
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="opportunities" element={<Programs />} />
                <Route path="opportunities/:id" element={<ProgramDetail />} />
                <Route path="programs/:id" element={<ProgramDetail />} />
                <Route path="notifications" element={<NotificationCenter />} />
                <Route path="announcements" element={<Announcements />} />
                <Route path="announcements/:id" element={<AnnouncementDetails />} />
                <Route path="certificates" element={<Certificates />} />
                <Route path="certificates/:id" element={<CertificateDetails />} />
                <Route path="profile/setup" element={<ProfileSetup />} />
                <Route path="applications" element={<MyApplications />} />
                <Route path="applications/:id" element={<ApplicationDetails />} />
                <Route path="programs/:programId/apply" element={<ApplicationForm />} />
                <Route path="my-programs" element={<MyPrograms />} />
                <Route path="attendance" element={<AttendanceDashboard />} />
                <Route path="attendance/check-in" element={<CheckIn />} />
                <Route path="attendance/checkout" element={<CheckOut />} />
                <Route path="attendance/history" element={<AttendanceHistory />} />
                <Route path="attendance/hours" element={<VolunteerHours />} />
                <Route path="messages" element={<Messages />} />
                <Route path="support" element={<Support />} />
                <Route path="matching/programs" element={<RecommendedPrograms />} />
                <Route path="recommendations/saved" element={<SavedRecommendations />} />
                <Route path="recommendations/history" element={<RecommendationHistory />} />
              </Route>

              {/* Protected Admin Routes */}
              <Route element={
                <ProtectedRoute allowedRoles={['COORDINATOR', 'ADMIN', 'SUPER_ADMIN']}>
                  <NotificationsProvider>
                    <DashboardLayout />
                  </NotificationsProvider>
                </ProtectedRoute>
              }>
                <Route path="admin/dashboard" element={<AdminDashboard />} />
                <Route path="admin/announcements" element={<AdminAnnouncementDashboard />} />
                <Route path="admin/announcements/create" element={<AdminAnnouncementCreate />} />
                <Route path="admin/analytics" element={<Navigate to="/admin/insights" replace />} />
                <Route path="admin/forecast" element={<Navigate to="/admin/insights" replace />} />
                <Route path="admin/insights" element={<AdminInsights />} />
                <Route path="admin/reports" element={<Reports />} />
                <Route path="admin/programs" element={<AdminPrograms />} />
                <Route path="admin/applications" element={<AdminApplications />} />
                <Route path="admin/attendance" element={<AdminAttendance />} />
                <Route path="admin/certificates" element={<AdminCertificates />} />
                <Route path="admin/messages" element={<Messages />} />
                <Route path="admin/support" element={<Support />} />
                <Route path="admin/contributions" element={<AdminReviewDashboard />} />
                <Route path="admin/contributions/config" element={<ContributionAdminConsole />} />
                <Route path="admin/redemptions" element={<AdminRedemptions />} />
                <Route path="matching/volunteers" element={<RecommendedVolunteers />} />
              </Route>

              {/* Protected Super Admin Routes */}
              <Route element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                  <NotificationsProvider>
                    <DashboardLayout />
                  </NotificationsProvider>
                </ProtectedRoute>
              }>
                <Route path="super-admin/dashboard" element={<SuperAdminDashboard />} />
              </Route>

              {/* Protected Volunteer Analytics */}
              <Route element={
                <ProtectedRoute allowedRoles={['VOLUNTEER', 'COORDINATOR', 'ADMIN', 'SUPER_ADMIN']}>
                  <NotificationsProvider>
                    <DashboardLayout />
                  </NotificationsProvider>
                </ProtectedRoute>
              }>
                 <Route path="volunteer/analytics" element={<VolunteerAnalytics />} />
                 <Route path="volunteer/impact-center" element={<VolunteerImpactCenter />} />
                  <Route path="contributions" element={<Contributions />} />
                  <Route path="contributions/new" element={<ContributionWizard />} />
                  <Route path="my-contributions" element={<MyContributions />} />
                  <Route path="contributions/:id" element={<ContributionDetailPage />} />
                 <Route path="marketplace" element={<Marketplace />} />
              </Route>

              {/* Global 404 - placed last so it only matches when nothing else does */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          </BrowserRouter>
        </SocketProvider>
      </VolunteerProvider>
    </AuthProvider>
  );
}

export default App;
