import * as THREE from "three";
import {
  initController,
  initGamePad,
  createStick,
  createButton,
  handleKeyDown,
  handleKeyUp,
} from "../pad";

// Mock Three.js related functions and objects
jest.mock("three", () => {
  return {
    Scene: jest.fn(() => ({
      add: jest.fn(),
    })),
    Group: jest.fn(() => ({
      add: jest.fn(),
      position: { set: jest.fn() },
    })),
    Mesh: jest.fn(() => ({
      position: { set: jest.fn(), x: 0, y: 0, z: 0 },
    })),
    CircleGeometry: jest.fn(),
    CylinderGeometry: jest.fn(),
    MeshPhongMaterial: jest.fn(),
    DirectionalLight: jest.fn(() => ({
      position: { set: jest.fn() },
    })),
    PerspectiveCamera: jest.fn(() => ({
      position: { z: 0, y: 0 },
      lookAt: jest.fn(),
    })),
    WebGLRenderer: jest.fn(() => ({
      setSize: jest.fn(),
      render: jest.fn(),
      domElement: document.createElement("canvas"),
    })),
  };
});

describe("GamePad Controller", () => {
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;

  beforeEach(() => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera();
    renderer = new THREE.WebGLRenderer();
    document.body.innerHTML = "";
  });

  describe("createStick", () => {
    it("should create a stick with correct initial position", () => {
      const position = { x: -2, y: 0 };
      const stick = createStick(position);

      expect(stick.position).toEqual({ x: 0, y: 0 });
      expect(stick.basePosition).toEqual(position);
      expect(stick.isActive).toBeFalsy();
      expect(stick.mesh).toBeDefined();
    });
  });

  describe("createButton", () => {
    it("should create a button with correct properties", () => {
      const position = { x: 2, y: -1 };
      const color = 0xff0000;
      const action = jest.fn();
      const button = createButton(position, color, action);

      expect(button.isPressed).toBeFalsy();
      expect(button.action).toBe(action);
      expect(button.mesh).toBeDefined();
    });
  });

  describe("initGamePad", () => {
    it("should initialize gamepad with correct number of buttons", () => {
      const gamePad = initGamePad(scene);

      expect(gamePad.buttons).toHaveLength(3);
      expect(gamePad.stick).toBeDefined();
      expect(scene.add).toHaveBeenCalledTimes(4); // stick + 3 buttons
    });
  });

  describe("handleKeyDown", () => {
    let gamePad: any;

    beforeEach(() => {
      gamePad = initGamePad(scene);
    });

    it("should update stick position on arrow key press", () => {
      const updatedGamePad = handleKeyDown(gamePad, "ArrowUp");
      expect(updatedGamePad.stick.position.y).toBeGreaterThan(0);

      const updatedGamePad2 = handleKeyDown(gamePad, "ArrowRight");
      expect(updatedGamePad2.stick.position.x).toBeGreaterThan(0);
    });

    it("should not exceed maximum stick position", () => {
      let updatedGamePad = gamePad;
      // Press up arrow multiple times
      for (let i = 0; i < 5; i++) {
        updatedGamePad = handleKeyDown(updatedGamePad, "ArrowUp");
      }
      expect(updatedGamePad.stick.position.y).toBeLessThanOrEqual(1);
    });

    it("should trigger button action on button press", () => {
      const spy = jest.spyOn(console, "log");

      handleKeyDown(gamePad, "a");
      expect(spy).toHaveBeenCalledWith("Button A pressed");

      handleKeyDown(gamePad, "s");
      expect(spy).toHaveBeenCalledWith("Button B pressed");

      handleKeyDown(gamePad, "d");
      expect(spy).toHaveBeenCalledWith("Button C pressed");
    });
  });

  describe("handleKeyUp", () => {
    it("should reset stick state on key up", () => {
      const gamePad = initGamePad(scene);
      let updatedGamePad = handleKeyDown(gamePad, "ArrowUp");
      expect(updatedGamePad.stick.position.y).toBeGreaterThan(0);

      updatedGamePad = handleKeyUp(updatedGamePad, "ArrowUp");
      expect(updatedGamePad.stick.position.x).toBe(
        updatedGamePad.stick.basePosition.x
      );
      expect(updatedGamePad.stick.position.y).toBe(
        updatedGamePad.stick.basePosition.y
      );
    });

    it("should reset button state on key up", () => {
      const gamePad = initGamePad(scene);
      let updatedGamePad = handleKeyDown(gamePad, "a");
      expect(updatedGamePad.buttons[0].isPressed).toBeTruthy();

      updatedGamePad = handleKeyUp(updatedGamePad, "a");
      expect(updatedGamePad.buttons[0].isPressed).toBeFalsy();
      expect(updatedGamePad.buttons[0].mesh.position.y).toBe(0);
    });
  });

  describe("initController", () => {
    it("should initialize controller and append canvas to document", () => {
      initController(scene, camera, renderer);

      const canvas = document.querySelector("canvas");
      expect(canvas).toBeTruthy();
      expect(renderer.setSize).toHaveBeenCalledWith(
        window.innerWidth,
        window.innerHeight
      );
    });

    it("should set up camera position correctly", () => {
      initController(scene, camera, renderer);

      expect(camera.position.z).toBe(5);
      expect(camera.position.y).toBe(3);
      expect(camera.lookAt).toHaveBeenCalledWith(0, 0, 0);
    });

    it("should add event listeners", () => {
      const addEventListenerSpy = jest.spyOn(window, "addEventListener");

      initController(scene, camera, renderer);

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function)
      );
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "keyup",
        expect.any(Function)
      );
    });
  });
});
