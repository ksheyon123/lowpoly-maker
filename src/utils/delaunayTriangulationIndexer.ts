import { IPoint, ITriangle, IDelaunayResult } from "@/types/index";

// Three.js 호환 Delaunay Triangulation 함수
export const createDelaunayTriangleIndex = (
  triangles: ITriangle[]
): IDelaunayResult => {
  // 1. 고유한 vertices 배열 생성
  const uniqueVertices: IPoint[] = [];
  const vertexIndices = new Map<string, number>();

  // 2. vertices와 indices 배열 준비
  const vertices: number[] = [];
  const indices: number[] = [];

  // 3. 각 삼각형에 대해 처리
  triangles.forEach((triangle) => {
    triangle.points.forEach((point) => {
      // 점을 문자열로 변환하여 고유성 체크
      const pointKey = `${point.x},${point.y}`;

      if (!vertexIndices.has(pointKey)) {
        // 새로운 vertex 추가
        vertexIndices.set(pointKey, vertices.length / 3);
        vertices.push(point.x, point.y, 0); // z좌표는 0으로 설정
      }

      // index 추가
      indices.push(vertexIndices.get(pointKey)!);
    });
  });

  return { vertices, indices };
};

import { IPoint3D, ITetrahedron } from "@/types/index";

// Three.js 호환 3D Delaunay Triangulation 인덱서
export const createDelaunayTetrahedronIndex = (
  tetrahedra: ITetrahedron[]
): IDelaunayResult => {
  // 1. 고유한 vertices 배열 생성
  const uniqueVertices: IPoint3D[] = [];
  const vertexIndices = new Map<string, number>();

  // 2. vertices와 indices 배열 준비
  const vertices: number[] = [];
  const indices: number[] = [];

  // 3. 각 사면체에 대해 처리
  tetrahedra.forEach((tetrahedron) => {
    const [p1, p2, p3, p4] = tetrahedron.points;

    // 사면체를 삼각형으로 분해 (총 4개의 삼각형면)
    const faces: [IPoint3D, IPoint3D, IPoint3D][] = [
      [p1, p2, p3], // 면 1
      [p1, p2, p4], // 면 2
      [p1, p3, p4], // 면 3
      [p2, p3, p4], // 면 4
    ];

    // 각 면을 처리
    faces.forEach((face) => {
      face.forEach((point) => {
        // 점을 문자열로 변환하여 고유성 체크
        const pointKey = `${point.x},${point.y},${point.z}`;

        if (!vertexIndices.has(pointKey)) {
          // 새로운 vertex 추가
          vertexIndices.set(pointKey, vertices.length / 3);
          vertices.push(point.x, point.y, point.z);
        }

        // index 추가
        indices.push(vertexIndices.get(pointKey)!);
      });
    });
  });

  return { vertices, indices };
};
