// 기본 타입 정의
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
