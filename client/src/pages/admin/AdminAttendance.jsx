import SimpleLoader from '../../components/common/SimpleLoader';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Shield, Clock, Users, CalendarCheck, Search, Download, Edit2, X } from 'lucide-react';
import { adminGetAttendance, exportAttendance, editAttendance } from "../../services/attendanceService";
import toast from 'react-hot-toast';
import StatusBadge from "../../components/volunteer/StatusBadge";


const AdminAttendance = () => {
  const [stats, setStats] = useState(null);
  const [records, setRecords] = useState([]);
  
  // Filtering & Pagination
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(() => {
    // Default to today in YYYY-MM-DD local format
    const d = new Date();
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // Edit Modal State
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm, setEditForm] = useState({ checkInTime: '', checkOutTime: '', status: '' });

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to page 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset page when date changes
  useEffect(() => {
    setPage(1);
  }, [dateFilter]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        date: dateFilter || undefined,
        search: debouncedSearch || undefined
      };
      const listRes = await adminGetAttendance(params);
      if (listRes.success) {
        setStats(listRes.data?.stats || null);
        setRecords(listRes.data?.records || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [page, debouncedSearch, dateFilter]);

  const formatTime = (isoString) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return isNaN(d.getTime()) ? isoString : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };
  
  const formatDatetimeForInput = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return '';
      // Format as YYYY-MM-DDThh:mm for datetime-local input
      return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  const handleExport = async () => {
    try {
      const params = {
        date: dateFilter || undefined,
        search: debouncedSearch || undefined
      };
      const res = await exportAttendance(params);
      if (res.success && res.data?.length > 0) {
        const data = res.data;
        const headers = Object.keys(data[0]);
        const rows = data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','));
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Admin_Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Export downloaded');
      } else {
        toast.error('No records to export');
      }
    } catch (err) {
      toast.error('Export failed');
    }
  };
  
  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editingRecord) return;
    try {
      const updateData = {
        status: editForm.status,
        checkInTime: editForm.checkInTime ? new Date(editForm.checkInTime).toISOString() : null,
        checkOutTime: editForm.checkOutTime ? new Date(editForm.checkOutTime).toISOString() : null,
      };
      const res = await editAttendance(editingRecord._id, updateData);
      if (res.success) {
        toast.success('Attendance updated');
        setEditingRecord(null);
        fetchRecords();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const [headerActionsEl, setHeaderActionsEl] = useState(null);
  useEffect(() => {
    setTimeout(() => {
      const el = document.getElementById('dashboard-header-actions');
      if (el) setHeaderActionsEl(el);
    }, 0);
  }, []);

  return (
    <div className="page-container" style={{ padding: '0.5rem 0 2rem 0' }}>
      {headerActionsEl && createPortal(
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleExport} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={16} /> Export
          </button>
        </div>,
        headerActionsEl
      )}

      {loading && records.length === 0 ? <SimpleLoader /> : (
        <>
          {stats && (
            <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', borderRadius: '50%' }}><Users size={24} /></div>
                <div><div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{stats.todayPresent ?? 0}</div><div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-body)' }}>Present Today</div></div>
              </div>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', borderRadius: '50%' }}><Users size={24} /></div>
                <div><div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{stats.todayAbsent ?? 0}</div><div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-body)' }}>Absent Today</div></div>
              </div>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-accent)', borderRadius: '50%' }}><Clock size={24} /></div>
                <div><div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{stats.totalHoursToday ?? 0}</div><div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-body)' }}>Hours Logged Today</div></div>
              </div>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--color-primary)', borderRadius: '50%' }}><CalendarCheck size={24} /></div>
                <div><div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{stats.programsRunning ?? 0}</div><div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-body)' }}>Active Programs</div></div>
              </div>
            </div>
          )}

          <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>Check-ins</h3>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <input 
                  type="date" 
                  value={dateFilter} 
                  onChange={(e) => setDateFilter(e.target.value)} 
                  className="form-control"
                />
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-body)' }} />
                  <input
                    type="text"
                    placeholder="Search volunteer or program..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="form-control"
                    style={{ paddingLeft: '2.25rem' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '1rem 1.5rem', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-body)' }}>Volunteer</th>
                    <th style={{ padding: '1rem 1.5rem', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-body)' }}>Program</th>
                    <th style={{ padding: '1rem 1.5rem', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-body)' }}>Check In</th>
                    <th style={{ padding: '1rem 1.5rem', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-body)' }}>Check Out</th>
                    <th style={{ padding: '1rem 1.5rem', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-body)' }}>Status</th>
                    <th style={{ padding: '1rem 1.5rem', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-body)' }}>Hours</th>
                    <th style={{ padding: '1rem 1.5rem', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-body)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length > 0 ? (
                    records.map((record, i) => (
                      <tr key={record._id || i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{record.user?.name || record.volunteerName || 'Volunteer'}</td>
                        <td style={{ padding: '1rem 1.5rem', fontSize: 'var(--text-base)' }}>{record.program?.title || record.programTitle || 'Program'}</td>
                        <td style={{ padding: '1rem 1.5rem', fontSize: 'var(--text-base)', color: 'var(--color-body)' }}>{formatTime(record.checkInTime)}</td>
                        <td style={{ padding: '1rem 1.5rem', fontSize: 'var(--text-base)', color: 'var(--color-body)' }}>{formatTime(record.checkOutTime)}</td>
                        <td style={{ padding: '1rem 1.5rem' }}><StatusBadge status={record.status} /></td>
                        <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-primary)' }}>{record.totalHours ?? record.hoursWorked ?? '-'}</td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <button 
                            className="btn btn-icon"
                            title="Edit Attendance"
                            onClick={() => {
                              setEditingRecord(record);
                              setEditForm({
                                status: record.status || 'present',
                                checkInTime: formatDatetimeForInput(record.checkInTime),
                                checkOutTime: formatDatetimeForInput(record.checkOutTime)
                              });
                            }}
                          >
                            <Edit2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-body)' }}>
                        No check-in records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)' }}>
              <span style={{ color: 'var(--color-body)', fontSize: 'var(--text-sm)' }}>
                Page {page} {loading && '...'}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn btn-secondary" 
                  disabled={page <= 1} 
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </button>
                <button 
                  className="btn btn-secondary" 
                  disabled={records.length < 10} 
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editingRecord && createPortal(
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '1.5rem', position: 'relative' }}>
            <button 
              onClick={() => setEditingRecord(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-body)' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ margin: '0 0 1.5rem 0' }}>Edit Attendance</h3>
            <form onSubmit={handleEditSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Status</label>
                <select 
                  className="form-control"
                  value={editForm.status}
                  onChange={e => setEditForm({...editForm, status: e.target.value})}
                  required
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Check In Time</label>
                <input 
                  type="datetime-local" 
                  className="form-control"
                  value={editForm.checkInTime}
                  onChange={e => setEditForm({...editForm, checkInTime: e.target.value})}
                />
              </div>

              <div>
                <label className="form-label">Check Out Time</label>
                <input 
                  type="datetime-local" 
                  className="form-control"
                  value={editForm.checkOutTime}
                  onChange={e => setEditForm({...editForm, checkOutTime: e.target.value})}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditingRecord(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminAttendance;
