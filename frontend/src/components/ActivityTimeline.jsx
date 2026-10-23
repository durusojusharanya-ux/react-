// src/components/ActivityTimeline.jsx
import { useState, useEffect } from 'react';
import { activitiesAPI } from '../services/api.js';

export default function ActivityTimeline({ refreshTrigger = 0 }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    activitiesAPI
      .getRecent(8)
      .then((res) => {
        if (isMounted) {
          setActivities(res.data?.activities || []);
        }
      })
      .catch(() => {
        // Silently handle if network fails
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  const formatTimestamp = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'created':
        return { icon: '✨', bg: 'var(--success-light)', color: 'var(--success-text)', label: 'Created' };
      case 'status_changed':
        return { icon: '🔄', bg: 'var(--info-light)', color: 'var(--info-text)', label: 'Status' };
      case 'updated':
        return { icon: '✏️', bg: 'var(--warning-light)', color: 'var(--warning-text)', label: 'Updated' };
      case 'deleted':
        return { icon: '🗑️', bg: 'var(--danger-light)', color: 'var(--danger-text)', label: 'Deleted' };
      default:
        return { icon: '📌', bg: 'var(--secondary-light)', color: 'var(--text-secondary)', label: 'Action' };
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-md) 0' }}>
        <div className="skeleton-line" style={{ width: '80%', height: '14px', marginBottom: '12px' }} />
        <div className="skeleton-line" style={{ width: '60%', height: '14px', marginBottom: '12px' }} />
        <div className="skeleton-line" style={{ width: '70%', height: '14px' }} />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="empty-state" style={{ padding: 'var(--space-lg)' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
          No recent activity recorded yet. Tasks you create, update, or delete will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="timeline-container">
      {activities.map((item, idx) => {
        const badge = getActionBadge(item.action);
        return (
          <div key={item.id || idx} className="timeline-item">
            <div
              className="timeline-icon"
              style={{ backgroundColor: badge.bg, color: badge.color }}
              title={badge.label}
            >
              {badge.icon}
            </div>
            <div className="timeline-content">
              <div className="timeline-header">
                <span className="timeline-desc">{item.details}</span>
                <span className="timeline-time">{formatTimestamp(item.createdAt)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
