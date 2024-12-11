import * as THREE from 'three';

type Triangle = [THREE.Vector3, THREE.Vector3, THREE.Vector3];

// Function to calculate the distance between two points
function distance(a: THREE.Vector3, b: THREE.Vector3): number {
  return a.distanceTo(b);
}

// Function to check if two triangles intersect
function trianglesIntersect(t1: Triangle, t2: Triangle): boolean {
  // Implement the SAT (Separating Axis Theorem) or another method to check triangle intersection.
  return false; // Placeholder: Implement proper triangle intersection logic.
}

// Function to generate non-intersecting triangles from a flat array of vertices
function generateTrianglesFromVertices(vertices: number[]) {
    if (vertices.length % 3 !== 0) {
        throw new Error("The vertices array must have a length that is a multiple of 3.");
    }

    const vectorArray: THREE.Vector3[] = [];

    for (let i = 0; i < vertices.length; i += 3) {
        vectorArray.push(new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]));
    }

    const triangles: Triangle[] = [];

    if (vectorArray.length < 3) {
        throw new Error("At least 3 vertices are required to form a triangle.");
    }

    const usedIndices = new Set<number>();

    for (let i = 0; i < vectorArray.length; i++) {
        if (usedIndices.has(i)) continue;

        let closest: [number, number] | null = null;

        for (let j = 0; j < vectorArray.length; j++) {
            if (i === j || usedIndices.has(j)) continue;
            for (let k = 0; k < vectorArray.length; k++) {
                if (i === k || j === k || usedIndices.has(k)) continue;

                const dist = distance(vectorArray[i], vectorArray[j]) +
                             distance(vectorArray[j], vectorArray[k]) +
                             distance(vectorArray[k], vectorArray[i]);

                if (!closest || dist < closest[1]) {
                    closest = [j, k]; // Store indices of the closest points
                }
            }
        }

        // Create a new triangle from the closest points
        if (closest) {
            const newTriangle: Triangle = [
                vectorArray[i],
                vectorArray[closest[0]],
                vectorArray[closest[1]]
            ];

            // Check if the new triangle intersects any existing triangle
            let intersects = false;
            for (const triangle of triangles) {
                if (trianglesIntersect(triangle, newTriangle)) {
                    intersects = true;
                    break;
                }
            }

            // If no intersection, add the new triangle
            if (!intersects) {
                triangles.push(newTriangle);
                usedIndices.add(i); // Mark the index as used
                usedIndices.add(closest[0]); // Mark the closest points as used
                usedIndices.add(closest[1]);
            }
        }
    }
}