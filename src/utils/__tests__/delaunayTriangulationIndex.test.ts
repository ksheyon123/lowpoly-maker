import { createDelaunayTriangleIndex } from "../delaunayTriangulationIndexer";
import { IPoint, ITriangle } from "@/types/index";

describe("createDelaunayTriangleIndex", () => {
  it("should create correct vertices and indices for a single triangle", () => {
    // Arrange
    const mockCircumCircle = jest.fn();
    const triangles: ITriangle[] = [
      {
        points: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        circumcircle: mockCircumCircle,
      },
    ];

    // Act
    const result = createDelaunayTriangleIndex(triangles);

    // Assert
    expect(result.vertices).toEqual([
      0,
      0,
      0, // first point
      1,
      0,
      0, // second point
      0,
      1,
      0, // third point
    ]);
    expect(result.indices).toEqual([0, 1, 2]);
  });

  it("should handle multiple triangles with shared vertices", () => {
    const mockCircumCircle = jest.fn();
    // Arrange
    const triangles: ITriangle[] = [
      {
        points: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        circumcircle: mockCircumCircle,
      },
      {
        points: [
          { x: 1, y: 0 },
          { x: 1, y: 1 },
          { x: 0, y: 1 },
        ],
        circumcircle: mockCircumCircle,
      },
    ];

    // Act
    const result = createDelaunayTriangleIndex(triangles);

    // Assert
    // Should have 4 unique vertices
    expect(result.vertices).toEqual([
      0,
      0,
      0, // (0,0)
      1,
      0,
      0, // (1,0)
      0,
      1,
      0, // (0,1)
      1,
      1,
      0, // (1,1)
    ]);

    // Should have 6 indices (2 triangles * 3 vertices)
    expect(result.indices).toEqual([0, 1, 2, 1, 3, 2]);
  });

  it("should handle empty triangle array", () => {
    // Arrange
    const triangles: ITriangle[] = [];

    // Act
    const result = createDelaunayTriangleIndex(triangles);

    // Assert
    expect(result.vertices).toEqual([]);
    expect(result.indices).toEqual([]);
  });

  it("should handle floating point coordinates", () => {
    const mockCircumCircle = jest.fn();

    // Arrange
    const triangles: ITriangle[] = [
      {
        points: [
          { x: 0.5, y: 0.5 },
          { x: 1.5, y: 0.5 },
          { x: 0.5, y: 1.5 },
        ],
        circumcircle: mockCircumCircle,
      },
    ];

    // Act
    const result = createDelaunayTriangleIndex(triangles);

    // Assert
    expect(result.vertices).toEqual([0.5, 0.5, 0, 1.5, 0.5, 0, 0.5, 1.5, 0]);
    expect(result.indices).toEqual([0, 1, 2]);
  });

  it("should deduplicate identical vertices", () => {
    const mockCircumCircle = jest.fn();
    // Arrange
    const triangles: ITriangle[] = [
      {
        points: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        circumcircle: mockCircumCircle,
      },
      {
        points: [
          { x: 0, y: 0 }, // duplicate vertex
          { x: 1, y: 0 }, // duplicate vertex
          { x: 1, y: 1 },
        ],
        circumcircle: mockCircumCircle,
      },
    ];

    // Act
    const result = createDelaunayTriangleIndex(triangles);

    // Assert
    // Should only have 4 unique vertices
    expect(result.vertices.length).toBe(12); // 4 vertices * 3 coordinates
    expect(new Set(result.indices).size).toBe(4); // Should only have 4 unique indices
  });
});
