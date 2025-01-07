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
import { IPoint3D, ICircumsphere, ITetrahedron, IPoint } from "@/types";
import {
  createDelaunayTriangulation,
  Point,
} from "@/utils/twoDimensionalDelaunayTriangulation";
import { createDelaunayTriangleIndex } from "@/utils/delaunayTriangulationIndexer";

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
      const testPoints: IPoint[] = [
        Point(0, 0),
        Point(1, 0),
        Point(0, 1),
        Point(1, 1),
      ];

      testPoints.forEach(({ x, y }) => {
        const dot = createDot();
        dot.position.set(x, y, 0);
        scene.add(dot);
      });

      const triangles = createDelaunayTriangulation(testPoints);
      const { indices, vertices } = createDelaunayTriangleIndex(triangles);

      const bufferGeometry = new THREE.BufferGeometry();
      bufferGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(vertices, 3)
      );
      bufferGeometry.setIndex(indices);
      const material = new THREE.MeshPhongMaterial({
        color: 0x156289,
        side: THREE.DoubleSide,
        flatShading: true,
        transparent: true,
        opacity: 0.8,
      });
      const mesh = new THREE.Mesh(bufferGeometry, material);
      scene.add(mesh);
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
