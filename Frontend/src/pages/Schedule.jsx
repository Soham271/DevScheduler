import React, { useMemo, useState } from 'react';
import { api } from '../services/api';
import { getUserEmail } from '../utils/auth';
import { Activity, Calendar, Clock, Mail, Send } from 'lucide-react';

const Schedule = () => {
  const email = getUserEmail();
  const defSend = useMemo(() => {
    const d = new Date(Date.now() + 3600000);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }, []);

  const [scheduling, setScheduling] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null);
  const [form, setForm] = useState({
    to: email || '',
    subject: 'Daily coding reminder',
    body: 'Time to solve one problem and keep your DevFlow streak alive.',
    sendAt: defSend,
  });

  const inp = 'w-full pl-10 pr-4 py-3 rounded-[12px] border border-[var(--color-ash-gray)] bg-[var(--color-buttermilk)] text-[var(--color-charcoal)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-charcoal)] transition placeholder:text-[var(--color-cool-gray)]';

  const doSchedule = async (e) => {
    e.preventDefault();
    setScheduling(true);
    setStatus(null);
    try {
      const sd = new Date(form.sendAt);
      if (isNaN(sd)) throw new Error('Invalid time.');
      const d = await api.scheduleEmail({
        to: form.to.trim(),
        subject: form.subject.trim(),
        body: form.body.trim(),
        send_at: sd.toISOString(),
      });
      setStatus({ t: 'ok', m: d?.message || 'Scheduled.' });
    } catch (err) {
      setStatus({ t: 'err', m: err.message || 'Failed.' });
    } finally {
      setScheduling(false);
    }
  };

  const doSend = async () => {
    setSending(true);
    setStatus(null);
    try {
      const d = await api.sendEmail({ to: form.to.trim(), subject: form.subject.trim(), body: form.body.trim() });
      setStatus({ t: 'ok', m: d?.message || 'Sent.' });
    } catch (err) {
      setStatus({ t: 'err', m: err.message || 'Failed.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in-up">
      <section className="bg-[var(--color-canvas-white)] rounded-[12px] shadow-[var(--shadow-subtle-3)] border border-[var(--color-ash-gray)] p-6">
        <div className="mb-5">
          <span className="text-xs font-bold text-[var(--color-charcoal)] uppercase tracking-wider">Reminders</span>
          <h1 className="text-2xl font-bold text-[var(--color-charcoal)] mt-1">Schedule or Send Email</h1>
        </div>

        <form onSubmit={doSchedule} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">Recipient</label>
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-cool-gray)]" size={17} /><input type="email" value={form.to} onChange={(e) => setForm((c) => ({ ...c, to: e.target.value }))} placeholder="you@example.com" required className={inp} /></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">Subject</label>
              <input type="text" value={form.subject} onChange={(e) => setForm((c) => ({ ...c, subject: e.target.value }))} placeholder="Subject" required className="w-full px-4 py-3 rounded-[12px] border border-[var(--color-ash-gray)] bg-[var(--color-buttermilk)] text-[var(--color-charcoal)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-charcoal)] transition placeholder:text-[var(--color-cool-gray)]" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">Message</label>
            <textarea value={form.body} onChange={(e) => setForm((c) => ({ ...c, body: e.target.value }))} placeholder="Write your reminder..." required className="w-full px-4 py-3 rounded-[12px] border border-[var(--color-ash-gray)] bg-[var(--color-buttermilk)] text-[var(--color-charcoal)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-charcoal)] transition placeholder:text-[var(--color-cool-gray)] min-h-[120px] resize-y" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">Schedule Time</label>
              <div className="relative"><Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-cool-gray)]" size={17} /><input type="datetime-local" value={form.sendAt} onChange={(e) => setForm((c) => ({ ...c, sendAt: e.target.value }))} required className={inp} /></div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={scheduling} className="flex items-center gap-1.5 px-4 py-2.5 rounded-[16px] border border-[var(--color-ash-gray)] bg-[var(--color-canvas-white)] text-sm font-medium text-[var(--color-charcoal)] hover:bg-[var(--color-buttermilk)] transition disabled:opacity-50 shadow-[var(--shadow-subtle-3)]">
                {scheduling ? <Activity size={15} className="icon-spin" /> : <Calendar size={15} />} Schedule
              </button>
              <button type="button" onClick={doSend} disabled={sending} className="flex items-center gap-1.5 px-4 py-2.5 rounded-[16px] border border-[var(--color-ash-gray)] bg-[var(--color-canvas-white)] text-sm font-medium text-[var(--color-charcoal)] hover:bg-[var(--color-buttermilk)] transition disabled:opacity-50 shadow-[var(--shadow-subtle-3)]">
                {sending ? <Activity size={15} className="icon-spin" /> : <Send size={15} />} Send Now
              </button>
            </div>
          </div>

          {status && <div className={`mt-3 p-3 rounded-[12px] text-sm text-center ${status.t === 'ok' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>{status.m}</div>}
        </form>
      </section>
    </div>
  );
};

export default Schedule;
