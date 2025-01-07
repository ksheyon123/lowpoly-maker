import { createPadButton } from "@/meshes/padButton";

export const usePadButton = (activeKey = "", ecb: Function) => {
  const initialColor = 0xff0000;
  const padButton = createPadButton(initialColor, 1);

  const handleKeydown = (e: KeyboardEvent) => {
    const code = e.code;
    if (code === activeKey) {
      ecb(padButton);
    }
  };
  return { padButton, handleKeydown };
};
