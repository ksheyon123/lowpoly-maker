"use client";

import { useEffect, useState } from "react";
import { Coordinate } from "@/types/coordinate";
import {
  useCoordinate,
  CoordinateProvider,
} from "@/contexts/CoordinateContext";
import FixedBottomBox from "@/components/common/FixedBottomBox";
import Toolbar from "@/components/common/Toolbar";
import ThreeCanvas from "@/components/Three/ThreeCanvas";
import Input from "@/components/common/Input";
import CoordinateInputForm from "@/components/common/CoordinateInputForm";
import { ThreeContextProvider } from "@/contexts/ThreeContext";
import { quickHull } from "@/utils/algorithm";

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

  useEffect(() => {
    const points: [number, number][] = [
      [0, 0],
      [1, 1],
      [2, 0],
      [2, 2],
      [1, -1],
      [0, 2],
    ];
    const q = quickHull(points);
    console.log(q);
  }, []);

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
