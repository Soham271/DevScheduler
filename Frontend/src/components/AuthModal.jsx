import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { api } from "../services/api";
import { processAuthResponse } from "../utils/auth";
import GoogleAuthButton from "./GoogleAuthButton";

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState("login"); // 'login' or 'signup'
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

  // Prevent body scroll when modal is open
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
            background: "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
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
              background:
                "linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95))",
              border: "1px solid rgba(226, 232, 240, 0.8)",
              borderRadius: "24px",
              padding: "2rem",
              boxShadow:
                "0 25px 80px rgba(0,0,0,0.08), 0 0 60px rgba(14, 165, 233, 0.05), inset 0 1px 0 rgba(255,255,255,1)",
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "rgba(15, 23, 42, 0.04)",
                border: "1px solid rgba(15, 23, 42, 0.08)",
                borderRadius: "12px",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "rgba(15, 23, 42, 0.5)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.color = "#0f172a";
                e.target.style.background = "rgba(15, 23, 42, 0.08)";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "rgba(15, 23, 42, 0.5)";
                e.target.style.background = "rgba(15, 23, 42, 0.04)";
              }}
            >
              <X size={18} />
            </button>

            {/* Mode tabs */}
            <div
              style={{
                display: "flex",
                gap: "0.25rem",
                marginBottom: "1.75rem",
                background: "rgba(15, 23, 42, 0.04)",
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
                        ? "#ffffff"
                        : "transparent",
                    color:
                      mode === m ? "#0f172a" : "rgba(71, 85, 105, 0.7)",
                    boxShadow:
                      mode === m
                        ? "0 4px 15px rgba(0, 0, 0, 0.05)"
                        : "none",
                  }}
                >
                  {m === "login" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            {/* Error */}
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

            {/* Form */}
            <form onSubmit={mode === "login" ? handleLogin : handleSignup}>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: "rgba(71, 85, 105, 0.8)",
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
                    background: "rgba(241, 245, 249, 0.6)",
                    border: "1px solid rgba(226, 232, 240, 0.8)",
                    borderRadius: "12px",
                    color: "#0f172a",
                    fontSize: "0.95rem",
                    outline: "none",
                    transition: "all 0.25s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#0ea5e9";
                    e.target.style.background = "#ffffff";
                    e.target.style.boxShadow = "0 0 0 3px rgba(14, 165, 233, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(226, 232, 240, 0.8)";
                    e.target.style.background = "rgba(241, 245, 249, 0.6)";
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
                    color: "rgba(71, 85, 105, 0.8)",
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
                    background: "rgba(241, 245, 249, 0.6)",
                    border: "1px solid rgba(226, 232, 240, 0.8)",
                    borderRadius: "12px",
                    color: "#0f172a",
                    fontSize: "0.95rem",
                    outline: "none",
                    transition: "all 0.25s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#0ea5e9";
                    e.target.style.background = "#ffffff";
                    e.target.style.boxShadow = "0 0 0 3px rgba(14, 165, 233, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(226, 232, 240, 0.8)";
                    e.target.style.background = "rgba(241, 245, 249, 0.6)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Confirm password for signup */}
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
                        color: "rgba(71, 85, 105, 0.8)",
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
                        background: "rgba(241, 245, 249, 0.6)",
                        border: "1px solid rgba(226, 232, 240, 0.8)",
                        borderRadius: "12px",
                        color: "#0f172a",
                        fontSize: "0.95rem",
                        outline: "none",
                        transition: "all 0.25s ease",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#0ea5e9";
                        e.target.style.background = "#ffffff";
                        e.target.style.boxShadow = "0 0 0 3px rgba(14, 165, 233, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "rgba(226, 232, 240, 0.8)";
                        e.target.style.background = "rgba(241, 245, 249, 0.6)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "0.85rem",
                  border: "none",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #11729b, #0ea5e9)",
                  color: "#fff",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.7 : 1,
                  boxShadow: "0 4px 20px rgba(14, 165, 233, 0.3)",
                  transition: "all 0.25s ease",
                  marginTop: "0.25rem",
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

            {/* Divider */}
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
                  background:
                    "linear-gradient(90deg, transparent, rgba(15, 23, 42, 0.1), transparent)",
                }}
              />
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "rgba(100, 116, 139, 0.8)",
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
                  background:
                    "linear-gradient(90deg, transparent, rgba(15, 23, 42, 0.1), transparent)",
                }}
              />
            </div>

            {/* Google */}
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
