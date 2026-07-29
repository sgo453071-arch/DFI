import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, FileCheck, Users, CheckCircle2, XCircle,
  Search, ChevronDown, X, Calendar, Eye, FolderOpen,
  ArrowLeft, ChevronRight, Layers, Sparkles, Filter, MapPin, Tag,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SimpleLoader from '../../components/common/SimpleLoader';
import {
  getAdminApplications,
  approveApplication,
  rejectApplication,
} from '../../services/applicationsService';
import { getAllPrograms } from '../../services/programsService';

/* ─── status config ──────────────────────────────────────────────────────── */

const STATUS_CONFIG = {
  applied:   { label: 'Pending',   bg: '#FEF3C7', color: '#92400E', dot: '#D97706' },
  approved:  { label: 'Approved',  bg: '#DCFCE7', color: '#14532D', dot: '#16A34A' },
  joined:    { label: 'Joined',    bg: '#DBEAFE', color: '#1E40AF', dot: '#2563EB' },
  rejected:  { label: 'Rejected',  bg: '#FEE2E2', color: '#991B1B', dot: '#DC2626' },
  withdrawn: { label: 'Withdrawn', bg: '#F1F5F9', color: '#334155', dot: '#64748B' },
  cancelled: { label: 'Cancelled', bg: '#F1F5F9', color: '#334155', dot: '#94A3B8' },
  completed: { label: 'Completed', bg: '#F3E8FF', color: '#5B21B6', dot: 'var(--color-primary)' },
};

const STATUS_FILTER_OPTIONS = [
  { value: '',          label: 'All Statuses' },
  { value: 'applied',   label: 'Pending'     },
  { value: 'approved',  label: 'Approved'    },
  { value: 'joined',    label: 'Joined'      },
  { value: 'rejected',  label: 'Rejected'    },
  { value: 'withdrawn', label: 'Withdrawn'   },
  { value: 'cancelled', label: 'Cancelled'   },
];

/* ─── sub-components ─────────────────────────────────────────────────────── */

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: '#F1F5F9', color: '#334155', dot: '#64748B' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
      padding: '0.25rem 0.7rem', borderRadius: 999,
      background: cfg.bg, color: cfg.color,
      fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 700, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, color, bg, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    style={{
      background: 'var(--color-card, #FFFFFF)', borderRadius: 14,
      padding: '1.25rem 1.5rem', border: '1px solid var(--color-border, #E2E8F0)',
      display: 'flex', alignItems: 'center', gap: '1rem',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}
  >
    <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={20} />
    </div>
    <div>
      <div style={{ fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, color: 'var(--color-body, #64748B)', marginBottom: '0.2rem' }}>{label}</div>
      {loading
        ? <div className="skeleton" style={{ height: 28, width: 48, borderRadius: 6 }} />
        : <div style={{ fontSize: 'var(--text-2xl, 1.5rem)', fontWeight: 800, color: 'var(--color-heading, #0F172A)', lineHeight: 1 }}>{value}</div>
      }
    </div>
  </motion.div>
);

/* ─── rejection reason modal ─────────────────────────────────────────────── */

const RejectModal = ({ app, onConfirm, onClose }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onConfirm(app._id || app.id, reason);
    setLoading(false);
  };

  if (!app) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          position: 'relative', background: 'var(--color-card, #FFFFFF)', borderRadius: 16,
          padding: '1.75rem', width: '100%', maxWidth: 480,
          boxShadow: 'var(--shadow-xl)', border: '1px solid var(--color-border, #E2E8F0)',
          zIndex: 10000,
        }}
      >
        <h3 style={{ margin: '0 0 0.5rem', fontWeight: 700, color: 'var(--color-heading, #0F172A)', fontSize: 'var(--text-lg, 1.125rem)' }}>
          Reject Application
        </h3>
        <p style={{ fontSize: 'var(--text-sm, 0.875rem)', color: 'var(--color-body, #64748B)', margin: '0 0 1.25rem' }}>
          Rejecting application from <strong>{app.user?.name || 'this volunteer'}</strong> for{' '}
          <strong>{app.program?.title || 'this program'}</strong>.
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Reason <span style={{ color: 'var(--color-body)', fontWeight: 400 }}>(optional)</span></label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="form-control"
              rows={3}
              placeholder="e.g. Program capacity reached, qualifications mismatch…"
              maxLength={500}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              {loading ? <SimpleLoader /> : <XCircle size={15} />}
              Reject Application
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/* ─── main component ─────────────────────────────────────────────────────── */

const AdminApplications = () => {
  const queryClient = useQueryClient();

  const [selectedProgram, setSelectedProgram] = useState(null); // null = program grid view, programObj = detail view
  const [viewAllAppsMode, setViewAllAppsMode] = useState(false); // view across all programs at once

  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [rejectTarget, setRejectTarget] = useState(null);
  const [actioningId, setActioningId]   = useState(null);

  /* ── data fetching ──────────────────────────────────────────── */

  // 1. Fetch All Active Programs
  const { data: programsData, isLoading: isLoadingPrograms } = useQuery({
    queryKey: ['admin-programs-overview'],
    queryFn: async () => {
      const res = await getAllPrograms({ limit: 100 });
      return res?.programs || [];
    },
    staleTime: 60_000,
  });

  // 2. Fetch All Applications
  const { data: applicationsData, isLoading: isLoadingApps } = useQuery({
    queryKey: ['admin-applications-list'],
    queryFn: async () => {
      const res = await getAdminApplications({ limit: 500 });
      return res?.data?.applications || res?.applications || [];
    },
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const allPrograms = useMemo(() => programsData || [], [programsData]);
  const allApplications = useMemo(() => applicationsData || [], [applicationsData]);

  /* ── derived program cards with app breakdown stats ─────────── */

  const activeProgramsWithStats = useMemo(() => {
    return allPrograms.map((prog) => {
      const progIdStr = (prog._id || prog.id || '').toString();
      const progApps = allApplications.filter((a) => {
        const aProgId = (a.program?._id || a.program?.id || a.program || '').toString();
        return aProgId === progIdStr;
      });

      return {
        ...prog,
        totalApps: progApps.length,
        pendingApps: progApps.filter((a) => a.status === 'applied').length,
        approvedApps: progApps.filter((a) => a.status === 'approved' || a.status === 'joined').length,
        rejectedApps: progApps.filter((a) => a.status === 'rejected').length,
      };
    });
  }, [allPrograms, allApplications]);

  // Filter programs for the program grid view
  const filteredPrograms = useMemo(() => {
    const q = search.toLowerCase().trim();
    return activeProgramsWithStats.filter((p) => {
      const title = (p.title || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const city = (p.city || '').toLowerCase();
      return !q || title.includes(q) || cat.includes(q) || city.includes(q);
    });
  }, [activeProgramsWithStats, search]);

  /* ── filtered applications for table view ────────────────────── */

  const filteredApplications = useMemo(() => {
    const q = search.toLowerCase().trim();
    let apps = allApplications;

    // Filter by selected program if in program-detail mode
    if (selectedProgram && !viewAllAppsMode) {
      const selectedIdStr = (selectedProgram._id || selectedProgram.id || '').toString();
      apps = apps.filter((a) => {
        const aProgId = (a.program?._id || a.program?.id || a.program || '').toString();
        return aProgId === selectedIdStr;
      });
    }

    // Filter by status dropdown
    if (statusFilter) {
      apps = apps.filter((a) => a.status === statusFilter);
    }

    // Filter by search text (name, email, program title)
    if (q) {
      apps = apps.filter((a) => {
        const name    = (a.user?.name  || '').toLowerCase();
        const email   = (a.user?.email || '').toLowerCase();
        const program = (a.program?.title || '').toLowerCase();
        return name.includes(q) || email.includes(q) || program.includes(q);
      });
    }

    return apps;
  }, [allApplications, selectedProgram, viewAllAppsMode, statusFilter, search]);

  /* ── system wide stats ───────────────────────────────────────── */

  const globalStats = useMemo(() => ({
    totalPrograms: allPrograms.length,
    totalApps: allApplications.length,
    pending: allApplications.filter((a) => a.status === 'applied').length,
    approved: allApplications.filter((a) => a.status === 'approved' || a.status === 'joined').length,
    rejected: allApplications.filter((a) => a.status === 'rejected').length,
  }), [allPrograms, allApplications]);

  /* ── actions ────────────────────────────────────────────────── */

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin-applications-list'] });
    queryClient.invalidateQueries({ queryKey: ['admin-programs-overview'] });
    queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
  }, [queryClient]);

  const handleApprove = useCallback(async (id) => {
    setActioningId(id);
    try {
      await approveApplication(id);
      toast.success('Application approved!');
      queryClient.setQueryData(['admin-applications-list'], (old = []) =>
        old.map((a) => (a._id === id || a.id === id) ? { ...a, status: 'approved' } : a)
      );
      invalidate();
    } catch (err) {
      toast.error(err?.message || 'Failed to approve application.');
    } finally {
      setActioningId(null);
    }
  }, [queryClient, invalidate]);

  const handleRejectConfirm = useCallback(async (id, reason) => {
    setActioningId(id);
    try {
      await rejectApplication(id, reason);
      toast.success('Application rejected.');
      queryClient.setQueryData(['admin-applications-list'], (old = []) =>
        old.map((a) => (a._id === id || a.id === id) ? { ...a, status: 'rejected' } : a)
      );
      invalidate();
    } catch (err) {
      toast.error(err?.message || 'Failed to reject application.');
    } finally {
      setActioningId(null);
      setRejectTarget(null);
    }
  }, [queryClient, invalidate]);

  const isDetailView = selectedProgram !== null || viewAllAppsMode;

  /* ── render ──────────────────────────────────────────────────── */

  return (
    <div style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto' }}>

      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          {isDetailView ? (
            <button
              onClick={() => {
                setSelectedProgram(null);
                setViewAllAppsMode(false);
                setSearch('');
              }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                background: 'none', border: 'none', color: 'var(--color-primary, #2563EB)',
                fontWeight: 600, cursor: 'pointer', fontSize: 'var(--text-sm, 0.875rem)',
                marginBottom: '0.5rem', padding: 0,
              }}
            >
              <ArrowLeft size={16} /> Back to Programs Overview
            </button>
          ) : null}

          <h1 style={{ fontSize: 'var(--text-3xl, 1.875rem)', fontWeight: 800, color: 'var(--color-heading, #0F172A)', margin: 0 }}>
            {selectedProgram
              ? `Applications for "${selectedProgram.title}"`
              : viewAllAppsMode
                ? 'All Volunteer Applications'
                : 'Application Management'}
          </h1>
          <p style={{ color: 'var(--color-body, #64748B)', margin: '0.3rem 0 0', fontSize: 'var(--text-base, 0.925rem)' }}>
            {selectedProgram
              ? `Review and take action on applications submitted for ${selectedProgram.title}.`
              : 'Select a program below to review its applications, or view all applications across programs.'}
          </p>
        </div>

        {!isDetailView && (
          <button
            onClick={() => setViewAllAppsMode(true)}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
          >
            <Layers size={16} /> View All Applications ({globalStats.totalApps})
          </button>
        )}
      </div>

      {/* Global Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <StatCard icon={Layers}      label="Active Programs"    value={globalStats.totalPrograms} color="var(--color-primary, #2563EB)" bg="rgba(37, 99, 235, 0.12)" loading={isLoadingPrograms} />
        <StatCard icon={Users}       label="Total Applications" value={globalStats.totalApps} color="#7C3AED" bg="#F3E8FF" loading={isLoadingApps} />
        <StatCard icon={FileCheck}   label="Pending Review"     value={globalStats.pending}   color="#D97706" bg="#FEF3C7" loading={isLoadingApps} />
        <StatCard icon={CheckCircle2}label="Approved / Joined"  value={globalStats.approved}  color="#16A34A" bg="#DCFCE7" loading={isLoadingApps} />
      </div>

      {/* ─── LEVEL 1: PROGRAM CARDS GRID VIEW ──────────────────────────────── */}
      {!isDetailView && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: 'var(--text-xl, 1.25rem)', fontWeight: 700, color: 'var(--color-heading, #0F172A)', margin: 0 }}>
              Programs Overview ({filteredPrograms.length})
            </h3>

            {/* Search programs */}
            <div style={{ position: 'relative', width: 280 }}>
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-body)', pointerEvents: 'none' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search programs..."
                className="form-control"
                style={{ paddingLeft: '2.25rem', paddingRight: search ? '2.25rem' : '0.875rem' }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '0.625rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-body)', display: 'flex' }}>
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {isLoadingPrograms || isLoadingApps ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="skeleton" style={{ height: 180, borderRadius: 16 }} />
              ))}
            </div>
          ) : filteredPrograms.length === 0 ? (
            <div style={{ background: 'var(--color-card)', borderRadius: 16, padding: '4rem 2rem', textAlign: 'center', border: '1px solid var(--color-border)' }}>
              <FolderOpen size={40} style={{ color: 'var(--color-body)', opacity: 0.4, marginBottom: '1rem' }} />
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-heading)', margin: '0 0 0.5rem' }}>
                No Programs Found
              </h3>
              <p style={{ color: 'var(--color-body)', margin: 0 }}>
                {search ? 'No programs match your search criteria.' : 'Create a program to start collecting volunteer applications.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {filteredPrograms.map((prog) => (
                <motion.div
                  key={prog._id || prog.id}
                  whileHover={{ y: -4, boxShadow: '0 12px 24px -6px rgba(0, 0, 0, 0.08)' }}
                  onClick={() => {
                    setSelectedProgram(prog);
                    setSearch('');
                  }}
                  style={{
                    background: 'var(--color-card, #FFFFFF)',
                    borderRadius: 16,
                    padding: '1.5rem',
                    border: '1px solid var(--color-border, #E2E8F0)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    {/* Category & Status Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                        padding: '0.25rem 0.65rem', borderRadius: 999,
                        background: 'rgba(37, 99, 235, 0.1)', color: 'var(--color-primary, #2563EB)',
                        fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 700,
                      }}>
                        <Tag size={12} /> {prog.category || 'General'}
                      </span>

                      <span style={{
                        padding: '0.2rem 0.6rem', borderRadius: 999,
                        background: prog.status === 'published' ? '#DCFCE7' : prog.status === 'ongoing' ? '#DBEAFE' : '#F1F5F9',
                        color: prog.status === 'published' ? '#15803D' : prog.status === 'ongoing' ? '#1E40AF' : '#475569',
                        fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 700, textTransform: 'capitalize',
                      }}>
                        {prog.status === 'published' ? 'Open' : prog.status}
                      </span>
                    </div>

                    {/* Program Title */}
                    <h3 style={{ fontSize: 'var(--text-lg, 1.125rem)', fontWeight: 700, color: 'var(--color-heading, #0F172A)', margin: '0 0 0.5rem 0', lineHeight: 1.3 }}>
                      {prog.title}
                    </h3>

                    {/* Meta info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--color-body, #64748B)', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                      {prog.city && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={13} /> {prog.city}
                        </span>
                      )}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', textTransform: 'capitalize' }}>
                        <Layers size={13} /> {prog.mode || 'offline'}
                      </span>
                    </div>
                  </div>

                  {/* Application Count Badges */}
                  <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-border, #F1F5F9)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ padding: '0.25rem 0.6rem', borderRadius: 8, background: '#FEF3C7', color: '#92400E', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 700 }}>
                          {prog.pendingApps} Pending
                        </span>
                        <span style={{ padding: '0.25rem 0.6rem', borderRadius: 8, background: '#DCFCE7', color: '#16A34A', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 700 }}>
                          {prog.approvedApps} Approved
                        </span>
                      </div>
                      <span style={{ fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 700, color: 'var(--color-body, #64748B)' }}>
                        {prog.totalApps} Total
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem', color: 'var(--color-primary, #2563EB)', fontWeight: 700, fontSize: 'var(--text-xs, 0.75rem)' }}>
                      View Applications <ChevronRight size={15} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ─── LEVEL 2: APPLICATIONS TABLE VIEW ───────────────────────────────── */}
      {isDetailView && (
        <>
          {/* Filters Bar */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-body)', pointerEvents: 'none' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search applicant name, email, or program…"
                className="form-control"
                style={{ paddingLeft: '2.25rem', paddingRight: search ? '2.25rem' : '0.875rem' }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '0.625rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-body)', display: 'flex' }}>
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Status filter */}
            <div style={{ position: 'relative', flex: '0 0 auto' }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-control"
                style={{ paddingRight: '2rem', minWidth: 160, appearance: 'none' }}
              >
                {STATUS_FILTER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '0.625rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-body)' }} />
            </div>

            {/* Result count */}
            {!isLoadingApps && (
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-body)', marginLeft: 'auto', flexShrink: 0 }}>
                {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Applications Table */}
          <div style={{ background: 'var(--color-card, #FFFFFF)', borderRadius: 14, border: '1px solid var(--color-border, #E2E8F0)', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--color-bg, #F8FAFC)', borderBottom: '1px solid var(--color-border, #E2E8F0)' }}>
                    {['Applicant', 'Program', 'Applied On', 'Status', 'Actions'].map((h) => (
                      <th key={h} style={{ padding: '0.875rem 1.25rem', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 700, color: 'var(--color-body, #64748B)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoadingApps && [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i}>
                      {[1, 2, 3, 4, 5].map((j) => (
                        <td key={j} style={{ padding: '1rem 1.25rem' }}>
                          <div className="skeleton" style={{ height: 16, borderRadius: 6, width: j === 1 ? '70%' : '50%' }} />
                        </td>
                      ))}
                    </tr>
                  ))}

                  {!isLoadingApps && filteredApplications.length === 0 && (
                    <tr>
                      <td colSpan={5}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem', textAlign: 'center' }}>
                          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-bg)', border: '2px dashed var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                            <FolderOpen size={28} style={{ color: 'var(--color-body)', opacity: 0.4 }} />
                          </div>
                          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-heading)', margin: '0 0 0.4rem' }}>
                            {search || statusFilter ? 'No applications match your filters' : 'No Applications Found'}
                          </h3>
                          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-body)', margin: 0 }}>
                            {search || statusFilter ? 'Try adjusting your search or status filter.' : 'Applications submitted by volunteers for this program will appear here.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}

                  {!isLoadingApps && filteredApplications.map((app) => {
                    const appId     = app._id || app.id;
                    const isPending = app.status === 'applied';
                    const isBusy    = actioningId === appId;
                    const appliedDate = app.appliedAt || app.createdAt;

                    return (
                      <tr
                        key={appId}
                        style={{
                          borderBottom: '1px solid var(--color-border, #F1F5F9)',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        {/* Applicant Name & Email */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: '50%',
                              background: 'var(--color-primary, #2563EB)', color: '#fff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 700, fontSize: 'var(--text-sm, 0.875rem)', flexShrink: 0,
                            }}>
                              {(app.user?.name || 'V')[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--color-heading, #0F172A)', fontSize: 'var(--text-sm, 0.875rem)' }}>
                                {app.user?.name || 'Unknown Volunteer'}
                              </div>
                              <div style={{ fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--color-body, #64748B)' }}>
                                {app.user?.email || '—'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Program Title */}
                        <td style={{ padding: '1rem 1.25rem', fontSize: 'var(--text-sm, 0.875rem)', color: 'var(--color-heading, #0F172A)', fontWeight: 600 }}>
                          {app.program?.title || 'Untitled Program'}
                        </td>

                        {/* Applied On */}
                        <td style={{ padding: '1rem 1.25rem', fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--color-body, #64748B)', whiteSpace: 'nowrap' }}>
                          {appliedDate
                            ? new Date(appliedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—'}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <StatusBadge status={app.status} />
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>
                          {isPending ? (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <button
                                onClick={() => handleApprove(appId)}
                                disabled={isBusy}
                                className="btn btn-success"
                                style={{
                                  padding: '0.35rem 0.75rem', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 700,
                                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem', borderRadius: 8,
                                }}
                              >
                                {isBusy ? <SimpleLoader /> : <CheckCircle2 size={13} />}
                                Approve
                              </button>
                              <button
                                onClick={() => setRejectTarget(app)}
                                disabled={isBusy}
                                className="btn btn-danger"
                                style={{
                                  padding: '0.35rem 0.75rem', fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 700,
                                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem', borderRadius: 8,
                                }}
                              >
                                <XCircle size={13} />
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--color-body, #64748B)', fontStyle: 'italic' }}>
                              Decided
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Reject Modal */}
      {rejectTarget && (
        <RejectModal
          app={rejectTarget}
          onConfirm={handleRejectConfirm}
          onClose={() => setRejectTarget(null)}
        />
      )}
    </div>
  );
};

export default AdminApplications;
