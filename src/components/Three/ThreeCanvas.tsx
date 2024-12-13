"use client"
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useCoordinate } from '@/contexts/CoordinateContext';

const ThreeCanvas: React.FC = () => {
    const { state, dispatch } = useCoordinate();
    const mountRef = useRef<HTMLDivElement | null>(null);

    // useEffect(() => {
    //     if(state) {
    //         console.log(state.coordinates)
    //         dispatch({ type: 'CLEAR_COORDINATES' });
    //     }
    // }, [state]);

    useEffect(() => { 
        // Scene, Camera, Renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        // Set renderer size
        renderer.setSize(window.innerWidth, window.innerHeight);
        if (mountRef.current) {
            mountRef.current.appendChild(renderer.domElement);
        }
        const controls = new OrbitControls( camera, renderer.domElement );

        // 임의의 N개 정점을 생성
        // const N = 100;
        // const points = Array.from({ length: N }, () => new THREE.Vector3(
        //     Math.random() * 10,
        //     Math.random() * 10,
        //     Math.random() * 10
        // ));

        const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1), new THREE.Vector3(2, 0, 0), new THREE.Vector3(3, 1, 1), new THREE.Vector3(4, 0, 0), new THREE.Vector3(4, 0, 1) ]
        // Convex Hull 알고리즘을 위한 QuickHull 사용
        const convexGeometry = new ConvexGeometry(points);

        // Mesh 생성
        const material = new THREE.MeshBasicMaterial({ color: 0x00aaff, wireframe: true });
        const mesh = new THREE.Mesh(convexGeometry, material);

        // Mesh를 장면에 추가
        scene.add(mesh);

        // 카메라 위치 설정
        camera.position.set(15, 15, 15);
        camera.lookAt(0, 0, 0);

        // Add GridHelper
        const size = 20;  // Grid size
        const divisions = 20;  // Number of divisions
        const gridHelper = new THREE.GridHelper(size, divisions);
        scene.add(gridHelper);

        // Add AxesHelper
        const axesHelper = new THREE.AxesHelper(5); // Parameter defines the length of the axes
        scene.add(axesHelper);

        // 애니메이션 루프
        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
            controls.update();
        }
        animate();

        // Cleanup on component unmount
        return () => {
            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    return <div ref={mountRef} />;
};

export default ThreeCanvas; 