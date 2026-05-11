import React from 'react';
import styled from 'styled-components';

export const AuthPageShell = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 2rem 1rem;
`;

export const AuthCard = styled.div`
  width: min(100%, 420px);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95));
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 24px;
  padding: 2.5rem 2rem;
  box-shadow: 0 25px 80px rgba(0,0,0,0.08), 0 0 60px rgba(14, 165, 233, 0.05), inset 0 1px 0 rgba(255,255,255,1);
  backdrop-filter: blur(12px);
`;

export const AuthHeading = styled.h2`
  margin: 0;
  text-align: center;
  font-weight: 800;
  font-size: clamp(1.8rem, 4vw, 2.2rem);
  color: #0f172a;
`;

export const AuthSubtext = styled.p`
  margin: 0.55rem 0 0;
  text-align: center;
  color: rgba(71, 85, 105, 0.8);
  font-size: 0.95rem;
`;

export const StyledForm = styled.form`
  margin-top: 1.6rem;
`;

export const FieldGroup = styled.div`
  margin-top: 1rem;
`;

export const FieldLabel = styled.label`
  display: block;
  margin-bottom: 0.4rem;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: rgba(71, 85, 105, 0.8);
`;

export const InlineMessage = styled.div`
  margin-top: 1rem;
  padding: 0.85rem 1rem;
  border-radius: 16px;
  font-size: 0.9rem;
  text-align: center;
  background: ${({ $tone }) => ($tone === 'error' ? 'rgb(254, 242, 242)' : 'rgb(239, 246, 255)')};
  color: ${({ $tone }) => ($tone === 'error' ? 'rgb(220, 38, 38)' : 'rgb(3, 105, 161)')};
  border: 1px solid ${({ $tone }) => ($tone === 'error' ? 'rgb(254, 202, 202)' : 'rgb(186, 230, 253)')};
`;

export const HelperRow = styled.div`
  display: flex;
  justify-content: ${({ $align }) => $align || 'flex-start'};
  margin-top: 0.85rem;
`;

export const HelperText = styled.span`
  font-size: 0.78rem;
  color: ${({ $tone }) => ($tone === 'error' ? '#dc2626' : '#5d7489')};
  font-weight: ${({ $tone }) => ($tone === 'error' ? 700 : 500)};
`;

export const HelperLink = styled.a`
  font-size: 0.78rem;
  color: #0099ff;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const SocialSection = styled.div`
  margin-top: 1.8rem;
`;

export const SocialTitle = styled.span`
  display: block;
  text-align: center;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(100, 116, 139, 0.8);
  margin-bottom: 0.75rem;
  font-weight: 600;
`;

export const SubmitButton = styled.button`
  width: 100%;
  padding: 0.85rem;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #11729b, #0ea5e9);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(14, 165, 233, 0.3);
  transition: all 0.25s ease;
  margin-top: 1.4rem;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover:not(:disabled) {
    transform: scale(1.02);
  }
  
  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export const AgreementText = styled.p`
  margin: 1rem 0 0;
  text-align: center;
  color: #5d7489;
  font-size: 0.82rem;

  a {
    color: #0099ff;
    text-decoration: none;
    font-weight: 600;
  }

  a:hover {
    text-decoration: underline;
  }
`;

const InputShell = styled.div`
  position: relative;
`;

const StyledTextInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 0.8rem 1rem;
  font-size: 0.95rem;
  color: #0f172a;
  background: rgba(241, 245, 249, 0.6);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px;
  transition: all 0.25s ease;

  &::placeholder {
    color: rgba(148, 163, 184, 0.6);
  }

  &:focus {
    outline: none;
    border-color: #0ea5e9;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
  }
`;

export const AuthInput = React.forwardRef(function AuthInput(props, ref) {
  return (
    <InputShell>
      <StyledTextInput ref={ref} {...props} />
    </InputShell>
  );
});
