import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Zap, ExternalLink, RefreshCw, ArrowLeft, Trophy,
  Globe, Clock, Search, Filter, AlertCircle, Plus, X
} from 'lucide-react';

const platformMeta = {
  devpost:     { label: 'Devpost',      color: 'text-indigo-600',  bg: 'bg-indigo-50',   border: 'border-indigo-200', dot: 'bg-indigo-500',  fallbackUrl: 'https://devpost.com/hackathons' },
  hackerearth: { label: 'HackerEarth', color: 'text-purple-600',  bg: 'bg-purple-50',   border: 'border-purple-200', dot: 'bg-purple-500',  fallbackUrl: 'https://www.hackerearth.com/challenges/' },
  unstop:      { label: 'Unstop',       color: 'text-orange-600',  bg: 'bg-orange-50',   border: 'border-orange-200', dot: 'bg-orange-500',  fallbackUrl: 'https://unstop.com/hackathons' },
  devfolio:    { label: 'Devfolio',     color: 'text-blue-600',    bg: 'bg-blue-50',     border: 'border-blue-200',   dot: 'bg-blue-500',    fallbackUrl: 'https://devfolio.co/hackathons' },
  local:       { label: 'Local',        color: 'text-emerald-600', bg: 'bg-emerald-50',  border: 'border-emerald-200', dot: 'bg-emerald-500', fallbackUrl: '#' },
};

const statusStyle = {
  'Open now':    { cls: 'bg-emerald-100 text-emerald-700', icon: '🟢' },
  'Coming soon': { cls: 'bg-amber-100 text-amber-700',     icon: '🟡' },
  'Ongoing':     { cls: 'bg-blue-100 text-blue-700',       icon: '🔵' },
  'Check site':  { cls: 'bg-gray-100 text-gray-600',       icon: '⚪' },
};

const HackathonCard = ({ hackathon }) => {
  const meta = platformMeta[hackathon.platform] || {
    label: hackathon.platform, color: 'text-gray-600', bg: 'bg-gray-50',
    border: 'border-gray-200', dot: 'bg-gray-400', fallbackUrl: '#',
  };
  const url = hackathon.url || meta.fallbackUrl;
  const status = statusStyle[hackathon.time_remaining] || statusStyle['Check site'];

  return (
    <div className={`group bg-white rounded-2xl border ${meta.border} shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden`}>
      <div className={`h-1 w-full ${meta.dot}`} />
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${meta.color}`}>
            <Zap size={12} /> {meta.label}
          </div>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${status.cls}`}>
            {status.icon} {hackathon.time_remaining}
          </span>
        </div>
        <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-indigo-700 transition-colors">
          {hackathon.name}
        </h3>
        {hackathon.scheduled_at && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
            <Clock size={11} />
            <span className="line-clamp-1">{hackathon.scheduled_at}</span>
          </div>
        )}
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg ${meta.bg} ${meta.color} hover:opacity-80 transition-opacity no-underline`}
        >
          <ExternalLink size={11} /> View Hackathon
        </a>
      </div>
    </div>
  );
};

const SubmitModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    platform: 'unstop',
    url: '',
    scheduled_at: '',
    end_date: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Basic validation
      if (!formData.name || !formData.url || !formData.scheduled_at || !formData.end_date) {
        throw new Error('All fields are required.');
      }
      
      // End date must be a valid ISO string. The input type="datetime-local" gives "YYYY-MM-DDTHH:mm"
      // We append ":00Z" to make it valid for the backend parser (or we could use a library, but this works for basic needs)
      const formattedEndDate = new Date(formData.end_date).toISOString();

      await api.submitHackathon({
        ...formData,
        end_date: formattedEndDate
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit hackathon');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Plus size={18} className="text-indigo-600" /> Submit Hackathon
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">{error}</div>}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Event Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., HackHarvard 2024"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Platform</label>
            <select
              value={formData.platform}
              onChange={e => setFormData({...formData, platform: e.target.value})}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm bg-white"
            >
              <option value="unstop">Unstop</option>
              <option value="devfolio">Devfolio</option>
              <option value="local">Local / College Event</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Event URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={e => setFormData({...formData, url: e.target.value})}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Display Date/Time</label>
            <input
              type="text"
              value={formData.scheduled_at}
              onChange={e => setFormData({...formData, scheduled_at: e.target.value})}
              placeholder="e.g., Oct 20 - Oct 22"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">End Date (to remove from list)</label>
            <input
              type="datetime-local"
              value={formData.end_date}
              onChange={e => setFormData({...formData, end_date: e.target.value})}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
            />
          </div>

          <div className="pt-2 mt-2 border-t border-gray-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
              {submitting ? 'Submitting...' : 'Submit Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Hackathons = () => {
  const [all, setAll] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activePlatform, setActivePlatform] = useState('all');
  const [heKeyMissing, setHEKeyMissing] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const loadHackathons = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    const [devpostRes, heRes, unstopRes, devfolioRes, localRes] = await Promise.allSettled([
      api.getContests('devpost'),
      api.getContests('hackerearth'),
      api.getContests('unstop'),
      api.getContests('devfolio'),
      api.getContests('local'),
    ]);

    const items = [];
    if (devpostRes.status === 'fulfilled') items.push(...(devpostRes.value?.contests || []));
    
    if (heRes.status === 'fulfilled') {
      const heItems = heRes.value?.contests || [];
      if (heItems.length === 0) setHEKeyMissing(true);
      items.push(...heItems);
    }

    if (unstopRes.status === 'fulfilled') items.push(...(unstopRes.value?.contests || []));
    if (devfolioRes.status === 'fulfilled') items.push(...(devfolioRes.value?.contests || []));
    if (localRes.status === 'fulfilled') items.push(...(localRes.value?.contests || []));

    setAll(items);
    setFiltered(items);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadHackathons(); }, [loadHackathons]);

  useEffect(() => {
    let result = all;
    if (activePlatform !== 'all') result = result.filter(h => h.platform === activePlatform);
    if (search.trim()) result = result.filter(h => h.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [search, activePlatform, all]);

  const activePlatforms = ['all', ...new Set(all.map(h => h.platform))];
  const platformLabel = { all: 'All', devpost: 'Devpost', hackerearth: 'HackerEarth', unstop: 'Unstop', devfolio: 'Devfolio', local: 'Local' };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 animate-fade-in-up">

      <SubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={() => loadHackathons(true)}
      />

      {/* Header */}
      <section className="bg-[var(--color-canvas-white)] rounded-[12px] border border-[var(--color-ash-gray)] shadow-[var(--shadow-subtle-3)] p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <span className="flex items-center gap-1 text-xs font-bold text-[var(--color-charcoal)] uppercase tracking-wider">
              <Zap size={12} /> Hackathon Hub
            </span>
            <h1 className="text-2xl font-bold text-[var(--color-charcoal)] mt-1">Live Hackathons</h1>
            <p className="text-sm text-[var(--color-cool-gray)] mt-1">
              Browse open &amp; upcoming hackathons. Community sourced and auto-updated.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Link to="/dashboard" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] border border-[var(--color-ash-gray)] bg-[var(--color-canvas-white)] text-sm font-medium text-[var(--color-charcoal)] hover:bg-[var(--color-buttermilk)] transition-colors no-underline">
              <ArrowLeft size={15} /> Back
            </Link>
            <button type="button" onClick={() => loadHackathons(true)} disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] border border-[var(--color-ash-gray)] bg-[var(--color-canvas-white)] text-sm font-medium text-[var(--color-charcoal)] hover:bg-[var(--color-buttermilk)] transition-colors disabled:opacity-60">
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} /> Refresh
            </button>
            <button type="button" onClick={() => setIsSubmitModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] bg-indigo-600 border border-indigo-700 text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm">
              <Plus size={15} /> Add Hackathon
            </button>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mt-5">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search hackathons..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-[10px] border border-[var(--color-ash-gray)] bg-white outline-none focus:border-indigo-400 transition-colors" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-gray-400 shrink-0" />
            {activePlatforms.map(p => (
              <button key={p} type="button" onClick={() => setActivePlatform(p)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                  activePlatform === p ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                }`}>
                {platformLabel[p] || p}
              </button>
            ))}
          </div>
        </div>
      </section>



      {/* Stats */}
      {!loading && all.length > 0 && (
        <div className="flex items-center gap-4 px-1">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Globe size={14} />
            <span><strong className="text-gray-900">{filtered.length}</strong> hackathon{filtered.length !== 1 ? 's' : ''} found</span>
          </div>
          <span className="text-xs text-emerald-600 font-medium">🟢 {all.filter(h => h.time_remaining === 'Open now' || h.time_remaining === 'Ongoing').length} open/ongoing</span>
          <span className="text-xs text-amber-600 font-medium">🟡 {all.filter(h => h.time_remaining === 'Coming soon').length} upcoming</span>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((h, i) => (
            <HackathonCard key={`${h.platform}-${h.name}-${i}`} hackathon={h} />
          ))}
        </section>
      ) : (
        <div className="bg-white rounded-[12px] border border-[var(--color-ash-gray)] p-10 text-center">
          <Trophy size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm font-medium">No hackathons found</p>
          <p className="text-gray-400 text-xs mt-1">Try a different filter, refresh, or submit one!</p>
        </div>
      )}
    </div>
  );
};

export default Hackathons;
