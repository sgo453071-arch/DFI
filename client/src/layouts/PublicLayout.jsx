import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { Shield, LogOut, Menu, X, Heart, Mail, Search, Bell, ChevronDown, User } from 'lucide-react';

// Social icons — react-icons is not installed; defined as minimal inline SVGs
const FaLinkedin = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);
const FaInstagram = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
);
const FaYoutube = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);
const FaFacebook = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);


import { motion, AnimatePresence } from 'framer-motion';

const PublicLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(() => window.scrollY > 60);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);

  const isHomePage = location.pathname === '/';

  const solidNav = isHomePage ? isScrolled : true;

  const navBaseStyle = {
    padding: '0.5rem 0.875rem',
    borderRadius: 8,
    fontSize: '0.9375rem',
    fontWeight: 500,
    textDecoration: 'none',
    position: 'relative',
    transition: 'color 0.23s ease-in-out, opacity 0.23s ease-in-out',
  };

  const commonLinkStyle = {
    ...navBaseStyle,
    color: 'rgba(255,255,255,0.92)',
    backgroundColor: 'transparent',
    opacity: 1,
    textShadow: '0 1px 3px rgba(0,0,0,0.5), 0 0 8px rgba(0,0,0,0.25)',
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsScrolled(window.scrollY > 60);
  }, [location.pathname]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Programs', path: '/programs' },
    { name: 'Leaderboard', path: '/leaderboard' },
  ];

  // Roles are stored in lowercase on server, normalize for comparison
  const adminRoles = ['admin', 'superadmin', 'coordinator'];
  const dashboardPath = user && adminRoles.includes(user?.role?.toLowerCase()) ? '/admin/dashboard' : '/dashboard';

  return (
    <div className="flex flex-col min-h-screen" style={{ fontFamily: 'var(--font-primary)', backgroundColor: 'var(--color-bg)' }}>

      {/* ─────────────── HEADER ─────────────── */}
      <header
        className="fixed w-full top-0 z-[100]"
        style={{
          backgroundColor: solidNav ? 'rgba(255,255,255,0.55)' : 'transparent',
          borderBottom: solidNav ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
          boxShadow: 'none',
          backdropFilter: solidNav ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: solidNav ? 'blur(16px)' : 'none',
          transition: 'background-color 0.23s ease-in-out, border-color 0.23s ease-in-out, backdrop-filter 0.23s ease-in-out, -webkit-backdrop-filter 0.23s ease-in-out',
          padding: '0 2rem',
          height: '76px',
        }}
      >
        <style>{`
          @media (prefers-reduced-motion: reduce) {
            header { transition: none !important; }
            header * { transition: none !important; }
          }
        `}</style>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', height: '100%', gap: '2.25rem' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={20} color="white" />
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', color: solidNav ? 'var(--color-heading)' : '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1 }}>
                DISHA
              </span>
              <span style={{ display: 'block', fontSize: '0.6rem', fontWeight: 600, color: solidNav ? 'var(--color-primary)' : 'rgba(255,255,255,0.85)', letterSpacing: '0.12em', textTransform: 'uppercase', lineHeight: 1 }}>
                for India
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem', flex: 1 }} className="hidden md:flex">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    ...commonLinkStyle,
                    backgroundColor: 'transparent',
                    opacity: isActive ? 1 : 0.85,
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.opacity = '0.85'; }}
                  onFocus={e => { e.currentTarget.style.outline = '2px solid var(--color-primary)'; e.currentTarget.style.outlineOffset = '2px'; }}
                  onBlur={e => { e.currentTarget.style.outline = 'none'; }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {link.name}
                  {isActive && <span style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', width: 18, height: 2, borderRadius: 999, background: 'var(--color-primary)' }} />}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }} className="hidden md:flex">

            {/* Search */}
            <AnimatePresence>
              {searchOpen ? (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 220, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', backgroundColor: solidNav ? '#F5F3EF' : 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '0.35rem 0.75rem', gap: '0.5rem', transition: 'background 0.23s ease-in-out' }}
                >
                  <Search size={15} style={{ color: solidNav ? 'var(--color-body)' : 'rgba(255,255,255,0.7)', flexShrink: 0, transition: 'color 0.23s ease-in-out' }} />
                  <input
                    ref={searchRef}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search programs, NGOs..."
                    style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.8rem', color: solidNav ? 'var(--color-heading)' : 'white', width: '100%', transition: 'color 0.23s ease-in-out' }}
                    onKeyDown={e => e.key === 'Escape' && setSearchOpen(false)}
                  />
                  <button onClick={() => setSearchOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                    <X size={14} style={{ color: solidNav ? 'var(--color-body)' : 'rgba(255,255,255,0.7)', transition: 'color 0.23s ease-in-out' }} />
                  </button>
                </motion.div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  style={{ width: 36, height: 36, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: solidNav ? 'var(--color-body)' : 'rgba(255,255,255,0.92)', transition: 'background 0.23s ease-in-out, color 0.23s ease-in-out' }}
                  onMouseEnter={e => { e.currentTarget.style.background = solidNav ? '#F5F3EF' : 'rgba(255,255,255,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  onFocus={e => { e.currentTarget.style.outline = '2px solid var(--color-primary)'; e.currentTarget.style.outlineOffset = '2px'; }}
                  onBlur={e => { e.currentTarget.style.outline = 'none'; }}
                  aria-label="Search"
                >
                  <Search size={18} />
                </button>
              )}
            </AnimatePresence>

            {user && (
              <button
                style={{ width: 36, height: 36, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: solidNav ? 'var(--color-body)' : 'rgba(255,255,255,0.92)', position: 'relative', transition: 'color 0.23s ease-in-out' }}
                aria-label="Notifications"
                onFocus={e => { e.currentTarget.style.outline = '2px solid var(--color-primary)'; e.currentTarget.style.outlineOffset = '2px'; }}
                onBlur={e => { e.currentTarget.style.outline = 'none'; }}
              >
                <Bell size={18} />
                <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: 'var(--color-error)', border: '2px solid white' }} />
              </button>
            )}

            <div style={{ width: 1, height: 20, background: solidNav ? '#E8E3D9' : 'rgba(255,255,255,0.2)', margin: '0 0.25rem' }} />

            {user ? (
              <>
                <Link
                  to={dashboardPath}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', borderRadius: 8, fontSize: '0.875rem', fontWeight: 600, color: solidNav ? 'var(--color-heading)' : 'white', textDecoration: 'none', transition: 'background 0.23s ease-in-out, color 0.23s ease-in-out' }}
                  onMouseEnter={e => { e.currentTarget.style.background = solidNav ? '#F5F3EF' : 'rgba(255,255,255,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  onFocus={e => { e.currentTarget.style.outline = '2px solid var(--color-primary)'; e.currentTarget.style.outlineOffset = '2px'; }}
                  onBlur={e => { e.currentTarget.style.outline = 'none'; }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={14} color="white" />
                  </div>
                  Hi, {(user?.name || 'User').split(' ')[0]}
                  <ChevronDown size={14} />
                </Link>
                <button
                  onClick={handleLogout}
                  style={{ padding: '0.4rem 0.875rem', borderRadius: 8, border: '1px solid #FCA5A5', background: 'rgba(239,68,68,0.06)', color: '#DC2626', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', transition: 'all 0.23s ease-in-out' }}
                  onFocus={e => { e.currentTarget.style.outline = '2px solid var(--color-primary)'; e.currentTarget.style.outlineOffset = '2px'; }}
                  onBlur={e => { e.currentTarget.style.outline = 'none'; }}
                >
                  <LogOut size={14} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  style={{ ...commonLinkStyle, backgroundColor: 'transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '0.85'; }}
                  onFocus={e => { e.currentTarget.style.outline = '2px solid var(--color-primary)'; e.currentTarget.style.outlineOffset = '2px'; }}
                  onBlur={e => { e.currentTarget.style.outline = 'none'; }}
                >
                  Sign In
                </Link>
                <Link
                  to="/dashboard"
                  style={{ padding: '0.5rem 1.125rem', borderRadius: 8, fontSize: '0.875rem', fontWeight: 700, background: 'var(--color-primary)', color: 'white', textDecoration: 'none', boxShadow: '0 2px 8px rgba(211,84,0,0.3)', transition: 'all 0.23s ease-in-out', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-primary-hover)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-primary)'; e.currentTarget.style.transform = 'none'; }}
                  onFocus={e => { e.currentTarget.style.outline = '2px solid var(--color-primary)'; e.currentTarget.style.outlineOffset = '2px'; }}
                  onBlur={e => { e.currentTarget.style.outline = 'none'; }}
                >
                  Dashboard
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            style={{ marginLeft: 'auto', width: 40, height: 40, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: solidNav ? 'var(--color-heading)' : 'white', transition: 'color 0.23s ease-in-out' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            onFocus={e => { e.currentTarget.style.outline = '2px solid var(--color-primary)'; e.currentTarget.style.outlineOffset = '2px'; }}
            onBlur={e => { e.currentTarget.style.outline = 'none'; }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              style={{ position: 'fixed', inset: 0, top: 0, background: 'white', zIndex: 200, display: 'flex', flexDirection: 'column', paddingTop: '5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingBottom: '2rem', overflowY: 'auto' }}
            >
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', width: 40, height: 40, borderRadius: 8, border: 'none', background: '#F5F3EF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={20} />
              </button>

              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '2rem' }}>
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    style={{ padding: '0.875rem 1rem', borderRadius: 10, fontSize: '1.1rem', fontWeight: 700, color: location.pathname === link.path ? 'var(--color-primary)' : 'var(--color-heading)', textDecoration: 'none', background: location.pathname === link.path ? 'rgba(211,84,0,0.08)' : 'transparent', fontFamily: 'var(--font-heading)' }}
                  >
                    {link.name}
                  </Link>
                ))}
                {user && (
                  <Link to={dashboardPath} style={{ padding: '0.875rem 1rem', borderRadius: 10, fontSize: '1.1rem', fontWeight: 700, color: location.pathname === dashboardPath ? 'var(--color-primary)' : 'var(--color-heading)', textDecoration: 'none', background: location.pathname === dashboardPath ? 'rgba(211,84,0,0.08)' : 'transparent', fontFamily: 'var(--font-heading)' }}>
                    Dashboard
                  </Link>
                )}
              </nav>

              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {user ? (
                  <button
                    onClick={handleLogout}
                    style={{ padding: '0.875rem', borderRadius: 10, border: '1px solid #FCA5A5', background: 'rgba(239,68,68,0.06)', color: '#DC2626', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <LogOut size={18} /> Logout
                  </button>
                ) : (
                  <>
                    <Link to="/login" style={{ padding: '0.875rem', borderRadius: 10, border: '1px solid #E8E3D9', background: 'white', color: 'var(--color-heading)', fontSize: '1rem', fontWeight: 700, textAlign: 'center', textDecoration: 'none', display: 'block' }}>
                      Sign In
                    </Link>
                    <Link to="/register" style={{ padding: '0.875rem', borderRadius: 10, background: 'var(--color-primary)', color: 'white', fontSize: '1rem', fontWeight: 700, textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <Heart size={18} /> Become a Volunteer
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: isHomePage ? 0 : '76px' }}>
        <Outlet />
      </main>

      {/* ─────────────── FOOTER ─────────────── */}
      <footer style={{ background: '#111827', color: '#9CA3AF', fontFamily: 'var(--font-primary)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '4rem 1.5rem 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '3rem', paddingBottom: '3rem', borderBottom: '1px solid #1F2937' }}>
            <div style={{ gridColumn: 'span 1' }}>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: '1rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Shield size={20} color="white" />
                </div>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', color: 'white' }}>DISHA</span>
              </Link>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: '#6B7280', marginBottom: '1.5rem', maxWidth: 260 }}>
                Empowering communities through verifiable volunteering. Connecting passionate individuals with grassroot NGOs across India.
              </p>
              <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
                {[
                  { Icon: FaLinkedin, label: 'LinkedIn' },
                  { Icon: FaInstagram, label: 'Instagram' },
                  { Icon: FaYoutube, label: 'YouTube' },
                  { Icon: FaFacebook, label: 'Facebook' },
                ].map(({ Icon, label }) => (
                  <a key={label} href="#" aria-label={label}
                    style={{ width: 36, height: 36, borderRadius: 8, background: '#1F2937', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', textDecoration: 'none', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-primary)'; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#1F2937'; e.currentTarget.style.color = '#9CA3AF'; }}
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h5 style={{ color: 'white', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Company</h5>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {['About', 'Careers', 'Contact', 'Our Mission'].map(item => (
                  <li key={item}><a href="#" style={{ color: '#6B7280', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
                  >{item}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h5 style={{ color: 'white', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Programs</h5>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {['Volunteer', 'Events', 'Success Stories', 'Leaderboard', 'Certificates'].map(item => (
                  <li key={item}><a href="#" style={{ color: '#6B7280', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
                  >{item}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h5 style={{ color: 'white', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Resources</h5>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {['Blogs', 'FAQs', 'Downloads', 'Help Center', 'Community'].map(item => (
                  <li key={item}><a href="#" style={{ color: '#6B7280', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
                  >{item}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h5 style={{ color: 'white', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Legal</h5>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {['Privacy', 'Terms', 'Refund Policy', 'Cookie Policy', 'Accessibility'].map(item => (
                  <li key={item}><a href="#" style={{ color: '#6B7280', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
                  >{item}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h5 style={{ color: 'white', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Stay Updated</h5>
              <p style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '1rem', lineHeight: 1.6 }}>
                Get impact stories, volunteer spotlights, and new program alerts.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="email"
                  placeholder="Your email"
                  style={{ flex: 1, minWidth: 0, padding: '0.6rem 0.75rem', borderRadius: 8, border: '1px solid #374151', background: '#1F2937', color: 'white', fontSize: '0.8rem', outline: 'none', fontFamily: 'inherit' }}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = '#374151'}
                />
                <button
                  style={{ padding: '0.6rem 0.875rem', borderRadius: 8, background: 'var(--color-primary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--color-primary)'}
                >
                  <Mail size={16} color="white" />
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '1.5rem 0', fontSize: '0.8rem', color: '#4B5563' }}>
            <span>© {new Date().getFullYear()} Disha for India Foundation. All rights reserved.</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span>Made with</span>
              <Heart size={12} style={{ color: '#EF4444', fill: '#EF4444' }} />
              <span>in India</span>
              <span style={{ color: '#374151' }}>·</span>
              <span>Version 1.0</span>
              <span style={{ color: '#374151' }}>·</span>
              <a href="#" style={{ color: '#4B5563', textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.color = '#D1D5DB'} onMouseLeave={e => e.currentTarget.style.color = '#4B5563'}>Privacy</a>
              <span style={{ color: '#374151' }}>·</span>
              <a href="#" style={{ color: '#4B5563', textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.color = '#D1D5DB'} onMouseLeave={e => e.currentTarget.style.color = '#4B5563'}>Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;