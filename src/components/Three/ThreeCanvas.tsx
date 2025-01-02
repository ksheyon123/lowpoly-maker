"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useCoordinate } from "@/contexts/CoordinateContext";
import { createDot } from "@/meshes/dot";
import { useThree } from "@/contexts/ThreeContext";
import {
  Point3D,
  createDelaunayTriangulation3D,
} from "@/utils/threeDimensionalDelaunayTriangulation";
import { IPoint3D, ICircumsphere, ITetrahedron } from "@/types";

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
      }

      // 카메라 위치 설정
      camera.position.set(15, 15, 15);
      camera.lookAt(0, 0, 0);

      // 테스트 사용 예시
      const testPoints3D: IPoint3D[] = [
        Point3D(0, 0, 0),
        Point3D(1, 0, 0),
        Point3D(0, 1, 0),
        Point3D(0, 0, 1),
        Point3D(1, 1, 1),
        Point3D(0.5, 0.5, 0.5),
      ];

      testPoints3D.forEach(({ x, y, z }) => {
        const dot = createDot();
        dot.position.set(x, y, z);
        scene.add(dot);
      });

      const triangles = createDelaunayTriangulation3D(testPoints3D);
      console.log(triangles);

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
