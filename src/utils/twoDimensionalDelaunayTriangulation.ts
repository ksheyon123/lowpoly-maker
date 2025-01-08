import { IPoint, ICircumcircle, ITriangle, IConstraint } from "@/types/index";

/**
 * @description 들로네 삼각분할(Delaunay Triangulation)**은 2차원 평면에 주어진 점 집합에서 삼각형들을 구성하는 기법 중 하나로, 다음과 같은 성질을 만족합니다:
 * 1. 원 외접성 (Circumcircle Property):
 * 삼각형들의 외접원이 어떤 점도 포함하지 않는 삼각분할입니다. 즉, 모든 삼각형의 외접원의 내부에 다른 점이 들어 있지 않습니다.
 * 2. 최대 최소 각(max-min angle) 특성:
 * 들로네 삼각분할은 삼각형들의 최소 각이 가능한 한 크게 만들어지도록 구성됩니다. 이는 '얇은 삼각형'을 줄이고 '균형 잡힌 삼각형'을 생성한다는 뜻입니다.
 * 3. 볼록 껍질(Convex Hull) 포함:
 * 점 집합의 볼록 껍질(convex hull) 내부에 있는 모든 삼각형을 포함합니다.
 */

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

// 추가: 두 선분이 교차하는지 확인하는 함수
export const doSegmentsIntersect = (
  p1: IPoint,
  p2: IPoint,
  p3: IPoint,
  p4: IPoint
): boolean => {
  const ccw = (A: IPoint, B: IPoint, C: IPoint) => {
    return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
  };

  return (
    ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4)
  );
};

// 추가: 삼각형의 엣지가 제약 조건과 충돌하는지 확인
export const isEdgeIntersectingConstraints = (
  edge: [IPoint, IPoint],
  constraints: IConstraint[]
): boolean => {
  return constraints.some((constraint) =>
    doSegmentsIntersect(edge[0], edge[1], constraint.start, constraint.end)
  );
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

// 두 점이 동일한지 확인하는 유틸리티 함수
export const isSamePoint = (p1: IPoint, p2: IPoint): boolean =>
  p1.x === p2.x && p1.y === p2.y;

// Delaunay Triangulation 메인 함수
export const createDelaunayTriangulation = (
  points: IPoint[],
  constraints: IConstraint[]
): ITriangle[] => {
  if (points.length < 3) return [];

  // 추가: 모든 제약 조건의 끝점들이 points 배열에 포함되어 있는지 확인하고 추가
  constraints.forEach((constraint) => {
    if (!points.some((p) => isSamePoint(p, constraint.start))) {
      points.push(constraint.start);
    }
    if (!points.some((p) => isSamePoint(p, constraint.end))) {
      points.push(constraint.end);
    }
  });

  // 슈퍼 삼각형 생성
  const superTriangle = createSuperTriangle(points);
  let triangles: ITriangle[] = [superTriangle];

  // 각 점에 대해 triangulation 수행
  points.forEach((point) => {
    // 점을 포함하는 삼각형들의 가장자리를 찾음
    const edges = new Set<string>();

    triangles = triangles.filter((triangle) => {
      if (isPointInCircumcircle(point, triangle)) {
        // 삼각형의 가장자리를 저장
        triangle.points.forEach((p1, i) => {
          const p2 = triangle.points[(i + 1) % 3];

          // 추가 : 현재 엣지가 제약 조건과 일치하는지 확인
          const isConstrainedEdge = constraints.some(
            (constraint) =>
              (isSamePoint(p1, constraint.start) &&
                isSamePoint(p2, constraint.end)) ||
              (isSamePoint(p1, constraint.end) &&
                isSamePoint(p2, constraint.start))
          );

          const edge = JSON.stringify(
            [p1, p2].sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x))
          );
          if (isConstrainedEdge) {
            edges.add(edge);
          } else {
            if (edges.has(edge)) {
              edges.delete(edge);
            } else {
              edges.add(edge);
            }
          }
        });
        return false;
      }
      return true;
    });

    // 새로운 삼각형 생성
    Array.from(edges).forEach((edge) => {
      const [p1, p2] = JSON.parse(edge) as [IPoint, IPoint];
      // 현재 엣지가 제약 조건을 위반하지 않는지 확인
      const newTriangle = Triangle(p1, p2, point);
      if (!isEdgeIntersectingConstraints([p1, p2], constraints)) {
        triangles.push(newTriangle);
      }
    });
  });

  // 제약 조건을 만족하도록 로컬 재삼각화
  const enforceConstraints = (triangles: ITriangle[]): ITriangle[] => {
    let result = [...triangles];

    constraints.forEach((constraint) => {
      // 제약 조건을 위반하는 삼각형 찾기
      const violatingTriangles = result.filter((triangle) =>
        triangle.points.some((p1, i) => {
          const p2 = triangle.points[(i + 1) % 3];
          return isEdgeIntersectingConstraints([p1, p2], [constraint]);
        })
      );

      // 위반하는 삼각형들을 제거하고 새로운 삼각형으로 대체
      if (violatingTriangles.length > 0) {
        result = result.filter((t) => !violatingTriangles.includes(t));

        // 제약 조건을 포함하는 새로운 삼각형 생성
        const newTriangles = retriangulateRegion(
          violatingTriangles,
          constraint
        );
        result.push(...newTriangles);
      }
    });

    return result;
  };

  // 슈퍼 삼각형과 연결된 삼각형 제거 후 제약 조건 적용
  const finalTriangles = triangles.filter(
    (triangle) =>
      !triangle.points.some((p) =>
        superTriangle.points.some((sp) => isSamePoint(p, sp))
      )
  );

  return enforceConstraints(finalTriangles);
};

// 추가: 특정 영역을 재삼각화하는 함수
const retriangulateRegion = (
  violatingTriangles: ITriangle[],
  constraint: IConstraint
): ITriangle[] => {
  // 위반하는 삼각형들의 모든 점들을 수집
  const points = new Set<IPoint>();
  violatingTriangles.forEach((triangle) => {
    triangle.points.forEach((point) => {
      points.add(point);
    });
  });

  // 제약 조건의 양 끝점도 포함
  points.add(constraint.start);
  points.add(constraint.end);

  // 수집된 점들로 새로운 삼각형들 생성
  const newTriangles: ITriangle[] = [];
  const pointsArray = Array.from(points);

  for (let i = 0; i < pointsArray.length - 2; i++) {
    for (let j = i + 1; j < pointsArray.length - 1; j++) {
      for (let k = j + 1; k < pointsArray.length; k++) {
        const newTriangle = Triangle(
          pointsArray[i],
          pointsArray[j],
          pointsArray[k]
        );

        // 제약 조건을 만족하는 삼각형만 추가
        if (
          !isEdgeIntersectingConstraints(
            [pointsArray[i], pointsArray[j]],
            [constraint]
          ) &&
          !isEdgeIntersectingConstraints(
            [pointsArray[j], pointsArray[k]],
            [constraint]
          ) &&
          !isEdgeIntersectingConstraints(
            [pointsArray[k], pointsArray[i]],
            [constraint]
          )
        ) {
          newTriangles.push(newTriangle);
        }
      }
    }
  }

  return newTriangles;
};
