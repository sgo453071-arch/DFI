import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserCheck, Clock, ShieldAlert, Search, Filter,
  Download, Eye, Edit3, Trash2, RefreshCw, X, Shield, Mail, Phone, MapPin, Award, CheckCircle, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import SimpleLoader from '../../components/common/SimpleLoader';
import Pagination from '../../components/volunteer/Pagination';
import {
  getUsers,
  getDashboardStatistics,
  changeUserStatus,
  changeUserRole,
  deleteUser,
  restoreUser,
  getUserDetails
} from '../../services/adminService';

const AdminVolunteers = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await getDashboardStatistics();
      if (res?.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch statistics', err);
    }
  };

  const fetchUsersList = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        showDeleted: showDeleted ? 'true' : undefined
      };
      const res = await getUsers(params);
      if (res?.success) {
        setUsers(res.data?.users || []);
        setPagination(res.data?.pagination || { total: 0, totalPages: 1, limit: 10 });
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to load volunteer records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsersList();
  }, [page, search, roleFilter, statusFilter, showDeleted]);

  const [headerActionsEl, setHeaderActionsEl] = useState(null);
  useEffect(() => {
    setTimeout(() => {
      const el = document.getElementById('dashboard-header-actions');
      if (el) setHeaderActionsEl(el);
    }, 0);
  }, []);

  const handleExportCSV = () => {
    if (!users.length) {
      toast.error('No volunteer records available to export');
      return;
    }
    const headers = ['Volunteer ID', 'Name', 'Email', 'Role', 'Status', 'City', 'State', 'Phone', 'Joined Date'];
    const rows = users.map(u => [
      u.volunteerId || u._id || 'N/A',
      u.name || 'N/A',
      u.email || 'N/A',
      u.role || 'VOLUNTEER',
      u.status || 'active',
      u.city || 'N/A',
      u.state || 'N/A',
      u.phone || 'N/A',
      u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : 'N/A'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map(e => e.map(cell => `"${cell}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Volunteers_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Volunteer directory report downloaded! 📊');
  };

  const handleViewDetails = async (userId) => {
    setDetailLoading(true);
    setIsModalOpen(true);
    try {
      const res = await getUserDetails(userId);
      if (res?.success) {
        setSelectedUser(res.data?.user || res.data);
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to fetch user details');
      setIsModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    setActionLoadingId(userId);
    try {
      const res = await changeUserStatus(userId, newStatus);
      if (res?.success) {
        toast.success(`Account status updated to ${newStatus}`);
        fetchUsersList();
        fetchStats();
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to update status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setActionLoadingId(userId);
    try {
      const res = await changeUserRole(userId, newRole);
      if (res?.success) {
        toast.success(`User role updated to ${newRole}`);
        fetchUsersList();
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to update role');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteRestore = async (userObj) => {
    setActionLoadingId(userObj._id);
    try {
      if (userObj.isDeleted) {
        const res = await restoreUser(userObj._id);
        if (res?.success) {
          toast.success('User account restored successfully');
          fetchUsersList();
          fetchStats();
        }
      } else {
        if (!window.confirm(`Are you sure you want to soft delete ${userObj.name}?`)) {
          setActionLoadingId(null);
          return;
        }
        const res = await deleteUser(userObj._id);
        if (res?.success) {
          toast.success('User account deleted');
          fetchUsersList();
          fetchStats();
        }
      }
    } catch (err) {
      toast.error(err?.message || 'Action failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status, isDeleted) => {
    if (isDeleted) {
      return <span style={{ padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(107, 114, 128, 0.1)', color: '#6B7280' }}>Deleted</span>;
    }
    switch (status) {
      case 'active':
        return <span style={{ padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>Active</span>;
      case 'inactive':
        return <span style={{ padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-accent)' }}>Inactive</span>;
      case 'suspended':
        return <span style={{ padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)' }}>Suspended</span>;
      default:
        return <span style={{ padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'var(--color-bg)', color: 'var(--color-body)' }}>{status || 'Unknown'}</span>;
    }
  };

  const getRoleBadge = (role) => {
    const r = (role || 'VOLUNTEER').toUpperCase();
    if (r === 'SUPER_ADMIN' || r === 'ADMIN') {
      return <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--color-primary)' }}>Admin</span>;
    }
    if (r === 'COORDINATOR') {
      return <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(147, 51, 234, 0.1)', color: '#9333EA' }}>Coordinator</span>;
    }
    return <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'var(--color-bg)', color: 'var(--color-body)', border: '1px solid var(--color-border)' }}>Volunteer</span>;
  };

  return (
    <div className="page-container" style={{ padding: '0.5rem 0 2rem 0' }}>
      {headerActionsEl && createPortal(
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleExportCSV} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={16} /> Export Directory
          </button>
        </div>,
        headerActionsEl
      )}

      {/* Stats Cards Header */}
      {stats && (
        <div className="grid grid-cols-4" style={{ marginBottom: '2rem', gap: '1.25rem' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--color-primary)', borderRadius: '50%' }}><Users size={24} /></div>
            <div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{stats.totalUsers ?? stats.totalVolunteers ?? users.length}</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-body)' }}>Total Registered</div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', borderRadius: '50%' }}><UserCheck size={24} /></div>
            <div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{stats.activeUsers ?? stats.activeVolunteers ?? 0}</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-body)' }}>Active Volunteers</div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-accent)', borderRadius: '50%' }}><Clock size={24} /></div>
            <div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{stats.totalHoursLogged ?? 0}h</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-body)' }}>Total Volunteer Hours</div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', borderRadius: '50%' }}><ShieldAlert size={24} /></div>
            <div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{stats.inactiveUsers ?? stats.suspendedUsers ?? 0}</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-body)' }}>Inactive / Suspended</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Table & Filter Container */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        
        {/* Search & Filters Controls */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>Volunteer Directory</h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: 'var(--text-sm)', color: 'var(--color-body)' }}>Manage accounts, view impact profiles, and assign permissions.</p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            
            {/* Search */}
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-body)' }} />
              <input
                type="text"
                placeholder="Search name, email, ID..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="form-control"
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>

            {/* Role Filter */}
            <select
              className="form-control"
              style={{ width: 'auto' }}
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Roles</option>
              <option value="volunteer">Volunteer</option>
              <option value="coordinator">Coordinator</option>
              <option value="admin">Admin</option>
            </select>

            {/* Status Filter */}
            <select
              className="form-control"
              style={{ width: 'auto' }}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>

            {/* Include Deleted Toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 'var(--text-sm)', color: 'var(--color-body)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showDeleted}
                onChange={(e) => { setShowDeleted(e.target.checked); setPage(1); }}
              />
              Show Deleted
            </label>
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '3rem' }}><SimpleLoader text="Loading volunteers..." /></div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '1rem 1.5rem', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-body)' }}>Volunteer</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-body)' }}>Role</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-body)' }}>Location</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-body)' }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-body)' }}>Joined Date</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-body)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      
                      {/* Name & Avatar */}
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(37, 99, 235, 0.1)',
                            color: 'var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            flexShrink: 0
                          }}>
                            {u.name?.charAt(0).toUpperCase() || 'V'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--color-heading)' }}>{u.name || 'Unnamed User'}</div>
                            <div style={{ fontSize: '0.825rem', color: 'var(--color-body)' }}>{u.email}</div>
                            {u.volunteerId && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: '0.1rem' }}>ID: {u.volunteerId}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td style={{ padding: '1rem 1.5rem' }}>
                        {getRoleBadge(u.role)}
                      </td>

                      {/* Location */}
                      <td style={{ padding: '1rem 1.5rem', fontSize: 'var(--text-sm)', color: 'var(--color-body)' }}>
                        {u.city || u.state ? `${u.city || ''}${u.city && u.state ? ', ' : ''}${u.state || ''}` : 'Location N/A'}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '1rem 1.5rem' }}>
                        {getStatusBadge(u.status, u.isDeleted)}
                      </td>

                      {/* Joined Date */}
                      <td style={{ padding: '1rem 1.5rem', fontSize: 'var(--text-sm)', color: 'var(--color-body)' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                      </td>

                      {/* Action Menu */}
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          
                          {/* View Details */}
                          <button
                            onClick={() => handleViewDetails(u._id)}
                            title="View Profile Details"
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                          >
                            <Eye size={14} /> Details
                          </button>

                          {/* Quick Status Dropdown */}
                          {!u.isDeleted && (
                            <select
                              value={u.status || 'active'}
                              disabled={actionLoadingId === u._id}
                              onChange={(e) => handleStatusChange(u._id, e.target.value)}
                              className="form-control"
                              style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                              <option value="suspended">Suspended</option>
                            </select>
                          )}

                          {/* Delete or Restore */}
                          <button
                            onClick={() => handleDeleteRestore(u)}
                            disabled={actionLoadingId === u._id}
                            title={u.isDeleted ? 'Restore Account' : 'Soft Delete Account'}
                            style={{
                              padding: '0.4rem 0.6rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--color-border)',
                              backgroundColor: u.isDeleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: u.isDeleted ? 'var(--color-success)' : 'var(--color-error)',
                              cursor: 'pointer'
                            }}
                          >
                            {u.isDeleted ? <RefreshCw size={14} /> : <Trash2 size={14} />}
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-body)' }}>
                      No volunteer records found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
            />
          </div>
        )}

      </div>

      {/* Volunteer Detail Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
          }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)' }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '650px',
                maxHeight: '90vh',
                overflowY: 'auto',
                backgroundColor: 'var(--color-card)',
                borderRadius: '16px',
                padding: '2rem',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 10
              }}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  position: 'absolute', top: '1.25rem', right: '1.25rem',
                  border: 'none', background: 'var(--color-bg)', color: 'var(--color-body)',
                  width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>

              {detailLoading || !selectedUser ? (
                <SimpleLoader text="Loading profile details..." />
              ) : (
                <div>
                  
                  {/* Modal Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.5rem' }}>
                    <div style={{
                      width: '60px', height: '60px', borderRadius: '50%',
                      backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--color-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700
                    }}>
                      {selectedUser.name?.charAt(0).toUpperCase() || 'V'}
                    </div>
                    <div>
                      <h2 style={{ margin: '0 0 0.25rem 0' }}>{selectedUser.name}</h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {getRoleBadge(selectedUser.role)}
                        {getStatusBadge(selectedUser.status, selectedUser.isDeleted)}
                        {selectedUser.volunteerId && (
                          <span style={{ fontSize: '0.85rem', color: 'var(--color-body)' }}>ID: {selectedUser.volunteerId}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Profile Details Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    
                    <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-body)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Mail size={14} /> Email Address
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--color-heading)' }}>{selectedUser.email || 'N/A'}</div>
                    </div>

                    <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-body)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Phone size={14} /> Phone Number
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--color-heading)' }}>{selectedUser.phone || 'Not provided'}</div>
                    </div>

                    <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-body)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={14} /> Location
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--color-heading)' }}>
                        {selectedUser.city || selectedUser.state ? `${selectedUser.city || ''}, ${selectedUser.state || ''}` : 'Location N/A'}
                      </div>
                    </div>

                    <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-body)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={14} /> Member Since
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--color-heading)' }}>
                        {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </div>
                    </div>

                  </div>

                  {/* Skills / Bio / Extra */}
                  {selectedUser.skills && selectedUser.skills.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>Skills & Expertise</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {selectedUser.skills.map((skill, idx) => (
                          <span key={idx} style={{ padding: '0.3rem 0.75rem', borderRadius: '99px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 500 }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Role Change Action */}
                  <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>Assign Administrative Role</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-body)' }}>Update system access level for this user.</div>
                    </div>
                    <select
                      value={(selectedUser.role || 'volunteer').toLowerCase()}
                      onChange={(e) => {
                        handleRoleChange(selectedUser._id, e.target.value);
                        setSelectedUser(prev => ({ ...prev, role: e.target.value }));
                      }}
                      className="form-control"
                      style={{ width: 'auto' }}
                    >
                      <option value="volunteer">Volunteer</option>
                      <option value="coordinator">Coordinator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminVolunteers;
