import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Zap } from 'lucide-react';

const HealthIndicator = () => {
  const [status, setStatus] = useState('checking');

  const check = useCallback(async () => {
    try { await api.checkHealth(); setStatus('online'); } catch { setStatus('offline'); }
  }, []);

  useEffect(() => { check(); const id = setInterval(check, 30000); return () => clearInterval(id); }, [check]);

  const isOnline = status === 'online';
  const isOffline = status === 'offline';

  return (
    <div
      className="relative flex items-center gap-2.5 px-4 py-2 rounded-full border transition-all duration-500"
      style={{
        background: isOnline
          ? 'linear-gradient(135deg, rgba(52,211,153,0.06), rgba(16,185,129,0.03))'
          : isOffline
            ? 'linear-gradient(135deg, rgba(244,63,94,0.06), rgba(239,68,68,0.03))'
            : 'rgba(248,250,252,0.6)',
        borderColor: isOnline
          ? 'rgba(52,211,153,0.25)'
          : isOffline
            ? 'rgba(244,63,94,0.25)'
            : 'rgba(226,232,240,0.8)',
        backdropFilter: 'blur(12px)',
        boxShadow: isOnline
          ? '0 0 20px rgba(52,211,153,0.08), inset 0 1px 0 rgba(255,255,255,0.6)'
          : 'inset 0 1px 0 rgba(255,255,255,0.6)',
      }}
      title={`System: ${status}`}
    >
      {/* Animated ring behind dot */}
      <div className="relative flex items-center justify-center w-4 h-4">
        {isOnline && (
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background: 'rgba(52,211,153,0.3)',
              animation: 'ringExpand 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
        )}
        <span
          className="relative w-2.5 h-2.5 rounded-full z-10"
          style={{
            background: isOnline
              ? '#34d399'
              : isOffline
                ? '#f43f5e'
                : '#94a3b8',
            boxShadow: isOnline
              ? '0 0 8px rgba(52,211,153,0.5)'
              : isOffline
                ? '0 0 8px rgba(244,63,94,0.5)'
                : 'none',
            animation: isOnline
              ? 'glowPulse 2.5s ease-in-out infinite'
              : status === 'checking'
                ? 'healthPulse 1.5s infinite'
                : 'none',
          }}
        />
      </div>

      {/* Icon */}
      <Zap
        size={12}
        className={`${isOnline ? 'text-emerald-500' : isOffline ? 'text-rose-400' : 'text-gray-400'} transition-colors`}
        style={{ strokeWidth: 2.5 }}
      />

      {/* Label */}
      <span
        className="text-[11px] font-bold uppercase tracking-widest transition-colors"
        style={{
          color: isOnline ? '#059669' : isOffline ? '#e11d48' : '#94a3b8',
          letterSpacing: '0.08em',
        }}
      >
        {isOnline ? 'Live' : isOffline ? 'Offline' : '···'}
      </span>
    </div>
  );
};

export default HealthIndicator;
