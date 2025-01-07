import { useEffect, useCallback, useRef } from "react";
import * as THREE from "three";
import { createPadButton } from "@/meshes/padButton";

// hooks/usePadButtonState.ts
export const usePadButtonState = (initColor: number) => {
  const padButtonRef = useRef<THREE.Mesh>();

  useEffect(() => {
    if (!padButtonRef.current) {
      padButtonRef.current = createPadButton(initColor, 1);
    }
  }, [initColor]);

  return padButtonRef;
};

// hooks/usePadButtonPosition.ts
export const usePadButtonPosition = (padButton: THREE.Mesh) => {
  const updatePosition = useCallback(
    (newPosition: THREE.Vector3) => {
      if (padButton) {
        padButton.position.copy(newPosition);
      }
    },
    [padButton]
  );

  return updatePosition;
};

// hooks/usePadButtonKeyboardControl.ts
export const usePadButtonKeyboardControl = (
  padButton: THREE.Mesh,
  updatePosition: (position: THREE.Vector3) => void,
  activeKey: string
) => {
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.code === activeKey) {
        // 키보드 이벤트에 따른 위치 업데이트 로직
        updatePosition(new THREE.Vector3(/* 새로운 위치 */));
      }
    };

    const handleKeyup = (e: KeyboardEvent) => {
      if (e.code === activeKey) {
        // 키보드 이벤트에 따른 위치 업데이트 로직
        updatePosition(new THREE.Vector3(/* 새로운 위치 */));
      }
    };

    window.addEventListener("keydown", handleKeydown);
    window.addEventListener("keyup", handleKeyup);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("keyup", handleKeyup);
    };
  }, [activeKey, updatePosition]);
};
