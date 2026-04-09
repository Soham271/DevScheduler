import React, { useState } from 'react';
import { api } from '../services/api';
import { Code2, Search, Activity, Trophy, Flame, Mail, Send } from 'lucide-react';

const Dashboard = () => {
  const [username, setUsername] = useState('');
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
      const data = await api.postAuth(`/analyze/leetcode/${username}`);
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
      // Payload expected by backend for /schedule-email
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
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome to your Dashboard</h1>
        <p>Analyze your coding profile metrics and set reminders</p>
      </div>

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>

        {/* Analyze Section */}
        <div className="dashboard-section">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Analyze LeetCode</h2>
          <div className="search-card glass" style={{ marginBottom: '2rem' }}>
            <form onSubmit={handleAnalyze} className="search-form">
              <div className="search-input-wrapper">
                <Code2 className="search-icon-left" />
                <input
                  type="text"
                  placeholder="Enter LeetCode username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="search-input"
                />
              </div>
              <button type="submit" className="btn-primary search-btn" disabled={isAnalyzing || !username.trim()}>
                {isAnalyzing ? (
                  <Activity className="icon-spin" size={20} />
                ) : (
                  <>
                    <Search size={20} />
                    <span>Analyze</span>
                  </>
                )}
              </button>
            </form>
            {analyzeError && <div className="error-message">{analyzeError}</div>}
          </div>

          {analysis && (
            <div className="results-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="result-card glass fade-in">
                <div className="card-header">
                  <Trophy className="card-icon text-gold" />
                  <h3>Score & Ranking</h3>
                </div>
                <div className="card-body" style={{ fontSize: '0.95rem' }}>
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

              <div className="result-card glass fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="card-header">
                  <Flame className="card-icon text-orange" />
                  <h3>Activity Status</h3>
                </div>
                <div className="card-body" style={{ fontSize: '0.95rem' }}>
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

        {/* Schedule Email Section */}
        <div className="dashboard-section">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Schedule Reminder</h2>
          <div className="auth-card glass" style={{ width: '100%', padding: '1.5rem' }}>
            <form onSubmit={handleScheduleEmail} className="auth-form" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label>Subject</label>
                <div className="input-with-icon">
                  <Mail className="input-icon" />
                  <input
                    type="text"
                    placeholder="Reminder Subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Message Content</label>
                <textarea
                  placeholder="Message body here..."
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.2)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    outline: 'none',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                  required
                />
              </div>
              <div className="form-group">
                <label>Delay</label>
                <select
                  value={reminderDelay}
                  onChange={(e) => setReminderDelay(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.2)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                >
                  <option value="1h" style={{ background: '#1e293b' }}>1 Hour</option>
                  <option value="2h" style={{ background: '#1e293b' }}>2 Hours</option>
                  <option value="24h" style={{ background: '#1e293b' }}>24 Hours</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" disabled={isScheduling} style={{ marginTop: '0.5rem' }}>
                <Send size={18} />
                <span>{isScheduling ? 'Scheduling...' : 'Schedule Email'}</span>
              </button>

              {scheduleStatus && (
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  background: scheduleStatus.includes('Error') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  color: scheduleStatus.includes('Error') ? 'var(--error-color)' : 'var(--success-color)'
                }}>
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
