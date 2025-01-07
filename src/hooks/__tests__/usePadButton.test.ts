import { renderHook } from "@testing-library/react";
import { usePadButton } from "../usePadButton";
import { createPadButton } from "@/meshes/padButton";

// Mock padButton module
jest.mock("@/meshes/padButton", () => ({
  createPadButton: jest.fn(),
}));

describe("usePadButton", () => {
  const mockPadButton = { scale: { y: 1 } };
  const mockEcb = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (createPadButton as jest.Mock).mockReturnValue(mockPadButton);
  });

  it("should initialize with correct color and radius", () => {
    renderHook(() => usePadButton("Space", mockEcb));

    expect(createPadButton).toHaveBeenCalledWith(0xff0000, 1);
  });

  it("should return padButton and handleKeydown function", () => {
    const { result } = renderHook(() => usePadButton("Space", mockEcb));

    expect(result.current).toHaveProperty("padButton");
    expect(result.current).toHaveProperty("handleKeydown");
    expect(typeof result.current.handleKeydown).toBe("function");
  });

  it("should call ecb when correct key is pressed", () => {
    const { result } = renderHook(() => usePadButton("Space", mockEcb));

    const keyEvent = new KeyboardEvent("keydown", { code: "Space" });
    result.current.handleKeydown(keyEvent);

    expect(mockEcb).toHaveBeenCalledWith(mockPadButton);
  });

  it("should not call ecb when different key is pressed", () => {
    const { result } = renderHook(() => usePadButton("Space", mockEcb));

    const keyEvent = new KeyboardEvent("keydown", { code: "Enter" });
    result.current.handleKeydown(keyEvent);

    expect(mockEcb).not.toHaveBeenCalled();
  });

  it("should work with empty activeKey", () => {
    const { result } = renderHook(() => usePadButton("", mockEcb));

    const keyEvent = new KeyboardEvent("keydown", { code: "Space" });
    result.current.handleKeydown(keyEvent);

    expect(mockEcb).not.toHaveBeenCalled();
  });
});
