"use client"

import { useState } from 'react';
import FixedBottomBox from "@/components/common/FixedBottomBox";
import Toolbar from "@/components/common/Toolbar";
import ThreeCanvas from "@/components/Three/ThreeCanvas";

export default function Home() {
  const [isBottomBoxOpen, setIsBottomBoxOpen] = useState(false);

  const handleToolbarClick = () => {
    setIsBottomBoxOpen(true);
  };

  const handleCloseBottomBox = () => {
    setIsBottomBoxOpen(false);
  };
  
  return (
    <div>
      <ThreeCanvas />
      <Toolbar onIconClick={handleToolbarClick} />
      <FixedBottomBox 
        children={<></>}
        isOpen={isBottomBoxOpen} 
        onClose={handleCloseBottomBox} 
      />
    </div>
  );
}
