import { createSignal, createEffect, onCleanup, Show, For } from 'solid-js';
import type { IDisplayUser } from '@fractal/shared';
import { useCompset } from '@/utils/compset';
import { useSocket, generateRequestId } from '@/context/socket';
import { store, setStore } from '@/store/app';
import PlayerCard from './playerCard';

export default function Room() {
  const { patch, addError, lng } = useCompset();
  const { send, request } = useSocket();

  const [map, setMap] = createSignal(store.room?.map ?? 0);
  const [mode, setMode] = createSignal(store.room?.mode ?? 0);
  const [chat, setChat] = createSignal('');

  let chatRef: HTMLDivElement | undefined;

  const room = () => store.room;
  const owner = (): IDisplayUser | undefined => room()?.players.find((v) => v.id === room()?.ownerId);
  const isOwner = () => store.user?.id === room()?.ownerId;

  createEffect(() => {
    if (room()) {
      setMap(room()!.map);
      setMode(room()!.mode);
    }
  });

  createEffect(() => {
    if (chatRef) {
      chatRef.scrollTop = chatRef.scrollHeight;
    }
  });

  const handleChatKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (chat().trim() === '') return;
      send({ type: 'chat', roomId: room()!.id, message: chat() });
      setChat('');
    }
  };

  const handleChangeMap = (value: number) => {
    setMap(value);
    send({ type: 'changeMap', roomId: room()!.id, map: value });
  };

  const handleChangeMode = (value: number) => {
    setMode(value);
    send({ type: 'changeMode', roomId: room()!.id, mode: value });
  };

  const handleStartGame = async () => {
    try {
      await request({
        type: 'startGame',
        roomId: room()!.id,
        requestId: generateRequestId(),
      });
    } catch (err: any) {
      addError(err.message);
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await request({
        type: 'leaveRoom',
        roomId: room()!.id,
        requestId: generateRequestId(),
      });
      patch('room', null);
    } catch (err: any) {
      addError(err.message);
    }
  };

  return (
    <Show when={room()}>
      <main class="flex flex-col w-full h-full justify-center items-center overflow-hidden">
        {/* Navbar */}
        <nav class="w-full flex flex-row justify-between items-center sm:p-2 md:p-3 lg:p-4 bg-neutral-900 bg-opacity-30 under">
          <div class="text-lg lg:text-xl">
            [Lv.{owner()?.lvl} {owner()?.username}] {room()!.name}
          </div>
          <div>
            {room()!.players.length}/{room()!.maxPlayers}
          </div>
        </nav>

        {/* Layout */}
        <div class="w-full h-full flex justify-center overflow-hidden">
          {/* Players */}
          <div class="w-full h-full flex justify-around sm:gap-2 md:gap-3 lg:gap-3 sm:p-2 md:p-3 lg:p-4">
            <For each={room()!.players}>{(player) => <PlayerCard user={player} />}</For>
          </div>

          {/* Interactions */}
          <div class="sm:w-64 md:w-72 lg:w-80 h-full flex flex-col justify-center items-center sm:gap-1 md:gap-1.5 lg:gap-2 sm:p-2 md:p-3 lg:p-4 overflow-hidden">
            {/* Chattings */}
            <div class="w-full h-full rounded-md bg-neutral-900 bg-opacity-50 flex flex-col justify-center items-center gap-1 border border-white overflow-hidden">
              <div
                ref={chatRef}
                class="sm:p-1 md:p-1.5 lg:p-2 w-full h-full overflow-y-auto overflow-x-hidden flex flex-col justify-start items-center"
              >
                <For each={store.chats}>{(chatMsg) => <div class="text-neutral-100 w-full">{chatMsg}</div>}</For>
              </div>
              <input
                class="w-full p-1 lg:p-1.5"
                type="text"
                value={chat()}
                onInput={(e) => setChat(e.currentTarget.value)}
                placeholder={lng('chat messages')}
                onKeyDown={handleChatKeyDown}
              />
            </div>

            {/* Map */}
            <select
              disabled={!isOwner()}
              class="w-full p-1 lg:p-1.5"
              value={map().toString()}
              onChange={(e) => handleChangeMap(+e.currentTarget.value)}
            >
              <option value="0">Forest</option>
              <option value="1">Castle</option>
              <option value="2">Valley</option>
            </select>

            {/* Mode */}
            <select
              disabled={!isOwner()}
              class="w-full p-1 lg:p-1.5"
              value={mode().toString()}
              onChange={(e) => handleChangeMode(+e.currentTarget.value)}
            >
              <option value="0">Normal</option>
              <option value="1">Hard</option>
              <option value="2">Hell</option>
              <option value="3">Nightmare</option>
            </select>

            {/* Buttons */}
            <div class="w-full flex gap-1 lg:gap-1.5">
              <Show when={isOwner()}>
                <button onClick={handleStartGame} class="w-full p-1 lg:p-1.5">
                  {lng('start')}
                </button>
              </Show>
              <button onClick={handleLeaveRoom} class="w-full p-1 lg:p-1.5">
                {lng('leave')}
              </button>
            </div>
          </div>
        </div>
      </main>
    </Show>
  );
}
