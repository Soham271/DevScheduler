import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { getUserEmail, getLocalProfile, saveProfileLocally } from '../utils/auth';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  Code2,
  Flame,
  Mail,
  RefreshCw,
  Save,
  Search,
  Send,
  Terminal,
  Trophy,
  UserPlus,
  Users,
} from 'lucide-react';

const platformConfig = {
  leetcode: {
    label: 'LeetCode',
    icon: Code2,
    placeholder: 'Enter LeetCode username',
  },
  codechef: {
    label: 'CodeChef',
    icon: Terminal,
    placeholder: 'Enter CodeChef username',
  },
};

const navItems = [
  { id: 'analyze', label: 'Analyze', icon: Search },
  { id: 'profile', label: 'Profile', icon: Users },
  { id: 'contests', label: 'Contests', icon: Calendar },
  { id: 'monitor', label: 'Monitor', icon: Bell },
  { id: 'reminders', label: 'Reminders', icon: Mail },
];

const emptyProfile = {
  leetcode_username: '',
  codechef_username: '',
};

const makeDateTimeLocalValue = (date) => {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

const normalizeAnalysis = (payload) => {
  const result = payload?.analysis || {};
  const fallbackProfile = {
    username: payload?.username || '',
    platform: payload?.platform || '',
    submissions_today: payload?.submissions_today,
    is_inactive_today: payload?.is_inactive_today,
  };
  const profile = result.profile || fallbackProfile;
  const isInactiveToday = Boolean(
    payload?.is_inactive_today ?? result.is_inactive_today ?? profile.is_inactive_today
  );
  const profileHidden = Boolean(payload?.profile_hidden || (isInactiveToday && !payload?.analysis));

  const messages = [...(result.messages || [])];
  if (payload?.warning) {
    messages.push({ category: 'warning', text: payload.warning });
  }
  if (payload?.suggestion) {
    messages.push({ category: 'suggestion', text: payload.suggestion });
  }

  return {
    headline: payload?.message || result.message || 'Analysis complete',
    platform: profile.platform || result.platform || payload?.platform,
    username: profile.username || result.username || payload?.username,
    profile,
    profileHidden,
    contests: result.contests || payload?.contests || [],
    messages,
    performanceLevel: result.performance_level || payload?.performance_level || payload?.classification,
    ratingLevel: result.rating_level || payload?.rating_level,
    isInactiveToday,
    isMockData: Boolean(profile.is_mock_data),
  };
};

const getStatusClass = (status) => {
  if (!status) return '';
  return status.type === 'error' ? 'status-message--error' : 'status-message--success';
};

const Dashboard = () => {
  const email = getUserEmail();
  const storedProfile = getLocalProfile();
  const initial = email ? email.charAt(0).toUpperCase() : '?';
  const defaultSendAt = useMemo(() => makeDateTimeLocalValue(new Date(Date.now() + 60 * 60 * 1000)), []);

  const [activeSection, setActiveSection] = useState('analyze');
  const [profile, setProfile] = useState({ ...emptyProfile, ...(storedProfile || {}) });
  const [activePlatform, setActivePlatform] = useState(
    storedProfile?.codechef_username && !storedProfile?.leetcode_username ? 'codechef' : 'leetcode'
  );

  const [analysis, setAnalysis] = useState(null);
  const [analysisError, setAnalysisError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [contests, setContests] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [profileStatus, setProfileStatus] = useState(null);
  const [monitorStatus, setMonitorStatus] = useState(null);
  const [mailStatus, setMailStatus] = useState(null);

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isSendingNow, setIsSendingNow] = useState(false);

  const [emailForm, setEmailForm] = useState({
    to: email || '',
    subject: 'Daily coding reminder',
    body: 'Time to solve one problem and keep your DevFlow streak alive.',
    sendAt: defaultSendAt,
  });

  const activeUsername = activePlatform === 'leetcode'
    ? profile.leetcode_username
    : profile.codechef_username;
  const ActivePlatformIcon = platformConfig[activePlatform].icon;

  const loadDashboardData = useCallback(async () => {
    setIsRefreshing(true);
    const [contestResult, userResult] = await Promise.allSettled([
      api.getContests('all'),
      api.getRegisteredUsers(),
    ]);

    if (contestResult.status === 'fulfilled') {
      setContests(contestResult.value?.contests || []);
    }

    if (userResult.status === 'fulfilled') {
      setRegisteredUsers(userResult.value?.users || []);
    }

    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const updateProfileField = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setProfileStatus(null);
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setIsSavingProfile(true);
    setProfileStatus(null);

    try {
      const nextProfile = {
        leetcode_username: profile.leetcode_username.trim(),
        codechef_username: profile.codechef_username.trim(),
      };
      await api.saveProfile(nextProfile);
      saveProfileLocally(nextProfile);
      setProfile(nextProfile);
      setProfileStatus({ type: 'success', text: 'Profile saved.' });
    } catch (err) {
      setProfileStatus({ type: 'error', text: err.message || 'Failed to save profile.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAnalyze = async (event) => {
    event.preventDefault();
    const username = activeUsername?.trim();
    if (!username) {
      setAnalysisError(`Add a ${platformConfig[activePlatform].label} username first.`);
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError('');
    setAnalysis(null);

    try {
      const data = await api.analyzeUser(activePlatform, username);
      setAnalysis(normalizeAnalysis(data));
    } catch (err) {
      setAnalysisError(err.message || 'Failed to analyze user.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRegisterMonitoring = async () => {
    const username = activeUsername?.trim();
    if (!username) {
      setMonitorStatus({ type: 'error', text: `Add a ${platformConfig[activePlatform].label} username first.` });
      return;
    }
    if (!email) {
      setMonitorStatus({ type: 'error', text: 'Login email not found. Please sign in again.' });
      return;
    }

    setIsRegistering(true);
    setMonitorStatus(null);

    try {
      await api.registerUser(activePlatform, username, email);
      setMonitorStatus({
        type: 'success',
        text: `${platformConfig[activePlatform].label} monitoring enabled for ${username}.`,
      });
      await loadDashboardData();
    } catch (err) {
      setMonitorStatus({ type: 'error', text: err.message || 'Failed to register monitoring.' });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleEmailChange = (field, value) => {
    setEmailForm((current) => ({ ...current, [field]: value }));
    setMailStatus(null);
  };

  const buildEmailPayload = () => ({
    to: emailForm.to.trim(),
    subject: emailForm.subject.trim(),
    body: emailForm.body.trim(),
  });

  const handleScheduleEmail = async (event) => {
    event.preventDefault();
    setIsScheduling(true);
    setMailStatus(null);

    try {
      const sendDate = new Date(emailForm.sendAt);
      if (Number.isNaN(sendDate.getTime())) {
        throw new Error('Choose a valid reminder time.');
      }

      const data = await api.scheduleEmail({
        ...buildEmailPayload(),
        send_at: sendDate.toISOString(),
      });

      setMailStatus({ type: 'success', text: data?.message || 'Email reminder scheduled.' });
    } catch (err) {
      setMailStatus({ type: 'error', text: err.message || 'Failed to schedule email.' });
    } finally {
      setIsScheduling(false);
    }
  };

  const handleSendNow = async () => {
    setIsSendingNow(true);
    setMailStatus(null);

    try {
      const data = await api.sendEmail(buildEmailPayload());
      setMailStatus({ type: 'success', text: data?.message || 'Email sent.' });
    } catch (err) {
      setMailStatus({ type: 'error', text: err.message || 'Failed to send email.' });
    } finally {
      setIsSendingNow(false);
    }
  };

  const renderPlatformSwitch = () => (
    <div className="dashboard-tabs dashboard-tabs--compact" role="tablist" aria-label="Coding platform">
      {Object.entries(platformConfig).map(([key, config]) => {
        const Icon = config.icon;
        return (
          <button
            key={key}
            type="button"
            className={`dashboard-tab ${activePlatform === key ? 'is-active' : ''}`}
            onClick={() => {
              setActivePlatform(key);
              setAnalysisError('');
              setMonitorStatus(null);
            }}
          >
            <Icon size={16} />
            {config.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="dashboard-shell">
      <header className="dashboard-top glass">
        <div className="dashboard-top__identity">
          <div className="dashboard-avatar">{initial}</div>
          <div>
            <span className="eyebrow">DevFlow Scheduler</span>
            <h1>Dashboard</h1>
            <p>{email || 'DevFlow User'}</p>
          </div>
        </div>
        <button className="btn-secondary" type="button" onClick={loadDashboardData} disabled={isRefreshing}>
          <RefreshCw size={16} className={isRefreshing ? 'icon-spin' : ''} />
          Refresh
        </button>
      </header>

      <nav className="dashboard-tabs glass" aria-label="Dashboard sections">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              className={`dashboard-tab ${activeSection === item.id ? 'is-active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {activeSection === 'analyze' && (
        <section className="dashboard-view glass">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Analyze</span>
              <h2>Run platform intelligence</h2>
            </div>
            {renderPlatformSwitch()}
          </div>

          <form className="dashboard-form dashboard-form--inline" onSubmit={handleAnalyze}>
            <div className="input-with-icon">
              <ActivePlatformIcon className="input-icon" />
              <input
                type="text"
                value={activeUsername}
                placeholder={platformConfig[activePlatform].placeholder}
                onChange={(event) => updateProfileField(
                  activePlatform === 'leetcode' ? 'leetcode_username' : 'codechef_username',
                  event.target.value
                )}
              />
            </div>
            <button className="btn-primary" type="submit" disabled={isAnalyzing || !activeUsername?.trim()}>
              {isAnalyzing ? <Activity size={16} className="icon-spin" /> : <BarChart3 size={16} />}
              {isAnalyzing ? 'Analyzing' : 'Analyze'}
            </button>
            <button className="btn-secondary" type="button" onClick={handleRegisterMonitoring} disabled={isRegistering}>
              {isRegistering ? <Activity size={16} className="icon-spin" /> : <UserPlus size={16} />}
              Monitor
            </button>
          </form>

          {analysisError && <div className="error-message">{analysisError}</div>}
          {monitorStatus && <div className={`status-message ${getStatusClass(monitorStatus)}`}>{monitorStatus.text}</div>}

          {!analysis && (
            <div className="dashboard-empty">
              <Search size={22} />
              <p>Choose a platform, enter a username, then analyze. Inactive LeetCode users now show only the warning, not profile stats.</p>
            </div>
          )}

          {analysis && analysis.isInactiveToday && analysis.profileHidden && (
            <div className="analysis-warning">
              <AlertTriangle size={24} />
              <div>
                <span>{platformConfig[analysis.platform]?.label || analysis.platform}</span>
                <h3>{analysis.headline}</h3>
                {analysis.messages.map((message, index) => (
                  <p key={`${message.category}-${index}`}>{message.text}</p>
                ))}
              </div>
            </div>
          )}

          {analysis && !analysis.profileHidden && (
            <div className="analysis-stack">
              <div className="analysis-title-row">
                <div>
                  <span>{platformConfig[analysis.platform]?.label || analysis.platform}</span>
                  <h3>{analysis.username}</h3>
                </div>
                <strong className={analysis.isInactiveToday ? 'text-warning' : 'text-success'}>
                  {analysis.isInactiveToday ? 'Inactive today' : 'Active today'}
                </strong>
              </div>

              <div className="metric-grid">
                <div className="metric-card">
                  <Trophy size={18} className="text-gold" />
                  <span>Rating</span>
                  <strong>{analysis.profile.rating ?? 'N/A'}</strong>
                </div>
                <div className="metric-card">
                  <Code2 size={18} className="text-blue" />
                  <span>Total solved</span>
                  <strong>{analysis.profile.total_solved ?? 'N/A'}</strong>
                </div>
                <div className="metric-card">
                  <Flame size={18} className={analysis.isInactiveToday ? 'text-warning' : 'text-success'} />
                  <span>Activity</span>
                  <strong>{analysis.isInactiveToday ? 'Needs work' : 'On track'}</strong>
                </div>
                <div className="metric-card">
                  <CheckCircle size={18} className="text-success" />
                  <span>Level</span>
                  <strong>{analysis.performanceLevel || 'N/A'}</strong>
                </div>
              </div>

              {analysis.messages.length > 0 && (
                <div className="message-list">
                  {analysis.messages.map((message, index) => (
                    <div className={`message-pill message-pill--${message.category || 'note'}`} key={`${message.category}-${index}`}>
                      <span>{message.category || 'note'}</span>
                      <p>{message.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {activeSection === 'profile' && (
        <section className="dashboard-view glass">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Profile</span>
              <h2>Connected handles</h2>
            </div>
          </div>

          <form className="dashboard-form" onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label htmlFor="dashboard-leetcode">LeetCode username</label>
              <div className="input-with-icon">
                <Code2 className="input-icon" />
                <input
                  id="dashboard-leetcode"
                  type="text"
                  value={profile.leetcode_username}
                  onChange={(event) => updateProfileField('leetcode_username', event.target.value)}
                  placeholder="e.g. neetcode"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="dashboard-codechef">CodeChef username</label>
              <div className="input-with-icon">
                <Terminal className="input-icon" />
                <input
                  id="dashboard-codechef"
                  type="text"
                  value={profile.codechef_username}
                  onChange={(event) => updateProfileField('codechef_username', event.target.value)}
                  placeholder="e.g. tourist"
                />
              </div>
            </div>
            <button className="btn-primary" type="submit" disabled={isSavingProfile}>
              {isSavingProfile ? <Activity size={16} className="icon-spin" /> : <Save size={16} />}
              Save profile
            </button>
          </form>

          {profileStatus && <div className={`status-message ${getStatusClass(profileStatus)}`}>{profileStatus.text}</div>}
        </section>
      )}

      {activeSection === 'contests' && (
        <section className="dashboard-view glass">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Contests</span>
              <h2>Upcoming countdowns</h2>
            </div>
          </div>

          <div className="dashboard-list">
            {contests.length > 0 ? contests.map((contest) => (
              <div className="dashboard-list-item" key={`${contest.platform}-${contest.name}`}>
                <div>
                  <span>{platformConfig[contest.platform]?.label || contest.platform}</span>
                  <strong>{contest.name}</strong>
                  <p>{contest.scheduled_at}</p>
                </div>
                <em>{contest.time_remaining}</em>
              </div>
            )) : (
              <div className="dashboard-empty">
                <Clock size={22} />
                <p>No contests returned yet.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {activeSection === 'monitor' && (
        <section className="dashboard-view glass">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Monitor</span>
              <h2>Automatic backend tracking</h2>
            </div>
            {renderPlatformSwitch()}
          </div>

          <div className="monitor-action-row">
            <p>Register the selected handle for periodic analysis, inactivity reminders, and contest reminders.</p>
            <button className="btn-primary" type="button" onClick={handleRegisterMonitoring} disabled={isRegistering}>
              {isRegistering ? <Activity size={16} className="icon-spin" /> : <Bell size={16} />}
              Monitor current handle
            </button>
          </div>

          {monitorStatus && <div className={`status-message ${getStatusClass(monitorStatus)}`}>{monitorStatus.text}</div>}

          <div className="dashboard-list">
            {registeredUsers.length > 0 ? registeredUsers.map((user) => (
              <div className="dashboard-list-item" key={`${user.platform}-${user.username}`}>
                <div>
                  <span>{platformConfig[user.platform]?.label || user.platform}</span>
                  <strong>{user.username}</strong>
                </div>
                <em>Watching</em>
              </div>
            )) : (
              <div className="dashboard-empty">
                <Users size={22} />
                <p>No monitored users yet.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {activeSection === 'reminders' && (
        <section className="dashboard-view glass">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Reminders</span>
              <h2>Schedule or send email</h2>
            </div>
          </div>

          <form className="dashboard-form dashboard-form--two" onSubmit={handleScheduleEmail}>
            <div className="form-group">
              <label htmlFor="email-to">Recipient</label>
              <div className="input-with-icon">
                <Mail className="input-icon" />
                <input
                  id="email-to"
                  type="email"
                  value={emailForm.to}
                  onChange={(event) => handleEmailChange('to', event.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="email-subject">Subject</label>
              <input
                id="email-subject"
                type="text"
                value={emailForm.subject}
                onChange={(event) => handleEmailChange('subject', event.target.value)}
                placeholder="Reminder subject"
                required
              />
            </div>
            <div className="form-group form-group--full">
              <label htmlFor="email-body">Message</label>
              <textarea
                id="email-body"
                value={emailForm.body}
                onChange={(event) => handleEmailChange('body', event.target.value)}
                placeholder="Write your reminder..."
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email-send-at">Schedule time</label>
              <div className="input-with-icon">
                <Clock className="input-icon" />
                <input
                  id="email-send-at"
                  type="datetime-local"
                  value={emailForm.sendAt}
                  onChange={(event) => handleEmailChange('sendAt', event.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mail-actions">
              <button className="btn-primary" type="submit" disabled={isScheduling}>
                {isScheduling ? <Activity size={16} className="icon-spin" /> : <Calendar size={16} />}
                Schedule email
              </button>
              <button className="btn-secondary" type="button" onClick={handleSendNow} disabled={isSendingNow}>
                {isSendingNow ? <Activity size={16} className="icon-spin" /> : <Send size={16} />}
                Send now
              </button>
            </div>
          </form>

          {mailStatus && <div className={`status-message ${getStatusClass(mailStatus)}`}>{mailStatus.text}</div>}
        </section>
      )}
    </div>
  );
};

export default Dashboard;
