import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { getLocalProfile, getUserEmail, saveProfileLocally } from '../utils/auth';
import { AuthInput } from '../components/AuthFormStyles';
import { Activity, CalendarDays, Eye, Save, UserCircle2, Code2, GitBranch } from 'lucide-react';

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

const Profile = () => {
  const email = getUserEmail();
  const stored = getLocalProfile();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [profile, setProfile] = useState({
    leetcode_username: stored?.leetcode_username || '',
    codechef_username: stored?.codechef_username || '',
    codeforces_username: stored?.codeforces_username || '',
    gfg_username: stored?.gfg_username || '',
    github_username: stored?.github_username || '',
  });
  const [stats, setStats] = useState({ contests: 0, watched: 0, loading: true });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [contestRes, usersRes] = await Promise.allSettled([
          api.getContests('all'),
          api.getRegisteredUsers(),
        ]);
        setStats({
          contests: contestRes.status === 'fulfilled' ? (contestRes.value?.contests?.length || 0) : 0,
          watched: usersRes.status === 'fulfilled' ? (usersRes.value?.users?.length || 0) : 0,
          loading: false,
        });
      } catch {
        setStats({ contests: 0, watched: 0, loading: false });
      }
    };
    loadStats();
  }, []);

  const displayName = email ? email.split('@')[0] : 'Developer';
  const initial = email ? email.charAt(0).toUpperCase() : 'D';

  const handleChange = (field, value) => {
    let cleanValue = value.trim();
    // Auto-extract username if a full URL is pasted (e.g. https://github.com/Soham271 -> Soham271)
    if (cleanValue.includes('/') && (field.includes('username') || field.includes('handle'))) {
      cleanValue = cleanValue.split('/').filter(Boolean).pop();
    }
    setProfile((prev) => ({ ...prev, [field]: cleanValue }));
    setStatus(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    const payload = {
      leetcode_username: profile.leetcode_username.trim(),
      codechef_username: profile.codechef_username.trim(),
      codeforces_username: profile.codeforces_username.trim(),
      gfg_username: profile.gfg_username.trim(),
      github_username: profile.github_username.trim(),
    };
    try {
      await api.saveProfile(payload);
      saveProfileLocally(payload);
      setProfile(payload);
      setStatus({ type: 'ok', message: 'Profile updated successfully.' });
    } catch (err) {
      setStatus({ type: 'err', message: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-5 animate-fade-in-up">
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg">
              {initial}
            </div>
            <div>
              <span className="flex items-center gap-1 text-xs font-bold text-brand-500 uppercase tracking-wider">
                <UserCircle2 size={12} /> Profile
              </span>
              <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
              <p className="text-sm text-gray-500">{email || 'No email available'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
            <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 min-w-[140px]">
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Live Contests</p>
              <p className="text-xl font-bold text-gray-900">{stats.loading ? '...' : stats.contests}</p>
            </div>
            <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 min-w-[140px]">
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Watched Handles</p>
              <p className="text-xl font-bold text-gray-900">{stats.loading ? '...' : stats.watched}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-900">Connected Handles</h2>
          <p className="text-sm text-gray-500 mt-1">Update your coding platform usernames here.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">LeetCode</label>
            <AuthInput
              type="text"
              value={profile.leetcode_username}
              onChange={(e) => handleChange('leetcode_username', e.target.value)}
              placeholder="e.g. neetcode"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">CodeChef Username</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Code2 size={18} className="text-gray-400 group-focus-within:text-brand-500 transition-colors" />
              </div>
              <input
                type="text"
                value={profile.codechef_username}
                onChange={(e) => handleChange('codechef_username', e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm font-medium"
                placeholder="e.g. tourist"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Codeforces</label>
            <AuthInput
              type="text"
              value={profile.codeforces_username}
              onChange={(e) => handleChange('codeforces_username', e.target.value)}
              placeholder="e.g. benq"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">GitHub Username</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <GithubIcon size={18} className="text-gray-400 group-focus-within:text-brand-500 transition-colors" />
              </div>
              <input
                type="text"
                value={profile.github_username}
                onChange={(e) => handleChange('github_username', e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm font-medium"
                placeholder="e.g. torvalds"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">GeeksForGeeks</label>
            <AuthInput
              type="text"
              value={profile.gfg_username}
              onChange={(e) => handleChange('gfg_username', e.target.value)}
              placeholder="e.g. gfg_user"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-60 transition-all"
          >
            {saving ? <Activity size={15} className="icon-spin" /> : <Save size={15} />}
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>

        {status && (
          <div className={`mt-4 p-3 rounded-xl text-sm text-center ${status.type === 'ok' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>
            {status.message}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/contests" className="no-underline p-4 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-2 text-brand-600 text-xs font-bold uppercase tracking-wide">
            <CalendarDays size={13} /> Live Contest Page
          </div>
          <p className="text-gray-900 font-semibold mt-1">Open all contest countdowns</p>
          <p className="text-sm text-gray-500">Go to the dedicated contests page.</p>
        </Link>
        <Link to="/dashboard" className="no-underline p-4 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wide">
            <Eye size={13} /> Dashboard
          </div>
          <p className="text-gray-900 font-semibold mt-1">Back to analysis and monitoring</p>
          <p className="text-sm text-gray-500">Continue with your daily workflow.</p>
        </Link>
      </section>
    </div>
  );
};

export default Profile;
