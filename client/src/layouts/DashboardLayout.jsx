import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import {
  Shield, Home, Calendar, Award, Trophy, LogOut, Menu, X,
  LayoutDashboard, Users, ClipboardList, BarChart2, UserCheck, FileText, MessageSquare, HelpCircle, Bell, Megaphone, LineChart, Settings, Store, Gift,
  Sparkles, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from '../components/notifications/NotificationBell';
import NotificationDrawer from '../components/notifications/NotificationDrawer';
import CreateTicketModal from '../pages/support/CreateTicketModal';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'COORDINATOR'];

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [helpDropdownOpen, setHelpDropdownOpen] = useState(false);
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
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
    { name: 'Messages', path: '/messages', icon: <MessageSquare size={18} />, isComingSoon: true },
  ];

  // Routes that exist but are not in the sidebar (accessible via other UI entry points).
  // Kept here so the top-bar title resolves correctly when a volunteer navigates to them.
  const volunteerHiddenRoutes = [
    { name: 'Notifications', path: '/notifications' },
    { name: 'My Programs', path: '/my-programs' },
    { name: 'Support', path: '/support' },
  ];

  // Kept here so the top-bar title resolves correctly when an admin navigates to them.
  const adminHiddenRoutes = [
    { name: 'Notifications', path: '/notifications' },
    { name: 'Support', path: '/admin/support' },
  ];

  const adminNavItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Announcements', path: '/admin/announcements', icon: <Megaphone size={18} /> },
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
    { name: 'Messages', path: '/admin/messages', icon: <MessageSquare size={18} />, isComingSoon: true },
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
          const isActive = !item.isComingSoon && (location.pathname === item.path || location.pathname.startsWith(item.path + '/'));
          return (
            <Link
              key={item.name}
              to={item.isComingSoon ? '#' : item.path}
              onClick={(e) => {
                setMobileMenuOpen(false);
                if (item.isComingSoon) {
                  e.preventDefault();
                  setShowMessagesModal(true);
                }
              }}
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
            {/* Need Help? Dropdown with creative spring animation */}
            <div style={{ position: 'relative' }}>
              <motion.button
                onClick={() => setHelpDropdownOpen(!helpDropdownOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  padding: '0.5rem 0.9rem',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-card)',
                  color: 'var(--color-heading)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                  outline: 'none',
                }}
              >
                <HelpCircle size={16} style={{ color: 'var(--primary-blue)' }} />
                <span>Need Help?</span>
              </motion.button>
              
              <AnimatePresence>
                {helpDropdownOpen && (
                  <>
                    <div 
                      onClick={() => setHelpDropdownOpen(false)}
                      style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 15 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                      style={{
                        position: 'absolute',
                        top: '120%',
                        right: 0,
                        width: '180px',
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '12px',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 100,
                        overflow: 'hidden',
                        padding: '0.4rem',
                      }}
                    >
                      <button
                        onClick={() => {
                          setHelpDropdownOpen(false);
                          setShowCreateTicketModal(true);
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.65rem 0.8rem',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          borderRadius: '8px',
                          color: 'var(--color-heading)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          transition: 'background-color var(--duration-fast) var(--ease-premium)',
                          backgroundColor: 'transparent',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Sparkles size={14} style={{ color: 'var(--primary-blue)' }} />
                        Generate Ticket
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

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

      <AnimatePresence>
        {showMessagesModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMessagesModal(false)}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                backdropFilter: 'blur(8px)',
              }}
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '460px',
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                padding: '2.5rem 2rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                zIndex: 10,
                overflow: 'hidden',
                textAlign: 'center',
              }}
            >
              {/* Accent Gradient Element */}
              <div style={{
                position: 'absolute',
                top: '-50px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '180px',
                height: '180px',
                background: 'radial-gradient(circle, rgba(11, 59, 145, 0.12) 0%, rgba(11, 59, 145, 0) 70%)',
                pointerEvents: 'none',
              }} />

              {/* Close Button */}
              <button
                onClick={() => setShowMessagesModal(false)}
                style={{
                  position: 'absolute',
                  top: '1.25rem',
                  right: '1.25rem',
                  border: 'none',
                  background: '#f1f5f9',
                  color: '#64748b',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
              >
                <X size={16} />
              </button>

              {/* Icon Container */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, var(--primary-blue) 0%, #082a68 100%)',
                color: '#ffffff',
                marginBottom: '1.5rem',
                boxShadow: '0 10px 15px -3px rgba(11, 59, 145, 0.3)',
              }}>
                <MessageSquare size={32} />
              </div>

              {/* Title with Sparkles */}
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#1e293b',
                margin: '0 0 0.75rem 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}>
                Next-Gen Chat Is Coming! <Sparkles size={20} style={{ color: '#fbbf24' }} />
              </h3>

              {/* Description */}
              <p style={{
                fontSize: '0.95rem',
                lineHeight: 1.6,
                color: '#475569',
                margin: '0 0 2rem 0',
              }}>
                We are building a powerful, real-time messaging workspace to connect you directly with team leaders and fellow volunteers. Stay tuned for a seamless way to collaborate!
              </p>

              {/* Preview Feature Items */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                textAlign: 'left',
                marginBottom: '2rem',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '16px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #f1f5f9',
                }}>
                  <div style={{ color: 'var(--primary-blue)', display: 'flex' }}>
                    <Zap size={18} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Instant Real-Time Chat</h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Direct messaging and workspace-focused team threads.</p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '16px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #f1f5f9',
                }}>
                  <div style={{ color: '#10b981', display: 'flex' }}>
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Smart Task Actions</h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Create tasks, check-in, and share links directly within messages.</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setShowMessagesModal(false)}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: '16px',
                  border: 'none',
                  background: 'linear-gradient(135deg, var(--primary-blue) 0%, #082a68 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(11, 59, 145, 0.2)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px -1px rgba(11, 59, 145, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(11, 59, 145, 0.2)';
                }}
              >
                Count Me In! 🚀
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateTicketModal && (
          <CreateTicketModal 
            onClose={() => setShowCreateTicketModal(false)} 
            isAdmin={isAdmin} 
          />
        )}
      </AnimatePresence>

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
