import { IPoint3D, ICircumsphere, ITetrahedron } from "@/types/index";

interface ITriangleFace {
  points: [IPoint3D, IPoint3D, IPoint3D];
  normal?: {
    x: number;
    y: number;
    z: number;
  };
}

interface IFaceCount {
  face: string;
  count: number;
}

// 삼각형 면을 문자열로 변환 (정렬된 형태)
const triangleFaceToString = (
  points: [IPoint3D, IPoint3D, IPoint3D]
): string => {
  // 점들을 정렬하여 동일한 면이 항상 같은 문자열을 생성하도록 함
  const sortedPoints = [...points].sort((a, b) =>
    a.x === b.x ? (a.y === b.y ? a.z - b.z : a.y - b.y) : a.x - b.x
  );
  return JSON.stringify(sortedPoints);
};

// 삼각형 면의 법선 벡터 계산
const calculateNormal = (face: ITriangleFace) => {
  const [p1, p2, p3] = face.points;

  // 두 벡터 계산
  const v1 = {
    x: p2.x - p1.x,
    y: p2.y - p1.y,
    z: p2.z - p1.z,
  };

  const v2 = {
    x: p3.x - p1.x,
    y: p3.y - p1.y,
    z: p3.z - p1.z,
  };

  // 외적 계산
  return {
    x: v1.y * v2.z - v1.z * v2.y,
    y: v1.z * v2.x - v1.x * v2.z,
    z: v1.x * v2.y - v1.y * v2.x,
  };
};

// 면이 외부를 향하는지 확인
const isOutwardFacing = (face: ITriangleFace, center: IPoint3D): boolean => {
  const normal = calculateNormal(face);
  const centerToFace = {
    x: face.points[0].x - center.x,
    y: face.points[0].y - center.y,
    z: face.points[0].z - center.z,
  };

  // 내적이 양수면 외부를 향함
  return (
    normal.x * centerToFace.x +
      normal.y * centerToFace.y +
      normal.z * centerToFace.z >
    0
  );
};

// 외부 면만 추출하는 함수
export const extractSurfaceMesh = (
  tetrahedra: ITetrahedron[]
): ITriangleFace[] => {
  // 면 카운트를 위한 맵
  const faceCountMap = new Map<string, IFaceCount>();

  // 모든 사면체의 중심점 계산
  const center = tetrahedra.reduce(
    (acc, tetra) => {
      const points = tetra.points;
      return {
        x: acc.x + points.reduce((sum, p) => sum + p.x, 0) / 4,
        y: acc.y + points.reduce((sum, p) => sum + p.y, 0) / 4,
        z: acc.z + points.reduce((sum, p) => sum + p.z, 0) / 4,
      };
    },
    { x: 0, y: 0, z: 0 }
  );

  center.x /= tetrahedra.length;
  center.y /= tetrahedra.length;
  center.z /= tetrahedra.length;

  // 각 사면체의 면을 순회하며 카운트
  tetrahedra.forEach((tetra) => {
    const [p1, p2, p3, p4] = tetra.points;
    const faces: [IPoint3D, IPoint3D, IPoint3D][] = [
      [p1, p2, p3],
      [p1, p2, p4],
      [p1, p3, p4],
      [p2, p3, p4],
    ];

    faces.forEach((facePoints) => {
      const faceStr = triangleFaceToString(facePoints);
      const current = faceCountMap.get(faceStr);

      if (current) {
        current.count += 1;
      } else {
        faceCountMap.set(faceStr, {
          face: faceStr,
          count: 1,
        });
      }
    });
  });

  // 한 번만 나타나는 면(외부 면)을 필터링
  return Array.from(faceCountMap.values())
    .filter(({ count }) => count === 1)
    .map(({ face }) => {
      const points = JSON.parse(face) as [IPoint3D, IPoint3D, IPoint3D];
      const triangleFace: ITriangleFace = { points };

      // 면이 외부를 향하도록 점 순서 조정
      if (!isOutwardFacing(triangleFace, center)) {
        triangleFace.points = [points[0], points[2], points[1]];
      }

      triangleFace.normal = calculateNormal(triangleFace);
      return triangleFace;
    });
};
