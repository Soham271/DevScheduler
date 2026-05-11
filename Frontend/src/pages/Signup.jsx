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
            {isLoading ? 'Creating Account...' : 'Sign Up'}
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
