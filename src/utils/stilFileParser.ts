interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface Triangle {
  normal: Vector3;
  vertices: [Vector3, Vector3, Vector3];
}

class STLParser {
  // ASCII STL 파일 파싱
  static parseASCII(stlContent: string): Vector3[] {
    const vertices: Vector3[] = [];
    const lines = stlContent.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("vertex")) {
        const [, x, y, z] = line.split(/\s+/).map(Number);
        vertices.push({ x, y, z });
      }
    }

    return vertices;
  }

  // Binary STL 파일 파싱
  static parseBinary(buffer: ArrayBuffer): Vector3[] {
    const vertices: Vector3[] = [];
    const view = new DataView(buffer);

    // 헤더 건너뛰기 (80바이트)
    const headerSize = 80;
    // 삼각형 개수 읽기 (4바이트)
    const triangleCount = view.getUint32(headerSize, true);
    let offset = headerSize + 4;

    for (let i = 0; i < triangleCount; i++) {
      // 법선 벡터 건너뛰기 (12바이트)
      offset += 12;

      // 3개의 vertex 읽기
      for (let j = 0; j < 3; j++) {
        const x = view.getFloat32(offset, true);
        const y = view.getFloat32(offset + 4, true);
        const z = view.getFloat32(offset + 8, true);
        vertices.push({ x, y, z });
        offset += 12;
      }

      // attribute byte count 건너뛰기 (2바이트)
      offset += 2;
    }

    return vertices;
  }

  // STL 파일이 ASCII인지 Binary인지 확인
  static isASCII(data: ArrayBuffer | string): boolean {
    if (typeof data === "string") {
      return data.trim().startsWith("solid");
    }

    const header = new Uint8Array(data, 0, 5);
    const headerText = new TextDecoder().decode(header);
    return headerText.trim().startsWith("solid");
  }

  // 중복 vertices 제거
  static removeDuplicateVertices(
    vertices: Vector3[],
    tolerance: number = 1e-6
  ): Vector3[] {
    const unique: Vector3[] = [];
    const isClose = (v1: Vector3, v2: Vector3) =>
      Math.abs(v1.x - v2.x) < tolerance &&
      Math.abs(v1.y - v2.y) < tolerance &&
      Math.abs(v1.z - v2.z) < tolerance;

    for (const vertex of vertices) {
      if (!unique.some((v) => isClose(v, vertex))) {
        unique.push(vertex);
      }
    }

    return unique;
  }
}

// 파일에서 vertices 추출하는 메인 함수
async function extractVerticesFromSTL(file: File): Promise<Vector3[]> {
  try {
    if (file.type === "application/sla" || file.type === "text/plain") {
      // ASCII STL 파일 처리
      const text = await file.text();
      const vertices = STLParser.parseASCII(text);
      return STLParser.removeDuplicateVertices(vertices);
    } else {
      // Binary STL 파일 처리
      const buffer = await file.arrayBuffer();
      const vertices = STLParser.parseBinary(buffer);
      return STLParser.removeDuplicateVertices(vertices);
    }
  } catch (error) {
    console.error("STL 파일 파싱 에러:", error);
    throw error;
  }
}

// 사용 예시
const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const file = input.files[0];
  try {
    const vertices = await extractVerticesFromSTL(file);
    console.log("추출된 vertices:", vertices);

    // 통계 정보 출력
    console.log("총 vertex 개수:", vertices.length);

    // 바운딩 박스 계산
    const bounds = vertices.reduce(
      (acc, v) => ({
        minX: Math.min(acc.minX, v.x),
        minY: Math.min(acc.minY, v.y),
        minZ: Math.min(acc.minZ, v.z),
        maxX: Math.max(acc.maxX, v.x),
        maxY: Math.max(acc.maxY, v.y),
        maxZ: Math.max(acc.maxZ, v.z),
      }),
      {
        minX: Infinity,
        minY: Infinity,
        minZ: Infinity,
        maxX: -Infinity,
        maxY: -Infinity,
        maxZ: -Infinity,
      }
    );

    console.log("바운딩 박스:", bounds);
  } catch (error) {
    console.error("파일 처리 중 에러 발생:", error);
  }
};
