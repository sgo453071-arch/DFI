/**
 * AnnouncementCard.jsx  —  Communication-Center card
 *
 * Features:
 *  • 📌 Pinned yellow banner when isPinned === true
 *  • Unread blue dot when isRead === false
 *  • Category/type badge with emoji
 *  • Priority-coloured left border
 *  • Expiry countdown badge when expiry ≤ 7 days away
 *  • Attachment chips (PDF / image / link)
 *  • Optional CTA actionButton
 *  • Clean publish-date footer
 *  • Admin pin/unpin/publish/archive/delete actions behind showActions prop
 */

import React, { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Pin, Paperclip, ExternalLink, Clock,
  Calendar, Tag, AlertTriangle,
} from 'lucide-react';

/* ─── config ─────────────────────────────────────────────────────────────── */

const TYPE_CONFIG = {
  general:     { emoji: '📢', label: 'General',          bg: '#F8FAFC', color: '#475569' },
  program:     { emoji: '📅', label: 'Programs',         bg: '#FDF2F8', color: '#DB2777' },
  emergency:   { emoji: '🚨', label: 'Emergency',        bg: '#FEF2F2', color: '#DC2626' },
  maintenance: { emoji: '🔧', label: 'Maintenance',      bg: '#EFF6FF', color: '#2563EB' },
  event:       { emoji: '🎉', label: 'Events',           bg: '#FEF3C7', color: '#D97706' },
  recruitment: { emoji: '🤝', label: 'Opportunities',    bg: '#F0FDF4', color: '#16A34A' },
  system:      { emoji: '⚙️', label: 'Platform Updates', bg: '#F1F5F9', color: '#64748B' },
};

const PRIORITY_BORDER = {
  low:      '#94A3B8',
  medium:   '#F59E0B',
  high:     'var(--primary-blue)',
  critical: '#EF4444',
};

/* ─── helpers ────────────────────────────────────────────────────────────── */

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function daysUntil(d) {
  if (!d) return null;
  return Math.ceil((new Date(d) - Date.now()) / 86_400_000);
}

function attachmentEmoji(att) {
  const url = (att.url || '').toLowerCase();
  if (url.endsWith('.pdf') || att.type === 'pdf')   return '📄';
  if (/\.(png|jpg|jpeg|gif|webp|svg)$/.test(url) || att.type === 'image') return '🖼️';
  return '🔗';
}

/* ─── component ──────────────────────────────────────────────────────────── */

const AnnouncementCard = React.memo(({
  announcement,
  onClick,
  onMarkRead,
  /* admin-only — hidden unless showActions=true */
  showActions = false,
  onArchive,
  onPublish,
  onDelete,
  onPin,
  onUnpin,
}) => {
  const id         = announcement._id || announcement.announcementId;
  const typeConf   = useMemo(() => TYPE_CONFIG[announcement.type]  || TYPE_CONFIG.general, [announcement.type]);
  const border     = PRIORITY_BORDER[announcement.priority] || PRIORITY_BORDER.medium;
  const isPinned   = Boolean(announcement.isPinned);
  const isRead     = Boolean(announcement.isRead);
  const isCritical = announcement.priority === 'critical';

  const expiryDays = useMemo(() => daysUntil(announcement.expiresAt), [announcement.expiresAt]);
  const showExpiry = expiryDays !== null && expiryDays >= 0 && expiryDays <= 7;

  const handleClick = useCallback(() => {
    if (!isRead && onMarkRead) onMarkRead(id);
    onClick?.();
  }, [isRead, onMarkRead, id, onClick]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); }
  }, [handleClick]);

  return (
    <motion.div
      role="article"
      aria-label={`${isPinned ? 'Pinned: ' : ''}${announcement.title}${!isRead ? ' (unread)' : ''}`}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, boxShadow: '0 10px 28px rgba(0,0,0,0.09)' }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 16,
        backgroundColor: isPinned ? '#FFFDF5' : 'var(--color-card)',
        borderLeft: `4px solid ${border}`,
        border: `1px solid ${isPinned ? '#FDE68A' : 'var(--color-border)'}`,
        overflow: 'hidden',
        cursor: 'pointer',
        outline: 'none',
      }}
      onFocus={(e)  => { e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-primary)'; }}
      onBlur={(e)   => { e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* ── Pinned banner ────────────────────────────────────────── */}
      {isPinned && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.35rem 1rem',
          background: '#FEF3C7', borderBottom: '1px solid #FDE68A',
          fontSize: '0.7rem', fontWeight: 700, color: '#92400E',
        }}>
          <Pin size={11} aria-hidden="true" />
          Pinned Announcement
        </div>
      )}

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div style={{
        padding: '1.125rem 1.125rem 0.875rem',
        display: 'flex', flexDirection: 'column', gap: '0.7rem', flex: 1,
      }}>

        {/* Badges row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {/* Category */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.22rem 0.6rem', borderRadius: 999,
            background: typeConf.bg, color: typeConf.color,
            fontSize: '0.7rem', fontWeight: 700,
          }}>
            <Tag size={10} aria-hidden="true" />
            {typeConf.emoji} {typeConf.label}
          </span>

          {/* Urgent */}
          {isCritical && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
              padding: '0.22rem 0.6rem', borderRadius: 999,
              background: '#FEF2F2', color: '#DC2626',
              fontSize: '0.7rem', fontWeight: 700,
            }}>
              <AlertTriangle size={10} aria-hidden="true" /> Urgent
            </span>
          )}

          {/* Expiry countdown */}
          {showExpiry && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
              padding: '0.22rem 0.6rem', borderRadius: 999,
              background: '#FFF7ED', color: '#C2410C',
              fontSize: '0.7rem', fontWeight: 700,
            }}>
              <Clock size={10} aria-hidden="true" />
              {expiryDays === 0 ? 'Expires today' : `Expires in ${expiryDays}d`}
            </span>
          )}

          {/* Unread dot — pushed to the right */}
          {!isRead && (
            <span
              aria-label="Unread"
              style={{
                marginLeft: 'auto', flexShrink: 0,
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--color-primary)',
              }}
            />
          )}
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '0.98rem', fontWeight: 700,
          color: 'var(--color-heading)', margin: 0, lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {announcement.title}
        </h3>

        {/* Message excerpt */}
        <p style={{
          fontSize: '0.85rem', color: 'var(--color-body)',
          margin: 0, lineHeight: 1.65, flex: 1,
          display: '-webkit-box', WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {announcement.message}
        </p>

        {/* Attachments */}
        {announcement.attachments?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {announcement.attachments.map((att, i) => (
              <a
                key={i}
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  padding: '0.18rem 0.55rem', borderRadius: 999,
                  background: '#F1F5F9', color: '#475569',
                  fontSize: '0.68rem', fontWeight: 600,
                  textDecoration: 'none', border: '1px solid #E2E8F0',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#E2E8F0'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#F1F5F9'; }}
              >
                <Paperclip size={9} aria-hidden="true" />
                {att.name || 'Attachment'} {attachmentEmoji(att)}
              </a>
            ))}
          </div>
        )}

        {/* Action button (CTA) */}
        {announcement.actionButton?.label && announcement.actionButton?.url && (
          <div>
            <a
              href={announcement.actionButton.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.48rem 1rem', borderRadius: 8,
                background: 'var(--color-primary)', color: 'white',
                fontSize: '0.8rem', fontWeight: 700,
                textDecoration: 'none', transition: 'opacity 0.18s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              {announcement.actionButton.label}
              <ExternalLink size={12} aria-hidden="true" />
            </a>
          </div>
        )}
      </div>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.6rem 1.125rem',
        borderTop: '1px solid var(--color-border)',
        fontSize: '0.7rem', color: '#94A3B8', gap: '0.5rem', flexWrap: 'wrap',
      }}>
        <time
          dateTime={announcement.publishedAt || announcement.createdAt}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
        >
          <Calendar size={10} aria-hidden="true" />
          {formatDate(announcement.publishedAt || announcement.createdAt)}
        </time>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)', fontWeight: 600 }}>
          Read more <ExternalLink size={10} aria-hidden="true" />
        </span>
      </div>

      {/* ── Admin actions (showActions=true only) ─────────────────── */}
      {showActions && (
        <div style={{
          display: 'flex', gap: '0.5rem', padding: '0.7rem 1.125rem',
          borderTop: '1px solid var(--color-border)', flexWrap: 'wrap',
          background: 'var(--color-bg)',
        }}>
          {!isPinned
            ? (
              <button
                onClick={(e) => { e.stopPropagation(); onPin?.(id); }}
                className="btn btn-secondary"
                style={{ padding: '0.32rem 0.7rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Pin size={12} /> Pin
              </button>
            )
            : (
              <button
                onClick={(e) => { e.stopPropagation(); onUnpin?.(id); }}
                className="btn btn-secondary"
                style={{ padding: '0.32rem 0.7rem', fontSize: '0.75rem' }}
              >
                Unpin
              </button>
            )
          }
          {announcement.status !== 'published' && (
            <button
              onClick={(e) => { e.stopPropagation(); onPublish?.(id); }}
              className="btn btn-primary"
              style={{ padding: '0.32rem 0.7rem', fontSize: '0.75rem' }}
            >
              Publish
            </button>
          )}
          {announcement.status !== 'archived' && (
            <button
              onClick={(e) => { e.stopPropagation(); onArchive?.(id); }}
              className="btn btn-secondary"
              style={{ padding: '0.32rem 0.7rem', fontSize: '0.75rem' }}
            >
              Archive
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(id); }}
            className="btn btn-danger"
            style={{ padding: '0.32rem 0.7rem', fontSize: '0.75rem' }}
          >
            Delete
          </button>
        </div>
      )}
    </motion.div>
  );
});

AnnouncementCard.displayName = 'AnnouncementCard';
export default AnnouncementCard;
