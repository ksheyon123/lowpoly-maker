import React from 'react';
import styled from 'styled-components';

interface FixedBottomBoxProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

const FixedBottomBox = ({ children, isOpen, onClose }: FixedBottomBoxProps) => {
  return (
    <Container $isOpen={isOpen}>
      <CloseButton onClick={onClose}>×</CloseButton>
      {children}
    </Container>
  );
};

const Container = styled.div<{$isOpen : boolean;}>`
  display : ${({ $isOpen }) => ($isOpen ? 'block' : 'hidden')};
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  padding: 20px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 20px 20px 0 0;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

export default FixedBottomBox;