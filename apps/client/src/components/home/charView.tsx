import { onMount, onCleanup, For } from 'solid-js';
import type { IEquipment } from '@fractal/shared';

interface CharacterViewProps {
  class?: string;
  equipments: IEquipment[];
}

export default function CharacterView(props: CharacterViewProps) {
  let canvasRef: HTMLCanvasElement | undefined;

  const resizeCanvas = () => {
    if (!canvasRef) return;
    const canvas = canvasRef;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;

    const charHeight = height * 0.8;
    const x = (width - charHeight / 2) / 2;
    const y = (height - charHeight) / 2;

    const char = new Image();
    char.src = 'assets/entities/player.svg';
    char.onload = () => {
      ctx.drawImage(char, x, y, charHeight / 2, charHeight);
    };

    props.equipments.forEach((equip) => {
      const equipImg = new Image();
      equipImg.src = `assets/items/${equip.tag}.svg`;
      equipImg.onload = () => {
        ctx.drawImage(equipImg, 0, 0, 0, 0);
      };
    });
  };

  onMount(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  });

  onCleanup(() => {
    window.removeEventListener('resize', resizeCanvas);
  });

  return <canvas class={props.class} ref={canvasRef}></canvas>;
}
