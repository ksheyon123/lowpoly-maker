import { createPadButton } from "../padButton";
import * as THREE from "three";

jest.mock("three", () => {
  const actualThree = jest.requireActual("three");
  return {
    ...actualThree,
    CylinderGeometry: jest.fn(),
    MeshBasicMaterial: jest.fn(),
    Mesh: jest.fn(),
  };
});

describe("createPadButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a cylinder mesh with correct parameters", () => {
    const color = 0xff0000;
    const radius = 1;

    createPadButton(color, radius);

    // Geometry 생성 검증
    expect(THREE.CylinderGeometry).toHaveBeenCalledWith(radius, radius, 20, 32);

    // Material 생성 검증
    expect(THREE.MeshBasicMaterial).toHaveBeenCalledWith({
      color,
    });

    // Mesh 생성 검증
    expect(THREE.Mesh).toHaveBeenCalled();
  });

  it("should return a THREE.Mesh instance", () => {
    const mockMesh = { type: "Mesh" };
    (THREE.Mesh as unknown as jest.Mock).mockReturnValue(mockMesh);

    const result = createPadButton(0xff0000, 1);
    expect(result).toBe(mockMesh);
  });
});
