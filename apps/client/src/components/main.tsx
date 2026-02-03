import { Show, Switch, Match } from 'solid-js';
import { store } from '@/store/app';
import { useSocket } from '@/context/socket';
import Alerts from './sub/alert';
import Errors from './sub/error';
import Login from './login';
import Home from './home';

export default function Main() {
  const { isConnected } = useSocket();

  return (
    <>
      <Show
        when={isConnected()}
        fallback={
          <div class="w-full h-full flex justify-end items-end sm:text-sm md:text-base lg:text-lg p-4">
            Connecting to server...
          </div>
        }
      >
        <Switch fallback={<div class="w-full h-full flex justify-center items-center">Page not found</div>}>
          <Match when={store.state === 'login'}>
            <Login />
          </Match>
          <Match when={store.state === 'home'}>
            <Home />
          </Match>
          <Match when={store.state === 'play'}>
            {/* TODO: Play/Engine component */}
            <div class="w-full h-full flex justify-center items-center">Play Mode (TODO)</div>
          </Match>
        </Switch>
      </Show>

      <Alerts messages={store.alerts} />
      <Errors messages={store.errors} />
    </>
  );
}
