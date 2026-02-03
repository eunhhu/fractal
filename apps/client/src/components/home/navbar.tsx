import { useCompset } from '@/utils/compset';
import { homeState, setHomeState, type HomeState } from '@/store/home';

export default function Navbar() {
  const { lng } = useCompset();

  const navItem = (state: HomeState, label: string) => (
    <div onClick={() => setHomeState(state)} class={homeState() === state ? 'sel' : ''}>
      {lng(label)}
    </div>
  );

  return (
    <nav class="nav">
      {navItem('rank', 'rank')}
      {navItem('clan', 'clan')}
      {navItem('lobby', 'play')}
      {navItem('profile', 'profile')}
      {navItem('shop', 'shop')}
    </nav>
  );
}
