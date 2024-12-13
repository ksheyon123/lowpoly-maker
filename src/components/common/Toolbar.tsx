import React, { useState } from 'react';
import styled from 'styled-components';
import { FaBars, FaTimes, FaKeyboard } from 'react-icons/fa';

interface ToolbarProps {
  onIconClick: () => void;
}

const Toolbar = ({ onIconClick }: ToolbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleToolbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <ToolbarContainer>
      <ToggleButton onClick={toggleToolbar}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </ToggleButton>
      <ToolbarContent $isOpen={isOpen}>
        <button onClick={onIconClick}><FaKeyboard /></button>
        <button onClick={onIconClick}>아이콘2</button>
        {/* 여기에 툴바 내용을 추가하세요 */}
      </ToolbarContent>
    </ToolbarContainer>
  );
};

const ToolbarContainer = styled.div`
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;
  display: flex;
  align-items: flex-start;
`;

const ToggleButton = styled.button`
  background: #ffffff;
  border: none;
  border-radius: 8px 0 0 8px;
  padding: 12px;
  cursor: pointer;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #f5f5f5;
  }
`;

const ToolbarContent = styled.div<{ $isOpen: boolean }>`
  background: #ffffff;
  width: ${({ $isOpen }) => ($isOpen ? '60px' : '0')};
  height: 400px;
  transition: width 0.3s ease-in-out;
  overflow: hidden;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
`;

export default Toolbar;