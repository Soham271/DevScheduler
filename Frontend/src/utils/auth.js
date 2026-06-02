


export const getToken = () => localStorage.getItem('token');


export const isLoggedIn = () => !!getToken();


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


export const getUserEmail = () => {
  const payload = decodeToken();
  if (!payload) return null;
  
  return payload.email || payload.sub || payload.user_email || null;
};


export const hasCompletedOnboarding = () => {
  const email = getUserEmail();
  if (!email) return false;
  return localStorage.getItem(`onboarding_done:${email}`) === 'true';
};


export const markOnboardingDone = () => {
  const email = getUserEmail();
  if (email) {
    localStorage.setItem(`onboarding_done:${email}`, 'true');
  }
};


export const saveProfileLocally = (profile) => {
  const email = getUserEmail();
  if (email && profile) {
    localStorage.setItem(`profile:${email}`, JSON.stringify(profile));
  }
};


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


export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('isNewUser');
};


export const processAuthResponse = (response) => {
  
  const token = response?.token || response?.data?.token;
  if (token) {
    localStorage.setItem('token', token);
  }

  
  const isNew = response?.is_new_user || response?.needsProfileSetup || false;
  const onboardingDone = hasCompletedOnboarding();

  return {
    needsOnboarding: isNew || !onboardingDone,
  };
};
