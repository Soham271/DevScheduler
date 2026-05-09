import React, { useState } from 'react';
import { Activity, Filter, Radio, Trash2, Trophy, Bell, Zap, Mail, Bot, ChevronDown, Sparkles, GitBranch } from 'lucide-react';

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
import ActivityItem from './ActivityItem';
import { useActivityFeed } from '../hooks/useActivityFeed';

/**
 * ActivityFeed — The main live activity feed panel.
 * 
 * Features:
 *  - Real-time SSE updates (new items slide in from top)
 *  - Filter tabs: All, Contests, Reminders, Productivity, Email, GitHub
 *  - Unread count badge
 *  - Clear All button
 *  - Load More pagination
 *  - Empty state
 */

const filters = [
  { key: 'all', label: 'All', icon: Radio },
  { key: 'contest', label: 'Contests', icon: Trophy },
  { key: 'github', label: 'GitHub', icon: GithubIcon },
  { key: 'reminder', label: 'Reminders', icon: Bell },
  { key: 'productivity', label: 'Productivity', icon: Zap },
  { key: 'email', label: 'Email', icon: Mail },
];

const ActivityFeed = () => {
  const {
    activities,
    unreadCount,
    loading,
    loadingMore,
    hasMore,
    markAsRead,
    clearAll,
    loadMore,
  } = useActivityFeed(30);

  const [activeFilter, setActiveFilter] = useState('all');

  // Filter activities by type
  const filtered = activeFilter === 'all'
    ? activities
    : activities.filter(a => a.type === activeFilter);

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-bold text-brand-500 uppercase tracking-wider">
            <Sparkles size={12} /> Live Feed
          </span>
          <h2 className="text-lg font-bold text-gray-900">Activity Feed</h2>
          {unreadCount > 0 && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 20,
                height: 20,
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '0 0.4rem',
                boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
              }}
            >
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 6px #10b981',
                animation: 'healthPulse 2s ease-in-out infinite',
              }}
            />
            <span className="text-xs font-semibold text-emerald-600">Live</span>
          </div>
          {activities.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 border border-gray-200 transition"
            >
              <Trash2 size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-4 overflow-x-auto">
        {filters.map(f => {
          const Icon = f.icon;
          const count = f.key === 'all'
            ? activities.length
            : activities.filter(a => a.type === f.key).length;
          return (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition whitespace-nowrap ${activeFilter === f.key
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <Icon size={13} />
              {f.label}
              {count > 0 && (
                <span className="text-gray-400 font-normal">({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Feed Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 480, overflowY: 'auto' }}>
        {loading ? (
          <div className="flex items-center justify-center py-10 gap-2">
            <Activity size={16} className="icon-spin text-brand-400" />
            <span className="text-sm text-gray-500">Loading feed...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center gap-4 p-5 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50">
            <Radio size={20} className="text-brand-400 shrink-0" />
            <div>
              <strong className="text-sm text-gray-700 block">No activity yet</strong>
              <p className="text-xs text-gray-500 mt-0.5">
                Events will appear here in real time as the system processes jobs, sends reminders, and tracks your coding progress.
              </p>
            </div>
          </div>
        ) : (
          filtered.map(activity => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              onMarkRead={markAsRead}
            />
          ))
        )}
      </div>

      {/* Load More */}
      {hasMore && filtered.length > 0 && !loading && (
        <div className="flex justify-center mt-4">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50 shadow-sm"
          >
            {loadingMore ? (
              <Activity size={14} className="icon-spin" />
            ) : (
              <ChevronDown size={14} />
            )}
            {loadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </section>
  );
};

export default ActivityFeed;
