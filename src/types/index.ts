// 2D 기본 타입 정의
export interface IPoint {
  x: number;
  y: number;
}

export interface ICircumcircle {
  center: IPoint;
  radius: number;
}

export interface ITriangle {
  points: [IPoint, IPoint, IPoint];
  circumcircle: () => ICircumcircle | null;
}

// 3D 기본 타입 정의
export interface IPoint3D {
  x: number;
  y: number;
  z: number;
}

export interface ICircumsphere {
  center: IPoint3D;
  radius: number;
}

export interface ITetrahedron {
  points: [IPoint3D, IPoint3D, IPoint3D, IPoint3D];
  circumsphere: () => ICircumsphere | null;
}

// Three.js 호환을 위한 인터페이스 추가
export interface IDelaunayResult {
  vertices: number[]; // [x1, y1, z1, x2, y2, z2, ...]
  indices: number[]; // [i1, i2, i3, i4, i5, i6, ...]
}
