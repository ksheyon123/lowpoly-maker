import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const ThreeContext = createContext<
  | {
      scene: THREE.Scene;
      camera: THREE.Camera;
      renderer: THREE.WebGLRenderer;
      controls: OrbitControls;
    }
  | undefined
>(undefined);

export const ThreeContextProvider = ({ children }: { children: ReactNode }) => {
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const controlsRef = useRef<OrbitControls>();

  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Add GridHelper
    const size = 20; // Grid size
    const divisions = 20; // Number of divisions
    const gridHelper = new THREE.GridHelper(size, divisions);
    scene.add(gridHelper);

    // Add AxesHelper
    const axesHelper = new THREE.AxesHelper(5); // Parameter defines the length of the axes
    scene.add(axesHelper);

    const controls = new OrbitControls(camera, renderer.domElement);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    controlsRef.current = controls;
    setIsMounted(true);
  }, []);
  // Three.js 관련 객체 설정 안된 상태
  if (!isMounted) return <>Loading...</>;

  if (isMounted) {
    return (
      <ThreeContext.Provider
        value={{
          scene: sceneRef.current!,
          camera: cameraRef.current!,
          renderer: rendererRef.current!,
          controls: controlsRef.current!,
        }}
      >
        {children}
      </ThreeContext.Provider>
    );
  }
};

export const useThree = () => {
  const context = useContext(ThreeContext);
  if (context === undefined) {
    throw new Error("useCoordinate must be used within a CoordinateProvider");
  }
  return context;
};
