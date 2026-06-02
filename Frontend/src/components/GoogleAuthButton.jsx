import React, { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';

const GoogleAuthButton = ({ onSuccess, onError, text = "signin_with" }) => {
  const googleBtnRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    
    if (isInitialized || !window.google) return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      console.error("VITE_GOOGLE_CLIENT_ID is missing in environment variables");
      if (onError) onError(new Error("Missing Google Client ID"));
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            
            const idToken = response.credential;
            
            
            
            const result = await api.post('/auth/google', { id_token: idToken });
            
            if (onSuccess) onSuccess(result);
          } catch (err) {
            console.error("Backend Google Auth Error:", err);
            if (onError) onError(err);
          }
        },
      });

      window.google.accounts.id.renderButton(
        googleBtnRef.current,
        { theme: 'filled_black', size: 'large', text: text, width: '320', shape: 'rectangular' }
      );
      
      setIsInitialized(true);
    } catch (err) {
      console.error("Google Auth Init Error:", err);
    }
  }, [isInitialized, onSuccess, onError, text]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div id="googleBtn" ref={googleBtnRef}></div>
    </div>
  );
};

export default GoogleAuthButton;
