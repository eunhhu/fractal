import { createStore } from 'solid-js/store';
import type { IUser, IRoom, IMessage, IDisplayRoom } from '@fractal/shared';

export type AppState = 'login' | 'home' | 'play';

export interface AppStore {
  // App state
  lang: string;
  state: AppState;
  isFetching: boolean;

  // User data
  user: IUser | null;
  room: IRoom | null;
  rooms: IDisplayRoom[];

  // Messages
  alerts: IMessage[];
  errors: IMessage[];
  chats: string[];

  // Game state (for play mode)
  instance: any | null;
}

const initialStore: AppStore = {
  lang: 'en',
  state: 'login',
  isFetching: false,
  user: null,
  room: null,
  rooms: [],
  alerts: [],
  errors: [],
  chats: [],
  instance: null,
};

export const [store, setStore] = createStore<AppStore>(initialStore);

// Typed setter helpers
export const patch = <K extends keyof AppStore>(key: K, value: AppStore[K]) => {
  setStore(key, value);
};
