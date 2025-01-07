// hooks/__tests__/usePadButtonState.test.ts
import { renderHook } from "@testing-library/react";
import * as THREE from "three";
import {
  usePadButtonState,
  usePadButtonKeyboardControl,
  usePadButtonPosition,
} from "../usePadButton";
import { createPadButton } from "@/meshes/padButton";

// Mock Three.js and createPadButton
jest.mock("three");
jest.mock("@/meshes/padButton");

describe("usePadButtonState", () => {
  const mockColor = 0xff0000;
  const mockPadButton = new THREE.Mesh();

  beforeEach(() => {
    (createPadButton as jest.Mock).mockReturnValue(mockPadButton);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create pad button with initial values", () => {
    const { result } = renderHook(() => usePadButtonState(mockColor));

    expect(createPadButton).toHaveBeenCalledWith(mockColor, 1);
    expect(result.current.current).toBe(mockPadButton);
  });

  it("should not recreate pad button on rerender", () => {
    const { rerender } = renderHook(() => usePadButtonState(mockColor));

    rerender();

    expect(createPadButton).toHaveBeenCalledTimes(1);
  });
});

describe("usePadButtonPosition", () => {
  const mockPadButton = {
    position: {
      copy: jest.fn(),
    },
  } as unknown as THREE.Mesh;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update pad button position", () => {
    const { result } = renderHook(() => usePadButtonPosition(mockPadButton));
    const newPosition = new THREE.Vector3(1, 1, 1);

    result.current(newPosition);

    expect(mockPadButton.position.copy).toHaveBeenCalledWith(newPosition);
  });

  it("should not update position if pad button is undefined", () => {
    const { result } = renderHook(() =>
      usePadButtonPosition(undefined as unknown as THREE.Mesh)
    );
    const newPosition = new THREE.Vector3(1, 1, 1);

    result.current(newPosition);

    expect(mockPadButton.position.copy).not.toHaveBeenCalled();
  });
});

describe("usePadButtonKeyboardControl", () => {
  const mockPadButton = new THREE.Mesh();
  const mockUpdatePosition = jest.fn();
  const activeKey = "KeyA";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should add and remove event listeners", () => {
    const addEventListenerSpy = jest.spyOn(window, "addEventListener");
    const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() =>
      usePadButtonKeyboardControl(mockPadButton, mockUpdatePosition, activeKey)
    );

    expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "keyup",
      expect.any(Function)
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledTimes(2);
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keyup",
      expect.any(Function)
    );
  });

  it("should update position on keydown of active key", () => {
    renderHook(() =>
      usePadButtonKeyboardControl(mockPadButton, mockUpdatePosition, activeKey)
    );

    window.dispatchEvent(new KeyboardEvent("keydown", { code: activeKey }));

    expect(mockUpdatePosition).toHaveBeenCalledWith(expect.any(THREE.Vector3));
  });

  it("should update position on keyup of active key", () => {
    renderHook(() =>
      usePadButtonKeyboardControl(mockPadButton, mockUpdatePosition, activeKey)
    );

    window.dispatchEvent(new KeyboardEvent("keyup", { code: activeKey }));

    expect(mockUpdatePosition).toHaveBeenCalledWith(expect.any(THREE.Vector3));
  });

  it("should not update position for non-active keys", () => {
    renderHook(() =>
      usePadButtonKeyboardControl(mockPadButton, mockUpdatePosition, activeKey)
    );

    window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyB" }));
    window.dispatchEvent(new KeyboardEvent("keyup", { code: "KeyB" }));

    expect(mockUpdatePosition).not.toHaveBeenCalled();
  });
});
