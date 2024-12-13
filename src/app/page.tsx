"use client"

import { useState } from 'react';
import { Coordinate } from '@/types/coordinate';
import { useCoordinate, CoordinateProvider } from '@/contexts/CoordinateContext';
import FixedBottomBox from "@/components/common/FixedBottomBox";
import Toolbar from "@/components/common/Toolbar";
import ThreeCanvas from "@/components/Three/ThreeCanvas";
import Input from '@/components/common/Input';
import CoordinateInputForm from '@/components/common/CoordinateInputForm';

export default function Home() {
  return (
    <CoordinateProvider>
      <HomeContent />
    </CoordinateProvider>
  );
}

function HomeContent() {
  const [isBottomBoxOpen, setIsBottomBoxOpen] = useState(false);
  const { dispatch } = useCoordinate();

  const handleToolbarClick = () => {
    setIsBottomBoxOpen(true);
  };

  const handleCloseBottomBox = () => {
    setIsBottomBoxOpen(false);
  };

  const onSubmit = (coordinate: any) => {
    dispatch({ type: 'ADD_COORDINATE', payload: coordinate });
  };

  return (
    <div>
      <ThreeCanvas />
      <Toolbar onIconClick={handleToolbarClick} />
      <FixedBottomBox 
        isOpen={isBottomBoxOpen} 
        onClose={handleCloseBottomBox} 
      >
        <CoordinateInputForm onSubmit={onSubmit} />
      </FixedBottomBox>
    </div>
  );
}
