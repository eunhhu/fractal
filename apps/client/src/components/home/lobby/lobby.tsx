import { createSignal, onMount, Show, For } from 'solid-js';
import type { IRoom, IDisplayRoom } from '@fractal/shared';
import { useCompset } from '@/utils/compset';
import { useSocket, generateRequestId } from '@/context/socket';
import { store } from '@/store/app';
import ProfileCard from '../profileCard';
import CharacterView from '../charView';
import RoomCreation from './roomCreation';

export default function Lobby() {
  const { patch, addError, lng } = useCompset();
  const { send, request } = useSocket();

  const [showRoomCreation, setShowRoomCreation] = createSignal(false);

  onMount(() => {
    send({ type: 'getRooms' });
  });

  const joinRoom = async (roomId: string) => {
    try {
      const room = await request<IRoom>({
        type: 'joinRoom',
        roomId,
        user: store.user!,
        requestId: generateRequestId(),
      });
      patch('room', room);
    } catch (err: any) {
      addError(err.message || lng('room not found'));
    }
  };

  return (
    <main class="flex flex-row w-full h-full justify-center items-center overflow-hidden">
      {/* My Profile */}
      <div class="flex flex-col w-full h-full justify-center sm:p-24 md:p-28 lg:p-32">
        {/* Character Img */}
        <CharacterView class="w-full sm:h-64 md:h-72 lg:h-96" equipments={store.user?.equipments || []} />
        {/* Profile Card */}
        <Show when={store.user}>
          <ProfileCard user={store.user!} />
        </Show>
      </div>

      {/* Rooms */}
      <div class="w-full h-full sm:p-1 md:p-1.5 lg:p-2 flex flex-col justify-center items-center sm:gap-1 md:gap-1.5 lg:gap-2 overflow-hidden">
        {/* Room List Card */}
        <div class="flex flex-col rounded-md bg-[#000a] border border-white w-full h-full flex-1 overflow-hidden">
          {/* Title */}
          <div class="sm:p-2 md:p-3 lg:p-4 text-center under sm:text-base md:text-lg lg:text-xl w-full">{lng('rooms')}</div>
          {/* Room List */}
          <div class="w-full h-full overflow-x-hidden overflow-y-auto flex flex-col items-center">
            <For each={store.rooms}>
              {(room) => (
                <div
                  class="flex justify-between items-center cursor-pointer select-none w-full under sm:p-1 md:p-1 lg:p-1.5 sm:gap-1 md:gap-1 lg:gap-1.5 hover:bg-[#fff1]"
                  onClick={() => joinRoom(room.id)}
                >
                  <div class="text-center sm:text-sm md:text-sm lg:text-base text-neutral-300">
                    [Lv.{room.ownerLvl} {room.ownerName}]
                  </div>
                  <div class="w-48 lg:w-64 text-center sm:text-base lg:text-lg overflow-hidden truncate">{room.name}</div>
                  <div class="text-center sm:text-base lg:text-lg">{room.mode}</div>
                  <div class="text-center sm:text-base lg:text-lg">{room.map}</div>
                  <div class="text-center sm:text-sm md:text-sm lg:text-base">
                    {room.players}/{room.maxPlayer}
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
        {/* Interactions */}
        <button onClick={() => setShowRoomCreation(true)} class="w-full sm:p-2 md:p-3 lg:p-4">
          {lng('create')}
        </button>
      </div>

      {/* Room Creation Modal */}
      <Show when={showRoomCreation()}>
        <div
          class="absolute top-0 left-0 w-full h-full bg-[#000a] bg-opacity-90 flex justify-center items-center"
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) setShowRoomCreation(false);
          }}
        >
          <RoomCreation close={() => setShowRoomCreation(false)} />
        </div>
      </Show>
    </main>
  );
}
