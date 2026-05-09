import React from 'react';
import { Trophy, Bell, Zap, Mail, Bot, Radio, Clock, GitBranch } from 'lucide-react';

const GithubIcon = ({ size = 18, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

/**
 * ActivityItem — A single activity card in the live feed.
 * 
 * Features:
 *  - Type-based icon and color coding
 *  - Priority-based left accent border
 *  - Unread pulsing dot indicator
 *  - Relative timestamp
 *  - Click to mark as read
 */

// Map activity type → icon component
const typeIcons = {
  contest: Trophy,
  reminder: Bell,
  productivity: Zap,
  email: Mail,
  ai: Bot,
  system: Radio,
  github: GithubIcon,
};

// Map activity type → icon ring color classes
const typeColors = {
  contest: { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24' },
  reminder: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  productivity: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
  email: { bg: 'rgba(99,102,241,0.12)', color: '#818cf8' },
  ai: { bg: 'rgba(168,85,247,0.12)', color: '#a855f7' },
  system: { bg: 'rgba(107,114,128,0.12)', color: '#6b7280' },
  github: { bg: 'rgba(24,23,23,0.08)', color: '#181717' },
};

// Map priority → left border color
const priorityBorders = {
  info: '#818cf8',
  success: '#10b981',
  warning: '#f59e0b',
  critical: '#ef4444',
};

// Format relative time
function timeAgo(unixTs) {
  const seconds = Math.floor(Date.now() / 1000 - unixTs);
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const ActivityItem = ({ activity, onMarkRead }) => {
  const Icon = typeIcons[activity.type] || Radio;
  const colors = typeColors[activity.type] || typeColors.system;
  const borderColor = priorityBorders[activity.priority] || priorityBorders.info;

  return (
    <div
      onClick={() => !activity.read && onMarkRead?.(activity.id)}
      className={`animate-slide-in-down`}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.85rem',
        padding: '0.9rem 1rem',
        borderRadius: '0.75rem',
        border: '1px solid',
        borderColor: activity.read ? 'rgb(229,231,235)' : 'rgb(199,210,254)',
        borderLeft: `3px solid ${borderColor}`,
        background: activity.read ? 'rgb(249,250,251)' : 'white',
        cursor: activity.read ? 'default' : 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '0.625rem',
          background: colors.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={16} style={{ color: colors.color }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>
            {activity.title}
          </span>
          {!activity.read && (
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#6366f1',
                boxShadow: '0 0 6px #6366f1',
                flexShrink: 0,
                animation: 'healthPulse 2s ease-in-out infinite',
              }}
            />
          )}
        </div>
        <p style={{ fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.45, margin: 0 }}>
          {activity.message}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.35rem' }}>
          <Clock size={11} style={{ color: '#9ca3af' }} />
          <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 500 }}>
            {timeAgo(activity.created_at)}
          </span>
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: colors.color,
              marginLeft: '0.5rem',
              padding: '0.1rem 0.4rem',
              borderRadius: '999px',
              background: colors.bg,
            }}
          >
            {activity.type}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;
