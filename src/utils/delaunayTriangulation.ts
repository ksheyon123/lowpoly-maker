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
interface Point {
  x: number;
  y: number;
}

interface Edge {
  start: Point;
  end: Point;
}

interface Triangle {
  points: [Point, Point, Point];
  edges: [Edge, Edge, Edge];
}

interface CircumCircle {
  center: Point;
  radius: number;
}

// 점 생성 함수
const createPoint = (x: number, y: number): Point => ({ x, y });

// 엣지 생성 함수
const createEdge = (start: Point, end: Point): Edge => ({ start, end });

// 삼각형 생성 함수
const createTriangle = (p1: Point, p2: Point, p3: Point): Triangle => {
  const edges: [Edge, Edge, Edge] = [
    createEdge(p1, p2),
    createEdge(p2, p3),
    createEdge(p3, p1),
  ];
  return {
    points: [p1, p2, p3],
    edges,
  };
};

// 거리 계산 함수
const distance = (p1: Point, p2: Point): number =>
  Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

// 외접원 계산 함수
const calculateCircumcircle = (triangle: Triangle): CircumCircle => {
  const [p1, p2, p3] = triangle.points;

  const d =
    2 * (p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y));

  const ux =
    ((p1.x * p1.x + p1.y * p1.y) * (p2.y - p3.y) +
      (p2.x * p2.x + p2.y * p2.y) * (p3.y - p1.y) +
      (p3.x * p3.x + p3.y * p3.y) * (p1.y - p2.y)) /
    d;

  const uy =
    ((p1.x * p1.x + p1.y * p1.y) * (p3.x - p2.x) +
      (p2.x * p2.x + p2.y * p2.y) * (p1.x - p3.x) +
      (p3.x * p3.x + p3.y * p3.y) * (p2.x - p1.x)) /
    d;

  const center = createPoint(ux, uy);
  const radius = distance(center, p1);

  return { center, radius };
};

// 점이 외접원 내부에 있는지 확인하는 함수
const isPointInCircumcircle = (point: Point, triangle: Triangle): boolean => {
  const { center, radius } = calculateCircumcircle(triangle);
  return distance(point, center) <= radius;
};

// 슈퍼 삼각형 생성 함수
const createSuperTriangle = (points: Point[]): Triangle => {
  const minX = Math.min(...points.map((p) => p.x));
  const minY = Math.min(...points.map((p) => p.y));
  const maxX = Math.max(...points.map((p) => p.x));
  const maxY = Math.max(...points.map((p) => p.y));

  const dx = (maxX - minX) * 2;
  const dy = (maxY - minY) * 2;
  const dmax = Math.max(dx, dy);
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;

  return createTriangle(
    createPoint(midX - 20 * dmax, midY - dmax),
    createPoint(midX, midY + 20 * dmax),
    createPoint(midX + 20 * dmax, midY - dmax)
  );
};

// 나쁜 삼각형 찾기 함수
const findBadTriangles = (point: Point, triangles: Triangle[]): Triangle[] =>
  triangles.filter((triangle) => isPointInCircumcircle(point, triangle));

// 엣지 비교 함수
const isSameEdge = (edge1: Edge, edge2: Edge): boolean =>
  (edge1.start.x === edge2.start.x &&
    edge1.start.y === edge2.start.y &&
    edge1.end.x === edge2.end.x &&
    edge1.end.y === edge2.end.y) ||
  (edge1.start.x === edge2.end.x &&
    edge1.start.y === edge2.end.y &&
    edge1.end.x === edge2.start.x &&
    edge1.end.y === edge2.start.y);

// 경계 다각형 찾기 함수
const findBoundaryPolygon = (badTriangles: Triangle[]): Edge[] => {
  const allEdges = badTriangles.flatMap((triangle) => triangle.edges);
  return allEdges.filter(
    (edge) => allEdges.filter((e) => isSameEdge(edge, e)).length === 1
  );
};

// 슈퍼 삼각형 점 포함 여부 확인 함수
const hasCommonVertexWithSuperTriangle = (
  triangle: Triangle,
  superTriangle: Triangle
): boolean =>
  triangle.points.some((p1) =>
    superTriangle.points.some((p2) => p1.x === p2.x && p1.y === p2.y)
  );

// 메인 Delaunay triangulation 함수
const delaunayTriangulation = (inputPoints: [number, number][]): Triangle[] => {
  const points = inputPoints.map(([x, y]) => createPoint(x, y));
  let triangles = [createSuperTriangle(points)];

  points.forEach((point) => {
    const badTriangles = findBadTriangles(point, triangles);
    const polygon = findBoundaryPolygon(badTriangles);

    triangles = triangles.filter(
      (triangle) => !badTriangles.includes(triangle)
    );

    const newTriangles = polygon.map((edge) =>
      createTriangle(edge.start, edge.end, point)
    );

    triangles = [...triangles, ...newTriangles];
  });

  const superTriangle = triangles[0];
  return triangles.filter(
    (triangle) => !hasCommonVertexWithSuperTriangle(triangle, superTriangle)
  );
};

// 결과 포맷팅 함수
interface TriangleOutput {
  points: [number, number][];
}

const formatTriangles = (triangles: Triangle[]): TriangleOutput[] =>
  triangles.map((triangle) => ({
    points: triangle.points.map((p) => [p.x, p.y]) as [number, number][],
  }));

// 최종 사용 함수
export const createDelaunayTriangulation = (
  points: [number, number][]
): TriangleOutput[] => {
  const triangles = delaunayTriangulation(points);
  return formatTriangles(triangles);
};
