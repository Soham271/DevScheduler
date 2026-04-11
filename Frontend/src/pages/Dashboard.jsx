import React, { useState } from 'react';
import { api } from '../services/api';
import { getUserEmail, getLocalProfile } from '../utils/auth';
import {
  Code2, Search, Activity, Trophy, Flame, Mail, Send,
  TrendingUp, Calendar
} from 'lucide-react';

const Dashboard = () => {
  const email = getUserEmail();
  const profile = getLocalProfile();
  const initial = email ? email.charAt(0).toUpperCase() : '?';

  const [username, setUsername] = useState(profile?.leetcode_username || '');
  const [analysis, setAnalysis] = useState(null);
  const [analyzeError, setAnalyzeError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [reminderDelay, setReminderDelay] = useState('24h');
  const [scheduleStatus, setScheduleStatus] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsAnalyzing(true);
    setAnalyzeError('');
    setAnalysis(null);

    try {
      const data = await api.postAuth(`/analyze/leetcode/${encodeURIComponent(username.trim())}`);
      setAnalysis(data);
    } catch (err) {
      setAnalyzeError(err.message || 'Failed to analyze user. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleScheduleEmail = async (e) => {
    e.preventDefault();
    setIsScheduling(true);
    setScheduleStatus('');

    try {
      await api.postAuth('/schedule-email', {
        subject: emailSubject,
        body: emailBody,
        delay: reminderDelay
      });
      setScheduleStatus('Email reminder scheduled successfully!');
      setEmailSubject('');
      setEmailBody('');
    } catch (err) {
      setScheduleStatus(`Error: ${err.message || 'Failed to schedule email'}`);
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header with greeting */}
      <div className="dashboard-header">
        <div className="dashboard-avatar">{initial}</div>
        <div className="dashboard-greeting">
          <h1>Welcome back 👋</h1>
          <p>{email || 'DevFlow User'}</p>
        </div>
      </div>

      {/* Platform badges */}
      {profile && (profile.leetcode_username || profile.codechef_username) && (
        <div className="profile-badges">
          {profile.leetcode_username && (
            <span className="platform-badge platform-badge--lc">
              <Code2 size={14} />
              LeetCode: {profile.leetcode_username}
            </span>
          )}
          {profile.codechef_username && (
            <span className="platform-badge platform-badge--cc">
              <TrendingUp size={14} />
              CodeChef: {profile.codechef_username}
            </span>
          )}
        </div>
      )}

      {/* Main grid */}
      <div className="dashboard-grid">

        {/* ─── Analyze Section ─── */}
        <div className="dashboard-section">
          <h2><Search size={16} /> Analyze LeetCode</h2>
          <div className="search-card glass">
            <form onSubmit={handleAnalyze} className="search-form">
              <div className="search-input-wrapper">
                <Code2 className="search-icon-left" />
                <input
                  type="text"
                  placeholder="Enter LeetCode username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="search-input"
                  id="analyze-username"
                />
              </div>
              <button
                type="submit"
                className="btn-primary search-btn"
                disabled={isAnalyzing || !username.trim()}
              >
                {isAnalyzing ? (
                  <Activity className="icon-spin" size={18} />
                ) : (
                  <>
                    <Search size={18} />
                    <span>Analyze</span>
                  </>
                )}
              </button>
            </form>
            {analyzeError && <div className="error-message">{analyzeError}</div>}
          </div>

          {analysis && (
            <div className="results-grid stagger" style={{ gridTemplateColumns: '1fr' }}>
              <div className="result-card glass fade-in-up">
                <div className="card-header">
                  <Trophy className="card-icon text-gold" />
                  <h3>Score & Ranking</h3>
                </div>
                <div className="card-body">
                  <div className="stat-row">
                    <span className="stat-label">Rating</span>
                    <span className="stat-value">{analysis.rating || 'N/A'}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Global Rank</span>
                    <span className="stat-value">{analysis.globalRank || 'N/A'}</span>
                  </div>
                  {analysis.classification && (
                    <div className="stat-row">
                      <span className="stat-label">Classification</span>
                      <span className="stat-value badge">{analysis.classification}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="result-card glass fade-in-up">
                <div className="card-header">
                  <Flame className="card-icon text-orange" />
                  <h3>Activity Status</h3>
                </div>
                <div className="card-body">
                  <div className="stat-row">
                    <span className="stat-label">Inactive Today</span>
                    <span className="stat-value">
                      {analysis.isInactiveToday ? (
                        <span className="text-danger">Yes</span>
                      ) : (
                        <span className="text-success">No</span>
                      )}
                    </span>
                  </div>
                  {analysis.streakRisk && (
                    <div className="stat-row">
                      <span className="stat-label">Streak Risk</span>
                      <span className="stat-value text-warning">High</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── Schedule Email Section ─── */}
        <div className="dashboard-section">
          <h2><Calendar size={16} /> Schedule Reminder</h2>
          <div className="schedule-card glass">
            <form onSubmit={handleScheduleEmail} className="auth-form" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="email-subject">Subject</label>
                <div className="input-with-icon">
                  <Mail className="input-icon" />
                  <input
                    type="text"
                    id="email-subject"
                    placeholder="Reminder Subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email-body">Message Content</label>
                <textarea
                  id="email-body"
                  placeholder="Write your reminder message..."
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email-delay">Delay</label>
                <select
                  id="email-delay"
                  value={reminderDelay}
                  onChange={(e) => setReminderDelay(e.target.value)}
                >
                  <option value="1h">1 Hour</option>
                  <option value="2h">2 Hours</option>
                  <option value="24h">24 Hours</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={isScheduling}
                style={{ marginTop: '0.25rem' }}
              >
                <Send size={16} />
                <span>{isScheduling ? 'Scheduling...' : 'Schedule Email'}</span>
              </button>

              {scheduleStatus && (
                <div className={`status-message ${scheduleStatus.includes('Error') ? 'status-message--error' : 'status-message--success'}`}>
                  {scheduleStatus}
                </div>
              )}
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
