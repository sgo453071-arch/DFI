import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Shield, RefreshCw, AlertCircle } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAnnouncements, deleteAnnouncement, archiveAnnouncement, publishAnnouncement } from '../../services/announcementsService';
import AnnouncementCard from '../../components/announcements/AnnouncementCard';
import AnnouncementFilters from '../../components/announcements/AnnouncementFilters';
import AnnouncementSkeleton from '../../components/announcements/AnnouncementSkeleton';
import AnnouncementEmptyState from '../../components/announcements/AnnouncementEmptyState';
import AnnouncementPagination from '../../components/announcements/AnnouncementPagination';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/admin/ConfirmModal';

const PAGE_SIZE = 9;

const AdminAnnouncementDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const params = useMemo(() => {
    const p = { page, limit: PAGE_SIZE, sortBy: 'createdAt', order: 'desc' };
    if (search) p.search = search;
    if (type) p.type = type;
    if (priority) p.priority = priority;
    if (status) p.status = status;
    return p;
  }, [page, search, type, priority, status]);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-announcements', params],
    queryFn: async () => {
      setError(null);
      const res = await getAnnouncements(params);
      if (res.success) {
        return { announcements: res.data?.announcements || [], total: res.data?.pagination?.total || 0, page: res.data?.pagination?.page || 1, totalPages: res.data?.pagination?.totalPages || 1 };
      }
      throw new Error(res.message || 'Failed to load announcements');
    },
    staleTime: 0,               // always fetch fresh — admin edits data directly
    refetchOnWindowFocus: true, // catch changes made in other tabs
  });

  const announcements = data?.announcements || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      const res = await deleteAnnouncement(confirmDelete);
      if (res.success) {
        toast.success('Announcement deleted successfully');
        setConfirmDelete(null);
        queryClient.invalidateQueries(['admin-announcements']);
        queryClient.invalidateQueries(['announcements']);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete announcement');
    } finally {
      setDeleting(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      const res = await publishAnnouncement(id);
      if (res.success) { toast.success('Announcement published'); queryClient.invalidateQueries(['admin-announcements']); }
    } catch (err) { toast.error(err.message || 'Failed to publish'); }
  };

  const handleArchive = async (id) => {
    try {
      const res = await archiveAnnouncement(id);
      if (res.success) { toast.success('Announcement archived'); queryClient.invalidateQueries(['admin-announcements']); }
    } catch (err) { toast.error(err.message || 'Failed to archive'); }
  };

  const handleClearFilters = () => {
    setSearch('');
    setType('');
    setPriority('');
    setStatus('');
  };

  return (
    <div style={{ padding: 'clamp(1rem, 3vw, 2rem)', maxWidth: 1240, margin: '0 auto', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Shield size={20} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Admin Panel</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, color: 'var(--color-heading)', margin: '0 0 0.35rem' }}>Announcement Management</h1>
          <p style={{ color: 'var(--color-body)', margin: 0, fontSize: '0.9rem' }}>Create, publish, and manage all platform announcements.</p>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/admin/announcements/create')}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} aria-hidden="true" /> Create Announcement
        </motion.button>
      </div>

      <AnnouncementFilters search={search} onSearchChange={setSearch} type={type} onTypeChange={setType} priority={priority} onPriorityChange={setPriority} status={status} onStatusChange={setStatus} showAdminFilters={true} onClear={handleClearFilters} />

      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '1rem 1.25rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: 'var(--color-error)', marginBottom: '1.5rem' }} role="alert">
          <AlertCircle size={18} aria-hidden="true" /> {error}
        </motion.div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => refetch()} disabled={isFetching} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }} aria-label="Refresh announcements">
          <RefreshCw size={16} style={isFetching ? { animation: 'spin 1s linear infinite' } : {}} aria-hidden="true" /> Refresh
        </motion.button>
      </div>

      {isLoading ? (
        <AnnouncementSkeleton count={PAGE_SIZE} />
      ) : announcements.length === 0 ? (
        <AnnouncementEmptyState title="No announcements found" description="Create your first announcement to broadcast important updates to your users." onAction={() => navigate('/admin/announcements/create')} actionLabel="Create Announcement" />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {announcements.map((announcement) => (
              <AnnouncementCard key={announcement._id || announcement.announcementId} announcement={announcement} onClick={() => navigate(`/announcements/${announcement._id || announcement.announcementId}`)} onPublish={handlePublish} onArchive={handleArchive} onDelete={(id) => setConfirmDelete(id)} />
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--color-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <AnnouncementPagination currentPage={page} totalPages={totalPages} totalItems={total} itemsPerPage={PAGE_SIZE} onPageChange={(newPage) => { setPage(newPage); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
            </div>
          )}
        </>
      )}

      <ConfirmModal isOpen={Boolean(confirmDelete)} title="Delete Announcement" message="Are you sure you want to permanently delete this announcement? This action cannot be undone." onCancel={() => setConfirmDelete(null)} onConfirm={handleDelete} loading={deleting} />
    </div>
  );
};

export default AdminAnnouncementDashboard;
