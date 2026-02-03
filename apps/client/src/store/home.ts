import { createSignal } from 'solid-js';

export type HomeState = 'rank' | 'clan' | 'lobby' | 'profile' | 'shop';

export const [homeState, setHomeState] = createSignal<HomeState>('lobby');
