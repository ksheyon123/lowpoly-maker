"use client";

import { useState } from "react";
import {
  useCoordinate,
  CoordinateProvider,
} from "@/contexts/CoordinateContext";
import { ThreeContextProvider } from "@/contexts/ThreeContext";
import FixedBottomBox from "@/components/common/FixedBottomBox";
import Toolbar from "@/components/common/Toolbar";
import ThreeCanvas from "@/components/Three/ThreeCanvas";
import CoordinateInputForm from "@/components/common/CoordinateInputForm";

export default function Home() {
  return (
    <ThreeContextProvider>
      <CoordinateProvider>
        <HomeContent />
      </CoordinateProvider>
    </ThreeContextProvider>
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
    dispatch({ type: "ADD_COORDINATE", payload: coordinate });
  };

  return (
    <div>
      <ThreeCanvas />
      <Toolbar onIconClick={handleToolbarClick} />
      <FixedBottomBox isOpen={isBottomBoxOpen} onClose={handleCloseBottomBox}>
        <CoordinateInputForm onSubmit={onSubmit} />
      </FixedBottomBox>
    </div>
  );
}
