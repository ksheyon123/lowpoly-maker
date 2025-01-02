/**
 * @description 들로네 삼각분할(Delaunay Triangulation)**은 2차원 평면에 주어진 점 집합에서 삼각형들을 구성하는 기법 중 하나로, 다음과 같은 성질을 만족합니다:
 * 1. 원 외접성 (Circumcircle Property):
 * 삼각형들의 외접원이 어떤 점도 포함하지 않는 삼각분할입니다. 즉, 모든 삼각형의 외접원의 내부에 다른 점이 들어 있지 않습니다.
 * 2. 최대 최소 각(max-min angle) 특성:
 * 들로네 삼각분할은 삼각형들의 최소 각이 가능한 한 크게 만들어지도록 구성됩니다. 이는 '얇은 삼각형'을 줄이고 '균형 잡힌 삼각형'을 생성한다는 뜻입니다.
 * 3. 볼록 껍질(Convex Hull) 포함:
 * 점 집합의 볼록 껍질(convex hull) 내부에 있는 모든 삼각형을 포함합니다.
 */
// 기본 타입 정의
interface IPoint {
  x: number;
  y: number;
}

interface ICircumcircle {
  center: IPoint;
  radius: number;
}

interface ITriangle {
  points: [IPoint, IPoint, IPoint];
  circumcircle: () => ICircumcircle | null;
}

// 점 생성 팩토리 함수
const Point = (x: number, y: number): IPoint => ({ x, y });

// 삼각형 생성 팩토리 함수
const Triangle = (p1: IPoint, p2: IPoint, p3: IPoint): ITriangle => ({
  points: [p1, p2, p3],
  circumcircle: (): ICircumcircle | null => {
    const [a, b, c] = [p1, p2, p3];
    const d = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));

    if (Math.abs(d) < Number.EPSILON) return null;

    const ux =
      ((a.x * a.x + a.y * a.y) * (b.y - c.y) +
        (b.x * b.x + b.y * b.y) * (c.y - a.y) +
        (c.x * c.x + c.y * c.y) * (a.y - b.y)) /
      d;

    const uy =
      ((a.x * a.x + a.y * a.y) * (c.x - b.x) +
        (b.x * b.x + b.y * b.y) * (a.x - c.x) +
        (c.x * c.x + c.y * c.y) * (b.x - a.x)) /
      d;

    const center = Point(ux, uy);
    const radius = Math.sqrt(
      Math.pow(center.x - a.x, 2) + Math.pow(center.y - a.y, 2)
    );

    return { center, radius };
  },
});

// 슈퍼 삼각형 생성
const createSuperTriangle = (points: IPoint[]): ITriangle => {
  const minX = Math.min(...points.map((p) => p.x));
  const minY = Math.min(...points.map((p) => p.y));
  const maxX = Math.max(...points.map((p) => p.x));
  const maxY = Math.max(...points.map((p) => p.y));

  const dx = (maxX - minX) * 2;
  const dy = (maxY - minY) * 2;

  return Triangle(
    Point(minX - dx, minY - dy),
    Point(maxX + dx, minY - dy),
    Point(minX + (maxX - minX) / 2, maxY + dy)
  );
};

// 점이 삼각형 내부에 있는지 확인
const isPointInTriangle = (point: IPoint, triangle: ITriangle): boolean => {
  const [a, b, c] = triangle.points;

  const area =
    0.5 * (-b.y * c.x + a.y * (-b.x + c.x) + a.x * (b.y - c.y) + b.x * c.y);

  const s =
    (1 / (2 * area)) *
    (a.y * c.x - a.x * c.y + (c.y - a.y) * point.x + (a.x - c.x) * point.y);

  const t =
    (1 / (2 * area)) *
    (a.x * b.y - a.y * b.x + (a.y - b.y) * point.x + (b.x - a.x) * point.y);

  return s >= 0 && t >= 0 && 1 - s - t >= 0;
};

// 점이 외접원 내부에 있는지 확인
const isPointInCircumcircle = (point: IPoint, triangle: ITriangle): boolean => {
  const circumcircle = triangle.circumcircle();
  if (!circumcircle) return false;

  const dx = circumcircle.center.x - point.x;
  const dy = circumcircle.center.y - point.y;

  return dx * dx + dy * dy <= circumcircle.radius * circumcircle.radius;
};

// 두 점이 동일한지 확인하는 유틸리티 함수
const isSamePoint = (p1: IPoint, p2: IPoint): boolean =>
  p1.x === p2.x && p1.y === p2.y;

// Delaunay Triangulation 메인 함수
const createDelaunayTriangulation = (points: IPoint[]): ITriangle[] => {
  if (points.length < 3) return [];

  // 슈퍼 삼각형 생성
  const superTriangle = createSuperTriangle(points);
  let triangles: ITriangle[] = [superTriangle];

  console.log("TRI ANGLES : ", triangles);
  // 각 점에 대해 triangulation 수행
  points.forEach((point) => {
    // 점을 포함하는 삼각형들의 가장자리를 찾음
    const edges = new Set<string>();

    triangles = triangles.filter((triangle) => {
      console.log("triangle : ", triangle);
      if (isPointInCircumcircle(point, triangle)) {
        // 삼각형의 가장자리를 저장
        triangle.points.forEach((p1, i) => {
          const p2 = triangle.points[(i + 1) % 3];
          const edge = JSON.stringify(
            [p1, p2].sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x))
          );

          if (edges.has(edge)) {
            edges.delete(edge);
          } else {
            edges.add(edge);
          }
        });
        return false;
      }
      return true;
    });

    // 새로운 삼각형 생성
    Array.from(edges).forEach((edge) => {
      const [p1, p2] = JSON.parse(edge) as [IPoint, IPoint];
      triangles.push(Triangle(p1, p2, point));
    });
  });

  // 슈퍼 삼각형과 연결된 삼각형 제거
  return triangles.filter(
    (triangle) =>
      !triangle.points.some((p) =>
        superTriangle.points.some((sp) => isSamePoint(p, sp))
      )
  );
};

// 테스트 사용 예시
const t: IPoint[] = [
  Point(0, 0),
  Point(1, 0),
  Point(0, 1),
  Point(1, 1),
  Point(0.5, 0.5),
  Point(1.5, 0.5),
];

const triangulation = createDelaunayTriangulation(t);

// 결과 출력을 위한 유틸리티 함수
const printTriangulation = (triangles: ITriangle[]): void => {
  console.log(`Found ${triangles.length} triangles:`);
  triangles.forEach((triangle, i) => {
    console.log(`Triangle ${i + 1}:`);
    triangle.points.forEach((point, j) => {
      console.log(`  Point ${j + 1}: (${point.x}, ${point.y})`);
    });
  });
};

// 결과 출력
printTriangulation(triangulation);
