/**
 * 3차원 들로네 삼각분할(3D Delaunay Triangulation)은 3차원 공간에서 주어진 점들을 사면체로 분할하는 기법입니다.
 * 주요 특성:
 * 1. 외접구 특성 (Circumsphere Property):
 *    - 각 사면체의 외접구 내부에 다른 어떤 점도 포함하지 않습니다.
 * 2. 최적 형상:
 *    - 생성된 사면체들은 가능한 한 정사면체에 가까운 형태를 가집니다.
 * 3. 볼록 껍질(Convex Hull):
 *    - 점 집합의 3차원 볼록 껍질 내부의 모든 공간을 사면체로 채웁니다.
 */

// 기본 타입 정의
interface IPoint3D {
  x: number;
  y: number;
  z: number;
}

interface ICircumsphere {
  center: IPoint3D;
  radius: number;
}

interface ITetrahedron {
  points: [IPoint3D, IPoint3D, IPoint3D, IPoint3D];
  circumsphere: () => ICircumsphere | null;
}

// [변경] 수치 안정성을 위한 상수 추가
const EPSILON = 1e-10;
const MIN_VOLUME = 1e-12;

// [변경] 볼륨 계산 함수 추가
const calculateVolume = (
  p1: IPoint3D,
  p2: IPoint3D,
  p3: IPoint3D,
  p4: IPoint3D
): number => {
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
  const v3 = {
    x: p4.x - p1.x,
    y: p4.y - p1.y,
    z: p4.z - p1.z,
  };

  return Math.abs(
    (v1.x * (v2.y * v3.z - v3.y * v2.z) -
      v1.y * (v2.x * v3.z - v3.x * v2.z) +
      v1.z * (v2.x * v3.y - v3.x * v2.y)) /
      6
  );
};

// [변경] 점 정규화 함수 추가
const normalizePoints = (
  points: IPoint3D[]
): [IPoint3D[], (p: IPoint3D) => IPoint3D] => {
  const minX = Math.min(...points.map((p) => p.x));
  const minY = Math.min(...points.map((p) => p.y));
  const minZ = Math.min(...points.map((p) => p.z));
  const maxX = Math.max(...points.map((p) => p.x));
  const maxY = Math.max(...points.map((p) => p.y));
  const maxZ = Math.max(...points.map((p) => p.z));

  const scale = Math.max(maxX - minX, maxY - minY, maxZ - minZ);

  const normalizedPoints = points.map((p) => ({
    x: (p.x - minX) / scale,
    y: (p.y - minY) / scale,
    z: (p.z - minZ) / scale,
  }));

  const denormalize = (p: IPoint3D): IPoint3D => ({
    x: p.x * scale + minX,
    y: p.y * scale + minY,
    z: p.z * scale + minZ,
  });

  return [normalizedPoints, denormalize];
};

// 점 생성 팩토리 함수
const Point3D = (x: number, y: number, z: number): IPoint3D => ({
  x,
  y,
  z,
});

// [변경] 수정된 Tetrahedron 팩토리 함수
const Tetrahedron = (
  p1: IPoint3D,
  p2: IPoint3D,
  p3: IPoint3D,
  p4: IPoint3D
): ITetrahedron | null => {
  // 볼륨 체크 추가
  const volume = calculateVolume(p1, p2, p3, p4);
  if (volume < MIN_VOLUME) {
    return null;
  }

  return {
    points: [p1, p2, p3, p4],
    circumsphere: (): ICircumsphere | null => {
      const a = [
        [p2.x - p1.x, p2.y - p1.y, p2.z - p1.z],
        [p3.x - p1.x, p3.y - p1.y, p3.z - p1.z],
        [p4.x - p1.x, p4.y - p1.y, p4.z - p1.z],
      ];

      const d = [
        0.5 *
          (p2.x * p2.x -
            p1.x * p1.x +
            p2.y * p2.y -
            p1.y * p1.y +
            p2.z * p2.z -
            p1.z * p1.z),
        0.5 *
          (p3.x * p3.x -
            p1.x * p1.x +
            p3.y * p3.y -
            p1.y * p1.y +
            p3.z * p3.z -
            p1.z * p1.z),
        0.5 *
          (p4.x * p4.x -
            p1.x * p1.x +
            p4.y * p4.y -
            p1.y * p1.y +
            p4.z * p4.z -
            p1.z * p1.z),
      ];

      const det =
        a[0][0] * (a[1][1] * a[2][2] - a[1][2] * a[2][1]) -
        a[0][1] * (a[1][0] * a[2][2] - a[1][2] * a[2][0]) +
        a[0][2] * (a[1][0] * a[2][1] - a[1][1] * a[2][0]);

      if (Math.abs(det) < EPSILON) return null;

      // [변경] Cramer's rule with improved numerical stability
      const dx =
        d[0] * (a[1][1] * a[2][2] - a[1][2] * a[2][1]) -
        a[0][1] * (d[1] * a[2][2] - a[1][2] * d[2]) +
        a[0][2] * (d[1] * a[2][1] - a[1][1] * d[2]);

      const dy =
        a[0][0] * (d[1] * a[2][2] - a[1][2] * d[2]) -
        d[0] * (a[1][0] * a[2][2] - a[1][2] * a[2][0]) +
        a[0][2] * (a[1][0] * d[2] - d[1] * a[2][0]);

      const dz =
        a[0][0] * (a[1][1] * d[2] - d[1] * a[2][1]) -
        a[0][1] * (a[1][0] * d[2] - d[1] * a[2][0]) +
        d[0] * (a[1][0] * a[2][1] - a[1][1] * a[2][0]);

      const center = {
        x: dx / det,
        y: dy / det,
        z: dz / det,
      };

      const radius = Math.sqrt(
        Math.pow(center.x - p1.x, 2) +
          Math.pow(center.y - p1.y, 2) +
          Math.pow(center.z - p1.z, 2)
      );

      return { center, radius };
    },
  };
};

// 슈퍼 사면체 생성
const createSuperTetrahedron = (points: IPoint3D[]): ITetrahedron | null => {
  const minX = Math.min(...points.map((p) => p.x));
  const minY = Math.min(...points.map((p) => p.y));
  const minZ = Math.min(...points.map((p) => p.z));
  const maxX = Math.max(...points.map((p) => p.x));
  const maxY = Math.max(...points.map((p) => p.y));
  const maxZ = Math.max(...points.map((p) => p.z));

  const dx = (maxX - minX) * 2;
  const dy = (maxY - minY) * 2;
  const dz = (maxZ - minZ) * 2;
  const maxDim = Math.max(dx, dy, dz);

  return Tetrahedron(
    Point3D(minX - maxDim, minY - maxDim, minZ - maxDim),
    Point3D(maxX + maxDim, minY - maxDim, minZ - maxDim),
    Point3D((minX + maxX) / 2, maxY + maxDim, minZ - maxDim),
    Point3D((minX + maxX) / 2, (minY + maxY) / 2, maxZ + maxDim)
  );
};

// 점이 외접구 내부에 있는지 확인
const isPointInCircumsphere = (
  point: IPoint3D,
  tetrahedron: ITetrahedron
): boolean => {
  const circumsphere = tetrahedron.circumsphere();
  if (!circumsphere) return false;

  const dx = circumsphere.center.x - point.x;
  const dy = circumsphere.center.y - point.y;
  const dz = circumsphere.center.z - point.z;

  return (
    dx * dx + dy * dy + dz * dz <= circumsphere.radius * circumsphere.radius
  );
};

// 두 점이 동일한지 확인
const isSamePoint3D = (p1: IPoint3D, p2: IPoint3D): boolean =>
  p1.x === p2.x && p1.y === p2.y && p1.z === p2.z;

// 삼각형면을 문자열로 변환 (정렬된 형태)
const triangleFaceToString = (
  points: [IPoint3D, IPoint3D, IPoint3D]
): string => {
  const sortedPoints = [...points].sort((a, b) =>
    a.x === b.x ? (a.y === b.y ? a.z - b.z : a.y - b.y) : a.x - b.x
  );
  return JSON.stringify(sortedPoints);
};

// 3D Delaunay Triangulation 메인 함수
const createDelaunayTriangulation3D = (points: IPoint3D[]): ITetrahedron[] => {
  if (points.length < 4) return [];

  // 점들을 정규화
  const [normalizedPoints, denormalize] = normalizePoints(points);

  // 슈퍼 사면체 생성 (정규화된 좌표계에서)
  const superTetrahedron = createSuperTetrahedron(normalizedPoints);

  if (!superTetrahedron) return [];

  let tetrahedra: ITetrahedron[] = [superTetrahedron];

  // 각 점에 대해 triangulation 수행
  points.forEach((point) => {
    // 점을 포함하는 사면체들의 면을 찾음
    const faces = new Set<string>();

    tetrahedra = tetrahedra.filter((tetrahedron) => {
      if (isPointInCircumsphere(point, tetrahedron)) {
        // 사면체의 네 면을 저장
        const [p1, p2, p3, p4] = tetrahedron.points;
        const tetraFaces = [
          [p1, p2, p3],
          [p1, p2, p4],
          [p1, p3, p4],
          [p2, p3, p4],
        ] as [IPoint3D, IPoint3D, IPoint3D][];

        tetraFaces.forEach((face) => {
          const faceStr = triangleFaceToString(face);
          if (faces.has(faceStr)) {
            faces.delete(faceStr);
          } else {
            faces.add(faceStr);
          }
        });
        return false;
      }
      return true;
    });

    // 새로운 사면체 생성 시 볼륨 체크
    Array.from(faces).forEach((faceStr) => {
      const [p1, p2, p3] = JSON.parse(faceStr) as [
        IPoint3D,
        IPoint3D,
        IPoint3D
      ];
      const newTetra = Tetrahedron(p1, p2, p3, point);
      if (newTetra) {
        tetrahedra.push(newTetra);
      }
    });
  });

  // 슈퍼 사면체와 연결된 사면체 제거
  return tetrahedra.filter(
    (tetrahedron) =>
      !tetrahedron.points.some((p) =>
        superTetrahedron.points.some((sp) => isSamePoint3D(p, sp))
      )
  );
};

// 테스트 사용 예시
const testPoints3D: IPoint3D[] = [
  { x: 0, y: 0, z: 0 },
  { x: 1, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 },
  { x: 0, y: 0, z: 1 },
  { x: 1, y: 0, z: 1 },
  { x: 1, y: 1, z: 1 },
  { x: 2, y: 1, z: 1 },
];

const triangulation3D = createDelaunayTriangulation3D(testPoints3D);

// 결과 출력을 위한 유틸리티 함수
const printTriangulation3D = (tetrahedra: ITetrahedron[]): void => {
  let rmed: ITetrahedron[] = [];
  tetrahedra.forEach((tetra, i) => {
    console.log(`Tetrahedron ${i + 1}:`);
    tetra.points.forEach((point, j) => {
      console.log(`  Point ${j + 1}: (${point.x}, ${point.y}, ${point.z})`);
    });
  });
  console.log(`Found ${rmed.length} tetrahedra:`);
};

printTriangulation3D(triangulation3D);
