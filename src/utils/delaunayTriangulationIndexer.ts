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
