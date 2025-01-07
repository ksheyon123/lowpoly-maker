"use client";
import React, { useEffect, useRef, useState } from "react";
import { CoordinateProvider } from "@/contexts/CoordinateContext";
import { ThreeContextProvider, useThree } from "@/contexts/ThreeContext";
import { initController } from "@/meshes/pad";
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
  const { scene, camera, renderer, controls } = useThree();
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Set renderer size
    if (!!mountRef.current?.appendChild) {
      mountRef.current.appendChild(renderer.domElement);
    }
  }, []);

  useEffect(() => {
    if (mountRef.current) {
      initController(scene, camera as any, renderer);
    }

    return () => {
      renderer.dispose();
    };
  }, [mountRef.current]);

  return <div ref={mountRef} />;
}
