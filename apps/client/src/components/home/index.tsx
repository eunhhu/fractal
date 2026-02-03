import { createSignal, onMount, onCleanup, Show, Switch, Match } from 'solid-js';
import { store } from '@/store/app';
import { homeState } from '@/store/home';
import Lobby from './lobby/lobby';
import Room from './room/room';
import Navbar from './navbar';

export default function Home() {
  const [onSocial, setOnSocial] = createSignal(false);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      setOnSocial((v) => !v);
    }
  };

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown);
  });

  onCleanup(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <main class="flex flex-col w-full h-full justify-center items-center overflow-hidden">
      {/* Background */}
      <div
        class="w-full h-full pointer-events-none"
        style={{
          'background-image': 'url(bg/default.webp)',
          'background-size': 'cover',
          'background-position': 'center',
          filter: 'blur(10px)',
          transform: 'scale(1.1)',
        }}
      />

      {/* Content */}
      <div class="flex flex-col w-full h-full justify-center items-center overflow-hidden absolute left-0 top-0">
        <Show
          when={store.room}
          fallback={
            <>
              <Navbar />
              <Switch>
                <Match when={homeState() === 'lobby'}>
                  <Lobby />
                </Match>
                <Match when={homeState() === 'profile'}>
                  {/* TODO: Profile component */}
                  <div class="w-full h-full flex items-center justify-center">Profile (TODO)</div>
                </Match>
              </Switch>
            </>
          }
        >
          <Room />
        </Show>
      </div>

      {/* Social Panel */}
      <Show when={onSocial()}>
        {/* TODO: Social component */}
        <div
          class="absolute top-0 left-0 w-full h-full bg-[#000a] flex justify-center items-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOnSocial(false);
          }}
        >
          <div class="bg-neutral-800 p-4 rounded-lg border border-white">Social (Press Tab to close)</div>
        </div>
      </Show>
    </main>
  );
}
