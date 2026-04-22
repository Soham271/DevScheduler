import React from 'react';
import styled from 'styled-components';

const ActionButton = ({ children, onClick, disabled, type = 'button', className = '' }) => {
  return (
    <Wrapper className={className}>
      <button onClick={onClick} disabled={disabled} type={type}>
        {children}
      </button>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: inline-flex;
  button {
    padding: 0.65rem 1.5rem;
    border-radius: 30em;
    font-size: 14px;
    font-family: inherit;
    font-weight: 600;
    border: none;
    position: relative;
    overflow: hidden;
    z-index: 1;
    cursor: pointer;
    color: #1e293b;
    background: #fff;
    box-shadow: 4px 4px 10px #d1d5db, -4px -4px 10px #ffffff;
    transition: color .3s ease, box-shadow .3s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
  }
  button::before {
    content: '';
    width: 0;
    height: 100%;
    border-radius: 30em;
    position: absolute;
    top: 0;
    left: 0;
    background-image: linear-gradient(to right, #0fd850 0%, #f9f047 100%);
    transition: .4s ease;
    display: block;
    z-index: -1;
  }
  button:hover:not(:disabled)::before { width: 100%; }
  button:hover:not(:disabled) { color: #1a1a2e; box-shadow: 4px 4px 14px #c5c5c5, -4px -4px 14px #ffffff; }
  button:disabled { opacity: .5; cursor: not-allowed; }
  button:active:not(:disabled) { transform: scale(.97); }
`;

export default ActionButton;
