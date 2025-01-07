import * as THREE from "three";

export const createPadButton = (color: number, radius: number) => {
  const geometry = new THREE.CylinderGeometry(radius, radius, 20, 32);
  const material = new THREE.MeshBasicMaterial({ color });
  const cylinder = new THREE.Mesh(geometry, material);
  return cylinder;
};
