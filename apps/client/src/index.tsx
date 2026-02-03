/* @refresh reload */
import { render } from 'solid-js/web';
import { SocketProvider } from './context/socket';
import Main from './components/main';
import './styles/global.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

render(
  () => (
    <SocketProvider>
      <Main />
    </SocketProvider>
  ),
  root
);
