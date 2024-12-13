import React, { useState } from "react";
import styled from "styled-components";
import {
  FaBars,
  FaTimes,
  FaKeyboard,
  FaProjectDiagram,
  FaCheck,
} from "react-icons/fa";

interface ToolbarProps {
  onIconClick: () => void;
}

const Toolbar = ({ onIconClick }: ToolbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAlgorithmBox, setShowAlgorithmBox] = useState(false);
  const [selectedItem, setSelectedItems] = useState<string>("");

  const toggleToolbar = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setShowAlgorithmBox(false);
    }
  };

  const handleProjectClick = () => {
    setShowAlgorithmBox(!showAlgorithmBox);
  };

  const handleItemClick = (item: string) => {
    setSelectedItems((prev: string) => (prev === item ? "" : item));
  };

  const algorithms = [
    "Graham's Scan",
    "Jarvis's March",
    "QuickHull",
    "Divide and Conquer",
  ];

  return (
    <ToolbarContainer>
      <ToggleButton onClick={toggleToolbar}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </ToggleButton>
      <ToolbarContent $isOpen={isOpen}>
        <button onClick={onIconClick}>
          <FaKeyboard />
        </button>
        <div className="relative flex items-center">
          <button onClick={handleProjectClick}>
            <FaProjectDiagram />
          </button>
          {showAlgorithmBox && (
            <div className="absolute right-[60px] top-0 w-[300px] bg-white rounded-lg shadow-md p-2.5">
              <ul className="list-none p-0 m-0">
                {algorithms.map((item) => (
                  <li
                    key={item}
                    className="px-4 py-3 cursor-pointer rounded hover:bg-gray-100 transition-colors flex justify-between items-center"
                    onClick={() => handleItemClick(item)}
                  >
                    {item}
                    {selectedItem === item && (
                      <FaCheck className="text-green-500" />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
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
  width: ${({ $isOpen }) => ($isOpen ? "60px" : "0")};
  height: 400px;
  transition: width 0.3s ease-in-out;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);

  button {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 0;
    margin: 5px;

    svg {
      width: 30px;
      height: 30px;
    }

    &:hover {
      background: #f5f5f5;
    }
  }
`;

export default Toolbar;
