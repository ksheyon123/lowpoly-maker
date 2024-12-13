"use client"
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useCoordinate } from '@/contexts/CoordinateContext';
import { createDot } from '@/meshes/dot';

const ThreeCanvas: React.FC = () => {
    const { state } = useCoordinate();
    const {coordinates} = state;
    const mountRef = useRef<HTMLDivElement | null>(null);

    const sceneRef = useRef<THREE.Scene>();
    const cameraRef = useRef<THREE.PerspectiveCamera>();
    const rendererRef = useRef<THREE.WebGLRenderer>();
    const controlsRef = useRef<OrbitControls>();

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
        // Add GridHelper
        const size = 20;  // Grid size
        const divisions = 20;  // Number of divisions
        const gridHelper = new THREE.GridHelper(size, divisions);
        scene.add(gridHelper);

        // Add AxesHelper
        const axesHelper = new THREE.AxesHelper(5); // Parameter defines the length of the axes
        scene.add(axesHelper);
        sceneRef.current = scene;
        cameraRef.current = camera;
        rendererRef.current = renderer;
        controlsRef.current = controls;
        return () => {
            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        }
    }, [])

    useEffect(() => { 
        if(mountRef.current) {
            const scene = sceneRef.current!;
            const camera = cameraRef.current!;
            const renderer = rendererRef.current!;
            const controls = controlsRef.current!;
    
            if(coordinates) {
                const {x, y, z} = coordinates
                const dot = createDot()
                dot.position.set(x, y, z)
                scene.add(dot)
            }

            // 카메라 위치 설정
            camera.position.set(15, 15, 15);
            camera.lookAt(0, 0, 0);
    
            // 애니메이션 루프
            let handleId : any;
            const animate = ()=>  {
                handleId = requestAnimationFrame(animate);
                console.log(scene.children.length)
                renderer.render(scene, camera);
                controls.update();
            }
            animate();
    
            // Cleanup on component unmount
            return () => {
                cancelAnimationFrame(handleId)
            };
        }
        
    }, [coordinates, mountRef.current]);

    return <div ref={mountRef} />;
};

export default ThreeCanvas; 