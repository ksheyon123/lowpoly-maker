"use client";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { CoordinateProvider } from "@/contexts/CoordinateContext";
import { ThreeContextProvider, useThree } from "@/contexts/ThreeContext";
import {
  createDelaunayTriangulation,
  Point,
} from "@/utils/twoDimensionalDelaunayTriangulation";
import {
  createDelaunayTriangulation3D,
  Point3D,
} from "@/utils/threeDimensionalDelaunayTriangulation";
import {
  createDelaunayTetrahedronIndex,
  createDelaunayTriangleIndex,
} from "@/utils/delaunayTriangulationIndexer";
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
      // 카메라 위치 설정
      camera.position.set(15, 15, 15);
      camera.lookAt(0, 0, 0);
      createTriangles();

      // 애니메이션 루프
      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };

      animate();
    }

    return () => {
      renderer.dispose();
    };
  }, [mountRef.current]);

  const createTriangles = () => {
    const points = [
      Point(0, 0),
      Point(1, 0),
      Point(0, 1),
      Point(1, 1),
      Point(1, 3),
      Point(2, 5),
      Point(-1, 0),
    ];
    const triangles = createDelaunayTriangulation(points);
    const { vertices, indices } = createDelaunayTriangleIndex(triangles);
    const bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    bufferGeometry.setIndex(indices);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      side: THREE.DoubleSide,
      wireframe: true,
    });
    const mesh = new THREE.Mesh(bufferGeometry, material);
    scene.add(mesh);
  };

  const createTetrahedrons = () => {
    const points = [
      Point3D(0, 0, 0),
      Point3D(1, 0, 0),
      Point3D(0, 1, 0),
      Point3D(1, 1, 1),
      Point3D(0, 0, 1),
    ];
    const tetrahedrons = createDelaunayTriangulation3D(points);
    const { vertices, indices } = createDelaunayTetrahedronIndex(tetrahedrons);
    const bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    bufferGeometry.setIndex(indices);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(bufferGeometry, material);
    scene.add(mesh);
  };

  return <div ref={mountRef} />;
}
