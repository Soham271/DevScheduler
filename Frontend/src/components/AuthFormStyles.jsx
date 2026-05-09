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
  background: linear-gradient(0deg, rgb(255, 255, 255) 0%, rgb(244, 247, 251) 100%);
  border-radius: 40px;
  padding: 28px 32px;
  border: 5px solid rgb(255, 255, 255);
  box-shadow: rgba(133, 189, 215, 0.88) 0px 30px 30px -20px;
`;

export const AuthHeading = styled.h2`
  margin: 0;
  text-align: center;
  font-weight: 900;
  font-size: clamp(2rem, 4vw, 2.2rem);
  color: rgb(16, 137, 211);
`;

export const AuthSubtext = styled.p`
  margin: 0.55rem 0 0;
  text-align: center;
  color: rgb(93, 116, 137);
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
  margin-bottom: 0.45rem;
  font-size: 0.83rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: rgb(75, 99, 119);
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
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(170, 170, 170);
  margin-bottom: 0.75rem;
`;

export const SubmitButton = styled.button`
  --black-700: hsla(0 0% 12% / 1);
  --border_radius: 9999px;
  --transtion: 0.3s ease-in-out;

  cursor: pointer;
  position: relative;
  width: 100%;
  margin-top: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transform-origin: center;
  padding: 1rem 2rem;
  background-color: transparent;
  border: none;
  border-radius: var(--border_radius);
  transform: scale(calc(1 + (var(--active, 0) * 0.1)));
  transition: transform var(--transtion), opacity 0.2s ease-in-out;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    background-color: var(--black-700);
    border-radius: var(--border_radius);
    box-shadow: inset 0 0.5px hsl(0, 0%, 100%), inset 0 -1px 2px 0 hsl(0, 0%, 0%),
      0px 4px 10px -4px hsla(0 0% 0% / calc(1 - var(--active, 0))),
      0 0 0 calc(var(--active, 0) * 0.375rem) hsl(260 97% 50% / 0.75);
    transition: all var(--transtion);
    z-index: 0;
  }

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    background-color: hsla(260 97% 61% / 0.75);
    background-image: radial-gradient(at 51% 89%, hsla(266, 45%, 74%, 1) 0px, transparent 50%),
      radial-gradient(at 100% 100%, hsla(266, 36%, 60%, 1) 0px, transparent 50%),
      radial-gradient(at 22% 91%, hsla(266, 36%, 60%, 1) 0px, transparent 50%);
    background-position: top;
    opacity: var(--active, 0);
    border-radius: var(--border_radius);
    transition: opacity var(--transtion);
    z-index: 2;
  }

  &:is(:hover, :focus-visible):not(:disabled) {
    --active: 1;
  }

  &:active:not(:disabled) {
    transform: scale(1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .dots_border {
    --size_border: calc(100% + 2px);
    overflow: hidden;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: var(--size_border);
    height: var(--size_border);
    background-color: transparent;
    border-radius: var(--border_radius);
    z-index: -10;
  }

  .dots_border::before {
    content: "";
    position: absolute;
    top: 30%;
    left: 50%;
    transform-origin: left;
    transform: rotate(0deg);
    width: 100%;
    height: 2rem;
    background-color: white;
    mask: linear-gradient(transparent 0%, white 120%);
    animation: rotate 2s linear infinite;
  }

  @keyframes rotate {
    to {
      transform: rotate(360deg);
    }
  }

  .sparkle {
    position: relative;
    z-index: 10;
    width: 1.2rem;
  }

  .sparkle .path {
    fill: currentColor;
    stroke: currentColor;
    transform-origin: center;
    color: hsl(0, 0%, 100%);
  }

  &:is(:hover, :focus-visible):not(:disabled) .sparkle .path {
    animation: path 1.5s linear 0.5s infinite;
  }

  .sparkle .path:nth-child(1) {
    --scale_path_1: 1.2;
  }
  .sparkle .path:nth-child(2) {
    --scale_path_2: 1.2;
  }
  .sparkle .path:nth-child(3) {
    --scale_path_3: 1.2;
  }

  @keyframes path {
    0%,
    34%,
    71%,
    100% {
      transform: scale(1);
    }
    17% {
      transform: scale(var(--scale_path_1, 1));
    }
    49% {
      transform: scale(var(--scale_path_2, 1));
    }
    83% {
      transform: scale(var(--scale_path_3, 1));
    }
  }

  .text_button {
    position: relative;
    z-index: 10;
    background-image: linear-gradient(90deg, hsla(0 0% 100% / 1) 0%, hsla(0 0% 100% / var(--active, 0)) 120%);
    background-clip: text;
    font-size: 1rem;
    color: transparent;
    font-weight: 700;
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
  padding: 0.95rem 0.9rem 0.8rem;
  font-size: 1rem;
  color: #23415a;
  background: transparent;
  border: none;
  border-bottom: 2px solid rgba(129, 167, 196, 0.45);
  box-shadow: 0 4px 10px rgba(161, 196, 221, 0.14);

  &::placeholder {
    color: rgb(170, 170, 170);
  }

  &:focus {
    outline: none;
  }

  &:focus + span {
    width: 100%;
  }
`;

const InputBorder = styled.span`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 0%;
  height: 3px;
  background: linear-gradient(90deg, #ff6464 0%, #ffbf59 50%, #47c9ff 100%);
  transition: width 0.4s cubic-bezier(0.42, 0, 0.58, 1);
`;

export const AuthInput = React.forwardRef(function AuthInput(props, ref) {
  return (
    <InputShell>
      <StyledTextInput ref={ref} {...props} />
      <InputBorder />
    </InputShell>
  );
});
