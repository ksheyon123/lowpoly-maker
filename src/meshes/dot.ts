import * as THREE from "three";

const createDot = () => {
    const geometry = new THREE.SphereGeometry( 0.2, 32, 16 ); 
    const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } ); 
    const sphere = new THREE.Mesh( geometry, material );
    return sphere;
}

export {
    createDot
}