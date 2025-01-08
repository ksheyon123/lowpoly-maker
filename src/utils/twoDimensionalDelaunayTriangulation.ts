import { IPoint, ICircumcircle, ITriangle, IConstraint } from "@/types/index";

// 점 생성 팩토리 함수
export const Point = (x: number, y: number): IPoint => ({ x, y });

// 삼각형 생성 팩토리 함수
export const Triangle = (p1: IPoint, p2: IPoint, p3: IPoint): ITriangle => ({
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

// 두 점이 동일한지 확인하는 유틸리티 함수
export const isSamePoint = (p1: IPoint, p2: IPoint): boolean =>
  Math.abs(p1.x - p2.x) < Number.EPSILON &&
  Math.abs(p1.y - p2.y) < Number.EPSILON;

// 점이 삼각형 내부에 있는지 확인
export const isPointInTriangle = (
  point: IPoint,
  triangle: ITriangle
): boolean => {
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
// 점이 선분 위에 있는지 확인
export const isPointOnSegment = (
  point: IPoint,
  segmentStart: IPoint,
  segmentEnd: IPoint
): boolean => {
  // 선분의 끝점인 경우는 false 반환
  if (isSamePoint(point, segmentStart) || isSamePoint(point, segmentEnd)) {
    return false;
  }

  const crossProduct =
    (point.y - segmentStart.y) * (segmentEnd.x - segmentStart.x) -
    (point.x - segmentStart.x) * (segmentEnd.y - segmentStart.y);

  if (Math.abs(crossProduct) > Number.EPSILON) {
    return false;
  }

  const dotProduct =
    (point.x - segmentStart.x) * (segmentEnd.x - segmentStart.x) +
    (point.y - segmentStart.y) * (segmentEnd.y - segmentStart.y);

  const squaredLength =
    Math.pow(segmentEnd.x - segmentStart.x, 2) +
    Math.pow(segmentEnd.y - segmentStart.y, 2);

  return dotProduct > 0 && dotProduct < squaredLength;
};

// 점이 선분의 왼쪽에 있는지 확인
export const isLeftOf = (
  point: IPoint,
  segmentStart: IPoint,
  segmentEnd: IPoint
): boolean => {
  const crossProduct =
    (segmentEnd.x - segmentStart.x) * (point.y - segmentStart.y) -
    (segmentEnd.y - segmentStart.y) * (point.x - segmentStart.x);

  return crossProduct > Number.EPSILON;
};

// 선분 교차 여부 확인
export const doSegmentsIntersect = (
  p1: IPoint,
  p2: IPoint,
  p3: IPoint,
  p4: IPoint
): boolean => {
  // 선분의 끝점이 같은 경우는 교차하지 않는 것으로 처리
  if (
    isSamePoint(p1, p3) ||
    isSamePoint(p1, p4) ||
    isSamePoint(p2, p3) ||
    isSamePoint(p2, p4)
  ) {
    return false;
  }

  const ccw = (A: IPoint, B: IPoint, C: IPoint) => {
    const val = (C.y - A.y) * (B.x - A.x) - (B.y - A.y) * (C.x - A.x);
    if (Math.abs(val) < Number.EPSILON) return 0;
    return val > 0 ? 1 : -1;
  };

  const ccw1 = ccw(p1, p2, p3);
  const ccw2 = ccw(p1, p2, p4);
  const ccw3 = ccw(p3, p4, p1);
  const ccw4 = ccw(p3, p4, p2);

  return ccw1 * ccw2 < 0 && ccw3 * ccw4 < 0;
};

// 보이는 점들 찾기
export const findVisiblePoints = (
  point: IPoint,
  allPoints: IPoint[],
  constraints: IConstraint[]
): IPoint[] => {
  return allPoints.filter((targetPoint) => {
    if (isSamePoint(point, targetPoint)) {
      return false;
    }

    for (const constraint of constraints) {
      if (
        doSegmentsIntersect(
          point,
          targetPoint,
          constraint.start,
          constraint.end
        )
      ) {
        return false;
      }
    }

    return true;
  });
};

// 삼각형 검증
export const validateTriangleWithConstraints = (
  triangle: ITriangle,
  constraints: IConstraint[]
): boolean => {
  for (let i = 0; i < 3; i++) {
    const p1 = triangle.points[i];
    const p2 = triangle.points[(i + 1) % 3];

    for (const constraint of constraints) {
      const isConstraintEdge =
        (isSamePoint(p1, constraint.start) &&
          isSamePoint(p2, constraint.end)) ||
        (isSamePoint(p1, constraint.end) && isSamePoint(p2, constraint.start));

      if (
        !isConstraintEdge &&
        doSegmentsIntersect(p1, p2, constraint.start, constraint.end)
      ) {
        return false;
      }
    }
  }
  return true;
};

// 삼각형 분할
export const splitTrianglesByConstraint = (
  triangles: ITriangle[],
  constraint: IConstraint
): ITriangle[] => {
  const unaffectedTriangles = triangles.filter(
    (triangle) =>
      !triangle.points.some((p1, i) => {
        const p2 = triangle.points[(i + 1) % 3];
        return doSegmentsIntersect(p1, p2, constraint.start, constraint.end);
      })
  );
  console.log(unaffectedTriangles.length);

  const affectedTriangles = triangles.filter((triangle) =>
    triangle.points.some((p1, i) => {
      const p2 = triangle.points[(i + 1) % 3];
      return doSegmentsIntersect(p1, p2, constraint.start, constraint.end);
    })
  );
  console.log(affectedTriangles.length);

  // 분할된 영역의 점들 수집
  const pointSet = new Set<IPoint>();
  affectedTriangles.forEach((triangle) => {
    triangle.points.forEach((point) => pointSet.add(point));
  });
  pointSet.add(constraint.start);
  pointSet.add(constraint.end);

  const points = Array.from(pointSet);
  const leftPoints = points.filter((p) =>
    isLeftOf(p, constraint.start, constraint.end)
  );
  const rightPoints = points.filter(
    (p) => !isLeftOf(p, constraint.start, constraint.end)
  );

  const newTriangles: ITriangle[] = [];

  // 왼쪽 영역 재삼각화
  if (leftPoints.length >= 3) {
    const leftTriangles = createConstrainedDelaunayTriangulation(leftPoints, [
      constraint,
    ]);
    newTriangles.push(...leftTriangles);
  }

  // 오른쪽 영역 재삼각화
  if (rightPoints.length >= 3) {
    const rightTriangles = createConstrainedDelaunayTriangulation(rightPoints, [
      constraint,
    ]);
    newTriangles.push(...rightTriangles);
  }

  return [...unaffectedTriangles, ...newTriangles];
};

// 슈퍼 삼각형 생성
export const createSuperTriangle = (points: IPoint[]): ITriangle => {
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

// 점이 외접원 내부에 있는지 확인
export const isPointInCircumcircle = (
  point: IPoint,
  triangle: ITriangle
): boolean => {
  const circumcircle = triangle.circumcircle();
  if (!circumcircle) return false;

  const dx = circumcircle.center.x - point.x;
  const dy = circumcircle.center.y - point.y;

  return dx * dx + dy * dy <= circumcircle.radius * circumcircle.radius;
};

// CDT 메인 함수
export const createConstrainedDelaunayTriangulation = (
  points: IPoint[],
  constraints: IConstraint[]
): ITriangle[] => {
  if (points.length < 3) return [];

  // 제약 조건의 끝점들이 포함되어 있는지 확인
  constraints.forEach((constraint) => {
    if (!points.some((p) => isSamePoint(p, constraint.start))) {
      points.push(constraint.start);
    }
    if (!points.some((p) => isSamePoint(p, constraint.end))) {
      points.push(constraint.end);
    }
  });

  // 초기 Delaunay triangulation 수행
  let triangles = createDelaunayTriangulation(points);

  // 각 제약 조건 적용
  constraints.forEach((constraint) => {
    triangles = splitTrianglesByConstraint(triangles, constraint);
  });

  return triangles;
};

// 기본 Delaunay triangulation
export const createDelaunayTriangulation = (
  points: IPoint[],
  a = []
): ITriangle[] => {
  if (points.length < 3) return [];

  const superTriangle = createSuperTriangle(points);
  let triangles: ITriangle[] = [superTriangle];

  points.forEach((point) => {
    const edges = new Set<string>();

    triangles = triangles.filter((triangle) => {
      if (isPointInCircumcircle(point, triangle)) {
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

    Array.from(edges).forEach((edge) => {
      const [p1, p2] = JSON.parse(edge) as [IPoint, IPoint];
      triangles.push(Triangle(p1, p2, point));
    });
  });

  return triangles.filter(
    (triangle) =>
      !triangle.points.some((p) =>
        superTriangle.points.some((sp) => isSamePoint(p, sp))
      )
  );
};
