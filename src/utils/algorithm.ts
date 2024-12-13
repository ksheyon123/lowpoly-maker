/**
 * @description QuickHull 알고리즘은 주어진 점 집합에서 볼록 껍질(Convex Hull)을 찾기 위한 효율적인 알고리즘입니다. 이 알고리즘은 분할 정복(divide and conquer) 접근 방식을 사용하여 작동합니다. 다음은 QuickHull 알고리즘의 주요 단계입니다:
    1. 최대 및 최소 점 찾기: 주어진 점 집합에서 x좌표가 가장 작은 점과 가장 큰 점을 찾습니다. 이 두 점은 볼록 껍질의 일부가 됩니다.
    2. 분할: 이 두 점을 연결하는 선을 기준으로 점 집합을 두 개의 부분으로 나눕니다. 하나는 선의 위쪽에 있는 점들, 다른 하나는 아래쪽에 있는 점들입니다.
    3. 재귀적 호출: 각 부분에 대해 다음을 수행합니다:
    가장 먼 점을 찾습니다. 이 점은 현재 선에서 가장 멀리 떨어져 있는 점입니다.
    이 점을 볼록 껍질에 추가하고, 이 점과 선의 양쪽 끝 점을 연결하는 두 개의 새로운 선을 만듭니다.
    이 새로운 선을 기준으로 다시 점 집합을 나누고, 재귀적으로 이 과정을 반복합니다.
    4. 종료 조건: 더 이상 추가할 점이 없거나 점 집합이 비어 있을 때까지 이 과정을 반복합니다.
    QuickHull 알고리즘은 평균적으로 O(n log n)의 시간 복잡도를 가지지만, 최악의 경우 O(n^2)의 시간 복잡도를 가질 수 있습니다. 이는 점들이 특정한 패턴으로 배열되어 있을 때 발생합니다.
    이 알고리즘은 구현이 비교적 간단하고, 직관적으로 이해하기 쉬운 장점이 있습니다.
 */
export const quickHull = (points: [number, number][]) => {
  if (points.length < 3) return points;

  // Find the leftmost and rightmost points
  const minPoint = points.reduce(
    (min, p) => (p[0] < min[0] ? p : min),
    points[0]
  );
  const maxPoint = points.reduce(
    (max, p) => (p[0] > max[0] ? p : max),
    points[0]
  );

  // Recursively find the hull on both sides of the line
  const leftHull = findHull(points, minPoint, maxPoint, true);
  const rightHull = findHull(points, minPoint, maxPoint, false);

  // Combine the results
  return [minPoint, ...leftHull, maxPoint, ...rightHull];
};

const findHull = (
  points: [number, number][],
  p1: [number, number],
  p2: [number, number],
  isLeft: boolean
) => {
  const hull: any[] = [];
  let farthestPoint = null;
  let maxDistance = 0;

  for (const point of points) {
    // Calculate the distance from the line p1-p2
    const distance = calculateDistance(p1, p2, point);
    if (isLeftOfLine(p1, p2, point) && distance > maxDistance) {
      maxDistance = distance;
      farthestPoint = point;
    }
  }

  if (farthestPoint === null) return hull;

  // Recursively find the hull on both sides of the line
  hull.push(...findHull(points, p1, farthestPoint, true));
  hull.push(farthestPoint);
  hull.push(...findHull(points, farthestPoint, p2, false));

  return hull;
};

const calculateDistance = (
  p1: [number, number],
  p2: [number, number],
  p: [number, number]
) => {
  return (
    Math.abs(
      (p2[1] - p1[1]) * p[0] -
        (p2[0] - p1[0]) * p[1] +
        p2[0] * p1[1] -
        p2[1] * p1[0]
    ) / Math.sqrt(Math.pow(p2[1] - p1[1], 2) + Math.pow(p2[0] - p1[0], 2))
  );
};

const isLeftOfLine = (
  p1: [number, number],
  p2: [number, number],
  p: [number, number]
) => {
  return (
    (p2[0] - p1[0]) * (p[1] - p1[1]) - (p2[1] - p1[1]) * (p[0] - p1[0]) > 0
  );
};
