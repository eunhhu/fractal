import { createSignal } from 'solid-js';
import type { IRoom } from '@fractal/shared';
import { useCompset } from '@/utils/compset';
import { useSocket, generateRequestId } from '@/context/socket';
import { store } from '@/store/app';

interface RoomCreationProps {
  close: () => void;
}

export default function RoomCreation(props: RoomCreationProps) {
  const { patch, addError, lng } = useCompset();
  const { request } = useSocket();

  const [name, setName] = createSignal('');
  const [maxPlayers, setMaxPlayers] = createSignal(2);
  const [isPrivate, setIsPrivate] = createSignal(false);

  const createRoom = async () => {
    if (name().trim() === '') {
      addError(lng('invalid room name'));
      return;
    }
    if (maxPlayers() < 2 || maxPlayers() > 6) {
      addError(lng('invalid max players'));
      return;
    }

    try {
      const room = await request<IRoom>({
        type: 'createRoom',
        user: store.user!,
        name: name(),
        maxPlayers: maxPlayers(),
        isPrivate: isPrivate(),
        requestId: generateRequestId(),
      });
      patch('room', room);
      props.close();
    } catch (err: any) {
      addError(err.message || 'Failed to create room');
    }
  };

  return (
    <div class="bg-neutral-800 bg-opacity-50 p-2 lg:p-4 rounded-md lg:rounded-lg border border-white">
      <div class="text-neutral-100 text-lg lg:text-xl mb-2 lg:mb-4">{lng('room name')}</div>
      <input
        type="text"
        placeholder={lng('room name')}
        value={name()}
        onInput={(e) => setName(e.currentTarget.value)}
        class="w-full bg-neutral-700 text-neutral-100 p-1 lg:p-2 border border-white mb-2 lg:mb-4"
      />
      <div class="flex flex-row items-center justify-between mb-2 lg:mb-4 gap-2 lg:gap-4">
        <div class="text-neutral-100 text-lg lg:text-xl">{lng('max players')}</div>
        <input
          type="number"
          value={maxPlayers()}
          onInput={(e) => setMaxPlayers(Math.max(Math.min(parseInt(e.currentTarget.value) || 2, 6), 2))}
          class="w-12 bg-neutral-700 text-neutral-100 p-1 lg:p-2 border border-white"
        />
      </div>
      <div class="flex flex-row items-center justify-between mb-2 lg:mb-4 gap-2 lg:gap-4">
        <div class="text-neutral-100 text-lg lg:text-xl">{lng('private')}</div>
        <input
          type="checkbox"
          checked={isPrivate()}
          onChange={(e) => setIsPrivate(e.currentTarget.checked)}
          class="w-6 h-6"
        />
      </div>
      <button onClick={createRoom} class="w-full bg-neutral-700 text-neutral-100 p-2 lg:p-3 border border-white">
        {lng('create')}
      </button>
    </div>
  );
}
