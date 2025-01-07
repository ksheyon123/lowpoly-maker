import * as THREE from "three";

// 타입 정의
type Vector2D = {
  x: number;
  y: number;
};

type Button = {
  mesh: THREE.Mesh;
  isPressed: boolean;
  action: () => void;
};

type Stick = {
  mesh: THREE.Group;
  position: Vector2D;
  basePosition: Vector2D;
  isActive: boolean;
};

type GamePad = {
  scene: THREE.Scene;
  stick: Stick;
  buttons: Button[];
};

// 스틱 생성 함수
export const createStick = (position: Vector2D): Stick => {
  const group = new THREE.Group();

  // 스틱 베이스
  const baseGeometry = new THREE.CircleGeometry(0.8, 32);
  const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);

  // 스틱 핸들
  const handleGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.4, 32);
  const handleMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
  const handle = new THREE.Mesh(handleGeometry, handleMaterial);
  handle.position.y = 0.2;

  group.add(base);
  group.add(handle);
  group.position.set(position.x, 0, position.y);

  return {
    mesh: group,
    position: { x: 0, y: 0 },
    basePosition: position,
    isActive: false,
  };
};

// 버튼 생성 함수
export const createButton = (
  position: Vector2D,
  color: number,
  action: () => void
): Button => {
  const geometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 32);
  const material = new THREE.MeshPhongMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(position.x, 0, position.y);

  return {
    mesh,
    isPressed: false,
    action,
  };
};

// 게임패드 초기화
export const initGamePad = (scene: THREE.Scene): GamePad => {
  // 스틱 생성
  const stick = createStick({ x: -2, y: 0 });

  // 버튼들 생성
  const buttons = [
    createButton({ x: 2, y: -1 }, 0xff0000, () =>
      console.log("Button A pressed")
    ),
    createButton({ x: 2.8, y: 0 }, 0x00ff00, () =>
      console.log("Button B pressed")
    ),
    createButton({ x: 2, y: 1 }, 0x0000ff, () =>
      console.log("Button C pressed")
    ),
  ];

  // 씬에 추가
  scene.add(stick.mesh);
  buttons.forEach((button) => scene.add(button.mesh));

  return {
    scene,
    stick,
    buttons,
  };
};

// 키보드 이벤트 처리 함수
export const handleKeyDown = (gamePad: GamePad, key: string): GamePad => {
  const { stick, buttons } = gamePad;
  const moveDistance = 0.5;

  let updatedStick = { ...stick };
  const updatedButtons = [...buttons];

  switch (key) {
    case "ArrowUp":
      updatedStick.position.y = Math.min(1, stick.position.y + moveDistance);
      break;
    case "ArrowDown":
      updatedStick.position.y = Math.max(-1, stick.position.y - moveDistance);
      break;
    case "ArrowLeft":
      updatedStick.position.x = Math.max(-1, stick.position.x - moveDistance);
      break;
    case "ArrowRight":
      updatedStick.position.x = Math.min(1, stick.position.x + moveDistance);
      break;
    case "a":
      updatedButtons[0].isPressed = true;
      updatedButtons[0].action();
      break;
    case "s":
      updatedButtons[1].isPressed = true;
      updatedButtons[1].action();
      break;
    case "d":
      updatedButtons[2].isPressed = true;
      updatedButtons[2].action();
      break;
  }

  // 스틱 메쉬 업데이트
  updatedStick.mesh.position.x =
    updatedStick.basePosition.x + updatedStick.position.x;
  updatedStick.mesh.position.z =
    updatedStick.basePosition.y + updatedStick.position.y;

  // 버튼 메쉬 업데이트
  updatedButtons.forEach((button, index) => {
    if (button.isPressed) {
      button.mesh.position.y = -0.1;
    }
  });

  return {
    ...gamePad,
    stick: updatedStick,
    buttons: updatedButtons,
  };
};

// 키보드 릴리즈 이벤트 처리 함수
export const handleKeyUp = (gamePad: GamePad, key: string): GamePad => {
  const updatedButtons = gamePad.buttons.map((button) => ({
    ...button,
    isPressed: false,
    mesh: (() => {
      button.mesh.position.y = 0;
      return button.mesh;
    })(),
  }));

  return {
    ...gamePad,
    buttons: updatedButtons,
  };
};

// 메인 초기화 함수
const initController = (
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer
): void => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // 조명 설정
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 5, 5);
  scene.add(light);

  camera.position.z = 5;
  camera.position.y = 3;
  camera.lookAt(0, 0, 0);

  // 게임패드 초기화
  let gamePad = initGamePad(scene);

  // 이벤트 리스너 설정
  window.addEventListener("keydown", (event) => {
    gamePad = handleKeyDown(gamePad, event.key);
  });

  window.addEventListener("keyup", (event) => {
    gamePad = handleKeyUp(gamePad, event.key);
  });

  // 애니메이션 루프
  const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };

  animate();
};

export { initController };
