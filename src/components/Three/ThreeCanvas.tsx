"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry.js";
import { useCoordinate } from "@/contexts/CoordinateContext";
import { createDot } from "@/meshes/dot";
import { useThree } from "@/contexts/ThreeContext";

const ThreeCanvas: React.FC = () => {
  const { state } = useCoordinate();
  const { scene, camera, renderer, controls } = useThree();
  const { coordinates } = state;
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Set renderer size
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (mountRef.current) {
      if (coordinates) {
        const { x, y, z } = coordinates;
        const dot = createDot();
        dot.position.set(x, y, z);
        scene.add(dot);
      }

      // 카메라 위치 설정
      camera.position.set(15, 15, 15);
      camera.lookAt(0, 0, 0);

      // 애니메이션 루프
      let handleId: any;
      const animate = () => {
        handleId = requestAnimationFrame(animate);
        renderer.render(scene, camera);
        controls.update();
      };
      animate();

      // Cleanup on component unmount
      return () => {
        cancelAnimationFrame(handleId);
      };
    }
  }, [coordinates, mountRef.current]);

  return <div ref={mountRef} />;
};

export default ThreeCanvas;
