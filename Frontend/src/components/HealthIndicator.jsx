import React, { useCallback, useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { api } from "../services/api";

const HealthIndicator = () => {
  const [status, setStatus] = useState("checking");

  const check = useCallback(async () => {
    try {
      await api.checkHealth();
      setStatus("online");
    } catch {
      setStatus("offline");
    }
  }, []);

  useEffect(() => {
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, [check]);

  const config = {
    online: {
      label: "Live",
      dot: "#10b981",
      text: "#059669",
      border: "rgba(16,185,129,0.24)",
      bg: "rgba(255,255,255,0.75)",
    },
    offline: {
      label: "Offline",
      dot: "#ef4444",
      text: "#dc2626",
      border: "rgba(239,68,68,0.24)",
      bg: "rgba(255,255,255,0.75)",
    },
    checking: {
      label: "...",
      dot: "var(--color-cool-gray)",
      text: "var(--color-cool-gray)",
      border: "rgba(143,143,143,0.18)",
      bg: "rgba(255,255,255,0.75)",
    },
  }[status];

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold"
      style={{
        background: config.bg,
        borderColor: config.border,
        color: config.text,
      }}
      title={`System: ${status}`}
    >
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{
          background: config.dot,
          boxShadow: status === "online" ? "0 0 8px rgba(16,185,129,0.4)" : "none",
          animation: status === "checking" ? "healthPulse 1.5s infinite" : "none",
        }}
      />
      <Zap size={12} />
      {config.label}
    </div>
  );
};

export default HealthIndicator;
