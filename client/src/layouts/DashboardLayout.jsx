import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import {
  Shield, Home, Calendar, Award, Trophy, LogOut, Menu, X,
  LayoutDashboard, Users, ClipboardList, BarChart2, UserCheck, FileText, MessageSquare, HelpCircle, Bell, Megaphone, LineChart, Settings, Store, Gift
} from 'lucide-react';
import NotificationBell from '../components/notifications/NotificationBell';
import NotificationDrawer from '../components/notifications/NotificationDrawer';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'COORDINATOR'];

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    unreadCount,
    drawerOpen,
    drawerNotifications,
    drawerLoading,
    toggleDrawer,
    closeDrawer,
    markRead,
    markAllRead,
    delete: deleteNotification,
  } = useNotifications();

  const isAdmin = ADMIN_ROLES.includes(user?.role?.toUpperCase());

  const handleLogout = async () => {
    // Clear stored token on logout
    localStorage.removeItem('authToken');
    await logout();
    navigate('/');
  };

  const volunteerNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={18} /> },
    { name: 'Marketplace', path: '/marketplace', icon: <Store size={18} /> },
    { name: 'Announcements', path: '/announcements', icon: <Megaphone size={18} /> },
    { name: 'Opportunities', path: '/opportunities', icon: <Calendar size={18} /> },
    { name: 'My Contributions', path: '/my-contributions', icon: <FileText size={18} /> },
    { name: 'Certificates', path: '/certificates', icon: <Award size={18} /> },
    { name: 'Messages', path: '/messages', icon: <MessageSquare size={18} /> },
    { name: 'Support', path: '/support', icon: <HelpCircle size={18} /> },
  ];

  // Routes that exist but are not in the sidebar (accessible via other UI entry points).
  // Kept here so the top-bar title resolves correctly when a volunteer navigates to them.
  const volunteerHiddenRoutes = [
    { name: 'Notifications', path: '/notifications' },
    { name: 'My Programs', path: '/my-programs' },
  ];

  // Kept here so the top-bar title resolves correctly when an admin navigates to them.
  const adminHiddenRoutes = [
    { name: 'Notifications', path: '/notifications' },
  ];

  const adminNavItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Announcements', path: '/admin/announcements', icon: <Megaphone size={18} /> },
    { name: 'Messages', path: '/admin/messages', icon: <MessageSquare size={18} /> },
    { name: 'Support', path: '/admin/support', icon: <HelpCircle size={18} /> },
    { name: 'Programs', path: '/admin/programs', icon: <Calendar size={18} /> },
    { name: 'Applications', path: '/admin/applications', icon: <ClipboardList size={18} /> },
    { name: 'Attendance', path: '/admin/attendance', icon: <UserCheck size={18} /> },
    { name: 'Certificates', path: '/admin/certificates', icon: <Award size={18} /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <BarChart2 size={18} /> },
    { name: 'Forecast', path: '/admin/forecast', icon: <LineChart size={18} /> },
    { name: 'Reports', path: '/admin/reports', icon: <FileText size={18} /> },
    { name: 'Volunteers', path: '/admin/users', icon: <Users size={18} /> },
    { name: 'Contributions', path: '/admin/contributions', icon: <Settings size={18} /> },
    { name: 'Redemptions', path: '/admin/redemptions', icon: <Gift size={18} /> },
  ];

  const navItems = isAdmin ? adminNavItems : volunteerNavItems;

  const profileName = user?.name || 'Volunteer';
  const profileRole = user?.role || 'VOLUNTEER';
  const profilePoints = user?.points ?? 0;

  const SidebarContent = () => (
    <>
      {/* Header/Logo */}
      <div style={{
        height: 'var(--navbar-height)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.5rem',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-primary)' }}>
          <span style={{
            display: 'flex',
            padding: '0.35rem',
            borderRadius: '6px',
            background: 'var(--primary-blue)',
            color: '#ffffff'
          }}>
            <Shield size={16} />
          </span>
          {isAdmin ? 'DFI ADMIN' : 'DFI VOLUNTEER'}
        </Link>
      </div>

      {/* User Mini Profile */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--background)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--primary-blue)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '1rem'
          }}>
            {profileName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
              {profileName}
            </h4>
            <span style={{
              display: 'inline-block',
              fontSize: '0.65rem',
              padding: '0.15rem 0.5rem',
              borderRadius: '999px',
              background: 'rgba(11, 59, 145, 0.1)',
              color: 'var(--primary-blue)',
              fontWeight: 600,
              marginTop: '0.2rem'
            }}>
              {profileRole}
            </span>
          </div>
        </div>
        {!isAdmin && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-body)' }}>
            <span>Score:</span>
            <strong style={{ color: 'var(--color-primary)' }}>{profilePoints} pts</strong>
          </div>
        )}
      </div>

      {/* Nav Links */}
      <nav style={{ flex: 1, padding: '1.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--primary-blue)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                transition: 'var(--transition-fast)',
                textDecoration: 'none',
              }}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid var(--color-border)' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-error)',
            fontWeight: 600,
            textAlign: 'left',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Desktop Sidebar */}
      <aside style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--color-card)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 90,
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        scrollBehavior: 'smooth',
      }} className="desktop-sidebar">
        <SidebarContent />
      </aside>

      {/* Main Content Wrapper */}
      <div style={{
        flex: 1,
        marginLeft: 'var(--sidebar-width)',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }} className="main-content-wrapper">
        {/* Mobile Header */}
        <header className="glass" style={{
          height: 'var(--navbar-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          borderBottom: '1px solid var(--color-border)',
          position: 'sticky',
          top: 0,
          zIndex: 80,
        }}>
          <div style={{ display: 'none' }} className="mobile-menu-trigger">
            <button onClick={() => setMobileMenuOpen(true)} style={{ color: 'var(--color-heading)' }}>
              <Menu size={24} />
            </button>
          </div>

          <h2 style={{ fontSize: '1.15rem', margin: 0 }}>
            {[...navItems, ...(isAdmin ? adminHiddenRoutes : volunteerHiddenRoutes)].find((item) => location.pathname.startsWith(item.path))?.name || (isAdmin ? 'Admin Panel' : 'Dashboard')}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <NotificationBell unreadCount={unreadCount} onClick={toggleDrawer} loading={drawerLoading} />
            <span style={{
              fontSize: '0.75rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '999px',
              background: 'rgba(11, 59, 145, 0.1)',
              color: 'var(--primary-blue)',
              fontWeight: 600
            }}>
              {isAdmin ? '⚙ Admin Mode' : '✦ Live Portal'}
            </span>
          </div>
        </header>

        {/* Main Content Area */}
        <main style={{ padding: '2rem 1.5rem', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'flex' }}>
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(36, 52, 77, 0.4)', backdropFilter: 'blur(4px)' }}
          />
          <div style={{
            position: 'relative',
            width: '280px',
            backgroundColor: 'var(--color-card)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-xl)',
            overflowY: 'auto',
            overflowX: 'hidden',
            scrollBehavior: 'smooth',
          }} className="animate-slide-up">
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem 1.5rem' }}>
              <button onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--color-heading)' }}>
                <X size={24} />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      <NotificationDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        notifications={drawerNotifications}
        unreadCount={unreadCount}
        loading={drawerLoading}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
        onDelete={deleteNotification}
        onViewAll={() => { closeDrawer(); navigate('/notifications'); }}
      />

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .main-content-wrapper { margin-left: 0 !important; }
          .mobile-menu-trigger { display: block !important; }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
