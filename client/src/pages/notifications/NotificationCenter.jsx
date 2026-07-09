import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, ChevronLeft, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationCard from '../../components/notifications/NotificationCard';
import NotificationSkeleton from '../../components/notifications/NotificationSkeleton';
import NotificationEmptyState from '../../components/notifications/NotificationEmptyState';
import NotificationFilters from '../../components/notifications/NotificationFilters';
import {
  getNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../../services/notificationsService';
import { useAuth } from '../../context/AuthContext';

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Newest First', dir: 'desc' },
  { value: 'createdAt', label: 'Oldest First', dir: 'asc' },
];

const NotificationCenter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [readStatus, setReadStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [error, setError] = useState(null);

  const params = useMemo(() => {
    const p = { page: 1, limit: 20, sortBy };
    if (category) p.category = category;
    if (priority) p.priority = priority;
    if (readStatus !== '') p.isRead = readStatus;
    return p;
  }, [category, priority, readStatus, sortBy]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications', { category, priority, readStatus, sortBy, search }],
    queryFn: async () => {
      setError(null);
      const queries = [
        getNotifications(params),
      ];
      const [res] = await Promise.all(queries);
      if (res.success) return res.data?.notifications || [];
      throw new Error(res.message || 'Failed to load notifications');
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    enabled: !!user,
  });

  const notifications = data || [];

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['unread-count']);
    },
  });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['unread-count']);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['unread-count']);
    },
  });

  const handleMarkRead = (id) => markReadMutation.mutate(id);
  const handleMarkAllRead = () => markAllMutation.mutate();
  const handleDelete = (id) => deleteMutation.mutate(id);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setPriority('');
    setReadStatus('');
    setSortBy('createdAt');
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="skeleton" style={{ height: 28, width: 240, borderRadius: 8, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 16, width: 380, borderRadius: 8 }} />
        </div>
        <NotificationSkeleton count={8} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <Link to="/dashboard" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          color: 'var(--color-primary)',
          fontSize: '0.85rem',
          fontWeight: 600,
          textDecoration: 'none',
        }}>
          <ChevronLeft size={18} /> Dashboard
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={24} style={{ color: 'var(--color-primary)' }} />
            Notifications
          </h1>
          <p style={{ color: 'var(--color-body)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'You are all caught up!'}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markAllMutation.isPending}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '0.625rem 1.125rem',
              borderRadius: 10,
              border: 'none',
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              opacity: markAllMutation.isPending ? 0.7 : 1,
            }}
          >
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <NotificationFilters
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          priority={priority}
          onPriorityChange={setPriority}
          readStatus={readStatus}
          onReadStatusChange={setReadStatus}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          onClear={handleClearFilters}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {(category || priority || readStatus || search) && (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-body)' }}>
              Filters active — {notifications.length} result{notifications.length !== 1 ? 's' : ''}
            </span>
          )}
          {error && (
            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertCircle size={14} /> {error}
            </span>
          )}
        </div>

        {!isLoading && notifications.length === 0 && !error && (
          <NotificationEmptyState
            message="No notifications found"
            description="Try adjusting your filters or check back later."
          />
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map((notification) => (
            <NotificationCard
              key={notification._id}
              notification={notification}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
              onClick={() => {
                if (!notification.isRead) handleMarkRead(notification._id);
                if (notification.actionUrl) navigate(notification.actionUrl);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
