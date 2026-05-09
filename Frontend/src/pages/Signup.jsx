import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { processAuthResponse } from '../utils/auth';
import GoogleAuthButton from '../components/GoogleAuthButton';
import {
  AgreementText,
  AuthCard,
  AuthHeading,
  AuthInput,
  AuthPageShell,
  AuthSubtext,
  FieldGroup,
  FieldLabel,
  HelperText,
  InlineMessage,
  SocialSection,
  SocialTitle,
  StyledForm,
  SubmitButton,
} from '../components/AuthFormStyles';

const Signup = ({ setIsAuthenticated, setNeedsOnboarding }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuthSuccess = (response) => {
    const { needsOnboarding } = processAuthResponse(response);
    setIsAuthenticated(true);
    setNeedsOnboarding(needsOnboarding);
    navigate('/dashboard');
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setIsLoading(false);
      return;
    }

    try {
      await api.post('/signup', { email, password }).catch((err) => {
        if (err.message?.includes('404')) return api.post('/register', { email, password });
        throw err;
      });
      const loginResponse = await api.post('/login', { email, password });
      handleAuthSuccess({ ...loginResponse, is_new_user: true });
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStrength = () => {
    if (!password) return { level: 0, text: '', color: '#d1d5db' };
    if (password.length < 6) return { level: 1, text: 'Too short', color: '#f87171' };
    if (password.length < 8) return { level: 2, text: 'Weak', color: '#fbbf24' };
    const score = [/[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(password)).length;
    if (score >= 2 && password.length >= 10) return { level: 4, text: 'Strong', color: '#10b981' };
    if (score >= 1) return { level: 3, text: 'Fair', color: '#38bdf8' };
    return { level: 2, text: 'Weak', color: '#fbbf24' };
  };

  const strength = getStrength();

  return (
    <AuthPageShell>
      <AuthCard>
        <AuthHeading>Sign Up</AuthHeading>
        <AuthSubtext>Join DevFlow to track your coding journey.</AuthSubtext>

        {error && <InlineMessage $tone="error">{error}</InlineMessage>}

        <StyledForm onSubmit={handleSignup}>
          <FieldGroup>
            <FieldLabel htmlFor="signup-email">Email Address</FieldLabel>
            <AuthInput
              required
              type="email"
              name="email"
              id="signup-email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="signup-password">Password</FieldLabel>
            <AuthInput
              required
              type="password"
              name="password"
              id="signup-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength="6"
              autoComplete="new-password"
            />
            {password && (
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ height: '4px', borderRadius: '999px', background: '#e5e7eb', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${strength.level * 25}%`,
                      background: strength.color,
                      transition: 'width 0.3s ease',
                      borderRadius: '999px',
                    }}
                  />
                </div>
                <HelperText style={{ marginTop: '0.35rem', display: 'block' }}>{strength.text}</HelperText>
              </div>
            )}
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="signup-confirm">Confirm Password</FieldLabel>
            <AuthInput
              required
              type="password"
              name="confirmPassword"
              id="signup-confirm"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength="6"
              autoComplete="new-password"
            />
            {confirmPassword && password !== confirmPassword && (
              <HelperText $tone="error" style={{ marginTop: '0.45rem', display: 'block' }}>
                Passwords don&apos;t match
              </HelperText>
            )}
          </FieldGroup>

          <SubmitButton type="submit" disabled={isLoading}>
            <div className="dots_border" />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="sparkle">
              <path className="path" strokeLinejoin="round" strokeLinecap="round" stroke="black" fill="black" d="M14.187 8.096L15 5.25L15.813 8.096C16.0231 8.83114 16.4171 9.50062 16.9577 10.0413C17.4984 10.5819 18.1679 10.9759 18.903 11.186L21.75 12L18.904 12.813C18.1689 13.0231 17.4994 13.4171 16.9587 13.9577C16.4181 14.4984 16.0241 15.1679 15.814 15.903L15 18.75L14.187 15.904C13.9769 15.1689 13.5829 14.4994 13.0423 13.9587C12.5016 13.4181 11.8321 13.0241 11.097 12.814L8.25 12L11.096 11.187C11.8311 10.9769 12.5006 10.5829 13.0413 10.0423C13.5819 9.50162 13.9759 8.83214 14.186 8.097L14.187 8.096Z" />
              <path className="path" strokeLinejoin="round" strokeLinecap="round" stroke="black" fill="black" d="M6 14.25L5.741 15.285C5.59267 15.8785 5.28579 16.4206 4.85319 16.8532C4.42059 17.2858 3.87853 17.5927 3.285 17.741L2.25 18L3.285 18.259C3.87853 18.4073 4.42059 18.7142 4.85319 19.1468C5.28579 19.5794 5.59267 20.1215 5.741 20.715L6 21.75L6.259 20.715C6.40725 20.1216 6.71398 19.5796 7.14639 19.147C7.5788 18.7144 8.12065 18.4075 8.714 18.259L9.75 18L8.714 17.741C8.12065 17.5925 7.5788 17.2856 7.14639 16.853C6.71398 16.4204 6.40725 15.8784 6.259 15.285L6 14.25Z" />
              <path className="path" strokeLinejoin="round" strokeLinecap="round" stroke="black" fill="black" d="M6.5 4L6.303 4.5915C6.24777 4.75718 6.15472 4.90774 6.03123 5.03123C5.90774 5.15472 5.75718 5.24777 5.5915 5.303L5 5.5L5.5915 5.697C5.75718 5.75223 5.90774 5.84528 6.03123 5.96877C6.15472 6.09226 6.24777 6.24282 6.303 6.4085L6.5 7L6.697 6.4085C6.75223 6.24282 6.84528 6.09226 6.96877 5.96877C7.09226 5.84528 7.24282 5.75223 7.4085 5.697L8 5.5L7.4085 5.303C7.24282 5.24777 7.09226 5.15472 6.96877 5.03123C6.84528 4.90774 6.75223 4.75718 6.697 4.5915L6.5 4Z" />
            </svg>
            <span className="text_button">{isLoading ? 'Creating Account...' : 'Sign Up'}</span>
          </SubmitButton>
        </StyledForm>

        <SocialSection>
          <SocialTitle>Or sign up with</SocialTitle>
          <GoogleAuthButton
            onSuccess={handleAuthSuccess}
            onError={(err) => setError(err?.message || 'Google sign-up failed.')}
            text="signup_with"
          />
        </SocialSection>

        <AgreementText>
          Already have an account? <Link to="/login">Log in here</Link>
        </AgreementText>
      </AuthCard>
    </AuthPageShell>
  );
};

export default Signup;
