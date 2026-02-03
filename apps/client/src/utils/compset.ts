import { store, setStore, patch } from '@/store/app';
import { langOf } from './lang';
import type { IMessage } from '@fractal/shared';

export function useCompset() {
  const addAlert = (message: string) => {
    setStore('alerts', (prev: IMessage[]) => [...prev, { message, time: Date.now() }]);
  };

  const addError = (message: string) => {
    setStore('errors', (prev: IMessage[]) => [...prev, { message, time: Date.now() }]);
  };

  const lng = (key: string) => langOf(store.lang, key);

  return {
    patch,
    isFetching: () => store.isFetching,
    addAlert,
    addError,
    lng,
  };
}
