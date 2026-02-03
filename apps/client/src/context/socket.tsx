import { createContext, useContext, createSignal, onCleanup, ParentComponent } from 'solid-js';
import type { WSClientMessage, WSServerMessage, IDisplayRoom, IRoom, IEquipment } from '@fractal/shared';
import { store, setStore } from '@/store/app';
import { useCompset } from '@/utils/compset';

const WS_URL = import.meta.env.DEV ? 'ws://127.0.0.1:8081/ws' : 'wss://your-production-url/ws';

interface SocketContextValue {
  socket: () => WebSocket | null;
  isConnected: () => boolean;
  send: (message: WSClientMessage) => void;
  request: <T>(message: WSClientMessage & { requestId: string }) => Promise<T>;
}

const SocketContext = createContext<SocketContextValue>();

export const SocketProvider: ParentComponent = (props) => {
  const { addAlert, addError, patch } = useCompset();
  const [socket, setSocket] = createSignal<WebSocket | null>(null);
  const [isConnected, setIsConnected] = createSignal(false);

  const pendingRequests = new Map<string, { resolve: (value: any) => void; reject: (error: Error) => void }>();
  const messageHandlers = new Map<string, (data: any) => void>();

  const connect = () => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      setSocket(ws);
      setIsConnected(true);
      addAlert('Connected to server');

      // Re-login if user exists
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          ws.send(JSON.stringify({ type: 'logined', userId: user.id }));
          patch('user', user);
          patch('state', 'home');
        } catch {
          localStorage.removeItem('user');
        }
      }
    };

    ws.onmessage = (event) => {
      let message: WSServerMessage;
      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }

      handleMessage(message);
    };

    ws.onclose = () => {
      setSocket(null);
      setIsConnected(false);
      addError('Disconnected from server');

      // Reconnect after delay
      setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      addError('Connection error');
    };
  };

  const handleMessage = (message: WSServerMessage) => {
    switch (message.type) {
      case 'kick':
        localStorage.removeItem('user');
        addError(message.reason);
        patch('state', 'login');
        patch('user', null);
        patch('room', null);
        break;

      case 'rooms':
        setStore('rooms', message.data);
        break;

      case 'roomUpdated':
        setStore('room', message.data);
        break;

      case 'roomDestroyed':
        addError(message.reason);
        setStore('room', null);
        break;

      case 'chat':
        setStore('chats', (prev: string[]) => [...prev, message.message]);
        break;

      case 'equipmentsUpdated':
        if (store.user) {
          setStore('user', 'equipments', message.data);
        }
        break;

      case 'response':
        const pending = pendingRequests.get(message.requestId);
        if (pending) {
          if (message.success) {
            pending.resolve(message.data);
          } else {
            pending.reject(new Error(message.error || 'Unknown error'));
          }
          pendingRequests.delete(message.requestId);
        }
        break;

      default:
        // Call any registered handlers
        const handler = messageHandlers.get(message.type);
        if (handler) {
          handler(message);
        }
    }
  };

  const send = (message: WSClientMessage) => {
    const ws = socket();
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  };

  const request = <T,>(message: WSClientMessage & { requestId: string }): Promise<T> => {
    return new Promise((resolve, reject) => {
      pendingRequests.set(message.requestId, { resolve, reject });
      send(message);

      // Timeout after 10 seconds
      setTimeout(() => {
        if (pendingRequests.has(message.requestId)) {
          pendingRequests.delete(message.requestId);
          reject(new Error('Request timeout'));
        }
      }, 10000);
    });
  };

  // Connect on mount
  connect();

  onCleanup(() => {
    socket()?.close();
  });

  const value: SocketContextValue = {
    socket,
    isConnected,
    send,
    request,
  };

  return <SocketContext.Provider value={value}>{props.children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

// Helper to generate request IDs
export const generateRequestId = () => crypto.randomUUID();
