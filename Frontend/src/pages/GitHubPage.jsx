import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { getLocalProfile } from '../utils/auth';
import {
  Activity, BarChart3, Flame, Trophy,
  Zap, Search, GitBranch, GitPullRequest, GitMerge,
  Star, Users, BookOpen, Code2, ExternalLink,
  ChevronDown, ChevronUp, MapPin, Building2, Globe,
  GitFork, XCircle, CheckCircle2, FolderGit2
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
//  Stats Card
// ═══════════════════════════════════════════════════════════════
const StatCard = ({ label, value, subtitle, color = 'text-[var(--color-charcoal)]', icon: Icon, accentColor = 'text-slate-500' }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="bg-[var(--color-canvas-white)] rounded-[12px] border border-[var(--color-ash-gray)] shadow-[var(--shadow-subtle-3)] p-5 hover:shadow-[var(--shadow-subtle)] transition-shadow group">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-semibold text-[var(--color-cool-gray)] uppercase tracking-wider">{label}</span>
      {Icon && <Icon size={16} className={`text-gray-300 group-hover:${accentColor} transition-colors`} />}
    </div>
    <p className={`text-2xl font-bold ${color} tracking-tight`}>{value}</p>
    {subtitle && <p className="text-xs text-[var(--color-cool-gray)] mt-1">{subtitle}</p>}
  </motion.div>
);

// ═══════════════════════════════════════════════════════════════
//  Contribution Graph (GitHub-style heatmap)
// ═══════════════════════════════════════════════════════════════
const ContributionGraph = ({ contributions, totalContributions }) => {
  const { weeks, months } = useMemo(() => {
    if (!contributions || contributions.length === 0) return { weeks: [], months: [] };

    // Sort by date
    const sorted = [...contributions].sort((a, b) => a.date.localeCompare(b.date));

    // Group into weeks (columns)
    const weekData = [];
    let currentWeek = [];

    sorted.forEach((day, index) => {
      const d = new Date(day.date);
      const dayOfWeek = d.getDay(); // 0=Sun, 6=Sat

      if (index === 0 && dayOfWeek > 0) {
        // Pad the first week
        for (let i = 0; i < dayOfWeek; i++) {
          currentWeek.push(null);
        }
      }

      currentWeek.push(day);

      if (dayOfWeek === 6 || index === sorted.length - 1) {
        weekData.push([...currentWeek]);
        currentWeek = [];
      }
    });

    // Extract month labels
    const monthLabels = [];
    let lastMonth = -1;
    weekData.forEach((week, weekIndex) => {
      const firstDay = week.find(d => d !== null);
      if (firstDay) {
        const month = new Date(firstDay.date).getMonth();
        if (month !== lastMonth) {
          lastMonth = month;
          monthLabels.push({
            index: weekIndex,
            name: new Date(firstDay.date).toLocaleString('default', { month: 'short' })
          });
        }
      }
    });

    return { weeks: weekData, months: monthLabels };
  }, [contributions]);

  const levelColors = [
    'bg-[var(--color-ash-gray)]',       // 0 - no contributions
    'bg-emerald-200',    // 1
    'bg-emerald-400',    // 2
    'bg-emerald-500',    // 3
    'bg-emerald-700',    // 4
  ];

  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  if (weeks.length === 0) return null;

  return (
    <div className="bg-[var(--color-canvas-white)] rounded-[12px] border border-[var(--color-ash-gray)] shadow-[var(--shadow-subtle-3)] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-[var(--color-charcoal)] flex items-center gap-2">
          <Flame size={18} className="text-emerald-500" />
          {totalContributions.toLocaleString()} contributions in the last year
        </h3>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="inline-flex flex-col gap-0.5" style={{ minWidth: 'max-content' }}>
          {/* Month labels */}
          <div className="relative h-4 ml-[30px] mb-1">
            {months.map((m, i) => (
              <div key={i} className="absolute text-[10px] text-[var(--color-cool-gray)] font-medium"
                style={{ left: `${m.index * 13}px` }}>
                {m.name}
              </div>
            ))}
          </div>

          <div className="flex gap-0">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1.5 pt-0.5">
              {dayLabels.map((label, i) => (
                <div key={i} className="text-[10px] text-[var(--color-cool-gray)] font-medium h-[11px] w-6 flex items-center">
                  {label}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex gap-0.5">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-0.5">
                  {week.map((day, dayIdx) => (
                    <div
                      key={dayIdx}
                      className={`w-[11px] h-[11px] rounded-sm ${day ? levelColors[day.level] || levelColors[0] : 'bg-transparent'
                        } transition-all hover:ring-1 hover:ring-gray-400 hover:ring-offset-1 cursor-pointer`}
                      title={day ? `${day.count} contributions on ${day.date}` : ''}
                    />
                  ))}
                  {/* Pad remaining days */}
                  {week.length < 7 && Array(7 - week.length).fill(null).map((_, i) => (
                    <div key={`pad-${i}`} className="w-[11px] h-[11px]" />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-1.5 mt-2">
            <span className="text-[10px] text-[var(--color-cool-gray)] mr-1">Less</span>
            {levelColors.map((c, i) => (
              <div key={i} className={`w-[11px] h-[11px] rounded-sm ${c}`} />
            ))}
            <span className="text-[10px] text-[var(--color-cool-gray)] ml-1">More</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  PR Stats Card
// ═══════════════════════════════════════════════════════════════
const PRStatsCard = ({ openPRs, mergedPRs, closedPRs, totalPRs }) => (
  <div className="bg-[var(--color-canvas-white)] rounded-[12px] border border-[var(--color-ash-gray)] shadow-[var(--shadow-subtle-3)] p-6">
    <h3 className="text-base font-bold text-[var(--color-charcoal)] mb-4 flex items-center gap-2">
      <GitPullRequest size={18} className="text-purple-500" /> Pull Request Activity
    </h3>

    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="text-center p-4 rounded-[12px] bg-purple-50/50 border border-purple-100">
        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center mx-auto mb-2">
          <GitPullRequest size={16} className="text-purple-600" />
        </div>
        <p className="text-2xl font-bold text-purple-600">{totalPRs}</p>
        <p className="text-xs text-[var(--color-cool-gray)] mt-1 font-medium">Total PRs</p>
      </div>

      <div className="text-center p-4 rounded-[12px] bg-green-50/50 border border-green-100">
        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center mx-auto mb-2">
          <CheckCircle2 size={16} className="text-green-600" />
        </div>
        <p className="text-2xl font-bold text-green-600">{openPRs}</p>
        <p className="text-xs text-[var(--color-cool-gray)] mt-1 font-medium">Open</p>
      </div>

      <div className="text-center p-4 rounded-[12px] bg-indigo-50/50 border border-indigo-100">
        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center mx-auto mb-2">
          <GitMerge size={16} className="text-indigo-600" />
        </div>
        <p className="text-2xl font-bold text-indigo-600">{mergedPRs}</p>
        <p className="text-xs text-[var(--color-cool-gray)] mt-1 font-medium">Merged</p>
      </div>

      <div className="text-center p-4 rounded-[12px] bg-red-50/50 border border-red-100">
        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center mx-auto mb-2">
          <XCircle size={16} className="text-red-500" />
        </div>
        <p className="text-2xl font-bold text-red-500">{closedPRs}</p>
        <p className="text-xs text-[var(--color-cool-gray)] mt-1 font-medium">Closed</p>
      </div>
    </div>

    {/* Visual PR bar */}
    {totalPRs > 0 && (
      <div className="mt-4">
        <div className="flex h-2.5 rounded-[16px] overflow-hidden bg-[var(--color-ash-gray)]">
          {mergedPRs > 0 && (
            <div className="bg-indigo-500 transition-all" style={{ width: `${(mergedPRs / totalPRs) * 100}%` }} />
          )}
          {openPRs > 0 && (
            <div className="bg-green-500 transition-all" style={{ width: `${(openPRs / totalPRs) * 100}%` }} />
          )}
          {closedPRs > 0 && (
            <div className="bg-red-400 transition-all" style={{ width: `${(closedPRs / totalPRs) * 100}%` }} />
          )}
        </div>
        <div className="flex items-center justify-center gap-4 mt-2">
          <span className="flex items-center gap-1 text-[10px] text-[var(--color-cool-gray)]">
            <span className="w-2 h-2 rounded-[16px] bg-indigo-500"></span> Merged
          </span>
          <span className="flex items-center gap-1 text-[10px] text-[var(--color-cool-gray)]">
            <span className="w-2 h-2 rounded-[16px] bg-green-500"></span> Open
          </span>
          <span className="flex items-center gap-1 text-[10px] text-[var(--color-cool-gray)]">
            <span className="w-2 h-2 rounded-[16px] bg-red-400"></span> Closed
          </span>
        </div>
      </div>
    )}
  </div>
);

// ═══════════════════════════════════════════════════════════════
//  Repo Card
// ═══════════════════════════════════════════════════════════════
const RepoCard = ({ repo }) => {
  const timeAgo = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  };

  const langColors = {
    JavaScript: 'bg-yellow-400', TypeScript: 'bg-blue-500', Python: 'bg-blue-400',
    Go: 'bg-cyan-400', Java: 'bg-orange-500', 'C++': 'bg-pink-500',
    C: 'bg-[var(--color-buttermilk)]0', Rust: 'bg-orange-600', Ruby: 'bg-red-500',
    HTML: 'bg-orange-400', CSS: 'bg-purple-500', Shell: 'bg-green-500',
    Kotlin: 'bg-violet-500', Swift: 'bg-orange-500', Dart: 'bg-cyan-600',
  };

  return (
    <motion.a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 px-4 py-3.5 rounded-[12px] bg-[var(--color-canvas-white)] border border-[var(--color-ash-gray)] hover:shadow-[var(--shadow-subtle)] hover:border-[var(--color-ash-gray)] transition-all group no-underline cursor-pointer"
    >
      <div className="w-8 h-8 rounded-lg bg-[var(--color-buttermilk)] flex items-center justify-center shrink-0 mt-0.5">
        {repo.is_forked ? <GitFork size={16} className="text-[var(--color-cool-gray)]" /> : <FolderGit2 size={16} className="text-slate-500" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-[var(--color-charcoal)] truncate group-hover:text-blue-600 transition-colors">{repo.name}</p>
          {repo.is_forked && <span className="text-[10px] font-medium text-[var(--color-cool-gray)] px-1.5 py-0.5 rounded bg-[var(--color-buttermilk)] border border-[var(--color-ash-gray)]">Fork</span>}
        </div>
        {repo.description && (
          <p className="text-xs text-[var(--color-cool-gray)] mt-0.5 truncate">{repo.description}</p>
        )}
        <div className="flex items-center gap-3 mt-1.5">
          {repo.language && (
            <span className="flex items-center gap-1 text-[11px] text-[var(--color-cool-gray)]">
              <span className={`w-2.5 h-2.5 rounded-[16px] ${langColors[repo.language] || 'bg-gray-400'}`}></span>
              {repo.language}
            </span>
          )}
          {repo.stars > 0 && (
            <span className="flex items-center gap-0.5 text-[11px] text-[var(--color-cool-gray)]">
              <Star size={11} /> {repo.stars}
            </span>
          )}
          {repo.forks > 0 && (
            <span className="flex items-center gap-0.5 text-[11px] text-[var(--color-cool-gray)]">
              <GitFork size={11} /> {repo.forks}
            </span>
          )}
          <span className="text-[10px] text-[var(--color-cool-gray)]">Updated {timeAgo(repo.updated_at)}</span>
        </div>
      </div>
      <ExternalLink size={14} className="text-gray-300 group-hover:text-blue-400 transition-colors shrink-0 mt-1" />
    </motion.a>
  );
};

// ═══════════════════════════════════════════════════════════════
//  Main GitHub Intelligence Page
// ═══════════════════════════════════════════════════════════════
const GitHubPage = () => {
  const stored = getLocalProfile();
  const [username, setUsername] = useState(stored?.github_username || '');
  const [profile, setProfile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [showAllRepos, setShowAllRepos] = useState(false);
  const [showAllLangs, setShowAllLangs] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.username && location.state?.autoAnalyze) {
      const u = location.state.username;
      setUsername(u);
      const run = async () => {
        setAnalyzing(true); setError(''); setProfile(null);
        try { const data = await api.githubAnalyze(u); setProfile(data.profile); }
        catch (err) { setError(err.message || 'Failed to analyze.'); }
        finally { setAnalyzing(false); }
      };
      if (!profile || profile.username !== u) run();
    }
  }, [location.state]);

  const doAnalyze = async (e) => {
    e.preventDefault();
    const u = username.trim();
    if (!u) { setError('Please enter a GitHub username.'); return; }
    setAnalyzing(true); setError(''); setProfile(null);
    try { const data = await api.githubAnalyze(u); setProfile(data.profile); }
    catch (err) { setError(err.message || 'Failed to analyze.'); }
    finally { setAnalyzing(false); }
  };

  const displayedRepos = showAllRepos ? profile?.recent_repos : profile?.recent_repos?.slice(0, 5);

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-5 animate-fade-in-up">
      {/* Header */}
      <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--color-canvas-white)] rounded-[12px] shadow-[var(--shadow-subtle-3)] border border-[var(--color-ash-gray)] p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-charcoal)]" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[12px] bg-[var(--color-charcoal)] flex items-center justify-center shadow-lg">
            <GitBranch size={22} className="text-[var(--color-canvas-white)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[var(--color-charcoal)]">GitHub Intelligence</h1>
              <span className="px-2 py-0.5 rounded-[16px] text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">Live</span>
            </div>
            <p className="text-sm text-[var(--color-cool-gray)] mt-0.5">Contribution graph, repository analytics, and pull request insights.</p>
          </div>
        </div>
      </motion.header>

      {/* Analyze */}
      <section className="bg-[var(--color-canvas-white)] rounded-[12px] shadow-[var(--shadow-subtle-3)] border border-[var(--color-ash-gray)] p-6">
        <div className="mb-4">
          <span className="flex items-center gap-1 text-xs font-bold text-slate-600 uppercase tracking-wider"><Zap size={12} /> GitHub Analysis</span>
          <h2 className="text-lg font-bold text-[var(--color-charcoal)] mt-0.5">Analyze Profile</h2>
        </div>
        <form onSubmit={doAnalyze} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-center">
          <div className="relative">
            <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-cool-gray)] pointer-events-none" size={17} />
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter GitHub username"
              className="w-full pl-10 pr-4 py-3 rounded-[12px] border border-[var(--color-ash-gray)] bg-[var(--color-buttermilk)] text-[var(--color-charcoal)] text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 transition placeholder:text-[var(--color-cool-gray)]" />
          </div>
          <button type="submit" disabled={analyzing || !username.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-[12px] bg-[var(--color-charcoal)] text-[var(--color-canvas-white)] text-sm font-semibold shadow-[var(--shadow-subtle-3)] hover:shadow-[var(--shadow-subtle)] transition disabled:opacity-50">
            {analyzing ? <><Activity size={15} className="animate-spin" /> Analyzing...</> : <><BarChart3 size={15} /> Analyze</>}
          </button>
        </form>
        {error && <div className="mt-3 p-3 rounded-[12px] bg-red-50 border border-red-200 text-red-600 text-sm text-center">{error}</div>}
        {!profile && !error && !analyzing && (
          <div className="mt-5 flex items-center gap-4 p-5 rounded-[12px] border-2 border-dashed border-[var(--color-ash-gray)] bg-[var(--color-buttermilk)]/50">
            <Search size={20} className="text-slate-400 shrink-0" />
            <div><strong className="text-sm text-[var(--color-charcoal)] block">No analysis yet</strong><p className="text-xs text-[var(--color-cool-gray)] mt-0.5">Enter your GitHub username and hit Analyze.</p></div>
          </div>
        )}
      </section>

      {/* Results */}
      <AnimatePresence>
        {profile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5">

            {/* Profile Banner */}
            <div className="bg-[var(--color-canvas-white)] rounded-[12px] border border-[var(--color-ash-gray)] shadow-[var(--shadow-subtle-3)] p-6">
              <div className="flex items-center gap-5">
                {profile.avatar_url && (
                  <img
                    src={profile.avatar_url}
                    alt={profile.username}
                    className="w-16 h-16 rounded-[12px] border-2 border-[var(--color-ash-gray)] shadow-[var(--shadow-subtle-3)]"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-[var(--color-charcoal)]">{profile.name || profile.username}</h3>
                    <a href={profile.profile_url} target="_blank" rel="noopener noreferrer"
                      className="text-[var(--color-cool-gray)] hover:text-blue-500 transition-colors">
                      <ExternalLink size={14} />
                    </a>
                  </div>
                  <p className="text-sm text-[var(--color-cool-gray)]">@{profile.username}</p>
                  {profile.bio && <p className="text-sm text-[var(--color-slate-blue)] mt-1">{profile.bio}</p>}
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    {profile.location && (
                      <span className="flex items-center gap-1 text-xs text-[var(--color-cool-gray)]">
                        <MapPin size={12} /> {profile.location}
                      </span>
                    )}
                    {profile.company && (
                      <span className="flex items-center gap-1 text-xs text-[var(--color-cool-gray)]">
                        <Building2 size={12} /> {profile.company}
                      </span>
                    )}
                    {profile.blog && (
                      <a href={profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-600 transition-colors no-underline">
                        <Globe size={12} /> {profile.blog}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard icon={FolderGit2} label="Repositories" value={profile.public_repos} subtitle="Public repos" color="text-slate-700" />
              <StatCard icon={Users} label="Followers" value={profile.followers} subtitle={`Following ${profile.following}`} color="text-blue-600" />
              <StatCard icon={Flame} label="Contributions" value={profile.total_contributions?.toLocaleString() || '0'} subtitle="Last year" color="text-emerald-600" />
              <StatCard icon={GitPullRequest} label="Pull Requests" value={profile.total_prs} subtitle={`${profile.merged_prs} merged`} color="text-purple-600" />
            </div>

            {/* Contribution Graph */}
            <ContributionGraph
              contributions={profile.contribution_graph}
              totalContributions={profile.total_contributions || 0}
            />

            {/* PR Stats */}
            <PRStatsCard
              openPRs={profile.open_prs}
              mergedPRs={profile.merged_prs}
              closedPRs={profile.closed_prs}
              totalPRs={profile.total_prs}
            />

            {/* Top Languages */}
            {profile.top_languages?.length > 0 && (
              <div className="bg-[var(--color-canvas-white)] rounded-[12px] border border-[var(--color-ash-gray)] shadow-[var(--shadow-subtle-3)] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-[var(--color-charcoal)] flex items-center gap-2">
                    <Code2 size={18} className="text-slate-500" /> Top Languages
                  </h3>
                  {profile.top_languages.length > 5 && (
                    <button onClick={() => setShowAllLangs(!showAllLangs)}
                      className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1">
                      {showAllLangs ? 'Show Less' : 'Show All'}
                      {showAllLangs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.top_languages
                    .sort((a, b) => b.count - a.count)
                    .slice(0, showAllLangs ? undefined : 5)
                    .map((lang, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-sm">
                        <span className="font-medium text-[var(--color-charcoal)]">{lang.name}</span>
                        <span className="text-slate-500 font-bold ml-1.5">{lang.count}</span>
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Recent Repos */}
            {profile.recent_repos?.length > 0 && (
              <div className="bg-[var(--color-canvas-white)] rounded-[12px] border border-[var(--color-ash-gray)] shadow-[var(--shadow-subtle-3)] p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[var(--color-charcoal)] flex items-center gap-2">
                    <BookOpen size={18} className="text-slate-500" /> Recent Repositories
                  </h3>
                  {profile.recent_repos.length > 5 && (
                    <button onClick={() => setShowAllRepos(!showAllRepos)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1">
                      {showAllRepos ? 'Show Less' : 'Show All'}
                      {showAllRepos ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  {displayedRepos?.map((repo, i) => <RepoCard key={i} repo={repo} />)}
                </div>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GitHubPage;
