/**
 * Auth utility functions for DevFlow Scheduler
 */

/**
 * Get JWT token from localStorage
 */
export const getToken = () => localStorage.getItem('token');

/**
 * Check if user is logged in (token exists)
 */
export const isLoggedIn = () => !!getToken();

/**
 * Decode JWT payload (base64 decode, no validation)
 * Returns null if token is invalid or missing
 */
export const decodeToken = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

/**
 * Get user email from JWT
 */
export const getUserEmail = () => {
  const payload = decodeToken();
  if (!payload) return null;
  // Common JWT claim names for email
  return payload.email || payload.sub || payload.user_email || null;
};

/**
 * Check if the user has completed onboarding
 * Uses localStorage keyed by email to persist across sessions
 */
export const hasCompletedOnboarding = () => {
  const email = getUserEmail();
  if (!email) return false;
  return localStorage.getItem(`onboarding_done:${email}`) === 'true';
};

/**
 * Mark onboarding as completed for current user
 */
export const markOnboardingDone = () => {
  const email = getUserEmail();
  if (email) {
    localStorage.setItem(`onboarding_done:${email}`, 'true');
  }
};

/**
 * Save user profile data locally (mirror of what's in DB)
 */
export const saveProfileLocally = (profile) => {
  const email = getUserEmail();
  if (email && profile) {
    localStorage.setItem(`profile:${email}`, JSON.stringify(profile));
  }
};

/**
 * Get locally saved profile data
 */
export const getLocalProfile = () => {
  const email = getUserEmail();
  if (!email) return null;
  try {
    const data = localStorage.getItem(`profile:${email}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

/**
 * Clear all session data
 */
export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('isNewUser');
};

/**
 * Handle auth response: store token, determine if onboarding needed
 * Returns { needsOnboarding: boolean }
 */
export const processAuthResponse = (response) => {
  // Extract token from various response shapes
  const token = response?.token || response?.data?.token;
  if (token) {
    localStorage.setItem('token', token);
  }

  // Determine if onboarding is needed
  const isNew = response?.is_new_user || response?.needsProfileSetup || false;
  const onboardingDone = hasCompletedOnboarding();

  return {
    needsOnboarding: isNew || !onboardingDone,
  };
};
