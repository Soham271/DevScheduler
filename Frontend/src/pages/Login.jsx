import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
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
  HelperLink,
  HelperRow,
  InlineMessage,
  SocialSection,
  SocialTitle,
  StyledForm,
  SubmitButton,
} from '../components/AuthFormStyles';

const Login = ({ setIsAuthenticated, setNeedsOnboarding }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setInfoMsg(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleAuthSuccess = (response) => {
    const { needsOnboarding } = processAuthResponse(response);
    setIsAuthenticated(true);
    setNeedsOnboarding(needsOnboarding);
    navigate('/dashboard');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setInfoMsg('');

    try {
      const response = await api.post('/login', { email, password });
      handleAuthSuccess(response);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPageShell>
      <AuthCard>
        <AuthHeading>Sign In</AuthHeading>
        <AuthSubtext>Welcome back to DevFlow.</AuthSubtext>

        {infoMsg && <InlineMessage $tone="info">{infoMsg}</InlineMessage>}
        {error && <InlineMessage $tone="error">{error}</InlineMessage>}

        <StyledForm onSubmit={handleLogin}>
          <FieldGroup>
            <FieldLabel htmlFor="login-email">Email Address</FieldLabel>
            <AuthInput
              required
              type="email"
              name="email"
              id="login-email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="login-password">Password</FieldLabel>
            <AuthInput
              required
              type="password"
              name="password"
              id="login-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </FieldGroup>

          <HelperRow>
            <HelperLink href="#">Forgot Password ?</HelperLink>
          </HelperRow>

          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </SubmitButton>
        </StyledForm>

        <SocialSection>
          <SocialTitle>Or sign in with</SocialTitle>
          <GoogleAuthButton
            onSuccess={handleAuthSuccess}
            onError={(err) => setError(err?.message || 'Google sign-in failed.')}
            text="signin_with"
          />
        </SocialSection>

        <AgreementText>
          Don&apos;t have an account? <Link to="/signup">Sign up here</Link>
        </AgreementText>
      </AuthCard>
    </AuthPageShell>
  );
};

export default Login;
