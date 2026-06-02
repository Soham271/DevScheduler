import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { api } from "../services/api";
import { processAuthResponse } from "../utils/auth";
import GoogleAuthButton from "./GoogleAuthButton";

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState("login"); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setError("");
      setMode("login");
    }
  }, [isOpen]);

  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleAuthResponse = (response) => {
    const { needsOnboarding } = processAuthResponse(response);
    onAuthSuccess({ needsOnboarding });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await api.post("/login", { email, password });
      handleAuthResponse(response);
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }

    try {
      await api.post("/signup", { email, password }).catch((err) => {
        if (err.message?.includes("404"))
          return api.post("/register", { email, password });
        throw err;
      });
      const loginResponse = await api.post("/login", { email, password });
      handleAuthResponse({ ...loginResponse, is_new_user: true });
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(250, 242, 236, 0.7)", 
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            padding: "1rem",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "420px",
              background: "var(--color-canvas-white)",
              border: "1px solid var(--color-ash-gray)",
              borderRadius: "20px",
              padding: "2rem",
              boxShadow: "var(--shadow-subtle-3)",
            }}
          >
            {}
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "var(--color-buttermilk)",
                border: "1px solid var(--color-ash-gray)",
                borderRadius: "12px",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--color-cool-gray)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.color = "var(--color-charcoal)";
                e.target.style.background = "var(--color-ash-gray)";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "var(--color-cool-gray)";
                e.target.style.background = "var(--color-buttermilk)";
              }}
            >
              <X size={18} />
            </button>

            {}
            <div
              style={{
                display: "flex",
                gap: "0.25rem",
                marginBottom: "1.75rem",
                background: "var(--color-ash-gray)",
                borderRadius: "14px",
                padding: "4px",
              }}
            >
              {["login", "signup"].map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    setError("");
                  }}
                  style={{
                    flex: 1,
                    padding: "0.6rem 0",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    background:
                      mode === m
                        ? "var(--color-buttermilk)"
                        : "transparent",
                    color:
                      mode === m ? "var(--color-charcoal)" : "var(--color-slate-blue)",
                    boxShadow:
                      mode === m
                        ? "var(--shadow-subtle-3)"
                        : "none",
                  }}
                >
                  {m === "login" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            {}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.25)",
                    borderRadius: "12px",
                    padding: "0.75rem 1rem",
                    marginBottom: "1rem",
                    color: "#fca5a5",
                    fontSize: "0.85rem",
                    textAlign: "center",
                  }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {}
            <form onSubmit={mode === "login" ? handleLogin : handleSignup}>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: "var(--color-slate-blue)",
                    marginBottom: "0.4rem",
                    letterSpacing: "0.03em",
                    textTransform: "uppercase",
                  }}
                >
                  Email
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="your@email.com"
                  style={{
                    width: "100%",
                    padding: "0.8rem 1rem",
                    background: "transparent",
                    border: "1px solid var(--color-charcoal)",
                    borderRadius: "0",
                    color: "var(--color-charcoal)",
                    fontSize: "0.95rem",
                    outline: "none",
                    transition: "all 0.2s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--color-field-green)";
                    e.target.style.boxShadow = "inset 0 0 0 1px var(--color-field-green)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--color-charcoal)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: "var(--color-slate-blue)",
                    marginBottom: "0.4rem",
                    letterSpacing: "0.03em",
                    textTransform: "uppercase",
                  }}
                >
                  Password
                </label>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  placeholder="••••••••"
                  minLength={6}
                  style={{
                    width: "100%",
                    padding: "0.8rem 1rem",
                    background: "transparent",
                    border: "1px solid var(--color-charcoal)",
                    borderRadius: "0",
                    color: "var(--color-charcoal)",
                    fontSize: "0.95rem",
                    outline: "none",
                    transition: "all 0.2s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--color-field-green)";
                    e.target.style.boxShadow = "inset 0 0 0 1px var(--color-field-green)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--color-charcoal)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {}
              <AnimatePresence>
                {mode === "signup" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ marginBottom: "1rem", overflow: "hidden" }}
                  >
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: "var(--color-slate-blue)",
                        marginBottom: "0.4rem",
                        letterSpacing: "0.03em",
                        textTransform: "uppercase",
                      }}
                    >
                      Confirm Password
                    </label>
                    <input
                      required={mode === "signup"}
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      minLength={6}
                      style={{
                        width: "100%",
                        padding: "0.8rem 1rem",
                        background: "transparent",
                        border: "1px solid var(--color-charcoal)",
                        borderRadius: "0",
                        color: "var(--color-charcoal)",
                        fontSize: "0.95rem",
                        outline: "none",
                        transition: "all 0.2s ease",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "var(--color-field-green)";
                        e.target.style.boxShadow = "inset 0 0 0 1px var(--color-field-green)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "var(--color-charcoal)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "0.85rem",
                  border: "none",
                  borderRadius: "16px",
                  background: "var(--color-buttermilk)",
                  color: "var(--color-ink-black)",
                  border: "1px solid var(--color-ink-black)",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.7 : 1,
                  boxShadow: "var(--shadow-subtle-3)",
                  transition: "all 0.2s ease",
                }}
              >
                {isLoading
                  ? mode === "login"
                    ? "Signing In..."
                    : "Creating Account..."
                  : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
              </motion.button>
            </form>

            {}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                margin: "1.25rem 0",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  background: "var(--color-ash-gray)",
                }}
              />
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "var(--color-cool-gray)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: 600,
                }}
              >
                or continue with
              </span>
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  background: "var(--color-ash-gray)",
                }}
              />
            </div>

            {}
            <GoogleAuthButton
              onSuccess={handleAuthResponse}
              onError={(err) =>
                setError(err?.message || "Google sign-in failed.")
              }
              text={mode === "login" ? "signin_with" : "signup_with"}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
