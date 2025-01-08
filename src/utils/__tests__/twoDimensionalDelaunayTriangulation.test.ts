import {
  Point,
  isSamePoint,
  isPointInCircumcircle,
  isPointInTriangle,
  Triangle,
  createDelaunayTriangulation,
} from "@/utils/twoDimensionalDelaunayTriangulation";
import { IPoint, ITriangle } from "@/types/index";

// 테스트를 위한 헬퍼 함수들
const calculateTriangleArea = (p1: IPoint, p2: IPoint, p3: IPoint): number => {
  return Math.abs(
    (p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2
  );
};

const isDelaunayValid = (triangle: ITriangle, allPoints: IPoint[]): boolean => {
  const circumcircle = triangle.circumcircle();
  if (!circumcircle) return false;

  return !allPoints.some(
    (point) =>
      !triangle.points.some((p) => isSamePoint(p, point)) && // 삼각형의 꼭지점이 아닌 점들에 대해서만
      isPointInCircumcircle(point, triangle) // 외접원 내부에 다른 점이 없어야 함
  );
};

const getMinAngle = (triangle: ITriangle): number => {
  const [p1, p2, p3] = triangle.points;

  // 세 변의 길이 계산
  const a = Math.sqrt(Math.pow(p2.x - p3.x, 2) + Math.pow(p2.y - p3.y, 2));
  const b = Math.sqrt(Math.pow(p1.x - p3.x, 2) + Math.pow(p1.y - p3.y, 2));
  const c = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

  // 코사인 법칙을 사용하여 각도 계산
  const angleA = Math.acos((b * b + c * c - a * a) / (2 * b * c));
  const angleB = Math.acos((a * a + c * c - b * b) / (2 * a * c));
  const angleC = Math.acos((a * a + b * b - c * c) / (2 * a * b));

  return Math.min(angleA, angleB, angleC) * (180 / Math.PI); // 각도를 도(degree)로 변환
};

describe("Delaunay Triangulation", () => {
  test("기본 사각형 케이스 테스트", () => {
    const points = [Point(0, 0), Point(1, 0), Point(0, 1), Point(1, 1)];

    const triangulation = createDelaunayTriangulation(points, []);
    expect(triangulation.length).toBe(2); // 사각형은 2개의 삼각형으로 분할되어야 함
  });

  test("삼각형이 3개 미만의 점으로는 생성되지 않아야 함", () => {
    const points = [Point(0, 0), Point(1, 1)];
    const triangulation = createDelaunayTriangulation(points, []);

    expect(triangulation.length).toBe(0);
  });

  test("모든 삼각형이 Delaunay 조건을 만족해야 함", () => {
    const points = [
      Point(0, 0),
      Point(1, 0),
      Point(0, 1),
      Point(1, 1),
      Point(0.5, 0.5),
    ];

    const triangulation = createDelaunayTriangulation(points, []);

    triangulation.forEach((triangle) => {
      expect(isDelaunayValid(triangle, points)).toBe(true);
    });
  });

  test("모든 삼각형의 넓이 합이 전체 영역과 같아야 함", () => {
    const points = [Point(0, 0), Point(2, 0), Point(2, 2), Point(0, 2)];

    const triangulation = createDelaunayTriangulation(points, []);

    const totalArea = triangulation.reduce((sum, triangle) => {
      const [p1, p2, p3] = triangle.points;
      return sum + calculateTriangleArea(p1, p2, p3);
    }, 0);

    expect(Math.abs(totalArea - 4)).toBeLessThan(0.0001); // 2x2 사각형의 넓이는 4
  });

  test("최소 각도 최대화 특성 검증", () => {
    const points = [
      Point(0, 0),
      Point(1, 0),
      Point(0, 1),
      Point(1, 1),
      Point(0.5, 0.5),
    ];

    const triangulation = createDelaunayTriangulation(points, []);

    // 모든 삼각형의 최소 각도가 일정 임계값 이상이어야 함
    triangulation.forEach((triangle) => {
      const minAngle = getMinAngle(triangle);
      expect(minAngle).toBeGreaterThan(20); // 일반적으로 Delaunay 삼각분할은 최소 각도가 20도 이상
    });
  });

  test("외접원 계산이 정확해야 함", () => {
    const triangle = Triangle(Point(0, 0), Point(1, 0), Point(0, 1));
    const circumcircle = triangle.circumcircle();

    expect(circumcircle).not.toBeNull();
    if (circumcircle) {
      // 정삼각형의 외접원 중심과 반지름 검증
      expect(circumcircle.center.x).toBeCloseTo(0.5);
      expect(circumcircle.center.y).toBeCloseTo(0.5);
      expect(circumcircle.radius).toBeCloseTo(Math.sqrt(0.5));
    }
  });

  test("점이 삼각형 내부에 있는지 정확히 판단해야 함", () => {
    const triangle = Triangle(Point(0, 0), Point(2, 0), Point(0, 2));

    expect(isPointInTriangle(Point(0.5, 0.5), triangle)).toBe(true);
    expect(isPointInTriangle(Point(1.5, 1.5), triangle)).toBe(false);
  });

  test("CDT", () => {
    const points = [
      Point(0, 0),
      Point(1, 0),
      Point(2, 0),
      Point(0, 1),
      Point(1, 1),
      Point(2, 1),
      Point(0, 2),
      Point(1, 2),
      Point(2, 2),
    ];

    const constraints = [
      { start: Point(1, 0), end: Point(1, 1) },
      { start: Point(0, 1), end: Point(1, 1) },
      { start: Point(1, 2), end: Point(1, 1) },
      { start: Point(2, 1), end: Point(1, 1) },
    ];

    const triangulation = createDelaunayTriangulation(points, constraints);
    expect(triangulation.length).toBe(4);
  });
});
