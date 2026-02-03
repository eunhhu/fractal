import { createSignal, onMount, Show } from 'solid-js';
import type { IUser } from '@fractal/shared';
import { useCompset } from '@/utils/compset';
import { useSocket } from '@/context/socket';
import { checkName, checkPassword, generateUUID, sha256 } from '@/utils/auth';
import { store, setStore } from '@/store/app';

export default function Login() {
  const { patch, isFetching, addAlert, addError, lng } = useCompset();
  const { send } = useSocket();

  const [state, setState] = createSignal<'login' | 'register'>('login');
  const [username, setUsername] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [confirm, setConfirm] = createSignal('');

  const logined = (user: IUser) => {
    localStorage.setItem('user', JSON.stringify({ name: user.username, pass: user.password }));
    send({ type: 'logined', userId: user.id });
    patch('user', user);
    patch('state', 'home');
  };

  const tryLogin = async (name: string, pass: string, sha: boolean = true) => {
    if (!checkName(name)) return addError(lng('invalid username'));
    if (!checkPassword(pass)) return addError(lng('invalid password'));
    patch('isFetching', true);

    try {
      const res = await fetch('/controller/col/users/type/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name, password: sha ? sha256(pass) : pass }),
      });
      const data = await res.json();

      if (data.failed) {
        addError(lng('invalid username or password'));
      } else {
        logined(data);
      }
    } catch {
      addError(lng('failed to login'));
    }

    patch('isFetching', false);
  };

  const tryRegister = async (name: string, pass: string, conf: string) => {
    if (!checkName(name)) return addError(lng('invalid username'));
    if (!checkPassword(pass)) return addError(lng('invalid password'));
    if (pass !== conf) return addError(lng('passwords do not match'));
    patch('isFetching', true);

    const newUser: IUser = {
      id: generateUUID(),
      username: name,
      password: sha256(pass),
      avatar: '',
      admin: false,
      banned: false,
      lvl: 1,
      exp: 0,
      gem: 0,
      coin: 0,
      lastLogin: Date.now(),
      lastLogout: Date.now(),
      items: [],
      runes: [],
      equipments: [],
      friends: [],
      totalClear: 0,
      totalFail: 0,
      totalPlay: 0,
      totalMobKill: 0,
      totalBossKill: 0,
      totalDeath: 0,
      totalWin: 0,
      totalLose: 0,
      totalDraw: 0,
      totalPvpKill: 0,
      totalPvpDeath: 0,
    };

    try {
      const res = await fetch('/controller/col/users/type/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();

      if (data.failed) {
        addError(lng('username already exists'));
      } else if (data.success) {
        logined(newUser);
      } else {
        addError(lng('failed to register'));
      }
    } catch {
      addError(lng('failed to register'));
    }

    patch('isFetching', false);
  };

  onMount(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        const { name, pass } = JSON.parse(saved);
        tryLogin(name, pass, false);
      } catch {
        localStorage.removeItem('user');
      }
    }
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (state() === 'login') {
      tryLogin(username(), password());
    } else {
      tryRegister(username(), password(), confirm());
    }
  };

  const toggleState = () => {
    if (isFetching()) return;
    setState((s) => (s === 'login' ? 'register' : 'login'));
    setUsername('');
    setPassword('');
    setConfirm('');
  };

  return (
    <main class="w-full h-full flex flex-col justify-center items-center sm:gap-0.5 gap-1 md:gap-1.5 lg:gap-2">
      <input
        disabled={isFetching()}
        class="sm:w-48 md:w-56 lg:w-64 text-center p"
        type="text"
        value={username()}
        onInput={(e) => setUsername(e.currentTarget.value)}
        placeholder={lng('username')}
      />
      <input
        disabled={isFetching()}
        class="sm:w-48 md:w-56 lg:w-64 text-center p"
        type={state() === 'login' ? 'password' : 'text'}
        value={password()}
        onInput={(e) => setPassword(e.currentTarget.value)}
        placeholder={lng('password')}
      />
      <Show when={state() === 'register'}>
        <input
          disabled={isFetching()}
          class="sm:w-48 md:w-56 lg:w-64 text-center p"
          type="text"
          value={confirm()}
          onInput={(e) => setConfirm(e.currentTarget.value)}
          placeholder={lng('confirm password')}
        />
      </Show>
      <button disabled={isFetching()} class="sm:w-48 md:w-56 lg:w-64 text-center p" onClick={handleSubmit}>
        {lng(state() === 'login' ? 'login' : 'register')}
      </button>
      <div class="md:text-sm lg:text-base underline cursor-pointer select-none" onClick={toggleState}>
        {lng(state() === 'login' ? 'goto register' : 'goto login')}
      </div>
    </main>
  );
}
