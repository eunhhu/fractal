import { createSignal, onMount, onCleanup, Show } from 'solid-js';
import { Instance } from '@fractal/shared';
import type { IUser } from '@fractal/shared';

// Import Controller (will need to be copied/adapted)
// import Controller from '@/logic/controller';

interface EngineProps {
  map: string;
  user: IUser;
}

export default function Engine(props: EngineProps) {
  let containerRef: HTMLDivElement | undefined;
  const [assetsLoaded, setAssetsLoaded] = createSignal(false);

  onMount(async () => {
    if (!containerRef) return;

    // TODO: Initialize Controller with Pixi.js
    // The controller logic from app/logic/controller.ts needs to be imported
    // For now, this is a placeholder

    /*
    const controller = new Controller(
      new Instance(generateUUID(), [props.user], props.user.id),
      true
    );

    await controller.init(window);
    containerRef.appendChild(controller.app.canvas);
    setAssetsLoaded(true);

    // Set up player
    const myChar = new Player(props.user.id);
    myChar.equip(props.user.equipments);
    controller.spawn(myChar.id, myChar);
    controller.bindToCamera(myChar);

    // Key bindings
    controller.onKeypress('w', () => myChar.move(Math.PI));
    controller.onKeypress('s', () => myChar.move(0));
    controller.onKeypress('a', () => myChar.move(Math.PI * 3 / 2));
    controller.onKeypress('d', () => myChar.move(Math.PI / 2));

    // Context menu prevention
    const preventDefault = (e: Event) => e.preventDefault();
    window.addEventListener('contextmenu', preventDefault);

    // Add event listeners
    controller.addResizeEvent(window);
    controller.addKeydownEvent(document);
    controller.addKeyupEvent(document);
    controller.addButtondownEvent();
    controller.addButtonupEvent();
    controller.addMousemoveEvent();

    onCleanup(() => {
      controller.destroy();
      window.removeEventListener('contextmenu', preventDefault);
      controller.removeResizeEvent(window);
      controller.removeKeydownEvent(document);
      controller.removeKeyupEvent(document);
      controller.removeButtondownEvent();
      controller.removeButtonupEvent();
      controller.removeMousemoveEvent();
    });
    */

    // Placeholder: Show loading complete after a delay
    setTimeout(() => setAssetsLoaded(true), 1000);
  });

  return (
    <main ref={containerRef} class="w-full h-full">
      <Show when={!assetsLoaded()}>
        <div class="w-full h-full flex justify-center items-center">Loading game assets...</div>
      </Show>
    </main>
  );
}
